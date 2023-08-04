import { Box, Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, Input, Menu, MenuButton, MenuDivider, MenuItem, MenuList, Spinner, Text, Tooltip, useDisclosure } from "@chakra-ui/react";
import { BellIcon, ChevronDownIcon, SearchIcon } from '@chakra-ui/icons'
import { useState } from "react";
import { Avatar, AvatarBadge, AvatarGroup } from '@chakra-ui/react'
import { GetYourData } from "../../utils/helper";
import ProfileModal from "./ProfileModal";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../slice/authSlice";
import { useToast } from '@chakra-ui/react';
import axios from "axios";
import ChatLoading from "../ChatLoading";
import UserListItem from "../UserAvatar/UserListItem";
import { ChatState } from "../../Context/ChatProvider";
import { getSender } from "../../config/ChatLogic";
import NotificationBadge, { Effect } from "react-notification-badge";



const SideDrawer = () => {
  const [search, setSearch] = useState(" ");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState();
  const dispatch = useDispatch();
  const data = GetYourData();
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
 
  const { chats, setChats, setSelectedChat, selectedChat,  notification, setNotification   } = ChatState();


  const logOutHandler = (e) =>{
    e.preventDefault();
     dispatch(logout());
     navigate("/");
  }

  const handleSearch = async () =>{
       if(!search){
        toast({
          title: "Please Enter something in search",
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "top-left",
        });
       }else{
        try {
          setLoading(true);
          const config = {
            headers:{
              Authorization: `Bearer ${data.jwt}`
            }
          }

          const query = search.trim();
          const url = `http://localhost:8082/api/user/all?search=${query}`
          
          console.log("Link", url)
  
          const response = await axios.get(url, config)
       
          if (response.status) {
            setLoading(false);
            setSearchResult(response.data.users);
            console.log("checking", response.data.users);
          } 
  
         } catch (error) {
          toast({
            title: "Error Occured!",
            description: "Failed to Load the Search Results",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom-left",
          });
         }
       }


  }

  const accessChat = async (userId) =>{
      try {
        setLoadingChat(true);

        const config = {
          headers:{
            "Content-type": "application/json",
            Authorization: `Bearer ${data.jwt}`
          }
        };

        const response = await axios.post("http://localhost:8082/api/chat/", { userId }, config);

        // if (chats.find((c) => c._id === response.data.chat.FullChat._id)) setChats([response.data.chat.FullChat, ...chats]);

         setSelectedChat(response.data.chat.FullChat);
         console.log(response.data.chat.FullChat);
         console.log(selectedChat);
         setLoadingChat(false);
         onClose();
       
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to Load Chat",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom-left",
        });
      }
  }

  return (
    <>
      <Box
         display ="flex"
         justifyContent="space-between"
         alignItems="center"
         bg="white"
         w="100%"
         p="5px 10px 5px 10px"
         borderWidth="5px"
      >
        <Tooltip 
        label = "Search Users to Chat"
        hasArrow
        placement = "bottom-end"
        >
         <Button variant = "ghost" onClick = {onOpen}>
          <SearchIcon/>
          <Text display = {{base: 'none', md: "flex"}} px = '4'>
             Search User
          </Text>
         </Button>
        </Tooltip>

        <Text fontSize="2xl" fontFamily="Work sans">
          Wiber
        </Text>
        <div>
          <Menu>
            <MenuButton p ={1}>
              <NotificationBadge
                count = {notification.length}
                effect = {Effect.SCALE}
              />
               <BellIcon fontSize = "2xl" m = {1}/>
            </MenuButton>
            <MenuList pl ={2}>
              {!notification.length && "No new messages"}
              {notification.map((notif) =>{
                return (
                  <MenuItem key = {notif._id} onClick = {() =>{
                    setSelectedChat(notif.chat)
                    setNotification(notification.filter((n) => n !== notif))
                  }}>
                     {notif.chat.isGroupChat ? `New message in ${notif.chat.chatName}`:`New message from ${getSender(data, notif.chat.users)}`}
                  </MenuItem>
                )
              })}
            </MenuList>
          </Menu>
          <Menu>
          <MenuButton as = {Button} rightIcon={<ChevronDownIcon/>}>
            <Avatar size = "sm" cursor = "pointer" name = {data.name} src = {data.pic}/>
            </MenuButton>
            <MenuList>
              <ProfileModal data = {data}>
              <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider/>
             <MenuItem onClick = {(e) => {logOutHandler(e)}}>Log Out</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer placement = "left" onClose = {onClose} isOpen = {isOpen}>
        <DrawerOverlay/>
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
          <DrawerBody>
          <Box display = "flex" pb = {2}>
          <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            <Button 
            onClick = {handleSearch}
            >Go</Button>
          </Box>
          {loading? (
            <ChatLoading/>
          ):(
            searchResult && searchResult.length > 0 && 
            searchResult.map((user) =>{
             return(
              <UserListItem
              key = {user._id}
              user = {user}
              handleFunction={() => accessChat(user._id)}
            />
             )
            })     
          )}
          {loadingChat && <Spinner ml = "auto" display = "flex"/>}
        </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default SideDrawer
