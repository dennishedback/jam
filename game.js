Game = {};

Game.Intro = function(){};
Game.Menu = function(){};
Game.Play = function(){};

Game.Intro.prototype =
{
    preload: function()
    {
        this.loading_text = this.game.add.text(
            game.world.centerX,
            game.world.centerY,
            "loading...",
            {fill: "#ffffff"}
        );

        this.loading_text.anchor.setTo(0.5);
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAligNHorizontally = true;
        this.scale.pageAlignVertically = true;
        this.load.image('splash', 'assets/splash.png');

        this.load.script(
            'pixelate',
            'https://cdn.rawgit.com/photonstorm/phaser/master/filters/Pixelate.js'
        );

    //this.load.audio('intro', '../assets/intro.mp3');
    },

    create: function()
    {
        this.game.stage.backgroundColor = '#ffffff';
        var pixelate = game.add.filter('Pixelate');
        this.loading_text.destroy(true);
        var icebergman = this.game.add.sprite(0, 0, 'splash');
        icebergman.filters = [pixelate];
        pixelate.sizeX = 100;
        pixelate.sizeY = 100;

        var tween = game.add.tween(pixelate).to(
            { sizeX: 1, sizeY: 1 },
            5000,
            "Quad.easeInOut",
            true
        );

        tween.onComplete.add(function() {
            var text = this.game.add.text(
                game.world.centerX,
                158,
                "The objective is to run as far as possible\n Press SPACE to start",
                {fill: "#000000", align:"center"}
            );
            text.anchor.setTo(0.5);
            text.alpha = 1.0;
        });

        //intro_track = this.game.add.audio('intro');

        /*game.sound.setDecodedCallback(
            intro_track,
            function() {
                intro_track.loopFull(0.6)
            },
            this
        );*/

    },

    update: function() {
        this.game.input.keyboard.onDownCallback = function(e) {
            if (e.keyCode == 32) {
                this.game.input.keyboard.onDownCallback = function(e) {
                    if (e.keyCode == 82) {
                        numberOfTankers = 0;
                        this.game.state.restart(false, true);
                    }
                }
                //intro_track.stop();
                this.game.state.start("Play", true, false);
            }
        }
    },
};

var playing = false;

