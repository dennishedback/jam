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

        this.load.image('grisrunner', 'assets/grisrunner_normal_run_1.png');
        this.load.audio('jump', './assets/jump.wav');
        this.load.audio('fart', './assets/fart.wav');
        this.load.audio('pickup', './assets/pickup_food.wav');
        this.load.audio('crash', './assets/crash.wav');
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
        });
            var text = this.game.add.text(
                game.world.centerX,
                158,
                "MOUSE1 MOUSE2 = JUMP, CONSUME POWERUP\ANY KEY TO START",
                {font: "10px Arial", fill: "#000000", align:"center"}
            );
            text.alpha = 1.0;
			text.anchor.setTo(0.5);

        //intro_track = this.game.add.audio('intro');

        /*game.sound.setDecodedCallback(
            intro_track,
            function() {
                intro_track.loopFull(0.6)
            },
            this
			);*/
		this.game.input.mouse.mouseDownCallback = function(e) {
				//intro_track.stop();
				this.game.state.start("Play", true, false);
		}.bind(this);
		this.game.input.keyboard.onDownCallback = function(e) {
				//intro_track.stop();
				this.game.state.start("Play", true, false);
		}.bind(this);

	},

	update: function() 
	{
	},
	shutdown: function shutdown()
	{
		this.game.input.mouse.mouseDownCallback = null;
		this.game.input.keyboard.onDownCallback = null;
	}
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

		//this.load.audio('splash2', '../assets/splash2.mp3');
		//this.load.audio('pcp', '../assets/pcp.mp3');
	},

	genTerrain: function(distance)
	{
		this.terrainSegment.push(game.add.sprite(distance, 330));

		this.game.physics.p2.enableBody(
				this.terrainSegment[this.terrainSegment.length - 1],
				false
				);

		this.terrainSegment[this.terrainSegment.length - 1].body.clearShapes();
		this.terrainSegment[this.terrainSegment.length - 1].body.static = true;

		var terrain = [];
		this.noise.setAmplitude(100);
		this.noise.setScale(0.01);

		for (var i = 0; i <= 500.0; i = i+(500/6.0))
		{
			var height = this.noise.getVal(distance + i);
			var x = i;
			terrain.push([x, -height]);
		}

		var interpolation = [];
		for (var i = 0; i < terrain.length; i++)
		{
			if (i && !(i % 2) && i + 1 != terrain.length)
			{
				interpolation.push([(terrain[i][0] + terrain[i+1][0])/2, (terrain[i][1] + terrain[i+1][1])/2]);
				console.log(i, terrain.length);
			}
		}

		console.table(terrain);
		console.table(interpolation);
		terrain = terrain.concat(interpolation).sort(function(p1, p2) { return p1[0] > p2[0]; });
		console.table(terrain);


		var beziered = [];

		for (var i = 0, detail = 15; i <= detail; i++)
		{
			var vertex;
			vertex = this.Bezier((1.0/detail) * i, 
					terrain[0], 
					terrain[1], 
					terrain[2], 
					terrain[8]); 

			beziered.push(vertex);
		}

		terrain = [[0, 100]].concat(beziered.reverse().concat([[500,100]]));
		//console.table(terrain);
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
		this.generatedTerrain = 0;

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

		function B1(t) { return t*t*t }
		function B2(t) { return 3*t*t*(1-t) }
		function B3(t) { return 3*t*(1-t)*(1-t) }
		function B4(t) { return (1-t)*(1-t)*(1-t) }

		this.Bezier = function Bezier(percent,C1,C2,C3,C4) {
			return [C1[0]*B1(percent) + C2[0]*B2(percent) + C3[0]*B3(percent) + C4[0]*B4(percent),
			C1[1]*B1(percent) + C2[1]*B2(percent) + C3[1]*B3(percent) + C4[1]*B4(percent)];
		}

		this.world.setBounds(0,0,10000, 400);

		this.player = this.game.add.sprite(10,10, 'grisrunner');


		this.player.anchor.setTo(0.5);

		//this.player.animations.add('left', ['iceman-left-1.png', 'iceman-left-2.png'], 5, true);
		//this.player.animations.add('right', ['iceman-right-1.png', 'iceman-right-2.png'], 5, true);
		//this.player.animations.add('back', ['iceman-back-1.png', 'iceman-back-2.png'], 5, true);
		//this.player.animations.add('front', ['iceman-front-1.png', 'iceman-front-2.png'], 5, true);
		//this.player.animations.play('front');
		this.game.physics.p2.enableBody(this.player, false);

		//this.player.body.fixedRotation = true;
		//
		this.terrainCollisionGroup = game.add.group();

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
		text.destroy(true);
		this.player.destroy(true);
		StandingInWaterFilter.destroy(true);
		//pcp.destroy(true);
	},

	update: function()
	{
		const BASE_VELOCITY = 400;

		if (this.player.body) {

			if (this.player.body.velocity.x < BASE_VELOCITY) {
				this.player.body.velocity.x = BASE_VELOCITY;
			}

			if (this.input.activePointer.leftButton.isDown) {
				this.player.body.velocity.y -= 100;
				this.game.sound.play("jump");
			}

			if (this.input.activePointer.rightButton.isDown) {
				this.player.body.velocity.x += 100;
				this.game.sound.play("fart");
			}
		}
		var t = 100, terrainLength = 500, terrainBuffer = 200;
		if (this.generatedTerrain - this.player.position.x  < terrainLength) {
			console.log("d", this.player.position.x, this.player.body.velocity.x);
			this.generatedTerrain += terrainLength;
			this.world.setBounds(0,0,this.generatedTerrain, 400);
			this.genTerrain(this.generatedTerrain);
			while (this.terrainSegment.length > 10)
			{
				this.terrainSegment[0].destroy();
				this.terrainSegment.shift();
			}
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
