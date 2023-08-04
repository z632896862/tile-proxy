const proj = {
  resolutions: [
    0.00549933137239034, // Level 0
    0.00274966568619517, // Level 1
    0.00137483284309758, // Level 2
    0.000687416421548792, // Level 3
    0.000343708210774396, // Level 4
    0.000171854105387198,
    8.5927052693599e-5,
    4.29635263467995e-5,
    2.14817631733998e-5,
    1.07408815866999e-5,
    5.37044079334994e-6,
    2.68522039667497e-6,
    1.34261019833748e-6
  ],
  origin: [118.122911693886, 31.2869311022836],
  bounds: [[118.339420417, 20.1883223780912], [120.725803952416, 40.5653723350001]]
  // 这里可以有origin、transformation、scales、resulutions、bounds几个参数提供
  // 选择，其中scales与resolutions不能同时配置
}
const tileSize = 256
/**
     * 通过对应的行列号得到这个切片对应的的坐标范围
     * @param {any} R
     * @param {any} C
     * @param {any} L
     */
function getWgs84BoundByHzRCL(X, Y, Z) {
  const resolution = proj.resolutions[Z]
  return {
    nw: {
      lng: X * resolution * tileSize + proj.origin[0],
      lat: proj.origin[0] - Y * resolution * tileSize // 反转
    },
    se: {
      lng: (X + 1) * resolution * tileSize + proj.origin[0],
      lat:  proj.origin[0] - (Y + 1) * resolution * tileSize
    }
  }
}

/**
 * 通过一个界别和wgs84的经纬度得到在这个坐标系里面的行列号和lebel
 * @param {any} level
 * @param {any} wgs84p
 */
function getHzRCLByWgs84LngLat(level, wgs84p) {
  const _lnglat = {
    lng: wgs84p.lng - proj.origin[0],
    lat: proj.origin[1] - wgs84p.lat //y轴反转
  }
  const resolution = proj.resolutions[level]
  const tileX = Math.floor(_lnglat.lng / resolution / tileSize)
  const tileY =  Math.floor(_lnglat.lat / resolution / tileSize)
  const pixelX = Math.round(_lnglat.lng / resolution - tileX * tileSize)
  const pixelY = Math.round(_lnglat.lat / resolution - tileY * tileSize)
  return {
    pixelX,
    pixelY,
    y: tileY,
    x: tileX,
    z: level
  }
}

module.exports = {
  getHzRCLByWgs84LngLat,
  getWgs84BoundByHzRCL
}