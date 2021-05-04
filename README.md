# sugar-salt-butter-ui
Sugar Salt Butter UI [![Build Status](https://travis-ci.com/ainhoaL/sugar-salt-butter-ui.svg?branch=master)](https://travis-ci.com/ainhoaL/sugar-salt-butter-ui)

React web application to organize (store and search) food recipes. Backend is in [`sugar-salt-butter`](https://github.com/ainhoaL/sugar-salt-butter-ui), a Node.js application.

Entry page is the dashboard, which shows the latest recipes added to the system, recipes that have ingredients that are in season now, and recipes marked as wanting to try:
![sugar-salt-butter-ui dashboard image](docs/dashboard.png?raw=true)

Recipe page shows all the recipe information, including servings, rating and tags. From here recipe can be edited, and added to a shopping list.
![sugar-salt-butter-ui recipe image](docs/dashboard.png?raw=true)

Shopping list page shows all the ingredients in the shopping list, and which recipes they belong to. Items can be deleted individually or a whole set can be deleted by removing the recipe from the shopping list.
![sugar-salt-butter-ui shopping list image](docs/list.png?raw=true)

Search functionality with infinite scrolling:
![sugar-salt-butter-ui search image](docs/search.png?raw=true)


## Setup
- Setup [`sugar-salt-butter`](https://github.com/ainhoaL/sugar-salt-butter#setup).
- In `sugar-salt-butter-ui` directory, run `npm i` to install all dependencies.
- Set environment variable `REACT_APP_WEBCLIENT_ID` to ClientID obtained for the web client in the [backend server setup step](https://github.com/ainhoaL/sugar-salt-butter#setup).

## Start the application
- Start [`sugar-salt-butter`](https://github.com/ainhoaL/sugar-salt-butter#start-the-application)
- Make sure `REACT_APP_WEBCLIENT_ID` environment variable is set.
- Run command `npm start`.

Note: By default server starts on port 3000 and will try to communicate to a backend server on port 3050.

## Test the application
- Run command `npm test`.

This includes linting with `standard`.

Testing done with test framework `Jest` and `React testing library`.

## Architecture
To read more about the architecture of the whole application, head to [`sugar-salt-butter`](https://github.com/ainhoaL/sugar-salt-butter#architecture)

### Authentication
Authentication is done via Google Oauth with [`google-auth-library`](https://www.npmjs.com/package/google-auth-library), using Bearer token authentication.
Users don't need to register with the app to log in, instead they log in via Google. Every recipe and list in the database is linked to a user via the Google user ID. This way we are avoiding storing any passwords or confidential data.
All requests to backend must include a `Bearer <idToken>` in the Authorization header. The `idToken` comes from the process of logging into the application through Google.

### UI Components
Using [`Reactstrap`](https://reactstrap.github.io/) framework to get generic Bootstrap UI components.

## Ackowledgments
Design uses images provided by [Icons8](https://icons8.com):

[Star Filled icon: icons8-star-filled-16.png](https://icons8.com/icon/38845/star-filled)

[Star icon: icons8-star-16.png](https://icons8.com/icon/38864/star)

[Servings icon: icons8-restaurant-24.png](https://icons8.com/icon/57225/restaurant)

[Edit icon: icons8-edit-24.png](https://icons8.com/icon/65358/edit)

[Trash can icon: icons8-trash-can-24.png](https://icons8.com/icon/58913/trash-can)

[List icon: icons8-list-view-32.png](https://icons8.com/icon/92786/list-view)

[Recipe default image: icons8-tableware-100.png](https://icons8.com/icon/24555/tableware)