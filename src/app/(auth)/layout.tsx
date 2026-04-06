import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="auth-layout">
            <div className="auth-header">
                <div className="auth-logo">BookNook</div>
                <div className="auth-tagline">Your reading sanctuary</div>
            </div>
            <div className="auth-card">{children}</div>
        </div>
    );
}
