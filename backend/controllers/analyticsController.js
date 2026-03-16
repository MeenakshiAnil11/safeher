import Order from "../models/Order.js";
import Product from "../models/Product.js";
import EcommerceCategory from "../models/EcommerceCategory.js";

// GET /api/analytics/admin/sales-by-category - Get sales by category (Admin only)
export const getSalesByCategory = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Get all paid orders
    const orders = await Order.find({
      ...dateFilter,
      paymentStatus: "paid",
    })
      .populate("items.product", "category")
      .select("items total createdAt")
      .lean();

    // Group by category
    const categorySales = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const product = item.product;
        if (product && product.category) {
          const categoryId = product.category.toString();
          if (!categorySales[categoryId]) {
            categorySales[categoryId] = {
              categoryId,
              totalSales: 0,
              orderCount: 0,
              itemCount: 0,
            };
          }
          categorySales[categoryId].totalSales += item.price * item.quantity;
          categorySales[categoryId].itemCount += item.quantity;
        }
      });
      // Count unique orders per category
      const uniqueCategories = new Set();
      order.items.forEach((item) => {
        if (item.product && item.product.category) {
          uniqueCategories.add(item.product.category.toString());
        }
      });
      uniqueCategories.forEach((catId) => {
        if (categorySales[catId]) {
          categorySales[catId].orderCount += 1;
        }
      });
    });

    // Populate category names
    const categoryIds = Object.keys(categorySales);
    const categories = await EcommerceCategory.find({
      _id: { $in: categoryIds },
    }).lean();

    const categoryMap = {};
    categories.forEach((cat) => {
      categoryMap[cat._id.toString()] = cat;
    });

    const result = Object.values(categorySales)
      .map((sales) => ({
        ...sales,
        categoryName: categoryMap[sales.categoryId]?.name || "Unknown",
        categorySlug: categoryMap[sales.categoryId]?.slug || "",
      }))
      .sort((a, b) => b.totalSales - a.totalSales);

    res.json({ salesByCategory: result });
  } catch (error) {
    console.error("getSalesByCategory error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/analytics/admin/monthly-revenue - Get monthly revenue (Admin only)
export const getMonthlyRevenue = async (req, res) => {
  try {
    const { months = 12 } = req.query;
    const monthsCount = Number(months);

    const monthlyData = [];
    const now = new Date();

    for (let i = monthsCount - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const orders = await Order.find({
        paymentStatus: "paid",
        createdAt: {
          $gte: date,
          $lt: nextDate,
        },
      }).select("total createdAt").lean();

      const revenue = orders.reduce((sum, order) => sum + order.total, 0);
      const orderCount = orders.length;

      monthlyData.push({
        month: date.toLocaleString("default", { month: "short", year: "numeric" }),
        monthKey: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
        revenue: parseFloat(revenue.toFixed(2)),
        orders: orderCount,
      });
    }

    res.json({ monthlyRevenue: monthlyData });
  } catch (error) {
    console.error("getMonthlyRevenue error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/analytics/admin/best-selling - Get best-selling products (Admin only)
export const getBestSellingProducts = async (req, res) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find({
      ...dateFilter,
      paymentStatus: "paid",
    })
      .select("items")
      .lean();

    // Count product sales
    const productSales = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const productId = item.product?.toString() || item.product;
        if (productId) {
          if (!productSales[productId]) {
            productSales[productId] = {
              productId,
              name: item.name,
              totalSold: 0,
              totalRevenue: 0,
              orderCount: 0,
            };
          }
          productSales[productId].totalSold += item.quantity;
          productSales[productId].totalRevenue += item.price * item.quantity;
          productSales[productId].orderCount += 1;
        }
      });
    });

    // Sort by total sold
    const sortedProducts = Object.values(productSales)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, Number(limit));

    // Populate product details
    const productIds = sortedProducts.map((p) => p.productId);
    const products = await Product.find({ _id: { $in: productIds } })
      .select("name images category price stock")
      .populate("category", "name")
      .lean();

    const productMap = {};
    products.forEach((p) => {
      productMap[p._id.toString()] = p;
    });

    const result = sortedProducts.map((sales) => {
      const product = productMap[sales.productId];
      return {
        ...sales,
        image: product?.images?.[0]?.url || "",
        category: product?.category?.name || "Unknown",
        currentPrice: product?.price || 0,
        stock: product?.stock || 0,
      };
    });

    res.json({ bestSelling: result });
  } catch (error) {
    console.error("getBestSellingProducts error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/analytics/admin/low-performing - Get low-performing products (Admin only)
export const getLowPerformingProducts = async (req, res) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find({
      ...dateFilter,
      paymentStatus: "paid",
    })
      .select("items")
      .lean();

    // Count product sales
    const productSales = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const productId = item.product?.toString() || item.product;
        if (productId) {
          if (!productSales[productId]) {
            productSales[productId] = {
              productId,
              name: item.name,
              totalSold: 0,
              totalRevenue: 0,
              orderCount: 0,
            };
          }
          productSales[productId].totalSold += item.quantity;
          productSales[productId].totalRevenue += item.price * item.quantity;
          productSales[productId].orderCount += 1;
        }
      });
    });

    // Get all products
    const allProducts = await Product.find({ isActive: true })
      .select("name images category price stock createdAt")
      .populate("category", "name")
      .lean();

    // Find products with low or no sales
    const lowPerforming = allProducts
      .map((product) => {
        const sales = productSales[product._id.toString()] || {
          totalSold: 0,
          totalRevenue: 0,
          orderCount: 0,
        };

        const daysSinceCreation =
          (new Date() - new Date(product.createdAt)) / (1000 * 60 * 60 * 24);

        return {
          productId: product._id.toString(),
          name: product.name,
          image: product.images?.[0]?.url || "",
          category: product.category?.name || "Unknown",
          price: product.price,
          stock: product.stock,
          totalSold: sales.totalSold,
          totalRevenue: sales.totalRevenue,
          orderCount: sales.orderCount,
          daysSinceCreation: Math.floor(daysSinceCreation),
          salesPerDay: daysSinceCreation > 0 ? sales.totalSold / daysSinceCreation : 0,
        };
      })
      .filter((p) => p.totalSold === 0 || p.salesPerDay < 0.1) // No sales or very low sales
      .sort((a, b) => {
        // Sort by: no sales first, then by sales per day
        if (a.totalSold === 0 && b.totalSold > 0) return -1;
        if (a.totalSold > 0 && b.totalSold === 0) return 1;
        return a.salesPerDay - b.salesPerDay;
      })
      .slice(0, Number(limit));

    res.json({ lowPerforming });
  } catch (error) {
    console.error("getLowPerformingProducts error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/analytics/admin/revenue-trend - Get revenue trend (Admin only)
export const getRevenueTrend = async (req, res) => {
  try {
    const { period = "monthly", months = 12 } = req.query;
    const monthsCount = Number(months);

    const trendData = [];
    const now = new Date();

    if (period === "monthly") {
      for (let i = monthsCount - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

        const orders = await Order.find({
          paymentStatus: "paid",
          createdAt: {
            $gte: date,
            $lt: nextDate,
          },
        }).select("total createdAt").lean();

        const revenue = orders.reduce((sum, order) => sum + order.total, 0);
        const orderCount = orders.length;

        trendData.push({
          period: date.toLocaleString("default", { month: "short", year: "numeric" }),
          revenue: parseFloat(revenue.toFixed(2)),
          orders: orderCount,
        });
      }
    } else if (period === "weekly") {
      for (let i = 7; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i * 7);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 7);

        const orders = await Order.find({
          paymentStatus: "paid",
          createdAt: {
            $gte: date,
            $lt: nextDate,
          },
        }).select("total createdAt").lean();

        const revenue = orders.reduce((sum, order) => sum + order.total, 0);
        const orderCount = orders.length;

        trendData.push({
          period: `Week ${i + 1}`,
          revenue: parseFloat(revenue.toFixed(2)),
          orders: orderCount,
        });
      }
    } else if (period === "daily") {
      for (let i = 30; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const orders = await Order.find({
          paymentStatus: "paid",
          createdAt: {
            $gte: date,
            $lt: nextDate,
          },
        }).select("total createdAt").lean();

        const revenue = orders.reduce((sum, order) => sum + order.total, 0);
        const orderCount = orders.length;

        trendData.push({
          period: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          revenue: parseFloat(revenue.toFixed(2)),
          orders: orderCount,
        });
      }
    }

    res.json({ trend: trendData });
  } catch (error) {
    console.error("getRevenueTrend error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/analytics/admin/order-trend - Get order trend (Admin only)
export const getOrderTrend = async (req, res) => {
  try {
    const { period = "monthly", months = 12 } = req.query;
    const monthsCount = Number(months);

    const trendData = [];
    const now = new Date();

    if (period === "monthly") {
      for (let i = monthsCount - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

        const orders = await Order.find({
          createdAt: {
            $gte: date,
            $lt: nextDate,
          },
        }).select("orderStatus paymentStatus createdAt").lean();

        const totalOrders = orders.length;
        const paidOrders = orders.filter((o) => o.paymentStatus === "paid").length;
        const pendingOrders = orders.filter((o) => o.orderStatus === "pending").length;
        const completedOrders = orders.filter((o) => o.orderStatus === "delivered").length;

        trendData.push({
          period: date.toLocaleString("default", { month: "short", year: "numeric" }),
          total: totalOrders,
          paid: paidOrders,
          pending: pendingOrders,
          completed: completedOrders,
        });
      }
    } else if (period === "weekly") {
      for (let i = 7; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i * 7);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 7);

        const orders = await Order.find({
          createdAt: {
            $gte: date,
            $lt: nextDate,
          },
        }).select("orderStatus paymentStatus createdAt").lean();

        const totalOrders = orders.length;
        const paidOrders = orders.filter((o) => o.paymentStatus === "paid").length;
        const pendingOrders = orders.filter((o) => o.orderStatus === "pending").length;
        const completedOrders = orders.filter((o) => o.orderStatus === "delivered").length;

        trendData.push({
          period: `Week ${i + 1}`,
          total: totalOrders,
          paid: paidOrders,
          pending: pendingOrders,
          completed: completedOrders,
        });
      }
    }

    res.json({ trend: trendData });
  } catch (error) {
    console.error("getOrderTrend error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/analytics/admin/summary - Get analytics summary (Admin only)
export const getAnalyticsSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find({
      ...dateFilter,
      paymentStatus: "paid",
    }).lean();

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get unique customers
    const uniqueCustomers = new Set(orders.map((o) => o.user.toString()));
    const customerCount = uniqueCustomers.size;

    // Get total products sold
    let totalProductsSold = 0;
    orders.forEach((order) => {
      order.items.forEach((item) => {
        totalProductsSold += item.quantity;
      });
    });

    res.json({
      summary: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalOrders,
        averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
        uniqueCustomers: customerCount,
        totalProductsSold,
      },
    });
  } catch (error) {
    console.error("getAnalyticsSummary error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/analytics/admin/customer-activity - Top customers by spend/orders (Admin only)
export const getCustomerActivity = async (req, res) => {
  try {
    const { startDate, endDate, limit = 5 } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find({
      ...dateFilter,
    })
      .populate("user", "name email")
      .select("user total createdAt")
      .lean();

    const customerMap = {};
    for (const order of orders) {
      const userId = String(order.user?._id || "unknown");
      if (!customerMap[userId]) {
        customerMap[userId] = {
          customerId: userId,
          name: order.user?.name || "Guest",
          email: order.user?.email || "N/A",
          orders: 0,
          spend: 0,
        };
      }
      customerMap[userId].orders += 1;
      customerMap[userId].spend += Number(order.total || 0);
    }

    const topCustomers = Object.values(customerMap)
      .sort((a, b) => b.spend - a.spend || b.orders - a.orders)
      .slice(0, Number(limit))
      .map((c) => ({
        ...c,
        spend: Number(c.spend.toFixed(2)),
      }));

    res.json({ customers: topCustomers });
  } catch (error) {
    console.error("getCustomerActivity error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
