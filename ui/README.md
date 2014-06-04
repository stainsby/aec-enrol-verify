# The aec-enrol-verify UI

*An AngularJS-based front-end enrolment verification form that can be 
embedded into any website.*


## License

Developed by [Sam Stainsby](mailto:sam@stainsby.id.au),
this project is released by
[Sustainable Software Pty Ltd](http://www.sustainablesoftware.com.au/)
under the GNU Affero General Public License, Version 3. Please see the
enclosed `LICENSE.txt` file for details.


## Overview

This AngularJS application generates an enrolment verification form. This form
can be embedded into any website, typically using an IFRAME element. The
form accesses the API presented by the proxy server (see `../proxy').


## Configuring

The API end-point and client IDs are configured in the 'Clients' service 
declared in `app/scripts/services/Client.js`. The keys of the `CLIENTS`
variable are the client IDs. Please edit this and the DEFAULT_API_ENDPOINT
to suit your environment.


## Extra from fields

The add extra fields to the form, say, to add the option to subscribe to
a newsletter, add a view under `app/views/clients/<id>/form_extras.html`,
where `<id>` is replaced the relevant client ID. Here is an exmaple:

```html
<div class="control-group">
  <div class="controls">
    <input type="checkbox" name="subscribe" ng-init="verify.custom.subscribe = false" ng-model="verify.custom.subscribe">
    please add me to your mailing list
  </div>
</div>
<div class="control-group">
  <div class="controls">
    <input type="checkbox" name="helpout" ng-init="verify.custom.helpout = false" ng-model="verify.custom.helpout">
    please send me an election information kit
  </div>
</div>
<div class="control-group">
  <label class="control-label"><i class="icon-envelope"></i> Email address</label>
  <div class="controls">
      <input type="email" name="email" ng-model="verify.custom.email" placeholder="smith123@mymail.com" class="span5">
  </div>
</div>
<div class="control-group">
  <label class="control-label"><i class="icon-phone"></i> Phone</label>
  <div class="controls">
    <input type="text" name="phone" ng-model="verify.custom.phone" placeholder="0755555555" class="span4">
  </div>
</div>
```
