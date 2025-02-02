import React, { useContext } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { componentsList } from "@/utils/list";
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

cssInterop(SafeAreaView, { className: "style" });
cssInterop(ExpoImage, { className: "style" });

const ComponentCard = ({ component, onPress }: any) => {
  const { colorMode }: any = useContext(ColorModeContext);
  return (
    <Pressable
      className={`flex-1 rounded-xl bg-background-0 w-full h-full sm:gap-2 gap-1 flex flex-col lg:p-4 ${colorMode === "light" ? "lg:shadow-[0px_0px_4.374px_0px_rgba(38,38,38,0.10)] data-[hover=true]:lg:border data-[hover=true]:border-outline-100" : "lg:shadow-soft-1 lg:border border-outline-50 data-[hover=true]:border-outline-200"}`}
      onPress={onPress}
    >
      <Box className="rounded-lg bg-background-50 px-3 lg:px-6 py-[14px] lg:py-7 aspect-[17/12]">
        <ExpoImage
          source={{
            uri: colorMode === "light" ? component.url : component.darkUrl,
          }}
          alt={component.title}
          className={`flex-1 rounded lg:rounded-md shadow-[0px_0px_1.998px_0px_rgba(38,38,38,0.10)]`}
          cachePolicy="memory-disk"
        />
      </Box>
      <HStack className="justify-between px-1.5 mt-1">
        <Text className="text-typography-900 font-medium sm:text-base text-sm lg:text-xl">
          {component.title}
        </Text>
        <Icon
          as={ChevronRightIcon}
          size="sm"
          className="text-background-400 lg:hidden"
        />
      </HStack>
    </Pressable>
  );
};

export default ComponentCard