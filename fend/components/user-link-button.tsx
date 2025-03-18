"use client";

import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { ArrowLeft } from "lucide-react";

export function RedirectButton({ redirectUri }: { redirectUri: string }) {
  return (
    <Button
      className="gap-2"
      onClick={() => {
        window.location.href = redirectUri;
      }}
    >
      Go now <ExternalLink className="h-4 w-4" />
    </Button>
  );
}

export function BackButton() {
  return (
    <Button
      variant="outline"
      onClick={() => window.history.back()}
      className="gap-2"
    >
      <ArrowLeft className="h-4 w-4" /> Back
    </Button>
  );
}
