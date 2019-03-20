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
app.renderer.autoResize = true;
var width = (window.innerWidth > 900) ? 900 : window.innerWidth
var height = height = width / 2 // window.innerHeight

app.renderer.resize(width, height)
app.renderer.backgroundColor = 0xedfcff;

PIXI.loader
    .add([
        "images/1.jpg",
        "images/bg.jpeg",
        "images/1.json",
        "images/icon.png",
        "images/light.gif",
        "images/s2.png"
    ])
    .on("progress", loadProgressHandler)
    .load(setup);

var puzzles = [], matchs = [];
var gameScene, gameTipsScene, gameOverScene;
function setup() {
    // 創建遊戲場景
    gameScene = new Container();
    app.stage.addChild(gameScene);
    // gameScene.visible = false;
    gameScene.updateLayersOrder = function () {
        gameScene.children.sort(function(a,b) {
            a.zIndex = a.zIndex || 0;
            b.zIndex = b.zIndex || 0;
            return b.zIndex - a.zIndex
        });
    }

    let bg = new Sprite(resources["images/bg.jpeg"].texture)
    let bg_scale = (width/bg.width) 
    bg.scale.set(bg_scale, bg_scale)
    bg.alpha = 0.7
    gameScene.addChild(bg)

    let tips = new Sprite(resources["images/light.gif"].texture)
    tips.x = 15
    tips.y = 15
    tips.scale.set(0.8, 0.8)
    tips.interactive = true; // 設定可以互動
    tips.buttonMode = true; // 當滑鼠滑過時顯示為手指圖示
    tips.on('pointerdown', function(e) {
        state = show_tips
    });
    // tips.click = function(){
    //     state = show_tips
    // }
    gameScene.addChild(tips)
    

    //Create an alias for the texture atlas frame ids
    // console.log(resources["images/1.json"])
    id = resources["images/1.json"].textures;

    for (let index = 0; index < 16; index++) {
        pic = new Sprite(id[ (index+1) + ".jpg"])
        let height_scale = (height/(pic.height*4)) 
        let scale = height_scale * 0.90
        pic.scale.set(scale, scale)
        pic.zIndex = randomInt(-100,-300)
        pic.x = width/5 + randomInt(-width/6, width/6)
        pic.y = height/2 - pic.height/2 + randomInt(-height/3, height/3)

        var dropShadowFilter = new PIXI.filters.DropShadowFilter()
        dropShadowFilter.color = 0x000020;
        dropShadowFilter.alpha = 0.2;
        dropShadowFilter.blur = 3;
        dropShadowFilter.distance = 10;
        pic.filters = [dropShadowFilter]

        puzzles.push(pic)
        gameScene.addChild(pic)

        let rectangle = new Graphics();
        rectangle.lineStyle(3, 0x333333, 1);
        rectangle.beginFill(0xaaaaaa, 0.6);
        rectangle.drawRect(0, 0, pic.width, pic.height);
        rectangle.endFill();

        let x = (index%4) * pic.width
        let y = Math.floor(index/4) * pic.width
        rectangle.x = x + width/2
        rectangle.y = (height - pic.height * 4)/2 + y
        gameScene.addChild(rectangle)
        matchs.push(rectangle)
        
        createDragAndDropFor(pic)
        
    }

    gameScene.updateLayersOrder()


    // 創建結束場景
    gameOverScene = new Container();
    app.stage.addChild(gameOverScene);
    gameOverScene.visible = false;
    
    let sprite = new Sprite(resources["images/s2.png"].texture)
    sprite.position.set(width - width/4, height)
    sprite.anchor.set(0.5, 1)
    sprite.scale.set(0.5, 0.5);
    gameOverScene.addChild(sprite)

    // 創建文字
    let style = new TextStyle({
        fontFamily: "Futura",
        fontSize: 64,
        fill: "black"
    });
    message = new Text("The End!", style);
    message.anchor.set(0.5, 0.5)
    message.x = width/2
    message.y = height/2
    gameOverScene.addChild(message);


    // 創建提示場景
    gameTipsScene = new Container();
    gameTipsScene.width = width
    gameTipsScene.height = height
    app.stage.addChild(gameTipsScene);
    gameTipsScene.visible = false;

    let tip_bg = new Graphics()
    tip_bg.beginFill(0x333333, 0.95)
    tip_bg.drawRect(0, 0, width, height);
    tip_bg.endFill();
    gameTipsScene.addChild(tip_bg)
    tip_bg.interactive = true; // 設定可以互動
    tip_bg.buttonMode = true; // 當滑鼠滑過時顯示為手指圖示
    tip_bg.on('pointerdown', function(e) {
        state = play
        gameTipsScene.visible = false
    })

    let tip_img = new Sprite(resources["images/1.jpg"].texture)
    let height_scale = (height/(tip_img.height)) 
    let scale = height_scale * 0.80
    tip_img.anchor.set(0.5, 0.5)
    tip_img.position.set(width/2, height/2)
    tip_img.scale.set(scale, scale)
    tip_img.filters = [new PIXI.filters.BlurFilter(1, 5, 5, 15)]
    gameTipsScene.addChild(tip_img)

    state = play
    app.ticker.add(delta => gameLoop(delta));
}

function gameLoop(delta) {
    //Runs the current game `state` in a loop and renders the sprites
    state(delta);
}

function play(delta) {
    // 檢查是否 match
    var match_count = 0
    for (let index = 0; index < 16; index++) {
        const puzzle = puzzles[index]
        const match = matchs[index]
        if (checkMatch(puzzles[index], matchs[index])) {
            // match.clear()
            // match.lineStyle(4, 0xFF3300, 0.5);
            // match.beginFill(0x44AADD);
            // match.drawRect(0, 0, pic.width, pic.height);
            // match.endFill();
            match_count += 1
        }else{
            // match.clear()
            // match.lineStyle(4, 0xFF3300, 0.5);
            // match.beginFill(0x66CCFF);
            // match.drawRect(0, 0, pic.width, pic.height);
            // match.endFill();
        }
    }

    if (match_count == 16) {
        state = end
        message.text = "Finished!"
    }
}

function show_tips() {
    gameTipsScene.visible = true
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
            console.log(e.data)
        }
    });
}