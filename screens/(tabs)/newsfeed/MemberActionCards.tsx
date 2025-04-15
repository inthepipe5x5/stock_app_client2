// import { HStack } from "@/components/ui/hstack";
// import { VStack } from "@/components/ui/vstack";
// import { Text } from "@/components/ui/text";
// import { Avatar, AvatarFallbackText, AvatarImage } from "@/components/ui/avatar";
// import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
// import { DownloadIcon, UserSearch } from "lucide-react-native";
// import defaultSession, { user_households, userProfile } from "@/constants/defaultSession";
// import { useRouter } from "expo-router";
// import { useUserSession } from "@/components/contexts/UserSessionProvider";
// import { Badge } from "@/components/ui/badge";
// import { CheckIcon } from "lucide-react-native";
// import { fakeUserAvatar } from "@/lib/placeholder/avatar";
// import { current } from "tailwindcss/colors";

import { useEffect, useState } from "react";
import { Redirect, RelativePathString, router, useLocalSearchParams, usePathname, useSegments } from "expo-router";
import * as Linking from "expo-linking";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { ThemedView } from "@/components/ThemedView";
import { Database } from "@/lib/supabase/dbTypes";
import InviteUserModal from "@/components/navigation/InviteUserModal";
import { Heading, CopyIcon, Badge, CheckIcon, UserSearch } from "lucide-react-native";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { VStack } from "@/components/ui/vstack";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Pressable } from "@/components/ui/pressable";
import { Appearance, FlatList } from "react-native";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import defaultSession, { session, user_households, userProfile } from "@/constants/defaultSession";
import Colors from "@/constants/Colors";
import { cn } from "@gluestack-ui/nativewind-utils/cn";
// import * as Clipboard from "expo-clipboard";
import { Toast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";
import { Center } from "@/components/ui/center";
import supabase from "@/lib/supabase/supabase";
import { HStack } from "@/components/ui/hstack";
import { Avatar, AvatarImage, AvatarFallbackText } from "@/components/ui/avatar";
import { fakeUserAvatar } from "@/lib/placeholder/avatar";

type MemberData = {
  user: Partial<userProfile> & { user_id: string };
  houseHoldName: string;
  userHousehold: Partial<user_households> & { household_id: string; access_level: string };
}

// const ActionCard = ({
//   data: { [key: string]: any }, canEdit: boolean = true) => {
//   return (
//     <HStack
//       className={`p-4 items-center h-full border rounded-xl ${isCurrentUser ? 'border-green-500 bg-green-100' : 'border-border-300'}`}
//       space="lg"
//       key={index}
//     >
//       <Avatar size="md">
//         <AvatarImage source={{
//           uri: user?.app_metadata?.avatar_url ?? fakeUserAvatar({
//             name: user.name,
//             size: 24,
//             avatarBgColor: "",
//             fontColor: ""
//           })
//         }} />
//         <AvatarFallbackText>
//           {user.name ? user.name : "User Name"}
//         </AvatarFallbackText>
//       </Avatar>
//       <Button
//         variant="outline"
//         action="secondary"
//         className="p-2 hover:outline hover:outline-2 hover:outline-blue-500"
//         disabled={state?.households?.some(household => household.id === userHousehold?.household_id)}
//         onPress={() => { router.push({ pathname: `/(tabs)/(dashboard)/(stacks)/[type].[id]`, params: { type: "user", id: user.user_id } }) }}>
//         <ButtonIcon as={UserSearch} />
//       </Button>
//       <VStack>
//         <Text className="font-semibold text-typography-900">
//           {user.name}
//         </Text>
//         <Text className="line-clamp-1 text-sm">
//           {userHousehold.access_level ?? "guest"}
//         </Text>
//       </VStack>
//       <Badge
//         className={`ml-2 ${userHousehold.access_level === "member" ? 'bg-blue-500' : 'bg-green-500'}`}
//       >
//         <CheckIcon className="text-white" />
//         <Text className="text-white ml-1">
//           {userHousehold.access_level}
//         </Text>
//       </Badge>
//       <Button
//         action="secondary"
//         variant="outline"
//         onPress={handleEditPress}
//         disabled={state?.user?.user_id !== user.user_id && userHousehold.access_level !== "manager"}
//       >
//         <ButtonText>Edit</ButtonText>
//       </Button>
//     </HStack>
//   )
// }
const MemberActionCard = ({
  memberData,
  state,
  currentUser,
  editAccess,
}: {
  memberData: MemberData;
  state: Partial<session>;
  currentUser: Partial<userProfile>;
  editAccess: "member" | "manager" | "guest" | "admin";
}) => {
  const { user, houseHoldName, userHousehold } = memberData;

  const isCurrentUser = currentUser?.user_id === user.user_id;

  let canEdit: boolean = false;

  switch (editAccess) {
    case "admin":
    case "manager":
      canEdit = true;
      break;
    case "member":
    case "guest":
      canEdit =
        userHousehold.access_level === editAccess &&
        userHousehold.user_id === currentUser?.user_id;
      break;
    default:
      canEdit = false;
      break;
  }

  const handleEditPress = () => {
    router.push(`/household.${userHousehold.household_id}.users.edit`);
  };

  return (
    <HStack
      className={`p-4 items-center h-full border rounded-xl ${isCurrentUser ? "border-green-500 bg-green-100" : "border-border-300"
        }`}
      space="lg"
    >
      <Avatar size="md">
        <AvatarImage
          source={{
            uri:
              user?.app_metadata?.avatar_url ??
              fakeUserAvatar({
                name: user.name,
                size: 24,
                avatarBgColor: "",
                fontColor: "",
              }),
          }}
        />
        <AvatarFallbackText>
          {user.name ? user.name : "User Name"}
        </AvatarFallbackText>
      </Avatar>
      <Button
        variant="outline"
        action="secondary"
        className="p-2 hover:outline hover:outline-2 hover:outline-blue-500"
        disabled={state?.households?.some(
          (household) => household.id === userHousehold?.household_id
        )}
        onPress={() => {
          router.push({
            pathname: `/(tabs)/(search)/profiles/[user_id]`,
            params: { type: "user", id: user.user_id },
          });
        }}
      >
        <ButtonIcon as={UserSearch} />
      </Button>
      <VStack>
        <Text className="font-semibold text-typography-900">{user.name}</Text>
        <Text className="line-clamp-1 text-sm">
          {userHousehold.access_level ?? "guest"}
        </Text>
      </VStack>
      <Badge
        className={`ml-2 ${userHousehold.access_level === "member"
          ? "bg-blue-500"
          : "bg-green-500"
          }`}
      >
        <CheckIcon className="text-white" />
        <Text className="text-white ml-1">{userHousehold.access_level}</Text>
      </Badge>
      <Button
        action="secondary"
        variant="outline"
        onPress={handleEditPress}
        disabled={
          state?.user?.user_id !== user.user_id &&
          userHousehold.access_level !== "manager"
        }
      >
        <ButtonText>Edit</ButtonText>
      </Button>
    </HStack>
  );
};

const MemberActionCards = (
  memberData: MemberData[],
  currentUser: Partial<userProfile>,
  editAccess: "member" | "manager" | "guest" | "admin"
) => {
  return memberData.map((item, index) => (
    <MemberActionCard
      key={index}
      memberData={item}
      currentUser={currentUser}
      editAccess={editAccess}
    />
  ));
};



export const MemberActionCardList = (
  memberData: MemberData[],
  currentUser: Partial<userProfile>,
  editAccess: "member" | "manager" | "guest" | "admin"
) => {


  return memberData.map((item, index) => {
    const { user, houseHoldName, userHousehold } = item;

    const isCurrentUser = currentUser?.user_id === user.user_id;

    let canEdit: boolean = false;

    //  editAccess === "member" 
    //  editAccess === "manager" 
    //  editAccess === "admin" //false 
    //  

    switch (editAccess) {
      //admin & manager can edit all profiles
      case 'admin':
      case "manager":
        canEdit = true;
      //members and guests can only edit their own profile
      case "member":
      case 'guest':
        canEdit = userHousehold.access_level === editAccess && userHousehold.user_id === currentUser; //guests can only edit their own access level
        break;
      //deny editAccess
      default:
        canEdit = false;
        break;
    };
    const handleEditPress = () => {
      router.push(`/household.${userHousehold.household_id}.users.edit`);
    };

    return (
      <HStack
        className={`p-4 items-center h-full border rounded-xl ${isCurrentUser ? 'border-green-500 bg-green-100' : 'border-border-300'}`}
        space="lg"
        key={index}
      >
        <Avatar size="md">
          <AvatarImage source={{
            uri: user?.app_metadata?.avatar_url ?? fakeUserAvatar({
              name: user.name,
              size: 24,
              avatarBgColor: "",
              fontColor: ""
            })
          }} />
          <AvatarFallbackText>
            {user.name ? user.name : "User Name"}
          </AvatarFallbackText>
        </Avatar>
        <Button
          variant="outline"
          action="secondary"
          className="p-2 hover:outline hover:outline-2 hover:outline-blue-500"
          disabled={state?.households?.some(household => household.id === userHousehold?.household_id)}
          onPress={() => { router.push({ pathname: `/(tabs)/(dashboard)/(stacks)/[type].[id]`, params: { type: "user", id: user.user_id } }) }}>
          <ButtonIcon as={UserSearch} />
        </Button>
        <VStack>
          <Text className="font-semibold text-typography-900">
            {user.name}
          </Text>
          <Text className="line-clamp-1 text-sm">
            {userHousehold.access_level ?? "guest"}
          </Text>
        </VStack>
        <Badge
          className={`ml-2 ${userHousehold.access_level === "member" ? 'bg-blue-500' : 'bg-green-500'}`}
        >
          <CheckIcon className="text-white" />
          <Text className="text-white ml-1">
            {userHousehold.access_level}
          </Text>
        </Badge>
        <Button
          action="secondary"
          variant="outline"
          onPress={handleEditPress}
          disabled={state?.user?.user_id !== user.user_id && userHousehold.access_level !== "manager"}
        >
          <ButtonText>Edit</ButtonText>
        </Button>
      </HStack>
    );
  });
};




export default MemberActionCards;
export { MemberData };


export type HouseholdMember = {
  user: {
    user_id: string;
    email: string;
    name: string;
    country?: string;
    state?: string;
    city?: string;
  };
  userHousehold: {
    household_id: string;
    access_level: string;
    invited_by?: string;
    invited_at?: string;
    invite_accepted?: boolean;
    invite_expires_at?: string;
  };
  household: {
    description?: string;
    name: string;
  };
};

export const HouseholdMemberList = ({
  household_id,
  currentUser,
  onSelect,
}: {
  household_id?: string | null | undefined;
  currentUser?: Partial<userProfile> | null | undefined;
  onSelect: (email: string) => void;
}) => {
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const colorScheme = Appearance.getColorScheme() ?? "light";
  const { data: householdMembers, isLoading } = useQuery({
    queryKey: ["householdMembers", { household_id, page }],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_households_view")
        .select("*")
        .eq("household_id", household_id)
        .order("name", { ascending: true })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) {
        console.error("Error fetching household members:", error);
        throw error;
      }

      return data.map((item) => ({
        user: {
          user_id: item.user_id,
          email: item.email,
          name: item.name,
          country: item.country,
          state: item.state,
          city: item.city,
        },
        userHousehold: {
          household_id: item.household_id,
          access_level: item.access_level,
          invited_by: item.invited_by,
          invited_at: item.invited_at,
          invite_accepted: item.invite_accepted,
          invite_expires_at: item.invite_expires_at,
        },
        household: {
          description: item.description,
          name: item.name,
        },
      })) as HouseholdMember[];
    },
    enabled: !!household_id,
    staleTime: Infinity,
  });

  if (isLoading) {
    return (
      <HStack className="gap-2">
        <Text className="text-typography-500">Loading members...</Text>
        <Spinner size="small" color={'#3d1e00'} />
      </HStack>
    );
  }

  if (!!!household_id || !!!currentUser) {
    return <Redirect
      href={{
        pathname: '/+not-found' as RelativePathString, params: {
          message: "Household ID is required to fetch members.",
        }
      }} />;
  }

  if (!householdMembers || householdMembers.length === 0) {
    return (
      <VStack className="gap-2">
        <Text className="text-typography-error">
          No members found in this household.
        </Text>
      </VStack>
    );
  }

  const handlePress = (email: string) => {
    if (email) {
      onSelect(email);
    }
  };

  return (
    <VStack className="gap-4">
      <VStack className="gap-2">
        {householdMembers.map((member, index) => {
          const { user, userHousehold } = member;
          const isCurrentUser = currentUser?.user_id === user.user_id;

          return (
            <Pressable
              key={index}
              className={cn(
                `gap-2 flex-row items-center p-2 rounded-md ${isCurrentUser
                  ? "bg-background-success"
                  : "hover:bg-background-50"
                }`,
                colorScheme === "dark"
                  ? "text-typography-50 bg-background-800"
                  : "text-typography-950 bg-slate-100"
              )}
              onPress={() => handlePress(user?.email as string)}
            >
              <Text className="text-typography-600">
                {`${user.name} (${user.email})`}
              </Text>
            </Pressable>
          );
        })}
      </VStack>
      <VStack className="flex-row justify-between">
        <Button
          onPress={() => setPage((prev) => Math.max(prev - 1, 0))}
          disabled={page === 0}
          variant="outline"
          size="sm"
        >
          Previous
        </Button>
        <Button
          onPress={() => setPage((prev) => prev + 1)}
          disabled={householdMembers.length < pageSize}
          variant="outline"
          size="sm"
        >
          Next
        </Button>
      </VStack>
    </VStack>
  );
};