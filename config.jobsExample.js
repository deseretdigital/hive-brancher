module.exports = {
  projects: [
    {
      owner: 'deseretdigital',
      repo: 'ksl-api',
      user: '',
      token: 'xxxx',
      ignoreBranches: true,
      build: [
        {
          proc: 'rm',
          args: ['composer.lock'],
          proceedOnFailure: true
        },
        {
          proc: 'composer',
          args: ['install', '-q'],
          proceedOnFailure: true
        },
        {
          proc: 'ln',
          args: ['-nfs', '/usr/local/framework/DDM', 'library/DDM'],
          proceedOnFailure: true
        },
        {
          proc: 'ln',
          args: ['-nfs', '/export/ksl/v2', 'library/ksl'],
          proceedOnFailure: true
        },
        {
          proc: 'ln',
          args: ['-nfs', '/usr/local/framework/zend/library/Zend', 'library/Zend'],
          proceedOnFailure: true
        },
        {
          proc: 'ln',
          args: ['-nfs', '/usr/local/framework', 'framework'],
          proceedOnFailure: true
        }
      ],
      webhook: ''
    },
    {
      owner: 'deseretdigital',
      repo: 'm-ksl-jobs',
      user: 'sdickson',
      token: 'xxxx',
      build: [
        {
          proc: 'sudo',
          args: ['npm', 'run', 'brancher'],
          proceedOnFailure: true
        },
        {
          proc: 'rm',
          args: ['composer.lock', 'package.lock'],
          proceedOnFailure: true
        }
      ],
      webhook: ''
    },
    {
      owner: 'deseretdigital',
      repo: 'm-ksl-myaccount',
      user: 'sdickson',
      token: 'xxxx',
      build: [
        {
          proc: 'sudo',
          args: ['npm', 'run', 'brancher'],
          proceedOnFailure: true
        }
      ],
      webhook: ''
    }
  ],
  postBuildProcess: [
    {
      proc: 'apache2ctl',
      args: ['graceful'],
      proceedOnFailure: true
    },
  ],
  apacheConfigDir: '/etc/apache2/sites-dynamic',
  buildPath: `/var/dynamic/jobs-branches`,
  stageDomain: 'stage-v2.ksl.com',
  testDomain: 'jobs.test.ksl.com',
  stageDocRoot: '',
  apacheLogDir: '/var/log/apache2'
}