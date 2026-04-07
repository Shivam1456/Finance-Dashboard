const Record = require('../models/Record');
const csv = require('csv-parser');
const { Readable } = require('stream');

exports.getRecords = async (req, res, next) => {
  try {
    const { keyword, type, sort, showDeleted, limit } = req.query;
    const query = {};

    if (showDeleted !== 'true') query.isDeleted = false;
    if (type) query.type = type;
    if (keyword) {
      query.$or = [
        { notes: { $regex: keyword, $options: 'i' } },
        { category: { $regex: keyword, $options: 'i' } },
        { name: { $regex: keyword, $options: 'i' } }
      ];
    }

    let sortObj = { date: -1 };
    if (sort === 'date_asc') sortObj = { date: 1 };
    else if (sort === 'amount') sortObj = { amount: -1 };
    else if (sort === 'amount_asc') sortObj = { amount: 1 };

    const lim = parseInt(limit) || 100;
    const records = await Record.find(query).populate('user', 'name').sort(sortObj).limit(lim);
    res.json({ success: true, data: records });
  } catch (err) {
    next(err);
  }
};

exports.getRecord = async (req, res, next) => {
  try {
    const record = await Record.findById(req.params.id).populate('user', 'name');
    if (!record) return res.status(404).json({ success: false, error: 'Record not found.' });
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

exports.createRecord = async (req, res, next) => {
  try {
    const { amount, currency, type, category, date, notes, name } = req.body;
    const record = await Record.create({
      user: req.user.id,
      amount, currency, type, category,
      date: date ? new Date(date) : new Date(),
      notes: notes || '',
      name: name || ''
    });
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

exports.updateRecord = async (req, res, next) => {
  try {
    const record = await Record.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!record) return res.status(404).json({ success: false, error: 'Record not found.' });
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

exports.deleteRecord = async (req, res, next) => {
  try {
    const record = await Record.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    if (!record) return res.status(404).json({ success: false, error: 'Record not found.' });
    res.json({ success: true, message: 'Record soft-deleted.' });
  } catch (err) {
    next(err);
  }
};

exports.restoreRecord = async (req, res, next) => {
  try {
    const record = await Record.findByIdAndUpdate(req.params.id, { isDeleted: false }, { new: true });
    if (!record) return res.status(404).json({ success: false, error: 'Record not found.' });
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

exports.uploadCSVRecords = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded.' });

    const results = [];
    const stream = Readable.from(req.file.buffer.toString());

    stream
      .pipe(csv())
      .on('data', (row) => {
        // Expected CSV columns: Name, Amount, Currency, Type, Category, Date, Notes
        const name = row['Name'] || row['name'] || '';
        const amount = parseFloat(row['Amount'] || row['amount'] || 0);
        const currency = row['Currency'] || row['currency'] || '$';
        const type = row['Type'] || row['type'] || 'Expense';
        const category = row['Category'] || row['category'] || 'Other';
        const date = row['Date'] || row['date'] ? new Date(row['Date'] || row['date']) : new Date();
        const notes = row['Notes'] || row['notes'] || '';

        if (amount && type && category) {
          results.push({ user: req.user.id, name, amount, currency, type, category, date, notes });
        }
      })
      .on('end', async () => {
        if (results.length === 0) {
          return res.status(400).json({ success: false, error: 'No valid records found in CSV.' });
        }
        await Record.insertMany(results);
        res.json({ success: true, message: `✅ Successfully imported ${results.length} record(s) from CSV.` });
      })
      .on('error', (err) => next(err));
  } catch (err) {
    next(err);
  }
};
