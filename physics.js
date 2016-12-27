/**
 * Created by Влад on 25.12.2016.
 */
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