import PendingMilestonesTable from "@/components/admin/PendingMilestonesTable";
import AdminProjectsTable from "@/components/admin/ProjectsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <div>
      <Card className="w-full sm:max-w-4xl min-w-lg">
        <CardHeader>
          <CardTitle>Project Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminProjectsTable />
        </CardContent>
      </Card>
      <Card className="w-full sm:max-w-4xl mt-4">
        <CardHeader>
          <CardTitle>Pending Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <PendingMilestonesTable />
        </CardContent>
      </Card>
    </div>
  );
}
