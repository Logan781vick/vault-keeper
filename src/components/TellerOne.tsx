import { useState } from "react";
import { Shield, Building2, User, Eye, EyeOff, ArrowRight, AlertTriangle } from "lucide-react";
import variesLogo from "@/assets/varies-logo.png";
import { registerUser, validateLogin } from "@/lib/backStructure";

interface TellerOneProps {
  onLogin: (username: string) => void;
  onRegister: (username: string) => void;
}

const TellerOne = ({ onLogin, onRegister }: TellerOneProps) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [isInstitution, setIsInstitution] = useState<boolean | null>(null);
  const [showPin, setShowPin] = useState(false);

  // Login state
  const [loginUser, setLoginUser] = useState("");
  const [loginKey, setLoginKey] = useState("");

  // Register state
  const [regUser, setRegUser] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regInstitution, setRegInstitution] = useState("");
  const [regRecoveryPin, setRegRecoveryPin] = useState("");

  const generateVaultKey = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const handleRegister = () => {
    const key = generateVaultKey();
    const result = registerUser({
      username: regUser,
      vaultKey: key,
      email: regEmail,
      institution: isInstitution ? regInstitution : undefined,
      recoveryPin: regRecoveryPin,
      createdAt: new Date().toISOString(),
    });
    if (result.success) {
      setGeneratedKey(key);
      setAlertMsg(null);
    } else {
      setAlertMsg(result.error || "Registration failed.");
    }
  };

  const handleConfirmRegister = () => {
    onRegister(regUser);
  };

  const handleLogin = () => {
    const result = validateLogin(loginUser, loginKey);
    if (result.success) {
      setAlertMsg(null);
      onLogin(loginUser);
    } else {
      setAlertMsg(result.error || "Login failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_hsl(43_80%_55%_/_0.04)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_hsl(0_72%_50%_/_0.03)_0%,_transparent_50%)]" />

      <div className="w-full max-w-md relative">
        {/* Header */}
        <div className="flex flex-col items-center mb-8 animate-fade-up">
          <img src={variesLogo} alt="VARIES" className="w-16 h-16 mb-4" />
          <h1 className="text-2xl font-bold text-primary tracking-wider gold-glow">TELLER ONE</h1>
          <p className="text-xs text-muted-foreground tracking-widest mt-1">AUTHENTICATION CORE</p>
        </div>

        {/* Alert Message */}
        {alertMsg && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-xs animate-fade-up">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{alertMsg}</span>
          </div>
        )}

        {/* Mode toggle */}
        <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setGeneratedKey(null); setIsInstitution(null); setAlertMsg(null); }}
              className={`flex-1 py-2 text-xs font-medium rounded-md transition-all duration-200
                ${mode === m ? "bg-card text-primary win11-shadow" : "text-muted-foreground hover:text-foreground"}`}
            >
              {m === "login" ? "Login" : "Register"}
            </button>
          ))}
        </div>

        {/* Login Form */}
        {mode === "login" && (
          <div className="glass-panel-strong p-6 space-y-4 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <div>
              <label className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1.5 block">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  className="w-full bg-secondary/50 border border-border/50 rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                  placeholder="Enter username"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1.5 block">Vault Key (6-digit PIN)</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPin ? "text" : "password"}
                  value={loginKey}
                  onChange={(e) => setLoginKey(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full bg-secondary/50 border border-border/50 rounded-lg pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all tracking-[0.3em]"
                  placeholder="••••••"
                  maxLength={6}
                />
                <button onClick={() => setShowPin(!showPin)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              onClick={handleLogin}
              disabled={!loginUser || loginKey.length !== 6}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Access Vault <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Register Form */}
        {mode === "register" && !generatedKey && (
          <div className="glass-panel-strong p-6 space-y-4 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            {/* Institution question */}
            {isInstitution === null && (
              <div className="space-y-3">
                <p className="text-sm text-foreground text-center">Are you working under an institution?</p>
                <div className="flex gap-3">
                  <button onClick={() => setIsInstitution(true)} className="flex-1 py-3 rounded-lg border border-border/50 bg-secondary/30 hover:border-primary/30 hover:bg-primary/5 transition-all text-sm text-foreground flex items-center justify-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" /> Yes
                  </button>
                  <button onClick={() => setIsInstitution(false)} className="flex-1 py-3 rounded-lg border border-border/50 bg-secondary/30 hover:border-primary/30 hover:bg-primary/5 transition-all text-sm text-foreground flex items-center justify-center gap-2">
                    <User className="w-4 h-4 text-primary" /> No
                  </button>
                </div>
              </div>
            )}

            {isInstitution !== null && (
              <>
                <div>
                  <label className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1.5 block">Username</label>
                  <input
                    type="text"
                    value={regUser}
                    onChange={(e) => setRegUser(e.target.value)}
                    className="w-full bg-secondary/50 border border-border/50 rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                    placeholder="Choose a username"
                  />
                </div>
                {isInstitution && (
                  <div>
                    <label className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1.5 block">Institution Name</label>
                    <input
                      type="text"
                      value={regInstitution}
                      onChange={(e) => setRegInstitution(e.target.value)}
                      className="w-full bg-secondary/50 border border-border/50 rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                      placeholder="Institution name"
                    />
                  </div>
                )}
                <div>
                  <label className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1.5 block">Email</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-secondary/50 border border-border/50 rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1.5 block">Recovery PIN</label>
                  <input
                    type="text"
                    value={regRecoveryPin}
                    onChange={(e) => setRegRecoveryPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className="w-full bg-secondary/50 border border-border/50 rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all tracking-[0.3em]"
                    placeholder="4-digit PIN"
                    maxLength={4}
                  />
                </div>
                <button
                  onClick={handleRegister}
                  disabled={!regUser || !regEmail || regRecoveryPin.length !== 4}
                  className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Generate Vault Key <Shield className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        )}

        {/* Generated Key Display */}
        {generatedKey && (
          <div className="glass-panel-strong p-6 space-y-4 animate-fade-up text-center">
            <Shield className="w-10 h-10 text-primary mx-auto" />
            <h3 className="text-lg font-bold text-foreground">Your Vault Key</h3>
            <p className="text-3xl font-mono font-bold text-primary tracking-[0.5em] gold-glow">{generatedKey}</p>
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
              <p className="text-xs text-accent">⚠ Store this key securely. It cannot be regenerated.</p>
            </div>
            <button
              onClick={handleConfirmRegister}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              Proceed to Database Engine <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TellerOne;
