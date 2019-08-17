var express = require('express');
var router = express.Router();
var csrf = require('csrf');
var tokens = new csrf();
var bcrypt = require('bcrypt');
const saltRounds = 10; //ストレッチング回数。何回ハッシュ化を行うか定義
const db = require('../models/index');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// GET /users/sign_up
router.get('/sign_up', (req, res, next) => {
	let secret = tokens.secretSync();
	let token = tokens.create(secret);

	req.session._csrf = secret;
	res.render('sign_up', {authToken: token});
});


// GET /users/sign_in
router.get('/sign_in', (req, res, next) => {
	res.render('sign_in');
});

// GET /users/:id
router.get('/:id([0-9]+)', (req, res, next) => {
	db.user.findOne({
		where: { id: req.params.id}
	})
	.then((user) => {
		res.render('show', {user: user});
	});
});

// GET /users/authenticate
router.post('/authenticate', (req, res, next) => {
	db.user.findOne({
		where: { email: req.body.email},
	})
	.then((user) => {
		if(user && bcrypt.compareSync(req.body.password, user.password_hash)) {
			res.redirect(req.baseUrl + `/${user.id}`);
		} else {
			res.redirect(req.baseUrl + '/sign_in');
		}
	});
});

// GET /users/create
router.post('/create', (req, res, next) => {
	let secret = req.session._csrf;
	let token = req.body.authToken;

	console.log(tokens.verify(secret, token));
	if (tokens.verify(secret, token) === false) {
		throw new Error("Invalid Token");
	}

	let password_hash = bcrypt.hashSync(req.body.password, saltRounds);
	db.user.create({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		password_hash: password_hash
	})
	.then((createUser) => {
		console.log('\n' + createUser + '\n');
		delete req.session._csrf;
		res.redirect(req.baseUrl + `/${createUser.id}`);
	})
	.catch((err) => {
		res.redirect(req.baseUrl + '/sign_up');
	})

	// User = db.user.build({
	// 			name: req.body.name,
	// 			email: req.body.email,
	// 			password: req.body.password,
	// 			password_hash: password_hash
	// 		});
	// User.validate()
	// .then((user) => {
	// 	console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'+user);
	// 	user.save()
	// 	.then((createUser) => {
	// 		console.log('\n' + createUser + '\n');
	// 		res.redirect(req.baseUrl + `/${createUser.id}`);
	// 	});
	// })
	// .error((errors) => {
	// 	console.log(errors);
	// });
});

module.exports = router;
