
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Users, Phone, Tags } from "lucide-react";
import AdminControls from "@/components/home/AdminControls";
import { ExpertProps } from "@/components/ExpertCard";

const AdminDashboard = () => {
  const { data: currentUser } = useQuery({
    queryKey: ['adminUser'],
  });
  
  const mockExperts: ExpertProps[] = [
    { 
      id: '1', 
      name: 'John Doe',
      bio: 'Expert in software development',
      tags: ['JavaScript', 'React'],
      isAvailable: true 
    },
    { 
      id: '2', 
      name: 'Jane Smith',
      bio: 'Expert in design',
      tags: ['UI/UX', 'Design Systems'],
      isAvailable: false 
    }
  ];

  const handleUpdateExperts = (experts: ExpertProps[]) => {
    console.log('Experts updated:', experts);
  };
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/admin/users" className="group">
          <div className="border rounded-lg p-6 h-full hover:border-hotseat-500 transition-all">
            <Users className="h-10 w-10 mb-4 text-muted-foreground group-hover:text-hotseat-500 transition-colors" />
            <h3 className="text-xl font-medium mb-2">User Management</h3>
            <p className="text-muted-foreground">Manage users, roles, and permissions</p>
          </div>
        </Link>
        
        <Link to="/admin/calls" className="group">
          <div className="border rounded-lg p-6 h-full hover:border-hotseat-500 transition-all">
            <Phone className="h-10 w-10 mb-4 text-muted-foreground group-hover:text-hotseat-500 transition-colors" />
            <h3 className="text-xl font-medium mb-2">Call History</h3>
            <p className="text-muted-foreground">View and manage call records</p>
          </div>
        </Link>
        
        <Link to="/admin/tags" className="group">
          <div className="border rounded-lg p-6 h-full hover:border-hotseat-500 transition-all">
            <Tags className="h-10 w-10 mb-4 text-muted-foreground group-hover:text-hotseat-500 transition-colors" />
            <h3 className="text-xl font-medium mb-2">Expertise Tags</h3>
            <p className="text-muted-foreground">Manage expertise categories and tags</p>
          </div>
        </Link>
      </div>
      
      <AdminControls 
        experts={mockExperts}
        onUpdateExperts={handleUpdateExperts}
      />
    </div>
  );
};

export default AdminDashboard;
