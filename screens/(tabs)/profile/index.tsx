/*
GLUESTACK PROFILE TEMPLATE
*/
import React, { Suspense, useState } from "react";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import {
  ChevronRightIcon,
  EditIcon,
  Icon,
  PhoneIcon,
  SettingsIcon,
} from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { type LucideIcon } from "lucide-react-native";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
// import { Image } from "expo-image";
import { Image } from "@/components/ui/image";
import { ScrollView } from "@/components/ui/scroll-view";
import { Avatar, AvatarBadge, AvatarImage } from "@/components/ui/avatar";
import { ProfileIcon } from "@/screens/(tabs)/profile/assets/icons/profile";
import { Center } from "@/components/ui/center";
import { SubscriptionIcon } from "@/screens/(tabs)/profile/assets/icons/subscription";
import { DownloadIcon } from "@/screens/(tabs)/profile/assets/icons/download";
import { FaqIcon } from "@/screens/(tabs)/profile/assets/icons/faq";
import { NewsBlogIcon } from "@/screens/(tabs)/profile/assets/icons/news-blog";
import { GlobeIcon } from "@/screens/(tabs)/profile/assets/icons/globe";
import { InboxIcon } from "@/screens/(tabs)/profile/assets/icons/inbox";
import { Divider } from "@/components/ui/divider";
import { isWeb } from "@gluestack-ui/nativewind-utils/IsWeb";
import DashboardLayout from "@/screens/_layout";
import { Link } from "@/components/ui/link";
import ModalComponent from "./ModalComponent";
import { Spinner } from "@/components/ui/spinner";
import defaultSession, { userProfile } from "@/constants/defaultSession";
import { fakeUserAvatar } from "@/lib/placeholder/avatar";
import useSupabaseSession from "@/hooks/useSupabaseSession";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import { Redirect, useLocalSearchParams, useSegments } from "expo-router";
import supabase from "@/lib/supabase/supabase";
import { useQuery } from "@tanstack/react-query";
import { current } from "tailwindcss/colors";

type Icons = {
  iconName: LucideIcon | typeof Icon;
  iconText: string;
};
const SettingsList: Icons[] = [
  {
    iconName: ProfileIcon,
    iconText: "Profile",
  },
  {
    iconName: SettingsIcon,
    iconText: "Preferences",
  },
  {
    iconName: SubscriptionIcon,
    iconText: "Subscription",
  },
];
const ResourcesList: Icons[] = [
  {
    iconName: DownloadIcon,
    iconText: "Downloads",
  },
  {
    iconName: FaqIcon,
    iconText: "FAQs",
  },
  {
    iconName: NewsBlogIcon,
    iconText: "News & Blogs",
  },
];

interface UserStats {
  householdMembers: string;
  householdMembersText: string;
  tasksDue: string;
  tasksDueText: string;
  inventoriesManaged: string;
  inventoriesManagedText: string;
  products: string;
  productsText: string;
}
// const userData: UserStats[] = [
//   {
//     householdMembers: "8",
//     householdMembersText: "Household Members",
//     tasksDue: "5",
//     tasksDueText: "Tasks Due",
//     inventoriesManaged: "40",
//     inventoriesManagedText: "Inventories",
//     products: "346",
//     productsText: "Products",
//   },
// ];

