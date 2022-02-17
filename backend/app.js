const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const crypto = require('crypto'); 
const inner_secret = '1234356fdvgdfhfgjh13345gvb@@$*'
const app = express();

const db = require('./models/products_auth.js');

app.use(session({ 
	secret: 'jkgtefiyekgwHdq;', 
	cookie: { 
		maxAge: 60000000, //1m
		httpOnly: false,
	},
	resave : true,
	saveUninitialized : false,
	store: MongoStore.create({ mongoUrl:"mongodb://localhost:27017/itmo_test_shop"})
}));

app.use(express.static('public'));

app.use((req, res, next)=>{
	if(req.url.startsWith('/admin')){
		if(req.session.auth){
			next();
		} else {
			res.redirect('/')
		}
	} else {
		next();
	}
});

app.use(express.static('private'));

db.init()
	.then(()=>{
		console.log('Соединились с базой')
		app.listen(80, ()=>{
			console.log('Сервер запустился на 80 порту')
		});
	});

app.get('/all_products', (req, res, next)=>{
	db.getAllProducts()
		.then((arr)=>{
			res.json(arr);
		})
		.catch((err)=>{
			console.log(err);
			res.status(500).end();
		});
});

app.post('/auth', express.json(), async (req, res, next)=>{
	let data = req.body;
	console.log(data);
	
	if(!data.login || !data.pass)
		return req.status(400).end();
	
	let users = await db.getUser(req.body.login);
	
	for(let i = 0; i < users.length; i++){
		let user = users[i];
		if(user.login == data.login){
			let hashed_pass = crypto
				.createHash('sha256')
				.update(inner_secret + data.pass)
				.digest('hex');
			if(hashed_pass == user.pass){
				req.session.user_name = user.login;
				req.session.auth = true;
				return res.status(200).json({
					login: user.login
				});
			} else {
				req.session.auth = false;
				return res.status(401).end();
			}
		}
	}
	
	req.session.auth = false;
	return res.status(401).end();
});

app.post('/add_product', express.json(), async (req, res, next)=>{
	let data = req.body;
	console.log(data);
	
	if(!data.name || !data.price || !data.description)
		return res.status(400).end();
	
	await db.addProduct(data);
	
	res.status(200).end();
})

app.get('/exit', (req, res, next)=>{
	req.session.destroy();
	res.redirect('/');
});