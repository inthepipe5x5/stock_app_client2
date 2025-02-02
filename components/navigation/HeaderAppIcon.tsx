import React from "react";
import { Button, ButtonIcon } from "@/components/ui/button";
import { useRouter } from "expo-router";
import AppIcon from "@/components/AppIcon";
import { useUserSession } from "@/components/contexts/UserSessionProvider";

const HeaderAppIcon = (props: any) => {
  const router = useRouter();
  const { state } = useUserSession();

  const handlePress = () => {
    if (state.user) {
      router.push("/(tabs)/(dashboard)/index" as any);
    } else {
      router.push("/(auth)/index" as any);
    }
  };

  return (
    <Button onPress={handlePress} className="p-2">
      <ButtonIcon as={AppIcon} {...props} />
    </Button>
  );
};

export default HeaderAppIcon;
