import { AppLayout } from '@/layouts/app';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import htmlToPdfmake from 'html-to-pdfmake';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic, SendHorizonal, Square, X } from 'lucide-react';
import z from 'zod';
import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { CvData } from '@/lib/cv';
import { Spinner } from '@/components/ui/spinner';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldSet,
} from '@/components/ui/field';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ReactMarkdown from 'react-markdown';
import { api } from '@/lib/api';

(pdfMake as any).vfs = pdfFonts.vfs;

type Message = {
    content: string;
    role: 'user' | 'assistant' | 'tool';
    tool_calls?: any;
};

const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_IMAGE_TYPES = ['application/pdf'];

const fileFormSchema = z.object({
    file: z
        .any()
        .refine((files) => files?.length == 1, 'Image is required.')
        .refine(
            (files) => files?.[0]?.size <= MAX_FILE_SIZE,
            `Max file size is 5MB.`,
        )
        .refine(
            (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
            '.jpg, .jpeg, .png and .webp files are accepted.',
        )
        .transform((files) => files[0]),
});

type FileFormSchema = z.infer<typeof fileFormSchema>;

export default function Chat() {
    const [isRecording, setIsRecording] = useState(false);
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [response, setResponse] = useState('');
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const audioChunks = useRef<Blob[]>([]);
    const [cvData, setCvData] = useState<CvData | null>(null);
    const [cvId, setCvId] = useState<string | null>(null);
    const [pdf, setPdf] = useState<string | null>();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');

        if (!id) {
            return;
        }

        (async () => {
            const res = await api.get(`/cvs/${id}`);

            if (res.status === 200) {
                setCvId(res.data.id);
                setCvData(CvData.create(res.data.data));
            }
        })();
    }, []);

    const fileForm = useForm<FileFormSchema>({
        resolver: zodResolver(fileFormSchema),
    });

    useEffect(() => {
        if (!cvData) {
            return;
        }

        (async () => {
            const converted = htmlToPdfmake(cvData.renderHtml());
            const docDef = { content: converted };
            const blob = await pdfMake.createPdf(docDef).getBlob();
            setPdf(URL.createObjectURL(blob));
        })();
    }, [cvData]);

    async function sendText() {
        const text_ = text;
        setText('');
        setIsLoading(true);

        await getResponse(text_);

        setIsLoading(false);
    }

    async function startRecording() {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
        });

        mediaRecorder.current = new MediaRecorder(stream, {
            mimeType: 'audio/webm',
        });

        mediaRecorder.current.ondataavailable = (e) => {
            audioChunks.current.push(e.data);
        };

        mediaRecorder.current.start();
        setIsRecording(true);
    }

    async function stopRecording() {
        if (!mediaRecorder.current) {
            return;
        }

        await new Promise((resolve) => {
            mediaRecorder.current!.onstop = resolve;
            mediaRecorder.current!.stop();
        });

        const formData = new FormData();

        const audioBlob = new Blob(audioChunks.current, {
            type: mediaRecorder.current.mimeType,
        });

        formData.append('audio', audioBlob, 'recording.webm');

        const res = await api.post('/ai/transcribe', formData);
        console.log(res);

        setIsRecording(false);
        mediaRecorder.current = null;
        audioChunks.current = [];

        if (res.data.text) {
            await getResponse(res.data.text);
        }

        setIsLoading(false);
    }

    async function getResponse(input: string) {
        const newMessages: Message[] = [
            ...messages,
            {
                role: 'user',
                content: input,
            },
        ];

        setMessages(newMessages);

        const tool_results = [];
        let buffer = '';
        let tool_calls = null;

        try {
            const res = await api.post(
                '/ai/text',
                {
                    messages: newMessages.slice(-10),
                    cv_id: cvId ?? undefined,
                },
                {
                    adapter: 'fetch',
                    responseType: 'stream',
                },
            );

            const reader = res.data.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { value, done } = await reader.read();

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');
                lines.pop();

                for (const line of lines) {
                    try {
                        const data = JSON.parse(atob(line).trim());
                        console.log(data);

                        if (data.delta) {
                            if (data.delta.role === 'tool') {
                                tool_results.push(data.delta);
                            } else {
                                buffer += data.delta.content ?? '';
                                setResponse(buffer);

                                if (data.delta.tool_calls) {
                                    tool_calls = data.delta.tool_calls;
                                }
                            }
                        } else if (data.event_type == 'cv') {
                            const cvData = CvData.create(data.data.data);
                            setCvData(cvData);
                            setCvId(data.data.id);
                        }
                    } catch (e) {
                        console.warn('Failed to parse:', line, e);
                    }
                }

                if (done) {
                    break;
                }
            }

            setMessages([
                ...newMessages,
                {
                    role: 'assistant',
                    content: buffer.length ? buffer : '✅',
                    tool_calls: tool_calls,
                },
                ...tool_results,
            ]);
        } catch (e: any) {
            console.error(e);
        }

        setResponse('');
    }

    function cancelRecording() {
        if (!mediaRecorder.current) {
            return;
        }

        mediaRecorder.current.stop();

        mediaRecorder.current = null;
        audioChunks.current = [];
        setIsRecording(false);
    }

    async function onFileSubmit(data: FileFormSchema) {
        setIsLoading(true);
        setIsRecording(false);

        const formData = new FormData();

        formData.append('file', data.file);

        let buffer = '';

        try {
            const res = await api.post('/ai/analyze', formData, {
                adapter: 'fetch',
                responseType: 'stream',
            });

            const reader = res.data.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { value, done } = await reader.read();

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');
                lines.pop();

                for (const line of lines) {
                    try {
                        const data = JSON.parse(atob(line).trim());
                        console.log(data);

                        buffer += data.delta.content ?? '';
                        setResponse(buffer);
                    } catch (e) {
                        console.warn('Failed to parse:', line, e);
                    }
                }

                if (done) {
                    break;
                }
            }

            setMessages([
                ...messages,
                {
                    role: 'assistant',
                    content: buffer,
                },
            ]);
        } catch (e: any) {
            console.error(e);
        }

        setResponse('');
        setIsLoading(false);
    }

    return (
        <AppLayout title="Chat">
            <div className="flex h-screen w-screen">
                <div className="h-full w-[50%]">
                    {pdf ? (
                        <>
                            <iframe
                                src={pdf}
                                width="100%"
                                height="100%"
                                title="PDF Preview"
                            />
                        </>
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-3">
                            <p className="text-xl font-bold">Upload CV</p>
                            <FieldSet className="w-full max-w-md">
                                <form
                                    onSubmit={fileForm.handleSubmit(
                                        onFileSubmit,
                                    )}
                                >
                                    <FieldGroup>
                                        <Controller
                                            name="file"
                                            control={fileForm.control}
                                            render={({ field, fieldState }) => (
                                                <Field
                                                    data-invalid={
                                                        fieldState.invalid
                                                    }
                                                >
                                                    <Input
                                                        type="file"
                                                        aria-invalid={
                                                            fieldState.invalid
                                                        }
                                                        onChange={(e) =>
                                                            field.onChange(
                                                                e.target.files,
                                                            )
                                                        }
                                                        onBlur={field.onBlur}
                                                        name={field.name}
                                                        ref={field.ref}
                                                    />
                                                    <FieldDescription>
                                                        Upload your CV in PDF
                                                        format
                                                    </FieldDescription>
                                                    {fieldState.invalid && (
                                                        <FieldError
                                                            errors={[
                                                                fieldState.error,
                                                            ]}
                                                        />
                                                    )}
                                                </Field>
                                            )}
                                        />
                                        <Field>
                                            <Button
                                                type="submit"
                                                disabled={isLoading}
                                            >
                                                {isLoading && (
                                                    <Spinner data-icon="inline-start" />
                                                )}
                                                Submit
                                            </Button>
                                        </Field>
                                    </FieldGroup>
                                </form>
                            </FieldSet>
                        </div>
                    )}
                </div>
                <div className="flex h-full w-[50%] flex-col items-center justify-center">
                    <div className="flex h-max w-full flex-1 justify-center overflow-y-auto px-8 py-4">
                        <div className="h-full w-full max-w-xl flex-col items-center">
                            {messages.map((v, i) => {
                                if (v.role == 'assistant') {
                                    return (
                                        <div
                                            className="my-2 w-full max-w-xl overflow-hidden px-4 py-2"
                                            key={i}
                                        >
                                            <ReactMarkdown>
                                                {v.content}
                                            </ReactMarkdown>
                                        </div>
                                    );
                                } else if (v.role == 'user') {
                                    return (
                                        <div className="w-full" key={i}>
                                            <div className="my-2 ml-auto w-fit max-w-[80%] overflow-hidden rounded-md bg-neutral-100 px-5 py-3">
                                                <ReactMarkdown>
                                                    {v.content}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    );
                                }
                            })}
                            {response && (
                                <div className="w-full max-w-xl px-4 py-2">
                                    <p className="overflow-hidden">
                                        {response}
                                    </p>
                                </div>
                            )}
                            {isLoading && (
                                <div className="flex w-full items-center gap-1 px-4 py-2">
                                    <Spinner data-icon="inline-start" />
                                    <p>Thinking</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex w-full max-w-xl flex-none px-8 py-4">
                        {isRecording ? (
                            <div className="flex h-full w-full items-center justify-center gap-3">
                                <Button
                                    size={'lg'}
                                    variant={'destructive'}
                                    onClick={stopRecording}
                                    disabled={isLoading}
                                >
                                    <Square />
                                </Button>
                                <Button
                                    size={'lg'}
                                    variant={'outline'}
                                    onClick={cancelRecording}
                                    disabled={isLoading}
                                >
                                    <X />
                                </Button>
                            </div>
                        ) : (
                            <>
                                <Textarea
                                    className="max-h-42"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                ></Textarea>
                                <div className="ml-1 flex flex-col gap-1">
                                    <Button
                                        onClick={sendText}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <Spinner data-icon="inline-start" />
                                        ) : (
                                            <SendHorizonal />
                                        )}
                                    </Button>
                                    <Button
                                        variant={'outline'}
                                        onClick={startRecording}
                                        disabled={isLoading}
                                    >
                                        <Mic />
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <a href="/dashboard">
                <Button
                    variant={'destructive'}
                    className="fixed top-4 right-8 z-10"
                >
                    End
                </Button>
            </a>
        </AppLayout>
    );
}
