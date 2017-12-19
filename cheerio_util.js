const axios = require('axios')
const cheerio = require('cheerio')

async function crawl (id) {
  try {
    const res = await axios.get(`https://voice.hupu.com/nba/${id}.html`)
    console.log(`正在爬取id${id}的文章...`)
    const $ = cheerio.load(res.data)
    const title = $('head').children('title').text().split('_')[0]
    const voiceMainDom = $('.voice-main')

    if (voiceMainDom.children('.artical-content-generalDynamic').length === 0 && voiceMainDom.children('div.artical-content').length === 0) {
      throw new Error('未知错误')
    }

    const createTime = new Date($('#pubtime_baidu').text().trim()).valueOf() // 发表时间
    const source = $('#source_baidu').children().text().trim() // 来源
    const editor = $('#editor_baidu').text().split('：')[1].replace(')', '') // 编辑
    let tag = '' // 标签
    let writer_name = '' // 作家姓名
    let writer_company = '' // 作家公司
    let writer_avatar_url = '' // 作家头像url
    const content = []
    if (voiceMainDom.children('.artical-content-generalDynamic').length === 1) { // 针对老版本作家
      tag = '作家'
      const avatarImg = voiceMainDom.children('.artical-content-generalDynamic').find('dd.avatar').find('img')
      writer_name = avatarImg.attr('alt')
      writer_avatar_url = avatarImg.attr('src')
      writer_company = voiceMainDom.children('.artical-content-generalDynamic').find('span.aboutInfo').text()
      const dtDom = voiceMainDom.children('.artical-content-generalDynamic').find('dt.dynamic-content')
      dtDom.find('div, img, p').map((i, obj) => {
        if ($(obj).text()) {
          content.push($(obj).text().trim())
        }
        if (obj.name === 'img') {
          content.push($(obj).attr('src'))
        }
      })
    } else {
      const articalContentDom = voiceMainDom.children('div.artical-content')
      articalContentDom.find('div > img, p, span').map((i, obj) => {
        if ($(obj).text()) {
          content.push($(obj).text().trim())
        }
        if (obj.name === 'img') {
          content.push($(obj).attr('src'))
        }
      })
    }

    return {
      articleId: id,
      crawlTime: Date.now(),
      title,
      createTime,
      source,
      editor,
      tag,
      writer_name,
      writer_company,
      writer_avatar_url,
      content
    }
  } catch (e) {
    return {
      articleId: id,
      status: e.response ? e.response.status : '0000'
    }
    // throw e
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
