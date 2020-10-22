//---------------------------------------------
// App para "Pruebas de Seleccion"
// DEP ~ DGCyE ~ 2020
//
// Matias JL
// matiasjl.github.com
//---------------------------------------------

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
function keyPressed() {
  //print("keyTyped: " + key);
  g.keys();
}

window.onresize = function() {
  // assigns new values for width and height variables
  w = window.innerWidth;
  h = window.innerHeight;
  sizeMinMax();
  canvas.size(w, h);
  g.updateInner();
}
function sizeMinMax(){
  if( w < 800 )
    w = 800;
  if( w > 1000 )
      w = 1000;
  if( h < 700 )
      h = 700;
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
  textSize(19);
  text("DIRECCIÓN GENERAL DE CULTURA Y EDUCACIÓN | PBA | 2020", w / 2, 140);
  pop();
}
