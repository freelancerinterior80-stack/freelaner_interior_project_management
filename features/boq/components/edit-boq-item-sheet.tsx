"use client";

import { useActionState, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { deleteBoqItem, updateBoqItem, type BoqActionState } from "@/features/boq/actions";
import type { BoqItem } from "@/features/boq/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";

const initialState: BoqActionState = { ok: false };

export function EditBoqItemSheet({ item, boqId }: { item: BoqItem; boqId: string }) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [updateState, updateAction, updatePending] = useActionState(
    async (state: BoqActionState, formData: FormData) => {
      const result = await updateBoqItem(state, formData);
      if (result.ok) setOpen(false);
      return result;
    },
    initialState
  );

  const [deleteState, deleteAction, deletePending] = useActionState(
    async (state: BoqActionState, formData: FormData) => {
      const result = await deleteBoqItem(state, formData);
      if (result.ok) setOpen(false);
      return result;
    },
    initialState
  );

  return (
    <Sheet open={open} onOpenChange={(v) => { setOpen(v); setConfirmDelete(false); }}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="rounded p-1 text-muted-foreground hover:text-primary hover:bg-muted"
          aria-label="Edit item"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[90dvh] overflow-y-auto rounded-t-2xl pb-safe">
        <SheetHeader className="mb-4">
          <SheetTitle>Edit item</SheetTitle>
        </SheetHeader>

        <form action={updateAction} className="space-y-4">
          <input type="hidden" name="itemId" value={item.id} />
          <input type="hidden" name="boqId" value={boqId} />

          <div className="space-y-2">
            <Label htmlFor={`desc-${item.id}`}>Description</Label>
            <Input
              id={`desc-${item.id}`}
              name="description"
              defaultValue={item.description}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor={`qty-${item.id}`}>Qty</Label>
              <Input
                id={`qty-${item.id}`}
                name="quantity"
                type="number"
                step="0.001"
                defaultValue={item.quantity}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`unit-${item.id}`}>Unit</Label>
              <select
                id={`unit-${item.id}`}
                name="unit"
                defaultValue={item.unit}
                className="h-12 w-full rounded-md border border-input bg-card px-2 text-base"
              >
                <option value="m2">M2</option>
                <option value="ls">LS</option>
                <option value="mtr">Mtr</option>
                <option value="ps">PS</option>
                <option value="units">Units</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`rate-${item.id}`}>Rate</Label>
              <Input
                id={`rate-${item.id}`}
                name="unitRate"
                type="number"
                step="0.01"
                defaultValue={item.unitRate}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`notes-${item.id}`}>Notes</Label>
            <Input
              id={`notes-${item.id}`}
              name="notes"
              defaultValue={item.notes ?? ""}
              placeholder="Optional"
            />
          </div>

          {updateState.error ? (
            <p className="text-sm text-destructive">{updateState.error}</p>
          ) : null}

          <Button className="w-full" disabled={updatePending}>
            {updatePending ? "Saving..." : "Save changes"}
          </Button>
        </form>

        <div className="mt-4 border-t pt-4">
          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex w-full items-center justify-center gap-2 rounded-md py-2 text-sm text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              Delete item
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-center text-sm text-muted-foreground">Delete this item? This cannot be undone.</p>
              <form action={deleteAction} className="flex gap-2">
                <input type="hidden" name="itemId" value={item.id} />
                <input type="hidden" name="boqId" value={boqId} />
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="destructive" className="flex-1" disabled={deletePending}>
                  {deletePending ? "Deleting..." : "Yes, delete"}
                </Button>
              </form>
              {deleteState.error ? (
                <p className="text-sm text-destructive">{deleteState.error}</p>
              ) : null}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
