import React, { useState } from "react";
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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react-native";
import { GoogleIcon } from "@/assets/icons/google";
import { Pressable } from "@/components/ui/pressable";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AuthLayout } from "@/screens/(auth)/layout";
import { passwordLoginSchema, LoginSchemaType } from "@/lib/schemas/authSchemas";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import supabase from "@/lib/supabase/supabase";
import {
  // performWebOAuth,
  createSessionFromUrl,
  sendMagicLink,
} from "@/lib/supabase/auth";
import authenticate from "@/app/(auth)/(signin)/authenticate";

const PasswordLogin = (props: any) => {
  const { control, handleSubmit, reset, formState } = useForm<LoginSchemaType>({
    resolver: zodResolver(passwordLoginSchema),
    defaultValues: props.defaultValues
  });
  const toast = useToast();
  const { errors } = formState;

  const [validated, setValidated] = useState({
    emailValid: false,
    passwordValid: false,
  });

  const router = useRouter();
  // const { signIn } = useUserSession();

  // Password-based login handler
  const handlePasswordLogin = async (data: LoginSchemaType) => {
    try {
      const credentials = { email: data.email, password: data.password };
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
      setValidated({ emailValid: true, passwordValid: false });
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

  // OAuth Login handler
  const handleOAuthLogin = async (provider: string) => {
    try {
      // await performWebOAuth(provider as any); //TODO switch to using the context function once the session context is fixed
      // await signIn({ oauthProvider: provider });
      await authenticate({ oauthProvider: provider });
      toast.show({
        placement: "bottom right",
        render: ({ id }) => (
          <Toast nativeID={id} variant="solid" action="success">
            <ToastTitle>Signed in with {provider}</ToastTitle>
          </Toast>
        ),
      });
      router.push("/(tabs)/(dashboard)/");
    } catch (error) {
      console.error(`OAuth login failed for ${provider}:`, error);
      toast.show({
        placement: "bottom right",
        render: ({ id }) => (
          <Toast nativeID={id} variant="solid" action="error">
            <ToastTitle>OAuth login failed for {provider}</ToastTitle>
          </Toast>
        ),
      });
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const handleState = () => setShowPassword((prev) => !prev);

  return (
    <VStack className="max-w-[440px] w-full" space="md">
      <VStack className="md:items-center" space="md">
        <Pressable
          onPress={() => {
            router.dismissTo("/(auth)");
          }}
        >
          <Icon
            as={ArrowLeftIcon}
            className="md:hidden text-background-800"
            size="xl"
          />
        </Pressable>
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
      <VStack className="w-full">
        <VStack space="xl" className="w-full">
          <FormControl
            isInvalid={!!errors?.email || !validated.emailValid}
            className="w-full"
          >
            <FormControlLabel>
              <FormControlLabelText>Email</FormControlLabelText>
            </FormControlLabel>
            <Controller
              defaultValue={props?.defaultValues?.email ?? ""}
              name="email"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input>
                  <InputField
                    placeholder="Enter email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    onSubmitEditing={handleSubmit(handlePasswordLogin)}
                    returnKeyType="next"
                  />
                </Input>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon as={AlertTriangle} />
              <FormControlErrorText>
                {errors?.email?.message ||
                  (!validated.emailValid && "Email ID not found")}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
          {/* Password Field */}
          <FormControl
            isInvalid={!!errors?.password || !validated.passwordValid}
            className="w-full"
          >
            <FormControlLabel>
              <FormControlLabelText>Password</FormControlLabelText>
            </FormControlLabel>
            <Controller
              defaultValue=""
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
                  <InputSlot onPress={handleState} className="pr-3">
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
                {(errors.password && formState.isDirty && !formState.isValid!) ? errors.password.message : "Password was incorrect"}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
        </VStack>
        {/* Login & OAuth Buttons */}
        <VStack className="w-full my-7 " space="lg">
          <Button
            className="w-full"
            onPress={handleSubmit(handlePasswordLogin)}
            disabled={!formState.isValid || !formState.isDirty || formState.isSubmitting}
          >
            <ButtonText className="font-medium">Log in</ButtonText>
          </Button>
          {/* <Button
            variant="outline"
            action="secondary"
            className="w-full gap-1"
            onPress={() => handleOAuthLogin("google")}
          >
            <ButtonText className="font-medium">
              Continue with Google
            </ButtonText>
            <ButtonIcon as={GoogleIcon} />
          </Button> */}
          <Button
            variant="outline"
            action="secondary"
            className="w-full gap-1"
            onPress={router.canGoBack() ? () => router.back() : () => router.push("/(auth)/(signup)/create-password")}
          >
            <ButtonText className="font-medium">
              Go back
            </ButtonText>
            <ButtonIcon as={AlertTriangle} />
          </Button>

        </VStack>
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
      </VStack>
    </VStack>
  );
};

export const SignIn = (props: any) => {
  const { state, isAuthenticated } = useUserSession();
  const { email } = state?.user ?? useLocalSearchParams() ?? "";
  const nextRoute = props?.nextRoute ?? "/(tabs)";

  return (
    <AuthLayout showSSOProviders={props.showSSOProviders ?? true}>
      <PasswordLogin defaultValues={{ email, password: "", rememberme: false }} next={nextRoute} />
    </AuthLayout>
  );
};
