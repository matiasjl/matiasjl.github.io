let input;  //parche cabeza pero input en clase no funca sino D:

class Carga {

  constructor(){

    //campo de texto
    //input = createInput("Escriba o pegue su consigna aquí.", TEXT);
    input = createInput("", TEXT);
    //this.input.size(w-100, 300);
    input.size(w-100, 30);
    input.show();

    //boton
    this.button = createButton('Cargar y siguiente');
    this.button.position(window.innerWidth/2-25, 580);
    this.button.show();
    this.button.mousePressed(this.cargar);
    //¿como hacer que botón funcione con enter?

    //estos elementos html nativos van por fuera del canvas de p5js
  }

  cargar(){ //por alguna razon esta funcion funciona como global, no de la clase carga. ¿sea que la linea 18 la pre-carga?
    //TEST boton --
    //cCeleste1 = color(255, random(255), 0);

    //1) guardo contenido del input en mi arreglo
    let aux = input.value();
    consigna[n] = aux;
    print( n + " load: " + consigna[n] );

    //2) paso siguiente id
    //c++;  //--> aumento infinito de consignas? PENSAR SI SE JUSTIFICA
    if( n < c-1 ){ //--> si indice es menor a la cantidad de consignas
      n++;  //--> aumentar
    }else{
      n = 0;  //--> resetear
    }
    print( n + " / " + "consigna actual en edicion" );

    //--> MUESTRO EN CAMPO DE TEXTO EL CONTENIDO DEL ARREGLO
    input.value(consigna[n]);
    if( consigna[n] == null )
      input.value('');

    //luego de cargar debería pasar a la siguiente carga  --> LISTO (punto 2)
    //--visualizar el numero de consigna que estoy cargando --> RESUELTO EN UPDATE
    //--poder moverse entre consignas (indices como botones) --> LISTO: mousePressed())
    //--viendo su contenido actual en el input() #feedback --> LISTO: (punto 3 + mousePressed);
  }


  update(){
    //posiciones y tamanios líquidos --> capaz mas que draw()deberia ir en window.onresize
    input.position(window.innerWidth/2-w/2 + 50, 250);
    input.size(w-100, 30);
    //this.button.position(window.innerWidth/2-25, 580);
    //this.button.position(window.innerWidth/2-60, 300);
    this.button.position(window.innerWidth/2-w/2 + 50, 300);

    //muestro números de las consignas cargadas (para botonera)
    push();
    for (let i = 0; i < c; i++) {
      //MOUSEOVER: circulo detras de number
      if( dist(200 + (i * 30), 310, mouseX, mouseY) < 15 ){
        fill(cCeleste3);
        noStroke();
        ellipse(200 + (i * 30), 310, 30, 30 );
      }
      if( i == n )
        textStyle(BOLD);
      else
        textStyle(NORMAL);
      fill(0);
      textSize(24);
      //text(i+1, window.innerWidth/2-w/2 + (i * 30), 315);
      text(i+1, 200 + (i * 30), 310);
    }
    pop();

  }

  display( v ){
    if( v ){
      input.show();
      this.button.show();
    }else{
      input.hide();
      this.button.hide();
    }
  }

  mousePressed(){
    print( "clic" );
    for (let i = 0; i < c; i++) {
      if( dist(200 + (i * 30), 310, mouseX, mouseY) < 15 ){
        n = i;
        //--> MUESTRO EN CAMPO DE TEXTO EL CONTENIDO DEL ARREGLO
        input.value(consigna[n]);
        if( consigna[n] == null )
          input.value('');
      }
    }
  }


}
