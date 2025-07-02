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
    if (dateDebut) {
      url += `?date_debut=${dateDebut}`;
    }
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

  if (loading) return <CSpinner color="primary" />;

  return (
    <CContainer>
      <h2>Gestion des Affectations</h2>
      <CRow className="mb-3">
        <CButton color="primary" onClick={() => setModalVisible(true)}>➕ Ajouter Affectation</CButton>
      </CRow>

      <CRow>
        {listes.map(l => (
          <CCol key={l.id} md={6}>
            <CCard className="mb-3">
              <CCardHeader>
                📅 {l.date_debut} → {l.date_fin} | {l.site?.nomsite}
                <CButton size="sm" color="danger" className="float-end" onClick={() => handleDeleteAffectation(l.id)}>❌</CButton>
                <CButton size="sm" color="primary" className="float-end me-2" onClick={() => setAddEmpModal({ visible: true, affectationId: l.id })}>➕</CButton>
              </CCardHeader>
              <CCardBody>
                <ul>
                  {l.employes.map(e => (
                    <li key={e.pivot.id}>
                      {e.nom} {e.prenom} : {e.pivot.date_debut_reelle} → {e.pivot.date_fin_reelle}
                      <CButton size="sm" onClick={() => {
                        setEditEmpModal({ visible: true, pivotId: e.pivot.id });
                        setEditEmp({
                          date_debut_reelle: e.pivot.date_debut_reelle,
                          date_fin_reelle: e.pivot.date_fin_reelle
                        });
                      }}>✏️</CButton>{' '}
                      <CButton size="sm" color="danger" onClick={() => handleDeleteEmp(e.pivot.id)}>❌</CButton>
                    </li>
                  ))}
                </ul>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>

      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader>Nouvelle Affectation</CModalHeader>
        <CModalBody>
          <CForm>
            <CFormSelect label="Site" value={formData.site_id} onChange={e => setFormData({ ...formData, site_id: e.target.value })}>
              <option value="">-- Choisir --</option>
              {sites.map(s => <option key={s.id} value={s.id}>{s.nomsite}</option>)}
            </CFormSelect>
            <CFormInput type="date" label="Début" value={formData.date_debut}
              onChange={e => {
                setFormData({ ...formData, date_debut: e.target.value });
                fetchAffectations(e.target.value);
              }}
            />
            <CFormInput type="date" label="Fin" value={formData.date_fin}
              onChange={e => setFormData({ ...formData, date_fin: e.target.value })}
            />
            <CFormSelect label="Ajouter un employé" onChange={e => handleAddEmployeToForm(e.target.value)}>
              <option value="">-- Choisir un employé --</option>
              {employes.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.nom} {emp.prenom}</option>
              ))}
            </CFormSelect>
            {formData.employes.map((emp, index) => (
              <div key={emp.id} style={{ border: '1px solid #eee', padding: '0.5rem', marginTop: '0.5rem' }}>
                <strong>{employes.find(e => e.id === emp.id)?.nom} {employes.find(e => e.id === emp.id)?.prenom}</strong>
                <CFormInput type="date" label="Début réel" value={emp.date_debut_reelle}
                  onChange={e => {
                    const copy = [...formData.employes];
                    copy[index].date_debut_reelle = e.target.value;
                    setFormData({ ...formData, employes: copy });
                  }} />
                <CFormInput type="date" label="Fin réel" value={emp.date_fin_reelle}
                  onChange={e => {
                    const copy = [...formData.employes];
                    copy[index].date_fin_reelle = e.target.value;
                    setFormData({ ...formData, employes: copy });
                  }} />
                <CButton color="danger" size="sm" style={{ marginTop: '0.3rem' }}
                  onClick={() => handleRemoveEmployeFromForm(index)}>❌ Retirer</CButton>
              </div>
            ))}
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton onClick={() => setModalVisible(false)}>Annuler</CButton>
          <CButton color="primary" onClick={handleAddAffectation}>Ajouter</CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={addEmpModal.visible} onClose={() => setAddEmpModal({ visible: false, affectationId: null })}>
        <CModalHeader>Ajouter Employé</CModalHeader>
        <CModalBody>
          <CForm>
            <CFormSelect label="Employé" value={newEmp.employe_id} onChange={e => setNewEmp({ ...newEmp, employe_id: parseInt(e.target.value, 10) })}>
              <option value="">-- Choisir --</option>
              {employes.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.nom} {emp.prenom}</option>
              ))}
            </CFormSelect>
            <CFormInput type="date" label="Début réel" value={newEmp.date_debut_reelle} onChange={e => setNewEmp({ ...newEmp, date_debut_reelle: e.target.value })} />
            <CFormInput type="date" label="Fin réel" value={newEmp.date_fin_reelle} onChange={e => setNewEmp({ ...newEmp, date_fin_reelle: e.target.value })} />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton onClick={() => setAddEmpModal({ visible: false, affectationId: null })}>Annuler</CButton>
          <CButton color="primary" onClick={handleAddEmpToExisting}>Ajouter</CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={editEmpModal.visible} onClose={() => setEditEmpModal({ visible: false, pivotId: null })}>
        <CModalHeader>Modifier Dates</CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput type="date" label="Début réel" value={editEmp.date_debut_reelle} onChange={e => setEditEmp({ ...editEmp, date_debut_reelle: e.target.value })} />
            <CFormInput type="date" label="Fin réel" value={editEmp.date_fin_reelle} onChange={e => setEditEmp({ ...editEmp, date_fin_reelle: e.target.value })} />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton onClick={() => setEditEmpModal({ visible: false, pivotId: null })}>Annuler</CButton>
          <CButton color="success" onClick={handleEditEmpDates}>Enregistrer</CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default AdminAffectations;
