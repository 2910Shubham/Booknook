'use client';

import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
    return (
        <SignUp
            routing="hash"
            afterSignUpUrl="/library?sync=1"
            signInUrl="/sign-in"
        />
    );
}
