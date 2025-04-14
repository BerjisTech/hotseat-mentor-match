
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Flame } from "lucide-react";

const Navbar = () => {
  // This would be from Supabase Auth
  const isLoggedIn = false;

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center space-x-2">
            <Flame className="h-6 w-6 text-hotseat-500" />
            <span className="text-xl font-bold">HotSeat<span className="text-hotseat-500">.live</span></span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-sm font-medium transition-colors hover:text-hotseat-500">
            Home
          </Link>
          {isLoggedIn ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium transition-colors hover:text-hotseat-500">
                Dashboard
              </Link>
              <Link to="/profile" className="text-sm font-medium transition-colors hover:text-hotseat-500">
                Profile
              </Link>
            </>
          ) : null}
        </nav>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          {isLoggedIn ? (
            <Button variant="ghost" className="text-sm">
              Sign Out
            </Button>
          ) : (
            <Button asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
