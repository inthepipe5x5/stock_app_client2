import React, { useCallback, useState } from "react";
import { Toast, ToastTitle, useToast } from "@/components/ui/toast";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Link, LinkText } from "@/components/ui/link";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { ArrowLeftIcon, EyeIcon, EyeOffIcon, Icon } from "@/components/ui/icon";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { useForm, Controller, set } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react-native";
import { GoogleIcon } from "@/assets/icons/google";
import { Pressable } from "@/components/ui/pressable";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { AuthLayout } from "@/screens/(auth)/layout";
import { passwordLoginSchema, LoginSchemaType } from "@/lib/schemas/authSchemas";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import supabase from "@/lib/supabase/supabase";
import { useAuth } from "@/components/contexts/authContext";
import {
  // performWebOAuth,
  createSessionFromUrl,
  sendMagicLink,
} from "@/lib/supabase/auth";
import authenticate from "@/app/(auth)/(signin)/authenticate";
import defaultSession from "@/constants/defaultSession";
import SubmitButton from "@/components/navigation/SubmitButton";
import Footer from "@/components/navigation/Footer";
import { KeyboardAvoidingView, Platform } from "react-native";
import { viewPort } from "@/constants/dimensions";
import { ScrollView } from "react-native-gesture-handler";

type PasswordLoginProps = {
  defaultValues: {
    email: string;
    password: string;
    rememberme: boolean;
  };
  nextRoute?: string;
  showSSOProviders?: boolean;
  showCancelAlert?: boolean;
  nextURL?: {
    pathname: string;
    params: { [key: string]: any };
  }
}

const PasswordLogin = (props: PasswordLoginProps) => {

  const { form: { control, formState }, tempUser } = useAuth();

  const { errors } = formState;



  const router = useRouter();


  // // OAuth Login handler
  // const handleOAuthLogin = async (provider: string) => {
  //   try {
  //     // await performWebOAuth(provider as any); //TODO switch to using the context function once the session context is fixed
  //     // await signIn({ oauthProvider: provider });
  //     await authenticate({ oauthProvider: provider });
  //     toast.show({
  //       placement: "bottom right",
  //       render: ({ id }) => (
  //         <Toast nativeID={id} variant="solid" action="success">
  //           <ToastTitle>Signed in with {provider}</ToastTitle>
  //         </Toast>
  //       ),
  //     });
  //     router.push("/(tabs)/(dashboard)/");
  //   } catch (error) {
  //     console.error(`OAuth login failed for ${provider}:`, error);
  //     toast.show({
  //       placement: "bottom right",
  //       render: ({ id }) => (
  //         <Toast nativeID={id} variant="solid" action="error">
  //           <ToastTitle>OAuth login failed for {provider}</ToastTitle>
  //         </Toast>
  //       ),
  //     });
  //   }
  // };

  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  return (
    <VStack className="max-w-[440px] w-full" space="md">
      <KeyboardAvoidingView
        className="flex-1 justify-center items-center"
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 10}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingVertical: 10
          }}
          className="w-full h-full flex-1 justify-center items-center"
          contentInsetAdjustmentBehavior="automatic"

          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          bounces={false}
          bouncesZoom={false}
        >
          <VStack className="md:items-center" space="md">
            <VStack>
              <Heading className="md:text-center" size="3xl">
                Log in
              </Heading>
              <Link href="/(auth)/(signup)">
                <LinkText
                  className="text-primary-700 group-hover/link:text-primary-600"
                  size="md"
                >
                  Create an account
                </LinkText>
              </Link>
              <Text>Login to start using your app</Text>
            </VStack>
          </VStack>
          {/* <VStack space="lg" className="w-full"> */}

          <HStack className="self-center" space="sm">
            <Text size="md">Don't have an account?</Text>
            <Link href="/(auth)/(signup)/create-password">
              <LinkText
                className="font-medium text-primary-700 group-hover/link:text-primary-600"
                size="md"
              >
                Sign up
              </LinkText>
            </Link>
          </HStack>
          <FormControl
            isInvalid={!!!formState.touchedFields || !!formState.errors?.email}
            className={`sm-width-full max-height-[${viewPort.input.height}] min-width-[${viewPort.input.width}px] max-width-[${viewPort.devices.mobile.width * 0.8}px]`}
          >
            <FormControlLabel>
              <FormControlLabelText>Email</FormControlLabelText>
            </FormControlLabel>
            <Controller
              defaultValue={props?.defaultValues?.email ?? tempUser?.email ?? ""}
              name="email"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input>
                  <InputField
                    placeholder="Enter email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    // onSubmitEditing={handleSubmit(handlePasswordLogin)}
                    returnKeyType="next"
                  />
                </Input>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon as={AlertTriangle} />
              <FormControlErrorText>
                {typeof errors?.email?.message === "string" ? errors.email.message : "Please enter a valid email"}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
          {/* Password Field */}
          <FormControl
            isInvalid={!!errors?.password}
            className="w-full"
          >
            <FormControlLabel>
              <FormControlLabelText>Password</FormControlLabelText>
            </FormControlLabel>
            <Controller
              defaultValue={props?.defaultValues?.password ?? ""}
              rules={{
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters long",
                },
              }}
              name="password"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input>
                  <InputField
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    returnKeyType="next"
                  />
                  <InputSlot onPress={toggleShowPassword} className="pr-3">
                    <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
                  </InputSlot>
                </Input>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon as={AlertTriangle} />
              <FormControlErrorText>
                {/* {errors?.password ??
                  (!validated.passwordValid && "Password was incorrect")} */}
                {!!errors?.password ? `${errors?.password?.message}` : "Please enter a valid password"}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
        </ScrollView>
      </KeyboardAvoidingView>
    </VStack>
  );
};


