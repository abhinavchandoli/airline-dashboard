// src/components/Header.js

import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { BsMoonFill, BsSunFill } from 'react-icons/bs';

const Header = ({ isDarkMode, toggleDarkMode }) => {
  return (
    <div className="header-wrapper">
      <Navbar
        expand="lg"
        variant={isDarkMode ? "light" : "dark"}
        bg={isDarkMode ? "light" : "dark"}
        className="rounded-3 shadow"
        style={{ padding: '1rem 2rem', borderRadius: '15px' }}
      >
        <Container className="justify-content-between">
          <Navbar.Brand as={Link} to="/" className="fw-bold">
            <img
              src="/monogram.png"
              width="30"
              height="30"
              className="d-inline-block align-top me-2"
              alt="Logo"
            />
            Airline FinEco
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar-nav" />
          <Navbar.Collapse id="navbar-nav">
            <Nav className="ms-auto" style={{ alignItems: 'center' }}>
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/data">Data</Nav.Link>
              <Nav.Link as={Link} to="/resources">Resources</Nav.Link>
              <Nav.Link as={Link} to="/about">About</Nav.Link>
              <Nav.Link onClick={toggleDarkMode} style={{ cursor: 'pointer' }}>
                {isDarkMode ? <BsSunFill /> : <BsMoonFill />}
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
};

export default Header;
