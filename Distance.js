function toRadians(val) {
  var PI = 3.1415926535;
  return (val / 180.0) * PI;
}

function findDistance(l1, l2) {
  const lat1 = l1.latitude;
  const lon1 = l1.longitude;

  const lat2 = l2.latitude;
  const lon2 = l2.longitude;
  var R = 6371e3; // R is earth’s radius

  var lat1radians = toRadians(lat1);
  var lat2radians = toRadians(lat2);

  var latRadians = toRadians(lat2 - lat1);
  var lonRadians = toRadians(lon2 - lon1);

  var a =
    Math.sin(latRadians / 2) * Math.sin(latRadians / 2) +
    Math.cos(lat1radians) *
      Math.cos(lat2radians) *
      Math.sin(lonRadians / 2) *
      Math.sin(lonRadians / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  var d = R * c;

  d = d / 1000;
  console.log(d);
  return d
}

module.exports = findDistance;
