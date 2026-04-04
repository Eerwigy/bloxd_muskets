(() => {
  if (gameState.gameStarted) {
    return;
  }

  gameState.players[myId].role = "dragoon";
  equipUniform(myId);
})();
