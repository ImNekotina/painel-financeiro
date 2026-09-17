"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryModal } from "@/components/dashboard/category-modal";

export function NewCategoryButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <Plus className="size-4" /> Nova categoria
      </Button>
      {open && <CategoryModal onClose={() => setOpen(false)} />}
    </>
  );
}
