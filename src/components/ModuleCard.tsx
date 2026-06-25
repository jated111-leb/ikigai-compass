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
  const color = themeColor || 'hsl(38 92% 58%)';

  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';

  return (
    <button
      onClick={() => !isLocked && navigate(`/module/${moduleId}`)}
      disabled={isLocked}
      className={`group relative w-full text-left p-6 rounded-2xl overflow-hidden transition-all duration-500
        ${isLocked
          ? 'opacity-40 cursor-not-allowed bg-card/40 border border-border/40'
          : 'mystical-card glow-sweep cursor-pointer'}`}
      style={
        !isLocked
          ? ({
              ['--tw-shadow-color' as any]: color,
            } as React.CSSProperties)
          : undefined
      }
    >
      {/* Ambient orb */}
      {!isLocked && (
        <div
          className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-30 blur-3xl pointer-events-none transition-opacity duration-500 group-hover:opacity-60"
          style={{ background: color }}
        />
      )}

      <div className="relative flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border transition-transform duration-500 group-hover:scale-110 ${
            isLocked
              ? 'bg-secondary text-muted-foreground border-border/40'
              : isCompleted
              ? 'bg-module-completed/15 text-module-completed border-module-completed/40'
              : ''
          }`}
          style={
            !isLocked && !isCompleted
              ? { backgroundColor: `${color}1f`, color, borderColor: `${color}66`, boxShadow: `0 0 20px ${color}33` }
              : undefined
          }
        >
          {isLocked ? <Lock className="h-5 w-5" />
           : isCompleted ? <Check className="h-5 w-5" />
           : <IconComp className="h-5 w-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground">
              Chapter {moduleId.toString().padStart(2, '0')}
            </span>
            {isCompleted && (
              <span className="text-[10px] tracking-[0.2em] uppercase text-module-completed font-medium">· Sealed</span>
            )}
          </div>
          <h3 className="text-xl font-serif font-semibold text-foreground mt-1 leading-tight">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{description}</p>
        </div>
      </div>
    </button>
  );
}
