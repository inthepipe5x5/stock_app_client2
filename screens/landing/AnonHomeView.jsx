import ParallaxScrollView from "../../components/ParallaxScrollView";
import * as loginImage from "../assets/auth/login.png";
import { VStack } from "@/components/ui/vstack";
import { Title } from "@/components/ui/title";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useTheme, useStyled } from "@/components/ui/themed";

//TODO: fix this AnonHomeContent later
//TODO: either use the splash screen from gluestack UI starter kit or the following
const AnonHomeContent = (
  <VStack>
    <Title>Anon Home Title</Title>
    <Text>Anon Home Text</Text>
    <Button
      variant="solid"
      action="primary"
      onPress={() => {
        router.push("/login");
      }}
    >
      Login
    </Button>
    <Button
      variant="outline"
      action="secondary"
      onPress={() => {
        router.push("/signup");
      }}
    >
      Sign Up
    </Button>
  </VStack>
);

//AnonHomeView that is rendered when no user is found locally stored
const AnonHomeView = async () => {
  //get the opposite color of the main color based on the global color mode
  const { theme } = useTheme();
  const { style } = useStyled();
  const globalOppositeColorMode =
    style.mode.toLowerCase() === "dark" ? "light" : "dark";
  const headerBgColor = theme[globalOppositeColorMode].color;

  return (
    <ParallaxScrollView
      content={AnonHomeContent}
      backgroundImage={loginImage}
      headerBackgroundColor={headerBgColor}
    />
  );
};

export default AnonHomeView;
