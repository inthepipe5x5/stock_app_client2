import { z } from "zod";

type userSchemaDetails = z.infer<typeof userSchema>;

const userSchema = z.object({
  //user details
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  name: z.string().min(1, "Name is too short").optional(),
  email: z.string().email("Invalid email address"),
  phoneNumber: z
    .string()
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      "Phone number must be a valid international phone number"
    ),
  //address data
  city: z
    .string()
    .min(1, "City is required")
    .max(100, "City must be less than 100 characters"),
  state: z
    .string()
    .min(1, "State is required")
    .max(100, "State must be less than 100 characters"),
  country: z
    .string()
    .min(1, "Country is required")
    .max(100, "Country must be less than 100 characters"),
  postalcode: z
    .string()
    .min(1, "Postal Code is required")
    .max(20, "Postal Code must be less than 20 characters"),
  //relations
  households: z.array(z.string()).optional(),
  inventories: z.array(z.string()).optional(),
  assignedTasks: z.array(z.string()).optional(),
  //metadata
  app_metadata: z
    .object({
      provider: z.string().optional(),
      avatar_url: z.string().optional(),
    })
    .optional(),
  draftStatus: z.enum([
    "draft",
    "confirmed",
    "published",
    "archived",
    "deleted",
  ]),
});

// Define the Zod schema
//from gluestack-ui v2 starter kit, profile page
// const userCreateSchema = z.object({
//   firstName: z
//     .string()
//     .min(1, "First name is required")
//     .max(50, "First name must be less than 50 characters"),
//   lastName: z
//     .string()
//     .min(1, "Last name is required")
//     .max(50, "Last name must be less than 50 characters"),
//   // gender: z.enum(["male", "female", "prefer not to answer"]).optional(),
//   // birthDate: z.date().optional(),
//   phoneNumber: z
//     .string()
//     .regex(
//       /^\+?[1-9]\d{1,14}$/,
//       "Phone number must be a valid international phone number"
//     ),
//   city: z
//     .string()
//     .min(1, "City is required")
//     .max(100, "City must be less than 100 characters"),
//   state: z
//     .string()
//     .min(1, "State is required")
//     .max(100, "State must be less than 100 characters"),
//   country: z
//     .string()
//     .min(1, "Country is required")
//     .max(100, "Country must be less than 100 characters"),
//   postalcode: z
//     .string()
//     .min(1, "Postal Code is required")
//     .max(20, "Postal Code must be less than 20 characters"),
// });
const userCreateSchema = userSchema.omit({
  app_metadata: true,
  draftStatus: true,
  households: true,
  inventories: true,
  assignedTasks: true,
});

const updateUserSchema = userSchema.partial();

const deleteUserSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export {
  userSchema,
  userCreateSchema,
  userSchemaDetails,
  updateUserSchema,
  deleteUserSchema,
};
