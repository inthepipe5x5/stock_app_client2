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
import { useMutation } from "@tanstack/react-query";
import LoadingOverlay from "@/components/navigation/TransitionOverlayModal";
import ConfirmClose from "@/components/navigation/ConfirmClose";
import { AlertTriangle } from "lucide-react-native";
import { HStack } from "@/components/ui/hstack";
import supabase from "@/lib/supabase/supabase"; 

export const ResetPasswordAuthForm = () => {
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const { state } = useUserSession();
  const [confirmClose, setConfirmClose] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Setup react-hook-form
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePasswordSchemaType>({
    resolver: zodResolver(createPasswordSchema),
  });

  // useMutation to update the user's password in Supabase
  const {
    mutate: resetPassword,
    isLoading: isUpdating,
    isSuccess,
    isError,
    error: updateError,
  } = useMutation({
    mutationFn: async ({ password }: CreatePasswordSchemaType) => {
      // Attempt to update the current user's password in Supabase
      const { data, error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      return data; // 'data' might contain updated user info
    },
    onSuccess: (data) => {
      // Show success toast
      toast.show({
        placement: "bottom right",
        render: ({ id }) => (
          <Toast nativeID={id} variant="solid" action="success">
            <ToastTitle>Password updated successfully!</ToastTitle>
          </Toast>
        ),
      });
      // Navigate to (tabs)/(dashboard)
      router.push("/(tabs)/(dashboard)");
    },
    onError: (err: any) => {
      // Show error toast
      toast.show({
        placement: "bottom right",
        render: ({ id }) => (
          <Toast nativeID={id} variant="solid" action="error">
            <ToastTitle>{err?.message ?? "Update password error"}</ToastTitle>
          </Toast>
        ),
      });
    },
  });

  async function onSubmit(data: CreatePasswordSchemaType) {
    // Ensure both passwords match
    if (data.password !== data.confirmpassword) {
      toast.show({
        placement: "bottom right",
        render: ({ id }) => (
          <Toast nativeID={id} variant="outline" action="error">
            <ToastTitle>Passwords do not match</ToastTitle>
          </Toast>
        ),
      });
      reset();
      return;
    }
    // Update password in Supabase
    resetPassword({
      password: data.password,
      confirmpassword: data.confirmpassword,
    });
  }

  const handleState = () => {
    setShowPassword(!showPassword);
  };
  const handleConfirmPwState = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  const handleKeyPress = () => {
    Keyboard.dismiss();
    handleSubmit(onSubmit)();
  };

  // For "confirm close" logic to confirm leaving
  function handleBackPress() {
    setConfirmClose(true);
  }

  return (
    <VStack className="max-w-[440px] w-full" space="md">
      {/* Overlay for loading states */}
      <LoadingOverlay visible={isUpdating} title="Updating Password..." />

      <VStack className="md:items-center" space="md">
        <Pressable onPress={handleBackPress}>
          <Icon
            as={ArrowLeftIcon}
            className="md:hidden stroke-background-800"
            size="xl"
          />
        </Pressable>
        {confirmClose && <ConfirmClose dismissToURL="/(auth)/(signin)" />}

        <VStack>
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
                  <InputSlot onPress={handleState} className="pr-3">
                    <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
                  </InputSlot>
                </Input>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon size="sm" as={AlertTriangle} />
              <FormControlErrorText>
                {errors.password?.message}
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
                  <InputSlot onPress={handleConfirmPwState} className="pr-3">
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
                {errors.confirmpassword?.message}
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
      <ResetPasswordAuthForm />
    </AuthLayout>
  );
};
