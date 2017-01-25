const find = require('lodash/find');

module.exports = function apacheConfigTemplate(repos, branchName, config) {
    const { buildPath, siteName, stageDomain, testDomain, apacheLogDir } = config;
    const uiBranchName = repos.some(obj => obj.repo === 'hive-ui') ? branchName : 'master';
    const apiBranchName = repos.some(obj => obj.repo === 'hive-api') ? branchName : 'master';
    /*console.log(`[${branchName}] Building apache config: UI - ${uiBranchName} | API - ${apiBranchName}`);*/
    return `
<VirtualHost *:80>
    ServerAdmin webmaster@localhost
    ServerName ${branchName}.${stageDomain}

    Header add X-Server "stage"
    SetEnv APPLICATION_ENV "stage"

    DocumentRoot ${buildPath}/branch_hive-ui_${uiBranchName}/public
    <Directory ${buildPath}/branch_hive-ui_${uiBranchName}/public>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Order allow,deny
        Allow from all

        DirectoryIndex index.php index.html
    </Directory>

    <Directory ${buildPath}/branch_hive-api_${apiBranchName}/application/web>
        AllowOverride All
        Order allow,deny
        Allow from all
        DirectoryIndex app.php
    </Directory>

    Alias /api ${buildPath}/branch_hive-api_${apiBranchName}/application/web

    # Possible values include: debug, info, notice, warn, error, crit,
    # alert, emerg.
    LogLevel warn

    ErrorLog ${apacheLogDir}/${branchName}.${stageDomain}.error.log
    CustomLog ${apacheLogDir}/${branchName}.${stageDomain}.access.log combined
</VirtualHost>
<VirtualHost *:80>
    ServerAdmin webmaster@localhost
    ServerName ${branchName}.${testDomain}

    Header add X-Server "test"
    SetEnv APPLICATION_ENV "test"

    DocumentRoot ${buildPath}/branch_hive-ui_${uiBranchName}/public
    <Directory ${buildPath}/branch_hive-ui_${uiBranchName}/public>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Order allow,deny
        Allow from all

        DirectoryIndex index.php index.html
    </Directory>

    <Directory ${buildPath}/branch_hive-api_${apiBranchName}/application/web>
        AllowOverride All
        Order allow,deny
        Allow from all
        DirectoryIndex app.php
    </Directory>

    Alias /api ${buildPath}/branch_hive-api_${apiBranchName}/application/web

    # Possible values include: debug, info, notice, warn, error, crit,
    # alert, emerg.
    LogLevel warn

    ErrorLog ${apacheLogDir}/${branchName}.${testDomain}.error.log
    CustomLog ${apacheLogDir}/${branchName}.${testDomain}.access.log combined
</VirtualHost>
    `;
}
