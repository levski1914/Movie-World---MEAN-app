# MovieWorld

MovieWorld is a full-stack web application that allows users to explore, create, and interact with movies. Users can register, log in, manage their favorite movies, browse trending content, and filter movies by genres.

---

## Features

- **User Authentication**: Secure user registration, login, and session management.
- **Movie Management**: Add, edit, and delete movies from your account.
- **Trending Movies**: View the most popular movies fetched from TMDb API.
- **Favorites**: Add movies to your favorites and manage them.
- **Movie Ratings**: Rate movies and view average ratings from other users.
- **Genre Filtering**: Filter movies by their genres.
- **Responsive Design**: Optimized for both desktop and mobile devices.

---

## Tech Stack

- **Frontend**: Angular
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **External API**: The Movie Database (TMDb) API for movie metadata.

---

## Prerequisites

Ensure you have the following installed on your system:

- **Node.js** (v14+)
- **Angular CLI** (v15+)
- **MongoDB** (local or cloud-based)
- **Git**

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/levski1914/Movie-World---MEAN-app.git
cd movieworld
```

1. Navigate to tha backend directory

```bash
cd server
```

2. Install dependencies

```bash
npm install
```

3. Start the backend server

```bash
npm start
```

Front end setup

1. Navigate to the frontend directory

```bash
cd ../
```

2. Install dependencies

```bash
npm install
```

3. Start the Angular development server

```bash
ng serve
```

## API Endpoints

Below is a detailed list of the API endpoints provided by the backend.

---

### Authentication

| Method | Endpoint         | Description                                                      |
| ------ | ---------------- | ---------------------------------------------------------------- |
| POST   | `/auth/register` | Register a new user.                                             |
| POST   | `/auth/login`    | Log in an existing user.                                         |
| GET    | `/auth/profile`  | Fetch the profile of the logged-in user. Requires a valid token. |

---

### Movies

| Method | Endpoint                  | Description                                                |
| ------ | ------------------------- | ---------------------------------------------------------- |
| GET    | `/movies`                 | Retrieve all movies.                                       |
| GET    | `/movies?source=database` | Fetch only movies stored in the local database.            |
| POST   | `/movies`                 | Add a new movie. Requires authentication.                  |
| PUT    | `/movies/:id`             | Edit an existing movie by its ID. Requires authentication. |
| DELETE | `/movies/:id`             | Delete a movie by its ID. Requires authentication.         |
| GET    | `/movies/genre/:genre`    | Get movies filtered by a specific genre.                   |

---

### Favorites

| Method | Endpoint          | Description                                                               |
| ------ | ----------------- | ------------------------------------------------------------------------- |
| GET    | `/favourites`     | Fetch all favorite movies of the logged-in user. Requires authentication. |
| POST   | `/favourites`     | Add a movie to the user's favorites. Requires authentication.             |
| DELETE | `/favourites/:id` | Remove a movie from the user's favorites. Requires authentication.        |

---

### Ratings

| Method | Endpoint           | Description                                                           |
| ------ | ------------------ | --------------------------------------------------------------------- |
| POST   | `/movies/:id/rate` | Add or update a rating for a specific movie. Requires authentication. |

---

### TMDb Movie Integration

| Method | Endpoint  | Description                                                                                                                                    |
| ------ | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/movies` | Create a new movie by providing a TMDb ID. If the movie does not exist in the database, it will fetch data from TMDb. Requires authentication. |

---
