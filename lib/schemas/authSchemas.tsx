import { z } from "zod";
import { AuthProviderMapper } from "@/constants/oauthProviders.js";
import { userProfile } from "@/constants/defaultSession";
/**
 * Auth Providers.
 * Enumerates possible OAuth or SSO providers, e.g. Google, Facebook, etc.
 */
const providerEnum = z.enum(AuthProviderMapper.providers());

/**
 * Base user schema with optional password OR provider-based authentication.
 */
const baseUserSchema = z.object({
  user_id: z.string().uuid(),
  email: z.string().email().nullable(),
  name: z.string().nullable().optional(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  preferences: z.object({
    // Define the userPreferences schema here if needed
  }).optional(),
  created_at: z.string().nullable().optional(),
  app_metadata: z.object({
    avatar_url: z.string().url().optional(),
    is_super_admin: z.boolean(),
    sso_user: z.boolean(),
    provider: providerEnum.optional(),
    setup: z.object({
      email: z.boolean().nullable().optional(),
      authenticationMethod: z.boolean().nullable().optional(),
      account: z.boolean().nullable().optional(),
      details: z.boolean().nullable().optional(),
      preferences: z.boolean().nullable().optional(),
      confirmation: z.boolean().nullable().optional(),
    }).optional(),
    authMetaData: z.any().optional(),
  }).nullable().optional(),
  provider: providerEnum.optional(),
  access_token: z.string().optional(),
  idToken: z.string().optional(),
  password: z.string().min(1).optional(),
  rememberme: z.boolean().optional(),
});

const newUserSchema = baseUserSchema.refine(
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
const createPasswordSchema = baseUserSchema
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
        const { email, firstName, lastName } = context.parent;
        const emailPrefix = email?.split("@")[0];
        if (
          password.includes(emailPrefix) ||
          password.includes(firstName) ||
          password.includes(lastName)
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
const loginSchema = baseUserSchema.omit({
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
