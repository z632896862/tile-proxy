var TileLnglatTransform = require('tile-lnglat-transform');
var TileLnglatTransformBaidu = TileLnglatTransform.TileLnglatTransformBaidu;
var gcoord = require('gcoord')
const resolutions = function () {
  var level = 19
  var res = [];
  res[0] = Math.pow(2, 18);
  for (var i = 1; i < level; i++) {
    res[i] = Math.pow(2, (18 - i))
  }
  return res;
}()
/**
 * 通过一个界别和wgs84的经纬度得到在百度里面的行列号和lebel
 * @param {any} level
 * @param {any} wgs84p
 */
function getBaiduRCLByWgs84LngLat(level, wgs84p) {
  const bd09 = gcoord.transform([wgs84p.lng,  wgs84p.lat], gcoord.WGS84, gcoord.BD09)
  const point = gcoord.transform(bd09,  gcoord.WGS84 , gcoord.BD09MC)
  const tileX = Math.ceil(point[0] / 256 / resolutions[level])
  const pixelX = Math.round(point[0] / resolutions[level] % 256)
  const tileY = Math.ceil(point[1] / 256 / resolutions[level])
  const pixelY = Math.round(point[1] / resolutions[level] % 256)
  // const {
  //   tileX,
  //   tileY
  // } = TileLnglatTransformBaidu.lnglatToTile(bd09[0], bd09[1], level)
  // const {
  //   pixelX,
  //   pixelY
  // } = TileLnglatTransformBaidu.lnglatToPixel(bd09[0], bd09[1], level)
  return {
    pixelX,
    pixelY,
    y: tileY,
    x: tileX,
    z: level
  }
}
function getWgs84BoundByRCL(X, Y, Z) {
  var wgs84SW = TileLnglatTransformBaidu.pixelToLnglat(0, 0, X, Y, Z)
  var wgs84NE = TileLnglatTransformBaidu.pixelToLnglat(0, 0, X + 1, Y + 1, Z)
  var wgs84NW = {lng: wgs84SW.lng, lat: wgs84NE.lat}
  var wgs84SE = {lng: wgs84NE.lng, lat: wgs84SW.lat}
  return {
    sw: wgs84SW,
    ne: wgs84NE,
    nw: wgs84NW,
    se: wgs84SE
  }
}

module.exports = {
  getBaiduRCLByWgs84LngLat,
  getWgs84BoundByRCL
}