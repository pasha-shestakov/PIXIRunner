﻿export class PhysicsGame  {
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
    Bounds = Matter.Bounds;
    engine;
    world;
    render;
    player;
    isPaused;
    max_velocity = 2;
    num_rocks = 10;
    projectiles = {};
    chests = {};
    signs = {};
    coins = {};
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
    chestFilter = 0x0100;
    signFilter = 0x0200;
    coinFilter = 0x0400;
    wallFilter = 0x0800;

    nearLadder = false;
    climbing = false;
    interact = false;
    climbAnimStep = 0;

    game_width = 2031;
    game_height = 800;

    screenX = 1000;
    screenY = 800;

    screenXMin = 0;
    screenXMax = 1000;

    mouseconstraint;
    mouse;

    gold;

    onLoad(load) {
        this.lives = load.lives;
        this.checkpoint = load.checkpoint;
        this.character = load.character;
        this.gold = 100;
        document.getElementById("lives").innerHTML = load.lives;
        document.getElementById("gold").innerHTML = this.gold;
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


        // add mouse control
        var mouse = this.Mouse.create(canvas),
            mouseConstraint = this.MouseConstraint.create(this.engine, {
                mouse: mouse,
                constraint: {
                    stiffness: 0.2,
                    render: {
                        visible: false
                    }
                }
            });
        this.mouse = mouse;
        this.mouseconstraint = mouseConstraint;
    }

    init() {

        //sets focus on gameBody
        $("#gameBody").focus();

        //prevents user from losing focus on gameBody
        $('#gameBody').blur(function (event) {
            setTimeout(function () {
                alert("lost focus");
                $("#gameBody").focus();
            }, 20);
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
        this.generate_chests();
        this.generate_signs();
        this.generate_coins();

        //add background
        this.generate_background();
        //add floors
        this.generate_floors();
        //add ladders
        //add chests
        //add signs
        //add coins
        //add player

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
            
            this.Bodies.rectangle(this.game_width / 2, 0, this.game_width, 50, { label: "wall", isStatic: true, render: { fillStyle: "#afafaf" }, collisionFilter: { category: this.wallFilter } }), //roof
            this.Bodies.polygon(300, 760, 3, 30, { label: "deathTriangle", isStatic: true, angle: 1.5708, render: { fillStyle: "#2d9919" }, collisionFilter: { category: this.deathFilter } }), //death triangles{}}), //death triangles
            this.Bodies.polygon(500, 760, 3, 30, { label: "deathTriangle", isStatic: true, angle: 1.5708, render: { fillStyle: "#2d9919" }, collisionFilter: { category: this.deathFilter } }), //death triangles
            this.Bodies.polygon(700, 760, 3, 30, { label: "deathTriangle", isStatic: true, angle: 1.5708, render: { fillStyle: "#2d9919" }, collisionFilter: { category: this.deathFilter } }), //death triangles
            this.Bodies.rectangle(65, 550, 80, 50, { label: "ground", isStatic: true, render: { fillStyle: "#2d9919" }, collisionFilter: { category: this.groundFilter } }),
            this.Bodies.rectangle(185, 550, 80, 50, { label: "ground", isStatic: true, render: { fillStyle: "#2d9919" }, collisionFilter: { category: this.groundFilter } }),
            
        ]);
        for (var id in this.chests) {
            this.World.add(this.world, this.chests[id].body);
        }

        for (var id in this.signs) {
            this.World.add(this.world, this.signs[id].body);
        }

        for (var id in this.coins) {
            this.World.add(this.world, this.coins[id].body);
        }

        this.World.add(this.world, this.player);
        //this.World.add(this.world, this.mouseconstraint);
        // keep the mouse in sync with rendering
        this.render.mouse = this.mouse;
    }
    generate_background() {
        this.World.add(this.world, this.Bodies.rectangle(108, 657, 171, 232, { label: "background", isStatic: true, isSensor: true, render: { sprite: { texture: '/Games/1/images/bg/bg_0.png', xScale: 1, yScale: 1 } } }));

        for (var i = 1; i < 12; i++) {
            var random_bg = Math.floor(Math.random() * 3);
            //171 x 232
            this.World.add(this.world, this.Bodies.rectangle(108+(i*171), 657, 171, 232, { label: "background", isStatic: true, isSensor: true, render: { sprite: { texture: '/Games/1/images/bg/bg_' + random_bg + '.png', xScale: 1, yScale: 1 } } }));
                
        }
        this.World.add(this.world, this.Bodies.rectangle(1989, 657, 171, 232, { label: "background", isStatic: true, isSensor: true, render: { sprite: { texture: '/Games/1/images/bg/bg_0.png', xScale: 1, yScale: 1 } } }));

    }

    generate_floors() {
        this.World.add(this.world,
            [
                this.Bodies.rectangle(0, this.game_height / 2, 46, this.game_height, { label: "wall", friction: 0, isStatic: true, render: { sprite: { texture: '/Games/1/images/world/left_wall.png', xScale: 1, yScale: 1 } }, collisionFilter: { category: this.wallFilter } }), //left_wall
                this.Bodies.rectangle(this.game_width, this.game_height / 2, 46, this.game_height, { label: "wall", friction: 0, isStatic: true, render: { sprite: { texture: '/Games/1/images/world/right_wall.png', xScale: 1, yScale: 1 } }, collisionFilter: { category: this.wallFilter } }), //right_wall
                this.Bodies.rectangle(this.game_width / 2, this.game_height - 10, this.game_width, 33, { label: "ground", isStatic: true, render: { sprite: { texture: '/Games/1/images/world/floor.png', xScale: 1, yScale: 1 } }, collisionFilter: { category: this.groundFilter } }), //ground
               
            ]);

        
    }
    generate_signs() {
        var sign1 = this.Bodies.rectangle(800, 755, 50, 50, {
            label: "sign1",
            isStatic: true,
            isSensor: true,
            collisionFilter: {
                category: this.signFilter
            },
            render: {
                fillStyle: "#7a0a85",
                sprite: {
                    texture: '/Games/1/images/sign.png',
                    xScale: 2,
                    yScale: 2
                }
            }
        });
        var text1 = "Hello Welcome to the game!";

        this.signs[sign1.id] = {
            body: sign1,
            text: text1
        };
        
    }

    generate_chests() {

        var chest1 = this.Bodies.rectangle(900, 750, 50, 50, {
            label: "chest1",
            isStatic: true,
            isSensor: true,
            collisionFilter: {
                category: this.chestFilter
            },
            render: {
                fillStyle: "#7a0a85",
                sprite: {
                    texture: '/Games/1/images/chest_closed.png',
                    xScale: 3,
                    yScale: 3
                }
            }
        });

        var inventory1 = [{
            type: "gold",
            count: 20
        }];
        
        this.chests[chest1.id] = {
            body: chest1,
            isOpen: false,
            inventory: inventory1
        };
    }

    generate_coins() {

        for (var i = 0; i < 10; i++) {
            var coin = this.Bodies.rectangle(970 + (i * 50), 750, 50, 50, {
                label: "coin1",
                isStatic: true,
                isSensor: true,
                collisionFilter: {
                    category: this.coinFilter
                },
                render: {
                    fillStyle: "#7a0a85",
                    sprite: {
                        texture: '/Games/1/images/coins/Gold_0.png',
                        xScale: 0.05,
                        yScale: 0.05
                    }
                }
            });

            this.coins[coin.id] = {
                body: coin,
                count: 1,
                animation_state: 0
            };
        }

        
    }
 
    physicsEvents() {
        //update the overlay with debug information
        window.setInterval(this.updateStats.bind(this), 100, this.player);

        this.engine.world.gravity.y = 1;

        this.Events.on(this.mouseconstraint, "mousedown", (event) => {

            if (!this.climbing && !this.isPaused) {
                var x_1 = event.mouse.mousedownPosition.x;
                var y_1 = event.mouse.mousedownPosition.y;

                var x_2 = this.player.position.x;
                var y_2 = this.player.position.y;
                console.log("click at world position: (%s,%s)\nplayer at world position: (%s,%s)", x_1, y_1, x_2, y_2);
                var dir = 'R';
                if (x_1 < x_2)
                    dir = 'L';

                var v_1 = this.Vector.create(x_1, y_1);
                var v_2 = this.Vector.create(x_2, y_2);
                var throwspeed = 0.0015;
                var rock = this.Bodies.rectangle(x_2, y_2, 5, 5, {
                    label: "player_proj",
                    collisionFilter: {
                        category: this.player_proj,
                        mask: this.groundFilter | this.wallFilter | this.deathFilter
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
                console.log("angle between two points in degrees: %d", (180 * angle / Math.PI) % 360);
                var v_x = -1 * (Math.cos(angle) * throwspeed);
                var v_y = -1 * (Math.sin(angle) * throwspeed);
                if (this.throwAnim === undefined)
                    this.throwAnim = setInterval(this.throwAnimation.bind(this), 60, dir);
                else {
                    clearInterval(this.throwAnim);
                    this.throwAnim = setInterval(this.throwAnimation.bind(this), 60, dir);
                }
                //console.log("Throw: " + v_x + ", " + v_y);

                this.Body.applyForce(rock, { x: rock.position.x, y: rock.position.y }, { x: v_x, y: v_y })
            }
        }).bind(this);


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

            for (var id in this.coins) {
                var coin = this.coins[id];
                coin.animation_state++;

                if (coin.animation_state > 45)
                    coin.animation_state = 0;
                if (coin.animation_state % 5 === 0) {
                    coin.body.render.sprite.texture = '/Games/1/images/coins/Gold_' + coin.animation_state / 5 + '.png';
                    //console.log("%d, %d",coin.animation_state, coin.animation_state / 5);
                }
            }

            if (this.climbing) {
                this.Body.applyForce(this.player, this.player.position, {
                    x: -gravity.x * gravity.scale * this.player.mass,
                    y: -gravity.y * gravity.scale * this.player.mass
                });
            }
            if (this.render.bounds.min.x < this.screenXMin) {
                
                this.render.bounds.max.x += 2;
                this.render.bounds.min.x += 2;
            }
            else if (this.render.bounds.max.x > this.screenXMax) {

                this.render.bounds.max.x -= 2;
                this.render.bounds.min.x -= 2;
            }


       
        }.bind(this));


        //every collision event
        this.Events.on(this.engine, 'collisionStart', function (event) {


            var pairs = event.pairs;

            for (var i = 0, j = pairs.length; i != j; ++i) {
                var pair = pairs[i];
                //console.log("collisionSTART: (" + pair.bodyA.label + ", " + pair.bodyB.label + ")");
                //player collisions
                if (pair.bodyA.label === "player" || pair.bodyB.label === "player") {
                    //mark player as grounded
                    console.log("collision: (%s, %s):", pair.bodyA.label, pair.bodyB.label);
                    if (pair.bodyB.collisionFilter.category === this.groundFilter || pair.bodyA.collisionFilter.category === this.groundFilter) {

                        this.player.friction = 0.1;
                        this.grounded = true;

                    }

                    //respawn player when they hit an obstacle.
                    if (pair.bodyB.collisionFilter.category === this.deathFilter || pair.bodyA.collisionFilter.category === this.deathFilter)
                        this.respawn();
                    //near ladder.
                    if (pair.bodyB.collisionFilter.category === this.ladderFilter || pair.bodyA.collisionFilter.category === this.ladderFilter) {
                        //console.log("near ladder");
                        this.nearLadder = true;

                    }

                    //sign
                    if (pair.bodyB.collisionFilter.category === this.signFilter) {
                        this.show_sign(pair.bodyB.id);
                    } else if (pair.bodyA.collisionFilter.category === this.signFilter) {
                        this.show_sign(pair.bodyA.id);
                    }

                    //coin
                    if (pair.bodyB.collisionFilter.category === this.coinFilter) {
                        this.collect_coin(pair.bodyB.id)
                    } else if (pair.bodyA.collisionFilter.category === this.coinFilter) {
                        this.collect_coin(pair.bodyA.id);
                    }
                    

                }
                //destroy projectiles based on mask.
                if (pair.bodyA.label === "player_proj") {
                    this.removeProjectile(pair.bodyA);
                } else if (pair.bodyB.label === "player_proj") {
                    this.removeProjectile(pair.bodyB);
                }
            }
        }.bind(this));

        this.Events.on(this.engine, "collisionActive", function (event) {
            var pairs = event.pairs;
            for (var i = 0, j = pairs.length; i != j; ++i) {
                var pair = pairs[i];
                //console.log("collisionACTIVE: (" + pair.bodyA.label + ", " + pair.bodyB.label + ")");
                //player collisions
                if (pair.bodyA.label === "player" || pair.bodyB.label === "player") {
                    //nearChest
                    //console.log("chestFilter: " + this.chestFilter + " === " + pair.bodyA.collisionFilter.category)
                    //console.log("collides with chest?: " + (pair.bodyA.collisionFilter.category === this.chestFilter) ? true : false);
                    if (pair.bodyB.collisionFilter.category === this.chestFilter) {
                        //console.log("nearChest id:" + pair.bodyB.id + " interact: " + this.interact);
                        if (this.interact && !this.chests[pair.bodyB.id].isOpen)
                            this.open_chest(pair.bodyB.id);
                    } else if (pair.bodyA.collisionFilter.category === this.chestFilter) {

                        //console.log("nearChest id: " + pair.bodyA.id + " interact: " + this.interact)
                        if (this.interact && !this.chests[pair.bodyA.id].isOpen)
                            this.open_chest(pair.bodyA.id);
                    }
                }
            }
        }.bind(this));

        this.Events.on(this.engine, 'collisionEnd', function (event) {
            var pairs = event.pairs;

            for (var i = 0, j = pairs.length; i != j; ++i) {
                var pair = pairs[i];
                //console.log("collisionEND: (" + pair.bodyA.label + ", " + pair.bodyB.label + ")");
                //player collisions
                if (pair.bodyA.label === "player" || pair.bodyB.label === "player") {

                    //we are no longer on the ground.
                    if (pair.bodyA.collisionFilter.category == this.groundFilter || pair.bodyB.collisionFilter.category == this.groundFilter) {
                        this.grounded = false;
                        this.player.friction = 0;
                    }

                    //away from ladder.
                    if (pair.bodyB.collisionFilter.category == this.ladderFilter || pair.bodyA.collisionFilter.category == this.ladderFilter) {
                        this.nearLadder = false;
                        this.climbing = false;
                        this.climb = false;
                        this.climbAnimStep = 0;
                        //console.log("away from ladder");
                    }

                    if (pair.bodyB.collisionFilter.category == this.signFilter || pair.bodyA.collisionFilter.category == this.signFilter) {
                        this.toggle_sign();
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

            if (!this.isPaused) {
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

                if (event.code == 'KeyE') { //interact
                    this.interact = true;
                }
            }
            


            //we can only jump if we are grounded and not climbing
            if (up && this.grounded && !this.climbing) {
                this.move("up");
            }

            if (left && !this.climbing && leftID == null) {
                //start movement on another thread until that key is released.
                leftID = setInterval(this.move.bind(this), 30, "left");
            }
            if (right && !this.climbing && rightID == null) {
                rightID = setInterval(this.move.bind(this), 30, "right");
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

            if (!this.isPaused) {
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
                if (event.code == 'KeyE') {
                    this.interact = false;
                }
            }
            
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
            if (this.screenXMin > 0 && this.player.position.x - this.screenXMin < (this.screenX / 3)) {
                this.screenXMin -= 10;
                this.screenXMax -= 10;
            }
            //set our texture to the sprite facing left.
            this.player.render.sprite.texture = '/Games/1/images/Pink_Monster_L.png';
            if (Math.abs(this.player.velocity.x) <= this.max_velocity) {
                if (!this.grounded)
                    this.Body.applyForce(this.player, { x: this.player.position.x, y: this.player.position.y }, { x: -0.01, y: 0 })
                else
                    this.Body.applyForce(this.player, { x: this.player.position.x, y: this.player.position.y }, { x: -0.02, y: 0 })

            }
        }
        else if (direction_type == "right") {
            if (this.screenXMax < this.game_width && this.player.position.x - this.screenXMin > ((2 * this.screenX) / 3)) {
                this.screenXMin += 10;
                this.screenXMax += 10;
            }
            //set our texture to the sprite facing right.
            this.player.render.sprite.texture = '/Games/1/images/Pink_Monster_R.png';
            if (Math.abs(this.player.velocity.x) <= this.max_velocity) {
                if (!this.grounded)
                    this.Body.applyForce(this.player, { x: this.player.position.x, y: this.player.position.y }, { x: 0.01, y: 0 })
                else
                    this.Body.applyForce(this.player, { x: this.player.position.x, y: this.player.position.y }, { x: 0.02, y: 0 })
            }
        } else if (direction_type == "up") {
            //applying upward force on player body.
            this.Body.applyForce(this.player, { x: this.player.position.x, y: this.player.position.y }, { x: 0, y: -0.05 });

        } else if (direction_type == "ladderUp") {
            this.Body.translate(this.player, { x: 0, y: -5 });
        } else if (direction_type == "ladderDown") {
            this.Body.translate(this.player, { x: 0, y: 5 });
        } else if (direction_type == "ladderLeft") {
            this.Body.translate(this.player, { x: -5, y: 0 });
        } else if (direction_type == "ladderRight") {
            this.Body.translate(this.player, { x: 5, y: 0 });
        }
    }

    respawn() {
        Matter.Composite.remove(this.world, this.player);
        this.player = this.createPlayer();
        this.World.add(this.world, this.player);

        this.screenXMin = 0;
        this.screenXMax = this.screenX;
        this.render.bounds.min.x = 0;
        this.render.bounds.max.x = this.screenX;
        
        
    }

    createPlayer() {
        var player = this.Bodies.rectangle(50, 730, 20, 70, {
            label: "player",
            isStatic: false,
            inertia: Infinity, //Prevent rotation.
            collisionFilter: {
                mask: this.groundFilter | this.deathFilter | this.powerupFilter | this.enemy_proj | this.ladderFilter | this.wallFilter | this.chestFilter | this.signFilter | this.coinFilter
            },
            render: {
                sprite: {
                    texture: '/Games/1/images/Pink_Monster_R.png',
                    xScale: 2.3,
                    yScale: 2.3,
                    yOffset: 0.04
                }
            }
        });

        /* //testing
        this.World.add(this.world, this.Bodies.rectangle(50, 730, 35, 65, {
            isStatic: true,
            isSensor: true,
            render: {
                fillStyle: "#7a0a85"
            }
        }))*/
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
        for (var id in this.projectiles) {
            var body = this.projectiles[id];
            body.isStatic = true;
        }
        this.player.isStatic = true;
    }

    unpause_game() {
        this.isPaused = false;
        for (var id in this.projectiles) {
            var body = this.projectiles[id];
            body.isStatic = false;
        }
        this.player.isStatic = false;
    }

    open_chest(id) {
        
        this.chests[id].body.render.sprite.texture = '/Games/1/images/chest_open.png';
        this.chests[id].isOpen = true;
        this.chests[id].inventory.forEach((value) => {
            console.log("player recieves: type: " + value.type + " count: " + value.count);
            switch (value.type) {
                case "gold":
                    this.gold += value.count;
                    document.getElementById("gold").innerHTML = this.gold;
                    break;
                default:
                    console.log("unknown type: '" + value.type + "'");
                    break;
            }
        })
    }

    collect_coin(id) {
        this.gold += this.coins[id].count;
        document.getElementById("gold").innerHTML = this.gold;
        this.World.remove(this.world, this.coins[id].body);
        delete this.coins[id];
    }

    show_sign(id) {
        $("#chat_panel_text").html(this.signs[id].text);
        this.toggle_sign();
    }

    toggle_sign() {
        $("#chat_panel").toggleClass('animate');
    }
}