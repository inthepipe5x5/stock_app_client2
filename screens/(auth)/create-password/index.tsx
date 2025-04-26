import { useEffect, useState } from "react";
import { Keyboard } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Toast, ToastDescription, ToastTitle, useToast } from "@/components/ui/toast";
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
import { usePathname, useRouter, Stack, useLocalSearchParams } from "expo-router";
import { AuthLayout } from "../layout";
import {
  CreatePasswordSchemaType,
  createPasswordSchema,
} from "@/lib/schemas/passwordSchema";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import {
  getProfile,
  getUserProfileByEmail,
  registerUserAndCreateProfile,
} from "@/lib/supabase/session";
import { useMutation } from "@tanstack/react-query";
import LoadingOverlay from "@/components/navigation/TransitionOverlayModal";
import ConfirmClose from "@/components/navigation/ConfirmClose";
import { AlertTriangle } from "lucide-react-native";
import { HStack } from "@/components/ui/hstack";
import supabase from "@/lib/supabase/supabase";
import { fetchProfile } from "@/lib/supabase/session";
import defaultSession from "@/constants/defaultSession";
import { useAuth } from "@/components/contexts/authContext";
// import Captcha from "@/components/Captcha";
import Footer from "@/components/navigation/Footer";
import SubmitButton from "@/components/navigation/SubmitButton";
import { emailOnlySignUp } from "@/lib/schemas/authSchemas";
import { ZodError } from "zod";

export const CreatePasswordAuthForm = ({
  title,
  form,
  // onSubmit,
}: {
  form: ReturnType<typeof useForm>
  title?: string;
}) => {
  const authContext = useAuth();
  const [confirmClose, setConfirmClose] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { control, formState: { errors } } = form;

  const toggleShowPassword = () => {
    setShowConfirmPassword((showState) => {
      return !showState;
    });
  };
  const handleKeyPress = () => {
    Keyboard.dismiss();
    // handleSubmit((data) => onSubmit(state?.user?.email as string, data))();

    //validate password fields
    form.trigger(["password", "confirmPassword"], { shouldFocus: true });
  };

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
          {<ConfirmClose visible={confirmClose} setDisplayAlertFn={setConfirmClose} dismissToURL="/(auth)/(signin)" title="Are you sure you want to go back?" description="Click this button if you want to cancel and discard any unsaved progress." />}
          <Heading className="md:text-center" size="3xl">
            {title ?? "Create new password"}
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
                  <InputSlot onPress={() => toggleShowPassword()} className="pr-3">
                    <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
                  </InputSlot>
                </Input>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon size="sm" as={AlertTriangle} />
              <FormControlErrorText>
                {!!errors?.password?.message ? String(errors.password.message) : "Invalid password"}
              </FormControlErrorText>
            </FormControlError>
            <FormControlLabel>
              <FormControlLabelText className="text-typography-500">
                Must be at least 8 characters
              </FormControlLabelText>
            </FormControlLabel>
          </FormControl>

          {/* Confirm Password Field */}
          <FormControl isInvalid={!!errors.confirmPassword}>
            <FormControlLabel>
              <FormControlLabelText>Confirm Password</FormControlLabelText>
            </FormControlLabel>
            <Controller
              defaultValue=""
              name="confirmPassword"
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
                {!!errors?.confirmPassword?.message ? String(errors.confirmPassword.message) :
                  !!errors?.confirmPassword?.message ? String(errors?.confirmPassword?.message) :
                    "Both passwords must match"}
              </FormControlErrorText>
            </FormControlError>
            <FormControlLabel>
              <FormControlLabelText className="text-typography-500">
                Must match the password entered above
              </FormControlLabelText>
            </FormControlLabel>
          </FormControl>
        </VStack>
      </VStack>
    </VStack>
  );
};

