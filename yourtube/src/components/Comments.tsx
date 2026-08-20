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
      <div className="flex justify-center items-center h-[70vh]">
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
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-2">{comments.length} Comments</h2>
      <div className="flex items-center gap-2 mb-4">
        <label className="text-sm font-medium">Translate to:</label>

        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="border rounded-md px-2 py-1 text-sm bg-background"
        >
          <option value="Hindi">Hindi</option>
          <option value="English">English</option>
          <option value="Gujarati">Gujarati</option>
          <option value="Marathi">Marathi</option>
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
        </select>
      </div>
      {user && (
        <div className="flex">
          <Avatar>
            <AvatarImage src={user.image || ""} alt={user.name} />
            <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Add  a comment..."
              value={newComment}
              onChange={(e: any) => setNewComment(e.target.value)}
              className="min-h-20 resize-none border-0 border-b-2 rounded-none focus-visible:ring-0"
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="shareLocation"
                checked={shareLocation}
                onChange={(e) => setShareLocation(e.target.checked)}
              />
              <label
                htmlFor="shareLocation"
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Share my location
              </label>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => setNewComment("")}
                disabled={!newComment.trim()}
                variant="ghost"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}
              >
                Comment
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="flex gap-4">
              <Avatar>
                <AvatarFallback>
                  {comment.usercommented?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">
                    {comment.usercommented}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.commentedon))} ago
                  </span>
                </div>
                {editingCommentId === comment._id ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                    ></Textarea>
                    <div className="flex justify-end gap-2">
                      <Button onClick={handleUpdateComment}>Save</Button>
                      <Button
                        variant="ghost"
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
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm flex-1">{comment.commentbody}</p>
                      {translatedComments[comment._id] && (
                        <p className="text-sm mt-2 p-2 rounded-md bg-muted">
                          {translatedComments[comment._id]}
                        </p>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTranslate(comment)}
                        disabled={translatingCommentId === comment._id}
                      >
                        {translatingCommentId === comment._id
                          ? "Translating..."
                          : "Translate"}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(comment._id)}
                        className="flex items-center gap-1 shrink-0"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        {comment.likes?.length || 0}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDislike(comment._id)}
                        className="flex items-center gap-1 shrink-0"
                      >
                        <ThumbsDown className="h-4 w-4" />
                        {comment.dislikes?.length || 0}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReport(comment._id)}
                        disabled={comment.reported}
                      >
                        {comment.reported ? "Reported" : "Report"}
                      </Button>
                    </div>
                    {user &&
                      (typeof comment.userid === "string"
                        ? comment.userid === user._id
                        : comment.userid._id === user._id) && (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(comment)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(comment._id)}
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
