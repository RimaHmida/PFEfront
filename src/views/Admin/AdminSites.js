import React, { useEffect, useState } from "react";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CContainer,
  CRow,
  CCol,
  CButton,
  CSpinner,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
} from "@coreui/react";
import { toast } from 'react-toastify';

const AdminSites = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);
  const [formData, setFormData] = useState({ nomsite: "", localisation: "", client: "" });
  const token = localStorage.getItem("token");

  const headerColor =  "#1E3A8A";
  const cardBg = "#FFFFFF";
  const borderColor = "#E5E7EB";
  const boxShadow = "0 4px 8px rgba(0, 0, 0, 0.05)";

  useEffect(() => {
    const fetchSites = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:8000/api/admin/sites", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error(`Error ${response.status}: ${await response.text()}`);

        const data = await response.json();
        setSites(data.data);
        toast.success("✅ Liste des sites chargée avec succès!");
      } catch (err) {
        setError(err.message);
        toast.error("❌ Erreur lors du chargement des sites.");
      }
      setLoading(false);
    };

    fetchSites();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openModal = (site = null) => {
    if (site) {
      setEditMode(true);
      setSelectedSite(site);
      setFormData({ nomsite: site.nomsite, localisation: site.localisation, client: site.client });
    } else {
      setEditMode(false);
      setFormData({ nomsite: "", localisation: "", client: "" });
    }
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const method = editMode ? "PUT" : "POST";
    const url = editMode
      ? `http://localhost:8000/api/admin/sites/${selectedSite.id}`
      : "http://localhost:8000/api/admin/sites";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error(`Error ${response.status}: ${await response.text()}`);

      const data = await response.json();
      setSites((prevSites) =>
        editMode ? prevSites.map((s) => (s.id === selectedSite.id ? data.data : s)) : [...prevSites, data.data]
      );
      setModalOpen(false);
      toast.success(editMode ? "✅ Site modifié avec succès!" : "✅ Site ajouté avec succès!");
    } catch (err) {
      setError(err.message);
      toast.error("❌ Échec de l'opération: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("⚠️ Êtes-vous sûr de vouloir supprimer ce site?")) return;

    try {
      const response = await fetch(`http://localhost:8000/api/admin/sites/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`Error ${response.status}: ${await response.text()}`);

      setSites((prevSites) => prevSites.filter((site) => site.id !== id));
      toast.success("🗑️ Site supprimé avec succès!");
    } catch (err) {
      setError(err.message);
      toast.error("❌ Échec de la suppression: " + err.message);
    }
  };

  return (
    <CContainer style={{ marginTop: "30px" }}>
      <div style={{ background: headerColor, padding: "16px", borderRadius: "8px", color: "white", marginBottom: "24px" }}>
        <h3 style={{ margin: 0 }}>Gestion des Sites</h3>
      </div>

      {loading && <CSpinner color="primary" />} 
      {error && <p className="text-danger">{error}</p>}

      <CRow>
        {sites.map((site) => (
          <CCol key={site.id} md={6} xl={4}>
            <CCard className="mb-4" style={{ border: `1px solid ${borderColor}`, backgroundColor: cardBg, borderRadius: "8px", boxShadow }}>
              <CCardHeader style={{ background: headerColor, color: "#fff", fontWeight: "bold" }}>{site.nomsite}</CCardHeader>
              <CCardBody>
                <p><strong>Localisation:</strong> {site.localisation}</p>
                <p><strong>Client:</strong> {site.client}</p>
                <div className="d-flex gap-2">
                  <CButton color="warning" size="sm" onClick={() => openModal(site)}>Modifier</CButton>
                  <CButton color="danger" size="sm" onClick={() => handleDelete(site.id)}>Supprimer</CButton>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>

      <CButton color="primary" onClick={() => openModal()}>Ajouter un site</CButton>

      <CModal visible={modalOpen} onClose={() => setModalOpen(false)}>
        <CModalHeader style={{ background: headerColor, color: "white" }}>{editMode ? "Modifier Site" : "Ajouter un Site"}</CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput type="text" label="Nom du Site" name="nomsite" value={formData.nomsite} onChange={handleChange} required className="mb-3" />
            <CFormInput type="text" label="Localisation" name="localisation" value={formData.localisation} onChange={handleChange} required className="mb-3" />
            <CFormInput type="text" label="Client" name="client" value={formData.client} onChange={handleChange} required className="mb-3" />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalOpen(false)}>Annuler</CButton>
          <CButton color="primary" onClick={handleSubmit}>{editMode ? "Modifier" : "Ajouter"}</CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default AdminSites;