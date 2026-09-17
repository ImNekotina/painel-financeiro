"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoalModal } from "@/components/dashboard/goal-modal";

export function NewGoalButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <Plus className="size-4" /> Nova meta
      </Button>
      {open && <GoalModal onClose={() => setOpen(false)} />}
    </>
  );
}
