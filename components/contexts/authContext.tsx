import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useDeferredValue

} from "react";
import { AppState } from "react-native";
import { useLocalSearchParams, router, RelativePathString } from "expo-router";
import { useToast } from "@/components/ui/toast";
import { AlertTriangle, CheckCircle, Info, X } from "lucide-react-native";
import { Toast, ToastTitle, ToastDescription } from "@/components/ui/toast";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonIcon } from "../ui/button";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import isTruthy from "@/utils/isTruthy";
import { useForm, UseFormReturn, FormProvider, Form } from "react-hook-form";
import { userSchema } from "@/lib/schemas/userSchemas";
import { setAbortableTimeout } from "@/hooks/useDebounce";
import { zodResolver } from "@hookform/resolvers/zod";
import { userProfile } from "@/constants/defaultSession";
import { upsertUserProfile } from "@/lib/supabase/session";
import supabase from "@/lib/supabase/supabase";

/**
 * Defines the shape of an auth message for toasts.
 */
export type AuthMessage = {
  type: "error" | "info" | "success";
  title?: string | undefined | null;
  subtitle?: string | undefined | null;
  description?: string | undefined | null;
  duration?: number | undefined | null;
  onDismiss?: () => void;
  ToastCallToAction?: ReactNode;
};


type TransactionContextProps = {
  redirectProps: {
    pathname: string;
    params: Record<string, any>;
  } | null;
  setRedirectProps: React.Dispatch<React.SetStateAction<{
    pathname: string;
    params: Record<string, any>;
  } | null>>;
  transactionMetaData: {
    id: string | null | undefined;
    type: string | null | undefined;
  } | null | undefined;
  setTransactionMetaData: React.Dispatch<React.SetStateAction<{
    id: string | null | undefined;
    type: string | null | undefined;
  } | null | undefined>>;
  checkTransactionExpiration: () => boolean;
  updateCaptchaThenRedirect: (newToken: string) => void;
} | null

export const CaptchaContext = createContext<TransactionContextProps>(null);

export const CaptchaProvider = ({ children }: { children: React.ReactNode }) => {
  const [redirectProps, setRedirectProps] = useState<{
    pathname: string;
    params: Record<string, any>;
  } | null>(null);
  const [transactionMetaData, setTransactionMetaData] = useState<{
    id: string | null | undefined;
    type: string | null | undefined;
  } | null>(null);
  const [startTime, setStartTime] = useState<number>(Number(new Date().getTime().toString()));
  // const pathname = usePathname();
  // const params = useLocalSearchParams();
  const transactionStartTime = useDeferredValue(Number(new Date().getTime().toString()));

  // Function to get the captcha token and redirect to the captcha page if needed
  const checkTransactionExpiration = useCallback(() => {
    //check captchaToken expiration
    if (startTime) {
      const createdDate = new Date(startTime);
      const currentDate = new Date();
      const diffTime = Math.abs(currentDate.getTime() - createdDate.getTime());
      const diffMinutes = Math.ceil(diffTime / (1000 * 60));
      //check if the token is older than 5 minutes
      if (diffMinutes > 5) {
        return false;
      }
      return true
    }
  }, []);


  // Function to update the captcha token and redirect to the original page
  const saveDraftThenRedirect = useCallback((newToken: string) => {
    setCaptchaToken({
      token: newToken,
      date: new Date().toISOString()
    });

    router.setParams({ captcha: 'verified' }); // set params to verify captcha
    //if redirectProps is not null, redirect to the original page
    !!redirectProps ?
      router.dismissTo(
        redirectProps?.pathname as RelativePathString,
        redirectProps?.params
      ) :
      router.back(); // go back to the previous page if redirectProps is not set


    setRedirectProps(null); // clear redirect props}
  }
    , []);

  const value = useMemo(() => ({
    // captchaToken,
    // setCaptchaToken,
    redirectProps,
    setRedirectProps,
    updateCaptchaThenRedirect,
  }), [])
  // [captchaToken]);

}

export const useCaptchaContext = () => {
  const context = useContext(CaptchaContext);
  if (!context) {
    throw new Error('useCaptchaContext must be used within a CaptchaProvider');
  }
  return context;
}


/**
 * The properties / methods provided to consumers of this context.
 */
interface AuthContextProps {
  updateTempUser: (data: Partial<userProfile>) => void;
  form: UseFormReturn //useForm <z.infer<typeof schema>>;
  timeoutController?: AbortController | null;
  timeout?: number | null;
  handleFinalFormSubmit: (args: {
    submitFn: (data: any) => Promise<any> | void;
    nextURL: RelativePathString;
    params: any;
  }) => any | void;
  handleFormChange: (
    data: { [key: string]: any },
    nextURL: RelativePathString,
    params?: { [key: string]: any } | null | undefined
  ) => void;
  handleCancel?: () => void;
  abort: () => void;
  clearTimer: (id: ReturnType<typeof setTimeout>) => void;
  resetTimer: (ref: React.RefObject<ReturnType<typeof setTimeout>>, newDuration?: number) => void;
  startTime: (global?: boolean, duration?: number) => void;
  submitBtnRef?: React.RefObject<any>
  tempUser: Partial<userProfile> | null | undefined;
  setTempUser: React.Dispatch<React.SetStateAction<Partial<userProfile> | null | undefined>>;
  hashedPassword: string | null | undefined;
  setHashedPassword: React.Dispatch<React.SetStateAction<string | null | undefined>>;
  captchaToken: string | null | undefined;
  setCaptchaToken: React.Dispatch<React.SetStateAction<string | null | undefined>>;
}

