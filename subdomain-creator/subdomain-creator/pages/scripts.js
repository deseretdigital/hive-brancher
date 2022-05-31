import { useState } from 'react';
import getConfig from "next/config";
const { publicRuntimeConfig: env } = getConfig();

import Layout from '../components/Layout';
import Typography from '@deseretdigital/cascade.typography';
import Input from '@deseretdigital/cascade.input';
import Select from '@deseretdigital/cascade.select';
import Button from '@deseretdigital/cascade.button';
import colors from '@deseretdigital/cascade.colors';

async function handleCreateScript(type, contents, path, baseCommand, script) {
    const result = await fetch('/api/new-script', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type,
        contents,
        path,
        baseCommand,
        script
      })
    });
  }
  async function handleDeleteScript(_id) {
    const result = await fetch('/api/delete-script', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          _id,
        })
      });
  }

  async function handleUpdateScript(_id, type, contents, path, baseCommand, script) {
    const result = await fetch('/api/update-script', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          _id,
          type,
          contents,
          path,
          baseCommand,
          script
        })
      });
  }

async function fetchScripts(host) {
    const scripts = await fetch(`http://${host}/api/fetch-scripts`).then(resp => resp.json());
    return scripts.scripts || [];
}

export default function Scripts({ scripts }) {

    const [script, setScript] = useState('');
    const [baseCommand, setBaseCommand] = useState(null);
    const [path, setPath] = useState('');
    const [contents, setContents] = useState('');
    const [type, setType] = useState(null);
    const [currentScripts, setCurrentScripts] = useState(scripts);
    const [error, setError] = useState('');
    const [_id, setId] = useState(null);

    async function createNewScript() {
        if(!type) {
          setError('Type is required');
          return;
        }
        if(type === 'file' && (!contents || !path)) {
            setError('Contents and path are required');
            return;
        }
        if(type === 'script' && (!baseCommand || !script)) {
            setError('Base command and script are required');
            return;
        }
        setError('');
        await handleCreateScript(type, contents, path, baseCommand, script);
        const newScripts = await fetchScripts(window.location.host);
        setCurrentScripts(newScripts);
        clearFields();
      }

      async function updateScript() {
        if(!type) {
            setError('Type is required');
            return;
          }
          if(type === 'file' && (!contents || !path)) {
              setError('Contents and path are required');
              return;
          }
          if(type === 'script' && !(baseCommand || !script)) {
              setError('Base command and script are required');
              return;
          }
          setError('');
          await handleUpdateScript(_id, type, contents, path, baseCommand, script);
            const newScripts = await fetchScripts(window.location.host);
            setCurrentScripts(newScripts);
            clearFields();

      }

      function clearFields() {
        setScript('');
        setBaseCommand(null);
        setPath('');
        setContents('');
        setType(null);
        setId(null);
      }

    async function deleteScript(_id) {
        if(confirm('Are you sure?  This could be fairly catastrophic... *grimace*')) {
            await handleDeleteScript(_id);
            const newScripts = await fetchScripts(window.location.host);
            setCurrentScripts(newScripts);
        }
    }

    function beginEditScript(editingScript) {
        setScript(editingScript.script);
        setBaseCommand(editingScript.baseCommand);
        setPath(editingScript.path);
        setContents(editingScript.contents);
        setType(editingScript.type);
        setId(editingScript._id);
    }

  return (
    <>
      <Layout>
        <Typography variant="h1">Post Run Scripts</Typography>
        {currentScripts.map((currentScript, idx) => (
            <div className="script-row" key={`script-${idx}`}>
                <Typography variant="body">{currentScript.type === 'file' ? 'Create File' : currentScript.type === 'script' ? 'Run Script' : currentScript.type}</Typography>
                {currentScript.type === 'file' ? (
                    <>
                        <Typography variant="body">{currentScript.path}</Typography>
                        <Typography variant="body" styles={{
                            background: colors.black,
                            color: colors.white,
                            padding: '10px',
                            whiteSpace: 'pre-line',
                            maxWidth: '500px',
                            maxHeight: '300px',
                            overflow: 'auto'
                        }}>{currentScript.contents.replace(/ /g, "\u00a0")}</Typography>
                    </>
                ) : currentScript.type === 'script' ? (
                    <>
                        <Typography variant="body">{currentScript.baseCommand}</Typography>
                        <Typography variant="body">{currentScript.script}</Typography>
                    </>
                ) : null}
                <div>
                <Button
                    icon="pencil"
                    onClick={() => beginEditScript(currentScript)}
                >
                    Edit
                </Button>
                </div>
                <div>
                <Button 
                    icon="trash-can"
                    onClick={() => deleteScript(currentScript._id)}
                >
                    Delete
                </Button>
                </div>
            </div>
        ))}
        <hr />
        <Typography variant="h1">{_id ? 'Edit' : 'New'} Script</Typography>
        <Typography variant="details" styles={{display: 'inline'}}>*Available variables: </Typography>
        &nbsp;<Typography variant="price" styles={{display: 'inline'}}>$subdomain</Typography>, 
        &nbsp;<Typography variant="price" styles={{display: 'inline'}}>$branch</Typography>, 
        &nbsp;<Typography variant="price" styles={{display: 'inline'}}>$port[0], $port[1]...etc</Typography> 
        &mdash;<Typography variant="details" styles={{display: 'inline'}}>Base commands are defined in your environment file.</Typography>
        <div className="new-script">
            <div><Select 
                multi={false}
                options={[
                    { label: 'Create File', value: 'file'},
                    { label: 'Run Script', value: 'script'}
                ]}
                name="type"
                label="Script Type"
                onChange={selected => setType(selected)}
                value={type}
            /></div>
            {type === 'script' ? (
                <>
                    <Select 
                        multi={false}
                        options={env.BASE_POST_BUILD_COMMANDS.split(',').map(cmd => ({
                            label: cmd,
                            value: cmd
                        }))}
                        onChange={selected => setBaseCommand(selected)}
                        value={baseCommand}
                        name={`baseCommand`}
                        label={'Base Command'}
                    />
                    <Input onChange={e => setScript(e.target.value)} value={script} placeholder="Script" className="file" />
                </>
            ) : type === 'file' ? (
                <>
                    <Input onChange={e => setPath(e.target.value)} value={path} placeholder="File path" />
                    <Input onChange={e => setContents(e.target.value)} value={contents} as="textarea" placeholder="File contents" />
                </>
            ) : null}
        <div>
            <Button 
                onClick={_id ? updateScript : createNewScript}
            >
            {_id ? 'Save' : 'Create'} Script
          </Button>
        </div>
          {_id ? (
              <Button 
                variant="ghost"
                onClick={clearFields}
              >
                Cancel
              </Button>
          ) : null}
        </div>
        <Typography variant="error">{error}</Typography>
        <style jsx>{`
          .new-script {
            display: flex;
            justify-content: space-between;
          }
          :global(.new-script > *) {
            margin-right: 20px;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .script {
              display: ${type === 'script' ? 'block' : 'none'};
          }
          .file {
            display: ${type === 'file' ? 'block' : 'none'};
          }
          :global(.new-script > *:first-child) {
              flex: 1;
          }
          :global(.new-script > *:nth-child(2)) {
            flex: 1;
          }
          :global(.new-script > *:nth-child(3)) {
            flex: 4;
          }
          :global(.new-script > *:last-child) {
            flex: 1;
          }
          :global([class^="DesktopSelect__SelectButton"]) {
            padding: 0 12px !important;
          }
          .script-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          :global(.script-row > *:first-child) {
                flex: 1;
                margin-right: 20px;
            }
            :global(.script-row > *:nth-child(2)) {
                flex: 2;
                margin-right: 20px;
            }
            :global(.script-row > *:nth-child(3)) {
                flex: 4;
                margin-right: 20px;
            }
            :global(.script-row > *:nth-child(4)) {
                flex: 1;
                margin-right: 20px;
            }
            :global(.script-row > *:last-child) {
                flex: 1;
                margin-right: 20px;
            }
            :global(.script-row > *:last-child button) {
                background: ${colors.red};
            }
            :global(.script-row > *:last-child button:hover) {
                background: ${colors['light-red']};
            }
            :global(.script-row > *) {
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
              }
        `}</style>
      </Layout>
    </>
  )
}

export async function getServerSideProps(context) {
    const scripts = await fetchScripts(context.req.headers.host);
  return {
    props: {
        scripts
    }
  };
}