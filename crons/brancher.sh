export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
if ps -ef | grep -v grep | grep hive-brancher/index.js ; then
    exit 0
else
    /usr/local/bin/node /var/www/hive-brancher/index.js -v
    exit 0
fi
