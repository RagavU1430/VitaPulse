import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';

const Navbar = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark glass-navbar fixed-top py-2 shadow-sm">
      <div className="container-fluid px-4">
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold text-white fs-4" to="/">
          <span style={{ fontSize: '1.5rem' }}>🏥</span>
          <span>VitaPulse</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-end" id="navbarContent">
          {user && (
            <div className="d-flex align-items-center gap-3">
              <span className="text-white-50 small d-none d-sm-inline">Logged in as:</span>
              <span className="badge bg-light text-dark px-3 py-2 fw-semibold">
                {user.email} ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="btn btn-outline-light btn-sm px-3 rounded-pill"
                type="button"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
