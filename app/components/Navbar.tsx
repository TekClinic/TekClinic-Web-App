import { AppShell, NavLink } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { HomeIcon, PersonIcon} from '@modulz/radix-icons';
import { AuthContext } from "../context/AuthContextProvider";
import { useEffect, useState, useContext } from "react";

const Navbar = () => {
  const navigate = useNavigate();

  const authContext = useContext(AuthContext);
  const [username, setUsername] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const [activeTable, setActiveTable] = useState('patient');
  //console.log(authContext.keycloakToken);
  const limit = 20;
  const offset = 0;

  const handleLogout = () => {
    navigate('/'); // Navigate to home page
    authContext.logout(); // Call logout function
  };

  useEffect(() => {
    if (authContext.isAuthenticated && authContext.keycloakToken && authContext.username) {
      setUsername(authContext.username);
    }
  }, [authContext.isAuthenticated, authContext.keycloakToken, authContext.username]);


  return (
    <AppShell.Navbar p="md" style={{ gap: '10px' , fontSize: '15px'}}>
        <NavLink
            
            label="Home"
            onClick={() => navigate('/')}
            style={{ margin: '5px'}}
        />

      <NavLink
        label=" Patients"
        onClick={() => navigate('/patients')}
        style={{ margin: '5px' }}
      />
      <NavLink
        label="Volunteers & Doctors"
        onClick={() => navigate('/volunteers-doctors')}
        style={{ margin: '5px' }}
      />

<div style={{ flex: '1' }}>
        {/* Your main content here */}
      </div>
      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '10px' , fontSize: '15px'}}>
      <NavLink
            
            label="Logout"
            onClick={handleLogout}
            style={{ margin: '5px'}}
        />

      </footer>
    </AppShell.Navbar>
  );
};

export default Navbar;