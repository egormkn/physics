/**
 * Created by Влад on 25.12.2016.
 */
function create_vector(x, y) {
    return {
        x: x,
        y: y
    }

}

function create_options(alpha, beta, n1, n2) {
    return {
        alpha: alpha,
        beta: beta,
        n1: n1,
        n2: n2
    }
}

function reflected_perpendicular_amplitude(options) {
    return (options.n1 * Math.cos(options.alpha) - options.n2 * Math.cos(options.beta)) / (options.n1 * Math.cos(options.alpha) + options.n2 * Math.cos(options.beta));
    //if (options.alpha == 0) return -(options.n2 - options.n1) / (options.n2 + options.n1);
    //return -Math.sin(options.alpha - options.beta) / Math.sin(options.alpha + options.beta);
}

function reflected_parallel_amplitude(options) {
    return (options.n2 * Math.cos(options.alpha) - options.n1 * Math.cos(options.beta)) / (options.n2 * Math.cos(options.alpha) + options.n1 * Math.cos(options.beta));
    //if (options.alpha == 0) return (options.n2 - options.n1) / (options.n2 + options.n1);
    //return Math.tan(options.alpha - options.beta) / Math.tan(options.alpha + options.beta);
}

function refracted_perpendicular_amplitude(options) {
    return (2 * options.n1 * Math.cos(options.alpha)) / (options.n2 * Math.cos(options.beta) + options.n1 * Math.cos(options.alpha))
    //if (options.alpha == 0) return (2 * options.n1) / (options.n2 + options.n1);
    //return (2 * Math.sin(options.beta) * Math.cos(options.alpha)) / (Math.sin(options.alpha + options.beta));
}

function refracted_parallel_amplitude(options) {
    return (2 * options.n1 * Math.cos(options.alpha)) / (options.n2 * Math.cos(options.alpha) + options.n1 * Math.cos(options.beta))
    //if (options.alpha == 0) return (2 * options.n1) / (options.n2 + options.n1);
    //return (2 * Math.sin(options.beta) * Math.cos(options.alpha)) / (Math.sin(options.alpha + options.beta) * Math.cos(options.alpha - options.beta))
}

function get_reflected_vector(vector, options) {
    return create_vector(reflected_perpendicular_amplitude(options) * vector.x,
        reflected_parallel_amplitude(options) * vector.y);
}

function get_refracted_vector(vector, options) {
    return create_vector(refracted_perpendicular_amplitude(options) * vector.x,
        refracted_parallel_amplitude(options) * vector.y);
}

function generate_unpolarized_waves(amplitude) {
    var result = [];
    for (var i = 0; i < 20; ++i) {
        var angle = Math.random() * 2 * Math.PI;
        var x = amplitude * Math.cos(angle);
        var y = amplitude * Math.sin(angle);
        result.push(create_vector(x, y))
    }
    return result;
}

function generate_arrays_of_vectors(alpha1, beta1, alpha2, beta2, n1, n2, amplitude, polarization, angle) {
    angle = angle * Math.PI / 180;
    var result_array = [];
    if (polarization) {
        result_array[0] = [];
        var x = amplitude * Math.cos(angle);
        var y = amplitude * Math.sin(angle);
        result_array[0][0] = create_vector(x, y);
        result_array[0][1] = create_vector(-x, -y);
    } else {
        result_array[0] = generate_unpolarized_waves(amplitude);
    }
    result_array[1] = [];
    result_array[2] = [];
    result_array[3] = [];
    var first_options = create_options(alpha1, beta1, n1, n2);
    var i;
    for (i = 0; i < result_array[0].length; ++i) {
        result_array[1].push(get_reflected_vector(result_array[0][i], first_options));
        result_array[2].push(get_refracted_vector(result_array[0][i], first_options))
    }
    var second_options = create_options(alpha2, beta2, n2, n1);
    for (i = 0; i < result_array[2].length; ++i) {
        result_array[3].push(get_refracted_vector(result_array[2][i], second_options));
    }
    if (isNaN(beta1)) {
        result_array[1] = result_array[0];
    }
    return result_array;
}

function intensity_of_vector(vector, epsilon, nu) {
    var amp = 0;
    var len;
    for (var i = 0; i < vector.length; ++i) {
        len = vector[i].x * vector[i].x + vector[i].y * vector[i].y;
        amp += Math.sqrt(len);
    }
    console.log(amp);
    amp = amp / vector.length;
    return amp * amp * Math.sqrt((epsilon * 8.85418781762039 * Math.pow(10, -5)) / (nu * 4 * Math.PI)) / 2;
}

function get_intensity(physics) {
    return [intensity_of_vector(physics.vectors[0], physics.epsilon1, physics.nu1),
        intensity_of_vector(physics.vectors[1], physics.epsilon1, physics.nu1),
        intensity_of_vector(physics.vectors[2], physics.epsilon2, physics.nu2),
        intensity_of_vector(physics.vectors[3], physics.epsilon1, physics.nu1)];
}