export const CreatePassword = () => {

  const params = useLocalSearchParams();
  const [variant, setVariant] = useState<'reset' | 'new'>('new');
  // const [showCaptcha, setShowCaptcha] = useState<boolean>(false);
  const pathname = usePathname();
  const globalContext = useUserSession();
  const { state } = globalContext || defaultSession;
  const authContext = useAuth();
  const { tempUser, setTempUser } = authContext;
  const { formState, getValues } = authContext?.form
  const toast = useToast();
  const router = useRouter();
  //set tempUser values to be used as default values
  useEffect(() => {
    if (!!!tempUser?.email) {
      if (setTempUser) {
        setTempUser({
          ...tempUser,
          email: params?.email?.[0] ?? state?.user?.email ?? ""
        });
      }
    }

  }, [params?.email, state?.user?.email]);

  //effect to set the variant based on the pathname
  useEffect(() => {
    String(params?.variant?.[0]) === 'reset' ? setVariant('reset') : setVariant('new');
    if (pathname.split("/").includes("(signin)") || pathname.split("/").includes("reset")) {
      setVariant('reset');
    } else {
      setVariant('new');
    }
  }, [pathname, params?.variant]);

  const validateData = async ({
    email, password, confirmPassword }: {
      email: string,
      password: string,
      confirmPassword: string
    }) => {
    try {

      if (!!![email, password, confirmPassword].every(Boolean)) {
        throw new Error("Please fill in all fields");
      }
      //check if email is valid
      await emailOnlySignUp.parseAsync({
        email
      })
      //check passwords
      await createPasswordSchema.parseAsync({
        password,
        confirmPassword
      })
      //check if user has an account
      const user = await supabase.from('profiles')
        .select('email,draft_status')
        .eq('email', email)
        .single();
      console.log('user', { user })

      if (!!user?.error || !!!user) {
        setVariant('new')
        console.error("Error fetching user", user.error);
        throw !!!user ? new Error('No user fetched') : user?.error;
      }

      else if (user?.data?.draft_status === 'draft') {
        setVariant('new');
      }
      return true;

    } catch (error: any) {
      console.error("Error validating data", error);
      // authContext.setCaptchaToken(null) //create the captcha token
      if (error instanceof ZodError) {
        authContext?.form?.setFocus('password')
        authContext?.form?.setError('password', {
          type: "manual",
          message: error.message,
        });
        return false;
      }
    }
  }

  const onSubmit = async (
  ) => {
    try {
      const data = {
        email: tempUser?.email ?? getValues("email"),
        password: tempUser?.email ?? getValues("password"),
        confirmPassword: tempUser?.email ?? getValues("confirmPassword"),
      };
      // Validate the data
      const isValid = await validateData(data)

      if (!!!isValid) {
        console.error("Invalid data", data);
        toast.show({
          placement: "bottom right",
          duration: 5000,
          render: ({ id }) => {
            return (
              <Toast nativeID={id} variant="outline" action="error">
                <ToastTitle>Invalid Email or Password</ToastTitle>
                <ToastDescription>Please try again.</ToastDescription>
              </Toast>
            );
          }
        });
        return authContext?.form?.setFocus('password')
      }
      // Dismiss keyboard
      Keyboard.dismiss();

      let response;
      if (variant === "reset") {
        response = await supabase.auth.updateUser({
          email: data.email,
          password: data.password,
        });
      } else {
        response = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
        });
      }

      console.log("response", response);

      if (response.error) {
        console.error("Error updating user password:", response.error);
        throw response.error;
      }

      const { data: userProfile, error: profileError } = await fetchProfile({
        searchKey: "email",
        searchKeyValue: data.email,
      });

      console.log("fetched profile", userProfile, profileError);

      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        throw profileError;
      }
      //check for missing values => throw error
      const missingValues = [state, userProfile, response.data]
        .map((value, index) => (!value ? ['state', 'userProfile', 'response.data'][index] : null))
        .filter(Boolean);

      if (missingValues.length > 0) {
        const errorMessage = `Missing values: ${missingValues.join(', ')}`;
        throw new Error(errorMessage);
      }

      //handle succcess
      toast.show({
        placement: "bottom right",
        duration: 5000,
        render: ({ id }) => {
          return (
            <Toast nativeID={id} variant="outline" action="success">
              <ToastTitle>Success</ToastTitle>
              <ToastDescription>{variant === "reset" ? "Password reset successfully" : "Account created successfully"}</ToastDescription>
            </Toast>
          );
        }
      });

      // //clear auth context
      // authContext?.setCaptchaToken(null)
      // authContext?.abort(); //clear the timer

      //update global context
      globalContext?.dispatch({
        type: "SET_NEW_SESSION", payload: {
          session: response.data,
          user: userProfile ?? {},
        }
      });
      console.log("updated state", state);

      router.replace({
        pathname: !!!userProfile || userProfile?.draft_status === "draft" ? "/(auth)/(signup)" : "/(tabs)/(dashboard)",
        params: {
          email: userProfile?.email ?? data?.email,
          variant: userProfile?.draft_status === "confirmed" ? "reset" : "new",
          user_id: response?.data?.user?.id ?? "",
        },
      });
    } catch (error: any) {
      console.error("Error creating password:", error);
      toast.show({
        placement: "bottom right",
        duration: 5000,
        render: ({ id }) => {
          return (
            <Toast nativeID={id} variant="outline" action="error">
              <ToastTitle>Error Creating Password</ToastTitle>
              <ToastDescription>{error.message}</ToastDescription>
            </Toast>
          );
        }
      });
      // authContext?.setCaptchaToken(null) //create the captcha token
      authContext?.form?.setFocus('password')
      authContext?.form?.setError('password', {
        type: "manual",
        message: error.message,
      });
      console.error("Error creating password:", error);
    };
  }
  return (
    <AuthLayout showSSOProviders={true}>
      <CreatePasswordAuthForm
        title={variant === "reset" ? "Reset Password" : "Create Password"}
        form={authContext?.form}
      />
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
          <SubmitButton
            focusRef={authContext?.submitBtnRef}
            btnText={"Create Password"}
            onSubmit={onSubmit}
            disabled={!formState.isValid || !formState.isDirty || formState.isSubmitting}
            cnStyles={{
              text: "text-background-100 disabled:text-background-500",
              btn: "bg-background-800  hover:bg-background-700 disabled:bg-background-200 disabled:opacity-50"
            }}
          />

        }
      />
    </AuthLayout>
  );
};
