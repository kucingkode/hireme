import { LogoutButton } from '@/components/app/logout-button';
import { Navbar } from '@/components/app/navbar';
import { AppLayout } from '@/layouts/app';

export default function Settings() {
    return (
        <AppLayout title="Settings">
            <Navbar />
            <div className="w-screen px-8">
                <h1 className="mb-4 text-lg font-bold">Settings</h1>
                <LogoutButton />
            </div>
        </AppLayout>
    );
}
