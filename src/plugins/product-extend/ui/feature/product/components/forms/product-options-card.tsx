import { Card, Button } from "@vendure/dashboard";
import { Pencil } from "lucide-react";

interface ProductOptionsCardProps {
  optionGroups: Array<{ id: string; name: string; code: string }>;
  onEdit?: (id: string) => void;
}

export function ProductOptionsCard({ optionGroups, onEdit }: ProductOptionsCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Product Options</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {optionGroups.length > 0 ? (
          optionGroups.map((group) => (
            <div
              key={group.id}
              className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs"
            >
              <span>{group.name}</span>
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(group.id)}
                  className="ml-1 hover:opacity-70"
                  aria-label={`Edit ${group.name}`}
                >
                  <Pencil className="h-3 w-3" />
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No options configured</p>
        )}
      </div>
    </Card>
  );
}

