import { Route, Routes } from 'react-router-dom'
import AppointmentsPage from '../pages/AppointmentsPage'
import Home from '../pages/Home'
import PatientsPage from '../patients/page'
import VolunteersDoctorsPage from '../pages/VolunteersDoctorsPage'
import React from 'react'

const RouteSwitcher = (): React.JSX.Element => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/patients" element={<PatientsPage />} />
      <Route path="/volunteers-doctors" element={<VolunteersDoctorsPage />} />
      <Route path="/appointments" element={<AppointmentsPage />} />
    </Routes>
  )
}

export default RouteSwitcher
