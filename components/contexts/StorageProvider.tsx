
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { GeneralCache, mmkvCache } from '@/lib/storage/mmkv'

export const StorageContext = createContext<{
    initialized: boolean;
    setInitialized: (value: boolean) => void;
    cache: typeof GeneralCache;
} | null>(null);

export const StorageContextProvider = ({ children }: { children: React.ReactNode }) => {
    const cache = useMemo(() => new mmkvCache(), []);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        cache.init();
        //set initialized to true
        setInitialized(true);

        console.log('StorageContextProvider initialized:', { initialized });
    }, []);

    const value = useMemo(() => ({
        initialized,
        setInitialized,
        cache,
    }), [initialized, cache]);

    return (
        <StorageContext.Provider value={value}>
            {children}
        </StorageContext.Provider >
    );
}

export const useStorageContext = () => {
    const context = useContext(StorageContext);
    if (!context) {
        throw new Error('useStorageContext must be used within a StorageContextProvider');
    }
    return context;
}