

//needs to be loaded from the DB.
var lives = 3;
var checkpoint = 0;
var character = 3;

var game_width = 2000;
var game_height = 800;

var screenX = 1000;
var screenY = 800;

//game specific globals
var max_velocity = 2;
var num_rocks = 10;
var projectiles = {};
var projectileGravity = false;
//Physics.JS globals
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Composites = Matter.Composites,
    Common = Matter.Common,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Vector = Matter.Vector,
    Events = Matter.Events;
// create engine
var engine = Engine.create(),
    world = engine.world;

// create renderer
var canvas = document.getElementById('gameBody');

var render = Render.create({
    canvas: canvas,
    engine: engine,
    options: {
        width: 1000,
        height: 800,
        showVelocity: false,
        showAngleIndicator: false,
        wireframes: false,
        background: "#000000"
    }
});

Render.run(render);

// create runner
var runner = Runner.create();
Runner.run(runner, engine);

//collision filters
var defaultFilter = 0x0001,
    playerFilter = 0x0002,
    deathFilter = 0x0004,
    powerupFilter = 0x0008,
    player_proj = 0x0010,
    enemy_proj = 0x0020,
    ladderFilter = 0x0040,
    groundFilter = 0x0080;

var init_player_position = { x: 30, y: 740 };
var player = createPlayer();

//for testing
//var throwOrigin = Bodies.circle(500, 400, 5, { isSensor: true, isStatic: true, render: { fillStyle: "#ff0000" } });

if (typeof $ !== 'undefined') {

    // add bodies
    World.add(world, [
        Bodies.rectangle(125, 625, 40, 300, {
            label: "ladder",
            isStatic: true,
            isSensor: true,
            collisionFilter: {
                category: ladderFilter
            },
            render: {
                fillStyle: "#7a0a85",
                sprite: {
                    texture: '/Games/1/images/ladder.png',
                    xScale: 1,
                    yScale: 1
                }
            }
        }),
        Bodies.rectangle(game_width / 2, game_height, game_width, 50, { label: "ground", isStatic: true, render: { fillStyle: "#afafaf" }, collisionFilter: { category: groundFilter } }), //ground
        Bodies.rectangle(0, game_height / 2, 50, game_height, { label: "wall", frictionAir:0,frictionStatic:0,friction: 0, isStatic: true, render: { fillStyle: "#afafaf" } }), //left_wall
        Bodies.rectangle(game_width, game_height / 2, 50, game_height, { label: "wall", frictionAir: 0, frictionStatic: 0, friction:0, isStatic: true, render: { fillStyle: "#afafaf" } }), //right_wall
        Bodies.rectangle(game_width / 2, 0, game_width, 50, { label: "wall", isStatic: true, render: { fillStyle: "#afafaf" } }), //roof
        Bodies.polygon(300, 760, 3, 30, { label: "deathTriangle", isStatic: true, angle: 1.5708, render: { fillStyle: "#2d9919" }, collisionFilter: { category: deathFilter } }), //death triangles{}}), //death triangles
        Bodies.polygon(500, 760, 3, 30, { label: "deathTriangle", isStatic: true, angle: 1.5708, render: { fillStyle: "#2d9919" }, collisionFilter: { category: deathFilter } }), //death triangles
        Bodies.polygon(700, 760, 3, 30, { label: "deathTriangle", isStatic: true, angle: 1.5708, render: { fillStyle: "#2d9919" }, collisionFilter: { category: deathFilter } }), //death triangles
        Bodies.rectangle(65, 550, 80, 50, { label: "ground", isStatic: true, render: { fillStyle: "#2d9919" }, collisionFilter: { category: groundFilter } }),
        Bodies.rectangle(185, 550, 80, 50, { label: "ground", isStatic: true, render: { fillStyle: "#2d9919" }, collisionFilter: { category: groundFilter } }),
        player
    ]);
}



//gravity
engine.world.gravity.y = 1;

//every update frame
Events.on(engine, 'beforeUpdate', function () {
    var gravity = engine.world.gravity;
    //console.log(engine);
    if (!projectileGravity) {
        for (var id in projectiles) {
            var body = projectiles[id];
            Body.applyForce(body, body.position, {
                x: -gravity.x * gravity.scale * body.mass,
                y: -gravity.y * gravity.scale * body.mass
            });
        }
    }
    if (climbing) {
        Body.applyForce(player, player.position, {
            x: -gravity.x * gravity.scale * player.mass,
            y: -gravity.y * gravity.scale * player.mass
        });
    }
    
});

