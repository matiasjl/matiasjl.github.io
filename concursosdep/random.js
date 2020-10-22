
class Random {

    constructor(){

      //boton: propiedades
      this.c = cGris;
      this.t = 100;
      //animación
      this.adentro = false;
      this.timeSet = 0;

      //feedback: propiedades
      this.texto = "¡LISTO!";
      this.opacidad = 0;

    }

    mezclar(){
      //aquí sucede la magia: reordeno consignas entre sobres
      //--tengo que pensarlo... pero serian dos arreglos cruzados
      //--o uno solo: donde indice es sobre y contenido en n consigna

      //solución 5/10: nRandom es un arreglo de indices que desordeno con shufle()
      nRandom = shuffle(nRandom);

    }

    update(){
      //btn SIN animación de color
      //if( dist(w/2,300,mouseX,mouseY) < this.t/2 )
      //  this.c = cAcento;
      //else
      //  this.c = cGris;

      //bton CON animación de color
      //evaluo si mouse esta o no dentro del boton
      if (mouseX > w/2 - (this.t * 2) / 2 && mouseX < w/2 + (this.t *2) / 2 && mouseY > 300 - this.t / 2 && mouseY < 300 + this.t / 2) {
        if (!this.adentro) {
          this.adentro = true;
          this.timeSet = millis();
        }
      } else {
        this.adentro = false;
      }
      //ejecuto animacion con learp
      if (this.adentro) {
        this.aux = int(millis() - this.timeSet) / 250;
        this.c = lerpColor(cGris, cAcento, this.aux);
      } else {
        this.c = cGris;
      }

      //animacion opacidad
      if( this.opacidad > 0 )
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
      strokeWeight(4);
      textSize( 24 );
      textStyle(NORMAL);
      fill(this.c);
      text( "MEZCLAR", w/2, 300 );
      //text-feedback
      noStroke();
      textSize( 32 );
      textStyle(BOLD);
      fill( 255, this.opacidad);
      text( this.texto, w/2, 450 );
      pop();
    }

    mousePressed(){
      if (mouseX > w/2 - (this.t * 2) / 2 && mouseX < w/2 + (this.t *2) / 2 && mouseY > 300 - this.t / 2 && mouseY < 300 + this.t / 2) {
        this.mezclar();
        this.opacidad = 255;
      }
    }



}
