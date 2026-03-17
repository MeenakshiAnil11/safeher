import React, { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBox,
  FaWarehouse,
  FaShoppingBag,
  FaTicketAlt,
  FaStar,
  FaCreditCard,
  FaChartLine,
  FaTags,
  FaArrowLeft
} from "react-icons/fa";
import AdminHeader from "../../components/AdminHeader";
import "./AdminEcommerce.css";

export default function AdminEcommerce() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const ecommerceSections = [
    {
      path: "overview",
      label: "Dashboard Overview",
      icon: FaTachometerAlt,
      description: "View sales metrics and key statistics"
    },
    {
      path: "products",
      label: "Product Management",
      icon: FaBox,
      description: "Manage products, categories, and listings"
    },
    {
      path: "categories",
      label: "Category Management",
      icon: FaTags,
      description: "Create and manage product categories"
    },
    {
      path: "inventory",
      label: "Inventory Management",
      icon: FaWarehouse,
      description: "Track stock levels and manage inventory"
    },
    {
      path: "orders",
      label: "Order Management",
      icon: FaShoppingBag,
      description: "View and manage customer orders"
    },
    {
      path: "coupons",
      label: "Coupon & Offers",
      icon: FaTicketAlt,
      description: "Create and manage discount coupons"
    },
    {
      path: "reviews",
      label: "Reviews & Ratings",
      icon: FaStar,
      description: "Monitor product reviews and ratings"
    },
    {
      path: "payments",
      label: "Payments & Transactions",
      icon: FaCreditCard,
      description: "View payment history and transactions"
    },
    {
      path: "reports",
      label: "Reports & Analytics",
      icon: FaChartLine,
      description: "Sales reports and analytics dashboard"
    }
  ];

  return (
    <div className="admin-ecommerce">
      <aside className={`ecommerce-sidebar ${sidebarOpen ? "open" : ""}`}>
        <nav className="ecommerce-nav">
          {ecommerceSections.map((section) => {
            const Icon = section.icon;
            const isActive = location.pathname.includes(`/admin/ecommerce/${section.path}`);

            return (
              <NavLink
                key={section.path}
                to={`/admin/ecommerce/${section.path}`}
                className={`ecommerce-nav-item ${isActive ? "active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="nav-icon" />
                <div className="nav-content">
                  <span className="nav-label">{section.label}</span>
                  <span className="nav-description">{section.description}</span>
                </div>
              </NavLink>
            );
          })}
          <NavLink to="/admin/dashboard" className="ecommerce-nav-item" onClick={() => setSidebarOpen(false)}>
            <FaArrowLeft className="nav-icon" />
            <div className="nav-content">
              <span className="nav-label">Back to Dashboard</span>
              <span className="nav-description">Return to main admin dashboard</span>
            </div>
          </NavLink>
        </nav>
      </aside>

      <div className="ecommerce-main-content">
        <div className="ecommerce-header-wrap">
          <button className="ecommerce-sidebar-toggle" type="button" onClick={() => setSidebarOpen((v) => !v)}>
            ☰
          </button>
          <AdminHeader pageTitle="E-commerce Management" />
        </div>

        <main className="ecommerce-content">
          <div className="ecommerce-content-inner">
            <Outlet />
          </div>
        </main>
      </div>

      {sidebarOpen ? <button className="sidebar-backdrop" aria-label="Close sidebar" onClick={() => setSidebarOpen(false)} /> : null}
    </div>
  );
}
