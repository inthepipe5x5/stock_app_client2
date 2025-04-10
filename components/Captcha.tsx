import { cn } from "@gluestack-ui/nativewind-utils/cn";
import { ThemedView } from "./ThemedView";
import { Turnstile } from '@marsidev/react-turnstile'
import { Appearance } from "react-native";
import React from "react";
import { viewPort } from "@/constants/dimensions";
import { Heading } from "./ui/heading";

export type CaptchaStyleProps = {
    container?: {
        className?: string | null | undefined;
        minHeight?: number | null | undefined;
        minWidth?: number | null | undefined;
        maxHeight?: number | null | undefined;
        maxWidth?: number | null | undefined;
    },
    theme?: 'light' | 'dark' | null | undefined;
    size?: 'normal' | 'compact' | 'invisible' | null | undefined;
}

export type CaptchaProps = {
    setCaptchaToken: (token: string | null) => void;
    setCaptchaError?: (error: string | null) => void;
    styles?: CaptchaStyleProps | null | undefined;
}

export default function Captcha({ styles, setCaptchaToken, setCaptchaError }: CaptchaProps) {
    const siteKey = process.env.EXPO_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY ?? null
    const theme = (styles?.theme ?? (Appearance.getColorScheme() ?? 'light'));

    if (siteKey === null) {
        console.error("Cloudflare Turnstile site key is not defined. Please set the EXPO_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY environment variable.");
        throw new Error("Cloudflare Turnstile site key is not defined. Please set the EXPO_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY environment variable.");
    }
    const onError = (error: string) => {
        console.error("Captcha error:", error);
        if (!!setCaptchaError) {
            setCaptchaError(error);
        }
    }

    return (
        <ThemedView
            className={cn(
                "flex-1 justify-center items-center",
                styles?.container?.className ?? "",
                theme === 'dark' ? "bg-background-0" : "bg-background-900"
            )}
            style={{
                minHeight: styles?.container?.minHeight ?? viewPort.devices.mobile.width * 0.5,
                minWidth: styles?.container?.minWidth ?? viewPort.devices.mobile.width * 0.8,
                maxHeight: viewPort.height * 0.8,
                maxWidth: viewPort.width * 0.8,
            }}
        >
            <Heading
                className={cn(
                    "text-center",
                    theme === 'dark' ? "text-background-900" : "text-background-0",
                    
                )}
            >Please complete the Captcha challenge to continue.</Heading>
            <Turnstile
                siteKey={siteKey}
                options={{
                    theme,
                    size: styles?.size ?? 'normal',
                }}
                onSuccess={(token) => {
                    console.log(token);
                    if (!!setCaptchaToken) {
                        setCaptchaToken(token);
                    }
                }}
                onError={onError}
            />

        </ThemedView>
    )
}