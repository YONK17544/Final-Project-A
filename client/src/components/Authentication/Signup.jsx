import { Button, FormLabel, InputGroup, InputRightElement, VStack } from '@chakra-ui/react';
import { FormControl } from '@chakra-ui/react';
import { Input } from '@chakra-ui/react';
import { useState } from 'react';
import { useToast } from '@chakra-ui/react'
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../../slice/authSlice';

const Signup = () => {
    const [show, setShow] = useState(false);
    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [confirmPassword, setConfirmPassword] = useState();
    const [picture, setPicture] = useState();
    const [loading, setLoading] = useState(false);
    const toast = useToast()
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleClick = () => { setShow(!show)}
     
    // cloudinary api_base_url = "https://api.cloudinary.com/v1_1/db4wnfcep"

    const postDetails = (pics) =>{
        setLoading(true);
        if(pics === undefined){
           toast({
            title: "Please select an image",
            status:"warning",
            duration:5000,
            isClosable: true,
            position: "bottom"
           })
           return;
        }

        if(pics.type === "image/jpeg" || pics.type === "image/png" || pics.type === "image/jpg"){
            const data = new FormData();
            data.append("file", pics);
            data.append("upload_preset", "chat-app");
            data.append("cloud_name", "db4wnfcep");
            fetch("https://api.cloudinary.com/v1_1/db4wnfcep/image/upload",{
                method: "POST",
                body: data,
            }).then((res) => res.json())
              .then((data) =>{
                setPicture(data.url.toString());
                console.log(data.url.toString());
                console.log(data);
                console.log(picture);
                setLoading(false);
              })
              .catch((err) =>{
                console.log(err);
                setLoading(false);
              })
        }else{
            toast({
                title: "Please select an image",
                status:"warning",
                duration:5000,
                isClosable: true,
                position: "bottom"
               });
               setLoading(false);
               return;
        }
    }

    const submitHandler = async () =>{
        setLoading(true);
        if(!name || !email || !password || !confirmPassword){
          toast({
            title: "Please Fill all the fields",
            status:"warning",
            duration:5000,
            isClosable: true,
            position: "bottom"
           });
           setLoading(false);
           return;
        }
        if(password !== confirmPassword){
          toast({
            title: "Passwords do not match",
            status:"warning",
            duration:5000,
            isClosable: true,
            position: "bottom"
           });
           setLoading(false);
           return;
        }

        try {
          const config = {
            headers: {
              "Content-type": "application/json",
            }
          };
          const response = await axios.post("http://localhost:8082/api/user/", {name, email, password, picture}, config);

          if (response.status) {
           dispatch(login(response.data));
            navigate('/chats');
          } 
        

          toast({
            title: "Registration successful",
            status:"success",
            duration:5000,
            isClosable: true,
            position: "bottom"
           });

           setLoading(false);

           
        } catch (error) {
          toast({
            title: "Error Occured!",
            description: "Error occured",
            status:"error",
            duration:5000,
            isClosable: true,
            position: "bottom"
           });
           setLoading(false);
        }
    }
 
  return (
    <VStack spacing = "5px">
      <FormControl  id = "first-name" isRequired>
         <FormLabel>Name</FormLabel>
         <Input
           placeholder = "Enter your name"
           onChange = {(e) =>setName(e.target.value)}
         />
      </FormControl>

      <FormControl  id = "email" isRequired>
         <FormLabel>Email</FormLabel>
         <Input
           placeholder = "Enter your Email"
           onChange = {(e) =>setEmail(e.target.value)}
         />
      </FormControl>

      <FormControl  id = "password" isRequired>
         <FormLabel>Password</FormLabel>
         <InputGroup>
         <Input
           type = { show? "text" : "password"}
           placeholder = "Enter your password"
           onChange = {(e) =>setPassword(e.target.value)}
         />
         <InputRightElement width = "4.5rem">
           <Button h = "1.75rem" size = "sm" onClick = {handleClick}>
             {show ? "Hide" : "Show"}
           </Button>
         </InputRightElement>
         </InputGroup>
      </FormControl>

      <FormControl  id = "password" isRequired>
         <FormLabel>Confirm Password</FormLabel>
         <InputGroup>
         <Input
           type = { show? "text" : "password"}
           placeholder = "Confirm password"
           onChange = {(e) =>setConfirmPassword(e.target.value)}
         />
         <InputRightElement width = "4.5rem">
           <Button h = "1.75rem" size = "sm" onClick = {handleClick}>
             {show ? "Hide" : "Show"}
           </Button>
         </InputRightElement>
         </InputGroup>
      </FormControl>

      <FormControl id = "pic">
        <FormLabel>Upload your picture</FormLabel>
        <Input
          type = "file"
          p = {1.5}
          accept = "image/**"
          onChange = {(e) => postDetails(e.target.files[0])}
        />
      </FormControl>

      <Button
        colorScheme='blue'
        width = "100%"
        style = {{ marginTop: 15}}
        onClick = {submitHandler}
        isLoading = {loading}
      >
        Sign Up
      </Button>
    </VStack>
  )
}

export default Signup
