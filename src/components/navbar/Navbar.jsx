import React from 'react';
import UserMenu from './UserMenu';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar__brand">Shifto</div>
      <div className="navbar__links">
        {/* ...otros links... */}
      </div>
      <UserMenu />
    </nav>
  );
};

export default Navbar;
