import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';

import Navbar from './components/Navbar';
import Blog from './components/Blog';
import * as actionCreators from './redux/actionCreators';

class App extends Component {
  constructor() {
    super();
  }

  componentDidMount() {
    this.props.dispatch(actionCreators.initializationRequests());
  }

  render() {
    return (
      <div>
        <Navbar />
        <Blog />
      </div>
    );
  }
}

App.propTypes = {
  dispatch: PropTypes.func.isRequired
};

export default connect()(App);