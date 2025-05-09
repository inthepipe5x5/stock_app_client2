import React, { useEffect, useRef, useState } from "react";
import { EmitterSubscription, Keyboard, Platform } from "react-native";



/* {@reference https://github.com/GeorgeHop/react-native-country-codes-picker/blob/master/helpers/useKeyboardStatus.ts#L9}
* This utility hook listen the keyboard and
* write to isOpen true or false
* depending on keyboard status
* */
export const useKeyboardStatus = (props: any | null | undefined) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
    const keyboardHideListener = useRef<null | EmitterSubscription>(null);
    const keyboardShowListener = useRef<null | EmitterSubscription>(null);

    const onKeyboardShow = (e: { endCoordinates: { height: React.SetStateAction<number>; }; }) => {
        setKeyboardHeight(e.endCoordinates.height);
        setIsOpen(true);
    };

    const onKeyboardHide = () => {
        setKeyboardHeight(0);
        setIsOpen(false);
    };

    useEffect(() => {
        keyboardShowListener.current = Keyboard.addListener('keyboardDidShow', onKeyboardShow);
        keyboardHideListener.current = Keyboard.addListener('keyboardDidHide', onKeyboardHide);

        return () => {
            keyboardShowListener.current?.remove();
            keyboardHideListener.current?.remove();
        };
    }, []);

    return {
        isOpen: isOpen,
        keyboardHeight: keyboardHeight,
        keyboardPlatform: Platform.OS
    };
}