const socket = io()

//elements for forms
const $messageForm = document.querySelector('#form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $messages = document.querySelector('#messages')


//templates
const messageTemplate = document.querySelector('#message-template').innerHTML 
const locationTemplate = document.querySelector("#location-message-template").innerHTML

const sidebar = document.querySelector('#sidebar-template').innerHTML

// options

const {username, room} = Qs.parse(location.search,{ ignoreQueryPrefix:true})



//element for location button
const $shareLocation = document.querySelector('#shareLocation')



// const autoScroll = () => {
//     //new msg element
//     const newMessage = $messages.lastElementChild

//     //height of new message
//     const newMessageStyles = getComputedStyle($newMessage)
//     const newMessageMargin = parseInt(newMessageStyles.marginBottom)
//     const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

//     //visible height
//     const visibleHeight = $messages.offsetHeight

//     //height of message container
//     const containerHeight = $messages.scrollHeight

//     //how far have i scrolled?
//     const scrollOffset = $messages.scrollTop + visibleHeight

//     if(containerHeight - newMessageHeight <= scrollOffset){
//         $messages.scrollTop = $messages.scrollHeight
//     }
// }

socket.on('message',(message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username : message.username,
        message : message.text,
        createdAt : moment(message.createdAt).format('h:m a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    // autoScroll()
})


// for location
socket.on('locationMessage',(url) => {
    console.log(url)
    const html = Mustache.render(locationTemplate,{
        username : url.username,
         url : url.url,
         createdAt : moment(url.createdAt).format('h:m a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    // autoScroll()

})


socket.on('roomData',({room,users}) => {
    const html = Mustache.render(sidebar,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})




$messageForm.addEventListener('submit', (e)=> {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')

    const message = e.target.elements.message.value
    socket.emit('send',message, (error) => {

        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if(error){
            return console.log(error)
        }
        console.log('msg delivered!')
    })
})




//share users Location

$shareLocation.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('not supported!')
    }
    $shareLocation.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position) => {

        socket.emit('shareLocation',{

            latitude  : position.coords.latitude,
            longitude : position.coords.longitude
    
        }, () => {
            console.log('location shared!')
            $shareLocation.removeAttribute('disabled')
        })

        console.log(position)
    
    })
})

socket.emit('join',{
    username,
    room
}, (error) => {
    if (error){
        alert(error)
        location.href = '/'
    }
})
