Game = {};

Game.Intro = function(){};
Game.Menu = function(){};
Game.Play = function(){};

Game.Intro.prototype = 
{
  preload: function()
  {
    this.loading_text = this.game.add.text(game.world.centerX, game.world.centerY, "loading...",  {fill: "#ffffff"});
    this.loading_text.anchor.setTo(0.5);
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.pageAligNHorizontally = true;
    this.scale.pageAlignVertically = true;
    this.load.image('splash', 'assets/splash.png');
    this.load.script('pixelate', 'https://cdn.rawgit.com/photonstorm/phaser/master/filters/Pixelate.js');
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
    var tween = game.add.tween(pixelate).to( { sizeX: 1, sizeY: 1 }, 5000, "Quad.easeInOut", true)
    tween.onComplete.add(function(){
      var text = this.game.add.text(game.world.centerX, 150, "The objective is to run as far as possible\n While eating food to grow fat and fart to gain\nextra speed\n",  {fill: "#ffffff", align:"center"});
      text.anchor.setTo(0.5);
      text.alpha = 0.1;
    });

    //intro_track = this.game.add.audio('intro');

    //game.sound.setDecodedCallback(intro_track, function() { intro_track.loopFull(0.6)}, this);

  },

  update: function()
  {
    this.game.input.keyboard.onDownCallback = function(e)
    {
      if (e.keyCode == 32)
      {
        this.game.input.keyboard.onDownCallback = function(e)
        {
          if (e.keyCode == 82)
          {
            numberOfTankers = 0;
            this.game.state.restart(false, true);
          }
        }
        //intro_track.stop();
        this.game.state.start("Play", true, false);
      }
    }
  }
}

var playing = false;

Game.Play.prototype = 
{
  preload: function()
  {
    this.loading_text = this.game.add.text(game.world.centerX, game.world.centerY, "loading...",  {fill: "#ffffff"}); this.loading_text.anchor.setTo(0.5);
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;
    game.stage.smoothed = false;

    //this.load.image('ytm-tiles', '../assets/ytm-tiles.png');
    //this.load.audio('splash2', '../assets/splash2.mp3');
    //this.load.audio('pcp', '../assets/pcp.mp3');
  },

  create: function() 
  {
    this.loading_text.destroy(true);
    //game.physics.startSystem(Phaser.Physics.ARCADE);
    game.camera.roundPx = false;
    this.game.stage.backgroundColor = '#000000';

    //this.splash = this.add.audio('splash2');

    //create layer
    this.backgroundLayer = this.map.createLayer('backgroundLayer');
    console.log(this.backgroundLayer);
    //this.backgroundLayer.worldScale(0.25);
    //this.blockedLayer = this.map.createLayer('blockedLayer');
    this.world.setBounds(0,0,this.map.widthInPixels, this.map.heightInPixels);

    //this.map.setCollisionBetween(1, 100000, true, this.blockedLayer);

    tankers = this.add.group();
    tankers.enableBody = true;

    objects('Tanker', this.map, 'objectsLayer').forEach(function(tanker) {
      var _t = tankers.create(tanker.x + 210, tanker.y - (170/2), 'ytm-atlas', 'tanker.png');
      _t.body.immovable = true;
      _t.body.setSize(_t.body.width, 60, 5 , 60);
      _t.anchor.setTo(0.5);
      numberOfTankers++;
    });

    icebergs = this.add.group();
    icebergs.enableBody = true;

    objects('Iceberg', this.map, 'objectsLayer').forEach(function(iceberg) {
      var _i = icebergs.create(iceberg.x, iceberg.y, 'ytm-atlas', 'iceberg-1.png');
      _i.body.immovable = false;
      _i.body.collideWorldBounds = true;
      _i.anchor.setTo(0.5);
      _i.body.drag.x = 25;
      _i.body.drag.y = 25;
    });
    icebergs.callAll('animations.add', 'animations', 'float', ['iceberg-1.png', 'iceberg-2.png'], 1, true);

    //  And play them
    icebergs.callAll('animations.play', 'animations', 'float');  


    text = game.add.text(10, 10, "Level " + level + "\nTankers: " + numberOfTankers + "\n'R' to restart\n", { font: "30px TheFont"} );
    text.fixedToCamera = true;

    //create player
    var playerStart = objects('playerStart', this.map, 'objectsLayer')

    this.player = this.game.add.sprite(playerStart[0].x, playerStart[0].y, 'ytm-atlas', 'iceman-front-1.png');

    this.player.anchor.setTo(0.5);
    this.player.animations.add('left', ['iceman-left-1.png', 'iceman-left-2.png'], 5, true);
    this.player.animations.add('right', ['iceman-right-1.png', 'iceman-right-2.png'], 5, true);
    this.player.animations.add('back', ['iceman-back-1.png', 'iceman-back-2.png'], 5, true);
    this.player.animations.add('front', ['iceman-front-1.png', 'iceman-front-2.png'], 5, true);
    this.player.animations.play('front');
    this.game.physics.arcade.enable(this.player);

    this.player.body.collideWorldBounds = true;

    //the camera will follow the player in the world
    this.game.camera.follow(this.player);

    StandingInWaterFilter = game.add.filter('StandingInWater');

    console.log(StandingInWaterFilter);
    console.log(Phaser.Filter.StandingInWater);

    this.player.filters = [StandingInWaterFilter];

    //move player with cursor keys
    this.cursors = this.game.input.keyboard.createCursorKeys();

    pcp = game.add.audio('pcp');

    function start() {
      if (!playing)
        pcp.loopFull(0.6);
      playing = true;
    }

    game.sound.setDecodedCallback(pcp, start, this);
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
    if (this.player.body)
    {
      //player movement
      this.player.body.velocity.y = 0;
      this.player.body.velocity.x = 0;

	  /*
      if(this.cursors.up.isDown) {
        this.player.body.velocity.y -= 250;
      }
      else if(this.cursors.down.isDown) {
        this.player.body.velocity.y += 250;
      }
      if(this.cursors.left.isDown) {
        this.player.body.velocity.x -= 250;
      }
      else if(this.cursors.right.isDown) {
        this.player.body.velocity.x += 250;
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

      //this.game.physics.arcade.collide(this.player, this.blockedLayer);
	  */

      this.game.physics.arcade.collide(this.player, tankers);
      this.game.physics.arcade.collide(this.player, icebergs);
      this.game.physics.arcade.collide(icebergs, icebergs);
      this.game.physics.arcade.collide(icebergs, tankers, tanker_collision_callback, null, this);
      StandingInWaterFilter.uniforms.posY.value = game.height - (this.player.position.y - game.camera.view.y);
    }
    if (numberOfTankers == 0)
    {
      if (false)
      {
		  /*
        var text = this.game.add.text(320, 200, "Congratulations\n You beat the game!\n",  {fill: "#000000", align:"center"});
       text.fixedToCamera = true;
       text.anchor.setTo(0.5);
	   */
      } else
      this.game.state.restart(false, true);
    }
  }
}


