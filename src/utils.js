const http = require('http')
const https = require('https')
const { Image } = require('canvas')
const baseTilePath = 'tiles'
function arrayBufferToImage(data, callback) {
  const img = new Image();
  img.src = data;
  img.onload = () => {
    callback(null, img);
  };
  img.onerror = () => callback(new Error("Could not load image. Please make sure to use a supported image type such as PNG or JPEG. Note that SVGs are not supported."));
  img.src = data;
}
var getImage = (requestParameters, callback, transformResponse) => {
  const optionFunc = (err, imgData) => {
    if (err) {
      callback(err);
    } else if (imgData) {
      const imageBitmapSupported = typeof createImageBitmap === "function";
      const transformImgData = transformResponse ? transformResponse(imgData) : imgData;
      if (imageBitmapSupported) {
        arrayBufferToImageBitmap(transformImgData, callback);
      } else {
        arrayBufferToImage(transformImgData, callback);
      }
    }
  };
  return getArrayBuffer(requestParameters, optionFunc);
};
var getArrayBuffer = (requestParameters, callback) => {
  return makeRequest(requestParameters, callback);
};
function makeRequest(requestParameters, callback) {
  const url = new URL(requestParameters.url)
  const req = url.protocol === 'https:' ? https : http
  const responsebody = []
  const res =  req.get(requestParameters.url, (response) => {
    response.on('data', (chunk) => {
      responsebody.push(chunk)
    })
    response.on('end', () => {
      let responsebodyBuffer = Buffer.concat(responsebody)
      callback(false, responsebodyBuffer)
    })
  }).on('error', (error) => {
    console.log(error)
    console.log(requestParameters.url)
    callback(error, null)
  })
  return res
}
module.exports = {
  getImage,
  baseTilePath,
  makeRequest
}