var nearLadder = false;
var climbing = false;
var climbAnimStep = 0;
//every collision event
Events.on(engine, 'collisionStart', function (event) {

    
    var pairs = event.pairs;

    for (var i = 0, j = pairs.length; i != j; ++i) {
        var pair = pairs[i];
        console.log("collisionSTART: (" + pair.bodyA.label + ", " + pair.bodyB.label + ")");
        //player collisions
        if (pair.bodyA.label === "player" || pair.bodyB.label === "player") {
            //mark player as grounded
            if (pair.bodyB.collisionFilter.category === groundFilter || pair.bodyA.collisionFilter.category === groundFilter)
                grounded = true;

            //respawn player when they hit an obstacle.
            if (pair.bodyB.collisionFilter.category === deathFilter || pair.bodyA.collisionFilter.category === deathFilter)
                respawn();
            //near ladder.
            if (pair.bodyB.collisionFilter.category === ladderFilter || pair.bodyA.collisionFilter.category === ladderFilter) {
                console.log("near ladder");
                nearLadder = true;

            }
        }
        if (pair.bodyA.label === "player_proj" || pair.bodyB.label === "player_proj") {

            //destroy projectiles upon hitting ground object
            if (pair.bodyB.collisionFilter.category === groundFilter || pair.bodyB.collisionFilter.category === defaultFilter) {
                removeProjectile(pair.bodyA);
            } else if (pair.bodyA.collisionFilter.category === groundFilter || pair.bodyA.collisionFilter.category === defaultFilter) {
                removeProjectile(pair.bodyB);
            }
        }
    }
});

Events.on(engine, 'collisionEnd', function (event) {
    var pairs = event.pairs;
    
    for (var i = 0, j = pairs.length; i != j; ++i) {
        var pair = pairs[i];
        console.log("collisionEND: (" + pair.bodyA.label + ", " + pair.bodyB.label + ")");
        //player collisions
        if (pair.bodyA.label === "player" || pair.bodyB.label === "player") {

            //we are no longer on the ground.
            if (pair.bodyB.label === 'ground' || pair.bodyA.label === 'ground')
                grounded = false;

            //away from ladder.
            if (pair.bodyB.collisionFilter.category == ladderFilter || pair.bodyA.collisionFilter.category == ladderFilter) {
                nearLadder = false;
                climbing = false;
                climb = false;
                climbAnimStep = 0;
                console.log("away from ladder");
            }
        }
    }
});

// fit the render viewport to the scene

Render.lookAt(render, {
    min: { x: 0, y: 0 },
    max: { x: 1000, y: 800 }
});


//update the overlay with debug information
//window.setInterval(updateStats, 100, player);


//user controls A(LEFT), D(RIGHT), {SPACE}(JUMP)
var up, left, right, climb, down = false;
var upID, leftID, rightID;
var grounded = true;
document.addEventListener('keydown', function (event) {

    console.log("keycommand: " + event.code);
    if (event.code == "Space") { //UP (i.e. jump)
        up = true;
    }

    if (event.code == 'KeyW') { //CLIMB
        climb = true;
    }

    if (event.code == 'KeyA') { //LEFT
        left = true;
    }
    if (event.code == 'KeyD') { //RIGHT
        right = true;
    }

    if (event.code == 'KeyS') { //DOWN
        down = true;
    }


    //we can only jump if we are grounded and not climbing
    if (up && grounded && !climbing) {
        move("up");
    }

    if (left && !climbing && leftID == null) {
        //start movement on another thread until that key is released.
        leftID = setInterval(move, 30, "left");
    }
    if (right && !climbing && rightID == null) {
        rightID = setInterval(move, 30, "right");
    }

    //climbing
    if (nearLadder) {
        if (climb || climbing) {
            player.velocity.x = 0;
            player.velocity.y = 0;
            if (climbAnimStep % 5 == 0) {
                player.render.sprite.texture = '/Games/1/images/climbAnimStep' + Math.floor(climbAnimStep / 5) + '.png';
            }
            climbAnimStep++;
            if (climbAnimStep > 15)
                 climbAnimStep = 0;

            if (climb) {
                climbing = true;
                move("ladderUp");
            } else if (left) {
                move("ladderLeft");
            } else if (right) {
                move("ladderRight");
            } else if (down) {
                move("ladderDown");
            }
        }
        
    }

    
});


document.addEventListener('keyup', function (event) {


    if (event.code == "Space") { //UP (i.e. jump)
        up = false;
    }
    if (event.code == 'KeyA') { //LEFT
        clearInterval(leftID);
        leftID = null;
        left = false;
    }
    if (event.code == 'KeyD') { //RIGHT
        clearInterval(rightID);
        rightID = null;
        right = false;
    }
    if (event.code == 'KeyS') {
        down = false;
    }
    if (event.code == 'KeyW') {
        climb = false;
    }
});

var throwAnim, throwAnimStep = 0;
document.addEventListener("click", function (event) {

    
    var x_1 = event.offsetX;
    var y_1 = event.offsetY;

    var x_2 = player.position.x;
    var y_2 = player.position.y;

    var dir = 'R';
    if (x_1 < x_2)
        dir = 'L';

    var v_1 = Vector.create(x_1, y_1);
    var v_2 = Vector.create(x_2, y_2);
    var throwspeed = 0.0015;
    var rock = Bodies.rectangle(x_2, y_2, 5, 5, {
        label: "player_proj",
        collisionFilter: {
            category: player_proj
        },
        isStatic: false,
        render: {
            //fillStyle: "#7a0a85",
            sprite: {
                texture: '/Games/1/images/Rock.png'
            }
        }
    });
    World.add(world, rock);
    projectiles[rock.id] = rock;
    var angle = Vector.angle(v_1, v_2);
    var v_x = -1 * (Math.cos(angle) * throwspeed);
    var v_y = -1 * (Math.sin(angle) * throwspeed);
    if (throwAnim === undefined)
        throwAnim = setInterval(throwAnimation, 60, dir);
    else {
        clearInterval(throwAnim);
        throwAnim = setInterval(throwAnimation, 60, dir);
    }
    console.log("Throw: " + v_x + ", " + v_y);

    Body.applyForce(rock, { x: rock.position.x, y: rock.position.y }, { x: v_x, y: v_y})
})

