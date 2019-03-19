//Aliases
let Application = PIXI.Application,
    Container = PIXI.Container,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Graphics = PIXI.Graphics,
    TextureCache = PIXI.utils.TextureCache,
    Sprite = PIXI.Sprite,
    Text = PIXI.Text,
    TextStyle = PIXI.TextStyle;

//Create a Pixi Application
let app = new Application({
    width: 512,
    height: 512,
    antialiasing: true,
    transparent: false,
    resolution: 1
});

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

PIXI.loader
    .add([
        "images/treasureHunter.json"
    ])
    .on("progress", loadProgressHandler)
    .load(setup);

let explorer, treasure, blobs, door, message;
function setup() {
    //Initialize the game sprites, set the game `state` to `play`
    //and start the 'gameLoop'
    let stage = app.stage

    // 創建遊戲場景
    gameScene = new Container();
    app.stage.addChild(gameScene);
    // gameScene.visible = false;

    //Create an alias for the texture atlas frame ids
    id = resources["images/treasureHunter.json"].textures;

    // 地牢
    dungeon = new Sprite(id["dungeon.png"]);
    gameScene.addChild(dungeon);

    // 門
    door = new Sprite(id["door.png"])
    gameScene.addChild(door)

    // 冒險者
    explorer = new Sprite(id["explorer.png"])
    explorer.x = 68
    explorer.y = gameScene.height / 2 - explorer.height / 2
    explorer.vx = 0
    explorer.vy = 0
    gameScene.addChild(explorer)

    //Capture the keyboard arrow keys
    let left = keyboard(37),
        up = keyboard(38),
        right = keyboard(39),
        down = keyboard(40);

    //Left arrow key `press` method
    left.press = () => {
        //Change the cat's velocity when the key is pressed
        explorer.vx = -5;
        explorer.vy = 0;
    };

    //Left arrow key `release` method
    left.release = () => {
        //If the left arrow has been released, and the right arrow isn't down,
        //and the explorer isn't moving vertically:
        //Stop the explorer
        if (!right.isDown && explorer.vy === 0) {
            explorer.vx = 0;
        }
    };

    //Up
    up.press = () => {
        explorer.vy = -5;
        explorer.vx = 0;
    };
    up.release = () => {
        if (!down.isDown && explorer.vx === 0) {
            explorer.vy = 0;
        }
    };

    //Right
    right.press = () => {
        explorer.vx = 5;
        explorer.vy = 0;
    };
    right.release = () => {
        if (!left.isDown && explorer.vy === 0) {
            explorer.vx = 0;
        }
    };

    //Down
    down.press = () => {
        explorer.vy = 5;
        explorer.vx = 0;
    };
    down.release = () => {
        if (!up.isDown && explorer.vx === 0) {
            explorer.vy = 0;
        }
    };


    // 寶物
    treasure = new Sprite(id["treasure.png"])
    treasure.x = gameScene.width - treasure.width - 48
    treasure.y = gameScene.height / 2 - treasure.height / 2
    gameScene.addChild(treasure)

    // 怪物
    let numberOfBlobs = 6,
        spacing = 48,
        xOffset = 150,
        speed = 2,
        direction = 1;

    //An array to store all the blob monsters
    blobs = [];
    for (let index = 0; index < numberOfBlobs; index++) {
        let blob = new Sprite(id["blob.png"])
        let x = spacing * index + xOffset
        let y = randomInt(0, stage.height - blob.height)
        blob.position.set(x, y)
        blob.vy = speed * direction
        direction *= -1 // Reverse the direction for the next blob
        blobs.push(blob)
        gameScene.addChild(blob)
    }

    // 製作血條
    //Create the health bar
    healthBar = new PIXI.DisplayObjectContainer();
    healthBar.position.set(stage.width - 170, 4)
    gameScene.addChild(healthBar);

    //Create the black background rectangle
    let innerBar = new PIXI.Graphics();
    innerBar.beginFill(0x000000);
    innerBar.drawRect(0, 0, 128, 8);
    innerBar.endFill();
    healthBar.addChild(innerBar);

    //Create the front red rectangle
    let outerBar = new PIXI.Graphics();
    outerBar.beginFill(0xFF3300);
    outerBar.drawRect(0, 0, 128, 8);
    outerBar.endFill();
    healthBar.addChild(outerBar);

    healthBar.outer = outerBar;

    // 創建結束場景
    gameOverScene = new Container();
    app.stage.addChild(gameOverScene);
    gameOverScene.visible = false;

    // 創建文字
    let style = new TextStyle({
        fontFamily: "Futura",
        fontSize: 64,
        fill: "white"
    });
    message = new Text("The End!", style);
    message.x = 120;
    message.y = app.stage.height / 2 - 32;
    gameOverScene.addChild(message);

    state = play
    app.ticker.add(delta => gameLoop(delta));
}

function gameLoop(delta) {
    //Runs the current game `state` in a loop and renders the sprites
    state(delta);
}

