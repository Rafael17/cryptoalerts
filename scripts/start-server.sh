#!/bin/bash
#sudo service nginx restart

PATH=/home/ec2-user/.nvm/versions/node/v13.5.0/bin
forever stopall
forever start /usr/share/nginx/html/app.js