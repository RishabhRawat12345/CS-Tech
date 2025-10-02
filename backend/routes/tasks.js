const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parse');
const fs = require('fs');
const verifyToken = require('../middleware/auth');
const Task = require('../models/Task');
const User = require('../models/User');

const upload = multer({ dest: 'uploads/' });


router.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const fileRows = [];
        const parser = fs.createReadStream(req.file.path).pipe(csv({ columns: true, trim: true }));

        parser.on('data', row => {
            
            if (!row.firstName || !row.phone) throw new Error('Invalid CSV format');
            fileRows.push(row);
        });

        parser.on('end', async () => {
            fs.unlinkSync(req.file.path); 

            const agents = await User.find({ role: 'agent' });
            if (!agents.length) return res.status(400).json({ message: 'No agents found' });

            const distributedTasks = [];
            let agentIndex = 0;

            for (const row of fileRows) {
                const task = new Task({
                    firstName: row.firstName,
                    phone: row.phone,
                    notes: row.notes || '',
                    assignedAgent: agents[agentIndex]._id
                });

                await task.save();
                distributedTasks.push(task);

                agentIndex = (agentIndex + 1) % agents.length; 
            }

            res.json({ message: 'Tasks distributed successfully', distributedTasks });
        });

        parser.on('error', err => {
            fs.unlinkSync(req.file.path);
            res.status(500).json({ message: err.message });
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.get('/:agentId', verifyToken, async (req, res) => {
    try {
        const tasks = await Task.find({ assignedAgent: req.params.agentId });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
