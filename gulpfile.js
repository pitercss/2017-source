const gulp = require('gulp');
const runSequence = require('run-sequence');

const svgSprite = require("gulp-svg-sprite");

const stylus = require('gulp-stylus');
const _stylus = require('stylus');
const stylobuild = require('stylobuild');

const pug = require('gulp-pug');

const rsync = require('gulp-rsync');
const sync = require('browser-sync').create();

const assets = [
	'src/**',
	'!src/svg{,/**}',
	'!src/_icons{,/**}',
	'!src/styles{,/**}',
	'!src/scripts{,/**}',
	'!src/fonts{,/**}',
	'!src/pug{,/**}',
	'!src/**/*.pug',
	'!src/**/*.md',
	'!src/**/*.js',
	'!src/**/*.styl',
	'!src/**/*~'
];

gulp.task('html', () => {
	return gulp.src('src/**/index.pug')
		.pipe(pug({

		}))
		.pipe(gulp.dest('dest'))
		.pipe(sync.stream());
});

gulp.task('styles', () => {
	return gulp.src('src/*.styl')
		.pipe(stylus({
			'include css': true,
			use: stylobuild({}),
			define: {
				url: _stylus.resolver()
			}
		}))
		.pipe(gulp.dest('dest'))
		.pipe(sync.stream());
});

gulp.task('svg-icons', function () {
	return gulp.src('src/svg/*.svg')
		.pipe(svgSprite({
			mode: {
				symbol: {
					inline: true,
					prefix: '.ui-Icon_%s .ui-Icon-Image',
					dest: '',
					dimensions: '%s',
					sprite: 'sprite.svg',
					render: {
						styl: true
					},
					example: true
				}
			},
			svg: {
				namespaceClassnames: false
			}
		}))
		.pipe(gulp.dest("src/_icons"))
});

gulp.task('copy', () => {
	return gulp.src(assets)
		.pipe(gulp.dest('dest'))
		.pipe(sync.stream({ once: true }));
});

gulp.task('server', () => {
	sync.init({
		notify: false,
		server: {
			baseDir: 'dest'
		}
	});
});

gulp.task('watch', () => {
	gulp.watch(['src/**/*.pug', 'src/**/*.md', 'src/**/*.js'], ['html']);
	gulp.watch(['src/**/*.css', 'src/**/*.styl'], ['styles']);
	gulp.watch('src/svg/*.svg', ['build-assets-with-icons']);
	gulp.watch(assets, ['copy']);
});

gulp.task('deploy', () => {
	return gulp.src('dest/**')
		.pipe(rsync({
			root: 'dest',
			hostname: 'pitercss.com',
			destination: '/var/www/pitercss.com/html/',
			recursive: true,
			clean: true,
			incremental: true,
			exclude: '.DS_Store'
		}));
});

gulp.task('build', [
	'build-assets-with-icons',
	'copy'
]);

gulp.task('build-assets', [
	'html',
	'styles'
]);

gulp.task('build-assets-with-icons', (done) => {
	runSequence('svg-icons', 'build-assets', done);
});


gulp.task('default', [
	'build',
	'server',
	'watch'
]);
