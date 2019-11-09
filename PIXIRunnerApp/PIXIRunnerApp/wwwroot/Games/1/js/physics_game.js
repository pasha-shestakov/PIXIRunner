
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

var player = Bodies.rectangle(30, 750, 50, 70, {
    isStatic: false,
    inertia: Infinity, //Prevent rotation.
    render: {
        fillStyle: "#7a0a85",
        sprite: {
            texture: '/Games/1/images/Pink_Monster_R.png',
            xScale: 2,
            yScale: 2
        }
    }
})

// add bodies
World.add(world, [
    player,
    Bodies.rectangle(0, 800, 2000, 50, { isStatic: true, render: { fillStyle: "#afafaf" }}),
    Bodies.polygon(300, 760, 3, 30, { isStatic: true, angle: 1.5708, render: { fillStyle: "#2d9919"}}),
    Bodies.polygon(500, 760, 3, 30, { isStatic: true, angle: 1.5708, render: { fillStyle: "#2d9919" }}),
    Bodies.polygon(700, 760, 3, 30, { isStatic: true, angle: 1.5708, render: { fillStyle: "#2d9919" }})
]);


//gravity
engine.world.gravity.y = 1;

// fit the render viewport to the scene
/*Render.lookAt(render, {
    min: { x: 0, y: 0 },
    max: { x: 800, y: 600 }
});*/



window.setInterval(updateStats, 100, player);


//user controls A(LEFT), D(RIGHT), {W,SPACE}(JUMP)
var up, down, left, right = false;
var grounded = true;
document.addEventListener('keydown', function (event) {


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
        //applying upward force on player body.
        Body.applyForce(player, { x: player.position.x, y: player.position.y }, { x: 0, y: -0.1 })
        grounded = false; //we are no longer grounded.
    }

    

    if (left) {
        //set our texture to the sprite facing left.
        player.render.sprite.texture = '/Games/1/images/Pink_Monster_L.png';
        Body.translate(player, { x: -10, y: 0 });
    }
    if (right) {
        //set our texture to the sprite facing right.
        player.render.sprite.texture = '/Games/1/images/Pink_Monster_R.png';
        Body.translate(player, { x: 10, y: 0 });
    }

    
});


document.addEventListener('keyup', function (event) {


    if (event.code == 'KeyW' || event.code == "Space") { //UP (i.e. jump)
        up = false;
    }
    if (event.code == 'KeyA') { //LEFT
        left = false;
    }
    if (event.code == 'KeyD') { //RIGHT
        right = false;
    }
});

function updateStats(body) {
    //for debugging physics purposes. Displayed as an overlay on our game panel.
    $("#position").html("Position: " + body.position.x + ", " + body.position.y);
    $("#inertia").html("Inertia: " + body.inertia);
    $("#torque").html("Torque: " + body.torque);
    $("#velocity").html("Velocity: " + body.velocity.x + ", " + body.velocity.y);
    $("#angularSpeed").html("Angular Speed: " + body.angularSpeed);
    $("#angularVelocity").html("Angular Velocity: " + body.angularVelocity);
}