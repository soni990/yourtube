"use client";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/authContext";
import axiosinstance from "@/lib/axiosinstance";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface Comment {
  _id: string;
  videoid: string;
  userid:
    | string
    | {
        _id: string;
        username: string;
      };
  commentbody: string;
  usercommented: string;
  commentedon: string;
  likes: string[];
  dislikes: string[];
  reported: boolean;
}
const Comments = ({ videoId }: any) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [shareLocation, setShareLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(true);
  const [translatedComments, setTranslatedComments] = useState<
    Record<string, string>
  >({});
  const [translatingCommentId, setTranslatingCommentId] = useState<
    string | null
  >(null);
  const [selectedLanguage, setSelectedLanguage] = useState("Hindi");
  const { user }: any = useUser();

  useEffect(() => {
    loadComments();
  }, [videoId]);
  const loadComments = async () => {
    try {
      const res = await axiosinstance.get(`/comment/${videoId}`);
      setComments(res.data);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh] px-4 text-center">
  Loading videos...
</div>
    );
  }
  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);

    try {
      let location = null;

      if (shareLocation) {
        try {
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject);
            },
          );

          location = `${position.coords.latitude},${position.coords.longitude}`;
        } catch (error) {
          console.error("Location permission denied:", error);
        }
      }

      const res = await axiosinstance.post(`/comment/postcomment`, {
        videoid: videoId,
        userid: user._id,
        commentbody: newComment,
        usercommented: user.name,
        location: location,
      });

      if (res.data.comment) {
        setNewComment("");
        setShareLocation(false);
        await loadComments();
      }
    } catch (error: any) {
      if (error.response?.data?.blocked) {
        alert("⚠️ Comment contains inappropriate language.");
      } else if (error.response?.data?.spam) {
        alert("⚠️ Spam comment is not allowed.");
      } else {
        alert("Failed to post comment. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (comment: Comment) => {
    setEditingCommentId(comment._id);
    setEditText(comment.commentbody);
  };

  const handleUpdateComment = async () => {
    if (!editText.trim()) return;

    try {
      const res = await axiosinstance.post(
        `/comment/editcomment/${editingCommentId}`,
        { commentbody: editText },
      );
      if (res.status === 200) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === editingCommentId ? { ...c, commentbody: editText } : c,
          ),
        );

        setEditingCommentId(null);
        setEditText("");
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleLike = async (commentId: string) => {
    if (!user) {
      alert("Please login to like a comment.");
      return;
    }

    try {
      const res = await axiosinstance.post(
        `/comment/likecomment/${commentId}`,
        {
          userid: user._id,
        },
      );

      if (res.data.success) {
        setComments((prev) =>
          prev.map((comment) =>
            comment._id === commentId
              ? {
                  ...comment,
                  likes: res.data.likes,
                  dislikes: res.data.dislikes,
                }
              : comment,
          ),
        );
      }
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };
  const handleDislike = async (commentId: string) => {
    if (!user) {
      alert("Please login to dislike a comment.");
      return;
    }

    try {
      const res = await axiosinstance.post(
        `/comment/dislikecomment/${commentId}`,
        {
          userid: user._id,
        },
      );

      if (res.data.success) {
        setComments((prev) =>
          prev.map((comment) =>
            comment._id === commentId
              ? {
                  ...comment,
                  likes: res.data.likes,
                  dislikes: res.data.dislikes,
                }
              : comment,
          ),
        );
      }
    } catch (error) {
      console.error("Error disliking comment:", error);
    }
  };
  const handleReport = async (commentId: string) => {
    if (!user) {
      alert("Please login to report a comment.");
      return;
    }

    try {
      const res = await axiosinstance.post(
        `/comment/reportcomment/${commentId}`,
        {
          userid: user._id,
        },
      );

      if (res.data.success) {
        alert("Comment reported successfully.");

        setComments((prev) =>
          prev.map((comment) =>
            comment._id === commentId
              ? { ...comment, reported: true }
              : comment,
          ),
        );
      }
    } catch (error) {
      console.error("Error reporting comment:", error);
      alert("Failed to report comment.");
    }
  };
  const handleTranslate = async (comment: Comment) => {
    if (!selectedLanguage) return;

    setTranslatingCommentId(comment._id);

    try {
      const res = await axiosinstance.post("/comment/translatecomment", {
        text: comment.commentbody,
        targetLanguage: selectedLanguage,
      });

      if (res.data.success) {
        setTranslatedComments((prev) => ({
          ...prev,
          [comment._id]: res.data.translation,
        }));
      }
    } catch (error) {
      console.error("Translation error:", error);
      alert("Failed to translate comment.");
    } finally {
      setTranslatingCommentId(null);
    }
  };
  const handleDelete = async (id: string) => {
    try {
      const res = await axiosinstance.delete(`/comment/deletecomment/${id}`);

      if (res.data.comment) {
        setComments((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (error) {
      console.error("Error delete comment:", error);
    }
  };
  return (

<div className="mt-3 w-full min-w-0 sm:mt-4">
  {/* Comments Heading */}
  <h2 className="mb-2 text-base font-semibold sm:mb-3 sm:text-xl">
    {comments.length} Comments
  </h2>

  {/* Translation */}
  <div className="mb-3 flex flex-wrap items-center gap-1.5 sm:mb-4 sm:gap-2">
    <label className="text-xs font-medium sm:text-sm">
      Translate to:
    </label>

    <select
      value={selectedLanguage}
      onChange={(e) => setSelectedLanguage(e.target.value)}
      className="rounded-md border bg-background px-2 py-1 text-xs outline-none sm:text-sm"
    >
      <option value="Hindi">Hindi</option>
      <option value="English">English</option>
      <option value="Gujarati">Gujarati</option>
      <option value="Marathi">Marathi</option>
      <option value="Spanish">Spanish</option>
      <option value="French">French</option>
    </select>
  </div>

  {/* Add Comment */}
  {user && (
    <div className="flex items-start gap-2 sm:gap-3">
      {/* User Avatar */}
      <Avatar className="h-8 w-8 shrink-0 sm:h-10 sm:w-10">
        <AvatarImage
          src={user.image || ""}
          alt={user.name}
        />
        <AvatarFallback>
          {user.name?.[0] || "U"}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1 space-y-2">
        {/* Comment Input */}
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e: any) => setNewComment(e.target.value)}
          className="min-h-16 resize-none rounded-none border-0 border-b-2 px-1 text-xs focus-visible:ring-0 sm:min-h-20 sm:text-sm"
        />

        {/* Share Location */}
        <div className="flex items-center gap-1.5">
          <input
            type="checkbox"
            id="shareLocation"
            checked={shareLocation}
            onChange={(e) =>
              setShareLocation(e.target.checked)
            }
            className="h-3.5 w-3.5 sm:h-4 sm:w-4"
          />

          <label
            htmlFor="shareLocation"
            className="cursor-pointer text-xs text-muted-foreground sm:text-sm"
          >
            Share my location
          </label>
        </div>

        {/* Comment Buttons */}
        <div className="flex justify-end gap-1.5 sm:gap-2">
          <Button
            onClick={() => setNewComment("")}
            disabled={!newComment.trim()}
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || isSubmitting}
            size="sm"
            className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
          >
            Comment
          </Button>
        </div>
      </div>
    </div>
  )}

  {/* Comments List */}
  <div className="mt-4 space-y-4 sm:mt-6 sm:space-y-6">
    {comments.length === 0 ? (
      <p className="text-xs italic text-muted-foreground sm:text-sm">
        No comments yet. Be the first to comment!
      </p>
    ) : (
      comments.map((comment) => (
        <div
          key={comment._id}
          className="flex min-w-0 gap-2 sm:gap-4"
        >
          {/* Comment Avatar */}
          <Avatar className="h-8 w-8 shrink-0 sm:h-10 sm:w-10">
            <AvatarFallback>
              {comment.usercommented?.[0] || "U"}
            </AvatarFallback>
          </Avatar>

          {/* Comment Content */}
          <div className="min-w-0 flex-1">
            {/* Username + Time */}
            <div className="mb-1 flex min-w-0 flex-wrap items-center gap-1 sm:gap-2">
              <span className="max-w-full break-words text-xs font-semibold sm:text-sm">
                {comment.usercommented}
              </span>

              <span className="text-[10px] text-muted-foreground sm:text-xs">
                {formatDistanceToNow(
                  new Date(comment.commentedon)
                )}{" "}
                ago
              </span>
            </div>

            {/* Edit Mode */}
            {editingCommentId === comment._id ? (
              <div className="space-y-2 sm:space-y-3">
                <Textarea
                  value={editText}
                  onChange={(e) =>
                    setEditText(e.target.value)
                  }
                  className="text-xs sm:text-sm"
                />

                <div className="flex justify-end gap-1.5 sm:gap-2">
                  <Button
                    onClick={handleUpdateComment}
                    size="sm"
                    className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
                  >
                    Save
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
                    onClick={() => {
                      setEditingCommentId(null);
                      setEditText("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Comment Text */}
                <p className="break-words text-xs leading-relaxed sm:text-sm">
                  {comment.commentbody}
                </p>

                {/* Translation Result */}
                {translatedComments[comment._id] && (
                  <p className="mt-2 break-words rounded-md bg-muted p-2 text-xs sm:text-sm">
                    {translatedComments[comment._id]}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="mt-2 flex flex-wrap items-center gap-1 sm:mt-3 sm:gap-2">
                  {/* Translate */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleTranslate(comment)
                    }
                    disabled={
                      translatingCommentId === comment._id
                    }
                    className="h-7 px-2 text-[11px] sm:h-8 sm:px-3 sm:text-xs"
                  >
                    {translatingCommentId === comment._id
                      ? "Translating..."
                      : "Translate"}
                  </Button>

                  {/* Like */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleLike(comment._id)
                    }
                    className="h-7 gap-1 px-2 text-[11px] sm:h-8 sm:text-xs"
                  >
                    <ThumbsUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {comment.likes?.length || 0}
                  </Button>

                  {/* Dislike */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleDislike(comment._id)
                    }
                    className="h-7 gap-1 px-2 text-[11px] sm:h-8 sm:text-xs"
                  >
                    <ThumbsDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {comment.dislikes?.length || 0}
                  </Button>

                  {/* Report */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleReport(comment._id)
                    }
                    disabled={comment.reported}
                    className="h-7 px-2 text-[11px] sm:h-8 sm:px-3 sm:text-xs"
                  >
                    {comment.reported
                      ? "Reported"
                      : "Report"}
                  </Button>
                </div>

                {/* Edit / Delete */}
                {user &&
                  (typeof comment.userid === "string"
                    ? comment.userid === user._id
                    : comment.userid?._id === user._id) && (
                    <div className="mt-1 flex flex-wrap gap-1 sm:mt-2 sm:gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleEdit(comment)
                        }
                        className="h-7 px-2 text-[11px] sm:h-8 sm:px-3 sm:text-xs"
                      >
                        Edit
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleDelete(comment._id)
                        }
                        className="h-7 px-2 text-[11px] sm:h-8 sm:px-3 sm:text-xs"
                      >
                        Delete
                      </Button>
                    </div>
                  )}
              </>
            )}
          </div>
        </div>
      ))
    )}
  </div>
</div>
  );
};

export default Comments;
