import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Modal, ModalBackdrop, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { Icon, MessageSquareWarningIcon, X } from "lucide-react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { useUserSession } from "@/components/contexts/UserSessionProvider";

interface ConfirmCloseProps {
  setDisplayAlertFn?: (displayState: boolean) => void;
  dismissToUrl: string;
  visible: boolean;
  title?: string;
  description?: string;
}

const ConfirmClose = ({ setDisplayAlertFn, dismissToUrl, visible, title, description }: ConfirmCloseProps) => {
  const router = useRouter();
  const { dispatch } = useUserSession();
  const [showModal, setShowModal] = useState(visible ?? true);

  const dismissPath = dismissToUrl ?? "/(auth)/(signin)";

  return (
    <Modal
      isOpen={showModal}
      onClose={() => {
        setShowModal(false);
        if (setDisplayAlertFn) setDisplayAlertFn(false);
      }}
    >
      <ModalBackdrop />
      <ModalContent className="max-w-[305px] items-center">
        <ModalHeader>
          <Box className="w-[56px] h-[56px] rounded-full bg-background-error items-center justify-center">
            <MessageSquareWarningIcon className="stroke-error-600" />
          </Box>
        </ModalHeader>
        <ModalBody className="mt-0 mb-4">
          <Heading size="md" className="text-typography-950 mb-2 text-center">
            {title ?? "Heads up:"}
          </Heading>
          <Text size="sm" className="text-typography-500 text-center">
            {description ?? "If you go cancel now, your changes will not be saved."}
          </Text>
        </ModalBody>
        <ModalFooter className="w-full">
          <Button
            variant="outline"
            action="secondary"
            size="sm"
            onPress={() => {
              setShowModal(false);
              if (setDisplayAlertFn) setDisplayAlertFn(false);
            }}
            className="flex-grow"
          >
            <ButtonText>Cancel</ButtonText>
          </Button>
          <Button
            onPress={() => {
              // clear session and go back to previous page
              console.log("Clearing session and going back to", dismissPath);
              dispatch({ type: "CLEAR_SESSION" });
              setShowModal(false);
              if (setDisplayAlertFn) setDisplayAlertFn(false);
              router.canDismiss() ? router.dismissTo({ pathname: dismissPath as any }) : router.replace({ pathname: dismissPath as any });
            }}
            size="sm"
            className="flex-grow"
          >
            <ButtonText>Go back</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmClose;
