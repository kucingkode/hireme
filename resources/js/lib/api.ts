import axios from 'axios';
import type { UseFormReturn } from 'react-hook-form';

export const api = axios.create({
    baseURL: '/api',
    headers: {
        Accept: 'application/json',
    },
    withCredentials: true,
});

export function handleError<T extends UseFormReturn<any, any>>(
    error: unknown,
    form: T,
) {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data;

        if (!data) {
            return;
        }

        if (data.message) {
            form.setError('root', {
                message: data.message,
            });
        }

        if (data.errors && typeof data.errors === 'object') {
            for (const key in Object.keys(data.errors)) {
                form.setError(key as any, {
                    message: data.errors[key].message,
                });
            }
        }
    }
}
