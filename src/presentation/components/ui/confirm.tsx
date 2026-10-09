import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from './button';
import { Dialog } from './dialog';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  pending?: boolean;
  disabled?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  onConfirm,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  pending = false,
  disabled = false,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={pending}>
            {cancelText}
          </Button>
          <Button
            variant="destructive"
            onClick={() => onConfirm()}
            disabled={disabled || pending}
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
            {confirmText}
          </Button>
        </>
      }
    >
      {children}
    </Dialog>
  );
}