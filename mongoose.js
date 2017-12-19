const mongoose = require('mongoose')

const uri = 'mongodb://localhost:27017/what_i_love'

mongoose.connect(uri, { useMongoClient: true })

const db = mongoose.connection

db.on('error', err => {
  console.error(err)
})

db.on('open', () => {
  console.log('mongodb connected')
})

module.exports = db

