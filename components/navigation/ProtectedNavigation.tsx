import React, { ReactElement, useEffect } from "react";
import { Redirect, SplashScreen } from "expo-router";
import { useUserSession } from "@/components/contexts/UserSessionProvider";

const ProtectedNavigation: React.FC<{ children: ReactElement }> = ({
  children,
}) => {
  return () => {
    const { state, isAuthenticated } = useUserSession();

    useEffect(() => {
      SplashScreen.preventAutoHideAsync();
      if (isAuthenticated && state !== null) {
        SplashScreen.hideAsync();
      }
    }, [isAuthenticated]);

    if (!isAuthenticated) {
      return <Redirect href="/(auth)" />;
    }

    return <>{children}</>;
  };
};

export default ProtectedNavigation;
