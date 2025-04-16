
import { Routes, Route } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminDashboard from "@/components/admin/AdminDashboard";
import UsersTab from "@/components/admin/UsersTab";
import CallsTab from "@/components/admin/CallsTab";
import TagsTab from "@/components/admin/TagsTab";

const Admin = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UsersTab />} />
        <Route path="calls" element={<CallsTab />} />
        <Route path="tags" element={<TagsTab />} />
      </Route>
    </Routes>
  );
};

export default Admin;
