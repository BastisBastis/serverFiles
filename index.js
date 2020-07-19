import Phaser from "phaser";
import Game from "./scenes/game";

console.log('hmm');

const config = {
  type: Phaser.HEADLESS,
  parent: "phaser-example",
  autoFocus: false,
  width: 800,
  height: 500,
  physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: true
        }
    },
  scene: [
    Game
  ]
};

const game = new Phaser.Game(config); 
 
window.gameLoaded(); 
