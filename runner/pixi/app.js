//Aliases
let Application = PIXI.Application,
    Container = PIXI.Container,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Graphics = PIXI.Graphics,
    TextureCache = PIXI.utils.TextureCache,
    Sprite = PIXI.Sprite,
    Text = PIXI.Text,
    TextStyle = PIXI.TextStyle,
    Rectangle = PIXI.Rectangle;

//Create a Pixi Application
let app = new Application({
    antialiasing: true,
    transparent: false,
    resolution: 1
});

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

// 全畫面 寬高比 2:1
app.renderer.view.style.position = "absolute"
app.renderer.autoResize = true

let game_width = 1600
let game_height = 800
let gameScale = game_height/game_width
let screenScale = window.innerHeight/window.innerWidth
var width, height, scale;

if (gameScale < screenScale) {
    // 左右撐滿
    scale = (window.innerWidth/game_width)
    width = game_width * scale
    height = game_height * scale
}else{
    // 上下撐滿
    scale = (window.innerHeight/game_height)
    width = game_width * scale
    height = game_height * scale
}

app.renderer.resize(width, height)
app.renderer.backgroundColor = 0xedfcff;

PIXI.loader
    .add([
        "images/bg/bg.png",
        // "images/adventurer/1/run1.json",
        // "images/adventurer/1/idle1.json",
        "images/adventurer/1/walk1.json",
        // "images/adventurer/1/jump1.json",
        // "images/adventurer/1/dead1.json",
        // "images/adventurer/2/run2.json",
        // "images/adventurer/2/idle2.json",
        // "images/adventurer/2/walk2.json",
        // "images/adventurer/2/jump2.json",
        // "images/adventurer/2/dead2.json"
    ])
    .on("progress", loadProgressHandler)
    .load(setup);

var puzzles = [], matchs = [];
var gameScene, gameTipsScene, gameOverScene, bg;
function setup() {
    // 創建遊戲場景
    createGameScene()

    // 創建結束場景
    createGameOverScene()

    // 創建提示場景
    createGameTipScene()

    state = play
    app.ticker.add(delta => gameLoop(delta))
}

function createGameTipScene() {
    // gameTipsScene = new Container();
    // gameTipsScene.width = width
    // gameTipsScene.height = height
    // app.stage.addChild(gameTipsScene);
    // gameTipsScene.visible = false;

    // let tip_bg = new Graphics()
    // tip_bg.beginFill(0x333333, 0.95)
    // tip_bg.drawRect(0, 0, width, height);
    // tip_bg.endFill();
    // gameTipsScene.addChild(tip_bg)
    // tip_bg.interactive = true; // 設定可以互動
    // tip_bg.buttonMode = true; // 當滑鼠滑過時顯示為手指圖示
    // tip_bg.on('pointerdown', function(e) {
    //     state = play
    //     gameTipsScene.visible = false
    // })

    // let tip_img = new Sprite(resources["images/1.jpg"].texture)
    // let height_scale = (height/(tip_img.height)) 
    // let scale = height_scale * 0.80
    // tip_img.anchor.set(0.5, 0.5)
    // tip_img.position.set(width/2, height/2)
    // tip_img.scale.set(scale, scale)
    // tip_img.filters = [new PIXI.filters.BlurFilter(1, 5, 5, 15)]
    // gameTipsScene.addChild(tip_img)
}

function createGameOverScene() {
    // gameOverScene = new Container();
    // app.stage.addChild(gameOverScene);
    // gameOverScene.visible = false;
    
    // let sprite = new Sprite(resources["images/s2.png"].texture)
    // sprite.position.set(width - width/4, height)
    // sprite.anchor.set(0.5, 1)
    // sprite.scale.set(0.5, 0.5);
    // gameOverScene.addChild(sprite)

    // // 創建文字
    // let style = new TextStyle({
    //     fontFamily: "Futura",
    //     fontSize: 64,
    //     fill: "black"
    // });
    // message = new Text("The End!", style);
    // message.anchor.set(0.5, 0.5)
    // message.x = width/2
    // message.y = height/2
    // gameOverScene.addChild(message);
}

