import { AppLayout } from '@/layouts/app';
import React, { useEffect, useState } from 'react';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import htmlToPdfmake from 'html-to-pdfmake';
import { usePage } from '@inertiajs/react';
import { CvData } from '@/lib/cv';

(pdfMake as any).vfs = pdfFonts.vfs;

export default function CV() {
    const { data } = usePage().props;
    const [pdf, setPdf] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const converted = htmlToPdfmake(CvData.create(data).renderHtml());
            const docDef = { content: converted };
            const blob = await pdfMake.createPdf(docDef).getBlob();
            setPdf(URL.createObjectURL(blob));
        })();
    }, [data]);

    return (
        <AppLayout title="CV">
            <div className="h-screen w-screen">
                {pdf ? (
                    <iframe
                        src={pdf}
                        width="100%"
                        height="100%"
                        title="PDF Preview"
                    />
                ) : (
                    <p>Generating PDF...</p>
                )}
            </div>
        </AppLayout>
    );
}
