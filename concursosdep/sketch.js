// CONFIG ~
//let fSizeTitulo = 48;
//let fSizeSubtitulo = 18;

// VARIABLES GLOBALES ~
let g;
var w = window.innerWidth;
var h = window.innerHeight;

function setup() {
  sizeMinMax();
  canvas = createCanvas(w, h);
  g = new Gestor();

  inicializarDiseno();

  rectMode(CENTER);
  textAlign(CENTER, CENTER);
}

function draw() {
  contenedor();

  //---------------------------------------------
  //GESTOR
  g.update();
  g.display();

}

// this function fires with any click anywhere
function mousePressed() {
  g.mousePressed();
}
function keyTyped() {
  //print("keyTyped: " + key);
  g.keys();
}

window.onresize = function() {
  // assigns new values for width and height variables
  w = window.innerWidth;
  h = window.innerHeight;
  sizeMinMax();
  canvas.size(w, h);
}
function sizeMinMax(){
  if( w < 800 )
    w = 800;
  if( w > 1000 )
      w = 1000;
  if( h < 700 )
      h = 700;
}

function preload() {
  // Ensure the .ttf or .otf font stored in the assets directory
  // is loaded before setup() and draw() are called
  //font = loadFont('assets/SourceSansPro-Regular.otf');
  //FUENTE LA RESUELVO CON GFONTS EN INDEX
  //(aunque si lo haría así tendría mas variantes)

  //imgSobre = loadImage('assets/sobre.jpg');
}

//---------------------------------------------
// FUNCIONES DE DIBUJO

function contenedor(){
  background(cCeleste1);
  push();
  //marco
  fill(202, 231, 234);
  noFill();
  stroke(255);
  strokeWeight(10);
  //rect(w / 2, h / 2, w - 50, h - 50);
  rect(w / 2, h / 2, w - 50, h - 50);
  //rect(w / 2, h / 2, 750, h - 50);

  //titulo
  fill(0);
  noStroke();
  //textAlign(CENTER);
  textSize(48);
  textStyle(BOLD);
  text("PRUEBAS DE SELECCIÓN", w / 2, 100);
  textSize(18);
  text("DIRECCIÓN PROVINCIAL DE EDUCACIÓN PRIMARIA | DGCyE | 2020", w / 2, 150);
  pop();
}
