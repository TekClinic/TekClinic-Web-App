import { AppShell, NavLink } from '@mantine/core'
import { AuthContext } from '@/src/context/AuthContextProvider'
import React, { useEffect, useState, useContext } from 'react'
import { Logout, Man, Home2, CalendarEvent } from 'tabler-icons-react'
import Link from 'next/link'
import './NavBar.css'

const Navbar = (): React.JSX.Element => {
  const authContext = useContext(AuthContext)
  const [username, setUsername] = useState<string>('')

  const handleLogout = async (): Promise<void> => {
    await authContext.logout() // Call logout function
  }

  useEffect(() => {
    if (authContext.isAuthenticated && (authContext.keycloakToken != null) && (authContext.username !== '')) {
      setUsername(authContext.username)
    }
  }, [authContext.isAuthenticated, authContext.keycloakToken, authContext.username])

  return (
    <AppShell.Navbar p="md" style={{ gap: '10px', fontSize: '15px' }}>
      <Link href='/'>
        <NavLink
          label={<div style={{ fontSize: '14px' }}>Home</div>}
          style={{ margin: '5px' }}
          leftSection={<Home2 size="20px"/>}
        />
      </Link>

      <Link href='/patients'>
        <NavLink
          label={<div style={{ fontSize: '14px' }}>Patients</div>}
          style={{ margin: '5px' }}
          leftSection={<Man size="20px"/>}
        />
      </Link>

      <Link href='/appointments'>
        <NavLink
          label={<div style={{ fontSize: '14px' }}>Appointments</div>}
          style={{ margin: '5px' }}
          leftSection={<CalendarEvent size="20px"/>}
        />
      </Link>

      <div style={{ flexGrow: 1 }} />

      <div style={{ textAlign: 'center', padding: '10px', fontSize: '15px' }}>
        <h4 style={{ textAlign: 'left', fontSize: '15px', fontWeight: '300', color: 'rgb(100, 140, 200)' }} >logged in as {username}</h4>
        <NavLink
          label= "Logout"
          /* eslint-disable-next-line @typescript-eslint/no-misused-promises */
          onClick={handleLogout}
          style={{ margin: '5px' }}
          leftSection={<Logout size="20px"/>}
        />

      </div>
    </AppShell.Navbar>
  )
}

export default Navbar
