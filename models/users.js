var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UsresSchema = new Schema(
    {
        first_name: {type: String, required: true},
        last_name: {type: String, required: true},
        email: {type: String, required: true},
        password: {type: String, required: true}
    }

);

module.exports = mongoose.model('Users', UsresSchema);