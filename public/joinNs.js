const joinNs = endpoint => {
	if (nsSocket) {
		//when we swtich nameSpaces close the previous connection
		nsSocket.close()
		//remove the event listener before its added again
		document
			.querySelector('#user-input')
			.removeEventListener('submit', formSubmission)
	}
	//automatically joins the wikipedia namespace at the start of the web application
	nsSocket = io(`http://localhost:9000${endpoint}`)
	//Listen for event that sends back the nsData
	nsSocket.on('nsRoomLoad', nsRooms => {
		console.log(nsRooms)
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
				joinRoom(e.target.innerText)
			})
		})
		//add user to a room at the start of the application
		const topRoom = document.querySelector('.room')
		const topRoomName = topRoom.innerText
		joinRoom(topRoomName)
	})

	nsSocket.on('messageToAllClients', msg => {
		console.log('event ctached', msg)
		const newMsg = buildHtml(msg)

		document.querySelector('#messages').innerHTML += newMsg
		document
			.querySelector('#messages')
			.scrollTo(0, document.querySelector('#messages').scrollHeight)
	})
	document
		.querySelector('.message-form')
		.addEventListener('submit', formSubmission)
}
const formSubmission = event => {
	event.preventDefault()
	const newMessage = document.querySelector('#user-message').value
	//send message to the server
	//emitting this event
	nsSocket.emit('newMessageToServer', { text: newMessage })
}
const buildHtml = msgObj => {
	const convertedDate = new Date(msgObj.time).toLocaleTimeString()
	const newHtml = `<li>
	<div class="user-image">
		<img src=${msgObj.avatar} />
	</div>
	<div class="user-message">
		<div class="user-name-time">${msgObj.username} <span>${convertedDate}</span></div>
		<div class="message-text">${msgObj.text}</div>
	</div>
</li>`
	return newHtml
}
