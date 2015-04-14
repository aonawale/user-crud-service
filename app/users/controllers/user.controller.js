var User = require('../models/user.model')[1];
var jwt = require('jsonwebtoken');
var crypto = require('crypto-js/sha256');
var secret = require('../../../config/config').db[process.env.NODE_ENV].secret;
var token;

module.exports = {

	// get all users
	getAllUser: function(req, res){
		User.fetchAll().then(function(model){
			res.json(model);
		});
	},

	// get a single user
	getOneUser: function(req, res){
		new User({username: req.params.username}).fetch().then(function(model){
			res.json(model);
		});
	},

	// create a new user
	createUser: function(req, res){
		if(!req.body.username && !req.body.email){
			token = jwt.sign({username: req.body.username, email: req.body.email}, secret);
			req.body.token = token;
			req.body.password = crypto(req.body.password);
			User.forge(req.body).save().then(function(model){
				res.json({message: "User Created", "token": model.attributes.token});
			});
		}else{
			res.json({message: "Username or Email already exist"});
		}
	},

	// signIn to user account
	signInUser: function(req, res){
		new User({username: req.body.username, password: crypto(req.body.password)})
		.fetch().then(function(model){
			if(model){
				res.json({message: "User Logged in", token: model.attributes.token});
			}else{
				res.json({message: "User doesn't exist"});
			}	
		});
	},

	// signOut from user account
	signOutUser: function(req, res){
		new User({username: req.body.username}).fetch().then(function(model){
			if(model){
				model.set({"token": ""});
				model.save();
				res.json({message: "User Logged Out"});
			}else{
				res.json({message: "User doesn't exist"});
			}
		});
	},

	// update a user
	updateUser: function(req, res){
		new User({username: req.body.oldname}).fetch().then(function(model){
			if(model){
				delete req.body.oldname;
				model.save(req.body, {patch: true}).then(function(){
					res.json({message: "User Updated"});
				});
			}else{
				res.json({message: "User doesn't exist"});
			}		
		});
	},

	// delete a user
	deleteUser: function(req, res){
		new User({'username': req.body.username}).fetch().then(function(model){
			if(model){
				model.destroy();
				res.json({message: "User Deleted"});
			}else{
				res.json({message: "User doesn't exist"});
			}
		});
	}

};