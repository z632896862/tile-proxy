const resolutions = function () {
  var level = 19
  var res = [];
  res[0] = Math.pow(2, 18);
  for (var i = 1; i < level; i++) {
    res[i] = Math.pow(2, (18 - i))
  }
  return res;
}()
var gcoord = require('gcoord')
// const maxZoom = 21
// const firstPixelSize = 156543.03390625
// const tileSize = 256
// var proj4 = require('proj4')
// var gcoord = require('gcoord')
// for(i in maxZoom) {
//   rsolutions.push(firstPixelSize * Math.pow(0.5, i))
// } 
var TileLnglatTransform = require('tile-lnglat-transform');

function getWgs84BoundByRCL(X, Y, Z, type) {
  //   var pointX = X * tileSize
  //   var pointY = Y * tileSize
  //   var firstProjection = new proj4.Proj("EPSG:3857");
  //   var secondProjection = new proj4.Proj("EPSG:4326");
  //   var result = proj4.transform(firstProjection, secondProjection, [pointX, pointY]);
  //   const gcj02 = gcoord.transform([pointX,  pointY], gcoord.EPSG3857, gcoord.WGS84)
  let TileLnglatTrans
  let wgs84NW
  let wgs84SE
  let wgs84SW
  let wgs84NE
  switch (type) {
  case 'gcj02':
    TileLnglatTrans = TileLnglatTransform.TileLnglatTransformGaode;
    wgs84NW = TileLnglatTrans.pixelToLnglat(0, 0, X, Y, Z)
    wgs84SE = TileLnglatTrans.pixelToLnglat(0, 0, X + 1, Y + 1, Z)
    arrNW = gcoord.transform([wgs84NW.lng, wgs84SE.lat], gcoord.WGS84, gcoord.GCJ02)
    arrSE = gcoord.transform([wgs84NW.lng, wgs84SE.lat], gcoord.WGS84, gcoord.GCJ02)
    gcj02NW = {
      lng: arrNW[0],
      lat: arrNW[1]
    }
    gcj024SE = {
      lng: arrSE[0],
      lat: arrSE[1]
    }
    return {
      sw: wgs84SW,
      ne: wgs84NE,
      nw: gcj02NW,
      se: gcj024SE
    }
    break
  case 'bd09':
    const lngLatSW = gcoord.transform([resolutions[Z] * X * 256, resolutions[Z] * Y * 256], gcoord.BD09MC, gcoord.WGS84)
    const lngLatNE = gcoord.transform([resolutions[Z] * (X * 256 + 256), resolutions[Z] * (Y * 256 + 256)], gcoord.BD09MC, gcoord.WGS84)

    wgs84SW = {
      lng: lngLatSW[0],
      lat: lngLatSW[1]
    }
    wgs84NE = {
      lng: lngLatNE[0],
      lat: lngLatNE[1]
    }
    wgs84SE = {
      lng: wgs84NE.lng,
      lat: wgs84SW.lat
    }
    wgs84NW = {
      lng: wgs84SW.lng,
      lat: wgs84NE.lat
    }
  default:
    TileLnglatTrans = TileLnglatTransform.TileLnglatTransformGoogle;
    wgs84NW = TileLnglatTrans.pixelToLnglat(0, 0, X, Y, Z)
    wgs84SE = TileLnglatTrans.pixelToLnglat(0, 0, X + 1, Y + 1, Z)
    wgs84SW = {
      lng: wgs84NW.lng,
      lat: wgs84SE.lat
    }
    wgs84NE = {
      lng: wgs84SE.lng,
      lat: wgs84NW.lat
    }
  }

  return {
    sw: wgs84SW,
    ne: wgs84NE,
    nw: wgs84NW,
    se: wgs84SE
  }
}

function getRCLFromWgs84(level, lnglat) {
  const {
    tileX,
    tileY
  } = TileLnglatTransform.TileLnglatTransformGoogle.lnglatToTile(lnglat.lng, lnglat.lat, level)
  return {
    x:tileX,
    y:tileY
  }
}
module.exports = {
  getWgs84BoundByRCL,
  getRCLFromWgs84
}