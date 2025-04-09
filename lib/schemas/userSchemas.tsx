import { AuthProviderMapper } from "@/constants/oauthProviders";
import { z } from "zod";

export const userPreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).default("light"),
  fontSize: z.enum(["medium", "large", "x-large"]).optional().default("medium"),
  fontFamily: z.enum(["default", "serif", "sans-serif", "monospace"]).optional().default("default"),
  boldText: z.boolean().optional().default(false),
  highContrast: z.boolean().optional().default(false),
  reduceMotion: z.boolean().optional().default(false),
  screenReaderEnabled: z.boolean().optional().default(false),
  hapticFeedback: z.boolean().optional().default(true),
  notificationsEnabled: z.boolean().optional().default(true),
  soundEffects: z.boolean().optional().default(true),
  language: z.string().optional().default("en"),
  autoPlayVideos: z.boolean().optional().default(false),
  dataUsage: z.enum(["low", "normal", "high"]).optional().default("normal"),
  colorBlindMode: z.enum(["none", "protanopia", "deuteranopia", "tritanopia"]).optional().default("none"),
  textToSpeechRate: z.number().optional().default(1),
  zoomLevel: z.number().optional().default(1),
  rememberMe: z.boolean().optional().default(false),
  cameraPermissions: z.boolean().optional().default(false),
  microphonePermissions: z.boolean().optional().default(false),
  locationPermissions: z.boolean().optional().default(false),
});

type userPreferencesSchema = z.infer<typeof userPreferencesSchema>;

type userSchemaDetails = z.infer<typeof userSchema>;

export const locationSchema = z.object({
  city: z
    .string()
    .min(1, "City is required")
    .max(100, "City must be less than 100 characters")
    .default("Toronto"),
  state: z
    .string()
    .min(1, "State is required")
    .max(100, "State must be less than 100 characters")
    .default("ON"),
  country: z
    .string()
    .min(1, "Country is required")
    .max(3, "Country code must be less than 3 characters")
    .default("Canada"),
  postalcode: z
    .string()
    .min(1, "Postal Code is required")
    .max(20, "Postal Code must be less than 20 characters")
    .default("m4c1b5"),
});

const userSchema = z.object({
  //user details
  user_id: z.string().uuid().optional(), //making optional as the userid is generated on step 2
  firstName: z.string().min(1, "First name is required").default("John"),
  lastName: z.string().min(1, "Last name is required").default("Doe"),
  name: z.string().min(1, "Name is too short").optional().default("John Doe"),
  email: z.string().email("Invalid email address").default("example@example.com"),
  phoneNumber: z
    .string()
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      "Phone number must be a valid international phone number"
    )
    .default("+1234567890"),
  //address data
  city: z
    .string()
    .min(1, "City is required")
    .max(100, "City must be less than 100 characters")
    .default("Toronto"),
  state: z
    .string()
    .min(1, "State is required")
    .max(100, "State must be less than 100 characters")
    .default("ON"),
  country: z
    .string()
    .min(1, "Country is required")
    .max(100, "Country must be less than 100 characters")
    .default("Canada"),
  postalcode: z
    .string()
    .min(1, "Postal Code is required")
    .max(20, "Postal Code must be less than 20 characters")
    .default("M4C1B5"),
  //relations
  // households: z.array(z.string()).optional().default([]),
  // inventories: z.array(z.string()).optional().default([]),
  // assignedTasks: z.array(z.string()).optional().default([]),
  //metadata
  app_metadata: z.object({
    avatar_url: z.string().url().optional(),
    is_super_admin: z.boolean(),
    sso_user: z.boolean(),
    provider: z.enum((AuthProviderMapper.providers())).optional(),
    setup: z.object({
      email: z.boolean().nullable().optional().default(false),
      authenticationMethod: z.boolean().nullable().optional().default(false),
      account: z.boolean().nullable().optional().default(false),
      details: z.boolean().nullable().optional().default(false),
      preferences: z.boolean().nullable().optional().default(false),
      confirmation: z.boolean().nullable().optional().default(false),
    }).optional(),
    authMetaData: z.any().optional(),
  }).nullable().optional(),
  draftStatus: z.enum([
    "draft",
    "confirmed",
    "published",
    "archived",
    "deleted",
  ]).default("draft"),
  preferences: z.object({}).optional(),
  created_at: z.string().datetime({ offset: true }).nullable().optional().default(new Date().toISOString()),
});

const userCreateSchema = userSchema.omit({
  // user_id: true,
  app_metadata: true,
  draftStatus: true,
  created_at: true,
  // households: true,
  // inventories: true,
  // assignedTasks: true,

});

const updateUserSchema = userSchema.partial();

const deleteUserSchema = z.object({
  user_id: z.string().uuid("Invalid user id"),
  email: z.string().email("Invalid email address"),
});

export {
  userSchema,
  userCreateSchema,
  userSchemaDetails,
  updateUserSchema,
  deleteUserSchema,
};
