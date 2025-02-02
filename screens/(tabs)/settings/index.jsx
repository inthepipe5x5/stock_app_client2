import DashboardLayout from "@/screens/_layout";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import defaultUserPreferences from "@/constants/userPreferences";
import { useEffect, useState } from "react";
import SettingsForm from "./form";

//settings screen
const SettingsView = (props) => {
  const [userPreferences, setUserPreferences] = useState({
    ...defaultUserPreferences,
  });
  const { state } = useUserSession();
  useEffect(() => {
    if (state && state.preferences) {
      //set preferences to state.preferences
      setUserPreferences((prevPreferences) => ({
        ...prevPreferences,
        ...state.preferences,
      }));
    }
  }, [state]);

  return <SettingsForm defaultValues={userPreferences} />;
};

export default () => (
  <DashboardLayout>
    <SettingsView />
  </DashboardLayout>
);
