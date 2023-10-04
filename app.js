const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
app.use(express.json());
const path = require("path");
const dbpath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const getMovieName = (item) => {
  return {
    movieName: item.movie_name,
  };
};

const getMovie = (item) => {
  return {
    movieId: item.movie_id,
    directorId: item.director_id,
    movieName: item.movie_name,
    leadActor: item.lead_actor,
  };
};

// API 1
app.get("/movies/", async (request, response) => {
  const getAPI1Query = `SELECT movie_name FROM movie`;
  const dbAPI1Response = await db.all(getAPI1Query);
  response.send(dbAPI1Response.map((eachObj) => getMovieName(eachObj)));
});

// API 2
app.post("/movies/", async (request, response) => {
  const api2Details = request.body;
  const { directorId, movieName, leadActor } = api2Details;
  const api2PostQuery = `INSERT INTO movie (director_id,movie_name,lead_actor) VALUES (
        ${directorId},'${movieName}','${leadActor}'
    );`;
  await db.run(api2PostQuery);
  response.send("Movie Successfully Added");
});

// API 3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getAPI3Query = `SELECT * FROM movie WHERE movie_id = ${movieId}`;
  const dbAPI3Response = await db.all(getAPI3Query);
  const result = dbAPI3Response.map((eachObj) => getMovie(eachObj));
  response.send(...result);
});

// API 4
app.put("/movies/:movieId/", async (request, response) => {
  const api4Details = request.body;
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = api4Details;
  const api4PutQuery = `UPDATE movie SET
        director_id=${directorId},movie_name='${movieName}',lead_actor='${leadActor}'
     WHERE movie_id = ${movieId};`;
  await db.run(api4PutQuery);
  response.send("Movie Details Updated");
});

// API 5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getAPI5Query = `DELETE FROM movie WHERE movie_id = ${movieId}`;
  const dbAPI5Response = await db.run(getAPI5Query);
  response.send("Movie Removed");
});

const getDirector = (item) => {
  return {
    directorId: item.director_id,
    directorName: item.director_name,
  };
};

// API 6
app.get("/directors/", async (request, response) => {
  const getAPI6Query = `SELECT * FROM director`;
  const dbAPI6Response = await db.all(getAPI6Query);
  response.send(dbAPI6Response.map((eachObj) => getDirector(eachObj)));
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getAPI7Query = `SELECT movie_name FROM movie WHERE director_id = ${directorId};`;
  const dbAPI7Response = await db.all(getAPI7Query);
  response.send(dbAPI7Response.map((eachObj) => getMovieName(eachObj)));
});

module.exports = app;
