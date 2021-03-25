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
}
