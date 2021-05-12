const username = prompt('What is your username?')
// const socket = io('http://localhost:9000') //Main NameSpace
const socket = io('https://sheltered-earth-07960.herokuapp.com/', {
	query: {
		username
	}
}) //Main NameSpace

let nsSocket = ''
//Listening for nslist Event
socket.on('nsList', nsData => {
	// console.log('The List of nameSpaces has arrived', nsData)
	let nameSpacesDiv = document.querySelector('.nameSpaces')
	nameSpacesDiv.innerHTML = ''
	nsData.forEach(ns => {
		nameSpacesDiv.innerHTML += `<div class="namespace" ns=${ns.endpoint}><img src=${ns.img} /></div>`
	})
	//add clicklIstener for eachNs
	//This by default return an arrayLike dataStructre but isn't actually an array
	//So we Use Arra.from to convert this into an array
	Array.from(document.getElementsByClassName('namespace')).forEach(element => {
		//Add event listener for each element
		element.addEventListener('click', e => {
			const nsEndpoint = element.getAttribute('ns')
			joinNs(nsEndpoint)
		})
	})
	joinNs('/wiki')
})
