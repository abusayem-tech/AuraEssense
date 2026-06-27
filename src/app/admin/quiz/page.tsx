import { QuizManager } from "@/components/admin/quiz-manager";
import { getQuizQuestions } from "@/lib/queries";

export default async function AdminQuizPage() {
  const questions = await getQuizQuestions();
  return <QuizManager questions={questions} />;
}
