exports.getUsers = async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, status: true, budget: true, createdAt: true }
    });
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

exports.getUserStats = async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const users = await prisma.user.findMany({
      where: { status: 'Active' },
      select: { id: true, name: true, email: true, role: true, status: true, budget: true, createdAt: true }
    });
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { name, email, role, status, budget } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { name, email, role, status, budget: budget !== undefined ? parseFloat(budget) : undefined },
      select: { id: true, name: true, email: true, role: true, status: true, budget: true, createdAt: true }
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ success: false, error: 'User not found.' });
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'User deleted.' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ success: false, error: 'User not found.' });
    next(err);
  }
};