function createGameScene() {
    gameScene = new Container();
    app.stage.addChild(gameScene);
    bg = new PIXI.extras.TilingSprite(
        PIXI.Texture.fromImage("images/bg/bg.png"),
        app.screen.width,
        app.screen.height
    )
    bg.tileScale.set(scale)
    gameScene.addChild(bg);

    var role = 1
    var run_frames = []
    var idle_frames = []
    var walk_frames = []
    var jump_frames = []
    var dead_frames = []

    // let actions = ["run", "idle", "walk", "jump", "dead"]
    let actions = ["walk"]
    actions.map(function(value, index, array) {
        let number_of_frames = Object.keys(resources["images/adventurer/" + role + "/" + value + "" + role + ".json"].textures).length
        for (var i = 0; i < number_of_frames; i++) {
            if(value == "run") {
                run_frames.push(PIXI.Texture.fromFrame('run' + role + '_' + (i + 1) + '.png'))
            }else if(value == "idle") {
                idle_frames.push(PIXI.Texture.fromFrame('idle' + role + '_' + (i + 1) + '.png'))
            }else if(value == "walk") {
                walk_frames.push(PIXI.Texture.fromFrame('walk' + role + '_' + (i + 1) + '.png'))
            }else if(value == "jump") {
                jump_frames.push(PIXI.Texture.fromFrame('jump' + role + '_' + (i + 1) + '.png'))
            }else if(value == "dead") {
                dead_frames.push(PIXI.Texture.fromFrame('dead' + role + '_' + (i + 1) + '.png'))
            }
        }
    })

    var anim = new PIXI.extras.AnimatedSprite(walk_frames);
    // anim.scale.set(0.3)
    anim.x = app.screen.width / 2;
    anim.y = app.screen.height-30*scale;
    anim.anchor.set(0.2, 1)
    anim.run = function() {
        this.textures = run_frames
        this.type = "run"
        this.animationSpeed = 0.4
        this.loop = true
        this.play()
    }
    anim.idle = function() {
        this.textures = idle_frames
        this.type = "idle"
        this.animationSpeed = 0.3
        this.loop = true
        this.play()
    }
    anim.turn = function(direction = -1) {
        this.direction = direction
        this.scale.set( Math.abs(this.scale.x) * this.direction, this.scale.y)
        console.log(this.position.x, this.position.y)
    }
    anim.walk = function() {
        this.textures = walk_frames
        this.type = "walk"
        this.animationSpeed = 0.3
        this.loop = true
        this.play()
    }
    anim.jump = function() {
        this.textures = jump_frames
        this.animationSpeed = 0.3
        this.loop = false
        this.play()
    }
    anim.dead = function() {
        this.textures = dead_frames
        this.type = "dead"
        this.animationSpeed = 0.3
        this.loop = false
        this.play()
    }
    anim.speed_up = function() {
        if (this.type == "run") {
            this.animationSpeed = (this.animationSpeed < 1) ? this.animationSpeed + 0.2 : this.animationSpeed
        }
    }
    anim.onComplete = function() {
        if (this.type == "run") {
            this.run()
        }else if(this.type == "walk") {
            this.walk()
        }else if(this.type == "dead"){
            // ...
        }else{
            this.idle()
        }
    }
    anim.walk()
    anim.direction = 1
    gameScene.addChild(anim);


    // var run = new Text("快跑")
    // run.interactive = true
    // run.buttonMode = true
    // run.x = 45
    // run.y = 35
    // run.pointerdown = function(e) {
    //     anim.run()
    // }
    // makeShadowFilter(run)
    // gameScene.addChild(run)

    // var turn = new Text("轉向")
    // turn.interactive = true
    // turn.buttonMode = true
    // turn.x = 45
    // turn.y = 70
    // turn.pointerdown = function(e) {
    //     anim.turn(-1*anim.direction)
    // }
    // makeShadowFilter(turn)
    // gameScene.addChild(turn)

    // var walk = new Text("慢慢走")
    // walk.interactive = true
    // walk.buttonMode = true
    // walk.x = 45
    // walk.y = 105
    // walk.pointerdown = function(e) {
    //     anim.walk()
    // }
    // makeShadowFilter(walk)
    // gameScene.addChild(walk)

    // var idle = new Text("停止")
    // idle.interactive = true
    // idle.buttonMode = true
    // idle.x = 45
    // idle.y = 140
    // idle.pointerdown = function(e) {
    //     anim.idle()
    // }
    // makeShadowFilter(idle)
    // gameScene.addChild(idle)

    // var jump = new Text("跳躍")
    // jump.interactive = true
    // jump.buttonMode = true
    // jump.x = 45
    // jump.y = 175
    // jump.pointerdown = function(e) {
    //     anim.jump()
    // }
    // makeShadowFilter(jump)
    // gameScene.addChild(jump)

    // var dead = new Text("死亡")
    // dead.interactive = true
    // dead.buttonMode = true
    // dead.x = 45
    // dead.y = 210
    // dead.pointerdown = function(e) {
    //     anim.dead()
    // }
    // makeShadowFilter(dead)
    // gameScene.addChild(dead)

    // var speed_up = new Text("快跑加速")
    // speed_up.interactive = true
    // speed_up.buttonMode = true
    // speed_up.x = 45
    // speed_up.y = 245
    // speed_up.pointerdown = function(e) {
    //     anim.speed_up()
    // }
    // makeShadowFilter(speed_up)
    // gameScene.addChild(speed_up)
}

