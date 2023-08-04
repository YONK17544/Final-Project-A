import { Box, Button, FormControl, Input, useDisclosure, useToast } from '@chakra-ui/react'
import { useState } from 'react'
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
  } from '@chakra-ui/react'
import { ChatState } from '../../Context/ChatProvider';
import { GetYourData } from '../../utils/helper';
import axios from 'axios';
import UserListItem from '../UserAvatar/UserListItem';
import UserBadgeItem from '../UserAvatar/UserBadgeItem';

const GroupChatModal = ({children}) => {
        const [groupChatName, setGroupChatName] = useState();
        const [selectedUsers, setSelectedUsers] = useState([]);
        const [search, setSearch] = useState("");
        const [searchResult, setSearchResult] = useState([]);
        const [loading, setLoading] = useState(false);
        const { isOpen, onOpen, onClose } = useDisclosure()
        const toast = useToast();

        const data = GetYourData();
        const { chats, setChats } = ChatState();

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

        const handleSubmit = async () =>{
            if(!groupChatName || !selectedUsers){
                toast({
                    title: "Please fill all the feilds",
                    status: "warning",
                    duration: 5000,
                    isClosable: true,
                    position: "top",
                  });
            }

            try {
                const config = {
                    headers:{
                      Authorization: `Bearer ${data.jwt}`
                    }
                  }
                
                  const response = await axios.post(
                    "http://localhost:8082/api/chat/group",
                     { name: groupChatName,
                      users: JSON.stringify(selectedUsers.map((user) =>{
                          return user._id
                      }))
                  }, config)

                  if(response.status){
                    setChats([response.data.fullGroupChat, ...chats])
                    onClose();
                    toast({
                        title: "New Group Chat Created!",
                        status: "success",
                        duration: 5000,
                        isClosable: true,
                        position: "bottom",
                      });
                  }   
            } catch (error) {
                toast({
                    title: "Failed to Create the Chat!",
                    description: error.response.data,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                  });
            }
        }

        const handleDelete = (delUser) =>{
           const response = selectedUsers.filter((seluser) =>{
            return seluser?._id !== delUser._id
           })

           setSelectedUsers(response);
        }

        const handleGroup = (userToAdd) =>{
            if(selectedUsers.includes(userToAdd)){
                toast({
                    title: "User already added",
                    status: "warning",
                    duration: 5000,
                    isClosable: true,
                    position: "top",
                  });
            }

            setSelectedUsers([...selectedUsers, userToAdd])
    }

        return (
            <>
              <span onClick={onOpen}>{children}</span>
        
              <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader
                     fontSize="35px"
                     fontFamily="Work sans"
                     d="flex"
                     justifyContent="center"
                  >Create Group Chat</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody
                    display="flex" flexDir="column" alignItems="center"
                  >
                    <FormControl>
                        <Input placeholder = "Chat Name" mb = {3}
                          onChange = {(e) => setGroupChatName(e.target.value)}
                        />
                    </FormControl>
                    <FormControl>
                        <Input placeholder = "Add Users" mb = {3}
                          onChange = {(e) => handleSearch(e.target.value)}
                        />
                    </FormControl>

                  <Box w = "100%" display = "flex" flexWrap="wrap">
                  {selectedUsers.map((user) =>{
                        return(
                            <UserBadgeItem
                             key = {user._id}
                             user = {user}
                             handleFunction = {() => handleDelete(user)}
                            />
                        )
                     })}
                  </Box>


                    {loading? (<div>loading</div>):(
                        searchResult?.slice(0, 4).map((user) =>{
                            return(
                            <UserListItem key = {user._id} user = {user}
                              handleFunction={() => handleGroup(user)}
                            />);
                        })
                    )}
                  </ModalBody>
        
                  <ModalFooter>
                    <Button colorScheme='blue' mr={3} onClick={handleSubmit}>
                      Create Chat
                    </Button>
                    <Button variant='ghost'>Secondary Action</Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            </>
          )
}

export default GroupChatModal
