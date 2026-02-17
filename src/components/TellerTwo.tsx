import { useState } from "react";
import { Plus, Table2, Clock, Globe, Lock, Trash2, GripVertical, ChevronDown, Eye } from "lucide-react";
import type { DatabaseEntry, FieldDef } from "@/pages/Index";

const FIELD_TYPES = ["text", "number", "date", "boolean", "email"] as const;

interface TellerTwoProps {
  databases: DatabaseEntry[];
  setDatabases: React.Dispatch<React.SetStateAction<DatabaseEntry[]>>;
  onViewInTellerThree: (dbId: string) => void;
}

const TellerTwo = ({ databases, setDatabases, onViewInTellerThree }: TellerTwoProps) => {
  const [selectedDb, setSelectedDb] = useState<string>(databases[0]?.id || "");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDbName, setNewDbName] = useState("");
  const [newDbType, setNewDbType] = useState<"personal" | "public">("personal");
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [editingFieldName, setEditingFieldName] = useState("");

  const activeDb = databases.find((d) => d.id === selectedDb);

  const createDatabase = () => {
    if (!newDbName) return;
    const db: DatabaseEntry = {
      id: Date.now().toString(),
      name: newDbName,
      createdAt: new Date().toLocaleString(),
      type: newDbType,
      fields: [{ name: "ID", type: "number" }],
      rows: [],
    };
    setDatabases([...databases, db]);
    setSelectedDb(db.id);
    setShowCreateModal(false);
    setNewDbName("");
  };

  const addField = () => {
    if (!activeDb) return;
    setDatabases(databases.map((d) =>
      d.id === activeDb.id
        ? { ...d, fields: [...d.fields, { name: `Field ${d.fields.length + 1}`, type: "text" }] }
        : d
    ));
  };

  const renameField = (fieldIndex: number, newName: string) => {
    if (!activeDb || !newName.trim()) return;
    const oldName = activeDb.fields[fieldIndex].name;
    if (oldName === newName.trim()) { setEditingFieldIndex(null); return; }
    setDatabases(databases.map((d) =>
      d.id === activeDb.id
        ? {
            ...d,
            fields: d.fields.map((f, i) => i === fieldIndex ? { ...f, name: newName.trim() } : f),
            rows: d.rows.map((r) => {
              const newRow = { ...r };
              newRow[newName.trim()] = newRow[oldName];
              delete newRow[oldName];
              return newRow;
            }),
          }
        : d
    ));
    setEditingFieldIndex(null);
  };

  const addRow = () => {
    if (!activeDb) return;
    const emptyRow: Record<string, string> = {};
    activeDb.fields.forEach((f) => (emptyRow[f.name] = ""));
    setDatabases(databases.map((d) =>
      d.id === activeDb.id ? { ...d, rows: [...d.rows, emptyRow] } : d
    ));
  };

  const updateCell = (rowIndex: number, field: string, value: string) => {
    if (!activeDb) return;
    setDatabases(databases.map((d) =>
      d.id === activeDb.id
        ? { ...d, rows: d.rows.map((r, i) => (i === rowIndex ? { ...r, [field]: value } : r)) }
        : d
    ));
  };

  const deleteField = (fieldIndex: number) => {
    if (!activeDb || activeDb.fields.length <= 1) return;
    const fieldName = activeDb.fields[fieldIndex].name;
    setDatabases(databases.map((d) =>
      d.id === activeDb.id
        ? {
            ...d,
            fields: d.fields.filter((_, i) => i !== fieldIndex),
            rows: d.rows.map((r) => {
              const newRow = { ...r };
              delete newRow[fieldName];
              return newRow;
            }),
          }
        : d
    ));
  };

  const deleteRow = (rowIndex: number) => {
    if (!activeDb) return;
    setDatabases(databases.map((d) =>
      d.id === activeDb.id
        ? { ...d, rows: d.rows.filter((_, i) => i !== rowIndex) }
        : d
    ));
  };

  const deleteDatabase = (dbId: string) => {
    const remaining = databases.filter((d) => d.id !== dbId);
    setDatabases(remaining);
    if (selectedDb === dbId) {
      setSelectedDb(remaining.length > 0 ? remaining[0].id : "");
    }
  };

  return (
    <div className="flex h-full">
      {/* Database Strip Panel */}
      <div className="w-56 border-r border-border/30 bg-card/20 flex flex-col">
        <div className="p-3 border-b border-border/30">
          <h3 className="text-xs font-semibold text-primary tracking-wider uppercase">Databases</h3>
        </div>
        <div className="flex-1 overflow-auto p-2 space-y-1">
          {databases.map((db) => (
            <button
              key={db.id}
              onClick={() => setSelectedDb(db.id)}
              className={`w-full text-left p-2.5 rounded-lg transition-all duration-200 group
                ${selectedDb === db.id
                  ? "bg-primary/10 border border-primary/20"
                  : "hover:bg-secondary/50 border border-transparent"}`}
            >
              <div className="flex items-center gap-2">
                {db.type === "public" ? <Globe className="w-3 h-3 text-primary flex-shrink-0" /> : <Lock className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
                <span className="text-xs font-medium text-foreground truncate flex-1">{db.name}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteDatabase(db.id); }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all"
                  title="Delete database"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 ml-5">{db.createdAt}</p>
            </button>
          ))}
        </div>
        <div className="p-2 border-t border-border/30">
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full py-2 rounded-lg border border-dashed border-primary/30 text-xs text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3 h-3" /> New Database
          </button>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeDb ? (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-between p-3 border-b border-border/30 bg-card/20">
              <div className="flex items-center gap-3">
                <Table2 className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">{activeDb.name}</h2>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeDb.type === "public" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                  {activeDb.type}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onViewInTellerThree(activeDb.id)}
                  className="px-3 py-1.5 rounded-md text-[11px] bg-accent/10 text-accent hover:bg-accent/20 transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3 h-3" /> View in Teller 3
                </button>
                <button onClick={addField} className="px-3 py-1.5 rounded-md text-[11px] bg-secondary hover:bg-secondary/80 text-foreground transition-colors">
                  + Field
                </button>
                <button onClick={addRow} className="px-3 py-1.5 rounded-md text-[11px] bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                  + Row
                </button>
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-auto p-3">
              <div className="min-w-full inline-block">
                <table className="w-full border-collapse">
                  <thead>
                     <tr>
                       <th className="w-8 p-2 text-left text-[10px] text-muted-foreground border-b border-border/30">#</th>
                       <th className="w-8 p-2 border-b border-border/30"></th>
                      {activeDb.fields.map((f, i) => (
                        <th key={i} className="p-2 text-left border-b border-border/30 min-w-[140px]">
                          <div className="flex items-center gap-1.5">
                            {editingFieldIndex === i ? (
                              <input
                                autoFocus
                                value={editingFieldName}
                                onChange={(e) => setEditingFieldName(e.target.value)}
                                onBlur={() => renameField(i, editingFieldName)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") renameField(i, editingFieldName);
                                  if (e.key === "Escape") setEditingFieldIndex(null);
                                }}
                                className="text-[11px] font-medium text-foreground bg-secondary/50 border border-primary/30 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary/30 w-24"
                              />
                            ) : (
                              <span
                                className="text-[11px] font-medium text-foreground cursor-pointer hover:text-primary transition-colors"
                                onDoubleClick={() => { setEditingFieldIndex(i); setEditingFieldName(f.name); }}
                                title="Double-click to rename"
                              >
                                {f.name}
                              </span>
                            )}
                            <span className="text-[9px] text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded">{f.type}</span>
                            {activeDb.fields.length > 1 && (
                              <button
                                onClick={() => deleteField(i)}
                                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all"
                                title="Delete field"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeDb.rows.map((row, ri) => (
                       <tr key={ri} className="group hover:bg-secondary/20 transition-colors">
                        <td className="p-2 text-[10px] text-muted-foreground border-b border-border/10">{ri + 1}</td>
                        <td className="p-1 border-b border-border/10">
                          <button
                            onClick={() => deleteRow(ri)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all"
                            title="Delete row"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                        {activeDb.fields.map((f, fi) => (
                          <td key={fi} className="p-1 border-b border-border/10">
                            <input
                              type="text"
                              value={row[f.name] || ""}
                              onChange={(e) => updateCell(ri, f.name, e.target.value)}
                              className="w-full px-2 py-1.5 text-xs bg-transparent hover:bg-secondary/30 focus:bg-secondary/50 rounded transition-colors text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                    {activeDb.rows.length === 0 && (
                      <tr>
                        <td colSpan={activeDb.fields.length + 2} className="p-8 text-center text-xs text-muted-foreground">
                          No records yet. Click "+ Row" to add data.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Status bar */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-border/30 bg-card/20 text-[10px] text-muted-foreground">
              <span>{activeDb.rows.length} records · {activeDb.fields.length} fields</span>
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Saved locally
              </span>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Select or create a database
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 acrylic-blur" onClick={() => setShowCreateModal(false)}>
          <div className="glass-panel-strong p-6 w-96 space-y-4 animate-fade-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-foreground">Create New Database</h3>
            <div>
              <label className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1.5 block">Database Name</label>
              <input
                type="text"
                value={newDbName}
                onChange={(e) => setNewDbName(e.target.value)}
                className="w-full bg-secondary/50 border border-border/50 rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all"
                placeholder="e.g. Sales Records"
                autoFocus
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1.5 block">Type</label>
              <div className="flex gap-2">
                {(["personal", "public"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setNewDbType(t)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all border
                      ${newDbType === t ? "bg-primary/10 border-primary/20 text-primary" : "border-border/30 text-muted-foreground hover:text-foreground"}`}
                  >
                    {t === "personal" ? "🔒 Personal" : "🌐 Public"}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground border border-border/30 transition-colors">
                Cancel
              </button>
              <button onClick={createDatabase} disabled={!newDbName} className="flex-1 py-2 rounded-lg text-xs bg-primary text-primary-foreground font-medium hover:brightness-110 disabled:opacity-40 transition-all">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TellerTwo;
