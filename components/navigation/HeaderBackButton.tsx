import React from "react";
import { useRouter } from "expo-router";
import { Button, ButtonIcon, ButtonSpinner } from "@gluestack-ui/themed";
import { ChevronLeft, X, XCircle } from "lucide-react-native";

const HeaderBackButtonVariants = {
  CHEVRON: ChevronLeft,
  ARROW: ChevronLeft,
  X: X,
  XCIRCLE: XCircle,
} as const;

type VariantType = keyof typeof HeaderBackButtonVariants;

interface HeaderBackButtonProps {
  variant?: VariantType;
}

const HeaderBackButton: React.FC<HeaderBackButtonProps> = ({
  variant = "CHEVRON",
}) => {
  const IconComponent = HeaderBackButtonVariants[variant] || ChevronLeft;
  const router = useRouter();

  return (
    <Button
      onPress={() => router.back()}
      className="p-2"
      accessibilityLabel="Go back"
    >
      <ButtonIcon as={IconComponent} className="text-black dark:text-white" />
      <ButtonSpinner />
    </Button>
  );
};

export default React.memo(HeaderBackButton);
