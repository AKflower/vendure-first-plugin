import { useState, useCallback } from "react";

export function useDialog(initialOpen: boolean = false) {
  const [open, setOpen] = useState(initialOpen);

  const onOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
  }, []);

  const openDialog = useCallback(() => {
    setOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
  }, []);

  return {
    open,
    onOpenChange,
    openDialog,
    closeDialog,
  };
}

