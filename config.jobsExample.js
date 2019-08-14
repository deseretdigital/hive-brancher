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
          args: ['composer.lock', 'yarn.lock'],
          proceedOnFailure: true
        },
        {
          proc: 'mkdir',
          args: ['/var/dynamic/jobs-branches/branch_ksl-api_${branchname}'],
          proceedOnFailure: true
        },
        {
          proc: 'rsync',
          args: ['-r', '/var/dynamic/jobs-branches/branch_ksl-api_master/', '/var/dynamic/jobs-branches/branch_ksl-api_${branchname}'],
          proceedOnFailure: true
        },
        {
          proc: 'ln',
          args: ['-nfs', '/var/dynamic/jobs-branches/branch_m-ksl-jobs_${branchname}/site-api', '/var/dynamic/jobs-branches/branch_ksl-api_${branchname}/public_html/classifieds/jobs'],
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