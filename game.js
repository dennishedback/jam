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
        obj.vel = new Victor(0, 0);
        obj.acc = new Victor(0, 0);
        obj.sprite = new Image();
        return obj;
    },

    draw: function(context) {
        context.drawImage(this.sprite, this.pos.x, this.pos.y);
    },

    update: function() {
        // Add current acceleration to velocity
        this.vel = this.vel.add(this.acc);
        // Add current vertical velocity to vertical position
        this.pos.y += this.vel.y;
    },

    accelerate: function(accel_vector) {
        this.acc = this.acc.add(accel_vector);
    },

    jump: function() {
        if (this.state == GrisRunnerStates.DEFAULT) {
            this.state = GrisRunnerStates.JUMPING;
            this.vel.y += -10;  // Negative is up
            this.acc.y = .5;
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
        noise = Perlin1D();

    init();
    run();

    $("#canvas").click(function() {
        grisrunner.jump();
    });

    function init() {
        grisrunner.pos.x = width / 2;
        grisrunner.pos.y = height / 2;
        grisrunner.vel.x = 5;
        grisrunner.sprite.src = "assets/grisrunner.png";

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
        randomTerrainBuffer(); // For testing purposes
    };

    function randomTerrainBuffer() {
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
        grisrunner.update();
        handleCollisions();
    };

    function updateTerrain() {
        for (var i = 0; i < grisrunner.vel.x; i++) {
            terrainBuffer.shift();
        }
    };

    function handleCollisions() {
    };

    function render() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawTerrain();
        grisrunner.draw(context);
    };

    function drawTerrain() {
        for (var i = 0; i < width; i++) {
            context.beginPath();
            context.moveTo(i, height-50+terrainBuffer[i]);
            context.lineTo(i, height);
            context.stroke();
        }
    };
});
