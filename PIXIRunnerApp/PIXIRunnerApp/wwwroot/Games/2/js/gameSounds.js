export default class GameSounds {
    constructor() { }

    //only a single bg at one time.
    bg;

    //for effects
    playing_sounds = {};
    soundID = 0;

    disableSound = false;
    //sound effects
    soundEffectVolume = 0.10;
    
    coin_obj = {
        sound: new Audio('/Games/1/sounds/coin.wav'),
        scale: 1
    }
    
    rock_obj = {
        sound: new Audio('/Games/1/sounds/fall_rock.mp3'),
        scale: .8
    }

    throw_obj = {
        sound: new Audio('/Games/1/sounds/throw.wav'),
        scale: 1
    }
    
    spike_obj = {
        sound: new Audio('/Games/1/sounds/spike.wav'),
        scale: 1
    }

    walk = {
        sound: new Audio('/Games/1/sounds/player_walk.wav'),
        scale: 1
    }

    oof = {
        sound: new Audio('/Games/1/sounds/oof.wav'),
        scale: 1
    }

    open_menu = {
        sound: new Audio('/Games/1/sounds/menu_open.wav'),
        scale: 1
    }

    chest = {
        sound: new Audio('/Games/1/sounds/chest_open.wav'),
        scale: 1
    }

    lever = {
        sound: new Audio('/Games/1/sounds/lever.wav'),
        scale: 1.3
    }

    open_door_obj = {
        sound: new Audio('/Games/1/sounds/open_door.wav'),
        scale: 1
    }

    //music
    musicVolume = 0.06;
    currentIndex;
    maxIndex = 1;
    start_bg_music(index) {
        this.currentIndex = index;
        this.bg = new Audio('/Games/1/sounds/bg_music' + index + '.mp3');

        if (this.disableSound)
            this.bg.volume = 0;
        else
            this.bg.volume = this.musicVolume;
            
        this.bg.load();
        this.bg.play(); //every call to play is added to the dictionary;

        $(this.bg).on("ended", function () {

            if (this.currentIndex == this.maxIndex)
                this.currentIndex = 0;
            else
                this.currentIndex++;

            this.start_bg_music(this.currentIndex);
        }.bind(this));


        
        
    }

    set_volume(type, level) {
        if (type === 'bg') { //background
            //will affect all new background music.
            this.musicVolume = level;

            if (this.bg) this.bg.volume = level;


        } else if (type === 'se') { //sound effect

            //will affect all new sound effects.
            this.soundEffectVolume = level;
            //TODO
            for (var id in this.playing_sounds) {
                this.playing_sounds[id].volume = level;
            }
        }
    }

    toggleEnable() {
        this.disableSound = !this.disableSound;
        this.updateSoundEnabled();
    }
    updateSoundEnabled() {
        if (this.disableSound) {
            if (this.bg) this.bg.volume = 0;
            for (var id in this.playing_sounds) {
                this.playing_sounds[id].pause();
                delete this.playing_sounds[id];
            }
            this.playing_sounds = {};
        }
        else {
            if (this.bg) this.bg.volume = this.musicVolume;
        }
    }
    set_enabled(enabled) {
        this.disableSound = enabled;
        this.updateSoundEnabled();
    }

    disable_sounds() {
        this.disableSound = false;
    }

    play_sound(obj) {
        let sound = obj.sound;
        if (!this.disableSound) {
            sound.volume = this.soundEffectVolume * obj.scale;
            sound.load();
            sound.play();

            let thisID = this.soundID++;
            this.playing_sounds[thisID] = sound;
            $(sound).on("ended", function () {

                delete this.playing_sounds[thisID];
            }.bind(this));
        }
        
    }
    coin() {
        this.play_sound(this.coin_obj);
    }

    rock_hit() {
        this.play_sound(this.rock_obj);
    }

    rock_throw() {
        this.play_sound(this.throw_obj);
    }

    spike() {
        this.play_sound(this.spike_obj);
    }

    player_walk() {
        this.play_sound(this.walk);
    }

    player_hurt() {
        this.play_sound(this.oof);
    }

    menu_open() {
        this.play_sound(this.open_menu);
    }

    open_chest() {
        this.play_sound(this.chest);
    }

    pull_lever() {
        this.play_sound(this.lever);
    }

    open_door() {
        this.play_sound(this.open_door_obj);
    }
}