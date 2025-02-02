import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Image } from "@/components/ui/image";
import { Link, LinkText } from "@/components/ui/link";
import { Text } from "@/components/ui/text";
import { Icon, ArrowRightIcon } from "@/components/ui/icon";
import { TouchableOpacity } from "react-native";
import { ReactElement } from "react";
import { Platform } from "react-native";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";

// import { useRouter } from "expo-router";
interface NavigationCardProps {
  CardImage: ReactElement | string;
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
  //   //handle the onPress event if it is passed as a prop
  //   onPress = onPress
  //     ? onPress
  //     : () => {
  //         router.push({
  //           pathname: link.href as any,
  //         });
  //       };

  //render the card media as a Image URI string or directly as a react component
  const cardMedia =
    typeof CardImage === "string" ? (
      <Image
        source={{
          uri: CardImage,
        }}
        className="mb-6 h-[240px] w-full rounded-md aspect-[263/240]"
        alt={`${CardImage.split("/")[-1].split(".")[0]} Image`} //extract the image name from the URI
      />
    ) : (
      CardImage
    );

  const openLink = async (url: string) => {
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
    await openLink(link.href);
  };

  return (
    <TouchableOpacity
      onPress={onCardClick}
      activeOpacity={0.8}
      style={{ margin: 8 }}
    >
      <Card className="p-5 rounded-lg max-w-[360px] m-3">
        {cardMedia}
        {
          //render optional subtitle text
          SubtitleText && (
            <Text className="text-sm font-normal mb-2 text-typography-700">
              {SubtitleText ?? "Subtitle"}
            </Text>
          )
        }
        <Link href={link.href} isExternal={link.isExternal}>
          <Heading size="md" className="mb-4">
            {HeadingText ?? "Heading"}
          </Heading>
          <HStack className="items-center">
            <LinkText
              size="sm"
              className="font-semibold text-info-600 no-underline"
            >
              {link.text ?? "Link Text Here"}
            </LinkText>
            <Icon
              as={ArrowRightIcon}
              size="sm"
              className="text-info-600 mt-0.5 ml-0.5"
            />
          </HStack>
        </Link>
      </Card>
    </TouchableOpacity>
  );
};

export default NavigationCard;
