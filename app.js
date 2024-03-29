var organizeByTags = function (toDoObjects) { 
	var tags = [];
	toDoObjects.forEach(function (toDo) {
		toDo.tags.forEach(function (tag) {
			if (tags.indexOf(tag) === -1) { 
				tags.push(tag);
			}
		});
	}); 
	var tagObjects = tags.map(function (tag) {
		var toDosWithTag = []; 
		toDoObjects.forEach(function (toDo) {
			if (toDo.tags.indexOf(tag) !== -1) { 
				toDosWithTag.push(toDo.description);
			}
		});
		return { "name": tag, "toDos": toDosWithTag };
	});
	return tagObjects;
};

var liaWithEditOrDeleteOnClick = function (todo, callback) {
	var $todoListItem = $("<li>").text(todo.description),
		$todoEditLink = $("<a>").attr("href", "todos/" + todo._id),
		$todoRemoveLink = $("<a>").attr("href", "todos/" + todo._id);

	$todoEditLink.addClass("linkEdit");
	$todoRemoveLink.addClass("linkRemove");

	$todoRemoveLink.text("Удалить");
	$todoRemoveLink.on("click", function () {
		$.ajax({
			url: "/todos/" + todo._id,
			type: "DELETE"
		}).done(function (responde) {
			callback();
		}).fail(function (err) {
			console.log("error on delete 'todo'!");
		});
		return false;
	});
	$todoListItem.append($todoRemoveLink);

	$todoEditLink.text("Редактировать");
	$todoEditLink.on("click", function() {
		var newDescription = prompt("Введите новое наименование для задачи", todo.description);
		if (newDescription !== null && newDescription.trim() !== "") {
			$.ajax({
				"url": "/todos/" + todo._id,
				"type": "PUT",
				"data": { "description": newDescription },
			}).done(function (responde) {
				callback();
			}).fail(function (err) {
				console.log("Произошла ошибка: " + err);
			});
		}
		return false;
	});
	$todoListItem.append($todoEditLink);

	return $todoListItem;
}

var main = function (toDoObjects) {
	"use strict";
	var tabs = [];
	tabs.push({
		"name": "Новые",
		"content": function(callback) {
			$.getJSON("todos.json", function (toDoObjects) {
				var $content = $("<ul>");
				for (var i = toDoObjects.length-1; i>=0; i--) {
					var $todoListItem = liaWithEditOrDeleteOnClick(toDoObjects[i], function() {
						$(".tabs a:first-child span").trigger("click");
					});
					$content.append($todoListItem);
				}
				callback(null, $content);
			}).fail(function (jqXHR, textStatus, error) {
				callback(error, null);
			});
		}
	});

	tabs.push({
		"name": "Старые",
		"content": function(callback) {
			$.getJSON("todos.json", function (toDoObjects) {
				var $content,
					i;
				$content = $("<ul>");
				for (i = 0; i < toDoObjects.length; i++) {
					var $todoListItem = liaWithEditOrDeleteOnClick(toDoObjects[i], function() {
						$(".tabs a:nth-child(2) span").trigger("click");
					});
					$content.append($todoListItem);
				}
				callback(null, $content);
			}).fail(function(jqXHR, textStatus, error) {
				callback(error, null);
			});
		}
	});

	// добавляем вкладку Теги
	tabs.push({
		"name": "Теги",
		"content":function (callback) {
			$.get("todos.json", function (toDoObjects) {	
				var organizedByTag = organizeByTags(toDoObjects),
					$content;
				organizedByTag.forEach(function (tag) {
					var $tagName = $("<h3>").text(tag.name);
						$content = $("<ul>");
					tag.toDos.forEach(function (description) {
						var $li = $("<li>").text(description);
						$content.append($li);
					});
					$("main .content").append($tagName);
					$("main .content").append($content);
				});
				callback(null,$content);
			}).fail(function (jqXHR, textStatus, error) {
				callback(error, null);
			});
		}
	});

	tabs.push({
		"name": "Добавить",
		"content":function () {
			$.get("todos.json", function (toDoObjects) {
				var $textInput = $("<h3>").text("Новая задача: "),
					$input = $("<input>").addClass("description"), 
					$textTag = $("<h3>").text("Теги: "),
					$tagInput = $("<input>").addClass("tags"),
					$button = $("<button>").text("+"),
					$content1 = $("<ul>"), $content2 = $("<ul>");

				$content1.append($input);
				$content2.append($tagInput);

				$("main .content").append($textInput);
				$("main .content").append($content1);
				$("main .content").append($textTag);
				$("main .content").append($content2);
				$("main .content").append($button); 
				
				function btnfunc() {
					var description = $input.val(),
						tags = $tagInput.val().split(","),
						newToDo = {"description":description, "tags":tags};
					$.post("todos", newToDo, function(result) {
						$input.val("");
						$tagInput.val("");
						$(".tabs a:first-child span").trigger("click");
					});
				}
				$button.on("click", function() {
					btnfunc();
				});
				$('.tags').on('keydown',function(e){
					if (e.which === 13) {
						btnfunc();
					}
				});
			});
		}
	});

	tabs.forEach(function (tab) {
		var $aElement = $("<a>").attr("href",""),
			$spanElement = $("<span>").text(tab.name);
		$aElement.append($spanElement);
		$("main .tabs").append($aElement);

		$spanElement.on("click", function () {
			var $content;
			$(".tabs a span").removeClass("active");
			$spanElement.addClass("active");
			$("main .content").empty();
			tab.content(function (err, $content) {
				if (err !== null) {
					alert ("Возникла проблема при обработке запроса: " + err);
				} else {
					$("main .content").append($content);
				}
			});
			return false;
		});
	});

	$(".tabs a:first-child span").trigger("click");
}

$(document).ready(function() {
	$.getJSON("todos.json", function (toDoObjects) {
		main(toDoObjects);
	});
});