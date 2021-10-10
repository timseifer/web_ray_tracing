const express = require("express");
const app = express();
var ppm = require("ppm");

var bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }))


app.get("", function(req, res) {
	console.log(__dirname);
	  res.sendFile(__dirname + "/index.html");
	});
	 
	
app.use(express.static(__dirname));

app.post('/response', function (req, res) {
	res.write('checking functionality')
	res.end();
})

const server = app.listen(process.env.PORT || 8080, () => {
	const port = server.address().port;
	console.log(`Express is working on port ${port}`);
});


app.post("/draw_ppm", function(req,res){
	aspect_ratio = 16.0 / 9.0;
	image_width = 256;
    image_height = (image_width / aspect_ratio);
	console.log(req.body)
	movement = req.body.movement;
	
	res.send(draw_ppm(image_width,image_height, movement));
	console.log("writing a ppm");
	// tweets(userid, res);
});



class vector{
	constructor(red, green,blue) {
    this.r = red;
    this.g = green;
    this.b = blue;
	}

	X(){
		return this.r;
	}

	Y(){
		return this.g; 
	}

	Z(){
		return this.b;
	}

	 addition(v) {
		return new vector(this.r + v.r,this.g+v.g, this.b*this.b);
	}

	multiply(my_double){
		return new vector(this.r * my_double,this.g*my_double, this.b*my_double);
	}

	divide(my_double){
		return new vector(this.r / my_double,this.g/my_double, this.b/my_double);
	}

	length(){
		return Math.sqrt(this.length_squared)
	}
	length_squared(){
		return (this.r*this.r + this.g*this.g + this.b*this.b)
	}

}

class ray {
	// direction is a vector recall
	constructor(orig, dir){
		this.origin = orig;
		this.direction = dir;
	}

	get_origin(){ 
		return this.origin;
	};

	get_direction() { 
		return this.direction;
	};

	at(t){
		return (this.origin.addition(this.direction.multiply(t)));
	};
};

function hit_sphere(center, radius, r) {
	// console.log("hit sphere")
    oc = subtract_vec(r.origin, center);
    a = dot_prod(r.direction, r.direction);
	b = 2.0 * dot_prod(oc, r.direction);
    c = dot_prod(oc, oc) - (radius*radius);
	discriminant = b*b - 4*a*c;
	// console.log(discriminant)
    if (discriminant < 0){
		return -1;
	}else {
        return ((-b - Math.sqrt(discriminant) ) / (2.0*a));
    }
};

function ray_color(r, movement) {
	// console.log("Ray")
	// console.log(r)
	// console.log(r.direction)
	z = -1+parseFloat(movement);
	y = 1.8-parseFloat(movement);
	t = hit_sphere(new vector(-.5,y,z), .6, r)
	if (t > 0.0) {
        N = unit_vector(subtract_vec(r.at(t),new vector(0,0,-1)));
        return new vector(N.r+1, N.g+1, N.b+1).multiply(.5)
    }
	
    unit_direction = unit_vector(r.direction);
	// console.log(unit_direction)
    t = 0.5*(unit_direction.g + 1.0);
    color_ray = addition_vec(new vector(1.0, 1.0, 1.0).multiply((1.0-t)),new vector(0.5, 0.7, 1.0).multiply(t));
	return color_ray;
};


function draw_ppm(width, height, movement){
	if(movement == null){
		movement = 0;
	}else{
		console.log("movement is" + movement);
	}
	height = Math.round(height);
	// we create the camera and the we set up the scene for ray tracing
	//camera
	viewport_height = 2.0;
    viewport_width = aspect_ratio * viewport_height;
    focal_length = 1.0;

    origin = new vector(0, 0, 0);
    horizontal = new vector(viewport_width, 0, 0);
	horizontal_divided = horizontal.divide(2);
    vertical = new vector(0, viewport_height, 0);
	vertical_divided = vertical.divide(2);

	//this is a vector
    lower_left_corner = subtract_vec(subtract_vec(origin,subtract_vec(horizontal_divided, vertical_divided)), new vector(0, 0, focal_length))
	//render
	var image = new Array(height)
	for (var i = 0; i < image.length; i++) {
		image[i] = new Array(width);
	}
	for(var i = height-1; i >= 0; i--) {
		for(var j = 0; j < width; j++) {
			u = i / (width-1);
            v = j / (height-1);
			// console.log("u" + u)
			// console.log("v" +v)
			horizontal_mult = horizontal.multiply(u)
			vertical_mult = vertical.multiply(v);
			// console.log(horizontal_mult)
			// console.log(vertical_mult)
			direction = subtract_vec(addition_vec(addition_vec(lower_left_corner, horizontal_mult),vertical_mult),origin)
			// console.log(direction)
			r = new ray(origin, direction)
			// console.log(r);
			image[i][j] = ray_color(r, movement);
		}
	}
	// console.log(image)
	return image
}


//aux functions for doing linear algebra
function addition_vec (u, v) {
    return new vector(u.r + v.r, u.g + v.g, u.b + v.b);
}

function subtract_vec(u, v) {
    return new vector(u.r - v.r, u.g - v.g, u.b - v.b);
}

function multiply_vectors(u, v) {
    return new vector(u.r * v.r, u.g * v.g, u.b * v.b);
}

function multiply_value(t,v) {
    return new vector(t*v.r, t*v.g, t*v.b);
}
function division_vec (v, t) {
    return new vector((1/t) * v.r,(1/t) *v.g,(1/t) * v.b);
}

function dot_prod(u, v) {
    return u.r * v.r
         + u.g * v.g
         + u.b * v.b;
}

function cross_prod(u, v) {
    return vector(u.g * v.b - u.b * v.g,
                u.b * v.r - u.r * v.b,
                u.r * v.g - u.g * v.r);
}

function unit_vector(v) {
    return v.divide(3);
}
