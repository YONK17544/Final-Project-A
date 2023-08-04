import ScrollableFeed from "react-scrollable-feed";
import { GetYourData } from "../utils/helper";
import { isLastMessage, isSameSender, isSameSenderMargin, isSameUser } from "../config/ChatLogic";
import { Avatar, Tooltip } from "@chakra-ui/react";

const ScrollableChat = ({ messages }) => {

    const data = GetYourData();

  return (
    <ScrollableFeed>
      { messages && messages.map((m, i) =>{
          return (
            <div style = {{display: "flex"}} key = {m._id}>
               {
                (isSameSender(messages, m, i, data._id)||
                isLastMessage(messages, i, data._id)) && 
                (
                    <Tooltip
                     label = {m.sender.name}
                     place = "bottom-start"
                     hasArrow
                    >
                       <Avatar
                  mt="7px"
                  mr={1}
                  size="sm"
                  cursor="pointer"
                  name={m.sender.name}
                  src={m.sender.pic}
                />
                    </Tooltip>
                )
               }

               <span
                 style = {{
                    backgroundColor: `${
                        m.sender._id === data._id ?  "#BEE3F8" : "#B9F5D0"
                    }`,
                    borderRadius: "20px",
                    padding: "5px 15px",
                    maxWidth: "75%",
                    marginLeft: isSameSenderMargin(messages, m, i, data._id),
                    marginTop: isSameUser(messages, m, i, data._id) ? 3 : 10,
                 }}
               >
                 {m.content}
               </span>
            </div>
          )
      })}
    </ScrollableFeed>
  )
}

export default ScrollableChat
