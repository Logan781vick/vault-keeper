import { useState } from "react";
import { BarChart3, PieChart, TrendingUp, FileText, Search } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RPieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from "recharts";

const sampleBarData = [
  { month: "Jan", revenue: 4200 },
  { month: "Feb", revenue: 5800 },
  { month: "Mar", revenue: 3900 },
  { month: "Apr", revenue: 7200 },
  { month: "May", revenue: 6100 },
  { month: "Jun", revenue: 8400 },
];

const samplePieData = [
  { name: "Product A", value: 400, color: "hsl(43, 80%, 55%)" },
  { name: "Product B", value: 300, color: "hsl(0, 72%, 50%)" },
  { name: "Product C", value: 200, color: "hsl(215, 15%, 55%)" },
  { name: "Product D", value: 100, color: "hsl(222, 30%, 40%)" },
];

const sampleLineData = [
  { week: "W1", users: 120, sessions: 340 },
  { week: "W2", users: 180, sessions: 420 },
  { week: "W3", users: 150, sessions: 380 },
  { week: "W4", users: 220, sessions: 510 },
  { week: "W5", users: 280, sessions: 620 },
  { week: "W6", users: 310, sessions: 700 },
];

const TellerThree = () => {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"charts" | "query" | "report">("charts");

  const tabs = [
    { id: "charts" as const, label: "Visualizations", icon: BarChart3 },
    { id: "query" as const, label: "AI Query", icon: Search },
    { id: "report" as const, label: "Reports", icon: FileText },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/30 bg-card/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Teller Three — Analytics Engine
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">Read-only data visualization & AI reports</p>
          </div>
          <div className="flex gap-1 p-0.5 bg-secondary/50 rounded-lg">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] transition-all
                  ${activeTab === t.id ? "bg-card text-primary win11-shadow" : "text-muted-foreground hover:text-foreground"}`}
              >
                <t.icon className="w-3 h-3" /> {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {activeTab === "charts" && (
          <div className="grid grid-cols-2 gap-4 animate-fade-up">
            {/* Bar Chart */}
            <div className="teller-card">
              <h3 className="text-xs font-semibold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="w-3.5 h-3.5 text-primary" /> Monthly Revenue
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={sampleBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,20%,20%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(215,15%,55%)" }} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(215,15%,55%)" }} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(222,40%,12%)", border: "1px solid hsl(222,20%,20%)", borderRadius: "8px", fontSize: "11px" }} />
                  <Bar dataKey="revenue" fill="hsl(43,80%,55%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="teller-card">
              <h3 className="text-xs font-semibold text-foreground mb-4 flex items-center gap-2">
                <PieChart className="w-3.5 h-3.5 text-primary" /> Product Distribution
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <RPieChart>
                  <Pie data={samplePieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" stroke="none">
                    {samplePieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "hsl(222,40%,12%)", border: "1px solid hsl(222,20%,20%)", borderRadius: "8px", fontSize: "11px" }} />
                </RPieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                {samplePieData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-[10px] text-muted-foreground">{d.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Area/Line Chart */}
            <div className="teller-card col-span-2">
              <h3 className="text-xs font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-primary" /> User Growth & Sessions
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={sampleLineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,20%,20%)" />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: "hsl(215,15%,55%)" }} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(215,15%,55%)" }} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(222,40%,12%)", border: "1px solid hsl(222,20%,20%)", borderRadius: "8px", fontSize: "11px" }} />
                  <Area type="monotone" dataKey="sessions" stroke="hsl(43,80%,55%)" fill="hsl(43,80%,55%,0.1)" strokeWidth={2} />
                  <Area type="monotone" dataKey="users" stroke="hsl(0,72%,50%)" fill="hsl(0,72%,50%,0.1)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === "query" && (
          <div className="max-w-2xl mx-auto animate-fade-up">
            <div className="teller-card">
              <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-primary" /> AI Query Generator
              </h3>
              <p className="text-[11px] text-muted-foreground mb-4">Type a natural language query and the AI will generate results.</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-secondary/50 border border-border/50 rounded-lg pl-10 pr-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                  placeholder='e.g. "Show total revenue per month"'
                />
              </div>
              {query && (
                <div className="mt-4 p-4 bg-secondary/30 rounded-lg border border-border/20">
                  <p className="text-[11px] text-primary mb-2 font-mono">Generated Query:</p>
                  <code className="text-xs text-foreground font-mono block">
                    SELECT month, SUM(revenue) as total FROM transactions GROUP BY month ORDER BY month;
                  </code>
                  <div className="mt-4 pt-3 border-t border-border/20">
                    <p className="text-[10px] text-muted-foreground">Results would appear here from your database.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "report" && (
          <div className="max-w-2xl mx-auto animate-fade-up">
            <div className="teller-card">
              <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-primary" /> AI Report Generator
              </h3>
              <p className="text-[11px] text-muted-foreground mb-4">Generate comprehensive reports with AI analysis.</p>

              <div className="space-y-3">
                <div className="p-4 bg-secondary/30 rounded-lg border border-border/20">
                  <h4 className="text-xs font-semibold text-foreground mb-2">📊 Executive Summary</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Revenue shows a positive upward trend with a 28% increase over the last quarter.
                    Key growth drivers include Product A (40% share) and expanding user base (+158% growth in sessions).
                  </p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg border border-border/20">
                  <h4 className="text-xs font-semibold text-foreground mb-2">📈 Key Metrics</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Total Revenue", value: "$35,600" },
                      { label: "Avg Monthly", value: "$5,933" },
                      { label: "Growth Rate", value: "+28%" },
                    ].map((m, i) => (
                      <div key={i} className="text-center">
                        <p className="text-lg font-bold text-primary">{m.value}</p>
                        <p className="text-[10px] text-muted-foreground">{m.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <button className="w-full py-2.5 rounded-lg border border-primary/30 text-xs text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
                  <FileText className="w-3 h-3" /> Generate Full Report (PDF)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TellerThree;
