import { useEffect, Suspense, useState, useRef } from "react";
import { uploadToSupabase } from "@/lib/supabase/buckets";
import { uriToBlob } from "@/lib/camera/utils";
import { Button, ButtonIcon, ButtonText, IButtonTextProps as GSBtnProps } from "@/components/ui/button";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import RoundedHeader from "@/components/navigation/RoundedHeader";
import * as ImagePicker from "expo-image-picker";
import { Image } from "@/components/ui/image";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@gluestack-ui/nativewind-utils/cn";
import { Upload, X, Images, Lock, ChevronLeft } from "lucide-react-native";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import { Alert, Appearance, AppState } from "react-native";
import { setAbortableTimeout } from "@/hooks/useDebounce";
import { VStack } from "@/components/ui/vstack";
import { fetchSpecificUserHousehold } from "@/lib/supabase/session";
import { Center } from "@/components/ui/center";
import { Pressable } from "@/components/ui/pressable";
import { Icon } from "@/components/ui/icon";
import { HStack } from "@/components/ui/hstack";
import {
    AlertDialog,
    AlertDialogBackdrop,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogCloseButton,
    AlertDialogFooter,
    AlertDialogBody,
} from "@/components/ui/alert-dialog"
import { set } from "react-hook-form";
import defaultSession from "@/constants/defaultSession";

