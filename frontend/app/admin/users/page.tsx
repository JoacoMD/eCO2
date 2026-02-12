import AdminUsersTable from "@/components/admin/UsersTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <div>
      <Card className="w-full sm:max-w-4xl">
        <CardHeader>
          <CardTitle>Staff members</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminUsersTable />
        </CardContent>
      </Card>
    </div>
  );
}
