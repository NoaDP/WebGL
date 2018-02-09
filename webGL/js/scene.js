// global variables
var  renderer;
var scene;
var camera;
var moveLeft;
var moveRight;
var moveUp;
var moveDown;
var enemies = [];
var objects = [];
var i = 0;
var numObj = 0;
var distance = 0;
var st = 0;
var minutes = -1;
var seconds = -12;
var gameStart = false;
var started = false;
var isp = 0;
var isp2 = 0;
var notp = 0;
var aux = 0;
var first = false;
var pause = false;
var modelBB;
var audio = new Audio('assets/bensound-goinghigher.mp3');
var audio2 = new Audio('assets/Fuzzy Beep-SoundBible.com-1580329899.mp3');


document.getElementById('start').addEventListener("mousedown", function (e) {
    audio2.play();
    document.getElementById('startMenu').removeChild(document.getElementById('start'));
    document.getElementById('startMenu').removeChild(document.getElementById('startPage'));
    document.getElementById('startMenu').removeChild(document.getElementById('GameTitle'));
    document.body.removeChild(document.getElementById('startMenu'));

    started = true;
    gameStart = true;
    return true;
});

// init() gets executed once
function init(){
    scene = new THREE.Scene();
    audio.play();
    //render() gets called at the end of init
    //as it looped forever
    createRenderer();
    createCamera();

    createEnvironment();

    loadObject();
    createLight();

    document.body.appendChild(renderer.domElement);

    render();

}

//infinite loop
function render(){
    renderer.render(scene,camera);

    if(pause == false){
        requestAnimationFrame(render);
    }

    if(pause == true){

        Pause();
    }
    if (started){
        st = new Date();
        started = false;
    }


    if (gameStart == true){
        timer();
        i ++;
        if (i==250){
            loadEnemies();
            i = 0;
            aux ++;
        }
        if (numObj > 0){
            obj = objects[numObj-1];
            scene.getObjectByName(obj.name).rotation.y += 0.1;
            scene.getObjectByName(obj.name).position.z -= 3*aux;
            scene.getObjectByName(obj.name).position.y -= 3*aux;

            if (isCollision(scene.getObjectByName(obj.name))){
                generateEnd();
            }

            for(j= 0; j<(numObj-1); j++){
                obj = objects[j];
                if(obj.live == 1){
                    scene.remove(scene.getObjectByName(obj.name));
                    objects.splice(j,1);
                    numObj --;
                }else{
                    obj.live --;
                    objects[j] = obj;
                }
            }
        }
    }


    scene.getObjectByName('environment').rotation.y += 0.001;
    movement();
}


function Pause(){
    h1 = document.createElement("h1");
    t = document.createTextNode("PAUSE");
    h1.appendChild(t);
    h1.style.visibility="visible";
    h1.style.position = "absolute";
    h1.setAttribute("id", "pause");
    h1.style.top = "20vh";
    h1.style.left ="30vw";
    h1.style.fontSize = "6em";
    h1.style.width = "100%";
    h1.style.height = "100%";
    h1.style.color = "white";
    document.body.appendChild(h1);
}

function Contiue(){
    document.body.removeChild(document.getElementById("pause"));
}

function createRenderer(){
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x000000, 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
}

function createCamera(){
    camera = new THREE.PerspectiveCamera(
        //parámetros del frustum
        45,
        window.innerWidth/window.innerHeight,
        0.1, 10000
    );
    camera.position.x = 10;
    camera.position.y = -252;
    camera.position.z = -500;
    camera.lookAt(scene.position);
    cameraControl = new THREE.OrbitControls(camera);

}



function createLight(){

    var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10,90, -100);
    directionalLight.name = 'directional';
    scene.add(directionalLight);

    var ambientLight = new THREE.AmbientLight(0x111111);
    scene.add(ambientLight);
}



function createEnvironment(){
    var envGeometry = new THREE.SphereGeometry(690,832,832);
    var envMaterial = new THREE.MeshBasicMaterial();
    envMaterial.map = THREE.ImageUtils.loadTexture('assets/infinitemirrorspace_spherical.jpg');
    envMaterial.side = THREE.BackSide

    var Mesh = new THREE.Mesh(envGeometry, envMaterial);
    Mesh.name = "environment";
    scene.add(Mesh);
}


function createCloudMaterial(){
    var cloudTexture = new THREE.Texture();
    var loader = new THREE.ImageLoader();
    loader.load('assets/fair_clouds_1k.png', function(image){
        cloudTexture.image = image;
        cloudTexture.needsUpdate = true;

    });
    var cloudMaterial = new THREE.MeshPhongMaterial();
    cloudMaterial.map = cloudTexture;
    cloudMaterial.transparent = true;
    return cloudMaterial;

}



