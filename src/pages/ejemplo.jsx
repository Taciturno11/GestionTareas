import { useState } from "react";

/* ── Themes ── */
const THEMES = [
  { id: "crema",  label: "Crema",  emoji: "🤎", bg: "#fdf8f3", sidebar: "#fff",    border: "#ede8e0", card: "#fff",    cardBg: "#fdf8f3", text: "#1c1917", sub: "#b5a898", accent: "#1c1917", pill: "#f5f0eb" },
  { id: "limpio", label: "Limpio", emoji: "🤍", bg: "#f8fafc", sidebar: "#fff",    border: "#e2e8f0", card: "#fff",    cardBg: "#f8fafc", text: "#0f172a", sub: "#94a3b8", accent: "#2563eb", pill: "#f1f5f9" },
  { id: "sage",   label: "Sage",   emoji: "💚", bg: "#edf3eb", sidebar: "#f4f8f2", border: "#cdddc8", card: "#f7fbf5", cardBg: "#edf3eb", text: "#1a2e1a", sub: "#7a9e7a", accent: "#2d6a2d", pill: "#d8ecd5" },
  { id: "dusk",   label: "Dusk",   emoji: "💜", bg: "#f2eef8", sidebar: "#f9f6fd", border: "#ddd0ef", card: "#faf7fd", cardBg: "#f2eef8", text: "#2d1b4e", sub: "#9e82c0", accent: "#6d28d9", pill: "#ede9fe" },
  { id: "oscuro", label: "Oscuro", emoji: "🖤", bg: "#0f1117", sidebar: "#13151f", border: "#1e2030", card: "#1a1d27", cardBg: "#13151f", text: "#e8e8e8", sub: "#6b7280", accent: "#818cf8", pill: "#1e2535" },
];

/* ── Initial data ── */
const INITIAL_COLS = [
  { id: "pendiente",  label: "Pendiente",   dot: "#f59e0b" },
  { id: "progreso",   label: "En progreso", dot: "#3b82f6" },
  { id: "completado", label: "Completado",  dot: "#22c55e" },
];

const INITIAL_TASKS = [
  { id: 1, title: "Revisar propuesta de diseño",     colId: "progreso",   priority: "Alta",  tag: "Diseño",     due: "22 jul", assignee: "AG" },
  { id: 2, title: "Reunión con equipo de producto",  colId: "pendiente",  priority: "Media", tag: "Reunión",    due: "23 jul", assignee: "LT" },
  { id: 3, title: "Documentar API de autenticación", colId: "completado", priority: "Alta",  tag: "Desarrollo", due: "20 jul", assignee: "ML" },
  { id: 4, title: "Actualizar dependencias npm",     colId: "pendiente",  priority: "Baja",  tag: "Desarrollo", due: "25 jul", assignee: "CR" },
  { id: 5, title: "Redactar informe Q2",             colId: "progreso",   priority: "Alta",  tag: "Finanzas",   due: "24 jul", assignee: "SD" },
  { id: 6, title: "Revisión de código PR #48",       colId: "pendiente",  priority: "Media", tag: "Desarrollo", due: "22 jul", assignee: "AG" },
  { id: 7, title: "Configurar entorno de staging",   colId: "completado", priority: "Alta",  tag: "DevOps",     due: "19 jul", assignee: "LT" },
  { id: 8, title: "Entrevista candidato frontend",   colId: "pendiente",  priority: "Media", tag: "RRHH",       due: "26 jul", assignee: "ML" },
];

const PAGES = ["Inicio", "Mis tareas", "Proyectos", "Calendario", "Archivo"];

const PRIORITY_STYLE = {
  Alta:  { bg: "#fff1f2", color: "#be123c" },
  Media: { bg: "#fffbeb", color: "#b45309" },
  Baja:  { bg: "#f0fdf4", color: "#15803d" },
};

const TAG_COLORS = {
  Diseño: "#e0e7ff", Reunión: "#fce7f3", Desarrollo: "#dbeafe",
  Finanzas: "#d1fae5", DevOps: "#fef3c7", RRHH: "#ede9fe", General: "#f5f5f4",
};

const AVATAR_COLORS = { AG: "#6366f1", LT: "#0ea5e9", ML: "#ec4899", CR: "#10b981", SD: "#f59e0b" };
const DOT_PRESETS   = ["#f59e0b", "#3b82f6", "#22c55e", "#ec4899", "#8b5cf6", "#ef4444", "#14b8a6"];

let nextId = 100;

