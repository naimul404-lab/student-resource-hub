const crypto = require('node:crypto');
const path = require('node:path');
const express = require('express');
const store = require('./database');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));

const publicFiles = {
  '/': 'index.html',
  '/index.html': 'index.html',
  '/styles.css': 'styles.css',
  '/script.js': 'script.js'
};
for (const [route, file] of Object.entries(publicFiles)) {
  app.get(route, (_req, res) => res.sendFile(path.join(__dirname, file)));
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.get('/api/resources', (req, res) => {
  const filters = {};
  for (const key of ['q', 'subject', 'difficulty', 'type']) {
    const value = req.query[key];
    if (typeof value === 'string') filters[key] = value.trim().slice(0, 100);
  }
  res.json({ data: store.listResources(filters) });
});

app.get('/api/resources/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid resource id.' });
  const resource = store.getResource(id);
  if (!resource) return res.status(404).json({ error: 'Resource not found.' });
  res.json({ data: resource });
});

function requireAdmin(req, res, next) {
  const configuredKey = process.env.ADMIN_API_KEY;
  const suppliedKey = req.get('x-admin-key') || '';
  if (!configuredKey) return res.status(503).json({ error: 'Admin writes are not configured on this server.' });
  const expected = Buffer.from(configuredKey);
  const supplied = Buffer.from(suppliedKey);
  if (expected.length !== supplied.length || !crypto.timingSafeEqual(expected, supplied)) {
    return res.status(401).json({ error: 'A valid x-admin-key header is required.' });
  }
  next();
}

function validateResource(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Request body must be a JSON object.';
  for (const field of ['title', 'subject', 'difficulty', 'type', 'description', 'url']) {
    if (typeof body[field] !== 'string' || !body[field].trim()) return `${field} is required.`;
    if (body[field].trim().length > (field === 'description' ? 2000 : 300)) return `${field} is too long.`;
  }
  let parsedUrl;
  try { parsedUrl = new URL(body.url); } catch { return 'url must be a valid URL.'; }
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) return 'url must use HTTP or HTTPS.';
  if (body.tags !== undefined && (!Array.isArray(body.tags) || body.tags.length > 20 || body.tags.some((tag) => typeof tag !== 'string' || tag.length > 50))) {
    return 'tags must be an array of up to 20 strings, each no longer than 50 characters.';
  }
  return null;
}

function normalizeResource(body) {
  return {
    title: body.title.trim(), subject: body.subject.trim(), difficulty: body.difficulty.trim(),
    type: body.type.trim(), description: body.description.trim(), url: body.url.trim(),
    tags: (body.tags || []).map((tag) => tag.trim()).filter(Boolean)
  };
}

app.post('/api/resources', requireAdmin, (req, res) => {
  const error = validateResource(req.body);
  if (error) return res.status(400).json({ error });
  res.status(201).json({ data: store.createResource(normalizeResource(req.body)) });
});

app.put('/api/resources/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid resource id.' });
  const error = validateResource(req.body);
  if (error) return res.status(400).json({ error });
  const resource = store.updateResource(id, normalizeResource(req.body));
  if (!resource) return res.status(404).json({ error: 'Resource not found.' });
  res.json({ data: resource });
});

app.delete('/api/resources/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid resource id.' });
  if (!store.deleteResource(id)) return res.status(404).json({ error: 'Resource not found.' });
  res.status(204).end();
});

app.use('/api', (_req, res) => res.status(404).json({ error: 'API route not found.' }));
app.use((error, _req, res, _next) => {
  if (error instanceof SyntaxError && 'body' in error) return res.status(400).json({ error: 'Request body must contain valid JSON.' });
  console.error(error);
  res.status(500).json({ error: 'An unexpected server error occurred.' });
});

module.exports = app;
