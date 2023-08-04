import { ViewIcon } from '@chakra-ui/icons';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    IconButton,
    Button,
    Image,
    Text,
  } from '@chakra-ui/react'
  import { useDisclosure } from '@chakra-ui/react';



const ProfileModal = ({data, children}) => {
    const { isOpen, onOpen, onClose } = useDisclosure()

  return (
   <>
      <div>
      {
      children? ( <span onClick = {onOpen}>{children}</span> ): 
      (
        <IconButton
           display = {{base: "flex"}}
           icon = {<ViewIcon/>}
           onClick={onOpen}
        />
      ) }
         <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
              fontSize="40px"
              fontFamily="Work sans"
              display="flex"
              justifyContent="center"
          >{ data.name }</ModalHeader>
          <ModalCloseButton />
          <ModalBody
             display="flex"
             flexDir="column"
             alignItems="center"
             justifyContent="space-between"
          >
            <Image 
               borderRadius="full"
               boxSize="150px"
               src={ data.pic || data.picture}
               alt={data.name}
            />
             <Text
              fontSize={{ base: "28px", md: "30px" }}
              fontFamily="Work sans"
            >
              Email: { data.email}
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
   </>
  )
}

export default ProfileModal
