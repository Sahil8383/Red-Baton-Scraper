const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    read_news: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'News'
        }
    ],
    deleted_news: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'News'
        }
    ]
},
{
    collection: 'Users'
});

const User = mongoose.model('User', UserSchema);

module.exports = User;