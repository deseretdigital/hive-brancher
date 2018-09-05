import App from './App';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import loadWhitelist from 'Actions/loadWhitelist';
import saveWhitelist from 'Actions/saveWhitelist';

export default connect(
  ({ whitelist }) => ({
    whitelist
  }),
  (dispatch) => ({
      loadWhitelist: bindActionCreators(loadWhitelist, dispatch),
      saveWhitelist: bindActionCreators(saveWhitelist, dispatch)
  })
)(App);