function makeShadowFilter(target) {
    var dropShadowFilter = new PIXI.filters.DropShadowFilter()
    dropShadowFilter.color = 0xffffff
    dropShadowFilter.alpha = 0.9
    dropShadowFilter.blur = 4
    dropShadowFilter.distance = 1
    if (target.filters) {
        target.filters.push(dropShadowFilter)
    }else{
        target.filters = [dropShadowFilter]
    }
}

function gameLoop(delta) {
    //Runs the current game `state` in a loop and renders the sprites
    state(delta);
}

function play(delta) {
    bg.tilePosition.x -= 0.2


    // 檢查是否 match
    // var match_count = 0
    // for (let index = 0; index < 16; index++) {
    //     const puzzle = puzzles[index]
    //     const match = matchs[index]
    //     if (checkMatch(puzzles[index], matchs[index])) {
    //         match_count += 1
    //     }else{
    //     }
    // }

    // if (match_count == 16) {
    //     state = end
    //     message.text = "過關囉!"
    // }
}

function show_tips() {
    // gameTipsScene.visible = true
}

function end() {
    // gameScene.visible = false
    // gameOverScene.visible = true
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

function checkMatch(r1, r2, percent = 0.07) {
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
            let tv = Math.sqrt(Math.pow(combinedHalfWidths, 2) + Math.pow(combinedHalfHeights, 2), 2)
            let v = Math.sqrt(Math.pow(vx, 2) + Math.pow(vy, 2), 2)
            
            if (v/tv < percent) {
                hit = true;
            }else{
                hit = false
            }
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

var drag = false;  

function createDragAndDropFor(target) {
    target.interactive = true;
    // target.on("mousedown", function(e) {
    //     drag = target;
    // });
    // target.on("mouseup", function(e) {
    //     drag = false;
    // });
    // target.on("mousemove", function(e) {
    //     if (drag) {
    //         drag.position.x = e.data.originalEvent.pageX - app.view.offsetLeft - drag.width/2;
    //         drag.position.y = e.data.originalEvent.pageY - app.view.offsetTop - drag.height/2;
    //     }
    // });

    target.on('pointerdown', function (e) {
        drag = target

        // let indexs = gameScene.children.map(function(item, index, array) {
        //     return gameScene.getChildIndex(item)
        // })
        // let max_index = Math.max(...indexs)
        gameScene.setChildIndex(target, gameScene.children.length-1)
    })
    target.on('pointerup', function (e) {
        drag = false
    })
    target.on('pointerupoutside', function (e) {
        drag = false
    })
    target.on('pointermove', function (e) {
        if (drag) {
            // drag.position.x = e.data.originalEvent.pageX - app.view.offsetLeft - drag.width/2;
            // drag.position.y = e.data.originalEvent.pageY - app.view.offsetTop - drag.height/2;

            let x = e.data.originalEvent.pageX ? e.data.originalEvent.pageX : e.data.originalEvent.changedTouches[0].clientX
            let y = e.data.originalEvent.pageY ? e.data.originalEvent.pageY : e.data.originalEvent.changedTouches[0].clientY
            drag.position.x = x - app.view.offsetLeft - drag.width/2;
            drag.position.y = y - app.view.offsetTop - drag.height/2;
            // console.log(e.data)
        }
    });
}