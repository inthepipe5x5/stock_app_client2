import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import defaultUserPreferences from "@/constants/userPreferences";
import {
  Button,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Switch,
  Select,
} from "@gluestack-ui/themed";
import settingsSchema from "@/lib/schemas/settingsSchema";

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
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormControl isInvalid={errors.email}>
        <FormLabel>Email</FormLabel>
        <Input type="email" {...register("email")} />
        <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={errors.username}>
        <FormLabel>Username</FormLabel>
        <Input type="text" {...register("username")} />
        <FormErrorMessage>{errors.username?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={errors.theme}>
        <FormLabel>Theme</FormLabel>
        <Select {...register("theme")}>
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </Select>
        <FormErrorMessage>{errors.theme?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={errors.fontSize}>
        <FormLabel>Font Size</FormLabel>
        <Select {...register("fontSize")}>
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </Select>
        <FormErrorMessage>{errors.fontSize?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={errors.fontFamily}>
        <FormLabel>Font Family</FormLabel>
        <Select {...register("fontFamily")}>
          <option value="default">Default</option>
          <option value="serif">Serif</option>
          <option value="sans-serif">Sans-serif</option>
        </Select>
        <FormErrorMessage>{errors.fontFamily?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={errors.boldText}>
        <FormLabel>Bold Text</FormLabel>
        <Switch {...register("boldText")} />
        <FormErrorMessage>{errors.boldText?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={errors.highContrast}>
        <FormLabel>High Contrast</FormLabel>
        <Switch {...register("highContrast")} />
        <FormErrorMessage>{errors.highContrast?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={errors.reduceMotion}>
        <FormLabel>Reduce Motion</FormLabel>
        <Switch {...register("reduceMotion")} />
        <FormErrorMessage>{errors.reduceMotion?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={errors.screenReaderEnabled}>
        <FormLabel>Screen Reader Enabled</FormLabel>
        <Switch {...register("screenReaderEnabled")} />
        <FormErrorMessage>
          {errors.screenReaderEnabled?.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={errors.hapticFeedback}>
        <FormLabel>Haptic Feedback</FormLabel>
        <Switch {...register("hapticFeedback")} />
        <FormErrorMessage>{errors.hapticFeedback?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={errors.notificationsEnabled}>
        <FormLabel>Notifications Enabled</FormLabel>
        <Switch {...register("notificationsEnabled")} />
        <FormErrorMessage>
          {errors.notificationsEnabled?.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={errors.soundEffects}>
        <FormLabel>Sound Effects</FormLabel>
        <Switch {...register("soundEffects")} />
        <FormErrorMessage>{errors.soundEffects?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={errors.language}>
        <FormLabel>Language</FormLabel>
        <Input type="text" {...register("language")} />
        <FormErrorMessage>{errors.language?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={errors.autoPlayVideos}>
        <FormLabel>Auto Play Videos</FormLabel>
        <Switch {...register("autoPlayVideos")} />
        <FormErrorMessage>{errors.autoPlayVideos?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={errors.dataUsage}>
        <FormLabel>Data Usage</FormLabel>
        <Select {...register("dataUsage")}>
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
        </Select>
        <FormErrorMessage>{errors.dataUsage?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={errors.colorBlindMode}>
        <FormLabel>Color Blind Mode</FormLabel>
        <Select {...register("colorBlindMode")}>
          <option value="none">None</option>
          <option value="protanopia">Protanopia</option>
          <option value="deuteranopia">Deuteranopia</option>
          <option value="tritanopia">Tritanopia</option>
        </Select>
        <FormErrorMessage>{errors.colorBlindMode?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={errors.textToSpeechRate}>
        <FormLabel>Text to Speech Rate</FormLabel>
        <Input type="number" step="0.1" {...register("textToSpeechRate")} />
        <FormErrorMessage>{errors.textToSpeechRate?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={errors.zoomLevel}>
        <FormLabel>Zoom Level</FormLabel>
        <Input type="number" step="0.1" {...register("zoomLevel")} />
        <FormErrorMessage>{errors.zoomLevel?.message}</FormErrorMessage>
      </FormControl>

      <Button type="submit">Save</Button>
    </form>
  );
};

export default SettingsForm;
