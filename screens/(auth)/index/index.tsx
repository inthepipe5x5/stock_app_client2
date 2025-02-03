import { VStack } from "@/components/ui/vstack";
import { useColorScheme } from "nativewind";
import { useRouter } from "expo-router";
import { AuthLayout } from "@/screens/(auth)/layout/index";
import AppIcon from "@/components/AppIcon";
import { ScrollView } from "react-native";
import {
  AltAuthLeftBackground,
  defaultAuthPortals,
} from "@/screens/(auth)/AltAuthLeftBg";

const AuthLandingScreen = () => {
  const router = useRouter();
  const { colorScheme } = useColorScheme();

  return (
    <VStack
      className="w-full max-w-[440px] items-center h-full justify-center"
      space="lg"
    >
      {colorScheme === "dark" ? (
        <AppIcon theme="dark" width={219} height={40} />
      ) : (
        <AppIcon theme="light" width={219} height={40} />
      )}

      <ScrollView
        horizontal
        className="pb-4"
        style={{ flexDirection: "column", marginBottom: 50 }}
      >
        <AltAuthLeftBackground authPortals={defaultAuthPortals} />
      </ScrollView>
    </VStack>
  );
};

export const AuthIndex = () => {
  return (
    <AuthLayout>
      <AuthLandingScreen />
    </AuthLayout>
  );
};
