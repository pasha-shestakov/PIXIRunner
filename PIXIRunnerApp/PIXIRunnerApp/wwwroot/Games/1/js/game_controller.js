import { PhysicsGame } from './pixelrunner.js';
import GameSounds from './gameSounds.js'
const sounds = new GameSounds();
const game = new PhysicsGame(sounds);
game.preInit();

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
    
    $('#closeStoreBtn').click({ name: 'store' }, toggleOverlay);
    $('#closeSettingsBtn').click({ name: 'settings' }, toggleOverlay);

    $('#disabled').on('input', function () {
        sounds.toggleEnable();
        let isDisabled = $('#musicSlider').is(':disabled');
        if (isDisabled) $('#musicSlider').prop('disabled', false); else $('#musicSlider').prop('disabled', true);

        isDisabled = $('#effectsSlider').is(':disabled');
        if (isDisabled) $('#effectsSlider').prop('disabled', false); else $('#effectsSlider').prop('disabled', true);
    })
    $('#musicSlider').on('input', function () { sounds.set_volume('bg', this.value) });
    $('#effectsSlider').on('input', function () { sounds.set_volume('se', this.value) });
});

function toggleOverlay(event) {
    let name = event.data.name;
    $('#' + name).toggleClass('show');
    game.toggle_pause();
}
    