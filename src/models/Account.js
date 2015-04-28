var mongoose = require('mongoose');

var AccountModel;

var AccountSchema = new mongoose.Schema({
    facebookID: {
        type: Number,
        required: true,
        trim: true,
        unique: true
    },
    Fname: {
        type: String,
        required: true,
        trim: true
    },
    createData: {
        type: Date,
        default: Date.now
    }
});
//gives the data we care about back to us
AccountSchema.methods.toAPI = function(){
    return {
        facebookID: this.facebookID,
        Fname: this.Fname,
        _id: this._id
    };
};

//Grabs the user by the ID
AccountSchema.statics.findByID = function(id, callback){
    
    var search = { facebookID: id };
    
    return AccountModel.findOne(search, callback);
    
};



AccountModel = mongoose.model('Account', AccountSchema);

module.exports.AccountModel = AccountModel;
module.exports.AccountSchema = AccountSchema;
