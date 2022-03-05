const mongoose = require('mongoose')
const slugify = require('slugify')

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: false }
},
  { collection: 'users' }
)

userSchema.pre('validate', function(next) {
  if (this.username) {
    this.slug = slugify(this.username, {
      lower: true,
      strict: true
    })
  }

  next()
})

module.exports = mongoose.model('User', userSchema)