import { PhysicsGame } from './pixelrunner.js';
const game = new PhysicsGame();
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

            //after clicking a button remove overlay
            $('#overlay').css('display', 'none');

        })
    });

});
    