import { ThemedView } from "@/components/ThemedView";
import { Text } from "@/components/ui/text";
import {
    Button,
    ButtonText,
    ButtonIcon,
    ButtonSpinner,
    IButtonTextProps as GSBtnProps,
} from "@/components/ui/button";
import { Image as RNImage } from "react-native";
import { useRef, useState } from "react";
import { Camera, CameraOff, Images } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { Redirect, RelativePathString, router } from "expo-router";
import { Database } from "@/lib/supabase/dbTypes";
import { cn } from "@gluestack-ui/nativewind-utils/cn";
import { FloatingFooter } from "@/components/navigation/Footer";
import SubmitButton from "@/components/navigation/SubmitButton";
import { useCaptchaContext } from "@/components/contexts/CaptchaContext";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import defaultSession from "@/constants/defaultSession";

const renderPicture = (uri?: string | null) => {
    // const [imageUri, setImageUri] = useState<string | null>(uri ?? null);
    // console.log({ imageUri });

    return (
        <ThemedView className="flex-1 items-center justify-center">
            {uri ? (
                <>
                    <RNImage
                        source={{ uri }}
                        className="w-72 h-72 rounded-lg border-2 border-gray-300"
                        resizeMode="contain"
                    />
                    <Text className="mt-2 text-lg text-gray-800">
                        Photo Preview
                    </Text>
                </>
            ) : (
                <Text className="text-lg text-gray-500">No photo selected</Text>
            )}
            {/* Button to take a picture using the camera or select from the gallery */}

            <Button
                onPress={() => router.push('/(scan)')}
                className="mt-4 bg-blue-500"
            >
                {uri ? (
                    <ButtonSpinner className="text-white" />
                ) : (
                    <ButtonText className={uri ? "text-white" : "text-slate-500"}>Take a picture</ButtonText>
                )}
                <ButtonIcon as={Camera} className={uri ? "text-white" : "text-slate-500"} />
            </Button>

        </ThemedView>
    );
};

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

export const AddResourceLayout = (props: {
    styling?: any;
    primarySlot: React.ReactNode;
    secondarySlot?: React.ReactNode;
    tertiarySlot?: React.ReactNode;
    footerSlot?: React.ReactNode;
}) => {
    const { styling, primarySlot } = props;
    return (
        <ThemedView
            className={cn("flex-1 items-center justify-center flex-col",
                (props?.secondarySlot || props?.tertiarySlot) ? "lg:flex-row gap-4" : "gap-0",
            )}
            style={styling}
        >
            {primarySlot}

            {props?.secondarySlot ? (
                <ThemedView
                    className="flex-1 items-center justify-center"
                    style={styling}
                >
                    {props?.secondarySlot}
                </ThemedView>
            ) : null}

            {
                props?.tertiarySlot ? (
                    <ThemedView
                        className="flex-1 items-center justify-center"
                        style={styling}
                    >
                        {props?.tertiarySlot}
                    </ThemedView>)
                    : null
            }
            {props?.footerSlot ? (
                <ThemedView
                    className="flex-1 items-center justify-center"
                    style={styling}
                >
                    {props?.footerSlot}
                </ThemedView>
            ) : null

            }
        </ThemedView>
    );
}

export const AddProductForm = (initialData: { [key: string]: any } | null) => {
    const [product, setProduct] = useState<Partial<Product> | null>(initialData ?? null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (key: string, value: any) => {
        setProduct((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Submit the product data to the server or database
            // await submitProduct(product);
            console.log("Product submitted:", product);
        } catch (err) {
            setError("Failed to submit product. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return { product, loading, error, handleChange, handleSubmit };
}

type Product = Database["public"]["Tables"]["products"]["Row"]
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"]
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"]

const AddProductScreen = () => {
    const submitBtnRef = useRef<any>(null);
    const { getCaptchaToken } = useCaptchaContext();
    const globalContext = useUserSession();
    const state = globalContext?.state || defaultSession;
    const dispatch = globalContext?.dispatch || (() => { });

    const [productData, setProductData] = useState<Product | null>(null);
    const [task, setTask] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        const token = getCaptchaToken();
        if (!!!token) {
            console.error("Captcha token is missing. Redirecting");
            dispatch({ type: "UPDATE_DRAFTS", payload: productData ?? {} })
        }
        console.log("Captcha token:", token);
        // Handle the form submission logic here
    }

    if (!state?.isAuthenticated) {
        console.log("User is not authenticated. Redirecting to sign-in page.");
        return (
            <Redirect
                href={{
                    pathname: '/(auth)/(signin)',
                    params: {
                        redirect: '/(tabs)/household/[household_id]/products/add',
                    },
                }}
            />
        );
    }

    return (
        <AddResourceLayout
            primarySlot={AddProductForm}
            secondarySlot={renderPicture()}
            footerSlot={
                (<FloatingFooter>
                    <SubmitButton
                        focusRef={submitBtnRef}
                        onSubmit={() => { }}
                        disabled={false}
                        btnText="Submit"
                        cnStyles={{ btn: "bg-blue-500" }}
                    />
                </FloatingFooter>)
            }
        />

    )
}

export default AddProductScreen;