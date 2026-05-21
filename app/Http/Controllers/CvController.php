<?php

namespace App\Http\Controllers;

use App\Models\Cv;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CvController extends Controller
{
    public function index(Request $request)
    {
        $cvs = Cv::where('user_id', $request->user()->id)
            ->orderBy('updated_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json($cvs);
    }

    public function display(Request $request, string $id)
    {
        $cv = Cv::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        return Inertia::render('cv', [
            'data' => $cv->data,
        ]);
    }

    public function show(Request $request, string $id)
    {
        $cv = Cv::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        return response()->json($cv);
    }

    public function destroy(Request $request, string $id)
    {
        $cv = Cv::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $cv->delete();

        return response()->json(null, 204);
    }
}
