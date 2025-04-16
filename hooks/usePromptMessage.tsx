import { useState } from "react";

export function usePromptMessage({ media, signal, duration }: {
    media?: string; //for small thumbnail images
    signal?: AbortSignal;
    duration?: number
} = {}) {
    const [message, setMessage] = useState<{
        id: string;
        title: string;
        description?: string;
        variant?: string;
        action?: string;
        medial?: string;
    } | null>(null);

    const show = (msg: typeof message) => {
        setMessage(msg)
        if (signal && duration) {
            if (duration) {
                const timeoutId = setTimeout(() => {
                    setMessage(null);
                }, duration);

                signal.addEventListener("abort", () => {
                    clearTimeout(timeoutId);
                });
            }
        }
    };
    const clear = () => setMessage(null);

    return { message, show, clear };
}
