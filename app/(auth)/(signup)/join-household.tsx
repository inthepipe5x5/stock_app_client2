import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Spinner } from "@/components/ui/spinner";
import { Card } from "@/components/ui/card";
import { Badge, BadgeText, BadgeIcon } from "@/components/ui/badge";
import { Button, ButtonText } from "@/components/ui/button";
import { AvatarImage } from "@/components/ui/avatar";
import { Avatar, AvatarFallbackText, AvatarBadge } from "@/components/ui/avatar";
import { Table, TableBody, TableHeader, TableRow, TableData, TableHead } from "@/components/ui/table";
import { Box } from "@/components/ui/box";
import { AuthLayout } from "@/screens/(auth)/_layout";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import supabase from "@/lib/supabase/supabase";
import { CheckCircle2, ClipboardCheck, UserCheck, UserPlus } from "lucide-react-native";
import { fakeUserAvatar } from "@/lib/placeholder/avatar";
import NotFoundScreen from "@/app/+not-found";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import DashboardLayout from "@/screens/_layout";
import { SkeletonText } from "@/components/ui/skeleton";
import { addUserToHousehold } from "@/lib/supabase/register";
import { useState } from "react";
import defaultSession, { household, user_households, userProfile } from "@/constants/defaultSession";

/*
 * This route is for users to add a new household or join an existing one.
 * 
 */

const JoinHouseHold = ({ householdId, joinHouseHoldFn }: { householdId: string, joinHouseHoldFn: () => Promise<any> }) => {

    const queryFn = async (householdId: string) => {
        const { data, error } = await supabase
            .from("user_households")
            .select()
            .eq("households.id", householdId)
            .eq("households.is_template", false)
            .limit(1);

        if (error) {
            console.error("User households table data fetching error:", error);
            throw new Error(error.message);
        }
        //destructure the data object and rename profiles key to user
        return data as any;
    };

    const { data, isLoading, error } = useQuery({
        queryKey: ["household", householdId],
        queryFn: () => queryFn(householdId as string),
    });


    if (isLoading) return (
        <Center>
            <VStack>
                <Heading >Loading...</Heading>
                <HStack>
                    <SkeletonText className="w-40 h-8" />
                    <Spinner size="large" />
                </HStack>
            </VStack>
        </Center>);

    if (data) {
        const household = data[0]; //TODO: check if this is the correct way to access the data
        const { name, description, user_count, users } = household;

        return (
            <Center>
                <Card className="p-6 rounded-lg max-w-[360px] m-3">
                    <Box className="flex-row">
                        <Avatar className="mr-4">
                            <AvatarFallbackText>{name.charAt(0)}</AvatarFallbackText>
                            <AvatarImage
                                source={{
                                    uri: fakeUserAvatar({ name: name as string, size: 100, avatarBgColor: data?.styling?.colors ?? "blue" }),
                                }}
                            />
                        </Avatar>
                        <VStack>
                            <Heading size="md" className="mb-1">
                                {name}
                            </Heading>
                            <Text size="sm">
                                {description}
                            </Text>
                        </VStack>
                    </Box>
                    <Box className="my-5 flex-col sm:flex-row">
                        <VStack className="items-center pb-2 sm:flex-1 sm:pb-0 sm:border-r sm:border-outline-300">
                            <Heading size="xs">
                                {user_count}
                            </Heading>
                            <Text size="xs">members</Text>
                        </VStack>
                    </Box>
                    <Button className="py-2 px-4" onPress={joinHouseHoldFn}>
                        <ButtonText size="sm">Join household</ButtonText>
                    </Button>
                </Card>
                <Box className="p-3 bg-background-0 rounded-lg overflow-hidden mt-4">
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow className="border-b-0 bg-background-0 hover:bg-background-0">
                                <TableHead className="font-bold">Members</TableHead>
                                {/* <TableHead>Email</TableHead> */}
                                <TableHead>Role</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user: any) => (
                                <TableRow key={user.user_id} className="border-b-0 bg-background-50">
                                    <TableData>{user.name}</TableData>
                                    {/* <TableData>{user.email}</TableData> */}
                                    <TableData>
                                        <Badge size="sm" action={["member", "manager"].includes(user.role) ? "success" : "info"} className="w-fit justify-center">
                                            <HStack>
                                                <BadgeText>{user.role}</BadgeText>
                                                <BadgeIcon as={user.role === "member" ? UserCheck : user.role === "manager" ? ClipboardCheck : UserPlus} size="sm" />
                                            </HStack>
                                        </Badge>
                                    </TableData>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>
            </Center >
        );
    }
}

