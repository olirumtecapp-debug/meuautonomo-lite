import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
}

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "default",
  onConfirm,
}: ConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-[24px] p-6">
        <DialogHeader className="gap-2">
          <div className="flex items-center gap-3">
            {variant === "danger" && (
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-rose-50 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
            )}
            <DialogTitle className="text-lg font-bold text-[#173a34]">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-[#6f857e] leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border-[#dce5dc]"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className={
              variant === "danger"
                ? "rounded-xl bg-rose-600 text-white hover:bg-rose-700"
                : "rounded-xl bg-[#173a34] text-white hover:bg-[#28564d]"
            }
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
