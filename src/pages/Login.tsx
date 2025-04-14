
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Flame, Github, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate login - in a real app this would use Supabase Auth
    setTimeout(() => {
      toast({
        title: "Login Successful",
        description: "Welcome back to HotSeat.live!",
      });
      
      setLoading(false);
      window.location.href = "/dashboard";
    }, 1500);
  };

  const handleGoogleLogin = () => {
    // This would use Supabase Auth with Google provider
    toast({
      title: "Google login not implemented",
      description: "This would connect to Supabase Auth in a real implementation.",
    });
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <Flame className="h-10 w-10 text-hotseat-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to HotSeat.live</CardTitle>
          <CardDescription>
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleEmailLogin}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="you@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      to="#"
                      className="text-xs text-muted-foreground hover:text-hotseat-500"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button className="w-full" type="submit" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
                
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <span className="relative bg-card px-2 text-xs text-muted-foreground">
                    OR CONTINUE WITH
                  </span>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant="outline"
                    className="gap-2"
                    type="button"
                    onClick={handleGoogleLogin}
                  >
                    <Mail className="h-4 w-4" />
                    <span>Google</span>
                  </Button>
                </div>
              </CardContent>
            </form>
          </TabsContent>
          
          <TabsContent value="register">
            <form onSubmit={handleEmailLogin}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    type="text"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    placeholder="you@example.com"
                    type="email"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    placeholder="••••••••"
                    type="password"
                    required
                  />
                </div>
                
                <Button className="w-full" type="submit">
                  Create Account
                </Button>
                
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <span className="relative bg-card px-2 text-xs text-muted-foreground">
                    OR CONTINUE WITH
                  </span>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant="outline"
                    className="gap-2"
                    type="button"
                    onClick={handleGoogleLogin}
                  >
                    <Mail className="h-4 w-4" />
                    <span>Google</span>
                  </Button>
                </div>
              </CardContent>
            </form>
          </TabsContent>
        </Tabs>
        
        <CardFooter className="flex flex-col space-y-4 border-t pt-4">
          <p className="text-xs text-center text-muted-foreground">
            By continuing, you agree to HotSeat's Terms of Service and Privacy Policy.
          </p>
          <div className="flex items-center justify-between w-full pt-2">
            <Button asChild variant="link" size="sm" className="px-0">
              <Link to="/">
                <ArrowRight className="mr-1 h-4 w-4 rotate-180" />
                Back to home
              </Link>
            </Button>
            <Button asChild variant="link" size="sm" className="px-0">
              <Link to="/">Need help?</Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
