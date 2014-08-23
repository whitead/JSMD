/*
 *
 * Copyright (c) 2012 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

    //load required grunt plugins
    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    // Project configuration.
    grunt.initConfig({
	jshint: {
	    all: [
		'Gruntfile.js',
		'tasks/*.js',
		'<%= nodeunit.tests %>',
		'js/**/*.js'
	    ],
	    options: {
		jshintrc: '.jshintrc',
	    },
	},
	
	// Before generating any new files, remove any previously-created files.
	clean: {
	    tests: ['tmp'],
	},
	
	// Configuration to be run (and then tested).
	init_JSMD: {
	    default_options: {
		options: {
		},
		files: {
		    'tmp/default_options': ['test/fixtures/testing'],
		},
	    }
	},
	
	// Unit tests.
	nodeunit: {
	    tests: ['test/*_test.js'],
	},
	
	//html hints
	htmlhint: {
	    build: {
		options: {
		    'tag-pair': true,
		    'tagname-lowercase': true,
		    'attr-lowercase': true,
		    'attr-value-double-quotes': true,
		    'doctype-first': true,
		    'spec-char-escape': true,
		    'id-unique': true,
		    'head-script-disabled': true,
		    'style-disabled': true
		},
		src: ['index.html']
	    }
	},

	//watch mode
	watch: {
	    html: {
		files: ['index.html'],
		tasks: ['htmlhint']
	    },
	    js: {
		files: ['js/**/*.js'],
		tasks: ['jshint']
	    }
	},
	
	//put together the js
	uglify: {
	    build: {
		files: {
		    'build/js/base.min.js': ['js/**/*.js']
		}
	    }
	}
    });
    
    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');
    
    // Whenever the "test" task is run, first clean the "tmp" dir, then run this
    // plugin's task(s), then test the result.
    grunt.registerTask('test', ['clean', 'init_JSMD', 'nodeunit']);
    
    // By default, lint and run all tests.
    grunt.registerTask('default', ['jshint', 'test', 'uglify', 'htmlhint']);
    
};
