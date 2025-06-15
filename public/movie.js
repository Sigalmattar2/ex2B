/**
 * Authors:
 * Sigal Matar
 * 323941526
 * Mayar Asmir
 * 324911296
 * Date: 15/06/2025
 *
 * Client Side JavaScript for displaying movie details
 */

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Get movie code from URL (?title=...)
    const params = new URLSearchParams(window.location.search);
    const movieCode = params.get("title");
    if (!movieCode) {
      document.body.innerHTML = "<h2>חסר קוד סרט בכתובת (title)</h2>";
      return;
    }
    // Fetch movie data from the server
    const res = await fetch(
      `/api/movie?title=${encodeURIComponent(movieCode)}`
    );
    if (!res.ok) {
      const errData = await res.json();
      document.body.innerHTML = `<h2>${errData.error || "שגיאה בטעינת נתוני הסרט"
        }</h2>`;
      return;
    }
    const data = await res.json();
    renderMovie(data);
  } catch (err) {
    document.body.innerHTML = "<h2>שגיאה בטעינת נתוני הסרט</h2>";
  }
});

function renderMovie(data) {
  // Update page title
  document.title = `${data.movie.Title} - Rancid Tomatoes`;
  // Update h1
  document.querySelector(
    "h1"
  ).textContent = `${data.movie.Title} (${data.movie.Year})`;
  // Update poster image
  document.querySelector(".details-img").src = data.movie.Poster;
  // Update movie details
  const dl = document.querySelector(".details dl");
  dl.innerHTML = "";
  data.details.forEach((detail) => {
    const dt = document.createElement("dt");
    dt.textContent = detail.Attribute;
    const dd = document.createElement("dd");
    if (detail.Attribute === "Starring") {
      detail.Value.split(", ").forEach((actor) => {
        dd.innerHTML += actor + "<br />";
      });
    } else {
      dd.textContent = detail.Value;
    }
    dl.appendChild(dt);
    dl.appendChild(dd);
  });
  // Update score
  document.querySelector(".rating-number").textContent = `${data.movie.Score}%`;
  document.querySelector("#rating-banner img").src =
    data.movie.Score >= 60 ? "freshbig.png" : "rottenbig.png";
  // Update reviews
  const leftCol = document.querySelector(".left-column");
  const rightCol = document.querySelector(".right-column");
  leftCol.innerHTML = "";
  rightCol.innerHTML = "";
  data.reviews.forEach((review, idx) => {
    const reviewDiv = document.createElement("div");
    reviewDiv.className = "review";
    reviewDiv.innerHTML = `
            <p class="review-quote">
                <img src="${data.movie.Score >= 60 ? "fresh.gif" : "rotten.gif"
      }" alt="score" />
                <q>${review.ReviewText}</q>
            </p>
            <p class="critic-info">
                <img src="critic.gif" alt="Critic" />
                ${review.ReviewerName} <br />
                ${review.Affiliation}
            </p>
        `;
    if (idx % 2 === 0) leftCol.appendChild(reviewDiv);
    else rightCol.appendChild(reviewDiv);
  });
  // Update footer
  document.getElementById(
    "review-count"
  ).textContent = `(1-${data.reviews.length}) of ${data.reviews.length}`;

  // change the content of the page to display block after the data is loaded
  document.getElementsByClassName("content")[0].style.display = "block";
}
