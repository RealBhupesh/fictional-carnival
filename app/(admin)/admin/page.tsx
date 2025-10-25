import { redirect } from "next/navigation";

const AdminIndexPage = () => {
  redirect("/admin/dashboard");
  return null;
};

export default AdminIndexPage;
