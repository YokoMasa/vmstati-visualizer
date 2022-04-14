import "core-js/stable";
import "regenerator-runtime/runtime";
import View from "./view";
import Presenter from "./presenter"

window.addEventListener('load', (event) => {
    const presenter = new Presenter();
    new View(document, presenter);
});