console.log("Socket.io Chat - Initializing");

import express  from "express";
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

app.get("/style.css",(req,res)=>{
    res.sendFile(dir + "/views/style.css")
})

app.get("/client.js", (req,res)=>{
    res.sendFile(dir + "/views/client.js")
})

app.get("/",(req,res)=>{
    res.sendFile(dir + "/views/")
})

io.on('connection',(socket)=>{
    console.log("A user connect");
    socket.on("message",(msg)=>{
        socket.broadcast.emit("message",msg)
    })
})


server.listen(port,(req,res)=>{
    console.log("Server running on: http://localhost:"+port)
})