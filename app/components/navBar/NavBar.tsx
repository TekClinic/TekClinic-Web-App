import { useState } from 'react';
import { Link } from 'react-router-dom';
import classes from './NavBar.module.css';

interface NavbarLinkProps {
  to: string;
  label: string;
}

function NavbarLink({ to, label }: NavbarLinkProps) {
  return (
    <Link to={to} className={classes.link}>
      {label}
    </Link>
  );
}

export function Navbar() {
  const [active, setActive] = useState(0);

  const links = [
    { to: '/', label: 'Home' },
    { to: '/patients', label: 'Patients' },
    { to: '/volunteers-doctors', label: 'Volunteers' },
    { to: '/appointments', label: 'Appointments' },
    { to: '/table-test', label: 'Table Test' },
  ];

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        {links.map((link, index) => (
          <NavbarLink key={link.label} to={link.to} label={link.label} />
        ))}
      </div>
    </nav>
  );
}
