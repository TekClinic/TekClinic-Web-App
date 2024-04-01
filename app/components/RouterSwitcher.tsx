import { Route, Routes } from 'react-router-dom';
import NotFound from './NotFound';
import AppointmentsPage from '../pages/AppointmentsPage';
import Home from '../pages/Home';
import PatientsPage from '../pages/PatientsPage';
import VolunteersDoctorsPage from '../pages/VolunteersDoctorsPage';

const RouteSwitcher = () => {
  return (
    <Routes>
      {/* <Route path="*" element={<NotFound />} /> */}
      <Route path="/" element={<Home />} />
      <Route path="/patients" element={<PatientsPage />} />
      <Route path="/volunteers-doctors" element={<VolunteersDoctorsPage />} />
      <Route path="/appointments" element={<AppointmentsPage />} />
    </Routes>
  );
};

export default RouteSwitcher;