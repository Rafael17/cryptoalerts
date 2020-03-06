require('dotenv').config();

const AWS = require('aws-sdk');
const region = process.env.AWS_REGION || 'us-west-1';

if(process.env.AWS_KEY) {
    AWS.config.update({
        accessKeyId: process.env.AWS_KEY,
        secretAccessKey: process.env.AWS_SECRET
    });
} else {
    AWS.config.credentials = new AWS.EC2MetadataCredentials();
}

const getSecret = (name, keys) => {

    const client = new AWS.SecretsManager({region: region});
    const promise = new Promise((resolve, reject) => {
        if(process.env.ENVIRONMENT == 'prod') {

            client.getSecretValue({SecretId: secretName}, function(err, data) {
                let secret;
                if (err) {
                    reject(err);
                }
                else {
                    if ('SecretString' in data) {
                        secret =JSON.parse(data.SecretString);
                        keys.map(k => {
                            if(e[k]) {
                                process.env[k] = e[k];    
                            } else {
                                console.log(k + " is not set in " + name);
                            }
                        });
                        resolve();
                    } 
                }
            });
        } else {
            keys.map(k => {
                if(!process.env[k]) {
                    console.log(k + " is not set in dev environment (.env)");
                }
            });
            resolve();
        }
    });
    return promise;
}

module.exports = getSecret;


