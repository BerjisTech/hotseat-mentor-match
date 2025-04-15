
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="text-center">
      <div className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Get expert help <span className="text-hotseat-500">on demand</span>
        </h1>
        <p className="text-xl text-muted-foreground">
          Connect with live experts ready to solve your problems right now through
          video calls based on their expertise.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <Button asChild>
            <Link to="/dashboard">
              Start Helping Others
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/login">Join Now</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
