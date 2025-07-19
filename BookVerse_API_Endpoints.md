# BookVerse API Endpoints

A summary of all REST API endpoints for each BookVerse microservice, with plain-English descriptions.

---

## User Service

| Method | Endpoint           | Description                                    |
|--------|--------------------|------------------------------------------------|
| POST   | /api/register      | Register a new user account                    |
| POST   | /api/login         | Log in and get a JWT token                     |
| POST   | /api/logout        | Log out (invalidate your session token)        |
| GET    | /api/profile       | Get your user profile info (requires JWT)      |
| GET    | /health            | Check if the service is running                |
| GET    | /api-docs          | See interactive API documentation (Swagger UI) |

---

## Book Service

| Method | Endpoint                  | Description                                    |
|--------|---------------------------|------------------------------------------------|
| POST   | /api/books                | Add a new book (requires JWT)                  |
| PUT    | /api/books/:id            | Update a book’s details (requires JWT)         |
| DELETE | /api/books/:id            | Delete a book (requires JWT)                   |
| GET    | /api/books/:id            | Get details for a specific book                |
| GET    | /api/books/genre/:genre   | Get all books in a specific genre              |
| GET    | /health                   | Check if the service is running                |
| GET    | /api-docs                 | See interactive API documentation (Swagger UI) |

---

## Review Service

| Method | Endpoint                        | Description                                    |
|--------|----------------------------------|------------------------------------------------|
| POST   | /api/reviews                    | Post a review for a book (requires JWT, rate-limited) |
| PUT    | /api/reviews/:id                | Update your review (requires JWT)              |
| DELETE | /api/reviews/:id                | Delete your review (requires JWT)              |
| GET    | /api/reviews/book/:bookId       | Get all reviews for a specific book            |
| GET    | /health                         | Check if the service is running                |
| GET    | /api-docs                       | See interactive API documentation (Swagger UI) |

---

## Recommendation Service

| Method | Endpoint                              | Description                                    |
|--------|---------------------------------------|------------------------------------------------|
| POST   | /api/recommendations/generate         | Generate new recommendations for the user (requires JWT) |
| GET    | /api/recommendations                  | Get your current recommendations (requires JWT) |
| GET    | /health                               | Check if the service is running                |
| GET    | /api-docs                             | See interactive API documentation (Swagger UI) |

---

## Library Service

| Method | Endpoint                  | Description                                    |
|--------|---------------------------|------------------------------------------------|
| POST   | /api/library/add          | Add a book to your library (requires JWT)      |
| POST   | /api/library/remove       | Remove a book from your library (requires JWT) |
| GET    | /api/library              | Get your library (requires JWT)                |
| GET    | /health                   | Check if the service is running                |
| GET    | /api-docs                 | See interactive API documentation (Swagger UI) |

---

## Search Service

| Method | Endpoint                  | Description                                    |
|--------|---------------------------|------------------------------------------------|
| GET    | /api/search               | Search for books by title, author, genre, etc. |
| GET    | /health                   | Check if the service is running                |
| GET    | /api-docs                 | See interactive API documentation (Swagger UI) |

--- 