import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useMemo,
  useRef
} from "react";
import { router, RelativePathString } from "expo-router";
import { useForm, UseFormReturn, FormProvider } from "react-hook-form";
import { userSchema } from "@/lib/schemas/userSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { userProfile } from "@/constants/defaultSession";
import supabase from "@/lib/supabase/supabase";
//#region types
export type variant = 'login' | 'signup' | 'resetPassword'

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


/**
 * The properties / methods provided to consumers of this context.
 */
interface AuthContextProps {
  updateTempUser: (data: Partial<userProfile>) => void;
  form: UseFormReturn //useForm <z.infer<typeof schema>>;
  timeoutController?: AbortController | null;
  timeout?: number | null;
  handleFinalFormSubmit: (args: {
    CustomHandlerFn: (data: any) => Promise<any> | void;
    nextURL: RelativePathString;
    params: any;
  }) => any | void;
  handleFormChange: (
    data: { [key: string]: any },
    nextURL: RelativePathString,
    params?: { [key: string]: any }
  ) => void;
  handleCancel?: () => void;
  authVariant: number;
  setAuthVariant: React.Dispatch<React.SetStateAction<number>>;
  authVariantTitles: string[];
  authVariantValues: variant[];
  // abort: () => void;
  // clearTimer: (id: ReturnType<typeof setTimeout>) => void;
  // resetTimer: (ref: React.RefObject<ReturnType<typeof setTimeout>>, newDuration?: number) => void;
  // startTime: (global?: boolean, duration?: number) => void;
  submitBtnRef?: React.RefObject<any>
  tempUser: Partial<userProfile> | null | undefined;
  setTempUser: React.Dispatch<React.SetStateAction<Partial<userProfile> | null | undefined>>;
  hashedPassword: string | null | undefined;
  setHashedPassword: React.Dispatch<React.SetStateAction<string | null | undefined>>;
  // captchaToken: string | null | undefined;
  // setCaptchaToken: React.Dispatch<React.SetStateAction<string | null | undefined>>;
  basicSubmitHandler: (args: {
    customHandlerFn?: ((args: any) => Promise<any> | void) | null;
    submitKeys?: string[] | null;
  }) => Promise<any> | void;
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

  // #region state/refs
  // local state for ephemeral usage
  // const [messages, setMessages] = useState<AuthMessage[]>([]);

  // const globalSessionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null); //ref to store the timeout ID for the global timeout
  // const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null); //ref to store the blur timeout ID for the reset timer
  // const timeoutController = useRef<AbortController | null>(null); // Ref to store the timeout controller
  // const controller = useRef<AbortController | null>(null); //ref to store the abort controller for the timeout

  const submitBtnRef = useRef<any>(null); //ref to store the submit button for the form

  const [tempUser, setTempUser] = useState<Partial<userProfile> | null | undefined>(null); //state to store the existing user data
  const [hashedPassword, setHashedPassword] = useState<string | null | undefined>(null); //state to store the hashed password
  const authVariantTitles = useMemo(() => ['Login', 'Sign Up', 'Reset Your Password'], [])
  const authVariantValues = useMemo(() => ['login', 'sign Up', 'resetPassword'], []) as variant[];
  const [authVariant, setAuthVariant] = useState<number>(0)


