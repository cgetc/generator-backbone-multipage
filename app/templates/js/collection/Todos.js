'use strict';
define(['backbone', 'model/Todo'], function (Backbone, Todo) {
	return Backbone.Collection.extend({
		model: Todo
	});
});