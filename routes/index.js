var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	let userId = req.signedCookies['Au'];
	res.render('index', {userId: userId});
});

module.exports = router;
