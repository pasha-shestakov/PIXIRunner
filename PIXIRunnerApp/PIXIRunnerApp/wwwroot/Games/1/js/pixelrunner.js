export class PhysicsGame  {
    constructor() {}
    lives;
    checkpoint;
    character;

    Engine = Matter.Engine;
    Render = Matter.Render;
    Runner = Matter.Runner;
    Composites = Matter.Composites;
    Composite = Matter.Composite;
    Constraint = Matter.Constraint;
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
    runner;
    player;
    isPaused;
    max_velocity = 2;
    num_rocks = 10;

    projectiles = {};
    chests = {};
    signs = {};
    ladders = {};
    coins = {};
    enemies = {};

    projectileGravity = false;
    grounded = true;
    inv_open = false;
    throwAnim;
    throwAnimStep = 0;
    //ladderSnapPosition;
    leftID;
    rightID;

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
    enemyFilter = 0x1000;

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
    logging = true;

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

        window.oncontextmenu = function () {
            this.clearAllPlayerIntervals();
            return false;     // cancel default menu
        }.bind(this);

        // create runner
        this.runner = this.Runner.create();
        this.Runner.run(this.runner, this.engine);

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
        this.generate_ladders();
        //add chests
        //add signs
        //add coins
        //add player

        // add bodies
        this.World.add(this.world, [
            this.Bodies.rectangle(this.game_width / 2, 0, this.game_width, 50, { label: "wall", isStatic: true, render: { fillStyle: "#afafaf" }, collisionFilter: { category: this.wallFilter } }), //roof
            this.Bodies.polygon(300, 760, 3, 30, { label: "deathTriangle", isStatic: true, angle: 1.5708, render: { fillStyle: "#2d9919" }, collisionFilter: { category: this.deathFilter } }), //death triangles{}}), //death triangles
            this.Bodies.polygon(500, 760, 3, 30, { label: "deathTriangle", isStatic: true, angle: 1.5708, render: { fillStyle: "#2d9919" }, collisionFilter: { category: this.deathFilter } }), //death triangles
            this.Bodies.polygon(700, 760, 3, 30, { label: "deathTriangle", isStatic: true, angle: 1.5708, render: { fillStyle: "#2d9919" }, collisionFilter: { category: this.deathFilter } }), //death triangles
            this.Bodies.rectangle(65, 550, 80, 50, { label: "ground", isStatic: true, render: { fillStyle: "#2d9919" }, collisionFilter: { category: this.groundFilter } }),
            this.Bodies.rectangle(185, 550, 80, 50, { label: "ground", isStatic: true, render: { fillStyle: "#2d9919" }, collisionFilter: { category: this.groundFilter } }),
            
        ]);
        for (var id in this.ladders) {
            this.World.add(this.world, this.ladders[id].body);
        }

        for (var id in this.chests) {
            this.World.add(this.world, this.chests[id].body);
        }

        for (var id in this.signs) {
            this.World.add(this.world, this.signs[id].body);
        }

        for (var id in this.coins) {
            this.World.add(this.world, this.coins[id].body);
        }

        this.generate_enemies();
        
        this.World.add(this.world, this.player.body);
        //this.World.add(this.world, this.mouseconstraint);
        // keep the mouse in sync with rendering
        this.render.mouse = this.mouse;
    }
    generate_ladders() {
        var ladder1 = this.Bodies.rectangle(125, 625, 5, 300, {
            label: "ladder1",
            isStatic: true,
            isSensor: true,
            collisionFilter: {
                category: this.ladderFilter
            },
            render: {
                fillStyle: "#7a0a85",
                sprite: {
                    texture: '/Games/1/images/world/ladder.png',
                    xScale: 1,
                    yScale: 1
                }
            }
        });

        this.ladders[ladder1.id] = {
            body: ladder1
        }
    }
    generate_enemies() {

        
        
        var enemy1 = this.Bodies.rectangle(1000, 730, 40, 60, {
            label: "enemy1",
            isStatic: false,
            inertia: Infinity, //Prevent rotation.
            collisionFilter: {
                category: this.enemyFilter,
                mask: this.groundFilter | this.deathFilter | this.player_proj | this.ladderFilter | this.wallFilter
            },
            render: {
                fillStyle: "#7a0a85",
                sprite: {
                    texture: '/Games/1/images/enemy/Reaper_Man_L.png',
                    xScale: 0.1,
                    yScale: 0.1,
                }
            }
        });

        var hb_x = enemy1.position.x;
        var hb_y = enemy1.position.y + 50;
        //var enemyID = setInterval(this.enemy_jump.bind(this), 1000, enemy1.id);
        var greenBar = this.Bodies.rectangle(hb_x, hb_y, 80, 20, {
            label: "healthbar_green",
            isStatic: false,
            isSensor: true,
            inertia: Infinity,
            render: {
                fillStyle: "#54f542",
                strokeStyle: "#000",
                lineWidth: 3

            }
        });
        
        var redBar = this.Bodies.rectangle(hb_x, hb_y, 80, 20, {
            label: "healthbar_red",
            isStatic: false,
            isSensor: true,
            inertia: Infinity,
            render: {
                fillStyle: "#ff0000",
                strokeStyle: "#000",
                lineWidth: 3
            }
        })
        
        var enemy1HealthBar = this.Body.create({
            parts: [redBar, greenBar]
        });
        
        var constraint1 = this.Constraint.create({
            bodyA: enemy1,
            bodyB: enemy1HealthBar,
            pointB: { x: -15, y: 0 },
            render: {
                visible: false
            }
        });
        var constraint2 = this.Constraint.create({
            bodyA: enemy1,
            bodyB: enemy1HealthBar,
            pointB: { x: 15, y: 0 },
            render: {
                visible: false
            }
        });
        
        this.enemies[enemy1.id] = {
            body: enemy1,
            forceNeeded: false,
            forceToApply: null,
            hb: enemy1HealthBar,
            hp: {
                max: 6,
                current: 6
            }
        }

        this.World.add(this.world,
            [
                enemy1,
                enemy1HealthBar,
                constraint1,
                constraint2
            ]);
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
                    texture: '/Games/1/images/world/sign.png',
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
                    texture: '/Games/1/images/world/chest_closed.png',
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
        //window.setInterval(this.updateStats.bind(this), 100, this.player);

        this.engine.world.gravity.y = 1;

        this.Events.on(this.mouseconstraint, "mousedown", (event) => {

            if (!this.climbing && !this.isPaused) {
                var x_1 = event.mouse.mousedownPosition.x;
                var y_1 = event.mouse.mousedownPosition.y;

                var x_2 = this.player.body.position.x;
                var y_2 = this.player.body.position.y;
                this.log("click at world position: (%s,%s)\nplayer at world position: (%s,%s)", x_1, y_1, x_2, y_2);
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
                        mask: this.groundFilter | this.wallFilter | this.deathFilter | this.enemyFilter
                    },
                    isStatic: false,
                    render: {
                        //fillStyle: "#7a0a85",
                        sprite: {
                            texture: '/Games/1/images/player/projectiles/Rock.png'
                        }
                    }
                });
                this.World.add(this.world, rock);
                this.projectiles[rock.id] = rock;
                var angle = this.Vector.angle(v_1, v_2);
                this.log("angle between two points in degrees: %d", (180 * angle / Math.PI) % 360);
                var v_x = -1 * (Math.cos(angle) * throwspeed);
                var v_y = -1 * (Math.sin(angle) * throwspeed);
                if (this.throwAnim === undefined)
                    this.throwAnim = setInterval(this.throwAnimation.bind(this), 60, dir);
                else {
                    clearInterval(this.throwAnim);
                    this.throwAnim = setInterval(this.throwAnimation.bind(this), 60, dir);
                }
                //this.log("Throw: " + v_x + ", " + v_y);

                this.Body.applyForce(rock, { x: rock.position.x, y: rock.position.y }, { x: v_x, y: v_y })
                this.log("throwing projectile id=%d", rock.id);
            }
        }).bind(this);


        this.Events.on(this.engine, 'beforeUpdate', function () {
            var gravity = this.engine.world.gravity;
            //this.log(engine);
            if (!this.projectileGravity) {
                for (var id in this.projectiles) {
                    var body = this.projectiles[id];
                    this.Body.applyForce(body, body.position, {
                        x: -gravity.x * gravity.scale * body.mass,
                        y: -gravity.y * gravity.scale * body.mass
                    });
                    if (this.outOfBounds(body))
                        this.removeProjectile(body);
                }
            }
            if (!this.isPaused) {
                if (this.player.movement.left && !this.climbing) {
                    this.move_player("left");
                }
                if (this.player.movement.right && !this.climbing) {
                    this.move_player("right");
                }
                if (this.player.movement.up && this.grounded && !this.climbing) {
                    this.move_player("up");
                }

                if (this.nearLadder) {
                    if (this.player.movement.climbUp || this.player.movement.climbDown) {
                        let body = this.player.body;
                        //let dist_to_ladder = this.ladderSnapPosition - body.position.x;
                        //let displacement = this.Vector.create((body.position.x > this.ladderSnapPosition) ? -dist_to_ladder : dist_to_ladder, 0);
                        this.Body.applyForce(body, { x: body.position.x, y: body.position.x }, { x: -1 * (body.velocity.x * body.mass) / Math.pow(this.runner.deltaMin, 2), y: -1 * (body.velocity.y * body.mass) / Math.pow(this.runner.deltaMin, 2) })

                        //this.Body.translate(body, displacement);
                        this.climbing = true;
                    }
                }

                if (this.climbing) {
                    let movements = this.player.movement;
                    if (movements.climbUp || movements.left || movements.right || movements.climbDown) {
                        if (this.climbAnimStep % 5 == 0) {
                            this.player.body.render.sprite.texture = '/Games/1/images/player/climbAnimStep' + Math.floor(this.climbAnimStep / 5) + '.png';
                        }
                        this.climbAnimStep++;
                        if (this.climbAnimStep > 15)
                            this.climbAnimStep = 0;

                        if (this.player.movement.climbUp) {
                            this.move_player("ladderUp");
                        } else if (this.player.movement.left) {
                            this.move_player("ladderLeft");
                        } else if (this.player.movement.right) {
                            this.move_player("ladderRight");
                        } else if (this.player.movement.climbDown) {
                            this.move_player("ladderDown");
                        }
                    }
                    

                    
                }
            }

            for (var id in this.coins) {
                var coin = this.coins[id];
                coin.animation_state++;

                if (coin.animation_state > 45)
                    coin.animation_state = 0;
                if (coin.animation_state % 5 === 0) {
                    coin.body.render.sprite.texture = '/Games/1/images/coins/Gold_' + coin.animation_state / 5 + '.png';
                    //this.log("%d, %d",coin.animation_state, coin.animation_state / 5);
                }
            }

            for (var id in this.enemies) {
                let enemyBody = this.enemies[id].body;
                let forceNeeded = this.enemies[id].forceNeeded;
                var hb = this.enemies[id].hb;
                this.Body.applyForce(hb, hb.position, {
                    x: -gravity.x * gravity.scale * hb.mass,
                    y: -gravity.y * gravity.scale * hb.mass
                });

                if (forceNeeded) {
                    let forceToApply = this.enemies[id].forceToApply;
                    this.Body.applyForce(enemyBody, { x: enemyBody.position.x, y: enemyBody.position.y }, forceToApply);
                    this.enemies[id].forceNeeded = false;
                }
            }

            if (this.climbing) {
                this.Body.applyForce(this.player.body, this.player.body.position, {
                    x: -gravity.x * gravity.scale * this.player.body.mass,
                    y: -gravity.y * gravity.scale * this.player.body.mass
                });
            }

            if (this.render.bounds.min.x < this.screenXMin && this.player.movement.right) {
                
                this.render.bounds.max.x += 3;
                this.render.bounds.min.x += 3;
            }
            else if (this.render.bounds.max.x > this.screenXMax && this.player.movement.left) {

                this.render.bounds.max.x -= 3;
                this.render.bounds.min.x -= 3;
            }


       
        }.bind(this));


        //every collision event
        this.Events.on(this.engine, 'collisionStart', function (event) {


            var pairs = event.pairs;

            for (var i = 0, j = pairs.length; i != j; ++i) {
                var pair = pairs[i];
                //this.log("collisionSTART: (" + pair.bodyA.label + ", " + pair.bodyB.label + ")");

                //player collisions
                if (pair.bodyB.collisionFilter.category === this.playerFilter || pair.bodyA.collisionFilter.category === this.playerFilter) {
                    //mark player as grounded
                    this.log("collisionStart: (%s, %s):", pair.bodyA.label, pair.bodyB.label);
                    if (pair.bodyB.collisionFilter.category === this.groundFilter || pair.bodyA.collisionFilter.category === this.groundFilter) {

                        this.player.body.friction = 0.1;
                        this.grounded = true;

                    }

                    //respawn player when they hit an obstacle.
                    if (pair.bodyB.collisionFilter.category === this.deathFilter || pair.bodyA.collisionFilter.category === this.deathFilter)
                        this.respawn();

                    //near ladder.
                    if (pair.bodyB.collisionFilter.category === this.ladderFilter) {
                        this.nearLadder = true;
                        //this.ladderSnapPosition = pair.bodyB.position.x;

                    } else if (pair.bodyA.collisionFilter.category === this.ladderFilter) {
                        this.nearLadder = true;
                        //this.ladderSnapPosition = pair.bodyA.position.x;

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

                //enemyCollisions
                if (pair.bodyB.collisionFilter.category === this.enemyFilter || pair.bodyA.collisionFilter.category === this.enemyFilter) {

                    //hit death.
                    if (pair.bodyB.collisionFilter.category === this.deathFilter || pair.bodyA.collisionFilter.category === this.deathFilter)
                        this.log("enemy hit death triangle.");
                }
                //destroy projectiles based on mask.
                if (pair.bodyA.collisionFilter.category === this.player_proj) {
                    

                    if (pair.bodyB.collisionFilter.category === this.enemyFilter) {
                        this.log("enemy hit player projectile.");
                        this.log(pair.bodyB)
                        this.enemies[pair.bodyB.id].forceNeeded = true;

                        if (this.get_projectile_collision_direction(pair.bodyA, pair.bodyB))
                            this.enemies[pair.bodyB.id].forceToApply = { x: 0.04, y: 0 };
                        else
                            this.enemies[pair.bodyB.id].forceToApply = { x: -0.04, y: 0 };

                        this.hurt_enemy(this.enemies[pair.bodyB.id]);
                    }
                    this.removeProjectile(pair.bodyA);
                } else if (pair.bodyB.collisionFilter.category === this.player_proj) {
                    

                    if (pair.bodyA.collisionFilter.category === this.enemyFilter) {
                        this.log("enemy hit player projectile.");
                        this.log(pair.bodyA)
                        this.enemies[pair.bodyA.id].forceNeeded = true;

                        if (this.get_projectile_collision_direction(pair.bodyB, pair.bodyA))
                            this.enemies[pair.bodyA.id].forceToApply = { x: 0.04, y: 0 };
                        else
                            this.enemies[pair.bodyA.id].forceToApply = { x: -0.04, y: 0 };

                        this.hurt_enemy(this.enemies[pair.bodyA.id]);
                    }
                    this.removeProjectile(pair.bodyB);
                }
            }
        }.bind(this));

        this.Events.on(this.engine, "collisionActive", function (event) {
            var pairs = event.pairs;
            for (var i = 0, j = pairs.length; i != j; ++i) {
                var pair = pairs[i];

                //this.log("collisionACTIVE: (" + pair.bodyA.label + ", " + pair.bodyB.label + ")");

                //player collisions
                if (pair.bodyA.collisionFilter.category === this.playerFilter || pair.bodyB.collisionFilter.category === this.playerFilter) {

                    //nearChest
                    if (pair.bodyB.collisionFilter.category === this.chestFilter) {
                        if (this.interact && !this.chests[pair.bodyB.id].isOpen)
                            this.open_chest(pair.bodyB.id);
                    } else if (pair.bodyA.collisionFilter.category === this.chestFilter) {
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
                this.log("collisionEND: (" + pair.bodyA.label + ", " + pair.bodyB.label + ")");
                //player collisions
                if (pair.bodyA.collisionFilter.category === this.playerFilter || pair.bodyB.collisionFilter.category === this.playerFilter) {
                    
                    //we are no longer on the ground.
                    if (pair.bodyA.collisionFilter.category == this.groundFilter || pair.bodyB.collisionFilter.category == this.groundFilter) {
                        this.grounded = false;
                        this.player.body.friction = 0;
                    }

                    //away from ladder.
                    if (this.climbing) {
                        if (pair.bodyB.collisionFilter.category == this.ladderFilter) {

                            this.nearLadder = false;
                            this.climbing = false;
                            this.player.movement.climbUp = false;
                            this.player.movement.climbDown = false;
                            this.climbAnimStep = 0;

                            if (pair.bodyA.position.x < pair.bodyB.position.x) { //left of ladder
                                this.log("left of ladder");
                                this.player.body.render.sprite.texture = '/Games/1/images/player/Pink_Monster_L.png';
                            } else if (pair.bodyA.position.x > pair.bodyB.position.x) { //right of ladder
                                this.log("right of ladder");
                                this.player.body.render.sprite.texture = '/Games/1/images/player/Pink_Monster_R.png';
                            }




                        } else if (pair.bodyA.collisionFilter.category == this.ladderFilter) {

                            this.nearLadder = false;
                            this.climbing = false;
                            this.player.movement.climbUp = false;
                            this.player.movement.climbDown = false;
                            this.climbAnimStep = 0;

                            if (pair.bodyA.position.x < pair.bodyB.position.x) { //left of ladder
                                this.log("left of ladder");
                                this.player.body.render.sprite.texture = '/Games/1/images/player/Pink_Monster_L.png';
                            } else if (pair.bodyA.position.x > pair.bodyB.position.x) { //right of ladder
                                this.log("right of ladder");
                                this.player.body.render.sprite.texture = '/Games/1/images/player/Pink_Monster_R.png';
                            }


                        }
                    } else
                        this.nearLadder = false;
                    

                    if (pair.bodyB.collisionFilter.category == this.signFilter || pair.bodyA.collisionFilter.category == this.signFilter) {
                        this.toggle_sign();
                    }
                }
            }
        }.bind(this));
    }

    characterControls() {
        //user controls A(LEFT), D(RIGHT), {SPACE}(JUMP)
        //var up, left, right, climb, down = false;

        document.addEventListener('keydown', function (event) {
            //this.log("keycommand: " + event.code); //debugging
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
                    event.preventDefault();
                    this.player.movement.up = true;
                }

                if (event.code == 'KeyW') { //CLIMB
                    this.player.movement.climbUp = true;
                }

                if (event.code == 'KeyA') { //LEFT
                    this.player.movement.left = true;
                }
                if (event.code == 'KeyD') { //RIGHT
                    this.player.movement.right = true;
                }

                if (event.code == 'KeyS') { //DOWN
                    this.player.movement.climbDown = true;

                }

                if (event.code == 'KeyE') { //interact
                    this.interact = true;
                }
            }

        }.bind(this));


        document.addEventListener('keyup', function (event) {

            if (!this.isPaused) {
                if (event.code == "Space") { //UP (i.e. jump)
                    this.player.movement.up = false;
                }
                if (event.code == 'KeyA') { //LEFT
                    this.player.movement.left = false;
                }
                if (event.code == 'KeyD') { //RIGHT
                    this.player.movement.right = false;
                }
                if (event.code == 'KeyS') {
                    this.player.movement.climbDown = false;
                }
                if (event.code == 'KeyW') {
                    this.player.movement.climbUp = false;
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

    move_player(direction_type) {


        if (direction_type == "left") {
            if (this.screenXMin > 0 && this.player.body.position.x - this.screenXMin < ((2 * this.screenX) / 3)) {
                this.screenXMin -= 10;
                this.screenXMax -= 10;
            }
            //set our texture to the sprite facing left.
            this.player.body.render.sprite.texture = '/Games/1/images/player/Pink_Monster_L.png';
            if (Math.abs(this.player.body.velocity.x) <= this.max_velocity) {
                if (!this.grounded)
                    this.Body.applyForce(this.player.body, { x: this.player.body.position.x, y: this.player.body.position.y }, { x: -0.01, y: 0 })
                else
                    this.Body.applyForce(this.player.body, { x: this.player.body.position.x, y: this.player.body.position.y }, { x: -0.02, y: 0 })

            }
        }
        else if (direction_type == "right") {
            if (this.screenXMax < this.game_width && this.player.body.position.x - this.screenXMin > (this.screenX / 3)) {
                this.screenXMin += 10;
                this.screenXMax += 10;
            }
            //set our texture to the sprite facing right.
            this.player.body.render.sprite.texture = '/Games/1/images/player/Pink_Monster_R.png';
            if (Math.abs(this.player.body.velocity.x) <= this.max_velocity) {
                if (!this.grounded)
                    this.Body.applyForce(this.player.body, { x: this.player.body.position.x, y: this.player.body.position.y }, { x: 0.01, y: 0 })
                else
                    this.Body.applyForce(this.player.body, { x: this.player.body.position.x, y: this.player.body.position.y }, { x: 0.02, y: 0 })
            }
        } else if (direction_type == "up") {
            //applying upward force on player body.
            this.Body.applyForce(this.player.body, { x: this.player.body.position.x, y: this.player.body.position.y }, { x: 0, y: -0.05 });

        } else if (direction_type == "ladderUp") {
            this.Body.translate(this.player.body, { x: 0, y: -5 });
        } else if (direction_type == "ladderDown") {
            this.Body.translate(this.player.body, { x: 0, y: 5 });
        } else if (direction_type == "ladderLeft") {
            this.Body.translate(this.player.body, { x: -5, y: 0 });
        } else if (direction_type == "ladderRight") {
            this.Body.translate(this.player.body, { x: 5, y: 0 });
        }
    }

    move_enemy(enemyBody, direction) {
        if (direction === "left") {

        } else if (direction === "right") {

        }
    }

    hurt_enemy(enemy) {
        var max = enemy.hp.max;
        let hb = enemy.hb.parts[2];
        enemy.hp.current--;

        var bounds = hb.bounds;
        var offset = 80 / max;
        var vertices = Matter.Vertices.create([{ x: bounds.min.x + offset, y: bounds.min.y }, { x: bounds.min.x + offset, y: bounds.max.y }, { x: bounds.max.x, y: bounds.max.y }, { x: bounds.max.x, y: bounds.min.y}])
        this.Body.setVertices(hb, vertices);
        this.Body.translate(hb, this.Vector.create(offset/2, 0));
        if (enemy.hp.current == 0)
            this.destroy_enemy(enemy);

    }


    destroy_enemy(enemy) {
        let body = enemy.body;
        let hb = enemy.hb;

        this.log("remove enemy id=%d", body.id);
        delete this.enemies[body.id];
        Matter.Composite.remove(this.world, body);
        Matter.Composite.remove(this.world, hb);
    }
    respawn() {
        Matter.Composite.remove(this.world, this.player.body);
        this.player = this.createPlayer();
        this.World.add(this.world, this.player.body);

        this.screenXMin = 0;
        this.screenXMax = this.screenX;
        this.render.bounds.min.x = 0;
        this.render.bounds.max.x = this.screenX;
        
        
    }

    createPlayer() {
        var playerBody = this.Bodies.rectangle(50, 730, 20, 70, {
            label: "player",
            isStatic: false,
            inertia: Infinity, //Prevent rotation.
            collisionFilter: {
                category: this.playerFilter,
                mask: this.groundFilter | this.deathFilter | this.powerupFilter | this.enemy_proj | this.ladderFilter | this.wallFilter | this.chestFilter | this.signFilter | this.coinFilter
            },
            render: {
                sprite: {
                    texture: '/Games/1/images/player/Pink_Monster_R.png',
                    xScale: 2.3,
                    yScale: 2.3,
                    yOffset: 0.04
                }
            }
        });

        var player = {
            body: playerBody,
            movement:
            {
                left: false,
                right: false,
                up: false,
                climbDown: false,
                climbUp: false
            }
        }

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
        this.player.body.render.sprite.texture = '/Games/1/images/player/Throw_' + dir + '_' + this.throwAnimStep + '.png';
        this.throwAnimStep++;

        if (this.throwAnimStep > 3) {
            this.throwAnimStep = 0;
            this.player.body.render.sprite.texture = '/Games/1/images/player/Pink_Monster_' + dir + '.png';
            clearInterval(this.throwAnim);
        }
    }

    removeProjectile(body) {
        this.log("remove projectile id=%d", body.id);
        delete this.projectiles[body.id];
        Matter.Composite.remove(this.world, body);
    }


    pause_game() {
        this.isPaused = true;
        for (var id in this.projectiles) {
            var body = this.projectiles[id];
            body.isStatic = true;
        }
        this.player.body.isStatic = true;
    }

    unpause_game() {
        this.isPaused = false;
        for (var id in this.projectiles) {
            var body = this.projectiles[id];
            body.isStatic = false;
        }
        this.player.body.isStatic = false;
    }

    open_chest(id) {
        
        this.chests[id].body.render.sprite.texture = '/Games/1/images/world/chest_open.png';
        this.chests[id].isOpen = true;
        this.chests[id].inventory.forEach((value) => {
            this.log("player recieves: type: " + value.type + " count: " + value.count);
            switch (value.type) {
                case "gold":
                    this.gold += value.count;
                    document.getElementById("gold").innerHTML = this.gold;
                    break;
                default:
                    this.log("unknown type: '" + value.type + "'");
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

    enemy_jump(id) {
        //this.Body.applyForce(this.enemies[id].body, { x: this.enemies[id].body.position.x, y: this.enemies[id].body.position.y }, { x: 0, y: -0.1 });
    }

    get_projectile_collision_direction(projectile, entity) {
        if (projectile.position.x < entity.position.x)
            return true;
        else
            return false;
    }

    clearAllPlayerIntervals() {
        clearInterval(this.leftID);
        this.leftID = null;

        clearInterval(this.rightID);
        this.rightID = null;
    }

    outOfBounds(body) {
        if (body.position.x > this.render.bounds.max.x || body.position.x < this.render.bounds.min.x || body.position.y < this.render.bounds.min.y || body.position.y > this.render.bounds.max.y)
            return true;
        else
            return false;
    }

    //for removing logging
    log(msg, ...params) {
        if (this.logging)
            console.log(msg, ...params)
    }
}