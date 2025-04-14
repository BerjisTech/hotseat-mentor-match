
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Flame, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

const Navbar = () => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setSession(session);
      }
    );

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

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
          {session ? (
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
          {session ? (
            <Button variant="ghost" className="text-sm gap-2" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
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
