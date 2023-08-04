import express from "express";
import dotenv from "dotenv";
import chats from "./data/data.js";
import cors from "cors";
import { connectDB } from "./config/db.config.js";
import userRouter from "./routes/user.routes.js";
import chatRouter from "./routes/chat.routes.js";
import messageRouter from "./routes/message.routes.js";
import { errorHandler, notFound } from "./middlewares/errorMiddleware.js";
import { Server } from 'socket.io';


dotenv.config();

const app = express();
connectDB();
const corsOptions ={
    origin:'http://localhost:5173', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) =>{
   res.send("API is running...");
})

app.use('/api/user', userRouter);
app.use('/api/chat', chatRouter);
app.use('/api/message', messageRouter);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8085;

const server = app.listen(PORT, () =>{
    console.log(`Listening on ${PORT}`);
} )

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173'
    }
})


io.on("connection", (socket) =>{
   console.log("Connected to socket.io")

   socket.on('setup', (userData) =>{
      socket.join(userData._id)
      console.log(userData._id)
      socket.emit("connected");
   })

   socket.on('join chat', (room) => {
      socket.join(room);
      console.log("User Joined Room: " + room);
   })

   socket.on('typing', (room) => {
      socket.in(room).emit('typing');
   })

   socket.on('stop typing', (room) => {
      socket.in(room).emit('stop typing');
   })

   socket.on('new message', (newMessageReceived) =>{
     var chat = newMessageReceived.chat;

     if(!chat.users) return console.log("chat.users not defined");

     chat.users.forEach((user) =>{
        if(user._id == newMessageReceived.sender._id) return;

        socket.in(user._id).emit("message received", newMessageReceived)
     })
   })

   socket.off("setup", () =>{
      console.log("USER DISCONNECTED");
      socket.leave(userData._id)
   })
})

io.listen(9000);