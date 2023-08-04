function getCache() {
  return {
    data: {},
    get: function (key) {
      return this.data[key]
    },
    put: function (key, value) {
      this.data[key] = value
    },
    clear: function () {
      this.data = {}
    }
  }
}
module.exports = {
  getCache
}