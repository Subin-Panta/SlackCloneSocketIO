class Room {
	constructor(roomId, roomTitle, nameSpace, privateRoom = false) {
		this.roomId = roomId
		this.roomTitle = roomTitle
		this.nameSpace = nameSpace
		this.privateRoom = privateRoom
		this.history = []
	}
	addMessage(message) {
		this.history.push(message)
	}
	clearHistory() {
		this.history = []
	}
}
module.exports = Room
