
import { Navigate } from 'react-router-dom';

const Index = () => {
  // Use Navigate component instead of useNavigate hook
  // This is safer and avoids context issues
  return <Navigate to="/" replace />;
};

export default Index;
