var gulp            = require( 'gulp' );
var gutil           = require( 'gulp-util' );
var connect         = require( 'gulp-connect' );
var cache           = require( 'gulp-cached' );

var del             = require( 'del' );

var runSequence     = require( 'run-sequence' );
var noHash          = require( 'connect-history-api-fallback' );

var mainBowerFiles  = require( 'main-bower-files' );
var inject          = require( 'gulp-inject' );
var angularFilesort = require( 'gulp-angular-filesort' )

var sass            = require( 'gulp-sass' );
var prefix          = require( 'gulp-autoprefixer' );
var jade            = require( 'gulp-jade' );



// Linting plugins.

var scsslint        = require( 'gulp-scss-lint' );
var csscomb         = require( 'gulp-csscomb' );
var eslint          = require( 'gulp-eslint' );



// Build plugins.

var ngAnnotate      = require( 'gulp-ng-annotate' );
var uglify          = require( 'gulp-uglify' );
var order           = require( 'gulp-order' );
var concat          = require( 'gulp-concat' );
var streamqueue     = require( 'streamqueue' );
var minifyHTML      = require( 'gulp-minify-html' );
var minifyCSS       = require( 'gulp-minify-css' );
var imagemin        = require( 'gulp-imagemin' );
var pngquant        = require( 'imagemin-pngquant' );
var filter          = require( 'gulp-filter' );



// Testing plugins.

var karma                 = require( 'karma' ).server;
var protractor            = require( 'gulp-protractor' ).protractor;
var webdriver_update      = require( 'gulp-protractor' ).webdriver_update;



// Constants.

var BUILD_DIR         = __dirname + '/build';

var MAIN_CSS_FILENAME = 'angular-sprout.css';
var MAIN_JS_FILENAME  = 'angular-sprout.js';

var JADE_SRC_FILES    = __dirname + '/app/**/*.jade';

var SASS_SRC_FILES    = __dirname + '/app/**/*.scss';
var MAIN_CSS_FILE     = BUILD_DIR + '/app_styles.css';
var CSS_DIR           = BUILD_DIR + '/css'
var CSS_FILES         = CSS_DIR + '/**/*.css';

var SCRIPTS_SRC_FILES =
[
	'./app/**/*.js',
	'./app/*.js',
	'!./app/**/*_test*.js'
];

var TEST_FILES        = __dirname + '/app/**/*_test*.js';
var ALL_JAVASCRIPT    = __dirname + '/app/**/*.js';

var BOWER_SRC         = __dirname + '/bower_components';
var BOWER_MANIFEST    = __dirname + '/bower.json';
var BOWER_CONFIG      = __dirname + '/.bowerrc';

var BOWER_DIR         = BUILD_DIR + '/bower';
var BOWER_CSS_FILES   = BOWER_DIR + '/**/*.css';
var BOWER_JS_FILES    = BOWER_DIR + '/**/*.js';

var IMAGES_SRC        = __dirname + '/images/**/*';
var IMAGES            = BUILD_DIR + '/images/';
var FAVICON           = __dirname + '/favicon.png';

var LINTERS_DIR       = __dirname + '/linters'

var E2E_TESTS         = __dirname + '/app/**/*_test-e2e.js';


var handleError = function( err )
{
	console.log( err.toString(  ) );
	gutil.beep;
	this.emit( 'end' );
};

gulp.task( 'connect', function(  )
{
	connect.server(
	{
		root: BUILD_DIR,
		hostname: '0.0.0.0',
		livereload: true,
		middleware: function( connect, opt )
		{
			// This get's rid of the # symbol in the URL
			return[ noHash ];
		}
	} );
} );



// Tests

gulp.task( 'unit-tests', function( done )
{
	karma.start( {

		configFile: __dirname + '/tests/karma.config.js'

	}, done );
} );

gulp.task( 'update-webdriver', webdriver_update );

gulp.task( 'e2e-tests', [ 'update-webdriver' ], function( done )
{
	gulp.src( E2E_TESTS )
		.pipe( protractor( {

			configFile: __dirname + '/tests/protractor.config.js'

		} ) )
		.on( 'error', handleError );
} );




