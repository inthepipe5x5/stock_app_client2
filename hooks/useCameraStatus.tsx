import { useRef, useState, useEffect } from "react";
import { AppState } from "react-native";

export function useCameraStatus(cameraRef: React.RefObject<any>) {
    const [isReady, setIsReady] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const appState = useRef(AppState.currentState);

    useEffect(() => {
        const sub = AppState.addEventListener("change", (nextState) => {
            if (nextState === "active") {
                cameraRef.current?.resumePreview?.();
                setIsLocked(false);
                setIsLoading(false);
            } else if (nextState.match(/inactive|background/)) {
                setIsLocked(true);
                cameraRef.current?.pausePreview?.();
            }
            appState.current = nextState;
        });

        return () => sub.remove();
    }, []);

    const markReady = () => {
        setIsReady(true);
        setIsLoading(false);
        setIsLocked(false);
        cameraRef.current?.resumePreview?.();
    };

    const lockCamera = () => {
        setIsLocked(true);
        setIsLoading(true);
        cameraRef.current?.pausePreview?.();
    };

    const unlockCamera = () => {
        setIsLocked(false);
        setIsLoading(false);
        cameraRef.current?.resumePreview?.();
    };

    return { isReady, isLocked, isLoading, lockCamera, unlockCamera, markReady, appState };
}
