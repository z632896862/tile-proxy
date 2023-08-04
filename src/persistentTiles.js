var md5 = require("crypto-js/md5");
const gaode = require('./gaode.js')
const baidu = require('./baidu.js')
// const hzcg = require('./hzcg.js')
const {
  getWgs84BoundByRCL,
  getRCLFromWgs84
} = require('./wgs84')
const {
  baseTilePath
} = require('./utils')
const TileServices = require('./clip')
var file = require("./file");
let promiseArr = []
const startTime = Date.now()
async function persistentTiles(bounds, url, type) {
  const md5Url = md5(url).toString()
  if (type === 'gcj02') {
    // 得到需要的tile行列号
    var level = [1, 18]
  }
  if (type === 'bd09') {
    // 得到需要的tile行列号
    var level = [3, 18]
  }
  if (type === 'hzcg') {
    // 得到需要的tile行列号
    var level = [7, 19]
  }
  for (var l = level[0]; l <= level[1]; l++) {
    if (type === 'gcj02') {
      var minRC = gaode.getGaodeRCLByWgs84LngLat(l, bounds.nw)
      var maxRC = gaode.getGaodeRCLByWgs84LngLat(l, bounds.se)
    }
    if (type === 'hzcg') {
      var minRC = getRCLFromWgs84(l, bounds.nw)
      var maxRC = getRCLFromWgs84(l, bounds.se)
    }
    if (type === 'bd09') {
      var minRC = baidu.getBaiduRCLByWgs84LngLat(l, bounds.sw)
      var maxRC = baidu.getBaiduRCLByWgs84LngLat(l, bounds.ne)
    }
    for (var y = minRC.y; y <= maxRC.y; y++) {
      for (var x = minRC.x; x <= maxRC.x; x++) {
        const tileService = new TileServices(url, {
          type,
          backupUrl: url
        })
        const {buffer} = await tileService.get84Tiles(x, y, l)
        file.createTile(x, y, l, baseTilePath, md5Url, buffer)
        // promiseArr.push(tileService.get84Tiles(x, y, l))
        // tileService.get84Tiles(x, y, l).then(buffer => {
        //   promiseArr.push(file.createTile(x, y, l, baseTilePath, md5Url, buffer))
        // })
      }
    }
  }
  console.log('done!!!')
    const time = (Date.now() - startTime) / 1000
    console.log(time)
  // Promise.all(promiseArr).then((res) => {
  //   // 切割
  //   // const ctx = this._canvas.getContext('2d')
  //   // this._canvas.width = this._tileSize
  //   // this._canvas.height = this._tileSize
  //   // promiseArr = []
  //   res.forEach(async ({x,y,z,buffer},index) => {
  //     // promiseArr.push(file.createTile(x, y, l, baseTilePath, md5Url, buffer, false))
  //     file.createTile(x, y, z, baseTilePath, md5Url, buffer)
  //   })
  //   // await Promise.all(promiseArr)
  //   console.log('done!!!')
  //   const time = (Date.now() - startTime) / 1000
  //   console.log(time)
  //   console.log(`the amount of tiles is ${res.length}`)
  // })
}

const bounds = {
  sw: {
    lat: 29,
    lng: 118.339420417,
  },
  ne: {
    lat: 31,
    lng: 120.725803952416
  },
  se: {
    lat: 29,
    lng: 120.725803952416
  },
  nw: {
    lat: 31,
    lng: 118.339420417
  }
}
const url = 'http://172.18.34.198:8000/E36CCEA93443D1495DB9B9F2B2FFE348CB1A367D75176F815040AB19E54CDCA5DAAA25813AF965E2ABD0CC2463DD1223/PBS/rest/services/hzsyvector_dark/Mapserver/tile/{z}/{y}/{x}'
const type = 'hzcg'
persistentTiles(bounds, url, type)