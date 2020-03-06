const mongo 		= require('mongodb');
const MongoClient 	= require('mongodb').MongoClient;


const getConnectionString = () => {
	const promise = new Promise((resolve, reject) => {
		// this is an optional setup to use a separate mongodb service and pull connection string from Secret Manager
		/*
		if (process.env.ENVIROMENT === 'prod') {
			getSecret('prod/mongoDB')
			.then(({ DB_CONNECTION_STRING }) => DB_CONNECTION_STRING )
			.then((c) => resolve(c));
		} else {
			resolve(process.env.DB_CONNECTION_STRING);
		}
		*/
		resolve(process.env.DB_CONNECTION_STRING);
	})
	return promise;
}

let db;
Database = {
	connect: ( callback ) => {
		getConnectionString()
		.then( connectionString => {
			process.env.DB_CONNECTION_STRING = connectionString;
			MongoClient.connect(connectionString, { useNewUrlParser: true }, (e, client) =>{
				if (e) {
					console.log(e);
					callback(e);
				}	else{
					db = client.db(process.env.DB_NAME);
					console.log('mongo :: connected to database :: "'+process.env.DB_NAME+'"');
					callback(e);
				}
			});
		})
		
	},
	getDb: () => {
    	return db;
  	},
  	getMongo: () => {
  		return mongo;
  	}
};

module.exports = Database;