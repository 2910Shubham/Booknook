'use client';

import ProfileMenu from '@/components/ui/ProfileMenu';
import { APP_NAME } from '@/lib/constants';

interface LibraryHeaderProps {
    count: number;
}

export default function LibraryHeader({ count }: LibraryHeaderProps) {
    return (
        <header className="library-header">
            <div className="library-header-left">
                <div className="library-logo">{APP_NAME}</div>
                <div className="library-subtitle">
                    {count} {count === 1 ? 'book' : 'books'} in your library
                </div>
            </div>
            <div className="library-header-right">
                <ProfileMenu />
            </div>
        </header>
    );
}
