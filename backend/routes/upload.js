const express = require('express');
const router = express.Router();
const multer = require('multer');
const Papa = require('papaparse');
const xlsx = require('xlsx');
const fs = require('fs');
const auth = require('../middleware/auth');
const Agent = require('../models/Agent');
const ListItem = require('../models/ListItem');
const Distribution = require('../models/Distribution');


const upload = multer({ dest: 'uploads/' });


function normalizeRowKeys(row) {
  const normalized = {};
  for (let key in row) {
    if (row.hasOwnProperty(key)) {
      const cleanKey = key.toLowerCase().trim().replace(/\uFEFF/g, '');
      normalized[cleanKey] = row[key]?.toString().trim() || '';
    }
  }
  return normalized;
}

function parseFileSync(path, originalname) {
  const ext = originalname.split('.').pop().toLowerCase();
  if (ext === 'csv') {
    const content = fs.readFileSync(path, 'utf8');
    return Papa.parse(content, { header: true, skipEmptyLines: true }).data;
  } else if (ext === 'xlsx' || ext === 'xls') {
    const workbook = xlsx.readFile(path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return xlsx.utils.sheet_to_json(sheet);
  } else {
    throw new Error('Unsupported file type');
  }
}


router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const allowed = ['csv', 'xlsx', 'xls'];
    const ext = req.file.originalname.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Invalid file type' });
    }

    const rows = parseFileSync(req.file.path, req.file.originalname);

    const normalized = rows.map(raw => {
      const r = normalizeRowKeys(raw);
      return {
        firstName: (r.firstname || r['first name'] || r.name || r['full name'] || 'Unnamed').trim(),
        phone: (r.phone || r['phone number'] || '').trim(),
        notes: (r.notes || r.note || '').trim(),
      };
    });

  
    for (let i = 0; i < normalized.length; i++) {
      if (!normalized[i].phone) {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: `Row ${i + 1} missing phone` });
      }
    }

  
    const createdItems = [];
    for (const r of normalized) {
      const item = await ListItem.create(r);
      createdItems.push(item);
    }


    const agents = await Agent.find({}).limit(5);
    if (!agents.length) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'No agents available' });
    }

 
    const nAgents = agents.length;
    const agentItemsMap = agents.map(() => []); 

    for (let i = 0; i < createdItems.length; i++) {
      const agentIndex = i % nAgents; 
      agentItemsMap[agentIndex].push(createdItems[i]);
    }

    const distributions = [];
    for (let i = 0; i < nAgents; i++) {
      if (agentItemsMap[i].length === 0) continue;

      const dist = await Distribution.create({
        agent: agents[i]._id,
        items: agentItemsMap[i].map(x => x._id),
        originalFileName: req.file.originalname,
      });
      distributions.push(dist);
    }

    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    return res.json({ message: 'Uploaded and distributed', distributions });
  } catch (err) {
    console.error(err);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(500).json({ message: err.message });
  }
});

router.get('/distributed', auth, async (req, res) => {
  try {
    const latest = await Distribution.findOne().sort({ createdAt: -1 });
    if (!latest) {
      return res.json({ distributions: [] });
    }

 
    const distributions = await Distribution.find({ originalFileName: latest.originalFileName })
      .populate('agent', 'firstName lastName email phone')
      .populate('items');


    const result = distributions.map(d => {
      let agentInfo = null;
      if (d.agent) {
        agentInfo = {
          name: `${d.agent.firstName || ""} ${d.agent.lastName || ""}`.trim(),
          email: d.agent.email || "",
          phone: d.agent.phone || ""
        };
      }

      return {
        _id: d._id,
        originalFileName: d.originalFileName,
        items: d.items,
        agent: agentInfo
      };
    });

    return res.json({ distributions: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
});


module.exports = router;
