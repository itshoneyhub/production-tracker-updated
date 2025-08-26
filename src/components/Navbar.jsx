import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-elements">
          <ul>
            <li>
              <NavLink to="/">Dashboard</NavLink>
            </li>
            <li>
              <NavLink to="/project-list">Project List</NavLink>
            </li>
            <li>
              <NavLink to="/advances">Advances</NavLink>
            </li>
            <li>
              <NavLink to="/master">Master</NavLink>
            </li>
            <li>
              <NavLink to="/import-export">Import/Export</NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;