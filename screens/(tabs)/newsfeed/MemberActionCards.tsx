import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Avatar, AvatarFallbackText, AvatarImage } from "@/components/ui/avatar";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { DownloadIcon, UserSearch } from "lucide-react-native";
import defaultSession, { user_households, userProfile } from "@/constants/defaultSession";
import { SkeletonText } from "@/components/ui/skeleton";
import { useRouter } from "expo-router";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import { Badge } from "@/components/ui/badge";
import { CheckIcon } from "lucide-react-native";
import { fakeUserAvatar } from "@/lib/placeholder/avatar";

type MemberData = {
  user: userProfile;
  houseHoldName: string;
  userHousehold: user_households;
}



const MemberActionCards = (memberData: MemberData[], editAccess: "member" | "manager" | "guest" | "admin") => {
  const globalContext = useUserSession();
  const { state } = globalContext || defaultSession;
  const router = useRouter();

  return memberData.map((item, index) => {
    const { user, houseHoldName, userHousehold } = item;

    const isCurrentUser = user.user_id === state.user?.user_id;

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
