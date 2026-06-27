"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";

export function ContactForm() {
  const [sent, setSent] = useState(false);

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
        setSent(true);
        toast.success("Message sent");
      }}
      className="space-y-5"
    >
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" required placeholder="Your name" />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" required placeholder="you@example.com" />
      </div>
      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" required placeholder="How can we help?" />
      </div>
      <Button type="submit" size="lg">Send Message</Button>
    </form>
  );
}
