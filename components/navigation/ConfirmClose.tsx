import { Alert, AlertIcon, AlertText } from "@/components/ui/alert";
import { MessageSquareWarningIcon } from "lucide-react-native";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
/* The `ConfirmClose` function is defining a function that creates a JSX structure for an alert
  component. This alert component includes an icon, text content, and a button. When the function is
  called, it will return this JSX structure representing an alert with a warning message and a
  button to take action. */
const ConfirmClose = (dismissToURL: any) => {
  const router = useRouter();
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
          router.dismissTo({ pathname: dismissToURL });
        }}
      >
        <ButtonText>Go back</ButtonText>
      </Button>
    </HStack>
  </Alert>;
};

export default ConfirmClose;
