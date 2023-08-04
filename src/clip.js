const gaode = require('./gaode.js')
const baidu = require('./baidu.js')
const hzcg = require('./hzcg.js')
const {
  createCanvas
} = require('canvas')
const Tile = require('./tile')
const {
  merge
} = require('lodash')
const {
  getWgs84BoundByRCL
} = require('./wgs84')

class TileServices {
  constructor(url, options = {}) {
    this._url = url
    this._options = merge({}, options)
    this._tileSize = 256
    this._canvas = createCanvas(this._tileSize, this._tileSize)
  }
  get84Tiles(x, y, z, fromCrs='wgs84') {
    if (Number.isNaN(x) || Number.isNaN(y) || Number.isNaN(z)) {
      return
    }
    const wgs84Bounds = getWgs84BoundByRCL(Number(x), Number(y), Number(z), fromCrs)
    // 得到wgs84坐标
    if (this._options.type === 'gcj02') {
      // 得到需要的tile行列号
      var level = z
      var minRC = gaode.getGaodeRCLByWgs84LngLat(level, wgs84Bounds.nw)
      var maxRC = gaode.getGaodeRCLByWgs84LngLat(level, wgs84Bounds.se)
      var getPos = (options) => {
        const {
          x,
          y,
          startX,
          startY,
          minPosX,
          minPosY,
          tileSize,
          scale
        } = options
        return {
          x: [(x - startX) * tileSize - minPosX] * scale[0],
          y: [(y - startY) * tileSize - minPosY] * scale[1]
        }
      }
      var realTileSizeX = this._tileSize - minRC.pixelX + maxRC.pixelX + (maxRC.x - minRC.x - 1) * this._tileSize
      var realTileSizeY = this._tileSize - minRC.pixelY + maxRC.pixelY + (maxRC.y - minRC.y - 1) * this._tileSize
      this._scale = [this._tileSize / realTileSizeX, this._tileSize / realTileSizeY]
    }
    if (this._options.type === 'hzcg') {
      // 得到需要的tile行列号
      var level = z - 7
      const wgs84Bounds = getWgs84BoundByRCL(Number(x), Number(y), Number(z), this._options.type)
      var minRC = hzcg.getHzRCLByWgs84LngLat(level, wgs84Bounds.nw)
      var maxRC = hzcg.getHzRCLByWgs84LngLat(level, wgs84Bounds.se)
      var getPos = (options) => {
        const {
          x,
          y,
          startX,
          startY,
          minPosX,
          minPosY,
          tileSize,
          scale
        } = options
        return {
          x: [(x - startX) * tileSize - minPosX] * scale[0],
          y: [(y - startY) * tileSize - minPosY] * scale[1]
        }
      }
      var realTileSizeX = this._tileSize - minRC.pixelX + maxRC.pixelX + (maxRC.x - minRC.x - 1) * this._tileSize
      var realTileSizeY = this._tileSize - minRC.pixelY + maxRC.pixelY + (maxRC.y - minRC.y - 1) * this._tileSize
      this._scale = [this._tileSize / realTileSizeX, this._tileSize / realTileSizeY]
    }
    if (this._options.type === 'bd09') {
      // 得到需要的tile行列号
      var level = Number(z)
      var minRC = baidu.getBaiduRCLByWgs84LngLat(level, wgs84Bounds.sw)
      var maxRC = baidu.getBaiduRCLByWgs84LngLat(level, wgs84Bounds.ne)

      var getPos = (options) => {
        const {
          x,
          y,
          startX,
          endY,
          minPosX,
          maxPosY,
          tileSize,
          scale
        } = options
        // 和最小的相同
        let X = (tileSize * (x - startX) - minPosX) * scale[0]
        let Y = (maxPosY + (tileSize * (endY - y - 1))) * scale[1]
        // img.height =50
        // if ((x-startX) === 0) {
        //   X =  - minPosX * scale[0]
        // } else {
        //   X = (realTileSizeX - maxPosX) * scale[0]
        // }
        // if ((y - startY) === 0) {
        //   Y =  (realTileSizeY - tileSize + minPosY) * scale[1]
        // } else {
        //   Y = (maxPosY - tileSize) * scale[1]
        // }
        return {
          x: X,
          y: Y
        }
      }
      var tolerance = 3
      var realTileSizeX = this._tileSize - minRC.pixelX + maxRC.pixelX + (maxRC.x - minRC.x - 1) * this._tileSize
      var realTileSizeY = this._tileSize - minRC.pixelY + maxRC.pixelY + (maxRC.y - minRC.y - 1) * this._tileSize
      if (realTileSizeX > this._tileSize - tolerance && realTileSizeX < this._tileSize + tolerance) {
        realTileSizeX = this._tileSize
      }
      if (realTileSizeY > this._tileSize - tolerance && realTileSizeY < this._tileSize + tolerance) {
        realTileSizeY = this._tileSize
      }
      this._scale = [this._tileSize / realTileSizeX, this._tileSize / realTileSizeY]

    }
    return new Promise((resolve, reject) => {
      const promiseArr = []
      for (var y = minRC.y; y <= maxRC.y; y++) {
        for (var x = minRC.x; x <= maxRC.x; x++) {
          const tile = new Tile({
            z: level,
            x: x,
            y: y,
            startX: minRC.x,
            startY: minRC.y,
            endX: maxRC.x,
            endY: maxRC.y,
            minPosX: minRC.pixelX,
            minPosY: minRC.pixelY,
            maxPosX: maxRC.pixelX,
            maxPosY: maxRC.pixelY,
            layer: this,
            scale: this._scale,
            tileSize: this._tileSize,
            realTileSizeX,
            realTileSizeY,
            getPos
          })
          promiseArr.push(tile._load())
        }
      }
      Promise.all(promiseArr).then(res => {
        // 切割
        // const ctx = this._canvas.getContext('2d')
        // this._canvas.width = this._tileSize
        // this._canvas.height = this._tileSize
        this._canvas.toBuffer((err, buffer) => {
          resolve({
            buffer,
            x,
            y,
            z
          })
        }, "image/png")
      })
    })
  }
}
module.exports = TileServices