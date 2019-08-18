var express = require('express');
var router = express.Router();
var csrf = require('csrf');
var tokens = new csrf();
var bcrypt = require('bcrypt');
const saltRounds = 10; //ストレッチング回数。何回ハッシュ化を行うか定義
const db = require('../models');


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// GET /users/sign_up
router.get('/sign_up', (req, res, next) => {
	let secret = tokens.secretSync();
	let token = tokens.create(secret);
	let error;

	if (req.session.error) {
		error = req.session.error;
		delete req.session.error;
	}

	req.session._csrf = secret;
	res.render('sign_up', {authToken: token, error: error});
});


// GET /users/sign_in
router.get('/sign_in', (req, res, next) => {
	if (req.signedCookies['Au']) {
		res.redirect(req.baseUrl + `/${req.signedCookies['Au']}`);
	} else {
		res.render('sign_in');
	}
});

// GET /users/:id
router.get('/:id([0-9]+)', (req, res, next) => {
	if (req.params.id !== req.signedCookies['Au']) {
		res.redirect(req.baseUrl + '/sign_in');
	} else {
		db.user.findOne({
			where: { id: req.params.id}
		})
		.then((user) => {
			res.render('show', {user: user});
		})
		.catch((err) => {
			throw new Error(404);
		})
	}
});

// GET /users/:id/test
router.get('/:id([0-9]+)/test', (req, res, next) => {
	if (req.signedCookies['Au']) {
		if (req.params.id !== req.signedCookies['Au']) {
			res.redirect(req.baseUrl + `/${req.params.id}`);
		} else {
			delete req.session.url;
			res.render('test', {userId: req.params.id});
		}
	} else {
		req.session.url = req.url;
		res.redirect(req.baseUrl + '/sign_in');
	}
});


// GET /users/authenticate
router.post('/authenticate', (req, res, next) => {
	db.user.findOne({
		where: { email: req.body.email},
	})
	.then((user) => {
		if(user && bcrypt.compareSync(req.body.password, user.password_hash)) {
			res.cookie("Au", user.id, {signed: true});
			if (req.session.url) {
				res.redirect(req.baseUrl + req.session.url);
			} else {
				res.redirect(req.baseUrl + `/${user.id}`);
			}
		} else {
			res.redirect(req.baseUrl + '/sign_in');
		}
	});
});

// GET /users/create
router.post('/create', (req, res, next) => {
	let secret = req.session._csrf;
	let token = req.body.authToken;

	if (tokens.verify(secret, token) === false) {
		throw new Error("Invalid Token 不正なリクエストです。");
	}

	let password_hash = bcrypt.hashSync(req.body.password, saltRounds);
	db.user.create({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		password_hash: password_hash
	})
	.then((createUser) => {
		delete req.session._csrf;
		res.redirect(req.baseUrl + '/complete');
	})
	.catch((err) => {
		req.session.error = err.message.split(",\n");
		res.redirect(req.baseUrl + '/sign_up');
	})

});

// GET /users/:id/sign_out
router.get('/:id([0-9]+)/sign_out', (req, res, next) => {
	res.clearCookie('Au');
	res.redirect('/');
});

// GET /users/complete
router.get('/complete', (req, res, next) => {
	res.render('complete');
});


module.exports = router;
