import { Button } from '../ui/button';
import { LogoutButton } from './logout-button';

export function Navbar() {
    return (
        <div className="flex w-screen px-8 py-4">
            <div>
                <p className="font-bold">HireMe</p>
            </div>

            <div className="ml-auto flex gap-1">
                <a href="dashboard">
                    <Button size={'sm'} variant={'ghost'}>
                        CV
                    </Button>
                </a>
                <a href="profile">
                    <Button size={'sm'} variant={'ghost'}>
                        Profile
                    </Button>
                </a>
                <a href="settings">
                    <Button size={'sm'} variant={'ghost'}>
                        Settings
                    </Button>
                </a>
                <LogoutButton />
            </div>
        </div>
    );
}
