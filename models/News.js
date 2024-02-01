const mongoose = require('mongoose');

const NewsSchema = mongoose.Schema({
    rank:{
        type: String,
    },
    title:{
        type:String,
    },
    url:{
        type: String,
    },
    site:{
        type: String,
    },
    score:{
        type: String,
    },
    madeBy:{
        type: String,
    },
    age:{
        type: String,
    },
    comments:{
        type: String,
    },
},{
    collection: 'News'

});

const News = mongoose.model('News', NewsSchema);

module.exports = News;