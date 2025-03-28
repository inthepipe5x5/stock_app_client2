import React from "react";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Link, LinkText } from "@/components/ui/link";
// import { HStack, Link, LinkText, Text } from "../components/ui";

const Banner = (props: {
  bannerText: string;
  bannerLink: string;
  bannerLinkText: string;
}) => {
  return (
    <HStack
      className="justify-center items-center min-h-16 bg-shade-0"
      space="sm"
    >
      <Text className="text-content-0" size="sm">
        {props.bannerText}
      </Text>
      <Link href={props.bannerLink}>
        <LinkText className="text-content-50 font-semibold" size="sm">
          {props.bannerLinkText}
        </LinkText>
      </Link>
    </HStack>
  );
};
export default Banner;