import { AnimatedText } from "@/components/AnimatedText"
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { Center } from "@/components/ui/center";
import { Image } from "./ui/image";
import { Divider } from "./ui/divider";

export type ReusableTitleParams = {
    titleText: string;
    subtitleText?: string | null | undefined;
    animatedText?: string | null | undefined;
    instructionText?: string | null | undefined;
    headerImageURI?: string | null | undefined;

}

export default function ReusableTitleCard({ titleText, subtitleText, animatedText, headerImageURI }: ReusableTitleParams) {
    return (<Center>
        <HStack className="justify-center">
            {/* if we're loading => show overlay */}
            <Heading size="3xl" className="text-center">
                {titleText ?? "Welcome!"}
            </Heading>
            {animatedText && <AnimatedText animatedText={animatedText ?? ""} />}
        </HStack>
        <Divider className="my-2" />
        <Text
            size="lg"
            className="self-center text-md font-normal mb-2 text-typography-700"
        >
            {subtitleText ?? "Let's start by entering your user information."}
        </Text>
        {headerImageURI && (<Image
            source={require("@/assets/images/splash-icon.png")}
            // source={require(`@/assets/auth/${
            //   pathname.split("/").includes("signup") ? "welcome" : "login"
            // }.png`)}
            resizeMethod="auto"
            // className="object-cover sm:h-100 h-200"
            className="mb-6 h-[240px] w-full rounded-md aspect-[263/240]"
            alt="Auth Landing Image"
            />)}
    </Center>)
}
