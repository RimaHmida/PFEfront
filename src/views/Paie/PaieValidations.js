import React, { useEffect, useState } from 'react';
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
  CTableDataCell
} from '@coreui/react';
import { toast } from 'react-toastify';

const PaieValidations = () => {
  const [validations, setValidations] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchValidations();
  }, []);

  const fetchValidations = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/paie/validations', {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Erreur serveur');
      }

      const data = await res.json();
      setValidations(data.data || []);
      toast.success('✅ Consultations chargées');
    } catch (err) {
      toast.error(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (id) => {
    const token = localStorage.getItem('token');
    const url = `http://localhost:8000/api/paie/validations/${id}/download?token=${token}`;
    window.open(url, '_blank');
  };
  

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
        <CSpinner color="primary" />
      </div>
    );
  }

  return (
    <CContainer>
      <CCard>
        <CCardHeader style={{ background: '#1E3A8A', color: '#FFF' }}>
          📋 Liste des présences validées
        </CCardHeader>
        <CCardBody>
          {validations.length === 0 ? (
            <p>Aucune affectation validée trouvée.</p>
          ) : (
            validations.map((val, idx) => (
              <div key={val.id} style={{ marginBottom: '20px' }}>
                <h6>
                  {idx + 1}. {val.site} | Période: {val.periode} | Validée le: {val.validated_at}
                </h6>
                <CTable small bordered responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Employé</CTableHeaderCell>
                      <CTableHeaderCell>Date</CTableHeaderCell>
                      <CTableHeaderCell>État</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {val.employes.map(emp =>
                      emp.presences.map((p, i) => (
                        <CTableRow key={`${emp.id}-${i}`}>
                          <CTableDataCell>👤 {emp.nom} {emp.prenom}</CTableDataCell>
                          <CTableDataCell>{p.date}</CTableDataCell>
                          <CTableDataCell>{p.etat}</CTableDataCell>
                        </CTableRow>
                      ))
                    )}
                  </CTableBody>
                </CTable>
                <CButton
                  color="primary"
                  className="mt-2"
                  onClick={() => handleDownload(val.id)}
                >
                  Télécharger la liste
                </CButton>
              </div>
            ))
          )}
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default PaieValidations;
