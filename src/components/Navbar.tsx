import { AppShell, NavLink } from '@mantine/core'
import React from 'react'
import { CalendarEvent, Home2, Logout } from 'tabler-icons-react'
import Link from 'next/link'
import { federatedLogout, useGuaranteeSession } from '@/src/utils/auth'
import './NavBar.css'
import { FaUserDoctor, FaUserGroup } from 'react-icons/fa6'

const Navbar = (): React.JSX.Element => {
  const session = useGuaranteeSession()

  return (
    <AppShell.Navbar p="md" style={{ gap: '10px', fontSize: '15px' }}>
      <Link href="/">
        <NavLink
          label={<div style={{ fontSize: '14px' }}>Home</div>}
          style={{ margin: '5px' }}
          leftSection={<Home2 size="20px" />}
        />
      </Link>

      <Link href="/patients">
        <NavLink
          label={<div style={{ fontSize: '14px' }}>Patients</div>}
          style={{ margin: '5px' }}
          leftSection={<FaUserGroup size="20px" />}
        />
      </Link>

      <Link href="/doctors">
        <NavLink
          label={<div style={{ fontSize: '14px' }}>Doctors</div>}
          style={{ margin: '5px' }}
          leftSection={<FaUserDoctor size="20px" />}
        />
      </Link>

      <Link href="/appointments">
        <NavLink
          label={<div style={{ fontSize: '14px' }}>Appointments</div>}
          style={{ margin: '5px' }}
          leftSection={<CalendarEvent size="20px" />}
        />
      </Link>

      <div style={{ flexGrow: 1 }} />

      <div style={{ textAlign: 'center', padding: '10px', fontSize: '15px' }}>
        <h4 style={{ textAlign: 'left', fontSize: '15px', fontWeight: '300', color: 'rgb(100, 140, 200)' }}>logged in
          as {session?.user?.name ?? 'anonymous'}</h4>
        <NavLink
          label="Logout"
          /* eslint-disable-next-line @typescript-eslint/no-misused-promises */
          onClick={async () => { await federatedLogout() }}
          style={{ margin: '5px' }}
          leftSection={<Logout size="20px" />}
        />

      </div>
    </AppShell.Navbar>
  )
}

export default Navbar
