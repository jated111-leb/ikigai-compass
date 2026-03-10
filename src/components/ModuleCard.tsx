import { Check, Lock } from "lucide-react";
import * as Icons from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ModuleCardProps {
  moduleId: number;
  title: string;
  description: string;
  icon: string;
  status: 'locked' | 'available' | 'completed';
  themeColor?: string;
}

export function ModuleCard({ moduleId, title, description, icon, status, themeColor }: ModuleCardProps) {
  const navigate = useNavigate();
  const IconComp = (Icons as any)[icon] || Icons.Circle;

  const borderStyle = status === 'available' && themeColor
    ? { borderColor: `${themeColor}66` }
    : undefined;

  const statusStyles = {
    locked: 'opacity-50 cursor-not-allowed border-border/40',
    available: 'cursor-pointer hover:shadow-md',
    completed: 'cursor-pointer border-module-completed/40 hover:border-module-completed',
  };

  return (
    <button
      onClick={() => status !== 'locked' && navigate(`/module/${moduleId}`)}
      disabled={status === 'locked'}
      className={`w-full text-left p-6 rounded-xl border-2 bg-card transition-all ${statusStyles[status]}`}
      style={borderStyle}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            status === 'locked' ? 'bg-secondary text-muted-foreground'
            : status === 'completed' ? 'bg-module-completed/15 text-module-completed'
            : !themeColor ? 'bg-accent/15 text-accent'
            : ''
          }`}
          style={
            status === 'available' && themeColor
              ? { backgroundColor: `${themeColor}15`, color: themeColor }
              : undefined
          }
        >
          {status === 'locked' ? <Lock className="h-5 w-5" />
           : status === 'completed' ? <Check className="h-5 w-5" />
           : <IconComp className="h-5 w-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Module {moduleId}</span>
            {status === 'completed' && (
              <span className="text-xs text-module-completed font-medium">Complete</span>
            )}
          </div>
          <h3 className="text-lg font-serif font-semibold text-foreground mt-0.5">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    </button>
  );
}
