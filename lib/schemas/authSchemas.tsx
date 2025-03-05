import { z } from "zod";
import { AuthProviderMapper } from "@/constants/oauthProviders.js";
import { userProfile } from "@/constants/defaultSession";
/**
 * Auth Providers.
 * Enumerates possible OAuth or SSO providers, e.g. Google, Facebook, etc.
 */
const OauthProviderEnum = z.enum(AuthProviderMapper.providers());

/**
 * Draft user schema with optional password OR provider-based authentication.
 */

export const preferencesSchema = z.object({
  theme: z.enum(["light", "dark"]).optional().default("light"),
  fontSize: z.enum(["medium", "large", "x-large"]).optional().default("medium"),
  fontFamily: z.enum(["default", "serif", "sans-serif", "monospace"]).optional().default("default"),
  boldText: z.boolean().optional().default(false),
  highContrast: z.boolean().optional().default(false),
  reduceMotion: z.boolean().optional().default(false),
  screenReaderEnabled: z.boolean().optional().default(false),
  hapticFeedback: z.boolean().optional().default(false),
  notificationsEnabled: z.boolean().optional().default(false),
  soundEffects: z.boolean().optional().default(false),
  language: z.string().optional().default("en"),
  autoPlayVideos: z.boolean().optional().default(false),
  dataUsage: z.enum(["low", "normal", "high"]).optional().default("normal"),
  colorBlindMode: z.enum(["none", "protanopia", "deuteranopia", "tritanopia"]).optional().default("none"),
  textToSpeechRate: z.number().optional().default(1),
  zoomLevel: z.number().optional().default(1),
  rememberMe: z.boolean().optional().default(false),
});

const draftUserSchema = z.object({
  user_id: z.string().uuid().nullable().optional(),
  email: z.string().email().nullable(),
  name: z.string().nullable().optional(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  preferences: preferencesSchema.optional(),
  created_at: z.string().datetime({ offset: true }).nullable().optional().default(new Date().toISOString()),
  app_metadata: z.object({
    avatar_url: z.string().url().optional(),
    is_super_admin: z.boolean(),
    sso_user: z.boolean(),
    provider: OauthProviderEnum.optional(),
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
  provider: OauthProviderEnum.optional(),
  access_token: z.string().optional(),
  idToken: z.string().optional(),
  password: z.string().min(1).optional(),
  draftStatus: z.enum([
    "draft",
    "confirmed",
    "published",
    "archived",
    "deleted",
  ]).default("draft"),
});

const newUserSchema = draftUserSchema.refine(
  (data) =>
    (data.provider && data.access_token) ||
    (data.provider && data.idToken) ||
    data.password,
  {
    message: "Either provider & access_token OR password is required",
  }
);

/**
 * Schema for creating passwords.
 */
const createPasswordSchema = draftUserSchema
  .extend({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(new RegExp(".*[A-Z].*"), "One uppercase character")
      .regex(new RegExp(".*[a-z].*"), "One lowercase character")
      .regex(new RegExp(".*\\d.*"), "One number")
      .regex(
        new RegExp(".*[`~<>?,./!@#$%^&*()\\-_+=\"'|{}\\[\\];:\\\\].*"),
        "One special character"
      )
      .refine((password, context) => {
        const { email, first_name, last_name } = context.parent;
        const emailPrefix = email?.split("@")[0];
        if (
          password.includes(emailPrefix) ||
          password.includes(first_name) ||
          password.includes(last_name)
        ) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Password must not contain parts of your email or name",
          });
        }
      }),
    confirmpassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(new RegExp(".*[A-Z].*"), "One uppercase character")
      .regex(new RegExp(".*[a-z].*"), "One lowercase character")
      .regex(new RegExp(".*\\d.*"), "One number")
      .regex(
        new RegExp(".*[`~<>?,./!@#$%^&*()\\-_+=\"'|{}\\[\\];:\\\\].*"),
        "One special character"
      ),
  })
  .refine((data) => data.password === data.confirmpassword, {
    message: "Passwords must match",
    path: ["confirmpassword"],
  });

/**
 * Schema for user login.
 * Omits 'firstName' and 'lastName' from the base user schema.
 */
const loginSchema = draftUserSchema.omit({
  firstName: true,
  lastName: true,
});

/**
 * Schema for forgot password flow.
 * Only asks for email.
 * Omits 'rememberme' and 'password' from the base user schema.
 */
const forgotPasswordSchema = loginSchema.omit({
  rememberme: true,
  password: true,
  provider: true,
  access_token: true,
});

/**
 * Schema for sign-up with only email and name.
 */
const emailOnlySignUp = z.object({
  email: z.string().min(1, "Email is required").email(),
  // firstName: z.string().min(1).optional(),
  // lastName: z.string().min(1).optional(),
});

export type NewUserSchemaType = z.infer<typeof newUserSchema>;
export type ForgotPasswordSchemaType = z.infer<typeof forgotPasswordSchema>;
export type LoginSchemaType = z.infer<typeof loginSchema>;
export type SignUpSchemaType = z.infer<typeof emailOnlySignUp>;
export type CreatePasswordSchemaType = z.infer<typeof createPasswordSchema>;

export {
  newUserSchema,
  loginSchema,
  forgotPasswordSchema,
  emailOnlySignUp,
  createPasswordSchema,
};
