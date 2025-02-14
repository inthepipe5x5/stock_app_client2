import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useToast } from "@/components/ui/toast";
import { AlertTriangle, CheckCircle, Info, X } from "lucide-react-native";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import { Toast, ToastTitle, ToastDescription } from "@/components/ui/toast";
import { HStack } from "@/components/ui/hstack";
import { Pressable } from "@/components/ui/pressable";
import { Button } from "../ui/button";

/**
 * Defines the shape of an auth message for toasts.
 */
export type AuthMessage = {
  type: "error" | "info" | "success";
  title?: string;
  subtitle?: string;
  description?: string;
  duration?: number;
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

      const defaultCallToAction = (id: any) => (
        <Button
          className="ml-safe-or-5"
          onPress={() => {
            // if user provided an onDismiss, call it, else close toast
            if (msg.onDismiss) {
              msg.onDismiss();
            } else {
              toast.close(id);
            }
          }}
        >
          <X size={16} />
        </Button>
      );

      toast.show({
        placement: "bottom right",
        duration: msg.duration ?? 5000,
        render: ({ id }) => {
          // conditionally render custom CTA
          let callToAction = msg?.ToastCallToAction
            ? msg?.ToastCallToAction
            : defaultCallToAction(id);
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
   *  createUser method
   */
  const createUser = useCallback(
    (userData?: any) => {
      showMessage({
        type: "info",
        title: "Create user not implemented yet",
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

        createUser,
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
