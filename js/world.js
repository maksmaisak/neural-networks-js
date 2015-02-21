/* Evolving Neural Nets by Maksim Maisak */

function angleNormalize(angle){
    var newAngle = angle;

    if ( angle > Math.PI ){
        newAngle = -1*(2*Math.PI - angle);
    }
    else if ( angle < -1*Math.PI ){
        newAngle = 2*Math.PI + angle;
    }

    return newAngle;
}

function toPercentage(value,min,max){
    var range = max - min;
    return (value / range) * 100;
}

window.onload = function() {  
    //rAF region
    
    var lastTime = 0;
    var vendors = ['webkit', 'moz', 'c', 'o', 'ms'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; x++) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
            console.log(id);
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    
    //rAF endregion
    //World region
    var world = {
        objects: [],
        calcRate: 60,          //world calculations per second
        framerate: 60,         //frames per second (fps) DONT CHANGE!
        speed: 1,              //1 is normal speed
        generationLength: 15,  //in seconds
        generation: 1,
        numberOfGreens: 10,
        numberOfBlues: 10,
        entityRadius: 15,       // in pixels
        foodCharge: 20,         // the amount of health food is going to restore
        defaultHealth: 200,
        rotationCoeficient: 2,  //maxRotation() of Blue is [coeficient] times slower at maxSpeed()
        mutationRateConst : 0.05,
        mutationRate: 0.05,
        minMutationRate: 0.0005,
        calcInterval: undefined, //interval id
        
        death: true,
        collisions: true,
        HealthDecreaseOverTime: false,
        
        HTMLElement: document.getElementById('World'),
        size: new Vector(1024,768),
        
        isInside: function(obj) {
            var radius = obj.HTMLElement.style.width;
            var width = world.size.x - this.entityRadius;
            var height = world.size.y - this.entityRadius;
            
            if(obj.position.x >= width || obj.position.x <=0 || obj.position.y >= height || obj.position.y <=0 ){return false;}
            return true;
        },

        createObject: function(objectType,position,vector) {  
            
            var div = document.createElement('div');
            div.className = objectType;
            this.HTMLElement.appendChild(div);
            div.id = this.objects.length;            //unique id for a html element
            
            if (objectType == 'blue') {var object = new Blue(position,vector,div.id);}
            else if (objectType == 'green'){var object = new Green(position,vector,div.id);}
            this.objects[this.objects.length] = object;
            return div.id;
        },
        
        clear: function() {
            for(var i = 0; i < this.objects.length; i++){    
                var div = document.getElementById(i);
                this.HTMLElement.removeChild(div);
            }
            this.objects = [];
        },
        
        fill: function() {
            for (var c = 0; c < world.numberOfGreens; c++){
                var pos = new Vector(math.random(world.size.x-world.entityRadius),math.random(world.size.y-world.entityRadius));  //position
                var vec = new Vector(0,0);  //vector
                this.createObject('green',pos,vec);
            }

            for (var c = 0; c < world.numberOfBlues; c++){
                var pos = new Vector(math.random(world.size.x-world.entityRadius),math.random(world.size.y-world.entityRadius));  //position
                var vec = new Vector(math.random(-35,35),math.random(-35,35));  //vector
                this.createObject('blue',pos,vec);
            }   
        },
        
        generationStart: function() {
            
            document.getElementById('EntitiesStates').innerHTML = '';
            
            var blues = [];
            for(var j = 0; j < this.objects.length; j++){
                var obj = this.objects[j];
                    
                if( obj.entityType == 'blue' ){
                    blues[blues.length] = obj;
                }  
            }
                
            var top = [];
                    
            for(var j = 0; j < blues.length; j++){
                obj =  blues[j];
                var inserted = false;
                    
                if (top.length == 0){
                    top[0] = obj;
                }
                else{
                    for(var a = 0; a < top.length;a++){
                        if ( obj.health >= top[a].health ){
                            top.splice(a,0,obj);
                            inserted = true;
                            break;
                        }
                    }
                }
                
                if( !inserted ){
                    top.push(obj);
                }
            }
            /*for(var j = top.length-1; j >= 0; j--){
                
                if ( top.length <= 2 ){
                    break;
                }
                else if ( top[j].state == 'dead' ){
                    top.splice(j,1);
                    j = top.length;
                }
            }*/
            
            console.log(top);
            
            this.clear();
                
            for (var j = 0; j < world.numberOfGreens; j++){
                var pos = new Vector(math.random(world.size.x-world.entityRadius),math.random(world.size.y-world.entityRadius));  //position
                var vec = new Vector(0,0);  
                this.createObject('green',pos,vec);
            }
                
            for(var j = 0; j < this.numberOfBlues; j++){        // creating children
                    
                var parent1 = undefined;
                var parent2 = undefined;
                
                var pos = new Vector(math.random(world.size.x-world.entityRadius),math.random(world.size.y-world.entityRadius));  //position
                var vec = new Vector(math.random(-35,35),math.random(-35,35));  
                var id = this.createObject('blue',pos,vec);
                      
                for(var i = 1; i < top.length; i++){ 
                    var possibility = (top[i].eaten+1)/top.length;
                    if (math.random() < possibility){
                        var parent1 = top[i];
                        break;
                    }
                }

                if ( parent1 == undefined ){
                    parent1 = top[0];
                }

                for(var i = 1; i < top.length; i++){ 
                    var possibility = (top[i].eaten+1)/top.length;
                    if (math.random() < possibility){
                        var parent2 = top[i];
                        break;
                    }
                }

                if ( parent2 == undefined ){
                    parent2 = top[0];
                }  
                
                var child = parent1.brain.hybrid(parent2.brain).mutate();
                                    
                this.objects[id].brain = child;
                this.objects[id].parent1 = parent1;
                this.objects[id].parent2 = parent2;
            }
        },
        
        start: function() { 
            
            this.HTMLElement.style.width = this.size.x + 'px';
            this.HTMLElement.style.height = this.size.y + 'px';
            
            /*var stats = document.getElementById('Stats');
            stats.style.height = 'calc(100vh - ' + this.size.y +'px)';
            
            var settings = document.getElementById('Settings');
            settings.style.left = this.size.x + 'px';
            settings.style.height = this.size.y + 'px';
            settings.style.width = 'calc(100% - ' + this.size.x +'px)';*/
            
            document.getElementById('TimeLeft').innerHTML = this.generationLength;
            
            this.framecount = 0;
            
            this.calcInterval = setInterval(function(){ 
                world.step(this.framecount);
            },1000 / ( world.calcRate * world.speed ));   
            
            /*var drawInterval = setInterval(function(){
                world.draw();
            },1000 / this.framerate );*/  
           
		    (function animloop(){
		      requestAnimationFrame( animloop );
		      world.draw();
		    })();
		    
        },
        
        step: function(frame) {  // calculation step
            this.framecount++;
            
            if ( this.mutationRate <= this.minMutationRate ){
                this.mutationRate = this.minMutationRate;
            }
            else{
                this.mutationRate = 1/this.generation*0.05;
            }
            
            document.getElementById('TimeLeft').innerHTML = math.round((this.generationLength*this.calcRate - this.framecount)/this.calcRate,1);
            
            if (this.framecount >= this.generationLength*this.calcRate){
                
                this.framecount = 0;
                this.generation++;
                document.getElementById('GenerationCounter').innerHTML = this.generation;
                this.generationStart();
            
            }
            else{
                
                for(var j = 0; j < this.objects.length; j++){
                    var obj = this.objects[j];
                    
                    if ( obj.state != 'dead' ){

                        if( obj.entityType == 'blue' ){
                            
                            //blue collisions region
                            for( k = 0; k < this.objects.length; k++){  
                                var entity = this.objects[k];

                                if (entity.entityType == 'green' && obj.position.distanceTo(entity.position) < this.entityRadius ){     //collision with green
                                    obj.eaten++;
                                    obj.health += world.foodCharge;
                                    entity.setPosition( new Vector(-100, -100) ); 
                                    entity.state = 'dead';
                                    
                                    if (math.random() < 0.5){

                                        var pos = new Vector(math.random(700),math.random(500)); 
                                        var vec = new Vector(0,0); 
                                        this.createObject('green',pos,vec);  

                                    }
                                }
                                
                                else if ( entity.entityType == 'blue' && entity.state == 'dead' && obj.position.distanceTo(entity.position) < this.entityRadius && entity != obj ){   //collision with a corpse
                                    obj.eaten++;
                                    obj.health += entity.health/3;
                                    entity.setPosition( new Vector(-100, -100) );     
                                }
                                
                                else if ( entity.entityType == 'blue' && obj.position.distanceTo(entity.position) < this.entityRadius && entity != obj && world.collisions ){   //collision with blue
                                    
                                    obj.health -= entity.vector.length() / math.abs(entity.position.vectorTo(obj.position).angle() - entity.vector.angle());
                                    
                                    entity.health -= obj.vector.length() / math.abs(obj.position.vectorTo(entity.position).angle() - obj.vector.angle());
                                    
                                    var newSpeed = ( obj.vector.length() + entity.vector.length() )/2;
                                    
                                    obj.vector = obj.position.vectorTo( entity.position ).negative()/*.setLength( newSpeed )*/;
                                    entity.vector = entity.position.vectorTo( obj.position ).negative()/*.setLength( newSpeed )*/;
                                    /*var resultant = obj.vector.copy().add(entity.vector.copy()); 
                                    
                                    var RelAngle = obj.vector.angleToVector(resultant);
                                    
                                    if ( RelAngle > 0 ){
                                        obj.setVector( obj.vector.rotate( (Math.PI * 2 - RelAngle * 2) ) );   
                                    }
                                    else{
                                        obj.setVector( obj.vector.rotate( -1 * (Math.PI * 2 - RelAngle * 2) ) );     
                                    }
                                    
                                    RelAngle = entity.vector.angleToVector(resultant);
                                    
                                    if ( RelAngle > 0 ){
                                        entity.setVector( entity.vector.rotate( (Math.PI * 2 - RelAngle * 2) ) );   
                                    }
                                    else{
                                        entity.setVector( entity.vector.rotate( -1 * (Math.PI * 2 - RelAngle * 2) ) );     
                                    }*/
                                    
                                }

                            }
                            
                            //blue collisions endregion
                            //Vector change region

                            if ( obj.health <= 0 && this.death){
                                obj.health = 0;
                                obj.state = 'dead';
                                obj.HTMLElement.className = 'deadBlue';
                            }
                            else{
                                obj.decide();
                            }
                            
                            //Vector change endregion
                            
                            document.getElementById( obj.HTMLElement.id + '-health' ).firstElementChild.innerHTML = math.round(obj.health);
                            
                            /*var smallerRadius = 100 - toPercentage( obj.vector.length(),0,obj.maxSpeed() );
                            obj.HTMLElement.style.borderBottomLeftRadius = smallerRadius + '%';
                            obj.HTMLElement.style.borderBottomRightRadius = smallerRadius + '%';*/ 
                            
                            if ( world.HealthDecreaseOverTime ){
                                obj.health -= world.defaultHealth/(world.generationLength*world.calcRate*0.9);    //idlers die in 0.9 of the generation length;
                            }

                        }
                    }
                    
                    if (!world.isInside(obj)){
                        
                        obj.setPosition( new Vector(world.size.x - obj.position.x - this.entityRadius, world.size.y - obj.position.y - this.entityRadius));
                        
                    }
                    
                    var copyVector = obj.vector.copy();
                    var movement = copyVector.div(this.calcRate);
                    var newPos = movement.add(obj.position);
                    obj.setPosition(newPos);
                
                }
            }
        }, 
        
        draw: function() {   //visualisation step
            for( i = 0 ; i < this.objects.length;i++ ){
                var element = this.objects[i];
                element.HTMLElement.style.left = element.position.x + 'px'; 
                element.HTMLElement.style.top = element.position.y + 'px';
                
                var angle = element.vector.angle();
                
                element.HTMLElement.style.WebkitTransform = 'rotate3d(0,0,1,' + angle + 'rad)';
                element.HTMLElement.style.msTransform = 'rotate3d(0,0,1,' + angle + 'rad)';
                element.HTMLElement.style.transform = 'rotate3d(0,0,1,' + angle + 'rad)';
            }
        },
        
        restart: function() {
            clearInterval ( this.calcInterval );
            this.objects = [];
            this.generation = 1;
            document.getElementById('GenerationCounter').innerHTML = this.generation;
            this.mutationRate = this.mutationRateConst;
            
            var objects = document.getElementById('World').getElementsByTagName('div');
            for(var c = objects.length-1; c >= 0; c--) {
                objects[c].parentElement.removeChild( objects[c] );
            }
            
            var objects = document.getElementById('EntitiesStates').getElementsByTagName('div');
            for(var c = objects.length-1; c >=0; c--) {
                objects[c].parentElement.removeChild( objects[c] );
            }
                
            this.fill();
            this.start();
        }
        
    }

    //World endregion
    //Blue region 
    
    
    function Blue(position,vector,id){
        this.entityType = 'blue';
        this.HTMLElement = document.getElementById(id);
        this.HTMLElement.style.height = world.entityRadius + 'px';
        this.HTMLElement.style.width = world.entityRadius + 'px';
        
        this.setPosition(position);
        this.setVector(vector);   //sets direction and speed in pixels per second
        this.brain = new Brain( math.ceil(math.random(20)) ); //from 1 to 20 neurons in the middle layer
        this.brain.randomFill();
        this.state = 'alive';
        
        document.getElementById('EntitiesStates').innerHTML += '<div id="' + id + '-health"><p></p></div>';
    }
    
    Blue.prototype ={
        state: 'alive',
        eaten: 0,
        health: world.defaultHealth,
        setPosition: function(position){
            this.position = position;
        },
        
        setVector: function(vector){
            this.vector = vector;
        },
        
        maxRotation: function(){        //per frame in radians
            var maximum = Math.PI*2/world.calcRate;
            var speedBased = (this.maxSpeed() / world.rotationCoeficient) * maximum / this.vector.length();
            
            if (speedBased > maximum){
                return maximum;     
            }
        
            /*return speedBased;*/
            return maximum;
        },
        
        maxAcceleration: function(){
            return 40 / world.calcRate;  //40 px per second
        },
        
        maxSpeed: function(){
            return world.entityRadius * 10;    
        },
        
        distanceToWall: function(){
            
            var AbsoluteAngle = this.vector.angle();
            
            if ( AbsoluteAngle < -1*Math.PI/4 && AbsoluteAngle >= -1*Math.PI*3/4 ){  //left
                var closest = this.position.x;
                var RelAngle = -1*Math.PI*0.5;
            }
            else if ( AbsoluteAngle < Math.PI/4 && AbsoluteAngle >= -1*Math.PI/4  ){ //top
                var closest = this.position.y;
                var RelAngle = 0;   
            }
            else if ( AbsoluteAngle < Math.PI*3/4 && AbsoluteAngle >= Math.PI/4 ){ //right
                var closest = world.size.x - this.position.x;
                var RelAngle = Math.PI*0.5;   
            }
            else{ //bottom
                var closest = world.size.y - this.position.y;
                var RelAngle = Math.PI;   
            }
            
            closest -= world.entityRadius;
            
            var angle = math.abs(angleNormalize(AbsoluteAngle - RelAngle));
            var distance = closest/math.cos(angle);
            return distance;
            
        },
        
        isInProximity: function(elementId){
            var FOV = Math.PI;                      //Field Of View in radians 
            
            var rotation = this.vector.angle();
            
            var absoluteAngle = this.position.vectorTo(world.objects[elementId].position).angle();

            var angle = angleNormalize(absoluteAngle - rotation);  

            
            if ( (angle < FOV/2) && (angle > -1*FOV/2) ){
                return true;
            }
            return false;
        },
        
        visibleEntities: function(){                //returns an array of elements;
            var answer = [];
            for(i = 0; i < world.objects.length; i++){
                if ( (i != this.HTMLElement.id) && (this.isInProximity(i)) ){ answer.push(world.objects[i]); }
            }
            return answer;
        },
        
        perceive: function(){                       //returs data from the sensors
            var environment = {};
            var entities = this.visibleEntities();  //array of elements
            var blues = [];                         
            var greens = [];
            var result = [9999,9999,9999,9999,9999,9999,/*9999,9999*/];
            
            if (entities.length == 0){ 
                return math.matrix(result); 
            }
            
            for(var i = 0; i < entities.length; i++){
                var entity = entities[i];
                if ( entity.entityType == 'blue' && entity.state == 'alive' ){ blues.push(entity) }    
                else if ( (entity.entityType == 'green' && entity.state == 'alive') || (entity.entityType == 'blue' && entity.state == 'dead') ){ greens.push(entity) }
            }
            
            if ( greens.length != 0 ){
                
                environment.GreenSignal = 1;
                
                var min = 0;
                var minDistance = 9999;
                for(var i = 0; i < greens.length; i++){
                    var distance = this.position.distanceTo( greens[i].position );
                    if ( distance < minDistance ){ 
                        minDistance = distance; 
                        min = i;            //the id of the closest green              
                    }
                }

                environment.distanceToGreen = minDistance;
                environment.cosAngleToGreen = math.cos( this.position.vectorTo(greens[min].position).angle() - this.vector.angle() );
            }
            else{
                environment.GreenSignal = 0;
            }
            
            if ( blues.length != 0 ){
                
                environment.BlueSignal = 1;

                
                var min = 0;
                var minDistance = 9999;
                for(var k = 0; k < blues.length; k++){
                    var distance = this.position.distanceTo( blues[k].position );
                    if ( distance < minDistance ){ 
                        minDistance = distance; 
                        min = k;            //the id of the closest blue    
                    }
                }

                environment.distanceToBlue = minDistance;
                environment.cosAngleToBlue = math.cos( this.position.vectorTo(blues[min].position).angle() - this.vector.angle() );
                /*environment.ClosestBlueHealth = blues[min].health;*/
            }
            else{
                environment.BlueSignal = 0;
            }
            
            /*environment.health = this.health;*/
            /*environment.distanceToWall = this.distanceToWall();*/
            
            var i = 0;
            for(property in environment){
                result[i] = environment[property]; 
                i++;
            }
            
            return math.matrix(result);
        },
        
        decide: function(){
            var decisions = this.brain.think(this.perceive());      //decisions is an array of the brain outputs. [0] is delta angle, [1] is delta speed.
            
            var newVector = this.vector.copy();
            
            if ( decisions[0] > this.maxRotation() ){
                var rotation = this.maxRotation();
            }
            else if ( decisions[0] < -1*this.maxRotation() ){
                var rotation = -1*this.maxRotation();  
            }
            else{
                var rotation = decisions[0];
            }
            
            
            if ( this.vector.length() >= this.maxSpeed() ){
                var coeficient = 1;
            }
            else{
                
                if ( decisions[1] > this.maxAcceleration()){
                    var fraction = this.maxAcceleration()/this.vector.length();
                }
                else if( decisions[1] < -1*this.maxAcceleration() ){
                    var fraction = -1*this.maxAcceleration()/this.vector.length()    
                }
                else{
                    var fraction = decisions[1]/this.vector.length();    
                }
                
                var coeficient = 1 + fraction;
            }
            
            if ( coeficient <= 0 ){
                coeficient = 1;
            }
            
            newVector.multiply(coeficient);
            newVector.rotate(rotation);
            
            this.setVector(newVector);
        }
    };
    
    
    //Blue endregion
    //Green region
    
    
    function Green(position,vector,id){
        this.entityType = 'green';
        this.HTMLElement = document.getElementById(id);
        this.HTMLElement.style.height = world.entityRadius + 'px';
        this.HTMLElement.style.width = world.entityRadius + 'px';
        
        this.position = new Vector(0,0);
        this.setPosition(position);
        this.setVector(vector);   //sets direction and speed in pixels per second
    }
    
    Green.prototype ={
        state: 'alive',
        setPosition: function(position){
            this.position = position;
        },
        
        setVector: function(vector){
            this.vector = vector;
        }
    };
    
    
    //Green endregion
    //vector region
    
    
    function Vector(x,y){
        this.x = x;
        this.y = y;
    }

    Vector.prototype = {
            setZero: function() {
                this.x = 0.0;
                this.y = 0.0;
            },

            // set x and y
            set: function(x_, y_) {this.x=x_; this.y=y_;},

            // set from a different object
            setV: function(v) {
                this.x=v.x;
                this.y=v.y;
            },

            // reverse vector
            negative: function(){
                return new Vector(-this.x, -this.y);
            },

            // copy vector
            copy: function(){
                return new Vector(this.x,this.y);
            },

            // vector addition
            add: function(v) {
                this.x += v.x; this.y += v.y;
                return this;
            },

            // vector substraction
            substract: function(v) {
                this.x -= v.x; this.y -= v.y;
                return this;
            },

            // multiplication with scalar
            multiply: function(a) {
                this.x *= a; this.y *= a;
                return this;
            },

            // division with scalar
            div: function(a) {
                this.x /= a; this.y /= a;
                return this;
            },

            // vector's length
            length: function() {
                return Math.sqrt(this.x * this.x + this.y * this.y);
            },

            // vector normalization
            normalize: function() {
                var length = this.length();
                if (length < Number.MIN_VALUE) {
                    return 0.0;
                }
                var invLength = 1.0 / length;
                this.x *= invLength;
                this.y *= invLength;

                return length;
            },

            // vector's angle
            angle: function () {
                var x = this.x;
                var y = this.y;
                if (x == 0) {
                    return (y > 0) ? (3 * Math.PI) / 2 : Math.PI / 2;
                }
                var result = Math.atan(y/x);

                result += Math.PI/2;
                if (x < 0) result = result - Math.PI;
                return result;
            },
        
            angleToVector: function (v) {
                return v.angle() - this.angle();    
            },

            // distance to a different vector
            distanceTo: function (v) {
                return Math.sqrt((v.x - this.x) * (v.x - this.x) + (v.y - this.y) * (v.y - this.y));
            },

            // gets vector from this vector's (x,y) to other vector's (x,y)  
            vectorTo: function (v) {
                return new Vector(v.x - this.x, v.y - this.y);
            },

            // set vector angle
            setRotation: function (angle) {
                var length = this.length();
                this.x = Math.sin(angle) * length;
                this.y = Math.cos(angle) * (-length);
                return this;
            },
            
            rotate: function (angle){
                return this.setRotation(this.angle() + angle);
            },
        
            setLength: function (length) {       
                this.multiply(length/this.length());
                return this;
            }
    };
    
    
    //vector endregion
    //brain region
    
    
    function Brain(middle){                //A neural network with 3 layers of neurons
        this.middle = middle;
        this.network = [math.ones(this.input,this.middle),math.ones(this.middle,this.out)];    //Two matrixes (this.network[0], this.network[1]) between pairs of layers   
    }
    
    Brain.prototype = {
        input: 6,  // number of neurons in each layer
        out: 2, // delta force & delta angle
        
        randomFill: function(){
            for(i = 0; i < this.input; i++){                  //cycles through columns
                for(j = 0; j < this.middle; j++){             //cycles through rows
                    this.network[0].subset( math.index(i,j) , math.random(-10,10) );           
                }     
            } 
            
            //first matrix filled
            
            for(i = 0; i < this.middle; i++){                 //cycles through columns
                for(j = 0; j < this.out; j++){                //cycles through rows
                    this.network[1].subset( math.index(i,j) , math.random(-10,10) );           
                }     
            } 
            
            //second matrix filled
        },
        
        activationF: function(net){
            return (1/( 1 + Math.exp(-net) ) - 0.5)*2*5;                      //activation function for neurons  
            /*if ( net > 0 ){
                return 1
            }
            else if ( net < 0 ){
                return -1
            }
            else {
                return 0;
            }*/
            
        },
        
        calculateLayer: function(matrix,input){
            var len = matrix.size()[1] ;
            var output = math.ones( len );
            for(j = 0; j < matrix.size()[1]; j++){                 //cycles through rows
                var y = 0;
                for(i = 0; i < matrix.size()[0]; i++){             //cycles through columns
                    var w = matrix.subset( math.index(i,j) );    //weight
                    var x = input.subset( math.index(i) );       //input value
                    y += this.activationF(x*w);               
                } 
                y = this.activationF(y);
                output.subset( math.index(j),y);
            } 
            return output;
        },
        
        think: function(input){                         // input is a 1D matrix of [this.input] values
            var result = this.calculateLayer( this.network[1], this.calculateLayer( this.network[0],input ) ).valueOf();   //the output of the first matrix is the input of the second
            return result;                              // result is an array of the brain outputs                                    
        },
        
        hybrid: function(brain){
            if ( this.middle > brain.middle ){
                var child = new Brain( math.round( math.random(brain.middle, this.middle) ) );     
            }
            else if ( this.middle < brain.middle ){
                var child = new Brain( math.round( math.random(this.middle, brain.middle) ) ); 
            }
            else{
                var child = new Brain( this.middle );
            }
            
            for(k = 0; k < this.network.length; k++){              //cycles through layers
                
                if( this.network[k].size()[0] > brain.network[k].size()[0] || this.network[k].size()[1] > brain.network[k].size()[1] ){
                    var bigger = this.network[k]; 
                    var smaller = brain.network[k];
                }
                else{
                    var bigger = brain.network[k];
                    var smaller = this.network[k];
                }
                
                var matrix = child.network[k];    
                
                for(var x = 0; x < matrix.size()[0]; x++){              //cycles through columns
                    for(var y = 0; y < matrix.size()[1]; y++){          //cycles through rows 
                        if ( (math.round(math.random()) == 0) && (x < smaller.size()[0]) && (y < smaller.size()[1]) ){
                            matrix.subset( math.index(x,y), smaller.subset( math.index(x,y) ) ); 
                        }
                        else{
                            matrix.subset( math.index(x,y), bigger.subset( math.index(x,y) ) );
                        }
                    }
                } 
                
            }
            return child;
        },
        
        mutate: function(){
            
            if (math.random() < world.mutationRate ){
                                    
                if ( math.random() < 0.5 /*&& this.middle < 20*/ ){     //add a layer
                    this.middle++;
                    
                    this.network[0].resize( [ this.network[0].size()[0], this.middle ], 1 );
                    this.network[1].resize( [ this.middle, this.network[1].size()[1] ], 1 );
                }
                else if ( this.middle > 1 ){                           //remove a layer
                    this.middle--;
                    
                    this.network[0].resize( [ this.network[0].size()[0], this.middle ]);
                    this.network[1].resize( [ this.middle, this.network[1].size()[1] ]);
                }
                
            }
            
            for(k = 0; k < this.network.length; k++){               //cycles through layers
                var matrix = this.network[k];    
                
                for(i = 0; i < matrix.size()[0]; i++){              //cycles through columns
                    for(j = 0; j < matrix.size()[1]; j++){          //cycles through rows 
                        
                        var oldValue = matrix.subset( math.index(i,j) );
                        
                        /*if ( math.random() < world.mutationRate ){
                            
                            matrix.subset( math.index(i,j), oldValue + math.random(-1,1) );
                
                        }
                        if ( math.random() < world.mutationRate ){
                            matrix.subset( math.index(i,j), -1 * oldValue );  
                        }
                        if ( math.random() < world.mutationRate ){
                                
                                if ( math.random() < 0.5 ){
                                    matrix.subset( math.index(i,j), oldValue*math.random(-1,1) );
                                }
                                else{                                    
                                    matrix.subset( math.index(i,j), oldValue/math.random(-1,1) );       
                                }
                            
                        }*/
                        if ( math.random() < world.mutationRate ){
                            var oldValue = matrix.subset( math.index(i,j) );
                            
                            if ( math.random() < 1/3 ){
                                matrix.subset( math.index(i,j), oldValue + math.random(-1,1) );
                            }
                            else if ( math.random() < 1/2  ){
                                matrix.subset( math.index(i,j), -1 * oldValue );
                            }
                            else{
                                
                                if ( math.random() < 0.5 ){
                                    matrix.subset( math.index(i,j), oldValue*math.random(-1,1) );
                                }
                                else{                                    
                                    matrix.subset( math.index(i,j), oldValue/math.random(-1,1) );       
                                }
                            }
                        }
                        
                    }
                }
            }
            
            return this;
        }
    }
    
    //brain endregion
    //Buttons region
    
    document.getElementById("Restart").onclick = function() {
        world.restart();
    };
    
    //Buttons endregion
    //MAIN region
    
    for (var c = 0; c < world.numberOfGreens; c++){
            var pos = new Vector(math.random(world.size.x-world.entityRadius),math.random(world.size.y-world.entityRadius));  //position
            var vec = new Vector(0,0);  //vector
            world.createObject('green',pos,vec);
        }
    
        for (var c = 0; c < world.numberOfBlues; c++){
            var pos = new Vector(math.random(world.size.x-world.entityRadius),math.random(world.size.y-world.entityRadius));  //position
            var vec = new Vector(math.random(-35,35),math.random(-35,35));  //vector
            world.createObject('blue',pos,vec);
        }
    
    world.start();
    
    
    //Main endregion
}