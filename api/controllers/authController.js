const mongoose = require('mongoose');
const UserInfo = require("../models/userInfo");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signup = (req, res, next) => {
	  UserInfo.find({ email: req.body.email })
	    .exec()
	    .then(user => {
	      if (user.length >= 1) {
	        return res.status(409).json({
	          message: "User exists"
	        });
	      } else {
	        bcrypt.hash(req.body.password, 10, (err, hash) => {
	          if (err) {
	            return res.status(500).json({
	              error: err
	            });
	          } else {
	            const user = new UserInfo({
	              _id: new mongoose.Types.ObjectId(),
	              name: req.body.name,
	              email: req.body.email,
	              password: hash
	            });
	            user
	              .save()
	              .then(result => {
	                console.log(result);
	                res.status(201).json({
	                  message: "User created"
	                });
	              })
	              .catch(err => {
	                console.log(err);
	                res.status(500).json({
	                  error: err
	                });
	              });
	          }
	        });
	      }
	    });
	};
	
exports.login = (req, res, next) => {
		  UserInfo.find({ email: req.body.email })
		    .exec()
		    .then(user => {
		      if (user.length < 1) {
		        return res.status(401).json({
		          message: "Auth failed"
		        });
		      }
		      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
		        if (err) {
		          return res.status(401).json({
		            message: "Auth failed"
		          });
		        }
		        if (result) {
		          const token = jwt.sign(
		            {
		              email: user[0].email,
		              userId: user[0]._id
		            },
		            process.env.JWT_KEY,
		            {
		              expiresIn: "1h"
		            }
		          );
		          return res.status(200).json({
		            message: "Auth successful",
		            token: token
		          });
		        }
		        res.status(401).json({
		          message: "Auth failed"
		        });
		      });
		    })
		    .catch(err => {
		      console.log(err);
		      res.status(500).json({
		        error: err
		      });
		    });
	};

