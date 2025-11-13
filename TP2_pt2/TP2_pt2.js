// =======================
// TP FINAL PARTE 2 - Persefone y las flores
// =======================

// -----------------------
// VARIABLES GENERALES
// -----------------------
let gridSize = 32;
let cols, rows;
let mapData = [];
let persefone;
let flowers = [];
let enemies = [];
let numFlowers = 10;
let numEnemies = 3;
let gameState = "playing";
let score = 0;
let botonReiniciar;

// SISTEMA DE TIEMPO
let tiempoMax = 30;
let tiempoInicio;

// -----------------------
function setup() {
  createCanvas(640, 480);
  cols = width / gridSize;
  rows = height / gridSize;
  iniciarJuego();
}

// -----------------------
function iniciarJuego() {
  generateMap();
  persefone = new Player(1, 1);
  flowers = [];
  enemies = [];
  score = 0;
  gameState = "playing";
  tiempoInicio = millis();

  // FLORES
  for (let i = 0; i < numFlowers; i++) {
    let x, y;
    do {
      x = floor(random(cols));
      y = floor(random(rows));
    } while (mapData[y][x] === 1 || (x === 1 && y === 1));
    flowers.push(new Flower(x, y));
  }

  // ENEMIGOS
  for (let i = 0; i < numEnemies; i++) {
    let x, y;
    do {
      x = floor(random(cols));
      y = floor(random(rows));
    } while (mapData[y][x] === 1 || (x === 1 && y === 1));
    enemies.push(new Enemy(x, y));
  }

  if (botonReiniciar) {
    botonReiniciar.remove();
    botonReiniciar = null;
  }
}

// -----------------------
function draw() {
  background(30);
  drawMap();

  // TIEMPO
  let tiempoTranscurrido = (millis() - tiempoInicio) / 1000;
  let tiempoRestante = max(0, tiempoMax - tiempoTranscurrido);

  fill(255);
  textSize(18);
  text(`Tiempo: ${tiempoRestante.toFixed(1)}`, width - 150, 20);

  // SI SE ACABA EL TIEMPO
  if (tiempoRestante <= 0 && gameState === "playing") {
    gameState = "lose";
    mostrarBotonReiniciar();
  }

  if (gameState === "playing") {
    // FLORES
    for (let f of flowers) f.show();

    // ENEMIGOS
    for (let e of enemies) {
      e.update();
      e.show();

      // COLISIÓN ENEMIGO - PERSEFONE
      if (dist(e.x, e.y, persefone.x, persefone.y) < 1) {

        // REINICIAR SOLO PROGRESO, NO EL JUEGO
        persefone.x = 1;
        persefone.y = 1;

        // PERDER FLORES
        score = 0;

        // REGENERAR FLORES
        flowers = [];
        for (let i = 0; i < numFlowers; i++) {
          let x, y;
          do {
            x = floor(random(cols));
            y = floor(random(rows));
          } while (mapData[y][x] === 1 || (x === 1 && y === 1));
          flowers.push(new Flower(x, y));
        }
      }
    }

    // JUGADOR
    persefone.show();

    // COLECCIÓN DE FLORES
    for (let i = flowers.length - 1; i >= 0; i--) {
      if (dist(persefone.x, persefone.y, flowers[i].x, flowers[i].y) < 1) {
        flowers.splice(i, 1);
        score++;
      }
    }

    fill(255);
    textSize(18);
    text(`Flores: ${score}/${numFlowers}`, 10, 20);

    // GANAR
    if (flowers.length === 0) {
      gameState = "win";
      mostrarBotonReiniciar();
    }

  } else if (gameState === "win") {
    fill(0, 200, 0);
    textSize(28);
    textAlign(CENTER);
    text("¡Ganaste! Persefone volvió a la superficie 🌸", width / 2, height / 2 - 30);

  } else if (gameState === "lose") {
    fill(200, 0, 0);
    textSize(28);
    textAlign(CENTER);
    text("El tiempo se agotó...", width / 2, height / 2 - 30);
  }
}

// -----------------------
function mostrarBotonReiniciar() {
  if (!botonReiniciar) {
    botonReiniciar = createButton("Reiniciar");
    botonReiniciar.position(width / 2 - 50, height / 2 + 20);
    botonReiniciar.mousePressed(() => {
      iniciarJuego();
      loop();
    });
    botonReiniciar.style("background-color", "#ffb3e6");
    botonReiniciar.style("border", "none");
    botonReiniciar.style("padding", "10px 20px");
    botonReiniciar.style("font-size", "16px");
    botonReiniciar.style("border-radius", "8px");
    botonReiniciar.style("cursor", "pointer");
  }
}

// -----------------------
function keyPressed() {
  if (gameState === "playing") {
    persefone.move(keyCode);
  }
}

// -----------------------
// CLASES
// -----------------------
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  move(key) {
    let newX = this.x;
    let newY = this.y;

    if (key === UP_ARROW) newY--;
    else if (key === DOWN_ARROW) newY++;
    else if (key === LEFT_ARROW) newX--;
    else if (key === RIGHT_ARROW) newX++;

    if (mapData[newY] && mapData[newY][newX] === 0) {
      this.x = newX;
      this.y = newY;
    }
  }

  show() {
    fill(255, 200, 0);
    ellipse(this.x * gridSize + gridSize / 2, this.y * gridSize + gridSize / 2, gridSize * 0.8);
  }
}

class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.dir = random([0, 1, 2, 3]);
    this.moveTimer = 0;
  }

  update() {
    this.moveTimer++;
    if (this.moveTimer % 10 === 0) {
      this.move();
    }
  }

  move() {
    if (random() < 0.1) {
      this.dir = random([0, 1, 2, 3]);
    }

    let newX = this.x;
    let newY = this.y;

    if (this.dir === 0) newY--;
    else if (this.dir === 1) newX++;
    else if (this.dir === 2) newY++;
    else if (this.dir === 3) newX--;

    if (mapData[newY] && mapData[newY][newX] === 0) {
      this.x = newX;
      this.y = newY;
    } else {
      this.dir = random([0, 1, 2, 3]);
    }
  }

  show() {
    fill(200, 50, 50);
    rect(this.x * gridSize + 4, this.y * gridSize + 4, gridSize - 8, gridSize - 8, 5);
  }
}

class Flower {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  show() {
    fill(255, 150, 255);
    ellipse(this.x * gridSize + gridSize / 2, this.y * gridSize + gridSize / 2, gridSize / 2);
  }
}

// -----------------------
function generateMap() {
  mapData = [];
  for (let y = 0; y < rows; y++) {
    let row = [];
    for (let x = 0; x < cols; x++) {
      if (x === 0 || y === 0 || x === cols - 1 || y === rows - 1) {
        row.push(1);
      } else {
        row.push(random() < 0.2 ? 1 : 0);
      }
    }
    mapData.push(row);
  }
}

function drawMap() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (mapData[y][x] === 1) {
        fill(70);
        rect(x * gridSize, y * gridSize, gridSize, gridSize);
      }
    }
  }
}