function play(delta) {
    // 在監獄內移動探險者
    let explorerHitsWall = contain(explorer, { x: 8, y: 10, width: 488, height: 480 });
    if (!explorerHitsWall) {
        explorer.x += explorer.vx;
        explorer.y += explorer.vy;
    }

    // 移動怪物 & 檢查碰撞
    blobs.forEach(function (blob) {
        //Move the blob
        blob.y += blob.vy;
        //Check the blob's screen boundaries
        let blobHitsWall = contain(blob, { x: 28, y: 10, width: 488, height: 480 });
        //If the blob hits the top or bottom of the stage, reverse
        //its direction
        if (blobHitsWall === "top" || blobHitsWall === "bottom") {
            blob.vy *= -1;
        }
        var explorerHit = false
        //Test for a collision. If any of the enemies are touching
        //the explorer, set `explorerHit` to `true`
        if (hitTestRectangle(explorer, blob)) {
            explorerHit = true;
        }

        if (explorerHit) {
            //Make the explorer semi-transparent
            explorer.alpha = 0.5;
            //Reduce the width of the health bar's inner rectangle by 1 pixel
            healthBar.outer.width -= 3;
        } else {
            //Make the explorer fully opaque (non-transparent) if it hasn't been hit
            explorer.alpha = 1;
        }
    });

    // 檢查冒險者是否取得寶物
    if (hitTestRectangle(explorer, treasure)) {
        treasure.position.x = explorer.position.x + 5
        treasure.position.y = explorer.position.y + 5
    }

    // 檢查寶物是否到達門口
    if (hitTestRectangle(treasure, door)) {
        state = end;
        message.text = "You won!";
    }

    // 檢查是否死亡
    if (healthBar.outer.width <= 0) {
        state = end;
        message.text = "You lost!";
    }
}

function end() {
    gameScene.visible = false
    gameOverScene.visible = true
}

function loadProgressHandler(loader, resource) {
    //Display the file `url` currently being loaded
    console.log("loading: " + resource.url);

    //Display the percentage of files currently loaded
    console.log("progress: " + loader.progress + "%");

    //If you gave your files names as the first argument
    //of the `add` method, you can access them like this
    //console.log("loading: " + resource.name);
}

// 檢查碰撞
function contain(sprite, container) {

    let collision = undefined;
    //Left
    if (sprite.x < container.x) {
        sprite.x = container.x;
        collision = "left";
    }

    //Top
    if (sprite.y < container.y) {
        sprite.y = container.y;
        collision = "top";
    }

    //Right
    if (sprite.x + sprite.width > container.width) {
        sprite.x = container.width - sprite.width;
        collision = "right";
    }

    //Bottom
    if (sprite.y + sprite.height > container.height) {
        sprite.y = container.height - sprite.height;
        collision = "bottom";
    }

    //Return the `collision` value
    return collision;
}

// 兩個物體碰撞檢查
function hitTestRectangle(r1, r2) {

    //Define the variables we'll need to calculate
    let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

    //hit will determine whether there's a collision
    hit = false;

    //Find the center points of each sprite
    r1.centerX = r1.x + r1.width / 2;
    r1.centerY = r1.y + r1.height / 2;
    r2.centerX = r2.x + r2.width / 2;
    r2.centerY = r2.y + r2.height / 2;

    //Find the half-widths and half-heights of each sprite
    r1.halfWidth = r1.width / 2;
    r1.halfHeight = r1.height / 2;
    r2.halfWidth = r2.width / 2;
    r2.halfHeight = r2.height / 2;

    //Calculate the distance vector between the sprites
    vx = r1.centerX - r2.centerX;
    vy = r1.centerY - r2.centerY;

    //Figure out the combined half-widths and half-heights
    combinedHalfWidths = r1.halfWidth + r2.halfWidth;
    combinedHalfHeights = r1.halfHeight + r2.halfHeight;

    //Check for a collision on the x axis
    if (Math.abs(vx) < combinedHalfWidths) {

        //A collision might be occuring. Check for a collision on the y axis
        if (Math.abs(vy) < combinedHalfHeights) {

            //There's definitely a collision happening
            hit = true;
        } else {

            //There's no collision on the y axis
            hit = false;
        }
    } else {

        //There's no collision on the x axis
        hit = false;
    }

    //`hit` will be either `true` or `false`
    return hit;
};

function keyboard(keyCode) {
    let key = {};
    key.code = keyCode;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    //The `downHandler`
    key.downHandler = event => {
        if (event.keyCode === key.code) {
            if (key.isUp && key.press) key.press();
            key.isDown = true;
            key.isUp = false;
        }
        event.preventDefault();
    };

    //The `upHandler`
    key.upHandler = event => {
        if (event.keyCode === key.code) {
            if (key.isDown && key.release) key.release();
            key.isDown = false;
            key.isUp = true;
        }
        event.preventDefault();
    };

    //Attach event listeners
    window.addEventListener(
        "keydown", key.downHandler.bind(key), false
    );
    window.addEventListener(
        "keyup", key.upHandler.bind(key), false
    );
    return key;
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}