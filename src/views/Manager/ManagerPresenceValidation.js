"use client"
import { useEffect, useState } from "react"
import { CCard, CCardBody, CCardHeader, CContainer, CButton, CSpinner, CBadge } from "@coreui/react"
import { toast } from "react-toastify"

const ManagerPresenceValidation = () => {
  const [affectations, setAffectations] = useState([])
  const [loading, setLoading] = useState(true)
  const [validatingId, setValidatingId] = useState(null)
  const token = localStorage.getItem("token")

  // Consistent color scheme and styling variables
  const headerFooterColor = "#1e3a8a"
  const buttonPrimary = "#1e3a8a"
  const backgroundGeneral = "#f8fafc"
  const cardBackground = "#ffffff"
  const borderColor = "#e5e7eb"
  const boxShadow = "0 4px 12px rgba(30, 58, 138, 0.1)"
  const cardBorderRadius = "12px"
  const cardHeaderBackground = `linear-gradient(135deg, ${headerFooterColor} 0%, #1e40af 100%)`
  const cardHeaderTextColor = "#FFF"

  const fetchAffectations = async () => {
    setLoading(true)
    try {
      const res = await fetch("http://localhost:8000/api/manager/presences", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setAffectations(data.data)
      toast.success("✅ Présences chargées")
    } catch {
      toast.error("❌ Erreur lors du chargement")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAffectations()
  }, [token])

  const handleValidate = async (affectationId) => {
    setValidatingId(affectationId)
    try {
      const res = await fetch(`http://localhost:8000/api/manager/presences/validate/${affectationId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const result = await res.json()
      if (!res.ok) throw new Error()
      toast.success("✅ " + result.message)
      fetchAffectations()
    } catch {
      toast.error("❌ Erreur lors de la validation")
    } finally {
      setValidatingId(null)
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
          justifyContent: "center",
          alignItems: "center",
          background: cardHeaderBackground,
          padding: "20px 25px",
          borderRadius: cardBorderRadius,
          marginBottom: "30px",
          boxShadow: boxShadow,
        }}
      >
        <h3
          style={{
            color: cardHeaderTextColor,
            margin: 0,
            fontSize: "1.8rem",
            fontWeight: "800",
            letterSpacing: "0.5px",
            textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span style={{ fontSize: "2rem", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>📝</span> Validation des
          Présences
        </h3>
      </div>

      {affectations.length === 0 ? (
        <p className="text-center text-muted" style={{ fontSize: "1.1rem", padding: "20px" }}>
          Aucune affectation passée nécessitant une validation.
        </p>
      ) : (
        affectations.map((aff) => (
          <CCard
            key={aff.id}
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
                background: cardHeaderBackground,
                color: cardHeaderTextColor,
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
                {aff.site.nomsite} |{" "}
                <span
                  style={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontWeight: "normal",
                  }}
                >
                  {aff.date_debut} → {aff.date_fin}
                </span>
              </div>
              {aff.validated_by_manager && (
                <CBadge
                  color="success"
                  style={{
                    backgroundColor: "#10b981", // Emerald green
                    color: "#fff",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                  }}
                >
                  ✅ Validée
                </CBadge>
              )}
            </CCardHeader>
            <CCardBody style={{ padding: "20px" }}>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {aff.employes.map((emp) => (
                  <li
                    key={emp.id}
                    style={{
                      marginBottom: "15px", // Increased margin for better separation
                      padding: "12px 15px", // Increased padding
                      backgroundColor: "#f1f5f9", // Light gray background for list items
                      borderRadius: "10px", // Slightly more rounded corners
                      display: "flex",
                      flexDirection: "column", // Stack content vertically
                      alignItems: "flex-start", // Align items to the start
                      boxShadow: "0 2px 5px rgba(0,0,0,0.05)", // Subtle shadow for each employee block
                    }}
                  >
                    <strong style={{ color: "#334155", marginBottom: "8px", fontSize: "1rem" }}>
                      {emp.nom} {emp.prenom} :
                    </strong>{" "}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {" "}
                      {/* Container for presence entries */}
                      {emp.presences.length > 0 ? (
                        emp.presences.map((p) => (
                          <span
                            key={p.id}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              backgroundColor: "#e2e8f0", // Light gray background for each presence entry
                              padding: "6px 10px",
                              borderRadius: "8px",
                              fontSize: "0.85rem",
                              color: "#475569",
                              fontWeight: "500",
                            }}
                          >
                            {p.date} (
                            <CBadge
                              color={p.present ? "success" : "danger"}
                              style={{
                                backgroundColor: p.present ? "#10b981" : "#ef4444", // Emerald green / Red
                                color: "#fff",
                                padding: "3px 7px", // Smaller padding for badge
                                borderRadius: "5px",
                                fontSize: "0.75rem", // Smaller font for badge
                                fontWeight: "600",
                                marginLeft: "5px",
                              }}
                            >
                              {p.present ? "Présent" : "Absent"}
                            </CBadge>
                            )
                          </span>
                        ))
                      ) : (
                        <span className="text-muted fst-italic" style={{ fontSize: "0.9rem" }}>
                          Aucune présence enregistrée
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="text-end mt-4">
                <CButton
                  color="success"
                  disabled={aff.validated_by_manager || validatingId === aff.id}
                  onClick={() => handleValidate(aff.id)}
                  style={{
                    backgroundColor: aff.validated_by_manager ? "#9ca3af" : "#10b981", // Gray if validated, Emerald green otherwise
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 20px",
                    fontWeight: "600",
                    transition: "background-color 0.3s ease, transform 0.2s ease",
                    cursor: aff.validated_by_manager ? "not-allowed" : "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (!aff.validated_by_manager) {
                      e.currentTarget.style.backgroundColor = "#059669"
                      e.currentTarget.style.transform = "translateY(-1px)"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!aff.validated_by_manager) {
                      e.currentTarget.style.backgroundColor = "#10b981"
                      e.currentTarget.style.transform = "translateY(0)"
                    }
                  }}
                >
                  {validatingId === aff.id ? (
                    <CSpinner size="sm" />
                  ) : aff.validated_by_manager ? (
                    "✅ Déjà validée"
                  ) : (
                    "✅ Valider l’affectation"
                  )}
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        ))
      )}
    </CContainer>
  )
}

export default ManagerPresenceValidation
