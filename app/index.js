'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');


var BackboneMultipageGenerator = yeoman.generators.Base.extend({
  init: function () {
    this.pkg = require('../package.json');

    this.on('end', function () {
      if (!this.options['skip-install']) {
        this.installDependencies();
      }
    });
  },

  askFor: function () {
    var done = this.async();

    // have Yeoman greet the user
    this.log(this.yeoman);

    // replace it with a short and sweet description of your generator
    this.log(chalk.magenta('You\'re using the fantastic BackboneMultipage generator.'));

    var prompts = [
      {
        name: 'srcDir',
        message: 'type src directory path',
        default: 'src'
      },
      {
        name: 'jsDir',
        message: 'type javascript directory name',
        default: 'js'
      },
      {
        name: 'cssDir',
        message: 'type css directory name',
        default: 'css'
      },
      {
        name: 'sassDir',
        message: 'type sass directory name',
        default: 'sass'
      },
      {
        name: 'tmplDir',
        message: 'type JST directory name',
        default: 'tmpl'
      }
    ];

    this.prompt(prompts, function (props) {
      this.srcDir = props.srcDir;
      this.jsDir = props.jsDir;
      this.cssDir = props.cssDir;
      this.sassDir = props.sassDir;
      this.tmplDir = props.tmplDir;

      done();
    }.bind(this));
  },

  app: function () {
    this.mkdir(this.jsDir);
    this.mkdir(this.cssDir);
    this.template('index.html', 'index.html');

    this.copy('_package.json', 'package.json');
    this.copy('_bower.json', 'bower.json');
    this.copy('Gruntfile.js', 'Gruntfile.js');
    this.template('config.json', 'config.json');

    this.mkdir(this.srcDir);
    this.directory('js', this.srcDir + '/' + this.jsDir);
    this.directory('sass', this.srcDir + '/' + this.sassDir);
    this.directory('tmpl', this.srcDir + '/' + this.tmplDir);
  },

  projectfiles: function () {
    this.copy('editorconfig', '.editorconfig');
    this.copy('jshintrc', '.jshintrc');
    this.copy('gitignore', '.gitignore');
  }
});

module.exports = BackboneMultipageGenerator;