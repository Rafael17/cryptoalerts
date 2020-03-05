require('dotenv').config();

const AWS = require('aws-sdk');
const fs = require('fs');

const filePath = './dist/';
const bucketName = process.env.S3_FRONT_END_BUCKET;

AWS.config.update({
    region: process.env.AWS_REGION
});

if(process.env.AWS_KEY) {
    AWS.config.update({
        accessKeyId: process.env.AWS_KEY,
        secretAccessKey: process.env.AWS_SECRET
    });
} else {
    AWS.config.credentials = new AWS.EC2MetadataCredentials();
}

var s3 = new AWS.S3();

const params = { 
  Bucket: bucketName,
  Delimiter: '',
  Prefix: ''
}

s3.listObjects(params, function (err, data) {
	if(err)throw err;
	data.Contents.map(e => e.Key).map(downloadFile);
});

const downloadFile = ( key ) => {
	const params = {
		Bucket: bucketName,
		Key: key
	};
	const file = filePath + key;
	s3.getObject(params, (err, data) => {
		if (err) console.error(err);
		fs.writeFileSync(file, data.Body.toString());
		console.log(`${file} has been created!`);
	});
};

