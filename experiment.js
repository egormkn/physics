var Experiment = {
    container: document.getElementById('container'),
    canvas: document.getElementById('canvas'),
    ctx: undefined,
    physics: {
        ray: {
            x: 0,
            y: 0
        }
    },
    getContext: function() {
        if (this.ctx === undefined) {
            this.ctx = this.canvas.getContext('2d');
        }
        var w = this.canvas.width,
            h = this.canvas.height;
        this.ctx.translate(Math.floor(w/2), Math.floor(h/2));
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
        this.getContext();
        this.draw();
    },
    setClickListener: function () {
        this.canvas.addEventListener('click', function (event) {
            var x = event.pageX - Experiment.canvas.offsetLeft - Experiment.canvas.width * 0.5,
                y = event.pageY - Experiment.canvas.offsetTop - Experiment.canvas.height * 0.5;
            Experiment.onClick(x, y);
        }, false);
    },
    onClick: function(x, y) {
        this.ctx = this.canvas.getContext('2d');
        var ctx = this.ctx;
        ctx.restore();
        var w = this.canvas.width,
            h = this.canvas.height;

        console.log(x + " " + y);

        if (x < 0) {
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    },
    draw: function () {
        this.ctx = this.canvas.getContext('2d');
        var ctx = this.ctx;

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



        ctx.stroke(getLens(0, 0, 50));
        ctx.save();
    }
};

$('#button').click(function () {
    Experiment.setWidth(400);
});

$('#button2').click(function () {
    Experiment.setWidth(600);
});

$('#button3').click(function () {
    Experiment.setWidth("auto");
});

window.onresize = function () {
    Experiment.setWidth("auto");
};

$(document).ready(function() {
    Experiment.setWidth("auto");
    Experiment.setClickListener();
});