function updateStats(body) {
    //for debugging physics purposes. Displayed as an overlay on our game panel.
    $("#position").html("Position: " + body.position.x + ", " + body.position.y);
    $("#inertia").html("Inertia: " + body.inertia);
    $("#torque").html("Torque: " + body.torque);
    $("#velocity").html("Velocity: " + body.velocity.x + ", " + body.velocity.y);
    $("#angularSpeed").html("Angular Speed: " + body.angularSpeed);
    $("#angularVelocity").html("Angular Velocity: " + body.angularVelocity);

    $("#lives").html("Lives: " + lives);
    $("#checkpoint").html("Checkpoint: " + checkpoint);
    $("#character").html("Character: " + character);
}
var screenXMin = 0,
    screenXMax = 1000;
function move(direction_type) {


    if (direction_type == "left") {
        if (screenXMin > 10 && player.position.x - screenXMin < (screenX / 3)) {
            screenXMin -= 10;
            screenXMax -= 10;
        }
        //set our texture to the sprite facing left.
        player.render.sprite.texture = '/Games/1/images/Pink_Monster_L.png';
        if (Math.abs(player.velocity.x) <= max_velocity) {
            if (!grounded)
                Body.applyForce(player, { x: player.position.x, y: player.position.y }, { x: -0.015, y: 0 })
            else
                Body.applyForce(player, { x: player.position.x, y: player.position.y }, { x: -0.02, y: 0 })

        }
    }
    else if (direction_type == "right") {
        if (screenXMax < 2000 && player.position.x - screenXMin > ((2 * screenX) / 3)) {
            screenXMin += 10;
            screenXMax += 10;
        }
        //set our texture to the sprite facing right.
        player.render.sprite.texture = '/Games/1/images/Pink_Monster_R.png';
        if (Math.abs(player.velocity.x) <= max_velocity) {
            if (!grounded)
                Body.applyForce(player, { x: player.position.x, y: player.position.y }, { x: 0.015, y: 0 })
            else
                Body.applyForce(player, { x: player.position.x, y: player.position.y }, { x: 0.02, y: 0 })
        }
    } else if (direction_type == "up") {
        //applying upward force on player body.
        Body.applyForce(player, { x: player.position.x, y: player.position.y }, { x: 0, y: -0.05 });

    } else if (direction_type == "ladderUp") {
        Body.translate(player, { x: 0, y: -5 });
    } else if (direction_type == "ladderDown") {
        Body.translate(player, { x: 0, y: 5 });
    } else if (direction_type == "ladderLeft") {
        Body.translate(player, { x: -5, y: 0 });
    } else if (direction_type == "ladderRight") {
        Body.translate(player, { x: 5, y: 0 });
    }


    Render.lookAt(render, {
        min: { x: screenXMin, y: 0 },
        max: { x: screenXMax, y: screenY }
    });

}

function respawn() {
    Matter.Composite.remove(world, player);
    player = createPlayer();
    World.add(world, player);

    Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: screenX, y: screenY }
    });
    screenXMin = 0;
    screenXMax = 1000;
}

function createPlayer() {
    var player = Bodies.rectangle(50, 730, 20, 70, {
        label: "player",
        isStatic: false,
        inertia: Infinity, //Prevent rotation.
        collisionFilter: {
            mask: groundFilter | deathFilter | powerupFilter | enemy_proj | ladderFilter | defaultFilter
        },
        render: {
            //fillStyle: "#7a0a85",
            sprite: {
                texture: '/Games/1/images/Pink_Monster_R.png',
                xScale: 2.3,
                yScale: 2.3
            }
        }
    })
    return player;
}

//given topleft coords return central coords
function helperCoords(x, y, w, h) {

    var x1 = (x + w) / 2;
    var y1 = (y + h) / 2;
    var w1 = w / 2;
    var h1 = h / 2;

    return {x:x1,y:y1,w:w1,h:h1}

}

function throwAnimation(dir) {
    player.render.sprite.texture = '/Games/1/images/Throw_' + dir + '_' + throwAnimStep + '.png';
    throwAnimStep++;

    if (throwAnimStep > 3) {
        throwAnimStep = 0;
        player.render.sprite.texture = '/Games/1/images/Pink_Monster_' + dir + '.png';
        clearInterval(throwAnim);
    }
}
function removeProjectile(body) {

    delete projectiles[body.id];
    Matter.Composite.remove(world, body);
}