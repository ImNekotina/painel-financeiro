"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransactionModal, type TransactionModalCategory } from "@/components/dashboard/transaction-modal";

export function NewTransactionButton({
  categories,
  label = "Adicionar transação",
}: {
  categories: TransactionModalCategory[];
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <Plus className="size-4" /> {label}
      </Button>
      {open && <TransactionModal onClose={() => setOpen(false)} categories={categories} />}
    </>
  );
}
