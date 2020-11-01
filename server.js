const express = require('express');
const cors = require('cors');
require('./db/mongodb');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const auth = require('./Routes/Auth');
const userRoutes = require('./Routes/User_Routes');

dotenv.config();
let port = process.env.PORT || 3000;
const app = express();
const expressSwagger = require('express-swagger-generator')(app);
let options = {
    swaggerDefinition: {
        info: {
            description: 'This is a sample server',
            title: 'Swagger',
            version: '1.0.0'
        },
        host: `nodeboiler.herokuapp.com`,
        basePath: '/',
        produces: ['application/json', 'application/xml'],
        schemes: ['https', 'http'],
        securityDefinitions: {
            JWT: {
                type: 'apiKey',
                in: 'header',
                name: 'Authorization',
                description: ''
            }
        }
    },
    basedir: __dirname, //app absolute path
    files: ['./Routes/*.js'] //Path to the API handle folder
};

//middleWares
expressSwagger(options);
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Routes
app.get('/', (req, res) => {
    res.redirect('/api-docs');
});
app.use('/api/auth', auth);
app.use('/api/users', userRoutes);

app.listen(port, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log(`Server Listening to Port ${port}`);
    }
});
