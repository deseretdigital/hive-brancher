import React, { useState } from 'react';
import getConfig from "next/config";
const { publicRuntimeConfig: env } = getConfig();

import Layout from '../components/Layout';
import Typography from '@deseretdigital/cascade.typography';
import Input from '@deseretdigital/cascade.input';
import Button from '@deseretdigital/cascade.button';
import colors from '@deseretdigital/cascade.colors';
import Select from '@deseretdigital/cascade.select';

async function handleSaveNewRepo(repo) {
    const result = await fetch('/api/new-repo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        repo
      })
    });
  }

  async function handleDeleteRepo(repoId) {
    const result = await fetch('/api/delete-repo', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            repoId
        })
      });
  }

  async function handleUpdateRepo(repo) {
    const result = await fetch('/api/update-repo', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          repo
      })
    });
  }

  async function fetchRepos(host) {
    const repos = await fetch(`http://${host}/api/fetch-repos`).then(resp => resp.json());
    return repos.repos || [];
  }

export default function Repos({ repos }) {
    const [repoName, setRepoName] = useState('');
    const [error, setError] = useState('');
    const [currentRepos, setCurrenRepos] = useState(repos);
    const [openBuildSteps, setOpenBuildSteps] = useState([]);

    async function saveNewRepo() {
        if(!repoName) {
            setError('Type a repo name');
            return;
        }
        let duplicateError = false;
        currentRepos.forEach(re => {
            if(re.repo === repoName) {
                setError('Repo is already watched');
                duplicateError = true;
            }
        });
        if(duplicateError) {
            return;
        }
        setError('');
        await handleSaveNewRepo(repoName);
        const newRepos = await fetchRepos(window.location.host);
        setCurrenRepos(newRepos);
    }

    async function updateRepo(repo) {
      await handleUpdateRepo(repo);
      const newRepos = await fetchRepos(window.location.host);
        setCurrenRepos(newRepos);
    }

    async function deleteRepo(repoId) {
        if(confirm('Are you sure?  This could undo a lot of setup... *grimace*')) {
            await handleDeleteRepo(repoId);
            const newRepos = await fetchRepos(window.location.host);
            setCurrenRepos(newRepos);
        }
    }

    function setBuildStepValue(repoIdx, buildStepIdx, field, value) {
      const buildSteps = [...(currentRepos[repoIdx].buildSteps || [])];
      buildSteps[buildStepIdx] = {
        ...(buildSteps[buildStepIdx] || {}),
        [field]: value
      };
      setCurrenRepos([
        ...currentRepos.slice(0, repoIdx),
        {
          ...currentRepos[repoIdx],
          buildSteps
        },
        ...currentRepos.slice(repoIdx + 1)
      ]);
    }

    function addBuildStep(repoIdx) {
      setCurrenRepos([
        ...currentRepos.slice(0, repoIdx),
        {
          ...currentRepos[repoIdx],
          buildSteps: [
            ...(currentRepos[repoIdx].buildSteps || []),
            {}
          ]
        },
        ...currentRepos.slice(repoIdx + 1)
      ]);
  }

  function toggleOpenBuildStep(repoIdx) {
    const buildStepsIdx = openBuildSteps.indexOf(repoIdx);
    if(buildStepsIdx > -1) {
      setOpenBuildSteps([
        ...openBuildSteps.slice(0, buildStepsIdx),
        ...openBuildSteps.slice(buildStepsIdx + 1)
      ]);
    } else {
      setOpenBuildSteps([
        ...openBuildSteps,
        repoIdx
      ]);
    }
  }

  function deleteBuildStep(repoIdx, buildStepIdx) {
    setCurrenRepos([
      ...currentRepos.slice(0, repoIdx),
      {
        ...currentRepos[repoIdx],
        buildSteps: [
          ...currentRepos[repoIdx].buildSteps.slice(0, buildStepIdx),
          ...currentRepos[repoIdx].buildSteps.slice(buildStepIdx + 1)
        ]
      },
      ...currentRepos.slice(repoIdx + 1)
    ]);
  }


    return (
      <>
        <Layout>
          <Typography variant="h1">Repos to Pull</Typography>
          {currentRepos.map((repo, repoIdx) => (
            <div 
              key={repo._id}
              className="repo-box"
              style={{
                background: repoIdx%2 === 0 ? colors.gray2 : colors.white
              }}
            >
              <div className="repo-row">
                  <Typography variant="body">{repo.repo}</Typography>
                  <Typography variant="body">{(repo.buildSteps || []).length} build steps</Typography>
                  <Button 
                      icon={openBuildSteps.indexOf(repoIdx) > -1 ? 'close' : "list"}
                      onClick={() => toggleOpenBuildStep(repoIdx)}
                      variant="ghost"
                  >
                    {openBuildSteps.indexOf(repoIdx) > -1 ? (
                      `Close`
                    ) : (
                      `Configure Build Steps`
                    )}
                  </Button>
                  <Button 
                      icon="trash-can"
                      onClick={() => deleteRepo(repo._id)}
                  >
                    Delete Repo
                  </Button>
              </div>
              <div 
                className="repo-build-steps"
                style={{
                  height: openBuildSteps.indexOf(repoIdx) > -1 ? 'auto' : '0px',
                  overflow: openBuildSteps.indexOf(repoIdx) > -1 ? 'initial' : 'hidden',
                }}
              >
                <Typography variant="details" styles={{display: 'inline'}}>*Available variables: </Typography>
                &nbsp;<Typography variant="price" styles={{display: 'inline'}}>$subdomain</Typography>, 
                &nbsp;<Typography variant="price" styles={{display: 'inline'}}>$branch</Typography>, 
                &nbsp;<Typography variant="price" styles={{display: 'inline'}}>$port[0], $port[1]...etc</Typography> 
                &mdash;<Typography variant="details" styles={{display: 'inline'}}>Base commands are defined in your environment file.</Typography>
                {(repo.buildSteps || []).map((buildStep, buildStepIdx) => (
                    <div className="build-step-row" key={`${repo.repo}-build-step-${buildStepIdx}`}>
                      <Input 
                        placeholder="Env variable string"
                        onChange={e => setBuildStepValue(repoIdx, buildStepIdx, 'envString', e.target.value)}
                        value={buildStep.envString || ''}
                      />
                      <Select 
                        multi={false}
                        options={env.BASE_POST_BUILD_COMMANDS.split(',').map(cmd => ({
                          label: cmd,
                          value: cmd
                        }))}
                        onChange={selected => setBuildStepValue(repoIdx, buildStepIdx, 'baseCommand', selected)}
                        value={buildStep.baseCommand || null}
                        name={`${repo.repo}-baseCommand`}
                        label={'Base Command'}
                        />
                      <Input 
                        placeholder={'Argument String'}
                        onChange={e => setBuildStepValue(repoIdx, buildStepIdx, 'arguments', e.target.value)}
                        value={buildStep.arguments || ''}
                      />
                      <Button 
                        onClick={() => deleteBuildStep(repoIdx, buildStepIdx)}
                        icon="trash-can"
                      >
                        Delete Build Step
                      </Button>
                    </div>
                ))}
                <div className="build-step-button-row">
                  <Button
                      icon="add"
                      onClick={() => addBuildStep(repoIdx)}
                      variant="ghost"
                  >
                    Add Build Step
                  </Button>
                  <Button 
                    onClick={() => updateRepo(repo)}
                  >
                    Save Build Steps
                  </Button>
                </div>
              </div>
            </div>
            ))}
          <hr />
        <Typography variant="h1">Watch a New Repo to Pull</Typography>
        <div className="new-repo">
          <Input onChange={e => setRepoName(e.target.value)} value={repoName} placeholder="Repo Name" />
          <Button 
            onClick={saveNewRepo}
          >
            Save Repo
          </Button>
        </div>
        <Typography variant="error">{error}</Typography>
        </Layout>
        <style jsx>{`
             .repo-box {
               padding: 15px;
             }
             .new-repo {
                display: flex;
                justify-content: flex-start;
              }
              .repo-row {
                display: flex;
                justify-content: flex-start;
                margin-bottom: 10px;
              }
              :global(.repo-row > *) {
                margin-right: 20px;
                flex: 1;
              }
              :global(.repo-row div:last-child button) {
                background: ${colors.red};
              }
              :global(.repo-row div:last-child button:hover) {
                background: ${colors['light-red']};
              }

              :global(.build-step-row div:last-child button) {
                background: ${colors.red};
              }
              :global(.build-step-row div:last-child button:hover) {
                background: ${colors['light-red']};
              }

              :global(.new-repo > *) {
                  margin-right: 20px;
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
              }
              :global(.build-step-row) {
                display: flex;
              }
              :global(.build-step-row > *) {
                margin-right: 20px;
                display: flex;
                flex-direction: column;
                justify-content: center;
              }
              :global(.build-step-row > *:first-child) {
                flex: 1;
              }
              :global(.build-step-row > *:nth-child(2)) {
                flex: 1;
              }
              :global(.build-step-row > *:nth-child(3)) {
                flex: 2;
              }
              :global(.build-step-row > *:last-child) {
                flex: 1;
              }
              :global([class^="DesktopSelect__SelectButton"]) {
                padding: 0 12px !important;
              }
              .build-step-button-row {
                display: flex;
                justify-content: space-between;
              }
        `}</style>
      </>
    )
  }
  
  export async function getServerSideProps(context) {
    const repos = await fetchRepos(context.req.headers.host);
    return {
      props: {
          repos
      }
    };
  }