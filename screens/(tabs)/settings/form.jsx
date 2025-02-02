import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import defaultUserPreferences from "@/constants/userPreferences";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlErrorIcon,
  FormControlLabel,
  FormControlLabelText,
  FormControlHelper,
  FormControlHelperText,
} from "@/components/ui/form-control";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";
import { VStack } from "@/components/ui/vstack";
import settingsSchema from "@/lib/schemas/settingsSchema";
import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/screens/_layout";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import { fetchProfile } from "@/lib/supabase/session";
import { ConfirmClose } from "@/components/ui/ConfirmClose";
import { supabase } from "@/lib/supabase/client";

const SettingsForm = (props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: props?.defaultValues ?? defaultUserPreferences,
  });

  const onSubmit = (data) => {
    console.log(data);
    // handle form submission
    props.handleSubmit(data);
  };

  return (
    <VStack className="w-full max-w-[300px] rounded-md border border-background-200 p-4">
      <FormControl isInvalid={errors.email} onSubmit={handleSubmit(onSubmit)}>
        <FormControlLabel>
          <FormControlLabelText>Email</FormControlLabelText>
        </FormControlLabel>
        <Input type="email" {...register("email")} />
        <FormControlErrorText>{errors.email?.message}</FormControlErrorText>
      </FormControl>

      <FormControl isInvalid={errors.username}>
        <FormControlLabel>
          <FormControlLabelText>Username</FormControlLabelText>
        </FormControlLabel>
        <Input type="text" {...register("username")} />
        <FormControlErrorText>{errors.username?.message}</FormControlErrorText>
      </FormControl>

      <FormControl isInvalid={errors.theme}>
        <FormControlLabel>
          <FormControlLabelText>Theme</FormControlLabelText>
        </FormControlLabel>
        <Select {...register("theme")}>
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </Select>
        <FormControlErrorText>{errors.theme?.message}</FormControlErrorText>
      </FormControl>

      <FormControl isInvalid={errors.fontSize}>
        <FormControlLabel>
          <FormControlLabelText>Font Size</FormControlLabelText>
        </FormControlLabel>
        <Select {...register("fontSize")}>
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </Select>
        <FormControlErrorText>{errors.fontSize?.message}</FormControlErrorText>
      </FormControl>

      <FormControl isInvalid={errors.fontFamily}>
        <FormControlLabel>
          <FormControlLabelText>Font Family</FormControlLabelText>
        </FormControlLabel>
        <Select {...register("fontFamily")}>
          <option value="default">Default</option>
          <option value="serif">Serif</option>
          <option value="sans-serif">Sans-serif</option>
        </Select>
        <FormControlErrorText>
          {errors.fontFamily?.message}
        </FormControlErrorText>
      </FormControl>

      <>
        <FormControl isInvalid={errors.boldText}>
          <FormControlLabel>
            <FormControlLabelText>Bold Text</FormControlLabelText>
          </FormControlLabel>
          <Switch {...register("boldText")} />
          <FormControlErrorText>
            {errors.boldText?.message}
          </FormControlErrorText>
        </FormControl>

        <FormControl isInvalid={errors.highContrast}>
          <FormControlLabel>
            <FormControlLabelText>High Contrast</FormControlLabelText>
          </FormControlLabel>
          <Switch {...register("highContrast")} />
          <FormControlErrorText>
            {errors.highContrast?.message}
          </FormControlErrorText>
        </FormControl>

        <FormControl isInvalid={errors.reduceMotion}>
          <FormControlLabel>
            <FormControlLabelText>Reduce Motion</FormControlLabelText>
          </FormControlLabel>
          <Switch {...register("reduceMotion")} />
          <FormControlErrorText>
            {errors.reduceMotion?.message}
          </FormControlErrorText>
        </FormControl>

        <FormControl isInvalid={errors.screenReaderEnabled}>
          <FormControlLabel>
            <FormControlLabelText>Screen Reader Enabled</FormControlLabelText>
          </FormControlLabel>
          <Switch {...register("screenReaderEnabled")} />
          <FormControlErrorText>
            {errors.screenReaderEnabled?.message}
          </FormControlErrorText>
        </FormControl>

        <FormControl isInvalid={errors.hapticFeedback}>
          <FormControlLabel>
            <FormControlLabelText>Haptic Feedback</FormControlLabelText>
          </FormControlLabel>
          <Switch {...register("hapticFeedback")} />
          <FormControlErrorText>
            {errors.hapticFeedback?.message}
          </FormControlErrorText>
        </FormControl>

        <FormControl isInvalid={errors.notificationsEnabled}>
          <FormControlLabel>
            <FormControlLabelText>Notifications Enabled</FormControlLabelText>
          </FormControlLabel>
          <Switch {...register("notificationsEnabled")} />
          <FormControlErrorText>
            {errors.notificationsEnabled?.message}
          </FormControlErrorText>
        </FormControl>

        <FormControl isInvalid={errors.soundEffects}>
          <FormControlLabel>
            <FormControlLabelText>Sound Effects</FormControlLabelText>
          </FormControlLabel>
          <Switch {...register("soundEffects")} />
          <FormControlErrorText>
            {errors.soundEffects?.message}
          </FormControlErrorText>
        </FormControl>

        <FormControl isInvalid={errors.language}>
          <FormControlLabel>
            <FormControlLabelText>Language</FormControlLabelText>
          </FormControlLabel>
          <Input type="text" {...register("language")} />
          <FormControlErrorText>
            {errors.language?.message}
          </FormControlErrorText>
        </FormControl>

        <FormControl isInvalid={errors.autoPlayVideos}>
          <FormControlLabel>
            <FormControlLabelText>Auto Play Videos</FormControlLabelText>
          </FormControlLabel>
          <Switch {...register("autoPlayVideos")} />
          <FormControlErrorText>
            {errors.autoPlayVideos?.message}
          </FormControlErrorText>
        </FormControl>

        <FormControl isInvalid={errors.dataUsage}>
          <FormControlLabel>
            <FormControlLabelText>Data Usage</FormControlLabelText>
          </FormControlLabel>
          <Select {...register("dataUsage")}>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </Select>
          <FormControlErrorText>
            {errors.dataUsage?.message}
          </FormControlErrorText>
        </FormControl>

        <FormControl isInvalid={errors.colorBlindMode}>
          <FormControlLabel>
            <FormControlLabelText>Color Blind Mode</FormControlLabelText>
          </FormControlLabel>
          <Select {...register("colorBlindMode")}>
            <option value="none">None</option>
            <option value="protanopia">Protanopia</option>
            <option value="deuteranopia">Deuteranopia</option>
            <option value="tritanopia">Tritanopia</option>
          </Select>
          <FormControlErrorText>
            {errors.colorBlindMode?.message}
          </FormControlErrorText>
        </FormControl>

        <FormControl isInvalid={errors.textToSpeechRate}>
          <FormControlLabel>
            <FormControlLabelText>Text to Speech Rate</FormControlLabelText>
          </FormControlLabel>
          <Input type="number" step="0.1" {...register("textToSpeechRate")} />
          <FormControlErrorText>
            {errors.textToSpeechRate?.message}
          </FormControlErrorText>
        </FormControl>

        <FormControl isInvalid={errors.zoomLevel}>
          <FormControlLabel>
            <FormControlLabelText>Zoom Level</FormControlLabelText>
          </FormControlLabel>
          <Input type="number" step="0.1" {...register("zoomLevel")} />
          <FormControlErrorText>
            {errors.zoomLevel?.message}
          </FormControlErrorText>
        </FormControl>
      </>

      <Button
        className="w-fit self-end mt-4"
        size="sm"
        action="primary"
        type="submit"
        onPress={handleSubmit(onSubmit)}
      >
        Save Preferences
      </Button>
      <Button
        className="w-fit self-end mt-4"
        size="sm"
        action="primary"
        type="submit"
        onPress={ConfirmClose}
      >
        Cancel
      </Button>
    </VStack>
  );
};

const SettingsPage = () => {
  const { user, session } = useUserSession();

  const { data: profile } = useQuery({
    queryKey: "profile",
    queryFn: fetchProfile,
    enabled: !!user && !!session,
  });

  const preferences =
    profile?.preferences ??
    session?.profile?.preferences ??
    defaultUserPreferences;

  const updatePreferences = async (preferences) => {
    const { data, error } = await supabase
      .from("profiles")
      .update({ preferences })
      .eq("id", user.id);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  };

  const mutate = useMutation({
    mutationFn: updatePreferences,
    onSuccess: () => {
      // TODO: handle success render a toast
    },
  });

  return (
    <DashboardLayout>
      <SettingsForm
        defaultValues={preferences}
        handleSubmit={updatePreferences}
      />
    </DashboardLayout>
  );
};

export default SettingsPage;
