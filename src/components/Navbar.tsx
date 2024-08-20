import { AppShell, Burger, NavLink } from '@mantine/core'
import React, { useState } from 'react'
import { CalendarEvent, Home2 } from 'tabler-icons-react'
import Link from 'next/link'
import './NavBar.css'
import { FaUserDoctor, FaUserGroup } from 'react-icons/fa6'

const Navbar: React.FC<{ opened: boolean, toggle: () => void }> = ({
  opened,
  toggle
}) => {
  const [active, setActive] = useState(0)

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

      {navItems.map((item, index) => (
        <NavLink
          key={item.label}
          href={item.href as any}
          component={Link}
          label={<div style={{ fontSize: '14px' }}>{item.label}</div>}
          style={{
            margin: '5px',
            marginTop: index === 0 ? '42px' : '5px'
          }} // Extra margin for the first item
          leftSection={item.icon}
          active={index === active}
          className={index === active ? 'nav-link nav-link-active' : 'nav-link'}
          onClick={() => {
            setActive(index)
          }}
        />
      ))}

      <div style={{ flexGrow: 1 }}/>
    </AppShell.Navbar>
  )
}

export default Navbar
