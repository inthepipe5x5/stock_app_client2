import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useToast } from "@/components/ui/toast";
import { AlertTriangle, CheckCircle, Info, X } from "lucide-react-native";
import { Toast, ToastTitle, ToastDescription } from "@/components/ui/toast";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonIcon } from "../ui/button";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import isTruthy from "@/utils/isTruthy";

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
  showMessage: (msg: AuthMessage) => void;
  clearMessages: () => void;
  createUser?: (userData?: any) => void;
  // store ephemeral user data during signup
  tempUser: any;
  setTempUser: React.Dispatch<React.SetStateAction<any>>;
  messages: AuthMessage[];
  setMessages: React.Dispatch<React.SetStateAction<AuthMessage[]>>;
}

/**
 * Create the AuthContext with a default `undefined` so we can check usage.
 */
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const { state, dispatch, signOut, signIn } = useUserSession();

  // local state for ephemeral usage
  const [messages, setMessages] = useState<AuthMessage[]>([]);
  const [tempUser, setTempUser] = useState<any>(null);

  /**
   * Displays a new message (error, info, or success) using toasts.
   */
  const showMessage = useCallback(
    (msg: AuthMessage) => {
      let icon: JSX.Element | null = null;
      let variant: "solid" | "outline" | "subtle" = "solid";

      switch (msg.type) {
        case "error":
          icon = <AlertTriangle size={20} />;
          variant = "solid";
          break;
        case "info":
          icon = <Info size={20} />;
          variant = "outline";
          break;
        case "success":
          icon = <CheckCircle size={20} />;
          variant = "solid";
          break;
      }

      /* The `defaultCallToAction` function is defining a default call to action button that can be used
     in the toast message. It creates a Button component with specific styling based on the type of
     message (error, info, success). */
      const defaultCallToAction = (id: any, msg: AuthMessage) => (
        <Button
          className="ml-safe-or-5"
          variant={msg.type === "error" ? "outline" : "solid"}
          action={msg.type === "error" ? "negative" : "primary"}
          size="sm"
          onPress={() => {
            if (msg.onDismiss) {
              // If user provided an onDismiss
              msg.onDismiss();
            } else {
              // Close the toast
              toast.close(id);
            }
            // Also remove from local messages array
            console.log("removing message", msg);
            setMessages((prev) => prev.filter((m) => m !== msg));
          }}
        >
          <ButtonIcon as={X} size="sm" />
        </Button>
      );

      toast.show({
        placement: "bottom right",
        duration: msg.duration ?? 5000,
        render: ({ id }) => {
          // conditionally render custom CTA
          let callToAction = msg?.ToastCallToAction
            ? msg?.ToastCallToAction
            : defaultCallToAction(id, msg);
          return (
            <Toast nativeID={id} variant={variant} action={msg.type}>
              <ToastTitle>
                <HStack className="flex-1" space="sm">
                  {icon}
                  {msg.title ?? msg.type.toUpperCase() ?? "Message"}
                </HStack>
              </ToastTitle>
              {msg.description && (
                <HStack>
                  <ToastDescription>{msg.description}</ToastDescription>
                  {
                    //custom CTA rendered here
                    callToAction
                  }
                </HStack>
              )}
            </Toast>
          );
        },
      });
      // add message to local state
      setMessages((prev) => [...prev, msg]);
    },
    [toast]
  );

  /**
   * Clears local messages if needed.
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  /**
   *  welcomeNewUser method
   */
  const welcomeNewUser = useCallback(
    (userData?: any) => {
      showMessage({
        type: "info",
        title: isTruthy(userData)
          ? `Welcome ${
              userData.name ??
              [userData.first_name, userData.last_name].join(" ")
            }!`
          : "user profile not completed yet",
        description: JSON.stringify(userData),
      });
    },
    [showMessage]
  );

  return (
    <AuthContext.Provider
      value={{
        showMessage,
        clearMessages,

        welcomeNewUser,
        tempUser,
        setTempUser,
        messages,
        setMessages,
      }}
    >
      {children}
    </AuthContext.Provider>
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
