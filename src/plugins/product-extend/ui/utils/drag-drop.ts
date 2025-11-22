/**
 * Drag and drop state management
 */
export interface DragDropState {
  draggedIndex: number | null;
  dragOverIndex: number | null;
}

/**
 * Initialize drag and drop state
 */
export function createDragDropState(): DragDropState {
  return {
    draggedIndex: null,
    dragOverIndex: null,
  };
}

/**
 * Handle drag start event
 */
export function handleDragStart(index: number, setState: (state: DragDropState) => void) {
  setState((prev) => ({ ...prev, draggedIndex: index }));
}

/**
 * Handle drag over event
 */
export function handleDragOver(
  e: React.DragEvent,
  index: number,
  draggedIndex: number | null,
  setState: (state: DragDropState) => void
) {
  e.preventDefault();
  if (draggedIndex === null || draggedIndex === index) return;
  setState((prev) => ({ ...prev, dragOverIndex: index }));
}

/**
 * Handle drag leave event
 */
export function handleDragLeave(setState: (state: DragDropState) => void) {
  setState((prev) => ({ ...prev, dragOverIndex: null }));
}

/**
 * Handle drop event and reorder array
 */
export function handleDrop<T>(
  e: React.DragEvent,
  dropIndex: number,
  draggedIndex: number | null,
  array: T[],
  onReorder: (newArray: T[]) => void,
  setState: (state: DragDropState) => void
) {
  e.preventDefault();
  if (draggedIndex === null || draggedIndex === dropIndex) {
    setState({ draggedIndex: null, dragOverIndex: null });
    return;
  }

  const newArray = [...array];
  const draggedItem = newArray[draggedIndex];
  newArray.splice(draggedIndex, 1);
  newArray.splice(dropIndex, 0, draggedItem);

  onReorder(newArray);
  setState({ draggedIndex: null, dragOverIndex: null });
}

/**
 * Handle drag end event
 */
export function handleDragEnd(setState: (state: DragDropState) => void) {
  setState({ draggedIndex: null, dragOverIndex: null });
}

/**
 * Get drag and drop className based on state
 */
export function getDragDropClassName(
  index: number,
  draggedIndex: number | null,
  dragOverIndex: number | null,
  baseClasses: string = ""
): string {
  const classes = [baseClasses, "cursor-move"];

  if (draggedIndex === index) {
    classes.push("opacity-50 border-primary");
  } else if (dragOverIndex === index) {
    classes.push("border-primary bg-primary/10 scale-105");
  } else {
    classes.push("border-transparent hover:border-muted-foreground/60");
  }

  return classes.filter(Boolean).join(" ");
}

