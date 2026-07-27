const express = require('express');
const cors = require('cors');
const db = require('./db');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/api/predictions', (req, res) => {
    const { matchId, home, away, username } = req.body;
    if (!matchId || !username) return res.status(400).json({ error: '参数缺失' });
    const match = db.prepare('SELECT status FROM matches WHERE id = ?').get(matchId);
    if (!match) return res.status(404).json({ error: '比赛不存在' });
    if (match.status === 'FINISHED' || match.status === 'IN_PLAY') {
        return res.status(409).json({ error: '比赛已开始或已结束，无法预测' });
    }
    db.prepare('INSERT INTO predictions (match_id, username, predicted_home, predicted_away) VALUES (?,?,?,?)')
      .run(matchId, username, home, away);
    res.json({ success: true });
});

app.get('/api/predictions', (req, res) => {
    const { username } = req.query;
    if (!username) return res.json([]);
    const preds = db.prepare(`
        SELECT p.*, m.home_team_id, m.away_team_id, m.score_home, m.score_away
        FROM predictions p JOIN matches m ON p.match_id = m.id
        WHERE p.username = ? ORDER BY p.created_at DESC
    `).all(username);
    res.json(preds);
});

app.post('/api/comments', (req, res) => {
    const { matchId, username, content } = req.body;
    if (!username || !content) return res.status(400).json({ error: '参数缺失' });
    db.prepare('INSERT INTO comments (match_id, username, content) VALUES (?,?,?)')
      .run(matchId || null, username, content);
    res.json({ success: true });
});

app.get('/api/comments', (req, res) => {
    const { matchId } = req.query;
    const rows = matchId
        ? db.prepare('SELECT * FROM comments WHERE match_id = ? ORDER BY created_at DESC').all(matchId)
        : db.prepare('SELECT * FROM comments ORDER BY created_at DESC LIMIT 50').all();
    res.json(rows);
});

app.listen(3000, () => console.log('Server running on port 3000'));
