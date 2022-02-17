const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

exports.init = async function(){
	await client.connect();
}

exports.getAllProducts = async function(){
	const db = client.db('itmo_test_shop');
	const collection = db.collection('products');
	return await collection.find().toArray();	
}

exports.addProduct = async function(product){
	const db = client.db('itmo_test_shop');
	const collection = db.collection('products');
	
	return await collection.insertOne(product);
}

exports.getUser = async function(login){
	const db = client.db('itmo_test_shop');
	const collection = db.collection('users');
	return await collection.find({login}).toArray();	
}