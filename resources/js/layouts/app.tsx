import { Head } from '@inertiajs/react';
import React from 'react';

type AppLayoutProps = {
    title: string;
    children: React.ReactNode;
};

export function AppLayout(props: AppLayoutProps) {
    return (
        <>
            <Head title={props.title} />
            {props.children}
        </>
    );
}
