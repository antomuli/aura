    define('spec/js/widgets/test_widget/main', function() {
      return function() {};
    });

    define('spec/js/widgets/dummy_widget/main', function() {
      return function() {};
    });

    define('spec/js/widgets/catchall_widget/main', function() {
      return function() {};
    });

    define('spec/js/widgets/wildcard_widget/main', function() {
      return function() {};
    });

    define('spec/js/widgets/single_perm_widget/main', function() {
      return function() {};
    });

    define('perms', ['aura_perms'], function(permissions) {
      'use strict';

      permissions.extend({
        test_widget: {
          emit: ['stub.*'],
          on: []
        },
        catchall_widget: ['*'],
        wildcard_widget: {
          emit: ['stub.*'],
          on: ['test.**', 'test2ns.**'] // subscribe to wildcard events
        },
        single_perm_widget: ['test'] // loading via a single array will work for 'on' and 'emit'
      });

      return permissions;
    });

    define(['aura_core', 'aura_sandbox', 'perms', 'module'], function(mediator, sandbox, permissions, module) {
      describe('PubSub', function() {
        var SANDBOX_NAME = 'test_widget',
          TEST_EVENT = 'stub';

        mediator.getSandbox = function(sandbox) {
          return sandbox;
        };

        //override method util as it uses jQuery proxy and doesn't
        //allow comparison of actual callback function object.
        mediator.util.method = function(fn, context) {
          return fn;
        };

        mediator.start([{
          channel: SANDBOX_NAME,
          options: {
            element: '#todoapp'
          }
        }, {
          channel: 'wildcard_widget',
          options: {
            element: '#hi'
          }
        },

        {
          channel: 'catchall_widget',
          options: {
            element: '#hi3'
          }
        }, {
          channel: 'single_perm_widget',
          options: {
            element: '#hi2'
          }
        }]);


        beforeEach(function() {
          // verify setup
          expect(mediator).toBeDefined();
          expect(mediator['pubsubs']).toBeDefined();

        });

        describe('sandbox', function() {
          describe('assign pubsubs upon start/stop of pubsubs', function() {
            var dummy_widget = 'dummy_widget';
            it('assign pubsub on sandbox start', function() {
              runs(function() {
                mediator.start([{
                  channel: dummy_widget,
                  options: {
                    element: '#todoapp'
                  }
                }]);
              });

              waits(100); // wait for start's .load promise

              runs(function() {
                expect(mediator.pubsubs[dummy_widget]).toBeDefined();
              });

            });

            it('destroy pubsub on sandbox stop', function() {
              runs(function() {
                mediator.start([{
                  channel: dummy_widget,
                  options: {
                    element: '#todoapp'
                  }
                }]);
              });
              waits(100); // wait for start's .load promise

              runs(function() {
                expect(mediator.pubsubs[dummy_widget]).toBeDefined();
              });

              runs(function() {
                mediator.stop(dummy_widget);
                expect(mediator.pubsubs[dummy_widget]).not.toBeDefined();
              });
            });
          });

          describe('starting/stopping pubsubs', function() {

            mediator.getPubSub('testpubsub');

            it('should start pubsubs', function() {
              mediator.getPubSub('testpubsub');

              expect(mediator.pubsubs['testpubsub']).toBeDefined();

            });

            it('should destroy pubsubs', function() {
              mediator.removePubSub('testpubsub');
              expect(mediator.pubsubs['testpubsub']).not.toBeDefined();

            });
          });

        });

        describe('permissions', function() {
          it('should load permissions declaratively via obj literal of \'emit\' and \'on\'', function() {
            expect(mediator.hasPermission('emit', SANDBOX_NAME, 'stub.lol')).toBeTruthy();
            expect(mediator.hasPermission('on', SANDBOX_NAME, 'stub.lol')).toBeFalsy();
          });

          it('should load permissions with single expression clause to both \'on\' and \'emit\'', function() {
            expect(mediator.hasPermission('on', 'single_perm_widget', 'test')).toBeTruthy();
            expect(mediator.hasPermission('emit', 'single_perm_widget', 'test')).toBeTruthy();
          });

          it('should load catch-all permissions', function() {
            expect(mediator.hasPermission('on', 'catchall_widget', '*')).toBeTruthy();
            expect(mediator.hasPermission('on', 'catchall_widget', 'hala')).toBeTruthy();
            expect(mediator.hasPermission('on', 'catchall_widget', 'catch.everything.allday')).toBeTruthy();
          });

          it('should load * permissions', function() {
            expect(mediator.hasPermission('on', 'wildcard_widget', 'test.*')).toBeTruthy();
            expect(mediator.hasPermission('on', 'wildcard_widget', 'test.*.hey.notothis')).toBeFalsy();
          });

          it('should load ** permissions', function() {
            expect(mediator.hasPermission('on', 'wildcard_widget', 'test.**')).toBeTruthy();
            expect(mediator.hasPermission('on', 'wildcard_widget', 'nonsforthis.**')).toBeFalsy();
          });

        });

        describe('on', function() {

          beforeEach(function() {
            if (SANDBOX_NAME in mediator.pubsubs) {
              mediator.removePubSub(SANDBOX_NAME);
            }
          });

          describe('verification of parameters', function() {
            it('should throw an error if all the params are not specified', function() {
              expect(function() {
                mediator.on();
              }).toThrow(new Error('Event, subscriber, callback, and context must be defined'));
            });

            it("should throw an error if typeof event is NOT a string or array in EventEmitter format", function() {
              expect(function() {
                mediator.on({}, 'subscriber', function() {}, {});
              }).toThrow(new Error('Event must be a string or array'));
            });

            it("should throw an error if typeof subscriber is NOT string. The subscriber should be the name of the sandbox widget", function() {
              expect(function() {
                mediator.on('event', {}, function() {}, {});
              }).toThrow(new Error('The widget sandbox name must be passed as string'));
            });

            it("should throw an error if typeof callback is NOT a function", function() {
              expect(function() {
                mediator.on('channel', 'subscriber', 'callback', {});
              }).toThrow(new Error('Callback must be a function'));
            });
          });

          it('should allow an event to be subscribed', function() {
            var pubsub = mediator.createPubSub(SANDBOX_NAME);
            pubsub.on(TEST_EVENT, function() {}, this);
            expect(pubsub.listeners(TEST_EVENT).length).toBe(1);
          });

          it('should be able assign a specific callback for subscribed event', function() {
            var callback, callbackResult = 'callback';
            var pubsub = mediator.createPubSub(SANDBOX_NAME);
            pubsub.on(TEST_EVENT, function() {}, this);

            pubsub.on(TEST_EVENT, function() {
              return callbackResult;
            }, this);

            callback = pubsub.listeners(TEST_EVENT)[1];
            expect(callback()).toBe(callbackResult);
          });

          it('should allow subscribing multiple callbacks for single event channel', function() {
            var callback1 = function() {};
            var callback2 = function() {};
            var pubsub = mediator.createPubSub(SANDBOX_NAME);

            pubsub.on(TEST_EVENT, callback1, this);
            pubsub.on(TEST_EVENT, callback2, this);

            //expect(channels[TEST_EVENT]).toContain(callback1, callback2);
            expect(pubsub.listeners(TEST_EVENT).length).toBe(2);
          });

          it('should allow subscribing for catchall \'*\' events', function() {
            var callback1 = function() {};
            var pubsub = mediator.getPubSub('catchall_widget');

            mediator.on('*', 'catchall_widget', callback1, this);
            expect(pubsub.listenersAny().length).toBe(1);
          });

          describe('should allow namespaces and wildcards', function() {

            it('should allow subscribing for namespaces, 2 level', function() {
              var callback1 = function() {};
              var pubsub = mediator.getPubSub('wildcard_widget');

              mediator.on('test.dat', 'wildcard_widget', callback1, this);
              expect(pubsub.listeners('test.dat').length).toBe(1);
              expect(pubsub.listeners('test.*').length).toBe(1);
              expect(pubsub.listeners('test.**').length).toBe(1);
            });

            it('should allow subscribing for namespaces, 3 level, wildcard', function() {
              var callback1 = function() {};
              var pubsub = mediator.getPubSub('wildcard_widget');

              mediator.on('test.dis.ptrn', 'wildcard_widget', callback1, this);
              expect(pubsub.listeners('test.dis.ptrn').length).toBe(1);
              expect(pubsub.listeners('test.*.ptrn').length).toBe(1);
              expect(pubsub.listeners('test.**.ptrn').length).toBe(1);
            });

            it('should allow subscribing for namespaces, 4 level, wildcard + **', function() {
              var callback1 = function() {};
              var pubsub = mediator.getPubSub('wildcard_widget');

              mediator.on('test2ns.khal.drogo.no', 'wildcard_widget', callback1, this);
              expect(pubsub.listeners('test2ns.khal.drogo.no').length).toBe(1);
              expect(pubsub.listeners('test2ns.*.no').length).toBe(0);
              expect(pubsub.listeners('test2ns.**.no').length).toBe(1);
            });

          });


        });

        describe('emit', function() {

          describe('verification of parameters', function() {
            it('should throw an error if all the params are not specified', function() {
              expect(function() {
                mediator.emit();
              }).toThrow(new Error('Event must be defined'));
            });

            it('should throw an error if typeof channel param is not string', function() {
              expect(function() {
                mediator.emit({});
              }).toThrow(new Error('Event must be a string or an array'));
            });
          });

          it('should call every callback for a channel, within the correct context', function() {
            var callback = sinon.spy();

            var pubsub = mediator.getPubSub(SANDBOX_NAME);
            pubsub.on(TEST_EVENT, callback);

            mediator.emit(TEST_EVENT);

            expect(callback).toHaveBeenCalled();
          });

          it('should pass additional arguments to every call callback for a channel', function() {
            var callback = sinon.spy();
            var argument = {};

            var pubsub = mediator.getPubSub(SANDBOX_NAME);
            pubsub.on(TEST_EVENT, callback);

            mediator.emit(TEST_EVENT, argument);

            expect(callback).toHaveBeenCalledWith(argument);
          });

          /* 
   * this could only be implemented at sandbox level pubsub. mediator.emit
   * is global and broadcasts to all pubsubs
   *
  it('should return false if channel has not been defined', function() {
    var called = mediator.emit(TEST_EVENT);

    expect(called).toBe(false);
  });
   */

          it('should add to emit queue if widget is loading', function() {
            var pubsub = mediator.pubsubs[SANDBOX_NAME];
            pubsub.on(TEST_EVENT, function() {});

            mediator.start({
              channel: SANDBOX_NAME,
              options: {
                element: '#nothing'
              }
            });

            mediator.emit(TEST_EVENT);

            expect(mediator.getEmitQueueLength()).toBe(1);
          });
        });

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
