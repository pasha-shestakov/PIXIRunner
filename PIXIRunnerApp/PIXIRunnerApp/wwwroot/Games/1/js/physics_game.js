export class PhysicsGame  {
    constructor() {}
    lives;
    checkpoint;
    character;

    Engine = Matter.Engine;
    Render = Matter.Render;
    Runner = Matter.Runner;
    Composites = Matter.Composites;
    Common = Matter.Common;
    MouseConstraint = Matter.MouseConstraint;
    Mouse = Matter.Mouse;
    World = Matter.World;
    Bodies = Matter.Bodies;
    Body = Matter.Body;
    Vector = Matter.Vector;
    Events = Matter.Events;
    engine;
    world;
    player;
    isPaused;
    max_velocity = 2;
    num_rocks = 10;
    projectiles = [];
    projectileGravity = false;
    grounded;

    onLoad(load) {
        this.lives = load.lives;
        this.checkpoint = load.checkpoint;
        this.character = load.character;
        document.getElementById("lives").innerHTML = load.lives;
    }

    preInit() {
        // create engine
        this.engine = this.Engine.create();
        this.world = this.engine.world;

        // create renderer
        var canvas = document.getElementById('gameBody');

        var render = this.Render.create({
            canvas: canvas,
            engine: this.engine,
            options: {
                width: 1000,
                height: 800,
                showVelocity: false,
                showAngleIndicator: false,
                wireframes: false,
                background: "#000000"
            }
        });

        this.Render.run(render);
    }

    init() {

        //sets focus on gameBody
        $("#gameBody").focus();

        //prevents user from losing focus on gameBody
        $('#gameBody').blur(function (event) {
            setTimeout(function () { $("#gameBody").focus(); }, 20);
        });

        // create runner
        var runner = this.Runner.create();
        this.Runner.run(runner, this.engine);

        this.loadPlayers();
        this.physicsEvents();
       // this.characterControls();
    }

    loadPlayers() {
        //position(x,y)(30, 740) size(w,h)(20,65)
        this.player = this.Bodies.rectangle(30, 740, 20, 65, {
            isStatic: false,
            inertia: Infinity, //Prevent rotation.
            render: {
                sprite: {
                    texture: '/Games/1/images/Pink_Monster_R.png', //start facing right
                    xScale: 2.3,
                    yScale: 2.3
                }
            }
        })

        var throwOrigin = this.Bodies.circle(500, 400, 5, { isSensor: true, isStatic: true, render: { fillStyle: "#ff0000" } }); //for testing
        if (typeof $ !== 'undefined') {

            // add bodies
            this.World.add(this.world, [
                this.player,
                this.Bodies.rectangle(0, 800, 2000, 50, { isStatic: true, render: { fillStyle: "#afafaf" } }),
                this.Bodies.polygon(300, 760, 3, 30, { isStatic: true, angle: 1.5708, render: { fillStyle: "#2d9919" } }),
                this.Bodies.polygon(500, 760, 3, 30, { isStatic: true, angle: 1.5708, render: { fillStyle: "#2d9919" } }),
                this.Bodies.polygon(700, 760, 3, 30, { isStatic: true, angle: 1.5708, render: { fillStyle: "#2d9919" } }),
                this.Bodies.rectangle(30, 600, 200, 50, { isStatic: true, render: { fillStyle: "#2d9919" } }),
                throwOrigin //for testing
            ]);
        }
        this.characterControls(throwOrigin);
    }



    //gravity


    // fit the render viewport to the scene
    /*Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: 800, y: 600 }
    });*/




    physicsEvents() {
        //update the overlay with debug information
        window.setInterval(this.updateStats.bind(this), 100, this.player);
        this.engine.world.gravity.y = 1;
        this.Events.on(this.engine, 'beforeUpdate', function () {
            var gravity = this.engine.world.gravity;
            //console.log(engine);
            if (!this.projectileGravity) {
                this.projectiles.forEach((body, index) => {
                    this.Body.applyForce(body, body.position, {
                        x: -gravity.x * gravity.scale * body.mass,
                        y: -gravity.y * gravity.scale * body.mass
                    });
                })
            }
        }.bind(this));
    }

    characterControls(throwOrigin) {
        //user controls A(LEFT), D(RIGHT), {W,SPACE}(JUMP)
        var up, left, right, inv_open = false;
        var upID, leftID, rightID;
        this.grounded = true;
        document.addEventListener('keydown', function (event) {
            //console.log("keycommand: " + event.code); //debugging
            //open/close inventory and pause/unpause game.
            if (event.code == 'Tab') {
                event.preventDefault()
                if (!inv_open) {
                    inv_open = true;
                    pause_game();
                } else if (inv_open) {
                    inv_open = false;
                    unpause_game();
                }

            }

            //only fire events if the game is unpaused.
            if (!this.isPaused) {
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
                if (this.player.velocity.y <= 0.06 && this.player.velocity.y >= -0.06)
                    this.grounded = true; //this means the player has come to rest (or near it at least), we mark it as grounded.
                //we can only jump if we are grounded.
                if (up && this.grounded) {
                    this.move("up");
                }
                if (left && leftID == null) {
                    //start movement on another thread until that key is released.
                    leftID = setInterval(this.move.bind(this), 30, "left");
                }
                if (right && rightID == null) {
                    rightID = setInterval(this.move.bind(this), 30, "right");
                }
            }

        }.bind(this));

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
            //only allow throwing if game is unpaused.
            if (!this.isPaused) {
                var x_1 = event.offsetX;
                var y_1 = event.offsetY;

                var x_2 = throwOrigin.position.x;
                var y_2 = throwOrigin.position.y;

                var v_1 = this.Vector.create(x_1, y_1);
                var v_2 = this.Vector.create(x_2, y_2);
                var throwspeed = 0.001;
                var rock = this.Bodies.rectangle(x_2, y_2, 5, 5, {
                    isStatic: false,
                    render: {
                        //fillStyle: "#7a0a85",
                        sprite: {
                            texture: '/Games/1/images/Rock.png'
                        }
                    }
                });
                this.World.add(world, rock);
                this.projectiles.push(rock);
                var angle = Vector.angle(v_1, v_2);
                var v_x = -1 * (Math.cos(angle) * throwspeed);
                var v_y = -1 * (Math.sin(angle) * throwspeed);
                console.log("Throw: " + v_x + ", " + v_y);
                this.Body.applyForce(rock, { x: rock.position.x, y: rock.position.y }, { x: v_x, y: v_y })
            }

        }.bind(this))
    }
    updateStats(body) {
        //for debugging physics purposes. Displayed as an overlay on our game panel.
        $("#position").html("Position: " + body.position.x + ", " + body.position.y);
        $("#inertia").html("Inertia: " + body.inertia);
        $("#torque").html("Torque: " + body.torque);
        $("#velocity").html("Velocity: " + body.velocity.x + ", " + body.velocity.y);
        $("#angularSpeed").html("Angular Speed: " + body.angularSpeed);
        $("#angularVelocity").html("Angular Velocity: " + body.angularVelocity);

        $("#lives").html("Lives: " + this.lives);
        $("#checkpoint").html("Checkpoint: " + this.checkpoint);
        $("#character").html("Character: " + this.character);
    }

    move(direction_type) {
            if (direction_type == "left") {
                //set our texture to the sprite facing left.
                this.player.render.sprite.texture = '/Games/1/images/Pink_Monster_L.png';
                //console.log("going left with velocity: " + Math.abs(player.velocity.x))
                if (Math.abs(this.player.velocity.x) <= this.max_velocity) {
                    if (!this.grounded)
                        this.Body.applyForce(this.player, { x: this.player.position.x, y: this.player.position.y }, { x: -0.015, y: 0 })
                    else
                        this.Body.applyForce(this.player, { x: this.player.position.x, y: this.player.position.y }, { x: -0.02, y: 0 })

                }
            }
            else if (direction_type == "right") {
                //set our texture to the sprite facing right.
                this.player.render.sprite.texture = '/Games/1/images/Pink_Monster_R.png';
                //console.log("going right with velocity: " + Math.abs(player.velocity.x))
                if (Math.abs(this.player.velocity.x) <= this.max_velocity) {
                    if (!this.grounded)
                        this.Body.applyForce(this.player, { x: this.player.position.x, y: this.player.position.y }, { x: 0.015, y: 0 })
                    else
                        this.Body.applyForce(this.player, { x: this.player.position.x, y: this.player.position.y }, { x: 0.02, y: 0 })
                }
            } else if (direction_type == "up") {
                //applying upward force on player body.

                this.Body.applyForce(this.player, { x: this.player.position.x, y: this.player.position.y }, { x: 0, y: -0.05 })
                this.grounded = false; //we are no longer grounded.

                //console.log("player.velocity.x: " + player.velocity.x);
            }
    
    }

    pause_game() {
        this.isPaused = true;
        this.projectiles.forEach((body, index) => {
            body.isStatic = true;
        })
        this.player.isStatic = true;
    }

     unpause_game() {
        this.isPaused = false;
        this.projectiles.forEach((body, index) => {
            body.isStatic = false;
        })
        this.player.isStatic = false;
    }

}
