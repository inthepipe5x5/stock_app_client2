import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { SafeAreaView } from "@/components/ui/safe-area-view";
import { ScrollView } from "@/components/ui/scroll-view";
import { defaultAuthPortals, AltAuthLeftBackground } from "./AltAuthLeftBg";
import { useState, useContext } from "react";
import { Divider } from "@/components/ui/divider";
import {
  InterfaceToastProps,
  ToastPlacement,
} from "@gluestack-ui/toast/lib/types";

export type AuthLayoutProps = {
  children: React.ReactNode;
  portals?:
    | {
        HeadingText: string;
        SubtitleText: string;
        link: {
          href: string;
          isExternal: boolean;
          text: string;
        };
        CardImage: React.JSX.Element;
      }[]
    | undefined;
  next?: string; // next auth page to navigate to
  prev?: string; // previous auth page to navigate to
  title?: string; // title of the auth page
  mutationFn?: Function; // mutation function to be called;
  showSSOProviders?: boolean; // show SSO providers
  submitSuccessDispatchObject?: {
    type: string;
    payload: any;
  }; // dispatch object to be called on submit success
  submitErrorDispatchObject?: {
    type: string;
    payload: any;
  }; // dispatch object to be called on submit failure
  submitText?: string; // submit button text
  submitSuccessToastObject?: InterfaceToastProps;
  submitErrorToastObject?: InterfaceToastProps;
};

export const AuthLayout = (props: AuthLayoutProps) => {
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
            {/* <Image
              height={100}
              width={100}
              source={
                "https://via.assets.so/img.jpg?w=100&h=100&tc=1f160f&bg=#FBFBFB&t=" //placeholder image
              }
              // source={require("@/assets/auth/radialGradient.png")}
              className="object-cover h-full w-full"
              alt="Radial Gradient"
            /> */}
            {/* {props.children.alt} */}
            <AltAuthLeftBackground
              authPortals={props.portals ? props.portals : defaultAuthPortals}
            />
          </VStack>
          <VStack className="md:items-center md:justify-center flex-1 w-full  p-9 md:gap-10 gap-16 md:m-auto md:w-1/2 h-full">
            {props.children}
            <Divider className="my-1" />
          </VStack>
        </HStack>
      </ScrollView>
    </SafeAreaView>
  );
};

export const AuthPageLayout = ({ props }: any) => {
  const { children, portals } = props;
  const [provider, setProvider] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleLoading = () => {
    setLoading(!loading);
  };

  return <AuthLayout portals={portals}>{children}</AuthLayout>;
};
