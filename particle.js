class Particle {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = particleSpeed;
    this.prevPos = this.pos.copy();
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel.copy().mult(particleSpeed));
    this.acc.mult(0);
  }

  follow(vectors) {
    let x = floor(this.pos.x / scale);
    let y = floor(this.pos.y / scale);
    let index = x + y * cols;
    let force = vectors[index];
    this.applyForce(force);
  }

  applyForce(force) {
    this.acc.add(force);
  }

  show() {
    colorMode(RGB, 255);
    let redC = map(this.vel.x + this.vel.y, 0, this.maxSpeed * 0.5, 0, r);
    let greenC = map(this.vel.x + this.vel.y, 0, this.maxSpeed * 0.5, 0, g);
    let blueC = map(this.vel.x + this.vel.y, 0, this.maxSpeed * 0.5, 0, b);

    let mixColor = color(redC, greenC, blueC);
    let alpha = map(this.vel.mag(), 0, this.maxSpeed, 0, 100);
    mixColor.setAlpha(alpha);

    stroke(redC, greenC, blueC, 100);
    strokeWeight(4);
    line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
    this.updatePrev();
  }

  updatePrev() {
    this.prevPos.x = this.pos.x;
    this.prevPos.y = this.pos.y;
  }

  edges() {
    if (this.pos.x > width) {
      this.pos.x = 0;
      this.updatePrev();
    }
    if (this.pos.x < 0) {
      this.pos.x = width;
      this.updatePrev();
    }
    if (this.pos.y > height) {
      this.pos.y = 0;
      this.updatePrev();
    }
    if (this.pos.y < 0) {
      this.pos.y = height;
      this.updatePrev();
    }
  }
}
