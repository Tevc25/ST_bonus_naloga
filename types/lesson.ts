export type SectionImportance = "critical" | "supporting";

export interface QuizChoice {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  sectionId: string;
  prompt: string;
  choices: QuizChoice[];
  correctChoiceId: string;
  explanation: string;
}

export interface LessonSection {
  id: string;
  heading: string;
  paragraphs: string[];
  keyConcepts: string[];
  difficultyHint: string;
  simplifiedExplanation?: string;
  shortExample?: string;
  whyItMatters: string;
  importance: SectionImportance;
  quizQuestionIds: string[];
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  sections: LessonSection[];
  questions: QuizQuestion[];
}
