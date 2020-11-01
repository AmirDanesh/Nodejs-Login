const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config();
mongoose.connect(
    //TODO → remove +"" from ↓ -- that for fix debugging Error
    process.env.MONGODB_URI + '',
    {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    },
    (err) => {
        console.log('connected to DATABASE');
    }
);
