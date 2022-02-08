import Phaser, { Data } from "phaser";

const acceleration = 600;
const jumpVelocity = 330;

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");

    this.platform;
    this.player;
    this.coins;
    this.cursors;
    this.score = 0;
    this.scoreText;
    this.jumping = false;
    this.move = {};

    //edger time
    this.wasStanding = false;
    this.edgerTime = 0;

    // touch jump
    this.prevPos = 0;
    this.yPos = 0;
    this.touchJump = false;
    this.touchJumpThreshold = 5; // para evitar falso click
  }

  preload() {
    this.load.setBaseURL("assets/");
    this.load.image("ground", "platform.jpeg");
    this.load.image("hero", "hero.jpeg");
    this.load.image("coin", "coin.jpeg");
  }

  create() {
    this.input.addPointer(1);

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

    // move proprety
    this.move = {
      left: (standing) => {
        this.player.setAccelerationX(
          standing ? -acceleration : -acceleration / 3
        );
      },
      right: (standing) => {
        this.player.setAccelerationX(
          standing ? acceleration : acceleration / 3
        );
      },
    };
  }

  update() {
    const standing =
      this.player.body.blocked.down || this.player.body.touching.down;

    // keyboard movement logic
    if (this.cursors.left.isDown) this.move.left(standing);
    else if (this.cursors.right.isDown) this.move.right(standing);
    else if (
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

    // touch movement logic
    if (this.input.pointer1.isDown || this.input.pointer2.isDown) {
      const leftHalf = this.sys.game.canvas.width / 2;

      if (
        this.input.pointer1.x < leftHalf ||
        this.input.pointer2.x < leftHalf
      ) {
        let myMovePointer = null;

        if (this.input.pointer1.x < leftHalf && this.input.pointer1.isDown)
          myMovePointer = this.input.pointer1;

        if (this.input.pointer2.x < leftHalf && this.input.pointer2.isDown)
          myMovePointer = this.input.pointer2;

        if (myMovePointer) {
          if (Math.floor(myMovePointer.x / (leftHalf / 2)) == 0)
            this.move.left(standing);

          if (Math.floor(myMovePointer.x / (leftHalf / 2)) == 1)
            this.move.right(standing);
        }
      }

      // touch jump logic
      if (
        this.input.pointer1.x > leftHalf ||
        this.input.pointer2.x > leftHalf
      ) {
        let myJumpPointer = null;

        if (this.input.pointer1.x > leftHalf && this.input.pointer1.isDown)
          myJumpPointer = this.input.pointer1;

        if (this.input.pointer2.x > leftHalf && this.input.pointer2.isDown)
          myJumpPointer = this.input.pointer2;

        if (myJumpPointer) {
          //if we have a touch pointer on right hand side of screen...
          this.prevPos = this.yPos;
          this.yPos = myJumpPointer.y;

          if (this.prevPos - this.yPos > this.touchJump) this.touchJump = true;
        }
      }
    }

    // get current time in seconds
    const time = new Date().getTime();

    // if we have just left the ground set edger time for 100ms time
    if (standing && this.wasStanding) {
      this.edgerTime = time + 150;
    }

    if (
      (standing || time <= this.edgerTime) &&
      (this.cursors.space.isDown || this.cursors.up.isDown || this.touchJump) &&
      !this.jumping
    ) {
      this.player.setVelocityY(-jumpVelocity);
      this.jumping = true;
    }

    if (!this.cursors.up.isDown && !this.cursors.space.isDown) {
      if (this.player.body.touching.down) {
        this.jumping = false;
        this.touchJump = false;
        this.prevPos = 0;
      }
    }

    this.wasStanding = standing;
  }
}
