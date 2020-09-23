
class Gestor {

  constructor(){
    //estado general del programa
    this.pantalla = "carga";

    //objetos por cada pantalla
    this.carga = new Carga();
    this.random = new Random();
    this.grilla = new Grilla(9); //asegurarse que sea adaptable (ya hablaron de una version de 12...)


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
  }

  mousePressed(){
    //eventos del gestor: cambio de pantallas
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

    //eventos propios de los objetos ~ pantallas
    if( this.pantalla == "grilla" )
      this.grilla.mousePressed();
    if( this.pantalla == "random" )
      this.random.mousePressed();

  }

}