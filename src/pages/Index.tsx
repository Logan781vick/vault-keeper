import { useState, useCallback } from "react";
import SplashScreen from "@/components/SplashScreen";
import TellerOne from "@/components/TellerOne";
import TellerTwo from "@/components/TellerTwo";
import TellerThree from "@/components/TellerThree";
import AppShell from "@/components/AppShell";

type AppState = "splash" | "auth" | "app";

export interface DatabaseEntry {
  id: string;
  name: string;
  createdAt: string;
  type: "personal" | "public";
  fields: FieldDef[];
  rows: Record<string, string>[];
}

export interface FieldDef {
  name: string;
  type: "text" | "number" | "date" | "boolean" | "email";
}

const DEFAULT_DB: DatabaseEntry = {
  id: "1",
  name: "Customer Records",
  createdAt: new Date().toLocaleString(),
  type: "personal",
  fields: [
    { name: "Name", type: "text" },
    { name: "Email", type: "email" },
    { name: "Revenue", type: "number" },
  ],
  rows: [
    { Name: "John Doe", Email: "john@example.com", Revenue: "15000" },
    { Name: "Jane Smith", Email: "jane@example.com", Revenue: "22000" },
    { Name: "Bob Wilson", Email: "bob@example.com", Revenue: "8500" },
  ],
};

const Index = () => {
  const [appState, setAppState] = useState<AppState>("splash");
  const [currentTeller, setCurrentTeller] = useState<"one" | "two" | "three">("two");
  const [username, setUsername] = useState("");
  const [databases, setDatabases] = useState<DatabaseEntry[]>([DEFAULT_DB]);
  const [selectedDbId, setSelectedDbId] = useState<string>("1");

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

  const handleViewInTellerThree = (dbId: string) => {
    setSelectedDbId(dbId);
    setCurrentTeller("three");
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
      {currentTeller === "two" && (
        <TellerTwo
          databases={databases}
          setDatabases={setDatabases}
          onViewInTellerThree={handleViewInTellerThree}
        />
      )}
      {currentTeller === "three" && (
        <TellerThree
          databases={databases}
          initialDbId={selectedDbId}
        />
      )}
    </AppShell>
  );
};

export default Index;
