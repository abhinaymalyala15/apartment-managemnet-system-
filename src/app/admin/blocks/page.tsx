import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminBlocksWorkspace } from "@/components/admin/blocks/admin-blocks-workspace";
import { getAdminBlockSummaries } from "@/lib/admin-portal-data";

export default function AdminBlocksPage() {
  return (
    <div className="page-stack pb-8">
      <AdminPageHeader
        title="Blocks"
        description="Create blocks, define floors, and open floor views."
      />
      <AdminBlocksWorkspace blocks={getAdminBlockSummaries()} />
    </div>
  );
}
