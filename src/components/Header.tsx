import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { ArrowLeft, LogOut } from "lucide-react";

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, loading } = useAuth();
  const isHome = location.pathname === "/";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-accent/20">
      <div className="max-w-3xl mx-auto flex items-center justify-between px-6 py-3">
        <button onClick={() => navigate("/")} className="hover:opacity-80 transition-opacity">
          <Logo size="sm" />
        </button>
        <div className="flex items-center gap-3">
          {!isHome && (
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1.5 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          )}
          {!loading && (
            user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden sm:inline max-w-[140px] truncate">
                  {user.email}
                </span>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-1.5 text-muted-foreground">
                  <LogOut className="h-4 w-4" /> Sign Out
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="text-muted-foreground">
                Sign In
              </Button>
            )
          )}
        </div>
      </div>
    </header>
  );
}
