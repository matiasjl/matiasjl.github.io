// VARIABLES GLOBALES CONSIGNAS
let consigna = [];  //arreglo de consignas
let n = 0;  //indice del arreglo
let c = 12;  //cantidad de consignas
let nRandom = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ]; //para random.js

class Gestor {

  constructor(){
    //estado general del programa
    this.pantalla = "carga";
    this.gui = false;

    //objetos por cada pantalla
    this.carga = new Carga();
    this.random = new Random();
    this.grilla = new Grilla();

  }

  updateInner(){
    if( this.pantalla == "carga" ){
      this.carga.updateInner();
    }
  }

  update(){
    if( this.pantalla == "carga" ){
      this.carga.update();
    }else if( this.pantalla == "random" ){
      this.random.update();
    }else if( this.pantalla == "grilla" ){

    }
  }

  display(){
    //---------------------------------------------
    //NUMEROS
    if( this.gui ){
      push();
      textSize( 24 );
      fill( cAcento );
      noStroke();
      if( this.pantalla == "carga" )
        textStyle(BOLD);
      else
        textStyle(NORMAL);
      text("1", w/2-50, 200);
      if( this.pantalla == "random" )
        textStyle(BOLD);
      else
        textStyle(NORMAL);
      text("2", w/2, 200);
      if( this.pantalla == "grilla" )
        textStyle(BOLD);
      else
        textStyle(NORMAL);
      text("3", w/2+50, 200);
      pop();
      }
    //---------------------------------------------
    //PANTALLAS
    if( this.pantalla == "carga" ){
      //this.carga.display(true);
    }else if( this.pantalla == "random" ){
      this.random.display();
    }else if( this.pantalla == "grilla" ){
      this.grilla.display();
    }

  }

  keys(){
    //flechas mueven entre pantallas
    if( keyCode == RIGHT_ARROW ){
      if( this.pantalla == "carga" ){
        this.carga.display(false);
        this.pantalla = "random";
      }else if( this.pantalla == "random" ){
        this.carga.display(false);
        this.pantalla = "grilla";
      }
    }
    if( keyCode == LEFT_ARROW ){
      if( this.pantalla == "grilla" ){
        this.carga.display(false);
        this.pantalla = "random";
      }else if( this.pantalla == "random" ){
        this.carga.display(true);
        this.pantalla = "carga";
      }
    }

  }

  mousePressed(){
    //eventos propios de los objetos ~ pantallas
    if( this.pantalla == "carga" )
      this.carga.mousePressed();
    if( this.pantalla == "grilla" )
      this.grilla.mousePressed();
    if( this.pantalla == "random" )
      this.random.mousePressed();
  }

}
