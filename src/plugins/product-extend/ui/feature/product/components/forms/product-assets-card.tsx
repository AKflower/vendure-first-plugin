import { Card, Button, AssetPickerDialog } from "@vendure/dashboard";
import { Paperclip, X, GripVertical } from "lucide-react";
import { useDialog } from "../../hooks/useDialog";
import { useState } from "react";

interface Asset {
  id: string;
  preview: string | null;
  name?: string | null;
}

interface ProductAssetsCardProps {
  assets: Asset[];
  onAssetsChange: (assets: Asset[]) => void;
  isPending?: boolean;
}

export function ProductAssetsCard({ assets, onAssetsChange, isPending }: ProductAssetsCardProps) {
  const assetDialog = useDialog();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDeleteAsset = (assetId: string) => {
    const remainingAssets = assets.filter((a) => a.id !== assetId);
    onAssetsChange(remainingAssets);
  };

  const handleAddAssets = (selectedAssets: Asset[]) => {
    onAssetsChange(selectedAssets);
    assetDialog.closeDialog();
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newAssets = [...assets];
    const draggedAsset = newAssets[draggedIndex];
    newAssets.splice(draggedIndex, 1);
    newAssets.splice(dropIndex, 0, draggedAsset);

    // Asset đầu tiên sẽ là featured asset
    onAssetsChange(newAssets);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Assets</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={assetDialog.openDialog}
            disabled={isPending}
          >
            + Add asset
          </Button>
        </div>
        <div className="space-y-3">
          {assets.length > 0 && assets[0]?.preview ? (
            <div className="relative w-full aspect-square overflow-hidden rounded-lg border">
              <img
                src={assets[0].preview}
                alt="Featured asset"
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/40 text-muted-foreground">
              <Paperclip className="mb-2 size-8" />
              <p className="text-sm">No asset selected</p>
            </div>
          )}

          {assets.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {assets.map((asset, index) => (
                <div
                  key={asset.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`group relative rounded-lg border p-1 transition cursor-move ${
                    draggedIndex === index
                      ? "opacity-50 border-primary"
                      : dragOverIndex === index
                      ? "border-primary bg-primary/10 scale-105"
                      : "border-transparent hover:border-muted-foreground/60"
                  }`}
                >
                  <div className="relative">
                    {asset.preview ? (
                      <img
                        src={asset.preview}
                        alt={asset.name ?? ""}
                        className="h-16 w-16 rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                        N/A
                      </div>
                    )}
                    {/* Drag handle indicator */}
                    {index === 0 && (
                      <div className="absolute -left-1 -top-1 bg-primary text-primary-foreground rounded-full p-0.5">
                        <GripVertical className="h-3 w-3" />
                      </div>
                    )}
                    {/* Featured badge for first asset */}
                    {index === 0 && (
                      <div className="absolute -right-1 -top-1 bg-primary text-primary-foreground text-[10px] font-semibold px-1 py-0.5 rounded">
                        Featured
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAsset(asset.id);
                    }}
                    size="icon"
                    disabled={isPending}
                    className="absolute cursor-pointer -right-1 -bottom-1 hidden h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity hover:bg-destructive/90 group-hover:flex group-hover:opacity-100"
                    title="Remove asset"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <AssetPickerDialog
        open={assetDialog.open}
        onClose={assetDialog.closeDialog}
        onSelect={handleAddAssets}
        multiSelect
        initialSelectedAssets={assets.map((asset) => ({
          id: asset.id,
          preview: asset.preview ?? "",
          name: asset.name ?? "",
          createdAt: "",
          updatedAt: "",
          fileSize: 0,
          mimeType: "",
          type: "IMAGE" as const,
          source: "",
          width: 0,
          height: 0,
          focalPoint: null,
        }))}
      />
    </>
  );
}

