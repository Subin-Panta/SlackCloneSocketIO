const socket = io('http://localhost:9000')
const socket2 = io('http://localhost:9000/admin')
//listening to messagefromserver event
socket.on('dataFromServer', dataFromServer => {
	console.log(dataFromServer)
	//emitting dataToServer event
	socket.emit('dataToServer', { data: 'Data from Client' })
})
socket.on('connect', () => {
	console.log(socket.id)
})
socket2.on('connect', () => {
	console.log(socket2.id)
})
socket.on('welcome', msg => console.log(msg))
socket2.on('welcome', msg => console.log(msg))
document.querySelector('#message-form').addEventListener('submit', event => {
	event.preventDefault()
	const newMessage = document.querySelector('#user-message').value
	//send message to the server
	//emitting this event
	socket.emit('newMessageToServer', { text: newMessage })
})

socket.on('messageToAllClients', msg => {
	console.log(msg)
	document.querySelector('#messages').innerHTML += `<li>${msg.text}</li>`
})
// this doesn't work on v3
// socket.on('ping', () => {
// 	console.log('Ping was recieved from the server')
// })
// socket.on('pong', latency => {
// 	console.log(latency)
// 	console.log('Pong was sent to the server')
// })
