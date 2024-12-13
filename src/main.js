import kaplay from "kaplay";
import { makeBackGround } from "./utils";
import { SCALE_FACTOR } from "./const";
import { makePlayer } from "./player";

const k = kaplay({
  width: 1280,
  height: 720,
  letterbox: true,
  global: false,
  scale: 2,
});

// load all the assets
k.loadSprite("kriby", "./kriby.png");
k.loadSprite("obstacles", "./obstacles.png");
k.loadSprite("background", "./background.png");
k.loadSprite("clouds", "./clouds.png");
k.loadSound("jump", "./jump.wav");
k.loadSound("hurt", "./hurt.wav");
k.loadSound("confirm", "./confirm.wav");

// load the assest's
k.scene("start", async () => {
  // set a bg theme here
  makeBackGround(k);

  //   set the bg img
  const map = k.add([
    k.sprite("background"),
    k.pos(0, 0),
    k.scale(SCALE_FACTOR),
  ]);
  // set clouds
  const clouds = map.add([k.sprite("clouds"), k.pos(), { speed: 5 }]);
  clouds.onUpdate(() => {
    clouds.move(clouds.speed, 0);
    if (clouds.pos.x > 700) {
      clouds.pos.x = -20;
    }
  });

  //    set obstacles
  map.add([k.sprite("obstacles"), k.pos()]);

  //   set player here
  const player = k.add(makePlayer(k));
  player.pos = k.vec2(k.center().x - 350, k.center().y + 56);

  //   menu code
  const playBtn = k.add([
    k.rect(200, 50, { radius: 3 }),
    k.color(k.Color.fromHex("#14638e")),
    k.area(),
    k.anchor("center"),
    k.pos(k.center().x + 30, k.center().y + 60),
  ]);

  playBtn.add([
    k.text("Play", { size: 24 }),
    k.color(k.Color.fromHex("#d7f2f7")),
    k.area(),
    k.anchor("center"),
  ]);

  const goToGame = () => {
    k.play("confirm");
    k.go("main");
  };

  playBtn.onClick(goToGame);

  k.onKeyPress("space", goToGame);

  k.onGamepadButtonPress("south", goToGame);
});

// game logic here
k.scene("main", async () => {
  // set a bg theme here
  makeBackGround(k);

  //   set the bg img
  const map = k.add([
    k.sprite("background"),
    k.pos(0, 0),
    k.scale(SCALE_FACTOR),
  ]);
  // set clouds
  const clouds = map.add([k.sprite("clouds"), k.pos(), { speed: 5 }]);
  clouds.onUpdate(() => {
    clouds.move(clouds.speed, 0);
    if (clouds.pos.x > 700) {
      clouds.pos.x = -20;
    }
  });

  //   set player here
  const player = k.add(makePlayer(k));
  player.pos = k.vec2(20, 290);

  //    set obstacles
  //   here are the logic of moving platform
  const platforms = map.add([
    k.sprite("obstacles"),
    k.pos(),
    k.area(),
    { speed: 50 },
  ]);

  platforms.onUpdate(() => {
    platforms.move(-platforms.speed, 0);
    if (platforms.pos.x < -490) {
      platforms.pos.x = 300; // put the platforms far back so it scrolls again through the level
      platforms.speed += 10; // progressively increase speed
    }
  });

  //   game logic start here

  let score = 0;
  const colliderData = await (await fetch("./collidersData.json")).json();
  const collidersData = colliderData.data;

  k.setGravity(2500);

  //   collide logic here
  for (const collider of collidersData) {
    platforms.add([
      k.area({
        shape: new k.Rect(k.vec2(0), collider.width, collider.height),
      }),
      k.body({ isStatic: true }),
      k.pos(collider.x, collider.y),
      "obstacle",
    ]);
  }

  k.add([k.rect(k.width(), 50), k.pos(0, -100), k.area(), "obstacle"]);

  k.add([k.rect(k.width(), 50), k.pos(0, 1000), k.area(), "obstacle"]);

  player.setControls();
  player.onCollide("obstacle", async () => {
    if (player.isDead) return;
    k.play("hurt");
    platforms.speed = 0;
    player.disableControls();
    // k.add(await makeScoreBox(k, k.center(), score));
    player.isDead = true;
    k.go("start");
  });
});

k.go("start");
