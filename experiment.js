var Experiment = {
    container: document.getElementById('container'),
    canvas: document.getElementById('canvas'),
    ctx: undefined,
    mouse: false,
    physics: {
        ray: {
            x: -100,
            y: 10
        },
        n1: 1,
        n2: 1.33,
        lensRadius: 50
    },
    getContext: function(sizeChanged) {
        if (this.ctx === undefined) {
            this.ctx = this.canvas.getContext('2d');
        }
        if (sizeChanged) {
            var w = this.canvas.width,
                h = this.canvas.height;
            this.ctx.translate(Math.floor(w/2), Math.floor(h/2));
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
    getPoint: function(e) {
        var canvasOffset = $(this.canvas).offset();
        /*console.log(canoffset.left + " " + canoffset.top);
        xc = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
        yc = e.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top) + 1;

        return {
            x: xc,
            y: yc
        };*/

        return {
            x: e.pageX - canvasOffset.left - Experiment.canvas.width * 0.5,
            y: e.pageY - canvasOffset.top - Experiment.canvas.height * 0.5
        };
    },
    setListener: function () {
        this.canvas.addEventListener('click', function (event) {
            Experiment.onClick(Experiment.getPoint(event));
        }, false);
    },
    onClick: function(x, y) {
        var ctx = Experiment.getContext();
        //ctx.restore();
        var w = this.canvas.width,
            h = this.canvas.height;

        //console.log(x + " " + y);

        /*if (x < 0) {
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(x, y);
            ctx.stroke();
        }*/
    },
    onMouseDown: function(e) {
        Experiment.mouse = true;
    },
    onMouseUp: function(e) {
        Experiment.mouse = false;

    },
    onMouseOut: function(e) {
        //Experiment.mouse = false;

    },
    onMouseMove: function(e) {
        if (!Experiment.mouse) {
            return;
        }
        var ctx = Experiment.getContext();
        var point = Experiment.getPoint(e);
        console.log(point.x + " " + point.y);
        if (point.x < 0) {
            Experiment.physics.ray.x = point.x;
            Experiment.physics.ray.y = point.y;
            Experiment.draw();
        }
    },
    draw: function () {
        var ctx = Experiment.getContext();
        var w = this.canvas.width,
            h = this.canvas.height;
        ctx.clearRect(-w/2, -h/2, w, h);

        function getLens(midX, midY, radius) {
            var lens = new Path2D();
            lens.moveTo(midX, midY + radius);
            lens.arc(midX, midY, radius, -Math.PI / 2, Math.PI / 2);
            return lens;
        }

        ctx.fillStyle = "rgb(200,0,0)";
        ctx.fillRect(10, 10, 50, 50);

        ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
        ctx.fillRect(30, 30, 50, 50);

        ctx.stroke(getLens(0, 0, Experiment.physics.lensRadius));
        
        
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(Experiment.physics.ray.x, Experiment.physics.ray.y);
        ctx.lineTo(0, 0);
        ctx.lineTo(Experiment.physics.ray.x, -Experiment.physics.ray.y);
        ctx.stroke();

        
        var rayLength = Math.sqrt(Math.pow(Experiment.physics.ray.x, 2) + Math.pow(Experiment.physics.ray.y, 2));

        var sinFi2 = (Experiment.physics.n1/Experiment.physics.n2) * (Math.abs(Experiment.physics.ray.y)/rayLength);
        var newRayLength = Math.min(rayLength, w/2 - 30);
        var newY = newRayLength * sinFi2;
        var newX = Math.sqrt(Math.pow(newRayLength, 2) - Math.pow(newY, 2));

        ctx.beginPath();
        ctx.moveTo(newX, newY);
        ctx.lineTo(0, 0);
        ctx.stroke();
    }
};

window.onresize = function () {
    Experiment.setWidth("auto");
};

$(document).ready(function() {
    Experiment.setWidth("auto");
    Experiment.setListener();
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