/**
 * Create the AuthContext with a default `undefined` so we can check usage.
 */
const AuthContext = createContext<AuthContextProps | undefined>(undefined);


type AuthProviderProps = {
  children: ReactNode
  defaultFormValues?: { [key: string]: any } | null | undefined
  schema?: any
  timeout?: number | null | undefined //optional timeout in minutes for the session
  bgTimeout?: number | null | undefined //optional timeout in minutes for the session
  onTimeoutEffect?: ((data: any) => any | void) | null | undefined //optional effect to run when the session times out
}

export function AuthProvider({
  children,
  defaultFormValues,
  onTimeoutEffect,
  schema = userSchema,
  timeout = 10,
  bgTimeout = 5, //optional timeout in minutes for the session
}:
  AuthProviderProps) {

  // local state for ephemeral usage
  // const [messages, setMessages] = useState<AuthMessage[]>([]);

  const globalSessionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null); //ref to store the timeout ID for the global timeout
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null); //ref to store the blur timeout ID for the reset timer
  const controller = useRef<AbortController | null>(null); //ref to store the abort controller for the timeout
  const submitBtnRef = useRef<any>(null); //ref to store the submit button for the form

  const [tempUser, setTempUser] = useState<Partial<userProfile> | null | undefined>(null); //state to store the existing user data
  const [hashedPassword, setHashedPassword] = useState<string | null | undefined>(null); //state to store the hashed password
  const [captchaToken, setCaptchaToken] = useState<string | null | undefined>(null); //state to store the captcha token
  const timeoutController = useRef<AbortController | null>(null); // Ref to store the timeout controller

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultFormValues ?? {},
    mode: "onBlur", //before submitting behavior
    reValidateMode: "onBlur", //after submitting behavior
    delayError: 2000, // Delay for error messages
    shouldFocusError: true, // Focus on the first error field
    shouldUnregister: true,
    resetOptions: {
      keepValues: false, // Keep the values when resetting the form
      keepDirty: false, // Keep the dirty state when resetting the form
      keepDefaultValues: true,
    },
  })
  const handleAuthSessionTimeout = useCallback((
    message?: string,
    params: any = {},
    dismissToURL: RelativePathString = '/(auth)' as RelativePathString) => {
    //reset the form and user state
    form.reset(defaultFormValues ?? {});

    router.replace({
      pathname: dismissToURL,
      params: {
        message: message ?? "Your session timed out. Please try again.",
        ...params
      }
    })
  }
    , [form, defaultFormValues]);

  //aborts all timers 
  const abort = useCallback(() => {
    controller.current = controller?.current ?? new AbortController(); // create a new controller if it doesn't exist 
    controller.current?.abort(); // abort the timeout
    return controller.current; // return the controller
  }, [])

  const clearTimer = (id: ReturnType<typeof setTimeout>) => {
    if (blurTimerRef.current === id) {
      clearTimeout(blurTimerRef.current);
      blurTimerRef.current = null; // reset the timer ref 
    }
    abort()
  }

  const resetTimer = (ref: React.RefObject<ReturnType<typeof setTimeout>>, newDuration: number = 5) => {
    if (!!ref?.current) {
      clearTimer(ref.current as unknown as ReturnType<typeof setTimeout>);
    } else {
      abort()
    }
    return setAbortableTimeout({
      callback: () => {
        handleAuthSessionTimeout("Your session timed out. Please try again.");
      },
      delay: 1000 * 60 * (newDuration ?? 5), //5 minutes by default
    });
  }
  const handleCancel = () => {
    abort();
    //clear form and redirect the user
    handleAuthSessionTimeout("Auth session canceled. Please try again.");
  }

  /** @function handleFormChange
   * @description
   * *Handles when form data is submitted and the user is not doing a final submit yet. *
   * The function validates and updates the form values before navigating the user to the next URL.
   * @param nextURL - The URL to navigate to after the form is submitted.
   * @param data - The form data to update.
   */
  const handleFormChange = useCallback((data: any = form.getValues(),
    nextURL: RelativePathString,
    params?: { [key: string]: any }) => {
    try {
      //check if the dirty/touched fields are valid


      //update the form values
      Object.entries(data).forEach(([key, value]) => {
        if (
          key in form.watch()
          &&
          schema.parseAsync({ [key]: value }) // check if value is valid as per zod schema
        ) form.setValue(key, value);
        setTempUser((prevUser) => {
          return {
            ...prevUser,
            [key]: value,
          };
        })
      });

      //redirect the user to the next URL
      router.push({
        pathname: nextURL,
        params: {
          ...params,
          message: "Form saved.",
        }
      })
    } catch (error) {
      console.error("Form change error", { error });
      //reset the timers to the default value of 10 minutes
      resetTimer(blurTimerRef, bgTimeout ?? 5);
      resetTimer(globalSessionTimerRef, bgTimeout ?? 10);
      //soft reset the form values to the default values
      form.reset(defaultFormValues ?? {}, {
        keepDefaultValues: true,
        keepValues: true,
        keepDirty: true,
      }); // reset the form values to the default values
      //focus the field with error or last dirty field
      const formFieldToFocus = Object.keys(form.formState.errors)[0]
        ?? Object.keys(form.formState.dirtyFields)[0];
      if (formFieldToFocus) {
        form.setFocus(formFieldToFocus);
      }
    }


  }, []);

  const handleFinalFormSubmit = useCallback(
    async ({ submitFn, nextURL, params }: {
      submitFn: (data: any) => Promise<any> | void;
      nextURL: RelativePathString;
      params: any;
    }) => {

      //abort any pending requests
      abort();
      //clear bgBlur and global timers
      clearTimer(blurTimerRef.current as unknown as ReturnType<typeof setTimeout>);
      clearTimer(globalSessionTimerRef.current as unknown as ReturnType<typeof setTimeout>);
      //submit the form data
      const formData = form.getValues();
      //check if the form data is valid as per zod schema
      const isValid = schema?.asyncParse(formData); // check if value is valid as per zod schema
      if (isValid && await form.trigger()) {// trigger the form validation) {
        //submit the form data
        const submittedData = await submitFn(formData);

        form.unregister(); // unregister the form fields
        form.clearErrors(); // clear the form errors
        form.reset(); // reset the form values
        router.replace({
          pathname: nextURL,
          params: {
            ...params,
            message: "Form submitted successfully.",
          }
        })
      } else {
        // handleAuthSessionTimeout("Form submission failed. Please try again.");
        form.reset(defaultFormValues ?? {}, {
          keepDefaultValues: true,
          keepValues: true,
          keepDirty: true,
        }); // reset the form values to the default values
        //focus the field with error or last dirty field
        const formFieldToFocus = Object.keys(form.formState.errors)[0]
          ?? Object.keys(form.formState.dirtyFields)[0];
        if (formFieldToFocus) {
          form.setFocus(formFieldToFocus);
        }
        //reset the timers to the default value of 10 minutes
        resetTimer(blurTimerRef, bgTimeout ?? 5);
        resetTimer(globalSessionTimerRef, bgTimeout ?? 10);
        //show error message
        const errorMessage = form.formState.errors[formFieldToFocus]?.message ?? "Form submission failed. Please try again.";
        const errorTitle = form.formState.errors[formFieldToFocus]?.type ?? "Form submission failed.";
      }
    }, [])

  const startTimer = (global: boolean = false, duration: number = (timeout ?? 10)) => {
    (global ? globalSessionTimerRef : blurTimerRef).current = setAbortableTimeout({
      callback: () => {
        handleAuthSessionTimeout("Your session timed out. Please try again.");
      },
      delay: 1000 * 60 * (duration ?? (global ? 10 : 5)), //10 minutes by default
    });
  }
  const updateTempUser = useCallback((data: Partial<userProfile>) => {
    setTempUser((prevUser) => {
      return {
        ...prevUser,
        ...data,
      };
    });
  }, []);

  //effect to clear the form and reset the user state when the AppState changes or if the user doesn't finish the process
  useEffect(() => {

    //set the globalSessionTimerRef on mount
    startTimer(true, 10);

    const bgTimeout = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background') {
        //cancel the global timer 

        //set a new, shorter timer for the background state
        startTimer(false, Number(bgTimeout) ?? 5); //5 minutes by default
      }
    }
    );

    return () => {
      resetTimer(blurTimerRef);
      resetTimer(globalSessionTimerRef);
      bgTimeout.remove(); // remove the event listener when the component unmounts
      // setTempUser({});
      // setMessages([]);
    };

  }, [form, defaultFormValues]);

  return (
    <AuthContext.Provider
      value={{
        form,
        handleFinalFormSubmit,
        handleFormChange,
        tempUser: useMemo(() => tempUser, [tempUser]),
        updateTempUser,
        setTempUser,
        handleCancel,
        abort,
        clearTimer,
        resetTimer,
        startTimer,
        submitBtnRef: useMemo(() => submitBtnRef.current, [submitBtnRef]),
        timeoutController: useMemo(() => timeoutController.current, [timeoutController]),
        captchaToken: useMemo(() => captchaToken, [captchaToken]),
        setCaptchaToken: useMemo(() => setCaptchaToken, [setCaptchaToken]),
        hashedPassword: useMemo(() => hashedPassword, [hashedPassword]),
        setHashedPassword: useMemo(() => setHashedPassword, [setHashedPassword]),
      }}
    >
      <FormProvider {...form}>
        {children}
      </FormProvider>
    </AuthContext.Provider >
  );
}

/**
 * A helper hook to consume the AuthContext easily.
 */
export function useAuth(): AuthContextProps {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
