import { z } from "zod";
import { AuthProviderMapper } from "../../constants/oauthProviders.js";

const newUserSchema = z
  .object({
    email: z.string().min(1, "Email is required").email(),
    provider: z.enum(AuthProviderMapper.providers()).optional(),
    access_token: z.string().optional(),
    password: z.string().min(1).optional(),
    rememberme: z.boolean().optional(),
  })
  .refine((data) => (data.provider && data.access_token) || data.password, {
    message: "Either provider or password is required",
  });

// const loginSchema = z.object({
//   email: z.string().min(1, "Email is required").email(),
//   password: z.string().min(1).optional(),
//   rememberme: z.boolean().optional(),
// });

const loginSchema = newUserSchema.omit({ password: false, provider: false });

const forgotPasswordSchema = newUserSchema.omit({
  rememberme: true,
  password: false,
});

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
