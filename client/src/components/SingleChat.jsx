import React, { useEffect } from 'react'
import { ChatState } from '../Context/ChatProvider'
import { GetYourData } from '../utils/helper';
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { getSender, getSenderFull } from '../config/ChatLogic';
import ProfileModal from './miscellaneous/ProfileModal';
import UpdateGroupChatModal from './miscellaneous/UpdateGroupChatModal';
import { useState } from 'react';
import axios from 'axios';
import "./style.css"
import ScrollableChat from './ScrollableChat';
import io from "socket.io-client";
import  Lottie  from 'react-lottie';
import animationData from "../Animation/typing.json";

const ENDPOINT = "http://localhost:9000";

var socket, selectedChatCompare;

const SingleChat = ({fetchAgain, setFetchAgain}) => {

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState();
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const toast = useToast();
    const data = GetYourData();

    useEffect(() =>{
      socket = io(ENDPOINT);
      socket.emit('setup', data);
      socket.on("connected", () =>{
         setSocketConnected(true);
      })
      socket.on('typing', () => {
        setIsTyping(true);
      })
      socket.on('stop typing', () => {
        setIsTyping(false);
      })
     })

    const fetchMessages = async () =>{
      if(!selectedChat){
        return;
      }

      try {
        const config = {
          headers:{
            Authorization: `Bearer ${data.jwt}`
          }
        }

        setLoading(true);

        const response = await axios.get(`http://localhost:8082/api/message/${selectedChat._id}`, config);

        if(response.status){
          console.log(response.data.messages);
          setMessages(response.data.messages);
          setLoading(false);
          socket.emit("join chat", selectedChat._id);
        }

      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to Load the Messages",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }

    const sendMessage = async (event) =>{
      if(event.key === "Enter" && newMessage){
        socket.emit('stop typing', selectedChat._id)
         try {
          const config = {
            headers:{
              "Content-type": "application/json",
              Authorization: `Bearer ${data.jwt}`
            }
          }

          setNewMessage(" ");

          const response = await axios.post("http://localhost:8082/api/message/",{
            content: newMessage,
            chatId: selectedChat._id,
          }, config)

          console.log(response.data.message);

          socket.emit('new message', response.data.message);

          if(response.status){
            setMessages([...messages, response.data.message])
          }

         } catch (error) {
          toast({
            title: "Error Occured!",
            description: "Failed to send the Message",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
         }
      }
    }

    const typingHandler = (e) => {
        setNewMessage(e.target.value);
       // Typing Indicator Logic
       if (!socketConnected) return;

       if(!typing){
        setTyping(true);
        socket.emit('typing', selectedChat._id);
       }
       let lastTypingTime = new Date().getTime();
       var timerLength = 3000;
       setTimeout(() =>{
         var timeNow = new Date().getTime();
         var timeDiff = timeNow - lastTypingTime;

         if(timeDiff >= timerLength && typing){
            socket.emit('stop typing', selectedChat._id);
            setTyping(false);
         } 
       }, timerLength)
    }

    const defaultOptions = {
      loop: true,
      autoplay: true,
      animationData: animationData,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
      },
    };

    const { selectedChat, setSelectedChat, notification, setNotification } = ChatState();


  useEffect(() =>{
      fetchMessages();

      selectedChatCompare = selectedChat;

   }, [selectedChat]);

   console.log(notification, "------------------");


   useEffect(() =>{
     socket.on("message received", (newMessageReceived) =>{
       if(!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id){
        {
          if(!notification.includes(newMessageReceived)){
            setNotification([newMessageReceived, ...notification]);
            setFetchAgain(!fetchAgain);
          }
        }
       }else{
        setMessages([...messages, newMessageReceived])
       }
     })
   })


  return (
    <>
     {
        selectedChat ? (<>
           <Text
             fontSize={{ base: "28px", md: "30px" }}
             pb={3}
             px={2}
             w="100%"
             fontFamily="Work sans"
             display="flex"
             justifyContent={{ base: "space-between" }}
             alignItems="center"      
           >
                 <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />

              {
                !selectedChat.isGroupChat ? (
                     <>
                     {
                        getSender(data, selectedChat.users)                        
                     }
                   
                     <ProfileModal data = {getSenderFull(data , selectedChat.users)}/>
                     
                     {/* {console.log(selectedChat.users)}
                     {console.log(data)}
                     {console.log(getSenderFull(data, selectedChat.users))} */}

                     </>
                ):(
                      <>
                         {selectedChat.chatName.toUpperCase()}
                         <UpdateGroupChatModal
                           fetchAgain = {fetchAgain} 
                           setFetchAgain = {setFetchAgain}
                           fetchMessages = {fetchMessages}
                         />
                      </>
                )
              }
           </Text>
                <Box
                    display="flex"
                    flexDir="column"
                    justifyContent="flex-end"
                    p={3}
                    bg="#E8E8E8"
                    w="100%"
                    h="100%"
                    borderRadius="lg"
                    overflowY="hidden"
                >
                  {/* messages */}
                  {
                    loading ? (
                      <Spinner
                        size="xl"
                        w={20}
                        h={20}
                        alignSelf="center"
                        margin="auto"
                      />
                    ) : (
                         <div className = "messages">
                          <ScrollableChat messages = {messages}/>
                         </div>
                    )}

                    <FormControl onKeyDown={sendMessage} isRequired mt = {3}>
                      {isTyping? <div>
                         <Lottie 
                           options = {defaultOptions}
                           width = {70}
                           style = {{ marginBottom: 15, marginLeft: 0 }}
                         />
                        </div>: <></>}
                       <Input
                            variant="filled"
                            bg="#E0E0E0"
                            placeholder="Enter a message.."
                            onChange = {typingHandler}
                            value = {newMessage}
                       />
                    </FormControl>
                </Box>
        </>)
        :(
            <Box display="flex" alignItems="center" justifyContent="center" h="100%">
            <Text fontSize="3xl" pb={3} fontFamily="Work sans">
              Click on a user to start chatting
            </Text>
          </Box>
        )
     }
    </>
  )
}

export default SingleChat
