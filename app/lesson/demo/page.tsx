import { LessonExperience } from "@/features/lesson/lesson-experience";
import { getDemoLesson } from "@/features/lesson/lesson-repository";

export default function DemoLessonPage() {
  const lesson = getDemoLesson();

  return <LessonExperience lesson={lesson} />;
}
