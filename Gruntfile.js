module.exports = function(grunt) {

  grunt.initConfig({
    app: {
      name: 'Indico check-in'
    },
    clean: {
      plugins: ['plugins'],
      platforms: ['platforms']
    },
    mkdir: {
      'default': {
        options: {
          create: ['plugins', 'platforms']
        }
      }
    },
    copy: {
      platform_merges: {
        expand: true,
        dest: './platforms/',
        cwd: 'platform-merges',
        src: '**'
      },
      resources_ios: {
        files: [
          {src: ['www/res/icon/ios/icon-57.png'], dest: 'platforms/ios/<%= app.name %>/Resources/icons/icon.png'},
          {src: ['www/res/icon/ios/icon-57-2x.png'], dest: 'platforms/ios/<%= app.name %>/Resources/icons/icon@2x.png'},
          {src: ['www/res/icon/ios/icon-72.png'], dest: 'platforms/ios/<%= app.name %>/Resources/icons/icon-72.png'},
          {src: ['www/res/icon/ios/icon-72-2x.png'], dest: 'platforms/ios/<%= app.name %>/Resources/icons/icon-72@2x.png'},
          {src: ['www/res/icon/ios/icon-60-2x.png'], dest: 'platforms/ios/<%= app.name %>/Resources/icons/icon-60@2x.png'},
          {src: ['www/res/icon/ios/icon-76.png'], dest: 'platforms/ios/<%= app.name %>/Resources/icons/icon-76.png'},
          {src: ['www/res/icon/ios/icon-76-2x.png'], dest: 'platforms/ios/<%= app.name %>/Resources/icons/icon-76@2x.png'},
          {src: ['www/res/screen/ios/screen-iphone-portrait.png'], dest: 'platforms/ios/<%= app.name %>/Resources/splash/Default~iphone.png'},
          {src: ['www/res/screen/ios/screen-iphone-portrait-2x.png'], dest: 'platforms/ios/<%= app.name %>/Resources/splash/Default@2x~iphone.png'},
          {src: ['www/res/screen/ios/screen-iphone-portrait-568h-2x.png'], dest: 'platforms/ios/<%= app.name %>/Resources/splash/Default-568h@2x~iphone.png'},
          {src: ['www/res/screen/ios/screen-ipad-portrait.png'], dest: 'platforms/ios/<%= app.name %>/Resources/splash/Default-Portrait~ipad.png'},
          {src: ['www/res/screen/ios/screen-ipad-portrait-2x.png'], dest: 'platforms/ios/<%= app.name %>/Resources/splash/Default-Portrait@2x~ipad.png'},
          {src: ['www/res/screen/ios/screen-ipad-landscape.png'], dest: 'platforms/ios/<%= app.name %>/Resources/splash/Default-Landscape~ipad.png'},
          {src: ['www/res/screen/ios/screen-ipad-landscape-2x.png'], dest: 'platforms/ios/<%= app.name %>/Resources/splash/Default-Landscape@2x~ipad.png'}
        ]
      },
      resources_android: {
        files: [
          {src: ['www/res/icon/android/icon-36-ldpi.png'], dest: 'platforms/android/res/drawable-ldpi/icon.png'},
          {src: ['www/res/icon/android/icon-48-mdpi.png'], dest: 'platforms/android/res/drawable-mdpi/icon.png'},
          {src: ['www/res/icon/android/icon-72-hdpi.png'], dest: 'platforms/android/res/drawable-hdpi/icon.png'},
          {src: ['www/res/icon/android/icon-96-xhdpi.png'], dest: 'platforms/android/res/drawable-xhdpi/icon.png'},
          {src: ['www/res/icon/android/icon-96-xhdpi.png'], dest: 'platforms/android/res/drawable/icon.png'},
          {src: ['www/res/screen/android/screen-ldpi-portrait.png'], dest: 'platforms/android/res/drawable-ldpi/screen.png'},
          {src: ['www/res/screen/android/screen-mdpi-portrait.png'], dest: 'platforms/android/res/drawable-mdpi/screen.png'},
          {src: ['www/res/screen/android/screen-hdpi-portrait.png'], dest: 'platforms/android/res/drawable-hdpi/screen.png'},
          {src: ['www/res/screen/android/screen-xhdpi-portrait.png'], dest: 'platforms/android/res/drawable-xhdpi/screen.png'},
          {src: ['www/res/screen/android/screen-xhdpi-portrait.png'], dest: 'platforms/android/res/drawable/screen.png'}
        ]
      }
    },
    cordovacli: {
      options: {
        path: './'
      },
      add_platforms: {
        options: {
          command: 'platform',
          action: 'add',
          platforms: ['ios']
        }
      },
      add_plugins: {
        options: {
          command: 'plugin',
          action: 'add',
          plugins: [
            'splashscreen',
            'inappbrowser',
            'dialogs',
            'network-information',
            'https://github.com/jonathannaguin/BarcodeScanner.git'
          ]
        }
      },
      build_ios: {
        options: {
          command: 'build',
          platforms: ['ios']
        }
      },
      build_android: {
        options: {
          command: 'build',
          platforms: ['android']
        }
      },
      prepare_ios: {
        options: {
          command: 'prepare',
          platforms: ['ios']
        }
      },
      prepare_android: {
        options: {
          command: 'prepare',
          platforms: ['android']
        }
      },
      serve: {
        options: {
          command: 'serve',
          port: 7000
        }
      }
    },
    watch: {
      src: {
        files: ['www/**/*.*', 'platform-merges/**/*.*'],
        tasks: ['update']
      }
    },
    connect: {
      server: {
        options: {
          port: 7000,
          hostname: 'localhost',
          base: 'www',
          keepalive: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mkdir');
  grunt.loadNpmTasks('grunt-cordovacli');

  grunt.registerTask('init', 'Initialize the development environment.',[
    'clean',
    'mkdir',
    'cordovacli:add_platforms',
    'cordovacli:add_plugins',
    'update'
  ]);

  grunt.registerTask('update', 'Update platforms.', [
    'copy'
  ]);

  grunt.registerTask('build', 'Build Platforms.', [
    'cordovacli:build_ios',
  ]);

  grunt.registerTask('server', ['connect:server']);
  grunt.registerTask('cordova-serve', "Alias for 'cordova serve'.", ['cordovacli:serve']);

  grunt.registerTask('default', ['watch']);

};
