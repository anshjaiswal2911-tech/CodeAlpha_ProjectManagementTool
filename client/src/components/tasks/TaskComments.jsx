import React, { useState, useEffect } from 'react';
import { Send, Trash2, MessageSquare, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import Avatar from '../common/Avatar';

export const TaskComments = ({ taskId, projectId }) => {
  const { user: currentUser } = useAuth();
  const { socket } = useSocket();

  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/tasks/${taskId}/comments`);
        if (res.data.success) {
          setComments(res.data.comments);
        }
      } catch (err) {
        console.error('Failed to fetch comments:', err);
      } finally {
        setLoading(false);
      }
    };

    if (taskId) {
      fetchComments();
    }
  }, [taskId]);

  // Real-time socket comment listener
  useEffect(() => {
    if (!socket) return;

    const handleCommentAdded = ({ taskId: incomingTaskId, comment }) => {
      if (incomingTaskId === taskId) {
        setComments((prev) => {
          const exists = prev.some((c) => c._id === comment._id);
          return exists ? prev : [...prev, comment];
        });
      }
    };

    const handleCommentDeleted = ({ taskId: incomingTaskId, commentId }) => {
      if (incomingTaskId === taskId) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
      }
    };

    socket.on('comment:added', handleCommentAdded);
    socket.on('comment:deleted', handleCommentDeleted);

    return () => {
      socket.off('comment:added', handleCommentAdded);
      socket.off('comment:deleted', handleCommentDeleted);
    };
  }, [socket, taskId]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!content.trim()) return;

    try {
      setSubmitting(true);
      setError('');
      const res = await api.post(`/tasks/${taskId}/comments`, { content });
      if (res.data.success) {
        // Add if not already added by socket
        setComments((prev) => {
          const exists = prev.some((c) => c._id === res.data.comment._id);
          return exists ? prev : [...prev, res.data.comment];
        });
        setContent('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete comment');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-800 pb-2 border-b border-slate-100">
        <MessageSquare className="w-4 h-4 text-brand-600" />
        <span>Discussion & Activity ({comments.length})</span>
      </div>

      {error && (
        <div className="p-2 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
          {error}
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {loading ? (
          <div className="py-4 text-center text-xs text-slate-400">Loading discussion...</div>
        ) : comments.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No comments yet. Start the conversation!
          </div>
        ) : (
          comments.map((c) => {
            const isAuthor =
              c.author?._id === currentUser?._id || c.author === currentUser?._id;
            const timeAgo = c.createdAt
              ? formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })
              : 'just now';

            return (
              <div
                key={c._id}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100 group"
              >
                <Avatar user={c.author} size="xs" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-800 truncate">
                        {c.author?.name || 'User'}
                      </span>
                      <span className="text-[11px] text-slate-400">{timeAgo}</span>
                    </div>

                    {isAuthor && (
                      <button
                        onClick={() => handleDelete(c._id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition-opacity"
                        title="Delete Comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                    {c.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add comment input */}
      <form onSubmit={handleSubmit} className="flex gap-2 pt-2">
        <textarea
          rows={2}
          placeholder="Write a comment... (Shift + Enter for new line)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          className="flex-1 px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="self-end px-3.5 py-2 text-xs sm:text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs disabled:opacity-50 inline-flex items-center gap-1.5 transition-colors"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};

export default TaskComments;
