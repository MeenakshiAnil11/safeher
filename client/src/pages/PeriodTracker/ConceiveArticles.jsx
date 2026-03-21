import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { isSubscribedLocal, setSubscribedLocal, subscribeToSubscriptionUpdates } from "../../services/subscriptionAccess";
import { conceiveArticleCategories, conceiveArticlesData } from "../../data/conceiveArticlesData";

const SAVED_ARTICLES_KEY = "conceive_saved_articles";

export default function ConceiveArticles() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [savedArticleIds, setSavedArticleIds] = useState([]);

  useEffect(() => {
    setIsSubscribed(isSubscribedLocal());

    const fetchSubscriptionStatus = async () => {
      try {
        const response = await api.get("/subscription/status");
        const sub = response?.data?.subscription;
        const subscribed = Boolean(sub?.status === "active" && sub?.planType !== "free");
        setIsSubscribed(subscribed);
        setSubscribedLocal(subscribed);
      } catch (error) {
        setIsSubscribed(isSubscribedLocal());
      }
    };
    fetchSubscriptionStatus();

    const unsubscribe = subscribeToSubscriptionUpdates((subscribed) => {
      setIsSubscribed(Boolean(subscribed));
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_ARTICLES_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) setSavedArticleIds(parsed);
    } catch (error) {
      setSavedArticleIds([]);
    }
  }, []);

  const saveBookmarks = (ids) => {
    setSavedArticleIds(ids);
    localStorage.setItem(SAVED_ARTICLES_KEY, JSON.stringify(ids));
  };

  const handleSubscribe = () => navigate("/payment-page");

  const handleReadArticle = (article) => {
    if (article.isPaid && !isSubscribed) {
      alert("This is a premium article. Subscribe to unlock it!");
      return;
    }
    navigate(`/articles/${article.id}`, {
      state: {
        from: "/period-tracking/conceive",
        activeTab: "articles",
      },
    });
  };

  const toggleSaveArticle = (articleId) => {
    if (savedArticleIds.includes(articleId)) {
      saveBookmarks(savedArticleIds.filter((id) => id !== articleId));
    } else {
      saveBookmarks([...savedArticleIds, articleId]);
    }
  };

  const filteredArticles = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return conceiveArticlesData.filter((article) => {
      const searchTarget = `${article.title} ${article.category} ${(article.tags || []).join(" ")}`.toLowerCase();
      const matchesSearch = !normalizedSearch || searchTarget.includes(normalizedSearch);
      const matchesCategory = filterCategory === "all" || article.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, filterCategory]);

  const freeArticles = filteredArticles.filter((article) => !article.isPaid);
  const premiumArticles = filteredArticles.filter((article) => article.isPaid);
  const savedArticles = conceiveArticlesData.filter((article) => savedArticleIds.includes(article.id));
  const recommendedArticles = conceiveArticlesData
    .filter((article) => ["fertility", "ovulation", "nutrition"].includes(article.category))
    .slice(0, 3);
  const trendingArticles = [...conceiveArticlesData].sort((a, b) => b.readers - a.readers).slice(0, 3);
  const featuredArticle =
    conceiveArticlesData.find((article) => article.id === "lifestyle-fertility-impact") || conceiveArticlesData[0];

  const renderArticleCard = (article) => {
    const categoryMeta = conceiveArticleCategories.find((category) => category.id === article.category);
    const isSaved = savedArticleIds.includes(article.id);
    return (
      <div
        key={article.id}
        className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden border ${
          article.isPaid && !isSubscribed ? "border-yellow-300" : "border-gray-200"
        }`}
      >
        <div className="relative h-40">
          <img src={article.heroImage} alt={article.title} className="h-full w-full object-cover" />
          {article.isPaid && !isSubscribed ? (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm font-semibold">
              🔒 Premium Content
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => toggleSaveArticle(article.id)}
            className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full px-3 py-1 text-xs font-semibold"
          >
            {isSaved ? "🔖 Saved" : "🔖 Save"}
          </button>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="px-2.5 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-semibold">
              {categoryMeta?.label || article.category}
            </span>
            <span className="text-xs text-gray-500">{article.readTime}</span>
          </div>
          <h4 className="text-lg font-semibold text-gray-800 mb-2">{article.title}</h4>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{article.description}</p>
          <div className="text-xs text-gray-500 space-y-1 mb-4">
            <p>{article.author}</p>
            <p>Published: {new Date(article.date).toLocaleDateString()}</p>
            <p>⭐ {article.rating} rating • {(article.readers / 1000).toFixed(1)}k readers</p>
          </div>
          <button
            type="button"
            onClick={() => handleReadArticle(article)}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2.5 rounded-lg font-semibold"
          >
            Read Article
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">📚 Fertility & Conception Articles</h2>
        <p className="text-gray-600">A complete educational hub for your conception and wellness journey.</p>
      </header>

      {!isSubscribed ? (
        <section className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-2xl font-bold mb-2">🌟 Unlock Premium Articles</h3>
              <p className="text-pink-100">Access exclusive fertility guides and in-depth medical insights.</p>
            </div>
            <button
              onClick={handleSubscribe}
              className="bg-white text-pink-600 px-6 py-3 rounded-lg font-semibold hover:bg-pink-50"
            >
              Subscribe Now
            </button>
          </div>
        </section>
      ) : null}

      <section className="bg-white rounded-xl shadow-md border border-yellow-100 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-3">Featured Article ⭐</h3>
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-5">
          <div>
            <p className="text-sm text-gray-500 mb-1">{featuredArticle.category.toUpperCase()}</p>
            <h4 className="text-2xl font-semibold text-gray-800">{featuredArticle.title}</h4>
            <p className="text-gray-600 mt-2">{featuredArticle.description}</p>
            <button
              type="button"
              onClick={() => handleReadArticle(featuredArticle)}
              className="mt-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-5 py-2.5 rounded-lg font-semibold"
            >
              Read Article
            </button>
          </div>
          <img src={featuredArticle.heroImage} alt={featuredArticle.title} className="h-56 w-full rounded-lg object-cover" />
        </div>
      </section>

      <section className="space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search fertility topics..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <span className="absolute left-4 top-3.5 text-gray-400">🔍</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {conceiveArticleCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setFilterCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                filterCategory === category.id
                  ? "bg-pink-100 border-pink-300 text-pink-700"
                  : "bg-white border-gray-200 text-gray-600"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Article Library</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {freeArticles.map(renderArticleCard)}
          {premiumArticles.map(renderArticleCard)}
        </div>
      </section>

      {savedArticles.length ? (
        <section>
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Saved Articles 🔖</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedArticles.map(renderArticleCard)}
          </div>
        </section>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl shadow-md border border-indigo-100 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-3">Recommended For You</h3>
          <ul className="space-y-3">
            {recommendedArticles.map((article) => (
              <li key={article.id} className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-800">{article.title}</p>
                  <p className="text-sm text-gray-500">{article.readTime}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleReadArticle(article)}
                  className="text-pink-600 text-sm font-semibold"
                >
                  Open
                </button>
              </li>
            ))}
          </ul>
        </section>
        <section className="bg-white rounded-xl shadow-md border border-orange-100 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-3">Trending Articles 🔥</h3>
          <ul className="space-y-3">
            {trendingArticles.map((article) => (
              <li key={article.id} className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-800">{article.title}</p>
                  <p className="text-sm text-gray-500">{(article.readers / 1000).toFixed(1)}k readers</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleReadArticle(article)}
                  className="text-pink-600 text-sm font-semibold"
                >
                  Open
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
        <h4 className="font-bold text-gray-800 mb-2">Medical Disclaimer</h4>
        <p className="text-sm text-gray-600">
          The information provided in these articles is for educational purposes only and should not replace professional medical advice.
        </p>
      </section>
    </div>
  );
}
