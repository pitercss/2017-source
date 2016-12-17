const gulp = require('gulp');
const stylus = require('gulp-stylus');
const _stylus = require('./node_modules/gulp-stylus/node_modules/stylus');
const stylobuild = require('stylobuild');
const posthtml = require('gulp-posthtml');
const rsync = require('gulp-rsync');
const sync = require('browser-sync').create();

const assets = [
	'src/**',
	'!src/index.html',
	'!src/styles{,/**}',
	'!src/**/*.styl',
	'!src/**/*~'
];

gulp.task('html', () => {
	return gulp.src('src/index.html')
		.pipe(posthtml([
			require('posthtml-minifier')({
				removeComments: true,
				collapseWhitespace: true
			})
		]))
		.pipe(gulp.dest('dest'))
		.pipe(sync.stream());
});

gulp.task('styles', () => {
	return gulp.src('src/styles.styl')
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
	gulp.watch('src/index.html', ['html']);
	gulp.watch(['src/**/*.css', 'src/**/*.styl'], ['styles']);
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
	'html',
	'styles',
	'copy'
]);

gulp.task('default', [
	'build',
	'server',
	'watch'
]);
