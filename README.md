# Indico check in mobile application

This application was developed during the CERN openlab Summer Student
Programme. It is intended to be used with the extensions added to
Indico during this project ([link]).
More information about the project can be found [here].

[link]: https://github.com/bkolobara/indico/tree/1345-e-ticket-module
[here]: http://indico-software.org/wiki/User/Dev/ETicket

## Build

You need to have [PhoneGap] installed to build the application. There are
two main ways to build it:

### Remote build

This is the recommended way. First an account needs to be created on
[build.phonegap.com] and the application can be built with:

    $ phonegap remote build [android|ios]

### Local build

> ***Note:*** For the local build you need to have the Android or iOS SDK
> already installed. And because of a [bug] the icon and splash screens
> need to be manually copied to the corresponding platform folders to work.

To build the application locally first the setup.sh script needs to be called:
    
    $ ./setup.sh

It will create the necessary directories and install the required plugins.
After this the application can be built and installed with:

    $ phonegap local build [android|ios]
    $ phonegap local install [android|ios]

[PhoneGap]: http://phonegap.com
[build.phonegap.com]: https://build.phonegap.com
[bug]: https://github.com/phonegap/phonegap-cli/issues/58

## License

Indico check in mobile application is free software licenced under terms
of GNU General Public Licence(GPL).  It is provided on an "as is" basis.

