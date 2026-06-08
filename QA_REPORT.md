# Звіт з забезпечення якості програмного продукту
## Інформаційна система інтерактивної презентації айдентики бренду Re:flect

**Репозиторій:** https://github.com/MariaNazarenkoStud/reflect-site  
**Стек:** Node.js · Express · PostgreSQL · Docker  
**Тестовий фреймворк:** Jest + Supertest  

---

## Частина 1. Manual Testing

### Пре-реквізит: Опис проекту

Re:flect — інформаційна система для інтерактивної презентації айдентики однойменного бренду, що виготовляє вироби з вторинних матеріалів. Система вирішує дві задачі: публічна частина показує кольорову палітру, типографіку, мокапи та слогани бренду з даних бази даних; форма прийому заявок дозволяє клієнтам передавати матеріали для переробки. Адмінська панель надає можливість переглядати заявки, змінювати їх статус та аналізувати статистику. Ключова цінність продукту — єдина точка управління айдентикою через REST API з PostgreSQL-базою даних замість статичного HTML.

*(882 символи)*

---

### 1.1 Функціональні вимоги

| ID | Назва | Опис | Пріоритет |
|----|-------|------|-----------|
| FR-01 | Перегляд кольорів бренду | `GET /api/colors` — повертає масив кольорів з полями name, hex, label | Високий |
| FR-02 | Перегляд типографіки | `GET /api/brand` — повертає шрифти бренду | Середній |
| FR-03 | Перегляд мокапів | `GET /api/mockups` — повертає список мокапів з image_path | Середній |
| FR-04 | Перегляд слоганів | `GET /api/slogans` — повертає активні слогани | Низький |
| FR-05 | Подача заявки | `POST /api/orders` — зберігає заявку з полями name, email, material_description, product_type (обов'язкові) | Високий |
| FR-06 | Валідація обов'язкових полів | Система повертає 400, якщо відсутній хоча б один з: name, email, material_description, product_type | Високий |
| FR-07 | Авторизація адміна | `POST /api/auth/login` — перевіряє пароль, повертає одноразовий токен | Високий |
| FR-08 | Перевірка токена | `GET /api/auth/check` — перевіряє Bearer-токен у заголовку Authorization | Високий |
| FR-09 | Перегляд усіх заявок | `GET /api/orders` — повертає список усіх заявок, відсортований за датою | Середній |
| FR-10 | Фільтрація заявок | `GET /api/orders?status=pending` — фільтрує заявки за статусом | Середній |
| FR-11 | Статистика заявок | `GET /api/orders/stats` — повертає кількість заявок за кожним статусом | Середній |
| FR-12 | Зміна статусу заявки | `PUT /api/orders/:id` — змінює статус; допустимі: pending, confirmed, in_progress, done, rejected | Середній |
| FR-13 | Відхилення невалідного статусу | При спробі встановити недопустимий статус система повертає 400 | Середній |
| FR-14 | Видалення заявки | `DELETE /api/orders/:id` — видаляє заявку з бази даних | Низький |

---

### 1.2 Архітектура та основні функції

#### Архітектура системи

Система побудована за трирівневою клієнт-серверною архітектурою:

```
Браузер (HTML/CSS/JS)
        ↕  HTTP REST
Node.js + Express (порт 5173)
        ↕  SQL (pg)
PostgreSQL (порт 5432)
```

Розгортання — Docker Compose: два контейнери (`app` та `db`), ізольована мережа, persistent volume для даних.

#### Основні модулі

| Файл | Призначення |
|------|-------------|
| `backend/app.js` | Точка входу Express: реєстрація маршрутів, middleware |
| `backend/server.js` | Старт сервера: виклик міграцій → `app.listen()` |
| `backend/db.js` | Пул підключень до PostgreSQL через `pg.Pool` |
| `backend/migrate.js` | Створення таблиць та заповнення початковими даними |
| `backend/routes/orders.js` | CRUD-операції з заявками |
| `backend/routes/auth.js` | Авторизація адміна (пароль → токен) |
| `backend/routes/colors.js` | CRUD для кольорів бренду |
| `backend/routes/brand.js` | Агрегований запит: info + colors + fonts + mockups + slogans |
| `frontend/index.html` | Публічна сторінка: презентація бренду + форма заявки |
| `frontend/admin.html` | Адмінська панель: управління заявками |

#### Зв'язок функцій з вимогами

| Функція / Ендпоінт | FR |
|--------------------|----|
| `GET /api/colors` | FR-01 |
| `GET /api/brand` | FR-02, FR-03, FR-04 |
| `POST /api/orders` | FR-05, FR-06 |
| `POST /api/auth/login` | FR-07 |
| `GET /api/auth/check` | FR-08 |
| `GET /api/orders` | FR-09, FR-10 |
| `GET /api/orders/stats` | FR-11 |
| `PUT /api/orders/:id` | FR-12, FR-13 |
| `DELETE /api/orders/:id` | FR-14 |

---

### 1.3 Тест-кейси

#### Автоматизовані (інтеграційні)

| TC-ID | Назва | Передумови | Кроки | Очікуваний результат | FR | Тип |
|-------|-------|------------|-------|---------------------|----|-----|
| TC-01 | Отримання списку кольорів | Сервер запущено, БД містить кольори | `GET /api/colors` | 200, масив об'єктів з полями hex, name | FR-01 | Позитивний |
| TC-02 | Отримання кольору за id | БД містить колір id=1 | `GET /api/colors/1` | 200, `{ name: "Coral Wave", hex: "#FE6077" }` | FR-01 | Позитивний |
| TC-03 | Колір не знайдено | БД не має кольору id=999 | `GET /api/colors/999` | 404 | FR-01 | Негативний |
| TC-04 | Подача заявки з валідними даними | Сервер запущено | `POST /api/orders` з name, email, material_description, product_type | 201, `{ id, message }` | FR-05 | Позитивний |
| TC-05 | Заявка без email | — | `POST /api/orders` без поля email | 400, `{ error }` | FR-06 | Негативний |
| TC-06 | Заявка без product_type | — | `POST /api/orders` лише з name | 400 | FR-06 | Негативний |
| TC-07 | Зміна статусу на валідний | Заявка id=1 існує | `PUT /api/orders/1` `{ status: "confirmed" }` | 200, `{ ok: true }` | FR-12 | Позитивний |
| TC-08 | Зміна на невалідний статус | — | `PUT /api/orders/1` `{ status: "unknown" }` | 400 | FR-13 | Негативний |
| TC-09 | Заявка не знайдена при PUT | id=999 відсутній | `PUT /api/orders/999` `{ status: "done" }` | 404 | FR-12 | Негативний |
| TC-10 | Видалення заявки | Заявка id=1 існує | `DELETE /api/orders/1` | 200, `{ ok: true }` | FR-14 | Позитивний |
| TC-11 | Видалення неіснуючої заявки | id=999 відсутній | `DELETE /api/orders/999` | 404 | FR-14 | Негативний |
| TC-12 | Отримання всіх заявок | — | `GET /api/orders` | 200, масив | FR-09 | Позитивний |
| TC-13 | Фільтрація заявок за статусом | — | `GET /api/orders?status=pending` | 200, масив | FR-10 | Позитивний |
| TC-14 | Статистика заявок | — | `GET /api/orders/stats` | 200, об'єкт з total, pending, done, ... | FR-11 | Позитивний |
| TC-15 | Логін з правильним паролем | — | `POST /api/auth/login` `{ password: "reflect2025" }` | 200, `{ token: "..." }` | FR-07 | Позитивний |
| TC-16 | Логін з неправильним паролем | — | `POST /api/auth/login` `{ password: "wrong" }` | 401 | FR-07 | Негативний |
| TC-17 | Логін з порожнім тілом | — | `POST /api/auth/login` `{}` | 401 | FR-07 | Негативний |
| TC-18 | Перевірка валідного токена | Отримано токен через TC-15 | `GET /api/auth/check` з Bearer-токеном | 200, `{ ok: true }` | FR-08 | Позитивний |
| TC-19 | Перевірка без токена | — | `GET /api/auth/check` без заголовка | 401 | FR-08 | Негативний |
| TC-20 | Перевірка невалідного токена | — | `GET /api/auth/check` з `Bearer fake123` | 401 | FR-08 | Негативний |

#### Мануальні

| TC-ID | Назва | Кроки | Очікуваний результат | FR | Тип |
|-------|-------|-------|---------------------|----|-----|
| TC-21 | Відображення кольорів на сторінці | Відкрити `http://localhost:5173`, прокрутити до секції "Чотири базові кольори" | Чотири кольорові плашки з назвами і HEX-кодами | FR-01 | Позитивний |
| TC-22 | Відображення мокапів | Відкрити сторінку, прокрутити до "Бренд у житті" | Сітка із зображеннями застосування | FR-03 | Позитивний |
| TC-23 | Відправка форми через UI | Заповнити форму в секції "Замовити", натиснути кнопку | Форма зникає, з'являється повідомлення про успіх | FR-05 | Позитивний |
| TC-24 | Авторизація в адмін-панель | Відкрити `/admin`, ввести пароль `reflect2025` | Відкривається таблиця заявок | FR-07 | Позитивний |
| TC-25 | Невалідний пароль у адмін-панелі | Відкрити `/admin`, ввести `wrongpass` | Показується повідомлення про помилку | FR-07 | Негативний |
| TC-26 | Зміна статусу через UI | В адмін-панелі обрати статус зі списку для заявки | Статус оновлюється у таблиці | FR-12 | Позитивний |

---

### 1.4 Тестові дані та процедури

#### Seed-дані (автоматично заповнюються через `migrate.js`)

| Таблиця | Кількість записів | Призначення |
|---------|-------------------|-------------|
| brand_info | 1 | Базова інформація про бренд |
| colors | 4 | Кольорова палітра |
| fonts | 2 | Шрифтова система |
| mockups | 6 | Зображення застосування |
| slogans | 4 (3 активних) | Слогани бренду |

#### Тестові дані для заявок

| Набір | name | email | material_description | product_type | Очікуваний результат |
|-------|------|-------|---------------------|--------------|---------------------|
| Валідний мінімум | "Тест" | "test@example.com" | "Банер 3x6м" | "bag" | 201 Created |
| Валідний повний | "Олена Тест" | "olena@test.com" | "PVC лист 2x2м" | "backpack" | 201 Created |
| Без email | "Тест" | *(порожньо)* | "Банер" | "bag" | 400 Bad Request |
| Без product_type | "Тест" | "t@t.com" | "Банер" | *(порожньо)* | 400 Bad Request |
| Без material_description | "Тест" | "t@t.com" | *(порожньо)* | "bag" | 400 Bad Request |
| Граничний: quantity=0 | "Тест" | "t@t.com" | "Банер" | "bag", quantity=0 | 201 (мін. валідація відсутня в API) |
| Граничний: довгий текст (>1000 символів) | "Тест" | "t@t.com" | 1001-символьний рядок | "bag" | 201 (обмеження на рівні БД відсутнє) |

#### Процедура заповнення тестовими даними

**Інтеграційні тести (автоматичні):** база даних замокана через `jest.mock('../db')`. Реальна БД не потрібна. Очищення — не потрібне.

**Мануальні тести:**
```bash
# Додати тестовий запис вручну через API
curl -X POST http://localhost:5173/api/orders \
  -H "Content-Type: application/json" \
  -d '{"name":"Manual Test","email":"manual@test.com","material_description":"Banner","product_type":"bag"}'

# Очищення після тестів
docker compose exec db psql -U reflect_user -d reflect_db \
  -c "DELETE FROM orders WHERE email LIKE '%test%' OR email LIKE '%example%';"
```

---

## Частина 2. Test Automation

**Обраний варіант: 2 — Інтеграційні тести контролерів**

> Тестуються HTTP-контролери (Express routes) через реальні HTTP-запити, тому це — інтеграційне тестування, а не юніт-тестування.

### Репозиторій та структура тестів

```
backend/
├── tests/
│   ├── auth.test.js      # TC-15–TC-20 (6 тестів)
│   ├── orders.test.js    # TC-04–TC-14 (11 тестів)
│   ├── colors.test.js    # TC-01–TC-03 + CRUD (10 тестів)
│   ├── brand.test.js     # Агрегований ендпоінт (5 тестів)
│   └── load/
│       └── scenario.yml  # Навантажувальне тестування
├── routes/               # Код що тестується
└── package.json          # Jest + coverage конфігурація
```

**Посилання на файли:**
- [auth.test.js](https://github.com/MariaNazarenkoStud/reflect-site/blob/main/backend/tests/auth.test.js)
- [orders.test.js](https://github.com/MariaNazarenkoStud/reflect-site/blob/main/backend/tests/orders.test.js)
- [colors.test.js](https://github.com/MariaNazarenkoStud/reflect-site/blob/main/backend/tests/colors.test.js)
- [brand.test.js](https://github.com/MariaNazarenkoStud/reflect-site/blob/main/backend/tests/brand.test.js)

### Тест-кейси що автоматизуються

TC-01, TC-02, TC-03 → `colors.test.js`  
TC-04, TC-05, TC-06 → `orders.test.js` (POST)  
TC-07, TC-08, TC-09 → `orders.test.js` (PUT)  
TC-10, TC-11 → `orders.test.js` (DELETE)  
TC-12, TC-13, TC-14 → `orders.test.js` (GET)  
TC-15, TC-16, TC-17, TC-18, TC-19, TC-20 → `auth.test.js`  

### Запуск тестів

```bash
cd backend
npm test
```

### Test Code Coverage

Команда: `npm test` (включає `--coverage` прапор)

Coverage збирається для: `routes/**/*.js`, `app.js`

Очікуваний результат:

```
File              | % Stmts | % Branch | % Funcs | % Lines
------------------|---------|----------|---------|--------
app.js            |     100 |      100 |     100 |     100
routes/auth.js    |     100 |      100 |     100 |     100
routes/orders.js  |      95 |       90 |     100 |      95
routes/colors.js  |      95 |       90 |     100 |      95
routes/brand.js   |      90 |       85 |     100 |      90
```

*Повне покриття помилкових гілок (catch-блоків) потребує симуляції помилок БД.*

### Посилання на комміт

Тести додані у коміті: `add integration tests for all routes`  
Coverage конфігурація: `add coverage to jest`

---

## Частина 3. Semi-automated Testing

### 3.1 Аналіз безпеки (SAST)

**Інструмент:** ESLint + `eslint-plugin-security`  
**Конфігурація:** [`backend/.eslintrc.json`](https://github.com/MariaNazarenkoStud/reflect-site/blob/main/backend/.eslintrc.json)

**Запуск:**
```bash
cd backend
npm install
npm run test:security
```

#### Виявлені вразливості

| ID | Файл | Правило | Опис | Ризик |
|----|------|---------|------|-------|
| SEC-01 | `routes/auth.js` | `detect-possible-timing-attacks` | Порівняння паролів через `===` вразливе до timing attack — зловмисник може виміряти час відповіді і підібрати пароль | Середній |

#### Виправлення SEC-01

**До:**
```javascript
if (password === ADMIN_PASSWORD) {
```

**Після:**
```javascript
const inputBuf  = Buffer.from(password || '');
const secretBuf = Buffer.from(ADMIN_PASSWORD);
const match = inputBuf.length === secretBuf.length &&
              crypto.timingSafeEqual(inputBuf, secretBuf);
if (match) {
```

`crypto.timingSafeEqual()` — вбудована функція Node.js, що виконує порівняння за константний час незалежно від вмісту буферів.

**Посилання на коміт:** `fix timing attack in password check`

#### Загальний висновок

Інші файли (`orders.js`, `colors.js`, `db.js`) не містять критичних знахідок: SQL-запити використовують параметризований синтаксис (`$1, $2, ...`), що унеможливлює SQL-ін'єкції. Зовнішній ввід не використовується для формування шляхів до файлів або RegExp.

---

### 3.2 Навантажувальне тестування

**Інструмент:** [Artillery](https://artillery.io)  
**Конфігурація:** [`backend/tests/load/scenario.yml`](https://github.com/MariaNazarenkoStud/reflect-site/blob/main/backend/tests/load/scenario.yml)

#### Сценарій навантаження

| Фаза | Тривалість | Інтенсивність | Призначення |
|------|------------|---------------|-------------|
| Warm up | 30 с | 3 req/s | Прогрів з'єднань |
| Load | 60 с | 15 req/s | Стандартне навантаження |
| Peak | 15 с | 30 req/s | Пікове навантаження |

**Сценарії запитів:**
- 70% — перегляд контенту бренду (`GET /api/brand`, `/api/colors`, `/api/mockups`, `/api/slogans`)
- 20% — подача заявки (`POST /api/orders`)
- 10% — статистика (`GET /api/orders/stats`)

**Запуск:**
```bash
cd backend
npm install
npm run test:load
```

#### Очікувані результати (локально, Docker)

| Метрика | Очікуване значення |
|---------|-------------------|
| Медіанна затримка (p50) | < 50 мс |
| 95-й перцентиль (p95) | < 200 мс |
| Рівень помилок | < 1% |
| Пропускна здатність | > 400 req/s (пік) |

#### Висновок

Система розрахована на малий/середній трафік бренд-презентації. Вузьке місце — PostgreSQL при одночасних записах заявок. При реальному навантаженні понад 50 req/s рекомендується використовувати connection pooling (вже реалізовано через `pg.Pool`) та додати індекс на `orders.status` для прискорення фільтрації.

---

### 3.3 Аналіз доступності (Accessibility)

**Інструмент:** `@axe-core/cli` (WCAG 2.1 AA)  
**Запуск:**
```bash
# Потрібен запущений сервер
cd backend
npm run test:a11y
```

#### Виявлені порушення (до виправлень)

| ID | Правило | Елемент | Опис | Вплив | WCAG |
|----|---------|---------|------|-------|------|
| A11Y-01 | `label` | `<input name="name">` | Поле форми не має пов'язаного `<label>` (відсутній атрибут `for`/`id`) | Серйозний | 1.3.1 |
| A11Y-02 | `label` | `<input name="email">` | Те саме — email поле | Серйозний | 1.3.1 |
| A11Y-03 | `label` | `<select name="product_type">` | Поле вибору типу виробу не пов'язане з label | Серйозний | 1.3.1 |
| A11Y-04 | `label` | `<textarea name="material_description">` | Текстова область не пов'язана з label | Серйозний | 1.3.1 |
| A11Y-05 | `landmark-one-main` | `<body>` | Відсутній елемент `<main>` — навігація з клавіатури ускладнена | Помірний | 1.3.6 |
| A11Y-06 | `region` | `<nav>` | Навігаційний блок без `aria-label` | Помірний | 1.3.6 |

#### Виправлення

**A11Y-01 — A11Y-04: пов'язати label з input**

Додано атрибути `id` до полів форми та `for` до відповідних `<label>`:

```html
<!-- До -->
<label>Ім'я *</label>
<input type="text" name="name" required />

<!-- Після -->
<label for="order-name">Ім'я *</label>
<input id="order-name" type="text" name="name" required />
```

Виправлено для всіх 7 полів форми: name, email, phone, product_type, material_description, quantity, notes.

**A11Y-05: додати `<main>`**

Основний контент сторінки обгорнуто в `<main>...</main>`.

**A11Y-06: aria-label для nav**

```html
<!-- До -->
<nav>

<!-- Після -->
<nav aria-label="Головна навігація">
```

**Посилання на коміт:** `fix form labels for screen readers`

#### Результат після виправлень

Повторний запуск `axe` на виправленій версії не виявляє порушень категорій "serious" та "critical" для форми та навігаційних landmark-ів.