interface AccountCardType {
  iconName: LucideIcon | typeof Icon;
  subText: string;
  endIcon: LucideIcon | typeof Icon | any; //TODO: fix this typing later
}
const accountData: AccountCardType[] = [
  {
    iconName: InboxIcon,
    subText: "Settings",
    endIcon: ChevronRightIcon,
  },
  {
    iconName: GlobeIcon,
    subText: "Notifications",
    endIcon: ChevronRightIcon,
  },
  {
    iconName: PhoneIcon,
    subText: "Rewards",
    endIcon: ChevronRightIcon,
  },
];
const MainContent = (
  user: { [key: string]: any },
  household: { [key: string]: any },
  currentUser: boolean
) => {
  const [showModal, setShowModal] = useState(false);

  const userData = useQuery({
    queryKey: ["userStats", { user_id: user.user_id }],
    queryFn: async () => {
      const [householdMembers, tasksDue, productsAndInventories] = await Promise.all([
        // Fetch household members
        supabase
          .from("user_households")
          .select("*")
          .eq("household_id", household.id),

        // Fetch active tasks due
        supabase
          .from("task_assignments")
          .select("*,tasks(task_id).*")
          .eq("assigned_to", user.user_id)
          .not("tasks.draft_status", "eq", "draft")
          .not("completion_status", "in", ['completed', 'archived'])
          .limit(100)
          .order("due_date", { ascending: false }),

        // Fetch inventories managed
        supabase
          .from("inventories")
          .select("*, products(id).*")
          .eq("inventories.household_id", household.id)
          .order('inventories.category', { ascending: true })
      ])

      return [
        {
          householdMembers: householdMembers.data,
          householdMemberCount: householdMembers.data?.length ?? 0,
          // householdMembersText: "Household Members",
          tasks: tasksDue.data,
          tasksDue: tasksDue.data?.length ?? 0,
          productsAndInventories: productsAndInventories.data,
          // tasksDueText: "Tasks Due",
          // inventoriesManaged: inventoriesManaged.data?.length ?? 0,
          // inventoriesManagedText: "Inventories",
          // products: products.data?.length ?? 0,
          // productsText: "Products",
        },
      ];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return (
    <VStack className="h-full w-full mb-16 md:mb-0">
      <ModalComponent showModal={showModal} setShowModal={setShowModal} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: isWeb ? 0 : 160,
          flexGrow: 1,
        }}
      >
        <VStack className="h-full w-full pb-8" space="2xl">
          <Box className="relative w-full md:h-[478px] h-[380px]">
            <Suspense fallback={<Spinner />}>
              <Image
                source={require(user?.avatar_photo ?? fakeUserAvatar({
                  name: user.name,
                  size: 100,
                }))}
                height={100}
                width={100}
                alt="Banner Image"
              // contentFit="cover"//TODO: fix this prop typing error later
              />
            </Suspense>
          </Box>
          <HStack className="absolute pt-6 px-10 hidden md:flex">
            <Link href={{
              pathname: "/(tabs)/(search)/households/[household_id",
              params: {
                household_id: household.id
              }
            }}>
              <Text className="text-typography-900 font-roboto">Home</Text>
            </Link>
            &gt; {` `}
            <Text className="font-semibold text-typography-900 ">Profile</Text>
          </HStack>
          <Center className="absolute md:mt-14 mt-6 w-full md:px-10 md:pt-6 pb-4">
            <VStack space="lg" className="items-center">
              <Avatar size="2xl" className="bg-primary-600">
                <AvatarImage
                  alt="Profile Image"
                  height={100}
                  width={100}
                  source={require("@/assets/image.png")}
                />
                <AvatarBadge />
              </Avatar>
              <VStack className="gap-1 w-full items-center">
                <Text size="2xl" className="font-roboto text-dark">
                  {user.name} - {household.name}
                </Text>
                <Text className="font-roboto text-sm text-typograpphy-700">
                  {user.email}
                </Text>
              </VStack>
              <>
                {
                  !!userData.data ? (
                    <HStack className="items-center gap-1">
                      <VStack className="py-3 px-4 items-center" space="xs">
                        <Text className="text-dark font-roboto font-semibold justify-center items-center">
                          {userData.data.householdMembers}
                        </Text>
                        <Text className="text-dark text-xs font-roboto">
                          {userData.data.householdMembersText}
                        </Text>
                      </VStack>
                      <Divider orientation="vertical" className="h-10" />
                      <VStack className="py-3 px-4 items-center" space="xs">
                        <Text className="text-dark font-roboto font-semibold">
                          {userData.data.tasksDue.length ?? 0}
                        </Text>
                        <Text className="text-dark text-xs font-roboto">
                          {/* {userData.data.tasksDueText} */} Active household tasks
                        </Text>
                      </VStack>
                      <Divider orientation="vertical" className="h-10" />
                      <VStack className="py-3 px-4 items-center" space="xs">
                        <Text className="text-dark font-roboto font-semibold">
                          {userData.data.productsAndInventories?.inventoriesManaged.length ?? 0}
                        </Text>
                        <Text className="text-dark text-xs font-roboto">
                          Products and Inventories
                        </Text>
                      </VStack>
                      <Divider orientation="vertical" className="h-10" />
                      <VStack className="py-3 px-4 items-center" space="xs">
                        <Text className="text-dark font-roboto font-semibold">
                          {userData.data.productsAndInventories?.products ?? 0}
                        </Text>
                        <Text className="text-dark text-xs font-roboto">
                          {userData.data.productsText}
                        </Text>
                      </VStack>
                    </HStack>
                  );

              </>
                : null}
              <Button
                variant="outline"
                action="secondary"
                onPress={() => setShowModal(true)}
                className="gap-3 relative"
              >
                <ButtonText className="text-dark">Edit Profile</ButtonText>
                <ButtonIcon as={EditIcon} />
              </Button>
            </VStack>
          </Center>
          <VStack className="mx-6" space="2xl">
            <HStack
              className="py-5 px-6 border rounded-xl border-border-300 justify-between items-center"
              space="2xl"
            >
              <HStack space="2xl" className="items-center">
                <Box className="md:h-20 md:w-20 h-10 w-10">
                  <Image
                    source={require("@/screens/(tabs)/profile/assets/image1.png")}
                    height={100}
                    width={100}
                    alt="Promo Image"
                  />
                </Box>
                <VStack>
                  <Text className="text-typography-900 text-lg" size="lg">
                    Invite & get rewards
                  </Text>
                  <Text className="font-roboto text-sm md:text-[16px]">
                    Your code r45dAsdeK8
                  </Text>
                </VStack>
              </HStack>
              <Button className="p-0 md:py-2 md:px-4 bg-background-0 active:bg-background-0 md:bg-background-900 ">
                <ButtonText className="md:text-typography-0 text-typography-800 text-sm">
                  Invite
                </ButtonText>
              </Button>
            </HStack>
            <Heading className="font-roboto" size="xl">
              Account
            </Heading>
            <VStack className="py-2 px-4 border rounded-xl border-border-300 justify-between items-center">
              {accountData.map((item, index) => {
                return (
                  <React.Fragment key={index}>
                    <HStack
                      space="2xl"
                      className="justify-between items-center w-full flex-1 py-3 px-2"
                    >
                      <HStack className="items-center" space="md">
                        <Icon as={item.iconName} className="stroke-[#747474]" />
                        <Text size="lg">{item.subText}</Text>
                      </HStack>
                      <Icon as={item.endIcon} />
                    </HStack>
                    {accountData.length - 1 !== index && (
                      <Divider className="my-1" />
                    )}
                  </React.Fragment>
                );
              })}
            </VStack>
            <Heading className="font-roboto" size="xl">
              Preferences
            </Heading>
            <VStack className="py-2 px-4 border rounded-xl border-border-300 justify-between items-center">
              {accountData.map((item, index) => {
                return (
                  <React.Fragment key={index}>
                    <HStack
                      space="2xl"
                      className="justify-between items-center w-full flex-1 py-3 px-2"
                      key={index}
                    >
                      <HStack className="items-center" space="md">
                        <Icon as={item.iconName} className="stroke-[#747474]" />
                        <Text size="lg">{item.subText}</Text>
                      </HStack>
                      <Icon as={item.endIcon} />
                    </HStack>
                    {accountData.length - 1 !== index && (
                      <Divider className="my-1" />
                    )}
                  </React.Fragment>
                );
              })}
            </VStack>
          </VStack>
        </VStack>
      </ScrollView >
    </VStack >
  );
};

export const Profile = () => {

  const globalContext = useUserSession();
  const { state } = globalContext || defaultSession;
  const user = state?.user ?? null;
  const params = useLocalSearchParams();
  const [data, setData] = useState<any>(null);
  const segments = useSegments();
  //if segments contains 'profile' => get the user_id from state 
  const currentUser = !!segments.find((segment) => segment.includes("profile"))
  const user_id = currentUser ? state?.user?.user_id : params?.user_id[0] ?? null;

  const { data: dbData, isLoading, isFetched } = useQuery({
    queryKey: ["user_id", { user_id }],
    queryFn: async () => {
      const [profile, userHouseholds] = await Promise.all([
        supabase
          .from("profile")
          .select("*")
          .eq("user_id", user_id)
          .single(),
        supabase
          .from("user_households")
          .select("*")
          .eq("user_id", user_id)
          .neq('access_level', 'guest'),
      ]);

      if ('error' in profile || 'error' in userHouseholds) {
        let error = profile.error || userHouseholds.error;
        console.error("Error fetching user households:", error);
        return null;
      }
      return {
        profile: profile,
        userHouseholds: (userHouseholds?.data ?? userHouseholds ?? []).reduce((acc: Record<string, any>, curr: { household_id: string }) => {
          acc[curr.household_id] = curr;
          return acc;
        }, {}),
      };

    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Check if households in state do not match with the households in dbSessionData => redirect to not found page
  if (state?.households && dbData?.userHouseholds) {
    const stateHouseholdIds = Object.keys(state.households);
    const dbHouseholdIds = Object.keys(dbData.userHouseholds);

    const isMismatch = stateHouseholdIds.some(
      (id) => !dbHouseholdIds.includes(id)
    );

    if (isMismatch) {
      return <Redirect to="/+notfound" />;
    }
  }

  return (
    <DashboardLayout //isSidebarVisible={true}
    >
      <MainContent
        user={dbData?.profile}
        household={Object.entries(dbData?.userHouseholds)[0]}
        currentUser={currentUser as boolean}
      />
    </DashboardLayout>
  );
};
