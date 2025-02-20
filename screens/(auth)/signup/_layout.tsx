import React, { useState, createContext, useContext } from "react";
import { AuthPageLayout } from "../_layout";
import { authSetupData, userProfile } from "@/constants/defaultSession";
import NavigationCard from "@/components/navigation/NavigationCard";
import { Icon } from "@/components/ui/icon";
import { CheckCircle2, CircleAlert } from "lucide-react-native";
import { VStack } from "@/components/ui/vstack";
import { Button } from "@/components/ui/button";
import { usePathname } from "expo-router";
import { Divider } from "@/components/ui/divider";

// Create the context outside the component
const SetupProgressContext = createContext<{
  setupProgress: authSetupData;
  setSetupProgress: React.Dispatch<React.SetStateAction<authSetupData>>;
  continueProfileSetup: (
    updatedSetup: Partial<authSetupData>
  ) => Partial<authSetupData>;
} | null>(null);

export const useSetupProgress = () => {
  const context = useContext(SetupProgressContext);
  if (!context) {
    throw new Error(
      "useSetupProgress must be used within a SetupProgressProvider"
    );
  }
  return context;
};

const _SignUpProvider = ({ children, zodSchema, ...providerProps }: any) => {
  const [setupProgress, setSetupProgress] = useState<authSetupData>({
    email: null,
    authenticationMethod: null,
    account: null,
    details: null,
    preferences: null,
  });

  const pathname = usePathname();

  const continueProfileSetup = (updatedSetup: Partial<authSetupData>) => {
    setSetupProgress((prev) => ({
      ...prev,
      ...updatedSetup,
    }));
    return setupProgress; // Return the new setup progress
  };

  // Call to action to submit user details and continue profile setup
  const onSubmitHandler = (
    setupData: Partial<authSetupData>,
    userSetupZodSchema: any,
    onSuccess: () => void,
    onError: () => void
  ) => {
    // Call zod schema to validate setupData
    userSetupZodSchema.parse(setupData);

    // Do not proceed if setupData is null
    if (!setupData || setupData === null) return;
    // If successful, call onSuccess
    onSuccess();
    continueProfileSetup(setupData);
    // If unsuccessful, call onError
    onError();
  };

  const signupPortals = () => {
    const signUpSequence = [
      { urlFragment: "/", title: "Welcome", subtitle: "Start your journey" },
      {
        urlFragment: "/details",
        title: "Profile Details",
        subtitle: "Enter your profile details",
      },
      {
        urlFragment: "/preferences",
        title: "User Preferences",
        subtitle: "Set your user preferences",
      },
      {
        urlFragment: "location",
        title: "Location",
        subtitle: "Add your location",
      },
      {
        urlFragment: "create-password",
        title: "Create Password",
        subtitle: "Secure your account",
      },
      {
        urlFragment: "confirm",
        title: "Confirm",
        subtitle: "Confirm your details",
      },
    ];

    return Object.values(setupProgress).map((setupStep, index) => {
      const currentStep = signUpSequence[index];
      return (
        <NavigationCard
          key={index}
          HeadingText={currentStep.title}
          SubtitleText={currentStep.subtitle}
          CardImage={
            <Icon
              as={
                setupStep === false ||
                setupStep === null ||
                setupStep === undefined
                  ? CircleAlert
                  : CheckCircle2
              }
              size="md"
              color={
                setupStep === false ||
                setupStep === null ||
                setupStep === undefined
                  ? "gray"
                  : "green"
              }
            />
          }
          link={`/(auth)/(signup)/${signUpSequence[index].urlFragment}` as any}
        />
      );
    });
  };

  return (
    <AuthPageLayout
      portals={signupPortals}
      props={providerProps}
      onSuccessfulSignup={continueProfileSetup}
    >
      <SetupProgressContext.Provider
        value={{ setupProgress, setSetupProgress, continueProfileSetup }}
      >
        {children}
        <VStack space="sm" className="flex-1 w-full">
          <Divider className="min-w-full" />
          <Button
            className="text-center text-white"
            onPress={() => {
              console.log("Submit");
              onSubmitHandler(
                setupProgress,
                zodSchema,
                () => {
                  console.log("Success");
                  return "onSuccessHandler" in providerProps
                    ? providerProps.onSuccessHandler()
                    : null;
                },
                () => {
                  console.log("Error");
                  return "onErrorHandler" in providerProps
                    ? providerProps.onErrorHandler()
                    : null;
                }
              );
            }}
            action={
              pathname.split("/").includes("confirm") ? "positive" : "primary"
            }
          >
            {pathname.split("/").includes("confirm") ? "Next" : "Submit"}
          </Button>
        </VStack>
      </SetupProgressContext.Provider>
    </AuthPageLayout>
  );
};

export default _SignUpProvider;
