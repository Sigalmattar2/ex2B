/**
 * Authors:
 * Sigal Matar
 * 323941526
 * Mayar Asmir
 * 324911296
 * Date: 15/06/2025
 * Link: https://github.com/Sigalmattar2/ex2B.git
 *
 * Express server displaying movie details from a SQLite3 database.
 */

// Required packages
const express = require("express"); // Node.js web application framework
const path = require("path"); // File path utilities
const app = express();
const sqlite3 = require("sqlite3").verbose(); // SQLite3 database connection
const fs = require("fs"); // File system utilities

// Create SQLite3 database connection
const db = new sqlite3.Database(
  path.join(path.join(__dirname, "db"), "rtfilms.db")
);

// Static file serving for images, CSS, and client-side JavaScript
app.use(express.static(path.join(__dirname, "static")));
app.use(express.static(path.join(__dirname, "public")));

// General function to run SQLite3 queries
function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// API endpoint to get movie data as JSON
app.get("/api/movie", async function (req, res) {
  try {
    let movieCode = req.query.title;
    if (!movieCode) {
      return res
        .status(400)
        .json({ error: "Missing movie code (title parameter)" });
    }
    const moviesPromise = runQuery("SELECT * FROM films WHERE FilmCode = ?", [
      movieCode,
    ]);
    const detailsPromise = runQuery(
      "SELECT * FROM FilmDetails WHERE FilmCode = ?",
      [movieCode]
    );
    const reviewsPromise = runQuery(
      "SELECT * FROM Reviews WHERE FilmCode = ?",
      [movieCode]
    );
    const [movies, details, reviews] = await Promise.all([
      moviesPromise,
      detailsPromise,
      reviewsPromise,
    ]);
    const currentMovie = movies[0];
    if (!currentMovie) {
      return res.status(404).json({ error: "Movie not found" });
    }
    // Check if a poster folder exists for the movie and set the relevant poster
    const posterFolder = path.join(__dirname, "static", currentMovie.FilmCode);
    if (fs.existsSync(posterFolder)) {
      const files = fs.readdirSync(posterFolder);
      const posterFile = files.find((file) => file.match(/\.(png|jpg)$/i));
      if (posterFile) {
        currentMovie.Poster = `${currentMovie.FilmCode}/${posterFile}`;
      }
    } else {
      currentMovie.Poster = "poster.jpg";
    }
    res.json({
      movie: currentMovie,
      details: details,
      reviews: reviews,
    });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// Serve the main HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "movie.html"));
});

// Start the server on port 3000
app.listen(3000, () => {
  console.log(`Server is running on http://localhost:3000`);
});
