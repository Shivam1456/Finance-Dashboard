const csv = require('csv-parser');
const { Readable } = require('stream');

exports.getRecords = async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { keyword, type, sort, showDeleted, limit } = req.query;

    const where = {};
    if (showDeleted !== 'true') where.isDeleted = false;
    if (type) where.type = type;
    if (keyword) {
      where.OR = [
        { notes:    { contains: keyword } },
        { category: { contains: keyword } },
        { name:     { contains: keyword } }
      ];
    }

    let orderBy = { date: 'desc' };
    if (sort === 'date_asc')    orderBy = { date: 'asc' };
    else if (sort === 'amount') orderBy = { amount: 'desc' };
    else if (sort === 'amount_asc') orderBy = { amount: 'asc' };

    const records = await prisma.record.findMany({
      where,
      orderBy,
      take: parseInt(limit) || 100,
      include: { user: { select: { name: true } } }
    });

    res.json({ success: true, data: records });
  } catch (err) {
    next(err);
  }
};

exports.getRecord = async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const record = await prisma.record.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { name: true } } }
    });
    if (!record) return res.status(404).json({ success: false, error: 'Record not found.' });
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

exports.createRecord = async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { amount, currency, type, category, date, notes, name } = req.body;
    const record = await prisma.record.create({
      data: {
        userId: req.user.id,
        amount: parseFloat(amount),
        currency: currency || '$',
        type,
        category,
        date: date ? new Date(date) : new Date(),
        notes: notes || '',
        name: name || ''
      }
    });
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

exports.updateRecord = async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { amount, currency, type, category, date, notes, name } = req.body;
    const record = await prisma.record.update({
      where: { id: req.params.id },
      data: {
        ...(amount    !== undefined && { amount: parseFloat(amount) }),
        ...(currency  !== undefined && { currency }),
        ...(type      !== undefined && { type }),
        ...(category  !== undefined && { category }),
        ...(date      !== undefined && { date: new Date(date) }),
        ...(notes     !== undefined && { notes }),
        ...(name      !== undefined && { name })
      }
    });
    res.json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ success: false, error: 'Record not found.' });
    next(err);
  }
};

exports.deleteRecord = async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    await prisma.record.update({
      where: { id: req.params.id },
      data: { isDeleted: true }
    });
    res.json({ success: true, message: 'Record soft-deleted.' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ success: false, error: 'Record not found.' });
    next(err);
  }
};

exports.restoreRecord = async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const record = await prisma.record.update({
      where: { id: req.params.id },
      data: { isDeleted: false }
    });
    res.json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ success: false, error: 'Record not found.' });
    next(err);
  }
};

exports.uploadCSVRecords = async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded.' });

    const results = [];
    const stream = Readable.from(req.file.buffer.toString());

    stream
      .pipe(csv())
      .on('data', (row) => {
        const name     = row['Name']     || row['name']     || '';
        const amount   = parseFloat(row['Amount']   || row['amount']   || 0);
        const currency = row['Currency'] || row['currency'] || '$';
        const type     = row['Type']     || row['type']     || 'Expense';
        const category = row['Category'] || row['category'] || 'Other';
        const date     = row['Date']     || row['date'] ? new Date(row['Date'] || row['date']) : new Date();
        const notes    = row['Notes']    || row['notes']    || '';

        if (amount && type && category) {
          results.push({ userId: req.user.id, name, amount, currency, type, category, date, notes });
        }
      })
      .on('end', async () => {
        if (results.length === 0) {
          return res.status(400).json({ success: false, error: 'No valid records found in CSV.' });
        }
        await prisma.record.createMany({ data: results });
        res.json({ success: true, message: `✅ Successfully imported ${results.length} record(s) from CSV.` });
      })
      .on('error', (err) => next(err));
  } catch (err) {
    next(err);
  }
};
