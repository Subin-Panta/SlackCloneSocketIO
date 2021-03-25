const express = require('express')
const app = express()
const socketio = require('socket.io')

let namespaces = require('./data/namespaces')
// console.log(namespaces[0])

//staticalyy serving public folder
app.use(express.static(__dirname + '/public'))
//creation of http server
const httpServer = app.listen(9000)
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
		console.log(`${nsSocket.id} has joined ${namespace.endpoint}`)
		//a socket has joined one of the nameSpaces
		//send the information of that particcular NameSpace
		nsSocket.emit('nsRoomLoad', namespace.rooms)
		nsSocket.on('joinRoom', async (roomName, numberofUsersCallBack) => {
			//deal with history once we have it
			nsSocket.join(roomName)
			try {
				const allSockets = await io
					.of(namespace.endpoint)
					.in(roomName)
					.allSockets()
				console.log(allSockets.size)
				numberofUsersCallBack(allSockets.size)
			} catch (error) {
				console.log(error)
			}
		})
		nsSocket.on('newMessageToServer', msg => {
			const fullMsg = {
				text: msg,
				time: Date.now(),
				username: 'SUbin',
				avatar: 'https://via.placeholder.com/30'
			}
			console.log(fullMsg)
			//send to all sockets in the room that this socket is connected to
			// when we join a room we provide a roomName on the event itself
			//for identifying which room this socket belongs to in the nameSpace we use socket.rooms to get the information
			//socket.rooms has two values the first value is the room it connected to upon connection and it always connects to a room on connection
			//the second value is the room we joined it to
			console.log(nsSocket.rooms)
			const roomTitle = Array.from(nsSocket.rooms)[1]
			io.of(namespace.endpoint)
				.to(roomTitle)
				.emit('messageToAllClients', fullMsg)
		})
	})
})
