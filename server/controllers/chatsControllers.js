import Chat from "../models/chatModel.js";
import User from "../models/userModel.js";

export const accessChat = async(req, res) =>{
    const { userId } = req.body;

    if(!userId){
        console.log("UserId param not sent with request");
        return res.sendStatus(400);
    }

    var isChat = await Chat.find({
        isGroupChat: false,
        $and:[
            { users: { $elemMatch: { $eq: req.user._id}}},
            { users: { $elemMatch: { $eq: userId}}},
        ]
    }).populate("users", "-password").populate("latestMessage");

    isChat = await User.populate( isChat, {
        path: "latestMessage.sender",
        select: "name pic email"
    });

    if (isChat.length > 0) {
        res.send(isChat[0]);
    }else{
        var chatdata = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId]
        };

        try {
            const createdChat = await Chat.create(chatdata);

            const FullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password")

            res.status(200).json({
                 chat: {
                    FullChat
                 } 
            });
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    }
}

export const fetchChats = async (req, res) => {
    try {
        Chat.find({users: { $elemMatch:{ $eq: req.user._id }}})
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        .populate("latestMessage")
        .sort({ updatedAt: -1 })
        .then(async(results) =>{
             results = await User.populate( results , {
                path: "latestMessage.sender",
                select: "name pic email"
            })

            res.status(200).json({
                results: results
            });
        })

    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
}

export const createGroupChats = async(req, res) => {
    try {
        if(!req.body.users || !req.body.name){
            return res.status(400).send({message:"Please fill out all the fields."});
        }

        var users = JSON.parse(req.body.users);

        if(users.length < 2){
            return res.status(400).send({message:"More than 2 users are needed to form a group chat"});
        }

        users.push(req.user);

        try {
            const groupChat = await Chat.create({
                chatName: req.body.name,
                users: users,
                isGroupChat: true,
                groupAdmin: req.user
            })

            const fullGroupChat = await Chat.findOne({_id: groupChat._id})
              .populate("users", "-password")
              .populate("groupAdmin", "-password");

              res.status(200).json({fullGroupChat : fullGroupChat});
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }

         
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
}

export const renameGroupChat = async( req, res ) =>{
   
    const { chatId, chatName } = req.body;

    const updatedChat = await Chat.findOneAndUpdate(
        {_id: chatId},
        {
            $set: { chatName: chatName }
        },
        {new:true}
    ).populate("users", "-password")
    .populate("groupAdmin", "-password");

    if(!updatedChat){
        res.status(400);
        throw new Error(error.message);
    }else{
        res.status(200).json({updatedChat : updatedChat});
    }
}

export const addToGroup = async(req, res) =>{
    const { chatId, userId } = req.body;

    const added = await Chat.findOneAndUpdate(
        { _id: chatId },
        { $push: { users: userId }},
        {new: true}
    ).populate("users", "-password")
    .populate("groupAdmin", "-password");

    if(!added){
        res.status(400);
        throw new Error(error.message);
    }else{
        res.status(200).json({added: added});
    }
}

export const removeFromGroup = async( req, res ) =>{
    const { chatId, userId } = req.body;

    const removed = await Chat.findOneAndUpdate(
        { _id: chatId },
        { $pull : { users: userId }},
        {new: true}
    ).populate("users", "-password")
    .populate("groupAdmin", "-password");

    if(!removed ){
        res.status(400);
        throw new Error(error.message);
    }else{
        res.status(200).json({removed : removed});
    }
}