import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react-native";

interface MemberData {
  bannerUri: string;
  name: string;
  description: string;
}

const MemberActionCards = (memberData: MemberData[]) => {
  memberData.map((item, index) => {
    return (
      <HStack
        className="p-4 items-center h-full border border-border-300 rounded-xl"
        space="lg"
        key={index}
      >
        <Avatar>
          <Avatar>
            <AvatarFallbackText>
              {" "}
              {item.name?.[0] ?? "User Name"}{" "}
            </AvatarFallbackText>
          </Avatar>
        </Avatar>
        <Button variant="outline" action="secondary" className="p-2">
          <ButtonIcon as={DownloadIcon} />
        </Button>
        <VStack>
          <Text className="font-semibold text-typography-900">
            {" "}
            {item.name}{" "}
          </Text>
          <Text className="line-clamp-1 text-sm"> {item.description} </Text>
        </VStack>
        <Button action="secondary" variant="outline">
          <ButtonText>Follow</ButtonText>
        </Button>
      </HStack>
    );
  });
  return memberData;
};
export default MemberActionCards;
export { MemberData };
