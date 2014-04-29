'use strict';
define(['backbone', 'tmpl/todo/ListView'], function (Backbone, listTmpl) {
	return Backbone.View.extend({
		el: '#todo-list',
		template: listTmpl,
		events: {
			'submit form': 'add'
		},
		initialize: function (collection) {
			this.collection = collection;
			this.listenTo(this.collection, 'add', this.render);
		},
		render: function (model) {
			this.$el.children('ol')
				.append(this.template(model.toJSON()));
		},
		add: function (ev) {
			var form = ev.target,
				todo = {
					id: new Date().getTime(),
					title: form.title.value,
					description: form.description.value
				};
			this.collection.add(todo);
			return false;
		},
		showDescription: function (id) {
			var todo = this.collection.get(id);
			this.$el.children('p').html(todo.get('description'));
		}
	});
});