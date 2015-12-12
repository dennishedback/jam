var GameEntity = {
    pos: null,
    vel: null,

    create: function() {
        var obj = Object.create(this);
        obj.pos = new Victor(0, 0);
        obj.vel = new Victor(0, 0);
        return obj;
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
        terrain = [],
        terrainInViewport = [],
        grisrunner = GameEntity.create();

    init();
    run();

    function init() {
        randomTerrain(); // For testing purposes

        // Initial terrain in viewport
        for (var i = 0; i < width; i++) {
            terrainInViewport.push(terrain.shift());
        }

        grisrunner.vel.x = 5;

        // 0,0 is the position of the grisrunner
        //context.translate(0, height - 50);
        context.fillStyle = colors[1];
    };

    function randomTerrain() {
        for (var i = 0; i < 30000; i++) {
            var height = randomInRange(5,10);
            terrain.push(height);
        }
    };

    function run() {
        // Game loop
        update();
        render();
        requestAnimationFrame(run);
    };

    function generateTerrain() {
        // Here, we generate the terrain
    };

    function update() {
        // Update all game entities
        generateTerrain();
        updateTerrain();
    };

    function updateTerrain() {
        for (var i = 0; i < grisrunner.vel.x; i++) {
            terrainInViewport.shift();
            terrainInViewport.push(terrain.shift());
        }
    };

    function render() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawTerrain();
    };

    function drawTerrain() {
        for (var i = 0; i < terrainInViewport.length; i++) {
            context.beginPath();
            context.moveTo(i, height-50+terrainInViewport[i]);
            context.lineTo(i, height);
            context.stroke();
        }
    };
});
