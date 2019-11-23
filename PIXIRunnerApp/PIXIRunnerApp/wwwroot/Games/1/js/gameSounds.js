export default class GameSounds {
    constructor() { }
    //sound effects
    soundEffectVolume = 0.1;
    coin_obj = new Audio('/Games/1/sounds/coin.wav');
    
    rock_obj = new Audio('/Games/1/sounds/fall_rock.mp3');

    throw_obj = new Audio('/Games/1/sounds/throw.wav');
    
    spike_obj = new Audio('/Games/1/sounds/spike.wav');

    //music
    musicVolume = 0.6;
    currentIndex;
    maxIndex = 1;
    start_bg_music(index) {
        this.currentIndex = index;
        var bg = new Audio('/Games/1/sounds/bg_music' + index + '.mp3');
        bg.volume = this.musicVolume;
        bg.load();
        bg.play();

        $(bg).on("ended", function () {

            if (this.currentIndex == this.maxIndex)
                this.currentIndex = 0;
            else
                this.currentIndex++;

            this.start_bg_music(this.currentIndex);
        }.bind(this));
        
    }


    coin() {
        this.coin_obj.volume = this.soundEffectVolume;
        //console.log("coin sound");
        this.coin_obj.load();
        this.coin_obj.play();
    }

    rock_hit() {
        this.rock_obj.volume = this.soundEffectVolume;
        //console.log("rock sound");
        this.rock_obj.load();
        this.rock_obj.play();
    }

    rock_throw() {
        this.throw_obj.volume = this.soundEffectVolume;
        //console.log("throw sound");
        this.throw_obj.load();
        this.throw_obj.play();
    }

    spike() {
        this.spike_obj.volume = this.soundEffectVolume;
        this.spike_obj.load();
        this.spike_obj.play();
    }
}