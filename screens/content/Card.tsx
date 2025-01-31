import { SafeAreaView } from "react-native-safe-area-context";
import { Box } from "@/components/ui/box";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { Pressable } from "@/components/ui/pressable";
import { cssInterop } from "nativewind";
// import { ColorModeContext } from "./_layout";
import { HStack } from "@/components/ui/hstack";
import { ChevronRightIcon, Icon } from "@/components/ui/icon";

cssInterop(SafeAreaView, { className: "style" });

const ContentCard = ({ component, onPress, colorMode }: any) => {
  // const { colorMode }: any = useContext(ColorModeContext);
  return (
    <Pressable
      className={`flex-1 rounded-xl bg-background-0 w-full h-full sm:gap-2 gap-1 flex flex-col lg:p-4 ${
        (component?.colorMode ?? "light") === "light"
          ? "lg:shadow-[0px_0px_4.374px_0px_rgba(38,38,38,0.10)] data-[hover=true]:lg:border data-[hover=true]:border-outline-100"
          : "lg:shadow-soft-1 lg:border border-outline-50 data-[hover=true]:border-outline-200"
      }`}
      onPress={onPress}
    >
      <Box className="rounded-lg bg-background-50 px-3 lg:px-6 py-[14px] lg:py-7 aspect-[17/12]">
        <Image
          source={{
            uri:
              (colorMode ?? "light") === "light"
                ? component.url
                : component?.darkUrl ?? component.url,
          }}
          alt={component.title}
          className={`flex-1 rounded lg:rounded-md shadow-[0px_0px_1.998px_0px_rgba(38,38,38,0.10)]`}
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

export default ContentCard;
