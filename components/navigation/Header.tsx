import { useRouter } from "expo-router";
import { ChevronLeft, LucideIcon, User, XCircle } from "lucide-react-native";
import { HStack } from "../ui/hstack";
import { Pressable } from "../ui/pressable";
import { Text } from "../ui/text";
import { Icon } from "../ui/icon";
import { Platform } from "react-native";

type MobileHeaderProps = {
    title: string;
    backIcon?: LucideIcon;
    icon: LucideIcon;
    nextUrl?: string;
    nextIcon?: LucideIcon;
    onBack?: (args?: any) => void;
    onNext?: (args?: any) => void;
    onMenu?: (args?: any) => void;
    onSearch?: (args?: any) => void;
};

export function MobileHeader(props: MobileHeaderProps = {
    title: "Title",
    icon: User,
    backIcon: ChevronLeft,
}) {
    const router = useRouter();
    return (
        <HStack
            className="py-6 mt-5 px-4 border-b border-border-800 rounded-full bg-background-0 items-center justify-between"
            space="md"
        >
            <HStack className="items-center" space="sm">
                <Pressable
                    onPress={props?.onBack ? props.onBack : () => {
                        router.canDismiss() ? router.dismiss() : router.back();
                    }}
                >
                    <Icon as={XCircle} />
                </Pressable>
                <Text className="text-xl">{props.title}</Text>
            </HStack>
            <Icon as={props?.icon ?? User} className="h-8 w-20" />
        </HStack>
    );
}


export default function Header(props: MobileHeaderProps) {
    const router = useRouter();
    return Platform.OS === "web" ? (
        <HStack
            className="py-6 mt-5 px-4 border-b border-border-800 rounded-full bg-background-0 items-center justify-between"
            space="md"
        >
            <HStack className="items-center" space="sm">
                <Pressable
                    onPress={props?.onBack ? props.onBack : () => {
                        router.canDismiss() ? router.dismiss() : router.back();
                    }}
                >
                    <Icon as={XCircle} />
                </Pressable>
                <Text className="text-xl">{props.title}</Text>
            </HStack>
        </HStack>
    ) : MobileHeader(props);
}