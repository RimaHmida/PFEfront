// src/views/dashboard/Dashboard.js
import React from 'react'
import AdminDashboard from '../Admin/AdminDashboard'
import SecretaireDashboard from '../secretaire/SecretaireDashboard'
import ManagerDashboard from '../Manager/ManagerDashboard'

const user = JSON.parse(localStorage.getItem('user'))
const role = user?.role

const Dashboard = () => {
  return (
    <>
      {role === 'administrateur' || role === 'administrateur_it' ? (
        <AdminDashboard />
      ) : role === 'secretaire' ? (
        <SecretaireDashboard />
      ) : role === 'manager' ? (
        <ManagerDashboard />
      ) : (
        <p>🚫 Rôle non reconnu</p>
      )}
    </>
  )
}

export default Dashboard
