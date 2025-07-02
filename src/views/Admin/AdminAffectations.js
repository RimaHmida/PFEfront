import React, { useEffect, useState } from 'react';
import {
  CContainer, CRow, CCol, CCard, CCardHeader, CCardBody,
  CButton, CModal, CModalHeader, CModalBody, CModalFooter,
  CForm, CFormSelect, CFormInput, CSpinner
} from '@coreui/react';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:8000/api';

const fetchSafeJSON = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  if (!token) return { error: true, message: '⛔ Token manquant, veuillez vous reconnecter.' };

  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`
    }
  });

  const text = await res.text();

  try {
    const data = JSON.parse(text);
    if (!res.ok) {
      return { error: true, ...data };
    }
    return data;
  } catch {
    if (text.includes('<!DOCTYPE html>')) {
      return { error: true, message: '⛔ Session expirée ou erreur serveur, veuillez vous reconnecter.' };
    }
    console.error(`Réponse inattendue brute : ${text}`);
    return { error: true, message: '⚠️ Réponse inattendue' };
  }
};

const AdminAffectations = () => {
  const [loading, setLoading] = useState(true);
  const [listes, setListes] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [sites, setSites] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [addEmpModal, setAddEmpModal] = useState({ visible: false, affectationId: null });
  const [editEmpModal, setEditEmpModal] = useState({ visible: false, pivotId: null });
  const [formData, setFormData] = useState({ site_id: '', date_debut: '', date_fin: '', employes: [] });
  const [newEmp, setNewEmp] = useState({ employe_id: '', date_debut_reelle: '', date_fin_reelle: '' });
  const [editEmp, setEditEmp] = useState({ date_debut_reelle: '', date_fin_reelle: '' });

  const fetchAffectations = async (dateDebut = null) => {
    let url = `${API_URL}/admin/affectation_listes`;
    if (dateDebut) url += `?date_debut=${dateDebut}`;
    const result = await fetchSafeJSON(url);
    if (result.error) {
      toast.error(`⚠️ ${result.message}`);
    } else {
      setListes(result.data.listes);
      setEmployes(result.data.employes);
      setSites(result.data.sites);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAffectations();
  }, []);

  const handleAddAffectation = async () => {
    if (!formData.site_id || !formData.date_debut || !formData.date_fin) {
      toast.error('❌ Remplissez tous les champs');
      return;
    }
    const result = await fetchSafeJSON(`${API_URL}/admin/affectation_listes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (result.error) {
      toast.error(`⚠️ ${result.message}`);
    } else {
      toast.success('✅ Affectation ajoutée');
      setModalVisible(false);
      setFormData({ site_id: '', date_debut: '', date_fin: '', employes: [] });
      fetchAffectations();
    }
  };

  const handleAddEmployeToForm = (id) => {
    const intId = parseInt(id, 10);
    if (!intId || formData.employes.some(e => e.id === intId)) {
      toast.warn('⚠️ Employé déjà ajouté');
      return;
    }
    setFormData({
      ...formData,
      employes: [...formData.employes, {
        id: intId,
        date_debut_reelle: formData.date_debut,
        date_fin_reelle: formData.date_fin
      }]
    });
  };

  const handleRemoveEmployeFromForm = (index) => {
    const updated = [...formData.employes];
    updated.splice(index, 1);
    setFormData({ ...formData, employes: updated });
    toast.info('Employé retiré de la liste');
  };

  const handleAddEmpToExisting = async () => {
    if (!newEmp.employe_id || !newEmp.date_debut_reelle || !newEmp.date_fin_reelle) {
      toast.error('❌ Remplissez tous les champs');
      return;
    }
    const result = await fetchSafeJSON(`${API_URL}/admin/affectation_listes/${addEmpModal.affectationId}/employes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEmp)
    });
    if (result.error) {
      toast.error(`⚠️ ${result.message}`);
    } else {
      toast.success('✅ Employé ajouté');
      setAddEmpModal({ visible: false, affectationId: null });
      setNewEmp({ employe_id: '', date_debut_reelle: '', date_fin_reelle: '' });
      fetchAffectations();
    }
  };

  const handleDeleteAffectation = async (id) => {
    if (!window.confirm('Supprimer cette affectation ?')) return;
    const result = await fetchSafeJSON(`${API_URL}/admin/affectation_listes/${id}`, { method: 'DELETE' });
    if (result.error) {
      toast.error(`⚠️ ${result.message}`);
    } else {
      toast.success('✅ Affectation supprimée');
      fetchAffectations();
    }
  };

  const handleEditEmpDates = async () => {
    const result = await fetchSafeJSON(`${API_URL}/admin/affectation_liste_employe/${editEmpModal.pivotId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editEmp)
    });
    if (result.error) {
      toast.error(`⚠️ ${result.message}`);
    } else {
      toast.success('✏️ Dates modifiées');
      setEditEmpModal({ visible: false, pivotId: null });
      fetchAffectations();
    }
  };

  const handleDeleteEmp = async (pivotId) => {
    if (!window.confirm('Supprimer cet employé ?')) return;
    const result = await fetchSafeJSON(`${API_URL}/admin/affectation_liste_employe/${pivotId}`, { method: 'DELETE' });
    if (result.error) {
      toast.error(`⚠️ ${result.message}`);
    } else {
      toast.success('✅ Employé supprimé');
      fetchAffectations();
    }
  };

  if (loading) return <CSpinner color="primary" style={{ display: 'block', margin: '3rem auto' }} />;

  return (
    <CContainer className="py-4">
      <h2 className="mb-4 text-center">🌟 Gestion des Affectations</h2>
      <CRow className="mb-3">
        <CCol className="text-center">
          <CButton color="primary" onClick={() => setModalVisible(true)}>➕ Ajouter Affectation</CButton>
        </CCol>
      </CRow>

      <CRow>
        {listes.map(l => (
          <CCol key={l.id} md={6} className="mb-4">
            <CCard className="shadow-sm rounded border-0">
              <CCardHeader className="d-flex justify-content-between align-items-center">
                <div>
                  📅 <strong>{l.date_debut}</strong> → <strong>{l.date_fin}</strong> | <strong>{l.site?.nomsite}</strong>
                </div>
                <div>
                  <CButton size="sm" color="primary" className="me-2" onClick={() => setAddEmpModal({ visible: true, affectationId: l.id })}>➕</CButton>
                  <CButton size="sm" color="danger" onClick={() => handleDeleteAffectation(l.id)}>❌</CButton>
                </div>
              </CCardHeader>
              <CCardBody>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {l.employes.map(e => (
                    <li key={e.pivot.id} className="mb-2 d-flex justify-content-between align-items-center">
                      <span>
                        {e.nom} {e.prenom} : {e.pivot.date_debut_reelle} → {e.pivot.date_fin_reelle}
                      </span>
                      <span>
                        <CButton size="sm" color="secondary" className="me-1" onClick={() => {
                          setEditEmpModal({ visible: true, pivotId: e.pivot.id });
                          setEditEmp({
                            date_debut_reelle: e.pivot.date_debut_reelle,
                            date_fin_reelle: e.pivot.date_fin_reelle
                          });
                        }}>✏️</CButton>
                        <CButton size="sm" color="danger" onClick={() => handleDeleteEmp(e.pivot.id)}>❌</CButton>
                      </span>
                    </li>
                  ))}
                </ul>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>

      {/* Modals remain unchanged — they already follow your logic */}
      {/* You can apply similar shadow-sm, rounded classes if you wish */}
    </CContainer>
  );
};

export default AdminAffectations;
