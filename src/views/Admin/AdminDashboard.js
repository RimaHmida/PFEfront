"use client"

import { useEffect, useState } from "react"
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CContainer,
  CSpinner,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from "@coreui/react"
import { CChartDoughnut } from "@coreui/react-chartjs"
import { toast } from "react-toastify"

const AdminDashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    fetch("http://localhost:8000/api/admin/dashboard-data", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`)
        return response.json()
      })
      .then((data) => {
        setData(data)
        setLoading(false)
        toast.success("✅ Données du tableau de bord chargées !")
      })
      .catch((error) => {
        console.error("Erreur chargement dashboard admin :", error)
        setError("Erreur lors du chargement des données.")
        setLoading(false)
        toast.error("❌ Erreur lors du chargement des données du tableau de bord.")
      })
  }, [])

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: colors.background,
        }}
      >
        <CSpinner
          color="primary"
          style={{ width: "3rem", height: "3rem", color: colors.primary }}
        />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: colors.background,
          color: "#dc3545",
          fontSize: "1.2rem",
          fontWeight: "600",
          padding: "1rem",
          textAlign: "center",
        }}
      >
        <p>{error || "Aucune donnée reçue du serveur."}</p>
      </div>
    )
  }

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
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = colors.shadow
        }}
      >
        <div
          style={{
            fontSize: "3rem",
            color: colors.primary,
            marginBottom: "0.4rem",
            textAlign: "center",
            userSelect: "none",
          }}
          aria-hidden="true"
        >
          {icon}
        </div>
        <h2
          style={{
            fontSize: "2.6rem",
            fontWeight: 700,
            color: colors.textPrimary,
            textAlign: "center",
            marginBottom: 6,
            userSelect: "text",
            letterSpacing: "-0.02em",
          }}
        >
          {value}
        </h2>
        <p
          style={{
            fontSize: "1.05rem",
            color: colors.textSecondary,
            textAlign: "center",
            margin: 0,
            letterSpacing: "0.04em",
            fontWeight: 600,
          }}
        >
          {title}
        </p>
      </CCard>
    </CCol>
  )

  return (
    <CContainer
      fluid
      style={{ backgroundColor: colors.background, padding: "2.5rem 3.5rem", minHeight: "100vh" }}
    >
      {/* Header */}
      <header
        style={{
          marginBottom: "1.8rem",
          paddingBottom: "0.4rem",
          borderBottom: `2px solid ${colors.border}`,
        }}
      >
        <h1
          style={{
            fontWeight: 700,
            color: colors.textPrimary,
            fontSize: "1.75rem",
            letterSpacing: "0.02em",
            margin: 0,
            userSelect: "text",
          }}
        >
          📊 Tableau de Bord Administrateur
        </h1>
        <p
          style={{
            color: colors.textSecondary,
            fontSize: "1rem",
            marginTop: "0.4rem",
            maxWidth: 460,
            lineHeight: 1.5,
            fontWeight: 500,
          }}
        >
        </p>
      </header>

      {/* KPI Cards */}
      <CRow>
        {renderDashboardCard("Total Sites", data.total_sites, "🏢")}
        {renderDashboardCard("Total Employés", data.total_employes, "👥")}
        {renderDashboardCard("Affectations en cours", data.affectations_en_cours.length, "📅")}
        {renderDashboardCard("Affectations à venir", data.affectations_a_venir.length, "⏳")}
      </CRow>

      {/* Side by side cards */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          overflowX: "auto",
          paddingBottom: "1rem",
          marginTop: "2.5rem",
          scrollbarWidth: "thin",
          scrollbarColor: `${colors.primary} transparent`,
        }}
      >
        {/* Répartition des Statuts */}
        <CCard
          style={{
            flex: "0 0 33%",
            minWidth: 320,
            maxWidth: 400,
            height: 460,
            borderRadius: 14,
            boxShadow: colors.shadow,
            border: `1px solid ${colors.border}`,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <CCardHeader
            style={{
              fontWeight: "700",
              fontSize: "1.3rem",
              borderBottom: `1px solid ${colors.border}`,
              color: colors.textPrimary,
            }}
          >
            📊 Répartition des Statuts
          </CCardHeader>
          <CCardBody
            style={{
              flexGrow: 1,
              padding: "1rem 1.5rem",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              userSelect: "none",
            }}
          >
            {data.employes_par_statut.length ? (
              <CChartDoughnut
                data={{
                  labels: data.employes_par_statut.map((e) => e.statut),
                  datasets: [
                    {
                      backgroundColor: ["#22C55E", "#EF4444", "#FBBF24", "#3B82F6"],
                      data: data.employes_par_statut.map((e) => e.total),
                    },
                  ],
                }}
                options={{ plugins: { legend: { position: "bottom" } }, maintainAspectRatio: false }}
                style={{ height: "280px" }}
              />
            ) : (
              <p
                style={{
                  color: colors.textSecondary,
                  fontSize: "1.1rem",
                  fontWeight: 500,
                  textAlign: "center",
                }}
              >
                Aucune donnée disponible.
              </p>
            )}
          </CCardBody>
        </CCard>

        {/* Employés sans affectation */}
        <CCard
          style={{
            flex: "0 0 33%",
            minWidth: 320,
            maxWidth: 400,
            height: 460,
            borderRadius: 14,
            boxShadow: colors.shadow,
            border: `1px solid ${colors.border}`,
            display: "flex",
            flexDirection: "column",
            paddingBottom: "0.5rem",
            overflow: "hidden",
          }}
        >
          <CCardHeader
            style={{
              fontWeight: "700",
              fontSize: "1.3rem",
              borderBottom: `1px solid ${colors.border}`,
              color: colors.textPrimary,
            }}
          >
            👤 Employés sans affectation
          </CCardHeader>
          <CCardBody
            style={{
              flexGrow: 1,
              padding: "1rem 1.5rem",
              overflowY: "auto",
              userSelect: "text",
            }}
          >
            {data.employes_sans_affectation.length ? (
              <CTable hover responsive style={{ borderRadius: 8, overflow: "hidden" }}>
                <CTableHead style={{ backgroundColor: colors.tableHeaderBg, color: colors.tableHeaderText }}>
                  <CTableRow>
                    <CTableHeaderCell style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>
                      Nom
                    </CTableHeaderCell>
                    <CTableHeaderCell style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>
                      Prénom
                    </CTableHeaderCell>
                    <CTableHeaderCell style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>
                      Fonction
                    </CTableHeaderCell>
                    <CTableHeaderCell style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>
                      Statut
                    </CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {data.employes_sans_affectation.map((emp) => (
                    <CTableRow
                      key={emp.id}
                      style={{ cursor: "default" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.tableRowHover)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <CTableDataCell style={{ padding: "0.75rem 1rem", color: colors.textPrimary }}>
                        {emp.nom}
                      </CTableDataCell>
                      <CTableDataCell style={{ padding: "0.75rem 1rem", color: colors.textPrimary }}>
                        {emp.prenom}
                      </CTableDataCell>
                      <CTableDataCell style={{ padding: "0.75rem 1rem", color: colors.textPrimary }}>
                        {emp.fonction}
                      </CTableDataCell>
                      <CTableDataCell style={{ padding: "0.75rem 1rem", color: colors.textPrimary }}>
                        {emp.statut}
                      </CTableDataCell>
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
        <CCard
          style={{
            flex: "0 0 33%",
            minWidth: 320,
            maxWidth: 400,
            height: 460,
            borderRadius: 14,
            boxShadow: colors.shadow,
            border: `1px solid ${colors.border}`,
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            paddingBottom: "0.5rem",
            overflow: "hidden",
          }}
        >
          <CCardHeader
            style={{
              fontWeight: "700",
              fontSize: "1.3rem",
              borderBottom: `1px solid ${colors.border}`,
              color: colors.textPrimary,
            }}
          >
            🏥 Employés en récupération
          </CCardHeader>
          <CCardBody
            style={{
              flexGrow: 1,
              padding: "1rem 1.5rem",
              overflowY: "auto",
              userSelect: "text",
            }}
          >
            {data.employes_en_recuperation.length ? (
              <CTable hover responsive style={{ borderRadius: 8, overflow: "hidden" }}>
                <CTableHead style={{ backgroundColor: colors.tableHeaderBg, color: colors.tableHeaderText }}>
                  <CTableRow>
                    <CTableHeaderCell style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>
                      Nom
                    </CTableHeaderCell>
                    <CTableHeaderCell style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>
                      Prénom
                    </CTableHeaderCell>
                    <CTableHeaderCell style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>
                      Jours de récupération restants
                    </CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {data.employes_en_recuperation.map((emp) => (
                    <CTableRow
                      key={emp.id}
                      style={{ cursor: "default" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.tableRowHover)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <CTableDataCell style={{ padding: "0.75rem 1rem", color: colors.textPrimary }}>
                        {emp.nom}
                      </CTableDataCell>
                      <CTableDataCell style={{ padding: "0.75rem 1rem", color: colors.textPrimary }}>
                        {emp.prenom}
                      </CTableDataCell>
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
    </CContainer>
  )
}

export default AdminDashboard
