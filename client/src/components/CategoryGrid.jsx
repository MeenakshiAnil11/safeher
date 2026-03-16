import React from "react";
import { Link } from "react-router-dom";
import "./CategoryGrid.css";

const CategoryGrid = ({ categories }) => {
  const mainCategories = [
    {
      name: "Menstrual Care",
      slug: "menstrual-care",
      icon: "🩸",
      description: "Sanitary pads, tampons, menstrual cups & more",
    },
    {
      name: "Pregnancy Care",
      slug: "pregnancy-care",
      icon: "🤰",
      description: "Prenatal vitamins, maternity wear & essentials",
    },
    {
      name: "Wellness",
      slug: "wellness",
      icon: "💊",
      description: "Supplements, vitamins & health products",
    },
    {
      name: "Personal Care",
      slug: "personal-care",
      icon: "✨",
      description: "Skincare, hygiene & self-care essentials",
    },
  ];

  const displayCategories = categories && categories.length > 0 ? categories : mainCategories;

  // Ensure all categories have slugs
  const categoriesWithSlugs = displayCategories.map(cat => ({
    ...cat,
    slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, "-")
  }));

  return (
    <div className="category-grid">
      {categoriesWithSlugs.map((category) => {
        const categorySlug = category.slug || category.name.toLowerCase().replace(/\s+/g, "-");
        return (
        <Link
          key={category._id || category.slug || category.name}
          to={`/shop/category/${categorySlug}`}
          className="category-card"
          onClick={() => {
            console.log("Navigating to category:", categorySlug);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <div className="category-icon">{category.icon || "📦"}</div>
          <h3 className="category-name">{category.name}</h3>
          {category.description && (
            <p className="category-description">{category.description}</p>
          )}
        </Link>
        );
      })}
    </div>
  );
};

export default CategoryGrid;
