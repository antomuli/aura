define(['sandbox', './views/app'], function(sandbox, AppView) {
  'use strict';

  return function(options) {
    new AppView({
      el: sandbox.dom.find(options.element)
    });

    sandbox.emit('bootstrap.boilerplate', 'Initialized Boilerplate.');

    sandbox.on.log('bootstrap.boilerplate');

  };

});
