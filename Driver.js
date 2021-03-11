const findDistance = require("./Distance");
const quick_Sort = require("./QuickSort");

let DRIVERS = [];
let USERS = [];

const addDriver = ({ name, id, city, vehicle, location }) => {
  name = name.trim().toLowerCase();
  city = city.trim().toLowerCase();
  const driver = { name, city, vehicle, location, id };
  DRIVERS.push(driver);
  console.log(DRIVERS);

  return { driver };
};
const addUser = ({ name, id, city, location }) => {
  name = name.trim().toLowerCase();
  city = city.trim().toLowerCase();
  const user = { name, city, location, id };

  USERS.push(user);
};
const removeDriver = (id) => {
  const mydriver =  DRIVERS.filter((e) => e.id === id);
  DRIVERS = DRIVERS.filter((e) => e.id !== id);
  return mydriver;
};

const filterByCity = (city) => {
  console.log(city)
  return DRIVERS.filter((e) => {
    return e.city.toLowerCase() === city.toLowerCase()
  });
};
const getAllDriver = ()=>{
  return DRIVERS
}
const findNearestDriver=(coordinates,city)=>{
  console.log(coordinates)
  const distanceArray=[]
  filterByCity(city).forEach((e,i)=>{
   distanceArray.push({distance:findDistance(e.location,coordinates),driver:e})
  
 })
  console.log(distanceArray)
  const nearDrivers = quick_Sort(distanceArray)
  return nearDrivers
}


module.exports = { DRIVERS, addDriver, addUser, removeDriver, filterByCity,getAllDriver,findNearestDriver };
