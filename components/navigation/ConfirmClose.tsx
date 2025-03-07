import { Alert, AlertIcon, AlertText } from "@/components/ui/alert";
import { useState } from "react";
import { MessageSquareWarningIcon, X } from "lucide-react-native";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
/* The `ConfirmClose` function is defining a function that creates a JSX structure for an alert
  component. This alert component includes an icon, text content, and a button. When the function is
  called, it will return this JSX structure representing an alert with a warning message and a
  button to take action. */

/**Simple button to trigger an alert component
 * 
 * @param displayState 
 * @param displayStateFn 
 */
export const triggerAlertButton = (displayState: boolean = false, displayStateFn: typeof Function, textVersion: boolean, ...buttonProps: any) => {
  //toggle the state of the alert on button press
  const toggleState = (booleanState: boolean) => {
    console.log(triggerAlertButton.name, "toggling state from", booleanState, "to", !!!booleanState);
    return !!!booleanState!;
  }
  return textVersion ? (
    <Button className="p-0 md:py-2 md:px-4 bg-background-0 active:bg-background-0 md:bg-background-900 ">
      <ButtonText className="md:text-typography-0 text-typography-800 text-sm">
        Cancel
      </ButtonText>
    </Button>
  ) : <Button className="p-0 md:py-2 md:px-4 bg-background-0 active:bg-background-0 md:bg-background-900 "
    onPress={() => displayStateFn(toggleState(displayState))}
    {...(buttonProps ?? {})}
  >
    <ButtonIcon as={X} size="md" />
  </Button >;
}

const ConfirmClose = (setDisplayAlertFn: any, dismissToURL: any) => {
  const router = useRouter();
  const { dispatch } = useUserSession();

  return (
    <Alert action="error" className="mt-3">
      <AlertIcon as={MessageSquareWarningIcon} size="lg" />
      <HStack className="justify-between flex-1 items-center gap-1 sm:gap-8">
        <VStack className="flex-1">
          <Text className="font-semibold text-typography-900">Heads up:</Text>
          <AlertText className="text-typography-900" size="sm">
            If you go cancel now, your changes will not be saved.
          </AlertText>
        </VStack>
        <Button
          size="xs"
          onPress={() => {
            //set alert to false
            setDisplayAlertFn(false);
            //clear session and go back to previous page
            console.log("Clearing session and going back to", dismissToURL);
            dispatch({ type: "CLEAR_SESSION" });
            router.dismissTo({ pathname: dismissToURL });
          }}
        >
          <ButtonText>Go back</ButtonText>
        </Button>
      </HStack>
    </Alert>
  )
};

export default ConfirmClose;