export default function DashboardPage() {
  const [activePage,    setActivePage]    = useState("Mis tareas");
  const [collapsed,     setCollapsed]     = useState(false);
  const [view,          setView]          = useState("kanban");
  const [themeId,       setThemeId]       = useState("crema");
  const [showThemes,    setShowThemes]    = useState(false);
  const [cols,          setCols]          = useState(INITIAL_COLS);
  const [tasks,         setTasks]         = useState(INITIAL_TASKS);
  const [adding,        setAdding]        = useState(null);
  const [newTaskTitle,  setNewTaskTitle]  = useState("");
  const [editingCol,    setEditingCol]    = useState(null);
  const [editingColLabel, setEditingColLabel] = useState("");
  const [addingCol,     setAddingCol]     = useState(false);
  const [newColLabel,   setNewColLabel]   = useState("");
  const [newColDot,     setNewColDot]     = useState(DOT_PRESETS[0]);
  const [editingTask,   setEditingTask]   = useState(null);
  const [editingTitle,  setEditingTitle]  = useState("");
  const [filter,        setFilter]        = useState("Todas");

  const T = THEMES.find(t => t.id === themeId);

  const addTask = (colId) => {
    if (!newTaskTitle.trim()) { setAdding(null); return; }
    setTasks(p => [...p, { id: nextId++, title: newTaskTitle, colId, priority: "Media", tag: "General", due: "—", assignee: "AG" }]);
    setNewTaskTitle(""); setAdding(null);
  };
  const deleteTask    = (id) => setTasks(p => p.filter(t => t.id !== id));
  const saveTaskTitle = (id) => { if (editingTitle.trim()) setTasks(p => p.map(t => t.id === id ? { ...t, title: editingTitle } : t)); setEditingTask(null); };
  const saveColLabel  = (id) => { if (editingColLabel.trim()) setCols(p => p.map(c => c.id === id ? { ...c, label: editingColLabel } : c)); setEditingCol(null); };
  const deleteCol     = (id) => { setCols(p => p.filter(c => c.id !== id)); setTasks(p => p.filter(t => t.colId !== id)); };
  const addCol = () => {
    if (!newColLabel.trim()) { setAddingCol(false); return; }
    const id = newColLabel.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now();
    setCols(p => [...p, { id, label: newColLabel, dot: newColDot }]);
    setNewColLabel(""); setAddingCol(false);
  };
  const visibleTasks = (colId) => {
    const all = tasks.filter(t => t.colId === colId);
    return filter === "Todas" ? all : all.filter(t => t.priority === filter);
  };

  /* ── shared micro-styles ── */
  const pill = (bg, color, text) => (
    <span style={{ background: bg, color, borderRadius: 5, padding: "0.12rem 0.45rem", fontSize: "0.68rem", whiteSpace: "nowrap" }}>{text}</span>
  );

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Lora', Georgia, serif", background: T.bg, color: T.text, overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Lora:opsz,wght@6..72,400;6..72,500;6..72,600&family=EB+Garamond:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* ── Sidebar ── */}
      <aside style={{ width: collapsed ? 56 : 220, background: T.sidebar, borderRight: `1px solid ${T.border}`, padding: collapsed ? "1.5rem 0.6rem" : "1.5rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.2rem", flexShrink: 0, transition: "width 0.22s ease", overflow: "hidden" }}>

        {/* Logo + collapse */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", marginBottom: "1.5rem", paddingLeft: collapsed ? 0 : "0.3rem" }}>
          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: 26, height: 26, background: T.accent, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ color: T.sidebar, fontSize: "0.75rem", fontWeight: 700 }}>T</span>
              </div>
              <span style={{ fontFamily: "'EB Garamond', serif", fontSize: "1.05rem", fontWeight: 600, whiteSpace: "nowrap", color: T.text }}>TaskFlow</span>
            </div>
          )}
          <button onClick={() => setCollapsed(p => !p)} style={{ background: "none", border: "none", cursor: "pointer", color: T.sub, fontSize: "1rem", padding: "0.2rem", lineHeight: 1 }}>
            {collapsed ? "→" : "←"}
          </button>
        </div>

        {/* Nav */}
        {PAGES.map(p => (
          <button key={p} onClick={() => setActivePage(p)} title={p} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: activePage === p ? T.pill : "transparent", border: "none", borderRadius: 6, padding: collapsed ? "0.5rem" : "0.45rem 0.75rem", justifyContent: collapsed ? "center" : "flex-start", color: activePage === p ? T.accent : T.sub, fontSize: collapsed ? "1rem" : "0.84rem", fontFamily: "'Lora', serif", fontWeight: activePage === p ? 500 : 400, cursor: "pointer", width: "100%", transition: "background 0.12s" }}>
            <span>{p[0]}</span>
            {!collapsed && p}
          </button>
        ))}

        {/* User */}
        <div style={{ marginTop: "auto", borderTop: `1px solid ${T.border}`, paddingTop: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: collapsed ? "0.5rem" : "0.6rem 0.75rem", borderRadius: 8, background: T.bg, justifyContent: collapsed ? "center" : "flex-start" }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", color: T.sidebar, fontSize: "0.72rem", fontWeight: 600, flexShrink: 0 }}>AG</div>
            {!collapsed && (
              <div>
                <div style={{ fontSize: "0.82rem", fontWeight: 500, whiteSpace: "nowrap", color: T.text }}>Ana García</div>
                <div style={{ fontSize: "0.7rem", color: T.sub }}>Administrador</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, overflowY: "auto", padding: "2.25rem 2.75rem", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.75rem" }}>
          <div>
            <div style={{ fontSize: "0.7rem", color: T.sub, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: "0.3rem" }}>Sprint · Julio 2025</div>
            <h1 style={{ fontFamily: "'EB Garamond', serif", fontSize: "2.1rem", fontWeight: 600, margin: 0, letterSpacing: "-0.02em", color: T.text }}>Mis tareas</h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", position: "relative" }}>
            {/* Priority filter */}
            <select value={filter} onChange={e => setFilter(e.target.value)} style={{ border: `1px solid ${T.border}`, borderRadius: 7, padding: "0.38rem 0.75rem", fontSize: "0.8rem", fontFamily: "'Lora', serif", color: T.sub, background: T.card, cursor: "pointer", outline: "none" }}>
              {["Todas", "Alta", "Media", "Baja"].map(f => <option key={f}>{f}</option>)}
            </select>

            {/* View toggle */}
            <div style={{ display: "flex", background: T.pill, borderRadius: 8, padding: 3 }}>
              {["kanban", "lista"].map(v => (
                <button key={v} onClick={() => setView(v)} style={{ background: view === v ? T.card : "transparent", border: "none", borderRadius: 6, padding: "0.3rem 0.9rem", fontSize: "0.78rem", color: view === v ? T.text : T.sub, fontFamily: "'Lora', serif", cursor: "pointer", boxShadow: view === v ? "0 1px 3px rgba(0,0,0,0.08)" : "none", fontWeight: view === v ? 500 : 400, textTransform: "capitalize", transition: "all 0.15s" }}>{v}</button>
              ))}
            </div>

            {/* Theme button */}
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowThemes(p => !p)} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "0.38rem 0.85rem", fontSize: "0.8rem", fontFamily: "'Lora', serif", color: T.text, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                🎨 <span style={{ color: T.sub }}>Tema</span>
              </button>

              {showThemes && (
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "0.6rem", display: "flex", flexDirection: "column", gap: "0.3rem", zIndex: 100, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", minWidth: 150 }}>
                  {THEMES.map(th => (
                    <button key={th.id} onClick={() => { setThemeId(th.id); setShowThemes(false); }} style={{ display: "flex", alignItems: "center", gap: "0.6rem", background: themeId === th.id ? T.pill : "transparent", border: "none", borderRadius: 7, padding: "0.45rem 0.75rem", cursor: "pointer", textAlign: "left", fontFamily: "'Lora', serif", fontSize: "0.84rem", color: T.text, fontWeight: themeId === th.id ? 600 : 400, transition: "background 0.1s" }}>
                      <span>{th.emoji}</span>
                      {th.label}
                      {themeId === th.id && <span style={{ marginLeft: "auto", color: T.accent, fontSize: "0.7rem" }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── KANBAN ── */}
        {view === "kanban" && (
          <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", overflowX: "auto", paddingBottom: "1rem", flex: 1 }}>
            {cols.map(col => {
              const colTasks = visibleTasks(col.id);
              return (
                <div key={col.id} style={{ background: T.card, borderRadius: 13, border: `1px solid ${T.border}`, minWidth: 265, width: 275, flexShrink: 0, display: "flex", flexDirection: "column" }}>
                  {/* Col header */}
                  <div style={{ padding: "0.9rem 1rem 0.75rem", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1, minWidth: 0 }}>
                      <div style={{ width: 9, height: 9, borderRadius: "50%", background: col.dot, flexShrink: 0 }} />
                      {editingCol === col.id ? (
                        <input autoFocus value={editingColLabel} onChange={e => setEditingColLabel(e.target.value)} onBlur={() => saveColLabel(col.id)} onKeyDown={e => { if (e.key === "Enter") saveColLabel(col.id); if (e.key === "Escape") setEditingCol(null); }} style={{ border: "none", borderBottom: `1px solid ${T.border}`, outline: "none", fontSize: "0.88rem", fontFamily: "'EB Garamond', serif", fontWeight: 600, color: T.text, background: "transparent", width: "100%" }} />
                      ) : (
                        <span onDoubleClick={() => { setEditingCol(col.id); setEditingColLabel(col.label); }} title="Doble clic para editar" style={{ fontFamily: "'EB Garamond', serif", fontWeight: 600, fontSize: "0.92rem", color: T.text, cursor: "text", whiteSpace: "nowrap" }}>{col.label}</span>
                      )}
                      <span style={{ background: T.pill, borderRadius: 99, padding: "0.1rem 0.5rem", fontSize: "0.7rem", color: T.sub, flexShrink: 0 }}>{colTasks.length}</span>
                    </div>
                    <div style={{ display: "flex", gap: "0.3rem", alignItems: "center", flexShrink: 0, marginLeft: "0.5rem" }}>
                      {DOT_PRESETS.map(d => (
                        <div key={d} onClick={() => setCols(p => p.map(c => c.id === col.id ? { ...c, dot: d } : c))} style={{ width: 8, height: 8, borderRadius: "50%", background: d, cursor: "pointer", opacity: col.dot === d ? 1 : 0.3, transition: "opacity 0.15s" }} />
                      ))}
                      <button onClick={() => deleteCol(col.id)} title="Eliminar columna" style={{ background: "none", border: "none", color: T.sub, cursor: "pointer", fontSize: "0.85rem", marginLeft: 4, lineHeight: 1, padding: 0 }}>×</button>
                    </div>
                  </div>

                  {/* Tasks */}
                  <div style={{ padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.6rem", flex: 1 }}>
                    {colTasks.map(task => (
                      <div key={task.id} style={{ background: T.cardBg, borderRadius: 9, padding: "0.85rem 0.9rem", border: `1px solid ${T.border}`, transition: "box-shadow 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = "0 3px 12px rgba(0,0,0,0.08)"}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                        {editingTask === task.id ? (
                          <input autoFocus value={editingTitle} onChange={e => setEditingTitle(e.target.value)} onBlur={() => saveTaskTitle(task.id)} onKeyDown={e => { if (e.key === "Enter") saveTaskTitle(task.id); if (e.key === "Escape") setEditingTask(null); }} style={{ border: "none", borderBottom: `1px solid ${T.border}`, outline: "none", width: "100%", fontSize: "0.86rem", fontFamily: "'Lora', serif", background: "transparent", marginBottom: "0.5rem", color: T.text }} />
                        ) : (
                          <div onDoubleClick={() => { setEditingTask(task.id); setEditingTitle(task.title); }} title="Doble clic para editar" style={{ fontSize: "0.86rem", color: T.text, marginBottom: "0.6rem", lineHeight: 1.4, cursor: "text" }}>{task.title}</div>
                        )}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                            {pill(TAG_COLORS[task.tag] || "#f5f5f4", "#44403c", task.tag)}
                            {pill(PRIORITY_STYLE[task.priority].bg, PRIORITY_STYLE[task.priority].color, task.priority)}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                            <span style={{ fontSize: "0.68rem", color: T.sub }}>{task.due}</span>
                            <div style={{ width: 20, height: 20, borderRadius: "50%", background: AVATAR_COLORS[task.assignee] || "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.55rem", fontWeight: 600 }}>{task.assignee}</div>
                            <button onClick={() => deleteTask(task.id)} style={{ background: "none", border: "none", color: T.sub, cursor: "pointer", fontSize: "0.8rem", padding: 0, lineHeight: 1 }}>×</button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Add task */}
                    {adding === col.id ? (
                      <div style={{ background: T.card, borderRadius: 9, padding: "0.75rem 0.9rem", border: `1px dashed ${T.border}` }}>
                        <input autoFocus value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addTask(col.id); if (e.key === "Escape") { setAdding(null); setNewTaskTitle(""); } }} placeholder="Nombre de la tarea…" style={{ border: "none", outline: "none", width: "100%", fontSize: "0.84rem", fontFamily: "'Lora', serif", background: "transparent", marginBottom: "0.5rem", color: T.text }} />
                        <div style={{ display: "flex", gap: "0.4rem" }}>
                          <button onClick={() => addTask(col.id)} style={{ background: T.accent, color: T.sidebar, border: "none", borderRadius: 6, padding: "0.28rem 0.75rem", fontSize: "0.75rem", fontFamily: "'Lora', serif", cursor: "pointer" }}>Añadir</button>
                          <button onClick={() => { setAdding(null); setNewTaskTitle(""); }} style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 6, padding: "0.28rem 0.6rem", fontSize: "0.75rem", fontFamily: "'Lora', serif", cursor: "pointer", color: T.sub }}>Cancelar</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setAdding(col.id)} style={{ background: "none", border: "none", color: T.sub, fontSize: "0.82rem", fontFamily: "'Lora', serif", cursor: "pointer", textAlign: "left", padding: "0.3rem 0.1rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <span style={{ fontSize: "1rem" }}>+</span> Nueva tarea
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Add column */}
            {addingCol ? (
              <div style={{ background: T.card, borderRadius: 13, border: `1px dashed ${T.border}`, minWidth: 240, padding: "1rem", flexShrink: 0 }}>
                <input autoFocus value={newColLabel} onChange={e => setNewColLabel(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addCol(); if (e.key === "Escape") setAddingCol(false); }} placeholder="Nombre del estado…" style={{ border: "none", borderBottom: `1px solid ${T.border}`, outline: "none", width: "100%", fontSize: "0.88rem", fontFamily: "'EB Garamond', serif", background: "transparent", marginBottom: "0.75rem", color: T.text }} />
                <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                  {DOT_PRESETS.map(d => (
                    <div key={d} onClick={() => setNewColDot(d)} style={{ width: 16, height: 16, borderRadius: "50%", background: d, cursor: "pointer", border: newColDot === d ? `2px solid ${T.text}` : "2px solid transparent", transition: "border 0.15s" }} />
                  ))}
                </div>
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <button onClick={addCol} style={{ background: T.accent, color: T.sidebar, border: "none", borderRadius: 6, padding: "0.3rem 0.85rem", fontSize: "0.78rem", fontFamily: "'Lora', serif", cursor: "pointer" }}>Crear</button>
                  <button onClick={() => setAddingCol(false)} style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 6, padding: "0.3rem 0.7rem", fontSize: "0.78rem", fontFamily: "'Lora', serif", cursor: "pointer", color: T.sub }}>Cancelar</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingCol(true)} style={{ background: "none", border: `1px dashed ${T.border}`, borderRadius: 13, minWidth: 200, padding: "1rem", color: T.sub, fontSize: "0.84rem", fontFamily: "'Lora', serif", cursor: "pointer", flexShrink: 0, transition: "border-color 0.15s" }}>
                + Nuevo estado
              </button>
            )}
          </div>
        )}

        {/* ── LISTA ── */}
        {view === "lista" && (
          <div style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.border}`, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 80px 60px", gap: "1rem", padding: "0.7rem 1.25rem", borderBottom: `1px solid ${T.border}`, background: T.cardBg }}>
              {["Tarea", "Estado", "Prioridad", "Etiqueta", "Fecha", ""].map(h => (
                <div key={h} style={{ fontSize: "0.7rem", color: T.sub, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</div>
              ))}
            </div>
            {tasks.filter(t => filter === "Todas" || t.priority === filter).map((task, i, arr) => {
              const col = cols.find(c => c.id === task.colId);
              return (
                <div key={task.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 80px 60px", gap: "1rem", padding: "0.8rem 1.25rem", borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : "none", alignItems: "center" }}>
                  <span style={{ fontSize: "0.87rem", color: T.text }}>{task.title}</span>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: T.pill, borderRadius: 6, padding: "0.18rem 0.5rem", width: "fit-content" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: col?.dot || "#94a3b8" }} />
                    <span style={{ fontSize: "0.74rem", color: T.sub }}>{col?.label || task.colId}</span>
                  </div>
                  <div style={{ display: "inline-flex", background: PRIORITY_STYLE[task.priority].bg, borderRadius: 6, padding: "0.18rem 0.5rem" }}>
                    <span style={{ fontSize: "0.74rem", color: PRIORITY_STYLE[task.priority].color }}>{task.priority}</span>
                  </div>
                  <div style={{ display: "inline-flex", background: TAG_COLORS[task.tag] || T.pill, borderRadius: 6, padding: "0.18rem 0.5rem" }}>
                    <span style={{ fontSize: "0.74rem", color: "#44403c" }}>{task.tag}</span>
                  </div>
                  <span style={{ fontSize: "0.77rem", color: T.sub }}>{task.due}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: AVATAR_COLORS[task.assignee] || "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.58rem", fontWeight: 600 }}>{task.assignee}</div>
                    <button onClick={() => deleteTask(task.id)} style={{ background: "none", border: "none", color: T.sub, cursor: "pointer", fontSize: "0.9rem", padding: 0 }}>×</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
