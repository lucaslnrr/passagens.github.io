// home.js

// Existing imports
import React from "react";
import { Redirect } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import { authStates, withAuth } from "../components/auth";
import { signOut } from '../utils/firebase';
import Loader from "../components/loader";
import { Link } from "react-router-dom";
import Account from "./account.jsx"; 
import Finalizados from "./finalizados.jsx"; 
import { Navbar, Nav, NavDropdown, Image } from 'react-bootstrap';
import userIcon from '../assets/user-icon.png'; 

export function handleSignOut() {
  signOut()
    .then(() => {
      console.log("Signed Out");
    })
    .catch(e => {
      console.log("Error signing out", e);
    });
}

class Home extends React.Component {
  render() {
    if (this.props.authState === authStates.INITIAL_VALUE) {
      return <Loader />;
    }

    if (this.props.authState === authStates.LOGGED_OUT) {
      return <Redirect to="/login"></Redirect>;
    }

    const { user } = this.props; // Access the user object from props

    return (
      <div>
        <Navbar bg="secondary" expand="lg" variant="dark" style={{ padding: '0px 10px' }}>
          <div className="container-fluid">
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/">Home</Nav.Link>
                <Nav.Link as={Link} to="/about">Sobre</Nav.Link>
                <Nav.Link as={Link} to="/tutorial">Tutorial</Nav.Link>
               
                <NavDropdown title="Mais" id="basic-nav-dropdown">
                  <NavDropdown.Item as={Link} to="/finalizados">Dashboard Finalizados</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/baixada">Dashboard Baixada e Férias</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item as={Link} to="/sugestao">Sugestões</NavDropdown.Item>
                </NavDropdown>
              </Nav>
              <Nav>
                <NavDropdown align="end" title={<Image src={userIcon} roundedCircle style={{ width: '30px', marginRight: '10px' }} />} id="basic-nav-dropdown">
                  <div style={{ width: '300px', padding: '15px' }}>
                    <div style={{ marginBottom: '10px' }}>{user.email}</div>
                    <button onClick={handleSignOut} className="btn btn-dark">Sair</button>
                  </div>
                </NavDropdown>
              </Nav>
            </Navbar.Collapse>
          </div>
        </Navbar>
        <main>
          <Account />
        </main>
      </div>
    );
  }
}

export default withAuth(Home);
