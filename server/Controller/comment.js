import comment from "../Modals/comment.js";
import mongoose from "mongoose";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

const abusiveWords = [
  "idiot",
  "stupid",
  "moron",
  "loser",
  "fool",
  "dumb",
  "shut up",
  "hate you",
];

export const postcomment = async (req, res) => {
  try {
    const { commentbody } = req.body;

    if (!commentbody || !commentbody.trim()) {
      return res.status(400).json({
        message: "Comment cannot be empty",
      });
    }

    if (containsAbusiveWords(commentbody)) {
      return res.status(400).json({
        comment: false,
        blocked: true,
        message: "Comment contains inappropriate language",
      });
    }
    if (isSpamComment(commentbody)) {
      return res.status(400).json({
        comment: false,
        spam: true,
        message: "Spam comment is not allowed",
      });
    }
    const existingComment = await comment.findOne({
      userid: req.body.userid,
      videoid: req.body.videoid,
      commentbody: commentbody.trim(),
    });

    if (existingComment) {
      return res.status(400).json({
        comment: false,
        spam: true,
        message: "You have already posted this comment.",
      });
    }

    const postcomment = new comment(req.body);

    await postcomment.save();

    return res.status(200).json({
      comment: true,
      message: "Comment posted successfully",
    });
  } catch (error) {
    console.log("comment error :", error);

    return res.status(500).json({
      message: "comment error...",
    });
  }
};
export const getAllcomment = async (req, res) => {
  const { videoid } = req.params;

  try {
    const commentvideo = await comment
      .find({ videoid: videoid })
      .populate("userid", "name");

    return res.status(200).json(commentvideo);
  } catch (error) {
    console.error("comment error :", error);
    return res.status(500).json({ message: "comment error..." });
  }
};
export const likecomment = async (req, res) => {
  try {
    const { id } = req.params;
    const { userid } = req.body;

    const existingComment = await comment.findById(id);

    if (!existingComment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    const alreadyLiked = existingComment.likes.includes(userid);

    if (alreadyLiked) {
      existingComment.likes = existingComment.likes.filter(
        (userId) => userId.toString() !== userid,
      );
    } else {
      existingComment.likes.push(userid);

      // Remove dislike if user had disliked
      existingComment.dislikes = existingComment.dislikes.filter(
        (userId) => userId.toString() !== userid,
      );
    }

    await existingComment.save();

    return res.status(200).json({
      success: true,
      likes: existingComment.likes,
      dislikes: existingComment.dislikes,
    });
  } catch (error) {
    console.error("like comment error:", error);

    return res.status(500).json({
      message: "Unable to like comment",
    });
  }
};
export const deletecomment = async (req, res) => {
  const { id: _id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unvailable");
  }
  try {
    await comment.findByIdAndDelete(_id);
    return res.status(200).json({ comment: true });
  } catch (error) {
    console.error("comment error :", error);
    return res.status(500).json({ message: "comment error..." });
  }
};
export const editcomment = async (req, res) => {
  const { id: _id } = req.params;
  const { commentbody } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unvailable");
  }
  try {
    const updatecomment = await comment.findByIdAndUpdate(_id, {
      $set: { commentbody: commentbody },
    });
    return res.status(200).json(updatecomment);
  } catch (error) {
    console.error("comment error :", error);
    return res.status(500).json({ message: "comment error..." });
  }
};
const containsAbusiveWords = (text) => {
  const normalizedText = text.toLowerCase();

  return abusiveWords.some((word) =>
    normalizedText.includes(word.toLowerCase()),
  );
};
const isSpamComment = (text) => {
  const normalizedText = text.trim();

  // Repeated special characters
  if (/(.)\1{4,}/.test(normalizedText)) {
    return true;
  }

  return false;
};
export const translatecomment = async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({
        success: false,
        message: "Text and target language are required",
      });
    }

    const prompt = `Translate the following comment into ${targetLanguage}.
Return only the translated text, without explanation.

Comment:
${text}`;

    const result = await model.generateContent(prompt);

    const translation = result.response.text().trim();

    return res.status(200).json({
      success: true,
      translation,
    });
  } catch (error) {
    console.error("Translation error:", error);

    return res.status(500).json({
      success: false,
      message: "Translation failed",
    });
  }
};
export const dislikecomment = async (req, res) => {
  try {
    const { id } = req.params;
    const { userid } = req.body;

    const existingComment = await comment.findById(id);

    if (!existingComment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    const alreadyDisliked = existingComment.dislikes.some(
      (userId) => userId.toString() === userid,
    );

    if (alreadyDisliked) {
      existingComment.dislikes = existingComment.dislikes.filter(
        (userId) => userId.toString() !== userid,
      );
    } else {
      existingComment.dislikes.push(userid);

      // Remove like if user had already liked
      existingComment.likes = existingComment.likes.filter(
        (userId) => userId.toString() !== userid,
      );
    }

    await existingComment.save();

    return res.status(200).json({
      success: true,
      likes: existingComment.likes,
      dislikes: existingComment.dislikes,
    });
  } catch (error) {
    console.error("Dislike error:", error);

    return res.status(500).json({
      message: "Error disliking comment",
    });
  }
};
export const reportcomment = async (req, res) => {
  try {
    const { id } = req.params;

    const existingComment = await comment.findById(id);

    if (!existingComment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    existingComment.reported = true;

    await existingComment.save();

    return res.status(200).json({
      success: true,
      message: "Comment reported successfully",
    });
  } catch (error) {
    console.error("Report error:", error);

    return res.status(500).json({
      message: "Error reporting comment",
    });
  }
};
