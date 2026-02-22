'use client';

import { redirect } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';

export default function ProductDetailRedirect() {
    const { id } = useParams<{ id: string }>();
    useEffect(() => {
        redirect(`/gallery/${id}`);
    }, [id]);
    return null;
}
