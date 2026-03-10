import { useNavigate, useLocation } from "react-router-dom";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-accent/20">
      <div className="max-w-3xl mx-auto flex items-center justify-between px-6 py-3">
        <button onClick={() => navigate("/")} className="hover:opacity-80 transition-opacity">
          <Logo size="sm" />
        </button>
        {!isHome && (
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1.5 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        )}
      </div>
    </header>
  );
}
