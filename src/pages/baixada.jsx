import React from "react";
import { Redirect } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import { authStates, withAuth } from "../components/auth";
import { Navbar, Nav, Image } from 'react-bootstrap';
import userIcon from '../assets/user-icon.png'; 
import { handleSignOut } from "./home";
import Loader from "../components/loader";
import { Link } from "react-router-dom";
import Baixadas from "./baixadas";
import {NavDropdown} from 'react-bootstrap';
class Baixada extends React.Component {

    render() {
      const { authState, user } = this.props;
  
      // If authState is INITIAL_VALUE, show Loader
      if (authState === authStates.INITIAL_VALUE) {
        return <Loader />;
      }
  
      // If authState is LOGGED_OUT, redirect to login
      if (authState === authStates.LOGGED_OUT) {
        return <Redirect to="/login" />;
      }
  
      // Check if the user is authorized based on UID
      const allowedUID = "WQMk2TwD1weOIxz4sAyfSASg09B2";
      if (user.uid !== allowedUID) {
        return <Redirect to="/" />;
      }
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
                <Nav.Link as={Link} to="/compra">Compras</Nav.Link>
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
         <Baixadas />
        </main>
      </div>
    );
  }
}

export default withAuth(Baixada);
