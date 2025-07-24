import mongoose from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"



const userSchema = new mongoose.Schema({
    //_id is automatically created by mongoose so we don't need to define it
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    fullName: {
        type: String,
        required: true,
        trim: true
    },
    
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    refreshToken: {
        type: String,
    },
    profilePicture: {
        type: String,
        default: null,
    },
    todoList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task"
    }]
}, { timestamps: true });

//ensures that the password is bcrypted (ONLY if modified) before ("pre") saving 
userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
})

//to check password
userSchema.methods.isPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
}

//to sign and generate access token
userSchema.methods.generateAccessToken = function() {
    const signedToken = jwt.sign(
        {
            _id: this._id
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )

    return signedToken
}

userSchema.methods.generateRefreshToken = function() {
    const signedToken = jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )

    return signedToken
}

export const User = mongoose.model("User", userSchema);