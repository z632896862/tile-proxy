var {makeRequest} = require('../utils')
var {encode} = require('./encode')
var { VectorTile } = require('@mapbox/vector-tile')
var Protobuf = require('pbf')
var testUrl = 'https://ganos.oss-cn-hangzhou.aliyuncs.com/m2/rs_l7/3/7/2.pbf'
var url = 'https://maponline2.bdimg.com/pvd/?qt=vtile&param='
var tileInfo = 'x=396&y=147&z=12&styles=pl&textimg=0&v=088&udt=20230427&json=0'
makeRequest({
  url: testUrl
}, (err, buffer) => {
  if (!err) {
    const pbf = new Protobuf(buffer)
    const vectorTile = new VectorTile(pbf)
    const layer = vectorTile.layers.ecoregions2
    for (let i = 0; i < layer.length; i++) {
      const vectorTileFeature = layer.feature(i);
      const feature = vectorTileFeature.toGeoJSON(7, 2, 3);
  
      console.log(feature)
    }

  }       
})