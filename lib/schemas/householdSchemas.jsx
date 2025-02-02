import { z } from "zod";
import { RoleAccess } from "./lib/enums";

const newHouseholdSchema = z.object({
    name: z.string().min(1, "Household name is required"),
    description: z.string().optional(),
    // address: z.string().min(1, "Address is required"),
    // createdAt: z.date().default(new Date()),
});

const newHouseholdMemberSchema = z.object({
    householdId: z.string().uuid(),
    name: z.string().min(1, "Member name is required"),
    email: z.string().email("Invalid email address"),
    role: z.enum(RoleAccess).default("member"),
    joinedAt: z.date().default(new Date()),
});



export { newHouseholdSchema, newHouseholdMemberSchema, newHouseholdTaskSchema, newHouseholdTaskAssignment};