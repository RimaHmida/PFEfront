import React, { useEffect, useState } from "react";
import {
  CCard, CCardBody, CCardHeader, CContainer,
  CButton, CFormCheck, CSpinner, CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell, CBadge
} from "@coreui/react";
import { toast } from "react-toastify";

const SecretairePresence = () => {
  const [affectations, setAffectations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [presenceData, setPresenceData] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const token = localStorage.getItem("token");

  const fetchPresenceData = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("http://localhost:8000/api/secretaire/presences", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAffectations(data.data.affectations);
      toast.success("✅ Présence journalière chargée");
    } catch {
      toast.error("❌ Erreur lors du chargement");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPresenceData();
  }, [token]);

  const handleToggle = (affectationId, date, employeId, isPresent) => {
    setPresenceData(prev => ({
      ...prev,
      [affectationId]: {
        ...prev[affectationId],
        [date]: {
          ...(prev[affectationId]?.[date] || {}),
          [employeId]: isPresent,
        }
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/secretaire/presences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ presences: presenceData }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      toast.success("✅ Présences enregistrées");
      fetchPresenceData();
      setPresenceData({});
    } catch {
      toast.error("❌ Erreur lors de l'enregistrement");
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <CSpinner color="primary" />
      </div>
    );
  }

  const todayISO = new Date().toISOString().slice(0, 10);
  const hasMarkedPresence = Object.keys(presenceData).length > 0;

  const headerColor = "#1E3A8A";

  return (
    <CContainer className="py-4">
      <div
        style={{
          background: headerColor,
          padding: "16px",
          borderRadius: "8px",
          color: "white",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <h3 style={{ margin: 0 }}>📝 Marquage des présences</h3>
      </div>

      {affectations.length === 0 ? (
        <p className="text-center text-muted">Aucune affectation disponible.</p>
      ) : (
        affectations.map(aff => (
          <CCard key={aff.id} className="mb-4 shadow-sm">
            <CCardHeader style={{ background: headerColor, color: "white" }}>
              <strong>{aff.site.nomsite}</strong> | {aff.date_debut} → {aff.date_fin}
            </CCardHeader>
            <CCardBody>
              <CTable hover responsive bordered>
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell>Date</CTableHeaderCell>
                    {aff.employes.map(emp => (
                      <CTableHeaderCell key={`head-${aff.id}-${emp.id}`} className="text-center">
                        {emp.nom} {emp.prenom}
                      </CTableHeaderCell>
                    ))}
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {aff.dates.map(date => (
                    <CTableRow key={`row-${aff.id}-${date}`}>
                      <CTableDataCell className="align-middle fw-bold">{date}</CTableDataCell>
                      {aff.employes.map(emp => {
                        if (!emp.dates || !emp.dates.includes(date)) {
                          return (
                            <CTableDataCell key={`cell-${aff.id}-${emp.id}-${date}`} className="text-center text-muted">-</CTableDataCell>
                          );
                        }

                        const todayPresence = emp.presences.find(p => p.date === date);
                        const alreadyMarked = !!todayPresence;
                        const markedPresent = todayPresence?.present;
                        const isToday = date === todayISO;

                        return (
                          <CTableDataCell key={`cell-${aff.id}-${emp.id}-${date}`} className="text-center align-middle">
                            {alreadyMarked ? (
                              <CBadge color={markedPresent ? "success" : "danger"} className="px-3 py-2">
                                {markedPresent ? 'Présent' : 'Absent'}
                              </CBadge>
                            ) : isToday ? (
                              <div className="d-flex justify-content-center gap-2">
                                <CFormCheck
                                  type="radio"
                                  name={`presence-${aff.id}-${date}-${emp.id}`}
                                  label="Présent"
                                  checked={presenceData?.[aff.id]?.[date]?.[emp.id] === true}
                                  onChange={() => handleToggle(aff.id, date, emp.id, true)}
                                />
                                <CFormCheck
                                  type="radio"
                                  name={`presence-${aff.id}-${date}-${emp.id}`}
                                  label="Absent"
                                  checked={presenceData?.[aff.id]?.[date]?.[emp.id] === false}
                                  onChange={() => handleToggle(aff.id, date, emp.id, false)}
                                />
                              </div>
                            ) : (
                              <span className="text-muted fst-italic">Non marqué</span>
                            )}
                          </CTableDataCell>
                        );
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
        <div className="text-center">
          <CButton
            style={{ backgroundColor: "#3B82F6", borderColor: "#3B82F6" }}
            className="px-4"
            onClick={handleSubmit}
            disabled={!hasMarkedPresence || refreshing}
          >
            {refreshing ? <CSpinner size="sm" /> : "💾 Enregistrer les présences"}
          </CButton>
        </div>
      )}
    </CContainer>
  );
};

export default SecretairePresence;
