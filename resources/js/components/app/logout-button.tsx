import { api } from '@/lib/api';
import { Button } from '../ui/button';
import { useMutation } from '@tanstack/react-query';
import { Spinner } from '../ui/spinner';

export function LogoutButton() {
    const logoutMutation = useMutation({
        mutationKey: ['logout'],
        mutationFn: async () => {
            await api.post('/logout');
        },
        onSuccess: () => {
            window.location.href = '/';
        },
    });

    return (
        <Button
            size={'sm'}
            variant={'destructive'}
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
        >
            {logoutMutation.isPending && <Spinner data-icon="inline-start" />}
            Sign Out
        </Button>
    );
}
