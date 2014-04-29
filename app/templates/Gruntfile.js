'use strict';
module.exports = function(grunt) {
  var _ = require('./bower_components/lodash/dist/lodash'),
      config = grunt.file.readJSON('config.json'),
      outJsDir = config.requirejs.dir,
      jsDir = config.requirejs.baseUrl,
      tmplDir = config.tmplDir;
  
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    requirejs: {
      options: config.requirejs,
      build: {
        options: config.build.requirejs
      }
    },
    jst: {
      options: {
        namespace: false,
        amd: true
      }
    },
    compass: {
      options: config.compass,
      develop: config.develop.compass,
      build: config.build.compass
    },
    esteWatch: {
      options: config.esteWatch,
      html: function (filepath) {
        var files = {},
            outTmplDir = jsDir + '/' + tmplDir.split('/')[1];
        files[filepath.replace(tmplDir, outTmplDir).replace('.html', '.js')] = filepath;
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
      build: ['css:build', 'js:build'],
      requirejs: ['tmpl', 'prepare:requirejs']
    }
  });

  grunt.registerTask('tmpl', 'compile jst for development', function () {
    var files = {},
        outTmplDir = jsDir + '/' + tmplDir.split('/')[1] + '/';
    grunt.file.recurse(tmplDir, function (abspath, rootdir, subdir, filename) {
      var dir = subdir? subdir + '/' : '';
      files[outTmplDir + dir + filename.replace('.html', '.js')] = [tmplDir + '/' + dir + filename];
    });
    grunt.config(['jst', 'compile', 'files'], files);
    grunt.task.run('jst:compile');
  });

  grunt.registerTask('js:develop', 'compile js for development', generate_develop_common_js);

  grunt.registerTask('js:build', 'compile js for build', function () {
    grunt.task.run('concurrent:requirejs');
    grunt.config(['requirejs', 'build', 'options', 'modules'], generate_requirejs_build_modules());
    grunt.task.run('requirejs:build');
    grunt.task.run('rollback:requirejs');
  });

  grunt.registerTask('css:develop', 'compile css for development', ['compass:develop']);
  grunt.registerTask('css:build', 'compile css for build', ['compass:build']);
  grunt.registerTask('watch', 'esteWatch alias', ['esteWatch']);
  grunt.registerTask('build', 'compile js, jst and css for build', ['concurrent:build']);
  grunt.registerTask('default', ['concurrent:develop', 'esteWatch']);

  function generate_develop_common_js () {
    var _config = _.omit(config.requirejs, ['dir']);
    _config.baseUrl = '/' + _config.baseUrl;
    delete _config.paths.requirejs;
    grunt.file.write(outJsDir + '/common.js', [
        grunt.file.read('./node_modules/requirejs/require.js'),
        'require.config(' + JSON.stringify(_config) + ');',
        grunt.file.read(jsDir + '/common.js')
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

  grunt.registerTask('prepare:requirejs', 'generate file for build', function () {
    grunt.file.copy(jsDir + '/common.js', jsDir + '/common.original.js');
    var _config = _.omit(config.requirejs, ['paths', 'shim', 'dir']);
    _config.baseUrl = '/' + _config.baseUrl;
    grunt.file.write(jsDir + '/common.js', [
      'require.config(' + JSON.stringify(_config) + ');',
      grunt.file.read(jsDir + '/common.original.js')
    ].join('\n'));
  });

  grunt.registerTask('rollback:requirejs', 'rollback file for build', function () {
    if (grunt.file.exists(jsDir + '/common.original.js')) {
      grunt.file.copy(jsDir + '/common.original.js', jsDir + '/common.js');
      grunt.file.delete(jsDir + '/common.original.js');
    }
  });
};