import React, { useState } from "react";
import { FaShare, FaWhatsapp, FaFacebook, FaTwitter, FaLink, FaTimes } from "react-icons/fa";
import "./ShareButton.css";

const ShareButton = ({ post, url }) => {
  const [showMenu, setShowMenu] = useState(false);

  const postUrl = url || `${window.location.origin}/forum/posts/${post?._id || post?.id}`;
  const postTitle = post?.title || "Check out this post";
  const postContent = post?.content?.substring(0, 100) || "";

  const shareToWhatsApp = () => {
    const text = `${postTitle}\n\n${postContent}\n\n${postUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    setShowMenu(false);
  };

  const shareToFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
      "_blank"
    );
    setShowMenu(false);
  };

  const shareToTwitter = () => {
    const text = `${postTitle} ${postUrl}`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      "_blank"
    );
    setShowMenu(false);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      alert("Link copied to clipboard!");
      setShowMenu(false);
    } catch (error) {
      console.error("Error copying link:", error);
      alert("Failed to copy link");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: postTitle,
          text: postContent,
          url: postUrl,
        });
        setShowMenu(false);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error sharing:", error);
        }
      }
    } else {
      setShowMenu(true);
    }
  };

  return (
    <div className="share-button-wrapper">
      <button className="share-button" onClick={handleNativeShare}>
        <FaShare /> Share
      </button>

      {showMenu && (
        <>
          <div className="share-overlay" onClick={() => setShowMenu(false)}></div>
          <div className="share-menu">
            <div className="share-menu-header">
              <h4>Share Post</h4>
              <button className="close-share-menu" onClick={() => setShowMenu(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="share-options">
              <button className="share-option" onClick={shareToWhatsApp}>
                <FaWhatsapp className="share-icon whatsapp" />
                <span>WhatsApp</span>
              </button>
              <button className="share-option" onClick={shareToFacebook}>
                <FaFacebook className="share-icon facebook" />
                <span>Facebook</span>
              </button>
              <button className="share-option" onClick={shareToTwitter}>
                <FaTwitter className="share-icon twitter" />
                <span>Twitter</span>
              </button>
              <button className="share-option" onClick={copyLink}>
                <FaLink className="share-icon" />
                <span>Copy Link</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ShareButton;
