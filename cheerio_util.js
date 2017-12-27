const axios = require('axios')
const cheerio = require('cheerio')
const Tag = require('./tag_class')
const jieba = require('nodejieba')

;(async () => {
  await crawl(10259)
})().then().catch(e => {
  console.log(e)
})

async function crawl (id) {
  const res = await axios.get(`https://www.huxiu.com/article/${id}.html`)
  console.log(`正在爬取id${id}的文章...`)
  const $ = cheerio.load(res.data)
  if ($('#page_404').length > 0) {
    return {
      http_status: 404,
      article_id: id
    }
  }

  let content = $('.article-section-wrap').find('.article-wrap')
  if ($('.article-section-wrap').length === 0) {
    content = $('#modal_report').find('.article-wrap')
  }

  const tags = [] // 文章标签

  const title = content.children('h1.t-h1').text().trim() // 文章标题

  const titleTags = jieba.extract(title, 5)

  for (let i = 0; i < titleTags.length; i++) {
    tags.push(new Tag('TITLE_TAG', titleTags[i].word, titleTags[i].weight))
  }

  const authorDom = content.children('.article-author')
  const authorName = authorDom.children('span.author-name').text().trim() // 作者姓名

  const href = authorDom.children('span.author-name').children('a').attr('href') // 作者ID
  let authorId = href
  if (/\d/g.test(authorId)) {
    authorId = href.match(/\d+/g)[0]
  }
  let createTime = authorDom.find('span.article-time').text().trim() // 发表时间
  createTime = new Date(createTime).getTime()
  const classifyAdom = authorDom.find('a.column-link')
  if (classifyAdom.length > 0) { // 文章分类
    classifyAdom.map((index, el) => {
      tags.push(new Tag('ARTICLE_CLASSIFY', $(el).text().trim()), 1)
    })
  }

  const articleContent = []
  articleContent.push(content.children('.article-img-box').children('img').attr('src')) // 文章头图
  content.children('.article-content-wrap').find('p, img').map((index, el) => {
    if ($(el).text().trim()) {
      articleContent.push($(el).text().trim())
    }
    if (el.name === 'img') {
      articleContent.push($(el).attr('src'))
    }
  })

  return {
    http_status: 200,
    article_id: id,
    crawl_time: Date.now(),
    title,
    create_time: createTime,
    tags,
    author_name: authorName,
    author_id: authorId,
    content: articleContent
  }
}

// 根据id爬取
async function runCrawl (ids) {
  const dataList = []
  for (let i = 0;i < ids.length; i++) {
    const data = await crawl(ids[i])
    await new Promise((rsv) => { // 1秒抓一次
      setTimeout(rsv, 1000)
    })
    dataList.push(data)
  }
  return dataList
}

module.exports = runCrawl
