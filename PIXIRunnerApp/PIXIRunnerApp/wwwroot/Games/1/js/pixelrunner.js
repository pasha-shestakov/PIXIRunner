

export class PhysicsGame  {
    sounds;
    constructor(gameSounds) {
        this.sounds = gameSounds;
    }
    
    
    //db globals
    lives;
    maxLives;
    checkpoint;
    character;
    gold;

    character_paths =
        {
            _1: 'Pink_Monster',
            _2: 'Owlet_Monster',
            _3: 'Dude_Monster'
        };

    speed = {
        player_proj: 0.0015,
        enemy_proj: 0.02
    }
    character_path;

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

    gameEngine;
    overlayEngine;

    gameWorld;
    overlayWorld;

    gameRender;
    overlayRender;

    gameRunner;
    overlayRunner;

    intervalID;
    coinlaunchArray = [];

    player;
    default_spawn = { x: 50, y: 730 };
    player_spawn = this.default_spawn; //default player spawn
    default_checkpoint;
    isPaused;
    max_velocity = 2;
    num_rocks = 10;

    projectiles = {};
    chests = {};
    signs = {};
    ladders = {};
    coins = {};
    enemies = {};
    grates = {};
    falling_rocks = {};
    chase_colliders = {};
    throw_colliders = {};
    doors = {};
    levers = {};

    life_arr = [];
    
    grounded = true;

    throwing = false;
    throw_position;
    throw_rate = 20;
    lastclick = new Date().getTime();

    inv_open = false;
    throwAnim;
    throwAnimStep = 0;
    //ladderSnapPosition;

    //collision filters
    defaultFilter = 0x0001;
    playerFilter = 0x0002;
    deathFilter = 0x0004;
    enemyChaseFilter = 0x0008;
    player_proj = 0x0010;
    enemy_proj = 0x0020;
    ladderFilter = 0x0040;
    groundFilter = 0x0080;
    chestFilter = 0x0100;
    signFilter = 0x0200;
    coinFilter = 0x0400;
    wallFilter = 0x0800;
    enemyFilter = 0x1000;
    patrolFilter = 0x2000;
    enemyThrowFilter = 0x4000;
    doorFilter = 0x8000;
    leverFilter = 0x10000;

    nearDoor = false;

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
    
    messageText;
    text_window;
    loaded = false;
    logging = false;

    //settings overlay globals
    settingsIcon;
    
    //shop overlay globals
    shopIcon;
    //delay for pause text on screen when game is paused ms
    pauseFlashDelay = 100;
    overlayActive = false;


    timePlayedSess;
    timePlayedGlobal;

    unlockedSkins;

    _userSaveState;
    _userGameState;

    onLoad(_userSaveState, _userGameState) {
        this._userSaveState = _userSaveState;
        this._userGameState = _userGameState;
        //related to specific savestate.

        this.lives = _userSaveState.lives;
        this.maxLives = _userSaveState.maxLives;
        this.checkpoint = _userSaveState.checkpoint;
        this.default_checkpoint = this.checkpoint;
        //global not dependant on game
        this.gold = _userGameState.gold;
        this.unlockedSkins = _userGameState.unlockedSkins;
        this.character = _userGameState.selectedSkinID;
        this.timePlayedGlobal = _userGameState.minutesPlayed;
        this.timePlayedSess = 0;
    }

