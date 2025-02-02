import { z } from "zod";

const settingsSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  username: z
    .string()
    .min(2, { message: "Username must be at least 2 characters" }),
  theme: z.enum(["system", "light", "dark"]),
  fontSize: z.enum(["small", "medium", "large"]),
  fontFamily: z.enum(["default", "serif", "sans-serif"]),
  boldText: z.boolean(),
  highContrast: z.boolean(),
  reduceMotion: z.boolean(),
  screenReaderEnabled: z.boolean(),
  hapticFeedback: z.boolean(),
  notificationsEnabled: z.boolean(),
  soundEffects: z.boolean(),
  language: z.string(),
  autoPlayVideos: z.boolean(),
  dataUsage: z.enum(["low", "normal", "high"]),
  colorBlindMode: z.enum(["none", "protanopia", "deuteranopia", "tritanopia"]),
  textToSpeechRate: z.number().min(0.5).max(2),
  zoomLevel: z.number().min(0.5).max(3),
});

export default settingsSchema;