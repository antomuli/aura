// ## Permissions
// A permissions structure can support checking
// against subscriptions prior to allowing them
// to clear. This enforces a flexible security
// layer for your application.
//
// This module houses the structure of a module's
// permission. The logic that validates and builds
// permissions are in the mediator (core.js).
//
// {eventName: {moduleName:[true|false]}, ...}
define(['dom'], function($) {
  'use strict';

  var permissions = {};
  var rules = {};

  permissions.extend = function(extended) {
    if (window.aura && window.aura.permissions) {
      rules = $.extend(true, {}, extended, window.aura.permissions);
    } else {
      rules = extended;
    }
  };

  // * **param:** {string} subscriber Module name
  permissions.rules = function(subscriber) {
    return rules[subscriber];
  };

  return permissions;

});
