import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

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
          <Navbar.Brand as={Link} to="/" className="fw-bold">
            <img
              src="/monogram.png" // Replace with your logo path
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
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/data">Data</Nav.Link>
              <Nav.Link as={Link} to="/resources">Resources</Nav.Link>
              <Nav.Link as={Link} to="/about">About</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
};

export default Header;
