
import { RelativePathString, useRouter } from "expo-router";
import { ChevronLeft, LucideIcon, User } from "lucide-react-native";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { cn } from "@gluestack-ui/nativewind-utils/cn";

export type RoundedHeaderProps = {
    title: string;
    backIcon?: LucideIcon;
    icon: LucideIcon;
    variant?: "default" | "search" | "menu";
    nextUrl?: string | RelativePathString
    nextIcon?: LucideIcon;
    onBack?: (args?: any) => void;
    onNext?: (args?: any) => void;
    onMenu?: (args?: any) => void;
    onSearch?: (args?: any) => void;
    twCnStyling?: {
        container?: string;
        title?: string;
        icon?: string;
        backIcon?: string;
        menu?: {
            pressable?: string;
            icon?: string;
        }
    }
};

export default function RoundedHeader({
    title,
    icon,
    backIcon,
    nextUrl,
    nextIcon,
    onBack,
    onNext,
    onMenu,
    onSearch,
    twCnStyling
}: Partial<RoundedHeaderProps> = {
        title: "Title",
        icon: User,
        backIcon: ChevronLeft,
    }) {
    const router = useRouter();
    return (
        <HStack
            className={cn("relative top-3 w-[100%] py-6 mt-5 px-4 rounded-full bg-background-0 items-center justify-between", (twCnStyling?.container ?? ""))}
            space="md"
        >
            <HStack className="items-center" space="sm">
                <Pressable
                    onPress={onBack ? onBack : () => {
                        router.canGoBack() ? router.back() : router.dismissTo({
                            pathname: nextUrl as RelativePathString ?? '/(auth)'
                        });
                    }}
                >
                    <Icon
                        className={cn("mx-2 p-2", twCnStyling?.backIcon ?? "")}
                        as={backIcon ?? ChevronLeft}
                    />
                </Pressable>
                <Text
                    className={cn("text-xl", twCnStyling?.title ?? "")}>
                    {title}
                </Text>
            </HStack>
            {!!!onMenu ?
                (<Icon as={icon ?? User} className="h-8 w-20" />)
                :
                (
                    <Pressable
                        onPress={onMenu}
                        className={cn("h-8 w-20", twCnStyling?.menu?.pressable ?? "")}
                    >
                        <Icon
                            className={cn("h-8 w-20", twCnStyling?.menu?.icon ?? "")}
                            as={icon ?? User}
                        />
                    </Pressable>
                )
            }
        </HStack>
    );
}