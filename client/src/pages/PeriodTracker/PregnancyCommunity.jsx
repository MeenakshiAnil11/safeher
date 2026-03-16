import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { communityPosts as seedPosts } from "../../data/communityPosts";
import "./PregnancyCommunity.css";

const GROUPS = [
  { id: "g1", title: "First Trimester Support", subtitle: "For moms in their first 12 weeks", members: "1,243 members", tone: "pink" },
  { id: "g2", title: "Second Trimester Moms", subtitle: "Weeks 13-27 discussion group", members: "2,156 members", tone: "purple" },
  { id: "g3", title: "Third Trimester & Labor Prep", subtitle: "Final stretch and birth preparation", members: "1,876 members", tone: "blue" },
  { id: "g4", title: "Working Moms", subtitle: "Balancing career and pregnancy", members: "892 members", tone: "green" },
  { id: "g5", title: "Fitness During Pregnancy", subtitle: "Exercise tips and motivation", members: "654 members", tone: "yellow" },
  { id: "g6", title: "Preparing for Multiples", subtitle: "Expecting twins, triplets, or more", members: "234 members", tone: "lavender" },
];

const ACTIVE_MEMBERS = ["Sarah M.", "Emily R.", "Jessica L.", "Amanda K.", "Rachel B."];

const POSTS_KEY = "safeher_community_posts";
const REPLIES_KEY = "safeher_community_replies";
const GROUPS_KEY = "safeher_joined_groups";

const toTrimesterLabel = (week) => {
  if (week <= 12) return "First Trimester";
  if (week <= 27) return "Second Trimester";
  return "Third Trimester";
};

