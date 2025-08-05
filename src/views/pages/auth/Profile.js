"use client"
import { useState, useEffect } from "react"
import {
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormInput,
  CButton,
  CRow,
  CCol,
  CFormLabel,
  CSpinner,
  CAvatar,
  CContainer,
  CAlert,
} from "@coreui/react"
import { toast } from "react-toastify"

const Profile = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageError, setImageError] = useState(false)
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    photo: null,
  })

  const primaryColor = "#1E3A8A"
  const secondaryColor = "#3B82F6"

  const initializeUserData = () => {
    try {
      const userData = localStorage.getItem("user")
      if (userData) {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setFormData({
          nom: parsedUser.nom || parsedUser.name || "",
          prenom: parsedUser.prenom || parsedUser.firstName || "",
          email: parsedUser.email || "",
          photo: null,
        })
        setError(null)
        setImageError(false)
        return parsedUser
      }
    } catch (err) {
      console.error("Erreur lors du chargement des données utilisateur:", err)
    }
    return null
  }

  const fetchUser = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("token")
      if (!token) {
        setError("Session expirée. Veuillez vous reconnecter.")
        return
      }

      const response = await fetch("http://localhost:8000/api/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      if (response.status === 401) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        window.location.href = "/login"
        return
      }

      if (!response.ok) {
        throw new Error(`Erreur serveur: ${response.status}`)
      }

      const result = await response.json()
      const userData = result.user || result.data || result

      setUser(userData)
      setFormData({
        nom: userData.nom || userData.name || "",
        prenom: userData.prenom || userData.firstName || "",
        email: userData.email || "",
        photo: null,
      })
      localStorage.setItem("user", JSON.stringify(userData))
      window.dispatchEvent(new Event("user-updated"))
      setImageError(false)
    } catch (err) {
      console.error("Erreur lors du chargement du profil:", err)
      setError("Impossible de charger le profil. Utilisation des données locales.")
      const localUser = initializeUserData()
      if (!localUser) setError("Aucune donnée utilisateur disponible.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const localUser = initializeUserData()
    if (localUser) {
      fetchUser()
    } else {
      setError("Aucune donnée utilisateur trouvée.")
      setLoading(false)
    }
  }, [])

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (name === "photo") {
      const file = files[0]
      if (!file) return

      if (!file.type.startsWith("image/")) {
        toast.error("❌ Veuillez sélectionner un fichier image valide")
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("❌ La taille de l'image ne doit pas dépasser 5MB")
        return
      }

      setFormData({ ...formData, photo: file })
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target.result)
      reader.onerror = () => {
        toast.error("❌ Erreur lors de la lecture du fichier")
        setImagePreview(null)
      }
      reader.readAsDataURL(file)
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.nom || !formData.prenom || !formData.email) {
      toast.error("❌ Veuillez remplir tous les champs obligatoires")
      return
    }

    try {
      setSaving(true)
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("❌ Session expirée. Veuillez vous reconnecter.")
        return
      }

      const data = new FormData()
      data.append("nom", formData.nom)
      data.append("prenom", formData.prenom)
      data.append("email", formData.email)
      if (formData.photo) data.append("photo", formData.photo)

      const response = await fetch("http://localhost:8000/api/profile/update", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      })

      if (response.status === 401) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        window.location.href = "/login"
        return
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Erreur ${response.status}`)
      }

      const result = await response.json()
      const userData = result.user || result.data || {
        ...user,
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
      }

      toast.success("✅ Profil mis à jour avec succès")
      setUser(userData)
      setFormData((prev) => ({ ...prev, photo: null }))
      setImagePreview(null)
      localStorage.setItem("user", JSON.stringify(userData))
      window.dispatchEvent(new Event("user-updated"))
    } catch (err) {
      toast.error(`❌ ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const getProfileImageUrl = () => {
    if (imagePreview) return imagePreview
    if (imageError || !user) return null

    const fields = [
      "profile_image_url", "profileImage", "avatar", "photo", "image", "profile_picture"
    ]
    for (const field of fields) {
      if (user[field]) {
        let imageUrl = user[field]
        if (!imageUrl.startsWith("http")) {
          imageUrl = `http://localhost:8000/${imageUrl.replace(/^\/+/, "")}`
        }
        return `${imageUrl}?t=${Date.now()}`
      }
    }
    return null
  }

  const getUserInitials = () => {
    const nom = user?.nom || user?.name || ""
    const prenom = user?.prenom || user?.firstName || ""
    return `${nom.charAt(0)}${prenom.charAt(0)}`.toUpperCase() || "U"
  }

  const getUserDisplayName = () => {
    const nom = user?.nom || user?.name || ""
    const prenom = user?.prenom || user?.firstName || ""
    return `${prenom} ${nom}` || user?.email?.split("@")[0] || "Utilisateur"
  }

  if (loading && !user) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
        <CSpinner color="primary" size="lg" />
        <span className="ms-3">Chargement du profil...</span>
      </div>
    )
  }

  if (error && !user) {
    return (
      <CContainer className="vh-100 d-flex justify-content-center align-items-center">
        <CAlert color="danger" className="text-center">
          <h4>❌ Erreur de chargement</h4>
          <p>{error}</p>
          <CButton onClick={fetchUser} color="primary" className="me-2">Réessayer</CButton>
          <CButton onClick={() => window.location.href = "/login"} color="secondary">Se reconnecter</CButton>
        </CAlert>
      </CContainer>
    )
  }

  const profileImageUrl = getProfileImageUrl()

  return (
    <CContainer className="py-4">
  <CRow className="justify-content-center">
    <CCol xs={12} sm={10} md={8} lg={6} xl={5}>
          <CCard className="shadow border-0 rounded-4 p-4">
            <CCardHeader className="text-center bg-transparent border-0 mb-4">
              <h2 style={{ color: primaryColor }}>Mon Profil</h2>
              <p className="text-muted mb-0"></p>
            </CCardHeader>
            <CCardBody>
              <div className="text-center mb-4">
                {profileImageUrl && !imageError ? (
                  <CAvatar
                    src={profileImageUrl}
                    size="xxl"
                    style={{
                      width: "120px", height: "120px", border: `3px solid ${primaryColor}`
                    }}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle"
                    style={{
                      width: "120px", height: "120px", background: primaryColor, color: "#fff", fontSize: "2rem"
                    }}
                  >
                    {getUserInitials()}
                  </div>
                )}
                <h5 className="mt-3">{getUserDisplayName()}</h5>
                <p className="text-muted">{user?.email}</p>
              </div>

              <CForm onSubmit={handleSubmit}>
                <CRow className="mb-3">
                  <CCol md={6}>
                    <CFormLabel>Nom *</CFormLabel>
                    <CFormInput name="nom" value={formData.nom} onChange={handleChange} required />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel>Prénom *</CFormLabel>
                    <CFormInput name="prenom" value={formData.prenom} onChange={handleChange} required />
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel>Email *</CFormLabel>
                    <CFormInput type="email" name="email" value={formData.email} onChange={handleChange} required />
                  </CCol>
                </CRow>
                <CRow className="mb-4">
                  <CCol>
                    <CFormLabel>Photo de profil</CFormLabel>
                    <CFormInput type="file" name="photo" onChange={handleChange} accept="image/*" />
                    <small className="text-muted">Formats acceptés: JPG, PNG, GIF. Taille max: 5MB</small>
                  </CCol>
                </CRow>
                <CButton type="submit" color="primary" className="w-100" disabled={saving}>
                  {saving ? <><CSpinner size="sm" className="me-2" />Enregistrement...</> : "💾 Enregistrer"}
                </CButton>
                <CButton
                  type="button"
                  variant="outline"
                  className="w-100 mt-2"
                  onClick={fetchUser}
                  color="secondary"
                >
                  🔄 Actualiser les données
                </CButton>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default Profile
