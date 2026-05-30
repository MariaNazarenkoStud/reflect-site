const db = require('./db');

async function migrate() {
  // створюємо всі таблиці
  await db.query(`
    CREATE TABLE IF NOT EXISTS brand_info (
      id      INTEGER PRIMARY KEY,
      name    TEXT NOT NULL,
      tagline TEXT,
      about   TEXT
    );

    CREATE TABLE IF NOT EXISTS colors (
      id    SERIAL PRIMARY KEY,
      name  TEXT NOT NULL,
      hex   TEXT NOT NULL,
      label TEXT
    );

    CREATE TABLE IF NOT EXISTS fonts (
      id     SERIAL PRIMARY KEY,
      name   TEXT NOT NULL,
      weight TEXT,
      usage  TEXT
    );

    CREATE TABLE IF NOT EXISTS mockups (
      id         SERIAL PRIMARY KEY,
      title      TEXT NOT NULL,
      image_path TEXT NOT NULL,
      category   TEXT
    );

    CREATE TABLE IF NOT EXISTS slogans (
      id        SERIAL PRIMARY KEY,
      text      TEXT NOT NULL,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS orders (
      id                   SERIAL PRIMARY KEY,
      name                 TEXT NOT NULL,
      email                TEXT NOT NULL,
      phone                TEXT,
      material_description TEXT NOT NULL,
      product_type         TEXT NOT NULL,
      quantity             INTEGER DEFAULT 1,
      notes                TEXT,
      status               TEXT DEFAULT 'pending'
                           CHECK (status IN ('pending','confirmed','in_progress','done','rejected')),
      created_at           TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // заповнюємо початковими даними тільки якщо база порожня
  const { rows } = await db.query('SELECT COUNT(*) AS c FROM brand_info');
  if (parseInt(rows[0].c) > 0) return;

  await db.query(`
    INSERT INTO brand_info (id, name, tagline, about)
    VALUES (1, 'Re:flect', 'Second Life. First Impact.',
      'Re:flect — бренд, у якому кожен шов, кожен матеріал не просто з історією, а з новим сенсом. 100% handmade from urban waste. Made in Ukraine.');

    INSERT INTO colors (name, hex, label) VALUES
      ('Coral Wave', '#FE6077', 'Основний акцент'),
      ('Lime Pulse', '#B3D042', 'Другий акцент'),
      ('Raw Cream',  '#F6E9D8', 'Фон'),
      ('Deep Tide',  '#154A61', 'Текст і деталі');

    INSERT INTO fonts (name, weight, usage) VALUES
      ('Proxima Nova',    'Extrabold', 'Заголовки, логотип, великі написи'),
      ('Cabinet Grotesk', 'Extrabold', 'Дисплейний текст, підписи, ярлики');

    INSERT INTO mockups (title, image_path, category) VALUES
      ('Hang Tags',           'images/mockup-tags.png',      'print'),
      ('Apparel',             'images/mockup-tshirt.png',    'apparel'),
      ('Business Cards',      'images/mockup-cards.png',     'print'),
      ('Packaging',           'images/mockup-packaging.png', 'packaging'),
      ('Street Poster',       'images/mockup-poster.png',    'outdoor'),
      ('Outdoor Advertising', 'images/mockup-billboard.png', 'outdoor');

    INSERT INTO slogans (text, is_active) VALUES
      ('Second Life. First Impact.',                             1),
      ('Everything Deserves A Second Wave.',                     1),
      ('Born to Re:flect You.',                                  1),
      ('Your new favorite backpack, with a past and a purpose.', 0);
  `);

  console.log('Database ready with initial data.');
}

module.exports = migrate;
