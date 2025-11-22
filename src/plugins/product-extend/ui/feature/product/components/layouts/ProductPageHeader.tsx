import { Button, PageActionBar, PageActionBarRight, PageTitle } from "@vendure/dashboard";
import { Link } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";

export function ProductPageHeader() {
  return (
    <>
      <PageTitle>Products (Extend)</PageTitle>
      <PageActionBar>
        <PageActionBarRight>
          <Button asChild>
            <Link to="/products-extend/create">
              <PlusIcon className="mr-2 h-4 w-4" />
              New product
            </Link>
          </Button>
        </PageActionBarRight>
      </PageActionBar>
    </>
  );
}

