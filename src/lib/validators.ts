import { z } from "zod";

// Auth validators
export const registerSchema = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(50, "Username must be at most 50 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    email: z.string().email("Invalid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    timezone: z.string().optional(),
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

// Entry validators
export const createEntrySchema = z.object({
    amount: z.number().int().min(1, "Amount must be at least 1").max(10000, "Amount seems too high"),
    note: z.string().max(500, "Note must be at most 500 characters").optional(),
    source: z.enum(["manual", "pomodoro"]).default("manual"),
});

export const updateEntrySchema = z.object({
    amount: z.number().int().min(1, "Amount must be at least 1").max(10000, "Amount seems too high").optional(),
    note: z.string().max(500, "Note must be at most 500 characters").optional().nullable(),
});

// User validators
export const updateUserSchema = z.object({
    displayName: z.string().max(100, "Display name must be at most 100 characters").optional().nullable(),
    bio: z.string().max(500, "Bio must be at most 500 characters").optional().nullable(),
    yearlyGoal: z.number().int().min(100, "Yearly goal must be at least 100").max(1000000, "Yearly goal is too high").optional(),
    timezone: z.string().optional(),
    theme: z.enum(["light", "dark", "system"]).optional(),
});

// Social validators
export const pokeSchema = z.object({
    pokedId: z.number().int().positive("Invalid user ID"),
    message: z.string().max(200, "Message must be at most 200 characters").optional(),
});

export const reactionSchema = z.object({
    entryId: z.number().int().positive("Invalid entry ID"),
    reactionType: z.enum(["strong", "fire", "applause", "party", "wow"]),
});

export const commentSchema = z.object({
    entryId: z.number().int().positive("Invalid entry ID"),
    content: z.string().min(1, "Comment cannot be empty").max(1000, "Comment must be at most 1000 characters"),
});

// Challenge validators
export const createChallengeSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters").max(100, "Name must be at most 100 characters"),
    description: z.string().max(1000, "Description must be at most 1000 characters").optional(),
    challengeType: z.enum(["time_based", "race", "target", "team"]),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    targetAmount: z.number().int().positive().optional(),
    isPublic: z.boolean().default(true),
});

// Team validators
export const createTeamSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters").max(100, "Name must be at most 100 characters"),
    description: z.string().max(500, "Description must be at most 500 characters").optional(),
    teamGoal: z.number().int().min(1000, "Team goal must be at least 1000").max(10000000, "Team goal is too high").default(50000),
    isPublic: z.boolean().default(true),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateEntryInput = z.infer<typeof createEntrySchema>;
export type UpdateEntryInput = z.infer<typeof updateEntrySchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type PokeInput = z.infer<typeof pokeSchema>;
export type ReactionInput = z.infer<typeof reactionSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type CreateChallengeInput = z.infer<typeof createChallengeSchema>;
export type CreateTeamInput = z.infer<typeof createTeamSchema>;
