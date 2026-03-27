'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

export default function Header() {
    return (
        <header className="app-header">
            <Link href="/" className="app-logo">
                <BookOpen size={22} strokeWidth={1.5} />
                <span className="app-logo-text">{APP_NAME}</span>
            </Link>
        </header>
    );
}
