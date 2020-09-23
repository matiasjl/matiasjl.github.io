class Sobre {

  //let x, y, t;
  //let img;

  constructor(ID_, t_) {
    this.x = 0;
    this.y = 0;
    this.ID = ID_ + 1; // evaluar si sumar en valor o en visualización (metodo display)
    this.t = t_;
    this.relleno = cGris;
    this.adentro = false;
    this.timeSet = 0;
  }

  updateXY(x_, y_) {
    this.x = x_;
    this.y = y_;
  }

  update() {
    //posición líquida --> DESCARTADO
    // --> trasladado a clase grilla / metodo grilla
    //this.x = (w / 4 ) * ((n%3)+1);
    // CORREGIR POS Y
    /*
    if( n < 3 ){
      this.y = 300  ;
    }else if( n < 6 ){
      this.y = 300 + (this.t * 1.5);
    }else if( n < 9 ){
      this.y = 300 + (this.t * 3);
    }
    */

    //tamanio liquido --> DESCARTADO
    //this.t = w / 8;
    //print( this.t * 1.5 );

    //mouseOver > color de sobre
    if (mouseX > this.x - (this.t * 1.5) / 2 && mouseX < this.x + (this.t * 1.5) / 2 && mouseY > this.y - this.t / 2 && mouseY < this.y + this.t / 2) {
      if (!this.adentro) {
        this.adentro = true;
        this.timeSet = millis();
      }
      //print( n + ": adentro =" + this.adentro );
    } else {
      this.adentro = false;
      //print( n + ": adentro =" + this.adentro );
    }

    if (this.adentro) {
      this.aux = int(millis() - this.timeSet) / 250;
      this.relleno = lerpColor(cGris, cAcento, this.aux);
    } else {
      this.relleno = cGris;
    }

  }

  mousePressed() {
    if (mouseX > this.x - (this.t * 1.5) / 2 && mouseX < this.x + (this.t * 1.5) / 2 && mouseY > this.y - this.t / 2 && mouseY < this.y + this.t / 2) {
      g.nSobre = this.ID;
      g.estado = "sobre";
    }
  }

  display() {
    push();
    stroke(0);
    strokeWeight(4);
    fill(this.relleno);
    //rectMode(CENTER);
    rect(this.x, this.y, this.t * 1.5, this.t);
    line(this.x, this.y, this.x - this.t / 2 * 1.5, this.y - this.t / 2);
    line(this.x, this.y, this.x + this.t / 2 * 1.5, this.y - this.t / 2);
    textSize(24);
    textAlign(CENTER);
    text("#" + this.ID, this.x, this.y + this.t / 4);
    pop();
  }

}
