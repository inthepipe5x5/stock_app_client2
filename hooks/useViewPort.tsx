import { viewPort } from "@/constants/dimensions";
import { useMemo, useCallback } from "react";
import { useWindowDimensions, Platform } from "react-native";

export type viewPortReturnType = {
    orientation: "portrait" | "landscape";
    screenSizeCategory: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    deviceScreenType: "mobile" | "tablet" | "desktop";
    flexDirection: "row" | "column";
    breakpointX: string;
    breakpointY: string;
    safeBottomPadding: number;
}

export default function useViewPort() {
    const { width, height } = useWindowDimensions();
    const platform = Platform.OS;
    const { breakpoints, devices } = viewPort;
    // determine what screen 'type' the device is on for dynamic styling
    const deviceScreenType = useMemo(() => {
        if (platform === "web") {
            if (width >= viewPort.devices.desktop.width && height >= viewPort.devices.desktop.height) {
                return "desktop";
            } else if (width >= viewPort.devices.tablet.width && height >= viewPort.devices.tablet.height) {
                return "tablet";
            } else {
                return "mobile";
            }
        } else {
            return width >= viewPort.devices.tablet.width && height >= viewPort.devices.tablet.height ? "tablet" : "mobile";
        }
    }, [width, height, platform]);

    const screenSizeCategory = useMemo(() => {
        switch (true) {
            case width >= breakpoints["2xl"]:
                return "2xl";
            case width >= breakpoints.xl:
                return "xl";
            case width >= breakpoints.lg:
                return "lg";
            case width >= breakpoints.md:
                return "md";
            case width >= breakpoints.sm:
                return "sm";
            default:
                return "xs";
        }
    }, [width]);



    const isPortrait = height > width;

    const flexDirection = useMemo(() => {
        return isPortrait ? "column" : "row";
    }, [isPortrait]);

    const safeBottomPadding = useMemo(() => {
        return [
            ["tablet", "desktop"].includes(deviceScreenType),
            isPortrait]
            .some(Boolean) ? 0 : 140;

    }, [isPortrait, deviceScreenType]);

    return {
        orientation: isPortrait ? "portrait" : "landscape",
        screenSizeCategory,
        deviceScreenType,
        flexDirection,
        safeBottomPadding,
    } as viewPortReturnType;
}