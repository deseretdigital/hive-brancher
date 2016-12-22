module.exports = [
    {
        owner: 'deseretdigital',
        repo: 'hive-api',
        build: [
            {
                proc: 'composer',
                args: ['install', '-q', '--working-dir=application/'],
                env: { SYMFONY_ENV: 'stage' }
            }
        ]
    },
    {
        owner: 'deseretdigital',
        repo: 'hive-ui',
        build: [
            {
                proc: 'yarn',
                args: ['install']
            },
            {
                proc: 'yarn',
                args: ['build']
            }
        ]
    }
]
