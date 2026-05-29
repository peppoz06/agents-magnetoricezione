let particles = [];
let north;
let numParticles = 3500;

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
  // scia visiva
  background(2, 4, 10, 25);

  // distanza mouse dal Nord magnetico
  let mouse = createVector(mouseX, mouseY);
  let distance = dist(mouse.x, mouse.y, north.x, north.y);

  // più il mouse è vicino al Nord, più il campo è ordinato
  let order = map(distance, 0, width * 0.8, 1, 0);
  order = constrain(order, 0, 1);

  drawMagneticNorth(order);
  drawCursorGuide(order);

  for (let p of particles) {
    p.update(order);
    p.show(order);
  }

  drawText(order);
}

class Particle {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = p5.Vector.random2D();
    this.acc = createVector(0, 0);
    this.maxSpeed = random(1.2, 3.2);
    this.size = random(0.7, 2);
  }

  update(order) {
    let magneticForce = p5.Vector.sub(north, this.pos);
    let distance = magneticForce.mag();

    magneticForce.normalize();

    // forza ordinata verso il Nord
    magneticForce.mult(0.08 * order);

    // caos generato con Perlin noise
    let noiseScale = 0.002;
    let angle = noise(this.pos.x * noiseScale, this.pos.y * noiseScale, frameCount * 0.003);
    angle = map(angle, 0, 1, 0, TWO_PI * 4);

    let chaoticForce = p5.Vector.fromAngle(angle);
    chaoticForce.mult(0.12 * (1 - order));

    // campo misto: caos + orientamento magnetico
    this.acc.add(magneticForce);
    this.acc.add(chaoticForce);

    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);

    // riciclo particelle ai bordi
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.y < 0) this.pos.y = height;
    if (this.pos.y > height) this.pos.y = 0;
  }

  show(order) {
    let c1 = color(120, 60, 255, 90);
    let c2 = color(0, 255, 230, 150);
    let c = lerpColor(c1, c2, order);

    stroke(c);
    strokeWeight(this.size);

    point(this.pos.x, this.pos.y);
  }
}

function drawMagneticNorth(order) {
  push();
  translate(north.x, north.y);

  noStroke();

  let glow = map(order, 0, 1, 40, 180);

  fill(0, 255, 230, glow);
  circle(0, 0, 40 + sin(frameCount * 0.05) * 8);

  fill(255);
  circle(0, 0, 6);

  stroke(0, 255, 230, 120);
  strokeWeight(1);

  for (let i = 0; i < 40; i++) {
    let a = map(i, 0, 40, 0, TWO_PI);
    let len = map(order, 0, 1, 40, 150);
    line(0, 0, cos(a) * len, sin(a) * len);
  }

  pop();
}

function drawCursorGuide(order) {
  stroke(255, 255, 255, 100);
  strokeWeight(1);
  drawingContext.setLineDash([8, 8]);
  line(mouseX, mouseY, north.x, north.y);
  drawingContext.setLineDash([]);

  noFill();
  stroke(255);
  circle(mouseX, mouseY, 22);

  noStroke();
  fill(255, 180);
  textSize(12);
  text("TUO CURSORE", mouseX + 18, mouseY - 18);
}

function drawText(order) {
  noStroke();
  fill(255);
  textSize(26);
  text("MAGNETORICEZIONE", 30, 45);

  textSize(15);
  fill(180);
  text("Il mouse rappresenta un organismo che percepisce il Nord magnetico invisibile.", 30, 75);

  fill(0, 255, 230);
  text("vicino al Nord → ordine", 30, 110);

  fill(170, 80, 255);
  text("lontano dal Nord → caos", 30, 135);

  fill(255);
  textSize(14);
  text("NORD MAGNETICO", north.x + 22, north.y + 5);

  let percent = int(order * 100);
  fill(255);
  textSize(16);
  text("allineamento campo: " + percent + "%", 30, height - 35);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  north = createVector(width / 2, height * 0.18);
}