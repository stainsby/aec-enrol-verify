# The aec-enrol-verify proxy

*The proxy runs under node.js, with a little help from casperjs, and
saves submitted data to CouchDB.*

## License

Developed by [Sam Stainsby](mailto:sam@stainsby.id.au),
this project is released by
[Sustainable Software Pty Ltd](http://www.sustainablesoftware.com.au/)
under the GNU Affero General Public License, Version 3. Please see the
enclosed `LICENSE.txt` file for details.


## Overview

The proxy presents a simple HTTP API for the front-end user interface.
If you are interested in what that API is, you can look at the
`runServer` method in `proxy/server/js`.


## Requirements summary

  * node.js
  * casperjs
  * CouchDB


## Form variable updates

To use the AEC online facility, ASP.NET variables must be periodically refreshed
from the source. Othwerwise, the proxy will fail whenever the real AEC form is
updated. To do this, there is a `casperjs` script that should
be called periodically:
`
```
casperjs ./oevf_capture_aspnet_form_vars.js >> /some/oevf_capture_aspnet_form.log 2>&1
```

A simple script and cron job can achieve this.

**IMPORTANT: the script needs to be called within this directory so that it can
update the `aec_vars.json` file.**

Note that casperjs needs to be available globally.


## Data storage

Data is saved into one or more CouchDB databases. There is simple multi-tenant 
capability — separate databases can be configured in the `clients.json`
file. The top-level keys therein are referred to as 'client IDs'. The
relevant client ID is passed by the UI front-end upon form submission - see 
the `README.md` in the `../ui` for more details.


## Starting the proxy

For starting the proxy in a production environment, you can use something
like `forever` in a script like this:

```
#!/bin/sh
cd /home/sam/aec_enrol_verify/proxy
NODE_ENV=production forever \
  -a \
  -l /home/sam/nobackup/var/logs/oevf.log \
  -e /home/sam/nobackup/var/logs/oevf_err.log \
    start ./server.js
```
The proxy runs as a cluster of three node.js instances (currently hard-coded).
