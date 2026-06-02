import React from 'react';

const Footer = () => {
  return (
    <footer className="footer mt-auto py-3 bg-white border-top">
      <div className="container text-center">
        <span className="text-muted small">
          &copy; {new Date().getFullYear()} VitaPulse Hospital Management System. All rights reserved.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
