# 抓取虎扑NBA新闻

## Redis + Mongodb

```sh
mongod --port 27017 --dbpath [path]
```

```sh
npm i
```

```sh
1. node app.js init // 把要抓取文章id存入redis
2. node app.js crawl 10 // 10是抓取数量， 默认5条
```