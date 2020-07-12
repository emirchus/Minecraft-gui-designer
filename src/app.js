import "./stylesheets/main.css";

import { remote } from "electron";

const current_view = document.querySelector(".current");
const links = document.querySelectorAll('link[rel="import"]');
const projects = [];
const projectDOM = document.getElementById("projects-content");

window.addEventListener("DOMContentLoaded", () => {
    var projectTest = { "image_canvas": "https://pbs.twimg.com/media/EcLsJtvWoAQcU02?format=jpg", "title": "Proyecto prueba", "description": "Esto es una descripción", "date-creation": new Date().toDateString(), "content": [], } //TODO: Content load all objects in projectTest
    projects.push(projectTest);
})

links.forEach((link) => {
    let template = link.import.querySelector('template');
    let clone = document.importNode(template.content, true);
    let target = template.getAttribute("data-app");
    document.getElementById(`app-${target}`).appendChild(clone);
});

const a_links = document.querySelectorAll("a[redirect]");

a_links.forEach((a) => {
    a.addEventListener("click", (e) => {
        e.preventDefault();
        document.querySelectorAll(".current").forEach(a => a.classList.remove("current"));
        var target = a.getAttribute("redirect");
        document.getElementById(`app-${target}`).classList.add("current");
    })
})

document.getElementById("close-window").addEventListener("click", () => {
    remote.getCurrentWindow().close();
})

document.getElementById("maximize-window").addEventListener("click", () => {
    var win = remote.getCurrentWindow();
    win.isMaximized() ? win.unmaximize() : win.maximize();
})

document.getElementById("minimize-window").addEventListener("click", () => {
    remote.getCurrentWindow().minimize();
})

remote.getCurrentWindow().addListener("maximize", () => {
    document.documentElement.style.setProperty('--border-radius', '0');
})

remote.getCurrentWindow().addListener("unmaximize", () => {
    document.documentElement.style.setProperty('--border-radius', '10px');

})



function readproject(path) {
    return [];
}

