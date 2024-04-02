import { AppShell, NavLink } from '@mantine/core'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContextProvider'
import React, { useEffect, useState, useContext } from 'react'
import { Logout, Man, Home2, ReportMedical, CalendarEvent } from 'tabler-icons-react'

const Navbar = (): React.JSX.Element => {
  const navigate = useNavigate()

  const authContext = useContext(AuthContext)
  const [username, setUsername] = useState<string>('')

  const handleLogout = async (): Promise<void> => {
    navigate('/') // Navigate to home page
    await authContext.logout() // Call logout function
  }

  useEffect(() => {
    if (authContext.isAuthenticated && (authContext.keycloakToken != null) && (authContext.username !== '')) {
      setUsername(authContext.username)
    }
  }, [authContext.isAuthenticated, authContext.keycloakToken, authContext.username])

  return (
    <AppShell.Navbar p="md" style={{ gap: '10px', fontSize: '15px' }}>
        <NavLink
            label={<div style={{ fontSize: '14px' }}>Home</div>}
            onClick={() => { navigate('/') }}
            style={{ margin: '5px' }}
            leftSection={<Home2 size="20px"/>}
        />

      <NavLink
        label={<div style={{ fontSize: '14px' }}>Patients</div>}
        onClick={() => { navigate('/patients') }}
        style={{ margin: '5px' }}
        leftSection={<Man size="20px"/>}
      />
      <NavLink
        label={<div style={{ fontSize: '14px' }}>Volunteers & Doctors</div>}
        onClick={() => { navigate('/volunteers-doctors') }}
        style={{ margin: '5px' }}
        leftSection={<ReportMedical size="20px"/>}
      />

      <NavLink
        label={<div style={{ fontSize: '14px' }}>Appointments</div>}
        onClick={() => { navigate('/appointments') }}
        style={{ margin: '5px' }}
        leftSection={<CalendarEvent size="20px"/>}
      />

<div style={{ flex: '1' }}>
        {/* Your main content here */}
      </div>
      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '10px', fontSize: '15px' }}>
      <h4 style={{ textAlign: 'left', fontSize: '15px', fontWeight: '300', color: 'rgb(100, 140, 200)' }} >logged in as {username}</h4>
      <NavLink

            label= "Logout"
            /* eslint-disable-next-line @typescript-eslint/no-misused-promises */
            onClick={handleLogout}
            style={{ margin: '5px' }}
            leftSection={<Logout size="20px"/>}

        />

      </footer>
    </AppShell.Navbar>
  )
}

export default Navbar