export const SignIn = (props: any) => {
  const params = useLocalSearchParams()
  const globalContext = useUserSession();
  const { state } = globalContext || defaultSession;
  const authContext = useAuth();
  const { form: { reset, formState } } = authContext;
  // const [showCaptcha, setShowCaptcha] = useState<boolean>(!!!authContext?.captchaToken);
  const toast = useToast();
  const router = useRouter();
  const [defaultValues, setDefaultValues] = useState({
    email: authContext?.tempUser?.email ?? state?.user?.email ?? params?.email?.[0] ?? "",
    password: "",
    rememberme: false,
  });

  //focus effect to critical variables: next route url, email, password
  useFocusEffect(useCallback(() => {
    const email = authContext?.tempUser?.email ?? state?.user?.email ?? params?.email?.[0] ?? "";
    const password = params?.password?.[0] ?? "";
    // const nextUrl = params?.nextUrl?.[0] ?? props?.nextRoute ?? "/";
    setDefaultValues((prev) => ({
      ...prev,
      email: email,
      password: password,
      rememberme: false
    }));

  }, [params?.email, params?.password, props?.nextRoute, authContext?.tempUser?.email, state?.user?.email]));

  // Password-based login handler
  const handlePasswordLogin = async (data: LoginSchemaType) => {
    try {
      const credentials = { email: data.email, password: data.password };
      const response = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
        // options: {
        //   // captchaToken: authContext?.captchaToken ?? "",
        // }
      });
      // await signIn(credentials); // Use the context function
      toast.show({
        placement: "bottom right",
        render: ({ id }) => (
          <Toast nativeID={id} variant="solid" action="success">
            <ToastTitle>Logged in successfully!</ToastTitle>
          </Toast>
        ),
      });
      router.replace("/(tabs)" as any);
    } catch (error) {
      console.error("Login error:", error);
      // setValidated({ emailValid: true, passwordValid: false });
      //set form state
      formState.errors.password = {
        type: "manual",
        message: "Invalid login credentials",
      };
      toast.show({
        placement: "bottom right",
        render: ({ id }) => (
          <Toast nativeID={id} variant="solid" action="error">
            <ToastTitle>"Invalid login credentials"</ToastTitle>
          </Toast>
        ),
      });
    }
    reset();
  };


  return (
    <AuthLayout showSSOProviders={props.showSSOProviders ?? false}>
      <PasswordLogin defaultValues={defaultValues} />

      {/* {
        showCaptcha ?
          (

            <Captcha
              setCaptchaToken={authContext?.setCaptchaToken}
            />
          )
          : null
      } */}
      <Footer
        static={true}
        contentChildren={
          // formState.isValid && !!authContext?.captchaToken ?
          (
            <SubmitButton
              focusRef={authContext?.submitBtnRef}
              btnText={"Log in"}
              onSubmit={handlePasswordLogin}
              disabled={!formState.isValid || !formState.isDirty || formState.isSubmitting}
            />
          )
          // :
          // (
          //   <SubmitButton
          //     focusRef={authContext?.submitBtnRef}
          //     btnText={"Complete Captcha"}
          //     onSubmit={() => setShowCaptcha(true)}
          //     disabled={!!authContext?.captchaToken || !formState.isValid || !formState.isDirty || formState.isSubmitting}
          //   />
          // )
        }
      />
    </AuthLayout>
  );
};
