import { useState, useEffect } from "react";
import { Keyboard, Appearance } from 'react-native'
import {
  usePathname,
  useLocalSearchParams,
} from "expo-router";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { SafeAreaView } from "@/components/ui/safe-area-view";
import { Image } from "@/components/ui/image";
import { Divider } from "@/components/ui/divider";
// import GoogleSigninButtonComponent from "@/components/GoogleSignInButton";
import { useToast } from "@/components/ui/toast";
import { UserMessage } from "@/constants/defaultSession";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import defaultSession from "@/constants/defaultSession";
// import { useAuth, AuthProvider } from "@/components/contexts/authContext";
// type AuthLayoutProps = {
//   children: React.ReactNode;
//   showSSOProviders?: boolean;
// };

import { AuthLayoutProps } from "@/screens/(auth)/_layout";
import ConfirmClose from "@/components/navigation/ConfirmClose";
import Colors from "@/constants/Colors";

const AuthContentLayout = (props: Partial<AuthLayoutProps>) => {
  const pathname = usePathname();
  const toast = useToast();
  const params = useLocalSearchParams() as {
    messageTitle?: string;
    messageDescription?: string;
    messageType?: "info" | "error" | "success";
    [key: string]: string[] | string | undefined;
  };
  const [confirmClose, setConfirmClose] = useState(false);
  const globalContext = useUserSession();
  const { state } = globalContext || defaultSession;
  const { dispatch, showMessage, clearMessages, addMessage } =
    useUserSession();
  const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false);
  const colorScheme = state?.user?.preferences?.theme ?? Appearance.getColorScheme() ?? "light";
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const oppositeColors = Colors[colorScheme === "dark" ? "light" : "dark"];
  const isDarkMode = colorScheme === "dark";

  useEffect(() => {
    //add params.messages
    if (
      params.messageTitle &&
      params.messageDescription &&
      params.messageType
    ) {
      // dispatch({
      //   type: "SET_MESSAGE",
      //   payload: {
      //     type: "info",
      //     title: params.messageTitle,
      //     description: params.messageDescription,
      //   } as Partial<UserMessage>,
      // });
      // toast.show({
      //   // type: params.messageType ?? "info",
      //   avoidKeyboard: true,
      //   placement: "top",
      //   id: "paramsMessage",
      //   // title: params.messageTitle ?? "Message Type",
      //   // description: params.messageDescription ?? "Message Description",
      //   duration: 10000,
      // });
      showMessage({
        type: params.messageType ?? "info",
        title: params.messageTitle ?? "Message Type",
        description: params.messageDescription ?? "Message Description",
        duration: 10000,
        onDismiss: () => {
          toast.close("paramsMessage");
        },
      } as UserMessage);
    }

    //show any messages
    if (state.message && state.message.length > 0) {
      const currentMsg = state.message.shift();
      showMessage(currentMsg as UserMessage);
    }
  }, [state?.message]);
  // const {
  //   tempUser,
  //   setTempUser,
  //   messages,
  //   setMessages,
  //   showMessage,
  //   clearMessages,
  // } = useAuth();

  //debugging
  // useEffect(() => {
  //   console.log("current path:", pathname);
  //   console.log("current params:", params);
  //   // console.log("current tempUser:", tempUser);
  //   console.log("current messages:", messages?.length || 0, messages);

  //   if (messages && messages.length > 0) {
  //     const currentMsg = messages.shift();
  //     //do not show message if it is undefined
  //     if (!currentMsg) return;
  //     messages.length >= 1 && setMessages(messages);
  //     //show message
  //     showMessage(currentMsg);
  //   }
  // }, [messages]);

  //listeners 
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    }

  }, [keyboardVisible]);

  return (
    <SafeAreaView
      className="w-full h-full"

    >
      {/* <ScrollView
        className="w-full h-full"
      // contentContainerStyle={{ flexGrow: 1 }}
      > */}
      {<ConfirmClose visible={confirmClose} setDisplayAlertFn={setConfirmClose} dismissToURL="/(auth)/(signin)" title="Are you sure you want to go back?" description="Click this button if you want to cancel and discard any unsaved progress." />}

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
        <VStack className="md:items-center md:justify-center flex-1 w-full p-9 lg:gap-10 gap-16 lg:m-auto lg:w-1/2 h-full"
          style={{ backgroundColor: colors.background }}
        >
          {props.children}
          {/* 
          {
            props.showSSOProviders ?
              (<VStack className="justify-center">
                <Divider className="w-full" />
                <GoogleSigninButtonComponent />
              </VStack>) : null
          } */}
        </VStack>
      </HStack>
      {/* </ScrollView> */}
    </SafeAreaView>
  );
};

export const AuthLayout = (props: AuthLayoutProps) => {
  return (
    // <AuthProvider>
    <AuthContentLayout {...props} />
    // </AuthProvider>
  );
};
