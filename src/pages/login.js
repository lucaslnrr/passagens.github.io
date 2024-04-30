
import React from "react";
import { Link, Redirect } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

import { authStates, withAuth } from "../components/auth";
import en from "../utils/i18n";
import Loader from "../components/loader";
import { signIn } from "../utils/firebase";
import { validateEmailPassword } from "../utils/helpers";

import "../styles/login.css";

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      retype: "",
      error: "",
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value,
      error: "",
    });
  }

  handleSubmit(event) {
    event.preventDefault();

    if (this.state.error) {
      return;
    }

    //Validate email & password
    const errorMsg = validateEmailPassword(
      this.state.email,
      this.state.password
    );

    if (errorMsg) {
      this.setState({
        error: errorMsg,
      });
      return;
    }

    signIn(this.state.email, this.state.password)
      .then(() => {
        console.log("Signed In");
      })
      .catch(e => {
        console.log("Error signing in", e);
        this.setState({
          error: "Incorrect email/password",
        });
      });
  }
  render() {
    if (this.props.authState === authStates.INITIAL_VALUE) {
      return <Loader />;
    }

    if (this.props.authState === authStates.LOGGED_IN) {
      return <Redirect to="/"></Redirect>;
    }

    const errorMsg = this.state.error;

    return (
      
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundImage: `url(${process.env.PUBLIC_URL}/wallpaper.png)`,
        backgroundSize: 'cover',
    backgroundRepeat:'repeat'
      }}>
          <div style={{  maxWidth: '400px',
          height:' 330px',
          width: '100%',
          padding: '20px',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
          backgroundColor: 'rgb(255 238 238)',
          textAlign: 'center',
          backgroundImage: 'url(https://i.ibb.co/6wvpQRL/women.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',}}>
      {/* Empty container */}
    </div>
        <form onSubmit={this.handleSubmit} style={{
          height:'360px',
          maxWidth: '400px',
          width: '100%',
          padding: '20px',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
          borderRadius: '5px',
          textAlign: 'center',
          backgroundColor: 'white',
        }}><h2 style={{ marginBottom: '20px', color: '#333' }}>
            {en.GREETINGS.LOGIN}
          </h2>
    
          <input
            type="text"
            placeholder={en.FORM_FIELDS.EMAIL}
            name="email"
            onChange={this.handleInputChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              margin: '8px 0',
              border: '1px solid #ccc',
              borderRadius: '3px',
              boxSizing: 'border-box',
            }}
          />
    
          <input
            type="password"
            placeholder={en.FORM_FIELDS.PASSWORD}
            name="password"
            onChange={this.handleInputChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              margin: '8px 0',
              border: '1px solid #ccc',
              borderRadius: '3px',
              boxSizing: 'border-box',
            }}
          />
          {errorMsg && (
            <p
              className="error"
              style={{
                color: 'red',
                fontSize: '0.85em',
                marginTop: '5px',
              }}
            >
              {errorMsg}
            </p>
          )}
         <button
  id="login-button"
  type="submit"
  style={{
    backgroundColor: '#e7cda8',
    color: 'white',
    padding: '12px 20px',
    margin: '10px 0',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '5px',
    transition: 'background-color 0.3s ease', // Smooth transition effect
  }}
  onMouseEnter={(e) => {
    e.target.style.backgroundColor = '#be9458' ; // Change color on hover
  }}
  onMouseLeave={(e) => {
    e.target.style.backgroundColor = '#e7cda8'; // Revert back on mouse leave
  }}
>
  Login
</button>

    
          <p>{en.FORM_FIELDS.LOGIN_ALT_TEXT}</p>
          <a
  href="mailto:ti@guerreroconstrutora.com"
  style={{
    textDecoration: 'none',
    display: 'inline-block',
    color: '#be9458',
    marginTop: '0px',
  }}
>
  Entre em contato com o suporte
</a>

          </form>
  </div>
    );
    
  }
} 

export default withAuth(Login); 