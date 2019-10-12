import React, { Component } from 'react'
import { Navbar, NavItem, Nav, NavbarBrand } from 'reactstrap'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { Recipe } from './Recipe'
import { Home } from './Home'

class App extends Component {
  constructor (props) {
    super(props)
    this.state = { idToken: null }
    this.onSignIn = this.onSignIn.bind(this)
  }

  onSignIn (googleUser) {
    const googleIdToken = googleUser.getAuthResponse().id_token // send this to server
    this.setState({
      idToken: googleIdToken
    })
  }

  componentDidMount () {
    /* istanbul ignore next */
    window.gapi.load('auth2', () => {
      window.gapi.auth2.init({
        client_id: 'CLIENT_ID'
      }).then(() => {
        window.gapi.signin2.render('my-signIn', {
          'scope': 'profile email',
          'longtitle': true,
          'onsuccess': this.onSignIn,
          'onfailure': this.onFailure
        })
      })
    })
  }

  render () {
    return (
      <div>
        <Navbar color='light' light expand='md'>
          <NavbarBrand href='/'>sugar-salt-butter</NavbarBrand>
          <Nav className='ml-auto' navbar>
            <NavItem>
              <div id='my-signIn' className='g-signin2' />
            </NavItem>
          </Nav>
        </Navbar>
        <Router>
          <Switch>
            <Route exact path='/' render={/* istanbul ignore next */ (routeProps) => <Home {...routeProps} idToken={this.state.idToken} />} />            
            <Route path='/recipes/:id' render={/* istanbul ignore next */ (routeProps) => <Recipe {...routeProps} idToken={this.state.idToken} />} />
          </Switch>
        </Router>
      </div>
    )
  }
}

export default App
