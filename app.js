require('./mongoose')

const Crawl = require('./index')

switch (process.argv[2]) {
  case 'init':
    Crawl.initData().then(() => {
      console.log('数据初始化完毕,文章ID已添加到redis中！')
      process.exit(1)
    }).catch((e) => {
      console.log(e)
      process.exit(0)
    })
    break
  case 'crawl':
    Crawl.goCrawl(process.argv[3]).then(c => {
      console.log(c)
      console.log('done')
      process.exit(1)
    }).catch(e => {
      console.log(e)
      process.exit(0)
    })
    break
}

