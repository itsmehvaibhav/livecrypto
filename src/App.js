import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { Button, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';

const socket = io("https://socket-server-url");

function App() {
  const [coins, setCoins] = useState([]);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to socket server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    socket.on("coinsData", (data) => {
      console.log(data);
      setCoins(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchCoins = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://api.coincap.io/v2/assets?limit=${limit}`);
        const data = await res.json();
        console.log(data.data);
        setCoins(data.data);
        socket.emit("coinsData", data.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();
  }, [limit]);

  const handleRefresh = () => {
    setLimit(20);
    window.scrollTo(0, 0);
  };

  return (
    <section className="coins">
      <h4 style={{ textAlign: "center", marginBottom: "1rem" }}>
        This App uses the <a href="https://coincap.io">CoinCap API</a>
      </h4>
      <article>
        <p>Showing {coins.length} coins</p>
      </article>
      {loading ? (
        <p style={{ textAlign: "center" }}>Loading...</p>
      ) : error ? (
        <p style={{ textAlign: "center", color: "red" }}>Error: {error}</p>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Price (USD)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {coins.map(({ id, name, rank, priceUsd }) => (
              <TableRow key={id}>
                <TableCell>{rank}</TableCell>
                <TableCell>{name}</TableCell>
                <TableCell>${parseFloat(priceUsd).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div className="buttons">
        <Button variant="contained" onClick={() => setLimit(limit + 20)}>Next</Button>
        <Button variant="contained" onClick={handleRefresh}>Refresh</Button>
      </div>
    </section>
  );
}

export default App
