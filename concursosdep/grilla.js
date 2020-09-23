class Grilla {

  constructor(c_) {
    this.c = c_;
    this.estado = "grilla";

    this.pYsobre = 0 ;

    //identificadores claves
    this.nSobre = 0; //guarda el numero de sobre clickeado
    this.nConsigna = 0; //PENSAR... sería el indice del arreglo --> EL arreglo que maneje las consignas > ¿URNA?

    //arreglo de Sobres (objeto)
    this.sobres = [];
    for (let i = 0; i < this.c; i++) {
      this.sobres[i] = new Sobre(i, 100);
    }
  }

  update() {
    if (this.estado == "grilla") {
      for (let i = 0; i < this.c; i++) {
        this.sobres[i].update();
      }
    }
  }

  //TRES CONDICIONES DE VISUALIZACIÓN (onda boostrap)
  //mostrar en grilla liquida si es pantalla > ¿500/600?
  //-poner limite de crecimiento en ¿1024? check
  //si es menor en columna uno x uno (para celus)
  display() {
    //siempre dibujo la grilla
    this.update();
    this.grilla();

    /*
    if( this.estado == "grilla" ){

    }else if( this.estado == "animacion" ){

    }else */
    if (this.estado == "sobre") {
      this.sobre(); // verificar como linkear valores
    }

    //this.s.display();

    //test
    //fill( 255, 0, 0 );
    //ellipse( w/2, h/2, 100, 100 );
  }

  mousePressed() {
    if (this.estado == "grilla") {
      for (let i = 0; i < this.c; i++) {
        this.sobres[i].mousePressed();
      }
    }else if (this.estado == "sobre") {
      this.pYsobre = 0 ;
      this.estado = "grilla";
    }
3  }

  grilla(){
    for (let i = 0; i < this.c; i++) {
      // POS-Y: arreglar... O NO Agh
      if (i < 3) {
        //this.y = 300  ;
        this.sobres[i].updateXY((w / 2 - 200) + i * 200, 300);
      } else if (i < 6) {
        //this.y = 300 + (this.t * 1.5);
        this.sobres[i].updateXY((w / 2 - 200) + (i - 3) * 200, 450);
      } else if (i < 9) {
        //this.y = 300 + (this.t * 3);
        this.sobres[i].updateXY((w / 2 - 200) + (i - 6) * 200, 600);
      }
      //this.sobres[i].updateXY();
      this.sobres[i].display();
    }
  }

  sobre() { // REVISAR TODAS LAS POSIONES
    //animacion  --> hacer con lerp
    if( this.pYsobre < h/4 ){
      this.pYsobre += 5;
    }

    push();

    //fondo
    noStroke();
    fill(0, 200);
    rect(w / 2, h / 2, w, h);

    //sobre (detras)
    fill(cGris);
    stroke(0);
    strokeWeight(4);
    beginShape();
    vertex(w / 2 - 800 / 2, h / 2 + this.pYsobre);
    vertex(w / 2 - 800 / 2, h / 2 + 300 + this.pYsobre);
    vertex(w / 2 + 800 / 2, h / 2 + 300 + this.pYsobre);
    vertex(w / 2 + 800 / 2, h / 2 + this.pYsobre);
    vertex(w / 2, h / 2 - 200 + this.pYsobre);
    endShape(CLOSE);

    //hoja + texto
    noStroke();
    fill(255);
    //rect(w / 2, h / 2, 700, 600 );
    rect(w / 2, h/4*3 - this.pYsobre, 700, 600 );
    fill(0);
    textSize(24);
    textAlign(CENTER, CENTER );
    //text("#" + this.nConsigna, w / 2, h / 2 - 250 ); // --> clave
    text("#" + this.nConsigna, w / 2,  h/4*3 - this.pYsobre - 250 ); // --> clave
    textSize(16);
    textAlign(LEFT, TOP);
    //text(textoPrueba, w / 2, h / 2 + 100, 600, 600);  // --> aquí textos consignas
    text(textoPrueba, w / 2, h/4*3 - this.pYsobre + 100, 600, 600);  // --> aquí textos consignas

    //sobre (delante)
    fill(cAcento);
    stroke(0);
    strokeWeight(4);
    beginShape();
    vertex(w / 2 - 800 / 2, h / 2 + this.pYsobre);
    vertex(w / 2 - 800 / 2, h / 2 + 400 + this.pYsobre);
    vertex(w / 2 + 800 / 2, h / 2 + 400 + this.pYsobre);
    vertex(w / 2 + 800 / 2, h / 2 + this.pYsobre);
    vertex(w / 2, h / 2 + 200 + this.pYsobre);
    endShape(CLOSE);
    textSize(32);
    textAlign(CENTER, CENTER);
    //text("#" + this.nSobre, w / 2, h / 2 + 300 + this.pYsobre); // --> clave
    text("#" + this.nSobre, (w/2-400) + 800/7, h / 2 + 120 +  this.pYsobre); // --> clave

    pop();

  }

}
