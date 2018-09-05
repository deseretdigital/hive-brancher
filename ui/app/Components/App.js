import React, { Component } from 'react';
import PropTypes from 'prop-types';
import findIndex from 'lodash/findIndex';

import './Style/App.scss';

const ignore = ['master'];

export default class App extends Component {

  static propTypes = {
    loadWhitelist: PropTypes.func.isRequired,
    saveWhitelist: PropTypes.func.isRequired,
    whitelist: PropTypes.arrayOf(PropTypes.shape({})).isRequired
  };

  state = {
    subdomain: '',
    branch: ''
  }

  componentWillMount() {
    this.props.loadWhitelist();
  }

  handleDeleteSubdomain(subdomainInfo) {
    const { whitelist, saveWhitelist } = this.props;
    const idx = findIndex(whitelist, subdomainInfo);
    saveWhitelist([
      ...whitelist.slice(0, idx),
      ...whitelist.slice(idx + 1)
    ]);
  }

  handleSaveSubdomain() {
    const { whitelist, saveWhitelist } = this.props;
    if(!this.state.branch) {
      alert('Please enter a branch');
      return;
    }
    if(!this.state.subdomain) {
      alert('Please enter a subdomain');
      return;
    }
    if(!/^[a-zA-Z0-9_\-]+$/.test(this.state.subdomain)) {
      alert('Subdomain must contain letters, numbers, underscores, or dashes only');
      return;
    }
    if(this.state.subdomain === 'master' || this.state.branch === 'master') {
      alert('Master is a reserved branch and subdomain that cannot be used');
      return;
    }
    saveWhitelist([
      ...whitelist,
      { branch: this.state.branch, subdomain: this.state.subdomain }
    ])
  }

  render() {
    const { whitelist } = this.props;
    return (
      <div className="app">
        <h1>Current Subdomains</h1>
        <ul>
          {whitelist.filter(item => ignore.indexOf(item.branch) === -1).map(item => (
            <li>
              <span>{item.subdomain}  ({item.branch})</span>
              <button className="delete" onClick={() => this.handleDeleteSubdomain(item)}>Delete</button>
          </li>
          ))}
        </ul>
        <hr />
        <h1>New Subdomain</h1>
        <div className="form">
          <label>
            Subdomain name
            <input onChange={(ev) => this.setState({ subdomain: ev.target.value })} type="text" value={this.state.subdomain} />
          </label>
          <label>
            Branch name
            <input onChange={(ev) => this.setState({ branch: ev.target.value })} type="text" value={this.state.branch} />
          </label>
          <button className="save" onClick={() => this.handleSaveSubdomain()}>Save</button>
        </div>
        <br /><br />
        <em>*Please allow up to 5 minutes for a new branch to be ready</em>
      </div>
    );
  }
}
