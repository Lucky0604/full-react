import React from 'react';
import {Provider} from 'react-redux';
import {configureStore} from './redux/store';
import {DevTools} from './redux/DevTools';

// react's library for handling direct DOM interaction (vs. Virtual DOM interaction)
// render allows to place react app into the DOM
import {render} from 'react-dom';

// react's front end routing handler
import {Router, Route, browserHistory} from 'react-router';

// base of react app
import App from './App';
import PostList from './container/PostList';
import Page from './container/Page';

// if we ever wanted to do server-side rendering, the initial state would get passed to the front end by
// passing the server-side store to the '__INITIAL_STATE__' client-side global variable via a script tag and 'hydrating'
// the client-side state with it here
// const store = configureStore(window.__INITIAL_STATE__ || {user:null, posts: []})
const store = configureStore();

// include DevTools if not in production
if (process.env.NODE_ENV === 'production') {
  render((
    <Provider store={store}>
      <Router history={browserHistory}>
        <Route path="/" component={App} />
      </Router>
    </Provider>
  ), document.getElementById('root'));
} else {
  // we only have one route, if we had more then we would add them with the same syntax, params are defined as they are in express, like "/:params"
  render((
    <Provider store={store}>
      <div>
        <Router history={browserHistory}>
          <Route path="/" component={App}>
            <Route path="posts" component={Page} />
          </Route>
         </Router>
        <DevTools />
      </div>
    </Provider>
  ), document.getElementById('root'));
}