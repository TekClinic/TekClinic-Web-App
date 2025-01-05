import { AppShell, Burger, NavLink } from '@mantine/core'
import React from 'react'
import { CalendarEvent, Home2 } from 'tabler-icons-react'
import Link from 'next/link'
import './NavBar.css'
import { FaUserDoctor, FaUserGroup } from 'react-icons/fa6'
import { usePathname } from 'next/navigation'

const Navbar: React.FC<{ opened: boolean, toggle: () => void }> = ({
  opened,
  toggle
}) => {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/',
      label: 'Home',
      icon: <Home2 size="20px"/>
    },
    {
      href: '/patients',
      label: 'Patients',
      icon: <FaUserGroup size="20px"/>
    },
    {
      href: '/doctors',
      label: 'Doctors',
      icon: <FaUserDoctor size="20px"/>
    },
    {
      href: '/appointments',
      label: 'Appointments',
      icon: <CalendarEvent size="20px"/>
    },
    {
      href: '/tasks',
      label: 'Tasks',
      // TODO: Change this icon!
      icon: <CalendarEvent size="20px"/>
    }
  ]

  return (
    <AppShell.Navbar
      p="md"
      className={`navbar ${opened ? 'opened' : 'closed'}`} // Apply CSS class based on state
      style={{
        gap: '10px',
        fontSize: '15px',
        zIndex: 2000,
        width: 230,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >

      <Burger
        opened={opened}
        onClick={toggle}
        size="sm"
        transitionDuration={600}
        style={{
          position: 'absolute',
          top: '15px', // Adjust for vertical position
          left: '10px', // Adjust for horizontal position
          zIndex: 2001, // Ensure it appears above other elements
          marginLeft: '5px' // Adjust for alignment
        }}
        title={opened ? 'Close navigation' : 'Open navigation'} // Accessible title for screen readers
      />

      {navItems.map(({
        label,
        href,
        icon
      }, index) => (
        <NavLink
          key={index}
          href={href as any}
          component={Link}
          label={<div style={{ fontSize: '14px' }}>{label}</div>}
          style={{
            margin: '5px',
            marginTop: index === 0 ? '42px' : '5px'
          }} // Extra margin for the first item
          leftSection={icon}
          active={pathname === href}
          className={pathname === href ? 'nav-link nav-link-active' : 'nav-link'}
        />
      ))}

      <div style={{ flexGrow: 1 }}/>
    </AppShell.Navbar>
  )
}

export default Navbar
