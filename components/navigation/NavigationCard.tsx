import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Image } from "@/components/ui/image";
import { Link, LinkText } from "@/components/ui/link";
import { Text } from "@/components/ui/text";
import { Icon, ArrowRightIcon } from "@/components/ui/icon";
import { TouchableOpacity, Platform, Appearance, Dimensions } from "react-native";
import { ReactElement } from "react";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import Colors from "@/constants/Colors";
import { cn } from "@gluestack-ui/nativewind-utils/cn";
import { viewPort } from "@/constants/dimensions";

// import { useRouter } from "expo-router";
interface NavigationCardProps {
  CardImage?: ReactElement | string;
  HeadingText: string;
  SubtitleText?: string;
  link: {
    href: string;
    isExternal: boolean;
    text: string;
  };
  //   onPress?: () => void;
}

const NavigationCard = ({
  CardImage,
  HeadingText,
  SubtitleText,
  link,
}: //   onPress,
  NavigationCardProps) => {
  const router = useRouter();
  const colorScheme = Appearance.getColorScheme();
  const isDarkMode = colorScheme === "dark";
  const colors = Colors[isDarkMode ? "light" : "dark"];
  const oppositeColors = Colors[isDarkMode ? "light" : "dark"];
  const { width, height } = Dimensions.get("window");
  //render the card media as a Image URI string or directly as a react component
  const cardMedia =
    typeof CardImage === "string" ? (
      <Image
        source={{
          uri: CardImage,
        }}
        className={cn("mb-6 h-[240px] w-full rounded-md aspect-[263/240]")}
        alt={`${CardImage.split("/")[-1].split(".")[0]} Image`} //extract the image name from the URI
      />
    ) : (
      CardImage
    );

  /** * Function to open a link in the browser or navigate to it.
   *  
   * @param url - The URL to open in the browser.
   */
  const openLinkInBrowser = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      console.log("Opening with Expo Web Browser: " + url);
      await Linking.openURL(url);
    } else {
      console.log("Cannot open URL: " + url);
      Platform.OS === "web"
        ? window.open(url, "_blank")
        : router.push({ pathname: url as any });
    }
  };
  //event listener that navigates the user to the link.href when the card is clicked
  const onCardClick = async (event: any) => {
    event.preventDefault();
    await openLinkInBrowser(link.href);
  };

  return (
    <TouchableOpacity
      onPress={onCardClick}
      activeOpacity={0.8}
      style={[
        {
          margin: 8,
          backgroundColor: colors.background
        }
      ]}
    >
      <Card className={cn("p-5 rounded-lg m-3",
        isDarkMode ? "bg-background-900 shadow-slate-50" : "bg-background-100 shadow-slate-400",
        `max-w-[${['android', 'ios'].includes(Platform.OS) ? viewPort.breakpoints.X.mobile : viewPort.breakpoints.X.tablet}px]`,
        `max-h-[${['android', 'ios'].includes(Platform.OS) ? viewPort.breakpoints.Y.mobile : viewPort.breakpoints.Y.tablet}px]`
      )}>
        {CardImage ? cardMedia : null}

        <Link href={link.href} isExternal={link.isExternal}>
          <Heading size="md" className={cn("mb-4", isDarkMode ? "text-typography-50" : "text-typography-900")}>
            {HeadingText ?? "Heading"}
          </Heading>
          {
            //render optional subtitle text
            SubtitleText ? (
              <Text className={cn("text-sm font-normal mb-2",
                isDarkMode ? "text-typography-700" : "text-typography-700")}>
                {SubtitleText ?? ""}
              </Text>
            ) : null
          }
          <HStack
            space={
              height > 1000
                ? "md" :
                "sm"}

            className={cn("items-center",

            )}>
            <LinkText
              size="sm"
              className={cn("font-semibold no-underline",
                isDarkMode ? "text-info-100" : "text-info-600"
              )}
            >
              {link.text ?? "Open Link"}
            </LinkText>
            <Icon
              as={ArrowRightIcon}
              size="sm"
              className={cn("mt-0.5 ml-0.5",
                isDarkMode ? "text-info-100" : "text-info-600"
              )}
            />
          </HStack>

        </Link>
      </Card>
    </TouchableOpacity >
  );
};

export default NavigationCard;
