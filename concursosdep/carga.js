let input;  //parche cabeza pero input en clase no funca sino D:

class Carga {

  constructor(){

    //campo de texto
    input = createInput("Escriba o pegue la consigna aquí.", TEXT);
    //input = createInput("", TEXT);
    //this.input.size(w-100, 300);
    input.size(w-100, 30);
    input.show();

    //boton
    this.button = createButton('Cargar y siguiente');
    this.button.position(window.innerWidth/2-25, 300);
    this.button.show();
    this.button.mousePressed(this.cargar);
    //¿como hacer que botón funcione con enter?

    //boton cantidad
    this.bc = createButton('X');
    this.bc.position(window.innerWidth/2-25, 300);
    this.bc.show();
    this.bc.mousePressed(this.cantidad);


    //estos elementos html nativos van por fuera del canvas de p5js
  }

  cargar(){ //por alguna razon esta funcion funciona como global, no de la clase carga. ¿sea que la linea 18 la pre-carga?

    //1) guardo contenido del input en mi arreglo
    let aux = input.value();
    consigna[n] = aux;
    //print( n + " load: " + consigna[n] );

    //2) paso siguiente id
    //c++;  //--> aumento infinito de consignas? PENSAR SI SE JUSTIFICA
    if( n < c-1 ){ //--> si indice es menor a la cantidad de consignas
      n++;  //--> aumentar
    }else{
      n = 0;  //--> resetear
    }

    //--> MUESTRO EN CAMPO DE TEXTO EL CONTENIDO DEL ARREGLO
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
    for( i = 0 ; i < c ; i++){
      nRandom[i] = i ;
    }
    // cambio texto del boton: no se la funcion ahah
    //this.bc.text('12');

    //return "ok";
  }

  update(){
    //posiciones y tamanios líquidos --> capaz mas que draw()deberia ir en window.onresize
    input.position(window.innerWidth/2-w/2 + 50, 250);
    input.size(w-100, 30);
    this.button.position(window.innerWidth/2-w/2 + 115, 300);
    this.bc.position(window.innerWidth/2-w/2 + 50, 300);

    //muestro números de las consignas cargadas (para botonera)
    push();
    noStroke();
    for (let i = 0; i < c; i++) {
      //MOUSEOVER: circulo gris
      if( dist(320 + (i * 30), 325, mouseX, mouseY) < 15 ){
        fill(cCeleste3);
        rect(320 + (i * 30), 325, 30, 30 );
      }
      //EDICIÍON ACTUAL: circulo rojo
      if( i == n ){
        fill( red(cAcento), green(cAcento), blue(cAcento), 200 );
        rect(320 + (i * 30), 325, 30, 30 );
      }
      //CONSIGNAS CARGADAS: negrita
      if( consigna[i] == null )
        textStyle(NORMAL);
      else
        textStyle(BOLD);
      fill(0);
      textSize(24);
      //text(i+1, window.innerWidth/2-w/2 + (i * 30), 315);
      text(i+1, 320 + (i * 30), 325);
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
      if( dist(320 + (i * 30), 325, mouseX, mouseY) < 15 ){
        n = i;
        //--> MUESTRO EN CAMPO DE TEXTO EL CONTENIDO DEL ARREGLO
        input.value(consigna[n]);
        if( consigna[n] == null )
          input.value('');
      }
    }
  }


}
