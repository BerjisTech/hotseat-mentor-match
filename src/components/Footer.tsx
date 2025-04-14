
import { Link } from "react-router-dom";
import { Flame } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-background py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center space-x-2">
            <Flame className="h-5 w-5 text-hotseat-500" />
            <span className="text-lg font-bold">HotSeat<span className="text-hotseat-500">.live</span></span>
          </div>
          
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
            <Link to="/" className="transition-colors hover:text-hotseat-500">
              Home
            </Link>
            <Link to="/login" className="transition-colors hover:text-hotseat-500">
              Sign In
            </Link>
            <a href="#" className="transition-colors hover:text-hotseat-500">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-hotseat-500">
              Terms
            </a>
          </nav>
          
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} HotSeat.live. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
