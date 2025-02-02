import React, { useContext } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
// import { componentsList } from "@/utils/list";//TODO: not sure where this from
import { ScrollView } from "@/components/ui/scroll-view";
import { Box } from "@/components/ui/box";
import { Image as ExpoImage } from "expo-image";
import { Text } from "@/components/ui/text";
import { Pressable } from "@/components/ui/pressable";
import { cssInterop } from "nativewind";
import { ColorModeContext } from "./_layout";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { ChevronRightIcon, Icon } from "@/components/ui/icon";
import AppIcon from "@/components/AppIcon";
import { useWindowDimensions } from "react-native";
import PropTypes from "prop-types";
cssInterop(SafeAreaView, { className: "style" });
cssInterop(ExpoImage, { className: "style" });

/**Header component from GlueStack UI v2 kitchen sink app
 * SOURCE: https://github.com/gluestack/kitchen-sink-gluestack-ui-v2/blob/main/app/index.tsx
 *
 * @returns a Banner Component
 */

const CustomBanner = (props: any) => {
  const { colorMode }: any = useContext(ColorModeContext);
  // const router = useRouter();
  const { headerTitle }: any = props;
  return (
    <HStack className="flex-1 max-w-[1730px] w-full mx-auto justify-between">
      <VStack className="w-full md:max-w-[630px] lg:max-w-[400px] xl:max-w-[480px] mx-5 md:ml-8 mb-8 mt-10 lg:my-[44px] xl:ml-[80px] flex-1">
        <HStack
          className="rounded-full bg-background-0 py-4 px-5 mb-7 md:mb-9 lg:mb-[80px] xl:mb-[132px] items-center native:max-w-[250px] w-fit"
          space="sm"
        >
          <AppIcon
            alt="logo_image"
            width={24} //h-5 is roughly 20px, h-7 is roughly 28px => 24px for consistency
            height={24} //w-5 is roughly 20px, w-7 is roughly 28px => 24px for consistency
            className="rounded-sm"
            // className="h-5 w-5 rounded-sm lg:h-6 lg:w-6 xl:h-7 xl:w-7"
          />
          <Text className="font-medium text-sm lg:text-base xl:text-lg text-typography-900">
            {props.info ? props.info : "Powered by gluestack-ui v2"}
          </Text>
        </HStack>
        <Heading className="mb-2 xl:mb-[18px] text-4xl lg:text-5xl xl:text-[56px]">
          {headerTitle ? headerTitle : "Welcome to GlueStack UI v2"}
        </Heading>
        <Text className="text-sm lg:text-base xl:text-lg">
          {props.description
            ? props.description
            : "Kitchensink is a comprehensive demo app showcasing all the gluestack components in action. It includes buttons, forms, icons and much more!"}
        </Text>
      </VStack>
      <VStack className="hidden lg:flex flex-1 max-h-[510px] h-full aspect-[1075/510]">
        <ExpoImage
          source={{
            uri:
              colorMode === "light"
                ? props.bannerImage.light ?? "https://i.imgur.com/sxY9qxx.png"
                : props.bannerImage.dark ?? "https://i.imgur.com/icZHMep.png",
          }}
          alt="CustomBanner_image"
          className="flex-1"
          cachePolicy="memory-disk"
        />
      </VStack>
    </HStack>
  );
};
CustomBanner.propTypes = {
  info: PropTypes.string,
  headerTitle: PropTypes.string,
  description: PropTypes.string,
  bannerImage: PropTypes.shape({
    light: PropTypes.string,
    dark: PropTypes.string,
  }),
};
export default CustomBanner;
