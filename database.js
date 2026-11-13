const fs = require('node:fs');
const path = require('node:path');
const Database = require('better-sqlite3');

const databasePath = process.env.DATABASE_PATH || path.join(__dirname, 'data', 'resources.db');
fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const db = new Database(databasePath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.exec(`
  CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    url TEXT NOT NULL,
    tags TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_resources_subject ON resources(subject);
  CREATE INDEX IF NOT EXISTS idx_resources_difficulty ON resources(difficulty);
  CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
`);

const count = db.prepare('SELECT COUNT(*) AS count FROM resources').get().count;
if (count === 0) {
  const seedPath = path.join(__dirname, 'data', 'resources.json');
  const seedResources = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  const insert = db.prepare(`
    INSERT INTO resources (title, subject, difficulty, type, description, url, tags)
    VALUES (@title, @subject, @difficulty, @type, @description, @url, @tags)
  `);
  const seed = db.transaction((resources) => {
    for (const resource of resources) {
      insert.run({ ...resource, tags: JSON.stringify(resource.tags || []) });
    }
  });
  seed(seedResources);
}

function toResource(row) {
  if (!row) return null;
  return { ...row, tags: JSON.parse(row.tags) };
}

function listResources({ q, subject, difficulty, type }) {
  const clauses = [];
  const values = {};
  if (q) {
    clauses.push(`(instr(lower(title), lower(@q)) > 0 OR instr(lower(subject), lower(@q)) > 0
      OR instr(lower(description), lower(@q)) > 0 OR instr(lower(tags), lower(@q)) > 0)`);
    values.q = q;
  }
  for (const field of ['subject', 'difficulty', 'type']) {
    if (arguments[0][field]) {
      clauses.push(`lower(${field}) = lower(@${field})`);
      values[field] = arguments[0][field];
    }
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return db.prepare(`SELECT * FROM resources ${where} ORDER BY title COLLATE NOCASE`).all(values).map(toResource);
}

function getResource(id) {
  return toResource(db.prepare('SELECT * FROM resources WHERE id = ?').get(id));
}

function createResource(resource) {
  const result = db.prepare(`
    INSERT INTO resources (title, subject, difficulty, type, description, url, tags)
    VALUES (@title, @subject, @difficulty, @type, @description, @url, @tags)
  `).run({ ...resource, tags: JSON.stringify(resource.tags) });
  return getResource(result.lastInsertRowid);
}

function updateResource(id, resource) {
  const result = db.prepare(`
    UPDATE resources SET title = @title, subject = @subject, difficulty = @difficulty,
      type = @type, description = @description, url = @url, tags = @tags,
      updated_at = CURRENT_TIMESTAMP WHERE id = @id
  `).run({ ...resource, tags: JSON.stringify(resource.tags), id });
  return result.changes ? getResource(id) : null;
}

function deleteResource(id) {
  return db.prepare('DELETE FROM resources WHERE id = ?').run(id).changes > 0;
}

module.exports = { db, listResources, getResource, createResource, updateResource, deleteResource };
