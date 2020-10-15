// VARIABLES GLOBALES CONSIGNAS
let consigna = [];  //arreglo de consignas
let n = 0;  //indice del arreglo
let c = 12;  //cantidad de consignas
let nRandom = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ]; //para random.js

/*
function cantidad( v ){
  // cantidad de consignas: 9 o 12
  c = v;
  // blanqueo arreglos
  consigna = [];
  nRandom = [];
  // reset indice
  n = 0;
  // recorro arreglo y asigno valores
  for( i = 0 ; i < v ; i++){
    nRandom[i] = i ;
  }
  //return "ok";
}
*/

class Gestor {

  constructor(){
    //estado general del programa
    this.pantalla = "carga";
    this.gui = false;

    //objetos por cada pantalla
    this.carga = new Carga();
    this.random = new Random();
    this.grilla = new Grilla(); //asegurarse que sea adaptable (ya hablaron de una version de 12...) --> c --> HECHO :D


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
    //CAMBIO ENTRE PANTALLAS CON NÚMEROS  --> OLD BORRAR
    /*
    if( key == '1' ){
      this.carga.display(true);
      this.pantalla = "carga";
    }else if( key == '2' ){
      this.carga.display(false);
      this.pantalla = "random";
    }else if( key == '3' ){
      this.carga.display(false);
      this.pantalla = "grilla";
    }
    */
    /*  //era para visualizar numeros pero mepa que chau
    else if( key == 'm' || key == 'M' ){
      this.gui = !this.gui;
    }
    */

    //'M' mueve entre pantallas
    if( key == 'm' || key == 'M' ){
      if( this.pantalla == "carga" ){
        this.carga.display(false);
        this.pantalla = "random";
      }else if( this.pantalla == "random" ){
        this.carga.display(false);
        this.pantalla = "grilla";
      }else if( this.pantalla == "grilla" ){
        this.carga.display(true);
        this.pantalla = "carga";
      }
    }

  }

  mousePressed(){
    //eventos del gestor: cambio de pantallas --> OLD BORRAR
    /*
    if( this.gui ){
      if( dist(w/2-50, 200, mouseX, mouseY) < 15 ){
        this.carga.display(true);
        this.pantalla = "carga";
      }else if( dist(w/2, 200, mouseX, mouseY) < 15 ){
        this.carga.display(false);
        this.pantalla = "random";
      }else if( dist(w/2+50, 200, mouseX, mouseY) < 15 ){
        this.carga.display(false);
        this.pantalla = "grilla";
      }
    }
    */

    //eventos propios de los objetos ~ pantallas
    if( this.pantalla == "carga" )
      this.carga.mousePressed();
    if( this.pantalla == "grilla" )
      this.grilla.mousePressed();
    if( this.pantalla == "random" )
      this.random.mousePressed();

  }

}