Game.Play.prototype =
{
    preload: function()
    {
        this.loading_text = this.game.add.text(
            game.world.centerX,
            game.world.centerY,
            "loading...",
            {fill: "#ffffff"}
        );

        this.loading_text.anchor.setTo(0.5);

        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        game.stage.smoothed = false;

        this.load.image('grisrunner', 'assets/grisrunner_normal_run_1.png');
        //this.load.audio('splash2', '../assets/splash2.mp3');
        //this.load.audio('pcp', '../assets/pcp.mp3');
    },

    genTerrain: function(distance)
    {
        this.terrainSegment.push(game.add.sprite(distance, 330, 'empty'));

        this.game.physics.p2.enableBody(
            this.terrainSegment[this.terrainSegment.length - 1],
            false
        );

        this.terrainSegment[this.terrainSegment.length - 1].body.clearShapes();
        this.terrainSegment[this.terrainSegment.length - 1].body.static = true;

        var terrain = [[0, 100]];
        this.noise.setAmplitude(100);
        this.noise.setScale(0.01);

        for (var i = 0; i <= 0 + 500.0; i = i+50.0) {
            var height = this.noise.getVal(distance + i);
            var x = i;
            terrain.push([x, -height]);
        }

        terrain.push([500, 100]);
        console.log("WAT", terrain);
        var graphics = game.add.graphics(distance, 330);

        graphics.lineWidth = 0;
        graphics.beginFill(0x666666);

        graphics.moveTo(distance, 200);

        terrain.forEach(function(vertex) {
            graphics.lineTo(vertex[0], vertex[1]);
        });

        graphics.endFill();

        window.graphics = graphics;
        this.terrainSegment[this.terrainSegment.length - 1].body.addPolygon( {}, terrain);
    },

    create: function()
    {
        this.loading_text.destroy(true);
        this.game.camera.roundPx = false;
        this.game.stage.backgroundColor = '#ffffff';
        this.game.physics.startSystem(Phaser.Physics.P2JS);
        this.game.physics.p2.gravity.y = 1500;

        // Prevents menu popping up on mouse2 down
        this.game.canvas.oncontextmenu = function (e) { e.preventDefault(); }

        this.terrainSegment = [];

        //this.splash = this.add.audio('splash2');
        function Perlin1D() {
            var MAX_VERTICES = 256;
            var MAX_VERTICES_MASK = MAX_VERTICES -1;
            var amplitude = 1;
            var scale = 1;

            var r = [];

            for ( var i = 0; i < MAX_VERTICES; ++i ) {
                r.push(Math.random());
            }

            var getVal = function( x ){
                var scaledX = x * scale;
                var xFloor = Math.floor(scaledX);
                var t = scaledX - xFloor;
                var tRemapSmoothstep = t * t * ( 3 - 2 * t );

                /// Modulo using &
                var xMin = xFloor & MAX_VERTICES_MASK;
                var xMax = ( xMin + 1 ) & MAX_VERTICES_MASK;

                var y = lerp( r[ xMin ], r[ xMax ], tRemapSmoothstep );

                return y * amplitude;
            };

            var lerp = function(a, b, t ) {
                return a * ( 1 - t ) + b * t;
            };

            return {
                getVal: getVal,
                setAmplitude: function(newAmplitude) {
                    amplitude = newAmplitude;
                },
                setScale: function(newScale) {
                    scale = newScale;
                }
            };
        };

        this.noise = Perlin1D();

        this.world.setBounds(0,0,10000, 400);

        this.player = this.game.add.sprite(10,10, 'grisrunner');

        this.player.anchor.setTo(0.5);

        //this.player.animations.add('left', ['iceman-left-1.png', 'iceman-left-2.png'], 5, true);
        //this.player.animations.add('right', ['iceman-right-1.png', 'iceman-right-2.png'], 5, true);
        //this.player.animations.add('back', ['iceman-back-1.png', 'iceman-back-2.png'], 5, true);
        //this.player.animations.add('front', ['iceman-front-1.png', 'iceman-front-2.png'], 5, true);
        //this.player.animations.play('front');
        this.game.physics.p2.enableBody(this.player, false);

        this.game.camera.follow(this.player);

        //move player with cursor keys
        this.cursors = this.game.input.keyboard.createCursorKeys();

        /*
           pcp = game.add.audio('pcp');

           function start() {
           if (!playing)
           pcp.loopFull(0.6);
           playing = true;
           }

           game.sound.setDecodedCallback(pcp, start, this);
        */
        this.genTerrain(0);
        this.genTerrain(500);
        this.genTerrain(1000);
        this.genTerrain(1500);
        this.genTerrain(2000);
        this.genTerrain(2500);
    },

    shutdown: function()
    {
	  /*
		 shake = new Phaser.Plugin.Shake(game);
		 game.plugins.add(shake);
		 */

        this.splash.destroy(true);
        this.map.destroy(true);
        this.backgroundLayer.destroy(true);
        //this.blockedLayer.destroy(true);
        //this.world.destroy(true);
        tankers.destroy(true);
        text.destroy(true);
        this.player.destroy(true);
        StandingInWaterFilter.destroy(true);
        //pcp.destroy(true);
    },

    update: function()
    {
        const BASE_VELOCITY = 400;

        if (this.player.body) {

            if (this.player.body.velocity.x < 400) {
                this.player.body.velocity.x = 400;
            }

            if (this.input.activePointer.leftButton.isDown) {
                this.player.body.velocity.y -= 100;
            }

            if (this.input.activePointer.rightButton.isDown) {
                this.player.body.velocity.x += 100;
            }
            //console.log(this.player.position);
            //player movement
            //this.player.body.velocity.y = 0;
            //this.player.body.velocity.x = 0;

            /*

            if(this.cursors.up.isDown) {
                this.player.body.velocity.y -= 50;
            }
            else if(this.cursors.down.isDown) {
                this.player.body.velocity.y += 50;
            }
            if(this.cursors.left.isDown) {
                this.player.body.velocity.x -= 50;
            }
            else if(this.cursors.right.isDown) {
                this.player.body.velocity.x += 50;
            }

            if(this.cursors.up.isDown) {
                this.player.animations.play('back');
            }
            else if(this.cursors.down.isDown) {
                this.player.animations.play('front');
            }
            else if(this.cursors.left.isDown) {
                this.player.animations.play('left');
            }
            else if(this.cursors.right.isDown) {
                this.player.animations.play('right');
            }
            */
            /*
             this.game.physics.arcade.collide(this.player, tankers);
             this.game.physics.arcade.collide(this.player, icebergs);
             this.game.physics.arcade.collide(icebergs, icebergs);
             this.game.physics.arcade.collide(icebergs, tankers, tanker_collision_callback, null, this);
             */
        }
    },

    render: function()
    {
        this.game.debug.geom(this.line);
    }
}

var game = new Phaser.Game(640, 400, Phaser.AUTO, '', Game.Intro);

game.state.add("Play", Game.Play);
game.state.add("Intro", Game.Intro);
