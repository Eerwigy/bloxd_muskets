(() => {
  if (gameState.gameStarted) {
    return;
  }

  gameState.players[myId].role = "captain";
  equipUniform(myId);
})();
