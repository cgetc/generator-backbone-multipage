'use strict';
define(['backbone', 'collection/Todos', 'view/todo/ListView'], function (Backbone, Todos, ListView) {
	var view,
		Router = Backbone.Router.extend({
		routes: {
			'description/:id': 'showDescription'
		},
		showDescription: function (id) {
			view.showDescription(id);
		}
	});
	return function (todo_list) {
		var todos = new Todos();
		view = new ListView(todos);
		todos.set(todo_list);
		new Router();
		Backbone.history.start();
	};
});