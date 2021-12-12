import Phaser from 'phaser';

export default {
  type: Phaser.AUTO,
  parent: 'game',
  transparent: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 }
    }
  },
  scale: {
    width: 800,
    height: 400,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};
