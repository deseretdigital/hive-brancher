import App from './App';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import loadWhitelist from 'Actions/loadWhitelist';
import saveWhitelist from 'Actions/saveWhitelist';
import loadBranches from 'Actions/loadBranches';

export default connect(
  ({ branches, whitelist }) => ({
    branches, whitelist
  }),
  (dispatch) => ({
      loadWhitelist: bindActionCreators(loadWhitelist, dispatch),
      saveWhitelist: bindActionCreators(saveWhitelist, dispatch),
      loadBranches: bindActionCreators(loadBranches, dispatch),
  })
)(App);
