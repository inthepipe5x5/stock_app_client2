import React, { useState, useMemo } from "react";
import { AuthPageLayout } from "../_layout";
import { authSetupData, userProfile } from "@/constants/defaultSession";
import NavigationCard from "@/components/navigation/NavigationCard";
import { Icon } from "@/components/ui/icon";
import { CheckCircle2, CircleAlert } from "lucide-react-native";
import { VStack } from "@/components/ui/vstack";
import { Button } from "@/components/ui/button";
import { usePathname } from "expo-router";
import { Divider } from "@/components/ui/divider";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import { useRouter } from "expo-router";
import isTruthy from "@/utils/isTruthy";
import { userCreateSchema } from "@/lib/schemas/userSchemas";

interface SignUpProviderProps {
  children: React.ReactNode;
  zodSchema: any;
}

const _SignUpLayout = ({ children, zodSchema, ...props }: any) => {
  const pathname = usePathname();
  const { state, dispatch } = useUserSession();
  const router = useRouter();

  //current user draft variables
  const currentUser = isTruthy(state?.user) ? state?.user : undefined;
  const draftUser = isTruthy(state?.drafts?.user)
    ? state?.drafts?.user
    : undefined;
  const setUpProgress = isTruthy(draftUser?.app_metadata?.setup)
    ? draftUser?.app_metadata?.setup
    : {
        email: false,
        authenticationMethod: false,
        details: false,
        preferences: false,
        location: false,
        password: false,
        confirm: false,
      };

  const continueProfileSetup = (
    updatedUserData: Partial<userProfile>,
    updatedSetup: Partial<authSetupData>,
    nextURL: string
  ) => {
    //set new draft state
    if (!state || !state.drafts) {
      dispatch({ type: "SET_DRAFTS", payload: { user: updatedUserData } });
    } else if (state.drafts) {
      const updatedProfileDraft = isTruthy(draftUser)
        ? { ...draftUser, ...updatedUserData }
        : updatedUserData;
      //update app_metadata.setup progress property
      updatedProfileDraft["app_metadata"] =
        isTruthy(updatedProfileDraft["app_metadata"]) &&
        typeof updatedProfileDraft["app_metadata"] === "object"
          ? { ...updatedProfileDraft["app_metadata"], setup: updatedSetup }
          : { setup: updatedSetup };

      //update global draft state
      dispatch({ type: "UPDATE_DRAFTS", payload: updatedProfileDraft });
      //navigate to next step in sign up process or return updated draft
      return nextURL ? router.push(nextURL as any) : updatedProfileDraft;
    }};

    // Call to action to submit user details and continue profile setup
    const onSubmitHandler = (
      userSetupZodSchema: any = userCreateSchema,
      setupData?: Partial<authSetupData> | null | undefined,
      onSuccess: () => void,
      onError: (error: any) => void
    ) => {
      // Do not proceed if setupData is null
      if (!isTruthy(setupData)) return;
      try {
        // Call zod schema to validate setupData
        userSetupZodSchema.parse(setupData);
  
        // If successful, call onSuccess
        onSuccess();


      } catch (error) {
        console.log(pathname, "onSubmitHandler error =>", error);
        onError(error);
      }
      // If unsuccessful, call onError
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
            link={
              `/(auth)/(signup)/${signUpSequence[index].urlFragment}` as any
            }
          />
        );
      });
    };

    // const providerProps = useMemo(
    //   () => ({
    //     ...providerProps,
    //     setUpProgress,
    //     continueProfileSetup,
    //     onSubmitHandler,
    //   }),
    //   [setupProgress, continueProfileSetup, onSubmitHandler]
    // );

    return (
      <AuthPageLayout
        portals={signupPortals}
        // props={providerProps}
        onSuccessfulSignup={continueProfileSetup}
      >
        {children}
        <VStack space="sm" className="flex-1 w-full">
          <Divider className="min-w-full" />
          <Button
            className="text-center text-white"
            onPress={() => {
              console.log(pathname, "Submit button clicked");
              onSubmitHandler(
                setUpProgress,
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
      </AuthPageLayout>
    );
  };
};
export default _SignUpLayout;
