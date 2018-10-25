const mongoose = require('mongoose');
const UserPlatformInfo = require('../models/userPlatformInfo');
const multer = require('multer');
const csv = require('fast-csv');
const authorization = require("../middleware/check-auth");
const redis = require('redis');
const redisClient = redis.createClient();

exports.uploadFile = (req, res, next) =>{
	if(req.file == null){
         return res.status(500).json({
                  error: "Invalid file"
                });
     }
	csv.fromPath(req.file.path).on("data", function(data) {
		var entry = new UserPlatformInfo({
			_id: new mongoose.Types.ObjectId(),
			uid : data[0],
			platform : data[1]
		});
		entry.save(function(error) {
			if (error) {
				console.log("Error occured while saving csv : "+ error);
				res.status(500).json({
                  error: "Invalid file"
                });
			}
		});
	}).on("end", function() {
	});
	res.json({
		success : "Data imported successfully.",
		status : 200
	});
}

exports.fetch = (req, res, next) =>{
	const platform = req.params.filter.trim();
    console.log("filter : " + platform);
    redisClient.get(`${platform}` , (err, result) => {
    if(err){
    	console.log("Error occrred while fetching from redis: "+ err);
    }
    if (result) {
      console.log("Returned result from redis : ", result);
      const resultJSON = JSON.parse(result);
      return res.status(200).json(resultJSON);
    } 
    else { // Key does not exist in Redis store
       console.log("Result does not exist in redis ");
      UserPlatformInfo.countDocuments( {platform : platform}).exec( (err, count) => {
	    if (err) {
	        console.log("Error in finding total users for a platform : " + err);
                res.status(500).json({
                  error: err
                });
	    } 
	    UserPlatformInfo.distinct("uid",{platform : platform}).exec(function (err, unique) {
		  if (err) {
		        console.log("Error in finding distinct users : " + err);
                res.status(500).json({
                  error: err
                });
		    }
	    UserPlatformInfo.find({}, function(err, total){
        	if (err) {
		       console.log("Error in finding total users : " + err);
                res.status(500).json({
                  error: err
                });
		    }
	    redisClient.set(platform,JSON.stringify({
        totalUsers : count,
  	    totalUniqueUsers : unique.length,
  	    share : unique.length/total.length
       }), 'EX', process.env.REDIS_EXPIRY, function(err,resp){
           
           if(err){
           	console.log("Error occurred while adding data to redis");
           	 res.status(500).json({
                  error: err
                });
           }

	    });
		res.status(200).json({
        totalUsers : count,
  	    totalUniqueUsers : unique.length,
  	    share : unique.length/total.length
       });
	  });
    })
});
    }
  });
    
  
}