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
import {
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
} from "@/components/ui/checkbox";
import {
  ArrowLeftIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  Icon,
} from "@/components/ui/icon";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { Keyboard } from "react-native";
import { useForm, Controller, set } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react-native";
import { GoogleIcon } from "./assets/icons/google";
import { Pressable } from "@/components/ui/pressable";
import { Redirect, useRouter } from "expo-router";
import { AuthLayout } from "../layout";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import { CreatePassword } from "@/screens/(auth)/create-password/index";
import supabase from "@/lib/supabase/supabase";
import { fetchProfile } from "@/lib/supabase/session";
import * as WebBrowser from "expo-web-browser";

const signUpSchema = z.object({
  email: z.string().min(1, "Email is required").email(),
  password: z
    .string()
    .min(6, "Must be at least 8 characters in length")
    .regex(new RegExp(".*[A-Z].*"), "One uppercase character")
    .regex(new RegExp(".*[a-z].*"), "One lowercase character")
    .regex(new RegExp(".*\\d.*"), "One number")
    .regex(
      new RegExp(".*[`~<>?,./!@#$%^&*()\\-_+=\"'|{}\\[\\];:\\\\].*"),
      "One special character"
    ),
  confirmpassword: z
    .string()
    .min(6, "Must be at least 8 characters in length")
    .regex(new RegExp(".*[A-Z].*"), "One uppercase character")
    .regex(new RegExp(".*[a-z].*"), "One lowercase character")
    .regex(new RegExp(".*\\d.*"), "One number")
    .regex(
      new RegExp(".*[`~<>?,./!@#$%^&*()\\-_+=\"'|{}\\[\\];:\\\\].*"),
      "One special character"
    ),
  rememberme: z.boolean().optional(),
});

type SignUpSchemaType = z.infer<typeof signUpSchema>;