// Jade.

gulp.task( 'jade', function( )
{
	return gulp.src( JADE_SRC_FILES )
		.pipe( cache( 'jade' ) )
		.pipe( jade( { pretty: true } ) )
		.on( 'error', handleError )
		.pipe( gulp.dest( BUILD_DIR ) );
} );

gulp.task( 'inject', function( )
{
	var injectOptions = 
	{
	  relative: true,
	  addRootSlash: false
	};

	var bowerInjectOptions =
	{
	  relative: true,
	  addRootSlash: false,
	  starttag: '<!-- inject:bower:{{ext}} -->'
	};
	
	var target = gulp.src( BUILD_DIR + '/index.html' );

	return target
		.pipe( inject( gulp.src( [ BOWER_CSS_FILES ], { read: false } ), bowerInjectOptions ) )
		.pipe( inject( gulp.src( [ MAIN_CSS_FILE ], { read: false } ), injectOptions ) )
		
		.pipe( inject( gulp.src( [ BOWER_JS_FILES ], { read: false } ), bowerInjectOptions ) )
		.pipe( inject( 
				gulp.src(
					[
						BUILD_DIR + '/**/*.js',
						'!' + BUILD_DIR + '/bower/**/*.*'
					],
					{
						read: false
					} )
				.pipe( angularFilesort(  ) ), injectOptions ) )
		.on( 'error', handleError )
		
		.pipe( gulp.dest( BUILD_DIR ) )
		.pipe( connect.reload(  ) );
} );




// Styles.

gulp.task( 'csscomb', function (  )
{
	return gulp.src( SASS_SRC_FILES )
		.pipe( cache( 'csscomb' ) )
		.pipe( csscomb(  ) )
		.on( 'error', handleError )
		.pipe( gulp.dest( './app' ) );
} );

gulp.task( 'scss-lint', [ 'csscomb' ], function(  )
{
	return gulp.src( SASS_SRC_FILES )
		.pipe( scsslint( { config: 'scss-linting-config.yml' } ) )
		.on( 'error', handleError );
} );

gulp.task( 'sass', [ 'scss-lint' ], function(  )
{
	return gulp.src( __dirname + '/app/app_styles.scss' )
		//.pipe( cache( 'sass' ) )
		.pipe( sass(  ) )
		.on( 'error', handleError )
		.pipe( prefix( 'last 2 versions', { cascade: true } ) )
		.on( 'error', handleError )
		.pipe( gulp.dest( BUILD_DIR ) )
		.pipe( connect.reload(  ) );
} );



// Scripts.

gulp.task( 'bower-files', function( )
{
	// Copy bower components

	return gulp.src( mainBowerFiles(
		{
			paths:
			{
				bowerDirectory: BOWER_SRC,
				bowerrc: BOWER_CONFIG,
				bowerJson: BOWER_MANIFEST
			}
		} ),
		{
			base: BOWER_SRC
		} )
		.pipe( gulp.dest( BOWER_DIR ) );
} );

gulp.task( 'eslint', function(  )
{
	return gulp.src( ALL_JAVASCRIPT )
		.pipe( eslint(  ) )
		.pipe( eslint.format(  ) );
} );

gulp.task( 'scripts', [ 'eslint' ], function( )
{   
	// Copy scripts

	return gulp.src( SCRIPTS_SRC_FILES )
		.pipe( cache( 'scripts' ) )
		.pipe( gulp.dest( BUILD_DIR ) );
} );



// Assets.

gulp.task( 'images', [ 'favicon' ], function(  )
{
	return gulp.src( IMAGES_SRC )
		.pipe( gulp.dest( IMAGES ) );
} );

gulp.task( 'favicon', function(  )
{
	return gulp.src( FAVICON )
		.pipe( gulp.dest( BUILD_DIR ) );
} );



gulp.task( 'clean', function(  )
{
	del( BUILD_DIR + '/*' );
} );

