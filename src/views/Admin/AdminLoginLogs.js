import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CSpinner,
  CBadge,
} from '@coreui/react'
import axios from 'axios'

const AdminLoginLogs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (statusFilter) params.append('status', statusFilter);
        if (dateFilter) params.append('date', dateFilter);
  
        const res = await fetch(`http://localhost:8000/api/admin/login-logs?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setLogs(data.data);
      } catch (error) {
        console.error('Erreur lors du chargement des logs :', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchLogs();
  }, [search, statusFilter, dateFilter]);
  
  return (
    <CCard className="mb-4">
    <CCardHeader>
      <strong>📝 Logs de Connexion</strong>
    </CCardHeader>
  
    {/* 🔍 Filters Section */}
    <div className="d-flex flex-wrap gap-3 p-3 align-items-end">
      <div className="flex-grow-1">
        <label className="form-label">🔍 Rechercher</label>
        <input
          type="text"
          className="form-control"
          placeholder="Nom, email ou IP..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
  
      <div>
        <label className="form-label">📌 Statut</label>
        <select
          className="form-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Tous</option>
          <option value="success">Succès</option>
          <option value="failed">Échec</option>
        </select>
      </div>
  
      <div>
        <label className="form-label">📅 Date</label>
        <input
          type="date"
          className="form-control"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
      </div>
  
      <div>
        <button
          className="btn btn-outline-secondary"
          onClick={() => {
            setSearch('');
            setStatusFilter('');
            setDateFilter('');
          }}
        >
          🔄 Réinitialiser
        </button>
      </div>
    </div>
  
    {/* ✅ Log Table */}
    <CCardBody>
      {loading ? (
        <div className="text-center">
          <CSpinner color="primary" />
        </div>
      ) : (
        <CTable hover responsive bordered>
          <CTableHead color="light">
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Nom</CTableHeaderCell>
              <CTableHeaderCell>Email</CTableHeaderCell>
              <CTableHeaderCell>Adresse IP</CTableHeaderCell>
              <CTableHeaderCell>Appareil</CTableHeaderCell>
              <CTableHeaderCell>Date</CTableHeaderCell>
              <CTableHeaderCell>Statut</CTableHeaderCell>
              <CTableHeaderCell>Message</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
  
          <CTableBody>
            {logs.map((log, index) => (
              <CTableRow key={log.id}>
                <CTableHeaderCell>{index + 1}</CTableHeaderCell>
                <CTableDataCell>
                  {log.user ? `${log.user.nom} ${log.user.prenom}` : 'Utilisateur inconnu'}
                </CTableDataCell>
                <CTableDataCell>
                  <CBadge color="info">{log.user ? log.user.email : log.email}</CBadge>
                </CTableDataCell>
                <CTableDataCell>{log.ip_address}</CTableDataCell>
                <CTableDataCell>
                  <small>{log.user_agent?.substring(0, 40)}...</small>
                </CTableDataCell>
                <CTableDataCell>{new Date(log.created_at).toLocaleString()}</CTableDataCell>
                <CTableDataCell>
                  {log.status === 'success' ? (
                    <CBadge color="success">🟢 Succès</CBadge>
                  ) : (
                    <CBadge color="danger">❌ Échec</CBadge>
                  )}
                </CTableDataCell>
                <CTableDataCell>{log.message || '—'}</CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      )}
    </CCardBody>
  </CCard>
  
  )
}

export default AdminLoginLogs
