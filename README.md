# Re:flect — Інформаційна система інтерактивної презентації айдентики бренду

Повноцінний веб-застосунок для управління айдентикою бренду Re:flect та прийому замовлень на виготовлення виробів з перероблених матеріалів.

## Що це таке

Система складається з двох частин:

- **Публічний сайт** (`/`) — інтерактивна презентація бренду: логотип, кольори, шрифти, мокапи, слогани. Форма прийому замовлень — клієнт описує матеріали, обирає тип виробу та надсилає заявку.
- **Адмін-панель** (`/admin.html`) — управління замовленнями (перегляд, зміна статусу, видалення) та редагування контенту бренду.

## Технічний стек

| Частина | Технологія |
|---|---|
| Backend | Node.js + Express |
| База даних | PostgreSQL 16 |
| Frontend | HTML + CSS + Vanilla JS |
| Завантаження файлів | Multer |
| Контейнеризація | Docker + Docker Compose |

## Структура проєкту

```
reflect-site/
├── backend/
│   ├── server.js          — головний файл сервера
│   ├── db.js              — підключення до PostgreSQL
│   ├── migrate.js         — створення таблиць та початкові дані
│   └── routes/
│       ├── brand.js       — маршрути для інфо бренду
│       ├── colors.js      — маршрути для кольорів
│       ├── mockups.js     — маршрути для мокапів
│       ├── slogans.js     — маршрути для слоганів
│       └── orders.js      — маршрути для замовлень
├── frontend/
│   ├── index.html         — публічний сайт
│   ├── admin.html         — адмін-панель
│   └── images/            — зображення мокапів та логотипу
├── Dockerfile             — образ Node.js застосунку
├── docker-compose.yml     — app + PostgreSQL
└── start.sh               — скрипт автоматичного запуску
```

## Запуск через Docker (рекомендований спосіб)

### Вимоги

- [Docker Desktop](https://www.docker.com/products/docker-desktop) — встановити та запустити

### Запуск

```bash
git clone https://github.com/MariaNazarenkoStud/reflect-site.git
cd reflect-site
bash start.sh
```

Скрипт сам збере образи, запустить PostgreSQL та сервер, дочекається готовності і виведе адресу.

- Сайт: [http://localhost:5173](http://localhost:5173)
- Адмін: [http://localhost:5173/admin.html](http://localhost:5173/admin.html)

### Зупинити

```bash
docker compose down
```

### Переглянути логи

```bash
docker compose logs -f app
```

### Підключитись до бази даних

```bash
docker compose exec db psql -U reflect_user reflect_db
```

---

## Запуск без Docker (для розробки)

### Вимоги

- Node.js 20+
- PostgreSQL (локальний або хмарний)

### Налаштування

```bash
cd backend
npm install
```

Створити базу даних та встановити змінну середовища:

```bash
export DATABASE_URL=postgresql://user:password@localhost:5432/reflect_db
node server.js
```

---

## API ендпоінти

| Метод | URL | Опис |
|---|---|---|
| GET | `/api/brand` | Всі дані бренду одним запитом |
| PUT | `/api/brand` | Оновити інфо бренду |
| GET | `/api/colors` | Список кольорів |
| POST | `/api/colors` | Додати колір |
| PUT | `/api/colors/:id` | Оновити колір |
| DELETE | `/api/colors/:id` | Видалити колір |
| GET | `/api/mockups` | Список мокапів |
| POST | `/api/mockups` | Завантажити мокап (multipart) |
| DELETE | `/api/mockups/:id` | Видалити мокап |
| GET | `/api/slogans` | Список слоганів |
| POST | `/api/slogans` | Додати слоган |
| PUT | `/api/slogans/:id` | Оновити слоган |
| DELETE | `/api/slogans/:id` | Видалити слоган |
| GET | `/api/orders` | Всі замовлення (з фільтром `?status=`) |
| GET | `/api/orders/stats` | Статистика замовлень |
| POST | `/api/orders` | Нове замовлення (публічна форма) |
| PUT | `/api/orders/:id` | Змінити статус замовлення |
| DELETE | `/api/orders/:id` | Видалити замовлення |

### Статуси замовлень

| Статус | Опис |
|---|---|
| `pending` | Нова заявка |
| `confirmed` | Підтверджена |
| `in_progress` | В роботі |
| `done` | Виконана |
| `rejected` | Відхилена |

---

## Автор

Назаренко Марія — бакалаврська робота, СумДУ, 2025
