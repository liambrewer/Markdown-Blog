const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')
const indexRouter = require('./routes/index')
const authRouter = require('./routes/auth')
const userRouter = require('./routes/users')
const articleRouter = require('./routes/articles')
const app = express()
const PORT = process.env.PORT || 5000
require('dotenv').config()
require('./config/passport')(passport)

//Create a .env file with a MONGO_URI specified.
//MONGO_URI=____________
mongoose.connect(process.env.MONGO_URI)

app.use(expressLayouts)
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(session({
  secret: process.env.SECRET,
  resave: true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 },
  saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use(( req, res, next ) => {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.error = req.flash('error')
  next()
})
app.use(methodOverride('_method'))

app.use('/', indexRouter)
app.use('/auth', authRouter)
app.use('/users', userRouter)
app.use('/articles', articleRouter)

app.listen(PORT)