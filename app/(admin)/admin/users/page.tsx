import UserTable from "@/components/admin/user-table";

const UsersPage = () => {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-semibold text-text">User administration</h1>
        <p className="mt-2 text-sm text-text/70">
          Manage access levels, audit user activity, and perform bulk operations.
        </p>
      </section>
      <UserTable />
    </div>
  );
};

export default UsersPage;
