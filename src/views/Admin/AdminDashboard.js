// AdminDashboard.js
"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import {
  CCard, CCardBody, CCardHeader, CRow, CCol, CContainer, CSpinner,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
} from "@coreui/react"
import { CChartDoughnut } from "@coreui/react-chartjs"
import { toast } from "react-toastify"

/** Build a valid Bearer header (avoids "Bearer Bearer ...") */
function buildAuthHeader(raw) {
  if (!raw) return {}
  const t = String(raw).trim()
  const value = t.toLowerCase().startsWith("bearer ") ? t : `Bearer ${t}`
  return { Authorization: value }
}

/** Try very hard to locate a JWT token */
function findToken() {
  if (typeof window === "undefined") return null
  const looksLikeJwt = (s) =>
    typeof s === "string" &&
    s.split(".").length === 3 &&
    s.length > 20 &&
    /[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+/.test(s)

  const preferredKeys = ["access_token", "token", "jwt", "bearer", "auth", "user"]
  for (const k of preferredKeys) {
    const v = localStorage.getItem(k) ?? sessionStorage.getItem(k)
    if (!v) continue
    if (looksLikeJwt(v)) return v.trim()
    try {
      const o = JSON.parse(v)
      const cand =
        o?.token ?? o?.access_token ?? o?.data?.token ?? o?.data?.access_token ?? o?.user?.token
      if (looksLikeJwt(cand)) return String(cand).trim()
    } catch {}
  }
  for (const store of [localStorage, sessionStorage]) {
    for (let i = 0; i < store.length; i++) {
      const key = store.key(i)
      const raw = store.getItem(key)
      if (!raw) continue
      if (looksLikeJwt(raw)) return raw.trim()
      try {
        const o = JSON.parse(raw)
        const cand =
          o?.token ?? o?.access_token ?? o?.data?.token ?? o?.data?.access_token ?? o?.user?.token
        if (looksLikeJwt(cand)) return String(cand).trim()
      } catch {}
    }
  }
  const cookies = document.cookie.split(";").map((c) => c.trim())
  for (const c of cookies) {
    const [name, val] = c.split("=")
    if (!val) continue
    const allowed = ["access_token", "token", "jwt", "bearer"]
    if (allowed.includes(name)) {
      const dec = decodeURIComponent(val)
      if (looksLikeJwt(dec)) return dec
    }
  }
  return null
}

/** Read response safely: text first, then try JSON parse */
async function readMaybeJson(res) {
  const text = await res.text()
  try { return { raw: text, json: JSON.parse(text) } } catch { return { raw: text, json: null } }
}

/** API base */
const API_BASE = (() => {
  try {
    const fromProcess =
      (typeof process !== "undefined" &&
        process.env &&
        process.env.NEXT_PUBLIC_API_BASE) ||
      null
    const fromVite =
      (typeof import.meta !== "undefined" &&
        import.meta.env &&
        import.meta.env.VITE_API_BASE) ||
      null
    const fromStorage =
      (typeof window !== "undefined" &&
        (localStorage.getItem("API_BASE") ||
         sessionStorage.getItem("API_BASE"))) ||
      null
    return fromProcess || fromVite || fromStorage || "http://localhost:8000"
  } catch {
    return "http://localhost:8000"
  }
})()

export default function AdminDashboard() {
  // --- state ---------------------------------------------------------------
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [scores, setScores] = useState([])
  const [loadingScores, setLoadingScores] = useState(true)
  const [scoresErr, setScoresErr] = useState(null)
  const [minScore, setMinScore] = useState(0)
  const [weeks, setWeeks] = useState(8)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshMsg, setRefreshMsg] = useState("")

  const [token, setToken] = useState(() => findToken())

  const recheckToken = useCallback(() => {
    const t = findToken()
    setToken(t)
    if (!t) toast.error("Aucun token trouvé. Veuillez vous connecter.")
  }, [])

  // --- theme ---------------------------------------------------------------
  const colors = {
    background: "#FAFAFA",
    cardBg: "#FFFFFF",
    border: "#E5E7EB",
    shadow: "0 4px 12px rgba(0,0,0,0.06)",
    primary: "#2563EB",
    textPrimary: "#111827",
    textSecondary: "#6B7280",
    tableHeaderBg: "#F3F4F6",
    tableHeaderText: "#374151",
    tableRowHover: "#EFF6FF",
    redBg: "#FEE2E2",
    redText: "#991B1B",
    amberBg: "#FFF7ED",
    amberText: "#9A3412",
    emeraldBg: "#ECFDF5",
    emeraldText: "#065F46",
  }

  // --- headers (auth) ------------------------------------------------------
  const authHeaders = useMemo(() => {
    return { Accept: "application/json", ...buildAuthHeader(token) }
  }, [token])

  // --- effects: fetch dashboard (protected) --------------------------------
  useEffect(() => {
    const ac = new AbortController()
    const load = async () => {
      if (!token) {
        setError("HTTP 401 (Unauthorized): token manquant ou invalide")
        setLoading(false)
        return
      }
      try {
        const res = await fetch(`${API_BASE}/api/admin/dashboard-data`, {
          headers: authHeaders,
          signal: ac.signal,
        })
        const { json, raw } = await readMaybeJson(res)
        if (!res.ok) {
          if (res.status === 401) throw new Error("HTTP 401 (Unauthorized): token manquant ou invalide")
          throw new Error(json?.message || `Erreur HTTP: ${res.status} ${raw || ""}`)
        }
        setData(json)
        toast.success("✅ Données du tableau de bord chargées !")
      } catch (e) {
        if (ac.signal.aborted) return
        console.error("Erreur chargement dashboard admin :", e)
        setError(e?.message || "Erreur lors du chargement des données.")
        toast.error("❌ Erreur lors du chargement des données du tableau de bord.")
      } finally {
        if (!ac.signal.aborted) setLoading(false)
      }
    }
    load()
    return () => ac.abort()
  }, [authHeaders, token])

  // --- fetch scores (auth header OK even if route public) ------------------
  const fetchScores = useCallback(async () => {
    setLoadingScores(true)
    setScoresErr(null)
    const headers = { Accept: "application/json", ...authHeaders }
    try {
      const res = await fetch(
        `${API_BASE}/api/admin/anomaly-scores?limit=200&latest_per_employee=1`,
        { headers }
      )
      const { json, raw } = await readMaybeJson(res)
      if (!res.ok) throw new Error(json?.message || `HTTP ${res.status} ${raw || ""}`)
      setScores(Array.isArray(json?.data) ? json.data : [])
    } catch (e) {
      console.error("Erreur chargement scores :", e)
      setScoresErr(e?.message || "Erreur lors du chargement des scores.")
    } finally {
      setLoadingScores(false)
    }
  }, [authHeaders])

  useEffect(() => { fetchScores() }, [fetchScores])

  // --- MEMOS ---------------------------------------------------------------
  const rows = useMemo(() => {
    const mapped = (scores || []).map((r) => {
      let ex = null
      if (r && r.extras) {
        try { ex = typeof r.extras === "string" ? JSON.parse(r.extras) : r.extras } catch {}
      }
      return {
        ...r,
        _score: typeof r.score === "string" ? parseFloat(r.score) : (r.score ?? 0),
        _reasons: Array.isArray(ex?.reasons) ? ex.reasons : [],
      }
    })
    return mapped
      .filter((r) => (r._score ?? 0) >= (Number.isFinite(minScore) ? Number(minScore) : 0))
      .sort((a, b) => (b._score ?? 0) - (a._score ?? 0))
  }, [scores, minScore])

  const bucket = (s) => (s >= 0.5 ? "severe" : s >= 0.3 ? "medium" : "low")

  const severityCounts = useMemo(() => {
    const c = { severe: 0, medium: 0, low: 0 }
    rows.forEach((r) => { c[bucket(r._score ?? 0)]++ })
    return c
  }, [rows])

  // --- helpers --------------------------------------------------------------
  const renderDashboardCard = (title, value, icon) => (
    <CCol xs={12} sm={6} lg={3} className="mb-4" key={title}>
      <CCard
        style={{
          border: `1px solid ${colors.border}`,
          backgroundColor: colors.cardBg,
          borderRadius: 14,
          boxShadow: colors.shadow,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "1.8rem 1.5rem",
          transition: "box-shadow 0.3s ease",
          cursor: "default",
        }}
        className="dashboard-card"
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)")}
        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = colors.shadow)}
      >
        <div
          style={{ fontSize: "3rem", color: colors.primary, marginBottom: "0.4rem", textAlign: "center", userSelect: "none" }}
          aria-hidden="true"
        >
          {icon}
        </div>
        <h2
          style={{ fontSize: "2.6rem", fontWeight: 700, color: colors.textPrimary, textAlign: "center", marginBottom: 6, userSelect: "text", letterSpacing: "-0.02em" }}
        >
          {value}
        </h2>
        <p style={{ fontSize: "1.05rem", color: colors.textSecondary, textAlign: "center", margin: 0, letterSpacing: "0.04em", fontWeight: 600 }}>
          {title}
        </p>
      </CCard>
    </CCol>
  )

  const SevPill = ({ s }) => {
    const k = bucket(s)
    const bg = k === "severe" ? colors.redBg : k === "medium" ? colors.amberBg : colors.emeraldBg
    const fg = k === "severe" ? colors.redText : k === "medium" ? colors.amberText : colors.emeraldText
    const label = k === "severe" ? "Severe" : k === "medium" ? "Medium" : "Low"
    return (
      <span style={{ background: bg, color: fg, padding: "2px 8px", borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
        {label}
      </span>
    )
  }

  // --- actions --------------------------------------------------------------
  const refresh = async () => {
    if (!token) {
      setRefreshMsg("HTTP 401 (Unauthorized): token manquant ou invalide")
      toast.error("❌ Échec du rafraîchissement: pas de token.")
      return
    }
    const w = Math.min(52, Math.max(1, parseInt(String(weeks || 8), 10)))
    setWeeks(w)
    setRefreshing(true)
    setRefreshMsg("Exécution…")
    try {
      const res = await fetch(`${API_BASE}/api/admin/anomaly-scores/refresh`, {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ weeks: w }),
      })
      const { json, raw } = await readMaybeJson(res)
      if (!res.ok || !(json?.ok ?? false)) {
        if (res.status === 401) throw new Error("HTTP 401 (Unauthorized): token manquant ou invalide")
        const msg = json?.stderr || json?.message || raw || `HTTP ${res.status}`
        throw new Error(msg)
      }
      setRefreshMsg(json?.stdout || "Rafraîchi.")
      toast.success("🔄 Scores recalculés.")
      await fetchScores()
    } catch (e) {
      setRefreshMsg(`Erreur: ${e?.message || e}`)
      toast.error("❌ Échec du rafraîchissement des scores.")
    } finally {
      setRefreshing(false)
      setTimeout(() => setRefreshMsg(""), 4000)
    }
  }

  // --- early returns --------------------------------------------------------
  if (!token) {
    return (
      <CContainer fluid style={{ backgroundColor: colors.background, padding: "2.5rem 3.5rem", minHeight: "100vh" }}>
        <CCard style={{ maxWidth: 720, margin: "4rem auto", borderRadius: 14, boxShadow: colors.shadow, border: `1px solid ${colors.border}` }}>
          <CCardHeader style={{ fontWeight: 700, fontSize: "1.2rem" }}>Authentification requise</CCardHeader>
          <CCardBody style={{ color: colors.textSecondary }}>
            <p style={{ marginBottom: 12 }}>HTTP 401 (Unauthorized): token manquant ou invalide.</p>
            <ol style={{ paddingLeft: 18, marginTop: 0 }}>
              <li>Connectez-vous via votre page de connexion.</li>
              <li>Assurez-vous d’enregistrer le token dans <code>localStorage</code> (clé <code>access_token</code> ou <code>token</code>).</li>
            </ol>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={recheckToken} style={{ padding: "8px 12px", borderRadius: 10, border: `1px solid ${colors.border}`, background: "#fff", cursor: "pointer" }}>
                🔁 J’ai fini de me connecter — Re-vérifier
              </button>
            </div>
          </CCardBody>
        </CCard>
      </CContainer>
    )
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: colors.background }}>
        <CSpinner color="primary" style={{ width: "3rem", height: "3rem", color: colors.primary }} />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div
        style={{
          display: "flex", justifyContent: "center", alignItems: "center",
          minHeight: "100vh", backgroundColor: colors.background, color: "#dc3545",
          fontSize: "1.2rem", fontWeight: 600, padding: "1rem", textAlign: "center",
        }}
      >
        <p>{error || "Aucune donnée reçue du serveur."}</p>
        <button
          onClick={() => {
            setLoading(true)
            setError(null)
            setTimeout(() => window.location.reload(), 50)
          }}
          style={{ marginLeft: 12, padding: "8px 12px", borderRadius: 10, border: `1px solid ${colors.border}`, background: "#fff", cursor: "pointer" }}
        >
          Recharger la page
        </button>
      </div>
    )
  }

  // --- safe fallbacks -------------------------------------------------------
  const employesParStatut = Array.isArray(data?.employes_par_statut) ? data.employes_par_statut : []
  const employesSansAffectation = Array.isArray(data?.employes_sans_affectation) ? data.employes_sans_affectation : []
  const employesEnRecuperation = Array.isArray(data?.employes_en_recuperation) ? data.employes_en_recuperation : []

  // --- render ---------------------------------------------------------------
  return (
    <CContainer fluid style={{ backgroundColor: colors.background, padding: "2.5rem 3.5rem", minHeight: "100vh" }}>
      {/* Header */}
      <header style={{ marginBottom: "1.8rem", paddingBottom: "0.4rem", borderBottom: `2px solid ${colors.border}` }}>
        <h1 style={{ fontWeight: 700, color: colors.textPrimary, fontSize: "1.75rem", letterSpacing: "0.02em", margin: 0, userSelect: "text" }}>
          📊 Tableau de Bord Administrateur
        </h1>
      </header>

      {/* KPI Cards */}
      <CRow>
        {renderDashboardCard("Total Sites", data.total_sites, "🏢")}
        {renderDashboardCard("Total Employés", data.total_employes, "👥")}
        {renderDashboardCard("Affectations en cours", data.affectations_en_cours?.length ?? 0, "📅")}
        {renderDashboardCard("Affectations à venir", data.affectations_a_venir?.length ?? 0, "⏳")}
      </CRow>

      {/* Side by side cards */}
      <div style={{ display: "flex", gap: "1rem", overflowX: "auto", paddingBottom: "1rem", marginTop: "2.5rem", scrollbarWidth: "thin", scrollbarColor: `${colors.primary} transparent` }}>
        {/* Répartition des Statuts */}
        <CCard style={{ flex: "0 0 33%", minWidth: 320, maxWidth: 400, height: 460, borderRadius: 14, boxShadow: colors.shadow, border: `1px solid ${colors.border}`, display: "flex", flexDirection: "column" }}>
          <CCardHeader style={{ fontWeight: "700", fontSize: "1.3rem", borderBottom: `1px solid ${colors.border}`, color: colors.textPrimary }}>
            📊 Répartition des Statuts
          </CCardHeader>
          <CCardBody style={{ flexGrow: 1, padding: "1rem 1.5rem", display: "flex", justifyContent: "center", alignItems: "center", userSelect: "none" }}>
            {employesParStatut.length ? (
              <CChartDoughnut
                data={{
                  labels: employesParStatut.map((e) => e.statut),
                  datasets: [{ backgroundColor: ["#22C55E", "#EF4444", "#FBBF24", "#3B82F6"], data: employesParStatut.map((e) => e.total) }],
                }}
                options={{ plugins: { legend: { position: "bottom" } }, maintainAspectRatio: false }}
                style={{ height: 280 }}
              />
            ) : (
              <p style={{ color: colors.textSecondary, fontSize: "1.1rem", fontWeight: 500, textAlign: "center" }}>
                Aucune donnée disponible.
              </p>
            )}
          </CCardBody>
        </CCard>

        {/* Employés sans affectation */}
        <CCard style={{ flex: "0 0 33%", minWidth: 320, maxWidth: 400, height: 460, borderRadius: 14, boxShadow: colors.shadow, border: `1px solid ${colors.border}`, display: "flex", flexDirection: "column", paddingBottom: "0.5rem", overflow: "hidden" }}>
          <CCardHeader style={{ fontWeight: "700", fontSize: "1.3rem", borderBottom: `1px solid ${colors.border}`, color: colors.textPrimary }}>
            👤 Employés sans affectation
          </CCardHeader>
          <CCardBody style={{ flexGrow: 1, padding: "1rem 1.5rem", overflowY: "auto", userSelect: "text" }}>
            {employesSansAffectation.length ? (
              <CTable hover responsive style={{ borderRadius: 8, overflow: "hidden" }}>
                <CTableHead style={{ backgroundColor: colors.tableHeaderBg, color: colors.tableHeaderText }}>
                  <CTableRow>
                    <CTableHeaderCell style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Nom</CTableHeaderCell>
                    <CTableHeaderCell style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Prénom</CTableHeaderCell>
                    <CTableHeaderCell style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Fonction</CTableHeaderCell>
                    <CTableHeaderCell style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Statut</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {employesSansAffectation.map((emp) => (
                    <CTableRow key={emp.id} style={{ cursor: "default" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.tableRowHover)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <CTableDataCell style={{ padding: "0.75rem 1rem", color: colors.textPrimary }}>{emp.nom}</CTableDataCell>
                      <CTableDataCell style={{ padding: "0.75rem 1rem", color: colors.textPrimary }}>{emp.prenom}</CTableDataCell>
                      <CTableDataCell style={{ padding: "0.75rem 1rem", color: colors.textPrimary }}>{emp.fonction}</CTableDataCell>
                      <CTableDataCell style={{ padding: "0.75rem 1rem", color: colors.textPrimary }}>{emp.statut}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            ) : (
              <p style={{ color: colors.textSecondary, textAlign: "center", margin: "2rem 0" }}>
                Aucun employé sans affectation.
              </p>
            )}
          </CCardBody>
        </CCard>

        {/* Employés en récupération */}
        <CCard style={{ flex: "0 0 33%", minWidth: 320, maxWidth: 400, height: 460, borderRadius: 14, boxShadow: colors.shadow, border: `1px solid ${colors.border}`, flexGrow: 1, display: "flex", flexDirection: "column", paddingBottom: "0.5rem", overflow: "hidden" }}>
          <CCardHeader style={{ fontWeight: "700", fontSize: "1.3rem", borderBottom: `1px solid ${colors.border}`, color: colors.textPrimary }}>
            🏥 Employés en récupération
          </CCardHeader>
          <CCardBody style={{ flexGrow: 1, padding: "1rem 1.5rem", overflowY: "auto", userSelect: "text" }}>
            {employesEnRecuperation.length ? (
              <CTable hover responsive style={{ borderRadius: 8, overflow: "hidden" }}>
                <CTableHead style={{ backgroundColor: colors.tableHeaderBg, color: colors.tableHeaderText }}>
                  <CTableRow>
                    <CTableHeaderCell style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Nom</CTableHeaderCell>
                    <CTableHeaderCell style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Prénom</CTableHeaderCell>
                    <CTableHeaderCell style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Jours de récupération restants</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {employesEnRecuperation.map((emp) => (
                    <CTableRow key={emp.id} style={{ cursor: "default" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.tableRowHover)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <CTableDataCell style={{ padding: "0.75rem 1rem", color: colors.textPrimary }}>{emp.nom}</CTableDataCell>
                      <CTableDataCell style={{ padding: "0.75rem 1rem", color: colors.textPrimary }}>{emp.prenom}</CTableDataCell>
                      <CTableDataCell style={{ padding: "0.75rem 1rem", color: colors.textPrimary }}>
                        {emp.jours_recuperation_restants ?? "N/A"}
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            ) : (
              <p style={{ color: colors.textSecondary, textAlign: "center", margin: "2rem 0" }}>
                Aucun employé en récupération.
              </p>
            )}
          </CCardBody>
        </CCard>
      </div>

      {/* 🔎 Anomaly Scores */}
      <CCard style={{ marginTop: "2rem", borderRadius: 14, boxShadow: colors.shadow, border: `1px solid ${colors.border}`, overflow: "hidden" }}>
        <CCardHeader
          style={{
            fontWeight: 700, fontSize: "1.3rem", color: colors.textPrimary,
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
          }}
        >
          <span>🔎 Anomaly Scores (dernier par employé)</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <label style={{ fontSize: 13, color: colors.textSecondary }}>
              Min score
              <input
                type="number" min={0} max={1} step={0.01} value={minScore}
                onChange={(e) => setMinScore(parseFloat(e.target.value || "0"))}
                style={{ marginLeft: 8, width: 90, padding: "6px 8px", borderRadius: 8, border: `1px solid ${colors.border}` }}
              />
            </label>
            <label style={{ fontSize: 13, color: colors.textSecondary }}>
              Weeks
              <input
                type="number" min={1} max={52} step={1} value={weeks}
                onChange={(e) => setWeeks(parseInt(e.target.value || "8", 10))}
                style={{ marginLeft: 8, width: 70, padding: "6px 8px", borderRadius: 8, border: `1px solid ${colors.border}` }}
              />
            </label>
            <button
              onClick={refresh} disabled={refreshing}
              style={{ padding: "8px 12px", borderRadius: 10, border: `1px solid ${colors.border}`, background: "#fff", cursor: refreshing ? "not-allowed" : "pointer", opacity: refreshing ? 0.6 : 1 }}
              title="Recalculer les scores et recharger"
            >
              {refreshing ? "Refreshing…" : "🔄 Refresh"}
            </button>
            <span style={{ fontSize: 12, color: colors.textSecondary, minHeight: 18 }}>{refreshMsg}</span>
          </div>
        </CCardHeader>

        <CCardBody style={{ padding: "1rem 1.25rem" }}>
          {loadingScores ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: colors.textSecondary }}>
              <CSpinner size="sm" /> Chargement des scores…
            </div>
          ) : scoresErr ? (
            <div style={{ color: "#dc3545" }}>Erreur: {scoresErr}</div>
          ) : rows.length === 0 ? (
            <div style={{ color: colors.textSecondary }}>Aucun score disponible.</div>
          ) : (
            <>
              <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
                <div style={{ width: 220, height: 220 }}>
                  <CChartDoughnut
                    data={{
                      labels: ["Severe (≥ 0.5)", "Medium (0.3–0.5)", "Low (< 0.3)"],
                      datasets: [{
                        backgroundColor: [colors.redBg, colors.amberBg, colors.emeraldBg],
                        data: [severityCounts.severe, severityCounts.medium, severityCounts.low]
                      }],
                    }}
                    options={{ plugins: { legend: { position: "bottom" } }, maintainAspectRatio: false }}
                    style={{ height: 220 }}
                  />
                </div>
                <div style={{ color: colors.textSecondary, fontSize: 14 }}>
                  <div>Total: <strong style={{ color: colors.textPrimary }}>{rows.length}</strong></div>
                  <div>Severe: <strong style={{ color: colors.textPrimary }}>{severityCounts.severe}</strong></div>
                  <div>Medium: <strong style={{ color: colors.textPrimary }}>{severityCounts.medium}</strong></div>
                  <div>Low: <strong style={{ color: colors.textPrimary }}>{severityCounts.low}</strong></div>
                </div>
              </div>

              <CTable hover responsive style={{ borderRadius: 8, overflow: "hidden" }}>
                <CTableHead style={{ backgroundColor: colors.tableHeaderBg, color: colors.tableHeaderText }}>
                  <CTableRow>
                    <CTableHeaderCell style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Employé</CTableHeaderCell>
                    <CTableHeaderCell style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Semaine</CTableHeaderCell>
                    <CTableHeaderCell style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Score</CTableHeaderCell>
                    <CTableHeaderCell style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Sévérité</CTableHeaderCell>
                    <CTableHeaderCell style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Statut</CTableHeaderCell>
                    <CTableHeaderCell style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Raison (Severe)</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {rows.map((r) => (
                    <CTableRow key={r.id ?? `${r.employe_id}-${r.week_start}`} style={{ cursor: "default" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.tableRowHover)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <CTableDataCell style={{ padding: "0.75rem 1rem", color: colors.textPrimary }}>
                        {(r.prenom || "") + " " + (r.nom || "")} <span style={{ color: colors.textSecondary }}></span>
                      </CTableDataCell>
                      <CTableDataCell style={{ padding: "0.75rem 1rem", color: colors.textPrimary }}>
                        {String(r.week_start).slice(0, 10)}
                      </CTableDataCell>
                      <CTableDataCell style={{ padding: "0.75rem 1rem", color: colors.textPrimary, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" }}>
                        {(r._score ?? 0).toFixed(5)}
                      </CTableDataCell>
                      <CTableDataCell style={{ padding: "0.75rem 1rem" }}>
                        <SevPill s={r._score ?? 0} />
                      </CTableDataCell>
                      <CTableDataCell style={{ padding: "0.75rem 1rem", color: colors.textPrimary }}>
                        {r.statut ?? "—"}
                      </CTableDataCell>
                      <CTableDataCell style={{ padding: "0.75rem 1rem", color: colors.textPrimary }}>
                        {(r._score ?? 0) >= 0.5 && r._reasons.length ? r._reasons[0] : "—"}
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </>
          )}
        </CCardBody>
      </CCard>
    </CContainer>
  )
}
