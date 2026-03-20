import { z } from "zod";

export const quizChoiceSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1)
});

export const quizQuestionSchema = z.object({
  id: z.string().min(1),
  sectionId: z.string().min(1),
  prompt: z.string().min(1),
  choices: z.array(quizChoiceSchema).min(2),
  correctChoiceId: z.string().min(1),
  explanation: z.string().min(1)
});

export const lessonSectionSchema = z.object({
  id: z.string().min(1),
  heading: z.string().min(1),
  paragraphs: z.array(z.string().min(1)).min(1),
  keyConcepts: z.array(z.string().min(1)).min(1),
  difficultyHint: z.string().min(1),
  simplifiedExplanation: z.string().min(1).optional(),
  shortExample: z.string().min(1).optional(),
  whyItMatters: z.string().min(1),
  importance: z.enum(["critical", "supporting"]),
  quizQuestionIds: z.array(z.string().min(1)).min(1)
});

export const lessonSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  estimatedMinutes: z.number().int().positive(),
  sections: z.array(lessonSectionSchema).min(1),
  questions: z.array(quizQuestionSchema).min(1)
});
