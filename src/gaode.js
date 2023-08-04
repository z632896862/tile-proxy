var TileLnglatTransform = require('tile-lnglat-transform');
var TileLnglatTransformGaode = TileLnglatTransform.TileLnglatTransformGaode;
var gcoord = require('gcoord')
/**
     * 通过高德的行列号得到这个百度切片对应的wgs84的坐标范围
     * @param {any} R
     * @param {any} C
     * @param {any} L
     */
function getWgs84BoundByGaodeRCL(X, Y, Z) {
  var wgs84NW = TileLnglatTransformGaode.pixelToLnglat(0, 0, X, Y, Z)
  var wgs84SE = TileLnglatTransformGaode.pixelToLnglat(0, 0, X + 1, Y + 1, Z)
  var wgs84SW = [wgs84NW.lng, wgs84SE.lat]
  var wgs84NE = [wgs84SE.lng, wgs84NW.lat]
  return {
    sw: {
      lng: wgs84SW[0],
      lat: wgs84SW[1]
    },
    ne: {
      lng: wgs84NE[0],
      lat: wgs84NE[1]
    }
  }
}

/**
 * 通过一个界别和wgs84的经纬度得到在gcj-02里面的行列号和lebel
 * @param {any} level
 * @param {any} wgs84p
 */
function getGaodeRCLByWgs84LngLat(level, wgs84p) {
  const gcj02 = gcoord.transform([wgs84p.lng,  wgs84p.lat], gcoord.WGS84, gcoord.GCJ02)
  const {
    tileX,
    tileY
  } = TileLnglatTransformGaode.lnglatToTile(gcj02[0], gcj02[1], level)
  const {
    pixelX,
    pixelY
  } = TileLnglatTransformGaode.lnglatToPixel(gcj02[0], gcj02[1], level)
  return {
    pixelX,
    pixelY,
    y: tileY,
    x: tileX,
    z: level
  }
}

module.exports = {
  getWgs84BoundByGaodeRCL,
  getGaodeRCLByWgs84LngLat
}