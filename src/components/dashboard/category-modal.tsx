"use client";

import { useActionState, useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { createCategoryAction, updateCategoryAction } from "@/actions/categories";
import type { ActionResult } from "@/actions/auth";

const initialState: ActionResult | null = null;

const PRESET_COLORS = [
  "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899",
  "#10b981", "#06b6d4", "#6366f1", "#64748b",
  "#ef4444", "#84cc16",
];

export interface CategoryModalData {
  id: string;
  name: string;
  color: string;
}

/**
 * Este componente deve ser MONTADO CONDICIONALMENTE pelo pai (ex.:
 * `{open && <CategoryModal ... />}`), e não sempre montado com um prop
 * `open` que alterna. Assim, cada abertura é um mount novo, com estado
 * inicial correto derivado das props — sem precisar sincronizar estado
 * via useEffect a cada mudança de `open`.
 */
export function CategoryModal({
  onClose,
  category,
}: {
  onClose: () => void;
  category?: CategoryModalData;
}) {
  const action = category ? updateCategoryAction.bind(null, category.id) : createCategoryAction;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [color, setColor] = useState(category?.color ?? PRESET_COLORS[0]);
  const err = state && !state.success ? state.fieldErrors : undefined;

  useEffect(() => {
    if (state?.success) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <Modal open onClose={onClose} title={category ? "Editar categoria" : "Nova categoria"}>
      <form action={formAction} className="space-y-4" noValidate>
        {state && !state.success && !err && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
            {state.message}
          </div>
        )}

        <div>
          <Label htmlFor="name">Nome</Label>
          <Input id="name" name="name" required placeholder="Ex.: Alimentação" defaultValue={category?.name} error={err?.name?.[0]} />
          <FieldError messages={err?.name} />
        </div>

        <div>
          <Label>Cor</Label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Selecionar cor ${c}`}
                className="size-7 rounded-full ring-offset-2 transition-transform hover:scale-105"
                style={{
                  backgroundColor: c,
                  boxShadow: color === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : undefined,
                }}
              />
            ))}
          </div>
          <input type="hidden" name="color" value={color} />
          <FieldError messages={err?.color} />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isPending}>
            {category ? "Salvar" : "Criar categoria"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
