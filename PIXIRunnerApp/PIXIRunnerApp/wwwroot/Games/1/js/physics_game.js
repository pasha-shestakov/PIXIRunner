

//game specific globals
var max_velocity = 2;
var num_rocks = 10;

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
    Vector = Matter.Vector;
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


var player = Bodies.rectangle(30, 740, 20, 65, {
    isStatic: false,
    inertia: Infinity, //Prevent rotation.
    render: {
        //fillStyle: "#7a0a85",
        sprite: {
            texture: '/Games/1/images/Pink_Monster_R.png',
            xScale: 2.3,
            yScale: 2.3
        }
    }
})

if (typeof $ !== 'undefined') {

    // add bodies
    World.add(world, [
        player,
        Bodies.rectangle(0, 800, 2000, 50, { isStatic: true, render: { fillStyle: "#afafaf" } }),
        Bodies.polygon(300, 760, 3, 30, { isStatic: true, angle: 1.5708, render: { fillStyle: "#2d9919" } }),
        Bodies.polygon(500, 760, 3, 30, { isStatic: true, angle: 1.5708, render: { fillStyle: "#2d9919" } }),
        Bodies.polygon(700, 760, 3, 30, { isStatic: true, angle: 1.5708, render: { fillStyle: "#2d9919" } }),
        Bodies.rectangle(30, 600, 200, 50, { isStatic: true, render: { fillStyle: "#2d9919" } })
    ]);
}



//gravity
engine.world.gravity.y = 1;

// fit the render viewport to the scene
/*Render.lookAt(render, {
    min: { x: 0, y: 0 },
    max: { x: 800, y: 600 }
});*/


//update the overlay with debug information
window.setInterval(updateStats, 100, player);


//user controls A(LEFT), D(RIGHT), {W,SPACE}(JUMP)
var up, left, right = false;
var upID, leftID, rightID;
var grounded = true;
document.addEventListener('keydown', function (event) {

    console.log("keycommand: " + event.code);
    if (event.code == 'KeyW' || event.code == "Space") { //UP (i.e. jump)
        up = true;
    }


    if (event.code == 'KeyA') { //LEFT
        left = true;
    }
    if (event.code == 'KeyD') { //RIGHT
        right = true;
    }

    //if the velocity is within this threshhold, allow a jump to be processed
    if (player.velocity.y <= 0.06 && player.velocity.y >= -0.06)
        grounded = true; //this means the player has come to rest (or near it at least), we mark it as grounded.

    //we can only jump if we are grounded.
    if (up && grounded) {

        move("up");

    }

    if (left && leftID == null) {
        //start movement on another thread until that key is released.
        leftID = setInterval(move, 30, "left");
    }
    if (right && rightID == null) {
        rightID = setInterval(move, 30, "right");
    }

    
});


document.addEventListener('keyup', function (event) {


    if (event.code == 'KeyW' || event.code == "Space") { //UP (i.e. jump)
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
});

document.addEventListener("click", function (event) {
    var x_1 = event.offsetX;
    var y_1 = event.offsetY;

    var x_2 = player.position.x;
    var y_2 = player.position.y - 30;

    var throwspeed = 0.001;
    var rock = Bodies.rectangle(x_2, y_2, 5, 5, {
        isStatic: false,
        render: {
            //fillStyle: "#7a0a85",
            sprite: {
                texture: '/Games/1/images/Rock.png'
            }
        }
    });
    World.add(world, rock);
    var angle = Math.atan2((y_2 - y_1), (x_2 - x_1)) * 180 / Math.PI;
    var v_x = Math.cos(angle) * throwspeed;
    var v_y = Math.sin(angle) * throwspeed;
    console.log(v_x, v_y);
    Body.applyForce(rock, { x: rock.position.x, y: rock.position.y }, { x: v_x, y: v_y })
})

function updateStats(body) {
    //for debugging physics purposes. Displayed as an overlay on our game panel.
    $("#position").html("Position: " + body.position.x + ", " + body.position.y);
    $("#inertia").html("Inertia: " + body.inertia);
    $("#torque").html("Torque: " + body.torque);
    $("#velocity").html("Velocity: " + body.velocity.x + ", " + body.velocity.y);
    $("#angularSpeed").html("Angular Speed: " + body.angularSpeed);
    $("#angularVelocity").html("Angular Velocity: " + body.angularVelocity);
}

function move(direction_type) {
        if (direction_type == "left") {
            //set our texture to the sprite facing left.
            player.render.sprite.texture = '/Games/1/images/Pink_Monster_L.png';
            console.log("going left with velocity: " + Math.abs(player.velocity.x))
            if (Math.abs(player.velocity.x) <= max_velocity) {
                if (!grounded)
                    Body.applyForce(player, { x: player.position.x, y: player.position.y }, { x: -0.015, y: 0 })
                else
                    Body.applyForce(player, { x: player.position.x, y: player.position.y }, { x: -0.02, y: 0 })

            }
            else
                console.log("too fast: " + left);
        }
        else if (direction_type == "right") {
            //set our texture to the sprite facing right.
            player.render.sprite.texture = '/Games/1/images/Pink_Monster_R.png';
            console.log("going right with velocity: " + Math.abs(player.velocity.x))
            if (Math.abs(player.velocity.x) <= max_velocity) {
                if (!grounded)
                    Body.applyForce(player, { x: player.position.x, y: player.position.y }, { x: 0.015, y: 0 })
                else
                    Body.applyForce(player, { x: player.position.x, y: player.position.y }, { x: 0.02, y: 0 })
            }
            else
                console.log("too fast: " + right);
        } else if (direction_type == "up") {
            //applying upward force on player body.

            Body.applyForce(player, { x: player.position.x, y: player.position.y }, { x: 0, y: -0.05 })
            grounded = false; //we are no longer grounded.

            console.log("player.velocity.x: " + player.velocity.x);
        }
    
}