
class Random {

    constructor(){

      //boton: propiedades
      this.c = cGris;
      this.t = 100;

      //feedback: propiedades
      this.texto = "¡LISTO!";
      this.opacidad = 255;

    }

    mezclar(){
      //aquí sucede la magia: reordeno consignas entre sobres
      //--tengo que pensarlo... pero serian dos arreglos cruzados
      //--o uno solo: donde indice es sobre y contenido en n consigna
    }

    update(){
      if( dist(w/2,300,mouseX,mouseY) < this.t/2 )
        this.c = cAcento;
      else
        this.c = cGris;

      //animacion opacidad > LERP!
      this.opacidad-=5;

    }

    display(){
      push();
      //box
      stroke(0);
      strokeWeight(4);
      fill( this.c );
      rect(w/2, 300, this.t*2, this.t);
      //text-box
      noStroke();
      textSize( 24 );
      textStyle(NORMAL);
      fill(255);
      text( "REORDENAR", w/2, 300 )
      //text-feedback
      textSize( 32 );
      textStyle(BOLD);
      fill( 255, this.opacidad);
      text( this.texto, w/2, 400 )
      pop();
    }

    mousePressed(){
      if( dist(w/2,300,mouseX,mouseY) < this.t/2 ){
        this.mezclar();
        this.opacidad = 255;
      }
    }



}
