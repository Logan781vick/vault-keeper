import { useState, useMemo, useRef } from "react";
import {
  BarChart3, PieChart, TrendingUp, FileText, Search, Printer, Table2,
  ChevronDown, Activity, AreaChart as AreaChartIcon
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RPieChart, Pie, Cell, AreaChart, Area, LineChart, Line,
} from "recharts";
import type { DatabaseEntry } from "@/pages/Index";

interface TellerThreeProps {
  databases: DatabaseEntry[];
  initialDbId?: string;
}

type TabId = "data" | "charts" | "query" | "report";
type ChartType = "bar" | "pie" | "line" | "area" | "histogram" | "column" | "frequency" | "ogive";

const CHART_COLORS = [
  "hsl(43, 80%, 55%)",
  "hsl(0, 72%, 50%)",
  "hsl(215, 15%, 55%)",
  "hsl(222, 30%, 40%)",
  "hsl(160, 60%, 45%)",
  "hsl(280, 50%, 55%)",
  "hsl(30, 80%, 55%)",
  "hsl(190, 70%, 45%)",
];

const TellerThree = ({ databases, initialDbId }: TellerThreeProps) => {
  const [selectedDbId, setSelectedDbId] = useState(initialDbId || databases[0]?.id || "");
  const [activeTab, setActiveTab] = useState<TabId>("data");
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [selectedField, setSelectedField] = useState("");
  const [query, setQuery] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  const activeDb = databases.find((d) => d.id === selectedDbId);

  // Detect numeric fields for charting
  const numericFields = useMemo(() => {
    if (!activeDb) return [];
    return activeDb.fields.filter((f) => {
      if (f.type === "number") return true;
      // Check if values are actually numeric
      return activeDb.rows.length > 0 && activeDb.rows.every((r) => !isNaN(Number(r[f.name])) && r[f.name] !== "");
    });
  }, [activeDb]);

  const textFields = useMemo(() => {
    if (!activeDb) return [];
    return activeDb.fields.filter((f) => f.type !== "number" && !numericFields.includes(f));
  }, [activeDb, numericFields]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!activeDb || numericFields.length === 0) return [];
    const labelField = textFields[0] || activeDb.fields[0];
    return activeDb.rows.map((row) => {
      const entry: Record<string, any> = { label: row[labelField.name] || "N/A" };
      numericFields.forEach((f) => {
        entry[f.name] = Number(row[f.name]) || 0;
      });
      return entry;
    });
  }, [activeDb, numericFields, textFields]);

  // Pie data: aggregate by first numeric field
  const pieData = useMemo(() => {
    if (!activeDb || numericFields.length === 0) return [];
    const valueField = selectedField && numericFields.find(f => f.name === selectedField)
      ? selectedField : numericFields[0].name;
    const labelField = textFields[0] || activeDb.fields[0];
    return activeDb.rows.map((row, i) => ({
      name: row[labelField.name] || `Item ${i + 1}`,
      value: Number(row[valueField]) || 0,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));
  }, [activeDb, numericFields, textFields, selectedField]);

  // Histogram: frequency distribution
  const histogramData = useMemo(() => {
    if (!activeDb || numericFields.length === 0) return [];
    const field = selectedField && numericFields.find(f => f.name === selectedField)
      ? selectedField : numericFields[0].name;
    const values = activeDb.rows.map((r) => Number(r[field]) || 0);
    if (values.length === 0) return [];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binCount = Math.min(8, Math.max(3, Math.ceil(Math.sqrt(values.length))));
    const binWidth = (max - min) / binCount || 1;
    const bins: { range: string; frequency: number }[] = [];
    for (let i = 0; i < binCount; i++) {
      const low = min + i * binWidth;
      const high = low + binWidth;
      bins.push({
        range: `${Math.round(low)}-${Math.round(high)}`,
        frequency: values.filter((v) => v >= low && (i === binCount - 1 ? v <= high : v < high)).length,
      });
    }
    return bins;
  }, [activeDb, numericFields, selectedField]);

  // Cumulative frequency for ogive
  const ogiveData = useMemo(() => {
    let cumulative = 0;
    return histogramData.map((bin) => {
      cumulative += bin.frequency;
      return { range: bin.range, cumulative };
    });
  }, [histogramData]);

  // AI query simulation
  const generateQueryResult = (q: string) => {
    if (!activeDb || !q) return null;
    const lower = q.toLowerCase();
    if (lower.includes("total") || lower.includes("sum")) {
      const field = numericFields[0];
      if (!field) return "No numeric fields found for aggregation.";
      const sum = activeDb.rows.reduce((s, r) => s + (Number(r[field.name]) || 0), 0);
      return `SELECT SUM(${field.name}) FROM ${activeDb.name};\n\nResult: ${sum.toLocaleString()}`;
    }
    if (lower.includes("average") || lower.includes("avg") || lower.includes("mean")) {
      const field = numericFields[0];
      if (!field) return "No numeric fields found.";
      const avg = activeDb.rows.reduce((s, r) => s + (Number(r[field.name]) || 0), 0) / (activeDb.rows.length || 1);
      return `SELECT AVG(${field.name}) FROM ${activeDb.name};\n\nResult: ${avg.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    }
    if (lower.includes("count")) {
      return `SELECT COUNT(*) FROM ${activeDb.name};\n\nResult: ${activeDb.rows.length}`;
    }
    if (lower.includes("max")) {
      const field = numericFields[0];
      if (!field) return "No numeric fields.";
      const max = Math.max(...activeDb.rows.map((r) => Number(r[field.name]) || 0));
      return `SELECT MAX(${field.name}) FROM ${activeDb.name};\n\nResult: ${max.toLocaleString()}`;
    }
    if (lower.includes("min")) {
      const field = numericFields[0];
      if (!field) return "No numeric fields.";
      const min = Math.min(...activeDb.rows.map((r) => Number(r[field.name]) || 0));
      return `SELECT MIN(${field.name}) FROM ${activeDb.name};\n\nResult: ${min.toLocaleString()}`;
    }
    return `SELECT * FROM ${activeDb.name} WHERE ... ;\n\n${activeDb.rows.length} records found.`;
  };

  // Report generation
  const reportStats = useMemo(() => {
    if (!activeDb || numericFields.length === 0) return null;
    const field = numericFields[0];
    const values = activeDb.rows.map((r) => Number(r[field.name]) || 0);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / (values.length || 1);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const sorted = [...values].sort((a, b) => a - b);
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];
    return { field: field.name, sum, avg, max, min, median, count: values.length };
  }, [activeDb, numericFields]);

  const handlePrint = () => {
    window.print();
  };

  const tabs = [
    { id: "data" as const, label: "Data View", icon: Table2 },
    { id: "charts" as const, label: "Charts", icon: BarChart3 },
    { id: "query" as const, label: "AI Query", icon: Search },
    { id: "report" as const, label: "Reports", icon: FileText },
  ];

  const chartTypes: { id: ChartType; label: string }[] = [
    { id: "bar", label: "Bar Chart" },
    { id: "column", label: "Column Graph" },
    { id: "pie", label: "Pie Chart" },
    { id: "line", label: "Line Chart" },
    { id: "area", label: "Area Chart" },
    { id: "histogram", label: "Histogram" },
    { id: "frequency", label: "Frequency Polygon" },
    { id: "ogive", label: "Ogive Curve" },
  ];

  const tooltipStyle = {
    backgroundColor: "hsl(222,40%,12%)",
    border: "1px solid hsl(222,20%,20%)",
    borderRadius: "8px",
    fontSize: "11px",
    color: "hsl(210,20%,92%)",
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/30 bg-card/20 print:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Teller Three — Analytics Engine
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">Read-only data visualization & AI reports</p>
            </div>
            {/* Database selector */}
            <div className="relative">
              <select
                value={selectedDbId}
                onChange={(e) => setSelectedDbId(e.target.value)}
                className="appearance-none bg-secondary/50 border border-border/50 rounded-lg px-3 py-1.5 pr-8 text-xs text-foreground focus:outline-none focus:border-primary/50 cursor-pointer"
              >
                {databases.map((db) => (
                  <option key={db.id} value={db.id}>{db.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-md text-[11px] bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3 h-3" /> Print
            </button>
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
      </div>

      {/* Printable content */}
      <div ref={printRef} className="flex-1 overflow-auto p-4">
        {!activeDb ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No databases available. Create one in Teller Two.
          </div>
        ) : (
          <>
            {/* Print header (hidden on screen) */}
            <div className="hidden print:block mb-6">
              <h1 className="text-lg font-bold">{activeDb.name} — {activeTab === "charts" ? "Chart Report" : activeTab === "report" ? "Data Report" : activeTab === "query" ? "Query Results" : "Data View"}</h1>
              <p className="text-xs text-muted-foreground">Generated on {new Date().toLocaleString()}</p>
            </div>

            {/* DATA VIEW TAB */}
            {activeTab === "data" && (
              <div className="animate-fade-up">
                <div className="teller-card overflow-auto">
                  <h3 className="text-xs font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Table2 className="w-3.5 h-3.5 text-primary" />
                    {activeDb.name} — Read-Only View
                    <span className="text-[10px] text-muted-foreground ml-2">{activeDb.rows.length} records · {activeDb.fields.length} fields</span>
                  </h3>
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr>
                        <th className="p-2 text-left text-[10px] text-muted-foreground border-b border-border/30 w-8">#</th>
                        {activeDb.fields.map((f, i) => (
                          <th key={i} className="p-2 text-left text-[10px] font-semibold text-foreground border-b border-border/30 uppercase tracking-wider">
                            {f.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activeDb.rows.map((row, ri) => (
                        <tr key={ri} className="hover:bg-secondary/20 transition-colors">
                          <td className="p-2 text-muted-foreground border-b border-border/10">{ri + 1}</td>
                          {activeDb.fields.map((f, fi) => (
                            <td key={fi} className="p-2 text-foreground border-b border-border/10">
                              {row[f.name] || "—"}
                            </td>
                          ))}
                        </tr>
                      ))}
                      {activeDb.rows.length === 0 && (
                        <tr>
                          <td colSpan={activeDb.fields.length + 1} className="p-8 text-center text-muted-foreground">
                            No records in this database.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CHARTS TAB */}
            {activeTab === "charts" && (
              <div className="animate-fade-up space-y-4">
                {/* Chart controls */}
                <div className="flex flex-wrap gap-2 print:hidden">
                  {chartTypes.map((ct) => (
                    <button
                      key={ct.id}
                      onClick={() => setChartType(ct.id)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] transition-all border
                        ${chartType === ct.id ? "bg-primary/10 border-primary/20 text-primary" : "border-border/30 text-muted-foreground hover:text-foreground"}`}
                    >
                      {ct.label}
                    </button>
                  ))}
                </div>
                {numericFields.length > 1 && (
                  <div className="flex items-center gap-2 print:hidden">
                    <span className="text-[11px] text-muted-foreground">Field:</span>
                    {numericFields.map((f) => (
                      <button
                        key={f.name}
                        onClick={() => setSelectedField(f.name)}
                        className={`px-2 py-1 rounded text-[10px] transition-all
                          ${(selectedField || numericFields[0].name) === f.name ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                )}

                {numericFields.length === 0 ? (
                  <div className="teller-card text-center py-12 text-muted-foreground text-xs">
                    No numeric data available for charting. Add number fields in Teller Two.
                  </div>
                ) : (
                  <div className="teller-card">
                    <h3 className="text-xs font-semibold text-foreground mb-4 flex items-center gap-2">
                      <BarChart3 className="w-3.5 h-3.5 text-primary" />
                      {chartTypes.find(c => c.id === chartType)?.label} — {activeDb.name}
                    </h3>

                    {/* Bar / Column Chart */}
                    {(chartType === "bar" || chartType === "column") && (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData} layout={chartType === "bar" ? "vertical" : "horizontal"}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,20%,20%)" />
                          {chartType === "bar" ? (
                            <>
                              <YAxis dataKey="label" type="category" tick={{ fontSize: 10, fill: "hsl(215,15%,55%)" }} axisLine={false} width={80} />
                              <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(215,15%,55%)" }} axisLine={false} />
                            </>
                          ) : (
                            <>
                              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(215,15%,55%)" }} axisLine={false} />
                              <YAxis tick={{ fontSize: 10, fill: "hsl(215,15%,55%)" }} axisLine={false} />
                            </>
                          )}
                          <Tooltip contentStyle={tooltipStyle} />
                          {numericFields.map((f, i) => (
                            <Bar key={f.name} dataKey={f.name} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[4, 4, 0, 0]} />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    )}

                    {/* Pie Chart */}
                    {chartType === "pie" && (
                      <>
                        <ResponsiveContainer width="100%" height={300}>
                          <RPieChart>
                            <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" stroke="none" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                              {pieData.map((entry, i) => (
                                <Cell key={i} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={tooltipStyle} />
                          </RPieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap gap-3 justify-center mt-2">
                          {pieData.map((d, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                              <span className="text-[10px] text-muted-foreground">{d.name}: {d.value.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Line Chart */}
                    {chartType === "line" && (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,20%,20%)" />
                          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(215,15%,55%)" }} axisLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: "hsl(215,15%,55%)" }} axisLine={false} />
                          <Tooltip contentStyle={tooltipStyle} />
                          {numericFields.map((f, i) => (
                            <Line key={f.name} type="monotone" dataKey={f.name} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={{ r: 4 }} />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    )}

                    {/* Area Chart */}
                    {chartType === "area" && (
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,20%,20%)" />
                          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(215,15%,55%)" }} axisLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: "hsl(215,15%,55%)" }} axisLine={false} />
                          <Tooltip contentStyle={tooltipStyle} />
                          {numericFields.map((f, i) => (
                            <Area key={f.name} type="monotone" dataKey={f.name} stroke={CHART_COLORS[i % CHART_COLORS.length]} fill={`${CHART_COLORS[i % CHART_COLORS.length].replace(")", ",0.15)")}`} strokeWidth={2} />
                          ))}
                        </AreaChart>
                      </ResponsiveContainer>
                    )}

                    {/* Histogram */}
                    {chartType === "histogram" && (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={histogramData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,20%,20%)" />
                          <XAxis dataKey="range" tick={{ fontSize: 10, fill: "hsl(215,15%,55%)" }} axisLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: "hsl(215,15%,55%)" }} axisLine={false} label={{ value: "Frequency", angle: -90, position: "insideLeft", style: { fontSize: 10, fill: "hsl(215,15%,55%)" } }} />
                          <Tooltip contentStyle={tooltipStyle} />
                          <Bar dataKey="frequency" fill="hsl(43,80%,55%)" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}

                    {/* Frequency Polygon */}
                    {chartType === "frequency" && (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={histogramData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,20%,20%)" />
                          <XAxis dataKey="range" tick={{ fontSize: 10, fill: "hsl(215,15%,55%)" }} axisLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: "hsl(215,15%,55%)" }} axisLine={false} label={{ value: "Frequency", angle: -90, position: "insideLeft", style: { fontSize: 10, fill: "hsl(215,15%,55%)" } }} />
                          <Tooltip contentStyle={tooltipStyle} />
                          <Line type="monotone" dataKey="frequency" stroke="hsl(0,72%,50%)" strokeWidth={2} dot={{ r: 4, fill: "hsl(0,72%,50%)" }} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}

                    {/* Ogive Curve */}
                    {chartType === "ogive" && (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={ogiveData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,20%,20%)" />
                          <XAxis dataKey="range" tick={{ fontSize: 10, fill: "hsl(215,15%,55%)" }} axisLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: "hsl(215,15%,55%)" }} axisLine={false} label={{ value: "Cumulative Freq", angle: -90, position: "insideLeft", style: { fontSize: 10, fill: "hsl(215,15%,55%)" } }} />
                          <Tooltip contentStyle={tooltipStyle} />
                          <Line type="monotone" dataKey="cumulative" stroke="hsl(160,60%,45%)" strokeWidth={2} dot={{ r: 4, fill: "hsl(160,60%,45%)" }} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* QUERY TAB */}
            {activeTab === "query" && (
              <div className="max-w-2xl mx-auto animate-fade-up">
                <div className="teller-card">
                  <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-primary" /> AI Query Generator — {activeDb.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground mb-4">
                    Type a natural language query (e.g. "total revenue", "average", "count", "max", "min").
                  </p>
                  <div className="relative print:hidden">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="w-full bg-secondary/50 border border-border/50 rounded-lg pl-10 pr-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                      placeholder={`e.g. "Show total ${numericFields[0]?.name || 'value'}"`}
                    />
                  </div>
                  {query && (
                    <div className="mt-4 p-4 bg-secondary/30 rounded-lg border border-border/20">
                      <p className="text-[11px] text-primary mb-2 font-mono">Generated Query & Result:</p>
                      <pre className="text-xs text-foreground font-mono whitespace-pre-wrap">
                        {generateQueryResult(query)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* REPORT TAB */}
            {activeTab === "report" && (
              <div className="max-w-3xl mx-auto animate-fade-up space-y-4">
                <div className="teller-card">
                  <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-primary" /> AI Report — {activeDb.name}
                  </h3>

                  {/* Executive Summary */}
                  <div className="space-y-3">
                    <div className="p-4 bg-secondary/30 rounded-lg border border-border/20">
                      <h4 className="text-xs font-semibold text-foreground mb-2">📊 Executive Summary</h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Database "{activeDb.name}" contains {activeDb.rows.length} records across {activeDb.fields.length} fields
                        ({activeDb.fields.map(f => f.name).join(", ")}).
                        {reportStats && (
                          <> The primary numeric field "{reportStats.field}" shows a total of {reportStats.sum.toLocaleString()} with
                          an average of {reportStats.avg.toLocaleString(undefined, { maximumFractionDigits: 2 })} per record.
                          Values range from {reportStats.min.toLocaleString()} to {reportStats.max.toLocaleString()} with a median of {reportStats.median.toLocaleString()}.</>
                        )}
                      </p>
                    </div>

                    {/* Key Metrics */}
                    {reportStats && (
                      <div className="p-4 bg-secondary/30 rounded-lg border border-border/20">
                        <h4 className="text-xs font-semibold text-foreground mb-3">📈 Key Metrics — {reportStats.field}</h4>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { label: "Total", value: reportStats.sum.toLocaleString() },
                            { label: "Average", value: reportStats.avg.toLocaleString(undefined, { maximumFractionDigits: 2 }) },
                            { label: "Count", value: reportStats.count.toString() },
                            { label: "Maximum", value: reportStats.max.toLocaleString() },
                            { label: "Minimum", value: reportStats.min.toLocaleString() },
                            { label: "Median", value: reportStats.median.toLocaleString() },
                          ].map((m, i) => (
                            <div key={i} className="text-center p-2 bg-card/40 rounded-lg">
                              <p className="text-lg font-bold text-primary">{m.value}</p>
                              <p className="text-[10px] text-muted-foreground">{m.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Data table in report */}
                    <div className="p-4 bg-secondary/30 rounded-lg border border-border/20">
                      <h4 className="text-xs font-semibold text-foreground mb-3">📋 Full Data Table</h4>
                      <table className="w-full border-collapse text-[11px]">
                        <thead>
                          <tr>
                            <th className="p-1.5 text-left text-muted-foreground border-b border-border/30">#</th>
                            {activeDb.fields.map((f, i) => (
                              <th key={i} className="p-1.5 text-left font-semibold text-foreground border-b border-border/30">{f.name}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {activeDb.rows.map((row, ri) => (
                            <tr key={ri}>
                              <td className="p-1.5 text-muted-foreground border-b border-border/10">{ri + 1}</td>
                              {activeDb.fields.map((f, fi) => (
                                <td key={fi} className="p-1.5 text-foreground border-b border-border/10">{row[f.name] || "—"}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <button
                      onClick={handlePrint}
                      className="w-full py-2.5 rounded-lg border border-primary/30 text-xs text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 print:hidden"
                    >
                      <Printer className="w-3 h-3" /> Print Report
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TellerThree;
