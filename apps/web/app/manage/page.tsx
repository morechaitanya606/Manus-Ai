'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function ManagePage() {
    useEffect(() => {
        redirect('/dashboard');
    }, []);
    return null;
}
