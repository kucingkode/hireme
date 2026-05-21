<?php

namespace App\Http\Controllers;

use OpenAI;

use App\Enums\EducationLevel;
use App\Models\Cv;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;
use Ramsey\Uuid\Uuid;
use Smalot\PdfParser\Parser;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AIController extends Controller
{
    public function text(Request $request)
    {

        $client = OpenAI::client(config("openai.api_key"));

        $validated = $request->validate([
            "cv_id" => "nullable|string",
            "messages" => "required|array",
            "messages.*.role" => "required|string|in:user,assistant,tool,system",
            "messages.*.content" => "nullable|string",
            "messages.*.tool_calls" => "nullable|array",
            "messages.*.tool_calls.*.id" => "required_with:messages.*.tool_calls|string",
            "messages.*.tool_calls.*.type" => "required_with:messages.*.tool_calls|string|in:function",
            "messages.*.tool_calls.*.function" => "required_with:messages.*.tool_calls|array",
            "messages.*.tool_calls.*.function.name" => "required_with:messages.*.tool_calls|string",
            "messages.*.tool_calls.*.function.arguments" => "required_with:messages.*.tool_calls|string",
            "messages.*.tool_call_id" => "nullable|string",
        ]);

        $user_id = $request->user()->id;

        $cv = null;
        $cv_id = null;
        $cv_data = null;

        if (array_key_exists("cv_id", $validated)) {
            $cv = Cv::where('id', $validated['cv_id'])
                ->where('user_id', $request->user()->id)
                ->firstOrFail();

            $cv_id = $cv->id;
            $cv_data = $cv->data;
        } else {
            $cv_data = [
                "personal_information" => (object) [],
                "skills" => [],
                "educations" => [],
                "work_experiences" => [],
                "courses" => [],
                "organizations" => [],
                "certificates" => [],
            ];
        }

        $cv_json = json_encode($cv_data, JSON_PRETTY_PRINT);

        $stream = $client->chat()->createStreamed([
            "model" => "gpt-5.4-mini",
            "tools" => config("openai.tools"),
            'temperature' => 0.6,
            "messages" => array_merge(
                [
                    [
                        "role" => "system",
                        "content" => <<<EOD
You are an expert CV advisor and builder with years of experience helping professionals land their dream jobs.

Your goal is to help the user build the best possible CV through natural conversation.

## Behavior
- Start by warmly greeting the user and asking what they need help with
- Ask about the user one section at a time, do not overwhelm them with multiple questions at once
- Ask follow-up questions to extract better details, e.g. if they mention a job, ask about achievements, not just responsibilities
- Suggest improvements when the user provides weak or vague information, e.g. turning "handled social media" into "Grew Instagram following by 40% in 3 months through targeted content strategy"
- Always confirm before overwriting existing data that looks complete
- Respond in the same language the user is writing in
- Start from personal information
- If the user want to see your max potential or want to see complex example, use a complex dummy data.

## CV Building Rules
- Call `patch_cv` incrementally after each section is discussed and confirmed, do not wait until the end
- Never fabricate or assume information — only write what the user has explicitly told you
- For skills scores, explain the scale to the user (1 = beginner, 5 = expert) and let them self-assess
- For years, always clarify if a position or education is still ongoing before setting end_year
- Set a segment to null in `patch_cv` if the user has not discussed it yet in this session

## Current CV State
```json
$cv_json
```

If the CV state is empty or null, treat this as a fresh start and begin collecting information from scratch.
If the CV state has existing data, acknowledge what"s already there and ask the user what they"d like to update or continue with.
EOD,
                    ]
                ],
                $validated["messages"]
            )
        ]);

        return response()->stream(function () use ($stream, $user_id, $cv, $cv_data, $cv_id) {
            $function_calls = [];

            foreach ($stream as $response) {
                $choice = $response->choices[0] ?? null;

                if (!$choice) {
                    continue;
                }

                $data = $choice->toArray();

                if (array_key_exists("tool_calls", $data["delta"])) {
                    foreach ($data["delta"]["tool_calls"] as $tool_call) {
                        if (!array_key_exists($tool_call["index"], $function_calls)) {
                            $function_calls[$tool_call["index"]] = [
                                "name" => "",
                                "arguments" => "",
                                "tool_call_id" => $tool_call["id"],
                            ];
                        }

                        $function_call = $function_calls[$tool_call["index"]];
                        $tool_call_function = $tool_call["function"];

                        if (array_key_exists("name", $tool_call_function)) {
                            $function_calls[$tool_call["index"]]["name"] .= $tool_call_function["name"];
                        }

                        if (array_key_exists("arguments", $tool_call_function)) {
                            $function_calls[$tool_call["index"]]["arguments"] .= $tool_call_function["arguments"];
                        }
                    }
                }


                if ($data["finish_reason"] == "tool_calls") {
                    $tool_calls = [];

                    foreach ($function_calls as $i => $call) {
                        $tool_calls[$i] = [
                            "function" => [
                                "name" => $call["name"],
                                "arguments" => $call["arguments"],
                            ],
                            "index" => $i,
                            "type" => "function",
                            "id" => $call["tool_call_id"]
                        ];
                    }


                    echo base64_encode(json_encode([
                        "delta" => [
                            "tool_calls" => (array) $tool_calls
                        ]
                    ])) . "\n";
                }

                echo base64_encode(json_encode($data)) . "\n";

                if ($data["finish_reason"] == "tool_calls") {
                    foreach ($function_calls as $function_call) {
                        $updates = json_decode($function_call["arguments"]);
                        $updates = (object) array_filter((array) $updates);
                        $cv_data = merge_cv($cv_data, $updates);

                        $cv = Cv::updateOrCreate(
                            ["id" => $cv_id ?: Uuid::uuid7()->toString(), "user_id" => $user_id],
                            ["data" => $cv_data]
                        );

                        $cv_id = $cv->id;

                        echo base64_encode(json_encode([
                            "delta" => [
                                "role" => "tool",
                                "content" => "done",
                                "tool_call_id" => $function_call["tool_call_id"]
                            ]
                        ])) . "\n";

                        echo base64_encode(json_encode([
                            "event_type" => "cv",
                            "data" => [
                                "id" => $cv_id,
                                "data" => $cv_data,
                            ]
                        ])) . "\n";
                    }
                }

                if (ob_get_level() > 0) {
                    ob_flush();
                }
                flush();
            }
        }, 200, ["Content-Type" => "text/plain"]);
    }

    public function transcribe(Request $request)
    {
        $client = OpenAI::client(config("openai.api_key"));

        $request->validate([
            "audio" => "required|file|max:5120",
        ]);

        $file = $request->file("audio");
        $tempPath = sys_get_temp_dir() . "/" . uniqid() . ".webm";
        copy($file->getPathname(), $tempPath);

        $response = $client->audio()->transcribe([
            "model" => "whisper-1",
            "file" => fopen($tempPath, "r")
        ]);

        unlink($tempPath);

        return response()->json($response, 200);
    }

    public function analyze(Request $request)
    {
        $client = OpenAI::client(config("openai.api_key"));

        $request->validate([
            "file" => "required|file|mimes:pdf|max:25600",
        ]);

        $file = $request->file("file");
        $text = (new Parser())->parseFile($file->getPathname())->getText();

        $stream = $client->chat()->createStreamed([
            "model" => "gpt-5.4-nano",
            'temperature' => 0.3,
            "messages" => [
                ["role" => "system", "content" => "You are a CV analyzer. Extract data and generate recommendations for the CV."],
                ["role" => "user",   "content" => "Analyze this document:\n\n{$text}"],
            ],
        ]);

        return response()->stream(function () use ($stream) {
            foreach ($stream as $response) {
                $choice = $response->choices[0] ?? null;

                if (!$choice) {
                    continue;
                }

                $data = $choice->toArray();
                echo base64_encode(json_encode($data)) . "\n";
            }
        });
    }
}
