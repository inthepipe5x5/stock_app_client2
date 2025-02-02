import { VStack } from "@/components/ui/vstack";
import { Button, ButtonText } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { Card } from "@/components/ui/card";
import {
  GluestackIcon,
  GluestackIconDark,
} from "./assets/icons/gluestack-icon";
import { useColorScheme } from "nativewind";
import { useRouter } from "expo-router";
import { AuthLayout } from "@/screens/(auth)/layout/index";
// import NavigationCard from "@/components/navigation/NavigationCard";
// //replacement for the LeftBackground Image component
// const AltAuthLeftBackground = () => {

//   const authPortals = [
//     {
//       HeadingText: "Log in",
//       SubtitleText: "Log in to your account",
//       link: {
//         href: "(auth)/(signin)",
//         isExternal: false,
//         text: "Log in",
//       },
//       CardImage: (
//         <Image
//           source={require("@/assets/auth/login.png")}
//           // className="object-cover sm:h-100 h-200"
//           className="mb-6 h-[240px] w-full rounded-md aspect-[263/240]"
//           alt="Login Image"
//         />
//       ),
//     },
//     {
//       HeadingText: "Sign Up",
//       SubtitleText: "Create an account",
//       link: {
//         href: "(auth)/(signup)",
//         isExternal: false,
//         text: "Sign Up",
//       },
//       CardImage: (
//         <Image
//           source={require("@/assets/auth/signup.png")}
//           // className="object-cover sm:h-100 h-200"
//           className="mb-6 h-[240px] w-full rounded-md aspect-[263/240]"
//           alt="Signup Image"
//         />
//       ),
//     },
//   ];

//   return (
//     <VStack
//       space={"sm"}
//       className="w-full max-w-[440px] items-center h-full justify-center"
//     >
//       {authPortals.map((portal, index) => (
//         <NavigationCard key={index} {...portal} />
//       ))}
//     </VStack>
//   );
// };

const SplashScreenWithLeftBackground = () => {
  const router = useRouter();
  const { colorScheme } = useColorScheme();

  return (
    <VStack
      className="w-full max-w-[440px] items-center h-full justify-center"
      space="lg"
    >
      {colorScheme === "dark" ? (
        <Icon as={GluestackIconDark} className="w-[219px] h-10" />
      ) : (
        <Icon as={GluestackIcon} className="w-[219px] h-10" />
      )}
      <VStack className="w-full" space="lg">
        <Button
          className="w-full"
          onPress={() => {
            router.push({ pathname: "(auth)/(signin)" as any });
          }}
        >
          <ButtonText className="font-medium">Log in</ButtonText>
        </Button>
        <Button
          onPress={() => {
            router.push({ pathname: "(auth)/(signup)" as any });
          }}
        >
          <ButtonText className="font-medium">Sign Up</ButtonText>
        </Button>
      </VStack>
    </VStack>
  );
};

export const AuthIndex = () => {
  return (
    <AuthLayout>
      <SplashScreenWithLeftBackground />
    </AuthLayout>
  );
};
