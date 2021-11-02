const users=[]
// addUser, removeUser, getUser, getUsersinRoom

const addUser= ({id,username,room})=>{
    //Clean the data
    username= username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate the data
    if(!username || !room){
        return {
            error: "A username and room is required"
        }
    }

    //Check for any existing user
    const existingUser= users.find((user)=>{
        return user.room === room && user.username === username
    })

    if(existingUser){
        return {
            error:"Username is already in use"
        }
    }

    //Store the user
    const user={id,username,room}
    users.push(user)
    return { user }
}

const removeUser= (id)=>{
    const index= users.findIndex((user)=> user.id===id)

    if(index!==-1){
        return users.splice(index,1)[0]
    }
}

//getUser- accepts id and return it

const getUser= (id)=>{
    const user= users.find((user)=>{
        return user.id===id
    })
    if(!user){
        return {error: "No user found"}
    }
    return user
}

const getUsersinRoom = (room)=>{
    const usersInRoom = users.filter((user)=> user.room===room.toLowerCase())
    return usersInRoom
}

module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersinRoom
}