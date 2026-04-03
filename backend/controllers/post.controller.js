import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Comment from "../models/comments.model.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";


export const activeCheck = async(req, res) =>{
    return res.status(200).json({message:"RUNNING"})
}


export const createPost = async(req, res) =>{
    const {token} = req.body;

    try {
const user = await User.findOne({token:token});
if(!user){
    return res.status(400).json({message:"Invalid Token"})
}

let mediaUrl = '';
    let filetype = '';
    if (req.file) {
      mediaUrl = await uploadBufferToCloudinary(
        req.file.buffer,
        req.file.mimetype,
        'proconnect/posts'
      );
      filetype = req.file.mimetype.split('/')[1] || '';
    }

const bodyText = typeof req.body.body === 'string' ? req.body.body.trim() : '';
    if (!bodyText && !mediaUrl) {
      return res.status(400).json({ message: 'Add some text or an image' });
    }

const post = new Post({
    userId:user._id,
    body: bodyText,
    media: mediaUrl,
    filetype
})

await post.save();
return res.status(200).json({message:"Post Created"})

        
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}

async function buildLikedByPreviewMap(posts) {
    const ids = [
        ...new Set(
            posts.flatMap((p) =>
                (p.likedByUsers || []).slice(0, 3).map((id) => String(id))
            )
        ),
    ];
    if (ids.length === 0) return {};
    const users = await User.find({ _id: { $in: ids } })
        .select("name")
        .lean();
    return Object.fromEntries(users.map((u) => [String(u._id), u.name]));
}

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("userId", "name username email profilePicture")
            .sort({ createdAt: -1 })
            .lean();

        const nameById = await buildLikedByPreviewMap(posts);

        const enriched = posts.map((p) => {
            const previewIds = (p.likedByUsers || []).slice(0, 3);
            const likedByPreview = previewIds.map(
                (id) => nameById[String(id)] || "Member"
            );
            return { ...p, likedByPreview };
        });

        const postIds = enriched.map((p) => p._id);
        if (postIds.length > 0) {
            const commentCounts = await Comment.aggregate([
                { $match: { postId: { $in: postIds } } },
                { $group: { _id: "$postId", n: { $sum: 1 } } },
            ]);
            const countMap = Object.fromEntries(
                commentCounts.map((c) => [String(c._id), c.n])
            );
            enriched.forEach((p) => {
                p.commentCount = countMap[String(p._id)] || 0;
            });
        } else {
            enriched.forEach((p) => {
                p.commentCount = 0;
            });
        }

        return res.status(200).json({ posts: enriched });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


export const deletePost = async(req, res) =>{
    const {token, post_id} = req.body;
    try {
        const user = await User.findOne({token:token}).select("_id");
        if(!user){
            return res.status(400).json({message:"Invalid Token"})
        }

        const post = await Post.findOne({_id:post_id});
        if(!post){
            return res.status(400).json({message:"Invalid Post"})
        }

        if(post.userId.toString() !== user._id.toString()){
            return res.status(400).json({message:"You are not authorized to delete this post"})
        }

        await Post.deleteOne({_id:post_id});
        return res.status(200).json({message:"Post Deleted"})

    } catch (error) {
        return res.status(500).json({message:error.message})
    }
}



export const get_comments_by_post= async(req, res) =>{
    const {post_id} = req.query;
    try {
        const post = await Post.findOne({_id:post_id})
        if(!post){
            return res.status(400).json({message:"Invalid Post"})
        }

const comments = await Comment.find({ postId: post._id })
            .sort({ createdAt: 1 })
            .populate("userId", "name username profilePicture");

        return res.status(200).json(comments);
    } catch (error) {
        return res.status(500).json({message:error.message})
    }
}


 export  const delete_comment_of_user =  async(req, res)=>{

const {token, comment_id} = req.body;
try {
    const  user = await User.findOne
    ({token:token}).select("_id");
    if(!user){
        return res.status(400).json({message:"User not found"})
    }

    const comment = await Comment.findOne({_id:
    comment_id});
    if(!comment){
        return res.status(400).json({message:"Invalid Comment"})
    }

    if(comment.userId.toString() !== user._id.toString()){
        return res.status(400).json({message:"You are not authorized to delete this comment"})
    }

    await Comment.deleteOne({_id:comment_id});
    return res.status(200).json({message:"Comment Deleted"})



 }catch(error){
     return res.status(500).json({message:error.message})
 }
 }

   // mongoose import karo agar nahi kiya hai

   export const toggle_like = async (req, res) => {
    const { post_id, token } = req.body;

    try {
        if (!token) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const authUser = await User.findOne({ token });
        if (!authUser) {
            return res.status(401).json({ message: "Invalid token" });
        }

        const post = await Post.findById(post_id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (!Array.isArray(post.likedByUsers)) {
            post.likedByUsers = [];
        } else {
            post.likedByUsers = post.likedByUsers.filter(id => id !== null && id !== undefined);
        }

        const userIdStr = authUser._id.toString();
        const likedUsersStr = post.likedByUsers.map(id => id.toString());

        if (likedUsersStr.includes(userIdStr)) {
            post.likes = Math.max(0, (post.likes || 0) - 1);
            post.likedByUsers = post.likedByUsers.filter(id => id.toString() !== userIdStr);
        } else {
            post.likes = (post.likes || 0) + 1;
            post.likedByUsers.push(authUser._id);
        }

        await post.save();

        const nowLiked = post.likedByUsers.some(
            (id) => id.toString() === userIdStr
        );
        const previewIds = post.likedByUsers.slice(0, 3);
        let likedByPreview = [];
        if (previewIds.length > 0) {
            const previewUsers = await User.find({ _id: { $in: previewIds } })
                .select("name")
                .lean();
            const nameMap = Object.fromEntries(
                previewUsers.map((u) => [String(u._id), u.name])
            );
            likedByPreview = previewIds.map(
                (id) => nameMap[String(id)] || "Member"
            );
        }

        return res.status(200).json({
            message: "Post Like Toggled",
            likes: post.likes,
            liked: nowLiked,
            likedByUsers: post.likedByUsers,
            likedByPreview,
        });
    } catch (error) {
        console.error("Toggle Like Error:", error);
        return res.status(500).json({ message: error.message });
    }
};
