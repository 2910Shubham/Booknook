import { useUser } from '@clerk/nextjs';

export function useCurrentUser() {
    const { user, isLoaded, isSignedIn } = useUser();

    return {
        userId: user?.id ?? null,
        user,
        isLoaded,
        isSignedIn,
    };
}
