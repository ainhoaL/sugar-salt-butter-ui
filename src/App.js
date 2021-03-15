import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { Recipe } from './Recipe'
import { List } from './List'
import { Lists } from './Lists'
import { Dashboard } from './Dashboard'
import { Header } from './Header'
import { UserContext } from './UserContext'

function App () {
  const [idToken, setIdToken] = useState(null)

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
  }, [])

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
      <Router>
        <Header />
        <Switch>
          <UserContext.Provider value={idToken}>
            <Route exact path='/' component={Dashboard} />
            <Route path='/recipes/:id' component={Recipe} />
            <Route exact path='/lists' component={Lists} />
            <Route path='/lists/:id' component={List} />
          </UserContext.Provider>
        </Switch>
      </Router>
    </div>
  )
}

export default App
