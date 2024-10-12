import React, { useState, useEffect, useRef } from "react";
import "./App.css"; // Import file CSS untuk styling

const columnsDasar = [
  { id: "x1", label: "X1" },
  { id: "dx", label: "dX" },
  { id: "x2", label: "X2" },
  { id: "y1", label: "Y(b)" },
  { id: "m", label: "M" },
  { id: "y2", label: "Y" },
];

const columnsDDA = [
  { id: "k", label: "K" },
  { id: "x", label: "X" },
  { id: "y", label: "Y" },
  { id: "xy", label: "Round(X), Round(Y)" },
];

const columnsBresenham = [
  { id: "k", label: "K" },
  { id: "x", label: "X" },
  { id: "y", label: "Y" },
];

const App = () => {
  const [x1Str, setX1] = useState("");
  const [y1Str, setY1] = useState("");
  const [x2Str, setX2] = useState("");
  const [y2Str, setY2] = useState("");

  const [columns, setColumns] = useState(columnsDasar);
  const [rows, setRows] = useState([]);

  const canvasRef = useRef(null);
  const [alignment, setAlignment] = useState("dasar");

  const handleAlignment = (newAlignment) => {
    if (newAlignment !== null) {
      setAlignment(newAlignment);
    }
  };

  const handleGenerate = () => {
    const x1 = parseFloat(x1Str);
    const y1 = parseFloat(y1Str);
    const x2 = parseFloat(x2Str);
    const y2 = parseFloat(y2Str);

    // Input validation
    if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
      setRows([]);
      clearCanvas();
      return;
    }

    setRows([]); // Clear previous results

    if (alignment === "dasar") {
      setColumns(columnsDasar);
      const results = generateDasar(x1, y1, x2, y2);
      setRows(results);
    } else if (alignment === "dda") {
      setColumns(columnsDDA);
      const results = generateDDA(x1, y1, x2, y2);
      setRows(results);
    } else if (alignment === "bresenham") {
      setColumns(columnsBresenham);
      const results = generateBresenham(x1, y1, x2, y2);
      setRows(results);
    }
  };

  const generateDasar = (x1, y1, x2, y2) => {
    if (x1 === x2) {
      setRows([]);
      clearCanvas();
      return [];
    }

    const m = (y2 - y1) / (x2 - x1);
    const newRows = [{ x1, dx: "", x2: x1, y1, m: "", y2: y1 }];

    if (x1 < x2) {
      for (let i = x1, j = y1; i <= x2; i++, j += m) { // Perhatikan batas i <= x2
        newRows.push({ x1: i, dx: 1, x2: i + 1, y1: j, m, y2: j + m });
      }
    } else {
      for (let i = x1, j = y1; i >= x2; i--, j -= m) { // Perhatikan batas i >= x2
        newRows.push({ x1: i, dx: 1, x2: i - 1, y1: j, m, y2: j - m });
      }
    }

    return newRows;
  };

  const generateDDA = (x1, y1, x2, y2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;

    const step = Math.max(Math.abs(dx), Math.abs(dy));

    if (step === 0) {
      setRows([]);
      clearCanvas();
      return [];
    }

    const xInc = dx / step;
    const yInc = dy / step;
    const newRows = [];

    for (let k = 0, x = x1, y = y1; k <= step; k++, x += xInc, y += yInc) {
      newRows.push({
        k,
        x,
        y,
        xy: `(${Math.round(x)}, ${Math.round(y)})`,
      });
    }

    return newRows;
  };

  const generateBresenham = (x1, y1, x2, y2) => {
    const points = [];
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = (x1 < x2) ? 1 : -1;
    const sy = (y1 < y2) ? 1 : -1;
    let err = dx - dy;

    while (true) {
      points.push({ k: points.length, x: x1, y: y1 });
      if (x1 === x2 && y1 === y2) break;
      const err2 = err * 2;
      if (err2 > -dy) {
        err -= dy;
        x1 += sx;
      }
      if (err2 < dx) {
        err += dx;
        y1 += sy;
      }
    }

    return points;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleClear = () => {
    setX1("");
    setY1("");
    setX2("");
    setY2("");
    setRows([]);
    clearCanvas();
  };

  useEffect(() => {
    const drawLines = (rows) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (rows.length === 0) return;

      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;

      rows.forEach((row) => {
        const x = Math.round(row.x1 || row.x); 
        const y = Math.round(row.y1 || row.y); 
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      });

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const scaleX = canvasWidth / (maxX - minX);
      const scaleY = canvasHeight / (maxY - minY);
      const scale = Math.min(scaleX, scaleY) * 0.9; // Memperjelas grafik

      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const canvasCenterX = canvasWidth / 2;
      const canvasCenterY = canvasHeight / 2;

      ctx.save();
      ctx.translate(canvasCenterX, canvasCenterY);
      ctx.scale(scale, -scale);
      ctx.translate(-centerX, -centerY);

      ctx.strokeStyle = "#ddd";
      ctx.lineWidth = 1 / scale;

      for (let x = Math.floor(minX); x <= Math.ceil(maxX); x++) {
        ctx.beginPath();
        ctx.moveTo(x, minY);
        ctx.lineTo(x, maxY);
        ctx.stroke();
      }

      for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
        ctx.beginPath();
        ctx.moveTo(minX, y);
        ctx.lineTo(maxX, y);
        ctx.stroke();
      }

      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2 / scale;
      ctx.beginPath();
      ctx.moveTo(minX, 0);
      ctx.lineTo(maxX, 0);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, minY);
      ctx.lineTo(0, maxY);
      ctx.stroke();

      ctx.strokeStyle = "blue";
      ctx.lineWidth = 1 / scale;

      let prevX, prevY;
      rows.forEach((row, index) => {
        const x = Math.round(row.x1 || row.x); 
        const y = Math.round(row.y1 || row.y); 

        if (index > 0) {
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(x, y);
          ctx.stroke();
        }

        prevX = x;
        prevY = y;

        ctx.beginPath();
        ctx.arc(x, y, 4 / scale, 0, Math.PI * 2);
        ctx.fillStyle = "red";
        ctx.fill();
      });

      ctx.restore();
    };

    drawLines(rows);
  }, [rows]);

  return (
    <div className="App">
      <h1>Line Algorithm Generator</h1>
      <div className="input-container">
        <input
          type="number" 
          value={x1Str}
          onChange={(e) => setX1(e.target.value)}
          placeholder="X1"
        />
        <input
          type="number" 
          value={y1Str}
          onChange={(e) => setY1(e.target.value)}
          placeholder="Y1"
        />
        <input
          type="number" 
          value={x2Str}
          onChange={(e) => setX2(e.target.value)}
          placeholder="X2"
        />
        <input
          type="number" 
          value={y2Str}
          onChange={(e) => setY2(e.target.value)}
          placeholder="Y2"
        />
      </div>
      <div className="button-container">
        <button onClick={handleGenerate}>Generate</button>
        <button onClick={handleClear}>Clear</button>
      </div>
      <div className="radio-container">
        <label>
          <input
            type="radio"
            value="dasar"
            checked={alignment === "dasar"}
            onChange={() => handleAlignment("dasar")}
          />
          Dasar
        </label>
        <label>
          <input
            type="radio"
            value="dda"
            checked={alignment === "dda"}
            onChange={() => handleAlignment("dda")}
          />
          DDA
        </label>
        <label>
          <input
            type="radio"
            value="bresenham"
            checked={alignment === "bresenham"}
            onChange={() => handleAlignment("bresenham")}
          />
          Bresenham
        </label>
      </div>
      <canvas ref={canvasRef} width={600} height={400} className="canvas" />
      <table className="results-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.id}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column.id}>{row[column.id]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
