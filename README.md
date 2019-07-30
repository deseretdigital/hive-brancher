# Hive Brancher

**hive-brancher** is a script for pulling Github repositories into staging environments so all branches
can be tested against.

- Designed to be run repeatedly to check for updates
- Will remove branches that have been deleted
- Multi-repository
- Webhook on branch post-build

## Script

You will need to create some files for brancher to work correctly.  Examples are provided.  
- config.js - tells brancher which repos to care about, post build scripts, etc.
- apacheConfig.js - tells brancher how to make the dynamic apache config files 
- whitelist.json - tells the UI which branches to care about - and therefore which branchers brancher should look for
- .env - A place for a personal_github_token so that brancher has access to the repos

Also make sure your brancher.sh file has executable permissions.  Many teams run this as well as the cleanup.js once every minute.  


## UI
- Run "node server.js" (in the ui directory) to run an express server on port 3000 or pass in a custom port like this "node server.js 8000"
- The UI is a simple form that lists out the contents of whitelist.json and allows editing
- You can do an apache passthrough to node like this: 
```
<VirtualHost *:80>
        ServerName branches.cars-dev.ksl.com
        DocumentRoot /var/www/hive-brancher/ui

	<Proxy>
                Order deny,allow
                Allow from all
        </Proxy>

        <Location />
                ProxyPass http://localhost:3000/
                ProxyPassReverse http://localhost:3000/
        </Location>
</VirtualHost>
```

## TODO

This is still a work in progress. Upcoming features may include:

- A web view so you can easily see which branches have been built
- Github notices
