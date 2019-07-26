const { getWhitelist, getSubdomainsFromBranchNames } = require('./lib/getWhitelist');
module.exports = {
  projects: [
    {
      owner: 'deseretdigital',
      repo: 'ksl-api',
      user: 'sdickson',
      token: 'xxxx',
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
          args: ['npm', 'install'],
          proceedOnFailure: true
        },
        {
          proc: 'sudo',
          args: ['npm', 'run', 'prod'],
          proceedOnFailure: true
        },
        {
          proc: 'rm',
          args: ['composer.lock'],
          proceedOnFailure: true
        },
        {
          proc: 'composer',
          args: ['install', '-q'],
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
    /*
    {
      proc: '/var/dynamic/jobs-branches/branch_ksl-api_master/public_html/classifieds/common/scripts/create-constants.sh',
      args: [
        '-s',
        function ({ anyBranchesUpdated }) {
          if (anyBranchesUpdated) {
            return getSubdomainsFromBranchNames(getWhitelist().map(({ branch }) => branch)).join(',');
          }
          return '';
        },
        '-d',
        'jobs.test.ksl.com'
      ],
      proceedOnFailure: true
    }
    */
  ],
  apacheConfigDir: '/etc/apache2/sites-dynamic',
  buildPath: `/var/dynamic/jobs-branches`,
  stageDomain: 'stage-v2.ksl.com',
  testDomain: 'jobs.test.ksl.com',
  stageDocRoot: '',
  apacheLogDir: '/var/log/apache2'
}