import React, { useContext } from 'react';
import { Navbar } from './components/navBar/NavBar';
import Home from './pages/Home';
import VolunteersDoctorsPage from './pages/VolunteersDoctorsPage';
import AppointmentsPage from './pages/AppointmentsPage'; import { Loader, Center, Container } from '@mantine/core';
import { AuthContext } from './context/AuthContextProvider';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PatientsTablePage from "./patients/page";

function MyApp() {
  const authContext = useContext(AuthContext);

  return (
    authContext.isAuthenticated ? (
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/patients" element={<PatientsTablePage />} />
          <Route path="/volunteers-doctors" element={<VolunteersDoctorsPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
        </Routes>
      </Router>
    ) : (
      <Center style={{ height: '100vh' }}>
        <Loader />
      </Center>
    )
  );
}
export default MyApp;