import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from '@/components/ui/card';
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
import { useMutation } from '@tanstack/react-query';
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
    password: z
        .string()
        .nonempty({
            error: 'Password is required',
        })
        .min(8, {
            error: 'Password is too short (min 8 characters)',
        }),
    confirmPassword: z.string(),
});

type FormSchema = z.infer<typeof formSchema>;

export default function Register() {
    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    async function onSubmit(data: FormSchema) {
        if (data.confirmPassword !== data.password) {
            form.setError('password', {
                message: 'Password and Confirm Password do not match.',
            });
            form.setError('confirmPassword', {
                message: 'Password and Confirm Password do not match.',
            });

            return;
        }

        await registerMutation.mutateAsync({
            username: data.username,
            email: data.email,
            password: data.password,
        });

        form.reset();
    }

    const registerMutation = useMutation({
        mutationFn: (value: Omit<FormSchema, 'confirmPassword'>) =>
            api.post('/register', value),
        onError: (error) => handleError(error, form),
        onSuccess() {
            form.reset();
            window.location.href = '/login';
        },
    });

    return (
        <AppLayout title="Register">
            <div className="flex h-screen w-screen">
                <div className="hidden h-full w-[50%] flex-col items-center justify-center lg:flex">
                    <h1 className="text-7xl font-bold">HireMe</h1>
                    <p className="mt-2">CV made easy</p>
                </div>
                <div className="flex h-full w-full items-center justify-center lg:w-[50%]">
                    <Card className="w-[90%] max-w-lg">
                        <CardHeader>
                            <CardTitle>Sign Up</CardTitle>
                            <CardDescription>
                                Let's create new account.
                                {form.formState.errors.root && (
                                    <Alert
                                        variant={'destructive'}
                                        className="mt-4"
                                    >
                                        <InfoIcon />
                                        <AlertTitle>Sign Up Failed</AlertTitle>
                                        <AlertDescription>
                                            {form.formState.errors.root.message}
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FieldSet>
                                <form onSubmit={form.handleSubmit(onSubmit)}>
                                    <FieldGroup>
                                        <Controller
                                            name="username"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field
                                                    data-invalid={
                                                        fieldState.invalid
                                                    }
                                                >
                                                    <FieldLabel htmlFor="username">
                                                        Username
                                                    </FieldLabel>
                                                    <Input
                                                        {...field}
                                                        id="username"
                                                        aria-invalid={
                                                            fieldState.invalid
                                                        }
                                                        autoComplete="off"
                                                        placeholder="Enter username"
                                                    />
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
                                        <Controller
                                            name="email"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field
                                                    data-invalid={
                                                        fieldState.invalid
                                                    }
                                                >
                                                    <FieldLabel htmlFor="email">
                                                        email
                                                    </FieldLabel>
                                                    <Input
                                                        {...field}
                                                        id="email"
                                                        aria-invalid={
                                                            fieldState.invalid
                                                        }
                                                        autoComplete="off"
                                                        placeholder="Enter email"
                                                    />
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
                                        <Controller
                                            name="password"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field
                                                    data-invalid={
                                                        fieldState.invalid
                                                    }
                                                >
                                                    <FieldLabel htmlFor="password">
                                                        Password
                                                    </FieldLabel>
                                                    <Input
                                                        {...field}
                                                        id="password"
                                                        type="password"
                                                        aria-invalid={
                                                            fieldState.invalid
                                                        }
                                                        autoComplete="off"
                                                        placeholder="Enter password"
                                                    />
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
                                        <Controller
                                            name="confirmPassword"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field
                                                    data-invalid={
                                                        fieldState.invalid
                                                    }
                                                >
                                                    <FieldLabel htmlFor="confirmPassword">
                                                        Confirm Password
                                                    </FieldLabel>
                                                    <Input
                                                        {...field}
                                                        id="confirmPassword"
                                                        type="password"
                                                        aria-invalid={
                                                            fieldState.invalid
                                                        }
                                                        autoComplete="off"
                                                        placeholder="Confirm your password"
                                                    />
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
                                                disabled={
                                                    registerMutation.isPending
                                                }
                                            >
                                                {registerMutation.isPending && (
                                                    <Spinner data-icon="inline-start" />
                                                )}
                                                Sign Up
                                            </Button>
                                            <p className="text-center">
                                                Already have an account?{' '}
                                                <a href="login">
                                                    <Button variant={'link'}>
                                                        Sign In
                                                    </Button>
                                                </a>
                                            </p>
                                        </Field>
                                    </FieldGroup>
                                </form>
                            </FieldSet>
                        </CardContent>
                        <CardFooter className="grid">
                            <p className="text-center">
                                By registering you agree to the terms and
                                conditions
                            </p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