const relativeTime = (iso) => {
  const timestamp = new Date(iso).getTime();
  if (!timestamp) return "Just now";
  const diffHours = Math.max(1, Math.floor((Date.now() - timestamp) / (1000 * 60 * 60)));
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  const days = Math.floor(diffHours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

const trimesterToneClass = (trimester = "") => {
  const value = String(trimester).toLowerCase();
  if (value.includes("first")) return "trimester-pink";
  if (value.includes("second")) return "trimester-teal";
  return "trimester-purple";
};

export default function PregnancyCommunity({ currentWeek = 20 }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState("discussions");
  const [posts, setPosts] = useState([]);
  const [replyMap, setReplyMap] = useState({});
  const [joinedGroups, setJoinedGroups] = useState({});
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "General",
    anonymous: false,
  });

  useEffect(() => {
    const savedPosts = JSON.parse(localStorage.getItem(POSTS_KEY) || "null");
    const savedReplies = JSON.parse(localStorage.getItem(REPLIES_KEY) || "{}");
    const savedGroups = JSON.parse(localStorage.getItem(GROUPS_KEY) || "{}");

    if (Array.isArray(savedPosts) && savedPosts.length) {
      setPosts(savedPosts);
    } else {
      localStorage.setItem(POSTS_KEY, JSON.stringify(seedPosts));
      setPosts(seedPosts);
    }
    setReplyMap(savedReplies || {});
    setJoinedGroups(savedGroups || {});
  }, []);

  const mergedPosts = useMemo(
    () =>
      posts.map((post) => ({
        ...post,
        replies: Array.isArray(replyMap?.[post.id]) ? replyMap[post.id].length : Number(post.replies) || 0,
      })),
    [posts, replyMap]
  );

  const weekFilteredPosts = useMemo(() => {
    const filtered = mergedPosts.filter((post) => Math.abs((Number(post.pregnancyWeek) || currentWeek) - currentWeek) <= 2);
    return filtered.length ? filtered : mergedPosts;
  }, [mergedPosts, currentWeek]);

  const sortedDiscussions = useMemo(
    () => [...weekFilteredPosts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [weekFilteredPosts]
  );

  const trendingPosts = useMemo(
    () =>
      [...mergedPosts]
        .sort((a, b) => (b.likes + b.replies) - (a.likes + a.replies))
        .slice(0, 3),
    [mergedPosts]
  );

  const handleLike = (postId) => {
    const nextPosts = posts.map((post) =>
      post.id === postId ? { ...post, likes: Number(post.likes || 0) + 1 } : post
    );
    setPosts(nextPosts);
    localStorage.setItem(POSTS_KEY, JSON.stringify(nextPosts));
  };

  const toggleJoinGroup = (groupId) => {
    const next = { ...joinedGroups, [groupId]: !joinedGroups[groupId] };
    setJoinedGroups(next);
    localStorage.setItem(GROUPS_KEY, JSON.stringify(next));
  };

  const submitNewPost = (event) => {
    event.preventDefault();
    const title = newPost.title.trim();
    const content = newPost.content.trim();
    if (!title || !content) return;

    const post = {
      id: `post-${Date.now()}`,
      user: newPost.anonymous ? "Anonymous Mom" : "You",
      pregnancyWeek: currentWeek,
      trimester: toTrimesterLabel(currentWeek),
      title,
      content,
      likes: 0,
      replies: 0,
      createdAt: new Date().toISOString(),
      category: newPost.category || "General",
      isAnonymous: newPost.anonymous,
    };

    const nextPosts = [post, ...posts];
    setPosts(nextPosts);
    localStorage.setItem(POSTS_KEY, JSON.stringify(nextPosts));
    setNewPost({ title: "", content: "", category: "General", anonymous: false });
    setIsNewPostOpen(false);
    setTab("discussions");
  };

  return (
    <section className="preg-community-page">
      <div className="preg-community-topbar">
        <div className="community-tabs">
          <button className={tab === "discussions" ? "active" : ""} onClick={() => setTab("discussions")}>
            Discussions
          </button>
          <button className={tab === "groups" ? "active" : ""} onClick={() => setTab("groups")}>
            Support Groups
          </button>
        </div>
        <button className="new-post-btn" onClick={() => setIsNewPostOpen(true)}>✎ New Post</button>
      </div>

      {tab === "discussions" ? (
        <>
          <section className="community-trending tone-lavender">
            <h3>🔥 Trending Discussions</h3>
            <div className="trending-grid">
              {trendingPosts.map((item) => (
                <article
                  className="trending-card"
                  key={item.id}
                  onClick={() => navigate(`/community/post/${item.id}`)}
                  role="button"
                  tabIndex={0}
                >
                  <h4>{item.title}</h4>
                  <p>🔥 {item.likes} • 💬 {item.replies} comments</p>
                </article>
              ))}
            </div>
          </section>

          <div className="discussion-list tone-offwhite">
            {sortedDiscussions.map((item) => (
              <article
                className="discussion-card"
                key={item.id}
                onClick={() => navigate(`/community/post/${item.id}`)}
                role="button"
                tabIndex={0}
              >
                <div className="avatar">👩</div>
                <div className="discussion-main">
                  <div className="discussion-meta">
                    <strong>{item.user}</strong>
                    <span className={`trimester-badge ${trimesterToneClass(item.trimester)}`}>{item.trimester}</span>
                    <small>{relativeTime(item.createdAt)}</small>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.content}</p>
                  <div className="discussion-actions">
                    <span>💬 {item.replies} replies</span>
                    <button
                      type="button"
                      className="like-btn"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleLike(item.id);
                      }}
                    >
                      👍 {item.likes} likes
                    </button>
                    <small className="discussion-category">{item.category}</small>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="load-more-row">
            <button>Load More Discussions</button>
          </div>
        </>
      ) : (
        <>
          <div className="group-grid tone-teal">
            {GROUPS.map((group) => (
              <article className="group-card" key={group.id}>
                <div className={`group-banner ${group.tone}`}>👥</div>
                <div className="group-body">
                  <h3>{group.title}</h3>
                  <span className={`group-tag ${group.tone}`}>{group.title.split(" ")[0]} group</span>
                  <p>{group.subtitle}</p>
                  <div className="group-footer">
                    <span>👥 {group.members}</span>
                    <button
                      className={joinedGroups[group.id] ? "joined" : ""}
                      onClick={() => toggleJoinGroup(group.id)}
                    >
                      {joinedGroups[group.id] ? "Joined" : "Join Group"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <section className="community-guidelines tone-offwhite">
            <h3>ℹ Community Guidelines</h3>
            <ul>
              <li>Be kind, respectful, and supportive of all members</li>
              <li>Share experiences, not medical advice</li>
              <li>Respect privacy and confidentiality</li>
              <li>Report any inappropriate content to moderators</li>
            </ul>
          </section>

          <section className="active-members">
            <h4>Active Members This Week</h4>
            <div className="member-tags">
              {ACTIVE_MEMBERS.map((member) => (
                <span key={member}>👩 {member}</span>
              ))}
            </div>
          </section>
        </>
      )}

      {isNewPostOpen ? (
        <div className="community-modal-overlay" onClick={() => setIsNewPostOpen(false)}>
          <div className="community-modal" onClick={(event) => event.stopPropagation()}>
            <h3>Create New Discussion</h3>
            <form onSubmit={submitNewPost} className="community-post-form">
              <label>
                Title
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(event) =>
                    setNewPost((prev) => ({
                      ...prev,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Write your discussion title"
                  required
                />
              </label>
              <label>
                Description
                <textarea
                  rows={4}
                  value={newPost.content}
                  onChange={(event) =>
                    setNewPost((prev) => ({
                      ...prev,
                      content: event.target.value,
                    }))
                  }
                  placeholder="Share your experience or question..."
                  required
                />
              </label>
              <label>
                Category
                <select
                  value={newPost.category}
                  onChange={(event) =>
                    setNewPost((prev) => ({
                      ...prev,
                      category: event.target.value,
                    }))
                  }
                >
                  <option value="General">General</option>
                  <option value="Nutrition">Nutrition</option>
                  <option value="Symptoms">Symptoms</option>
                  <option value="Exercise">Exercise</option>
                  <option value="Sleep">Sleep</option>
                  <option value="Labor Prep">Labor Prep</option>
                  <option value="Emotional Support">Emotional Support</option>
                </select>
              </label>
              <label className="anonymous-toggle">
                <input
                  type="checkbox"
                  checked={newPost.anonymous}
                  onChange={(event) =>
                    setNewPost((prev) => ({
                      ...prev,
                      anonymous: event.target.checked,
                    }))
                  }
                />
                Post anonymously
              </label>

              <div className="community-modal-actions">
                <button type="button" onClick={() => setIsNewPostOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary">
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
