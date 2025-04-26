import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { DownloadIcon, SearchIcon } from "@/components/ui/icon";
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
import React, { Suspense } from "react";
import { Platform, useWindowDimensions } from "react-native";
import { StyleSheet } from "react-native";
import useViewPort from "@/hooks/useViewPort";
import { cn } from "@gluestack-ui/nativewind-utils/cn";
import { TaskHelper } from "@/lib/supabase/ResourceHelper";
import { Database } from "@/lib/supabase/dbTypes";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import defaultSession from "@/constants/defaultSession";
import { UserCircle } from "lucide-react-native";
import supabase from "@/lib/supabase/supabase";
import { Spinner } from "@/components/ui/spinner";

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

const EmptyList = ({
  message = "No results found",
  source }:
  {
    message: string,
    source?: string
  }) => {
  return (
    <VStack className="h-full w-full" space="2xl">
      <Box className="h-1/2 w-full">
        <Image
          source={source ?? require("@/assets/auth/forget.png")}
          contentFit="cover"
          className="h-full w-full rounded-lg"
        />
      </Box>
      <Text className="text-center text-xl font-semibold">
        {message ?? "No new updates yet!"}
      </Text>
    </VStack>
  );
}
//secondary
export const NewTaskAssignment = ({
  currUserId,
  taskData,
  taskAssignment,
  householdId,
  mediaSource,
  mediaText,
}: {
  currUserId: string;
  householdId: string;
  taskData: Partial<Database["public"]["Tables"]["tasks"]["Row"]>;
  taskAssignment: Partial<Database["public"]["Tables"]["task_assignments"]["Row"]>;
  mediaSource?: string; //media source
  mediaText?: string; //media text
}) => {
  // const helper = new TaskHelper((taskData ?? {}), (taskAssignment ?? {}));
  const qc = useQueryClient();
  const userHousehold = qc.getQueryData(["user_households", { household_id: householdId }]);
  const selfAssign = taskAssignment?.assigned_by === (taskAssignment?.user_id ?? currUserId);

  if (!userHousehold) {
    console.error("No user household data found prefetched by queryClient");
  };

  const taskAssignmentData = useQuery({
    queryKey: ["taskAssignment", { user_id: currUserId }],
    queryFn: async () => {
      const { data, error } = await supabase.from('task_assignments')
        .select("task_assignments(*), tasks(*), profiles(name, description, avatar_url, user_id), products(id, product_name, photo_url)")
        .eq("task_assignments.user_id", currUserId) //assigned to current user
        // .or('profiles.user_id=task_assignments.assigned_by') //OR assigned by another user
        .neq('profiles.user_id', currUserId) //not assigned by current user
        .eq('profiles.user_id=task_assignments.assigned_by', true) //assigned by another user
        .range(new Date().getTime(), new Date(taskAssignment?.created_at ?? Date.now()).getTime()) //select the newly created task assignments ie. done within 0 seconds to 1 hour ago
        .order("created_at", { ascending: false })
        .limit(10)
        .single();
      if (error) {
        console.error("Error fetching task assignment data:", error);
        throw error;
      }
      return data;
    },
    // initialData: taskAssignment,
    enabled: !!taskData && !!taskAssignment,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1,
    retryDelay: 1000,
  })

  if (taskAssignmentData.isLoading) {
    return (
      <VStack className="h-full w-full" space="2xl">
        <HStack className='flex-grow flex-1 items-center justify-center'>
          <Text className="text-center text-xl font-semibold">
            Loading...
          </Text>
          <Spinner className="h-10 w-10" />
        </HStack>
      </VStack>
    )
  }

  //render nothing if no data
  if (!!!taskAssignmentData.data || taskAssignmentData.isError) {
    console.error("Error fetching task assignment data:", taskAssignmentData?.error ?? "No data");
    return null;
  }

  const currentTask = taskAssignmentData?.data?.tasks?.[0] ?? null; //should be first task
  const timeStampNumberInSeconds = new Date(taskAssignmentData?.data?.task_assignments?.[0]?.updated_at)?.getUTCSeconds() - new Date(taskAssignmentData?.data?.task_assignments?.[0]?.created_at)?.getUTCSeconds()

  const timeStampDescriptionPrefix = timeStampNumberInSeconds > 0 ? "Updated" : "Created";
  const timeStampDescriptionSuffix = timeStampNumberInSeconds === 0 ? "just now" : `${Math.floor(
    (Date.now() - new Date(taskAssignmentData?.data?.task_assignments?.[0]?.created_at).getTime()) / 60000
  )} minutes ago`;

  const assigningPerson = (taskAssignmentData?.data?.profiles ?? [])?.[0]
  const relatedProduct = (taskAssignmentData?.data?.products ?? []).filter((product) => { return product?.id === taskAssignmentData?.data?.tasks })?.[0] ?? null;

  const FallbackMedia = () => {

    return (
      <Avatar className="h-12 w-12">
        <Image
          source={{
            uri: taskAssignmentData?.data?.profiles?.[0]?.avatar_url
              ?? relatedProduct?.photo_url
          }}
          className="h-full w-full rounded-full"
        />
        <AvatarFallbackText>{ }</AvatarFallbackText>
      </Avatar>
    )
  }

  return (
    // <HStack className="w-full h-16 bg-white rounded-lg shadow-sm">
    <>
      <VStack space="md">
        <HStack className="w-full" space="2xl">
          {mediaSource ?
            (<Suspense fallback={<UserCircle className="h-12 w-12" />}>
              <Avatar className="h-12 w-12">
                <Image
                  source={{ uri: mediaSource }}
                  className="h-full w-full rounded-full"
                />
                <AvatarFallbackText>{mediaText ?? "Related Product"}</AvatarFallbackText>
              </Avatar>
            </Suspense>) :
            !!taskAssignmentData?.data ?
              <Suspense fallback={<UserCircle className="h-12 w-12" />}>
                <Avatar className="h-12 w-12">
                  <Image
                    source={{
                      uri: !selfAssign && assigningPerson?.avatar_url ? assigningPerson?.avatar_url :
                        taskAssignmentData?.data?.products?.[0]?.photo_url
                    }}
                    className="h-full w-full rounded-full"
                  />
                  <AvatarFallbackText>{mediaText ?? "Related Product"}</AvatarFallbackText>
                </Avatar>
              </Suspense> : null
          }
          <VStack space="xs">
            <Text className="text-base font-semibold"> {selfAssign && assigningPerson?.name ? "New task for you" : `${assigningPerson?.name ?? "Someone in your household"} has assigned you a new task!`} </Text>

            <Text
              className={cn("text-sm font-normal",
                Math.floor(timeStampNumberInSeconds * 60) >= 10 ? "text-green-500" : "text-gray-500"
              )}
            >
              {`${timeStampDescriptionPrefix} ${timeStampDescriptionSuffix}`}
            </Text>

          </VStack>
        </HStack>
        <Text className="text-base font-normal">
          {currentTask?.description ?? `Check on ${relatedProduct?.product_name}` ?? "No description available"}
        </Text>
      </VStack>
    </>
  )
}

