const Database = require('better-sqlite3');
const path = require('path');

// тут живе база даних
const db = new Database(path.join(__dirname, 'brand.db'));

// вмикаємо зовнішні ключі
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// створюємо всі таблиці якщо їх ще немає
db.exec(`
  CREATE TABLE IF NOT EXISTS brand_info (
    id      INTEGER PRIMARY KEY,
    name    TEXT NOT NULL,
    tagline TEXT,
    about   TEXT
  );

  CREATE TABLE IF NOT EXISTS colors (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    name  TEXT NOT NULL,
    hex   TEXT NOT NULL,
    label TEXT
  );

  CREATE TABLE IF NOT EXISTS fonts (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    name   TEXT NOT NULL,
    weight TEXT,
    usage  TEXT
  );

  CREATE TABLE IF NOT EXISTS mockups (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT NOT NULL,
    image_path TEXT NOT NULL,
    category   TEXT
  );

  CREATE TABLE IF NOT EXISTS slogans (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    text      TEXT NOT NULL,
    is_active INTEGER DEFAULT 1
  );
`);

// заповнюємо початковими даними якщо таблиці пусті
const brandCount = db.prepare('SELECT COUNT(*) as c FROM brand_info').get().c;
if (brandCount === 0) {
  db.prepare(`
    INSERT INTO brand_info (id, name, tagline, about) VALUES (1, ?, ?, ?)
  `).run(
    'Re:flect',
    'Second Life. First Impact.',
    'Re:flect — бренд, у якому кожен шов, кожен матеріал не просто з історією, а з новим сенсом. 100% handmade from urban waste. Made in Ukraine.'
  );

  const insertColor = db.prepare('INSERT INTO colors (name, hex, label) VALUES (?, ?, ?)');
  insertColor.run('Coral Wave',  '#FE6077', 'Основний акцент');
  insertColor.run('Lime Pulse',  '#B3D042', 'Другий акцент');
  insertColor.run('Raw Cream',   '#F6E9D8', 'Фон');
  insertColor.run('Deep Tide',   '#154A61', 'Текст і деталі');

  const insertFont = db.prepare('INSERT INTO fonts (name, weight, usage) VALUES (?, ?, ?)');
  insertFont.run('Proxima Nova',   'Extrabold', 'Заголовки, логотип, великі написи');
  insertFont.run('Cabinet Grotesk','Extrabold', 'Дисплейний текст, підписи, ярлики');

  const insertMockup = db.prepare('INSERT INTO mockups (title, image_path, category) VALUES (?, ?, ?)');
  insertMockup.run('Hang Tags',          'images/mockup-tags.png',      'print');
  insertMockup.run('Apparel',            'images/mockup-tshirt.png',    'apparel');
  insertMockup.run('Business Cards',     'images/mockup-cards.png',     'print');
  insertMockup.run('Packaging',          'images/mockup-packaging.png', 'packaging');
  insertMockup.run('Street Poster',      'images/mockup-poster.png',    'outdoor');
  insertMockup.run('Outdoor Advertising','images/mockup-billboard.png', 'outdoor');

  const insertSlogan = db.prepare('INSERT INTO slogans (text, is_active) VALUES (?, ?)');
  insertSlogan.run('Second Life. First Impact.', 1);
  insertSlogan.run('Everything Deserves A Second Wave.', 1);
  insertSlogan.run('Born to Re:flect You.', 1);
  insertSlogan.run('Your new favorite backpack, with a past and a purpose.', 0);
}

module.exports = db;
