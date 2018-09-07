#!/bin/bash
if ps -ef | grep -v grep | grep hive-brancher/index.js ; then
        exit 0
else
        node /var/www/hive-brancher/index.js
        exit 0
fi
