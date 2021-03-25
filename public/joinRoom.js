const joinRoom = roomName => {
	//send this roomname to server
	nsSocket.emit('joinRoom', roomName, newNumberofMember => {
		//Update Room Member Total
		//this will be snet to the server and get called there
		document.querySelector(
			'.curr-room-num-users'
		).innerHTML = `${newNumberofMember} <span class="glyphicon glyphicon-user"></span
        ></span>`
	})
	nsSocket.on('historyCatchUp', history => {
		const messagesUl = document.querySelector('#messages')
		messagesUl.innerHTML = ''
		history.forEach(item => {
			const newMsg = buildHtml(item)

			messagesUl.innerHTML += newMsg
		})
		messagesUl.scrollTo(0, messagesUl.scrollHeight)
	})
	nsSocket.on('updateMembers', noOfMember => {
		document.querySelector(
			'.curr-room-num-users'
		).innerHTML = `${noOfMember} <span class="glyphicon glyphicon-user"></span
        ></span>`
	})
}
