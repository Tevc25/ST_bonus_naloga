import rawDemoLesson from "@/data/lessons/demo-lesson.json";
import { lessonSchema } from "@/features/lesson/schemas";
import type { Lesson } from "@/types/lesson";

const demoLesson = lessonSchema.parse(rawDemoLesson) as Lesson;

export function getDemoLesson(): Lesson {
  return demoLesson;
}

export function getSectionById(lesson: Lesson, sectionId: string) {
  return lesson.sections.find((section) => section.id === sectionId) ?? null;
}

export function getQuestionById(lesson: Lesson, questionId: string) {
  return (
    lesson.questions.find((question) => question.id === questionId) ?? null
  );
}
