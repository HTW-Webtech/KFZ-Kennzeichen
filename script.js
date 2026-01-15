"use strict";

class DirectoryManager {
    #element;
    #directories = [];
    static #emptyTemplate = "<li>Keine Ergebnisse</li>";

    constructor(element) {
        this.#element = element;
    }

    addDirectory(directory) {
        this.#directories.push(directory);
    }

    render(term) {
        if (!term) {
            this.#element.innerHTML = "";
            return;
        }
        const results = this.#directories.map((d) => d.search(term)).join("");
        const reverseResults = this.#directories
            .map((d) => d.reverseSearch(term))
            .join("");

        this.#element.innerHTML =
            results || reverseResults || DirectoryManager.#emptyTemplate;
    }
}

class Directory {
    #data;

    constructor(data) {
        this.#data = data;
    }

    search(term) {
        return this.#render((key) => key.startsWith(term));
    }

    reverseSearch(term) {
        const regex = new RegExp(term, "i");
        return this.#render((key) => regex.test(this.#data[key]));
    }

    #render(filter) {
        return Object.keys(this.#data)
            .filter(filter)
            .map((key) => `<li><strong>${key}</strong> ${this.#data[key]}</li>`)
            .join("");
    }
}

async function initialize() {
    const input = document.querySelector("input");
    const list = document.querySelector("ul");
    const files = [
        "kennzeichen",
        "laenderkennzeichen",
        "diplomatenkennzeichen",
    ];
    const manager = new DirectoryManager(list);

    try {
        const responses = await Promise.all(
            files.map((file) => fetch(`data/${file}.json`)),
        );
        const jsons = await Promise.all(responses.map((res) => res.json()));
        jsons.forEach((json) => manager.addDirectory(new Directory(json)));
    } catch (error) {
        list.innerHTML = "<li>Fehler beim Laden der Daten</li>";
        console.error("Failed to load data:", error);
    }

    input.addEventListener("input", () => {
        manager.render(input.value.trim().toUpperCase());
    });

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("service-worker.js");
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
} else {
    initialize();
}
