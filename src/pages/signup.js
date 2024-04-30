import React from "react";
import { Link, Redirect } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

import { authStates, withAuth } from "../components/auth";
import en from "../utils/i18n";
import { createNewUser } from "../utils/firebase";
import Loader from "../components/loader";
import { validateEmailPassword } from "../utils/helpers";

import "../styles/login.css";

class SignUp extends React.Component {
  
}

export default withAuth(SignUp);
