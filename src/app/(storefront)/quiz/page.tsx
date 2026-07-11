import type { Metadata } from "next";
import { Container } from "@/components/ui/misc";
import { ScentQuiz } from "@/components/quiz/scent-quiz";
import { getQuizQuestions } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Scent Profile Quiz",
  description:
    "Answer a few questions and let our scent algorithm reveal your three perfect fragrance matches.",
};

export default async function QuizPage() {
  const questions = await getQuizQuestions();

  return (
    <div className="pt-28 lg:pt-36">
      <Container className="text-center">
        <p className="eyebrow">Discover</p>
        <h1 className="mt-4 font-display text-4xl text-ivory sm:text-6xl">
          The Scent Quiz
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-ivory-dim">
          Four questions stand between you and your signature scent.
        </p>
      </Container>

      <Container className="pb-24">
        {questions.length > 0 ? (
          <ScentQuiz questions={questions} />
        ) : (
          <p className="py-24 text-center text-muted">
            The quiz is being prepared. Please check back soon.
          </p>
        )}
      </Container>
    </div>
  );
}
