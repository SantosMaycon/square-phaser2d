import Phaser from "phaser";

const acceleration = 600;

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");

    this.platform;
    this.player;
    this.coins;
    this.cursors;
    this.score = 0;
    this.scoreText;
  }

  preload() {
    this.load.setBaseURL("assets/");
    this.load.image("ground", "platform.jpeg");
    this.load.image("hero", "hero.jpeg");
    this.load.image("coin", "coin.jpeg");
  }

  create() {
    this.platform = this.physics.add.staticGroup();

    this.platform.create(400, 400, "ground").setScale(2).refreshBody();
    this.platform.create(50, 240, "ground");
    this.platform.create(750, 140, "ground");

    this.player = this.physics.add.sprite(100, 350, "hero");
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);

    this.player.body.maxVelocity.x = 200;
    this.player.body.maxVelocity.y = 500;

    this.cursors = this.input.keyboard.createCursorKeys();

    this.coins = this.physics.add.group({
      key: "coin",
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 },
    });

    this.coins.children.iterate((coin) => {
      coin.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    this.scoreText = this.add.text(16, 16, "score 0", {
      fontSize: "24px",
      fill: "#fff",
    });

    this.physics.add.collider(this.player, this.platform);
    this.physics.add.collider(this.coins, this.platform);
    this.physics.add.overlap(
      this.player,
      this.coins,
      (player, coin) => {
        coin.disableBody(true, true);
        this.score += 10;
        this.scoreText.setText("Score: " + this.score);
      },
      null,
      this
    );
  }

  update() {
    const standing =
      this.player.body.blocked.down || this.player.body.touching.down;

    if (this.cursors.left.isDown) {
      this.player.setAccelerationX(
        standing ? -acceleration : -acceleration / 2
      );
    } else if (this.cursors.right.isDown) {
      this.player.setAccelerationX(standing ? acceleration : acceleration / 3);
    } else {
      if (
        Math.abs(this.player.body.velocity.x) < 10 &&
        Math.abs(this.player.body.velocity.x) > -10
      ) {
        this.player.setVelocityX(0);
        this.player.setAccelerationX(0);
      } else {
        this.player.setAccelerationX(
          ((this.player.body.velocity.x > 0 ? -1 : 1) * acceleration) / 3
        );
      }
    }

    if (standing && (this.cursors.space.isDown || this.cursors.up.isDown)) {
      this.player.setVelocityY(-330);
    }
  }
}
