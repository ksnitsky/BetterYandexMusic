// ==UserScript==
// @name         Better Yandex Music
// @namespace    betterym
// @version      1.2.0
// @description  A userscript to bring back the good old horizontal volume slider and position of like/dislike buttons.
// @author       Snitsky
// @match        *://music.yandex.ru/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=yandex.ru
// @homepageURL  https://github.com/ksnitsky/BetterYandexMusic
// @downloadURL  https://raw.githubusercontent.com/ksnitsky/BetterYandexMusic/main/betterym.user.js
// @updateURL    https://raw.githubusercontent.com/ksnitsky/BetterYandexMusic/main/betterym.user.js
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  function initVolumeSlider() {
    const player_section = document.querySelector(
      "section[aria-labelledby='player-region']",
    );
    if (!player_section) {
      console.log("[BETTERYM] Ожидание player_section...");
      return false;
    }

    const volume_button_container =
      player_section.firstChild.lastChild.lastChild.lastChild;
    const [volume_slider_container, volume_button] =
      volume_button_container.childNodes;
    const volume_slider = volume_slider_container.querySelector(
      "input[aria-label='Manage volume']",
    );

    volume_button_container.appendChild(volume_slider);
    volume_button_container.removeChild(volume_slider_container);
    volume_button_container.style.maxWidth = "unset";

    volume_slider.style.transform = "unset";
    volume_slider.style.minWidth = "unset";
    volume_slider.style.maxWidth = "7rem";

    console.log("[BETTERYM] Volume slider инициализирован");
    return true;
  }

  const sliderObserver = new MutationObserver(() => {
    if (initVolumeSlider()) {
      console.log("[BETTERYM] sliderObserver отключён");
      sliderObserver.disconnect();
    }
  });

  sliderObserver.observe(document.body, { childList: true, subtree: true });

  function removeReversedControlsClass() {
    const playerBar = document.querySelector(
      '[class*="PlayerBarDesktopWithBackgroundProgressBar_sonata"]',
    );
    if (!playerBar) {
      console.log(
        "[BETTERYM] Ожидание PlayerBarDesktopWithBackgroundProgressBar_sonata...",
      );
      return false;
    }

    let removedCount = 0;
    playerBar.classList.forEach((className) => {
      if (className.includes("_withReversedControls")) {
        playerBar.classList.remove(className);
        removedCount++;
        console.log("[BETTERYM] Удалён класс:", className);
      }
    });

    if (removedCount > 0) {
      console.log(
        "[BETTERYM] flex-direction исправлен (удалено классов:",
        removedCount + ")",
      );
    }
    return true;
  }

  const controlsObserver = new MutationObserver(() => {
    if (removeReversedControlsClass()) {
      console.log("[BETTERYM] controlsObserver отключён");
      controlsObserver.disconnect();
    }
  });

  controlsObserver.observe(document.body, { childList: true, subtree: true });

  let skipDislikeConfirm = false;

  document.addEventListener(
    "click",
    (e) => {
      const dislikeButton = e.target.closest(
        'button[aria-label="I don\'t like it"]',
      );
      if (dislikeButton) {
        if (!skipDislikeConfirm && !confirm("Вы уверены, что хотите добавить трек в дизлайки?")) {
          e.preventDefault();
          e.stopImmediatePropagation();
          console.log("[BETTERYM] Dislike отменён");
        } else {
          console.log("[BETTERYM] Dislike подтверждён");
        }
      }
    },
    true,
  );

  document.addEventListener("keydown", (e) => {
    if (e.key === "d" || e.key === "D") {
      const dislikeButton = document.querySelector(
        'button[aria-label="I don\'t like it"]',
      );
      if (dislikeButton) {
        if (!confirm("Вы уверены, что хотите добавить трек в дизлайки?")) {
          e.preventDefault();
          e.stopImmediatePropagation();
          console.log("[BETTERYM] Dislike хоткей отменён");
        } else {
          console.log("[BETTERYM] Dislike хоткей подтверждён");
          skipDislikeConfirm = true;
          dislikeButton.click();
          skipDislikeConfirm = false;
        }
      }
    }
  });

  console.log("[BETTERYM] Скрипт запущен, ожидание элементов DOM...");
})();
