import { Box } from "@chakra-ui/react";
import SideDrawer from "../components/miscellaneous/SideDrawer.jsx";
import MyChats from "../components/MyChats.jsx";
import ChatBox from "../components/ChatBox.jsx";
import { GetYourData } from "../utils/helper.js";
import { useState } from "react";
import AccessDenied from "./AccessDenied.jsx";


const ChatPage = () => {

  const data = GetYourData();
  const [fetchAgain, setFetchAgain] = useState(false);
 
  if(data.isLoggedIn === true){
    return (
      <>
        <div style = {{ width: "100%" }}>
           { <SideDrawer/>}
           <Box 
             display = "flex"
             justifyContent = "space-between"
             w = "100%"
             h = "91.5vh"
             p = "10px"
           >
            {  data && <MyChats fetchAgain = {fetchAgain}/>}
            {  data && <ChatBox fetchAgain = {fetchAgain} setFetchAgain = {setFetchAgain}/>}
           </Box>
        </div>
        </>
      )
  }else{
    <AccessDenied/>
  }
 
}

export default ChatPage
