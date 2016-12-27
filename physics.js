/**
 * Created by Влад on 25.12.2016.
 */
var n1 = 1;
var n2 = 1.5;
var alpha = Math.atan(n2 / n1);

function create_vector(perpendicular_amplitude, perpendicular_func, parallel_amplitude, parallel_func) {
    return {
        perpendicular_amplitude: perpendicular_amplitude,
        perpendicular_func: perpendicular_func,
        parallel_amplitude: parallel_amplitude,
        parallel_func: parallel_func,
        get_state: function (time) {
            return{
                x: perpendicular_amplitude * parallel_func(time),
                y: parallel_amplitude * parallel_func(time)
            }
        }
    }
}

function create_options(alpha, betta, n1, n2) {
    return {
        alpha: alpha,
        betta: betta,
        n1: n1,
        n2: n2
    }
}

function angle_of_refraction(alpha, n1, n2) {
    var betta = Math.asin(n1 * Math.sin(alpha) / n2);
    console.log("betta lala : " + betta);
    console.log("Math.asin(n2 / n1): " + Math.asin(n2 / n1));
    if (n1 > n2 && betta >= Math.asin(n2 / n1)) return -1;
    return betta;
}

function reflected_perpendicular_amplitude(options) {
    return (options.n1 * Math.cos(options.alpha) - options.n2 * Math.cos(options.betta)) / (options.n1 * Math.cos(options.alpha) + options.n2 * Math.cos(options.betta));
}

function reflected_parallel_amplitude(options) {
    return (options.n2 * Math.cos(options.alpha) - options.n1 * Math.cos(options.betta)) / (options.n2 * Math.cos(options.alpha) + options.n1 * Math.cos(options.betta));
}

function refracted_perpendicular_amplitude(options) {
    return (2 * options.n1 * Math.cos(options.alpha)) / (options.n2 * Math.cos(options.betta) + options.n1 * Math.cos(options.alpha))
}

function refracted_parallel_amplitude(options) {
    return (2 * options.n1 * Math.cos(options.alpha)) / (options.n2 * Math.cos(options.alpha) + options.n1 * Math.cos(options.betta))
}

function get_reflected_vector(vector, options) {
    return create_vector(reflected_perpendicular_amplitude(options) * vector.perpendicular_amplitude,
        vector.perpendicular_func,
        reflected_parallel_amplitude(options) * vector.parallel_amplitude,
        vector.parallel_func);
}

function get_refracted_vector(vector, options) {
    return create_vector(refracted_perpendicular_amplitude(options) * vector.perpendicular_amplitude,
        vector.perpendicular_func,
        refracted_parallel_amplitude(options) * vector.parallel_amplitude,
        vector.parallel_func);
}

function generate_unpolarized_waves(amplitude) {
    var result = [];
    for (var i = 0; i < 100; ++i) {
        var angle = Math.random() * 2 * Math.PI;
        var perpendicular_amplitude = amplitude * Math.cos(angle);
        var parallel_amplitude = amplitude * Math.sin(angle);
        result.push(create_vector(perpendicular_amplitude, Math.cos, parallel_amplitude, Math.cos))
    }
    return result;
}

/*
var vector = create_vector(1, null, 1, null);
var options = create_options(alpha, angle_of_refraction(alpha, n1, n2), n1, n2);
var reflected_vector = get_reflected_vector(vector, options);
var refracted_vector = get_refracted_vector(vector, options);

console.log("alpha: " + options.alpha);
console.log("betta: " + options.betta);

console.log("refracted parallel: " + refracted_vector.parallel_amplitude);
console.log("refracted perpendicular: " + refracted_vector.perpendicular_amplitude);

console.log("reflected parallel: " + reflected_vector.parallel_amplitude);
console.log("reflected perpendicular: " + reflected_vector.perpendicular_amplitude);

var r = generate_unpolarized_waves(1);
console.log("\n");
for (var k in r) {
    console.log(r[k].perpendicular_amplitude);
    console.log(r[k].parallel_amplitude);
    console.log("\n");
}*/