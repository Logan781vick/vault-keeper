import { useState, useCallback } from "react";
import SplashScreen from "@/components/SplashScreen";
import TellerOne from "@/components/TellerOne";
import TellerTwo from "@/components/TellerTwo";
import TellerThree from "@/components/TellerThree";
import AppShell from "@/components/AppShell";

type AppState = "splash" | "auth" | "app";

const Index = () => {
  const [appState, setAppState] = useState<AppState>("splash");
  const [currentTeller, setCurrentTeller] = useState<"one" | "two" | "three">("two");
  const [username, setUsername] = useState("");

  const handleSplashComplete = useCallback(() => {
    setAppState("auth");
  }, []);

  const handleLogin = (user: string) => {
    setUsername(user);
    setAppState("app");
    setCurrentTeller("two");
  };

  const handleRegister = (user: string) => {
    setUsername(user);
    setAppState("app");
    setCurrentTeller("two");
  };

  const handleLogout = () => {
    setAppState("auth");
    setUsername("");
  };

  if (appState === "splash") {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (appState === "auth") {
    return <TellerOne onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <AppShell
      currentTeller={currentTeller}
      onNavigate={setCurrentTeller}
      onLogout={handleLogout}
      username={username}
    >
      {currentTeller === "one" && (
        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
          You are already authenticated.
        </div>
      )}
      {currentTeller === "two" && <TellerTwo />}
      {currentTeller === "three" && <TellerThree />}
    </AppShell>
  );
};

export default Index;
