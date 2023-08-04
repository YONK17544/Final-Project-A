import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true,
    },
    picture:{
        type: String,
        default:  "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    jwt:{
        type: String,
    }
    },{
        timestamps: true,
    });

    userSchema.pre('save', async function () {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    })
    
    userSchema.methods.matchPassword = async function (pass) {
    
        return bcrypt.compare(pass, this.password);
    }

const User = mongoose.model("User", userSchema);

export default User;