// Piano Variables

let audioContext;
let piano;
let pitch;
let midiNum;
var volHist = [];
var freqHist = [];
let volumeTimer = 0; // Timer for volume absence
const volumeDelay = 3; // Delay in seconds before particleCount decreases

// Flow Field variables

let frames = 60; // Framerate de la página

let increment = 0.5;
let scale = 10;
let cols, rows;

let xOffset,
  yOffset,
  zOffset = 0,
  offsetMultiplier = 1;
xyIncrement = 0.1;

let twoPiMultiplier = 4;

let particles = [];
let particleCount = 500; // PIANO 500-1000 // DONE
let particleSpeed = 1; // PIANO 1-6 // DONE
const maxParticleSpeed = 6;

let flowField;
let magnitude = 0.1; // PIANO 0-0.8 // DONE

let r = 255; // PIANO
let g = 255; // PIANO
let b = 255; // PIANO

//////////////////////////////////////////////////////////

function setup() {
  frameRate(frames);
  createCanvas(windowWidth, windowHeight);
  // Flow Field
  cols = floor(width / scale);
  rows = floor(height / scale);

  fps = createP('FPS: ...');

  // Crea el Flow Field
  flowField = new Array(cols * rows);
  background(50);

  // Crea partículas presentes en el canvas
  for (let i = 0; i < particleCount; i++) {
    particles[i] = new Particle();
  }

  // Piano
  audioContext = getAudioContext();
  piano = new p5.AudioIn();
  piano.start(startPitch);
  userStartAudio();
}

// Uso de ml5 para detectar pitch
function startPitch() {
  pitch = ml5.pitchDetection(
    './Model/',
    audioContext,
    piano.stream,
    modelLoaded
  );
}

function getPitch() {
  pitch.getPitch(function (error, frequency) {
    if (frequency) {
      //select('#result').html(frequency);
    } else {
      //select('#result').html('Pitch: no pitch detected');
    }
    getPitch();
    midiNum = freqToMidi(frequency);
  });
  // Array de historial de frecuencias para llenar el alto del canvas
  // if (midiNum < 48) {
  //   freqHist.push(47);
  // }
  freqHist.push(midiNum);
  if (freqHist.length > 250) {
    freqHist.splice(0, 1);
  }
  //console.log(freqHist);
}

function modelLoaded() {
  // select('#status').html('Model Loaded');
  getPitch();
}

function calculateAverage(arr) {
  if (arr.length === 0) {
    return 0; 
  }
  let sum = arr.reduce((total, value) => total + value, 0);
  return sum / arr.length;
}

function mousePressed() {
      
  // Set the value of fullscreen
  // into the variable
  let fs = fullscreen();
    
  // Call to fullscreen function
  fullscreen(!fs); 
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

//////////////////////////////////////////////////////////

function draw() {
  background(0, 0, 0, 10);

  // Dibuja el Flow Field
  for (let y = 0; y < rows; y++) {
    yOffset = y * offsetMultiplier;
    for (let x = 0; x < cols; x++) {
      xOffset = x * offsetMultiplier;
      let index = x + y * cols;
      let angle = noise(xOffset, yOffset, zOffset) * TWO_PI * twoPiMultiplier;
      let v = p5.Vector.fromAngle(angle);
      v.setMag(magnitude);
      flowField[index] = v;
      xOffset += xyIncrement;
    }
    yOffset += xyIncrement;
    zOffset += increment;
  }

  // Dibuja las partículas
  for (let particle of particles) {
    particle.follow(flowField);
    particle.update();
    particle.edges();
    particle.show();
  }

  // Array de historial de volumen para llenar el ancho del canvas
  let vol = piano.getLevel();
  volHist.push(vol);
  if (volHist.length > 250) {
    volHist.splice(0, 1);
  }

  // Da velocidad a las partículas si hay sonido
  // Aumenta las partículas si hay sonido
  if (vol > 0.1) {
    particleSpeed = map(vol, 0, 1, 2.5, maxParticleSpeed);
    particleCount = 1200;
    volumeTimer = 0; // Reset the volume absence timer
  } else if (volumeTimer < volumeDelay) {
    particleCount = 1200; // Keep particleCount at 1000 during the delay period
    volumeTimer += deltaTime / 1000; // Increase the timer by the elapsed time in seconds
  } else {
    particleSpeed = lerp(particleSpeed, 1, 0.01);
    particleCount = lerp(particleCount, 500, 0.1); // Ease particleCount down to 500
  }

  // Cambia la magnitud de acuerdo al promedio del array de frecuencias
  let sum = 0;
  let count = 0;
  for (let i = 0; i < freqHist.length; i++) {
    if (freqHist[i] >= 48) {
      sum += freqHist[i];
      count++;
      let average = count > 0 ? sum / count : 0;
      magnitude = map(average, 48, 95, 0, 0.8);
    } else {
      if (millis() > 1500) {
        magnitude = lerp(magnitude, 0.1, 0.5);
      }
    }
  }

  // cambia r, g y b de acuerdo a intervalos de 15 valores MIDI
  let intervalR = [];
  let intervalG = [];
  let intervalB = [];

  for (let value of freqHist) {
    if (value >= 48 && value <= 62) {
      intervalR.push(value);
      if (intervalR.length > 30) {
        intervalR.shift();
      }
    } else if (value >= 64 && value <= 78) {
      intervalG.push(value);
      if (intervalG.length > 30) {
        intervalG.shift();
      }
    } else if (value >= 80 && value <= 95) {
      intervalB.push(value);
      if (intervalB.length > 30) {
        intervalB.shift();
      }
    }
  }

  let avgR = calculateAverage(intervalR);
  let avgG = calculateAverage(intervalG);
  let avgB = calculateAverage(intervalB);

  r = map(avgR, 48, 62, 0, 255);
  g = map(avgG, 64, 78, 0, 255);
  b = map(avgB, 80, 95, 0, 255);

  // Dibuja elipse que cambia de tamaño con el volumen actual
  // y sigue al mouse
  // stroke('#ff0000');
  // noFill();
  // ellipse(mouseX, mouseY, vol * 100);

  // Dibuja onda según el historial de volúmenes
  // stroke('#ff0000');
  // noFill();
  // beginShape();
  // for (let i = 0; i < volHist.length; i++) {
  //   var y = map(volHist[i], 0, 1, height * 0.75, 0);
  //   vertex(i, y);
  // }
  // endShape();

  // Dibuja onda según el historial de frecuencias
  // stroke('#0000ff');
  // noFill();
  // beginShape();
  // for (let i = 0; i < freqHist.length; i++) {
  //   var y = map(freqHist[i], 48, 95, height, 0);
  //   vertex(i, y);
  // }
  // endShape();

  // Muestra FPS
  fps.html('FPS: ' + floor(frameRate()));
}
