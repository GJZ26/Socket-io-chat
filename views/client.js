/** @type {Socket} */
const socket = io();

/** @type {HTMLFormElement} */
const send = document.getElementById('send');
const message = document.getElementById('text-input');
const fileTrigger = document.getElementById('file-btn');
const login = document.getElementById('login');
const instruction = document.getElementById('instruction');
const username = document.getElementById('username');
const popup = document.getElementById('modal');
const chats = document.getElementById('chats-list')
let messageStack = []
let messageRendered = {}

let DataURL;
let room;

/** @type {HTMLInputElement} */
const attach = document.getElementById('files');

const allMessage = document.getElementById('message-container');
const form = document.getElementById('message-form')

const log = document.getElementById('log');


function sendMessage(event) {
    if (room == undefined) {
        message.value = null;
        log.textContent = 'No room selected'
    }
    event.preventDefault();
    const content = message.value.trim()

    if (content.trim() == '' && DataURL == undefined) {
        return
    }

    let date = new Date()

    let info = {
        message: content,
        date: `${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`,
        img: DataURL,
        user: username.value,
        room: room
    }

    socket.emit('message', info)
    saveMessages(info)

    render(info)

    // Restableciendo scroll y contenido del input
    if (info.img !== undefined) {
        fileTrigger.classList.toggle('attached');
        DataURL = undefined
    }
    allMessage.scrollTop = allMessage.scrollHeight - allMessage.clientHeight
    message.value = null;
}

function render(info) {
    const tags = document.getElementsByClassName('mine')
    let claz = "receive"
    let clazz = "author"
    let user = info.user

    if (info.user == username.value) {
        claz = "self";
        clazz = "mine"
        user = "You"

        if (tags.length > 0) {
            allMessage.removeChild(tags[0])
        }
    }


    const bubble_message = document.createElement('div');
    const message_meta_info = document.createElement('span')

    message_meta_info.classList.add(clazz);
    message_meta_info.textContent = `${user} - ${info.date}`;

    bubble_message.classList.add('message');
    bubble_message.classList.add(claz);
    bubble_message.textContent = info.message;


    if (info.img !== undefined) {
        const imagen = document.createElement('div')
        const bubble_image = document.createElement('div')
        bubble_image.classList.add('message');
        bubble_image.classList.add(claz);
        bubble_image.classList.add('img');
        imagen.classList.add('imagen')

        imagen.style.backgroundImage = `url(${info.img})`
        bubble_image.appendChild(imagen)
        allMessage.appendChild(bubble_image)
    }

    if (info.message !== '') {
        allMessage.appendChild(bubble_message)
    }

    allMessage.appendChild(message_meta_info);
}

function loadChat(room) {
    allMessage.innerHTML = ""
    messageStack.map((msg)=>{
        if(msg.room === room){
            render(msg)
        }
    })
}

function saveMessages(dat) {
    messageStack.push(dat)
    console.log(messageStack)
    return room !== dat.room
}

function changeRoom(element) {
    const focus = document.getElementsByClassName('focus')
    if (focus.length > 0) {
        focus[0].classList.toggle('focus')
    }
    element.classList.toggle('focus')

    room = element.id
    socket.emit('loadchat', room)
    log.textContent = `Room changed to ${element.children[0].textContent}`
    loadChat(room)
}

function enter(e) {
    e.preventDefault();
    if (username.value.trim() === '') {
        instruction.textContent = 'The user name must not be empty'
        return
    }
    document.body.removeChild(popup);
    socket.emit('register', username.value)
}

socket.on('connect', () => {
    const chats = document.getElementsByClassName('chat');
    for (let i = 0; i < chats.length; i++) {
        chats[i].addEventListener('click', () => { changeRoom(chats[i]) })
    }
    log.textContent = 'Connection established'
})

socket.on('register', (info) => {
    const cht = document.createElement('div')
    cht.classList.add('chat')
    cht.id = info.socket

    const stt = document.createElement('span')
    stt.classList.add('status')
    stt.classList.add('active')

    const usr = document.createElement('h1')
    usr.classList.add('chat-user')
    usr.appendChild(stt)
    usr.append(info.username)

    const msg = document.createElement('span')
    msg.classList.add('message-preview')
    msg.textContent = info.lastMessage

    cht.appendChild(usr)
    cht.appendChild(msg)

    cht.onclick = () => changeRoom(cht)

    chats.appendChild(cht)
})

socket.on('private', (data) => {
    if (saveMessages(data)) return
    render(data)
    allMessage.scrollTop = allMessage.scrollHeight - allMessage.clientHeight
})

socket.on('message', (data) => {

    if (saveMessages(data)) return

    render(data)
    allMessage.scrollTop = allMessage.scrollHeight - allMessage.clientHeight
})

socket.on('disconnect', () => {
    log.textContent = 'No server connection'
})

socket.on('left', (info) => {
    console.log(info)
    const cha = document.getElementById(info.socket)
    chats.removeChild(cha)
    log.textContent = `${info.username} left`
})

send.addEventListener('click', (e) => {
    sendMessage(e);
})

message.addEventListener('keypress', (e) => {
    if (e.keyCode == 13) sendMessage(e)
})

fileTrigger.addEventListener('click', () => attach.click())

attach.addEventListener('change', (e) => {
    // Get a reference to the file
    const file = e.target.files[0];
    log.textContent = `Uploading ${attach.files[0].name} to attach`

    // Encode the file using the FileReader API
    const reader = new FileReader();
    reader.onloadend = () => {
        // Use a regex to remove data url part
        DataURL = reader.result

        log.textContent = `File ${attach.files[0].name} successfully attached`
        // Logs wL2dvYWwgbW9yZ...
    };
    fileTrigger.classList.toggle('attached');
    reader.readAsDataURL(file);
});

login.addEventListener('submit', (e) => enter(e))