'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useClerk, useUser } from '@clerk/nextjs';
import Button from '@/components/ui/Button';

export default function ProfileMenu() {
    const { user } = useUser();
    const { signOut } = useClerk();
    const [open, setOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const avatarSize = 36;

    const initials = useMemo(() => {
        if (!user) return '?';
        const parts = [user.firstName, user.lastName].filter(Boolean);
        const initial = parts
            .map((value) => value?.trim()?.charAt(0) ?? '')
            .join('')
            .toUpperCase();
        return initial || user.username?.charAt(0)?.toUpperCase() || '?';
    }, [user]);

    const email =
        user?.primaryEmailAddress?.emailAddress ||
        user?.emailAddresses?.[0]?.emailAddress ||
        '';

    useEffect(() => {
        if (!open) return;
        const handleClick = (event: MouseEvent) => {
            const target = event.target as Node;
            if (menuRef.current?.contains(target)) return;
            if (buttonRef.current?.contains(target)) return;
            setOpen(false);
        };
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleKey);
        };
    }, [open]);

    if (!user) return null;

    return (
        <div className="profile-menu">
            <button
                ref={buttonRef}
                type="button"
                className="profile-menu-button"
                style={{ width: avatarSize, height: avatarSize }}
                onClick={() => setOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={open}
            >
                {user.imageUrl ? (
                    <img
                        src={user.imageUrl}
                        alt={user.fullName ?? 'Profile'}
                        className="profile-menu-avatar"
                        width={avatarSize}
                        height={avatarSize}
                        style={{ width: avatarSize, height: avatarSize }}
                    />
                ) : (
                    <span className="profile-menu-initials">{initials}</span>
                )}
            </button>

            {open && (
                <div
                    ref={menuRef}
                    className="profile-menu-popover"
                    role="menu"
                >
                    <div className="profile-menu-header">
                        <div className="profile-menu-name">
                            {user.fullName || 'Account'}
                        </div>
                        {email && (
                            <div className="profile-menu-email">{email}</div>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="profile-menu-logout"
                        onClick={() => signOut({ redirectUrl: '/sign-in' })}
                    >
                        Log out
                    </Button>
                </div>
            )}
        </div>
    );
}
