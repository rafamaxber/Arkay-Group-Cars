(function() {
  'use strict';

  /*
  Vamos estruturar um pequeno app utilizando módulos.
  Nosso APP vai ser um cadastro de carros. Vamos fazê-lo por partes.
  A primeira etapa vai ser o cadastro de veículos, de deverá funcionar da
  seguinte forma:
  - No início do arquivo, deverá ter as informações da sua empresa - nome e
  telefone (já vamos ver como isso vai ser feito)
  - Ao abrir a tela, ainda não teremos carros cadastrados. Então deverá ter
  um formulário para cadastro do carro, com os seguintes campos:
    - Imagem do carro (deverá aceitar uma URL)
    - Marca / Modelo
    - Ano
    - Placa
    - Cor
    - e um botão "Cadastrar"
  Logo abaixo do formulário, deverá ter uma tabela que irá mostrar todos os
  carros cadastrados. Ao clicar no botão de cadastrar, o novo carro deverá
  aparecer no final da tabela.
  Agora você precisa dar um nome para o seu app. Imagine que ele seja uma
  empresa que vende carros. Esse nosso app será só um catálogo, por enquanto.
  Dê um nome para a empresa e um telefone fictício, preechendo essas informações
  no arquivo company.json que já está criado.
  Essas informações devem ser adicionadas no HTML via Ajax.
  Parte técnica:
  Separe o nosso módulo de DOM criado nas últimas aulas em
  um arquivo DOM.js.
  E aqui nesse arquivo, faça a lógica para cadastrar os carros, em um módulo
  que será nomeado de "app".
  */

  function app() {

    function Catalog() {
      this.vehicleList = [];
      this.vehicle = {};
      this.$form = DOM('[data-js="form"]');
      this.$inputList = DOM('[data-js="form"] input');
      this.$table = DOM('[data-js-table="collums"]');
      this.$title = DOM('[data-js-info="title"]');
      this.$phone = DOM('[data-js-info="phone"]');
      this.$image = DOM('[name="image"]');
      this.$containerImage = DOM('[data-js-image="image"]');
      this.urlNoImage = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtIaPs4-y7dIpmrsurSkIMCvC1qjpMQC3jPxQ5kc_f4obOoyH8x3jFnRJp';
    };

    Catalog.prototype.companyInfo = function( data ) {
      this.$title.get(0).textContent = data.name;
      this.$phone.get(0).textContent = data.phone;
    };

    Catalog.prototype.loadCompanyInfo = function() {
      var config = {
        method: 'GET',
        url: 'company.json'
      }
      this.ajax( config, null, function( object, error ) {
        if ( error ) return;
        this.companyInfo( object );
      }.bind( this ));
    };

    Catalog.prototype.saveVehicle = function( item ) {
      var config = {
        method: 'POST',
        url: 'http://localhost:3000/car'
      }
      this.ajax( config, this.vehicle, function( object, error ) {
        if ( error ) return;
        this.createTableVehicle();
      }.bind( this ));
    };

    Catalog.prototype.removeVehicle = function( event ) {
      var config = {
        method: 'DELETE',
        url: 'http://localhost:3000/car'
      }
      var index = event.target.dataset.jsRemove;
      this.ajax( config, this.vehicleList[index], function( object, error ) {
        if ( error ) return;
        this.createTableVehicle();
      }.bind( this ));
    };

    Catalog.prototype.createTableVehicle = function() {
      var config = {
        method: 'GET',
        url: 'http://localhost:3000/car'
      }
      this.ajax( config, null, function( object, error ) {
        if ( error ) return;
        this.updateTableVehicle( object );
        this.resetForm();
      }.bind( this ));
    };

    Catalog.prototype.updateTableVehicle = function( data ) {
      var html = '';
      this.vehicleList = [];
      data.forEach(function(item, index){
        this.vehicleList.push(item);
        html += '<tr>';
          html += '<td><img src="' + item['image'] + '" width="100px"></td>';
          html += '<td>' + item.brandModel + '</td>';
          html += '<td>' + item.year + '</td>';
          html += '<td>' + item.plate + '</td>';
          html += '<td>' + item.color + '</td>';
          html += '<td><button data-js-remove="' + index + '" class="btn">Remove</button></td>';
        html += '</tr>';
      }.bind( this ));

      this.$table.get(0).innerHTML = html;
      this.setEventRemove();
    };

    Catalog.prototype.resetForm = function( item ) {
      this.$containerImage.get(0).src = this.urlNoImage;
      this.$inputList.forEach(function( item ) {
        item.value = '';
      });
      this.$inputList.get(0).focus();
    };

    Catalog.prototype.handleForm = function( event ) {
      event.preventDefault();
      this.vehicle = {};
      this.$inputList.forEach(function( item ) {
        if ( item.name !== '' ) return this.vehicle[ item.name ] = item.value;
      }.bind( this ));
      this.saveVehicle();
    };

    Catalog.prototype.setEventRemove = function() {
      this.$btnRemove = DOM('body [data-js-remove]');
      this.$btnRemove.on('click', this.removeVehicle.bind(this), false );
    };

    Catalog.prototype.setEvents = function() {
      this.$form.on('submit', this.handleForm.bind( this ));
      this.$image.on('blur', this.handleRenderImage.bind( this ));
      this.$containerImage.on('error', this.errorLoadImage.bind(this));
    };

    Catalog.prototype.ajax = function( config, data, callback ) {
      var data = (!!data) ? JSON.stringify( data ) : null;
      var ajax = new XMLHttpRequest();
      ajax.open( config.method, config.url );
      ajax.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      ajax.send( data );
      ajax.onload = function() {
        return callback( JSON.parse( ajax.responseText ) );
      }
      ajax.onerror = function( error ) {
        return callback( JSON.parse( ajax.responseText ), error );
      }
    }

    Catalog.prototype.errorLoadImage = function() {
      this.$image.get(0).value = "";
      this.$image.get(0).setAttribute('placeholder', 'A imagem não existe');
      this.$image.get(0).focus();
      this.$containerImage.get(0).src = this.urlNoImage;
    };

    Catalog.prototype.handleRenderImage = function() {
      if ( this.$image.get(0).value === '' ) return this.$containerImage.get(0).src = this.urlNoImage;
      return this.$containerImage.get(0).src = this.$image.get(0).value;
    };

    var catalog = new Catalog();
        catalog.loadCompanyInfo();
        catalog.setEvents();
        catalog.createTableVehicle();
  }

  app();

})();