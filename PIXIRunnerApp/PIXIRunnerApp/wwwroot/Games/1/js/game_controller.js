import { PhysicsGame } from './pixelrunner.js';
import GameSounds from './gameSounds.js'
const sounds = new GameSounds();
const game = new PhysicsGame(sounds);
game.preInit();

var _userSaveState;
var _userGameState;
var _userGameSettings;
var _gameId;
$(document).ready(function () {
    return new Promise((resolve, reject) => {
        var saves = document.querySelectorAll("#launcher button");
        _gameId = document.querySelector(".cont").id;
        saves.forEach((el) => {
            el.addEventListener("click", (el) => {
                if (!el.target.id) {
                    console.log("new button");
                    $.ajax({
                        url: "/Game/NewGame?id=" + _gameId,
                        success: function (response) {
                            _userSaveState = new UserSaveState(response);

                            initGameState();
                        }
                    });
                    return;
                }
                $.ajax({
                    url: "/Game/SavedStates?id=" + el.target.id,
                    success: function (response) {
                        _userSaveState = new UserSaveState(response);
                        initGameState();


                    }
                });
            })
        });

        $('#closeStoreBtn').click({ name: 'store' }, toggleOverlay);
        $('#closeSettingsBtn').click({ name: 'settings' }, toggleOverlay);

        $('#disabled').on('input', function () { _userGameSettings.toggleDisabledSound() })
        $('#musicSlider').on('input', function (value) { _userGameSettings.setMusicVolume(value.target.value) });
        $('#effectsSlider').on('input', function (value) { _userGameSettings.setEffectVolume(value.target.value) });
        resolve();

    }).then(() => {
        initGameSettings();
    });
    
});

function initGameSettings(){
    $.get("/Game/UserGameSettings?id=" + _gameId, (data) => {
        if (data) {
            _userGameSettings = new UserGameSettings(data.id, data.soundDisabled, data.musicVolume, data.soundEffectVolume);
            sounds.set_volume('se', _userGameSettings.soundEffectVolume);
            sounds.set_volume('bg', _userGameSettings.musicVolume);
            sounds.set_enabled(_userGameSettings.soundDisabled);
            //document.getElementById('disabled').value = _userGameSettings.soundDisabled ? 'off' : 'on';
            document.getElementById('disabled').checked = _userGameSettings.soundDisabled;
            let isEnabled = _userGameSettings.soundDisabled
            if (isEnabled) {
                $('#musicSlider').prop('disabled', true); 
                $('#effectsSlider').prop('disabled', true); 
            } else {
                $('#musicSlider').prop('disabled', false);
                $('#effectsSlider').prop('disabled', false);
            }
            document.getElementById('musicSlider').value = _userGameSettings.musicVolume;
            document.getElementById('effectsSlider').value = _userGameSettings.soundEffectVolume;
        }
    });
}

function initGameState() {
    return new Promise((resolve, reject) => {

        $.get("/Game/UserGameState?id=" + _gameId, (data) => {
            if (data) {
                _userGameState = new UserGameState(
                    data.id,
                    data.gold,
                    data.unlockedSkins,
                    data.selectedSkin,
                    data.minutesPlayed
                );
                resolve();
            }
        })
    }).then(() => {
        game.onLoad(_userSaveState, _userGameState);
        game.init();
        document.getElementById("launcher").hidden = true;
    });
    
}


window.onbeforeunload = function () {
    saveGameAutomatically();
}

function saveGameAutomatically() {

    _userSaveState.updateSaveState();
    _userGameState.updateGameState();
}

function toggleOverlay(event) {
    let name = event.data.name;
    $('#' + name).toggleClass('show');
    game.toggle_pause();
    game.overlayActive = false;
}

class UserGameState { // GLOBAL between all games
    constructor(id, gold, unlockedSkins, selectedSkin, minutesPlayed) {
        this.id = id;
        this.gold = gold;
        this.unlockedSkins = unlockedSkins;
        this.selectedSkin = selectedSkin;
        this.minutesPlayed = minutesPlayed;
    }

    updateGameState() {
        $.post("/Game/UpdateUserGameState", this);
    }
}

class UserSaveState { // SPECIFIC to a SINGLE game
    constructor(response) {
        console.log("HELLO: ", response);
        this.saveStateID = response.saveStateID;
        this.gameID = response.gameID;
        this.userID = response.userID;
        this.checkpoint = response.checkpoint;
        this.lives = response.lives;
        this.maxLives = response.maxLives;
    }

    updateSaveState() {
        $.post("/Game/UpdateSaveState", this);
    }
}

class UserGameSettings {
    constructor(id, soundDisabled, musicVolume, soundEffectVolume)
    {
        this.id = id;
        this.soundDisabled = soundDisabled;
        this.musicVolume = musicVolume;
        this.soundEffectVolume = soundEffectVolume;
    }
    toggleDisabledSound() {
        sounds.toggleEnable();
        this.soundDisabled = !this.soundDisabled;
        let isDisabled = $('#musicSlider').is(':disabled');
        if (isDisabled) $('#musicSlider').prop('disabled', false); else $('#musicSlider').prop('disabled', true);

        isDisabled = $('#effectsSlider').is(':disabled');
        if (isDisabled) $('#effectsSlider').prop('disabled', false); else $('#effectsSlider').prop('disabled', true);
        this.updateGameSettings();
    }

    setMusicVolume(volume) {
        this.musicVolume = Number(volume);
        this.updateGameSettings();
        sounds.set_volume('bg', this.musicVolume);
    }
    setEffectVolume(volume) {
        this.soundEffectVolume = Number(volume);
        this.updateGameSettings();
        sounds.set_volume('se', this.soundEffectVolume);
    }
   
    /**
     * updateGameSettings updates the UserGameSettings database record with this
     */
    updateGameSettings() {
        $.post("/Game/UpdateUserGameSettings", this);
    }

}