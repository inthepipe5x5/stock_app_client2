import { Image } from "@/components/ui/image";
import { VStack } from "@/components/ui/vstack";
import NavigationCard from "@/components/navigation/NavigationCard";
//replacement for the LeftBackground Image component
const defaultAuthPortals = [
  {
    HeadingText: "Log in",
    SubtitleText: "Log in to your account",
    link: {
      href: "(auth)/(signin)",
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
    HeadingText: "Sign Up",
    SubtitleText: "Create an account",
    link: {
      href: "(auth)/(signup)",
      isExternal: false,
      text: "Sign Up",
    },
    CardImage: (
      <Image
        source={require("@/assets/auth/signup.png")}
        // className="object-cover sm:h-100 h-200"
        className="mb-6 h-[240px] w-full rounded-md aspect-[263/240]"
        alt="Signup Image"
      />
    ),
  },
];

const AltAuthLeftBackground = ({ authPortals = defaultAuthPortals }) => {
  return (
    <VStack
      space={"sm"}
      className="object-cover h-full w-full" //cover the entire left screen
      //   className="w-full max-w-[440px] items-center h-full justify-center"
    >
      {authPortals.map((portal, index) => (
        <NavigationCard key={index} {...portal} />
      ))}
    </VStack>
  );
};

export { AltAuthLeftBackground, defaultAuthPortals };
