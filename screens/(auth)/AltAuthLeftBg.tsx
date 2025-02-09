import { Image } from "@/components/ui/image";
import { VStack } from "@/components/ui/vstack";
import NavigationCard from "@/components/navigation/NavigationCard";
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
      href: "(auth)/(signup)",
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
      href: "/(auth)/(signin)/forget-password",
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
  return (
    <VStack
      space={"sm"}
      className="object-cover h-full w-full" //cover the entire left screen

      //   className="w-full max-w-[440px] items-center h-full justify-center"
    >
      {portals.map((portal, index) => (
        <NavigationCard key={index} {...portal} />
      ))}
    </VStack>
  );
};

export { AltAuthLeftBackground, defaultAuthPortals };
