import React from "react";
import { Center } from "@/components/ui/center";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import {
  useRouter,
  useLocalSearchParams,
  RelativePathString,
  usePathname
} from "expo-router";
import { cn } from "@gluestack-ui/nativewind-utils/cn";
import RoundedHeader from "@/components/navigation/RoundedHeader";
import { ChevronLeft, TriangleAlert } from "lucide-react-native";
import { dismissTo } from "expo-router/build/global-state/routing";

const defaultStyling = {
  container: "flex-1 justify-center items-center px-4",
  errorText: "text-xl font-bold text-red-500",
  messageText: "text-base text-black text-center mt-2",
};

const ErrorScreen = ({ error, styling, children }: {
  error?: any | null | undefined;
  styling?: { [key: string]: any } | null | undefined;
  children?: React.ReactNode;
}) => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const pathname = usePathname();

  const errorTitle =
    error?.title || "Error";
  const errorCode =
    error?.code || "Unknown Error";
  const errorDetails =
    error?.details ?? params?.messageDetails?.[0] ?? params?.message?.[1] ?? params?.message?.[0] ?? "The page you are looking for does not exist or has been moved.";
  const nextURL = params?.nextURL?.[0] ?? "/(auth)"

  const handleRedirect = (params?: {
    pathname?: string | undefined;
    params?: { [key: string]: any } | undefined;
    query?: { [key: string]: any } | undefined;
  }) => {
    if (!!!params) {
      return router.canGoBack() ? router.back() :
        router.replace({
          pathname: nextURL as RelativePathString ?? "/(auth)",
        });
    }
    else if (params?.pathname && params?.params) {
      router.push({
        pathname: params?.pathname as RelativePathString,
        params: params?.params,
      });
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace({
        pathname: nextURL as RelativePathString ?? "/(auth)",
      });
    }
  };

  //effect 
  React.useEffect(() => {
    if (error) {
      console.error("Error occurred:", error);
    }
    console.log({ pathname, errorTitle, errorCode, errorDetails });
    if (errorCode === "404") {
      handleRedirect(
        {
          pathname: "/+not-found", //redirect to not found page
          params: {
            nextURL: nextURL,
            dismissToURL: nextURL,
            message: [...(errorDetails ?? errorCode ?? "Page not found")],
            messageDetails: errorDetails,
          },
        }
      )
    }
  }
    , [error, pathname]);

  const ErrorContent = ({ children, styling }:
    {
      children?: React.ReactNode | null | undefined;
      styling: { [key: string]: any }
    }) => {
    return children ? children : (
      <VStack
        className={cn(`lg:max-w-lg lg:max-h-lg  md:w-full md:h-full`, styling?.container ?? {
          "bg-red-100": errorCode === "500",
          "bg-gray-100": errorCode !== "404",
        })}
        space="md"
      >
        <Heading
          size="xl"
          className={cn(`${defaultStyling.errorText} text-center text-lg`,
            styling?.header ?? {
              "text-red-500": errorCode === "500",
              "text-black": errorCode !== "404",
            })}
        >
          {`${errorCode} - ${errorTitle}`}
        </Heading>
        <Text
          className={cn(`${defaultStyling.messageText} muted text-center text-sm`,
            styling?.message ?? {
              "text-red-500": errorCode === "500",
              "text-black": errorCode !== "404",
            })}
        >
          {errorDetails}
        </Text>
        <Button
          className={cn("mt-4",
            styling?.primaryButton ?? {
              "bg-red-500": errorCode === "500",
              "bg-gray-500": errorCode !== "404",
            })}
          onPress={handleRedirect}
          variant="solid"
          action={styling?.primaryButtonAction ?? "primary"}
        >
          <ButtonText>
            Go Back Home
          </ButtonText>
        </Button>
      </VStack>
    )
  }

  return (
    <Center
      className={cn(`${defaultStyling.container} w-full h-full`, styling?.container ?? {
        "bg-red-100": errorCode === "500",
        "bg-gray-100": errorCode !== "404",
      })}
    >
      <RoundedHeader
        title="Error"
        icon={TriangleAlert}
        backIcon={ChevronLeft}
        onBack={() => {
          router.canGoBack() ? router.back() : handleRedirect({
            pathname: nextURL as RelativePathString,
            params: {
              message: [...(errorDetails ?? errorCode ?? "Page not found")],
              nextURL: nextURL,
            },
          });
        }}
        nextUrl={nextURL}
      />
      <ErrorContent
        styling={styling ?? {}}
      >
        {children}
      </ErrorContent>
    </Center>
  );
};



export default ErrorScreen;
