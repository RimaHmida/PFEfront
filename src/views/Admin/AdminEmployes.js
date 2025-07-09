import React, { useEffect, useState } from "react";
import {
  CCard, CCardBody, CCardHeader, CContainer, CButton, CSpinner,
  CFormInput, CFormSelect, CFormTextarea, CModal, CModalHeader,
  CModalBody, CModalFooter, CForm, CModalTitle
} from "@coreui/react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AdminEmployes = () => {
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [congeModalOpen, setCongeModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedEmploye, setSelectedEmploye] = useState(null);
  const [expandedIds, setExpandedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    nom: "", prenom: "", email: "", numero: "",
    fonction: "", adresse: "", statut: "travail"
  });

  const [congeForm, setCongeForm] = useState({
    employe_id: "", type: "", date_debut: "", date_fin: "",
    description: "", document: null
  });

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const headerFooterColor = "#1E3A8A";
  const buttonPrimary = "#3B82F6";
  const backgroundGeneral = "#F9FAFB";
  const cardBackground = "#FFFFFF";
  const borderColor = "#E5E7EB";
  const boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
  const cardBorderRadius = "8px";

  const toggleCard = (id) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    fetch("http://localhost:8000/api/admin/employes", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async res => {
        const contentType = res.headers.get("content-type");
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Erreur serveur (${res.status}) : ${text}`);
        }
        if (!contentType.includes("application/json")) {
          throw new Error("La réponse du serveur n'est pas du JSON valide.");
        }
        return res.json();
      })
      .then(data => {
        setEmployes(data.data);
        toast.success("✅ Liste des employés chargée avec succès!");
      })
      .catch(err => {
        toast.error("❌ Erreur : " + err.message);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const openModal = (employe = null) => {
    setEditMode(!!employe);
    setSelectedEmploye(employe);
    setFormData(employe || {
      nom: "", prenom: "", email: "", numero: "",
      fonction: "", adresse: "", statut: "travail"
    });
    setModalOpen(true);
  };


  const validateField = (name, value) => {
    const errors = { ...formErrors };
  
    switch (name) {
      case 'nom':
        if (!value.trim()) errors.nom = 'Le nom est requis.';
        else delete errors.nom;
        break;
      case 'prenom':
        if (!value.trim()) errors.prenom = 'Le prénom est requis.';
        else delete errors.prenom;
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) errors.email = 'Email invalide.';
        else delete errors.email;
        break;
        case 'numero':
          const numeroRegex = /^[0-9]{8,15}$/; // accepte uniquement chiffres, entre 8 et 15 chiffres
          if (!numeroRegex.test(value)) {
            errors.numero = 'Numéro invalide (chiffres uniquement, min 8 chiffres).';
          } else {
            delete errors.numero;
          }
          break;
      case 'fonction':
        if (!value.trim()) errors.fonction = 'La fonction est requise.';
        else delete errors.fonction;
        break;
      case 'adresse':
        if (!value.trim()) errors.adresse = 'L’adresse est requise.';
        else delete errors.adresse;
        break;
      default:
        break;
    }
  
    setFormErrors(errors);
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value); // ✅ Appelle validation
  };

  const handleSubmit = async () => {
    const method = editMode ? "PUT" : "POST";
    const url = editMode
      ? `http://localhost:8000/api/admin/employes/${selectedEmploye.id}`
      : "http://localhost:8000/api/admin/employes";
    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(`✅ Employé ${editMode ? "modifié" : "ajouté"}`);
      setEmployes(prev =>
        editMode
          ? prev.map(emp => emp.id === data.data.id ? data.data : emp)
          : [...prev, data.data]
      );
      setModalOpen(false);
    } catch (err) {
      toast.error("❌ " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet employé ?")) return;
    try {
      await fetch(`http://localhost:8000/api/admin/employes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("✅ Employé supprimé");
      setEmployes(prev => prev.filter(emp => emp.id !== id));
    } catch {
      toast.error("❌ Erreur lors de la suppression");
    }
  };

  const handleCongeChange = (e) => {
    const { name, value, files } = e.target;
    setCongeForm({ ...congeForm, [name]: files ? files[0] : value });
  };

  const handleCongeSubmit = async () => {
    if ((congeForm.type === "justifié" || congeForm.type === "maladie") && !congeForm.document) {
      toast.error("❌ Document obligatoire pour ce type de congé");
      return;
    }
    try {
      const formDataSend = new FormData();
      Object.entries(congeForm).forEach(([key, value]) => {
        if (value) formDataSend.append(key, value);
      });
      await fetch("http://localhost:8000/api/admin/conges", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataSend
      });
      toast.success("✅ Congé enregistré");
      setCongeModalOpen(false);
    } catch {
      toast.error("❌ Erreur lors de l'enregistrement du congé");
    }
  };

  if (loading) return <CSpinner color="primary" />;

  return (
    <CContainer
      style={{
        backgroundColor: backgroundGeneral,
        padding: "20px",
        borderRadius: "10px",
        border: `1px solid ${borderColor}`,
        marginTop: "30px"
      }}
    >
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: headerFooterColor, padding: "16px", borderRadius: "8px", marginBottom: "20px"
      }}>
        <h3 style={{ color: "#FFF", margin: 0 }}>Gestion des Employés</h3>
        <div>
          <CButton onClick={() => openModal()} style={{ background: buttonPrimary, color: "#FFF", marginRight: "8px" }}>
            Ajouter Employé
          </CButton>
          <CButton onClick={() => setCongeModalOpen(true)} style={{ background: buttonPrimary, color: "#FFF", marginRight: "8px" }}>
            + Ajouter un congé
          </CButton>
          <CButton onClick={() => navigate("/admin/historique-conges")} style={{ background: buttonPrimary, color: "#FFF" }}>
            📋 Historique des Congés
          </CButton>
        </div>
      </div>

      {/* Search */}
      <CFormInput
        placeholder="Rechercher un employé..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="mb-3"
      />

      {/* List */}
      {employes
        .filter(emp => `${emp.nom} ${emp.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()))
        .map(emp => (
          <CCard key={emp.id} className="mb-3" style={{ border: `1px solid ${borderColor}`, borderRadius: cardBorderRadius, boxShadow }}>
            <CCardHeader
              onClick={() => toggleCard(emp.id)}
              style={{ background: headerFooterColor, color: "#FFF", cursor: "pointer" }}
            >
              {emp.nom} {emp.prenom} — Statut: {emp.statut}
            </CCardHeader>
            {expandedIds.includes(emp.id) && (
              <CCardBody>
                <p>Email: {emp.email}</p>
                <p>Téléphone: {emp.numero}</p>
                <p>Fonction: {emp.fonction}</p>
                <p>Adresse: {emp.adresse}</p>
                <p>Jours récupération: {emp.jours_recuperation_restants}</p>
                <CButton onClick={() => openModal(emp)} color="warning" className="me-2">Modifier</CButton>
                <CButton onClick={() => handleDelete(emp.id)} color="danger">Supprimer</CButton>
              </CCardBody>
            )}
          </CCard>
        ))}

      {/* Modal Employé */}
      <CModal visible={modalOpen} onClose={() => setModalOpen(false)}>
        <CModalHeader style={{ background: headerFooterColor, color: "#FFF" }}>
          <CModalTitle>{editMode ? "Modifier" : "Ajouter"} Employé</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
          <CFormInput
  name="nom"
  label="Nom"
  value={formData.nom}
  onChange={handleChange}
  className="mb-2"
/>
{formErrors.nom && <div className="text-danger mb-2">{formErrors.nom}</div>}

<CFormInput
  name="prenom"
  label="Prénom"
  value={formData.prenom}
  onChange={handleChange}
  className="mb-2"
/>
{formErrors.prenom && <div className="text-danger mb-2">{formErrors.prenom}</div>}

<CFormInput
  name="email"
  label="Email"
  value={formData.email}
  onChange={handleChange}
  className="mb-2"
/>
{formErrors.email && <div className="text-danger mb-2">{formErrors.email}</div>}
<CFormInput
  type="tel"
  name="numero"
  label="Téléphone"
  value={formData.numero}
  onChange={handleChange}
  className="mb-2"
/>
{formErrors.numero && <div className="text-danger mb-2">{formErrors.numero}</div>}

<CFormInput
  name="fonction"
  label="Fonction"
  value={formData.fonction}
  onChange={handleChange}
  className="mb-2"
/>
{formErrors.fonction && <div className="text-danger mb-2">{formErrors.fonction}</div>}

<CFormInput
  name="adresse"
  label="Adresse"
  value={formData.adresse}
  onChange={handleChange}
  className="mb-2"
/>
{formErrors.adresse && <div className="text-danger mb-2">{formErrors.adresse}</div>}

<CFormSelect
  name="statut"
  label="Statut"
  value={formData.statut}
  onChange={handleChange}
>
  <option value="travail">Travail</option>
  <option value="récupération">Récupération</option>
  <option value="congé">Congé</option>
  <option value="standby">Standby</option>
</CFormSelect>

          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton onClick={() => setModalOpen(false)}>Annuler</CButton>
          <CButton color="success" onClick={handleSubmit}>{editMode ? "Modifier" : "Ajouter"}</CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Congé */}
      <CModal visible={congeModalOpen} onClose={() => setCongeModalOpen(false)}>
        <CModalHeader style={{ background: headerFooterColor, color: "#FFF" }}>
          <CModalTitle>Ajouter un Congé</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormSelect name="employe_id" value={congeForm.employe_id} onChange={handleCongeChange} className="mb-2">
              <option value="">-- Choisir un employé --</option>
              {employes.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.nom} {emp.prenom}</option>
              ))}
            </CFormSelect>
            <CFormSelect name="type" value={congeForm.type} onChange={handleCongeChange} className="mb-2">
              <option value="">-- Choisir --</option>
              <option value="maladie">Maladie</option>
              <option value="justifié">Justifié</option>
              <option value="non justifié">Non justifié</option>
            </CFormSelect>
            <CFormInput
  type="date"
  name="date_debut"
  value={congeForm.date_debut}
  onChange={e => {
    const val = e.target.value;
    setCongeForm(prev => ({
      ...prev,
      date_debut: val,
      date_fin: prev.date_fin && prev.date_fin < val ? '' : prev.date_fin
    }));
  }}
  className="mb-2"
/>
<CFormInput
  type="date"
  name="date_fin"
  value={congeForm.date_fin}
  min={congeForm.date_debut}
  onChange={e => setCongeForm({ ...congeForm, date_fin: e.target.value })}
  className="mb-2"
/>

            <CFormTextarea name="description" value={congeForm.description} onChange={handleCongeChange} className="mb-2" />
            {(congeForm.type === "justifié" || congeForm.type === "maladie") && (
              <CFormInput type="file" name="document" onChange={handleCongeChange} className="mb-2" />
            )}
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton onClick={() => setCongeModalOpen(false)}>Annuler</CButton>
          <CButton color="primary" onClick={handleCongeSubmit}>Enregistrer</CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default AdminEmployes;
