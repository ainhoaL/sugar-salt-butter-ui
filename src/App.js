import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Recipe } from './Recipe'
import { Home } from './Home'

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <Route path="/" exact component={Home} />
          <Route path="/recipes/:id" component={Recipe} />
        </div>
      </Router>
    );
  }
}

export default App;
