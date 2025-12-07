import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'customers.tsv');

class Mutex {
  constructor() { this._locked = false; this._waiters = []; }
  lock() {
    return new Promise(resolve => {
      if (!this._locked) {
        this._locked = true;
        resolve(() => { this._locked = false; if (this._waiters.length) this._waiters.shift()(); });
      } else {
        this._waiters.push(() => {
          this._locked = true;
          resolve(() => { this._locked = false; if (this._waiters.length) this._waiters.shift()(); });
        });
      }
    });
  }
}

const mutex = new Mutex();

async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(DATA_FILE);
  } catch (e) {
    // create with header
    const header = 'id\tname\temail\tcreatedAt\n';
    await fs.writeFile(DATA_FILE, header, 'utf8');
  }
}

function parseRows(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  const header = lines[0].split('\t');
  const rows = lines.slice(1).map(line => {
    const cols = line.split('\t');
    const obj = {};
    for (let i = 0; i < header.length; i++) {
      obj[header[i]] = cols[i] ?? '';
    }
    // normalize id
    if (obj.id) obj.id = String(obj.id);
    return obj;
  });
  return rows;
}

async function readAll() {
  await ensureDataFile();
  const txt = await fs.readFile(DATA_FILE, 'utf8');
  return parseRows(txt);
}

async function writeAll(rows) {
  const header = ['id','name','email','createdAt'];
  const lines = [header.join('\t')];
  for (const r of rows) {
    lines.push([r.id, r.name ?? '', r.email ?? '', r.createdAt ?? ''].join('\t'));
  }
  await fs.writeFile(DATA_FILE, lines.join('\n') + '\n', 'utf8');
}

export async function getAllCustomers() {
  return await readAll();
}

export async function getCustomerById(id) {
  const rows = await readAll();
  return rows.find(r => String(r.id) === String(id)) || null;
}

export async function createCustomer({ name, email }) {
  if (!name || !email) throw new Error('name and email are required');
  const release = await mutex.lock();
  try {
    const rows = await readAll();
    const ids = rows.map(r => Number(r.id)).filter(n => !isNaN(n));
    const nextId = ids.length ? Math.max(...ids) + 1 : 1;
    const createdAt = new Date().toISOString();
    const customer = { id: String(nextId), name, email, createdAt };
    rows.push(customer);
    await writeAll(rows);
    return customer;
  } finally {
    release();
  }
}

export async function updateCustomer(id, { name, email }) {
  const release = await mutex.lock();
  try {
    const rows = await readAll();
    const idx = rows.findIndex(r => String(r.id) === String(id));
    if (idx === -1) return null;
    if (name !== undefined) rows[idx].name = name;
    if (email !== undefined) rows[idx].email = email;
    await writeAll(rows);
    return rows[idx];
  } finally {
    release();
  }
}

// Add a replace function for full (PUT) updates: require both name and email
export async function replaceCustomer(id, { name, email }) {
  const release = await mutex.lock();
  try {
    const rows = await readAll();
    const idx = rows.findIndex(r => String(r.id) === String(id));
    if (idx === -1) return null;
    if (!name || !email) throw new Error('PUT requires name and email');
    // preserve id and createdAt
    rows[idx] = { id: String(rows[idx].id), name, email, createdAt: rows[idx].createdAt };
    await writeAll(rows);
    return rows[idx];
  } finally {
    release();
  }
}

export async function deleteCustomer(id) {
  const release = await mutex.lock();
  try {
    const rows = await readAll();
    const idx = rows.findIndex(r => String(r.id) === String(id));
    if (idx === -1) return false;
    rows.splice(idx, 1);
    await writeAll(rows);
    return true;
  } finally {
    release();
  }
}
