const { join } = require('path');



const skeleton = require('@skeletonlabs/tw-plugin').skeleton;

module.exports = {
  // Указываем, что темная тема будет управляться классом
  darkMode: 'class',
  content: [
    './src/**/*.{html,js,svelte,ts}',
    // Добавляем путь к пакету Skeleton
    join(require.resolve('@skeletonlabs/skeleton'), '../**/*.{html,js,svelte,ts}')
  ],
  theme: {
    extend: {},
  },
  plugins: [
    // Добавляем плагин Skeleton после других плагинов
    skeleton({
      themes: { preset: [ "skeleton", "wintry", "modern" ] }
    })
  ]
}
