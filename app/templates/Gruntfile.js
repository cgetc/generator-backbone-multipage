'use strict';
module.exports = function(grunt) {
  var _ = require('./bower_components/lodash/dist/lodash'),
      config = grunt.file.readJSON('config.json'),
      outJsDir = config.requirejs.dir,
      jsDir = config.requirejs.baseUrl,
      tmplDir = config.tmplDir,
      outTmplDir = config.outTmplDir;
  
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    requirejs: {
      options: config.requirejs,
      develop: {
        options: config.develop.requirejs
      },
      build: {
        options: config.build.requirejs
      }
    },
    jst: {
      options: {
        namespace: false,
        amd: true,
        templateSettings: {
          variable: 'data'
        }
      }
    },
    compass: {
      options: config.compass,
      develop: config.develop.compass,
      build: config.build.compass
    },
    esteWatch: {
      options: config.esteWatch,
      ejs: function (filepath) {
        var files = {};
        files[filepath.replace(tmplDir, outTmplDir).replace('.ejs', '.js')] = filepath;
        grunt.config(['jst', 'compile', 'files'], files);
        return ['jst:compile'];
      },
      js: function (filepath) {
        grunt.config(['jshint', 'src'], filepath);
        return ['jshint'];
      },
      scss: function (filepath) {
        return ['compass:develop'];
      }
    },
    concurrent: {
      develop: ['css:develop', 'tmpl', 'js:develop'],
      build: ['css:build', 'js:build']
    }
  });

  grunt.registerTask('tmpl', 'compile jst for development', function () {
    var files = {};
    grunt.file.recurse(tmplDir, function (abspath, rootdir, subdir, filename) {
      var dir = subdir? subdir + '/' : '';
      files[outTmplDir + '/' + dir + filename.replace('.ejs', '.js')] = [tmplDir + '/' + dir + filename];
    });
    grunt.config(['jst', 'compile', 'files'], files);
    grunt.task.run('jst:compile');
  });

  grunt.registerTask('js:develop', 'compile js for development', generate_develop_require_js);

  grunt.registerTask('js:build', 'compile js for build', function () {
    grunt.task.run('tmpl');
    generate_build_require_js();
    grunt.config(['requirejs', 'build', 'options', 'modules'], generate_requirejs_build_modules());
    grunt.task.run('requirejs:build');
  });

  grunt.registerTask('css:develop', 'compile css for development', ['compass:develop']);
  grunt.registerTask('css:build', 'compile css for build', ['compass:build']);
  grunt.registerTask('watch', 'esteWatch alias', ['esteWatch']);
  grunt.registerTask('build', 'compile js, jst and css for build', ['concurrent:build']);
  grunt.registerTask('default', ['concurrent:develop', 'esteWatch']);

  function generate_develop_require_js () {
    var options = _.pick(get_requirejs_options('develop'), ['paths', 'shim', 'urlArgs']);
    options.baseUrl = '/' + jsDir;
    delete options.paths.requirejs;
    grunt.file.write(outJsDir + '/require.js', [
        grunt.file.read('./node_modules/requirejs/require.js'),
        'require.config(' + JSON.stringify(options) + ');'
    ].join('\n'));
  }

  function generate_requirejs_build_modules () {
    var libs =  _.keys(config.requirejs.paths),
        modules = [{
          name: 'common',
          include: libs
        }];
    grunt.file.recurse(jsDir + '/page', function (abspath, rootdir, subdir, filename) {
      var dir = subdir? subdir + '/' : '';
      modules.push({
        name: 'page/' + dir + filename.slice(0, -3),
        exclude: libs
      });
    });
    return modules;
  }

  function get_requirejs_options(env) {
    return _.extend(grunt.config(['requirejs', 'options']), grunt.config(['requirejs', env, 'options']));
  }

  function generate_build_require_js () {
    var options = _.pick(get_requirejs_options('build'), ['urlArgs']);
    options.baseUrl = '/' + outJsDir;
    grunt.file.write(jsDir + '/require.js', [
      grunt.file.read('./node_modules/requirejs/require.js'),
      'require.config(' + JSON.stringify(options) + ');'
    ].join('\n'));
  }

};