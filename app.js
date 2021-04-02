var organizeByTag = function(toDoObjects){
	console.log("organizeByTag called");
	var tags = [];
	toDoObjects.forEach(function (toDo){
		toDo.tags.forEach(function (tag){
			if(tags.indexOf(tag) === -1){
				tags.push(tag);
			}
		});
	});
	console.log(tags);
	var tagObjects = tags.map(function (tag){
		var toDosWithTag = [];
		toDoObjects.forEach(function (toDo){
			if(toDo.tags.indexOf(tag) !== -1){
				toDosWithTag.push(toDo.description);
			}
		});
		return { "name":tag, "toDos":toDosWithTag };
	});
	console.log(tagObjects);
	return tagObjects;
};

var liaWithDeleteOnClick = function (todo) {
	var $todoListItem = $("<li>").text(todo.description),
		$todoRemoveLink = $("<a>").attr("href", "todos/" + todo._id);
	$todoRemoveLink.text("Удалить");
	console.log("todo._id: " + todo._id);
	console.log("todo.description: " + todo.description);
	$todoRemoveLink.on("click", function () {
		$.ajax({
			"url" : "todos/" + todo._id,
			"type" : "DELETE"
		}).done(function (response) {
			$(".tabs a:first-child span").trigger("click");
		}).fail(function (err) {
			console.log("error on delete 'todo'");
		});
		return false;
	});
	$todoListItem.append($todoRemoveLink);
	return $todoListItem;
};

var liaWithEditOnClick = function (todo) {
	var $todoListItem = $("<li>").text(todo.description),
		$todoRemoveLink = $("<a>").attr("href", "todos/" + todo._id);
	$todoRemoveLink.text("Редактировать");
	$todoRemoveLink.on("click", function () {
		var newDescription = prompt("Введите новое наименование для задачи", todo.description);
		if (newDescription !== null && newDescription.trim() !== ""){
			$.ajax({
				url: "todos/" + todo._id,
				type: "PUT",
				data: {"description" : newDescription}
			}).done(function (response) {
				$(".tabs a:nth-child(2) span").trigger("click");
			}).fail(function (err) {
				console.log("error on update 'todo'");
			});
		}
		return false;
	});
	$todoListItem.append($todoRemoveLink);
	return $todoListItem;
};

var main = function () {
	"use strict";
	var tabs;
	tabs = [];
	tabs.push({
		"name" : "Новые",
		"content" : function (callback) {
			$.getJSON("todos.json", function (toDoObjects) {
				var $content;
				$content = $("<ul>");
				for (var i = toDoObjects.length-1; i > -1; i--) { 
					$content.append(liaWithDeleteOnClick(toDoObjects[i]));
				}
				callback(null, $content);
			}).fail(function (jqXHR, textStatus, error) {
				callback(error, null);
			});
		}
	});
	tabs.push({
		"name" : "Старые",
		"content" : function (callback) {
			$.getJSON("todos.json", function (toDoObjects) {
				var $content;
				$content = $("<ul>");
				toDoObjects.forEach(function (todo) {
					$content.append(liaWithEditOnClick(todo));
				});
				//$content.append("</ul>");
				callback(null, $content);
			}).fail(function (jqXHR, textStatus, error) {
				callback(error, null);
			});
		}
	});
	tabs.push({
		"name" : "Теги",
		"content" : function (callback) {
			$.getJSON("todos.json", function (toDoObjects) {
				var organizedByTag = organizeByTag(toDoObjects),
					$content;
				organizedByTag.forEach(function (tag) { 
					var $tagname = $("<h3>").text(tag.name); 
					$content = $("<ul>"); 
					tag.toDos.forEach(function (description) { 
						var $li = $("<li>").text(description); 
						$content.append($li);
					});
					$("main .content").append($tagname);
					$("main .content").append($content);
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
			$.getJSON("todos.json", function (toDoObjects){
				var $content = $("<ul>"),
					$input = $("<input>").addClass("description"),
					$inputLabel = $("<p>").text("Новая задача: "),
					$tagInput = $("<input>").addClass("tags"),
					$tagLabel = $("<p>").text("Теги: "),
					$button = $("<button>").text("+");

				$content.append($inputLabel);
				$content.append($input);
				$content.append($tagLabel);
				$content.append($tagInput);
				$content.append($button);
				$("main .content").append($content);
				function butfunc() {
					var description = $input.val(),
						tags = $tagInput.val().split(","),
						newToDo = ({"description":description, "tags":tags});
					if (description !== "" && description.trim().length > 0) {
						if ($tagInput.val() !== "" && ($tagInput.val()).trim().length > 0) {
							$.post("todos", newToDo, function (result) {
								$input.val("");
								$tagInput.val("");
								$(".tabs a:first span").trigger("click");
							});
						}
					}
				}
				$button.on("click", function() {
					butfunc();
				});
				$('.tags').on('keypress', function (event) {
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
						alert("Возникла ошибка при обработке запроса:" + err);
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