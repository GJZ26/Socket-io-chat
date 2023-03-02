console.log("Socket.io Chat - Initializing");

import express from "express";
import http from 'http';
import { Server } from "socket.io";

// Relacionando servidores
const app = express();
const server = http.createServer(app);
const io = new Server(server)

// Preferencias del servidor
const port = 3000;
const dir = process.cwd() // <- Para almacenar directorio raíz del proyecto,
//    sin tener que usar __dirname de CommonJS

const users = {}
const clients = {}

class Content {
    /** @type {Array} */
    contn

    constructor() {
        this.contn = new Array()
    }
    addContent(message, file, username, date) {
        this.contn.push({ message: message, file: file, username: username, date: date })
    }
    getContn() {
        return this.contn
    }
}

class Log {
    log = {};

    constructor(room) {
        this.log[room] = new Content()
    }

    addLog(room, mensaje, date, username, file) {
        console.log(this.log[room])
        this.log[room].addContent(mensaje, file, username, date)
    }

    getLogs(room) {
        return this.log[room]
    }
}

/*
    Chat -
        Usuario 1
            General - Mensaje, Attr...
            Usuario 2 - Mensaje, Attr...
            Usuario3 - Mensaje, Attr...
        Usuario 2
            General - Mensaje, Attr...
            Usuario 1 - Mensaje, Attr...
            Usuario3 - Mensaje, Attr...
*/
const chats = {}

app.get("/style.css", (req, res) => {
    res.sendFile(dir + "/views/style.css")
})

app.get("/client.js", (req, res) => {
    res.sendFile(dir + "/views/client.js")
})

app.get("/", (req, res) => {
    res.sendFile(dir + "/views/")
})

io.on('connection', (socket) => {
    console.log("A user connect");

    socket.on("message", (msg) => {
        if (msg.room == "general") {
            socket.broadcast.emit("message", {
                message: msg.message,
                date: msg.date,
                img: msg.img,
                user: users[socket.id].username,
                room: msg.room
            })
            return
        }
        clients[users[msg.room].username].emit("private", {
            message: msg.message,
            date: msg.date,
            img: msg.img,
            user: users[socket.id].username,
            room: msg.room
        })
    })

    socket.on('register', (username) => {

        let last = `Say hi to ${username}`;

        if (users[socket.id]) {
            last = users[socket.id].lastMessage
        }

        users[socket.id] = {
            socket: socket.id,
            status: 1,
            lastMessage: last,
            username: username,
            room: undefined
        }

        clients[username] = socket;
        socket.broadcast.emit("register", users[socket.id])
    })

    socket.on("disconnect", () => {
        if (users[socket.id]) {
            socket.broadcast.emit("left", users[socket.id])
            delete clients[users[socket.id].username]
            delete users[socket.id]
        }
    })

    socket.on('loadchat', (room) => {
        if (room == "general") {
            console.log(room)
        } else {
            console.log(users[room].username)
        }
    })

})


server.listen(port, (req, res) => {
    console.log("Server running on: http://localhost:" + port)
})