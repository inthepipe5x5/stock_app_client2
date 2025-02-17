import { useState, useEffect } from "react";
import {
  router,
  useNavigation,
  usePathname,
  useLocalSearchParams,
} from "expo-router";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { SafeAreaView } from "@/components/ui/safe-area-view";
import { ScrollView } from "@/components/ui/scroll-view";
import { Image } from "@/components/ui/image";
import { Divider } from "@/components/ui/divider";
import GoogleSigninButtonComponent from "@/components/GoogleSignInButton";
import { useToast } from "@/components/ui/toast";
import { useAuth, AuthProvider } from "@/components/contexts/authContext";

type AuthLayoutProps = {
  children: React.ReactNode;
  showSSOProviders?: boolean;
};

const AuthContentLayout = (props: AuthLayoutProps) => {
  const pathname = usePathname();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ message?: string }>();

  const {
    tempUser,
    setTempUser,
    messages,
    setMessages,
    showMessage,
    clearMessages,
  } = useAuth();

  //debugging
  useEffect(() => {
    console.log("current path:", pathname);
    console.log("current params:", params);
    console.log("current tempUser:", tempUser);
    console.log("current messages:", messages?.length || 0, messages);

    if (messages && messages.length > 0) {
      const currentMsg = messages.shift();
      //do not show message if it is undefined
      if (!currentMsg) return;
      messages.length >= 1 && setMessages(messages);
      //show message
      showMessage(currentMsg);
    }
  }, [messages]);

  return (
    <SafeAreaView className="w-full h-full">
      <ScrollView
        className="w-full h-full"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <HStack className="w-full h-full bg-background-0 flex-grow justify-center">
          <VStack
            className="relative hidden md:flex h-full w-full flex-1  items-center  justify-center"
            space="md"
          >
            <Image
              height={100}
              width={100}
              source={require("@/assets/images/splash-icon.png")}
              className="object-cover h-full w-full"
              alt="App Splash Screen"
            />
          </VStack>
          <VStack className="md:items-center md:justify-center flex-1 w-full  p-9 md:gap-10 gap-16 md:m-auto md:w-1/2 h-full">
            {props.children}
            <Divider className="w-full" />

            {
              /* Conditionally rendering the `<GoogleSigninButtonComponent />` component based
                on the current `pathname`. */
              ["signin", "signup"].some((segment) =>
                pathname.includes(segment)
              ) &&
                !["create-password", "confirm", "reset-password"].some(
                  (excludeSegment) => pathname.includes(excludeSegment)
                ) && (
                  <HStack className="justify-center">
                    <GoogleSigninButtonComponent />
                  </HStack>
                )
            }
          </VStack>
        </HStack>
      </ScrollView>
    </SafeAreaView>
  );
};

export const AuthLayout = (props: AuthLayoutProps) => {
  return (
    <AuthProvider>
      <AuthContentLayout {...props} />;
    </AuthProvider>
  );
};