function loadObject(){
    var material = new THREE.MeshPhongMaterial();// TODO:load your textures and make material



    mtlLoader = new THREE.MTLLoader();
    mtlLoader.setBaseUrl( "assets/" );
    mtlLoader.setPath( "assets/" );
    mtlLoader.load( 'model.mtl', function( materials ) {
        materials.preload();
        //create loader object
        loader = new THREE.OBJLoader();
        loader.setMaterials(materials);
        //load mesh, second parameter is callback function
        loader.load('assets/model.obj', function(object){
            //mesh file may contain many meshes
            object.name = "model";
            object.traverse(function(child){
                if(child instanceof THREE.Mesh){
                    child.material = material;
                    child.receiveShadow = true;
                    child.castShadow = true;
                }
            });

            object.rotation.y = -300;
            object.position.y = -250;
            object.scale.x = 0.6;
            object.scale.y = 0.6;
            object.scale.z = 0.6;
            var min = new THREE.Vector3(object.position.x, object.position.y-100, object.position.z-100);
            var max = new THREE.Vector3(object.position.x, object.position.y+100, object.position.z+100);
            scene.add(object);

        });
    });

}

function loadEnemies(){
    enemies = ["esfera", "cosa_rara", "icosaedron", "Cubocaedro", "dodecaedro", "cube", "tetra", "octahedro"];
    var material = new THREE.MeshPhongMaterial();// TODO:load your textures and make material

    enemy = Math.floor( Math.random() * ( 1 + (enemies.length-1) - 0 ) ) + 0;
    str1 = "assets/";
    str2= ".obj";
    object_to_load = str1.concat(enemies[enemy].concat(str2));
    numObj ++;




    var mesh = null;

    mtlLoader = new THREE.MTLLoader();
    str1 = "assets/";
    str2= ".mtl";
    material_to_load = str1.concat(enemies[enemy].concat(str2));
    mtlLoader.setBaseUrl( "assets/" );
    mtlLoader.setPath( "assets/" );
    mtlLoader.load( enemies[enemy].concat(str2), function( materials ) {
        materials.preload();
        //create loader object
        loader = new THREE.OBJLoader();
        loader.setMaterials(materials);
        loader.load(object_to_load, function(object){
            //mesh file may contain many meshes in this case only contains one
            object.name = enemies[enemy].concat(numObj);
            object.position.y = 450;
            object.position.z = 600;
            var selection = Math.floor(Math.random() * (3 - 1 + 1)) + 1;

            if(selection == 2) object.position.x = -50;
            if(selection == 3) object.position.x = 50;
            var randomScale = Math.floor(Math.random() * (26 - 15 + 1)) + 15;

            object.scale.set(randomScale,randomScale,randomScale);

            var min = new THREE.Vector3(object.position.x, object.position.y-100, object.position.z-100);
            var max = new THREE.Vector3(object.position.x, object.position.y+100, object.position.z+100);
            var BB = THREE.Box3(min,max);

            var obj = {
                name: enemies[enemy].concat(numObj),
                live: 400,
                BB: BB
            }

            objects.push(obj);

            scene.add(object);

        });

    } );


}



window.addEventListener("keydown", function(e){
    /**
     * Created by noa on 9/5/17.
     */
    switch(e.keyCode){
        case 37:
            moveLeft = true;
            break;
        case 39:
            moveRight = true;
            break;
        case 38:
            moveUp = true;
            break;
        case 40:
            moveDown = true;
            break;
    }
});


window.addEventListener("keyup", function(e){
    /**
     * Created by noa on 9/5/17.
     */
    switch(e.keyCode){
        case 37:
            moveLeft = false;
            break;
        case 39:
            moveRight = false;
            break;
        case 38:
            moveUp = false;
            break;
        case 40:
            moveDown = false;
            break;
    }

    if (e.keyCode == 80 && pause == false){
        pause = true;
        gameStart = false;
        isp = 0;
    }

    if (e.keyCode == 80 && pause == true ){


        if(isp > 0){
            requestAnimationFrame(render);
            pause = false;
            gameStart = true;
            notp = 0;
            Contiue();
        }
        if (isp > 1){
            isp = 0;
        }
        isp++;
        //Contiue();

    }

});

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
            break;
        }
    }
}

function movement(){
    if(moveLeft == true){
        if (scene.getObjectByName('model').position.x < 150){
            scene.getObjectByName('model').position.x += 5;
        }
    }
    if(moveRight == true) {
        if (scene.getObjectByName('model').position.x > -150){
            scene.getObjectByName('model').position.x -= 5;
        }
    }
    if(moveDown == true){
        if (scene.getObjectByName('model').position.y > -300) {

            scene.getObjectByName('model').position.z += 3;
            scene.getObjectByName('model').position.y -= 3;
        }
    }
    if(moveUp == true){
        if(scene.getObjectByName('model').position.y < -20){
            scene.getObjectByName('model').position.z -=3;
            scene.getObjectByName('model').position.y +=3;
        }
    }
}


window.addEventListener('resize', onWindowResize, false );

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}



