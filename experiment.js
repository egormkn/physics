var Experiment = {
    container: document.getElementById('container'),
    canvas: document.getElementById('canvas'),
    n1Field: document.getElementById('input_n1'),
    n2Field: document.getElementById('input_n2'),
    ctx: undefined,
    moveRay: false,
    moveStart: false,
    physics: {
        ray: {
            x: -100,
            y: 10
        },
        n1: 1,
        n2: 1.33,
        lensRadius: 50,
        delta: -0.5
    },
    getContext: function (sizeChanged) {
        if (this.ctx === undefined) {
            this.ctx = this.canvas.getContext('2d');
        }
        if (sizeChanged) {
            var w = this.canvas.width,
                h = this.canvas.height;
            this.ctx.translate(Math.floor(w / 2), Math.floor(h / 2));
        }
        return this.ctx;
    },
    setWidth: function (width) {
        if (width == "auto") {
            this.container.style.width = '100%';
            this.container.style.height = Math.floor(this.container.offsetWidth / 16 * 9) + 'px';
            this.canvas.width = this.container.offsetWidth - 2;
            this.canvas.height = this.container.offsetHeight - 2;
        } else {
            this.container.style.width = width + 'px';
            this.container.style.height = Math.floor(width / 16 * 9) + 'px';
            this.canvas.width = width - 2;
            this.canvas.height = Math.floor(width / 16 * 9) - 2;
        }
        this.getContext(true);
        this.draw();
    },
    getPoint: function (e) {
        var canvasOffset = $(this.canvas).offset();
        return {
            x: e.pageX - canvasOffset.left - Experiment.canvas.width * 0.5,
            y: e.pageY - canvasOffset.top - Experiment.canvas.height * 0.5
        };
    },
    onClick: function (e) {
        /*var point = Experiment.getPoint(e);
        if (Math.abs(point.x) < 5 && Math.abs(point.y - Experiment.physics.lensRadius * Experiment.physics.delta) < 5) {
            return;
        }
        Experiment.moveRay = true;
        Experiment.onMouseMove(e);
        Experiment.moveRay = false;*/
    },
    onMouseDown: function (e) {
        var point = Experiment.getPoint(e);
        if (Math.abs(point.x) < 5 && Math.abs(point.y - Experiment.physics.lensRadius * Experiment.physics.delta) < 5) {
            Experiment.moveStart = true;
            Experiment.canvas.style.cursor = "s-resize";
        } else {
            if (point.x > 0) {
                return;
            }
            Experiment.moveRay = true;
            Experiment.canvas.style.cursor = "crosshair";
        }
        Experiment.onMouseMove(e);
    },
    onMouseUp: function (e) {
        Experiment.moveRay = false;
        Experiment.moveStart = false;
        Experiment.canvas.style.cursor = "default";
    },
    onMouseOut: function (e) {
        Experiment.moveRay = false;
        Experiment.moveStart = false;
        Experiment.canvas.style.cursor = "default";
    },
    onMouseMove: function (e) {
        if (!Experiment.moveRay) {
            var point = Experiment.getPoint(e);
            if (Experiment.moveStart) {
                var d = point.y / Experiment.physics.lensRadius;
                var newDelta = Math.abs(d) > 1.0 ? 1.0 * (d < 0 ? -1 : 1) : d;
                if (Math.abs(newDelta * Experiment.physics.lensRadius) < 5) {
                    newDelta = 0;
                }
                Experiment.physics.delta = newDelta;
                Experiment.draw();
                return;
            }
            if (Math.abs(point.x) < 5 && Math.abs(point.y - Experiment.physics.lensRadius * Experiment.physics.delta) < 5) {
                Experiment.canvas.style.cursor = "s-resize";
            } else {
                Experiment.canvas.style.cursor = "default";
            }
            return;
        }
        var ctx = Experiment.getContext();
        var point = Experiment.getPoint(e);
        point.x = point.x > 0 ? 0 : point.x;
        Experiment.physics.ray.x = point.x;
        Experiment.physics.ray.y = point.y;
        Experiment.draw();
    },
    draw: function () {
        var ctx = Experiment.getContext();
        var w = this.canvas.width,
            h = this.canvas.height;
        ctx.clearRect(-w / 2, -h / 2, w, h);

        var coordY = Experiment.physics.lensRadius * -Experiment.physics.delta;

        // Draw dashed lines
        ctx.setLineDash([5, 3]); /*dashes are 5px and spaces are 3px*/
        ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
        ctx.beginPath();
        ctx.moveTo(-w / 2, -coordY);
        ctx.lineTo(w / 2, -coordY);
        ctx.moveTo(-w / 2, 0);
        ctx.lineTo(w / 2, 0);
        ctx.moveTo(0, -h / 2);
        ctx.lineTo(0, h / 2);
        ctx.stroke();
        ctx.setLineDash([0, 0]);

        // Get lens path
        var lens = new Path2D();
        lens.moveTo(0, 0 + Experiment.physics.lensRadius);
        lens.arc(0, 0, Experiment.physics.lensRadius, -Math.PI / 2, Math.PI / 2);

        // Draw lens
        ctx.fillStyle = "rgba(0, 0, 200, 0.3)";
        ctx.strokeStyle = "rgba(0, 0, 0, 1.0)";
        ctx.fill(lens);
        ctx.stroke(lens);

        ctx.lineWidth = 1;

        // Draw main ray
        ctx.strokeStyle = "rgba(100, 0, 0, 1.0)";
        ctx.beginPath();
        ctx.moveTo(Experiment.physics.ray.x, Experiment.physics.ray.y);
        ctx.lineTo(0, -coordY);
        ctx.stroke();

        // Draw reflected ray
        ctx.strokeStyle = "rgba(0, 0, 100, 1.0)";
        ctx.beginPath();
        ctx.moveTo(Experiment.physics.ray.x, 2 * -coordY - Experiment.physics.ray.y);
        ctx.lineTo(0, -coordY);
        ctx.stroke();

        ctx.strokeStyle = "rgba(0, 0, 0, 1.0)";

        var rayLength = Math.sqrt(Math.pow(Experiment.physics.ray.x, 2) + Math.pow(-coordY - Experiment.physics.ray.y, 2));
        var sinFi2 = (Experiment.physics.n1 / Experiment.physics.n2) * (Math.abs(-coordY - Experiment.physics.ray.y) / rayLength);
        var tgFi2 = Math.tan(Math.asin(sinFi2)) * (-coordY - Experiment.physics.ray.y > 0 ? -1 : 1);

        var a = tgFi2 * tgFi2 + 1;
        var b = 2 * tgFi2 * coordY;
        var c = coordY * coordY - Math.pow(Experiment.physics.lensRadius, 2);

        var solution = solveSqrEquation(a, b, c);
        var newX = 0, newY = 0;
        if (solution.length > 0) {
            solution = Math.max(solution[0], solution[1]);
            newX = solution;
            newY = coordY + tgFi2 * newX;
        }

        // Draw ray inside lens
        ctx.beginPath();
        ctx.moveTo(newX, -newY);
        ctx.lineTo(0, -coordY);
        ctx.stroke();


        // Draw normal line inside lens
        ctx.setLineDash([5, 3]); /*dashes are 5px and spaces are 3px*/
        ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(newX*2, -newY*2);
        ctx.stroke();
        ctx.setLineDash([0, 0]);
        ctx.strokeStyle = "rgba(0, 0, 0, 1.0)";


        // TODO
        
        // var angleRefraction1 = Math.asin(sinFi2) * 180 / Math.PI;
        var anglePsi2 = Math.atan(Math.abs(newY) / newX) - Math.asin(sinFi2);
        console.log(Math.min(anglePsi2, Math.PI - anglePsi2) * 180 / Math.PI);
        var derivative = (newY - coordY) / newX;

        var sinPsi2 = 0;
        var sinPsi1 = (Experiment.physics.n2 / Experiment.physics.n1) * Math.sin(sinPsi2);

        var tanRay3 = Math.tan(Math.atan((newY) / (newX)) - Math.asin(sinPsi1));

        /*ctx.beginPath();
        ctx.moveTo(newX, newY -coordY);
        ctx.lineTo(newX + 100, tanRay3*(100) + newY -coordY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(100, 100*derivative);
        ctx.lineTo(0, 0);
        ctx.stroke();*/

        ctx.fillStyle = "rgba(255, 0, 0, 0.6)";
        ctx.fillRect(-2, Experiment.physics.lensRadius * Experiment.physics.delta - 2, 4, 4);
    }
};

