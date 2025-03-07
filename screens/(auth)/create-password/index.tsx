import { useState } from "react";
import { Keyboard } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Toast, ToastTitle, useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Input, InputField, InputSlot, InputIcon } from "@/components/ui/input";
import { ArrowLeftIcon, EyeIcon, EyeOffIcon, Icon } from "@/components/ui/icon";
import { Button, ButtonText } from "@/components/ui/button";
import { Pressable } from "@/components/ui/pressable";
import { usePathname, useRouter, Stack } from "expo-router";
import { AuthLayout } from "../layout";
import {
  CreatePasswordSchemaType,
  createPasswordSchema,
} from "@/lib/schemas/passwordSchema";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import {
  getUserProfileByEmail,
  registerUserAndCreateProfile,
} from "@/lib/supabase/session";
import { useMutation } from "@tanstack/react-query";
import LoadingOverlay from "@/components/navigation/TransitionOverlayModal";
import ConfirmClose from "@/components/navigation/ConfirmClose";
import { AlertTriangle } from "lucide-react-native";
import { HStack } from "@/components/ui/hstack";
import supabase from "@/lib/supabase/supabase";

export const CreatePasswordAuthForm = () => {
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const { state, dispatch } = useUserSession();
  const [confirmClose, setConfirmClose] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Setup react-hook-form
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    getValues,
  } = useForm<CreatePasswordSchemaType>({
    resolver: zodResolver(createPasswordSchema),
  });
  const newUser = (state?.user?.draft_status === "draft") || pathname.split("/").includes("signup");

  // Mutation for registering the user
  const { mutate, isError, isPending, isSuccess } = useMutation({
    // mutationFn: supabase.auth.updateUser, //TODO: move this mutation to /confirm page
    mutationFn: () => supabase.auth.updateUser({ email: (state?.user?.email ?? ""), password: getValues("password") }),
    onSuccess: (result: any) => {
      // If supabase signUp successful
      toast.show({
        placement: "top right",
        render: ({ id }) => (
          <Toast nativeID={id} variant="solid" action="success">
            <ToastTitle>{`User password ${newUser ? "created" : "updated"}successfully!`}</ToastTitle>
          </Toast>
        ),
      });
      // 1) Update session context with new user data
      dispatch({ type: "SET_NEW_SESSION", payload: result });

      // 2) Possibly navigate to a new screen
      router.replace("/(tabs)/home");
    },
    onError: (err: any) => {
      toast.show({
        placement: "top right",
        render: ({ id }) => (
          <Toast nativeID={id} variant="solid" action="error">
            <ToastTitle>{err?.message ?? "Registration error"}</ToastTitle>
          </Toast>
        ),
      });
    },
  });

  // Final submit logic:
  async function onSubmit(data: CreatePasswordSchemaType) {
    // Check if passwords match
    if (data.password !== data.confirmpassword) {
      //handle failed password match
      toast.show({
        placement: "bottom right",
        render: ({ id }) => (
          <Toast nativeID={id} variant="outline" action="error">
            <ToastTitle>Passwords do not match</ToastTitle>
          </Toast>
        ),
      });
      //reset form
      reset();
      return;
    }
    mutate(data);

    // If the user is already registered, just update the password
  }

  const handleState = () => {
    setShowPassword((showState) => {
      return !showState;
    });
  };
  const handleConfirmPwState = () => {
    setShowConfirmPassword((showState) => {
      return !showState;
    });
  };
  const handleKeyPress = () => {
    Keyboard.dismiss();
    handleSubmit(onSubmit)();
  };

  if (isPending)
    return (
      <VStack className="max-w-[440px] w-full" space="md">
        {/* The overlay to indicate loading states */}
        <LoadingOverlay visible={isPending} title="Loading..." />
      </VStack>
    );

  return (
    <VStack className="max-w-[440px] w-full" space="md">
      {/* The overlay to indicate loading states */}
      <VStack className="md:items-center" space="md">
        <Pressable
          onPress={() => {
            setConfirmClose(true);
          }}
        >
          <Icon
            as={ArrowLeftIcon}
            className="md:hidden stroke-background-800"
            size="xl"
          />
        </Pressable>
        <VStack>
          {confirmClose && <ConfirmClose dismissToURL="/(auth)/(signin)" />}
          <Heading className="md:text-center" size="3xl">
            Create new password
          </Heading>
          <Text className="md:text-center">
            Your new password must be different from your name, email, or any
            previously used passwords.
          </Text>
        </VStack>
      </VStack>
      <VStack className="w-full">
        <VStack space="xl" className="w-full">
          {/* Password Field */}
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
                    await createPasswordSchema.parseAsync({
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
                    onSubmitEditing={() => Keyboard.dismiss()}
                    returnKeyType="next"
                    type={showPassword ? "text" : "password"}
                  />
                  <InputSlot onPress={() => handleState()} className="pr-3">
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
            <FormControlLabel>
              <FormControlLabelText className="text-typography-500">
                Must be at least 8 characters
              </FormControlLabelText>
            </FormControlLabel>
          </FormControl>

          {/* Confirm Password Field */}
          <FormControl isInvalid={!!errors.confirmpassword}>
            <FormControlLabel>
              <FormControlLabelText>Confirm Password</FormControlLabelText>
            </FormControlLabel>
            <Controller
              defaultValue=""
              name="confirmpassword"
              control={control}
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
                  <InputSlot
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="pr-3"
                  >
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
            <FormControlLabel>
              <FormControlLabelText className="text-typography-500">
                Both passwords must match
              </FormControlLabelText>
            </FormControlLabel>
          </FormControl>
        </VStack>

        <VStack className="mt-7 w-full">
          <Button className="w-full" onPress={handleSubmit(onSubmit)}>
            <ButtonText className="font-medium">
              {pathname.split("/").includes("(signin)")
                ? "Reset Password"
                : "Confirm Password & Submit"}
            </ButtonText>
          </Button>
        </VStack>
      </VStack>
    </VStack>
  );
};

export const CreatePassword = () => {
  return (
    <AuthLayout>
      <CreatePasswordAuthForm />
    </AuthLayout>
  );
};
