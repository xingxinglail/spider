const redis = require('./redis')

const mongoose = require('mongoose')

const runCrawl = require('./cheerio_util')

const { ARTICLE_IDS_KEY, STARID, ENDID, CRAWL_COUNT } = require('./config')

const { Schema } = mongoose

const articleSchema = new Schema({
  articleId: { // 文章id
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  crawlTime: { // 抓取时间
    type: Date
  },
  title: { // 文章标题
    type: String
  },
  createTime: { // 文章创建时间
    type: Date
  },
  source: { // 来源
    type: String
  },
  editor: { // 编辑
    type: String
  },
  tag: { // 标签
    type: String
  },
  writer_name: { // 作者姓名
    type: String
  },
  writer_company: { // 作者公司
    type: String
  },
  writer_avatar_url: { // 作者头像url
    type: String
  },
  content: { // 文章内容
    type: Array
  }
})

const articleModel = mongoose.model('article', articleSchema)

// 写入或更新抓取的文章
async function insetOrUpdateArticle (articleId, articleObj) {
  articleId = Number(articleId)
  const findArticle = await articleModel.findOne({articleId})
  let article = null
  if (findArticle) {
    article = await articleModel.update({articleId}, articleObj)
  } else {
    article = await articleModel.create(articleObj)
  }
  return article
}

// redis中设置要抓取的id 返回ids LIST
async function initData () {
  const len = await redis.scard(ARTICLE_IDS_KEY)
  if (len === 0) {
    const ids = new Array(10000)
    let count = 0
    for (let i = STARID; i <= ENDID ; i++) {
      ids[count] = i
      count += 1
      if (count === 10000 || i === ENDID) {
        count = 0
        await redis.sadd(ARTICLE_IDS_KEY, ...ids)
      }
    }
  }
}

// 取出要抓取的数据
async function getDataList (count) {
  return await redis.spop(ARTICLE_IDS_KEY, count)
}

// 开始抓取
async function goCrawl (num) {
  if (!num) {
    num = CRAWL_COUNT
  } else if (num === 'all') {
    num = await redis.scard(ARTICLE_IDS_KEY)
  }

  const dataList = await runCrawl(await getDataList(num)) // 抓取，通过cheerio处理

  let articles = []
  for (let i = 0; i < dataList.length; i++) {
    if (dataList[i].status) {
      articles.push(dataList[i])
    } else {
      const article = await insetOrUpdateArticle(dataList[i].articleId, dataList[i]) // 写入或更新数据库
      articles.push(article)
    }
  }
  return articles
}

module.exports = {
  initData,
  goCrawl,
}