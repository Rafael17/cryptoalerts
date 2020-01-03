const MongoClient 	= require('mongodb').MongoClient;

var db;
Database = {
	connect: (callback) =>{
		MongoClient.connect(process.env.DB_URL, { useNewUrlParser: true }, (e, client) =>{
			if (e){
				console.log(e);
				callback(e);
			}	else{
				db = client.db(process.env.DB_NAME);
				console.log('mongo :: connected to database :: "'+process.env.DB_NAME+'"');
				callback(e);
			}
		});
	},
	getDb: () => {
    	return db;
  	}
};

module.exports = Database;