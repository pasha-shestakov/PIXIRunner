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
    render;
    player;
    isPaused;
    max_velocity = 2;
    num_rocks = 10;
    projectiles = {};
    projectileGravity = false;
    grounded = true;
    inv_open = false;
    throwAnim;
    throwAnimStep = 0;

    //collision filters
    defaultFilter = 0x0001;
    playerFilter = 0x0002;
    deathFilter = 0x0004;
    powerupFilter = 0x0008;
    player_proj = 0x0010;
    enemy_proj = 0x0020;
    ladderFilter = 0x0040;
    groundFilter = 0x0080;

    nearLadder = false;
    climbing = false;
    climbAnimStep = 0;

    game_width = 2000;
    game_height = 800;

    screenX = 1000;
    screenY = 800;

    screenXMin = 0;
    screenXMax = 1000;

    

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
        this.engine.world.gravity.y = 1;
        // create renderer
        var canvas = document.getElementById('gameBody');

        this.render = this.Render.create({
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

        this.Render.run(this.render);

        // fit the render viewport to the scene
        this.Render.lookAt(this.render, {
            min: { x: 0, y: 0 },
            max: { x: 1000, y: 800 }
        });
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
        this.createWorld();
        this.physicsEvents();
    }

    loadPlayers() {
        this.player = this.createPlayer();
        this.characterControls();
    }


    createWorld() {
        // add bodies
        this.World.add(this.world, [
            this.Bodies.rectangle(125, 625, 40, 300, {
                label: "ladder",
                isStatic: true,
                isSensor: true,
                collisionFilter: {
                    category: this.ladderFilter
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
            this.Bodies.rectangle(this.game_width / 2, this.game_height, this.game_width, 50, { label: "ground", isStatic: true, render: { fillStyle: "#afafaf" }, collisionFilter: { category: this.groundFilter } }), //ground
            this.Bodies.rectangle(0, this.game_height / 2, 50, this.game_height, { label: "wall", frictionAir: 0, frictionStatic: 0, friction: 0, isStatic: true, render: { fillStyle: "#afafaf" } }), //left_wall
            this.Bodies.rectangle(this.game_width, this.game_height / 2, 50, this.game_height, { label: "wall", frictionAir: 0, frictionStatic: 0, friction: 0, isStatic: true, render: { fillStyle: "#afafaf" } }), //right_wall
            this.Bodies.rectangle(this.game_width / 2, 0, this.game_width, 50, { label: "wall", isStatic: true, render: { fillStyle: "#afafaf" } }), //roof
            this.Bodies.polygon(300, 760, 3, 30, { label: "deathTriangle", isStatic: true, angle: 1.5708, render: { fillStyle: "#2d9919" }, collisionFilter: { category: this.deathFilter } }), //death triangles{}}), //death triangles
            this.Bodies.polygon(500, 760, 3, 30, { label: "deathTriangle", isStatic: true, angle: 1.5708, render: { fillStyle: "#2d9919" }, collisionFilter: { category: this.deathFilter } }), //death triangles
            this.Bodies.polygon(700, 760, 3, 30, { label: "deathTriangle", isStatic: true, angle: 1.5708, render: { fillStyle: "#2d9919" }, collisionFilter: { category: this.deathFilter } }), //death triangles
            this.Bodies.rectangle(65, 550, 80, 50, { label: "ground", isStatic: true, render: { fillStyle: "#2d9919" }, collisionFilter: { category: this.groundFilter } }),
            this.Bodies.rectangle(185, 550, 80, 50, { label: "ground", isStatic: true, render: { fillStyle: "#2d9919" }, collisionFilter: { category: this.groundFilter } }),
            this.player
        ]);
    }

    physicsEvents() {
        //update the overlay with debug information
        window.setInterval(this.updateStats.bind(this), 100, this.player);

        this.engine.world.gravity.y = 1;
        this.Events.on(this.engine, 'beforeUpdate', function () {
            var gravity = this.engine.world.gravity;
            //console.log(engine);
            if (!this.projectileGravity) {
                for (var id in this.projectiles) {
                    var body = this.projectiles[id];
                    this.Body.applyForce(body, body.position, {
                        x: -gravity.x * gravity.scale * body.mass,
                        y: -gravity.y * gravity.scale * body.mass
                    });
                }
            }
        }.bind(this));


        //every collision event
        this.Events.on(this.engine, 'collisionStart', function (event) {


            var pairs = event.pairs;

            for (var i = 0, j = pairs.length; i != j; ++i) {
                var pair = pairs[i];
                console.log("collisionSTART: (" + pair.bodyA.label + ", " + pair.bodyB.label + ")");
                //player collisions
                if (pair.bodyA.label === "player" || pair.bodyB.label === "player") {
                    //mark player as grounded
                    if (pair.bodyB.collisionFilter.category === this.groundFilter || pair.bodyA.collisionFilter.category === this.groundFilter)
                        this.grounded = true;

                    //respawn player when they hit an obstacle.
                    if (pair.bodyB.collisionFilter.category === this.deathFilter || pair.bodyA.collisionFilter.category === this.deathFilter)
                        this.respawn();
                    //near ladder.
                    if (pair.bodyB.collisionFilter.category === this.ladderFilter || pair.bodyA.collisionFilter.category === this.ladderFilter) {
                        console.log("near ladder");
                        this.nearLadder = true;

                    }
                }
                if (pair.bodyA.label === "player_proj" || pair.bodyB.label === "player_proj") {

                    //destroy projectiles upon hitting ground object
                    if (pair.bodyB.collisionFilter.category === this.groundFilter || pair.bodyB.collisionFilter.category === this.defaultFilter) {
                        this.removeProjectile(pair.bodyA);
                    } else if (pair.bodyA.collisionFilter.category === this.groundFilter || pair.bodyA.collisionFilter.category === this.defaultFilter) {
                        this.removeProjectile(pair.bodyB);
                    }
                }
            }
        }.bind(this));

        this.Events.on(this.engine, 'collisionEnd', function (event) {
            var pairs = event.pairs;

            for (var i = 0, j = pairs.length; i != j; ++i) {
                var pair = pairs[i];
                console.log("collisionEND: (" + pair.bodyA.label + ", " + pair.bodyB.label + ")");
                //player collisions
                if (pair.bodyA.label === "player" || pair.bodyB.label === "player") {

                    //we are no longer on the ground.
                    if (pair.bodyB.label === 'ground' || pair.bodyA.label === 'ground')
                        this.grounded = false;

                    //away from ladder.
                    if (pair.bodyB.collisionFilter.category == this.ladderFilter || pair.bodyA.collisionFilter.category == this.ladderFilter) {
                        this.nearLadder = false;
                        this.climbing = false;
                        this.climb = false;
                        this.climbAnimStep = 0;
                        console.log("away from ladder");
                    }
                }
            }
        }.bind(this));
    }

    characterControls() {
        //user controls A(LEFT), D(RIGHT), {SPACE}(JUMP)
        var up, left, right, climb, down = false;
        var leftID, rightID;

        document.addEventListener('keydown', function (event) {
            //console.log("keycommand: " + event.code); //debugging
            //open/close inventory and pause/unpause game.
            if (event.code == 'Tab') {
                event.preventDefault();
                if (!this.inv_open) {
                    this.inv_open = true;
                    this.pause_game();
                } else if (this.inv_open) {
                    this.inv_open = false;
                    this.unpause_game();
                }
            }

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
            if (up && this.grounded && !this.climbing) {
                move("up");
            }

            if (left && !this.climbing && leftID == null) {
                //start movement on another thread until that key is released.
                leftID = setInterval(this.move, 30, "left");
            }
            if (right && !this.climbing && rightID == null) {
                rightID = setInterval(this.move, 30, "right");
            }

            //climbing
            if (this.nearLadder) {
                if (climb || this.climbing) {
                    this.player.velocity.x = 0;
                    this.player.velocity.y = 0;
                    if (this.climbAnimStep % 5 == 0) {
                        this.player.render.sprite.texture = '/Games/1/images/climbAnimStep' + Math.floor(this.climbAnimStep / 5) + '.png';
                    }
                    this.climbAnimStep++;
                    if (this.climbAnimStep > 15)
                        this.climbAnimStep = 0;

                    if (climb) {
                        this.climbing = true;
                        this.move("ladderUp");
                    } else if (left) {
                        this.move("ladderLeft");
                    } else if (right) {
                        this.move("ladderRight");
                    } else if (down) {
                        this.move("ladderDown");
                    }
                }

            }


        }.bind(this));


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
        }.bind(this));

        
        document.addEventListener("click", function (event) {


            var x_1 = event.offsetX;
            var y_1 = event.offsetY;

            var x_2 = this.player.position.x;
            var y_2 = this.player.position.y;

            var dir = 'R';
            if (x_1 < x_2)
                dir = 'L';

            var v_1 = this.Vector.create(x_1, y_1);
            var v_2 = this.Vector.create(x_2, y_2);
            var throwspeed = 0.0015;
            var rock = this.Bodies.rectangle(x_2, y_2, 5, 5, {
                label: "player_proj",
                collisionFilter: {
                    category: this.player_proj
                },
                isStatic: false,
                render: {
                    //fillStyle: "#7a0a85",
                    sprite: {
                        texture: '/Games/1/images/Rock.png'
                    }
                }
            });
            this.World.add(this.world, rock);
            this.projectiles[rock.id] = rock;
            var angle = this.Vector.angle(v_1, v_2);
            var v_x = -1 * (Math.cos(angle) * throwspeed);
            var v_y = -1 * (Math.sin(angle) * throwspeed);
            if (this.throwAnim === undefined)
                this.throwAnim = setInterval(this.throwAnimation, 60, dir);
            else {
                clearInterval(this.throwAnim);
                this.throwAnim = setInterval(this.throwAnimation, 60, dir);
            }
            console.log("Throw: " + v_x + ", " + v_y);

            this.Body.applyForce(rock, { x: rock.position.x, y: rock.position.y }, { x: v_x, y: v_y })
        }.bind(this));
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
            if (this.screenXMin > 10 && this.player.position.x - this.screenXMin < (this.screenX / 3)) {
                this.screenXMin -= 10;
                this.screenXMax -= 10;
            }
            //set our texture to the sprite facing left.
            this.player.render.sprite.texture = '/Games/1/images/Pink_Monster_L.png';
            if (Math.abs(this.player.velocity.x) <= this.max_velocity) {
                if (!this.grounded)
                    this.Body.applyForce(this.player, { x: this.player.position.x, y: this.player.position.y }, { x: -0.015, y: 0 })
                else
                    this.Body.applyForce(this.player, { x: this.player.position.x, y: this.player.position.y }, { x: -0.02, y: 0 })

            }
        }
        else if (direction_type == "right") {
            if (this.screenXMax < 2000 && this.player.position.x - this.screenXMin > ((2 * this.screenX) / 3)) {
                this.screenXMin += 10;
                this.screenXMax += 10;
            }
            //set our texture to the sprite facing right.
            this.player.render.sprite.texture = '/Games/1/images/Pink_Monster_R.png';
            if (Math.abs(this.player.velocity.x) <= this.max_velocity) {
                if (!this.grounded)
                    this.Body.applyForce(this.player, { x: this.player.position.x, y: this.player.position.y }, { x: 0.015, y: 0 })
                else
                    this.Body.applyForce(this.player, { x: this.player.position.x, y: this.player.position.y }, { x: 0.02, y: 0 })
            }
        } else if (direction_type == "up") {
            //applying upward force on player body.
            this.Body.applyForce(player, { x: this.player.position.x, y: this.player.position.y }, { x: 0, y: -0.05 });

        } else if (direction_type == "ladderUp") {
            this.Body.translate(this.player, { x: 0, y: -5 });
        } else if (direction_type == "ladderDown") {
            this.Body.translate(this.player, { x: 0, y: 5 });
        } else if (direction_type == "ladderLeft") {
            this.Body.translate(this.player, { x: -5, y: 0 });
        } else if (direction_type == "ladderRight") {
            this.Body.translate(this.player, { x: 5, y: 0 });
        }


        this.Render.lookAt(this.render, {
            min: { x: this.screenXMin, y: 0 },
            max: { x: this.screenXMax, y: this.screenY }
        });

    }

    respawn() {
        Matter.Composite.remove(this.world, this.player);
        this.player = this.createPlayer();
        this.World.add(this.world, this.player);

        this.Render.lookAt(this.render, {
            min: { x: 0, y: 0 },
            max: { x: this.screenX, y: this.screenY }
        });
        
    }

    createPlayer() {
        var player = this.Bodies.rectangle(50, 730, 20, 70, {
            label: "player",
            isStatic: false,
            inertia: Infinity, //Prevent rotation.
            collisionFilter: {
                mask: this.groundFilter | this.deathFilter | this.powerupFilter | this.enemy_proj | this.ladderFilter | this.defaultFilter
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


    throwAnimation(dir) {
        this.player.render.sprite.texture = '/Games/1/images/Throw_' + dir + '_' + this.throwAnimStep + '.png';
        this.throwAnimStep++;

        if (this.throwAnimStep > 3) {
            this.throwAnimStep = 0;
            this.player.render.sprite.texture = '/Games/1/images/Pink_Monster_' + dir + '.png';
            clearInterval(this.throwAnim);
        }
    }

    removeProjectile(body) {

        delete this.projectiles[body.id];
        Matter.Composite.remove(this.world, body);
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