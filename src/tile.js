const {
  getImage
} = require('./utils')
const {
  getCache
} = require('./cache')
const caches = getCache()
class TileConstructor {
  constructor(options = {}) {
    this._options = options
    const {
      z,
      x,
      y,
      layer,
      scale,
      getPos
    } = options
    this._layer = layer
    this._z = z
    this._y = y
    this._x = x
    this._scale = scale
    this._type = layer._options.type
    this._ctx = layer._canvas.getContext('2d')
    this._url = layer._url
    this._backupUrl = layer._options.backupUrl
    this._headers = layer._options.headers || {}
    this.loaded = false
    this._getPos = getPos
  }
  _getKey() {
    return this._url + '/' + this._z + '/' + this._x + "/" + this._y
  }
  _load() {
    const serverCount = 3
    const s = Math.abs(this._x + this._y) % serverCount + 1
    const url = this._url && this._url.replace("{x}", this._x).replace("{y}", this._y).replace("{z}", this._z).replace("{s}", s)
    const backupUrl = this._backupUrl && this._backupUrl.replace("{x}", this._x).replace("{y}", this._y).replace("{z}", this._z).replace("{s}", s)
    return new Promise((resolve) => {
      // 缓存
      const key = this._getKey()
      const cache = caches.get(key)
      if (cache) {
        this._requestCB(cache)
        resolve({success: true})
      } else {
        this.request = getImage({
          url,
          headers: this._headers
        }, (_err, img) => {
          if (_err) {
            if (backupUrl) {
              delete this.request
              this.request = getImage({
                url: backupUrl,
                headers: this._headers
              }, (_backupErr, backupImg) => {
                if (_backupErr) {
                  resolve({success: false, message: _backupErr})
                  return
                }
                if (backupImg) {
                  this._requestCB(backupImg)
                  resolve({success: true})
                }
              })
              this.request.cancel = () => {
                this.request.abort()
              }
              this.request.cancel = () => {
                this.request.abort()
              }
              this.request.on('timeout', () => {
                this.request.abort(); // Abort the request if it times out
              });
              this.request.setTimeout(5000)
            } else {
              resolve({success: true, message: _err})
            }
          } else {
            this._requestCB(img)
            resolve({success: true})
          }
        })
        this.request.cancel = () => {
          this.request.abort()
        }
        this.request.on('timeout', () => {
          this.request.abort(); // Abort the request if it times out
          resolve({success: true, message: 'timeout'})
        });
        this.request.setTimeout(5000)
      }

    })
  }
  _requestCB(img) {
    delete this.request
    if (this._ctx) {
      const ctx = this._ctx
      ctx.imageSmoothingEnabled = false;
      // ctx.imageRendering = 'crisp-edges';
      // ctx.scale(this._scale[0], this._scale[1])
      const position = this._getPos(this._options)
      ctx.drawImage(img, 0, 0, this._layer._tileSize, this._layer._tileSize, position.x, position.y, this._layer._tileSize * this._scale[0], this._layer._tileSize * this._scale[1])
      caches.put(this._getKey(), img)
      this.loaded = true
    }
  }
}

module.exports = TileConstructor