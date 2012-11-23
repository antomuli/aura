

Changelog
=========


dev
---

- Wildcard + Namespaced Pubsub / Permissions with EventEmitter2 compatibility
- `sandbox.on.log` can now subscribe to events and print them.

  `sandbox.on.log('calendar.*');` will listen to all events in calendar
  and pass them to core.log to be printed. It will also identity the
  origin module and print arguments.


Todo
----

  - it would be desirable to move pubsub into its own file and
    decouple it a bit more from subscribers.
  - Perms can be disabled require.configs.config
