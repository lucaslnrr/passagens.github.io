// App.js (React frontend)
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './pages/home';
import Login from './pages/login';
import Finalizados from './pages/finalizados';
import About from './pages/about';
import Tutorial from './pages/tutorial';
import Sugestao from './pages/sugestao';
import { useSessionTimeout } from './useSessionTimeout';
import './App.css';
import Baixada from './pages/baixada';


function App() {
  useSessionTimeout(() => {
    console.log('Session timed out due to inactivity');
    // Add any other actions you want to perform on session timeout
 });

  return (
    <Router>
      <div className="App">
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/finalizados">
            <Finalizados />
          </Route>
          <Route path="/about">
            <About />
          </Route>
          <Route path="/tutorial">
            <Tutorial />
          </Route>
         
          <Route path="/baixada">
            <Baixada />
          </Route>
          
          <Route path="/sugestao">
            <Sugestao />
          </Route>
 
          
        </Switch>
      </div>
    </Router>
  );
}

export default App;
