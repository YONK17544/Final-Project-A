import { Box, Button, FormControl, IconButton, Input, Spinner, Text, useDisclosure, useToast } from '@chakra-ui/react'
import { useState } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
  } from '@chakra-ui/react'
import { ViewIcon } from '@chakra-ui/icons';
import { ChatState } from '../../Context/ChatProvider';
import { GetYourData } from '../../utils/helper';
import UserBadgeItem from '../UserAvatar/UserBadgeItem';
import axios from 'axios';
import UserListItem from '../UserAvatar/UserListItem';

const UpdateGroupChatModal = ({ fetchAgain , setFetchAgain,  fetchMessages }) => {

    const { selectedChat, setSelectedChat } = ChatState();

    const [ groupChatName, setGroupChatName] = useState();
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [renameLoading, setRenameLoading] = useState(false);

    const toast = useToast();

    const data = GetYourData();

    const { isOpen, onOpen, onClose } = useDisclosure();

    const handleRemove = async (user1) =>{
      if (selectedChat.groupAdmin._id !== data._id && user1._id !== data._id) {
        toast({
          title: "Only admins can remove someone!",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        return;
      }

      try {
        setLoading(true);

        const config = {
          headers:{
            Authorization: `Bearer ${data.jwt}`
          }
        };

        const response = await axios.patch(
          "http://localhost:8082/api/chat/groupremove",
          {
            chatId: selectedChat._id,
            userId: user1._id,
          },
          config
        );
  
        if (response.status){
          user1._id === data._id ? setSelectedChat() : setSelectedChat(response.data.removed);
          setFetchAgain(!fetchAgain);
          fetchMessages();
          setLoading(false);
        }      

      } catch (error) {
        toast({
          title: "Error Occured!",
          description: error.response.data.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        setLoading(false);
      }
      setGroupChatName("");
    }

    const handleAddUser = async (adduser) =>{
      if (selectedChat.users.find((u) => u._id === adduser._id)) {
        toast({
          title: "User Already in group!",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        return;
      }

      if (selectedChat.groupAdmin._id !== data._id) {
        toast({
          title: "Only admins can add someone!",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        return;
      }

      try {
        setLoading(true);

        const config = {
          headers:{
            Authorization: `Bearer ${data.jwt}`
          }
        };

       const response = await axios.patch("http://localhost:8082/api/chat/groupadd",{
        chatId: selectedChat._id,
        userId: adduser._id,
       }, config);

       if(response.status){
        setSelectedChat(response.data.added);
        console.log(response.data.added);
        setFetchAgain(!fetchAgain);
        setLoading(false);
       }
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: error.response.data.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        setLoading(false);
      }
      setGroupChatName("");
      }
    

    const handleRename = async () =>{
      if(!groupChatName){
        return;
      }

      try {
        setRenameLoading(true);

        const config = {
          headers:{
            Authorization: `Bearer ${data.jwt}`
          }
        };

        const response = await axios.patch("http://localhost:8082/api/chat/rename", {
          chatId: selectedChat._id,
          chatName: groupChatName,
        }, config);

        if(response.status){
          setSelectedChat(response.data.updatedChat);
          setFetchAgain(!fetchAgain);
          setRenameLoading(false);
        }

      } catch (error) {
        toast({
          title: "Error Occured!",
          description: error.response.data.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        setRenameLoading(false);
      }
      setGroupChatName("");
    }


    const handleSearch = async (query) =>{
      setSearch(query.trim());
      if(!query){
       return;
      }

      try {
       setLoading(true);
       const config = {
           headers:{
             Authorization: `Bearer ${data.jwt}`
           }
         }

         const url = `http://localhost:8082/api/user/all?search=${search}`
       const response = await axios.get(url, config);

       if(response.status){
           setLoading(false);
           setSearchResult(response.data.users);
           console.log(response.data.users);
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

  

    return (
        <>
          <IconButton display = {{base: "flex"}} icon = {<ViewIcon/>} onClick={onOpen}/>
    
          <Modal blockScrollOnMount={false} isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader
                 fontSize="35px"
                 fontFamily="Work sans"
                 display ="flex"
                 justifyContent="center"
              >
                {selectedChat.chatName}
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Box w="100%" display ="flex" flexWrap="wrap" pb={3}>
                   {
                    selectedChat.users.map((user) =>{
                        return(
                            <UserBadgeItem
                            key = {user._id}
                            user = {user}
                            handleFunction = {() => handleRemove(user)}
                           />
                        )
                    })
                   }
                </Box>

                <FormControl display="flex">
              <Input
                placeholder="Chat Name"
                mb={3}
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <Button
                variant="solid"
                colorScheme="teal"
                ml={1}
                isLoading={renameLoading}
                onClick={handleRename}
              >
                Update
              </Button>
            </FormControl>

            <FormControl>
              <Input
                placeholder="Add User to group"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            {loading ? (
              <Spinner size="lg" />
            ) : (
              searchResult?.map((user) =>{
                 return (
                  <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleAddUser(user)}
                />
                 )
              }            
              )
            )}
              </ModalBody>
      
              <ModalFooter>
            <Button onClick={() => handleRemove(data)} colorScheme="red">
              Leave Group
            </Button>
          </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      )
    
}

export default UpdateGroupChatModal
