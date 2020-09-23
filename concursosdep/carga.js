
class Carga {

  constructor(){

    //arreglo de consignas -> global?
    this.consigna = [];
    this.n = 0;

    //campo de texto
    this.input = createInput();
    this.input.position(window.innerWidth/2-w/2 + 50, 250);
    this.input.size(w-100, 300);
    this.input.show();

    //boton
    this.button = createButton('Cargar');
    this.button.position(window.innerWidth/2-25, 580);
    this.button.show();
    //this.button.mousePressed(cargar);
    //por alguna razon me tapa el draw del sketch
    //me suena que estos elementos html van por fuera del canvas

  }

  cargar(){
    this.consigna[this.n] = input.value();
    //input.value('');  //--> limpio el campo de texto

    //luego de cargar debería pasar a la siguiente carga
    //--visualizar el numero de consigna que estoy cargando
    //--poder volver hacia adelante y atras entre consignas
    //--viendo su contenido actual en el input()
  }

  update(){
    //posiciones y tamanios líquidos
    this.input.position(window.innerWidth/2-w/2 + 50, 250);
    this.input.size(w-100, 300);
    this.button.position(window.innerWidth/2-25, 580);
  }

  display( v ){
    if( v ){
      this.input.show();
      this.button.show();
    }else{
      this.input.hide();
      this.button.hide();
    }

  }

}
