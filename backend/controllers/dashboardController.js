const Record = require('../models/Record');
const mongoose = require('mongoose');

exports.getDashboardSummary = async (req, res, next) => {
  try {
    const baseMatch = { $match: { isDeleted: false } };

    // 1. Overall Summary
    const summary = await Record.aggregate([
      baseMatch,
      { $group: { _id: "$type", totalAmount: { $sum: "$amount" } } }
    ]);

    // 2. Category Breakdown
    const categories = await Record.aggregate([
      baseMatch,
      {
        $group: {
          _id: { type: "$type", category: "$category" },
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    // 3. Monthly Trends
    const monthlyTrendsAgg = await Record.aggregate([
      baseMatch,
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          income: { $sum: { $cond: [{ $eq: ["$type", "Income"] }, "$amount", 0] } },
          expense: { $sum: { $cond: [{ $eq: ["$type", "Expense"] }, "$amount", 0] } }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    let totalIncome = 0;
    let totalExpense = 0;
    summary.forEach(item => {
      if (item._id === 'Income') totalIncome = item.totalAmount;
      if (item._id === 'Expense') totalExpense = item.totalAmount;
    });
    const netBalance = totalIncome - totalExpense;

    const formattedTrends = monthlyTrendsAgg.map(item => ({
      year: item._id.year, month: item._id.month,
      income: item.income, expense: item.expense
    }));

    // --- Smart Insights Engine ---
    let insights = {
      highestSpendingCategory: null,
      expenseComparison: null,
      budgetAlert: "safe"
    };

    // Calculate Highest Spending Category
    const expenseCategories = categories
      .filter(c => c._id.type === 'Expense')
      .sort((a, b) => b.totalAmount - a.totalAmount);
    
    if (expenseCategories.length > 0) {
      insights.highestSpendingCategory = {
        category: expenseCategories[0]._id.category,
        amount: expenseCategories[0].totalAmount
      };
    }

    // Comparison Current vs Previous Month
    const currentDate = new Date();
    const currentMonthData = formattedTrends.find(
      t => t.year === currentDate.getFullYear() && t.month === currentDate.getMonth() + 1
    );
    
    let prevMonth = currentDate.getMonth(); // 1-12 mapped to 0-11
    let prevYear = currentDate.getFullYear();
    if (prevMonth === 0) { prevMonth = 12; prevYear--; }

    const prevMonthData = formattedTrends.find(
      t => t.year === prevYear && t.month === prevMonth
    );

    const currentExpense = currentMonthData ? currentMonthData.expense : 0;
    const previousExpense = prevMonthData ? prevMonthData.expense : 0;

    if (previousExpense > 0) {
      const diff = currentExpense - previousExpense;
      const percentage = ((diff / previousExpense) * 100).toFixed(2);
      insights.expenseComparison = {
        status: diff > 0 ? 'increased' : 'decreased',
        percentage: Math.abs(percentage),
        currentExpense,
        previousExpense
      };
    }

    // --- Budget and Alerts System ---
    const userBudget = req.user.budget || 0;
    if (userBudget > 0) {
      if (currentExpense > userBudget) {
        insights.budgetAlert = "danger";
      } else if (currentExpense >= (userBudget * 0.8)) {
        insights.budgetAlert = "warning";
      }
    }

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        netBalance,
        budget: userBudget,
        currentMonthExpense: currentExpense,
        categoryBreakdown: categories.map(cat => ({
          type: cat._id.type,
          category: cat._id.category,
          totalAmount: cat.totalAmount
        })),
        monthlyTrends: formattedTrends,
        insights
      }
    });

  } catch (err) {
    next(err);
  }
};
