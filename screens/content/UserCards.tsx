import { Avatar, AvatarFallbackText, AvatarImage } from "@/components/ui/avatar";
import { Box } from "@/components/ui/box";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { SkeletonText } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { access_level, userProfile } from "@/constants/defaultSession";
import { fakeUserAvatar } from "@/lib/placeholder/avatar";
import getRandomHexColor from "@/utils/getRandomHexColor";
import { Badge } from "@/components/ui/badge";
type userAndRole = userProfile & { role?: access_level };
interface UserCardsProps {
    user: userAndRole;
    keysToRender: (keyof userAndRole)[];
}

export default function UserCards({ user, keysToRender }: UserCardsProps) {
    const avatarURI = user.app_metadata?.avatar_url ?? fakeUserAvatar({ name: user.name ?? "User", size: 24, fontColor: "black", avatarBgColor: getRandomHexColor() });
    return (
        <Card className="p-5 rounded-lg max-w-[360px] m-3"
        >

            <VStack className="mb-6">
                {
                    //render name
                    user?.name !== null ?
                        (<Heading size="md" className="mb-4 text-typography-950">
                            {user.name}
                        </Heading>) : <SkeletonText speed={1} />}

            </VStack>
            <Box className="flex-row">
                <Avatar className="mr-3">
                    <AvatarFallbackText><SkeletonText speed={4} /></AvatarFallbackText>
                    <AvatarImage
                        source={{
                            uri: avatarURI,
                        }}
                        alt="image"
                    />
                </Avatar>
                <HStack className="mb-2 justify-end" space="sm">
                    <VStack>
                        {keysToRender.includes("email") ? (
                            <Text size="sm">
                                {user.email}
                            </Text>)
                            : <SkeletonText speed={1} />}
                        {keysToRender.includes("phone_number") ? (
                            <Text size="sm">
                                {/* {user?.role ?? user?.access_level} */}
                                {user?.phone_number ?? "No phone number"}
                            </Text>)
                            : <SkeletonText speed={1} />}
                    </VStack>
                    {keysToRender.includes("role") && user?.role !== null ? (
                        <Badge className="bg-background-100" size="sm" action="muted" variant="outline" >
                            {user.role}
                        </Badge>)
                        : null}
                </HStack>
            </Box>
        </Card>
    );
}