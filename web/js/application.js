(function ($, window) {
	'use strict';
	window.StyleGuideApp      = {};
	StyleGuideApp.Models      = {};
	StyleGuideApp.Views       = {};
	StyleGuideApp.Collections = {};

	StyleGuideApp.Models.Project = Backbone.RelationalModel.extend({
		id: null,
		name: null,
		relations: [{
			type: Backbone.HasMany,
			key: 'components',
			relatedModel: 'StyleGuideApp.Models.Component',
			collectionType: 'StyleGuideApp.Collections.Components',
			reverseRelation: {
				key: 'project',
				includeInJSON: 'id'
			}
		}]
	});

	StyleGuideApp.Collections.Projects = Backbone.Collection.extend({
		model: StyleGuideApp.Models.Project
		//url: '/projects'
	});

	StyleGuideApp.Models.Component = Backbone.RelationalModel.extend({
		id: null,
		name: null,
		markup: null,
		style: null
	});

	StyleGuideApp.Collections.Components = Backbone.Collection.extend({
		model: StyleGuideApp.Models.Component
	});

	StyleGuideApp.Views.ProjectListView = Backbone.View.extend({
		template:_.template($('#tpl-project-list').html()),
		render: function(eventName) {
			var self = this;
			$(this.el).html(this.template(this.model.toJSON()));
			_.each(this.model.models, function (project) {
				$(self.el).find('#project-list').append(new StyleGuideApp.Views.ProjectListItemView({model:project}).render().el);
			}, this);
			return this;
		}
	});

	StyleGuideApp.Views.ProjectListItemView = Backbone.View.extend({
		tagName:"li",

		template:_.template($('#tpl-project-list-item').html()),

		render: function(eventName) {
			$(this.el).html(this.template(this.model.toJSON()));
			return this;
		}
	});

	StyleGuideApp.Views.ComponentListItemView = Backbone.View.extend({
		tagName:"tr",

		template:_.template($('#tpl-component-list-item').html()),
		events: {
			'click #remove-component-button':'removeComponent'
		},
		render: function(eventName) {
			$(this.el).html(this.template(this.model.toJSON()));
			return this;
		},
		removeComponent: function() {
			var pid = this.model.get('project').get('id'),
				cid = this.model.get('id');
			$.ajax({
				url: '/projects/' + pid + '/components/' + cid,
				type: 'DELETE'
			});
			location.href = '#/projects/' + pid + '/components/' + cid + '/remove';
		}
	});

	StyleGuideApp.Views.ProjectDetailView = Backbone.View.extend({
		template:_.template($('#tpl-project-detail').html()),
		events: {
			'click #add-new-component-button':'addNewComponent'
		},
		render: function(eventName) {
			var self = this;
			$(this.el).html(this.template(this.model.toJSON()));
			_.each(this.model.get('components').models, function (component) {
				$(self.el).find('#component-list').append(new StyleGuideApp.Views.ComponentListItemView({model:component}).render().el);
			}, this);
			return this;
		},
		addNewComponent: function() {
			var id = this.model.get('id');
			location.href = '#/projects/' + id + '/add-new-component';
		}
	});

	StyleGuideApp.Views.ComponentDetailView = Backbone.View.extend({
		template:_.template($('#tpl-component-detail').html()),
		events: {
			'click #edit-component-button':'editComponent'
		},
		render: function(eventName) {
			var self      = this,
				project   = self.options.project,
				component = self.options.component,
				$iframe   = null,
				$liveView = null;

			StyleGuideApp.iframeFunc = function() {
				$iframe   = $('#liveView');
				$liveView = $($('#liveView')[0].contentDocument);
				$liveView.find('head').append('<style type="text/css">' + component.get('style') + '</style>');
				$liveView.find('#liveView').append(component.get('markup'));

				// this is a hack to allow the iframe to render before adjusting the height,
				// maybe a setting on the component to make this static?
				setTimeout(function() {
					$iframe.height($liveView.find('body').outerHeight());
				}, 1000);


				//SyntaxHighlighter.highlight();
			};

			Q.fcall(function() {
				$(self.el).html(self.template({
					project: project.toJSON(),
					component: component.toJSON()
				}));
			})
			.then(function() {
				var shadow = document.querySelector('#liveViewDiv').webkitCreateShadowRoot();
				shadow.innerHTML += '<style type="text/css">' + component.get('style') + '</style>';
				shadow.innerHTML += '<div style="overflow:hidden;">' + component.get('markup') + '</div>';

				self.options.editor = ace.edit("markup-editor");
				self.options.editor.setTheme("ace/theme/monokai");
				self.options.editor.getSession().setMode("ace/mode/html");
				self.options.editor.setValue(component.get('markup'));
				self.options.editor.setReadOnly(true);

				self.options.editor2 = ace.edit("style-editor");
				self.options.editor2.setTheme("ace/theme/monokai");
				self.options.editor2.getSession().setMode("ace/mode/css");
				self.options.editor2.setValue(component.get('style'));
				self.options.editor2.setReadOnly(true);
			})
			.done();

			return this;
		},
		editComponent: function() {
			var pid = this.options.project.get('id'),
				cid = this.options.component.get('id');
			location.href = '#/projects/' + pid + '/components/' + cid + '/edit';
		}
	});

	StyleGuideApp.Views.ComponentEditView = Backbone.View.extend({
		template:_.template($('#tpl-component-edit').html()),
		events: {
			'click #save-button':'save',
			'click #cancel-button':'cancel'
		},
		render: function(eventName) {
			var self      = this,
				project   = self.options.project,
				component = self.options.component;
			Q.fcall(function(){
				$(self.el).html(self.template({
					project: project.toJSON(),
					component: component.toJSON()
				}));
			})
			.then(function(){

				self.options.editor = ace.edit("markup-editor");
				self.options.editor.setTheme("ace/theme/monokai");
				self.options.editor.getSession().setMode("ace/mode/html");
				self.options.editor.setValue(component.get('markup'));

				self.options.editor2 = ace.edit("style-editor");
				self.options.editor2.setTheme("ace/theme/monokai");
				self.options.editor2.getSession().setMode("ace/mode/css");
				self.options.editor2.setValue(component.get('style'));
			})
			.done();

			return this;
		},
		save: function() {
			var project   = this.options.project,
				component = this.options.component,
				self = this;

			component.set('name', $('#name').val());
			component.set('markup', self.options.editor.getValue());
			component.set('style', self.options.editor2.getValue());
			$.ajax({
				url: '/projects/' + project.id + '/components/' + component.id,
				type: 'PUT',
				data: component.toJSON(),
				success: function(data) {
					location.href = "#/projects/" + project.id + "/components/" + component.id;
				}
			})
		},
		cancel: function() {
			var project   = this.options.project,
				component = this.options.component;
			location.href = "#/projects/" + project.id + "/components/" + component.id;
		}
	});

	StyleGuideApp.Views.ComponentAddNewView = Backbone.View.extend({
		template:_.template($('#tpl-component-add-new').html()),
		events: {
			'click #saveButton':'save',
			'click #cancelButton':'cancel'
		},
		render: function(eventName) {
			var self      = this,
				project   = self.options.project;
			Q.fcall(function(){
				$(self.el).html(self.template({project: project.toJSON()}));
			})
			.then(function(){
				self.options.editor = ace.edit("markup-editor");
				self.options.editor.setTheme("ace/theme/monokai");
				self.options.editor.getSession().setMode("ace/mode/html");

				self.options.editor2 = ace.edit("style-editor");
				self.options.editor2.setTheme("ace/theme/monokai");
				self.options.editor2.getSession().setMode("ace/mode/css");
			})
			.done();
			return this;
		},
		save: function() {
			var project   = this.options.project,
					self = this,
					c = new StyleGuideApp.Models.Component({});

			c.set('id', $('#id').val());
			c.set('name', $('#name').val());
			c.set('markup', self.options.editor.getValue());
			c.set('style', self.options.editor2.getValue());
			c.set('project', $('#projectID').val());
			console.log('Save this shit!');
			$.ajax({
				url: '/projects/' + project.id + '/components',
				method: 'POST',
				data: c.toJSON(),
				success: function(data) {
					location.href = "#/projects/" + project.id + "/components/" + c.id;
				}
			});
		},
		cancel: function() {
			var project   = this.options.project;
			location.href = "#/projects/" + project.id;
		}
	});


	StyleGuideApp.Router = Backbone.Router.extend({
		routes: {
			"": "list",
			"projects": "list",
			"projects/:name": "project",
			"projects/:name/components/:component": "component",
			"projects/:name/add-new-component": "addNewComponent",
			"projects/:name/components/:component/edit": "editComponent",
			"projects/:name/components/:component/remove": "removeComponent"
		},
		dataLoaded: false,
		loadData: function(callback) {
			var self = this;
			if (this.dataLoaded === false) {
				// var data1 = $.getJSON('stubdata.json', function(data){
				var data1 = $.getJSON('/projects', function(data){
					self.projects = new StyleGuideApp.Collections.Projects(data);
					self.dataLoaded = true;
					callback();
				});
			} else {
				callback();
			}
		},
		renderAppView: function() {
			$('#style-guide-app').html(this.view.render().el);
		},
		list: function() {
			var self = this;
			this.loadData(function() {
				self.view = new StyleGuideApp.Views.ProjectListView({model:self.projects});
				self.renderAppView();
			});
		},
		project: function(name) {
			var self = this;
			this.loadData(function() {
				self.project = self.projects.get(name);
				self.view    = new StyleGuideApp.Views.ProjectDetailView({model: self.project});
				self.renderAppView();
			});
		},
		component: function(projectName, componentName) {
			var self = this;
			this.loadData(function() {
				self.project   = self.projects.get(projectName);
				self.component = self.project.get('components').get(componentName);
				self.view      = new StyleGuideApp.Views.ComponentDetailView({
					project: self.project,
					component: self.component
				});
				self.renderAppView();
			});
		},
		addNewComponent: function(projectName) {
			var self = this;
			this.loadData(function() {
				self.project   = self.projects.get(projectName);
				self.view      = new StyleGuideApp.Views.ComponentAddNewView({
					project: self.project
				});
				self.renderAppView();
			});
		},
		editComponent: function(projectName, componentName) {
			var self = this;
			this.loadData(function() {
				self.project   = self.projects.get(projectName);
				self.component = self.project.get('components').get(componentName);
				self.view      = new StyleGuideApp.Views.ComponentEditView({
					project: self.project,
					component: self.component
				});
				self.renderAppView();
			});
		},
		removeComponent: function(projectName, componentName) {
			var self = this;
			this.loadData(function() {
				self.project   = self.projects.get(projectName);
				var c = self.project.get('components').get(componentName);
				self.project.get('components').remove(c);
				location.href = "#/projects/" + self.project.id;
			});
		}
	});

	var app = new StyleGuideApp.Router();
	Backbone.history.start(app);

})(jQuery, window);
