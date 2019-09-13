const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');

// load models
const Message = require('./models/message');
const User = require('./models/user');
var app = express();

// load keys file
const Keys = require('./config/keys');

// use body parser middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Configuration for Authentication
app.use(cookieParser());
app.use(session({
    secret: 'mysecret',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Load Facebook Strategy
require('./passport/facebook');

// Connect to MongoDB Atlas
mongoose.connect(Keys.MongoDB, { useNewUrlParser: true }).then(() => {
    console.log('Server is CONNECTED to MongoDB');
}).catch((err) => {
    console.log(err);
});

// Environment var for port
const port = process.env.PORT || 3000;
// setup view engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));

app.set('view engine', 'handlebars');

// ROUTES
app.get('/', (req,res) => {
    res.render('home', {
        title: 'Home'
    });
});

app.get('/about', (req, res) => {
    res.render('about', {
        title: 'About'
    });
});

app.get('/contact', (req, res) => {
    res.render('contact', {
        title: 'Contact'
    });
});

app.get('/auth/facebook', passport.authenticate('facebook', {
    scope: ['email']
}));
app.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/profile',
    faliureRedirect: '/'
}));


app.post('/contactUs', (req, res)=> {
    console.log(req.body);
    const newMessage = {
        fullname: req.body.fullname,
        email: req.body.email,
        message: req.body.message,
        date: new Date()
    }

    new Message(newMessage).save((err, message) => {
        if(err){
            throw err;
        }
        else {
            Message.find({}).then((messages) => {
                if(messages){
                    res.render('newmessage', {
                        title: 'sent',
                        messages:messages
                    });
                } else{
                    res.render('noMessage', {
                        title: 'Not Found'
                    });
                }
            });
        }
    })
})

app.listen(port, () => {
    console.log(`Server Is Running On PORT: ${port}`);
});