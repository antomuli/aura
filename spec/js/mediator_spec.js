var SANDBOX_NAME = 'test_widget',
  TEST_EVENT = 'stub',
  TEST_CHANNEL = 'test_topic';






define('spec/js/widgets/test_emitqueue/main', ['sandbox'], function(sandbox) {
  'use strict';

  return function(options) {};
});


define('sandbox_perms', ['aura_perms'], function(permissions) {
  'use strict';

  var channelPerms = {};
  channelPerms[SANDBOX_NAME] = {};
  channelPerms[SANDBOX_NAME][TEST_CHANNEL] = true;

  permissions.extend(channelPerms);

  /* the above is equivalent to: 
  permissions.extend({
    test_widget: {
      'test_topic': true // this is a channel
    }
  });
  */

  return permissions;
});

define('spec/js/widgets/test_widget/main', ['sandbox'], function(sandbox) {
  'use strict';

  return function() {};
});


define(['aura_core', 'aura_sandbox', 'sandbox_perms'], function(mediator, aura_sandbox, permissions) {
  var SANDBOX_NAME = 'test_widget',
    TEST_EVENT = 'stub',
    TEST_CHANNEL = 'test_topic';

  var prependChannel = function(channel, event) {
      event = mediator.normalizeEvent(event); // if needed, convert event to array format is using
      // . delimeters 'test.event' to ['test', 'event']
      event.unshift(channel);

      return event;
    };



  var sandboxes = {};

  sandboxes[SANDBOX_NAME] = {
    options: {
      element: '#sample_widget'
    }
  };
  mediator.start(sandboxes);


  describe('mediator', function() {
    describe('pubsub', function() {
      //override method util as it uses jQuery proxy and doesn't
      //allow comparison of actual callback function object.



      beforeEach(function() {
        // verify setup
        expect(mediator).toBeDefined();

      });


      describe('listeners', function() {
        describe('verification of parameters', function() {
          it('should throw an error if all the params are not specified', function() {
            expect(function() {
              mediator.listeners();
            }).toThrow(new Error('Event must be defined'));
          });
          it("should throw an error if typeof event is NOT a string or array in EventEmitter format", function() {
            expect(function() {
              mediator.listeners({});
            }).toThrow(new Error('Event must be an EventEmitter compatible argument (string or array)'));
          });
        });
      });

      describe('removing listeners', function() {
        afterEach(function() {
          mediator.removeAllListeners();
        });

        describe('removeAllListeners', function() {

          it('should remove all listeners', function() {

            mediator.removeAllListeners();
            expect(mediator.listeners(prependChannel(TEST_CHANNEL, 'test.**.ptrn')).length).toBe(0);
          });

          it('should remove all listeners with arguments', function() {
            var event = prependChannel(TEST_CHANNEL, '**');
            mediator.removeAllListeners(event);
            expect(mediator.listeners(prependChannel(TEST_CHANNEL, 'test.**.ptrn')).length).toBe(0);
          });


        });

        describe('removeSandboxListeners', function() {

        });

      });

      describe('on (subscribe / listen)', function() {

        beforeEach(function() {
          mediator.removeAllListeners();
        });

        describe('verification of parameters', function() {
          it('should throw an error if all the params are not specified', function() {
            expect(function() {
              mediator.on();
            }).toThrow(new Error('Event, callback, and context must be defined'));
          });

          it("should throw an error if typeof event is NOT a string or array in EventEmitter format", function() {
            expect(function() {
              mediator.on({}, function() {}, {});
            }).toThrow(new Error('Event must be an EventEmitter compatible argument (string or array)'));
          });

          it("should throw an error if typeof callback is NOT a function", function() {
            expect(function() {
              mediator.on(TEST_EVENT, {}, {});
            }).toThrow(new Error('Callback must be a function'));
            expect(function() {
              mediator.on(TEST_EVENT, 'string text', {});
            }).toThrow(new Error('Callback must be a function'));

          });
        });


        it('should allow an event to be subscribed', function() {
          mediator.on(TEST_EVENT, function() {}, this);

          expect(mediator.listeners(TEST_EVENT).length).toBe(1);
        });

        it('should be able assign a specific callback for subscribed event', function() {
          var callback, callbackResult = 'callback';
          mediator.on(TEST_EVENT, function() {}, this);

          mediator.on(TEST_EVENT, function() {
            return callbackResult;
          }, this);

          callback = mediator.listeners(TEST_EVENT)[1];
          expect(callback()).toBe(callbackResult);
        });

        it('should allow subscribing multiple callbacks for single event channel', function() {
          var callback1 = function() {};
          var callback2 = function() {};

          mediator.on(TEST_EVENT, callback1, this);
          mediator.on(TEST_EVENT, callback2, this);

          expect(mediator.listeners(TEST_EVENT).length).toBe(2);
        });

        it('should allow subscribing for catchall \'*\' events', function() {
          var callback1 = function() {};

          mediator.on('*', callback1, this);
          expect(mediator.listeners('*').length).toBe(1);
          expect(mediator.listeners('banana').length).toBe(1);
          expect(mediator.listeners('banana.notthis').length).toBe(0);
          //expect(mediator.listenersAny().length).toBe(1);
        });

        it('should allow subscribing for catchall \'**\' events', function() {
          var callback1 = function() {};

          mediator.on('**', callback1, this);
          expect(mediator.listeners(TEST_EVENT).length).toBe(1);
          expect(mediator.listeners('apple').length).toBe(1);
          expect(mediator.listeners('apple.cakes').length).toBe(1);
          expect(mediator.listeners('apple.cakes.cats').length).toBe(1);
          //expect(mediator.listenersAny().length).toBe(1);
        });

        describe('should allow namespaces and wildcards', function() {

          it('should allow subscribing for namespaces, 2 level', function() {
            var callback1 = function() {};

            mediator.on('test.dat', callback1, this);
            expect(mediator.listeners('test.dat').length).toBe(1);
            expect(mediator.listeners('test.*').length).toBe(1);
            expect(mediator.listeners('test.**').length).toBe(1);
          });

          it('should allow subscribing for namespaces, 3 level, wildcard', function() {
            var callback1 = function() {};

            mediator.on('test.dis.ptrn', callback1, this);
            expect(mediator.listeners('test.dis.ptrn').length).toBe(1);
            expect(mediator.listeners('test.*.ptrn').length).toBe(1);
            expect(mediator.listeners('test.**.ptrn').length).toBe(1);
          });

          it('should allow subscribing for namespaces, 4 level, wildcard + **', function() {
            var callback1 = function() {};

            mediator.on('test2ns.khal.drogo.no', callback1, this);
            expect(mediator.listeners('test2ns.khal.drogo.no').length).toBe(1);
            expect(mediator.listeners('test2ns.*.no').length).toBe(0);
            expect(mediator.listeners('test2ns.**.no').length).toBe(1);
          });

        });


      });

      describe('emit (publish / trigger)', function() {
        describe('verification of parameters', function() {
          beforeEach(function() {
            mediator.removeAllListeners();
          });

          it('should throw an error if all the params are not specified', function() {
            expect(function() {
              mediator.emit();
            }).toThrow(new Error('Event must be defined'));
          });

          it("should throw an error if typeof event is NOT a string or array in EventEmitter format", function() {
            expect(function() {
              mediator.emit({});
            }).toThrow(new Error('Event must be an EventEmitter compatible argument (string or array)'));
          });

        });

        it('should call every callback for a channel, within the correct context', function() {
          var callback = sinon.spy();

          mediator.on(TEST_EVENT, callback, this);

          mediator.emit(TEST_EVENT);

          expect(callback).toHaveBeenCalled();
        });

        it('should pass additional arguments to every call callback for a channel', function() {
          var callback = sinon.spy();
          var argument = {};

          mediator.on(TEST_EVENT, callback, this);

          mediator.emit(TEST_EVENT, argument);

          expect(callback).toHaveBeenCalledWith(argument);
        });

        it('should add to emit queue if widget is loading', function() {

          mediator.start({
            test_emitqueue: {
              options: {
                element: '#test_emitqueue'
              }
            }
          });
          mediator.on(TEST_EVENT, function() {}, this);

          mediator.emit(TEST_EVENT);

          expect(mediator.getEmitQueueLength()).toBe(1);
        });
      });

      describe('permissions', function() {
        it('should exist when extended with sandbox perms', function() {
          expect(permissions).toBeDefined();
        });

        describe('verification of parameters', function() {
          it('should throw an error if all the params are not specified', function() {
            expect(function() {
              permissions.validate();
            }).toThrow(new Error('Subscriber and channel must be defined'));
          });

          it("should throw an error if subscriber is NOT a string", function() {
            expect(function() {
              permissions.validate({}, TEST_CHANNEL);;
            }).toThrow(new Error('Subscriber must be a string'));
          });

          it("should throw an error if channel is NOT a string", function() {
            expect(function() {
              permissions.validate(SANDBOX_NAME, {});;
            }).toThrow(new Error('Channel must be a string'));
          });

        });

        describe('validate', function() {
          it('should have validation method', function() {
            expect(permissions.validate).toBeDefined();
          });
          it('should validate if channel is permitted on the sandbox', function() {
            expect(permissions.validate(TEST_CHANNEL, SANDBOX_NAME)).toBeTruthy();
          });
          it('should not validate if channel is permitted on the sandbox', function() {
            expect(permissions.validate(TEST_CHANNEL, 'notasandbox')).toBeFalsy();
            expect(permissions.validate('yo ha', SANDBOX_NAME)).toBeFalsy();
            expect(permissions.validate('yo ha', 'notasandbox')).toBeFalsy();
          });

          //it('should load permissions declaratively via obj literal of \'emit\' and \'on\'', function() {
        });
      });


    }); // describe('mediator')




    describe('sandbox', function() {
      var sandbox;

      it('should allow a sandbox to be created', function() {
        sandbox = aura_sandbox.create(mediator, SANDBOX_NAME, permissions);

        expect(sandbox).not.toBeNull();
        expect(sandbox).toBeDefined();
      });

      describe('on (subscribe / listen)', function() {

        beforeEach(function() {
          mediator.removeSandboxListeners(SANDBOX_NAME);
        });

        describe('verification of parameters', function() {
          it('should throw an error if all the params are not specified', function() {
            expect(function() {
              sandbox.on();
            }).toThrow(new Error('Channel, event, callback and context must be defined'));
          });

          it("should throw an error if channel is not a string", function() {
            expect(function() {
              sandbox.on({}, TEST_EVENT, function() {}, this)
            }).toThrow(new Error('Channel must be a string'))
          });
          it("should throw an error if typeof event is NOT a string or array in EventEmitter format", function() {
            expect(function() {
              sandbox.on(TEST_CHANNEL, {}, function() {}, this);
            }).toThrow(new Error('Event must be an EventEmitter compatible argument (string or array)'));
          });

          it("should throw an error if typeof callback is NOT a function", function() {
            expect(function() {
              sandbox.on(TEST_CHANNEL, TEST_EVENT, {}, this);
            }).toThrow(new Error('Callback must be a function'));
          });
        });


        it('should allow an event to be subscribed', function() {
          var callback = function() {};
          var event = prependChannel(TEST_CHANNEL, TEST_EVENT);

          sandbox.on(TEST_CHANNEL, TEST_EVENT, callback, this);

          expect(sandbox.listeners(event).length).toBe(1);
        });

        it('should be able assign a specific callback for subscribed event', function() {
          var callback, callbackResult = 'callback';
          sandbox.on(TEST_CHANNEL, TEST_EVENT, function() {}, this);

          sandbox.on(TEST_CHANNEL, TEST_EVENT, function() {
            return callbackResult;
          }, this);

          var event = prependChannel(TEST_CHANNEL, TEST_EVENT);

          callback = sandbox.listeners(event)[1];
          expect(callback()).toBe(callbackResult);
        });

        it('should allow subscribing multiple callbacks for single event channel', function() {
          var callback1 = function() {};
          var callback2 = function() {};

          sandbox.on(TEST_CHANNEL, TEST_EVENT, callback1, this);
          sandbox.on(TEST_CHANNEL, TEST_EVENT, callback2, this);

          var event = prependChannel(TEST_CHANNEL, TEST_EVENT);

          expect(sandbox.listeners(event).length).toBe(2);
        });

        it('should allow subscribing for catchall \'*\' events', function() {
          var callback1 = function() {};

          var event = prependChannel(TEST_CHANNEL, '*');

          sandbox.on(TEST_CHANNEL, '*', callback1, this);
          expect(sandbox.listeners(event).length).toBe(1);
          //expect(sandbox.listenersAny().length).toBe(1);
        });

        it('should allow subscribing for catchall \'**\' events', function() {
          var callback1 = function() {};

          var event = prependChannel(TEST_CHANNEL, '**');

          sandbox.on(TEST_CHANNEL, '**', callback1, this);
          expect(sandbox.listeners(event).length).toBe(1);
          //expect(sandbox.listenersAny().length).toBe(1);
        });

        describe('should allow namespaces and wildcards', function() {

          it('should allow subscribing for namespaces, 2 level', function() {
            var callback1 = function() {};

            sandbox.on(TEST_CHANNEL, 'test.dat', callback1, this);
            expect(sandbox.listeners(prependChannel(TEST_CHANNEL, 'test.dat')).length).toBe(1);
            expect(sandbox.listeners(prependChannel(TEST_CHANNEL, 'test.*')).length).toBe(1);
            expect(sandbox.listeners(prependChannel(TEST_CHANNEL, 'test.**')).length).toBe(1);
          });

          it('should allow subscribing for namespaces, 3 level, wildcard', function() {
            var callback1 = function() {};

            sandbox.on(TEST_CHANNEL, 'test.dis.ptrn', callback1, this);
            expect(sandbox.listeners(prependChannel(TEST_CHANNEL, 'test.dis.ptrn')).length).toBe(1);
            expect(sandbox.listeners(prependChannel(TEST_CHANNEL, 'test.*.ptrn')).length).toBe(1);
            expect(sandbox.listeners(prependChannel(TEST_CHANNEL, 'test.**.ptrn')).length).toBe(1);
          });

          it('should allow subscribing for namespaces, 4 level, wildcard + **', function() {
            var callback1 = function() {};

            sandbox.on(TEST_CHANNEL, 'test2ns.khal.drogo.no', callback1, this);
            expect(sandbox.listeners(prependChannel(TEST_CHANNEL, 'test2ns.khal.drogo.no')).length).toBe(1);
            expect(sandbox.listeners(prependChannel(TEST_CHANNEL, 'test2ns.*.no')).length).toBe(0);
            expect(sandbox.listeners(prependChannel(TEST_CHANNEL, 'test2ns.**.no')).length).toBe(1);
          });

        });


      });

      describe('emit (publish / trigger)', function() {

        beforeEach(function() {
          mediator.removeSandboxListeners(SANDBOX_NAME);
        });

        describe('verification of parameters', function() {
          it('should throw an error if all the params are not specified', function() {
            expect(function() {
              sandbox.emit();
            }).toThrow(new Error('Channel must be defined'));

            expect(function() {
              sandbox.emit(TEST_CHANNEL);
            }).toThrow(new Error('Event must be defined'));
          });

          it('should throw an error if typeof channel param is not string', function() {
            expect(function() {
              sandbox.emit([]);
            }).toThrow(new Error('Channel must be a string'));
          });

          it("should throw an error if typeof event is NOT a string or array in EventEmitter format", function() {
            expect(function() {
              sandbox.emit(TEST_CHANNEL, {});
            }).toThrow(new Error('Event must be an EventEmitter compatible argument (string or array)'));
          });

        });

        it('should call every callback for a channel, within the correct context', function() {
          var callback = sinon.spy();

          sandbox.on(TEST_CHANNEL, TEST_EVENT, callback, this);

          sandbox.emit(TEST_CHANNEL, TEST_EVENT, 'hi');
          mediator.emit(['test_widget', 'test_topic', 'stub'], 'hi');

          expect(callback).toHaveBeenCalled();
        });

        it('should pass additional arguments to every call callback for a channel', function() {
          var callback = sinon.spy();
          var argument = {};

          sandbox.on(TEST_CHANNEL, TEST_EVENT, callback, this);

          sandbox.emit(TEST_CHANNEL, TEST_EVENT, argument);

          expect(callback).toHaveBeenCalledWith(argument);
        });

      });


    });

    xdescribe('widgets', function() {
      xdescribe('start', function() {
        it('should throw an error if all the params are not specified', function() {});
        it('should throw an error if all the params are not the correct type', function() {});
        it('should load (require) a widget that corresponds with a channel', function() {});
        it('should call every callback for the channel, within the correct context', function() {});
        it('should trigger a requirejs error if the widget does not exist', function() {});
      });

      xdescribe('stop', function() {
        it('should throw an error if all the params are not specified', function() {});
        it('should throw an error if all the params are not the correct type', function() {});
        it('should call unload with the correct widget to unload from the app', function() {});
        it('should empty the contents of a specific widget\'s container div', function() {});
      });

      // This one will need to be researched a little more to determine exactly what require does
      xdescribe('unload', function() {
        it('should throw an error if all the params are not specified', function() {});
        it('should throw an error if all the params are not the correct type', function() {});
        it('should unload a module and all modules under its widget path', function() {});
      });
    });
  });
});
