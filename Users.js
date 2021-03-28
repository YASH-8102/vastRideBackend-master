let USERS = {};



const addUser = ({uid,socketId,userType})=>{
    const newUser = {uid,socketId,tasks:[],userType,connectedSocketId:null};
    USERS[uid]=newUser;
    return newUser;
}
const removeUser = (uid)=>{
	return delete USERS[uid];
	
}
const addStack = ({uid,task})=>{
    const dummy =  USERS[uid]
    dummy.tasks.push(task)
    USERS[uid]= dummy
    return USERS[uid]
}
const getTaskStack = (uid)=>{

	return USERS[uid].tasks?USERS[uis].tasks:[];
}

const findUserByUid = (uid)=>{
    return USERS[uid]
}

const filterUserBySocketId = (filterValue) => 
   Object.keys(USERS).reduce((acc, val) => 
   (USERS[val]["socketId"] !== filterValue ? acc : {
       ...acc,
       uid:USERS[val]["uid"]
   }                                        
), {});

const isUserExist = (uid)=>{
	return USERS.hasOwnProperty(uid)
}

const reconnectUser = ({uid,newSocketId})=>{
    const dummy ={...USERS[uid]};
    dummy.socketId = newSocketId;
    USERS[uid] = dummy
		return USERS[uid]
}

const emptyTaskStack = (uid)=>{
   
    USERS[uid].tasks = []
}

const connectUserToUser = ({uid,connectedSocketId})=>{
	 const dummy ={...USERS[uid]};
    dummy.connectedSocketId = connectedSocketId;
    USERS[uid] =dummy;
		return USERS[uid]
}

const isUserConnectedToUser = (uid)=>{
	const user = findUserByUid(uid)
	if(user){
	return user.connectedSocketId!==null?true:false;
	}
	

}

module.exports = {USERS,addUser,emptyTaskStack,reconnectUser,findUserByUid,addStack,isUserExist,connectUserToUser,getTaskStack,isUserConnectedToUser,filterUserBySocketId,removeUser}