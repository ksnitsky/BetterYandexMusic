import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import monkey from 'vite-plugin-monkey';

const REPO = 'https://github.com/ksnitsky/BetterYandexMusic';
const RAW = `${REPO}/raw/main/betterym.user.js`;

export default defineConfig({
  plugins: [
    svelte(),
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: 'Better Yandex Music',
        namespace: 'betterym',
        version: '2.0.0',
        description:
          'Возвращает горизонтальный слайдер громкости, порядок кнопок лайк/дизлайк и добавляет настройки с тумблерами.',
        author: 'Snitsky',
        icon: 'https://www.google.com/s2/favicons?sz=64&domain=yandex.ru',
        match: ['*://music.yandex.ru/*'],
        homepageURL: REPO,
        downloadURL: RAW,
        updateURL: RAW,
        grant: 'none',
      },
      build: {
        fileName: 'betterym.user.js',
      },
    }),
  ],
  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false,
  },
});
