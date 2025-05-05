import cloudinary from "../lib/cloudinary.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getUsersForSiderbar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password")
        res.status(200).json(filteredUsers);
    } catch (error) {
        console.log("Error in getUsersForSiderbar controller", error.message)
        res.status(500).json({ message: "Internal server error" })

    }
}


export const getMessages = async () => {
    try {
        const { id: userToChatId } = req.params
        const myId = req.user._id; //us user

        //  find all the messages
        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        })

        res.status(200).json(messages)
    } catch (error) {
        console.log("Error in getMessages controller", error.message)
        res.status(500).json({ message: "Internal server error" })
    }
}
export const sendMessage = async () => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;

        let imageUrl;
        if (image) {
            // upload base64 image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        })

        await newMessage.save();
        // todo: realtime functionality ==> socket.io
        res.status(201).json(newMessage)
    } catch (error) {
        console.log("Error in sendMessage controller", error.message)
        res.status(500).json({ message: "Internal server error" })
    }
}