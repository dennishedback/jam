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
        /*
        for (var i = 0; i < grisrunner.vel.x; i++) {
            terrainBuffer.shift();
        }*/
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
});
