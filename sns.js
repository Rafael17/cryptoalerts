
const AWS = require('aws-sdk');
require('dotenv').config();

// Set region
AWS.config.update({
	accessKeyId: process.env.AWS_KEY,
 	secretAccessKey: process.env.AWS_SECRET,
	region: process.env.AWS_REGION
});

const topics = {
    PRICE_ALERT_UPDATE: process.env.TOPIC_ARN_PRICE_ALERT_UPDATE
}

// Create promise and SNS service object
SNS = {
    publish: (message) => {
        const params = {
            Message: message,
            TopicArn: topics.PRICE_ALERT_UPDATE
        };
        
        const publishPromise = new AWS.SNS().publish(params).promise();
        publishPromise.then((data) => {
            console.log(`Message ${params.Message} send sent to the topic ${params.TopicArn}`);
            console.log("MessageID is " + data.MessageId);
        }).catch((err) => {
            console.error(err, err.stack);
        });
    }
}

module.exports = SNS;