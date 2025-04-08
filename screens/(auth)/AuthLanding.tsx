import { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, TextInput, useColorScheme } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from "@/components/ui/form-control";
import { ThemedView } from "@/components/ThemedView";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { HStack } from "@/components/ui/hstack";
import { Center } from "@/components/ui/center";
import { Link, LinkText } from "@/components/ui/link";
import { AlertTriangle, ArrowRight, ChevronLeft, HomeIcon, HouseIcon, LockIcon } from "lucide-react-native";
import { router, Stack, usePathname } from "expo-router";
import { AuthLayout } from "@/screens/(auth)/layout";
import { SignUpSchemaType, emailOnlySignUp } from "@/lib/schemas/authSchemas";
import { getUserProfileByEmail } from "@/lib/supabase/session";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import LoadingOverlay from "@/components/navigation/TransitionOverlayModal";
import { HelloWave } from "@/components/HelloWave";
import { Divider } from "@/components/ui/divider";
import { Image } from "@/components/ui/image";
import defaultSession, { userProfile } from "@/constants/defaultSession";
import Colors from '@/constants/Colors';
import { Pressable } from "@/components/ui/pressable";
import RoundedHeader from "@/components/navigation/RoundedHeader";
import { StatusBar } from "expo-status-bar";

export default function AuthLanding() {
  const toast = useToast();
  const globalContext = useUserSession();
  const { state } = globalContext || defaultSession;
  const { dispatch } = globalContext;
  // const { state, dispatch, signOut } = useUserSession();
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  // Setup react-hook-form
  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<SignUpSchemaType>({
    resolver: zodResolver(emailOnlySignUp),
    delayError: 2000,
    resetOptions: { keepDefaultValues: true, keepIsValid: true },
  });
  const colors = Colors[useColorScheme() ?? 'light'];
  const oppositeColors = Colors[useColorScheme() === 'dark' ? 'light' : 'dark'];


  // A ref for focusing the submit button after we confirm no user is found
  const submitButtonRef = useRef<typeof Button>(null);

  /**
   * If the user is found => direct them to sign in.
   */
  const handleExistingUser = (existingUserData: any) => {
    const newUser = existingUserData.draft_status === "confirmed" ? true : false;
    const redirectPath = newUser ? "/(auth)/(signup)/new-user-signin" : "/(auth)/(signin)/authenticate";
    if (newUser) return handleContinueSignUp(existingUserData.email);
    dispatch({
      type: "SET_ANON_SESSION",
      payload: {
        ...defaultSession,
        user: {
          draft_status: "confirmed",
          ...existingUserData,
          password: "",
        },
      },
    });
    // show toast with "User found" and a button to sign in
    toast.show({
      placement: "bottom right",
      render: ({ id }) => (
        <Toast nativeID={id} variant="solid" action="info">
          <HStack space="md">
            <AlertTriangle size={24} />
            <ToastTitle>User found. Please sign in.</ToastTitle>
            <Button
              onPress={() => router.push(redirectPath)}
              variant="outline"
              action="primary"
              size="sm"
              className="ml-5"
            >
              <ButtonText>Sign In</ButtonText>
            </Button>
          </HStack>
        </Toast>
      ),
    });
    setLoading(false);
    //redirect to sign in after 10 seconds
    setTimeout(() => {
      router.push(redirectPath);
    }, 5000 * 2);
  };

  /**
   * If user not found => store email in session => redirect to next route (create-password).
   */
  const handleContinueSignUp = (userData: Partial<userProfile>) => {

    console.log("email received => continuing sign up", userData);
    dispatch({
      type: "SET_ANON_SESSION",
      payload: {
        ...userData,
        draft_status: "draft"
      },
    });

    console.log("updated state post submit=", state);


    setLoading(false);
    //navigate to next route in the auth flow
    setTimeout(() => {
      router.push({ pathname: "/(auth)/(signup)/create-password" as any, });
    }, 1500);
  };

  async function onSubmit(formData: SignUpSchemaType) {
    // The user pressed "Continue Sign Up" after possibly checking for existing user
    setLoading(true);


    try {
      //clear any existing session data if a new session is started and use the email provided
      dispatch({
        type: "SET_ANON_SESSION",
        payload: {
          ...defaultSession,
          user: {
            ...state?.user,
            email: formData.email ?? getValues("email"),
            draft_status: "draft",
          },
        },
      })
      // "final" check for existing user if not done already:
      const result = await getUserProfileByEmail(formData.email ?? getValues("email"));

      if (result?.error !== null) { console.error(result?.error); throw result?.error; }

      else if (result?.existingUser) {
        // If user found => redirect to sign in
        const newUser = result?.existingUser?.draft_status === "confirmed" ? true : false;
        newUser ? handleContinueSignUp({ email: formData.email }) : handleExistingUser({ ...result?.existingUser, email: formData.email });

      } else {
        // otherwise => continue sign up flow
        handleContinueSignUp({ email: formData.email });
      }
    } catch (err: any) {
      console.error("Error checking user or continuing signup:", err);
      toast.show({
        placement: "bottom right",
        render: ({ id }) => (
          <Toast nativeID={id} variant="solid" action="error">
            <ToastTitle>{err?.message ?? "Error checking user"}</ToastTitle>
          </Toast>
        ),
      });
      setLoading(false);
      reset();
    }
  }

  //show errors
  if (errors && Object.keys(errors).length > 0) {
    console.log("Form Errors found:", errors);
    for (const [key, value] of Object.entries(errors)) {
      console.log(`Error in ${key}: ${value}`);
      toast.show({
        placement: "bottom right",
        duration: 10000,
        render: ({ id }) => (
          <Toast nativeID={id} variant="solid" action="error">
            <ToastTitle>{value?.type !== null ? `Form Error Type: ${String(value.type)}` : "Form Error"}</ToastTitle>
            {value.message ? (<ToastDescription>{value.message}</ToastDescription>) : null}
          </Toast>
        ),
      });

    }
  }

  return (
    <AuthLayout>
      {
        Platform.OS === "android" ? (
          <StatusBar style="light" />
        ) : (
          <StatusBar style="auto" />
        )
      }
      <ThemedView style={
        {
          overflow: 'scroll',
          justifyContent: 'center',
          height: '100%',
          alignItems: 'flex-start',
          paddingHorizontal: 20,
          backgroundColor: colors.background,
          borderRadius: 50,
          width: '100%',
          shadowColor: '#808080',
          shadowOffset: {
            width: 5,
            height: 50,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.5,
          elevation: 5,
          flex: 1,
        }
      }>
        <Stack.Screen options={{
          headerShown: true,
          title: "Sign In Or Sign Up",
          headerStyle: {
            backgroundColor: colors.primary.main,
          },
          headerLargeTitleShadowVisible: Platform.OS !== 'web',
          headerTintColor: oppositeColors.primary.main,
          headerLeft: () => {
            return (
              <Button
                variant="link"
                action="primary"
                onPress={() => {
                  router.canGoBack()
                    ? router.back()
                    : router.replace({
                      pathname: '/+not-found',
                      params: {
                        nextURL: '/',
                        message: "Something went wrong. Please try again.",
                      },
                    });
                }}
                className="flex-row items-center justify-start mr-auto"
              >
                <ChevronLeft color={colors.accent} />
                {/* <ButtonText style={{ color: oppositeColors.primary.main }} className="text-lg font-semibold">
                  Back
                </ButtonText> */}
              </Button>
            );
          },
          headerRight: () => (
            <HouseIcon color={colors.accent} />
          ),
          headerShadowVisible: true,
          animation: "slide_from_left",
          animationDuration: 1000,
          animationMatchesGesture: Platform.OS === 'ios',
          animationTypeForReplace: Platform.OS === 'web' ? "pop" : "push",
          freezeOnBlur: ['ios', 'android'].includes(Platform.OS.toLowerCase()),
          presentation: "card",
        }}
        />
        <KeyboardAvoidingView
        >
          <VStack
            space="md"
            className="max-w-[440px] w-full self-center"
          >
            <VStack
              className="w-full flex-grow flex-start items-center"
            >
              {loading ? (
                <LoadingOverlay
                  visible
                  title="Please wait"
                  subtitle="Checking user or continuing signup..."
                  dismissToURL="/(auth)"
                />
              ) : (
                <>
                  <HStack className="justify-center mt-4">
                    {/* if we're loading => show overlay */}
                    <Heading size="3xl" className="text-center">
                      Welcome!
                    </Heading>
                    <HelloWave />
                  </HStack>
                  <Divider className="my-2" />
                  <Text
                    size="lg"
                    className="self-center text-md font-normal mb-2 text-typography-700"
                  >
                    Let's start by entering your email address.
                  </Text>
                  <Image
                    source={require("@/assets/images/splash-icon.png")}
                    resizeMethod="auto"
                    className="rounded-full my-6 py-5 h-1/2 w-1/2 aspect-[263/240]"
                    alt="Auth Landing Image"
                  />
                </>
              )}
            </VStack>

            {/* Email field */}
            <FormControl isInvalid={!!errors.email}>
              <FormControlLabel>
                <FormControlLabelText>Email</FormControlLabelText>
              </FormControlLabel>
              <Controller
                control={control}
                name="email"
                defaultValue={state?.user?.email ?? ""}
                rules={{
                  validate: async (value) => {
                    try {
                      await emailOnlySignUp.parseAsync({ email: value });
                      return true;
                    } catch (error: any) {
                      return error.message;
                    }
                  },
                  required: "Email is required",
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input>
                    <InputField
                      placeholder="Enter your email"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      returnKeyType="next"
                      onSubmitEditing={async () => onSubmit({ email: value })}
                    />
                  </Input>
                )}
              />
              <FormControlError>
                <FormControlErrorIcon as={AlertTriangle} />
                <FormControlErrorText>
                  {errors.email?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>

            <Link href="/(auth)/(signin)" className="w-full">
              <HStack className="items-center">
                <LinkText
                  size="sm"
                  className="font-semibold text-info-600 no-underline"
                >
                  Already have an account? Sign in here
                </LinkText>
              </HStack>
            </Link>

          </VStack>
        </KeyboardAvoidingView>
        <Button
          ref={submitButtonRef as any} // typed as any since we can't fully type Button ref
          className="w-full mt-4 flex-start absolute bottom-4 left-4 right-4 mx-2 px-2 rounded-lg"
          variant={loading || !!errors.email || !getValues('email') ? 'outline' : "solid"}
          onPress={handleSubmit(onSubmit)}
          action={loading || !!errors.email || !getValues('email') ? "secondary" : "positive"}
          disabled={loading || !!errors.email || !getValues('email')}
        >
          <ButtonText>{pathname.split("/").includes("confirm") ? "Submit" : "Continue"}</ButtonText>
          <ButtonIcon as={loading || !!errors?.email || !!!getValues('email') ? LockIcon : ArrowRight} />
        </Button>
      </ThemedView>
    </AuthLayout >
  );
}
