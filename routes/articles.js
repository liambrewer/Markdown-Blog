const express = require('express')
const Article = require('./../models/article')
const router = express.Router()
const { ensureAuthenticated } = require('../config/auth')

router.get('/new', ensureAuthenticated, ( req, res ) => {
  res.render('articles/new', { article: new Article() })
})

router.get('/edit/:id', ensureAuthenticated, async ( req, res ) => {
  const id = req.params.id
  try {
    const article = await Article.findById(id)
    res.render('articles/edit', { article: article })
  } catch (e) {
    console.log(e)
    req.flash('critical_msg', 'Error Fetching Data')
    res.redirect('/')
  }
  
})

router.get('/:slug', async ( req, res ) => {
  const slug = req.params.slug
  try {
    const article = await Article.findOne({ slug: slug })
    if (article == null) {
      req.flash('error_msg', `Article not found with slug: ${slug}`)
      return res.redirect('/')
    }
    res.render('articles/show', { user: req.user, article: article })
  } catch (e) {
    console.log(e)
    req.flash('critical_msg', 'Error Fetching Data')
    res.redirect('/')
  }
  
})

router.post('/', ensureAuthenticated, async ( req, res, next ) => {
  req.article = new Article()
  next()
}, saveArticleAndRedirect('new'))

router.put('/:id', ensureAuthenticated, async ( req, res, next ) => {
  const id = req.params.id
  try {
    req.article = await Article.findById(id)
    next()
  } catch (e) {
    console.log(e)
    req.flash('critical_msg', 'Failed to get article.')
    res.redirect('/')
  }
  
}, saveArticleAndRedirect('edit'))

router.delete('/:id', ensureAuthenticated, async ( req, res ) => {
  const id = req.params.id
  try {
    await Article.findByIdAndDelete(id)
    req.flash('success_msg', 'Article successfully deleted.')
    res.redirect('/')
  } catch (e) {
    console.log(e)
    req.flash('critical_msg', 'Failed to delete article.')
    res.redirect('/')
  }
})

function saveArticleAndRedirect(path) {
  return async ( req, res ) => {
    let article = req.article
    article.title = req.body.title
    article.description = req.body.description
    article.markdown = req.body.markdown
    article.author = { id: req.user.id, username: req.user.username, slug: req.user.slug }
  
    try {
      article = await article.save()
      req.flash('success_msg', 'Article Saved!')
      res.redirect(`/articles/${article.slug}`)
    } catch (e) {
      console.log(e)
      res.render(`articles/${path}`, { article: article })
    }
  }
}

module.exports = router