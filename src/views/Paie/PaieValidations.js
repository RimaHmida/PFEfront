"use client"

import { useEffect, useState } from "react"
import {
  CContainer,
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
  CSpinner,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CBadge,
} from "@coreui/react"
import { toast } from "react-toastify"

const PaieValidations = () => {
  const [validations, setValidations] = useState([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem("token")

  // Updated color scheme for "just white" design
  const headerFooterColor = "#1e3a8a" // Dark blue for the main header gradient (kept for contrast)
  const buttonPrimary = "#1e3a8a" // Dark blue for primary button (kept for contrast)
  const backgroundGeneral = "#ffffff" // Pure white background
  const cardBackground = "#ffffff" // Pure white card background
  const borderColor = "#e0e0e0" // Very light gray border
  const boxShadow = "0 2px 8px rgba(0,0,0,0.05)" // Lighter shadow for white background
  const cardBorderRadius = "12px"
  const cardHeaderBackground = "#f8f8f8" // Very light gray for card headers
  const cardHeaderTextColor = "#333333" // Dark gray text for card headers

  useEffect(() => {
    fetchValidations()
  }, [])

  const fetchValidations = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/paie/validations", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message || "Erreur serveur")
      }
      const data = await res.json()
      setValidations(data.data || [])
      toast.success("✅ Consultations chargées")
    } catch (err) {
      toast.error(`❌ ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (id) => {
    const token = localStorage.getItem("token")
    const url = `http://localhost:8000/api/paie/validations/${id}/download`
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/pdf",
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error("Erreur lors du téléchargement.")
      }
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = downloadUrl
      // 🔍 Récupérer le nom du fichier depuis l'en-tête Content-Disposition
      const contentDisposition = response.headers.get("Content-Disposition")
      let filename = `presence_${id}.pdf` // valeur par défaut
      if (contentDisposition && contentDisposition.includes("filename=")) {
        const match = contentDisposition.match(/filename="(.+)"/)
        if (match && match[1]) {
          filename = match[1]
        }
      }
      link.setAttribute("download", filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      toast.error(`❌ ${err.message}`)
      console.error("Erreur téléchargement PDF:", err)
    }
  }
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: backgroundGeneral,
        }}
      >
        <CSpinner color="primary" style={{ width: "3rem", height: "3rem" }} />
      </div>
    )
  }

  return (
    <CContainer
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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: `linear-gradient(135deg, ${headerFooterColor} 0%, #1e40af 100%)`,
          padding: "20px 25px",
          borderRadius: cardBorderRadius,
          marginBottom: "30px",
          boxShadow: boxShadow,
        }}
      >
        <div>
          <h3
            style={{
              color: "#FFF",
              margin: "0 0 5px 0",
              fontSize: "1.8rem",
              fontWeight: "800",
              letterSpacing: "0.5px",
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span style={{ fontSize: "2rem", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>📋</span> Liste des
            présences validées
          </h3>
          <p
            style={{
              color: "rgba(255,255,255,0.9)",
              margin: "0",
              fontSize: "0.9rem",
              fontWeight: "400",
              letterSpacing: "0.3px",
            }}
          >
          </p>
        </div>
      </div>

      {validations.length === 0 ? (
        <p
          className="text-center text-muted"
          style={{
            fontSize: "1.1rem",
            padding: "20px",
            backgroundColor: cardBackground,
            borderRadius: cardBorderRadius,
            boxShadow: boxShadow,
          }}
        >
          Aucune affectation validée trouvée.
        </p>
      ) : (
        validations.map((val, idx) => (
          <CCard
            key={val.id}
            className="mb-4"
            style={{
              border: `1px solid ${borderColor}`,
              backgroundColor: cardBackground,
              borderRadius: cardBorderRadius,
              boxShadow: boxShadow,
              overflow: "hidden",
            }}
          >
            <CCardHeader
              style={{
                background: cardHeaderBackground, // Very light gray
                color: cardHeaderTextColor, // Dark gray text
                fontWeight: "bold",
                padding: "15px 20px",
                borderBottom: `1px solid ${borderColor}`,
                fontSize: "1.1rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <span style={{ color: headerFooterColor, fontWeight: "bold" }}>
                  {idx + 1}. {val.site}
                </span>{" "}
                | Période:{" "}
                <span
                  style={{
                    backgroundColor: "#e6f7ff", // Very light blue for period
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontWeight: "600",
                    color: "#0056b3", // Darker blue for text
                  }}
                >
                  {val.periode}
                </span>{" "}
                | Validée le:{" "}
                <span
                  style={{
                    backgroundColor: "#e6ffe6", // Very light green for validated date
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontWeight: "600",
                    color: "#008000", // Darker green for text
                  }}
                >
                  {val.validated_at}
                </span>
              </div>
            </CCardHeader>
            <CCardBody style={{ padding: "20px" }}>
              <CTable
                small
                bordered
                responsive
                style={{
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: `1px solid ${borderColor}`,
                }}
              >
                <CTableHead
                  style={{
                    background: cardHeaderBackground, // Very light gray
                    color: cardHeaderTextColor, // Dark gray text
                  }}
                >
                  <CTableRow>
                    <CTableHeaderCell style={{ padding: "12px 15px", fontWeight: "600" }}>Employé</CTableHeaderCell>
                    <CTableHeaderCell style={{ padding: "12px 15px", fontWeight: "600" }}>Date</CTableHeaderCell>
                    <CTableHeaderCell style={{ padding: "12px 15px", fontWeight: "600" }}>État</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {val.employes.map((emp) =>
                    emp.presences.map((p, i) => (
                      <CTableRow
                        key={`${emp.id}-${i}`}
                        style={{ transition: "background-color 0.2s ease" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")} // Very light gray hover
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <CTableDataCell style={{ padding: "10px 15px" }}>
                          <span style={{ fontWeight: "500", color: cardHeaderTextColor }}>
                            👤 {emp.nom} {emp.prenom}
                          </span>
                        </CTableDataCell>
                        <CTableDataCell style={{ padding: "10px 15px" }}>
                          <span
                            style={{
                              backgroundColor: "#e0e0e0", // Light gray background
                              padding: "4px 8px",
                              borderRadius: "6px",
                              fontWeight: "500",
                              color: cardHeaderTextColor,
                            }}
                          >
                            {p.date}
                          </span>
                        </CTableDataCell>
                        <CTableDataCell style={{ padding: "10px 15px" }}>
                          <CBadge
                            style={{
                              backgroundColor: p.etat === "Présent" ? "#e6ffe6" : "#ffe6e6", // Very light green/red
                              color: p.etat === "Présent" ? "#008000" : "#cc0000", // Darker green/red for text
                              padding: "6px 10px",
                              borderRadius: "6px",
                              fontWeight: "600",
                            }}
                          >
                            {p.etat === "Présent" ? "🟢 Présent" : "❌ Absent"}
                          </CBadge>
                        </CTableDataCell>
                      </CTableRow>
                    )),
                  )}
                </CTableBody>
              </CTable>
              <CButton
                color="primary"
                className="mt-3"
                onClick={() => handleDownload(val.id)}
                style={{
                  backgroundColor: buttonPrimary,
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 20px",
                  fontWeight: "600",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  transition: "background-color 0.3s ease, transform 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#152f70"
                  e.currentTarget.style.transform = "translateY(-1px)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = buttonPrimary
                  e.currentTarget.style.transform = "translateY(0)"
                }}
              >
                ⬇️ Télécharger la liste
              </CButton>
            </CCardBody>
          </CCard>
        ))
      )}
    </CContainer>
  )
}

export default PaieValidations
