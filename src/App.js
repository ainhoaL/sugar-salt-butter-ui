import React, { useEffect } from 'react'
import { Navbar, NavItem, Nav, NavbarBrand } from 'reactstrap'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { Recipe } from './Recipe'
import { Search } from './Search'
import { List } from './List'

function App () {
  const [idToken, setIdToken] = React.useState(null)

  useEffect(() => {
    /* istanbul ignore next */
    window.gapi.load('auth2', () => {
      window.gapi.auth2.init({
        client_id: 'CLIENT_ID'
      }).then(() => {
        window.gapi.signin2.render('my-signIn', {
          scope: 'profile email',
          longtitle: true,
          onsuccess: onSignIn,
          onfailure: onFailure
        })
      })
    })
  })

  const onSignIn = (googleUser) => {
    const googleIdToken = googleUser.getAuthResponse().id_token // send this to server
    setIdToken(googleIdToken)
  }

  /* istanbul ignore next */
  const onFailure = (error) => {
    console.log(error)
  }

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
          <Route exact path='/' render={/* istanbul ignore next */ (routeProps) => <Search {...routeProps} idToken={idToken} />} />
          <Route path='/recipes/:id' render={/* istanbul ignore next */ (routeProps) => <Recipe {...routeProps} idToken={idToken} />} />
          <Route path='/lists/:id' render={/* istanbul ignore next */ (routeProps) => <List {...routeProps} idToken={idToken} />} />
        </Switch>
      </Router>
    </div>
  )
}

export default App
