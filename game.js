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

$(document).ready(function() {
    var canvas = $("#canvas").get(0),
        context = canvas.getContext("2d"),
        width = canvas.width = $(window).width(),
        height = canvas.height = $(window).height(),
        colors = ["#ffffff", "#000000"],
        terrainBuffer = [],
        portionOfTerrainBelowGrisRunner = [],
        grisrunner = GrisRunner.create();

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
        for (var i = 0; i < 30000; i++) {
            var height = randomInRange(5,10);
            terrainBuffer.push(height);
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