var game = new Phaser.Game(640, 400, Phaser.AUTO, '', Game.Intro);

var GrisRunnerStates = {
    DEFAULT: "default",
    JUMPING: "jumping",
};

var GrisRunner = {
    pos: null,
    vel: null,
    acc: null,
    sprite: null,
    state: GrisRunnerStates.DEFAULT,

    create: function(x, y) {
        var obj = Object.create(this);
        obj.pos = new Victor(x, y);
        obj.vel = new Victor(10, 0); // 10 pixels per frame to the right
        obj.acc = new Victor(0, 0);
        obj.sprite = new Image();
        obj.sprite.src = "assets/grisrunner.png";

        return obj;
    },

    update: function(terrainBuffer) {
        // Add current acceleration to velocity
        this.vel = this.vel.add(this.acc);
        // Add current vertical velocity to vertical position
        this.pos = this.pos.add(this.vel);
        this.hasFootHold(terrainBuffer);
    },

    accelerate: function(accel_vector) {
        this.acc = this.acc.add(accel_vector);
    },

    jump: function() {
        if (this.state == GrisRunnerStates.DEFAULT) {
            this.state = GrisRunnerStates.JUMPING;
            this.vel.y -= 15;  // Negative is up
        }
    },

    hasFootHold: function(terrainBuffer) {
        var offset = this.pos.y + this.sprite.height;
        for (var i = this.pos.x; i < this.pos.x + this.sprite.width; i++) {
            if (offset > terrainBuffer[i]) {
                this.acc.y = 0;
                this.pos.y = terrainBuffer[i]-this.sprite.height;
            } else {
                this.acc.y = .5;
            }
        }
    },

    draw: function(context, viewport) {
        context.drawImage(this.sprite, this.pos.x - viewport.pos.x, this.pos.y - viewport.pos.y);
    },
};

function randomInRange(min, max) {
    return Math.floor(Math.random() * max) - 1;
};

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



$(document).ready(function() {
	/*
    var canvas = $("#canvas").get(0),
        context = canvas.getContext("2d"),
        width = canvas.width = $(window).width(),
        height = canvas.height = $(window).height(),
        viewport = {pos: new Victor(0,0), wl: new Victor(width, height)},
        colors = ["#ffffff", "#000000"],
        terrainBuffer = [],
        grisrunner = GrisRunner.create(0, 0),
        noise = Perlin1D(),
        highestPointBelowGrisRunner = 0,
        previousHighestPointBelowGrisRunner = 0;

    init();
    run();

    $("#canvas").click(function() {
        grisrunner.jump();
    });

    function init() {
		noise.setAmplitude(10);
		noise.setScale(2);
        context.fillStyle = colors[1];
    };

    function run() {
        // Game loop
        update();
        render();
        requestAnimationFrame(run);
    };

    function stairsTerrain(factor) {
        for (var i = 0; i < 10; i++)
            for (var j = 0; j < 2200; j++)
                terrainBuffer.push(i*factor*200);
    }

    function generateTerrain() {
        // Generates procedural terrain with perlin noise
		var distance = 1000.0, step = 0.01;
		for (var d = 0.0; d < distance; d = d + step) {
			terrainBuffer.push(noise.getVal(d + 5) + height/2+100);
		}
    };

    function needToGenerateMoreTerrain() {
        // Here, we determine if we need to add more terrain to the terrain
        // buffer
        return terrainBuffer.length < 3*width;
    }

    function update() {
        if (needToGenerateMoreTerrain()) {
            //stairsTerrain(-1);
            generateTerrain();
        }

        updateTerrain();
        grisrunner.update(terrainBuffer);
        handleCollisions();
    };

    function updateTerrain() {
        //for (var i = 0; i < grisrunner.vel.x; i++) {
            //terrainBuffer.shift();
    };

    function handleCollisions() {
    };

    function render() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        //viewport.pos.x = grisrunner.pos.x - viewport.wl.x / 2;
        //viewport.pos.y = grisrunner.pos.y - viewport.wl.y / 2;
        drawTerrain();
        grisrunner.draw(context, viewport);
    };

    function drawTerrain() {
        for (var i = 0; i < width; i++) {
            context.beginPath();
            context.moveTo(i, terrainBuffer[i]);
            context.lineTo(i, height);
            context.stroke();
        }
    };
	*/
});
