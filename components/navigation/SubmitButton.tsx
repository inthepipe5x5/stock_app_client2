import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { cn } from "@gluestack-ui/nativewind-utils/cn";
import { ArrowRight, LockIcon } from "lucide-react-native";
import React from "react";
import { Appearance } from "react-native";

const SubmitButton = ({
    focusRef,
    onSubmit,
    disabled,
    btnText,
    cnStyles,
}: {
    focusRef: React.Ref<any> | null | undefined; //forward the ref to the button
    onSubmit: ((args: any) => any | Promise<any>);
    disabled: boolean;
    // nextURL: string | null | undefined;
    // dismissToURL?: string | null | undefined;
    // errors?: Array<{
    //     message: string;
    // }> | null | undefined;
    btnText?: string | null | undefined;
    cnStyles?: { [key: string]: any } | null | undefined;
}) => {
    const buttonText = btnText ?? "Submit";
    return (
        <Button
            ref={focusRef} // typed as any since we can't fully type Button ref
            className={
                cn("w-full mt-4 flex-start absolute bottom-4 left-4 right-4 mx-2 px-2 rounded-lg",
                    cnStyles?.btn ?? "")
            }
            variant={!!disabled ? 'outline' : "solid"
            }
            onPress={onSubmit}
            action={!!disabled ? "secondary" : "positive"}
            disabled={!!disabled}
        >
            <ButtonText
                className={cn(
                    "font-semibold",
                    !disabled //Appearance.getColorScheme() !== 'light'
                        ? "text-typography-50"
                        : "text-typography-800",
                    cnStyles?.text ?? ""
                )}
            >
                {buttonText}
            </ButtonText>
            <ButtonIcon
                className={cn(
                    "font-semibold",
                    !disabled//Appearance.getColorScheme() !== 'light'
                        ? "text-typography-50"
                        : "text-typography-800",
                    cnStyles?.icon ?? ""
                )}

                as={!!disabled ? LockIcon : ArrowRight} />
        </Button>
    );
}

export default SubmitButton;