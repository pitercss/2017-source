const gulp = require('gulp');
const postcss = require('gulp-postcss');
const posthtml = require('gulp-posthtml');
const replace = require('gulp-replace');
const rsync = require('gulp-rsync');
const sync = require('browser-sync').create();

const assets = [
	'src/**',
	'!src/index.html',
    '!src/styles{,/**}',
	'!src/styles.css',
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
	return gulp.src('src/styles.css')
		.pipe(postcss([
            require('postcss-import')(),
			require('autoprefixer')(),
			require('postcss-csso')()
		]))
        .pipe(replace(
            /(url\()(..\/)/g,
            '$1', { skipBinary: true }
        ))
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
	gulp.watch('src/styles/*.css', ['styles']);
    gulp.watch(assets, ['copy']);
});

gulp.task('deploy', () => {
	return gulp.src('dest/**')
		.pipe(rsync({
			root: 'dest',
			hostname: 'pitercss.com',
			destination: '/var/www/pitercss.com/html/secret/',
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
