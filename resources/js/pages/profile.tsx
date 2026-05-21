import { Navbar } from '@/components/app/navbar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { AppLayout } from '@/layouts/app';
import { api, handleError } from '@/lib/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { InfoIcon } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import z from 'zod';

const formSchema = z.object({
    username: z
        .string()
        .min(3, {
            error: 'Username is too short (min 3 characters)',
        })
        .max(30, {
            error: 'Username is too long (max 30 characters)',
        })
        .regex(/^[a-zA-Z0-9_]+$/, {
            error: 'Only a-z, A-Z, 0-9 are allowed',
        }),
    email: z.email(),
});

type FormSchema = z.infer<typeof formSchema>;

export default function Profile() {
    const meQuery = useQuery({
        queryKey: ['me'],
        queryFn: async () => {
            const res = await api.get('/me');

            return res.data;
        },
    });

    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
    });

    async function onSubmit(data: FormSchema) {
        await updateProfileMutation.mutateAsync({
            username: data.username,
            email: data.email,
        });
    }

    const updateProfileMutation = useMutation({
        mutationFn: (value: FormSchema) => api.put('/profile', value),
        onError: (error) => handleError(error, form),
    });

    if (meQuery.isLoading) {
        return (
            <AppLayout title="Profile">
                <Navbar />
                <div className="w-screen px-8">
                    <h1 className="mb-4 text-lg font-bold">Profile</h1>
                    <Spinner data-icon="inline-start" />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout title="Profile">
            <Navbar />
            <div className="w-screen px-8">
                <h1 className="mb-4 text-lg font-bold">Profile</h1>
                <FieldSet className="w-md">
                    {form.formState.errors.root && (
                        <Alert variant={'destructive'}>
                            <InfoIcon />
                            <AlertTitle>Profile Update Failed</AlertTitle>
                            <AlertDescription>
                                {form.formState.errors.root.message}
                            </AlertDescription>
                        </Alert>
                    )}
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FieldGroup>
                            <Controller
                                name="username"
                                defaultValue={meQuery.data.username}
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="username">
                                            Username
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="username"
                                            aria-invalid={fieldState.invalid}
                                            autoComplete="off"
                                            placeholder="Enter username"
                                        />
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="email"
                                control={form.control}
                                defaultValue={meQuery.data.email}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="email">
                                            Email
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="email"
                                            aria-invalid={fieldState.invalid}
                                            autoComplete="off"
                                            placeholder="Enter email"
                                        />
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />
                            <Field orientation="horizontal">
                                <Button
                                    type="submit"
                                    disabled={updateProfileMutation.isPending}
                                >
                                    {updateProfileMutation.isPending && (
                                        <Spinner data-icon="inline-start" />
                                    )}
                                    Save
                                </Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </FieldSet>
            </div>
        </AppLayout>
    );
}
