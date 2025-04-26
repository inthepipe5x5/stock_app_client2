import { RelativePathString, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "@/components/ui/scroll-view";
import { Box } from "@/components/ui/box";
import { cssInterop } from "nativewind";
import { HStack } from "@/components/ui/hstack";

// import Header from "@/components/header/Header";
import ComponentCard from "@/screens/modular/ComponentCard";
import { Grid, GridItem } from "@/components/ui/grid";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

cssInterop(SafeAreaView, { className: "style" });
// cssInterop(ExpoImage, { className: "style" });

export type ComponentsList = {

  title: string;
  link: string;
  url: string;
  darkUrl?: string;
  CustomIcon?: React.FunctionComponent;
  IconProps?: any;
  showIcon?: boolean;
}[];

type ComponentListViewProps = {
  componentsList: ComponentsList;
  listTitle?: string;
  listDescription?: string;
  listIcon?: React.ReactNode;
  variant?: "grid" | "list";
};
/**Homescreen component from GlueStack UI v2 kitchen sink app
 * SOURCE: https://github.com/gluestack/kitchen-sink-gluestack-ui-v2/blob/main/app/index.tsx
 *
 * @returns Component View => to be used for rendering mini dashboards eg. for households or inventories
 */
export default function ComponentListView({
  listTitle,
  listDescription,
  listIcon,
  componentsList,
  variant = 'grid',
}: ComponentListViewProps) {
  // const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background-0 relative">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <Box className="bg-background-50 flex-1">
          <Heading>{listTitle}</Heading>
          {!!listDescription ?
            (
              <HStack className="items-center gap-x-2 mt-2 mb-4">
                {!!listIcon ? <>{listIcon}</> : null}
                <Text className="text-typography-900 font-normal text-sm lg:text-base">{listDescription}</Text>
              </HStack>
            )
            : null
          }
        </Box>

        {variant === 'list' ?
          (
            <HStack className="flex-wrap justify-center gap-x-3 gap-y-4 md:gap-x-4 lg:gap-x-7 lg:gap-y-8 py-6 px-5 md:px-8 md:pt-9 xl:pt-[90px] lg:pt-[70px] lg:px-[70px] xl:px-[100px] max-w-[1730px] mx-auto">
              {componentsList.map((component, index) => (
                <Box
                  key={index}
                  className="w-[160px] h-[145px] md:w-[224px] md:h-[194px] lg:w-[274px] lg:h-[244px] xl:w-[390px] xl:h-[328px]"
                >
                  <ComponentCard
                    title={component.title}
                    link={component.link as RelativePathString}
                    url={component.url}
                    darkUrl={component.darkUrl}
                    CustomIcon={component.CustomIcon}
                    IconProps={component.IconProps}
                    showIcon={component.showIcon ?? !!component?.CustomIcon}
                    //@ts-ignore
                    onPress={() => router.push(component.link)}
                  />
                </Box>
              ))}
            </HStack>
          )
          :
          (
            <Box className="bg-background-0">
              <Grid
                className="gap-x-3 gap-y-4 md:gap-x-4 lg:gap-x-7 lg:gap-y-8 py-6 px-5 md:px-8 md:pt-9 xl:pt-[90px] lg:pt-[70px] lg:px-[70px] xl:px-[100px] max-w-[1730px] mx-auto"
                _extra={{
                  className: "grid-cols-2 md:grid-cols-3",
                }}
              >
                {componentsList.map((component, index) => (
                  <GridItem key={index} _extra={{ className: "col-span-1" }}>
                    <ComponentCard
                      title={component.title}
                      link={component.link as RelativePathString}
                      url={component.url}
                      darkUrl={component.darkUrl}
                      CustomIcon={component.CustomIcon}
                      IconProps={component.IconProps}
                      showIcon={component.showIcon ?? !!component?.CustomIcon}
                      //@ts-ignore
                      onPress={() => router.push(component.link)}
                    />
                  </GridItem>
                ))}
              </Grid>
            </Box>
          )
        }
      </ScrollView>
    </SafeAreaView >
  );
}
