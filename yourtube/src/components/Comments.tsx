"use client";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/authContext";
import axiosinstance from "@/lib/axiosinstance";
interface Comment {
  _id: string;
  videoid: string;
  userid: string;
  commentbody: string;
  usercommented: string;
  commentedon: string;
}
const Comments = ({ videoId }: any) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(true);
  const { user }: any = useUser();
  // const user: any = {
  //   id: "1",
  //   name: "John Doe",
  //   email: "john@example.com",
  //     image:"https://avatars.githubusercontent.com/u/124599?v=4",
  // };

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
      const res = await axiosinstance.post(`/comment/postcomment`, {
        videoid: videoId,
        userid: user._id,
        commentbody: newComment,
        usercommented: user.name,
      });
      if (res.data.comment) {
        setNewComment("");
        await loadComments();
      }
    } catch (error) {
      console.error("Error adding comment:", error);
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
          <p className="text-sm text-gray-500 italic">
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
                  <span className="text-xs text-gray-500">
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
                      <Button onClick={handleUpdateComment}>
                        Save
                      </Button>
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
                    <p className="text-sm mb-3">{comment.commentbody}</p>
                    {comment.userid === user._id && (
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
