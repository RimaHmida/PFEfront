import React, { useEffect, useState } from "react";
import {
  CCard, CCardBody, CCardHeader, CContainer,
  CButton, CFormCheck, CSpinner, CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell
} from "@coreui/react";
import { toast } from "react-toastify";

const SecretairePresence = () => {
  const [affectations, setAffectations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [presenceData, setPresenceData] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPresenceData = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/secretaire/presences", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setAffectations(data.data.affectations);
        toast.success("✅ Affectations chargées");
      } catch {
        toast.error("❌ Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };

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
    } catch {
      toast.error("❌ Erreur lors de l'enregistrement");
    }
  };

  if (loading) return (
    <div className="text-center mt-5">
      <CSpinner color="primary" />
    </div>
  );

  const todayISO = new Date().toISOString().slice(0, 10);

  return (
    <CContainer>
      <h2>Marquage des présences</h2>
      {affectations.length === 0 ? (
        <p>Aucune affectation.</p>
      ) : (
        affectations.map(aff => (
          <CCard key={aff.id} className="mb-3">
            <CCardHeader>
              Site : {aff.site.nomsite} | {aff.date_debut} → {aff.date_fin}
            </CCardHeader>
            <CCardBody>
              <CTable bordered small>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Date</CTableHeaderCell>
                    {aff.employes.map(emp => (
                      <CTableHeaderCell key={emp.id}>
                        {emp.nom} {emp.prenom}
                      </CTableHeaderCell>
                    ))}
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {aff.dates.map(date => (
                    <CTableRow key={date}>
                      <CTableDataCell>{date}</CTableDataCell>
                      {aff.employes.map(emp => {
                        const todayPresence = emp.presences.find(p => p.date === date);
                        const alreadyMarked = !!todayPresence;
                        const markedPresent = todayPresence?.present;
                        const isToday = date === todayISO;
                        const isFuture = date > todayISO;

                        return (
                          <CTableDataCell key={emp.id}>
                            {alreadyMarked ? (
                              <span className={`badge ${markedPresent ? 'bg-success' : 'bg-danger'}`}>
                                {markedPresent ? 'Présent' : 'Absent'}
                              </span>
                            ) : isToday ? (
                              <div>
                                <CFormCheck
                                  inline
                                  type="radio"
                                  name={`presence-${aff.id}-${date}-${emp.id}`}
                                  label="Présent"
                                  checked={presenceData?.[aff.id]?.[date]?.[emp.id] === true}
                                  onChange={() => handleToggle(aff.id, date, emp.id, true)}
                                />
                                <CFormCheck
                                  inline
                                  type="radio"
                                  name={`presence-${aff.id}-${date}-${emp.id}`}
                                  label="Absent"
                                  checked={presenceData?.[aff.id]?.[date]?.[emp.id] === false}
                                  onChange={() => handleToggle(aff.id, date, emp.id, false)}
                                />
                              </div>
                            ) : isFuture ? (
                              <span className="text-muted">-</span>
                            ) : (
                              <span className="text-muted">Non marqué</span>
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
        <CButton color="primary" onClick={handleSubmit}>
          Enregistrer les présences
        </CButton>
      )}
    </CContainer>
  );
};

export default SecretairePresence;
