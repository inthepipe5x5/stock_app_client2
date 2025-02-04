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
  duplicateUserCheck,
  registerUserAndCreateProfile,
} from "@/lib/supabase/session";
import { useQuery, useMutation } from "@tanstack/react-query";
import LoadingOverlay from "@/components/navigation/TransitionOverlayModal";
import ConfirmClose from "@/components/navigation/ConfirmClose";
import { AlertTriangle } from "lucide-react-native";

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
  } = useForm<CreatePasswordSchemaType>({
    resolver: zodResolver(createPasswordSchema),
  });

  // Check if user already exists with this email
  const {
    data: dupCheckData,
    refetch: checkDuplicate,
    isFetching: isDupFetching,
  } = useQuery(
    ["duplicateUserCheck", state.email],
    () => duplicateUserCheck(state.email),
    {
      enabled: false, // we call refetch manually in onSubmit
      staleTime: 1000 * 60 * 5,
    }
  );

  // Mutation for registering the user
  const {
    mutate: registerUser,
    isLoading: isRegistering,
    error: registerError,
  } = useMutation(registerUserAndCreateProfile, {
    onSuccess: (result) => {
      // If supabase signUp successful
      toast.show({
        placement: "bottom right",
        render: ({ id }) => (
          <Toast nativeID={id} variant="solid" action="success">
            <ToastTitle>User registered successfully!</ToastTitle>
          </Toast>
        ),
      });
      // 1) Update session context with new user data
      dispatch({ type: "SET_SESSION", payload: result?.sessionData });

      // 2) Possibly navigate to a new screen
      router.push("/(tabs)/home");
    },
    onError: (err: any) => {
      toast.show({
        placement: "bottom right",
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

    // 1) Check for existing user
    const { error, data: checkData } = await checkDuplicate();
    if (error) {
      // Supabase error
      toast.show({
        placement: "bottom right",
        render: ({ id }) => (
          <Toast nativeID={id} variant="solid" action="error">
            <ToastTitle>
              {error.message ?? "Error checking existing user"}
            </ToastTitle>
          </Toast>
        ),
      });
      return;
    }

    const existingUser = dupCheckData?.existingUser;
    if (existingUser && existingUser.length > 0) {
      // If user found => update session & redirect to sign in
      dispatch({
        type: "UPDATE_USER",
        payload: {
          email: state.email,
          // other fields if needed
        },
      });
      toast.show({
        placement: "bottom right",
        render: ({ id }) => (
          <Toast nativeID={id} variant="solid" action="info">
            <ToastTitle>User found. Please sign in.</ToastTitle>
          </Toast>
        ),
      });
      //reset form
      reset();
    }
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

  return (
    <VStack className="max-w-[440px] w-full" space="md">

      {/* The overlay to indicate loading states */}
      <LoadingOverlay
        visible={isDupFetching || isRegistering}
        title="Loading..."
      />
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
                    returnKeyType="done"
                    type={showPassword ? "text" : "password"}
                  />
                  <InputSlot
                    onPress={() => handleState(!showPassword)}
                    className="pr-3"
                  >
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
                    returnKeyType="done"
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
