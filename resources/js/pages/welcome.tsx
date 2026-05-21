import { Button } from '@/components/ui/button';
import { AppLayout } from '@/layouts/app';

export default function Welcome() {
    return (
        <AppLayout title="Welcome">
            <div className="flex h-screen w-screen flex-col items-center justify-center">
                <div>
                    <h1 className="text-7xl font-bold">HireMe</h1>
                    <p className="mt-2 text-center">CV made easy</p>
                </div>
                <div className="mt-8 flex gap-2">
                    <a href="register">
                        <Button size={'lg'}>Sign Up</Button>
                    </a>
                    <a href="login">
                        <Button size={'lg'} variant={'outline'}>
                            Sign In
                        </Button>
                    </a>
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
