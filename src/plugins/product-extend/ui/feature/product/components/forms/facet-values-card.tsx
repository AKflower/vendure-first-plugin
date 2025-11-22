import { Card, Button } from "@vendure/dashboard";
import { X } from "lucide-react";

interface FacetValue {
  id: string;
  name: string;
  code: string;
  facet?: {
    id: string;
    name: string;
    code: string;
  };
}

interface FacetValuesCardProps {
  facetValues: FacetValue[];
  onRemove?: (facetValueId: string) => void;
  onAdd?: () => void;
}

export function FacetValuesCard({ facetValues, onRemove, onAdd }: FacetValuesCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Facet Values</h3>
      </div>
      <div className="space-y-2">
        {facetValues.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {facetValues.map((fv) => (
              <div
                key={fv.id}
                className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs"
              >
                <span>
                  {fv.name}
                  {fv.facet && ` in ${fv.facet.name}`}
                </span>
                {onRemove && (
                  <button
                    type="button"
                    onClick={() => onRemove(fv.id)}
                    className="ml-1 hover:opacity-70"
                    aria-label={`Remove ${fv.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No facet values assigned</p>
        )}
        {onAdd && (
          <Button variant="outline" size="sm" onClick={onAdd} className="mt-2">
            + Add facet values
          </Button>
        )}
      </div>
    </Card>
  );
}

