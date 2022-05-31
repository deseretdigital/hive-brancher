import { useState } from 'react';
import getConfig from "next/config";
const { publicRuntimeConfig: env } = getConfig();

import Layout from '../components/Layout';
import Typography from '@deseretdigital/cascade.typography';
import Input from '@deseretdigital/cascade.input';
import Select from '@deseretdigital/cascade.select';
import Button from '@deseretdigital/cascade.button';
import colors from '@deseretdigital/cascade.colors';

async function handleCreateSubdomain(subdomain, branch, name) {
  const result = await fetch('/api/new-subdomain', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      subdomain,
      branch,
      name
    })
  });
}

async function handleDeleteSubdomain(subdomainId) {
  const result = await fetch('/api/delete-subdomain', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      subdomainId
    })
  });
}

async function fetchBranches(host) {
  const branches = await fetch(`http://${host}/api/fetch-branches`).then(resp => resp.json());
  return branches.branches || [];
}

async function fetchSubdomains(host) {
  const subdomains = await fetch(`http://${host}/api/fetch-subdomains`).then(resp => resp.json());
  return subdomains.subdomains || [];
}

export default function Index({ subdomains, branches }) {
  const [subdomain, setSubdomain] = useState('');
  const [branch, setBranch] = useState(null);
  const [name, setName] = useState('');
  const [currentSubdomains, setCurrentSubdomains] = useState(subdomains);
  const [error, setError] = useState('');
  
  async function createNewSubdomain() {
    if(!subdomain || !branch || !name) {
      setError('All fields are required');
      return;
    }
    if(!/^[a-zA-Z0-9]+$/.test(subdomain)) {
      setError('Subdomain must contain letters and numbers only');
      return;
    }
    if(!/^[a-zA-Z\-]+$/.test(name)) {
      setError('User name must contain only letters');
      return;
    }

    if(subdomain === 'master' || branch === 'master') {
      setError('Master is a reserved branch and subdomain that cannot be used');
      return;
    }
    let alreadyInUseError = false;
    currentSubdomains.forEach(sub => {
      if(sub.subdomain === subdomain) {
        setError('Subdomain already in use');
        alreadyInUseError = true;
      }
      if(sub.branch === branch) {
        setError('Branch already in use');
        alreadyInUseError = true;
      }
    });
    if(alreadyInUseError) {
      return;
    }
    setError('');
    await handleCreateSubdomain(subdomain, branch, name);
    const newSubdomains = await fetchSubdomains(window.location.host);
    setCurrentSubdomains(newSubdomains);
  }

  async function deleteSubdomain(subdomainId) {
    await handleDeleteSubdomain(subdomainId);
    const newSubdomains = await fetchSubdomains(window.location.host);
    setCurrentSubdomains(newSubdomains);
  }

  return (
    <>
      <Layout>
        <Typography variant="h1">Current Subdomains</Typography>
        <div className="subdomain-row" key={subdomain._id}>
          <Typography variant="h4">
            Subdomain
          </Typography>
          <Typography variant="h4">Branch</Typography>
          <Typography variant="h4">Created by</Typography>
          <Typography variant="h4">Ports</Typography>
          <Typography variant="h4">When</Typography>
          <Typography variant="h4">Options</Typography>
        </div>
        {currentSubdomains.map(subdomain => (
          <div className="subdomain-row" key={subdomain._id}>
            <Typography 
              asAnchorTag 
              styles={{
                color: colors.blue,
                textDecoration: 'none'
              }}
              componentProps={{
                target: "_blank",
                href: `https://${subdomain.subdomain}.${env.TEST_SERVER_HOST}`
              }}
            >
              {subdomain.subdomain}
            </Typography>
            <Typography variant="body">({subdomain.branch})</Typography>
            <Typography variant="body">{subdomain.name}</Typography>
            <Typography variant="body">{subdomain.ports.join(', ')}</Typography>
            <Typography variant="body">{subdomain.date}</Typography>
            <Button 
              icon="trash-can"
              onClick={() => deleteSubdomain(subdomain._id)}
              disabled={subdomain.branch === 'master'}
            >
              Delete
            </Button>
          </div>
        ))}
        <hr />
        <Typography variant="h1">New Subdomain</Typography>
        <div className="new-subdomain">
          <Input onChange={e => setSubdomain(e.target.value)} value={subdomain} placeholder="Subdomain" />
          <Select 
            searchable
            multi={false}
            options={branches.map(branch => ({
              label: branch,
              value: branch
            }))}
            name="Branch"
            label="Branch"
            onChange={selected => setBranch(selected)}
            value={branch}
          />
          <Input onChange={e => setName(e.target.value)} value={name} placeholder="Your Name" />
          <Button 
            onClick={createNewSubdomain}
          >
            Create Subdomain
          </Button>
        </div>
        <Typography variant="error">{error}</Typography>
        <style jsx>{`
          .new-subdomain {
            display: flex;
            justify-content: space-between;
          }
          .subdomain-row {
            display: flex;
            justify-content: flex-start;
            margin-bottom: 10px;
          }
          :global(.subdomain-row > *) {
            margin-right: 20px;
            flex: 1;
          }
          :global(.subdomain-row button) {
            background: ${colors.red};
          }
          :global(.subdomain-row button:hover) {
            background: ${colors['light-red']};
          }
          :global(.subdomain-row button:disabled) {
            background: ${colors.gray3};
          }
          :global(.subdomain-row button:disbled:hover) {
            background: ${colors.gray3};
          }
          :global(.new-subdomain > *) {
            margin-right: 20px;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          :global([class^="DesktopSelect__SelectButton"]) {
            padding: 0 12px !important;
          }
          :global(button) {
            text-align: center;
          }
        `}</style>
      </Layout>
    </>
  )
}

export async function getServerSideProps(context) {
  const subdomains = await fetchSubdomains(context.req.headers.host);
  const branches = await fetchBranches(context.req.headers.host);
  return {
    props: {
      subdomains,
      branches
    }
  };
}