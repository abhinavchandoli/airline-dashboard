import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
// Use NavLink instead of Link for nav items
import { Link, NavLink } from 'react-router-dom';

const Header = () => {
  return (
    <div className="header-wrapper">
      <Navbar
        expand="lg"
        variant="dark"
        style={{ 
          backgroundColor: '#000000', 
          padding: '1rem 2rem', 
          borderRadius: '15px' 
        }}
        className="rounded-3 shadow"
      >
        <Container className="justify-content-between">
          {/* Keep the brand as a plain Link so it never gets 'active' styling */}
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
            <Nav className="ms-auto">

              {/* Use NavLink for each nav button. 
                  The 'end' prop ensures exact matching for the home path. */}
              <Nav.Link
                as={NavLink}
                to="/"
                end
              >
                Home
              </Nav.Link>

              <Nav.Link
                as={NavLink}
                to="/data"
              >
                Data
              </Nav.Link>

              <Nav.Link
                as={NavLink}
                to="/resources"
              >
                Resources
              </Nav.Link>

              <Nav.Link
                as={NavLink}
                to="/about"
              >
                About
              </Nav.Link>

            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
};

export default Header;
