var Experiment = {
    container: document.getElementById('container'),
    canvas: document.getElementById('canvas'),
    graphics: [
        document.getElementById('canvas_coord1'),
        document.getElementById('canvas_coord2'),
        document.getElementById('canvas_coord3'),
        document.getElementById('canvas_coord4')
    ],
    graphicsContainer: [
        document.getElementById('container_coord1'),
        document.getElementById('container_coord2'),
        document.getElementById('container_coord3'),
        document.getElementById('container_coord4')
    ],
    graphicsCtx: [],
    n1Field: document.getElementById('input_n1'),
    n2Field: document.getElementById('input_n2'),
    iField: document.getElementById('input_i'),
    aField: document.getElementById('input_a'),
    angleField: document.getElementById('input_angle'),
    alpha1Text: document.getElementById('alpha1'),
    beta1Text: document.getElementById('beta1'),
    alpha2Text: document.getElementById('alpha2'),
    beta2Text: document.getElementById('beta2'),
    i1Text: document.getElementById('i1'),
    i2Text: document.getElementById('i2'),
    i3Text: document.getElementById('i3'),
    i4Text: document.getElementById('i4'),
    ctx: undefined,
    moveRay: false,
    moveStart: false,
    interval: undefined,
    colors: ["rgba(0, 0, 0, 1.0)", "rgba(0, 200, 0, 1.0)", "rgba(200, 0, 0, 1.0)", "rgba(0, 0, 200, 1.0)"],
    physics: {
        ray: {
            x: -100,
            y: 10
        },
        n1: 1,
        n2: 1.33,
        i: 1,
        lensRadius: 50,
        delta: -0.5,
        alpha1: 0,
        beta1: 0,
        alpha2: 0,
        beta2: 0,
        amplitude: 50,
        polarization: false,
        angle: 0,
        vectors: [],
        intensity: []
    },
    start: function () {
        clearInterval(Experiment.interval);
        Experiment.interval = setInterval(function () {
            var physics = Experiment.physics;
            Experiment.physics.vectors = generate_arrays_of_vectors(physics.alpha1, physics.beta1, physics.alpha2, physics.beta2, physics.n1, physics.n2, physics.amplitude, physics.polarization, physics.angle);
            Experiment.physics.intensity = get_intensity(physics);
            Experiment.i1Text.innerHTML = Experiment.physics.intensity[0];
            Experiment.i2Text.innerHTML = Experiment.physics.intensity[1];
            Experiment.i3Text.innerHTML = Experiment.physics.intensity[2];
            Experiment.i4Text.innerHTML = Experiment.physics.intensity[3];
            Experiment.drawGraphics();
        }, 100);
    },
    stop: function () {
        clearInterval(Experiment.interval);
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
    getGraphicsContext: function (sizeChanged) {
        if (this.graphicsCtx.length == 0) {
            for (var i = 0; i < 4; i++) {
                this.graphicsCtx[i] = this.graphics[i].getContext('2d');
            }
        }
        if (sizeChanged) {
            for (var i = 0; i < 4; i++) {
                var w = this.graphics[i].width,
                    h = this.graphics[i].height;
                this.graphicsCtx[i].translate(Math.floor(w / 2), Math.floor(h / 2));
            }
        }
        return this.graphicsCtx;
    },
    setWidth: function (width) {
        if (width == "auto") {
            this.container.style.width = '100%';
            this.container.style.height = Math.floor(this.container.offsetWidth / 16 * 9) + 'px';
            this.canvas.width = this.container.offsetWidth - 2;
            this.canvas.height = this.container.offsetHeight - 2;

            for (var i = 0; i < 4; i++) {
                this.graphicsContainer[i].style.width = this.container.offsetWidth / 4 + 'px';
                this.graphicsContainer[i].height = Math.floor(this.graphicsContainer[i].offsetWidth) + 'px';
                this.graphics[i].width = this.graphicsContainer[i].offsetWidth - 2;
                this.graphics[i].height = this.graphicsContainer[i].offsetHeight - 2;
            }
        } else {
            this.container.style.width = width + 'px';
            this.container.style.height = Math.floor(width / 16 * 9) + 'px';
            this.canvas.width = width - 2;
            this.canvas.height = Math.floor(width / 16 * 9) - 2;
        }
        this.getContext(true);
        this.getGraphicsContext(true);
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
        Experiment.stop();
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
        Experiment.draw();
        Experiment.start();
    },
    onMouseOut: function (e) {
        Experiment.moveRay = false;
        Experiment.moveStart = false;
        Experiment.canvas.style.cursor = "default";
        Experiment.draw();
        Experiment.start();
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
    draw: function (update) {
        var ctx = Experiment.getContext();
        var w = this.canvas.width,
            h = this.canvas.height;
        ctx.fillStyle = "rgba(255, 255, 255, 1.0)";
        ctx.clearRect(-w / 2, -h / 2, w, h);
        //ctx.fill();

        var coordY = Experiment.physics.lensRadius * -Experiment.physics.delta;

        // Draw dashed lines
        ctx.setLineDash([5, 3]); /* dashes are 5px and spaces are 3px */
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
        ctx.strokeStyle = Experiment.colors[0];
        ctx.beginPath();
        ctx.moveTo(Experiment.physics.ray.x, Experiment.physics.ray.y);
        ctx.lineTo(0, -coordY);
        ctx.stroke();

        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.font = "16px serif";
        var iTextY = -Experiment.physics.ray.y < coordY ? Experiment.physics.ray.y + 20 : Experiment.physics.ray.y - 5;
        ctx.fillText("I = " + Experiment.physics.i + " Вт/м^2", Experiment.physics.ray.x + 10, iTextY);


        // Draw reflected ray
        ctx.strokeStyle = Experiment.colors[1];
        ctx.beginPath();
        ctx.moveTo(Experiment.physics.ray.x, 2 * -coordY - Experiment.physics.ray.y);
        ctx.lineTo(0, -coordY);
        ctx.stroke();



        var rayLength = Math.sqrt(Math.pow(Experiment.physics.ray.x, 2) + Math.pow(-coordY - Experiment.physics.ray.y, 2));
        var sinFi1 = Math.abs(-coordY - Experiment.physics.ray.y) / rayLength;
        var sinFi2 = (Experiment.physics.n1 / Experiment.physics.n2) * sinFi1;
        var tgFi2 = Math.tan(Math.asin(sinFi2)) * (-coordY - Experiment.physics.ray.y > 0 ? -1 : 1);

        Experiment.physics.alpha1 = Math.asin(sinFi1);
        Experiment.physics.beta1 = Math.asin(sinFi2);

        Experiment.alpha1Text.innerHTML = Math.abs(Experiment.physics.alpha1 * 180 / Math.PI).toFixed(2) + " град.";
        Experiment.beta1Text.innerHTML = Math.abs(Experiment.physics.beta1 * 180 / Math.PI).toFixed(2) + " град.";

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
        ctx.strokeStyle = Experiment.colors[2];
        ctx.beginPath();
        ctx.moveTo(newX, -newY);
        ctx.lineTo(0, -coordY);
        ctx.stroke();


        if (coordY != 0) {
            // Draw normal line inside lens
            ctx.setLineDash([5, 3]); /*dashes are 5px and spaces are 3px*/
            ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(newX * 2, -newY * 2);
            ctx.stroke();
            ctx.setLineDash([0, 0]);
        }

        // tgFi2 - коэфф. наклона луча в линзе
        // tgNormal - коэфф. наклона нормали
        var tgNormal = newY / newX;
        var tgBetweenInsideRayAndNormal = -(tgFi2 - tgNormal) / (1 + tgFi2 * tgNormal);
        // TODO

        var sinPsi2 = Math.sin(Math.atan(tgBetweenInsideRayAndNormal));
        // console.log("Угол падения: " + Math.asin(sinPsi2)*180/Math.PI);

        var sinPsi1 = (Experiment.physics.n2 / Experiment.physics.n1) * sinPsi2;
        // console.log("Угол преломления: " + Math.asin(sinPsi1)*180/Math.PI);
        var tanPsi1 = Math.tan(Math.asin(sinPsi1));

        Experiment.physics.alpha2 = Math.asin(sinPsi2);
        Experiment.physics.beta2 = Math.asin(sinPsi1);

        Experiment.alpha2Text.innerHTML = Math.abs(Experiment.physics.alpha2 * 180 / Math.PI).toFixed(2) + " град.";
        Experiment.beta2Text.innerHTML = Math.abs(Experiment.physics.beta2 * 180 / Math.PI).toFixed(2) + " град.";

        var ray3Tan = Math.tan(Math.atan(tgNormal) - Math.atan(tanPsi1)); // Or +

        var b = newY - ray3Tan * newX;



        ctx.strokeStyle = Experiment.colors[3];
        // Draw ray outside lens
        ctx.beginPath();
        ctx.moveTo(newX, -newY);
        ctx.lineTo(w / 2, -(ray3Tan * w / 2 + b));
        ctx.stroke();

        var tanRay3 = Math.tan(Math.atan((newY) / (newX)) - Math.asin(sinPsi1));

        ctx.fillStyle = "rgba(255, 0, 0, 0.6)";
        ctx.fillRect(-2, Experiment.physics.lensRadius * Experiment.physics.delta - 2, 4, 4);
    },
    drawGraphics: function () {
        var gctx = Experiment.getGraphicsContext();
        for (var i = 0; i < 4; i++) {
            var ctx = gctx[i];

            var w = this.graphics[i].width,
                h = this.graphics[i].height;
            ctx.clearRect(-w / 2, -h / 2, w, h);


            ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
            ctx.setLineDash([5, 3]);
            ctx.beginPath();
            ctx.moveTo(-w / 2, 0);
            ctx.lineTo(w / 2, 0);
            ctx.moveTo(0, -h / 2);
            ctx.lineTo(0, h / 2);
            ctx.stroke();
            ctx.setLineDash([0, 0]);

            ctx.beginPath();
            ctx.strokeStyle = ctx.strokeStyle = Experiment.colors[i];
            for (var j = 0; j < Experiment.physics.vectors[i].length; j++) {
                canvas_arrow(ctx, 0, 0, Experiment.physics.vectors[i][j].x, Experiment.physics.vectors[i][j].y);
            }
            ctx.stroke();
        }
    }
};

function canvas_arrow(context, fromx, fromy, tox, toy) {
    // var length = Math.sqrt(Math.pow(fromx - tox, 2) + Math.pow(fromy - toy, 2));
    var headlen = 3;   // length of head in pixels
    var angle = Math.atan2(toy - fromy, tox - fromx);
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    context.moveTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
}

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
    Experiment.physics.n1 = $(Experiment.n1Field).val();
    Experiment.physics.n2 = $(Experiment.n2Field).val();
    Experiment.physics.i = $(Experiment.iField).val();
    Experiment.physics.amplitude = $(Experiment.aField).val();
    Experiment.physics.polarization = $('.input_type:checked').val() == "1";
    $(Experiment.angleField).prop('disabled', !Experiment.physics.polarization);
    Experiment.setWidth("auto");
    Experiment.start();
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

$(Experiment.iField).on('input', function (e) {
    var value = $(this).val();
    Experiment.physics.i = parseFloat(value);
    Experiment.draw();
});

$(Experiment.aField).on('input', function (e) {
    var value = $(this).val();
    Experiment.physics.amplitude = parseFloat(value);
    Experiment.draw();
});

$('input:radio[name="input_type"]').change(function () {
    if ($(this).is(':checked')) {
        Experiment.physics.polarization = $(this).val() == "1";
        $(Experiment.angleField).prop('disabled', !Experiment.physics.polarization);
    }
});

$(Experiment.angleField).on('input', function (e) {
    var value = $(this).val();
    Experiment.physics.angle = parseFloat(value);
    Experiment.draw();
});