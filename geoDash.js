var game;
var SCREEN_W = 500;
var SCREEN_H = 240;

var bootState = {
    preload: function() {
        game.load.image('progressBar', 'assets/progressBar.png');
    },
    
    create: function() {
        game.stage.backgroundColor = "#000000"; //would change this line to change the color of the background
        game.physics.startSystem(Phaser.Physics.ARCADE); //would change this line if using anything other than ARCADE
        game.state.start('load');
    }
};

var loadState = {
    preload: function() {
        var progressBar = game.add.sprite(SCREEN_W/2, SCREEN_H/2, 'progressBar');
        progressBar.anchor.setTo(.5, .5);
        
        game.load.setPreloadSprite(progressBar);
        //Load the tileset image inside the assets folder
        game.load.image('tileset', 'assets/tileset.png');
        //Load the tilemap inside the assets folder
        game.load.tilemap('map', 'assets/jonsmap.json', null, Phaser.Tilemap.TILED_JSON);  
        //Load the player image inside the assets folder
        game.load.image('geo', 'assets/player.png');
    },
    
    create: function() {
        game.state.start('menu');
    }
    
    
};

var menuState = {
    preload: function() {},
    
    create: function() {
        var text;
        if(game.device.desktop) {
            text = "Press the Up Arrow Key to Start!"
            var upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
            upKey.onDown.addOnce(this.startGame, this);
        } else {
            text = "Tap the Screen to Start!"
            game.input.onTap.addOnce(this.startGame, this);
        }
        var startLabel = game.add.text(SCREEN_W/2, SCREEN_H-80, text, {
        //var startLabel = game.add.text(game.world.centerX, game.world.height - 80, text, {
            font: '20px Roboto',
            fill: '#FFFFFF'
        });
        startLabel.anchor.setTo(.5, .5);
    },
    startGame: function() {
        game.state.start('play');
    }
};

var playState = {
    preload: function() {
        
    },
    
    create: function() {
       this.player = game.add.sprite(250, 170, 'geo');
       this.player.anchor.setTo(.5,.5);
       game.physics.arcade.enable(this.player);
       this.player.body.gravity.y = 2000;  //make him fall fast!
        
       this.createWorld(); //calls our createWorld function!   
        
       // have the camera follow our player
       this.game.camera.follow(this.player, Phaser.Camera.FOLLOW_PLATFORMER);
        
        //add jumping to player
        this.cursor = game.input.keyboard.createCursorKeys();
        
        this.map.setTileIndexCallback(1, this.restart, this);  //Any object that collides with tile index 1 will call this.restart
        this.map.setTileIndexCallback(2, this.restart, this);  //Any object that collides with tile index 2 will call this.restart
    },
    
    update: function() {
        //ALWAYS add collisions in beginning
        // physics between player and map
        //game.physics.arcade.collide(this.player, this.map);
        game.physics.arcade.collide(this.player, this.layer);
        
        this.movePlayer();
    },
    
    createWorld: function() {
        
        this.map = game.add.tilemap('map');
        this.map.addTilesetImage('tileset');
        this.layer = this.map.createLayer('Tile Layer 1');
        this.layer.resizeWorld();
        
        this.map.setCollisionBetween(0, 2, false); //Sets the first two tiles(spikes)collision to be off (Phaser tile indices start at 1, Tiled tile indices start at 0)
        this.map.setCollisionBetween(3, 1000, true); //Sets the rest to be true
        
    },
    
    movePlayer: function(){
        /////////////////////////////////////// THIS SHOULD NOT BE 
        ///////////////////////////////////////his.player.body.velocity.x = 300;  
        // change to this.player

        this.player.body.velocity.x = 300;  
        //always make `this.sprite` move right each frame

        //use body.onFloor() with tilemaps instead of body.touching.down
        if(this.player.body.onFloor()){    
            if(game.device.desktop){
                 if(this.cursor.up.isDown)
                      this.jumpPlayer();
            }
            else 
                game.input.onTap.addOnce(this.jumpPlayer, this);    //This allows for both mouse clicks and mobile taps!!
        }
    },
    
    jumpPlayer: function(){
        //Make the player flip!
        game.add.tween(this.player).to({angle: 180},500).start(); 
        //Add an upwards force to the player's velocity
        this.player.body.velocity.y = -550;  
    },
    
    restart: function(){
        if(!this.player.alive)  //if the player is not alive return
                return;

        this.player.kill();   //remove player if it hasn't been   
        game.time.events.add(1000, game.state.start('menu'), this);
    }
    
};

game = new Phaser.Game(SCREEN_W, SCREEN_H, Phaser.AUTO, 'game');
game.state.add('boot', bootState);
game.state.add('load', loadState);
game.state.add('menu', menuState);
game.state.add('play', playState);
game.state.start('boot');