import { PhysicsGame } from './pixelrunner.js';
import GameSounds from './gameSounds.js'
const sounds = new GameSounds();
const game = new PhysicsGame(sounds);
game.preInit();

var _userGameState;
var _userGameSettings;
var _gameId;
$(document).ready(function () {
    var saves = document.querySelectorAll("#launcher button");
    _gameId = document.querySelector(".cont").id;
    saves.forEach((el) => {
        el.addEventListener("click", (el) => {
            if (!el.target.id) {
                console.log("new button");
                $.ajax({
                    url: "/Game/NewGame?id="+ _gameId,
                    success: function (response) {
                        game.onLoad(response);
                        game.init();
                        initGameSettings();
                        initGameState();
                        document.getElementById("launcher").hidden = true;
                    }
                });
                return;
            }
            $.ajax({
                url: "/Game/SavedStates?id=" + el.target.id,
                success: function (response) {
                    game.onLoad(response);
                    game.init();
                    initGameSettings();
                    initGameState();
                    document.getElementById("launcher").hidden = true;

                }
            });

            //hide launcher buttons.
            //$('#overlay').css('display', 'none');

        })
    });

    $('#closeStoreBtn').click({ name: 'store' }, toggleOverlay);
    $('#closeSettingsBtn').click({ name: 'settings' }, toggleOverlay);

    $('#disabled').on('input', function () { _userGameSettings.toggleDisabledSound() })
    $('#musicSlider').on('input', function (value) { _userGameSettings.setMusicVolume(value.target.value) });
    $('#effectsSlider').on('input', function (value) { _userGameSettings.setEffectVolume(value.target.value) });
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
    $.get("/Game/UserGameState?id=" + _gameId, (data) => {
        if (data) {
            _userGameState = new UserGameState(
                data.id,
                data.gold,
                data.unlockedSkins,
                data.selectedSkin,
                data.minutesPlayed,
                data.checkpoint
            );
        }
    })
}

function toggleOverlay(event) {
    let name = event.data.name;
    $('#' + name).toggleClass('show');
    game.toggle_pause();
    game.overlayActive = false;
}

class UserGameState {
    constructor(id, gold, unlockedSkins, selectedSkin, minutesPlayed, checkpoint) {
        this.id = id;
        this.gold = gold;
        this.unlockedSkins = unlockedSkins;
        this.selectedSkin = selectedSkin;
        this.minutesPlayed = minutesPlayed;
        this.checkpoint = checkpoint;
    }

    updateGameState() {
        $.post("/Game/UpdateUserGameState", this);
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