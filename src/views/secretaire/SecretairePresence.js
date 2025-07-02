// src/views/secretaire/SecretairePresence.js
import React, { useEffect, useState } from "react";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CContainer,
  CButton,
  CFormCheck,
  CSpinner,
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setAffectations(data.data.affectations);
        toast.success("✅ Affectations du jour chargées avec succès");
      } catch (err) {
        toast.error("❌ Erreur lors du chargement des affectations");
      } finally {
        setLoading(false);
      }
    };

    fetchPresenceData();
  }, [token]);

  const handleToggle = (affectationId, employeId, isChecked) => {
    setPresenceData((prev) => ({
      ...prev,
      [affectationId]: {
        ...prev[affectationId],
        [employeId]: isChecked,
      },
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
    } catch (err) {
      toast.error("❌ Erreur lors de l'enregistrement des présences");
    }
  };

  if (loading) return <CSpinner color="primary" />;

  return (
    <CContainer>
      <h2>Marquage des présences du jour</h2>
      {affectations.length === 0 ? (
        <p>Aucune affectation pour aujourd'hui.</p>
      ) : (
        affectations.map((aff) => (
          <CCard key={aff.id} className="mb-3">
            <CCardHeader>
              Site : {aff.site.nomsite} | Période : {aff.date_debut} → {aff.date_fin}
            </CCardHeader>
            <CCardBody>
              <CRow>
                {aff.employes.map((emp) => (
                  <CCol key={emp.id} md={6}>
                    <CFormCheck
                      label={`${emp.nom} ${emp.prenom}`}
                      checked={
                        presenceData?.[aff.id]?.[emp.id] === true || false
                      }
                      onChange={(e) =>
                        handleToggle(aff.id, emp.id, e.target.checked)
                      }
                    />
                  </CCol>
                ))}
              </CRow>
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
