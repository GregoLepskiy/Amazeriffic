var main = function (){
    "use strict";
    $(document).ready(function () {
        $.getJSON("users.json", function (users) {
            var $content = $("<ul>"),
                    $input = $("<input>").addClass("login"),
                    $inputLabel = $("<p>").text("Login: "),
                    $button = $("<button>").text("Войти");
            
            $content.append($inputLabel);
            $content.append($input);
            $content.append($button);
            $("main .content").append($content);

            function butfunc() {
                var login = $input.val();
                if (login !== "" && login.trim() !== "" && login.trim().length === login.length){
                    var truth = false;
                    for (var i = 0; i < users.length; i++) {
                        if (login === users[i].username) {
                            truth = true;
                            window.open("http://localhost:3000/user/" + login + "/list.html", "_self");
                            break;
                        }
                    }
                    if (!truth) {
                        alert("Пользователь не найден");
                    }
                }
            }
            $button.on("click", function () {
                butfunc();
            });
            $('.login').on('keypress', function (event) {
                if (event.keyCode === 13) {
                    butfunc();
                }
            });
        });
    });
};
$(document).ready(main);