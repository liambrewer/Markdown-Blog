const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Article = require('../models/article')

router.get('/:slug', async ( req, res ) => {
  const slug = req.params.slug
  try {
    const user = await User.findOne({ slug: slug })
    const articles = await Article.find({ author: { id: user.id, username: user.username, slug: user.slug } })
    res.render('users/profile', { u: {username: user.username, createdAt: user.createdAt}, articles: articles })
  } catch (e) {
    console.log(e)
    req.flash('critical_msg', 'User not found.')
    res.redirect('/')
  }
})

module.exports = router