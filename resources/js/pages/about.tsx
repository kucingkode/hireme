import { Button } from '@/components/ui/button';
import { AppLayout } from '@/layouts/app';

export default function Welcome() {
    return (
        <AppLayout title="Welcome">
            <div className="flex h-screen w-screen">
                <div className="hidden h-full w-[50%] flex-col items-center justify-center lg:flex">
                    <h1 className="text-7xl font-bold">HireMe</h1>
                    <p className="mt-2">CV made easy</p>
                </div>
                <div className="flex h-full w-full items-center justify-center lg:w-[50%]">
                    <p className="max-w-lg">
                        <p className="mb-2 text-lg font-bold">Tentang Kami</p>
                        Solusi berbasis teknologi yang mampu memberikan bantuan
                        secara personal, efisien, dan mudah diakses. Dengan
                        perkembangan teknologi Artificial Intelligence (AI),
                        kini memungkinkan adanya sistem yang dapat memahami
                        input pengguna, menganalisis dokumen, serta memberikan
                        rekomendasi secara otomatis dan kontekstual.
                    </p>
                </div>
            </div>
            <div className="fixed top-0 left-0 flex w-screen px-8 py-4">
                <h1 className="font-bold">HireMe</h1>
                <div className="ml-auto">
                    <a href="/">
                        <Button variant={'ghost'}>Home</Button>
                    </a>
                    <a href="/about">
                        <Button variant={'ghost'}>About</Button>
                    </a>
                    <a href="/contact">
                        <Button variant={'ghost'}>Contact</Button>
                    </a>
                </div>
            </div>
        </AppLayout>
    );
}
