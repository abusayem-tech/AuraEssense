import { Plus } from "lucide-react";
import { AdminHeader, LinkButton } from "@/components/admin/admin-ui";
import { QuizManager } from "@/components/admin/quiz-manager";
import {
  getCatalogPicks,
  getCollections,
  getFamilies,
  getQuizQuestions,
} from "@/lib/queries";

export default async function AdminQuizPage() {
  const [questions, families, collections, products] = await Promise.all([
    getQuizQuestions(),
    getFamilies(),
    getCollections(),
    getCatalogPicks(),
  ]);

  return (
    <div>
      <AdminHeader
        title="Scent Quiz"
        description="Create and edit questions the same way. Each answer is linked to families, collections, perfumes, or notes from your catalog."
        action={
          <LinkButton href="/admin/quiz/new">
            <Plus size={14} /> Add Question
          </LinkButton>
        }
      />
      <QuizManager
        questions={questions}
        families={families}
        collections={collections}
        products={products}
      />
    </div>
  );
}
