import { cn } from "@gluestack-ui/nativewind-utils/cn";
import { Appearance } from "react-native";
import { Heading } from "@/components/ui/heading";
import { Button, ButtonText } from "@/components/ui/button";
import { getHouseholdAndInventoryTemplates } from "@/lib/supabase/register";
import { Image } from "@/components/ui/image";
import { Center } from "@/components/ui/center";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

//component for when no households are found
export default function NoHouseholdsFound() {
    const router = useRouter();
    const qc = useQueryClient();
    return (
        (
            <Center
                className={cn("p-20 m-safe-or-20 flex-1 flex-col justify-center items-center border-collapse rounded-md shadow-slate-100",
                    Appearance.getColorScheme() === "dark" ?
                        "bg-background-0" :
                        "bg-background-light",
                )}
            >
                <Heading className="text-typography-900 font-normal">You are not a member of any household.</Heading>
                <Text className="text-typography-900 font-normal text-sm lg:text-base">You can create or join a household.</Text>
                <Image
                    className="rounded-full my-6 py-5 h-1/2 w-1/2 aspect-[263/240]"
                    source={require("@/assets/images/splash-icon.png")}
                    resizeMethod="auto"
                    alt="Auth Landing Image"
                />
                <Button
                    onPress={() => {
                        // Prefetch the household and inventory templates
                        // This is to avoid the loading state when creating a household
                        qc.prefetchQuery({
                            queryKey: ['householdInventoryTemplates'],
                            queryFn: async () => await getHouseholdAndInventoryTemplates(),
                            staleTime: 1000 * 60 * 60 * 24,
                        })
                        router.push({
                            pathname: "/(tabs)/household/create",
                            params: { newUser: 'true' }
                        })
                    }}
                    className="w-full max-w-[300px]"
                    variant="solid"
                    action="positive"
                    android_ripple={{ color: "#00000010" }}
                    size="lg"
                >
                    <ButtonText className="text-typography-900 font-normal">Create Household</ButtonText>
                </Button>
            </Center>
        )
    );
}