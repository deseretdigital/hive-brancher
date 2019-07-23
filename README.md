# Hive Brancher

**hive-brancher** is a script for pulling Github repositories into staging environments so all branches
can be tested against.

- Designed to be run repeatedly to check for updates
- Will remove branches that have been deleted
- Multi-repository
- Webhook on branch post-build

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
