import React from "react";
import { useRouter } from "expo-router";
import { Button, ButtonIcon, ButtonSpinner } from "@/components/ui/button";
import { ChevronLeft, X, XCircle } from "lucide-react-native";
import { actionTypes } from "../contexts/sessionReducer";

const IconVariants = {
  CHEVRON: ChevronLeft,
  ARROW: ChevronLeft,
  X: X,
  XCIRCLE: XCircle,
} as const;

// const HeaderBackButtonVariants = {
//   SOLID: "solid",
//   OUTLINE: "outline",
//   LINK: "link",
// } as const;

//from gluestack button actions
type buttonActionTypes =
  | "primary"
  | "secondary"
  | "negative"
  | "positive"
  | "default";
type IconVariantType = keyof typeof IconVariants;
// type HeaderBackButtonVariant = keyof typeof HeaderBackButtonVariants;

interface HeaderBackButtonProps {
  button: {
    variant?: "solid" | "outline" | "link"; //HeaderBackButtonVariant;
    onDismiss?: () => void;
    action: buttonActionTypes;
  };
  iconVariant?: IconVariantType;
  theme: "light" | "dark";
}

const router = useRouter();

const HeaderBackButton: React.FC<HeaderBackButtonProps> = ({
  iconVariant = "CHEVRON",
  theme = "light",
  button,
}) => {
  const IconComponent = IconVariants[iconVariant] || ChevronLeft;
  const {
    variant = "solid",
    onDismiss = () => router.dismissAll(),
    action = "default",
  } = button;

  return (
    <Button
      className={`p-2 ${
        theme === "dark" ? "bg-black text-white" : "bg-white text-black"
      }`}
      accessibilityLabel="Go back"
      variant={variant}
      onPress={onDismiss}
      action={action}
    >
      <ButtonIcon
        as={IconComponent}
        className={theme === "dark" ? "text-white" : "text-black"}
      />
      <ButtonSpinner />
    </Button>
  );
};

export default React.memo(HeaderBackButton);