// export const viewHouseHoldScreen = ({ householdId }: { householdId: number }) => {
//     const { state, isAuthenticated, dispatch } = useUserSession();
//     const params = useLocalSearchParams();
//     const targetHousehold = +(householdId ?? params.householdId);
//     const router = useRouter();

//     return (
//         <DashboardLayout>
//             {
//                 JoinHouseHold({
//                     householdId: targetHousehold,
//                     joinHouseHoldFn: () => {
//                         router.push({
//                             href: "/(tabs)/(stack)/[type].[id]", params: {
//                                 type: "household",
//                                 id: targetHousehold.toString(),
//                             }
//                         })


//                     }


//         </DashboardLayout>
//     )
// };

export default function joinHouseHoldScreen() {
    const params = useLocalSearchParams();
    console.log("params", params);
    const { householdId, newMemberEmail, invited_at } = params ?? null;
    const globalContext = useUserSession();
    const { state } = globalContext || defaultSession;
    const router = useRouter();

    const qc = useQueryClient();

    const prefetchedHouseholdData = qc.getQueryData<{ data?: any }>(["user_household", { user_id: state.user?.user_id, household_id: Array.isArray(householdId) ? householdId[0] : householdId }]);
    const [householdData, setHouseholdData] = useState<Partial<household> | null>({
        id: Array.isArray(householdId) ? householdId[0] : householdId
    });
    const [userHouseholdData, setUserHouseholdData] = useState<Partial<user_households>[] | null>([
        {
            household_id: Array.isArray(householdId) ? householdId[0] : (householdId as string),
            user_id: state.user?.user_id
        }
    ]);

    const userHousehold = useQuery({
        queryKey: ["user_household", { user_id: state.user?.user_id, household_id: Array.isArray(householdId) ? householdId[0] : householdId }],
        queryFn: async () => {
            const [householdResponse, userHouseholdResponse] = await Promise.all([
                supabase.from("households")
                    .select()
                    .eq("id", Array.isArray(householdId) ? householdId[0] : householdId)
                    .limit(1),
                supabase
                    .from("user_households")
                    .select()
                    .eq("household_id", Array.isArray(householdId) ? householdId[0] : householdId)
            ]);

            if (householdResponse.error || userHouseholdResponse.error) {
                const error = householdResponse.error ?? userHouseholdResponse.error;
                console.error("User households table data fetching error:", error);
                throw new Error(error?.message ?? "Unknown error occurred");
            }
            if (!!householdResponse?.data?.[0]) {
                if (!!householdResponse?.data?.[0]?.draft_status !== 'draft') {

                    setHouseholdData(householdResponse.data?.[0] ?? null);
                    setUserHouseholdData(userHouseholdResponse.data ?? null);

                    return { household: householdResponse.data, userHousehold: userHouseholdResponse.data };
                }
            }
            return null;
        },
        initialData: prefetchedHouseholdData,
    });

    const handleJoinButtonClick = async (newUserEmail: string) => {
        const { data: currentUser, error } = await supabase.from("profiles")
            .select("user_id")
            .eq("email", newUserEmail)
            .limit(1);
        const household_id = userHousehold.data?.[0]?.household_id ?? householdId;
        if (currentUser && currentUser[0] && currentUser[0].user_id) {
            return await addUserToHousehold(currentUser[0].user_id, householdId[0], invited_at[0] ?? new Date().toISOString());
        };
        //TODO: handle new user creation
        //user would have essentially clicked a magic link to arrive at this page?
        const { data: newUser, error: newUserError }: { data: { user: { id: string } | null }, error: any } = await supabase.auth.signInWithOtp({
            email: newUserEmail,
            options: { shouldCreateUser: true }
        });
        if (newUser?.user !== null && "id" in newUser.user) {
            if (typeof newUser.user.id === "string" && newUser.user.id !== "") {
                const { data, error } = await supabase.from("user_households").upsert({
                    household_id: householdId,
                    user_id: newUser?.user?.id,
                    role: "member",
                    options: {
                        onConflict: ["household_id", "user_id"],
                        ignoreDuplicates: true
                    }
                });
                dispatch({ type: "UPDATE_SESSION", payload: data ?? {} });
            }
        }
    };

    return typeof householdId === "string" ? (
        <AuthLayout>
            {/* <Stack.Screen name="household" options={{ title: "Household" }} /> */}
            {JoinHouseHold({
                householdId: householdId,
                joinHouseHoldFn: () => handleJoinButtonClick(newMemberEmail as string)
                // newUserEmail: String(newMemberEmail)
            })}
        </AuthLayout>
    ) : <NotFoundScreen />;
}