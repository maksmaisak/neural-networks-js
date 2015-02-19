function Vector(x,y){
        this.x = x;
        this.y = y;
    }

    Vector.prototype = {
            setZero: function() {
                this.x = 0.0;
                this.y = 0.0;
            },

            // установка значений x и y
            set: function(x_, y_) {this.x=x_; this.y=y_;},

            // установка значений из объекта
            setV: function(v) {
                this.x=v.x;
                this.y=v.y;
            },

            // реверс вектора
            negative: function(){
                return new Vector(-this.x, -this.y);
            },

            // копия вектора
            copy: function(){
                return new Vector(this.x,this.y);
            },

            // сложение с вектором
            add: function(v) {
                this.x += v.x; this.y += v.y;
                return this;
            },

            // вычетание вектора
            substract: function(v) {
                this.x -= v.x; this.y -= v.y;
                return this;
            },

            // умножение на число
            multiply: function(a) {
                this.x *= a; this.y *= a;
                return this;
            },

            // деление на число
            div: function(a) {
                this.x /= a; this.y /= a;
                return this;
            },

            // получение длины вектора
            length: function() {
                return Math.sqrt(this.x * this.x + this.y * this.y);
            },

            // нормализация вектора (приведение к вектору с длиной = 1)
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

            // получение угла вектора
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

            // получение растояния до другого вектора (полезно если вектором задается положение спрайта)
            distanceTo: function (v) {
                return Math.sqrt((v.x - this.x) * (v.x - this.x) + (v.y - this.y) * (v.y - this.y));
            },

            // получение вектора проведенного от вершины x,y данного вектора до вершины x,y другого вектора  
            vectorTo: function (v) {
                return new Vector(v.x - this.x, v.y - this.y);
            },

            // поворот вектора на заданный угл
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