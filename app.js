require('./mongoose')

const goCrawl = require('./index')

switch (process.argv[2]) {
  case 'crawl':
    goCrawl(process.argv[3]).then(c => {
      console.log(c)
      console.log('done')
      process.exit(1)
    }).catch(e => {
      console.log(e)
      process.exit(0)
    })
    break
}

