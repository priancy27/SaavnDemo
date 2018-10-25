const mongoose = require('mongoose');
const userPlatformInfoSchema = mongoose.Schema({
	_id : mongoose.Schema.Types.ObjectId,
	uid : {type: String, required : true},
	platform : {type: String, required : true}
});

module.exports = mongoose.model('User_Platform_Info', userPlatformInfoSchema);