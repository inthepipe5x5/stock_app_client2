import React, { useContext } from "react";
import { RelativePathString, router, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "@/components/ui/scroll-view";
import { Box } from "@/components/ui/box";
import { Image as ExpoImage } from "expo-image";
import { Text } from "@/components/ui/text";
import { Pressable } from "@/components/ui/pressable";
import { cssInterop } from "nativewind";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { ChevronRightIcon, Icon } from "@/components/ui/icon";
import { cn } from "@gluestack-ui/nativewind-utils/cn";
import { Appearance } from "react-native";

cssInterop(SafeAreaView, { className: "style" });
cssInterop(ExpoImage, { className: "style" });


export type ComponentCardProps = {
  title: string;
  link: RelativePathString;
  url: string;
  darkUrl?: string;
  CustomIcon?: React.FunctionComponent;
  IconProps?: any;
  showIcon: boolean;
  onPress: () => void;
};

const ComponentCard = ({
  title,
  link,
  url,
  darkUrl,
  CustomIcon,
  IconProps,
  showIcon = true,
  onPress }: ComponentCardProps) => {
  const colorMode = Appearance.getColorScheme();
  let imageURI = '' as string;

  switch (true) {
    // If the component has a URL and a dark URL, use the appropriate one based on the color mode
    case ([
      url,
      darkUrl
    ].some(Boolean)):
      imageURI = colorMode === "light" ? url : darkUrl as string;
      break;
    // If the component has a URL but no dark URL, use the URL
    case (url && !darkUrl):
      imageURI = url;
      break;
    // If the component has a dark URL but no URL, use the dark URL
    case ([!!url, darkUrl].every(Boolean)):
      imageURI = darkUrl as string;
      break;
    // If neither URL is present, use a default image or placeholder
    default:
      imageURI = require('@/assets/image.png');
      break;
  }

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Fallback action if onPress is not provided
      console.log(`Navigating to ${link}`);
      router.push({
        pathname: link as RelativePathString
      })
    }
  }
  return (
    <Pressable
      className={cn(`flex-1 rounded-xl bg-background-0 w-full h-full sm:gap-2 gap-1 flex flex-col lg:p-4`,
        `${colorMode === "light" ?
          "lg:shadow-[0px_0px_4.374px_0px_rgba(38,38,38,0.10)] data-[hover=true]:lg:border data-[hover=true]:border-outline-100"
          : "lg:shadow-soft-1 lg:border border-outline-50 data-[hover=true]:border-outline-200"}`
      )}
      android_ripple={{ color: "#00000010" }}
      onPress={handlePress}
    >

      <Box className="rounded-lg bg-background-50 px-3 lg:px-6 py-[14px] lg:py-7 aspect-[17/12]">
        <ExpoImage
          source={{
            uri: imageURI
          }}
          alt={title}
          className={`flex-1 rounded lg:rounded-md shadow-[0px_0px_1.998px_0px_rgba(38,38,38,0.10)]`}
          cachePolicy="memory-disk"
        />
      </Box>
      <HStack className="justify-between px-1.5 mt-1">
        <Text className="text-typography-900 font-medium sm:text-base text-sm lg:text-xl">
          {title}
        </Text>
        {showIcon ?
          (!!CustomIcon ?
            <CustomIcon {...(IconProps ?? {})} />
            :
            (
              <Icon
                as={ChevronRightIcon}
                size="sm"
                className="text-background-400 lg:hidden"
              />
            ))
          : null}
      </HStack>
    </Pressable>
  );
};

export default ComponentCard