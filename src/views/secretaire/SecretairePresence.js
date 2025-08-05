"use client"

import { useEffect, useState } from "react"
import {
  CCard,
  CCardBody,
  CCardHeader,
  CContainer,
  CButton,
  CFormCheck,
  CSpinner,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
} from "@coreui/react"
import { toast } from "react-toastify"

const SecretairePresence = () => {
  const [affectations, setAffectations] = useState([])
  const [loading, setLoading] = useState(true)
  const [presenceData, setPresenceData] = useState({})
  const [refreshing, setRefreshing] = useState(false)
  const token = localStorage.getItem("token")

  const fetchPresenceData = async () => {
    setRefreshing(true)
    try {
      const res = await fetch("http://localhost:8000/api/secretaire/presences", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setAffectations(data.data.affectations)
      toast.success("✅ Présence journalière chargée")
    } catch {
      toast.error("❌ Erreur lors du chargement")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchPresenceData()
  }, [token])

  const handleToggle = (affectationId, date, employeId, isPresent) => {
    setPresenceData((prev) => ({
      ...prev,
      [affectationId]: {
        ...prev[affectationId],
        [date]: {
          ...(prev[affectationId]?.[date] || {}),
          [employeId]: isPresent,
        },
      },
    }))
  }

  const handleSubmit = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/secretaire/presences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ presences: presenceData }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.message)
      toast.success("✅ Présences enregistrées")
      fetchPresenceData()
      setPresenceData({})
    } catch {
      toast.error("❌ Erreur lors de l'enregistrement")
    }
  }

  if (loading) {
    return (
      <div className="text-center mt-5">
        <CSpinner color="primary" />
      </div>
    )
  }

  const todayISO = new Date().toISOString().slice(0, 10)
  const hasMarkedPresence = Object.keys(presenceData).length > 0
  const headerColor = "#1E3A8A"

  return (
    <CContainer className="py-4">
      <div
        style={{
          background: "linear-gradient(to right, #1E3A8A, #3B82F6)",
          padding: "12px 20px",
          borderRadius: "8px",
          color: "white",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.25rem",
          fontWeight: "bold",
        }}
      >
        <span style={{ fontSize: "1.5rem", marginRight: "10px" }}>📝</span> Marquage des présences
      </div>

      {affectations.length === 0 ? (
        <p className="text-center text-muted" style={{ fontSize: "1.1rem", color: "#6B7280" }}>
          Aucune affectation disponible pour le marquage de présence.
        </p>
      ) : (
        affectations.map((aff) => (
          <CCard key={aff.id} className="mb-4 shadow-sm" style={{ borderRadius: "8px", border: "1px solid #E5E7EB" }}>
            <CCardHeader
              style={{
                background: "linear-gradient(to right, #1E3A8A, #3B82F6)",
                color: "white",
                fontWeight: "bold",
                padding: "12px 20px",
                borderRadius: "8px 8px 0 0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <strong>{aff.site.nomsite}</strong>
              <span
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  fontWeight: "normal",
                }}
              >
                {aff.date_debut} → {aff.date_fin}
              </span>
            </CCardHeader>
            <CCardBody>
              <CTable hover responsive bordered style={{ borderRadius: "8px", overflow: "hidden" }}>
                <CTableHead style={{ background: "#F3F4F6" }}>
                  <CTableRow>
                    <CTableHeaderCell scope="col" style={{ color: "#374151", fontWeight: "600" }}>
                      Date
                    </CTableHeaderCell>
                    {aff.employes.map((emp) => (
                      <CTableHeaderCell
                        key={`head-${aff.id}-${emp.id}`}
                        className="text-center"
                        style={{ color: "#374151", fontWeight: "600" }}
                      >
                        {emp.nom} {emp.prenom}
                      </CTableHeaderCell>
                    ))}
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {aff.dates.map((date) => (
                    <CTableRow key={`row-${aff.id}-${date}`}>
                      <CTableDataCell className="align-middle fw-bold" style={{ color: "#4B5563" }}>
                        {date}
                      </CTableDataCell>
                      {aff.employes.map((emp) => {
                        if (!emp.dates || !emp.dates.includes(date)) {
                          return (
                            <CTableDataCell
                              key={`cell-${aff.id}-${emp.id}-${date}`}
                              className="text-center align-middle"
                              style={{ color: "#9CA3AF", fontStyle: "italic" }}
                            >
                              -
                            </CTableDataCell>
                          )
                        }
                        const todayPresence = emp.presences.find((p) => p.date === date)
                        const alreadyMarked = !!todayPresence
                        const markedPresent = todayPresence?.present
                        const isToday = date === todayISO
                        return (
                          <CTableDataCell key={`cell-${aff.id}-${emp.id}-${date}`} className="text-center align-middle">
                            {alreadyMarked ? (
                              <CBadge
                                color={markedPresent ? "success" : "danger"}
                                style={{
                                  background: markedPresent ? "#D1FAE5" : "#FEE2E2",
                                  color: markedPresent ? "#065F46" : "#991B1B",
                                  padding: "6px 12px",
                                  borderRadius: "20px",
                                  fontWeight: "600",
                                  minWidth: "80px",
                                  display: "inline-flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                {markedPresent ? "Présent" : "Absent"}
                              </CBadge>
                            ) : isToday ? (
                              <div className="d-flex justify-content-center gap-3">
                                <CFormCheck
                                  type="radio"
                                  name={`presence-${aff.id}-${date}-${emp.id}`}
                                  label="Présent"
                                  checked={presenceData?.[aff.id]?.[date]?.[emp.id] === true}
                                  onChange={() => handleToggle(aff.id, date, emp.id, true)}
                                  style={{ cursor: "pointer" }}
                                />
                                <CFormCheck
                                  type="radio"
                                  name={`presence-${aff.id}-${date}-${emp.id}`}
                                  label="Absent"
                                  checked={presenceData?.[aff.id]?.[date]?.[emp.id] === false}
                                  onChange={() => handleToggle(aff.id, date, emp.id, false)}
                                  style={{ cursor: "pointer" }}
                                />
                              </div>
                            ) : (
                              <span className="text-muted fst-italic" style={{ color: "#9CA3AF" }}>
                                Non marqué
                              </span>
                            )}
                          </CTableDataCell>
                        )
                      })}
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        ))
      )}
      {affectations.length > 0 && (
        <div className="text-center mt-4">
          <CButton
            style={{
              background: "linear-gradient(to right, #1E3A8A, #3B82F6)",
              borderColor: "#1E3A8A",
              color: "white",
              padding: "10px 24px",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "1rem",
              transition: "all 0.2s ease-in-out",
            }}
            className="px-4"
            onClick={handleSubmit}
            disabled={!hasMarkedPresence || refreshing}
          >
            {refreshing ? <CSpinner size="sm" style={{ color: "white" }} /> : "💾 Enregistrer les présences"}
          </CButton>
        </div>
      )}
    </CContainer>
  )
}

export default SecretairePresence
