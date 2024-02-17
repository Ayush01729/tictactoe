import React, { useState } from "react";
import "./App.css";

const Box = ({ value, onClick, isWinning }) => {
  return (
    <div className={`box ${isWinning ? "winning-box" : ""}`} onClick={onClick}>
      {value}
    </div>
  );
};

const App = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [playerSymbol, setPlayerSymbol] = useState(null);
  const [winner, setWinner] = useState(null);

  const handlePlayerSymbol = (symbol) => {
    setPlayerSymbol(symbol);
  };

  const handleBoxClick = async (index) => {
    if (!playerSymbol || winner) return;
    if (board[index] === null) {
      const newBoard = [...board];
      newBoard[index] = playerSymbol;
      setBoard(newBoard);
      await checkWinner(newBoard);
      if (!winner && newBoard.includes(null)) {
        const botMove = await getBotMove(newBoard);
        newBoard[botMove] = playerSymbol === "X" ? "O" : "X";
        setBoard([...newBoard]);
        await checkWinner(newBoard);
      }
    }
  };

  const getBotMove = async (board) => {
    const response = await fetch(
      "https://hiring-react-assignment.vercel.app/api/bot",
      {
        method: "POST",
        body: JSON.stringify(board),
      }
    );
    const data = await response.json();
    return data;
  };

  const renderBox = (index) => {
    const isWinningBox =
      winner && winner.symbol !== "draw" && winner.winningBoxes.includes(index);
    return (
      <Box
        key={index}
        value={board[index]}
        onClick={() => handleBoxClick(index)}
        isWinning={isWinningBox}
      />
    );
  };

  const checkWinner = async (board) => {
    const winningCombos = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let combo of winningCombos) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        setWinner({ symbol: board[a], winningBoxes: combo });
        return;
      }
    }
    if (!board.includes(null)) setWinner({ symbol: "draw", winningBoxes: [] });
  };

  const renderResult = () => {
    if (winner && winner.symbol === "draw") {
      return <div className="result">It's a draw!</div>;
    } else if (winner) {
      return <div className="result">{winner.symbol} wins!</div>;
    } else {
      return null;
    }
  };

  return (
    <div className="App">
      <h1>Tic-Tac-Toe</h1>
      {!playerSymbol && (
        <div>
          <button className="button" onClick={() => handlePlayerSymbol("X")}>
            Choose X
          </button>
          <button className="button" onClick={() => handlePlayerSymbol("O")}>
            Choose O
          </button>
        </div>
      )}
      {playerSymbol && (
        <div>
          <h2>You are playing as {playerSymbol}</h2>
          <div className="board">
            {Array.from({ length: 9 }, (_, i) => renderBox(i))}
          </div>
          {renderResult()}
        </div>
      )}
    </div>
  );
};

export default App;
