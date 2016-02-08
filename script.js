'use strict';

document.addEventListener('DOMContentLoaded', initialize);


// ------------------------------------------------------------


function initialize() {
   const input = document.querySelector('input');
   const list = document.querySelector('ul');
   const files = ['kennzeichen', 'laenderkennzeichen', 'diplomatenkennzeichen'];
   const manager = new DirectoryManager(list);

   Promise
      .all(files.map(file => fetch(`data/${file}.json`)))
      .then(responses => Promise.all(responses.map(response => response.json())))
      .then(jsons => jsons.map(json => manager.addDirectory(new Directory(json))));

   input.addEventListener('keyup', () => manager.render(input.value.trim().toUpperCase()));

   if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('service-worker.js', { scope: '.' });
   }
}


// ------------------------------------------------------------


class DirectoryManager {

   constructor(element) {
      this.element = element;
      this.directories = [];
      this.emptyTemplate = `<li>keine Ergebnisse</li>`;
   }

   addDirectory(directory) {
      this.directories.push(directory);
   }

   render(term) {
      const invoke = (fn) => this.directories.map(directory => directory[fn](term)).join('');
      this.element.innerHTML = invoke('search') || invoke('reverseSearch') || this.emptyTemplate;
   }

}


// ------------------------------------------------------------


class Directory {

   constructor(data) {
      this.data = data;
   }

   search(term) {
      const filter = (key) => key.startsWith(term);
      return this.render(filter);
   }

   reverseSearch(term) {
      const regexp = new RegExp(term, 'i');
      const filter = (key) => this.data[key].match(regexp);
      return this.render(filter);
   }

   render(filter) {
      const template = (key) => `<li><strong>${key}</strong> ${this.data[key]}</li>`;
      return Object.keys(this.data).filter(filter).map(template).join('');
   }

}
