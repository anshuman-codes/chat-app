const http=require('http')
const express= require('express')
const path= require('path')
const socketio= require('socket.io')
const Filter= require('bad-words')
const {generateMessage}= require('./utils/messages')
const {generateLocationMessage}= require('./utils/locMessage')
const {addUser,getUser,removeUser,getUsersinRoom}= require('./utils/users')

const publicDirectoryPath= path.join(__dirname,'../public')
// console.log(__dirname)

const app= express()
const server= http.createServer(app)
const port= process.env.PORT || 3000
const io= socketio(server)

app.set('view engine','html')
app.use(express.static(publicDirectoryPath))

let count=0

// This function will make the callback run
// whenever there is a connection request at 'io' server'

io.on('connection',(socket)=>{ // socket is an pobject which contains information about the connection

    
    // with broadcast the event is emiited to every connection execpt the one sending it

    socket.on('join',(username,room,callback)=>{
        const {error,user}= addUser({id: socket.id, username,room})

        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message',generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined the room`))

        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersinRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage',(msg,callback)=>{
        const user = getUser(socket.id)

        const filter= new Filter()
        if(filter.isProfane(msg)){
            return callback({error:'Profanity is not allowed'})
        }

        io.to(user.room).emit('message', generateMessage(user.username,msg))
        callback()
    })

    socket.on('disconnect',()=>{ // When a connection, disconnects
        const user= removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left`))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUsersinRoom(user.room)
            })
        }
    }) 

    socket.on('sendLocation',(loc,callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('LocationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${loc.lat},${loc.long}`))
        callback()
    })

    
}) 

app.get('',(req,res)=>{
    res.render('index')
})

server.listen(port,()=>{
    console.log("Server is listening on ,"+port)
})