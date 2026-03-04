import { NavLink } from "./NavLink";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/signin");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  return (
    <nav className="w-full bg-background/80 backdrop-blur sticky top-0 z-20 shadow">
      <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
        <NavLink to="/" className="text-xl font-bold">
          AgroSmart
        </NavLink>
        <div className="space-x-4 flex items-center">
          {user && (
            <span className="text-sm text-muted-foreground">
              {user.displayName || user.email}
            </span>
          )}
          {!user ? (
            <>
              <NavLink to="/signin" className="text-sm font-medium" activeClassName="underline">
                Sign In
              </NavLink>
              <NavLink to="/signup" className="text-sm font-medium" activeClassName="underline">
                Sign Up
              </NavLink>
            </>
          ) : (
            <Button onClick={handleLogout} variant="outline" className="text-sm">
              Logout
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
