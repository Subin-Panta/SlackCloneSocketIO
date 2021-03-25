const joinNs = endpoint => {
	//automatically joins the wikipedia namespace at the start of the web application
	nsSocket = io(`http://localhost:9000${endpoint}`)
	//Listen for event that sends back the nsData
	nsSocket.on('nsRoomLoad', nsRooms => {
		// console.log(nsRooms)
		let roomList = document.querySelector('.room-list')
		roomList.innerHTML = ''
		nsRooms.forEach(room => {
			let glyph
			room.privateRoom ? (glyph = 'lock') : (glyph = 'globe')
			roomList.innerHTML += `<li class='room'><span class="glyphicon glyphicon-${glyph}"></span>${room.roomTitle}</li>`
		})
		//add a click listener to eachRoom
		let roomNodes = document.getElementsByClassName('room')
		Array.from(roomNodes).forEach(elem => {
			elem.addEventListener('click', e => {
				console.log(e.target.innerText)
			})
		})
		//add user to a room at the start of the application
		const topRoom = document.querySelector('.room')
		const topRoomName = topRoom.innerText
		joinRoom(topRoomName)
	})

	nsSocket.on('messageToAllClients', msg => {
		console.log(msg)
		document.querySelector('#messages').innerHTML += `<li>${msg.text}</li>`
	})
	document.querySelector('.message-form').addEventListener('submit', event => {
		event.preventDefault()
		const newMessage = document.querySelector('#user-message').value
		//send message to the server
		//emitting this event
		nsSocket.emit('newMessageToServer', { text: newMessage })
	})
}
