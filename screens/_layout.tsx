import { useState } from "react";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
// import { Image } from "expo-image";
import { ScrollView } from "@/components/ui/scroll-view";
import { SafeAreaView } from "@/components/ui/safe-area-view";

import { Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import ConfirmClose from "@/components/navigation/ConfirmClose";
import { useToast } from "@/components/ui/toast";
import { } from "@/components/navigation/NavigationalDrawer"

type DashboardLayoutProps = {
  title?: string;
  isSidebarVisible?: boolean;
  children?: React.ReactNode;
  dismissToURL?: string;
};

//DashboardLayout component - main content layout used in dashboard screens, newsfeed screens, profile screens
//This layout has a sidebar, header and children components
const DashboardLayout = (props: DashboardLayoutProps) => {
  const [confirmCloseModal, setConfirmCloseModal] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(
    props.isSidebarVisible || false
  );
  // const router = useRouter();
  const toast = useToast();

  function toggleSidebar() {
    setIsSidebarVisible(!isSidebarVisible);
  }
  // router.on("routeChangeStart", (url) => {
  //   if (url === "/(auth)/(signin)/authenticate") {
  //     setConfirmCloseModal(true);
  //   }
  // }

  return (
    <SafeAreaView className="w-full h-full">
      {/* {Platform.OS === "android" ? (
        <StatusBar translucent />
      ) : (
        <StatusBar style="dark" />
      )} */}
      <ScrollView
        className="w-full h-full"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <VStack className="h-full w-full bg-background-0">
          <VStack className="h-full w-full">
            <HStack className="h-full w-full">
              <Box className="hidden md:flex h-full">
                {confirmCloseModal ?
                  <ConfirmClose dismissToURL="/(auth)/(signin)/authenticate"
                    visible={confirmCloseModal}
                    title="Session expired" description="Please sign in again" /> : null
                }
                {/* {isSidebarVisible ? <Navigation iconList={SideBarContentList} /> : null} */}
              </Box>
              <VStack className="w-full flex-1">{props.children}</VStack>
            </HStack>
          </VStack>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DashboardLayout;
