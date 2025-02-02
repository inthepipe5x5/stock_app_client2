/*
GLUESTACK PROFILE TEMPLATE
*/
import React, { useState } from "react";
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
const userData: UserStats[] = [
  {
    householdMembers: "8",
    householdMembersText: "Household Members",
    tasksDue: "5",
    tasksDueText: "Tasks Due",
    inventoriesManaged: "40",
    inventoriesManagedText: "Inventories",
    products: "346",
    productsText: "Products",
  },
];

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
const MainContent = () => {
  const [showModal, setShowModal] = useState(false);

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
            <Image
              source={require("@/screens/(tabs)/profile/assets/image2.png")} //TODO: get a different profile background
              height={100}
              width={100}
              alt="Banner Image"
              // contentFit="cover"//TODO: fix this prop typing error later
            />
          </Box>
          <HStack className="absolute pt-6 px-10 hidden md:flex">
            <Link href={"/(tabs)/(dashboard)/index"}>
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
                  Alexander Leslie
                </Text>
                <Text className="font-roboto text-sm text-typograpphy-700">
                  United States
                </Text>
              </VStack>
              <>
                {userData.map((item, index) => {
                  return (
                    <HStack className="items-center gap-1" key={index}>
                      <VStack className="py-3 px-4 items-center" space="xs">
                        <Text className="text-dark font-roboto font-semibold justify-center items-center">
                          {item.householdMembers}
                        </Text>
                        <Text className="text-dark text-xs font-roboto">
                          {item.householdMembersText}
                        </Text>
                      </VStack>
                      <Divider orientation="vertical" className="h-10" />
                      <VStack className="py-3 px-4 items-center" space="xs">
                        <Text className="text-dark font-roboto font-semibold">
                          {item.tasksDue}
                        </Text>
                        <Text className="text-dark text-xs font-roboto">
                          {item.tasksDueText}
                        </Text>
                      </VStack>
                      <Divider orientation="vertical" className="h-10" />
                      <VStack className="py-3 px-4 items-center" space="xs">
                        <Text className="text-dark font-roboto font-semibold">
                          {item.inventoriesManaged}
                        </Text>
                        <Text className="text-dark text-xs font-roboto">
                          {item.inventoriesManagedText}
                        </Text>
                      </VStack>
                      <Divider orientation="vertical" className="h-10" />
                      <VStack className="py-3 px-4 items-center" space="xs">
                        <Text className="text-dark font-roboto font-semibold">
                          {item.products}
                        </Text>
                        <Text className="text-dark text-xs font-roboto">
                          {item.productsText}
                        </Text>
                      </VStack>
                    </HStack>
                  );
                })}
              </>
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
      </ScrollView>
    </VStack>
  );
};

export const Profile = () => {
  return (
    <DashboardLayout //isSidebarVisible={true}
    >
      <MainContent />
    </DashboardLayout>
  );
};
