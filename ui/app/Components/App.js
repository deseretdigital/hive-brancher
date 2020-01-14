import React, { Component } from 'react';
import PropTypes from 'prop-types';
import findIndex from 'lodash/findIndex';
import { testDomain, portRange } from '../../../config.js';
const _portRange = portRange || { min: 3000, max: 3050 };

import './Style/App.scss';

const ignore = ['master'];

export default class App extends Component {

  static propTypes = {
    loadWhitelist: PropTypes.func.isRequired,
    saveWhitelist: PropTypes.func.isRequired,
    loadBranches: PropTypes.func.isRequired,
    whitelist: PropTypes.arrayOf(PropTypes.shape({})).isRequired
  };

  state = {
    subdomain: '',
    branch: '',
    user: ''
  }

  componentWillMount() {
    this.loadWhitelist();
    this.whitelistPolling = setInterval(this.loadWhitelist.bind(this), 5000);
    this.props.loadBranches();
  }

  componentWillUnmount() {
    clearInterval(this.whitelistPolling);
  }

  loadWhitelist() {
    this.props.loadWhitelist();
  }

  assignPort() {
    const { whitelist } = this.props;
    const usedPorts = [];
    const ports = [];
    for(let i = _portRange.min; i <= _portRange.max; i++) {
      ports.push(i);
    }
    whitelist.forEach(subdomain => {
      if(subdomain.port) {
        usedPorts.push(subdomain.port * 1);
      }
    });
    const diff = (a, b) => {
      return b.filter((i) => { return a.indexOf(i) < 0; });
    };
    const availablePorts = diff(usedPorts, ports);
    return availablePorts.length === 0 ? -1 : Math.min(...availablePorts);
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
    let currentDate = new Date();

    if(!this.state.branch) {
      alert('Please enter a branch');
      return;
    }
    if(!this.state.subdomain) {
      alert('Please enter a subdomain');
      return;
    }
    if(!this.state.user) {
      alert('Please enter a user name');
      return;
    }
    if(!/^[a-zA-Z0-9]+$/.test(this.state.subdomain)) {
      alert('Subdomain must contain letters and numbers only');
      return;
    }
    if(!/^[a-zA-Z\-]+$/.test(this.state.user)) {
      alert('User name must contain only letters');
      return;
    }

    if(this.state.subdomain === 'master' || this.state.branch === 'master') {
      alert('Master is a reserved branch and subdomain that cannot be used');
      return;
    }

    saveWhitelist([
      ...whitelist,
      { branch: this.state.branch, subdomain: this.state.subdomain.toLowerCase(), user: this.state.user, created: currentDate.toLocaleString(), port: this.assignPort() }
    ])
  }

  render() {
    const { branches, whitelist } = this.props;
    return (
      <div className="app">
        <h1>Current Subdomains</h1>
        <ul>
          {whitelist.filter(item => ignore.indexOf(item.branch) === -1).map(item => (
            <li>
              <span><a href={'https://' + item.subdomain + '/' + testDomain} target="_blank">{item.subdomain}</a> ({item.branch}) Created by {item.user} on {item.created}</span>
              <button className="delete" onClick={() => this.handleDeleteSubdomain(item)}>Delete</button>
            </li>
          ))}
        </ul>
        <hr />
        <h1>New Subdomain</h1>
        <p>This tool does not check against github, or otherwise perform logic to make sure the branch you type exists.</p>
        <div className="form">
          <label>
            Subdomain name
            <input onChange={(ev) => this.setState({ subdomain: ev.target.value })} type="text" value={this.state.subdomain} />
          </label>
          <label>
            Branch name
            {branches.length === 0 ? (
              <input onChange={(ev) => this.setState({ branch: ev.target.value })} type="text" value={this.state.branch} />
            ) : (
              <select onChange={(ev) => this.setState({ branch: ev.target.value })} type="text" value={this.state.branch} >
                {branches.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            )}
          </label>
          <label>
            User
            <input onChange={(ev) => this.setState({ user: ev.target.value })} type="text" value={this.state.user} />
          </label>
          <button className="save" onClick={() => this.handleSaveSubdomain()}>Save</button>
        </div>
        <br /><br />
        <em>*Please allow up to 5 minutes for a new branch to be ready</em>
      </div>
    );
  }
}
