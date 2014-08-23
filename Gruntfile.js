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
	
	copy: {
	    html: {
		cwd: 'html',
		src: [ '**/*.html' ],
		dest: 'build',
		expand: true
	    },
	    vendor: {
		cwd: 'vendor',
		src: [ '**/*.min.js' ],
		dest: 'build/js',
		expand: true
	    }

	},

	// Before generating any new files, remove any previously-created files.
	clean: {
	    test: ['tmp'],
	    build: ['build']
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
		files: ['html/**/*.html'],
		tasks: ['html']
	    },
	    js: {
		files: ['js/**/*.js'],
		tasks: ['js']
	    }
	    
	},
	
	//put together the js
	uglify: {
	    build: {
		files: {
		    'build/js/base.min.js': ['js/**/*.js']
		}
	    }
	},

	//host the code
	connect: {
	    server: {
		options: {
		    port: 4000,
		    base: 'build',
		    hostname: '*'
		}
	    }
	}
    });
    
    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');
    
    // Whenever the "test" task is run, first clean the "tmp" dir, then run this
    // plugin's task(s), then test the result.
    grunt.registerTask('test', ['clean:test', 'init_JSMD', 'nodeunit']);
    

    grunt.registerTask('js', ['jshint', 'test', 'uglify', 'copy:vendor']);
    grunt.registerTask('html', ['htmlhint', 'copy:html']); 
    grunt.registerTask('default', ['clean:build', 'js', 'html', 'connect', 'watch']);
    
};
