/** @type {Socket} */
const socket = io();

/** @type {HTMLFormElement} */
const send = document.getElementById("send");
const message = document.getElementById("text-input");
const fileTrigger = document.getElementById("file-btn");

let DataURL;

/** @type {HTMLInputElement} */
const attach = document.getElementById("files");

const allMessage = document.getElementById("message-container");
const form = document.getElementById("message-form")

const log = document.getElementById("log");


function sendMessage(event) {
    event.preventDefault();
    const content = message.value.trim()

    if (content.trim() == "" && DataURL == undefined) {
        return
    }

    let date = new Date()
    const bubble_message = document.createElement("div");
    const message_meta_info = document.createElement("span");
    const tags = document.getElementsByClassName("mine")

    let info = {
        user: "Juano Perez",
        date: `${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}`,
        message: content,
        img: DataURL
    }

    socket.emit("message", info)

    console.log(DataURL)
    message_meta_info.classList.add("mine");
    message_meta_info.textContent = `You - ${info.date}`;


    bubble_message.classList.add("message");
    bubble_message.classList.add("self");
    bubble_message.textContent = info.message;


    if (tags.length > 0) {
        allMessage.removeChild(tags[0])
    }

    if (info.img !== undefined) {
        const imagen = document.createElement("img")
        imagen.classList.add("attach")
        imagen.classList.add("self")
        imagen.src = info.img
        allMessage.appendChild(imagen)
    }

    if (info.message !== "") {
        allMessage.appendChild(bubble_message)
        allMessage.appendChild(message_meta_info);
    }


    // Restableciendo scroll y contenido del input
    fileTrigger.classList.toggle('attached');
    allMessage.scrollTop = allMessage.scrollHeight - allMessage.clientHeight
    message.value = null;
    DataURL = undefined
}

/*
    
*/
function readFile(event, file) {
    log.textContent = `File ${file.name} attached`
    return event.target.result;
}

/*
    Cambia de tipo Object[file] de los inputs File, a Blob (Binarios)
*/
function changeFile() {
    const file = attach.files[0];
    const reader = new FileReader();

    log.textContent = `Uploading: ${file.name}`
    let bins;

    reader.addEventListener('load', (e) => { bins = readFile(e, file) });
    reader.readAsText(file);
    console.log(bins)
}


socket.on("message", (data) => {
    const bubble_message = document.createElement("div");
    const message_meta_info = document.createElement("span")
    const tags = document.getElementsByClassName("author")


    message_meta_info.classList.add("author");
    message_meta_info.textContent = `${data.user} - ${data.date}`;

    bubble_message.classList.add("message");
    bubble_message.classList.add("receive");
    bubble_message.textContent = data.message;

    if (tags.length > 0) {
        allMessage.removeChild(tags[0])
    }

    if (data.img !== undefined) {
        const imagen = document.createElement("img")
        imagen.classList.add("attach")
        imagen.classList.add("receive")
        imagen.src = data.img
        allMessage.appendChild(imagen)
    }

    if (data.message !== "") {
        allMessage.appendChild(bubble_message)
        allMessage.appendChild(message_meta_info);
    }

    allMessage.scrollTop = allMessage.scrollHeight - allMessage.clientHeight
})

function changeRoom(element){
    const focus = document.getElementsByClassName('focus')
    focus[0].classList.toggle('focus')
    element.classList.toggle('focus')
}

socket.on("disconnect", () => {
    log.textContent = "No server connection"
})

socket.on("connect", () => {
    const chats = document.getElementsByClassName('chat');
    for(let i = 0; i < chats.length ; i++){
        chats[i].addEventListener('click',()=>{changeRoom(chats[i])})
    }
    log.textContent = "Connection established"
})

send.addEventListener("click", (e) => {
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