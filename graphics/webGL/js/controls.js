
var moveLeft;
var moveRight;
window.addEventListener("keydown", function(e){
    /**
     * Created by noa on 9/5/17.
     */
    switch(e.key){
        case 'a'://scene.getObjectName('model').position.x +=1;
                moveLeft = true;
                break;
        case 'b'://scene.getObjectName('model').position.x -=1;
                moveRight = true;
            break;
    }
});
window.addEventListener("keyup", function(e){
    /**
     * Created by noa on 9/5/17.
     */
    switch(e.key){
        case 'a'://scene.getObjectName('model').position.x +=1;
            moveLeft = false;
            break;
        case 'b'://scene.getObjectName('model').position.x -=1;
            moveRight = true;
            break;
    }
});

function movement(){
    if(moveLeft){
        scene.getObjectName('model').position.x +=1;
    }
    if(moveRight){
        scene.getObjectName('model').position.x -=1;
    }
}
