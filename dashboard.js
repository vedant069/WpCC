import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function startDashboard(store, messageHandler, port = 18790) {
    const app = express();

    app.use(cors());
    app.use(express.json({ strict: false }));
    app.use(express.static(path.join(__dirname, 'public')));

    // API Routes
    app.get('/api/stats', (req, res) => {
        try {
            const totalCost = store.getTotalCost();
            const activeSessions = store.getAllActiveSessions();

            // Get all sessions to count total
            const allSessions = store.db.prepare('SELECT COUNT(*) as count FROM sessions').get().count;
            const allMessages = store.db.prepare('SELECT COUNT(*) as count FROM messages').get().count;

            res.json({
                totalCost,
                activeCount: activeSessions.length,
                totalSessions: allSessions,
                totalMessages: allMessages
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/sessions', (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const offset = (page - 1) * limit;

            const sessions = store.db.prepare(
                'SELECT * FROM sessions ORDER BY updated_at DESC LIMIT ? OFFSET ?'
            ).all(limit, offset);

            const total = store.db.prepare('SELECT COUNT(*) as count FROM sessions').get().count;

            res.json({
                sessions,
                total,
                page,
                totalPages: Math.ceil(total / limit)
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/sessions/:id/messages', (req, res) => {
        try {
            const messages = store.getMessages(req.params.id, 100);
            res.json(messages);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/sessions/active', (req, res) => {
        try {
            const active = store.getAllActiveSessions();
            res.json(active);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // --- Web Chat Endpoints ---

    // Start a brand new session from the dashboard
    app.post('/api/sessions/start', async (req, res) => {
        try {
            const { phone, text } = req.body;
            if (!phone || !text) return res.status(400).json({ error: 'phone and text are required' });

            // Ensure we are explicitly instructing a start so the Orchestrator doesn't assume we want to resume
            const matchStart = String(text).match(/^(start fresh|new task|ignore previous)/i);
            const startInstruction = matchStart
                ? String(text)
                : `[start fresh] ${String(text)}`;

            console.log(`[Dashboard] Dispatching START_SESSION for ${phone} with task: ${startInstruction}`);
            const result = await messageHandler({
                phone: String(phone),
                text: startInstruction,
                pushName: 'Web Dashboard'
            });

            console.log(`[Dashboard] messageHandler completed with result:`, result);
            res.json({ success: true, message: 'Start command dispatched', sessionId: result?.sessionId });
        } catch (error) {
            console.error(`[Dashboard] Error in /start:`, error);
            res.status(500).json({ error: error.message });
        }
    });

    // Send a message to an existing session from the dashboard
    app.post('/api/sessions/:id/message', async (req, res) => {
        try {
            const { phone, text } = req.body;
            const sessionId = req.params.id;
            if (!phone || !text) return res.status(400).json({ error: 'phone and text are required' });

            // Check if session exists
            const session = store.getSession(sessionId);
            if (!session) return res.status(404).json({ error: 'Session not found' });

            // To resume exactly that session, we inject the session ID into the text so the fast-path/orchestrator picks it up
            const resumeInstruction = `[resume ${sessionId}] ${text}`;

            await messageHandler({
                phone: String(phone),
                text: resumeInstruction,
                pushName: 'Web Dashboard'
            });

            res.json({ success: true, message: 'Message dispatched' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.listen(port, () => {
        console.log(`[Dashboard] 🌐 Web Dashboard is running on port ${port}`);
    });
}
