const express = require("express");

const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

const app = express();

app.use(express.json());

const path = require("path");

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//Returns a list of all players in the team

app.get("/players/", async (request, response) => {
  const getPlayersDetails = `
            SELECT 
                *
            FROM
               cricket_team;`;
  const listOfPlayers = await db.all(getPlayersDetails);

  response.send(
    listOfPlayers.map((eachPlayer) => convertObjectToResponseObject(eachPlayer))
  );
});

//Creates a new player in the team (database).

app.post("/players/", async (request, response) => {
  const teamBody = request.body;
  const { playerName, jerseyNumber, role } = teamBody;
  const createPlayerDetails = `
        INSERT INTO
            cricket_team(player_name,jersey_number,role)
        VALUES
            ('${playerName}', ${jerseyNumber}, '${role}');`;

  const dbResponse = await db.run(createPlayerDetails);
  const playerId = dbResponse.lastID;
  response.send(`Player Added to Team`);
});

//Returns a player based on a player ID

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `
        SELECT * 
        FROM cricket_team
        WHERE 
        player_id = ${playerId}`;
  const playerDetails = await db.get(getPlayer);
  response.send(convertObjectToResponseObject(playerDetails));
});

//Updates the details of a player in the team (database) based on the player ID

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const teamBody = request.body;
  const { playerName, jerseyNumber, role } = teamBody;
  const updatePlayerDetails = `
        UPDATE 
            cricket_team
        SET
            player_name = '${playerName}',
            jersey_number = ${jerseyNumber},
            role = '${role}'
        WHERE
            player_id = ${playerId};`;
  await db.run(updatePlayerDetails);
  response.send("Player Details Updated");
});

//Deletes a player from the team (database) based on the player ID

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayer = `
        DELETE FROM
            cricket_team
        WHERE
            player_id = ${playerId};`;
  await db.run(deletePlayer);
  response.send("Player Removed");
});
module.exports = app;
