function eL(j0) {
  var jY = "";
  for (var T = 0; T < j0.length; T++) {
    var j1 = j0.charCodeAt(T) << 1;
    var e = j1.toString(2);
    var jX = e.length;
    var j4 = e;
    if (jX < 8) {
      j4 = "00000000" + e;
      j4 = j4.substr(e.length, 8)
    }
    jY += j4
  }
  var j2 = 5 - jY.length % 5;
  var jW = [];
  for (var T = 0; T < j2; T++) {
    jW[T] = "0"
  }
  jY = jW.join("") + jY;
  var j3 = [];
  for (var T = 0; T < jY.length / 5; T++) {
    var j1 = jY.substr(T * 5, 5);
    var jZ = parseInt(j1, 2) + 50;
    j3.push(String.fromCharCode(jZ))
  }
  return j3.join("") + j2.toString()
}

module.exports = {
  encode:eL
}