    preInit() {
        //get canvas objects
        var gameCanvas = $('#gameBody').get(0);
        var overlayCanvas = $('#canvasOverlay').get(0);

        // create engines
        this.gameEngine = this.Engine.create();
        this.gameWorld = this.gameEngine.world;
        this.gameWorld.gravity.y = 1;

        this.overlayEngine = this.Engine.create();
        this.overlayWorld = this.overlayEngine.world;
        this.overlayWorld.gravity.y = 1;

        
        
        // create renderers
        this.gameRender = this.Render.create({
            canvas: gameCanvas,
            engine: this.gameEngine,
            options: {
                width: 1000,
                height: 800,
                showVelocity: false,
                showAngleIndicator: false,
                wireframes: false,
                background: "#000000"
            }
        });

        this.overlayRender = this.Render.create({
            canvas: overlayCanvas,
            engine: this.overlayEngine,
            options: {
                width: 1000,
                height: 800,
                showVelocity: false,
                showAngleIndicator: false,
                wireframes: false,
                wireframeBackground: 'transparent',
                background: "transparent"
            }
        });

        this.Render.run(this.gameRender);
        this.Render.run(this.overlayRender);

        // fit the render viewport to the scene
        this.Render.lookAt(this.gameRender, {
            min: { x: 0, y: 0 },
            max: { x: 1000, y: 800 }
        });


        // add mouse controlaaaaaa
        var mouse = this.Mouse.create(overlayCanvas),
            mouseConstraint = this.MouseConstraint.create(this.overlayEngine, {
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
    }d

    init() {
        

        
        /*
        //UNDO LATER
        $(window).blur(function () {
            if (!this.isPaused)
                this.toggle_pause();
        }.bind(this));
        */

        //start bg music
        

        $('#canvasOverlay').on('contextmenu', function () {
            this.log("contextmenu");
            return false;     // cancel default menu
        }.bind(this));

        $('#canvasOverlay').on('mouseout', function () {
            this.throwing = false;
        }.bind(this));

        // create runner
        this.gameRunner = this.Runner.create();
        this.Runner.run(this.gameRunner, this.gameEngine);

    
        this.overlayRunner = this.Runner.create();
        this.Runner.run(this.overlayRunner, this.overlayEngine);

        
        this.initOverlay();
        this.createWorld();
        this.sounds.start_bg_music(0);
        this.loadPlayers();
        setInterval(this.incrementTimePlayed.bind(this), 60000); //every minute
        this.physicsEvents();
    }

    incrementTimePlayed() {
        this.timePlayedGlobal += 1;
        this._userGameState.minutesPlayed = this.timePlayedGlobal;

        this.timePlayedSess += 1;
    }

    convertMinToDisplay(minutes) {
        let hours = Math.floor(minutes / 60);
        var displayStr = minutes + " minutes";
        if (hours > 0) {
            displayStr = hours + " hours " + minutes + " minutes";
        }

        return displayStr;
    }

    sync_player_skin(character) {
        switch (character) {
            case 1:
                this.character_path = this.character_paths._1;
                break;
            case 2:
                this.character_path = this.character_paths._2;
                break;
            case 3:
                this.character_path = this.character_paths._3;
                break;
            default:
                this.character_path = this.character_paths._1; //default to Pink_Monster if skin not found.
                break;
        }

        if (this.player.facing === "left") {
            this.player.body.render.sprite.texture = '/Games/1/images/player/' + this.character_path + '/L.png';
        } else if (this.player.facing === "right") {
            this.player.body.render.sprite.texture = '/Games/1/images/player/' + this.character_path + '/R.png';
        }

    }

    loadPlayers() {
        for (var id in this.signs) {
            let sign = this.signs[id];
            if (sign.checkpointID === this.checkpoint) {
                this.player_spawn = sign.checkpointSpawn;
                this.default_spawn = sign.checkpointSpawn;
                
                break;
            }
        }

        this.player = this.createPlayer();
        this.sync_player_skin(this.character);
        this.characterControls();

        this.World.add(this.gameWorld, this.player.body);
        this.fix_render_bounds();
    }

    initOverlay() {
        this.shopIcon = this.Bodies.rectangle(965, 35, 50, 50,
            {
                isStatic: true,
                render: {
                    //fillStyle: '#ff0000',
                    sprite: {
                        texture: '/Games/1/images/UI/shop.png'
                    }
                }
            });

        this.settingsIcon = this.Bodies.rectangle(965, 85, 50, 50,
            {
                isStatic: true,
                render: {
                    //fillStyle: '#ff0000',
                    sprite: {
                        texture: '/Games/1/images/UI/settings.png'
                    }
                }
            });

        
        var whole_count = Math.ceil(this.maxLives / 2);
        for (var i = 0; i < whole_count; i++) {
            this.life_arr.push(
                this.Bodies.rectangle(35 + (i * 50), 35, 50, 50,
                    {
                        isStatic: true,
                        render: {
                            fillStyle: '#ff0000',
                            sprite: {
                                texture: '/Games/1/images/UI/heart_empty.png'
                            }
                        }
                    })
            );
        }
        this.sync_health_icons();


        this.life_arr.forEach(function (body) {
            this.World.add(this.overlayWorld, body);
        }.bind(this));


        let gold_icon = this.Bodies.rectangle(35, 85, 50, 50, {
            isStatic: true,
            render: {
                sprite: {
                    texture: '/Games/1/images/UI/gold_icon.png',
                    xScale: 0.08,
                    yScale: 0.08
                }
            }
        });

        this.text_window = this.Bodies.rectangle(this.screenX / 2, 210, this.screenX - 200, 200,
            {
                isStatic: true,
                render: {
                    fillStyle: '#545454',
                    strokeStyle: '#fff',
                    lineWidth: 5,
                    opacity: 0.4,
                    visible: false
                }
            });
        this.World.add(this.overlayWorld, this.text_window);
        this.World.add(this.overlayWorld, gold_icon);
        this.World.add(this.overlayWorld, this.shopIcon);
        this.World.add(this.overlayWorld, this.settingsIcon);
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
        //add grates
        this.generate_grates();
        //add chests
        //add signs
        //add coins
        //add player
        this.generate_doors();

        // add bodies
        this.World.add(this.gameWorld, [
            this.Bodies.rectangle(this.game_width / 2, 0, this.game_width, 50, { label: "wall", isStatic: true, render: { fillStyle: "#afafaf" }, collisionFilter: { category: this.wallFilter } }), //roof
            this.Bodies.polygon(300, 760, 3, 30, { label: "spike", isStatic: true, angle: 1.5708, render: { fillStyle: "#2d9919" }, collisionFilter: { category: this.deathFilter } }), //death triangles{}}), //death triangles
            this.Bodies.polygon(500, 760, 3, 30, { label: "spike", isStatic: true, angle: 1.5708, render: { fillStyle: "#2d9919" }, collisionFilter: { category: this.deathFilter } }), //death triangles
            this.Bodies.polygon(700, 760, 3, 30, { label: "spike", isStatic: true, angle: 1.5708, render: { fillStyle: "#2d9919" }, collisionFilter: { category: this.deathFilter } }), //death triangles
            this.Bodies.rectangle(65, 516, 80, 17, { label: "ground", isStatic: true, render: { fillStyle: "#2d9919" }, collisionFilter: { category: this.groundFilter } }),
            this.Bodies.rectangle(1075, 516, 1860, 17, { label: "ground", isStatic: true, render: { fillStyle: "#2d9919" }, collisionFilter: { category: this.groundFilter } }),

            
        ]);
        for (var id in this.doors) {
            this.World.add(this.gameWorld, this.doors[id].body);
            this.World.add(this.gameWorld, this.doors[id].indicators);
            this.World.add(this.gameWorld, this.doors[id].constraint);

            this.generate_levers(id).forEach((lever) => {
                this.World.add(this.gameWorld, lever);
            });
        }
        for (var id in this.grates) {
            this.World.add(this.gameWorld, this.grates[id].body);
        }

        for (var id in this.ladders) {
            this.World.add(this.gameWorld, this.ladders[id].body);
        }

        for (var id in this.chests) {
            this.World.add(this.gameWorld, this.chests[id].body);
        }

        for (var id in this.signs) {
            this.World.add(this.gameWorld, this.signs[id].body);
        }

        for (var id in this.coins) {
            this.World.add(this.gameWorld, this.coins[id].body);
        }

        this.generate_enemies();
        
        
        //this.World.add(this.gameWorld, this.mouseconstraint);
        // keep the mouse in sync with rendering
        this.overlayRender.mouse = this.mouse;
    }

    generate_doors() {
        var doorPosition1 = { x: 1550, y: 720 };
        var door1 = this.Bodies.rectangle(doorPosition1.x, doorPosition1.y, 80, 115,
            {
                label: "door1",
                isStatic: true,
                isSensor: true,
                render: {
                    fillStyle: "#ff0000",
                    sprite: {
                        texture: '/Games/1/images/world/door_closed.png',
                        xScale: 1.75,
                        yScale: 2
                    }
                },
                collisionFilter: { category: this.doorFilter }
            })

       

        var indicator1 = this.Bodies.rectangle(doorPosition1.x - 40, doorPosition1.y - 70, 30, 20,
            {
                label: "indicator1",
                isStatic: true,
                isSensor: true,
                render: {
                    fillStyle: "#ff0000",
                    strokeStyle: "#000000",
                    lineWidth: 3
                }
            })
        this.Body.rotate(indicator1, -0.5);
        var indicator2 = this.Bodies.rectangle(doorPosition1.x, doorPosition1.y - 80, 30, 20,
            {
                label: "indicator2",
                isStatic: true,
                isSensor: true,
                render: {
                    fillStyle: "#ff0000",
                    strokeStyle: "#000000",
                    lineWidth: 3
                }

            })
        var indicator3 = this.Bodies.rectangle(doorPosition1.x + 40, doorPosition1.y - 70, 30, 20,
            {
                label: "indicator3",
                isStatic: true,
                isSensor: true,
                render: {
                    fillStyle: "#ff0000",
                    strokeStyle: "#000000",
                    lineWidth: 3
                }
            })
        this.Body.rotate(indicator3, 0.5);

        var doorIndicators = this.Body.create({
            parts: [indicator1, indicator2, indicator3]
        });

        var constraint1 = this.Constraint.create({
            bodyA: door1,
            bodyB: doorIndicators,
            render: {
                visible: false
            }
        });
        this.doors[door1.id] = {
            body: door1,
            indicators: doorIndicators,
            constraint: constraint1,
            isOpen: false,
            leversActivated: 0,
            leversRequired: 3,
            lever_positions: [
                { x: 1650, y: 742, grounded: true },
                { x: 1750, y: 555, grounded: false },
                { x: 1850, y: 742, grounded: true }
            ],
            animStart: false,
            animStep: 0,
            animMax: 1,
            animRate: 10

        }
    }

    generate_levers(doorID) {
        var levers = [];
        var door = this.doors[doorID];
        door.lever_positions.forEach((leverPos, index) => {
            var lever;
            if (leverPos.grounded) {
                lever = this.Bodies.rectangle(leverPos.x, leverPos.y, 100, 80, {
                    label: "lever",
                    isStatic: true,
                    isSensor: true,
                    render: {
                        fillStyle: "#ff0000",
                        sprite: {
                            texture: '/Games/1/images/world/lever_0.png',
                            xScale: 1.7,
                            yScale: 1.7
                        }
                    },
                    collisionFilter: { category: this.leverFilter, mask: this.defaultFilter | this.playerFilter }

                });
            } else {
                lever = this.Bodies.rectangle(leverPos.x, leverPos.y, 100, 80, {
                    label: "leverU",
                    isStatic: true,
                    isSensor: true,
                    render: {
                        fillStyle: "#ff0000",
                        sprite: {
                            texture: '/Games/1/images/world/lever_U_0.png',
                            xScale: 1.7,
                            yScale: 1.7
                        }
                    },
                    collisionFilter: { category: this.leverFilter, mask: this.player_proj }

                });

            }

            levers.push(lever);
            this.levers[lever.id] = {
                body: lever,
                door: door,
                isActivatable: true,
                grounded: leverPos.grounded,
                animStart: false,
                animStep: 0,
                animRate: 5,
                animMax: 2,
            }
        });


        return levers;
    }

    generate_grates() {
        //grates
        var grate1 = this.Bodies.rectangle(1313, 542, 64, 33,
            {
                label: "grate",
                isStatic: true,
                render: {
                    fillStyle: "#ff0000",
                    sprite: {
                        texture: '/Games/1/images/world/grate0.png'
                    }
                },
                collisionFilter: { category: this.wallFilter }
            })

        this.grates[grate1.id] = {
            body: grate1,
            animMax: 4,
            animRate: 10,
            animStep: 0,
            opening: true,
            active: true
        }
    }

    generate_ladders() {
        var ladder1 = this.Bodies.rectangle(125, 625, 10, 300, {
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
                mask: this.groundFilter | this.deathFilter | this.player_proj | this.ladderFilter | this.wallFilter | this.patrolFilter
            },
            render: {
                fillStyle: "#7a0a85",
                sprite: {
                    texture: '/Games/1/images/enemy/Reaper_Man/L.png',
                    xScale: 0.1,
                    yScale: 0.1,
                }
            }
        });

        var hb_x = enemy1.position.x;
        var hb_y = enemy1.position.y+ 50;
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

        var path1Collider = this.Bodies.rectangle(800, 730, 20, 100, { isStatic: true, isSensor: true, render: { fillStyle: '#ff0000', opacity: 0.4, visible: false }, collisionFilter: { category: this.patrolFilter } });
        var path2Collider = this.Bodies.rectangle(1200, 730, 20, 100, { isStatic: true, isSensor: true, render: { fillStyle: '#ff0000', opacity: 0.4, visible: false }, collisionFilter: { category: this.patrolFilter} });
        var chaseCollider = this.Bodies.rectangle(1000, 730, 700, 500, {
            label: 'throwCollider',
            isStatic: false,
            isSensor: true,
            inertia: Infinity,
            render: {
                fillStyle: '#00ff00',
                opacity: 0.4,
                visible: false
            },
            collisionFilter:
            {
                category: this.enemyChaseFilter,
                mask: this.playerFilter
            }
        });

        var throwCollider = this.Bodies.rectangle(1000, 730, 500, 250, {
            label: 'throwCollider',
            isStatic: false,
            isSensor: true,
            inertia: Infinity,
            render: {
                fillStyle: '#0000ff',
                opacity: 0.4,
                visible: false
            },
            collisionFilter:
            {
                category: this.enemyThrowFilter,
                mask: this.playerFilter
            }
        });

        var chaseConstraint = this.Constraint.create({
            bodyA: enemy1,
            bodyB: chaseCollider,
            render: {
                visible: false
            }
        });

        var throwConstraint = this.Constraint.create({
            bodyA: enemy1,
            bodyB: throwCollider,
            render: {
                visible: false
            }
        });
        
        var patrolPath = [
            {
                action: 'right',
                collisionBody: path1Collider
            },
            {
                action: 'left',
                collisionBody: path2Collider
            }
        ]
        this.enemies[enemy1.id] = {
            body: enemy1,
            forceNeeded: false,
            forceToApply: null,
            hb: enemy1HealthBar,
            chaseCollider: chaseCollider,
            throwCollider: throwCollider,
            patrol: patrolPath,
            animRate: 5,
            animStep: 0,
            animMax: 23,
            isChasing: false,
            isThrowing: false,
            isAttacking: false,
            attackDelay: 0,
            attackDelayMax: 300,
            hp: {
                max: 6,
                current: 6
            },
            movement:
            {
                left: false,
                right: false,
                climbUp: false,
                climbDown: false

            }
            
        }

        //need a back reference for player collision detection.
        this.chase_colliders[chaseCollider.id] = {
            body: chaseCollider,
            enemyID: enemy1.id
        }

        //need a back reference for player collision detection.
        this.throw_colliders[throwCollider.id] = {
            body: throwCollider,
            enemyID: enemy1.id
        }

        this.World.add(this.gameWorld,
            [
                enemy1,
                enemy1HealthBar,
                constraint1,
                constraint2,
                path1Collider,
                path2Collider,
                chaseCollider,
                throwCollider,
                chaseConstraint,
                throwConstraint
            ]);


        //start patrol path for each enemy.
        for (var id in this.enemies) {
            var enemy = this.enemies[id];
            var initPatrolDir = enemy.patrol[0].action;

            switch (initPatrolDir) {
                case 'left':
                    enemy.movement.left = true;
                    break;
                case 'right':
                    enemy.movement.right = true;
                    break;
            }

            
        }
        
    }

    generate_background() {
        this.World.add(this.gameWorld, this.Bodies.rectangle(108, 657, 171, 232, { label: "background", isStatic: true, isSensor: true, render: { sprite: { texture: '/Games/1/images/bg/bg_0.png', xScale: 1, yScale: 1 } } }));

        for (var i = 1; i < 12; i++) {
            var random_bg = Math.floor(Math.random() * 3);
            //171 x 232
            this.World.add(this.gameWorld, this.Bodies.rectangle(108+(i*171), 657, 171, 232, { label: "background", isStatic: true, isSensor: true, render: { sprite: { texture: '/Games/1/images/bg/bg_' + random_bg + '.png', xScale: 1, yScale: 1 } } }));
                
        }
        this.World.add(this.gameWorld, this.Bodies.rectangle(1989, 657, 171, 232, { label: "background", isStatic: true, isSensor: true, render: { sprite: { texture: '/Games/1/images/bg/bg_0.png', xScale: 1, yScale: 1 } } }));

    }

    generate_floors() {
        this.World.add(this.gameWorld,
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
        var text1 = "This is a chest, you can open it by pressing 'E' Maybe something cool is inside. Go ahead!";

        this.signs[sign1.id] = {
            body: sign1,
            text: text1,
            checkpointID: 1,
            checkpointSpawn: { x: sign1.position.x, y: sign1.position.y - 20 }
        };

         //SIGN2 
        var sign2 = this.Bodies.rectangle(1970, 755, 50, 50, {
            label: "sign2",
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
        var text2 = "This is a test!";

        this.signs[sign2.id] = {
            body: sign2,
            text: text2,
            checkpointID: 2,
            checkpointSpawn: { x: sign2.position.x, y: sign2.position.y - 20 }
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
                label: "coin",
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
        this.Events.on(this.mouseconstraint, 'mousemove', (event) => {
            if (this.throwing) {
                this.log(event);
                var x = event.mouse.position.x;
                var y = event.mouse.position.y;

                var x_1 = x;
                var y_1 = y;

                this.throw_position = { x: x_1, y: y_1 };

            }
        }).bind(this);

        this.Events.on(this.mouseconstraint, "mousedown", (event) => {
            var x = event.mouse.mousedownPosition.x;
            var y = event.mouse.mousedownPosition.y;

            if (this.Bounds.contains(this.shopIcon.bounds, this.Vector.create(x, y))) {
                this.log("clicked store!");
                $('#store').toggleClass('show');
                this.overlayActive = true;
                if (!this.isPaused)
                    this.toggle_pause();
                
            } else if (this.Bounds.contains(this.settingsIcon.bounds, this.Vector.create(x, y))) {
                this.log("clicked settings!");
                $('#settings').toggleClass('show');
                this.overlayActive = true;
                if (!this.isPaused)
                    this.toggle_pause();
            } else if (!this.climbing && !this.isPaused) {
                var x_1 = x;
                var y_1 = y;

                var date = new Date();
                var current = date.getTime();

                if (current - this.lastclick > this.throw_rate * 11) {
                    
                    this.throw_position = { x: x_1, y: y_1 };
                    this.throw_projectile(this.player.body, 'rock', this.throw_position.x + this.gameRender.bounds.min.x, this.throw_position.y + this.gameRender.bounds.min.y, this.speed.player_proj);
                    this.throwing = true;
                    this.lastclick = current;
                }
                
                
            }
        }).bind(this);

        this.Events.on(this.mouseconstraint, 'mouseup', (event) => {
            this.throwing = false;
            this.throw_rate = 20;
        }).bind(this);

        this.Events.on(this.overlayEngine, 'beforeUpdate', function () {
            //update gold each frame.
            var ctx = this.overlayRender.context;
            ctx.font = '48px Autobus';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(this.gold, 70, 100);

            if (this.text_window.render.visible) {
                ctx.font = '24px Autobus';
                ctx.fillText(this.messageText, this.text_window.position.x - 380, this.text_window.position.y - 60);
            }

            if (this.isPaused && !this.overlayActive) {
                this.pauseFlashDelay--;
                if (this.pauseFlashDelay > 50) {
                    ctx.font = '96px Autobus';
                    ctx.fillText("Paused", (this.screenX / 2) - 115, this.screenY / 2);
                    
                } else if (this.pauseFlashDelay === 0)
                    this.pauseFlashDelay = 100;

                ctx.font = '24px Autobus';
                ctx.fillText("Time Played", 10, 130);
                ctx.font = '20px Autobus';
                ctx.fillText(this.convertMinToDisplay(this.timePlayedGlobal) + " - total", 10, 150);
                ctx.fillText(this.convertMinToDisplay(this.timePlayedSess) + " - current session", 10, 170);
            }
        }.bind(this));

        this.Events.on(this.gameEngine, 'beforeUpdate', function () {
            var gravity = this.gameEngine.world.gravity;

            for (var id in this.projectiles) {
                var body = this.projectiles[id].body;
                if (!this.projectiles[id].gravityAffect) {
                    
                    this.Body.applyForce(body, body.position, {
                        x: -gravity.x * gravity.scale * body.mass,
                        y: -gravity.y * gravity.scale * body.mass
                    });
                }
                    
                if (this.outOfBounds(body))
                    this.removeProjectile(body);
            }
            

            if (this.throwing) {
                this.throw_rate--;
                if (this.throw_rate === 0) {
                    this.throw_projectile(this.player.body, 'rock', this.throw_position.x + this.gameRender.bounds.min.x, this.throw_position.y + this.gameRender.bounds.min.y, this.speed.player_proj);
                    this.throw_rate = 20;
                }
            }

            if (!this.isPaused) {
                if (this.player.movement.left && !this.climbing) {

                    if (this.player.animStep % this.player.animRate == 0) {
                        this.player.body.render.sprite.texture = '/Games/1/images/player/' + this.character_path + '/walk/L_' + this.player.animStep / this.player.animRate + '.png';
                        if (this.grounded) {
                            this.sounds.player_walk();

                        }
                    }
                    
                    if (this.player.animStep > this.player.animRate * this.player.animMax)
                        this.player.animStep = 0;

                    this.player.animStep++;

                    this.move(this.player.body, "left");
                }
                if (this.player.movement.right && !this.climbing) {
                    if (this.player.animStep % this.player.animRate == 0) {
                        this.player.body.render.sprite.texture = '/Games/1/images/player/' + this.character_path + '/walk/R_' + this.player.animStep / this.player.animRate + '.png';
                        if (this.grounded) {
                            this.sounds.player_walk();

                        }
                    }

                    if (this.player.animStep > this.player.animRate * this.player.animMax)
                        this.player.animStep = 0;

                    this.player.animStep++;

                    this.move(this.player.body, "right");
                }
                if (this.player.movement.up && this.grounded && !this.climbing) {
                    this.move(this.player.body, "up");
                }

                if (this.nearLadder) {
                    if (this.player.movement.climbUp || this.player.movement.climbDown) {
                        let body = this.player.body;
                        //let dist_to_ladder = this.ladderSnapPosition - body.position.x;
                        //let displacement = this.Vector.create((body.position.x > this.ladderSnapPosition) ? -dist_to_ladder : dist_to_ladder, 0);
                        this.Body.applyForce(body, { x: body.position.x, y: body.position.x }, { x: -1 * (body.velocity.x * body.mass) / Math.pow(this.gameRunner.deltaMin, 2), y: -1 * (body.velocity.y * body.mass) / Math.pow(this.gameRunner.deltaMin, 2) })

                        //this.Body.translate(body, displacement);
                        this.climbing = true;
                        this.throwing = false; //disable throwing while climbing.
                    }
                }

                if (this.climbing) {
                    let movements = this.player.movement;
                    if (movements.climbUp || movements.left || movements.right || movements.climbDown) {
                        if (this.climbAnimStep % 5 == 0) {
                            this.player.body.render.sprite.texture = '/Games/1/images/player/' + this.character_path + '/climb/' + Math.floor(this.climbAnimStep / 5) + '.png';
                        }
                        this.climbAnimStep++;
                        if (this.climbAnimStep > 15)
                            this.climbAnimStep = 0;

                        if (this.player.movement.climbUp) {
                            this.move(this.player.body, "ladderUp");
                        } else if (this.player.movement.left) {
                            this.move(this.player.body, "ladderLeft");
                        } else if (this.player.movement.right) {
                            this.move(this.player.body, "ladderRight");
                        } else if (this.player.movement.climbDown) {
                            this.move(this.player.body, "ladderDown");
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
                    }
                }

                for (var id in this.doors) {
                    var door = this.doors[id];

                    if (door.animStart) {
                        if (door.animStep % door.animRate === 0) {
                            door.body.render.sprite.texture = '/Games/1/images/world/door_open' + door.animStep / door.animRate + '.png';
                        }
                        door.animStep++;
                        if (door.animStep > door.animRate * door.animMax) {
                            door.animStep = 0;
                            door.animStart = false;
                            //console.log('player teleported');
                        }
                    }
                }

                for (var id in this.levers) {
                    var lever = this.levers[id];

                    if (lever.animStart) {
                        if (lever.animStep % lever.animRate === 0) {
                            let animID = lever.animStep / lever.animRate;
                            lever.body.render.sprite.texture = (lever.grounded) ? '/Games/1/images/world/lever_' + animID + '.png' : '/Games/1/images/world/lever_U_' + animID + '.png';
                            
                        }
                        lever.animStep++;
                        if (lever.animStep > lever.animRate * lever.animMax) {
                            lever.animStep = 0;
                            lever.animStart = false;
                            //console.log('lever activated');
                        }
                    }
                }

                for (var id in this.grates) {
                    var grate = this.grates[id];
                    if (grate.opening)
                        grate.animStep++;
                    else
                        grate.animStep--;

                    if (grate.animStep == grate.animRate * grate.animMax) {
                        grate.opening = false;
                        this.spawn_falling_rock(grate.body.position.x, grate.body.position.y);

                    }
                    else if (grate.animStep == 0) {
                        grate.opening = true;
                    }
                    if (grate.animStep % grate.animRate === 0) {
                        grate.body.render.sprite.texture = '/Games/1/images/world/grate' + grate.animStep / grate.animRate + '.png';
                    }
                }

                for (var id in this.falling_rocks) {
                    var f_rock = this.falling_rocks[id];
                    if (f_rock.death) {
                        

                        if (f_rock.animStep % f_rock.animRate === 0) {
                            f_rock.body.render.sprite.texture = '/Games/1/images/world/rock_crumble' + f_rock.animStep / f_rock.animRate + '.png';
                        }
                        if (f_rock.animStep == f_rock.animRate * f_rock.animMax) {
                            this.World.remove(this.gameWorld, f_rock.body);
                            delete this.falling_rocks[f_rock.body.id];

                        }
                        f_rock.animStep++;


                    }
                }

                //enemy movement controls
                for (var id in this.enemies) {
                    var enemy = this.enemies[id];

                    if (enemy.movement.left) {
                        if (enemy.animStep % enemy.animRate == 0) {
                            enemy.body.render.sprite.texture = '/Games/1/images/enemy/Reaper_Man/walk/L_' + enemy.animStep / enemy.animRate + '.png';
                            
                        }

                        if (enemy.animStep >= enemy.animRate * enemy.animMax)
                            enemy.animStep = 0;

                        enemy.animStep++;


                        this.move(enemy.body, 'left');

                    }
                    if (enemy.movement.right) {
                        if (enemy.animStep % enemy.animRate == 0) {
                            enemy.body.render.sprite.texture = '/Games/1/images/enemy/Reaper_Man/walk/R_' + enemy.animStep / enemy.animRate + '.png';

                        }

                        if (enemy.animStep >= enemy.animRate * enemy.animMax)
                            enemy.animStep = 0;

                        enemy.animStep++;

                        this.move(enemy.body, 'right');

                    }
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
                var chaseCollider = this.enemies[id].chaseCollider;
                this.Body.applyForce(chaseCollider, chaseCollider.position, {
                    x: -gravity.x * gravity.scale * chaseCollider.mass,
                    y: -gravity.y * gravity.scale * chaseCollider.mass
                });
                var throwCollider = this.enemies[id].throwCollider;
                this.Body.applyForce(throwCollider, throwCollider.position, {
                    x: -gravity.x * gravity.scale * throwCollider.mass,
                    y: -gravity.y * gravity.scale * throwCollider.mass
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

            if (this.gameRender.bounds.min.x < this.screenXMin && this.player.movement.right) {
                
                this.gameRender.bounds.max.x += 3;
                this.gameRender.bounds.min.x += 3;
            }
            else if (this.gameRender.bounds.max.x > this.screenXMax && this.player.movement.left) {

                this.gameRender.bounds.max.x -= 3;
                this.gameRender.bounds.min.x -= 3;
            }


       
        }.bind(this));


        //every collision event
        this.Events.on(this.gameEngine, 'collisionStart', function (event) {


            var pairs = event.pairs;

            for (var i = 0, j = pairs.length; i != j; ++i) {
                var pair = pairs[i];
                this.log("collisionSTART: (" + pair.bodyA.label + ", " + pair.bodyB.label + ")");


                //falling rock destroy animation.
                if (pair.bodyA.collisionFilter.category == this.groundFilter || pair.bodyB.collisionFilter.category == this.groundFilter) {

                    if (pair.bodyA.label === 'falling_rock') {
                        this.falling_rocks[pair.bodyA.id].death = true;
                        this.sounds.rock_hit();
                        pair.bodyA.collisionFilter.mask = this.groundFilter;
                    } else if (pair.bodyB.label === 'falling_rock') {
                        this.falling_rocks[pair.bodyB.id].death = true;
                        this.sounds.rock_hit();
                        pair.bodyB.collisionFilter.mask = this.groundFilter;
                    }
                }

                //player collisions
                if (pair.bodyB.collisionFilter.category === this.playerFilter || pair.bodyA.collisionFilter.category === this.playerFilter) {
                    let playerBody = (pair.bodyB.collisionFilter.category === this.playerFilter) ? pair.bodyB : pair.bodyA;
                    //mark player as grounded
                    this.log("collisionStart: (%s, %s):", pair.bodyA.label, pair.bodyB.label);
                    if (pair.bodyB.collisionFilter.category === this.groundFilter || pair.bodyA.collisionFilter.category === this.groundFilter) {
                        this.log("friction 0.1");
                        this.player.body.friction = 0.1;
                        this.grounded = true;

                    }

                    //respawn player when they hit an obstacle.
                    if (pair.bodyB.collisionFilter.category === this.deathFilter) {
                        if ((pair.bodyB.label === 'falling_rock' && !this.falling_rocks[pair.bodyB.id].death) || pair.bodyB.label === 'spike') {
                            this.sounds.player_hurt();
                            this.hurt_player();

                        }

                    } else if (pair.bodyA.collisionFilter.category === this.deathFilter) {
                        if ((pair.bodyA.label === 'falling_rock' && !this.falling_rocks[pair.bodyA.id].death) || pair.bodyA.label === 'spike') {
                            this.sounds.player_hurt();
                            this.hurt_player();

                        }

                    }

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
                        let sign = this.signs[pair.bodyB.id];
                        if (sign.checkpointID > this.checkpoint) {
                            this.checkpoint = sign.checkpointID;
                            this._userSaveState.checkpoint = this.checkpoint;

                            this.player_spawn = sign.checkpointSpawn;
                        }

                        this.show_sign(sign.body.id);
                    } else if (pair.bodyA.collisionFilter.category === this.signFilter) {
                        let sign = this.signs[pair.bodyA.id];
                        if (sign.checkpointID > this.checkpoint) {
                            this.checkpoint = sign.checkpointID;
                            this._userSaveState.checkpoint = this.checkpoint;

                            this.player_spawn = sign.checkpointSpawn;
                        }
                        this.show_sign(sign.body.id);
                    }

                    //coin
                    if (pair.bodyB.collisionFilter.category === this.coinFilter) {
                        this.collect_coin(pair.bodyB.id);
                    } else if (pair.bodyA.collisionFilter.category === this.coinFilter) {
                        this.collect_coin(pair.bodyA.id);
                    }

                    //enemy chase collider
                    if (pair.bodyB.collisionFilter.category === this.enemyChaseFilter) {
                        let enemy = this.enemies[this.chase_colliders[pair.bodyB.id].enemyID];
                        this.log("will chase");

                    } else if (pair.bodyA.collisionFilter.category === this.enemyChaseFilter) {
                        let enemy = this.enemies[this.chase_colliders[pair.bodyA.id].enemyID];
                        this.log("will chase");
                    }

                    //enemy throw range
                    if (pair.bodyB.collisionFilter.category === this.enemyThrowFilter) {
                        let enemy = this.enemies[this.throw_colliders[pair.bodyB.id].enemyID];
                        enemy.isAttacking = true;
                        if (enemy.attackDelay === 0 || enemy.attackDelay > enemy.attackDelayMax - 100) {
                            enemy.attackDelay = enemy.attackDelayMax - 50;
                        }

                    } else if (pair.bodyA.collisionFilter.category === this.enemyThrowFilter) {
                        let enemy = this.enemies[this.throw_colliders[pair.bodyA.id].enemyID];
                        enemy.isAttacking = true;
                        if (enemy.attackDelay === 0 || enemy.attackDelay > enemy.attackDelayMax - 100) {
                            enemy.attackDelay = enemy.attackDelayMax - 50;
                        }
                    }

                }

                //enemyCollisions
                if (pair.bodyB.collisionFilter.category === this.enemyFilter || pair.bodyA.collisionFilter.category === this.enemyFilter) {
                    var enemy = (pair.bodyB.collisionFilter.category === this.enemyFilter) ? this.enemies[pair.bodyB.id] : this.enemies[pair.bodyA.id];
                    if (!enemy.isChasing) {
                        if (pair.bodyB.collisionFilter.category === this.patrolFilter || pair.bodyA.collisionFilter.category === this.patrolFilter) {
                            var patrol_collider = (pair.bodyB.collisionFilter.category === this.patrolFilter) ? pair.bodyB : pair.bodyA;

                            //enemy has collided with his patrol zone, we need to update his direction
                            enemy.patrol.forEach((patrol, index) => {
                                if (patrol.collisionBody.id === patrol_collider.id) {
                                    enemy.animStep = 0;
                                    switch (enemy.patrol[index].action) {
                                        case 'left':
                                            enemy.movement.left = true;
                                            enemy.movement.right = false;
                                            break;
                                        case 'right':
                                            enemy.movement.right = true;
                                            enemy.movement.left = false;
                                            break;
                                    }
                                }
                            })
                        }
                    }
                    

                    //hit death.
                    if (pair.bodyB.collisionFilter.category === this.deathFilter || pair.bodyA.collisionFilter.category === this.deathFilter)
                        this.log("enemy hit death zone.");
                }

                //projectile hits lever
                if (pair.bodyA.collisionFilter.category === this.player_proj || pair.bodyB.collisionFilter.category === this.player_proj) {
                    if (pair.bodyB.collisionFilter.category === this.leverFilter) {
                        this.activate_lever(pair.bodyB.id);
                    } else if (pair.bodyA.collisionFilter.category === this.leverFilter) {
                        this.activate_lever(pair.bodyA.id);
                    }


                    
                }

                //destroy projectiles based on mask.
                if (pair.bodyA.collisionFilter.category === this.player_proj || pair.bodyA.collisionFilter.category === this.enemy_proj) {
                    

                    if (pair.bodyB.collisionFilter.category === this.enemyFilter) {
                        this.log("enemy hit player projectile.");
                        this.log(pair.bodyB)
                        this.enemies[pair.bodyB.id].forceNeeded = true;

                        if (this.get_projectile_collision_direction(pair.bodyA, pair.bodyB))
                            this.enemies[pair.bodyB.id].forceToApply = { x: 0.04, y: 0 };
                        else
                            this.enemies[pair.bodyB.id].forceToApply = { x: -0.04, y: 0 };

                        this.hurt_enemy(this.enemies[pair.bodyB.id]);
                    } else if (pair.bodyB.collisionFilter.category === this.playerFilter) {
                        this.hurt_player();
                    }
                    this.removeProjectile(pair.bodyA);
                }
                else if (pair.bodyB.collisionFilter.category === this.player_proj || pair.bodyB.collisionFilter.category === this.enemy_proj) {
                    

                    if (pair.bodyA.collisionFilter.category === this.enemyFilter) {
                        this.log("enemy hit player projectile.");
                        this.log(pair.bodyA)
                        this.enemies[pair.bodyA.id].forceNeeded = true;

                        if (this.get_projectile_collision_direction(pair.bodyB, pair.bodyA))
                            this.enemies[pair.bodyA.id].forceToApply = { x: 0.04, y: 0 };
                        else
                            this.enemies[pair.bodyA.id].forceToApply = { x: -0.04, y: 0 };

                        this.hurt_enemy(this.enemies[pair.bodyA.id]);
                    } else if (pair.bodyA.collisionFilter.category === this.playerFilter) {
                        this.hurt_player();
                    }
                    this.removeProjectile(pair.bodyB);
                }

                //coin collision for non static coins.
                if (pair.bodyB.collisionFilter.category === this.coinFilter && this.coins[pair.bodyB.id]) {
                    let coin = this.coins[pair.bodyB.id];
                    coin.body.collisionFilter.mask = coin.body.collisionFilter.mask | this.playerFilter;

                } else if (pair.bodyA.collisionFilter.category === this.coinFilter && this.coins[pair.bodyA.id]) {
                    let coin = this.coins[pair.bodyA.id];
                    coin.body.collisionFilter.mask = coin.body.collisionFilter.mask | this.playerFilter;
                }
            }
        }.bind(this));

        this.Events.on(this.gameEngine, "collisionActive", function (event) {
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

                    //nearDoor
                    if (pair.bodyB.collisionFilter.category === this.doorFilter) {
                        let door = this.doors[pair.bodyB.id]
                        if (this.interact && door.leversActivated === door.leversRequired)
                            this.open_door(pair.bodyB.id);
                    } else if (pair.bodyA.collisionFilter.category === this.doorFilter) {
                        let door = this.doors[pair.bodyA.id]
                        if (this.interact && door.leversActivated === door.leversRequired)
                            this.open_door(pair.bodyA.id);
                    }

                    //nearLever
                    if (pair.bodyB.collisionFilter.category === this.leverFilter) {
                        if (this.interact)
                            this.activate_lever(pair.bodyB.id);
                    } else if (pair.bodyA.collisionFilter.category === this.leverFilter) {
                        if (this.interact)
                            this.activate_lever(pair.bodyA.id);
                    }

                    //enemy throw range
                    if (pair.bodyB.collisionFilter.category === this.enemyThrowFilter) {
                        let enemy = this.enemies[this.throw_colliders[pair.bodyB.id].enemyID];
                        if (enemy.isAttacking) {
                            if (enemy.attackDelay === enemy.attackDelayMax) {
                                this.throw_projectile(enemy.body, 'scythe', this.player.body.position.x, this.player.body.position.y, this.speed.enemy_proj);
                                enemy.attackDelay = 0;
                            }
                            enemy.attackDelay++;
                        }
                        

                    } else if (pair.bodyA.collisionFilter.category === this.enemyThrowFilter) {
                        let enemy = this.enemies[this.throw_colliders[pair.bodyA.id].enemyID];
                        if (enemy.isAttacking) {
                            if (enemy.attackDelay === enemy.attackDelayMax) {
                                this.throw_projectile(enemy.body, 'scythe', this.player.body.position.x, this.player.body.position.y, this.speed.enemy_proj);
                                enemy.attackDelay = 0;
                            }
                            enemy.attackDelay++;
                        }
                        
                    }
                }
            }
        }.bind(this));

        this.Events.on(this.gameEngine, 'collisionEnd', function (event) {
            var pairs = event.pairs;

            for (var i = 0, j = pairs.length; i != j; ++i) {
                var pair = pairs[i];
                this.log("collisionEND: (" + pair.bodyA.label + ", " + pair.bodyB.label + ")");
                


                //player collisions
                if (pair.bodyA.collisionFilter.category === this.playerFilter || pair.bodyB.collisionFilter.category === this.playerFilter) {
                    this.interact = false;
                    //we are no longer on the ground.
                    if (pair.bodyA.collisionFilter.category == this.groundFilter || pair.bodyB.collisionFilter.category == this.groundFilter) {
                        this.grounded = false;
                        this.log("friction 0");
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
                                this.player.body.render.sprite.texture = '/Games/1/images/player/' + this.character_path + '/L.png';
                            } else if (pair.bodyA.position.x > pair.bodyB.position.x) { //right of ladder
                                this.log("right of ladder");
                                this.player.body.render.sprite.texture = '/Games/1/images/player/' + this.character_path + '/R.png';
                            }




                        } else if (pair.bodyA.collisionFilter.category == this.ladderFilter) {
                            this.nearLadder = false;
                            this.climbing = false;
                            this.player.movement.climbUp = false;
                            this.player.movement.climbDown = false;
                            this.climbAnimStep = 0;

                            if (pair.bodyA.position.x < pair.bodyB.position.x) { //left of ladder
                                this.log("left of ladder");
                                this.player.body.render.sprite.texture = '/Games/1/images/player/' + this.character_path + '/L.png';
                            } else if (pair.bodyA.position.x > pair.bodyB.position.x) { //right of ladder
                                this.log("right of ladder");
                                this.player.body.render.sprite.texture = '/Games/1/images/player/' + this.character_path + '/R.png';
                            }
                        }
                    } else 
                        this.nearLadder = false;

                    //enemy throw range
                    if (pair.bodyB.collisionFilter.category === this.enemyThrowFilter) {
                        let enemy = this.enemies[this.throw_colliders[pair.bodyB.id].enemyID];
                        enemy.isAttacking = false;
                    } else if (pair.bodyA.collisionFilter.category === this.enemyThrowFilter) {
                        let enemy = this.enemies[this.throw_colliders[pair.bodyA.id].enemyID];
                        enemy.isAttacking = false;
                    }

                    if (pair.bodyB.collisionFilter.category == this.signFilter || pair.bodyA.collisionFilter.category == this.signFilter)
                        this.hide_sign();
                }
            }
        }.bind(this));
    }

    characterControls() {
        //user controls A(LEFT), D(RIGHT), {SPACE}(JUMP)
        document.addEventListener('keydown', function (event) {

            //pause on escape
            if (event.code === 'Escape') {
                this.toggle_pause(); //UNDO LATER
            }

            //dont pause with inventory open
            if (event.code === 'Tab') {
                event.preventDefault();
                if (!this.inv_open) {
                    this.inv_open = true;
                } else if (this.inv_open) {
                    this.inv_open = false;
                }
            }

            if (!this.isPaused) {
                if (event.code === "Space") { //UP (i.e. jump)
                    event.preventDefault();
                    this.player.movement.up = true;
                }

                if (event.code === 'KeyW') { //CLIMB
                    this.player.movement.climbUp = true;
                }

                if (event.code === 'KeyA') { //LEFT
                    this.player.movement.left = true;
                    this.player.facing = "left";
                }
                if (event.code === 'KeyD') { //RIGHT
                    this.player.movement.right = true;
                    this.player.facing = "right";
                }

                if (event.code === 'KeyS') { //DOWN
                    this.player.movement.climbDown = true;

                }

                if (event.code === 'KeyE') { //interact
                    this.interact = true;
                }
            }

        }.bind(this));


        document.addEventListener('keyup', function (event) {

            if (!this.isPaused) {
                if (event.code === "Space") { //UP (i.e. jump)
                    this.player.movement.up = false;
                }
                if (event.code === 'KeyA') { //LEFT
                    this.player.movement.left = false;
                    this.player.animStep = 0;
                    if (!this.climbing)
                        this.player.body.render.sprite.texture = '/Games/1/images/player/' + this.character_path + '/L.png';
                }
                if (event.code === 'KeyD') { //RIGHT
                    this.player.movement.right = false;
                    this.player.animStep = 0;
                    if (!this.climbing)
                        this.player.body.render.sprite.texture = '/Games/1/images/player/' + this.character_path + '/R.png';
                }
                if (event.code === 'KeyS') {
                    this.player.movement.climbDown = false;
                }
                if (event.code === 'KeyW') {
                    this.player.movement.climbUp = false;
                }
                if (event.code === 'KeyE') {
                    this.interact = false;
                }
            }
            
        }.bind(this));
    }

    move(body, direction_type) {
        
        if (direction_type === "left") {
            if (body === this.player.body) {
                if (this.screenXMin > 0 && body.position.x - this.screenXMin < ((2 * this.screenX) / 3)) {
                    this.screenXMin -= 10;
                    this.screenXMax -= 10;
                }

                if (Math.abs(body.velocity.x) <= this.max_velocity) {
                    if (!this.grounded)
                        this.Body.applyForce(body, { x: body.position.x, y: body.position.y }, { x: -0.01, y: 0 })
                    else {
                        this.Body.applyForce(body, { x: body.position.x, y: body.position.y }, { x: -0.02, y: 0 })

                    }

                }
            } else {
                if (Math.abs(body.velocity.x) <= this.max_velocity) {
                    this.Body.applyForce(body, { x: body.position.x, y: body.position.y }, { x: -0.04, y: 0 });
                }
            }
        }
        else if (direction_type === "right") {
            if (body === this.player.body) {
                if (this.screenXMax < this.game_width && body.position.x - this.screenXMin > (this.screenX / 3)) {
                    this.screenXMin += 10;
                    this.screenXMax += 10;
                }

                if (Math.abs(body.velocity.x) <= this.max_velocity) {
                    if (!this.grounded)
                        this.Body.applyForce(body, { x: body.position.x, y: body.position.y }, { x: 0.01, y: 0 })
                    else {
                        this.Body.applyForce(body, { x: body.position.x, y: body.position.y }, { x: 0.02, y: 0 })

                    }
                }
            } else {
                if (Math.abs(body.velocity.x) <= this.max_velocity) {
                    this.Body.applyForce(body, { x: body.position.x, y: body.position.y }, { x: 0.04, y: 0 });
                }
            }
            
            
        } else if (direction_type === "up") {
            //applying upward force on player body.
            this.Body.applyForce(body, { x: body.position.x, y: body.position.y }, { x: 0, y: -0.05 });

        } else if (direction_type == "ladderUp") {
            this.Body.translate(body, { x: 0, y: -5 });
        } else if (direction_type == "ladderDown") {
            this.Body.translate(body, { x: 0, y: 5 });
        } else if (direction_type == "ladderLeft") {
            this.Body.translate(body, { x: -5, y: 0 });
        } else if (direction_type == "ladderRight") {
            this.Body.translate(body, { x: 5, y: 0 });
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
        let patrol = enemy.patrol
        let chaseCollider = enemy.chaseCollider;
        let throwCollider = enemy.throwCollider;
        patrol.forEach((patrolInstance) => {
            Matter.Composite.remove(this.gameWorld, patrolInstance.collisionBody);
        })
        Matter.Composite.remove(this.gameWorld, chaseCollider);
        Matter.Composite.remove(this.gameWorld, throwCollider);

        this.log("remove enemy id=%d", body.id);
        Matter.Composite.remove(this.gameWorld, body);
        Matter.Composite.remove(this.gameWorld, hb);

        delete this.enemies[body.id];
    }

    respawn() {
        Matter.Composite.remove(this.gameWorld, this.player.body);
        this.player = this.createPlayer();
        this.World.add(this.gameWorld, this.player.body);


        this.fix_render_bounds();
        
        
    }

    fix_render_bounds() {
        if (this.player.body.position.x - this.screenX / 2 < 0) {
            this.screenXMin = 0; //bounded by left wall;
        } else if (this.player.body.position.x + this.screenX / 2 > this.game_width) {
            this.screenXMin = this.game_width - this.screenX; //bounded by right wall.
        }
        else if (this.player.body.position.x - this.screenX / 2 > 0) {
            this.screenXMin = this.player.body.position.x - this.screenX / 2; //not bounded by either left or right walls.
        }

        if (this.player.body.position.x + this.screenX / 2 > this.game_width && this.screenXMin !== 0) {
            this.screenXMax = this.game_width; //bounded by right wall.
        } else if (this.player.body.position.x + this.screenX / 2 < this.game_width && this.screenXMin !== 0) {
            this.screenXMax = this.player.body.position.x + this.screenX / 2; //not bounded by either left or right walls.
        } else if (this.screenXMin === 0) {
            this.screenXMax = this.screenX; //bounded by left wall.

        }
        this.gameRender.bounds.min.x = this.screenXMin;
        this.gameRender.bounds.max.x = this.screenXMax;
    }
    hurt_player() {
        //TODO
        this.lives--;
        this._userSaveState.lives = this.lives;
        if (this.lives == 0) {
            this.checkpoint = this.default_checkpoint;
            this._userSaveState.checkpoint = this.checkpoint;
            this.player_spawn = this.default_spawn;
            this.respawn();
            this.lives = this.maxLives;
            this._userSaveState.lives = this.lives;
            this.sync_health_icons();
        } else {
            this.sync_health_icons();
        }
        this.respawn();
        
    }

    sync_health_icons() {
        let current_life = this.lives;
        this.log("current life: %d", current_life);
        this.life_arr.forEach((body, index) => {
            if (current_life >= 2) {
                this.log("setting index: %d to %d", index, current_life);
                body.render.sprite.texture = '/Games/1/images/UI/heart_full.png';
                current_life -= 2;
            } else if (current_life >= 1) {
                this.log("setting index: %d to %d", index, current_life);
                body.render.sprite.texture = '/Games/1/images/UI/heart_half.png';
                current_life -= 1;
            } else if (current_life == 0) {
                this.log("setting index: %d to %d", index, current_life);
                body.render.sprite.texture = '/Games/1/images/UI/heart_empty.png';
            }

        });
    }

    createPlayer() {
        var playerBody = this.Bodies.rectangle(this.player_spawn.x, this.player_spawn.y, 20, 70, {
            label: "player",
            isStatic: false,
            inertia: Infinity, //Prevent rotation.
            collisionFilter: {
                category: this.playerFilter,
                mask: this.groundFilter | this.deathFilter | this.enemyChaseFilter | this.enemyThrowFilter | this.enemy_proj | this.ladderFilter | this.wallFilter | this.chestFilter | this.signFilter | this.coinFilter | this.doorFilter | this.leverFilter
            },
            render: {
                sprite: {
                    texture: '/Games/1/images/player/' + this.character_path + '/R.png',
                    xScale: 2.3,
                    yScale: 2.3,
                    yOffset: 0.04
                }
            }
        });

        var player = {
            body: playerBody,
            facing: "right",
            movement:
            {
                left: false,
                right: false,
                up: false,
                climbDown: false,
                climbUp: false
            },
            animStep: 0,
            animMax: 5,
            animRate: 10
        }
        return player;
    }

    spawn_falling_rock(x, y) {
        var falling_rock = this.Bodies.rectangle(x, y + 5, 40, 30, {
            label: "falling_rock",
            isStatic: false,
            inertia: Infinity, //Prevent rotation.
            collisionFilter: {
                category: this.deathFilter,
                mask: this.groundFilter | this.playerFilter | this.enemyFilter
            },
            render: {
                sprite: {
                    texture: '/Games/1/images/world/rock_falling.png',
                    xScale: 1,
                    yScale: 1
                }
            }
        });

        this.falling_rocks[falling_rock.id] = {
            body: falling_rock,
            animStep: 0,
            animMax: 3,
            animRate: 5,
            death: false
        }

        this.World.add(this.gameWorld, falling_rock);
    }

    throwAnimation(dir) {
        this.player.body.render.sprite.texture = '/Games/1/images/player/' + this.character_path + '/throw/' + dir + '_' + this.throwAnimStep + '.png';
        this.throwAnimStep++;

        if (this.throwAnimStep > 3) {
            this.throwAnimStep = 0;
            this.player.body.render.sprite.texture = '/Games/1/images/player/' + this.character_path + '/' + dir + '.png';
            clearInterval(this.throwAnim);
        }
    }

    throw_projectile(originBody, proj_type, x_1, y_1, throwspeed) {
        var x_2 = originBody.position.x;
        var y_2 = originBody.position.y;
        this.log("click at world position: (%s,%s)\nplayer at world position: (%s,%s)", x_1, y_1, x_2, y_2);
        var dir = 'R';
        if (x_1 < x_2)
            dir = 'L';

        var v_1 = this.Vector.create(x_1, y_1);
        var v_2 = this.Vector.create(x_2, y_2);
        let proj;
        if (proj_type === 'rock') {
            proj = this.Bodies.rectangle(x_2, y_2, 5, 5, {
                label: "player_proj",
                collisionFilter: {
                    category: this.player_proj,
                    mask: this.groundFilter | this.wallFilter | this.deathFilter | this.enemyFilter | this.leverFilter
                },
                isStatic: false,
                frictionAir: 0,
                render: {
                    //fillStyle: "#7a0a85",
                    sprite: {
                        texture: '/Games/1/images/player/projectiles/Rock.png'
                    }
                }
            });
            this.World.add(this.gameWorld, proj);
            this.projectiles[proj.id] = {
                body: proj,
                gravityAffect: false
            }

            if (this.throwAnim === undefined)
                this.throwAnim = setInterval(this.throwAnimation.bind(this), 60, dir);
            else {
                clearInterval(this.throwAnim);
                this.throwAnim = setInterval(this.throwAnimation.bind(this), 60, dir);
            }

        } else if (proj_type === 'scythe') {
            this.enemies[originBody.id].isThrowing = true;

            proj = this.Bodies.rectangle(x_2, y_2 - 10, 80, 20, {
                label: "enemy_proj",
                collisionFilter: {
                    category: this.enemy_proj,
                    mask: this.groundFilter | this.wallFilter | this.deathFilter | this.playerFilter
                },
                isStatic: false,
                frictionAir: 0,
                render: {
                    //fillStyle: "#7a0a85",
                    sprite: {
                        texture: '/Games/1/images/enemy/projectiles/scythe_' + dir + '.png',
                        xScale: 0.2,
                        yScale: 0.2
                    }
                }
            });
            this.World.add(this.gameWorld, proj);
            
            this.projectiles[proj.id] = {
                body: proj,
                gravityAffect: false
            }
        }


        
        var angle = this.Vector.angle(v_1, v_2);
        this.log("angle between two points in degrees: %d", (180 * angle / Math.PI) % 360);
        this.Body.rotate(proj, angle);
        var v_x = -1 * (Math.cos(angle) * throwspeed);
        var v_y = -1 * (Math.sin(angle) * throwspeed);
        this.Body.applyForce(proj, { x: proj.position.x, y: proj.position.y }, { x: v_x, y: v_y });
        this.sounds.rock_throw();
        this.log("throwing projectile id=%d", proj.id);
    }

    removeProjectile(body) {
        this.log("remove projectile id=%d", body.id);
        delete this.projectiles[body.id];
        Matter.Composite.remove(this.gameWorld, body);
    }

    toggle_pause() {
        this.clearAllPlayerInputs();
        if (this.isPaused)
            this.unpause_game();
        else
            this.pause_game();
    }

    pause_game() {
        this.isPaused = true;
        for (var id in this.projectiles) {
            var body = this.projectiles[id].body;
            body.isStatic = true;
        }
        for (var id in this.falling_rocks) {
            var body = this.falling_rocks[id].body;
            body.isStatic = true;
        }
        if (!this.climbing)
            this.player.body.isStatic = true;
    }

    unpause_game() {
        this.isPaused = false;
        for (var id in this.projectiles) {
            var body = this.projectiles[id].body;
            body.isStatic = false;
        }
        for (var id in this.falling_rocks) {
            var body = this.falling_rocks[id].body;
            body.isStatic = false;
        }
        if (!this.climbing)
            this.player.body.isStatic = false;
    }

    open_chest(id) {
        this.sounds.open_chest();
        this.chests[id].body.render.sprite.texture = '/Games/1/images/world/chest_open.png';
        this.chests[id].isOpen = true;

        this.chests[id].inventory.forEach((value) => {
            this.log("player recieves: type: " + value.type + " count: " + value.count);
            switch (value.type) {
                case "gold":
                    this.project_gold(value.count, { x: this.chests[id].body.position.x, y: this.chests[id].body.position.y - 10});
                    break;
                default:
                    this.log("unknown type: '" + value.type + "'");
                    break;
            }
        })
    }

    open_door(id) {
        if (this.doors[id].isOpen) {
            //go through door
            console.log("door is open");
        } else {
            //open door
            console.log("opening door");
            this.sounds.open_door();
            this.doors[id].animStart = true;
            this.doors[id].isOpen = true;
        }
    }

    activate_lever(id) {
        var lever = this.levers[id];
        var associatedDoor = lever.door;

        if (lever.isActivatable && !associatedDoor.isOpen) {
            associatedDoor.leversActivated++;
            lever.isActivatable = false;
            this.sounds.pull_lever();
            lever.animStart = true;
            associatedDoor.indicators.parts[associatedDoor.leversActivated].render.fillStyle = '#00ff00';
        }

    }

    project_gold(amount, point) {
        for (var i = 0; i < amount; i++) {
            let coin = this.Bodies.rectangle(point.x, point.y, 50, 50, {
                label: "coin",
                isStatic: false,
                inertia: Infinity,
                collisionFilter: {
                    category: this.coinFilter,
                    mask: this.groundFilter | this.deathFilter | this.wallFilter
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
                animation_state: 0,
            };
            this.coinlaunchArray.push(coin);
        }
        
        this.intervalID = setInterval(() => {
            
            if (this.coinlaunchArray.length > 0) {
                let coin = this.coinlaunchArray[0];
                this.World.add(this.gameWorld, coin);

                let speed = 0.1;
                let randAngle = Math.random() * (698 / 1000) + 1.22173; //between 70 and 110 degrees
                //apply force to coin from chest.
                var v_x = -1 * (Math.cos(randAngle) * speed);
                var v_y = -1 * (Math.sin(randAngle) * speed);
                this.Body.applyForce(coin, { x: coin.position.x, y: coin.position.y }, { x: v_x, y: v_y });

                this.coinlaunchArray.splice(0, 1);
            } else
                clearInterval(this.intervalID);
            

        }, 65);
    }

    collect_coin(id) {
        
        this.gold += this.coins[id].count;
        this._userGameState.gold = this.gold;
        this.sounds.coin();
        this.World.remove(this.gameWorld, this.coins[id].body);
        this.log("deleting coin[%d]", id);
        delete this.coins[id];
    }

    show_sign(id) {
        this.sounds.menu_open();
        this.text_window.render.visible = true;

        this.messageText = this.signs[id].text;
    }

    hide_sign() {
        this.text_window.render.visible = false;
        
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

    clearAllPlayerInputs() {
        if (this.player.movement.left && this.grounded) {
            this.player.body.render.sprite.texture = '/Games/1/images/player/' + this.character_path + '/L.png';
        } else if (this.player.movement.right && this.grounded) {
            this.player.body.render.sprite.texture = '/Games/1/images/player/' + this.character_path + '/R.png';
        }
        this.player.movement.left = false;
        this.player.movement.right = false;
        this.player.movement.up = false;
        this.player.movement.climbDown = false;
        this.player.movement.climbUp = false;
        this.throwing = false;
    }

    outOfBounds(body) {
        if (body.position.x > this.gameRender.bounds.max.x || body.position.x < this.gameRender.bounds.min.x || body.position.y < this.gameRender.bounds.min.y || body.position.y > this.gameRender.bounds.max.y)
            return true;
        else
            return false;
    }

    //for removing logging
    log(msg, ...params) {
        if (this.logging)
            this.log(msg, ...params)
    }
}