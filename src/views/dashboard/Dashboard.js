import React from 'react'
import AdminDashboard from '../Admin/AdminDashboard'
import AdminItDashboard from '../Admin/AdminItDashboard'
import SecretaireDashboard from '../secretaire/SecretaireDashboard'
import ManagerDashboard from '../Manager/ManagerDashboard'

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'))
  const role = user?.role

  if (!role) return <p>❌ Aucun rôle trouvé</p>

  return (
    <>
      {role === 'administrateur' ? (
        <AdminDashboard />
      ) : role === 'administrateur_it' ? (
        <AdminItDashboard />
      ) : role === 'secretaire' ? (
        <SecretaireDashboard />
      ) : role === 'manager' ? (
        <ManagerDashboard />
      ) : (
        <p>🚫 Rôle inconnu</p>
      )}
    </>
  )
}

export default Dashboard