function createCharacterMaterial(){
    var earthTexture = new THREE.Texture();
    var normalMap = new THREE.Texture();
    var specularMap = new THREE.Texture();

    var loader = new THREE.ImageLoader();
    loader.load('assets/earthmap2k.jpg', function(image){
        earthTexture.image = image;
        earthTexture.needsUpdate = true;

    });
    loader.load('assets/earthspec2k.jpg', function(image){
        specularMap.image = image;
        specularMap.needsUpdate = true;

    });
    loader.load('assets/earth_normalmap_flat2k.jpg', function(image){
        normalMap.image = image;
        normalMap.needsUpdate = true;

    });
    var earthMaterial = new THREE.MeshPhongMaterial();
    earthMaterial.map = earthTexture;

    earthMaterial.normalMap = normalMap;
    earthMaterial.normalScale = new THREE.Vector2(1.0,1.0);

    earthMaterial.specularMap = specularMap;
    earthMaterial.specular = new THREE.Color(0x262626);

    return earthMaterial;

}
function createMaterial(material){
    var Texture = new THREE.Texture();
    var loader = new THREE.ImageLoader();
    loader.load(material, function(image){
        earthTexture.image = image;
        earthTexture.needsUpdate = true;

    });
    var Material = new THREE.MeshPhongMaterial();
    Material.map = Texture;

    return earthMaterial;

}
function createEarth(){

    var sphereGeometry = new THREE.SphereGeometry(15,30,30);
    var sphereMaterial = createEarthMaterial();
    var earthMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    earthMesh.name = 'earth';
    scene.add(earthMesh);
}
function createClouds(){

    var sphereGeometry = new THREE.SphereGeometry(15.1,30,30);
    var sphereMaterial = createCloudMaterial();
    var earthMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    earthMesh.name = 'cloud';
    scene.add(earthMesh);
}
function createBox() {
    var boxGeometry = new THREE.BoxGeometry(6, 4, 6); // height width depth
    var boxMaterial = new THREE.MeshLambertMaterial({
        color: "red"
    });
    var box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.castShadow = true;
    scene.add(box);
}
function createPlane(){
    var planeGeometry = new THREE.PlaneGeometry(20,20);
    var planeMaterial = new THREE.MeshLambertMaterial({
        color:0xcccccc
    });
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.receiveShadow = true;
    plane.rotation.x = -0.5* Math.PI;
    plane.position.y = -2;
    scene.add(plane);
}


function isCollision(object){
    var char = scene.getObjectByName('model');
    if ((object.position.x >= char.position.x -80) && (object.position.x <= char.position.x+80)){
        if ((object.position.y >= char.position.y -100) && (object.position.y <= char.position.y+100)){
            if ((object.position.z >= char.position.z -100) && (object.position.z <= char.position.z+100)){
                return true;
            }
        }
    }
    return false;
}

function generateEnd(){
    gameStart = false;

    document.getElementById('controlPanel').removeChild(document.getElementById('timer'));
    document.getElementById('controlPanel').removeChild(document.getElementById('Elapsed'));
    document.body.removeChild(document.getElementById('controlPanel'));

    var div  = document.createElement("div");
    div.setAttribute("id", "End");
    var h3 = document.createElement("h3");
    h3.setAttribute("id", "EndTitle");
    var t2 = document.createTextNode("GAME OVER");
    h3.appendChild(t2);
    h3.style.visibility ="visible";
    h3.style.position ="absolute";
    h3.style.top = "20vh";
    h3.style.left ="30vw";
    h3.style.fontSize = "6em";
    h3.style.width = "100%";
    h3.style.height = "100%";
    h3.style.color = "white";

    var score = document.createElement("p");
    var t3 = document.createTextNode("Score:   " + minutes + " minutes " + seconds + " seconds");
    score.appendChild(t3);

    score.style.visibility ="visible";
    score.style.position ="absolute";
    score.style.top = "45vh";
    score.style.left ="20vw";
    score.style.fontSize = "3em";
    score.style.width = "100%";
    score.style.height = "100%";
    score.style.color = "white";

    var img = document.createElement("img");
    img.setAttribute("id", "EndImg");
    img.setAttribute("src", "assets/end.jpg");
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.top = "0vh";
    img.style.position = "absolute";
    img.style.visibility = "visible";


    var button = document.createElement("button");
    button.setAttribute("id", "EndButton");
    button.setAttribute("type", "button");
    button.style.top = "60vh";
    button.setAttribute("onClick", "window.location.reload()");
    var t = document.createTextNode("Restart");
    button.appendChild(t);
    div.appendChild(img);
    div.appendChild(score);
    div.appendChild(h3);
    div.appendChild(button);
    document.body.appendChild(div);
}


function timer(){

    if(gameStart == true){
        // Update the count down every 1 second
        var x = setInterval(function() {

            current = new Date();
            s =  current.getSeconds() - st.getSeconds();
            seconds = s;
            if (s<0){
                seconds = 60 + s;
            }

            if (seconds == 59) minutes ++;
            minutes =  current.getMinutes() - st.getMinutes();
            document.getElementById("timer").innerHTML = minutes + " : " + seconds;
        }, 1000);
    }

}

init();
