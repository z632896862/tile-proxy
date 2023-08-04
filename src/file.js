var fs = require("fs");
const tileIndex = {}

function mkdirSync(dir, cb) {
  let paths = dir.split('/');
  let index = 1;

  function next(index) {
    //递归结束判断
    if (index > paths.length) return cb();
    let newPath = paths.slice(0, index).join('/');
    fs.access(newPath, function (err) {
      if (err) { //如果文件不存在，就创建这个文件
        fs.mkdir(newPath, function (err) {
          next(index + 1);
        });
      } else {
        //如果这个文件已经存在，就进入下一个循环
        next(index + 1);
      }
    })
  }
  next(index);
}

function createTile(x, y, z, baseTilePath, url, buffer, sync = true) {
  return new Promise((resolve) => {
    const dir = `./${baseTilePath}/${url}/${z}/${x}`
    newIndex(x, y, z, baseTilePath)
    mkdirSync(dir, () => {
      if (sync) {
        fs.writeFile(`${dir}/${y}.png`, buffer, (error) => {
          if (error) {
            console.log(error)
          } 
          resolve()
        })
      } else {
        fs.writeFileSync(`${dir}/${y}.png`, buffer)
        resolve()
      }
    })
  })

}

function newIndex(x, y, z, baseTilePath, url) {
  tileIndex[`${url}${z}${x}${y}`] = baseTilePath + '/' + url + '/' + z + '/' + x + '/' + y + '.png'
}

// function createIndex(lastdir, dir, index = tileIndex) {
//   const path = lastdir + '/' + dir
//   fs.readdir(path, function (err, files) {
//     if (err) {
//       console.log('Error', err);
//     } else {
//       index[dir] = {}
//       files.forEach(f => {
//         const newPath = path + '/' + f
//         if (fs.lstatSync(newPath).isDirectory()) {
//           createIndex(path, f, index[dir])
//         } else {
//           const fileName = f.split('.')[0]
//           index[dir][fileName] = newPath
//         }
//       })
//     }
//   })
// }

function createIndex(baseTilePath, index = tileIndex) {
  fs.readdir(baseTilePath, function (err, urlfiles) {
    if (err) {
      console.log('Error', err);
    } else {
      // url文件夹
      urlfiles.forEach(url => {
        const urlPath = baseTilePath + '/' + url
        fs.readdir(urlPath, function (err, zfiles) {
          if (err) {
            console.log('Error', err);
          } else {
            // z文件夹
            zfiles.forEach(z => {
              const zPath = urlPath + '/' + z
              fs.readdir(zPath, function (err, xfiles) {
                if (err) {
                  console.log('Error', err);
                } else {
                  // x文件夹
                  xfiles.forEach(x => {
                    const xPath = zPath + '/' + x
                    fs.readdir(xPath, function (err, yfiles) {
                      if (err) {
                        console.log('Error', err);
                      } else {
                        // y文件
                        yfiles.forEach(y => {
                          const fileName = y.split('.')[0]
                          index[`${url}${z}${x}${fileName}`] = xPath + '/' + y
                        })
                      }
                    })
                  })
                }
              })
            })
          }
        })
      })

    }
  })
}

function checkIndex(x, y, z, url) {
  try {
    const path = tileIndex[`${url}${z}${x}${y}`]
    return path
  } catch (err) {
    return false
  }
}

function readTile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'binary', (error, data) => {
      if (error) {
        reject(error)
      } else {
        resolve(data)
      }
    })
  })

}

module.exports = {
  createTile,
  createIndex,
  checkIndex,
  readTile
}