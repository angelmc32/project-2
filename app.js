require('dotenv').config();

const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const express      = require('express');
const favicon      = require('serve-favicon');
const mongoose     = require('mongoose');
const logger       = require('morgan');
const path         = require('path');

// Require additional modules for login and session management
const passport     = require('./helpers/passport');
const session      = require('express-session');
const mongStore    = require('connect-mongo')(session);


mongoose
  .connect('mongodb://localhost/project-2', {useNewUrlParser: true, useUnifiedTopology: true})
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Session middleware setup
app.use( session(
  {
    secret: process.env.SECRET,
    resave: true,
    cookie: { maxAge: 3600000 },
    saveUninitialized: true,
    store: new mongStore(
      {
        mongooseConnection: mongoose.connection,
        ttl: 24 * 60 * 60
      }
    )
  }
));

// Initialize passport and enable session middleware
app.use( passport.initialize() );
app.use( passport.session() );

// Express View engine setup

app.use(require('node-sass-middleware')({
  src:  path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));
      

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));



// default value for title local
app.locals.title = 'Ironhack Project 2';



const index = require('./routes/index');
const authRoutes = require('./routes/auth')
app.use('/', index);
app.use('/', authRoutes);


module.exports = app;
