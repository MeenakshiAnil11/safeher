import React, { useState } from "react";

const samplePosts = [
  {
    id: 1,
    author: "Anonymous User",
    title: "Tips for managing cramps?",
    content: "What are your go-to remedies for period cramps?",
    replies: [
      { author: "User2", content: "Heat pad and ibuprofen work wonders for me!" },
      { author: "User3", content: "Try yoga and drinking lots of water." }
    ]
  },
  {
    id: 2,
    author: "Anonymous User",
    title: "Irregular cycles - when to worry?",
    content: "My cycles have been irregular lately. Should I be concerned?",
    replies: [
      { author: "User4", content: "If it's been more than 3 months, definitely see a doctor." }
    ]
  },
  {
    id: 3,
    author: "Anonymous User",
    title: "Fertility tracking success stories",
    content: "Anyone successfully conceive using cycle tracking?",
    replies: [
      { author: "User5", content: "Yes! Tracking BBT and using ovulation tests helped me." }
    ]
  }
];

export default function CommunitySupport() {
  const [posts, setPosts] = useState(samplePosts);
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [showNewPost, setShowNewPost] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");

  const handleNewPost = () => {
    if (newPost.title && newPost.content) {
      const post = {
        id: posts.length + 1,
        author: "Anonymous User",
        title: newPost.title,
        content: newPost.content,
        replies: []
      };
      setPosts([post, ...posts]);
      setNewPost({ title: "", content: "" });
      setShowNewPost(false);
    }
  };

  const handleReply = (postId) => {
    if (replyContent.trim()) {
      setPosts(posts.map(post =>
        post.id === postId
          ? { ...post, replies: [...post.replies, { author: "Anonymous User", content: replyContent.trim() }] }
          : post
      ));
      setReplyContent("");
      setReplyingTo(null);
    }
  };

  return (
    <div className="community-support">
      <p>Connect with others for support, share experiences, and ask questions in a safe space.</p>

      <button className="btn-primary" onClick={() => setShowNewPost(!showNewPost)}>
        {showNewPost ? "Cancel" : "Start New Discussion"}
      </button>

      {showNewPost && (
        <div className="pt-card" style={{ marginTop: 16 }}>
          <input
            type="text"
            placeholder="Discussion Title"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            className="input"
          />
          <textarea
            rows="4"
            placeholder="Share your thoughts..."
            value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
            className="input"
          />
          <button onClick={handleNewPost} className="btn-primary">Post</button>
        </div>
      )}

      <div className="posts-list">
        {posts.map(post => (
          <div key={post.id} className="pt-card post-item">
            <h4>{post.title}</h4>
            <p><strong>{post.author}:</strong> {post.content}</p>
            {post.replies.length > 0 && (
              <div className="replies">
                <h5>Replies ({post.replies.length})</h5>
                {post.replies.map((reply, idx) => (
                  <div key={idx} className="reply">
                    <strong>{reply.author}:</strong> {reply.content}
                  </div>
                ))}
              </div>
            )}
            <button
              className="btn-primary"
              style={{ fontSize: "12px", padding: "4px 8px", marginTop: "8px" }}
              onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
            >
              Reply
            </button>
            {replyingTo === post.id && (
              <div style={{ marginTop: "8px" }}>
                <textarea
                  rows="2"
                  placeholder="Write your reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="input"
                  style={{ marginBottom: "4px" }}
                />
                <button
                  onClick={() => handleReply(post.id)}
                  className="btn-primary"
                  style={{ fontSize: "12px", padding: "4px 8px", marginRight: "4px" }}
                >
                  Post Reply
                </button>
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent("");
                  }}
                  className="btn-primary"
                  style={{ fontSize: "12px", padding: "4px 8px", backgroundColor: "#6b7280", borderColor: "#6b7280" }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="safety-note">
        <p><strong>Safety First:</strong> This community is moderated. All posts are anonymous. For personal medical advice, consult a healthcare professional.</p>
      </div>
    </div>
  );
}