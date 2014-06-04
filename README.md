# aec-enrol-verify

*A wrapper for the AEC (Australian Electoral Commission) online enrolment
verification form.*

Developed by [Sam Stainsby](mailto:sam@stainsby.id.au),
this project is released by
[Sustainable Software Pty Ltd](http://www.sustainablesoftware.com.au/)
under the GNU Affero General Public License, Version 3. Please see the
enclosed `LICENSE.txt` file for details.


## Hosted version

If you would prefer to use our hosted version of this facility, please 
contact us. All gathered data will be available to you via a web interface 
and a RESTful API (courtesy of CouchDB).


## What's here?

### Proxy application

Under `proxy`, there is a node.js proxy server that relays requests to
the AEC site's [Check my enrolment](https://oevf.aec.gov.au/) form. See
the `README.md` in `proxy` for further details.

### Enrolment form application

Under `ui` is an AngularJS user interface for creating an enrolment 
verification form that can be embedded into a website. See the `README.md` 
in `ui` for further details.
