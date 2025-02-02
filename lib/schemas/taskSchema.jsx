import {z} from "zod";

const TaskSchema = z.object({
    householdId: z.string().uuid(),
    title: z.string().min(1, "Task title is required"),
    description: z.string().optional(),
    dueDate: z.date().optional(),
    assignedTo: z.array(z.string().uuid()).optional(),
    repeat: z.boolean().optional(),
    repeatInterval: z.number().optional(), 
    repeatType: z.enum(["daily", "weekly", "monthly"]).optional(),
    repeatUntil: z.date().optional(),
});

const TaskAssignment = z.object({
    taskId: z.string().uuid(),
    memberId: z.string().uuid(),
});

export {TaskSchema, TaskAssignment};
