import { Suspense } from "react";
import { Appearance } from "react-native";
import Colors from "@/constants/Colors";
import { StyleSheet } from "react-native";
import { ImageBackground } from "@/components/ui/image-background";
import { cn } from "@gluestack-ui/nativewind-utils/cn";
import Banner from "@/components/Banner";
import { ThemedView } from "@/components/ThemedView";

type ResourceBackgroundMediaProps = {
    children?: React.ReactNode;
    className?: string;
    source?: string;
    unsplashSource?: {
        source?: string;
        author?: string;
        authorLink?: string;
        platform?: string;
    };
    resizeMode?: "cover" | "contain" | "stretch" | "repeat" | "center";
}

export default function ResourceBackgroundMedia(props: ResourceBackgroundMediaProps) {

    const fallback = {
        uri: 'https://unsplash.com/photos/coffee-bean-lot-TD4DBagg2wE?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash',
        author: 'Mike Kenneall',
        authorLink: 'https://unsplash.com/@asthetik?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash',
        platform: 'Unsplash',
        ...(props?.unsplashSource ?? {})
    }

    return (
        <Suspense
            fallback={
                <ThemedView
                    style={{
                        backgroundColor: Colors[Appearance.getColorScheme() ?? 'light'].background,
                        ...StyleSheet.absoluteFillObject,
                        zIndex: 0,
                        width: "100%",
                        height: "100%",
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                />
            }>
            <ImageBackground
                className={cn("flex-1 bg-cover",
                    props.className)}
                resizeMode={props.resizeMode ?? "cover"}
                source={{
                    uri: props.source ?? 'https://unsplash.com/photos/coffee-bean-lot-TD4DBagg2wE?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash',
                }}
            >
                {props.children}
                { /** Render credits for fallback unsplash source for when the source is not provided */
                    !!!props?.source ?
                        <Banner
                            bannerText={`Credits: ${fallback?.author} on ${fallback?.platform}`}
                            bannerLinkText={`Photo by ${fallback?.author} on ${fallback?.platform}`}
                            bannerLink={fallback?.authorLink ?? "https://unsplash.com/@asthetik?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"}
                        />
                        : null
                }
            </ImageBackground>
        </Suspense>
    )

};