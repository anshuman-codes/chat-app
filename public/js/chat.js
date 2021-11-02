const socket=io()

//Elements
const $messageForm= document.querySelector('#message-form')
const $messageFormInput= document.querySelector('#message-form input')
const $messageFormButton= document.querySelector('#message-form button')
const $sendLocationButton= document.querySelector('#loc-btn')
const $messages= document.querySelector('#messages')
const $sidebar= document.querySelector('#sidebar')


//templates
const $messageTemplate= document.querySelector('#message-template').innerHTML
const $locationTemplate= document.querySelector('#location-template').innerHTML
const $sidebartemplate= document.querySelector('#sidebar-template').innerHTML

//Options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll= ()=>{
    //New message element
    const $newMessage= $messages.lastElementChild

    //Height of new message
    const $newMessageStyles = getComputedStyle($newMessage)
    const $newMessageMargin = parseInt($newMessageStyles.marginBottom)
    const $newMessageHeight= $newMessage.offsetHeight+$newMessageMargin

    //Visible height
    const visibleHeight = $messages.offsetHeight

    //messages container Height
    const containerHeight = $messages.scrollHeight

    //How much I have scrolled
    const scrollOffset= $messages.scrollTop+ visibleHeight

    if(containerHeight-$newMessageHeight < scrollOffset){
        $messages.scrollTop= $messages.scrollHeight
    }
}

socket.on('message',(message)=>{
    
    const html= Mustache.render($messageTemplate,{
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})


$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')

    const msg= e.target.elements.message.value
    socket.emit('sendMessage',msg,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        if(error){
            alert(error)
            location.href='/'
            return
        }
    })
})

socket.on('LocationMessage',(urlObj)=>{
    const html=Mustache.render($locationTemplate,{
        username: urlObj.username,
        url: urlObj.url,
        createdAt: moment(urlObj.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
    const html = Mustache.render($sidebartemplate,{
        room,
        users
    })
    $sidebar.innerHTML=html
})

document.querySelector('#loc-btn').addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('geolocation is not supported')
    }

    navigator.geolocation.getCurrentPosition((position)=>{
       
        $sendLocationButton.setAttribute('disabled','disabled')
        const loc={
            lat: position.coords.latitude,
            long: position.coords.longitude
        }
        socket.emit('sendLocation',loc,()=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log("Location Delivered")
        })
    })

})

socket.emit('join',username,room,(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})
