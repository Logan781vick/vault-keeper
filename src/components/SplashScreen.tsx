import { useState, useEffect } from "react";
import variesLogo from "@/assets/varies-logo.png";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [phase, setPhase] = useState<"in" | "out">("in");

  useEffect(() => {
    const showTimer = setTimeout(() => setPhase("out"), 2500);
    const exitTimer = setTimeout(() => onComplete(), 3000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(exitTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(43_80%_55%_/_0.06)_0%,_transparent_70%)]" />

      <div className={`flex flex-col items-center gap-6 ${phase === "in" ? "animate-splash-in" : "animate-splash-out"}`}>
        <div className="relative">
          <div className="absolute -inset-4 rounded-full bg-primary/10 blur-2xl animate-glow-pulse" />
          <img src={variesLogo} alt="VARIES" className="relative w-28 h-28 drop-shadow-2xl" />
        </div>

        <div className="flex flex-col items-center gap-2">
          <h1 className="text-4xl font-bold tracking-[0.3em] text-primary gold-glow">
            VARIES
          </h1>
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <p className="text-sm tracking-[0.2em] text-muted-foreground uppercase">
            Vault Banking Engine
          </p>
        </div>

        {/* Loading bar */}
        <div className="w-48 h-0.5 bg-muted rounded-full overflow-hidden mt-4">
          <div className="h-full bg-gradient-to-r from-primary to-gold rounded-full animate-[loading_2.5s_ease-in-out_forwards]" 
               style={{ animation: "loading 2.5s ease-in-out forwards" }} />
        </div>
      </div>

      <style>{`
        @keyframes loading {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