const SignUpWithLeftBackground = (children: any) => {
  const { state, dispatch } = useUserSession();
  const [provider, setProvider] = useState<string | null>(null);

  // const {
  //   control,
  //   handleSubmit,
  //   reset,
  //   formState: { errors },
  // } = useForm<SignUpSchemaType>({
  //   resolver: zodResolver(signUpSchema),
  // });
  // const toast = useToast();

  // const onSubmit = (data: SignUpSchemaType) => {
  //   if (data.password === data.confirmpassword) {
  //     toast.show({
  //       placement: "bottom right",
  //       render: ({ id }) => {
  //         return (
  //           <Toast nativeID={id} variant="outline" action="success">
  //             <ToastTitle>Success</ToastTitle>
  //           </Toast>
  //         );
  //       },
  //     });
  //     reset();
  //   } else {
  //     toast.show({
  //       placement: "bottom right",
  //       render: ({ id }) => {
  //         return (
  //           <Toast nativeID={id} variant="outline" action="error">
  //             <ToastTitle>Passwords do not match</ToastTitle>
  //           </Toast>
  //         );
  //       },
  //     });
  //   }
  // };
  // const [showPassword, setShowPassword] = useState(false);
  // const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // const handleState = () => {
  //   setShowPassword((showState) => {
  //     return !showState;
  //   });
  // };
  // const toggleShowConfirmPw = () => {
  //   setShowConfirmPassword((showState) => {
  //     return !showState;
  //   });
  // };
  // const handleKeyPress = () => {
  //   Keyboard.dismiss();
  //   handleSubmit(onSubmit)();
  // };
  const router = useRouter();

  return (
    <VStack className="max-w-[440px] w-full" space="md">
      {/* <VStack className="md:items-center" space="md">
        <Pressable
          onPress={() => {
            router.back();
          }}
        >
          <Icon
            as={ArrowLeftIcon}
            className="md:hidden stroke-background-800"
            size="xl"
          />
        </Pressable>
        <VStack>
          <Heading className="md:text-center" size="3xl">
            Sign up
          </Heading>
          <Text>Sign up and start using gluestack</Text>
        </VStack>
      </VStack> */}
      {/* <VStack className="w-full">
        <VStack space="xl" className="w-full">
          <FormControl isInvalid={!!errors.email}>
            <FormControlLabel>
              <FormControlLabelText>Email</FormControlLabelText>
            </FormControlLabel>
            <Controller
              name="email"
              defaultValue=""
              control={control}
              rules={{
                validate: async (value) => {
                  try {
                    await signUpSchema.parseAsync({ email: value });
                    return true;
                  } catch (error: any) {
                    return error.message;
                  }
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input>
                  <InputField
                    className="text-sm"
                    placeholder="Email"
                    type="text"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    onSubmitEditing={handleKeyPress}
                    returnKeyType="next"
                  />
                </Input>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon size="md" as={AlertTriangle} />
              <FormControlErrorText>
                {errors?.email?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
          <FormControl isInvalid={!!errors.password}>
            <FormControlLabel>
              <FormControlLabelText>Password</FormControlLabelText>
            </FormControlLabel>
            <Controller
              defaultValue=""
              name="password"
              control={control}
              rules={{
                validate: async (value) => {
                  try {
                    await signUpSchema.parseAsync({
                      password: value,
                    });
                    return true;
                  } catch (error: any) {
                    return error.message;
                  }
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input>
                  <InputField
                    className="text-sm"
                    placeholder="Password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    onSubmitEditing={handleKeyPress}
                    returnKeyType="next"
                    type={showPassword ? "text" : "password"}
                  />
                  <InputSlot onPress={handleState} className="pr-3">
                    <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
                  </InputSlot>
                </Input>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon size="sm" as={AlertTriangle} />
              <FormControlErrorText>
                {errors?.password?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
          <FormControl isInvalid={!!errors.confirmpassword}>
            <FormControlLabel>
              <FormControlLabelText>Confirm Password</FormControlLabelText>
            </FormControlLabel>
            <Controller
              defaultValue=""
              name="confirmpassword"
              control={control}
              rules={{
                validate: async (value) => {
                  try {
                    await signUpSchema.parseAsync({
                      password: value,
                    });
                    return true;
                  } catch (error: any) {
                    return error.message;
                  }
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input>
                  <InputField
                    placeholder="Confirm Password"
                    className="text-sm"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    onSubmitEditing={handleKeyPress}
                    returnKeyType="next"
                    type={showConfirmPassword ? "text" : "password"}
                  />

                  <InputSlot onPress={toggleShowConfirmPw} className="pr-3">
                    <InputIcon
                      as={showConfirmPassword ? EyeIcon : EyeOffIcon}
                    />
                  </InputSlot>
                </Input>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon size="sm" as={AlertTriangle} />
              <FormControlErrorText>
                {errors?.confirmpassword?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>

          */}
      <VStack>
        <Controller
          name="rememberme"
          defaultValue={false}
          control={control}
          render={({ field: { onChange, value } }) => (
            <Checkbox
              size="sm"
              value="Remember me"
              isChecked={value}
              onChange={onChange}
              aria-label="Remember me"
            >
              <CheckboxIndicator>
                <CheckboxIcon as={CheckIcon} />
              </CheckboxIndicator>
              <CheckboxLabel>
                I accept the Terms of Use & Privacy Policy
              </CheckboxLabel>
            </Checkbox>
          )}
        />
      </VStack>

      <CreatePasswordWithLeftBackground />
      <VStack className="w-full my-7" space="lg">
        {/* <Button className="w-full" onPress={handleSubmit(onSubmit)}>
            <ButtonText className="font-medium">Sign up</ButtonText>
          </Button> */}
        <Button
          variant="outline"
          action="secondary"
          className="w-full gap-1"
          onPress={
            async () => {
              setProvider("google");
              try {
                const { data, error } = await supabase.auth.signInWithOAuth({
                  provider: "google",
                });
                if (error) {
                  throw error;
                }
                if (data) {
                  console.log(data);

                  await WebBrowser.openBrowserAsync(data.url);
                  //update global state if user signs in
                  supabase.auth.onAuthStateChange(async (event, session) => {
                    if (event === "SIGNED_IN" && session) {
                      const existingUser = await fetchProfile({
                        searchKey: "user_id",
                        searchKeyValue: session?.user.id,
                      });
                      if (!existingUser) {
                        Redirect("/(auth)/(signup)/create-profile" as any);
                      } else if (existingUser) {
                        handleSuccessfulAuth(existingUser[0], session, dispatch);
                      } else {
                        handleAuthError(
                          new Error("Error signing in with Google")
                        );
                      }
                    }
                  });
                }
              } catch (error) {
                console.error("Error signing in with Google", error);
                Redirect("/(auth)/(signin)/authenticate" as any);
              }
            }}
        >
          <ButtonText className="font-medium">Continue with Google</ButtonText>
          <ButtonIcon as={GoogleIcon} />
        </Button>
      </VStack>
      <HStack className="self-center" space="sm">
        <Text size="md">Already have an account?</Text>
        <Link href="/(auth)/(signin)/authenticate">
          <LinkText
            className="font-medium text-primary-700 group-hover/link:text-primary-600 group-hover/pressed:text-primary-700"
            size="md"
          >
            Login
          </LinkText>
        </Link>
      </HStack>
    </VStack>
    // </VStack>
  );
};

export const SignUp = () => {
  return (
    <AuthLayout>
      <SignUpWithLeftBackground />
    </AuthLayout>
  );
};
