exports.getDashboardSummary = async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const records = await prisma.record.findMany({ where: { isDeleted: false } });

    const totalIncome  = records.filter(r => r.type === 'Income').reduce((s, r) => s + r.amount, 0);
    const totalExpense = records.filter(r => r.type === 'Expense').reduce((s, r) => s + r.amount, 0);
    const netBalance   = totalIncome - totalExpense;

    // Category breakdown
    const categoryMap = {};
    records.forEach(r => {
      if (!categoryMap[r.category]) categoryMap[r.category] = { category: r.category, totalAmount: 0, count: 0 };
      categoryMap[r.category].totalAmount += r.amount;
      categoryMap[r.category].count += 1;
    });
    const categoryBreakdown = Object.values(categoryMap).sort((a, b) => b.totalAmount - a.totalAmount);

    // Monthly trends
    const monthMap = {};
    records.forEach(r => {
      const d   = new Date(r.date);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      if (!monthMap[key]) monthMap[key] = { year: d.getFullYear(), month: d.getMonth() + 1, income: 0, expense: 0 };
      if (r.type === 'Income')  monthMap[key].income  += r.amount;
      else                       monthMap[key].expense += r.amount;
    });
    const monthlyTrends = Object.values(monthMap).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    // Smart insights
    let insights = null;
    const expenseRecords = records.filter(r => r.type === 'Expense');
    if (expenseRecords.length > 0) {
      const catSpend = {};
      expenseRecords.forEach(r => { catSpend[r.category] = (catSpend[r.category] || 0) + r.amount; });
      const topCat = Object.entries(catSpend).sort((a, b) => b[1] - a[1])[0];

      const sortedMonths = monthlyTrends.filter(m => m.expense > 0);
      let expenseComparison = null;
      if (sortedMonths.length >= 2) {
        const latest = sortedMonths[sortedMonths.length - 1];
        const prev   = sortedMonths[sortedMonths.length - 2];
        if (prev.expense > 0) {
          const pct = Math.abs(((latest.expense - prev.expense) / prev.expense) * 100).toFixed(1);
          expenseComparison = {
            status: latest.expense >= prev.expense ? 'increased' : 'decreased',
            percentage: pct
          };
        }
      }

      // Budget alert
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      const budget = user ? user.budget : 0;
      let budgetAlert = null;
      if (budget > 0) {
        const now = new Date();
        const thisMonthExpense = expenseRecords
          .filter(r => {
            const d = new Date(r.date);
            return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
          })
          .reduce((s, r) => s + r.amount, 0);
        if (thisMonthExpense >= budget)           budgetAlert = 'danger';
        else if (thisMonthExpense >= budget * 0.8) budgetAlert = 'warning';
      }

      insights = {
        highestSpendingCategory: topCat ? { category: topCat[0], amount: topCat[1] } : null,
        expenseComparison,
        budgetAlert
      };
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    res.json({
      success: true,
      data: { totalIncome, totalExpense, netBalance, categoryBreakdown, monthlyTrends, insights, budget: user ? user.budget : 0 }
    });
  } catch (err) {
    next(err);
  }
};
