import { generateToken } from "../config/generateToken.js";
import User from "../models/userModel.js";

export const registerUser = async (req, res) =>{
   const { name, email, password, picture } = req.body;

   if(!name || !email || !password) {
    res.status(400);
    throw new Error("Please enter all the required fields");
   }
   
   const userExists = await User.findOne({email: email});

   if(userExists) {
    res.status(400);
    throw new Error("User already exists");
   }

   const user = await User.create({
    name, email, password, picture,
   })

   const token = generateToken(user._id)

   if(user){
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        pic: user.picture,
        jwt: token ,
      })

   }else{
    throw new Error("Failed to create user");
   }}

export const authUser = async(req, res) =>{
    const { email, password } = req.body;

    const user = await User.findOne({email: email});

    const token =  generateToken(user._id);

    const updatedUser = await User.findOneAndUpdate({
        email: email,
    },
    {$set:{jwt: token}},
    {new: true}
    )

    if(user && user.matchPassword(password)){
        res.status(200).json({
            data: {
                jwt : updatedUser.jwt,
                name: updatedUser.name,
                picture: updatedUser.picture,
                email: updatedUser.email,
                _id: updatedUser._id
            },     
            message: "Logged in successfully"
        });
    }
}

// /api/user?search={name}

export const allUsers = async (req, res) =>{ 
    const keyword = req.query.search ? {
        $or: [
            { name: { $regex: req.query.search, $options: "i"}},
            { email: { $regex: req.query.search, $options: "i"}},
        ]
    }: {

    }
 
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id }});

    res.status(200).json({
        users: users
    })
}