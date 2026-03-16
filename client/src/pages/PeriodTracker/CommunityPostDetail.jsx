import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { communityPosts as seedPosts } from "../../data/communityPosts";
import "./CommunityPostDetail.css";

const POSTS_KEY = "safeher_community_posts";
const REPLIES_KEY = "safeher_community_replies";

const relativeTime = (iso) => {
  const timestamp = new Date(iso).getTime();
  if (!timestamp) return "Just now";
  const diffHours = Math.max(1, Math.floor((Date.now() - timestamp) / (1000 * 60 * 60)));
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  const days = Math.floor(diffHours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

export default function CommunityPostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [replyMap, setReplyMap] = useState({});
  const [replyText, setReplyText] = useState("");
  const [anonymousReply, setAnonymousReply] = useState(false);

  useEffect(() => {
    const storedPosts = JSON.parse(localStorage.getItem(POSTS_KEY) || "null");
    const storedReplies = JSON.parse(localStorage.getItem(REPLIES_KEY) || "{}");
    const postsData = Array.isArray(storedPosts) && storedPosts.length ? storedPosts : seedPosts;
    if (!storedPosts || !storedPosts.length) {
      localStorage.setItem(POSTS_KEY, JSON.stringify(postsData));
    }
    setPosts(postsData);
    setReplyMap(storedReplies || {});
  }, []);

  const post = useMemo(() => posts.find((item) => item.id === postId), [posts, postId]);
  const replies = useMemo(() => (Array.isArray(replyMap[postId]) ? replyMap[postId] : []), [replyMap, postId]);

  const likePost = () => {
    const nextPosts = posts.map((item) =>
      item.id === postId ? { ...item, likes: Number(item.likes || 0) + 1 } : item
    );
    setPosts(nextPosts);
    localStorage.setItem(POSTS_KEY, JSON.stringify(nextPosts));
  };

  const submitReply = (event) => {
    event.preventDefault();
    const text = replyText.trim();
    if (!text) return;

    const newReply = {
      id: `reply-${Date.now()}`,
      user: anonymousReply ? "Anonymous Mom" : "You",
      content: text,
      createdAt: new Date().toISOString(),
      isAnonymous: anonymousReply,
    };

    const currentReplies = Array.isArray(replyMap[postId]) ? replyMap[postId] : [];
    const nextReplyMap = { ...replyMap, [postId]: [...currentReplies, newReply] };
    setReplyMap(nextReplyMap);
    localStorage.setItem(REPLIES_KEY, JSON.stringify(nextReplyMap));

    const nextPosts = posts.map((item) =>
      item.id === postId ? { ...item, replies: (item.replies || 0) + 1 } : item
    );
    setPosts(nextPosts);
    localStorage.setItem(POSTS_KEY, JSON.stringify(nextPosts));

    setReplyText("");
    setAnonymousReply(false);
  };

  if (!post) {
    return (
      <section className="community-post-page">
        <button type="button" className="community-back-btn" onClick={() => navigate("/pregnancy/community")}>
          ← Back
        </button>
        <div className="community-not-found">Post not found.</div>
      </section>
    );
  }

  return (
    <section className="community-post-page">
      <button type="button" className="community-back-btn" onClick={() => navigate("/pregnancy/community")}>
        ← Back
      </button>

      <article className="community-post-card">
        <div className="community-post-meta">
          <strong>{post.user}</strong>
          <span>{post.trimester}</span>
          <span>Week {post.pregnancyWeek}</span>
          <small>{relativeTime(post.createdAt)}</small>
        </div>
        <h1>{post.title}</h1>
        <p>{post.content}</p>
        <div className="community-post-actions">
          <button type="button" onClick={likePost}>👍 {post.likes}</button>
          <span>💬 {replies.length} replies</span>
          <span>{post.category || "General"}</span>
        </div>
      </article>

      <article className="community-replies-card">
        <h3>Discussion Thread</h3>
        <div className="community-reply-list">
          {replies.length ? (
            replies.map((reply) => (
              <div className="community-reply-item" key={reply.id}>
                <div className="community-reply-head">
                  <strong>{reply.user}</strong>
                  <small>{relativeTime(reply.createdAt)}</small>
                </div>
                <p>{reply.content}</p>
              </div>
            ))
          ) : (
            <p className="community-empty-thread">No replies yet. Be the first to respond.</p>
          )}
        </div>

        <form className="community-reply-form" onSubmit={submitReply}>
          <textarea
            rows={3}
            value={replyText}
            onChange={(event) => setReplyText(event.target.value)}
            placeholder="Write your reply..."
          />
          <div className="community-reply-anon-row">
            <label className="community-reply-anon">
              <input
                type="checkbox"
                checked={anonymousReply}
                onChange={(event) => setAnonymousReply(event.target.checked)}
              />
              <span>Reply anonymously</span>
            </label>
          </div>
          <button type="submit">Post Reply</button>
        </form>
      </article>
    </section>
  );
}
