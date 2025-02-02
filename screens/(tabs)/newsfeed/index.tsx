import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { DownloadIcon, SearchIcon } from "@/components/ui/icon";
import { isWeb } from "@gluestack-ui/nativewind-utils/IsWeb";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Image } from "expo-image";
import { ScrollView } from "@/components/ui/scroll-view";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import DashboardLayout from "@/screens/_layout";
import UpcomingEvents from "./UpcomingEvents";
import MemberActionCards, { MemberData } from "./MemberActionCards";
import BlogCards, { BlogData } from "./BlogCards";

const WORLD_DATA: BlogData[] = [
  {
    bannerUri: require("@/screens/(tabs)/newsfeed/assets/image3.png"),
    title: "The Power of Positive Thinking",
    description:
      "Discover how the power of positive thinking can transform your life, boost your confidence, and help you overcome challenges. Explore practical tips and techniques to cultivate a positive mindset for greater happiness and success.",
    publishedDate: "May 15, 2023",
  },
  {
    bannerUri: require("@/screens/(tabs)/newsfeed/assets/image4.png"),
    title: "The Power of Positive Thinking",
    description:
      "Discover how the power of positive thinking can transform your life, boost your confidence, and help you overcome challenges. Explore practical tips and techniques to cultivate a positive mindset for greater happiness and success.",
    publishedDate: "May 15, 2023",
  },
  {
    bannerUri: require("@/screens/(tabs)/newsfeed/assets/image5.png"),
    title: "The Power of Positive Thinking",
    description:
      "Discover how the power of positive thinking can transform your life, boost your confidence, and help you overcome challenges. Explore practical tips and techniques to cultivate a positive mindset for greater happiness and success.",
    publishedDate: "May 15, 2023",
  },
  {
    bannerUri: require("@/screens/(tabs)/newsfeed/assets/image3.png"),
    title: "The Power of Positive Thinking",
    description:
      "Discover how the power of positive thinking can transform your life, boost your confidence, and help you overcome challenges. Explore practical tips and techniques to cultivate a positive mindset for greater happiness and success.",
    publishedDate: "May 15, 2023",
  },
  {
    bannerUri: require("@/screens/(tabs)/newsfeed/assets/image4.png"),
    title: "The Power of Positive Thinking",
    description:
      "Discover how the power of positive thinking can transform your life, boost your confidence, and help you overcome challenges. Explore practical tips and techniques to cultivate a positive mindset for greater happiness and success.",
    publishedDate: "May 15, 2023",
  },
];
const BLOGS_DATA: BlogData[] = [
  {
    bannerUri: require("@/screens/(tabs)/newsfeed/assets/image.png"),
    title: "The Power of Positive Thinking",
    description:
      "Discover how the power of positive thinking can transform your life, boost your confidence, and help you overcome challenges. Explore practical tips and techniques to cultivate a positive mindset for greater happiness and success.",
    publishedDate: "May 15, 2023",
  },
  {
    bannerUri: require("@/screens/(tabs)/newsfeed/assets/image2.png"),
    title: "The Power of Positive Thinking",
    description:
      "Discover how the power of positive thinking can transform your life, boost your confidence, and help you overcome challenges. Explore practical tips and techniques to cultivate a positive mindset for greater happiness and success.",
    publishedDate: "May 15, 2023",
  },
  {
    bannerUri: require("@/screens/(tabs)/newsfeed/assets/image2.png"),
    title: "The Power of Positive Thinking",
    description:
      "Discover how the power of positive thinking can transform your life, boost your confidence, and help you overcome challenges. Explore practical tips and techniques to cultivate a positive mindset for greater happiness and success.",
    publishedDate: "May 15, 2023",
  },
];
const MEMBERS_DATA: MemberData[] = [
  {
    bannerUri: require("@/screens/(tabs)/newsfeed/assets/image6.png"),
    name: "Emily Zho",
    description: "Designer by heart, writer by profession, talks about design",
  },
  {
    bannerUri: require("@/screens/(tabs)/newsfeed/assets/image7.png"),
    name: "Ram Narayan",
    description: "Founder of Fortune 500 company Alo, talks about",
  },
  {
    bannerUri: require("@/screens/(tabs)/newsfeed/assets/image8.png"),
    name: "David John",
    description: "Member of all things metal, talks about music and art. ",
  },
];

const MainContent = () => {
  return (
    <VStack
      className="p-4 pb-0 md:px-10 md:pt-6 md:pb-0 h-full w-full max-w-[1500px] self-center  mb-20 md:mb-2"
      space="2xl"
    >
      {
        //TODO: add a search bar later
        /* <Input className="text-center md:hidden border-border-100">
        <InputField placeholder="Search" />
        <InputSlot className="pr-3">
          <InputIcon as={SearchIcon} />
        </InputSlot>
      </Input> */
      }
      <Heading size="2xl" className="font-roboto">
        What's new?
      </Heading>
      <HStack space="2xl" className="h-full w-full flex-1">
        <ScrollView
          className="max-w-[900px] flex-1 md:mb-2"
          contentContainerStyle={{
            paddingBottom: isWeb ? 0 : 140,
          }}
          showsVerticalScrollIndicator={false}
        >
          <VStack className="w-full" space="2xl">
            {BlogCards(BLOGS_DATA)}
          </VStack>
        </ScrollView>
        <VStack className="max-w-[500px] hidden lg:flex" space="2xl">
          <Input className="text-center">
            <InputField placeholder="Search" />
            <InputSlot className="pr-3">
              <InputIcon as={SearchIcon} />
            </InputSlot>
          </Input>
          <VStack>
            <ScrollView showsVerticalScrollIndicator={false} className="gap-7">
              <VStack space="md">
                <Heading size="lg">From around the world</Heading>
                <VStack className="h-full" space="md">
                  {UpcomingEvents(WORLD_DATA)}
                </VStack>
              </VStack>
              <VStack space="md" className="mt-5">
                <Heading size="lg">Find creators</Heading>
                <VStack className="h-full" space="md">
                  {MemberActionCards(MEMBERS_DATA)}
                </VStack>
              </VStack>
            </ScrollView>
          </VStack>
        </VStack>
      </HStack>
    </VStack>
  );
};

export const NewsAndFeed = () => {
  return (
    <DashboardLayout title="News Feed" isSidebarVisible={true}>
      <MainContent />
    </DashboardLayout>
  );
};