function solveSqrEquation(a, b, c) { // ax^2 + bx + c = 0
    var D = b * b - 4 * a * c;
    if (D < 0) {
        return [];
    }
    var sqrtD = Math.sqrt(D);
    var x1 = (-b - sqrtD) / (2 * a);
    var x2 = (-b + sqrtD) / (2 * a);
    return [x1, x2];
}

/*window.onresize = function () {
    Experiment.setWidth("auto");
};*/

$(document).ready(function () {
    Experiment.setWidth("auto");
});



// listen for mouse events
$(Experiment.canvas).mousedown(function (e) {
    e.preventDefault();
    Experiment.onMouseDown(e);
});
$(Experiment.canvas).mousemove(function (e) {
    e.preventDefault();
    Experiment.onMouseMove(e);
});
$(Experiment.canvas).mouseup(function (e) {
    e.preventDefault();
    Experiment.onMouseUp(e);
});
$(Experiment.canvas).mouseout(function (e) {
    e.preventDefault();
    Experiment.onMouseOut(e);
});
$(Experiment.canvas).click(function (e) {
    e.preventDefault();
    Experiment.onClick(e);
});


$(Experiment.n1Field).on('input', function (e) {
    var value = $(this).val();
    Experiment.physics.n1 = parseFloat(value);
    Experiment.draw();
});

$(Experiment.n2Field).on('input', function (e) {
    var value = $(this).val();
    Experiment.physics.n2 = parseFloat(value);
    Experiment.draw();
});