gulp.task( 'watch', function(  )
{
	gulp.watch( SASS_SRC_FILES, [ 'sass' ] );

	gulp.watch( JADE_SRC_FILES, function(  )
	{
		runSequence(
			'jade',
			'inject'
		);
	} );

	gulp.watch( SCRIPTS_SRC_FILES, function(  )
	{
		runSequence(
			'scripts',
			'jade',
			'inject'
		);
	} );

	gulp.watch( TEST_FILES, [ 'eslint' ] );
} );





// Build process.

gulp.task( 'build-scripts', [ 'eslint' ], function(  )
{
	return streamqueue( { objectMode: true },

		// Select and order bower components.

		gulp.src( mainBowerFiles(
		{
			paths:
			{
				bowerDirectory: BOWER_SRC,
				bowerrc: BOWER_CONFIG,
				bowerJson: BOWER_MANIFEST
			}
		} ),
		{
			base: BOWER_SRC
		} )
		.pipe( order(
		[
			'angular/angular.js',
			'*'
		] ) )
		.pipe( filter( '**/*.js' ) ),



		// Select and order source scripts.

		gulp.src( SCRIPTS_SRC_FILES )
		.pipe( ngAnnotate(
		{
			remove: true,
			add: true,
			single_quotes: true
		} ) )
		.pipe( angularFilesort(  ) )
	)



	// Then concatenate and uglify them.

	.pipe( concat( MAIN_JS_FILENAME ) )
	.pipe( uglify(  ) )
	.pipe( gulp.dest( BUILD_DIR ) );
} );


gulp.task( 'build-inject', function( )
{
	var injectOptions = 
	{
	  relative: true,
	  addRootSlash: false,
	  name: 'min'
	};

	var target = gulp.src( BUILD_DIR + '/index.html' );

	return target
		.pipe( inject( gulp.src( BUILD_DIR + '/' + MAIN_JS_FILENAME, { read: false } ), injectOptions ) )
		.pipe( inject( gulp.src( BUILD_DIR + '/' + MAIN_CSS_FILENAME, { read: false } ), injectOptions ) )
		.pipe( gulp.dest( BUILD_DIR ) );
} );

gulp.task( 'build-html', function(  )
{
	return gulp.src( BUILD_DIR + '/**/*.html' )
		.pipe( minifyHTML(  ) )
		.pipe( gulp.dest( BUILD_DIR ) )
} );

gulp.task( 'build-css', function(  )
{
	return streamqueue( { objectMode: true },

		// Select all bower styles.

		gulp.src( mainBowerFiles(
		{
			paths:
			{
				bowerDirectory: BOWER_SRC,
				bowerrc: BOWER_CONFIG,
				bowerJson: BOWER_MANIFEST
			}
		} ),
		{
			base: BOWER_SRC
		} )
		.pipe( filter( '**/*.css' ) ),



		// Select all source styles.

		gulp.src( './app/app_styles.scss' )
		.pipe( sass(  ) )
		.on( 'error', handleError )
		.pipe( prefix( 'last 2 versions', { cascade: true } ) )
		.on( 'error', handleError )
	)



	// Then concatenate and minify.

	.pipe( concat( MAIN_CSS_FILENAME ) )
	.pipe( minifyCSS(  ) )
	.pipe( gulp.dest ( BUILD_DIR ) );

} );

gulp.task( 'build-images', [ 'favicon' ], function (  )
{
	return gulp.src( IMAGES_SRC )
		.pipe( imagemin(
		{
			progressive: true,
			svgoPlugins: [ { removeViewBox: false } ],
			use: [ pngquant(  ) ]
		} ) )
		.pipe( gulp.dest( IMAGES ) );
} );


gulp.task( 'build', function(  )
{
	runSequence(
		'clean',
		[
			'build-images',
			'build-scripts',
			'build-css'
		],
		'jade',
		'build-inject',
		'build-html',
		'connect'
	);
} );




gulp.task( 'default', function(  )
{
	runSequence(
		'clean',
		[
			'sass',
			'scripts',
			'jade',
			'images'
		],
		'bower-files',
		'inject',
		'connect',
		'watch'
	);
} );
