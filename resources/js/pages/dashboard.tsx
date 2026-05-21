import { PlusIcon } from 'lucide-react';
import { Navbar } from '@/components/app/navbar';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/layouts/app';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { CvData } from '@/lib/cv';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import htmlToPdfmake from 'html-to-pdfmake';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

(pdfMake as any).vfs = pdfFonts.vfs;

export default function Dashboard() {
    const cvsQuery = useQuery({
        queryKey: ['cvs'],
        queryFn: async () => {
            const res = await api.get('/cvs');
            const data = [];

            for (const cv of res.data) {
                const converted = htmlToPdfmake(
                    CvData.create(cv.data).renderHtml(),
                );
                const docDef = { content: converted };
                const blob = await pdfMake.createPdf(docDef).getBlob();
                data.push({
                    id: cv.id,
                    updated_at: cv.updated_at,
                    url: URL.createObjectURL(blob),
                });
            }

            return data;
        },
    });

    async function deleteCv(id: string) {
        await api.delete(`/cvs/${id}`);
        cvsQuery.refetch();
    }

    return (
        <AppLayout title="Dashboard">
            <Navbar />
            <div className="flex w-screen flex-col">
                {cvsQuery.data?.length ? (
                    <div className="flex h-[80vh] w-full justify-center gap-3 p-4">
                        {cvsQuery.data.map((v) => (
                            <Card className="h-96 w-96 shrink-0" key={v.id}>
                                <CardContent className="h-full w-full">
                                    <iframe
                                        src={v.url}
                                        className="h-full w-full"
                                    />
                                </CardContent>
                                <CardFooter className="flex gap-1">
                                    <p className="mr-auto">
                                        {new Date(v.updated_at).toDateString()}
                                    </p>
                                    <a href={`/cv/${v.id}`}>
                                        <Button variant={'outline'}>
                                            View
                                        </Button>
                                    </a>
                                    <a href={`/chat?id=${v.id}`}>
                                        <Button variant={'outline'}>
                                            Edit
                                        </Button>
                                    </a>
                                    <Button
                                        variant={'destructive'}
                                        onClick={() => deleteCv(v.id)}
                                    >
                                        Delete
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="flex h-[80vh] w-full flex-col items-center justify-center">
                        <p className="mb-4 text-3xl font-bold text-neutral-600">
                            Nothing Here.
                        </p>
                        <a href="chat">
                            <Button>
                                <PlusIcon />
                                Create New CV
                            </Button>
                        </a>
                    </div>
                )}
                <div className="fixed right-8 bottom-8">
                    <a href="chat">
                        <Button>
                            <PlusIcon />
                            Create New CV
                        </Button>
                    </a>
                </div>
            </div>
        </AppLayout>
    );
}
