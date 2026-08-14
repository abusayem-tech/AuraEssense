import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/admin/admin-ui";
import { QuizQuestionForm } from "@/components/admin/quiz-question-form";
import {
  getCatalogNotes,
  getCatalogPicks,
  getCollections,
  getFamilies,
  getQuizQuestion,
} from "@/lib/queries";

export default async function EditQuizQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [question, families, collections, products, notes] = await Promise.all([
    getQuizQuestion(id),
    getFamilies(),
    getCollections(),
    getCatalogPicks(),
    getCatalogNotes(),
  ]);
  if (!question) notFound();

  return (
    <div className="max-w-4xl">
      <Link
        href="/admin/quiz"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted hover:text-gold"
      >
        <ArrowLeft size={14} /> Back to Quiz
      </Link>
      <h1 className="mb-6 mt-4 font-display text-3xl text-ivory">Edit Question</h1>
      <Card>
        <QuizQuestionForm
          question={question}
          nextPosition={question.position}
          families={families}
          collections={collections}
          products={products}
          notes={notes}
        />
      </Card>
    </div>
  );
}
