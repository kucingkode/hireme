import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import * as React from 'react';
import * as z from 'zod';
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
import { AppLayout } from '@/layouts/app';
import { useMutation } from '@tanstack/react-query';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import { api, handleError } from '@/lib/api';

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
    password: z.string().nonempty({
        error: 'Password is required',
    }),
});

type FormSchema = z.infer<typeof formSchema>;

export default function Login() {
    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: '',
            password: '',
        },
    });

    async function onSubmit(data: FormSchema) {
        await loginMutation.mutateAsync({
            username: data.username,
            password: data.password,
        });
    }

    const loginMutation = useMutation({
        mutationFn: (value: FormSchema) => api.post('/login', value),
        onError: (error) => {
            handleError(error, form);
            form.resetField('password');
        },
        onSuccess() {
            window.location.href = '/dashboard';
        },
    });

    return (
        <AppLayout title="Login">
            <div className="flex h-screen w-screen">
                <div className="hidden h-full w-[50%] flex-col items-center justify-center lg:flex">
                    <h1 className="text-7xl font-bold">HireMe</h1>
                    <p className="mt-2">CV made easy</p>
                </div>
                <div className="flex h-full w-full items-center justify-center lg:w-[50%]">
                    <Card className="w-[90%] max-w-lg">
                        <CardHeader>
                            <CardTitle>Sign In</CardTitle>
                            <CardDescription>
                                Enter username and password to sign in.
                                {form.formState.errors.root && (
                                    <Alert
                                        variant={'destructive'}
                                        className="mt-4"
                                    >
                                        <InfoIcon />
                                        <AlertTitle>Sign In Failed</AlertTitle>
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
                                        <Field>
                                            <Button
                                                type="submit"
                                                disabled={
                                                    loginMutation.isPending
                                                }
                                            >
                                                {loginMutation.isPending && (
                                                    <Spinner data-icon="inline-start" />
                                                )}
                                                Sign In
                                            </Button>
                                            <p className="text-center">
                                                Don't have an account?{' '}
                                                <a href="register">
                                                    <Button variant={'link'}>
                                                        Sign Up
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
