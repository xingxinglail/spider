const mongoose = require('mongoose')

mongoose.Promise = Promise

const uri = 'mongodb://localhost:27017/huxiu'

mongoose.connect(uri, { useMongoClient: true })

const db = mongoose.connection

db.on('error', err => {
  console.error(err)
})

db.on('open', () => {
  console.log('mongodb connected')
})

module.exports = db

