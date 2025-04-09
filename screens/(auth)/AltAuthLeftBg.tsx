import { Image } from "@/components/ui/image";
import { VStack } from "@/components/ui/vstack";
import NavigationCard from "@/components/navigation/NavigationCard";
import { Dimensions } from "react-native";
import { viewPort } from "@/constants/dimensions";
//replacement for the LeftBackground Image component
const defaultAuthPortals = [
  {
    HeadingText: "Returning Users",
    SubtitleText: "Log in to your account",
    link: {
      href: "/(auth)/(signin)",
      isExternal: false,
      text: "Log in",
    },
    CardImage: (
      <Image
        source={require("@/assets/auth/login.png")}
        // className="object-cover sm:h-100 h-200"
        className="mb-6 h-[240px] w-full rounded-md aspect-[263/240]"
        alt="Login Image"
      />
    ),
  },
  {
    HeadingText: "New Users",
    SubtitleText: "Create an account",
    link: {
      href: "/(auth)/(signup)",
      isExternal: false,
      text: "Sign Up",
    },
    CardImage: (
      <Image
        source={require("@/assets/auth/register.png")}
        // className="object-cover sm:h-100 h-200"
        className="mb-6 h-[240px] w-full rounded-md aspect-[263/240]"
        alt="Signup Image"
      />
    ),
  },
  {
    HeadingText: "Forgot Password?",
    SubtitleText: "Reset your password here",
    link: {
      href: "/(auth)/(signin)/forgot-password",
      isExternal: false,
      text: "Click here to reset your password",
    },
    CardImage: (
      <Image
        source={require("@/assets/auth/forget.png")}
        // className="object-cover sm:h-100 h-200"
        className="mb-6 h-[240px] w-full rounded-md aspect-[263/240]"
        alt="Signup Image"
      />
    ),
  },
];

const AltAuthLeftBackground = ({ authPortals = defaultAuthPortals }) => {
  const portals =
    authPortals && authPortals !== null ? authPortals : defaultAuthPortals;
  const { width, height } = Dimensions.get("window");
  const isPortrait = height > width; // Check if the device is in portrait mode
  return (
    <VStack
      space={height > viewPort.breakpoints.Y.tablet ? "lg" : "sm"}
      className="mt-2 object-cover h-full w-full" //cover the entire left screen

    //   className="w-full max-w-[440px] items-center h-full justify-center"
    >
      {portals.map((portal, index) => (
        <NavigationCard key={index} {...portal} />
      ))}
    </VStack>
  );
};

export { AltAuthLeftBackground, defaultAuthPortals };
