"use client"
import { useEffect, useState } from "react"
import {
  CCard,
  CCardBody,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CSpinner,
  CBadge,
} from "@coreui/react"
import { toast } from "react-toastify"

const AdminLoginLogs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")

  // Enhanced color scheme from admin-affectations.jsx and admin-utilisateurs.jsx
  const headerFooterColor = "#1e3a8a"
  const backgroundGeneral = "#f8fafc"
  const cardBorderRadius = "12px"
  const borderColor = "#e5e7eb"
  const boxShadow = "0 4px 12px rgba(30, 58, 138, 0.1)"
  const cardHeaderTextColor = "#FFF" // Text color for main header
  const tableHeaderTextColor = "#334155" // Dark gray text for table headers
  const cardBackground = "#ffffff" // Background for the main card

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("token")
        const params = new URLSearchParams()
        if (search) params.append("search", search)
        if (statusFilter) params.append("status", statusFilter)
        if (dateFilter) params.append("date", dateFilter)

        const res = await fetch(`http://localhost:8000/api/admin/login-logs?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await res.json()
        setLogs(data.data)
        toast.success("✅ Logs de connexion chargés avec succès !")
      } catch (error) {
        console.error("Erreur lors du chargement des logs :", error)
        toast.error("❌ Erreur lors du chargement des logs.")
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [search, statusFilter, dateFilter])

  return (
    <div
      style={{
        backgroundColor: backgroundGeneral,
        padding: "30px",
        borderRadius: cardBorderRadius,
        border: `1px solid ${borderColor}`,
        marginTop: "30px",
        minHeight: "100vh",
      }}
    >
      {/* Header - Beautiful Design */}
      <div
        style={{
          background: `linear-gradient(135deg, ${headerFooterColor} 0%, #1e40af 100%)`,
          padding: "20px 25px",
          borderRadius: cardBorderRadius,
          marginBottom: "30px",
          boxShadow: boxShadow,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h3
          style={{
            color: cardHeaderTextColor,
            margin: "0",
            fontSize: "1.8rem",
            fontWeight: "800",
            letterSpacing: "0.5px",
            textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span style={{ fontSize: "2rem", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>📝</span> Logs de
          Connexion
        </h3>
      </div>
      <CCard
        className="mb-4"
        style={{ borderRadius: cardBorderRadius, boxShadow: boxShadow, backgroundColor: cardBackground }}
      >
        {/* 🔍 Filters Section */}
        <div
          className="d-flex flex-wrap gap-3 p-4 align-items-end"
          style={{ borderBottom: `1px solid ${borderColor}` }}
        >
          <div className="flex-grow-1">
            <label
              className="form-label"
              style={{ fontWeight: "600", color: tableHeaderTextColor, marginBottom: "8px" }}
            >
              🔍 Rechercher
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Nom, email ou IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: `1px solid ${borderColor}`, borderRadius: "8px", padding: "10px 12px", width: "100%" }}
            />
          </div>
          <div>
            <label
              className="form-label"
              style={{ fontWeight: "600", color: tableHeaderTextColor, marginBottom: "8px" }}
            >
              📌 Statut
            </label>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ border: `1px solid ${borderColor}`, borderRadius: "8px", padding: "10px 12px" }}
            >
              <option value="">Tous</option>
              <option value="success">Succès</option>
              <option value="failed">Échec</option>
            </select>
          </div>
          <div>
            <label
              className="form-label"
              style={{ fontWeight: "600", color: tableHeaderTextColor, marginBottom: "8px" }}
            >
              📅 Date
            </label>
            <input
              type="date"
              className="form-control"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{ border: `1px solid ${borderColor}`, borderRadius: "8px", padding: "10px 12px" }}
            />
          </div>
          <div>
            <button
              className="btn btn-outline-secondary"
              onClick={() => {
                setSearch("")
                setStatusFilter("")
                setDateFilter("")
              }}
              style={{
                backgroundColor: "#f0f4f8", // Light gray for outline
                color: "#475569", // Slate gray text
                border: `1px solid #94a3b8`, // Medium gray border
                borderRadius: "8px",
                padding: "10px 18px",
                fontWeight: "600",
                transition: "background-color 0.3s ease, transform 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#e2e8f0"
                e.currentTarget.style.transform = "translateY(-1px)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#f0f4f8"
                e.currentTarget.style.transform = "translateY(0)"
              }}
            >
              🔄 Réinitialiser
            </button>
          </div>
        </div>
        {/* ✅ Log Table */}
        <CCardBody style={{ padding: "20px" }}>
          {loading ? (
            <div className="text-center py-5">
              <CSpinner color="primary" style={{ width: "3rem", height: "3rem" }} />
            </div>
          ) : (
            <CTable hover responsive bordered style={{ borderRadius: "8px", overflow: "hidden" }}>
              <CTableHead style={{ background: `linear-gradient(to right, #e2e8f0, #f0f4f8)` }}>
                <CTableRow>
                  <CTableHeaderCell style={{ color: tableHeaderTextColor, fontWeight: "700", padding: "12px 15px" }}>
                    #
                  </CTableHeaderCell>
                  <CTableHeaderCell style={{ color: tableHeaderTextColor, fontWeight: "700", padding: "12px 15px" }}>
                    Nom
                  </CTableHeaderCell>
                  <CTableHeaderCell style={{ color: tableHeaderTextColor, fontWeight: "700", padding: "12px 15px" }}>
                    Email
                  </CTableHeaderCell>
                  <CTableHeaderCell style={{ color: tableHeaderTextColor, fontWeight: "700", padding: "12px 15px" }}>
                    Adresse IP
                  </CTableHeaderCell>
                  <CTableHeaderCell style={{ color: tableHeaderTextColor, fontWeight: "700", padding: "12px 15px" }}>
                    Appareil
                  </CTableHeaderCell>
                  <CTableHeaderCell style={{ color: tableHeaderTextColor, fontWeight: "700", padding: "12px 15px" }}>
                    Date
                  </CTableHeaderCell>
                  <CTableHeaderCell style={{ color: tableHeaderTextColor, fontWeight: "700", padding: "12px 15px" }}>
                    Statut
                  </CTableHeaderCell>
                  <CTableHeaderCell style={{ color: tableHeaderTextColor, fontWeight: "700", padding: "12px 15px" }}>
                    Message
                  </CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {logs.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan="8" className="text-center text-muted py-4">
                      Aucun log de connexion trouvé.
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  logs.map((log, index) => (
                    <CTableRow
                      key={log.id}
                      style={{ transition: "background-color 0.2s ease" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = cardBackground)}
                    >
                      <CTableHeaderCell style={{ padding: "12px 15px" }}>{index + 1}</CTableHeaderCell>
                      <CTableDataCell style={{ padding: "12px 15px" }}>
                        {log.user ? `${log.user.nom} ${log.user.prenom}` : "Utilisateur inconnu"}
                      </CTableDataCell>
                      <CTableDataCell style={{ padding: "12px 15px" }}>
                        <CBadge
                          color="info"
                          style={{
                            backgroundColor: "#e0f2f7", // Light blue
                            color: "#1e3a8a", // Darker blue for better contrast
                            borderRadius: "6px",
                            padding: "5px 10px",
                            fontWeight: "600",
                          }}
                        >
                          {log.user ? log.user.email : log.email}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell style={{ padding: "12px 15px" }}>{log.ip_address}</CTableDataCell>
                      <CTableDataCell style={{ padding: "12px 15px" }}>
                        <small style={{ color: "#64748b", fontStyle: "italic" }}>
                          {log.user_agent?.substring(0, 40)}...
                        </small>
                      </CTableDataCell>
                      <CTableDataCell style={{ color: "#4b5563", padding: "12px 15px" }}>
                        {new Date(log.created_at).toLocaleString()}
                      </CTableDataCell>
                      <CTableDataCell style={{ padding: "12px 15px" }}>
                        {log.status === "success" ? (
                          <CBadge
                            color="success"
                            style={{
                              backgroundColor: "#dcfce7", // Light green
                              color: "#166534", // Darker green for better contrast
                              borderRadius: "6px",
                              padding: "5px 10px",
                              fontWeight: "600",
                            }}
                          >
                            🟢 Succès
                          </CBadge>
                        ) : (
                          <CBadge
                            color="danger"
                            style={{
                              backgroundColor: "#fee2e2", // Light red
                              color: "#991b1b", // Darker red for better contrast
                              borderRadius: "6px",
                              padding: "5px 10px",
                              fontWeight: "600",
                            }}
                          >
                            ❌ Échec
                          </CBadge>
                        )}
                      </CTableDataCell>
                      <CTableDataCell style={{ color: "#4b5563", padding: "12px 15px" }}>
                        {log.message || "—"}
                      </CTableDataCell>
                    </CTableRow>
                  ))
                )}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>
    </div>
  )
}

export default AdminLoginLogs
