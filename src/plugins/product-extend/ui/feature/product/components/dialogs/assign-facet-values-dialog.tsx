import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Trans } from "@lingui/react/macro";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FacetValueChip,
  FacetValueSelector,
  type FacetValue,
} from "@vendure/dashboard";
import { api } from "@vendure/dashboard";
import type { ResultOf } from "@/gql";

interface EntityWithFacetValues {
  id: string;
  name: string;
  facetValues: Array<{
    id: string;
    name: string;
    code: string;
    facet: {
      id: string;
      name: string;
      code: string;
    };
  }>;
}

interface AssignFacetValuesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityIds: string[];
  queryFn: (variables: any) => Promise<ResultOf<any>>;
  mutationFn: (variables: any) => Promise<ResultOf<any>>;
  onSuccess?: () => void;
  entityType?: "product" | "variant"; // Add entity type to customize messages
  queryKey?: string; // Custom query key for cache invalidation
  dataPath?: string; // Path to items in query result (e.g., "products.items" or "productVariants.items")
}

export function AssignFacetValuesDialog({
  open,
  onOpenChange,
  entityIds,
  queryFn,
  mutationFn,
  onSuccess,
  entityType = "product",
  queryKey = "products",
  dataPath = "products.items",
}: AssignFacetValuesDialogProps) {
  const [selectedValues, setSelectedValues] = useState<FacetValue[]>([]);
  const [facetValuesRemoved, setFacetValuesRemoved] = useState(false);
  const [removedFacetValues, setRemovedFacetValues] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();
  const entityIdsLength = entityIds.length;
  const entityName = entityType === "variant" ? "variant" : "product";
  const entityNamePlural = entityType === "variant" ? "variants" : "products";

  // Fetch existing facet values for the entities
  const { data: entitiesData, isLoading } = useQuery({
    queryKey: [`${queryKey}WithFacetValues`, entityIds],
    queryFn: () => queryFn({ ids: entityIds }),
    enabled: open && entityIds.length > 0,
  });

  const { mutate, isPending } = useMutation({
    mutationFn,
    onSuccess: () => {
      toast.success(
        <Trans>
          Successfully updated facet values for {entityIdsLength} {entityNamePlural}
        </Trans>
      );
      onSuccess?.();
      onOpenChange(false);
      // Reset state
      setSelectedValues([]);
      setFacetValuesRemoved(false);
      setRemovedFacetValues(new Set());
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
    onError: () => {
      toast.error(
        <Trans>
          Failed to update facet values for {entityIdsLength} {entityNamePlural}
        </Trans>
      );
    },
  });

  const handleAssign = () => {
    if (selectedValues.length === 0 && !facetValuesRemoved) {
      toast.error(<Trans>Please select at least one facet value or make changes to existing ones</Trans>);
      return;
    }

    // Get items from data path (e.g., "products.items" or "productVariants.items")
    const pathParts = dataPath.split(".");
    let items = entitiesData as any;
    for (const part of pathParts) {
      items = items?.[part];
    }

    if (!items) {
      return;
    }

    const selectedFacetValueIds = selectedValues.map((sv) => sv.id);

    mutate({
      input: items.map((entity: EntityWithFacetValues) => ({
        id: entity.id,
        facetValueIds: Array.from(
          new Set([
            ...entity.facetValues
              .filter((fv: any) => !removedFacetValues.has(fv.id))
              .map((fv: any) => fv.id),
            ...selectedFacetValueIds,
          ])
        ),
      })),
    });
  };

  const handleFacetValueSelect = (facetValue: FacetValue) => {
    setSelectedValues((prev) => [...prev, facetValue]);
  };

  const removeFacetValue = (entityId: string, facetValueId: string) => {
    setRemovedFacetValues((prev) => new Set([...Array.from(prev), facetValueId]));
    setFacetValuesRemoved(true);
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset state
    setSelectedValues([]);
    setFacetValuesRemoved(false);
    setRemovedFacetValues(new Set());
  };

  // Filter out removed facet values for display
  const getDisplayFacetValues = (entity: EntityWithFacetValues) => {
    return entity.facetValues.filter((fv) => !removedFacetValues.has(fv.id));
  };

  // Get items from data path (e.g., "products.items" or "productVariants.items")
  const pathParts = dataPath.split(".");
  let items = entitiesData as any;
  for (const part of pathParts) {
    items = items?.[part];
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            <Trans>Edit facet values</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>
              Add or remove facet values for {entityIds.length} {entityNamePlural}
            </Trans>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Add new facet values section */}
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">
              <Trans>Add facet value</Trans>
            </div>
            <FacetValueSelector onValueSelect={handleFacetValueSelect} placeholder="Search facet values..." />
          </div>

          {/* Entities table */}
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">Loading...</div>
              </div>
            ) : items ? (
              <div className="border rounded-md">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium">
                        <Trans>{entityType === "variant" ? "Variant" : "Product"}</Trans>
                      </th>
                      <th className="text-left p-3 text-sm font-medium">
                        <Trans>Current facet values</Trans>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((entity: EntityWithFacetValues) => {
                      const displayFacetValues = getDisplayFacetValues(entity);
                      return (
                        <tr key={entity.id} className="border-t">
                          <td className="p-3 align-top">
                            <div className="font-medium">{entity.name}</div>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-2">
                              {displayFacetValues.map((facetValue) => (
                                <FacetValueChip
                                  key={facetValue.id}
                                  facetValue={facetValue}
                                  removable={true}
                                  onRemove={() => removeFacetValue(entity.id, facetValue.id)}
                                />
                              ))}
                              {displayFacetValues.length === 0 && (
                                <div className="text-sm text-muted-foreground">
                                  <Trans>No facet values</Trans>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>

          {/* Selected values summary */}
          {selectedValues.length > 0 && (
            <div className="border-t pt-4">
              <div className="text-sm font-medium mb-2">
                <Trans>New facet values to add:</Trans>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedValues.map((facetValue) => (
                  <FacetValueChip key={facetValue.id} facetValue={facetValue} removable={false} />
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            <Trans>Cancel</Trans>
          </Button>
          <Button
            onClick={handleAssign}
            disabled={(selectedValues.length === 0 && !facetValuesRemoved) || isPending}
          >
            <Trans>Update</Trans>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

