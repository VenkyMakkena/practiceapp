const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

let db = null
const dbPath = path.join(__dirname, 'cricketTeam.db')

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at port 3000')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const getPlayesQuery = `SELECT * FROM cricket_team ORDER BY player_id`
  const playersArray = await db.all(getPlayesQuery)
  response.send(
    playersArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const addPlayerQuery = `INSERT INTO cricket_team (player_name,jersey_number,role)VALUES('${playerName}','${jerseyNumber}','${role}')`
  const dbResponse = await db.run(addPlayerQuery)
  response.send('Player Added to Team')
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayeQuery = `SELECT * FROM cricket_team WHERE player_id = ${playerId}`
  const player = await db.get(getPlayeQuery)
  response.send(convertDbObjectToResponseObject(player))
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName, jerseyNumber, role} = request.body
  const updatePlayerQuery = `UPDATE cricket_team SET player_name= '${playerName}',jersey_number = ,'${jerseyNumber}',role ='${role}' WHERE player_id = ${playerId}; `
  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deleteplayerQuery = `
    DELETE FROM
        cricket_team
    WHERE
        player_Id = ${playerId};`
  await db.run(deleteplayerQuery)
  response.send('player Removed')
})

module.exports = app
