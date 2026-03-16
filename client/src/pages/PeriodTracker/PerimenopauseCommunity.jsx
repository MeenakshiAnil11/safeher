import React, { useState, useEffect, useRef } from "react";
import api from "../../services/api";

export default function PerimenopauseCommunity() {
  const [posts, setPosts] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [newTag, setNewTag] = useState("Hot Flashes");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [replyInput, setReplyInput] = useState({});
  const [showReplies, setShowReplies] = useState({});
  
  const postsPerPage = 10;
  const autoRefreshInterval = useRef(null);

  // Generate mock community posts
  const generateMockPosts = () => {
    const mockUsers = [
      { name: "Sarah M.", initials: "SM", color: "bg-blue-500" },
      { name: "Emma K.", initials: "EK", color: "bg-purple-500" },
      { name: "Jennifer L.", initials: "JL", color: "bg-pink-500" },
      { name: "Maria T.", initials: "MT", color: "bg-green-500" },
      { name: "Lisa R.", initials: "LR", color: "bg-yellow-500" }
    ];

    return Array.from({ length: 25 }, (_, i) => {
      const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      const timestamp = new Date(Date.now() - i * 3600000 - Math.random() * 86400000);
      
      return {
        id: i + 1,
        username: user.name,
        avatar: user.initials,
        avatarColor: user.color,
        content: generatePostContent(i),
        tag: ["Hot Flashes", "Sleep Issues", "Mood Swings"][i % 3],
        timestamp: timestamp.toISOString(),
        likes: Math.floor(Math.random() * 20),
        isLiked: false,
        replies: generateMockReplies()
      };
    });
  };

  const generatePostContent = (index) => {
    const contents = [
      "Has anyone found relief from hot flashes naturally? Would love to hear your tips!",
      "Just started perimenopause tracking and it's so helpful to see patterns. Anyone else noticing mood swings?",
      "Yoga has been a game-changer for me. Highly recommend gentle stretching during this phase.",
      "What supplements are you taking? I've heard good things about magnesium.",
      "Sleep is so difficult lately. Any suggestions for better rest?",
      "Feeling grateful for this community. We're all in this together! 💪",
      "Has anyone tried evening primrose oil? I'm considering it for symptoms.",
      "The mood swings are intense. Anyone have strategies for managing them?",
      "Started meditation to help with anxiety. It's making a big difference!",
      "Hot flashes at work are so embarrassing. Tips for managing them discreetly?",
      "Tracked my symptoms for 3 months now. Seeing clear patterns in my cycle!",
      "Acupuncture has been helpful for me. Worth trying if you're struggling.",
      "The joint pain is new for me. Anyone else experiencing this?",
      "Quit caffeine and it reduced my hot flashes by 50%! Worth a try.",
      "Anyone else having brain fog? Forgetting things is so frustrating.",
      "Cold showers before bed help with night sweats. Life saver!",
      "The weight gain is discouraging. Trying to stay positive and active.",
      "Started keeping a journal to track everything. It's really insightful.",
      "Anyone know good probiotics for this stage of life?",
      "Feeling disconnected from my body. This community helps!",
      "Vaginal dryness is embarrassing but common. Talking about it helps!",
      "Pelvic floor exercises are so important. Don't skip them!",
      "The anxiety around symptoms is sometimes worse than symptoms themselves.",
      "Eating more plant-based foods has helped my energy levels significantly.",
      "Support groups like this make all the difference. Thank you everyone!"
    ];
    return contents[index % contents.length];
  };

  const generateMockReplies = () => {
    return Array.from({ length: Math.floor(Math.random() * 4) }, (_, i) => ({
      id: i + 1,
      username: `User${i + 1}`,
      content: `Reply ${i + 1}: That's really helpful!`,
      timestamp: new Date(Date.now() - i * 1800000).toISOString()
    }));
  };

  // Fetch posts from API
  const fetchPosts = async (page = 1, append = false) => {
    try {
      setLoading(true);
      const response = await api.get('/community/perimenopause', {
        params: { page, limit: postsPerPage }
      });
      
      const fetchedPosts = response.data.posts || generateMockPosts();
      
      if (append) {
        setPosts(prev => [...prev, ...fetchedPosts]);
      } else {
        setPosts(fetchedPosts);
      }
      
      setHasMore(fetchedPosts.length === postsPerPage);
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Use mock data as fallback
      const mockPosts = generateMockPosts();
      setPosts(mockPosts);
      setHasMore(mockPosts.length === postsPerPage);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchPosts();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPosts(1, false);
    }, 30000); // 30 seconds

    autoRefreshInterval.current = interval;

    return () => {
      if (autoRefreshInterval.current) {
        clearInterval(autoRefreshInterval.current);
      }
    };
  }, []);

  // Submit new post
  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const filteredContent = filterContent(newMessage);
    if (filteredContent !== newMessage) {
      alert("Your message contains inappropriate content. Please revise.");
      return;
    }

    try {
      setSubmitting(true);
      const newPost = {
        id: Date.now(),
        username: "You",
        avatar: "ME",
        avatarColor: "bg-lavender-500",
        content: filteredContent,
        tag: newTag,
        timestamp: new Date().toISOString(),
        likes: 0,
        isLiked: false,
        replies: []
      };

      await api.post('/community/perimenopause', {
        content: filteredContent,
        tag: newTag
      });

      setPosts([newPost, ...posts]);
      setNewMessage("");
    } catch (error) {
      console.error('Error submitting post:', error);
      alert("Failed to post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle like
  const handleToggleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  // Toggle replies visibility
  const handleToggleReplies = (postId) => {
    setShowReplies(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Submit reply
  const handleSubmitReply = async (postId) => {
    const replyContent = replyInput[postId];
    if (!replyContent || !replyContent.trim()) return;

    const filteredContent = filterContent(replyContent);
    if (filteredContent !== replyContent) {
      alert("Your reply contains inappropriate content. Please revise.");
      return;
    }

    try {
      const newReply = {
        id: Date.now(),
        username: "You",
        content: filteredContent,
        timestamp: new Date().toISOString()
      };

      await api.post(`/community/perimenopause/${postId}/reply`, {
        content: filteredContent
      });

      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, replies: [...post.replies, newReply] }
          : post
      ));

      setReplyInput({ ...replyInput, [postId]: "" });
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert("Failed to reply. Please try again.");
    }
  };

  // Content filtering (basic safety filter)
  const filterContent = (content) => {
    const blockedWords = ['spam', 'advertisement', 'http://', 'https://'];
    let filtered = content;
    
    blockedWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      filtered = filtered.replace(regex, '***');
    });
    
    return filtered;
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Load more posts
  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchPosts(nextPage, true);
  };

  const trendingTopics = Object.entries(
    posts.reduce((acc, post) => {
      const tag = post.tag || "General";
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-lavender-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 font-serif">
            Perimenopause Community
          </h1>
          <p className="text-lg text-gray-600">
            Connect, share, and support each other on this journey
          </p>
        </div>

        {/* Post Form */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 mb-6">
          <form onSubmit={handleSubmitPost}>
            <div className="mb-3">
              <label className="text-sm text-gray-600 mr-2">Tag</label>
              <select
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option>Hot Flashes</option>
                <option>Sleep Issues</option>
                <option>Mood Swings</option>
              </select>
            </div>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Share your thoughts, ask questions, or offer support..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent resize-none"
              rows="3"
              maxLength="500"
            />
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-500">
                {newMessage.length}/500 characters
              </span>
              <button
                type="submit"
                disabled={submitting || !newMessage.trim()}
                className="bg-gradient-to-r from-lavender-400 to-pink-400 hover:from-lavender-500 hover:to-pink-500 text-white py-2 px-6 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Posting..." : "📤 Post"}
              </button>
            </div>
          </form>
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lavender-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading posts...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.length > 0 ? (
              <>
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300"
                  >
                    {/* Post Header */}
                    <div className="flex items-start space-x-4 mb-4">
                      {/* Avatar */}
                      <div className={`flex-shrink-0 w-12 h-12 ${post.avatarColor} rounded-full flex items-center justify-center text-white font-bold`}>
                        {post.avatar}
                      </div>
                      
                      {/* User Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-800">{post.username}</h3>
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(post.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="mb-2">
                      <span className="inline-block text-xs bg-lavender-100 text-lavender-700 px-2 py-1 rounded-full">
                        #{post.tag || "General"}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>

                    {/* Actions */}
                    <div className="flex items-center space-x-4 border-t border-gray-100 pt-4">
                      <button
                        onClick={() => handleToggleLike(post.id)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                          post.isLiked 
                            ? "bg-red-100 text-red-600" 
                            : "hover:bg-gray-100 text-gray-600"
                        }`}
                      >
                        <span className="text-lg">❤️</span>
                        <span className="font-medium">{post.likes}</span>
                      </button>

                      <button
                        onClick={() => handleToggleReplies(post.id)}
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-all duration-300"
                      >
                        <span className="text-lg">💬</span>
                        <span className="font-medium">{post.replies.length} replies</span>
                      </button>
                    </div>

                    {/* Replies Section */}
                    {showReplies[post.id] && (
                      <div className="mt-4 border-t border-gray-100 pt-4">
                        {/* Existing Replies */}
                        {post.replies.map((reply) => (
                          <div key={reply.id} className="mb-3 pl-4 border-l-2 border-lavender-200">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-semibold text-sm text-gray-800">{reply.username}</span>
                              <span className="text-xs text-gray-500">{formatTimestamp(reply.timestamp)}</span>
                            </div>
                            <p className="text-sm text-gray-700">{reply.content}</p>
                          </div>
                        ))}

                        {/* Reply Input */}
                        <div className="mt-4">
                          <input
                            type="text"
                            value={replyInput[post.id] || ""}
                            onChange={(e) => setReplyInput({ ...replyInput, [post.id]: e.target.value })}
                            placeholder="Write a reply..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent text-sm"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmitReply(post.id);
                              }
                            }}
                          />
                          <button
                            onClick={() => handleSubmitReply(post.id)}
                            className="mt-2 bg-lavender-500 hover:bg-lavender-600 text-white py-1 px-4 rounded-lg text-sm font-semibold transition-all duration-300"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Load More Button */}
                {hasMore && (
                  <div className="text-center mt-6">
                    <button
                      onClick={handleLoadMore}
                      className="bg-white hover:bg-gray-50 text-gray-700 py-3 px-8 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg border border-gray-200"
                    >
                      Load More Posts
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Posts Yet</h3>
                <p className="text-gray-600">Be the first to share!</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Trending Topics</h3>
          <div className="flex flex-wrap gap-2">
            {trendingTopics.map(([tag, count]) => (
              <span key={tag} className="px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-sm font-medium">
                #{tag} ({count})
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400 text-sm mt-8">
          <p>Developed by Meenakshi Anil | MCA Mini Project 2025</p>
        </div>
      </div>
    </div>
  );
}
