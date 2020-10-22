let input;  //parche cabeza pero input en clase no funca sino D:

class Carga {

  constructor(){

    //campo de texto
    //input = createInput("Escriba o pegue la consigna aquí.", TEXT);
    //input.size(w-100, 30);
    //input.show();
    //plan b: text area
    input = createElement('textarea', 'Escriba o pegue la consigna aquí.');
    input.position(window.innerWidth/2, 300);
    input.size(w-250, 300);
    input.show();

    //boton
    this.button = createButton('Cargar y siguiente');
    this.button.position(window.innerWidth/2, 300);
    this.button.show();
    this.button.mousePressed(this.cargar);
    //¿como hacer que botón funcione con enter?

    //boton cantidad
    this.bc = createButton('X');
    this.bc.position(window.innerWidth/2, 300);
    this.bc.show();
    this.bc.mousePressed(this.cantidad);

    //ajusto posiciones ;)
    this.updateInner();

    //estos elementos html nativos van por fuera del canvas de p5js --> estan en DOM (junto a canvas)
  }

  cargar(){ //por alguna razon esta funcion funciona como global, no de la clase carga. ¿sea que la linea 18 la pre-carga?

    //1) guardo contenido del input en mi arreglo
    let aux = input.value();
    consigna[n] = aux;

    //2) paso siguiente id
    if( n < c-1 ){ //--> si indice es menor a la cantidad de consignas
      n++;  //--> aumentar
    }else{
      n = 0;  //--> resetear
    }

    //3) MUESTRO EN CAMPO DE TEXTO EL CONTENIDO DEL ARREGLO
    input.value(consigna[n]);
    if( consigna[n] == null )
      input.value('');

    //luego de cargar debería pasar a la siguiente carga  --> LISTO (punto 2)
    //--visualizar el numero de consigna que estoy cargando --> RESUELTO EN UPDATE
    //--poder moverse entre consignas (indices como botones) --> LISTO: mousePressed())
    //--viendo su contenido actual en el input() #feedback --> LISTO: (punto 3 + mousePressed);
  }

  cantidad(){
    // cantidad de consignas: 9 o 12
    if( c == 12 )
      c = 9;
    else
      c = 12;
    // blanqueo arreglos
    consigna = [];
    nRandom = [];
    // reset indice
    n = 0;
    // recorro arreglo y asigno valores
    for( let i = 0 ; i < c ; i++){
      nRandom[i] = i ;
    }
  }

  updateInner(){
    //posiciones y tamanios líquidos --> llamar en evento window.onresize
    this.bc.position(window.innerWidth/2-((w-250)/2), 525);
    input.position(window.innerWidth/2-((w-250)/2), 200);
    input.size(w-250, 300);
    this.button.position(window.innerWidth/2-((w-250)/2) + 70, 525);
  }

  update(){
    //muestro números de las consignas cargadas (para botonera)
    push();
    noStroke();
    for (let i = 0; i < c; i++) {
      //MOUSEOVER: circulo gris
      if( dist(400 + (i * 30), 550, mouseX, mouseY) < 15 ){
        fill(cCeleste3);
        rect(400 + (i * 30), 550, 30, 30 );
      }
      //EDICIÍON ACTUAL: circulo rojo
      if( i == n ){
        fill( red(cAcento), green(cAcento), blue(cAcento), 200 );
        rect(400 + (i * 30), 550, 30, 30 );
      }
      //CONSIGNAS CARGADAS: negrita
      if( consigna[i] == null )
        textStyle(NORMAL);
      else
        textStyle(BOLD);
      fill(0);
      textSize(24);
      //text(i+1, window.innerWidth/2-w/2 + (i * 30), 315);
      text(i+1, 400 + (i * 30), 550);
    }
    pop();

  }

  display( v ){
    if( v ){
      input.show();
      this.button.show();
      this.bc.show();
    }else{
      input.hide();
      this.button.hide();
      this.bc.hide();
    }
  }

  mousePressed(){
    for (let i = 0; i < c; i++) {
      if( dist(400 + (i * 30), 550, mouseX, mouseY) < 15 ){
        n = i;
        //--> MUESTRO EN CAMPO DE TEXTO EL CONTENIDO DEL ARREGLO
        input.value(consigna[n]);
        if( consigna[n] == null )
          input.value('');
      }
    }
  }

}
