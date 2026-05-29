let birds = [];
let stars = [];
let route = [];
let north;
let destination;
let numBirds = 90;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);

  north = createVector(width / 2, height * 0.12);
  destination = createVector(width * 0.82, height * 0.28);

  for (let i = 0; i < numBirds; i++) {
    birds.push(new Bird(random(width * 0.1, width * 0.35), random(height * 0.55, height * 0.82)));
  }

  for (let i = 0; i < 180; i++) {
    stars.push(createVector(random(width), random(height * 0.55)));
  }

  background(3, 6, 15);
}

function draw() {
  background(3, 6, 15, 45);

  let center = createVector(width / 2, height / 2);
  let gaze = createVector(mouseX, mouseY);

  let birdDir = p5.Vector.sub(gaze, center);
  let magneticDir = p5.Vector.sub(north, center);

  let angle = abs(birdDir.angleBetween(magneticDir));
  let magneticSignal = abs(cos(angle));
  magneticSignal = constrain(magneticSignal, 0, 1);

  drawSky();
  drawLandscape();
  drawMagneticAxis();
  drawRoute(magneticSignal);
  drawDestination();
  drawCompassVision(magneticSignal);

  for (let b of birds) {
    b.update(magneticSignal);
    b.show(magneticSignal);
  }

  drawInteraction(magneticSignal);
  drawText(magneticSignal);
}

class Bird {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(0.4, 1.2), random(-0.2, 0.2));
    this.size = random(6, 12);
    this.offset = random(1000);
  }

  update(signal) {
    let toDestination = p5.Vector.sub(destination, this.pos).normalize();
    let magneticAxis = p5.Vector.sub(north, createVector(width / 2, height / 2)).normalize();

    let noiseAngle = noise(this.offset, frameCount * 0.01) * TWO_PI * 2;
    let wandering = p5.Vector.fromAngle(noiseAngle);

    let navigation = p5.Vector.lerp(wandering, toDestination, signal);
    navigation.add(magneticAxis.mult(0.25 * signal));
    navigation.normalize();

    this.vel.lerp(navigation.mult(2.2), 0.04);
    this.pos.add(this.vel);

    if (this.pos.x > width + 40 || this.pos.y < -40) {
      this.pos = createVector(random(-80, -20), random(height * 0.62, height * 0.82));
    }
  }

  show(signal) {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());

    let alpha = map(signal, 0, 1, 90, 230);
    stroke(255, alpha);
    strokeWeight(1.4);
    noFill();

    line(0, 0, -this.size, -this.size * 0.45);
    line(0, 0, -this.size, this.size * 0.45);

    pop();
  }
}

function drawSky() {
  noStroke();

  for (let s of stars) {
    fill(255, random(70, 160));
    circle(s.x, s.y, random(1, 2));
  }

  fill(255, 230);
  circle(width * 0.12, height * 0.16, 42);

  fill(3, 6, 15, 180);
  circle(width * 0.135, height * 0.15, 42);
}

function drawLandscape() {
  noStroke();

  fill(8, 14, 26);
  beginShape();
  vertex(0, height * 0.72);
  vertex(width * 0.18, height * 0.58);
  vertex(width * 0.38, height * 0.74);
  vertex(width * 0.58, height * 0.55);
  vertex(width * 0.8, height * 0.72);
  vertex(width, height * 0.6);
  vertex(width, height);
  vertex(0, height);
  endShape(CLOSE);

  fill(4, 10, 18);
  rect(0, height * 0.78, width, height * 0.22);

  fill(0, 90, 120, 70);
  rect(0, height * 0.8, width, height * 0.08);
}

function drawMagneticAxis() {
  let center = createVector(width / 2, height / 2);

  stroke(0, 255, 230, 80);
  strokeWeight(1.2);
  drawingContext.setLineDash([12, 10]);
  line(center.x, center.y, north.x, north.y);
  line(center.x, center.y, width - north.x, height - north.y);
  drawingContext.setLineDash([]);

  noStroke();
  fill(0, 255, 230, 190);
  circle(north.x, north.y, 9);
}

function drawRoute(signal) {
  noFill();
  strokeWeight(2);

  stroke(0, 255, 230, map(signal, 0, 1, 40, 180));
  drawingContext.setLineDash([14, 12]);

  beginShape();
  curveVertex(width * 0.16, height * 0.72);
  curveVertex(width * 0.16, height * 0.72);
  curveVertex(width * 0.35, height * 0.55);
  curveVertex(width * 0.55, height * 0.45);
  curveVertex(destination.x, destination.y);
  curveVertex(destination.x, destination.y);
  endShape();

  drawingContext.setLineDash([]);
}

function drawDestination() {
  noStroke();

  fill(0, 255, 230, 80);
  circle(destination.x, destination.y, 52);

  fill(0, 255, 230, 210);
  circle(destination.x, destination.y, 10);

  fill(255, 190);
  textSize(13);
  text("DESTINAZIONE MIGRATORIA", destination.x + 16, destination.y + 5);
}

function drawCompassVision(signal) {
  push();
  translate(width / 2, height / 2);

  noFill();

  for (let i = 0; i < 24; i++) {
    let r = map(i, 0, 24, 35, min(width, height) * 0.36);
    let alpha = map(sin(i * 0.8 + frameCount * 0.03), -1, 1, 10, 75) * signal;

    stroke(0, 255, 230, alpha);
    ellipse(0, 0, r * 1.7, r * 0.75);
  }

  pop();
}

function drawInteraction(signal) {
  let center = createVector(width / 2, height / 2);

  stroke(255, 160);
  strokeWeight(1);
  line(center.x, center.y, mouseX, mouseY);

  noFill();
  stroke(255);
  circle(mouseX, mouseY, 22);

  noStroke();
  fill(255, 180);
  textSize(12);
  text("DIREZIONE DELLO SGUARDO", mouseX + 16, mouseY - 14);
}

function drawText(signal) {
  noStroke();

  fill(255);
  textSize(25);
  text("NAVIGAZIONE MAGNETICA", 30, 45);

  fill(185);
  textSize(15);
  text("Lo stormo usa il campo magnetico terrestre per mantenere la rotta migratoria.", 30, 75);

  fill(0, 255, 230);
  text("sguardo allineato al campo → rotta stabile", 30, 108);

  fill(170, 80, 255);
  text("sguardo disallineato → volo più incerto", 30, 130);

  fill(255);
  textSize(16);
  text("segnale magnetico percepito: " + int(signal * 100) + "%", 30, height - 34);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  north = createVector(width / 2, height * 0.12);
  destination = createVector(width * 0.82, height * 0.28);
}