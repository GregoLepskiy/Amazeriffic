var main = function() {
    "use strict";
    var tabs = [];
    tabs.push({
        "name" : "Пользователи",
        "content" : function (callback) {
            $.getJSON("users.json", function (users) {
                var $content = $("<ul>");
                users.forEach(function (user) {
                    $content.append($("<li>").text("Login: " + user.username));
                });
                callback(null, $content);
            }).fail(function (jqXHR, textStatus, error) {
                callback(error, null);
            });
        }
    });
    tabs.push({
        "name" : "Добавить",
        "content" : function () {
            $.getJSON("users.json", function (users) {
                var $content = $("<ul>"),
                    $input = $("<input>").addClass("login"),
                    $inputLabel = $("<p>").text("Login: "),
                    $button = $("<button>").text("+");
                
                $content.append($inputLabel);
                $content.append($input);
                $content.append($button);
                $("main .content").append($content);
                
                $(".login").on("keydown", function (e) {
                    var reg = /[а-яё]/i;
                    if (reg.test(this.val())) {
                        e.preventDefault();
                        alert("Введите латинские символы");
                        return false;
                    }
                });

                function butfunc() {
                    var login = $input.val(),
                        newUser = ({"username" : login});
                    if (login !== "" && login.trim() !== "") {
                        $.post("users", newUser, function (result) {
                            $input.val("");
                            $(".tabs a:first span").trigger("click");
                        });
                    }
                }
                $button.on("click", function () {
                    butfunc();
                });
                $(".login").on("keypress", function (event) {
                    if (event.keyCode === 13) {
                        butfunc();
                    }
                });
            });
        }
    });
    $(document).ready(function () {
        tabs.forEach(function (tab) {
            var $aElement = $("<a>").attr("href", ""),
                $spanElement = $("<span>").text(tab.name);
            $aElement.append($spanElement);
            $(".tabs").append($aElement);
            $spanElement.on("click", function () {
                $(".tabs a span").removeClass("active");
                $spanElement.addClass("active");
                $(".content").empty();
                tab.content(function (err, $content) {
                    if (err !== null) {
                        alert("There're some problems");
                    } else {
                        $(".content").append($content);
                    }
                });
                return false;
            });
        });
        $(".tabs a:first span").trigger("click");
    });
};
$("document").ready(main);