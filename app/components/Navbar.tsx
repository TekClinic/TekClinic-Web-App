import { AppShell, NavLink } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { HomeIcon, PersonIcon} from '@modulz/radix-icons';


const Navbar = () => {
  const navigate = useNavigate();

  return (
    <AppShell.Navbar p="md" style={{ gap: '10px' }}>
        <NavLink
            label="Home"
            onClick={() => navigate('/')}
            style={{ margin: '5px' }}
        />

      <NavLink
        label="Patients"
        onClick={() => navigate('/patients')}
        style={{ margin: '5px' }}
      />
      <NavLink
        label="Volunteers & Doctors"
        onClick={() => navigate('/volunteers-doctors')}
        style={{ margin: '5px' }}
      />
    </AppShell.Navbar>
  );
};

export default Navbar;