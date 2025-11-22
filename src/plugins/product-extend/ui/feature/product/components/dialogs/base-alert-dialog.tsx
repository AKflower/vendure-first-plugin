import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@vendure/dashboard";
import { Trans } from "@lingui/react/macro";

interface BaseAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string | React.ReactNode;
  description: string | React.ReactNode;
  confirmLabel?: string | React.ReactNode;
  cancelLabel?: string | React.ReactNode;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: "default" | "destructive";
  disabled?: boolean;
}

export function BaseAlertDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = <Trans>Confirm</Trans>,
  cancelLabel = <Trans>Cancel</Trans>,
  onConfirm,
  onCancel,
  variant = "default",
  disabled = false,
}: BaseAlertDialogProps) {
  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={
              variant === "destructive"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : ""
            }
            disabled={disabled}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

