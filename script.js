'use strict';

document.addEventListener('DOMContentLoaded', initialize);

function initialize() {
   const input = document.querySelector('input');
   const liste = document.querySelector('ul');
   const files = ['kennzeichen', 'laenderkennzeichen', 'diplomatenkennzeichen'];
   const manager = new Verzeichnisdienst(liste);

   Promise
      .all(files.map(file => fetch(`data/${file}.json`)))
      .then(responses => responses.map(response => {
         response.json().then(json => {
            manager.addService(new Verzeichnis(json));
         });
      }));

   input.addEventListener('keyup', () => manager.search(input.value.trim().toUpperCase()));

   if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('service-worker.js', { scope: '.' });
   }
}


// ------------------------------------------------------------


class Verzeichnisdienst {

   constructor(element) {
      this.services = [];
      this.element = element;
      this.emptyTemplate = `<li>keine Ergebnisse</li>`;
   }

   addService(service) {
      this.services.push(service);
   }

   search(term) {
      this.element.innerHTML = term ? this.render(term) || this.emptyTemplate : '';
   }

   render(term) {
      return this.services.map(service => service.search(term)).join('');
   }

}


// ------------------------------------------------------------


class Verzeichnis {

   constructor(data) {
      this.data = data;
   }

   search(term) {
      return Object.keys(this.data)
         .filter(value => value.startsWith(term))
         .map(key => this.render(key))
         .join('');
   }

   render(key) {
      return `<li><strong>${key}</strong> ${this.data[key]}</li>`;
   }

}
