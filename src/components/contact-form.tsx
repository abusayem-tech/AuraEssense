"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { submitContact } from "@/lib/actions/contact";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [pending, start] = useTransition();

  if (sent) {
    return (
      <div className="flex items-center justify-center border border-emerald/30 bg-emerald/5 p-10 text-center">
        <p className="text-emerald">
          Thank you. Our concierge will respond within one business day.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const data = new FormData(form);
        const input = {
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          message: String(data.get("message") ?? ""),
        };
        start(async () => {
          const res = await submitContact(input);
          if (res.ok) {
            setSent(true);
            toast.success("Message sent");
          } else {
            toast.error(res.error ?? "Could not send message.");
          }
        });
      }}
      className="space-y-5"
    >
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required placeholder="Your name" />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required placeholder="you@example.com" />
      </div>
      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" required placeholder="How can we help?" />
      </div>
      <Button type="submit" size="lg" disabled={pending}>
        {pending && <Loader2 size={15} className="animate-spin" />}
        Send Message
      </Button>
    </form>
  );
}
