import { PhysicsGame } from './pixelrunner.js';
import GameSounds from './gameSounds.js'
const sounds = new GameSounds();
const game = new PhysicsGame(sounds);
game.preInit();

var _userGameState;
var _userGameSettings;

$(document).ready(function () {
    var saves = document.querySelectorAll("#launcher button");
    const gameID = document.querySelector(".cont").id;

    saves.forEach((el) => {
        el.addEventListener("click", (el) => {
            if (!el.target.id) {
                console.log("new button");
                $.ajax({
                    url: "/Game/NewGame?id="+ gameID,
                    success: function (response) {
                        game.onLoad(response);
                        game.init();
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
                    document.getElementById("launcher").hidden = true;

                }
            });

            //hide launcher buttons.
            //$('#overlay').css('display', 'none');

        })
    });
    //$.get("Game/UserGameState", (data) => {
    //    if (data) {

    //    }
    //})
    $.get("/Game/UserGameSettings?id="+gameID, (data) => {
        if (data) {
            _userGameSettings = new UserGameSettings(data.soundEnabled, data.musicVolume, data.soundEffectVolume);
            sounds.set_volume('se', _userGameSettings.soundEffectVolume);
            sounds.set_volume('be', _userGameSettings.musicVolume);
            sounds.set_enabled(_userGameSettings.soundsEnabled);
        }
    })

    $('#closeStoreBtn').click({ name: 'store' }, toggleOverlay);
    $('#closeSettingsBtn').click({ name: 'settings' }, toggleOverlay);

    $('#musicSlider').on('input', function () { sounds.set_volume('bg', this.value) }); //TODO: hook these up to server
    $('#effectsSlider').on('input', function () { sounds.set_volume('se', this.value) });
});

function toggleOverlay(event) {
    let name = event.data.name;
    $('#' + name).toggleClass('show');
    game.toggle_pause();
}

class UserGameState {
    constructor(gold, skins, selectedSkin, minutesPlayed) {
        this.gold = gold;
        this.skins = skins;
        this.selectedSkin = selectedSkin
    }
}

class UserGameSettings {
    constructor(soundEnabled, musicVolume, soundEffectVolume) {
        this.soundEnabled = soundEnabled;
        this.musicVolume = musicVolume/100;
        this.soundEffectVolume = soundEffectVolume / 100;
        this.updateGameSettings();
    }
    /*updateGameSettings updates the UserGameSettings database record with this */
    updateGameSettings() {
        $.post("/Game/UpdateGameSettings", this);
    }

}