import { z } from "zod";
import { AuthProviderMapper } from "@/constants/oauthProviders.js";

/**
 * Auth Providers.
 * Enumerates possible OAuth or SSO providers, e.g. Google, Facebook, etc.
 */
const providerEnum = z.enum(AuthProviderMapper.providers());

/**
 * Base user schema with optional password OR provider-based authentication.
 */
const baseUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().min(1, "Email is required").email(),
  provider: providerEnum.optional(),
  access_token: z.string().optional(),
  password: z.string().min(1).optional(),
  rememberme: z.boolean().optional(),
});

const newUserSchema = baseUserSchema.refine(
  (data) => (data.provider && data.access_token) || data.password,
  {
    message: "Either provider & access_token OR password is required",
  }
);

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
const nameEmailOnlySignUp = z.object({
  email: z.string().min(1, "Email is required").email(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
});

export type NewUserSchemaType = z.infer<typeof newUserSchema>;
export type ForgotPasswordSchemaType = z.infer<typeof forgotPasswordSchema>;
export type LoginSchemaType = z.infer<typeof loginSchema>;
export type SignUpSchemaType = z.infer<typeof nameEmailOnlySignUp>;

export {
  newUserSchema,
  loginSchema,
  forgotPasswordSchema,
  nameEmailOnlySignUp,
};