const HouseholdNewsFeed = ({
  mainTitle,
  secondaryTitle,
  tertiaryTitle,
  primarySlot,
  secondarySlot,
  tertiarySlot }: {
    mainTitle: string, primaryTitle: string, secondaryTitle: string, tertiaryTitle: string,
    primarySlot: React.ReactNode,
    secondarySlot: React.ReactNode,
    tertiarySlot: React.ReactNode
  }) => {
  const dimensions = useWindowDimensions();
  const { orientation, screenSizeCategory, safeBottomPadding } = useViewPort();


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
        {mainTitle ?? " What's new?"}
      </Heading>
      <HStack space="2xl" className="h-full w-full flex-1">
        <ScrollView
          className="max-w-[900px] flex-1 md:mb-2"
          contentContainerStyle={{
            paddingBottom: safeBottomPadding
          }}
          showsVerticalScrollIndicator={false}
        >
          <VStack className="w-full flex-1 md:flex-2" space="2xl">
            {/* {BlogCards(BLOGS_DATA)} */}
            {primarySlot ?? <EmptyList message={"No results found!"} />}
          </VStack>
        </ScrollView>
        <VStack className="max-w-[500px] hidden lg:flex" space="2xl">
          <Input className="text-center md:hidden border-border-100">
            <InputField placeholder="Search" />
            <InputSlot className="pr-3">
              <InputIcon as={SearchIcon} />
            </InputSlot>
          </Input>

          <VStack>
            <ScrollView
              showsVerticalScrollIndicator={false}
              className={cn("gap-7",
                screenSizeCategory === "sm" ? "mt-5" : "mt-0"
              )}>
              <VStack space="md">
                <Heading size="lg">
                  {secondaryTitle ?? "Related Content"}
                </Heading>
                <VStack className="h-full" space="md">
                  {/* {UpcomingEvents(WORLD_DATA)} */}
                  {secondarySlot ?? <EmptyList message={"No results found!"} />}
                </VStack>
              </VStack>

              {
                !!tertiarySlot ? (<VStack space="md" className="mt-5">
                  <Heading size="lg">
                    {tertiaryTitle}
                  </Heading>
                  <VStack className="h-full" space="md">
                    {/* {MemberActionCards(MEMBERS_DATA)} */}
                    {tertiarySlot ?? <EmptyList message={"No results found!"} />}
                  </VStack>
                </VStack>) :
                  null
              }
            </ScrollView>
          </VStack>
        </VStack>
      </HStack>
    </VStack>
  );
};

export const NewsAndFeed = () => {
  const state = useUserSession().state ?? defaultSession;
  const { household_id: householdId } = useLocalSearchParams();
  const qc = useQueryClient();
  const userHousehold = qc.getQueryData(["userHousehold", householdId]);
  const taskAssignment = qc.getQueryData(["taskAssignment", { user_id: state?.user?.user_id }]);

  if (!userHousehold) {
    return (
      <DashboardLayout
        title="News Feed"
        isSidebarVisible={false}>
        <EmptyList message="No results found!" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="News Feed" isSidebarVisible={true}>
      {/* <HouseholdNewsFeed /> */}
    </DashboardLayout>
  );
};
