// ==UserScript==
// @name         Yandex Music Horizontal Volume Scroll
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  A userscript to bring back the good old horizontal volume slider.
// @author       Snitsky
// @match        *://music.yandex.ru/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=yandex.ru
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const player_section = document.querySelector("section[aria-labelledby='player-region']");
    const volume_button_container = player_section.firstChild.lastChild.lastChild.lastChild;
    const [volume_slider_container, volume_button] = volume_button_container.childNodes;
    const volume_slider = volume_slider_container.querySelector("input[aria-label='Manage volume']");

    volume_button_container.appendChild(volume_slider);
    volume_button_container.removeChild(volume_slider_container);
    volume_button_container.style.maxWidth = "unset";

    volume_slider.style.transform = "unset";
    volume_slider.style.minWidth = "unset";
    volume_slider.style.maxWidth = "7rem";
})();