export default function UploadScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const { uri } = params as { uri: string };
    const [selectedURI, setSelectedURI] = useState<string[] | []>([]);
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [alertContent, setAlertContent] = useState<{
        description: "permission"
        | "upload"
        type: "success" | "error" | "warning" | "info",
        action?: () => void,
        cancelAction?: () => void,
    } | null>(null);
    const [uploadedURI, setUploadedURI] = useState<string[] | []>([]);
    const globalContext = useUserSession();
    const { state } = globalContext || defaultSession;
    const [uploadDisabled, setUploadDisabled] = useState<boolean>([state, state?.user, state?.isAuthenticated].every(Boolean) ?? false);

    const bucketName = params?.bucket_name[0] ?? params?.householdId[0] ?? "Products" as string;
    const controller = useRef(new AbortController())
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const appState = useRef(AppState.currentState);

    //effect to check if the user is logged in and if the bucket name is valid
    useEffect(() => {
        //commenting out for debugging purposes
        // if (!!!globalContext?.state?.user || !!!globalContext?.state?.households || !!!globalContext?.isAuthenticated) {
        //     router.replace('/(auth)/login?message=Please login to upload images');
        // }
        const invalidBucket = Boolean(bucketName ?? fetchSpecificUserHousehold({
            user_id: globalContext?.state?.user?.user_id,
            household_id: bucketName,
        }));
        console.log("Invalid bucket: ", invalidBucket, bucketName);
        //if the bucket name is invalid, redirect to the not found page
        if (invalidBucket) {
            router.replace('/+not-found?message=Bucket name not found');
        }
    }, [globalContext, params]);

    //effect to clear the selected URIs when the app goes to background
    //this is to prevent the app from crashing when the user goes to background and the photos is still open
    useEffect(() => {
        controller.current = controller?.current ?? new AbortController();

        const subscription = AppState.addEventListener("change", (nextAppState) => {
            const previousState = appState.current;
            appState.current = nextAppState;

            if (
                previousState.match(/inactive|background/) &&
                nextAppState === "active"
            ) {
                //abort the previous timeout if it exists
                controller.current?.abort();
            } else if (
                previousState === "active" &&
                nextAppState.match(/inactive|background/)
            ) {
                console.log("App going to background: locking camera after 2s");
                setAbortableTimeout({
                    callback: () => {
                        //clear the selected URIs
                        setSelectedURI([]);
                    },
                    delay: 1000 * 10,
                    signal: controller.current?.signal,
                });
            }
        });

        //clean up by removing the subscription
        return () => {
            subscription.remove();
        };
    }, []);


    const handleImageUpload = async (uri: string) => {
        const blob = await uriToBlob(uri);
        const upload = await uploadToSupabase(blob, bucketName)
        console.log("Upload: ", upload);

        //abort any debounced timeouts in the useEffect callbacks
        if (timeoutRef.current) {
            controller.current?.abort();
            clearTimeout(timeoutRef.current);
        }
    };

    const handleImageSelection = async () => {
        if (!uploadDisabled) {
            setShowAlert(true);
            setAlertContent({
                description: "upload",
                type: "warning",
                action: () => {
                    router.replace({
                        pathname: '/(auth)',
                        params: {
                            message: "Please login to upload images",
                            redirect: `/upload?uri=${selectedURI[0]}&bucket_name=${bucketName}`,
                        },
                    });
                },
            });
        }
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!!!permissionResult.granted) {
            setShowAlert(true);
            setAlertContent({
                description: "permission",
                type: "warning",
                action: () => {
                    handleImageSelection();
                },
                cancelAction: () => {
                    setShowAlert(false);
                    setAlertContent(null);
                },
            });
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        if (!result.canceled) {
            setSelectedURI(result.assets.map((asset) => asset.uri));
        }
        return selectedURI;
    }

    const renderPickedImage = ({ uri, styling }:
        {
            uri: string,
            styling?: {
                obj: { [key: string]: any } | null | undefined, // This is a placeholder for the styling object
                className: string | null | undefined,
            } | null | undefined
        }) => {

        // handleImageUpload(uri);
        return (
            <Suspense fallback={<Skeleton className="rounded-full w-full h-full" />}>
                <Image
                    className={cn("aspect-auto resize-x sm:w-[70%] sm:h-[70%] md:w-[200px] md:h-[200px]", styling?.className)}
                    source={{ uri }}
                    alt="Picked Image"
                    style={{ width: 200, height: 200 }}
                />
            </Suspense>
        )

    }

    const MediaSelectPressable = (styling: { [key: string]: any }) => {
        return (
            <Pressable onPress={handleImageSelection}>
                <Suspense fallback={<Skeleton className="rounded-full w-full h-full" />}>
                    {!!!selectedURI[0] || selectedURI[0] === null ?
                        <Icon as={Images} className={cn("text-background-50", styling.className)} size="xl" />
                        :
                        <Image
                            className={cn("aspect-auto resize-x sm:w-[24px] sm:h-[24px] md:w-[50px] md:h-[50px]", styling?.className)}
                            source={{ uri }}
                            alt="Picked Image"
                        />
                    }
                </Suspense>
            </Pressable>
        )
    }

    const UploadButton: React.FC<{
        onPress: (args: any) => void;
        buttonText: string;
        buttonTextClassName?: string | null | undefined;
        disabled?: boolean;
        icon?: React.ReactNode;
        BtnClassName?: string;
        action: "primary" | "secondary" | "positive" | "negative" | "error" | "success";
        variant?: "solid" | "outline" | "link"
    } & Partial<GSBtnProps>> = ({
        onPress,
        buttonText,
        disabled,
        icon,
        BtnClassName,
        action,
        variant,
        buttonTextClassName,
    }) => {
            return (
                <Button
                    className={cn("text-background-50 rounded-full w-full h-12 items-center justify-center", BtnClassName ?? "")}
                    action={action ?? "positive"}
                    variant={variant ?? "solid"}
                    onPress={onPress ?? handleImageUpload}
                    disabled={disabled ?? false
                    }
                >
                    {icon ? icon : null}
                    < ButtonText className={cn("text-background-100 font-semibold text-sm", buttonTextClassName ?? "")}>
                        {buttonText ?? "Upload"}
                    </ButtonText >
                </Button >
            )
        }

    const PhotoPrompt: React.FC<{
        promptText?: string | null | undefined
    }> = ({ promptText }) => {
        return (
            <Center className="flex-1 items-center justify-center p-4">
                <VStack className="space-y-4">
                    <Icon as={Images} className="text-background-50" size="xl" />
                    <Button
                        className={cn("text-background-50 rounded-full w-full h-12 items-center justify-center")}
                        action="primary"
                        variant="solid"
                        onPress={handleImageSelection}
                    >
                        <ButtonText className={cn("text-background-100 font-semibold text-sm")}>
                            {promptText ?? "Select Photos"}
                        </ButtonText>
                    </Button>
                </VStack>
            </Center>
        );
    };

    const AlertComponent: React.FC<{
        primaryActionText?: string | null | undefined,
        primaryAction?: () => void,
        cancelActionText?: string | null | undefined,
        cancelAction?: () => void,
        children?: React.ReactNode | null | undefined,
    }> = ({ primaryActionText, primaryAction, cancelAction, cancelActionText, children }) => {

        const onDismissAlertDialog = cancelAction ?? (() => {
            setShowAlert(false);
            setAlertContent(null);
        })

        return (
            <AlertDialog
                isOpen={showAlert}
                onClose={() => {
                    setShowAlert(false);
                    setAlertContent(null);

                }}
            >
                <AlertDialogBackdrop />
                <AlertDialogContent className="max-w-[305px] items-center">
                    <AlertDialogHeader>
                        <AlertDialogCloseButton onPress={onDismissAlertDialog} />
                        <Icon as={Lock} className="text-background-50" size="xl" />
                    </AlertDialogHeader>
                    <AlertDialogBody className="mt-0 mb-4">
                        <VStack space="md" className="w-full items-center">
                            {children ? children : null}
                        </VStack>
                    </AlertDialogBody>
                    <AlertDialogFooter className="w-full justify-around align-baseline">
                        <Button
                            className="absolute top-4 right-4"
                            variant="outline"
                            action="secondary"
                            size="sm"
                            onPress={onDismissAlertDialog}
                        >
                            <ButtonText>{cancelActionText ?? "Cancel"}</ButtonText>
                            <ButtonIcon as={ChevronLeft} className="text-background-50" size="sm" />
                        </Button>
                        <Button
                            onPress={() => {
                                if (!!primaryAction) {
                                    primaryAction();
                                }
                                //dismiss the alert dialog
                                onDismissAlertDialog();
                            }}
                            className="flex-grow"
                            action="primary"
                            variant="solid"
                        >
                            <ButtonText>{primaryActionText ?? "Confirm"}</ButtonText>
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        )
    }

    const GalleryPermissionRequest: React.FC<{ onRequestPermission: () => void }> = ({ onRequestPermission }) => {
        return (
            <VStack className="items-center space-y-4">
                <Icon as={Lock} className="text-background-50" size="xl" />
                <Button
                    className={cn("text-background-50 rounded-full w-full h-12 items-center justify-center")}
                    action="primary"
                    variant="solid"
                    onPress={onRequestPermission}
                >
                    <ButtonText className={cn("text-background-100 font-semibold text-sm")}>
                        Grant Gallery Permission to select photos
                    </ButtonText>
                </Button>
            </VStack>
        );
    };

    return (
        <VStack className="flex-1 items-center justify-center p-4 relative">
            <Stack.Screen
                options={{
                    headerShown: true,
                    animation: "fade",
                    presentation: "modal",
                    headerStyle: {
                        backgroundColor: "transparent",
                    },
                    headerShadowVisible: false,
                    headerTintColor: "white",
                    header: () => {
                        return (
                            <RoundedHeader
                                title="Camera"
                                icon={Upload}
                                backIcon={X}
                                onBack={() => {
                                    setSelectedURI([]);
                                    router.back();
                                }}
                            />
                        )
                    }
                }}
            />
            <AlertComponent>
                { /*if the permission is missing, show the permission request alert dialog */
                    alertContent?.description === "permission"
                        &&
                        ['warning', 'error'].includes(alertContent?.type) ? <GalleryPermissionRequest onRequestPermission={handleImageSelection} /> : null}
                {
                    /*if the alert content is not null, show the alert dialog */
                    alertContent?.description === "upload"
                        &&
                        ['warning', 'error'].includes(alertContent?.type) ? <PhotoPrompt /> : null}
            </AlertComponent>

            <Center className={cn("flex-1 items-center justify-center shadow-slate-50 border-2 rounded-lg p-4 m-auto",
                Appearance.getColorScheme() === "dark" ? "bg-background-100 border-background-200 text-typography-50" : "bg-background-0 border-background-50 text-typography-800")}>
                {!!selectedURI && selectedURI.length > 0 ? renderPickedImage({ uri: selectedURI[0] }) :
                    <PhotoPrompt />}
            </Center>
            <HStack className="w-full justify-between items-center mt-auto py-auto absolute bottom-0 p-4">
                <HStack className="w-1/2 justify-center items-center">
                    <MediaSelectPressable styling={{
                        className: cn("bg-background-50 border-2 border-background-100 rounded-full p-3"),
                    }} />
                    <UploadButton
                        action={!!!uploadDisabled && !!selectedURI ? "positive" : "secondary"}
                        variant={!!!uploadDisabled && !!selectedURI ? "solid" : "outline"}
                        buttonText={!!selectedURI ? "Upload" : "Select Image"}
                        disabled={uploadDisabled}
                        onPress={
                            handleImageSelection
                        }
                        icon={!!!uploadDisabled && !!selectedURI ?
                            <Icon as={Upload} className="text-background-50" size="sm" /> :
                            <Icon as={Lock} className="text-background-50" size="sm" />}
                        BtnClassName={cn("bg-background-100 border-background-50 shadow-transparent")}
                        buttonTextClassName={cn("text-typography-50",
                            uploadDisabled ? "text-error-500" : "text-background-100"
                        )}
                    />
                </HStack>
            </HStack>
        </VStack>
    );
}