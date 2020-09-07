import React, { useEffect } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { Recipe } from './Recipe'
import { List } from './List'
import { Dashboard } from './Dashboard'
import { Header } from './Header'

function App () {
  const [idToken, setIdToken] = React.useState(null)
  const [searchString, setSearchString] = React.useState('')

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
      <Router>
        <Header setSearchString={setSearchString} />
        <Switch>
          <Route exact path='/' render={/* istanbul ignore next */ (routeProps) => <Dashboard {...routeProps} idToken={idToken} searchString={searchString} />} />
          <Route path='/recipes/:id' render={/* istanbul ignore next */ (routeProps) => <Recipe {...routeProps} idToken={idToken} />} />
          <Route path='/lists/:id' render={/* istanbul ignore next */ (routeProps) => <List {...routeProps} idToken={idToken} />} />
        </Switch>
      </Router>
    </div>
  )
}

export default App
