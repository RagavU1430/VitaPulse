import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const role = localStorage.getItem('role');

  // Define all possible navigation links
  const allLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['PATIENT', 'DOCTOR', 'ADMIN'] },
    { to: '/doctors', label: 'Doctors', icon: '👨‍⚕️', roles: ['PATIENT', 'ADMIN'] },
    { to: '/patients', label: 'Patients', icon: '👤', roles: ['ADMIN'] },
    { to: '/doctor-slots', label: 'Doctor Slots', icon: '🗓️', roles: ['ADMIN'] },
    { to: '/reports', label: 'Reports & Analytics', icon: '📈', roles: ['ADMIN'] },
    { to: '/book-appointment', label: 'Book Appointment', icon: '📅', roles: ['PATIENT'] },
    { to: '/my-appointments', label: 'My Appointments', icon: '📋', roles: ['PATIENT'] },
    { to: '/appointments', label: 'Appointment Management', icon: '⚙️', roles: ['DOCTOR', 'ADMIN'] },
  ];

  // Filter links based on current user's role
  const links = allLinks.filter(link => link.roles.includes(role));

  return (
    <div className="glass-sidebar d-none d-lg-flex flex-column p-4" style={{
      width: '260px',
      position: 'fixed',
      top: '56px',
      bottom: '0',
      left: '0',
      zIndex: '100'
    }}>
      <div className="mb-4">
        <h6 className="text-uppercase text-muted fw-bold px-2" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
          Navigation Menu
        </h6>
      </div>

      <ul className="nav nav-pills flex-column mb-auto gap-2">
        {links.map((link) => (
          <li key={link.to} className="nav-item">
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-3 px-3 py-2.5 rounded-3 fw-medium ${
                  isActive
                    ? 'active bg-primary text-white shadow-sm'
                    : 'text-dark hover-bg-light'
                }`
              }
              style={({ isActive }) => isActive ? { backgroundColor: 'var(--primary) !important' } : {}}
            >
              <span className="fs-5">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Simple styling hack for hover states */}
      <style>{`
        .nav-link:not(.active):hover {
          background-color: var(--outline) !important;
          color: var(--primary) !important;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
