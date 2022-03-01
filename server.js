const express = require('express')
const mongoose = require('mongoose')
const Article = require('./models/article')
const methodOverride = require('method-override')
const articleRouter = require('./routes/articles')
const app = express()
require('dotenv').config()

//Create a .env file with a MONGO_URI specified.
//MONGO_URI=____________
mongoose.connect(process.env.MONGO_URI)

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))

app.get('/', async ( req, res ) => {
  const articles = await Article.find().sort({ createdAt: 'desc' })
  res.render('articles/index', { articles: articles })
})

app.get('/search', async ( req, res ) => {
  if (!req.query.query) {
    return res.redirect('/')
  }

  const query = req.query.query.replace(/\s+/g,' ').trim()
  
  try {
    const articles = await Article.find({ title: { $regex: query, $options: 'i' } })
    
    res.render('articles/search', { query: query, articles: articles })
  } catch (e) {
    console.log(e)
    res.redirect('/')
  }
})

app.use('/articles', articleRouter)

app.listen(process.env.PORT || 5000)