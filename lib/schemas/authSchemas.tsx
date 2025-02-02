import { z } from "zod";
import { AuthProviderMapper } from "../../constants/oauthProviders.js";

const newUserSchema = z.object({
  email: z.string().min(1, "Email is required").email(),
  provider: z.enum(AuthProviderMapper.providers()),
  password: z.string().min(1, "Password is required"),
  rememberme: z.boolean().optional(),
});

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email(),
  rememberme: z.boolean().optional(),
});

const forgotPasswordSchema = loginSchema.omit({ rememberme: true });

const signUpSchema = z.object({
  email: z.string().min(1, "Email is required").email(),
  name: z.string().min(1, "Name is required"),
});

type NewUserSchemaType = z.infer<typeof newUserSchema>;
type forgotPasswordSchemaType = z.infer<typeof forgotPasswordSchema>;
type LoginSchemaType = z.infer<typeof loginSchema>;
type SignUpSchemaType = z.infer<typeof signUpSchema>;

export {
  loginSchema,
  LoginSchemaType,
  signUpSchema,
  SignUpSchemaType,
  forgotPasswordSchema,
  forgotPasswordSchemaType,
  newUserSchema,
  NewUserSchemaType,
};
