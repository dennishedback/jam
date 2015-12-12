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

    create: function() {
        var obj = Object.create(this);
        obj.pos = new Victor(0, 0);
        obj.vel = new Victor(10, 0);
        obj.acc = new Victor(0, 0);
        obj.sprite = new Image();
        obj.sprite.src = "assets/grisrunner.png";

        return obj;
    },

    update: function() {
        // Add current acceleration to velocity
        this.vel = this.vel.add(this.acc);
        // Add current vertical velocity to vertical position
        this.pos.y += this.vel.y;
        console.log(this.acc.y);
    },

    accelerate: function(accel_vector) {
        this.acc = this.acc.add(accel_vector);
    },

    jump: function() {
        console.log("jump");
        if (this.state == GrisRunnerStates.DEFAULT) {
            this.state = GrisRunnerStates.JUMPING;
            this.vel.y -= 15;  // Negative is up
            this.acc.y = .5;
        }
    },

    stopJump: function() {
        console.log("stop jump");
        if (this.state == GrisRunnerStates.JUMPING) {
            this.state = GrisRunnerStates.DEFAULT;
            this.vel.y = 0;
            this.acc.y = 0;
        }
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
    var canvas = $("#canvas").get(0),
        context = canvas.getContext("2d"),
        width = canvas.width = $(window).width(),
        height = canvas.height = $(window).height(),
        colors = ["#ffffff", "#000000"],
        terrainBuffer = [],
        grisrunner = GrisRunner.create(),
        noise = Perlin1D(),
        highestPointBelowGrisRunner = 0,
        previousHighestPointBelowGrisRunner = 0;

    init();
    run();

    $(window).click(function() {
        grisrunner.jump();
        console.log("hej");
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

    function generateTerrain() {
        // Here, we generate the terrain
		var distance = 1000.0, step = 0.01;
		for (var d = 0.0; d < distance; d = d + step) {
			terrainBuffer.push(noise.getVal(d + 5));
		}
    };

    function needToGenerateMoreTerrain() {
        // Here, we determine if we need to add more terrain to the terrain
        // buffer
        return terrainBuffer.length < 3*width;
    }

    function update() {
        if (needToGenerateMoreTerrain()) {
            generateTerrain();
        }

        updateTerrain();
        grisrunner.pos.y += highestPointBelowGrisRunner - previousHighestPointBelowGrisRunner;
        grisrunner.update();
        handleCollisions();
    };

    function updateTerrain() {
        for (var i = 0; i < grisrunner.vel.x; i++) {
            terrainBuffer.shift();
        }
        previousHighestPointBelowGrisRunner = highestPointBelowGrisRunner;
        highestPointBelowGrisRunner = terrainBuffer[(width / 2) + (grisrunner.sprite.width / 2)];
        //console.log(highestPointBelowGrisRunner);
    };

    function handleCollisions() {
        if (grisrunner.state == GrisRunnerStates.JUMPING && grisrunner.pos.y > highestPointBelowGrisRunner) {
            grisrunner.pos.y = highestPointBelowGrisRunner;
            grisrunner.stopJump();
        }
    };

    function render() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawTerrain();
        context.drawImage(grisrunner.sprite, width / 2, height / 2);
    };

    function drawTerrain() {
        for (var i = 0; i < width; i++) {
            context.beginPath();
            context.moveTo(i, height/2+grisrunner.sprite.height+terrainBuffer[i]-grisrunner.pos.y);
            context.lineTo(i, height);
            context.stroke();
        }
    };
});
