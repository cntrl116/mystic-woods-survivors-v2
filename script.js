window.addEventListener('load', () => {
  Game.init();
  Game.loadAssets(() => {
    Game.start();
  });
});
