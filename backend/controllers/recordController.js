const Record = require('../models/Record');
const csv = require('csv-parser');
const stream = require('stream');

exports.getRecords = async (req, res, next) => {
  try {
    const { startDate, endDate, type, category, keyword, sort, limit = 10, page = 1, showDeleted } = req.query;

    const query = {};
    
    if (showDeleted === 'true') {
      query.isDeleted = true;
    } else {
      query.isDeleted = false;
    }

    if (type) query.type = type;
    if (category) query.category = category;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (keyword) {
      query.$or = [
        { notes: { $regex: keyword, $options: 'i' } },
        { category: { $regex: keyword, $options: 'i' } }
      ];
    }

    let sortObj = { date: -1 };
    if (sort === 'amount') sortObj = { amount: -1 };
    if (sort === 'amount_asc') sortObj = { amount: 1 };
    if (sort === 'date_asc') sortObj = { date: 1 };

    const skip = (page - 1) * limit;

    const records = await Record.find(query)
      .populate('user', 'name email')
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    const total = await Record.countDocuments(query);

    res.json({ 
      success: true, 
      count: records.length, 
      total,
      page: Number(page),
      data: records 
    });
  } catch (err) { next(err); }
};

exports.getRecord = async (req, res, next) => {
  try {
    const record = await Record.findOne({ _id: req.params.id, isDeleted: false });
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json({ success: true, data: record });
  } catch (err) { next(err); }
};

exports.createRecord = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    const record = await Record.create(req.body);
    res.status(201).json({ success: true, data: record });
  } catch (err) { next(err); }
};

exports.updateRecord = async (req, res, next) => {
  try {
    const record = await Record.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false }, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json({ success: true, data: record });
  } catch (err) { next(err); }
};

exports.deleteRecord = async (req, res, next) => {
  try {
    // Soft Delete
    const record = await Record.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json({ success: true, data: {} });
  } catch (err) { next(err); }
};

exports.restoreRecord = async (req, res, next) => {
  try {
    // Restore softly deleted record
    const record = await Record.findOneAndUpdate(
      { _id: req.params.id, isDeleted: true },
      { isDeleted: false },
      { new: true }
    );
    if (!record) return res.status(404).json({ error: 'Record not found or not deleted' });
    res.json({ success: true, data: record });
  } catch (err) { next(err); }
};

exports.uploadCSVRecords = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a CSV file' });
    }

    const results = [];
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    bufferStream
      .pipe(csv())
      .on('data', (data) => {
        // Map the columns: Name, Amount, Currency, Type, Category, Date, Notes
        const cleanKey = (key) => key.trim().toLowerCase();
        let row = {};
        for (let key in data) {
           row[cleanKey(key)] = data[key];
        }

        const amount = parseFloat(row.amount);
        if (!isNaN(amount) && row.type && row.category) {
          results.push({
            user: req.user.id,
            name: row.name || row.candidatename || '',
            amount: amount,
            currency: row.currency || '$',
            type: row.type.charAt(0).toUpperCase() + row.type.slice(1).toLowerCase(), // Capitalize
            category: row.category,
            date: row.date ? new Date(row.date) : new Date(),
            notes: row.notes || ''
          });
        }
      })
      .on('end', async () => {
        try {
          if (results.length === 0) {
            return res.status(400).json({ error: 'No valid rows found to insert.' });
          }
          await Record.insertMany(results);
          res.json({ success: true, count: results.length, message: `Successfully inserted ${results.length} records.` });
        } catch (dbErr) {
          next(dbErr);
        }
      })
      .on('error', (err) => {
        next(err);
      });
      
  } catch (err) {
    next(err);
  }
};
