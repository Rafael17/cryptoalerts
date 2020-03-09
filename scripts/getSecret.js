require('dotenv').config();

const AWS = require('aws-sdk');
const region = process.env.AWS_REGION || 'us-west-1';

const addAWSConfigs = () => {
    
    if(process.env.AWS_KEY) {
        AWS.config.update({
            accessKeyId: process.env.AWS_KEY,
            secretAccessKey: process.env.AWS_SECRET
        });
    } else {
        AWS.config.credentials = new AWS.EC2MetadataCredentials();
    }
}

const getSecret = (name, keys) => {

    const promise = new Promise((resolve, reject) => {
        if(process.env.ENVIRONMENT == 'prod') {
            const client = new AWS.SecretsManager({region: region});
            addAWSConfigs();

            client.getSecretValue({SecretId: name}, function(err, data) {
                let secret;
                if (err) {
                    reject(err);
                }
                else {
                    if ('SecretString' in data) {
                        secret =JSON.parse(data.SecretString);
                        keys.map(k => {
                            if(secret[k]) {
                                process.env[k] = secret[k];    
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


