FROM node

COPY  bootstrap.sh /usr/src/app/

WORKDIR /usr/src/app
 
RUN chmod +x /usr/src/app/bootstrap.sh
 
ENTRYPOINT ["/usr/src/app/bootstrap.sh"]