'use client';

import React from 'react';

type ButtonVariant = 'ghost' | 'filled' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    active?: boolean;
    children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
    ghost: 'btn-ghost',
    filled: 'btn-filled',
    outline: 'btn-outline',
};

const sizeClasses: Record<ButtonSize, string> = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
    icon: 'btn-icon',
};

export default function Button({
    variant = 'ghost',
    size = 'md',
    active = false,
    className = '',
    children,
    ...props
}: ButtonProps) {
    return (
        <button
            className={`btn ${variantClasses[variant]} ${sizeClasses[size]} ${active ? 'btn-active' : ''} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
