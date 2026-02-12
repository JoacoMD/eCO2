import AdminCompaniesTable from "@/components/admin/CompaniesTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <div>
      <Card className="w-full sm:max-w-4xl">
        <CardHeader>
          <CardTitle>Companies Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminCompaniesTable/>
        </CardContent>
      </Card>
    </div>
  );
}
