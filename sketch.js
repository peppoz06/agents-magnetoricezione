let particles = [];
let north;
let gaze;
let numParticles = 3200;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);

  north = createVector(width / 2, height * 0.18);

  for (let i = 0; i < numParticles; i++) {
    particles.push(new Particle());
  }

  background(2, 4, 10);
}

function draw() {
  background(2, 4, 10, 28);

  gaze = createVector(mouseX, mouseY);

  let birdDir = p5.Vector.sub(gaze, createVector(width / 2, height / 2));
  let magneticDir = p5.Vector.sub(north, createVector(width / 2, height / 2));

  let angle = abs(birdDir.angleBetween(magneticDir));

  // Bussola a inclinazione:
  // l'uccello percepisce l'asse del campo, non una freccia Nord/Sud classica
  let magneticSignal = abs(cos(angle));
  magneticSignal = constrain(magneticSignal, 0, 1);

  drawFieldAxis();
  drawBirdVisionOverlay(magneticSignal, angle);

  for (let p of particles) {
    p.update(magneticSignal);
    p.show(magneticSignal);
  }

  drawCursorBird(magneticSignal);
  drawText(magneticSignal);
}

class Particle {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = p5.Vector.random2D();
    this.acc = createVector(0, 0);
    this.maxSpeed = random(1.1, 2.8);
    this.size = random(0.6, 1.8);
  }

  update(signal) {
    let center = createVector(width / 2, height / 2);

    // direzione dell'asse magnetico terrestre
    let field = p5.Vector.sub(north, center).normalize();

    // movimento lungo l'asse magnetico, non verso un punto
    let orderedForce = field.copy();
    orderedForce.mult(0.07 * signal);

    // rumore biologico/percettivo
    let n = noise(this.pos.x * 0.002, this.pos.y * 0.002, frameCount * 0.004);
    let chaoticForce = p5.Vector.fromAngle(n * TWO_PI * 4);
    chaoticForce.mult(0.12 * (1 - signal));

    this.acc.add(orderedForce);
    this.acc.add(chaoticForce);

    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);

    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.y < 0) this.pos.y = height;
    if (this.pos.y > height) this.pos.y = 0;
  }

  show(signal) {
    let violet = color(120, 60, 255, 80);
    let cyan = color(0, 255, 230, 155);
    let c = lerpColor(violet, cyan, signal);

    stroke(c);
    strokeWeight(this.size);
    point(this.pos.x, this.pos.y);
  }
}

function drawFieldAxis() {
  let center = createVector(width / 2, height / 2);

  stroke(0, 255, 230, 90);
  strokeWeight(1.5);

  drawingContext.setLineDash([10, 10]);
  line(center.x, center.y, north.x, north.y);
  line(center.x, center.y, width - north.x, height - north.y);
  drawingContext.setLineDash([]);

  noStroke();
  fill(0, 255, 230, 180);
  circle(north.x, north.y, 10);

  fill(255, 170);
  textSize(13);
  text("ASSE DEL CAMPO MAGNETICO", north.x + 18, north.y + 4);
}

function drawBirdVisionOverlay(signal, angle) {
  push();

  translate(width / 2, height / 2);

  // trama visiva: più il campo è allineato allo sguardo,
  // più appare una modulazione luminosa nel campo visivo
  let bands = 34;
  let radius = min(width, height) * 0.42;

  noFill();

  for (let i = 0; i < bands; i++) {
    let r = map(i, 0, bands, 30, radius);
    let alpha = map(sin(i * 0.7 + frameCount * 0.03), -1, 1, 15, 90);
    alpha *= signal;

    stroke(0, 255, 230, alpha);
    strokeWeight(1);

    ellipse(0, 0, r * 1.6, r * 0.75);
  }

  pop();
}

function drawCursorBird(signal) {
  let center = createVector(width / 2, height / 2);

  stroke(255, 180);
  strokeWeight(1);
  line(center.x, center.y, mouseX, mouseY);

  noFill();
  stroke(255);
  circle(mouseX, mouseY, 24);

  noStroke();
  fill(255);
  textSize(12);
  text("DIREZIONE DELLO SGUARDO", mouseX + 18, mouseY - 15);
}

function drawText(signal) {
  noStroke();

  fill(255);
  textSize(26);
  text("MAGNETORICEZIONE AVIARIA", 30, 45);

  fill(185);
  textSize(15);
  text("Il mouse controlla la direzione dello sguardo dell'uccello.", 30, 76);
  text("La visualizzazione simula una bussola a inclinazione, non una bussola Nord/Sud umana.", 30, 98);

  fill(0, 255, 230);
  text("sguardo allineato al campo → segnale visivo più forte", 30, 132);

  fill(170, 80, 255);
  text("sguardo perpendicolare al campo → segnale più debole", 30, 154);

  let percent = int(signal * 100);

  fill(255);
  textSize(16);
  text("intensità del segnale magnetico: " + percent + "%", 30, height - 35);

  fill(255, 170);
  textSize(13);
  text("CENTRO DEL CAMPO VISIVO", width / 2 + 16, height / 2 - 12);

  noFill();
  stroke(255, 130);
  circle(width / 2, height / 2, 10);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  north = createVector(width / 2, height * 0.18);
}