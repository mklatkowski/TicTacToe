import React, { useEffect, useState } from 'react';
import './App.css';
import { Client } from '@stomp/stompjs'
import axios from 'axios';

// const url = 'http://localhost:8080';
const url = process.env.REACT_APP_API_URL;
console.log(`url = ${url}`)

function App() {

  const [gameId, setGameId] = useState('');
  const [playerType, setPlayerType] = useState('');
  const [turns, setTurns] = useState([["#", "#", "#"], ["#", "#", "#"], ["#", "#", "#"]]);
  const [gameOn, setGameOn] = useState(false);
  const [nickname, setNickname] = useState('');
  const [player1, setPlayer1] = useState('');
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2, setPlayer2] = useState('');
  const [player2Score, setPlayer2Score] = useState(0);
  const [currentTurn, setCurrentTurn] = useState('');

  useEffect(() => {
    if (gameId) {
      connectToSocket(gameId);
    }
  }, [gameId]);

  const connectToSocket = (gameId) => {
    const client = new Client();
    client.configure({
      brokerURL: 'ws://' + url + 'gameplay',
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('Connected');

        client.subscribe(`/topic/gameprogress/${gameId}`, message => {
          const data = JSON.parse(message.body);
          console.log(data);
          setPlayer1(data.player1.nickname)
          setPlayer1Score(data.player1.score)
          setPlayer2(data.player2.nickname)
          setPlayer2Score(data.player2.score)
          displayResponse(data);
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
      debug: (str) => {
        console.log(new Date(), str);
      }
    });

    client.activate();
  };

  const createGame = async () => {
    if (!nickname) {
      alert("Please enter nickname");
      return;
    }
    try {
      const response = await axios.post("http://" + url + "/game/start", { nickname: nickname });
      setGameId(response.data.gameId);
      setPlayerType('X');
      setCurrentTurn('X');
      start();
      alert("Your created a game. Game id is: " + response.data.gameId);
      setGameOn(true);
    } catch (error) {
      console.log(error);
    }
  };

  const start = async () => {
    setTurns([["#", "#", "#"], ["#", "#", "#"], ["#", "#", "#"]]);
  };

  const connectToRandom = async () => {
    if (!nickname) {
      alert("Please enter nickname");
      return;
    }
    try {
      const response = await axios.post("http://" + url + "/game/connect/random", { nickname });
      setGameId(response.data.gameId);
      setPlayerType('O');
      start();
      connectToSocket(response.data.gameId);
      alert("Congrats you're playing with: " + response.data.player1.nickname);
      setGameOn(true);
      displayResponse(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const makeAMove = async (xCoordinate, yCoordinate) => {
    console.log("playerType" + playerType)
    console.log("currTurn" + currentTurn)

    if (!gameOn || currentTurn !== playerType) return;

    try {
      const response = await axios.post("http://" + url + "/game/gameplay", {
        type: playerType,
        coordinateX: xCoordinate,
        coordinateY: yCoordinate,
        gameId,
      });
      displayResponse(response.data, playerType);
    } catch (error) {
      console.log(error);
    }
  };

  const displayResponse = (data) => {
    const newTurns = turns.map((row, i) =>
      row.map((cell, j) => {
        if (data.board[i][j] === 1) return 'X';
        if (data.board[i][j] === 2) return 'O';
        return cell;
      })
    );
    setTurns(newTurns);
    if (data.winner) {
      alert("Winner is " + data.winner);
      setGameOn(false);
    } else {
      setCurrentTurn(data.currentTurn);
      setGameOn(true);
    }
  };
  const handleNicknameChange = (event) => {
    setNickname(event.target.value);
  };

  const handleGameIdChange = (event) => {
    setGameId(event.target.value);
  };

  return (
    <div style={{ background: '#f5f5dc', color: '#000', fontFamily: 'Arial, sans-serif', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div id="box" style={{ background: '#ffffff', padding: '20px', borderRadius: '10px', maxWidth: '350px', margin: 'auto', overflow: 'auto', textAlign: 'center' }}>
        <h1 style={{ color: '#000' }}>Tic Tac Toe</h1>
        <input
          type="text"
          id="nickname"
          placeholder="Enter your nickname"
          value={nickname}
          onChange={handleNicknameChange}
          style={{ width: '80%', marginBottom: '20px', padding: '10px' }}
        />
        <button onClick={createGame}>Create Game</button>
        {/* <input
          type="text"
          id="gameId"
          placeholder="Enter game ID"
          value={gameId}
          onChange={handleGameIdChange}
          style={{ width: '80%', marginBottom: '20px', padding: '10px' }}
        /> */}
        <br></br>
        <br></br>
        <button onClick={connectToRandom}>Connect to Random Game</button>

        <ul id="gameBoard" style={{ listStyle: 'none', padding: 0 }}>
          {turns.map((row, i) =>
            row.map((cell, j) => (
              <li
                key={`${i}-${j}`}
                onClick={() => makeAMove(i, j)}
                style={{
                  float: 'left',
                  margin: '10px',
                  height: '70px',
                  width: '70px',
                  fontSize: '50px',
                  background: '#ffffff',
                  color: '#ccc',
                  textAlign: 'center',
                  borderRadius: '5px'
                }}
                className={cell === 'X' ? 'x' : cell === 'O' ? 'o' : ''}
              >
                {cell !== '#' ? cell : ''}
              </li>
            ))
          )}
        </ul>
        <div className="clearfix" style={{ clear: 'both' }}></div>
      </div>
      <footer style={{ textAlign: 'center', paddingTop: '20px' }}>
        <div>
          {player1 != null && player2 != null && (
            <div>
              {/* <div>{player1} score: {player1Score}</div>
              <div>{player2} score: {player2Score}</div> */}
            </div>
          )}
        </div>
      </footer>
    </div>
  )
}

export default App;
