import { create } from 'zustand';

interface SyncState {
    inFlight: number;
    pendingCount: number;
    isOffline: boolean;
    begin: () => void;
    end: () => void;
    setPending: (count: number) => void;
    setOffline: (offline: boolean) => void;
}

export const useSyncStore = create<SyncState>((set, get) => ({
    inFlight: 0,
    pendingCount: 0,
    isOffline: false,

    begin: () => set((state) => ({ inFlight: state.inFlight + 1 })),
    end: () =>
        set((state) => ({ inFlight: Math.max(0, state.inFlight - 1) })),
    setPending: (pendingCount) => set({ pendingCount }),
    setOffline: (isOffline) => set({ isOffline }),
}));
