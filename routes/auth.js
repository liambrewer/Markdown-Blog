const express = require('express')
const router = express.Router()
const User = require('../models/user')
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const passport = require('passport')

router.get('/login', ( req, res ) => {
  res.render('auth/login')
})

router.get('/register', ( req, res ) => {
  res.render('auth/register')
})

router.post(
  '/register',
  body('username')
    .isLength({ min: 4, max: 24 })
    .withMessage('Username must be 4-24 characters long.'),
  body('email')
    .isEmail()
    .withMessage('Invalid Email address'),
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be 6-128 characters long.'),
  body('password2')
    .if(body('password').isLength({ min: 6, max: 128 }))
    .bail()
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match.'),
  async ( req, res ) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
      return res.render('auth/register', {
        errors: errors.array(),
        username: req.body.username,
        email: req.body.email
      })
    }

    const { username, email, password: plainTextPassword } = req.body

    try {
      const password = await bcrypt.hash(plainTextPassword, 10)

      const user = await User.create({
        username: username,
        email: email,
        password: password
      })

      req.flash('success_msg', 'Account Registered')
      res.redirect('/auth/login')

    } catch (e) {
      if(e.code === 11000) {
        return res.render('auth/register', {
          errors: [{msg: 'Username/Email address already in use.'}],
          username: req.body.username,
          email: req.body.email
        })
      }
      throw e
    }
  }
)

router.post('/login', ( req, res, next ) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: true
  })(req, res, next)
})

router.post('/logout', ( req, res ) => {
  req.logout()
  req.flash('success_msg', 'Logged Out.')
  res.redirect('/auth/login')
})

module.exports = router