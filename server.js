const express = require('express')
const app = express()
const socketio = require('socket.io')
const port = process.env.PORT || 9000
const path = require('path')
const publicPath = path.join(__dirname, 'public')
let namespaces = require('./data/namespaces')
// console.log(namespaces[0])

//staticalyy serving public folder
app.use(express.static(publicPath))
//serving chat.html for all get requests
app.get('*', (req, res) => {
	res.sendFile(path.join(publicPath, 'chat.html'))
})
//creation of http server
const httpServer = app.listen(port)
//creating socket server
const io = socketio(httpServer, {
	path: '/socket.io',
	serveClient: true
	//what this is telling is that maket socket.io.js available at path /socket.io to client
})

//connection established
//this is a event listener it listens to connection
//emit this event
//this is joining a mainNameSpace
//io.on = io.of('/').on
io.on('connection', socket => {
	// console.log(socket.handshake)
	//Build an array to send back namespaces Info
	let nsData = namespaces.map(ns => {
		return {
			img: ns.img,
			endpoint: ns.endpoint
		}
	})
	// console.log(nsData)
	//send ns data back to the client. We need to use socket not io because we want it to go just to this socket
	//if we used io everybody connected to the mainNameSpace would get updated nsList everytime someone joins and that's not  what we want
	socket.emit('nsList', nsData)
})

//loop thorugh each nameSpace and listen for a connection
namespaces.forEach(namespace => {
	io.of(namespace.endpoint).on('connection', nsSocket => {
		const username = nsSocket.handshake.query.username
		console.log(`${nsSocket.id} has joined ${namespace.endpoint}`)
		//a socket has joined one of the nameSpaces
		//send the information of that particcular NameSpace
		nsSocket.emit('nsRoomLoad', namespace.rooms)
		//	console.log('rooms', namespace.rooms)
		nsSocket.on('joinRoom', async (roomName, numberofUsersCallBack) => {
			//whenever someone joins the room leave the previous room
			const roomTitle = Array.from(nsSocket.rooms)[1]
			//	console.log('Room to leave', roomTitle)
			//	console.log('before Leaving', nsSocket.rooms)
			if (roomTitle) {
				nsSocket.leave(roomTitle)
				//	console.log('after Leaving', nsSocket.rooms)
				//after leaving update the user Count
				updateUSerNumber(namespace.endpoint, roomTitle)
			}
			nsSocket.leave(roomTitle)
			//after leaving the room update the count of the room that has been left
			nsSocket.join(roomName)
			const nsRoom = namespace.rooms.find(item => item.roomTitle === roomName)
			//emit history everytime someone connects to a room

			nsSocket.emit('historyCatchUp', nsRoom.history)
			//send back the number of users in this room to all sockets connected to this room
			updateUSerNumber(namespace.endpoint, roomName)
		})
		nsSocket.on('newMessageToServer', msg => {
			const fullMsg = {
				text: msg.text,
				time: Date.now(),
				username,
				avatar: 'https://via.placeholder.com/30'
			}
			//send to all sockets in the room that this socket is connected to
			// when we join a room we provide a roomName on the event itself
			//for identifying which room this socket belongs to in the nameSpace we use socket.rooms to get the information
			//socket.rooms has two values the first value is the room it connected to upon connection and it always connects to a room on connection
			//the second value is the room we joined it to
			const roomTitle = Array.from(nsSocket.rooms)[1]
			//this is done for adding history
			//on New Mesage To Server Event
			//find the nameSpace we are in, in the nameSpace object
			//get the data of specific room in the namespace

			const nsRoom = namespace.rooms.find(item => item.roomTitle === roomTitle)
			//	console.log('This is currenlty the room we are on', nsRoom)
			nsRoom.addMessage(fullMsg)
			console.log('History has been added to', namespace.rooms)
			// console.log('History added', nsRoom)
			//console.log(roomTitle)
			//tara data will be erased as soon as our node server restarts
			io.of(namespace.endpoint)
				.to(roomTitle)
				.emit('messageToAllClients', fullMsg)
		})
	})
})
const updateUSerNumber = async (endpoint, roomName) => {
	try {
		const allSockets2 = await io.of(endpoint).in(roomName).allSockets()
		io.of(endpoint).in(roomName).emit('updateMembers', allSockets2.size)
	} catch (error) {
		console.log(error)
	}
}
