const http = require('http')
const TileServices = require('./clip')
const querystring = require("querystring");
const url = require("url");
var md5 = require("crypto-js/md5");
const server = http.createServer()
var file = require("./file");
const persistent = false
const {
  baseTilePath
} = require('./utils')
//创建索引
file.createIndex(baseTilePath)
// const fs = require('fs')
// const formidable = require('formidable')
// let path = ''
// if (process.env.NODE_ENV === 'production') {
//   path = 'config.json'
// } else {
//   path = 'src/config/config.json'
// }
// let buffer = fs.readFileSync(path)
// let {
//   port,
//   proxyHost,
//   proxyPort,
//   replacePath
// } = JSON.parse(buffer)
server.on('request', (req, res) => {
  try {
    var urlObj = url.parse(req.url);
    var query = urlObj.query;
    var queryObj = querystring.parse(query);
    const {
      x,
      y,
      z,
      type,
      fromCrs,
      serverUrl
    } = queryObj
    const md5Url = md5(serverUrl).toString()
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Content-Type', 'image/png')
    const tileIndex = file.checkIndex(x, y, z, md5Url)
    if (tileIndex) {
      file.readTile(tileIndex).then(buffer => {
        res.write(buffer, 'binary')
        // 使用end方法将请求发出去
        res.end()
      })
    } else {
      const tileService = new TileServices(serverUrl, {
        type
      })
      tileService.get84Tiles(x, y, z, fromCrs).then(({buffer}) => {
        if (persistent) {
          file.createTile(x, y, z, baseTilePath, md5Url, buffer)
        }
        res.write(buffer, 'binary')
        // 使用end方法将请求发出去
        res.end()
      })
    }
  } catch (error) {
    console.log(error)
    res.end(error.message)
  }
})
const port = 1234
server.listen(port, () => {
  console.log('tile-proxy service running on port ' + port)
})