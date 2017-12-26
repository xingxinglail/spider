require('./mongoose')

const redis = require('./redis')

const { ARTICLE_IDS_KEY } = require('./config')

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
    loop(process.argv[3]).then(c => {
      console.log(c)
      process.exit(1)
    }).catch(e => {
      console.log(e)
      process.exit(0)
    })
    break
}

async function loop (num) {
  const scard = await redis.scard(ARTICLE_IDS_KEY)
  while (scard > 0) {
    await Crawl.goCrawl(num).then(c => {
      console.log(c)
    })
  }
  return 'done'
}