  //#region useForm
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultFormValues ?? {},
    mode: "onBlur", //before submitting behavior
    reValidateMode: "onBlur", //after submitting behavior
    delayError: 2000, // Delay for error messages
    shouldFocusError: true, // Focus on the first error field
    shouldUnregister: true,
    resetOptions: {
      keepValues: true, // Keep the values when resetting the form
      keepDirty: false, // Keep the dirty state when resetting the form
      keepDefaultValues: true,
    },
  })
  //#endregion useForm

  //#region timeout handling
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

  // //aborts all timers 
  // const abort = useCallback(() => {
  //   controller.current = controller?.current ?? new AbortController(); // create a new controller if it doesn't exist 
  //   controller.current?.abort(); // abort the timeout
  //   return controller.current; // return the controller
  // }, [])

  // const clearTimer = (id: ReturnType<typeof setTimeout>) => {
  //   if (blurTimerRef.current === id) {
  //     clearTimeout(blurTimerRef.current);
  //     blurTimerRef.current = null; // reset the timer ref 
  //   }
  //   abort()
  // }

  // const resetTimer = (ref: React.RefObject<ReturnType<typeof setTimeout>>, newDuration: number = 5) => {
  //   if (!!ref?.current) {
  //     clearTimer(ref.current as unknown as ReturnType<typeof setTimeout>);
  //   } else {
  //     abort()
  //   }
  //   return setAbortableTimeout({
  //     callback: () => {
  //       handleAuthSessionTimeout("Your session timed out. Please try again.");
  //     },
  //     delay: 1000 * 60 * (newDuration ?? 5), //5 minutes by default
  //   });
  // }
  //#endregion timeout handling

  //#region handle form
  const handleCancel = () => {
    //reset form 
    // reset the form values to the default values
    form.reset(defaultFormValues ?? {}, {
      keepDefaultValues: true,
      keepValues: true,
      keepDirty: true,
    });

    router.canGoBack() ? router.back() : router.replace({
      pathname: "/(auth)" as RelativePathString,
      params: {
        message: "Auth session canceled. Please try again.",
      }
    });

    // abort();
    //clear form and redirect the user
    // handleAuthSessionTimeout("Auth session canceled. Please try again.");
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
      // resetTimer(blurTimerRef, bgTimeout ?? 5);
      // resetTimer(globalSessionTimerRef, bgTimeout ?? 10);
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
    async ({ CustomHandlerFn, nextURL, params }: {
      CustomHandlerFn: (data: any) => Promise<any> | void;
      nextURL: RelativePathString;
      params: any;
    }) => {
      //abort any pending requests
      // abort();
      // //clear bgBlur and global timers
      // clearTimer(blurTimerRef.current as unknown as ReturnType<typeof setTimeout>);
      // clearTimer(globalSessionTimerRef.current as unknown as ReturnType<typeof setTimeout>);
      //submit the form data
      const formData = form.getValues();
      //check if the form data is valid as per zod schema
      const isValid = schema?.asyncParse(formData); // check if value is valid as per zod schema
      if (isValid && await form.trigger()) {// trigger the form validation) {
        //submit the form data
        await CustomHandlerFn(formData);

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
        // resetTimer(blurTimerRef, bgTimeout ?? 5);
        // resetTimer(globalSessionTimerRef, bgTimeout ?? 10);

        //TODO: show toast later
        //show error message
        const errorMessage = form.formState.errors[formFieldToFocus]?.message ?? "Form submission failed. Please try again.";
        const errorTitle = form.formState.errors[formFieldToFocus]?.type ?? "Form submission failed.";
        const errorDescription = form.formState.errors[formFieldToFocus]?.message ?? "Please check the form fields and try again.";
        console.error("Form submission error", { errorMessage, errorTitle, errorDescription });
      }
    }, [])

  const updateTempUser = useCallback((data: Partial<userProfile>) => {
    setTempUser((prevUser) => {
      return {
        ...prevUser,
        ...data,
      };
    });
  }, []);



  //function to handle basic email, password and/or confirmPassword submit to supabase
  const basicSubmitHandler = useCallback(async ({ customHandlerFn = null, submitKeys = null }: { customHandlerFn?: ((args: any) => Promise<any> | void) | null; submitKeys?: string[] | null; }) => {
    const currentAuthVariant = authVariantValues[authVariant];
    let submitHandlerFn = null;
    switch (true) {
      case !!customHandlerFn && typeof customHandlerFn === "function":
        submitHandlerFn = customHandlerFn;
      // break;
      case !!submitKeys && (submitKeys ?? []).every((key) => Object.keys(form.getValues()).includes(key)):
        break;
      default:
        throw new Error("Invalid submit handler or submit keys");
    }
    ['email', 'password', 'confirmPassword']

    const submitData = Object.entries(form.getValues()).reduce<Map<string, any>>((mappedData, [key, value]) => {
      if (submitKeys?.includes(key)) {
        mappedData.set(key, value);
      }
      return mappedData;
    }, new Map<string, any>());
    let submitFn = (data: any) => console.log("Form submit data: (no function assigned)", data);

    //check if the form data is valid as per zod schema or form validation if no schema
    const isValid = !!schema ? schema?.asyncParse(submitData) : await form.trigger(Object.keys(submitData), {
      shouldFocus: true
    }) // check if value is valid as per zod schema

    if (!!isValid) {
      switch (true) {
        case !!customHandlerFn && typeof customHandlerFn === "function" && !!submitKeys:
          submitFn = async () => {
            const data = form.getValues(submitKeys ?? []);
            return await customHandlerFn(Object.fromEntries(submitKeys.map(key => [key, (data as Record<string, any>)[key]])))
          };
          break;
        case currentAuthVariant === 'login':
          submitFn = async () => {
            const { data, error } = await supabase.auth.signInWithPassword({
              email: form.getValues("email"),
              password: form.getValues("password"),
            });
            if (error) throw new Error(error.message);
            return data;
          };
          break;
        case currentAuthVariant === 'resetPassword':
          submitFn = async () => {
            const { data, error } = await supabase.auth.resetPasswordForEmail(form.getValues("email"));
            if (error) throw new Error(error.message);
            return data;
          };
          break;
        case currentAuthVariant === 'signup':
          submitFn = async () => {
            const { data, error } = await supabase.auth.signUp({
              email: form.getValues("email"),
              password: form.getValues("password"),
            });
            if (error) throw new Error(error.message);
            return data;
          };
          break;

      }

      const response = await submitFn(submitData);
      console.log("Form submit response: ", response);
      return response;
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
    }
  }, []);

  const focusNextErrorField = useCallback(() => {
    //focus the field with error or last dirty field
    const formFieldToFocus = Object.keys(form.formState.errors)[0]
      ?? Object.keys(form.formState.dirtyFields)[0];
    if (formFieldToFocus) {
      form.setFocus(formFieldToFocus);
    }
  }
    , []);

  //#region timer
  // const startTimer = (global: boolean = false, duration: number = (timeout ?? 10)) => {
  //   (global ? globalSessionTimerRef : blurTimerRef).current = setAbortableTimeout({
  //     callback: () => {
  //       handleAuthSessionTimeout("Your session timed out. Please try again.");
  //     },
  //     delay: 1000 * 60 * (duration ?? (global ? 10 : 5)), //10 minutes by default
  //   });
  // }

  //#region reset effect
  // //effect to clear the form and reset the user state when the AppState changes or if the user doesn't finish the process
  // useEffect(() => {

  //   //set the globalSessionTimerRef on mount
  //   startTimer(true, 10);

  //   const bgTimeout = AppState.addEventListener('change', (nextAppState) => {
  //     if (nextAppState === 'background') {
  //       //cancel the global timer 

  //       //set a new, shorter timer for the background state
  //       startTimer(false, Number(bgTimeout) ?? 5); //5 minutes by default
  //     }
  //   }
  //   );

  //   return () => {
  //     resetTimer(blurTimerRef);
  //     resetTimer(globalSessionTimerRef);
  //     bgTimeout.remove(); // remove the event listener when the component unmounts
  //     // setTempUser({});
  //     // setMessages([]);
  //   };

  // }, [form, defaultFormValues]);

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
        authVariant,
        setAuthVariant,
        authVariantTitles,
        authVariantValues,
        // captchaToken: null, // Provide a default value or state for captchaToken
        // setCaptchaToken: () => { }, // Provide a default function or state setter for setCaptchaToken
        submitBtnRef: useMemo(() => submitBtnRef.current, [submitBtnRef]),
        hashedPassword: useMemo(() => hashedPassword, [hashedPassword]),
        setHashedPassword: useMemo(() => setHashedPassword, [setHashedPassword]),
        basicSubmitHandler,
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
