"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Card } from "@/components/admin/admin-ui";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  saveQuestion,
  deleteQuestion,
  saveOption,
  deleteOption,
} from "@/lib/actions/admin/quiz";

interface Option {
  id: string;
  label: string;
  description: string | null;
  family_weights: Record<string, number>;
  note_weights: Record<string, number>;
  position: number;
}
interface Question {
  id: string;
  prompt: string;
  subtitle: string | null;
  position: number;
  options: Option[];
}

export function QuizManager({ questions }: { questions: Question[] }) {
  const [qDialog, setQDialog] = useState(false);
  const [qEdit, setQEdit] = useState<Question | null>(null);
  const [oDialog, setODialog] = useState(false);
  const [oEdit, setOEdit] = useState<Option | null>(null);
  const [oQuestionId, setOQuestionId] = useState("");
  const [pending, start] = useTransition();

  async function onSaveQuestion(fd: FormData) {
    if (qEdit) fd.set("id", qEdit.id);
    await saveQuestion(fd);
    toast.success("Question saved");
    setQDialog(false);
  }
  async function onSaveOption(fd: FormData) {
    if (oEdit) fd.set("id", oEdit.id);
    fd.set("question_id", oQuestionId);
    await saveOption(fd);
    toast.success("Option saved");
    setODialog(false);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl text-ivory">Scent Quiz</h1>
        <Button size="sm" onClick={() => { setQEdit(null); setQDialog(true); }}>
          <Plus size={14} /> Add Question
        </Button>
      </div>

      <div className="space-y-5">
        {questions.map((q) => (
          <Card key={q.id}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[0.6rem] uppercase tracking-widest text-muted">Question {q.position + 1}</p>
                <h3 className="mt-1 font-display text-xl text-ivory">{q.prompt}</h3>
                {q.subtitle && <p className="text-sm text-muted">{q.subtitle}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setQEdit(q); setQDialog(true); }} className="text-muted hover:text-gold"><Pencil size={15} /></button>
                <button onClick={() => start(async () => { await deleteQuestion(q.id); toast.success("Deleted"); })} disabled={pending} className="text-muted hover:text-rose"><Trash2 size={15} /></button>
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {q.options.map((o) => (
                <div key={o.id} className="flex items-center justify-between border border-line px-3 py-2">
                  <div>
                    <p className="text-sm text-ivory">{o.label}</p>
                    <p className="text-xs text-muted">
                      {Object.keys(o.family_weights).join(", ") || "no weights"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setOEdit(o); setOQuestionId(q.id); setODialog(true); }} className="text-muted hover:text-gold"><Pencil size={13} /></button>
                    <button onClick={() => start(async () => { await deleteOption(o.id); toast.success("Deleted"); })} disabled={pending} className="text-muted hover:text-rose"><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="mt-3" onClick={() => { setOEdit(null); setOQuestionId(q.id); setODialog(true); }}>
              <Plus size={13} /> Add Option
            </Button>
          </Card>
        ))}
        {questions.length === 0 && <p className="py-10 text-center text-muted">No quiz questions yet.</p>}
      </div>

      {/* Question dialog */}
      <Dialog open={qDialog} onOpenChange={setQDialog}>
        <DialogContent>
          <DialogTitle className="font-display text-2xl text-ivory">{qEdit ? "Edit" : "Add"} Question</DialogTitle>
          <form action={onSaveQuestion} className="mt-5 space-y-4">
            <div><Label htmlFor="prompt">Prompt</Label><Input id="prompt" name="prompt" defaultValue={qEdit?.prompt} required /></div>
            <div><Label htmlFor="subtitle">Subtitle</Label><Input id="subtitle" name="subtitle" defaultValue={qEdit?.subtitle ?? ""} /></div>
            <div><Label htmlFor="position">Position</Label><Input id="position" name="position" type="number" defaultValue={qEdit?.position ?? questions.length} /></div>
            <Button type="submit" className="w-full">Save</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Option dialog */}
      <Dialog open={oDialog} onOpenChange={setODialog}>
        <DialogContent>
          <DialogTitle className="font-display text-2xl text-ivory">{oEdit ? "Edit" : "Add"} Option</DialogTitle>
          <form action={onSaveOption} className="mt-5 space-y-4">
            <div><Label htmlFor="label">Label</Label><Input id="label" name="label" defaultValue={oEdit?.label} required /></div>
            <div><Label htmlFor="description">Description</Label><Input id="description" name="description" defaultValue={oEdit?.description ?? ""} /></div>
            <div>
              <Label htmlFor="family_weights">Family Weights (JSON)</Label>
              <Textarea id="family_weights" name="family_weights" defaultValue={JSON.stringify(oEdit?.family_weights ?? { woody: 2 })} />
            </div>
            <div>
              <Label htmlFor="note_weights">Note Weights (JSON)</Label>
              <Textarea id="note_weights" name="note_weights" defaultValue={JSON.stringify(oEdit?.note_weights ?? {})} />
            </div>
            <div><Label htmlFor="position">Position</Label><Input id="position" name="position" type="number" defaultValue={oEdit?.position ?? 0} /></div>
            <Button type="submit" className="w-full">Save</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
