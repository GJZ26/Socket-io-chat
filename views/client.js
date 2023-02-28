/** @type {Socket} */
const socket = io();

/** @type {HTMLFormElement} */
const send = document.getElementById("send");
const message = document.getElementById("text-input");
const fileTrigger = document.getElementById("file-btn");
const attach = document.getElementById("files");
const allMessage = document.getElementById("message-container");
const form = document.getElementById("message-form")

const log = document.getElementById("log");


function sendMessage(event) {
    event.preventDefault();

    let content = message.value

    if (content.trim() == "") {
        return
    }

    let date = new Date()
    const bubble_message = document.createElement("div");
    const message_meta_info = document.createElement("span");
    const tags = document.getElementsByClassName("mine")

    let info = {
        user: "Juano Perez",
        date: `${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}`,
        message: content
    }

    socket.emit("message", info)


    message_meta_info.classList.add("mine");
    message_meta_info.textContent = `You - ${info.date}`;

    bubble_message.classList.add("message");
    bubble_message.classList.add("self");
    bubble_message.textContent = info.message;

    if (tags.length > 0) {
        allMessage.removeChild(tags[0])
    }

    allMessage.appendChild(bubble_message)
    allMessage.appendChild(message_meta_info);

    // Reestableciendo scroll y contenido del input
    allMessage.scrollTop = allMessage.scrollHeight - allMessage.clientHeight
    message.value = null;
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

    allMessage.appendChild(bubble_message)
    allMessage.appendChild(message_meta_info);

    allMessage.scrollTop = allMessage.scrollHeight - allMessage.clientHeight
})

socket.on("disconnect", () => {
    log.textContent = "No server connection"
})

socket.on("connect", () => {
    log.textContent = "Connection established"
})

send.addEventListener("click",(e)=>{
    sendMessage(e);
})

message.addEventListener('keypress',(e)=>{
    if(e.keyCode == 13) sendMessage(e)
})

fileTrigger.addEventListener('click',()=> attach.click())