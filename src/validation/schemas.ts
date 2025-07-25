import { z } from "zod";
import { VALIDATION_CONSTANTS } from "../config/constants";

const titleSchema = z
    .string()
    .trim()
    .min(
        VALIDATION_CONSTANTS.TITLE_MIN_LENGTH,
        `Title must be at least ${VALIDATION_CONSTANTS.TITLE_MIN_LENGTH} characters`,
    )
    .max(
        VALIDATION_CONSTANTS.TITLE_MAX_LENGTH,
        `Title cannot exceed ${VALIDATION_CONSTANTS.TITLE_MAX_LENGTH} characters`,
    );

const sourceSchema = z
    .string()
    .max(
        VALIDATION_CONSTANTS.SOURCE_MAX_LENGTH,
        `Source cannot exceed ${VALIDATION_CONSTANTS.SOURCE_MAX_LENGTH} characters`,
    );

const createdBySchema = z
    .string()
    .trim()
    .min(
        VALIDATION_CONSTANTS.USERNAME_MIN_LENGTH,
        `Username must be at least ${VALIDATION_CONSTANTS.USERNAME_MIN_LENGTH} characters`,
    )
    .max(
        VALIDATION_CONSTANTS.USERNAME_MAX_LENGTH,
        `Username cannot exceed ${VALIDATION_CONSTANTS.USERNAME_MAX_LENGTH} characters`,
    )
    .regex(
        VALIDATION_CONSTANTS.USERNAME_PATTERN,
        "Username can only contain letters, numbers, underscores, and hyphens",
    );

export const createPageRequestSchema = z.object({
    title: titleSchema,
    source: sourceSchema,
    createdBy: createdBySchema,
});

export const updatePageRequestSchema = z.object({
    title: titleSchema,
    source: sourceSchema,
    createdBy: createdBySchema,
});

export const shortIdParamSchema = z
    .string()
    .length(VALIDATION_CONSTANTS.SHORT_ID_LENGTH, `Invalid shortId format`);

export const revisionIdParamSchema = z
    .string()
    .transform((val) => Number.parseInt(val, 10))
    .pipe(z.number().int().positive("Revision ID must be a positive integer"));

export type CreatePageRequest = z.infer<typeof createPageRequestSchema>;
export type UpdatePageRequest = z.infer<typeof updatePageRequestSchema>;
