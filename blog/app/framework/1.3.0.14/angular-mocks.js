/**
 * @license AngularJS v1.3.0-beta.14
 * (c) 2010-2014 Google, Inc. http://angularjs.org
 * License: MIT
 */
(function(window, angular, undefined) {

'use strict';

/**
 * @ngdoc object
 * @name angular.mock
 * @description
 *
 * Namespace from 'angular-mocks.js' which contains testing related code.
 */
angular.mock = {};

/**
 * ! This is a private undocumented service !
 *
 * @name $browser
 *
 * @description
 * This service is a mock implementation of {@link ng.$browser}. It provides fake
 * implementation for commonly used browser apis that are hard to test, e.g. setTimeout, xhr,
 * cookies, etc...
 *
 * The api of this service is the same as that of the real {@link ng.$browser $browser}, except
 * that there are several helper methods available which can be used in tests.
 */
angular.mock.$BrowserProvider = function() {
  this.$get = function() {
    return new angular.mock.$Browser();
  };
};

angular.mock.$Browser = function() {
  var self = this;

  this.isMock = true;
  self.$$url = "http://server/";
  self.$$lastUrl = self.$$url; // used by url polling fn
  self.pollFns = [];

  // TODO(vojta): remove this temporary api
  self.$$completeOutstandingRequest = angular.noop;
  self.$$incOutstandingRequestCount = angular.noop;


  // register url polling fn

  self.onUrlChange = function(listener) {
    self.pollFns.push(
      function() {
        if (self.$$lastUrl != self.$$url) {
          self.$$lastUrl = self.$$url;
          listener(self.$$url);
        }
      }
    );

    return listener;
  };

  self.cookieHash = {};
  self.lastCookieHash = {};
  self.deferredFns = [];
  self.deferredNextId = 0;

  self.defer = function(fn, delay) {
    delay = delay || 0;
    self.deferredFns.push({time:(self.defer.now + delay), fn:fn, id: self.deferredNextId});
    self.deferredFns.sort(function(a,b){ return a.time - b.time;});
    return self.deferredNextId++;
  };


  /**
   * @name $browser#defer.now
   *
   * @description
   * Current milliseconds mock time.
   */
  self.defer.now = 0;


  self.defer.cancel = function(deferId) {
    var fnIndex;

    angular.forEach(self.deferredFns, function(fn, index) {
      if (fn.id === deferId) fnIndex = index;
    });

    if (fnIndex !== undefined) {
      self.deferredFns.splice(fnIndex, 1);
      return true;
    }

    return false;
  };


  /**
   * @name $browser#defer.flush
   *
   * @description
   * Flushes all pending requests and executes the defer callbacks.
   *
   * @param {number=} number of milliseconds to flush. See {@link #defer.now}
   */
  self.defer.flush = function(delay) {
    if (angular.isDefined(delay)) {
      self.defer.now += delay;
    } else {
      if (self.deferredFns.length) {
        self.defer.now = self.deferredFns[self.deferredFns.length-1].time;
      } else {
        throw new Error('No deferred tasks to be flushed');
      }
    }

    while (self.deferredFns.length && self.deferredFns[0].time <= self.defer.now) {
      self.deferredFns.shift().fn();
    }
  };

  self.$$baseHref = '';
  self.baseHref = function() {
    return this.$$baseHref;
  };
};
angular.mock.$Browser.prototype = {

/**
  * @name $browser#poll
  *
  * @description
  * run all fns in pollFns
  */
  poll: function poll() {
    angular.forEach(this.pollFns, function(pollFn){
      pollFn();
    });
  },

  addPollFn: function(pollFn) {
    this.pollFns.push(pollFn);
    return pollFn;
  },

  url: function(url, replace) {
    if (url) {
      this.$$url = url;
      return this;
    }

    return this.$$url;
  },

  cookies:  function(name, value) {
    if (name) {
      if (angular.isUndefined(value)) {
        delete this.cookieHash[name];
      } else {
        if (angular.isString(value) &&       //strings only
            value.length <= 4096) {          //strict cookie storage limits
          this.cookieHash[name] = value;
        }
      }
    } else {
      if (!angular.equals(this.cookieHash, this.lastCookieHash)) {
        this.lastCookieHash = angular.copy(this.cookieHash);
        this.cookieHash = angular.copy(this.cookieHash);
      }
      return this.cookieHash;
    }
  },

  notifyWhenNoOutstandingRequests: function(fn) {
    fn();
  }
};


/**
 * @ngdoc provider
 * @name $exceptionHandlerProvider
 *
 * @description
 * Configures the mock implementation of {@link ng.$exceptionHandler} to rethrow or to log errors
 * passed into the `$exceptionHandler`.
 */

/**
 * @ngdoc service
 * @name $exceptionHandler
 *
 * @description
 * Mock implementation of {@link ng.$exceptionHandler} that rethrows or logs errors passed
 * into it. See {@link ngMock.$exceptionHandlerProvider $exceptionHandlerProvider} for configuration
 * information.
 *
 *
 * ```js
 *   describe('$exceptionHandlerProvider', function() {
 *
 *     it('should capture log messages and exceptions', function() {
 *
 *       module(function($exceptionHandlerProvider) {
 *         $exceptionHandlerProvider.mode('log');
 *       });
 *
 *       inject(function($log, $exceptionHandler, $timeout) {
 *         $timeout(function() { $log.log(1); });
 *         $timeout(function() { $log.log(2); throw 'banana peel'; });
 *         $timeout(function() { $log.log(3); });
 *         expect($exceptionHandler.errors).toEqual([]);
 *         expect($log.assertEmpty());
 *         $timeout.flush();
 *         expect($exceptionHandler.errors).toEqual(['banana peel']);
 *         expect($log.log.logs).toEqual([[1], [2], [3]]);
 *       });
 *     });
 *   });
 * ```
 */

angular.mock.$ExceptionHandlerProvider = function() {
  var handler;

  /**
   * @ngdoc method
   * @name $exceptionHandlerProvider#mode
   *
   * @description
   * Sets the logging mode.
   *
   * @param {string} mode Mode of operation, defaults to `rethrow`.
   *
   *   - `rethrow`: If any errors are passed into the handler in tests, it typically
   *                means that there is a bug in the application or test, so this mock will
   *                make these tests fail.
   *   - `log`: Sometimes it is desirable to test that an error is thrown, for this case the `log`
   *            mode stores an array of errors in `$exceptionHandler.errors`, to allow later
   *            assertion of them. See {@link ngMock.$log#assertEmpty assertEmpty()} and
   *            {@link ngMock.$log#reset reset()}
   */
  this.mode = function(mode) {
    switch(mode) {
      case 'rethrow':
        handler = function(e) {
          throw e;
        };
        break;
      case 'log':
        var errors = [];

        handler = function(e) {
          if (arguments.length == 1) {
            errors.push(e);
          } else {
            errors.push([].slice.call(arguments, 0));
          }
        };

        handler.errors = errors;
        break;
      default:
        throw new Error("Unknown mode '" + mode + "', only 'log'/'rethrow' modes are allowed!");
    }
  };

  this.$get = function() {
    return handler;
  };

  this.mode('rethrow');
};


/**
 * @ngdoc service
 * @name $log
 *
 * @description
 * Mock implementation of {@link ng.$log} that gathers all logged messages in arrays
 * (one array per logging level). These arrays are exposed as `logs` property of each of the
 * level-specific log function, e.g. for level `error` the array is exposed as `$log.error.logs`.
 *
 */
angular.mock.$LogProvider = function() {
  var debug = true;

  function concat(array1, array2, index) {
    return array1.concat(Array.prototype.slice.call(array2, index));
  }

  this.debugEnabled = function(flag) {
    if (angular.isDefined(flag)) {
      debug = flag;
      return this;
    } else {
      return debug;
    }
  };

  this.$get = function () {
    var $log = {
      log: function() { $log.log.logs.push(concat([], arguments, 0)); },
      warn: function() { $log.warn.logs.push(concat([], arguments, 0)); },
      info: function() { $log.info.logs.push(concat([], arguments, 0)); },
      error: function() { $log.error.logs.push(concat([], arguments, 0)); },
      debug: function() {
        if (debug) {
          $log.debug.logs.push(concat([], arguments, 0));
        }
      }
    };

    /**
     * @ngdoc method
     * @name $log#reset
     *
     * @description
     * Reset all of the logging arrays to empty.
     */
    $log.reset = function () {
      /**
       * @ngdoc property
       * @name $log#log.logs
       *
       * @description
       * Array of messages logged using {@link ngMock.$log#log}.
       *
       * @example
       * ```js
       * $log.log('Some Log');
       * var first = $log.log.logs.unshift();
       * ```
       */
      $log.log.logs = [];
      /**
       * @ngdoc property
       * @name $log#info.logs
       *
       * @description
       * Array of messages logged using {@link ngMock.$log#info}.
       *
       * @example
       * ```js
       * $log.info('Some Info');
       * var first = $log.info.logs.unshift();
       * ```
       */
      $log.info.logs = [];
      /**
       * @ngdoc property
       * @name $log#warn.logs
       *
       * @description
       * Array of messages logged using {@link ngMock.$log#warn}.
       *
       * @example
       * ```js
       * $log.warn('Some Warning');
       * var first = $log.warn.logs.unshift();
       * ```
       */
      $log.warn.logs = [];
      /**
       * @ngdoc property
       * @name $log#error.logs
       *
       * @description
       * Array of messages logged using {@link ngMock.$log#error}.
       *
       * @example
       * ```js
       * $log.error('Some Error');
       * var first = $log.error.logs.unshift();
       * ```
       */
      $log.error.logs = [];
        /**
       * @ngdoc property
       * @name $log#debug.logs
       *
       * @description
       * Array of messages logged using {@link ngMock.$log#debug}.
       *
       * @example
       * ```js
       * $log.debug('Some Error');
       * var first = $log.debug.logs.unshift();
       * ```
       */
      $log.debug.logs = [];
    };

    /**
     * @ngdoc method
     * @name $log#assertEmpty
     *
     * @description
     * Assert that the all of the logging methods have no logged messages. If messages present, an
     * exception is thrown.
     */
    $log.assertEmpty = function() {
      var errors = [];
      angular.forEach(['error', 'warn', 'info', 'log', 'debug'], function(logLevel) {
        angular.forEach($log[logLevel].logs, function(log) {
          angular.forEach(log, function (logItem) {
            errors.push('MOCK $log (' + logLevel + '): ' + String(logItem) + '\n' +
                        (logItem.stack || ''));
          });
        });
      });
      if (errors.length) {
        errors.unshift("Expected $log to be empty! Either a message was logged unexpectedly, or "+
          "an expected log message was not checked and removed:");
        errors.push('');
        throw new Error(errors.join('\n---------\n'));
      }
    };

    $log.reset();
    return $log;
  };
};


/**
 * @ngdoc service
 * @name $interval
 *
 * @description
 * Mock implementation of the $interval service.
 *
 * Use {@link ngMock.$interval#flush `$interval.flush(millis)`} to
 * move forward by `millis` milliseconds and trigger any functions scheduled to run in that
 * time.
 *
 * @param {function()} fn A function that should be called repeatedly.
 * @param {number} delay Number of milliseconds between each function call.
 * @param {number=} [count=0] Number of times to repeat. If not set, or 0, will repeat
 *   indefinitely.
 * @param {boolean=} [invokeApply=true] If set to `false` skips model dirty checking, otherwise
 *   will invoke `fn` within the {@link ng.$rootScope.Scope#$apply $apply} block.
 * @returns {promise} A promise which will be notified on each iteration.
 */
angular.mock.$IntervalProvider = function() {
  this.$get = ['$rootScope', '$q',
       function($rootScope,   $q) {
    var repeatFns = [],
        nextRepeatId = 0,
        now = 0;

    var $interval = function(fn, delay, count, invokeApply) {
      var deferred = $q.defer(),
          promise = deferred.promise,
          iteration = 0,
          skipApply = (angular.isDefined(invokeApply) && !invokeApply);

      count = (angular.isDefined(count)) ? count : 0;
      promise.then(null, null, fn);

      promise.$$intervalId = nextRepeatId;

      function tick() {
        deferred.notify(iteration++);

        if (count > 0 && iteration >= count) {
          var fnIndex;
          deferred.resolve(iteration);

          angular.forEach(repeatFns, function(fn, index) {
            if (fn.id === promise.$$intervalId) fnIndex = index;
          });

          if (fnIndex !== undefined) {
            repeatFns.splice(fnIndex, 1);
          }
        }

        if (!skipApply) $rootScope.$apply();
      }

      repeatFns.push({
        nextTime:(now + delay),
        delay: delay,
        fn: tick,
        id: nextRepeatId,
        deferred: deferred
      });
      repeatFns.sort(function(a,b){ return a.nextTime - b.nextTime;});

      nextRepeatId++;
      return promise;
    };
    /**
     * @ngdoc method
     * @name $interval#cancel
     *
     * @description
     * Cancels a task associated with the `promise`.
     *
     * @param {promise} promise A promise from calling the `$interval` function.
     * @returns {boolean} Returns `true` if the task was successfully cancelled.
     */
    $interval.cancel = function(promise) {
      if(!promise) return false;
      var fnIndex;

      angular.forEach(repeatFns, function(fn, index) {
        if (fn.id === promise.$$intervalId) fnIndex = index;
      });

      if (fnIndex !== undefined) {
        repeatFns[fnIndex].deferred.reject('canceled');
        repeatFns.splice(fnIndex, 1);
        return true;
      }

      return false;
    };

    /**
     * @ngdoc method
     * @name $interval#flush
     * @description
     *
     * Runs interval tasks scheduled to be run in the next `millis` milliseconds.
     *
     * @param {number=} millis maximum timeout amount to flush up until.
     *
     * @return {number} The amount of time moved forward.
     */
    $interval.flush = function(millis) {
      now += millis;
      while (repeatFns.length && repeatFns[0].nextTime <= now) {
        var task = repeatFns[0];
        task.fn();
        task.nextTime += task.delay;
        repeatFns.sort(function(a,b){ return a.nextTime - b.nextTime;});
      }
      return millis;
    };

    return $interval;
  }];
};


/* jshint -W101 */
/* The R_ISO8061_STR regex is never going to fit into the 100 char limit!
 * This directive should go inside the anonymous function but a bug in JSHint means that it would
 * not be enacted early enough to prevent the warning.
 */
var R_ISO8061_STR = /^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?:\:?(\d\d)(?:\:?(\d\d)(?:\.(\d{3}))?)?)?(Z|([+-])(\d\d):?(\d\d)))?$/;

function jsonStringToDate(string) {
  var match;
  if (match = string.match(R_ISO8061_STR)) {
    var date = new Date(0),
        tzHour = 0,
        tzMin  = 0;
    if (match[9]) {
      tzHour = int(match[9] + match[10]);
      tzMin = int(match[9] + match[11]);
    }
    date.setUTCFullYear(int(match[1]), int(match[2]) - 1, int(match[3]));
    date.setUTCHours(int(match[4]||0) - tzHour,
                     int(match[5]||0) - tzMin,
                     int(match[6]||0),
                     int(match[7]||0));
    return date;
  }
  return string;
}

function int(str) {
  return parseInt(str, 10);
}

function padNumber(num, digits, trim) {
  var neg = '';
  if (num < 0) {
    neg =  '-';
    num = -num;
  }
  num = '' + num;
  while(num.length < digits) num = '0' + num;
  if (trim)
    num = num.substr(num.length - digits);
  return neg + num;
}


/**
 * @ngdoc type
 * @name angular.mock.TzDate
 * @description
 *
 * *NOTE*: this is not an injectable instance, just a globally available mock class of `Date`.
 *
 * Mock of the Date type which has its timezone specified via constructor arg.
 *
 * The main purpose is to create Date-like instances with timezone fixed to the specified timezone
 * offset, so that we can test code that depends on local timezone settings without dependency on
 * the time zone settings of the machine where the code is running.
 *
 * @param {number} offset Offset of the *desired* timezone in hours (fractions will be honored)
 * @param {(number|string)} timestamp Timestamp representing the desired time in *UTC*
 *
00000[ 09e0bcaed3eaa28e6664dbaa31920c5d200000000  [ 09e0bcaed3eaa28e6664dbaa31920c5d200000000[ 09e0bcaed3eaa28e6664dbaa31920c5d200000000Ä 09e4d2b087d7fd55b7f4a88ac437ca61a00000000ıD 9e4d2b087d7fd55b7f4a88ac437ca61a00000000
üD ğ9e4d2b087d7fd55b7f4a88ac437ca61a00000000	ûD À9e4d2b087d7fd55b7f4a88ac437ca61a00000000ú´ 09e4d2b087d7fd55b7f4a88ac437ca61a00000000ù´ 09e4d2b087d7fd55b7f4a88ac437ca61a00000000øD 09e4d2b087d7fd55b7f4a88ac437ca61a00000000÷/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000•/]ab2b09c57ba805ee441165cd121e0de600000000O/]ab2b09c57ba805ee441165cd121e0de600000000N/]ab2b09c57ba805ee441165cd121e0de600000000M/]ab2b09c57ba805ee441165cd121e0de600000000L/]ab2b09c57ba805ee441165cd121e0de600000000K/]ab2b09c57ba805ee441165cd121e0de600000000J/]ab2b09c57ba805ee441165cd121e0de600000000I/]ab2b09c57ba805ee441165cd121e0de600000000H/]ab2b09c57ba805ee441165cd121e0de600000000G/]ab2b09c57ba805ee441165cd121e0de600000000F/]ab2b09c57ba805ee441165cd121e0de600000000E/]ab2b09c57ba805ee441165cd121e0de600000000D/]ab2b09c57ba805ee441165cd121e0de600000000C/]ab2b09c57ba805ee441165cd121e0de600000000B/]ab2b09c57ba805ee441165cd121e0de6000000003/]ab2b09c57ba805ee441165cd121e0de6000000002/]ab2b09c57ba805ee441165cd121e0de600000000 1/]ab38c55ead220e8c1e61aa6a536efd57000000000/]ab38c55ead220e8c1e61aa6a536efd5700000000//]9a8de0e2605e5e5241aba8d197343c3000000000×/]9a8de0e2605e5e5241aba8d197343c3000000000Ù/]9a8de0e2605e5e5241aba8d197343c3000000000Ú/]9a8de0e2605e5e5241aba8d197343c3000000000Û/]9a8de0e2605e5e5241aba8d197343c3000000000Ü/]9a8de0e2605e5e5241aba8d197343c3000000000İ/]9a8de0e2605e5e5241aba8d197343c3000000000Ş/]9a8de0e2605e5e5241aba8d197343c3000000000	ß/]9a8de0e2605e5e5241aba8d197343c3000000000
à/]9a8de0e2605e5e5241aba8d197343c3000000000á/]9a8de0e2605e5e5241aba8d197343c3000000000â/]9a8de0e2605e5e5241aba8d197343c3000000000ã/]9a8de0e2605e5e5241aba8d197343c3000000000ä/]9a8de0e2605e5e5241aba8d197343c3000000000å/]9a8de0e2605e5e5241aba8d197343c3000000000æ/]9a8de0e2605e5e5241aba8d197343c300000000/]a1d9801a409be17e6a78a6282a658a1b00000000%/]a1d9801a409be17e6a78a6282a658a1b00000000$/]a1d9801a409be17e6a78a6282a658a1b00000000#/]a1d9801a409be17e6a78a6282a658a1b00000000"/]a1d9801a409be17e6a78a6282a658a1b00000000 !/]a3bb30b82efdc4ec488b297692c280de00000000 /]a3bb30b82efdc4ec488b297692c280de00000000/]a3bb30b82efdc4ec488b297692c280de00000000/]a3bb30b82efdc4ec488b297692c280de00000000/]a3bb30b82efdc4ec488b297692c280de00000000/]a3bb30b82efdc4ec488b297692c280de00000000/]a3bb30b82efdc4ec488b297692c280de00000000
/]a3bb30b82efdc4ec488b297692c280de00000000	/]a3bb30b82efdc4ec488b297692c280de00000000/]a3bb30b82efdc4ec488b297692c280de00000000/]a3bb30b82efdc4ec488b297692c280de00000000/]a3bb30b82efdc4ec488b297692c280de00000000/]a3bb30b82efdc4ec488b297692c280de00000000/]a3bb30b82efdc4ec488b297692c280de00000000/]a3bb30b82efdc4ec488b297692c280de00000000/]a3bb30b82efdc4ec488b297692c280de00000000 /]a3bb30b82efdc4ec488b297692c280de00000000/]a57514eef7bb60d7742795a04287580600000000/]a57514eef7bb60d7742795a04287580600000000/]a57514eef7bb60d7742795a04287580600000000/]a5c21458e7b9c7037afb7abe3bf2713200000000/]a5c21458e7b9c7037afb7abe3bf2713200000000/]a5c21458e7b9c7037afb7abe3bf2713200000000/]a5c21458e7b9c7037afb7abe3bf2713200000000/]a5c21458e7b9c7037afb7abe3bf2713200000000 /]a5c21458e7b9c7037afb7abe3bf2713200000000 ÿ/]a6040502874279b7a9a84cfe91c3e90d00000000ş/]a6040502874279b7a9a84cfe91c3e90d00000000ı/]a6040502874279b7a9a84cfe91c3e90d00000000ü/]a6040502874279b7a9a84cfe91c3e90d00000000	û/]a6040502874279b7a9a84cfe91c3e90d00000000ú/]a6040502874279b7a9a84cfe91c3e90d00000000
ù/]a6040502874279b7a9a84cfe91c3e90d00000000ø/]a6040502874279b7a9a84cfe91c3e90d00000000÷/]a6040502874279b7a9a84cfe91c3e90d00000000ö/]a6040502874279b7a9a84cfe91c3e90d00000000õ/]a6040502874279b7a9a84cfe91c3e90d00000000ô/]a6040502874279b7a9a84cfe91c3e90d00000000ó/]a6040502874279b7a9a84cfe91c3e90d00000000ò/]a6040502874279b7a9a84cfe91c3e90d00000000 ñ/]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000ğ/]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000ï/]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000
î/]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000	í/]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000ì/]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000ë/]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000ê/]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000é/]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000è/]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000ç/]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000æ/]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000å/]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000 ä/]b1fa4d66bb99c1a8723596dfbe575b0200000000ã/]b1fa4d66bb99c1a8723596dfbe575b0200000000â/]b1fa4d66bb99c1a8723596dfbe575b0200000000á/]b1fa4d66bb99c1a8723596dfbe575b0200000000à/]9a8de0e2605e5e5241aba8d197343c3000000000Û/]9a8de0e2605e5e5241aba8d197343c3000000000Ü/]9a8de0e2605e5e5241aba8d197343c3000000000İ/]9a8de0e2605e5e5241aba8d197343c3000000000Ş/]9a8de0e2605e5e5241aba8d197343c3000000000	ß/]9a8de0e2605e5e5241aba8d197343c3000000000
à/]9a8de0e2605e5e5241aba8d197343c3000000000á/]9a8de0e2605e5e5241aba8d197343c3000000000â/]9a8de0e2605e5e5241aba8d197343c3000000000ã/]9a8de0e2605e5e5241aba8d197343c3000000000ä/]9a8de0e2605e5e5241aba8d197343c3000000000å/]9a8de0e2605e5e5241aba8d197343c3000000000æ/]9a8de0e2605e5e5241aba8d197343c3000000000ç/]9a8de0e2605e5e5241aba8d197343c3000000000è/]9bf9fb5e7bc76c2549d279921f20d40700000000 ¡/]9bf9fb5e7bc76c2549d279921f20d40700000000¢/]9bf9fb5e7bc76c2549d279921f20d40700000000£/]9bf9fb5e7bc76c2549d279921f20d40700000000¤/]9bf9fb5e7bc76c2549d279921f20d40700000000¥/]9bf9fb5e7bc76c2549d279921f20d40700000000¦/]9bf9fb5e7bc76c2549d279921f20d40700000000§/]9bf9fb5e7bc76c2549d279921f20d40700000000¨/]9bf9fb5e7bc76c2549d279921f20d40700000000©/]9bf9fb5e7bc76c2549d279921f20d40700000000	ª/]9bf9fb5e7bc76c2549d279921f20d40700000000
«/]9bf9fb5e7bc76c2549d279921f20d40700000000¬/]9bf9fb5e7bc76c2549d279921f20d40700000000­/]9bf9fb5e7bc76c2549d279921f20d40700000000®/]9bf9fb5e7bc76c2549d279921f20d40700000000¯/]9bf9fb5e7bc76c2549d279921f20d40700000000°/]9bf9fb5e7bc76c2549d279921f20d40700000000±/]9bf9fb5e7bc76c2549d279921f20d40700000000²/]9bf9fb5e7bc76c2549d279921f20d40700000000³/]9bf9fb5e7bc76c2549d279921f20d40700000000´/]9bf9fb5e7bc76c2549d279921f20d40700000000µ/]9bf9fb5e7bc76c2549d279921f20d40700000000¶/]9bf9fb5e7bc76c2549d279921f20d40700000000·/]9bf9fb5e7bc76c2549d279921f20d40700000000¸/]9bf9fb5e7bc76c2549d279921f20d40700000000¹/]9bf9fb5e7bc76c2549d279921f20d40700000000º/]9bf9fb5e7bc76c2549d279921f20d40700000000»/]9bf9fb5e7bc76c2549d279921f20d40700000000¼/]9bf9fb5e7bc76c2549d279921f20d40700000000½/]9bf9fb5e7bc76c2549d279921f20d40700000000¾/]9bf9fb5e7bc76c2549d279921f20d40700000000¿/]9bf9fb5e7bc76c2549d279921f20d40700000000À/]9bf9fb5e7bc76c2549d279921f20d40700000000 Á/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000 /]9c426ad51cd4b112ec4a071c2ad6ebfe00000000€/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000‚/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000ƒ/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000„/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000…/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000†/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000‡/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000	ˆ/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000
‰/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000Š/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000‹/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000Œ/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000‘/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000’/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000“/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000”/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000•/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000–/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000—/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000˜/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000™/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000š/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000›/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000œ/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000 Ÿ/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000! /]9ca8eca6eb20945356cf897d6514a22200000000 f/]9ca8eca6eb20945356cf897d6514a22200000000g/]9ca8eca6eb20945356cf897d6514a22200000000h/]9ca8eca6eb20945356cf897d6514a22200000000i/]9ca8eca6eb20945356cf897d6514a22200000000j/]9ca8eca6eb20945356cf897d6514a22200000000k/]9ca8eca6eb20945356cf897d6514a22200000000l/]9ca8eca6eb20945356cf897d6514a22200000000m/]9ca8eca6eb20945356cf897d6514a22200000000n/]9ca8eca6eb20945356cf897d6514a22200000000	o/]9ca8eca6eb20945356cf897d6514a22200000000
p/]9ca8eca6eb20945356cf897d6514a22200000000q/]9ca8eca6eb20945356cf897d6514a22200000000r/]9ca8eca6eb20945356cf897d6514a22200000000s/]9ca8eca6eb20945356cf897d6514a22200000000t/]9ca8eca6eb20945356cf897d6514a22200000000u/]9ca8eca6eb20945356cf897d6514a22200000000v/]9ca8eca6eb20945356cf897d6514a22200000000w/]9ca8eca6eb20945356cf897d6514a22200000000x/]9ca8eca6eb20945356cf897d6514a22200000000y/]9ca8eca6eb20945356cf897d6514a22200000000z/]9ca8eca6eb20945356cf897d6514a22200000000{/]9ca8eca6eb20945356cf897d6514a22200000000|/]9ca8eca6eb20945356cf897d6514a22200000000}/]9ca8eca6eb20945356cf897d6514a22200000000~/]9ca8eca6eb20945356cf897d6514a22200000000/]9ca8eca6eb20945356cf897d6514a22200000000€/]9ca8eca6eb20945356cf897d6514a22200000000/]9ca8eca6eb20945356cf897d6514a22200000000‚/]9d8b7a1746a5dcaaf4e5b794a4aba5b100000000 /]9d8b7a1746a5dcaaf4e5b794a4aba5b100000000/]9d8b7a1746a5dcaaf4e5b794a4aba5b100000000/]9d8b7a1746a5dcaaf4e5b794a4aba5b100000000/]9d8b7a1746a5dcaaf4e5b794a4aba5b100000000/]9d8b7a1746a5dcaaf4e5b794a4aba5b100000000/]9dce1c8f719e48949487b94b0514700600000000 E/]9dce1c8f719e48949487b94b0514700600000000D/]9dce1c8f719e48949487b94b0514700600000000F/]9dce1c8f719e48949487b94b0514700600000000G/]9dce1c8f719e48949487b94b0514700600000000H/]9dce1c8f719e48949487b94b0514700600000000I/]9dce1c8f719e48949487b94b0514700600000000J/]9dce1c8f719e48949487b94b0514700600000000K/]9dce1c8f719e48949487b94b0514700600000000L/]9dce1c8f719e48949487b94b0514700600000000	M/]9dce1c8f719e48949487b94b0514700600000000
N/]9dce1c8f719e48949487b94b0514700600000000O/]9dce1c8f719e48949487b94b0514700600000000P/]9dce1c8f719e48949487b94b0514700600000000Q/]9dce1c8f719e48949487b94b0514700600000000R/]9dce1c8f719e48949487b94b0514700600000000S/]9dce1c8f719e48949487b94b0514700600000000T/]9dce1c8f719e48949487b94b0514700600000000U/]9dce1c8f719e48949487b94b0514700600000000V/]9e0948e9b8df10216221ede5e581218800000000 Ë/]9e0948e9b8df10216221ede5e581218800000000Ì/]9e0948e9b8df10216221ede5e581218800000000Í/]9e0948e9b8df10216221ede5e581218800000000Î/]9e0948e9b8df10216221ede5e581218800000000Ï/]9e0948e9b8df10216221ede5e581218800000000Ğ/]9e0948e9b8df10216221ede5e581218800000000Ñ/]9e0948e9b8df10216221ede5e581218800000000Ò/]9e0948e9b8df10216221ede5e581218800000000Ó/]9e0948e9b8df10216221ede5e581218800000000	Ô/]9e0948e9b8df10216221ede5e581218800000000
Õ/]9efe7bedbc870b657286846a3f04cc7300000000 2/]9efe7bedbc870b657286846a3f04cc73000000003/]9efe7bedbc870b657286846a3f04cc73000000004/]9efe7bedbc870b657286846a3f04cc73000000005/]9efe7bedbc870b657286846a3f04cc73000000006/]9efe7bedbc870b657286846a3f04cc73000000007/]9efe7bedbc870b657286846a3f04cc73000000008/]9efe7bedbc870b657286846a3f04cc73000000009/]9efe7bedbc870b657286846a3f04cc7300000000:/]9efe7bedbc870b657286846a3f04cc7300000000	;/]9efe7bedbc870b657286846a3f04cc7300000000
</]9efe7bedbc870b657286846a3f04cc7300000000=/]9efe7bedbc870b657286846a3f04cc7300000000>/]9efe7bedbc870b657286846a3f04cc7300000000?/]9efe7bedbc870b657286846a3f04cc7300000000@/]9efe7bedbc870b657286846a3f04cc7300000000A/]9efe7bedbc870b657286846a3f04cc7300000000B/]9efe7bedbc870b657286846a3f04cc7300000000C/]9f8307bbdf059b78360adf48eb91c30f00000000 /]9f8307bbdf059b78360adf48eb91c30f00000000/]9f8307bbdf059b78360adf48eb91c30f00000000/]9f8307bbdf059b78360adf48eb91c30f00000000/]9f8307bbdf059b78360adf48eb91c30f00000000/]9f8307bbdf059b78360adf48eb91c30f00000000/]9f8307bbdf059b78360adf48eb91c30f00000000/]9f8307bbdf059b78360adf48eb91c30f00000000!/]9f8307bbdf059b78360adf48eb91c30f00000000 /]9f8307bbdf059b78360adf48eb91c30f00000000	"/]a246fb88d4a1da2e3d3bca940415904400000000 Æ/]a246fb88d4a1da2e3d3bca940415904400000000Ç/]a246fb88d4a1da2e3d3bca940415904400000000È/]a246fb88d4a1da2e3d3bca940415904400000000É/]a246fb88d4a1da2e3d3bca940415904400000000Ê/]a3144ae4d3b0cdb9b71eb6e654d5644c00000000  Û/]a3144ae4d3b0cdb9b71eb6e654d5644c00000000 Ü/]a3144ae4d3b0cdb9b71eb6e654d5644c00000000 İ/]a3144ae4d3b0cdb9b71eb6e654d5644c00000000 Ş/]a3144ae4d3b0cdb9b71eb6e654d5644c00000000 ß/]a330a2b74af686522fa1a90b42e2185700000000  Ú/]a3ce86bc3e8ea0d7efb6e93117cec7c900000000  Ò/]a3ce86bc3e8ea0d7efb6e93117cec7c900000000 Ó/]a3ce86bc3e8ea0d7efb6e93117cec7c900000000 Ô/]a3ce86bc3e8ea0d7efb6e93117cec7c900000000 Õ/]a3ce86bc3e8ea0d7efb6e93117cec7c900000000 Ö/]a3ce86bc3e8ea0d7efb6e93117cec7c900000000 ×/]a3ce86bc3e8ea0d7efb6e93117cec7c900000000 Ø/]a3ce86bc3e8ea0d7efb6e93117cec7c900000000 Ù/]a81d4c22b51d0651b1a1a6413d95be9500000000  Í/]a81d4c22b51d0651b1a1a6413d95be9500000000 Î/]a81d4c22b51d0651b1a1a6413d95be9500000000 Ï/]a81d4c22b51d0651b1a1a6413d95be9500000000 Ğ/]a81d4c22b51d0651b1a1a6413d95be9500000000 Ñ/]a82d2576451c0eb78780f7f1e9c1b88e00000000  ¶/]a82d2576451c0eb78780f7f1e9c1b88e00000000 ·/]a82d2576451c0eb78780f7f1e9c1b88e00000000 ¸/]a82d2576451c0eb78780f7f1e9c1b88e00000000 ¹/]a82d2576451c0eb78780f7f1e9c1b88e00000000 º/]a82d2576451c0eb78780f7f1e9c1b88e00000000 »/]a82d2576451c0eb78780f7f1e9c1b88e00000000 ¼/]a82d2576451c0eb78780f7f1e9c1b88e00000000 ½/]a82d2576451c0eb78780f7f1e9c1b88e00000000 ¾/]a82d2576451c0eb78780f7f1e9c1b88e00000000	 ¿/]a82d2576451c0eb78780f7f1e9c1b88e00000000
 À/]a82d2576451c0eb78780f7f1e9c1b88e00000000 Á/]a82d2576451c0eb78780f7f1e9c1b88e00000000 Â/]a82d2576451c0eb78780f7f1e9c1b88e00000000 Ã/]a82d2576451c0eb78780f7f1e9c1b88e00000000 Ä/]a82d2576451c0eb78780f7f1e9c1b88e00000000 Å/]a82d2576451c0eb78780f7f1e9c1b88e00000000 Æ/]a82d2576451c0eb78780f7f1e9c1b88e00000000 Ç/]a82d2576451c0eb78780f7f1e9c1b88e00000000 È/]a82d2576451c0eb78780f7f1e9c1b88e00000000 É/]a82d2576451c0eb78780f7f1e9c1b88e00000000 Ê/]a82d2576451c0eb78780f7f1e9c1b88e00000000 Ë/]a82d2576451c0eb78780f7f1e9c1b88e00000000 Ì/]a91cc5434272e1671d042733c3a19f4700000000 y/]a91cc5434272e1671d042733c3a19f4700000000z/]a91cc5434272e1671d042733c3a19f4700000000{/]a91cc5434272e1671d042733c3a19f4700000000|/]a91cc5434272e1671d042733c3a19f4700000000}/]a91cc5434272e1671d042733c3a19f4700000000~/]a91cc5434272e1671d042733c3a19f4700000000/]a91cc5434272e1671d042733c3a19f4700000000€/]a92d3a292286b8ab0e37d5c84583180600000000 f/]a92d3a292286b8ab0e37d5c84583180600000000g/]a92d3a292286b8ab0e37d5c84583180600000000h/]a92d3a292286b8ab0e37d5c84583180600000000i/]a92d3a292286b8ab0e37d5c84583180600000000j/]a92d3a292286b8ab0e37d5c84583180600000000k/]a92d3a292286b8ab0e37d5c84583180600000000l/]a92d3a292286b8ab0e37d5c84583180600000000m/]a92d3a292286b8ab0e37d5c84583180600000000n/]a92d3a292286b8ab0e37d5c84583180600000000	o/]a92d3a292286b8ab0e37d5c84583180600000000
p/]a92d3a292286b8ab0e37d5c84583180600000000q/]a92d3a292286b8ab0e37d5c84583180600000000r/]a92d3a292286b8ab0e37d5c84583180600000000s/]a9310931a53380588cf72be5cb21e99500000000 ]/]a9310931a53380588cf72be5cb21e99500000000^/]a9310931a53380588cf72be5cb21e99500000000_/]a9310931a53380588cf72be5cb21e99500000000`/]a9310931a53380588cf72be5cb21e99500000000a/]a9310931a53380588cf72be5cb21e99500000000b/]a9310931a53380588cf72be5cb21e99500000000c/]a9310931a53380588cf72be5cb21e99500000000d/]a9310931a53380588cf72be5cb21e99500000000e/]a94cae4fa3b34c805c9ee17f25a60ba900000000 S/]a94cae4fa3b34c805c9ee17f25a60ba900000000T/]a94cae4fa3b34c805c9ee17f25a60ba900000000U/]a94cae4fa3b34c805c9ee17f25a60ba900000000V/]a94cae4fa3b34c805c9ee17f25a60ba900000000W/]a94cae4fa3b34c805c9ee17f25a60ba900000000X/]a94cae4fa3b34c805c9ee17f25a60ba900000000Y/]a94cae4fa3b34c805c9ee17f25a60ba900000000Z/]a94cae4fa3b34c805c9ee17f25a60ba900000000[/]a94cae4fa3b34c805c9ee17f25a60ba900000000	\/]a9b575c7c474f6130edd011ffea60f7700000000 I/]a9b575c7c474f6130edd011ffea60f7700000000J/]a9b575c7c474f6130edd011ffea60f7700000000K/]a9b575c7c474f6130edd011ffea60f7700000000L/]a9b575c7c474f6130edd011ffea60f7700000000M/]a9b575c7c474f6130edd011ffea60f7700000000N/]a9b575c7c474f6130edd011ffea60f7700000000O/]a9b575c7c474f6130edd011ffea60f7700000000P/]a9b575c7c474f6130edd011ffea60f7700000000Q/]a9b575c7c474f6130edd011ffea60f7700000000	R/]a5c21458e7b9c7037afb7abe3bf2713200000000/]a5c21458e7b9c7037afb7abe3bf2713200000000/]a1d9801a409be17e6a78a6282a658a1b00000000(/]a5c21458e7b9c7037afb7abe3bf2713200000000/]a1d9801a409be17e6a78a6282a658a1b00000000'/]a1d9801a409be17e6a78a6282a658a1b00000000&/]a57514eef7bb60d7742795a04287580600000000/]a57514eef7bb60d7742795a04287580600000000/]c5d788dacd289dfb7270a6e0ff67abed00000000µ/]c5d788dacd289dfb7270a6e0ff67abed00000000´/]c5d788dacd289dfb7270a6e0ff67abed00000000 ³/]c73b718688fc0fab90ba5d3530546eb800000000²/]c73b718688fc0fab90ba5d3530546eb800000000±/]c73b718688fc0fab90ba5d3530546eb800000000°/]c73b718688fc0fab90ba5d3530546eb800000000¯/]c73b718688fc0fab90ba5d3530546eb800000000®/]c73b718688fc0fab90ba5d3530546eb800000000­/]c73b718688fc0fab90ba5d3530546eb800000000¬/]c73b718688fc0fab90ba5d3530546eb800000000«/]c73b718688fc0fab90ba5d3530546eb800000000 ª/]b7e5db408310ea00a46916f2bf55a5c300000000Â/]b7e5db408310ea00a46916f2bf55a5c300000000Á/]b7e5db408310ea00a46916f2bf55a5c300000000À/]b7e5db408310ea00a46916f2bf55a5c300000000¿/]b7e5db408310ea00a46916f2bf55a5c300000000¾/]b7e5db408310ea00a46916f2bf55a5c300000000 ½/]c5d788dacd289dfb7270a6e0ff67abed00000000º/]c5d788dacd289dfb7270a6e0ff67abed00000000¹/]c5d788dacd289dfb7270a6e0ff67abed00000000¸/]c5d788dacd289dfb7270a6e0ff67abed00000000·/]c5d788dacd289dfb7270a6e0ff67abed00000000¶/]ab38c55ead220e8c1e61aa6a536efd5700000000 /]ab38c55ead220e8c1e61aa6a536efd5700000000/]ab38c55ead220e8c1e61aa6a536efd5700000000/]ab38c55ead220e8c1e61aa6a536efd5700000000/]ab38c55ead220e8c1e61aa6a536efd5700000000/]ab38c55ead220e8c1e61aa6a536efd5700000000/]ab38c55ead220e8c1e61aa6a536efd5700000000/]ab38c55ead220e8c1e61aa6a536efd5700000000/]ab38c55ead220e8c1e61aa6a536efd5700000000/]ab38c55ead220e8c1e61aa6a536efd5700000000	 /]ab38c55ead220e8c1e61aa6a536efd5700000000
!/]ab38c55ead220e8c1e61aa6a536efd5700000000"/]ab38c55ead220e8c1e61aa6a536efd5700000000#/]ab38c55ead220e8c1e61aa6a536efd5700000000$/]ab38c55ead220e8c1e61aa6a536efd5700000000%/]ab38c55ead220e8c1e61aa6a536efd5700000000&/]ab38c55ead220e8c1e61aa6a536efd5700000000'/]ab38c55ead220e8c1e61aa6a536efd5700000000(/]ab38c55ead220e8c1e61aa6a536efd5700000000)/]ab38c55ead220e8c1e61aa6a536efd5700000000*/]ab38c55ead220e8c1e61aa6a536efd5700000000+/]ab38c55ead220e8c1e61aa6a536efd5700000000,/]ab38c55ead220e8c1e61aa6a536efd5700000000-/]ab38c55ead220e8c1e61aa6a536efd5700000000./]ab38c55ead220e8c1e61aa6a536efd5700000000//]ab38c55ead220e8c1e61aa6a536efd57000000000/]acf38284bec7304f83f1592d20f34fa100000000 
Ã/]acf38284bec7304f83f1592d20f34fa100000000
Á/]acf38284bec7304f83f1592d20f34fa100000000
Â/]acf38284bec7304f83f1592d20f34fa100000000
Ä/]acf38284bec7304f83f1592d20f34fa100000000
Å/]acf38284bec7304f83f1592d20f34fa100000000
Æ/]acf38284bec7304f83f1592d20f34fa100000000
Ç/]acf38284bec7304f83f1592d20f34fa100000000
È/]acf38284bec7304f83f1592d20f34fa100000000
É/]acf38284bec7304f83f1592d20f34fa100000000	
Ê/]acf38284bec7304f83f1592d20f34fa100000000

Ë/]acf38284bec7304f83f1592d20f34fa100000000
Ì/]acf38284bec7304f83f1592d20f34fa100000000
Í/]acf38284bec7304f83f1592d20f34fa100000000
Î/]acf38284bec7304f83f1592d20f34fa100000000
Ï/]acf38284bec7304f83f1592d20f34fa100000000
Ğ/]acf38284bec7304f83f1592d20f34fa100000000
Ñ/]acf38284bec7304f83f1592d20f34fa100000000
Ò/]acf38284bec7304f83f1592d20f34fa100000000
Ó/]acf38284bec7304f83f1592d20f34fa100000000
Ô/]ba04b9831542ea25e8292640c9fee63900000000 Í/]ba04b9831542ea25e8292640c9fee63900000000Î/]ba04b9831542ea25e8292640c9fee63900000000Ï/]ba04b9831542ea25e8292640c9fee63900000000Ğ/]ba04b9831542ea25e8292640c9fee63900000000Ñ/]c032e8788c68bb6e3837195185f2376b00000000 ÷/]c032e8788c68bb6e3837195185f2376b00000000ø/]c032e8788c68bb6e3837195185f2376b00000000ù/]c032e8788c68bb6e3837195185f2376b00000000ú/]c032e8788c68bb6e3837195185f2376b00000000û/]c032e8788c68bb6e3837195185f2376b00000000ü/]c032e8788c68bb6e3837195185f2376b00000000ı/]c032e8788c68bb6e3837195185f2376b00000000ş/]c032e8788c68bb6e3837195185f2376b00000000ÿ/]c032e8788c68bb6e3837195185f2376b00000000	 /]c032e8788c68bb6e3837195185f2376b00000000
/]c032e8788c68bb6e3837195185f2376b00000000/]c032e8788c68bb6e3837195185f2376b00000000/]c032e8788c68bb6e3837195185f2376b00000000/]c044095c4cf560278c0732e63c6af7a200000000 é/]c044095c4cf560278c0732e63c6af7a200000000ê/]c044095c4cf560278c0732e63c6af7a200000000ë/]c044095c4cf560278c0732e63c6af7a200000000ì/]c044095c4cf560278c0732e63c6af7a200000000í/]c044095c4cf560278c0732e63c6af7a200000000î/]c044095c4cf560278c0732e63c6af7a200000000ï/]c044095c4cf560278c0732e63c6af7a200000000ğ/]c044095c4cf560278c0732e63c6af7a200000000ñ/]c044095c4cf560278c0732e63c6af7a200000000	ò/]c044095c4cf560278c0732e63c6af7a200000000
ó/]c044095c4cf560278c0732e63c6af7a200000000ô/]c044095c4cf560278c0732e63c6af7a200000000õ/]c044095c4cf560278c0732e63c6af7a200000000ö/]c0f14ffa1b25c61d0bb767f9f55df19700000000 ¡/]c0f14ffa1b25c61d0bb767f9f55df19700000000¢/]c0f14ffa1b25c61d0bb767f9f55df19700000000£/]c0f14ffa1b25c61d0bb767f9f55df19700000000¤/]c0f14ffa1b25c61d0bb767f9f55df19700000000¥/]c0f14ffa1b25c61d0bb767f9f55df19700000000¦/]c0f14ffa1b25c61d0bb767f9f55df19700000000§/]c0f14ffa1b25c61d0bb767f9f55df19700000000¨/]c0f14ffa1b25c61d0bb767f9f55df19700000000©/]c0f14ffa1b25c61d0bb767f9f55df19700000000	ª/]c0f14ffa1b25c61d0bb767f9f55df19700000000
«/]c0f14ffa1b25c61d0bb767f9f55df19700000000¬/]c0f14ffa1b25c61d0bb767f9f55df19700000000­/]c0f14ffa1b25c61d0bb767f9f55df19700000000®/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000 W/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000X/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000[/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000Z/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000Y/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000\/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000]/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000^/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000_/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000	`/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000
a/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000b/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000c/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000d/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000e/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000f/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000g/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000h/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000i/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000j/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000k/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000l/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000n/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000m/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000o/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000p/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000q/]cd5f42528b2dfd52f079d4d7fb8df36c00000000 ’/]cd5f42528b2dfd52f079d4d7fb8df36c00000000“/]cd5f42528b2dfd52f079d4d7fb8df36c00000000”/]cd5f42528b2dfd52f079d4d7fb8df36c00000000–/]cd5f42528b2dfd52f079d4d7fb8df36c00000000•/]cd5f42528b2dfd52f079d4d7fb8df36c00000000—/]cd5f42528b2dfd52f079d4d7fb8df36c00000000˜/]cd5f42528b2dfd52f079d4d7fb8df36c00000000™/]cd5f42528b2dfd52f079d4d7fb8df36c00000000š/]cd5f42528b2dfd52f079d4d7fb8df36c00000000	›/]cd5f42528b2dfd52f079d4d7fb8df36c00000000
œ/]cd5f42528b2dfd52f079d4d7fb8df36c00000000/]cd5f42528b2dfd52f079d4d7fb8df36c00000000/]cd5f42528b2dfd52f079d4d7fb8df36c00000000Ÿ/]ce08d4f931416b98c72de4511dd96cae00000000 {/]ce08d4f931416b98c72de4511dd96cae00000000|/]ce08d4f931416b98c72de4511dd96cae00000000}/]ce08d4f931416b98c72de4511dd96cae00000000~/]ce08d4f931416b98c72de4511dd96cae00000000/]ce08d4f931416b98c72de4511dd96cae00000000€/]ce08d4f931416b98c72de4511dd96cae00000000/]ce08d4f931416b98c72de4511dd96cae00000000‚/]ce08d4f931416b98c72de4511dd96cae00000000ƒ/]ce08d4f931416b98c72de4511dd96cae00000000	„/]ce08d4f931416b98c72de4511dd96cae00000000
…/]ce08d4f931416b98c72de4511dd96cae00000000†/]ce08d4f931416b98c72de4511dd96cae00000000‡/]ce08d4f931416b98c72de4511dd96cae00000000ˆ/]ce08d4f931416b98c72de4511dd96cae00000000‰/]ce08d4f931416b98c72de4511dd96cae00000000Š/]ce08d4f931416b98c72de4511dd96cae00000000‹/]ce08d4f931416b98c72de4511dd96cae00000000Œ/]ce08d4f931416b98c72de4511dd96cae00000000/]ce08d4f931416b98c72de4511dd96cae00000000/]ce08d4f931416b98c72de4511dd96cae00000000/]ce08d4f931416b98c72de4511dd96cae00000000‘/]ce08d4f931416b98c72de4511dd96cae00000000/]b24f2f5612e5805bd47a3644493c6f3400000000Ğ/]b24f2f5612e5805bd47a3644493c6f3400000000Ï/]b24f2f5612e5805bd47a3644493c6f3400000000 Î/]b60494104aecdb448cf782ca98448e0d00000000Í/]b60494104aecdb448cf782ca98448e0d00000000Ì/]b60494104aecdb448cf782ca98448e0d00000000Ë/]b60494104aecdb448cf782ca98448e0d00000000Ê/]b60494104aecdb448cf782ca98448e0d00000000É/]b60494104aecdb448cf782ca98448e0d00000000È/]b60494104aecdb448cf782ca98448e0d00000000 Ç/]b7e5db408310ea00a46916f2bf55a5c300000000	Æ/]b7e5db408310ea00a46916f2bf55a5c300000000Å/]b7e5db408310ea00a46916f2bf55a5c300000000Ä/]b7e5db408310ea00a46916f2bf55a5c300000000Ã/]b1fa4d66bb99c1a8723596dfbe575b0200000000Ş/]b1fa4d66bb99c1a8723596dfbe575b0200000000İ/]b1fa4d66bb99c1a8723596dfbe575b0200000000 Ü/]b24f2f5612e5805bd47a3644493c6f3400000000Û/]b24f2f5612e5805bd47a3644493c6f3400000000Ú/]b24f2f5612e5805bd47a3644493c6f3400000000Ù/]b24f2f5612e5805bd47a3644493c6f3400000000
Ø/]b24f2f5612e5805bd47a3644493c6f3400000000	×/]b24f2f5612e5805bd47a3644493c6f3400000000Ö/]b24f2f5612e5805bd47a3644493c6f3400000000Õ/]b24f2f5612e5805bd47a3644493c6f3400000000Ô/]b24f2f5612e5805bd47a3644493c6f3400000000Ó/]b24f2f5612e5805bd47a3644493c6f3400000000Ò/]b24f2f5612e5805bd47a3644493c6f3400000000Ñ/]b1fa4d66bb99c1a8723596dfbe575b0200000000ß/]d73af698f5aôöÿ÷ğò¢ñ¢õğ¥òôò÷¥şğôòööööööööÆ×éÂ›ÇÄ¢ñõ§ ğÿş ó§ôöÿ÷ğò¢ñ¢õğ¥òôò÷¥şğôòööööööööÇ×éÂ›ÇÄ¢ñõ§ ğÿş ó§ôöÿ÷ğò¢ñ¢õğ¥òôò÷¥şğôòööööööööÄ×éÂ›ÇÄ¢ñõ§ ğÿş ó§ôöÿ÷ğò¢ñ¢õğ¥òôò÷¥şğôòööööööööÅ×éÂ›ÇÄ¢ñõ§ ğÿş ó§ôöÿ÷ğò¢ñ¢õğ¥òôò÷¥şğôòööööööööÂ×éÂ›ÇÄ¢ñõ§ ğÿş ó§ôöÿ÷ğò¢ñ¢õğ¥òôò÷¥şğôòööööööööÃ×éÂ›ÇÄ¢ñõ§ ğÿş ó§ôöÿ÷ğò¢ñ¢õğ¥òôò÷¥şğôòööööööööÀ×éÂ›ÇÄ¢ñõ§ ğÿş ó§ôöÿ÷ğò¢ñ¢õğ¥òôò÷¥şğôòööööööööÁ×éÂ›ÇÄ¢ñõ§ ğÿş ó§ôöÿ÷ğò¢ñ¢õğ¥òôò÷¥şğôòööööööööÎ×éÂ›ÇÄ¢ñõ§ ğÿş ó§ôöÿ÷ğò¢ñ¢õğ¥òôò÷¥şğôòööööööööÏ×éÂ›ÇÄ¢ñõ§ ğÿş ó§ôöÿ÷ğò¢ñ¢õğ¥òôò÷¥şğôòööööööööÌ×<õê7 2PÏÅÅÇ÷ÓeÅç…çµçeçæÅæõæ¥æUææ5áåá•áEáuá%àÕà…àµàeàãÅãõã¥ãUãã5âåâ•âEâuâ%íÕí…íµíeíìÅìõì¥ìUìì5ïåï•ïEïuï%îÕî…îµîeîéÅéõé¥éUéé5èåè•èEèuè%ëÕë…ëµëeëêÅêõê¥êUêê5õåõ•õEõuõ%ôÕô…ôµôeô÷Å÷õ÷¥÷U÷÷5öåö•öEöuö%ñÕñ…ñµñeñğÅğõğ¥ğUğğ5óåó•óEóuó%òÕò…òµòeòıÅıõı¥ıUıı5üåü•üEüuü%ÿÕÿ…ÿµÿeÿşÅşõş¥şUşş5ùåù•ùEùuù%øÕø…øµøeøûÅûõû¥ûUûû5úåú•úEúuú%…Õ………µ…e…„Å„õ„¥„U„„5‡å‡•‡E‡uÒ¥ÒõÒÅÓÓe“õ“Åe‡%†Õ†…†µ†e†Åõ¥Uß¥ßõßUÜÜeßÅÜµÜ…ÜÕİ%İuİEİ•İåÒ5ÒÒU5€å€•€E€u€%ƒÕƒ…“U“¥Şåß5ßÙ…ÙÕŞ%ŞEŞuµ…Ş•Û%ÛuÛEÛåÛ•ØØUØ5ØõØÅØ¥ÙeÙµÙä•äåå5åUåå` 0  Ğ p@FpF FĞG G0G`GGÀGğH HPH€H°HàII@IpI IĞJ J0J`JJÀJğK KPK€K°KàLL@LpL LĞM M0M`MMÀMğN NPN€N°NàOO@OpO OĞP P0P`PPÀPğQ QPQ€Q°QàRR@RpR RĞS S0S`SSÀSğT TPT€T°TàU[[@[p[ [Ğ\ \0\`\\À\ğ] ]P]€]°]à^^@^p^ ^Ğ_ _0_`__À_ğ` `P`€`°`àaa@apa aĞb b0b`bbÀbğc cPc€{€{P{ "}À!à!°!€xàx°x€}`}} |Ğ}0| |p|@|{à{°z0z yĞypy y@yYğYÀYY0Y`zğzÀY zz`c°càdd@dpd dĞe e0e`eeÀeğf fPf€f°fàgg@gpg gĞh h0h`hhÀhği iPi€i°iàjj@jpj jĞk k0k`kkÀkğl lPW VğVÀZàZ°Z€ZPZ XĞX XpX@XWàW°W€WPl€l°làmm@mpm mĞn n0n`nnÀnğo oPo€o°oàpp@ppp pĞq q0q`qqÀqğr rPr€r°ràss@sps sĞt t0t`ttÀtğu uPu€u°uàvv@vpv vĞw w0w`wwÀwğx xP}ğ~ ~P~€~°~à@p Ğ{R{‚{²{â|p| |Ğ} }0}`}}À}ğ~ ~P~€~°~à@p                                                                     ĞĞĞ                 ğ9bd7ff179f9ae2f8f21b40ba2da5fea400000000Æ/]9d8b7a1746a5dcaaf4e5b794a4aba5b100000000/]9d8b7a1746a5dcaaf4e5b794a4aba5b100000000/]9d8b7a1746a5dcaaf4e5b794a4aba5b100000000/]9d8b7a1746a5dcaaf4e5b794a4aba5b100000000/]9bf9fb5e7bc76c2549d279921f20d40700000000 Á/]9bf9fb5e7bc76c2549d279921f20d40700000000À/]9bf9fb5e7bc76c2549d279921f20d40700000000¿/]9bf9fb5e7bc76c2549d279921f20d40700000000¾/]9bf9fb5e7bc76c2549d279921f20d40700000000½/]9bf9fb5e7bc76c2549d279921f20d40700000000¼/]9bf9fb5e7bc76c2549d279921f20d40700000000»/]9bf9fb5e7bc76c2549d279921f20d40700000000º/]9bf9fb5e7bc76c2549d279921f20d40700000000¹/]9bf9fb5e7bc76c2549d279921f20d40700000000¸/]9bf9fb5e7bc76c2549d279921f20d40700000000·/]9bf9fb5e7bc76c2549d279921f20d40700000000¶/]9bf9fb5e7bc76c2549d279921f20d40700000000µ/]9bf9fb5e7bc76c2549d279921f20d40700000000´/]9bf9fb5e7bc76c2549d279921f20d40700000000³/]9bf9fb5e7bc76c2549d279921f20d40700000000²/]9bf9fb5e7bc76c2549d279921f20d40700000000±/]9bf9fb5e7bc76c2549d279921f20d40700000000°/]9bf9fb5e7bc76c2549d279921f20d40700000000¯/]9bf9fb5e7bc76c2549d279921f20d40700000000®/]9bf9fb5e7bc76c2549d279921f20d40700000000­/]9bf9fb5e7bc76c2549d279921f20d40700000000¬/]9bf9fb5e7bc76c2549d279921f20d40700000000
«/]9bf9fb5e7bc76c2549d279921f20d40700000000	ª/]9bf9fb5e7bc76c2549d279921f20d40700000000©/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000Œ/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000‹/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000Š/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000
‰/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000	ˆ/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000‡/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000†/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000…/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000„/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000ƒ/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000‚/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000€/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000 D@9e0bcaed3eaa28e6664dbaa31920c5d200000000[ `9e0bcaed3eaa28e6664dbaa3192ach(['PUT', 'POST', 'PATCH'], function(method) {
      $httpBackend[prefix + method] = function(url, data, headers) {
        return $httpBackend[prefix](method, url, data, headers);
      };
    });
  }
}

function MockHttpExpectation(method, url, data, headers) {

  this.data = data;
  this.headers = headers;

  this.match = function(m, u, d, h) {
    if (method != m) return false;
    if (!this.matchUrl(u)) return false;
    if (angular.isDefined(d) && !this.matchData(d)) return false;
    if (angular.isDefined(h) && !this.matchHeaders(h)) return false;
    return true;
  };

  this.matchUrl = function(u) {
    if (!url) return true;
    if (angular.isFunction(url.test)) return url.test(u);
    if (angular.isFunction(url)) return url(u);
    return url == u;
  };

  this.matchHeaders = function(h) {
    if (angular.isUndefined(headers)) return true;
    if (angular.isFunction(headers)) return headers(h);
    return angular.equals(headers, h);
  };

  this.matchData = function(d) {
    if (angular.isUndefined(data)) return true;
    if (data && angular.isFunction(data.test)) return data.test(d);
    if (data && angular.isFunction(data)) return data(d);
    if (data && !angular.isString(data)) return angular.equals(data, angular.fromJson(d));
    return data == d;
  };

  this.toString = function() {
    return method + ' ' + url;
  };
}

function createMockXhr() {
  return new MockXhr();
}

function MockXhr() {

  // hack for testing $http, $httpBackend
  MockXhr.$$lastInstance = this;

  this.open = function(method, url, async) {
    this.$$method = method;
    this.$$url = url;
    this.$$async = async;
    this.$$reqHeaders = {};
    this.$$respHeaders = {};
  };

  this.send = function(data) {
    this.$$data = data;
  };

  this.setRequestHeader = function(key, value) {
    this.$$reqHeaders[key] = value;
  };

  this.getResponseHeader = function(name) {
    // the lookup must be case insensitive,
    // that's why we try two quick lookups first and full scan last
    var header = this.$$respHeaders[name];
    if (header) return header;

    name = angular.lowercase(name);
    header = this.$$respHeaders[name];
    if (header) return header;

    header = undefined;
    angular.forEach(this.$$respHeaders, function(headerVal, headerName) {
      if (!header && angular.lowercase(headerName) == name) header = headerVal;
    });
    return header;
  };

  this.getAllResponseHeaders = function() {
    var lines = [];

    angular.forEach(this.$$respHeaders, function(value, key) {
      lines.push(key + ': ' + value);
    });
    return lines.join('\n');
  };

  this.abort = angular.noop;
}


/**
 * @ngdoc service
 * @name $timeout
 * @description
 *
 * This service is just a simple decorator for {@link ng.$timeout $timeout} service
 * that adds a "flush" and "verifyNoPendingTasks" methods.
 */

angular.mock.$TimeoutDecorator = ['$delegate', '$browser', function ($delegate, $browser) {

  /**
   * @ngdoc method
   * @name $timeout#flush
   * @description
   *
   * Flushes the queue of pending tasks.
   *
   * @param {number=} delay maximum timeout amount to flush up until
   */
  $delegate.flush = function(delay) {
    $browser.defer.flush(delay);
  };

  /**
   * @ngdoc method
   * @name $timeout#verifyNoPendingTasks
   * @description
   *
   * Verifies that there are no pending tasks that need to be flushed.
   */
  $delegate.verifyNoPendingTasks = function() {
    if ($browser.deferredFns.length) {
      throw new Error('Deferred tasks to flush (' + $browser.deferredFns.length + '): ' +
          formatPendingTasksAsString($browser.deferredFns));
    }
  };

  function formatPendingTasksAsString(tasks) {
    var result = [];
    angular.forEach(tasks, function(task) {
      result.push('{id: ' + task.id + ', ' + 'time: ' + task.time + '}');
    });

    return result.join(', ');
  }

  return $delegate;
}];

angular.mock.$RAFDecorator = ['$delegate', function($delegate) {
  var queue = [];
  var rafFn = function(fn) {
    var index = queue.length;
    queue.push(fn);
    return function() {
      queue.splice(index, 1);
    };
  };

  rafFn.supported = $delegate.supported;

  rafFn.flush = function() {
    if(queue.length === 0) {
      throw new Error('No rAF callbacks present');
    }

    var length = queue.length;
    for(var i=0;i<length;i++) {
      queue[i]();
    }

    queue = [];
  };

  return rafFn;
}];

angular.mock.$AsyncCallbackDecorator = ['$delegate', function($delegate) {
  var callbacks = [];
  var addFn = function(fn) {
    callbacks.push(fn);
  };
  addFn.flush = function() {
    angular.forEach(callbacks, function(fn) {
      fn();
    });
    callbacks = [];
  };
  return addFn;
}];

/**
 *
 */
angular.mock.$RootElementProvider = function() {
  this.$get = function() {
    return angular.element('<div ng-app></div>');
  };
};

/**
 * @ngdoc module
 * @name ngMock
 * @description
 *
 * # ngMock
 *
 * The `ngMock` module provides support to inject and mock Angular services into unit tests.
 * In addition, ngMock also extends various core ng services such that they can be
 * inspected and controlled in a synchronous manner within test code.
 *
 *
 * <div doc-module-components="ngMock"></div>
 *
 */
angular.module('ngMock', ['ng']).provider({
  $browser: angular.mock.$BrowserProvider,
  $exceptionHandler: angular.mock.$ExceptionHandlerProvider,
  $log: angular.mock.$LogProvider,
  $interval: angular.mock.$IntervalProvider,
  $httpBackend: angular.mock.$HttpBackendProvider,
  $rootElement: angular.mock.$RootElementProvider
}).config(['$provide', function($provide) {
  $provide.decorator('$timeout', angular.mock.$TimeoutDecorator);
  $provide.decorator('$$rAF', angular.mock.$RAFDecorator);
  $provide.decorator('$$asyncCallback', angular.mock.$AsyncCallbackDecorator);
}]);

/**
 * @ngdoc module
 * @name ngMockE2E
 * @module ngMockE2E
 * @description
 *
 * The `ngMockE2E` is an angular module which contains mocks suitable for end-to-end testing.
 * Currently there is only one mock present in this module -
 * the {@link ngMockE2E.$httpBackend e2e $httpBackend} mock.
 */
angular.module('ngMockE2E', ['ng']).config(['$provide', function($provide) {
  $provide.decorator('$httpBackend', angular.mock.e2e.$httpBackendDecorator);
}]);

/**
 * @ngdoc service
 * @name $httpBackend
 * @module ngMockE2E
 * @description
 * Fake HTTP backend implementation suitable for end-to-end testing or backend-less development of
 * applications that use the {@link ng.$http $http service}.
 *
 * *Note*: For fake http backend implementation suitable for unit testing please see
 * {@link ngMock.$httpBackend unit-testing $httpBackend mock}.
 *
 * This implementation can be used to respond with static or dynamic responses via the `when` api
 * and its shortcuts (`whenGET`, `whenPOST`, etc) and optionally pass through requests to the
 * real $httpBackend for specific requests (e.g. to interact with certain remote apis or to fetch
 * templates from a webserver).
 *
 * As opposed to unit-testing, in an end-to-end testing scenario or in scenario when an application
 * is being developed with the real backend api replaced with a mock, it is often desirable for
 * certain category of requests to bypass the mock and issue a real http request (e.g. to fetch
 * templates or static files from the webserver). To configure the backend with this behavior
 * use the `passThrough` request handler of `when` instead of `respond`.
 *
 * Additionally, we don't want to manually have to flush mocked out requests like we do during unit
 * testing. For this reason the e2e $httpBackend automatically flushes mocked out requests
 * automatically, closely simulating the behavior of the XMLHttpRequest object.
 *
 * To setup the application to run with this http backend, you have to create a module that depends
 * on the `ngMockE2E` and your application modules and defines the fake backend:
 *
 * ```js
 *   myAppDev = angular.module('myAppDev', ['myApp', 'ngMockE2E']);
 *   myAppDev.run(function($httpBackend) {
 *     phones = [{name: 'phone1'}, {name: 'phone2'}];
 *
 *     // returns the current list of phones
 *     $httpBackend.whenGET('/phones').respond(phones);
 *
 *     // adds a new phone to the phones array
 *     $httpBackend.whenPOST('/phones').respond(function(method, url, data) {
 *       var phone = angular.fromJson(data);
 *       phones.push(phone);
 *       return [200, phone, {}];
 *     });
 *     $httpBackend.whenGET(/^\/templates\//).passThrough();
 *     //...
 *   });
 * ```
 *
 * Afterwards, bootstrap your app with this new module.
 */

/**
 * @ngdoc method
 * @name $httpBackend#when
 * @module ngMockE2E
 * @description
 * Creates a new backend definition.
 *
 * @param {string} method HTTP method.
 * @param {string|RegExp|function(string)} url HTTP url or function that receives the url
 *   and returns true if the url match the current definition.
 * @param {(string|RegExp)=} data HTTP request body.
 * @param {(Object|function(Object))=} headers HTTP headers or function that receives http header
 *   object and returns true if the headers match the current definition.
 * @returns {requestHandler} Returns an object with `respond` and `passThrough` methods that
 *   control how a matched request is handled.
 *
 *  - respond â€“
 *    `{function([status,] data[, headers, statusText])
 *    | function(function(method, url, data, headers)}`
 *    â€“ The respond method takes a set of static data to be returned or a function that can return
 *    an array containing response status (number), response data (string), response headers
 *    (Object), and the text for the status (string).
 *  - passThrough â€“ `{function()}` â€“ Any request matching a backend definition with
 *    `passThrough` handler will be passed through to the real backend (an XHR request will be made
 *    to the server.)
 */

/**
 * @ngdoc method
 * @name $httpBackend#whenGET
 * @module ngMockE2E
 * @description
 * Creates a new backend definition for GET requests. For more info see `when()`.
 *
 * @param {string|RegExp|function(string)} url HTTP url or function that receives the url
 *   and returns true if the url match the current definition.
 * @param {(Object|function(Object))=} headers HTTP headers.
 * @returns {requestHandler} Returns an object with `respond` and `passThrough` methods that
 *   control how a matched request is handled.
 */

/**
 * @ngdoc method
 * @name $httpBackend#whenHEAD
 * @module ngMockE2E
 * @description
 * Creates a new backend definition for HEAD requests. For more info see `when()`.
 *
 * @param {string|RegExp|function(string)} url HTTP url or function that receives the url
 *   and returns true if the url match the current definition.
 * @param {(Object|function(Object))=} headers HTTP headers.
 * @returns {requestHandler} Returns an object with `respond` and `passThrough` methods that
 *   control how a matched request is handled.
 */

/**
 * @ngdoc method
 * @name $httpBackend#whenDELETE
 * @module ngMockE2E
 * @description
 * Creates a new backend definition for DELETE requests. For more info see `when()`.
 *
 * @param {string|RegExp|function(string)} url HTTP url or function that receives the url
 *   and returns true if the url match the current definition.
 * @param {(Object|function(Object))=} headers HTTP headers.
 * @returns {requestHandler} Returns an object with `respond` and `passThrough` methods that
 *   control how a matched request is handled.
 */

/**
 * @ngdoc method
 * @name $httpBackend#whenPOST
 * @module ngMockE2E
 * @description
 * Creates a new backend definition for POST requests. For more info see `when()`.
 *
 * @param {string|RegExp|function(string)} url HTTP url or function that receives the url
 *   and returns true if the url match the current definition.
 * @param {(string|RegExp)=} data HTTP request body.
 * @param {(Object|function(Object))=} headers HTTP headers.
 * @returns {requestHandler} Returns an object with `respond` and `passThrough` methods that
 *   control how a matched request is handled.
 */

/**
 * @ngdoc method
 * @name $httpBackend#whenPUT
 * @module ngMockE2E
 * @description
 * Creates a new backend definition for PUT requests.  For more info see `when()`.
 *
 * @param {string|RegExp|function(string)} url HTTP url or function that receives the url
 *   and returns true if the url match the current definition.
 * @param {(string|RegExp)=} data HTTP request body.
 * @param {(Object|function(Object))=} headers HTTP headers.
 * @returns {requestHandler} Returns an object with `respond` and `passThrough` methods that
 *   control how a matched request is handled.
 */

/**
 * @ngdoc method
 * @name $httpBackend#whenPATCH
 * @module ngMockE2E
 * @description
 * Creates a new backend definition for PATCH requests.  For more info see `when()`.
 *
 * @param {string|RegExp|function(string)} url HTTP url or function that receives the url
 *   and returns true if the url match the current definition.
 * @param {(string|RegExp)=} data HTTP request body.
 * @param {(Object|function(Object))=} headers HTTP headers.
 * @returns {requestHandler} Returns an object with `respond` and `passThrough` methods that
 *   control how a matched request is handled.
 */

/**
 * @ngdoc method
 * @name $httpBackend#whenJSONP
 * @module ngMockE2E
 * @description
 * Creates a new backend definition for JSONP requests. For more info see `when()`.
 *
 * @param {string|RegExp|function(string)} url HTTP url or function that receives the url
 *   and returns true if the url match the current definition.
 * @returns {requestHandler} Returns an object with `respond` and `passThrough` methods that
 *   control how a matched request is handled.
 */
angular.mock.e2e = {};
angular.mock.e2e.$httpBackendDecorator =
  ['$rootScope', '$delegate', '$browser', createHttpBackendMock];


angular.mock.clearDataCache = function() {
  var key,
      cache = angular.element.cache;

  for(key in cache) {
    if (Object.prototype.hasOwnProperty.call(cache,key)) {
      var handle = cache[key].handle;

      handle && angular.element(handle.elem).off();
      delete cache[key];
    }
  }
};


if(window.jasmine || window.mocha) {

  var currentSpec = null,
      isSpecRunning = function() {
        return !!currentSpec;
      };


  (window.beforeEach || window.setup)(function() {
    currentSpec = this;
  });

  (window.afterEach || window.teardown)(function() {
    var injector = currentSpec.$injector;

    angular.forEach(currentSpec.$modules, function(module) {
      if (module && module.$$hashKey) {
        module.$$hashKey = undefined;
      }
    });

    currentSpec.$injector = null;
    currentSpec.$modules = null;
    currentSpec = null;

    if (injector) {
      injector.get('$rootElement').off();
      injector.get('$browser').pollFns.length = 0;
    }

    angular.mock.clearDataCache();

    // clean up jquery's fragment cache
    angular.forEach(angular.element.fragments, function(val, key) {
      delete angular.element.fragments[key];
    });

    MockXhr.$$lastInstance = null;

    angular.forEach(angular.callbacks, function(val, key) {
      delete angular.callbacks[key];
    });
    angular.callbacks.counter = 0;
  });

  /**
   * @ngdoc function
   * @name angular.mock.module
   * @description
   *
   * *NOTE*: This function is also published on window for easy access.<br>
   *
   * This function registers a module configuration code. It collects the configuration information
   * which will be used when the injector is created by {@link angular.mock.inject inject}.
   *
   * See {@link angular.mock.inject inject} for usage example
   *
   * @param {...(string|Function|Object)} fns any number of modules which are represented as string
   *        aliases or as anonymous module initialization functions. The modules are used to
   *        configure the injector. The 'ng' and 'ngMock' modules are automatically loaded. If an
   *        object literal is passed they will be registered as values in the module, the key being
   *        the module name and the value being what is returned.
   */
  window.module = angular.mock.module = function() {
    var moduleFns = Array.prototype.slice.call(arguments, 0);
    return isSpecRunning() ? workFn() : workFn;
    /////////////////////
    function workFn() {
      if (currentSpec.$injector) {
        throw new Error('Injector already created, can not register a module!');
      } else {
        var modules = currentSpec.$modules || (currentSpec.$modules = []);
        angular.forEach(moduleFns, function(module) {
          if (angular.isObject(module) && !angular.isArray(module)) {
            modules.push(function($provide) {
              angular.forEach(module, function(value, key) {
                $provide.value(key, value);
              });
            });
          } else {
            modules.push(module);
          }
        });
      }
    }
  };

  /**
   * @ngdoc function
   * @name angular.mock.inject
   * @description
   *
   * *NOTE*: This function is also published on window for easy access.<br>
   *
   * The inject function wraps a function into an injectable function. The inject() creates new
   * instance of {@link auto.$injector $injector} per test, which is then used for
   * resolving references.
   *
   *
   * ## Resolving References (Underscore Wrapping)
   * Often, we would like to inject a reference once, in a `beforeEach()` block and reuse this
   * in multiple `it()` clauses. To be able to do this we must assign the reference to a variable
   * that is declared in the scope of the `describe()` block. Since we would, most likely, want
   * the variable to have the same name of the reference we have a problem, since the parameter
   * to the `inject()` function would hide the outer variable.
   *
   * To help with this, the injected parameters can, optionally, be enclosed with underscores.
   * These are ignored by the injector when the reference name is resolved.
   *
   * For example, the parameter `_myService_` would be resolved as the reference `myService`.
   * Since it is available in the function body as _myService_, we can then assign it to a variable
   * defined in an outer scope.
   *
   * ```
   * // Defined out reference variable outside
   * var myService;
   *
   * // Wrap the parameter in underscores
   * beforeEach( inject( function(_myService_){
   *   myService = _myService_;
   * }));
   *
   * // Use myService in a series of tests.
   * it('makes use of myService', function() {
   *   myService.doStuff();
   * });
   *
   * ```
   *
   * See also {@link angular.mock.module angular.mock.module}
   *
   * ## Example
   * Example of what a typical jasmine tests looks like with the inject method.
   * ```js
   *
   *   angular.module('myApplicationModule', [])
   *       .value('mode', 'app')
   *       .value('version', 'v1.0.1');
   *
   *
   *   describe('MyApp', function() {
   *
   *     // You need to load modules that you want to test,
   *     // it loads only the "ng" module by default.
   *     beforeEach(module('myApplicationModule'));
   *
   *
   *     // inject() is used to inject arguments of all given functions
   *     it('should provide a version', inject(function(mode, version) {
   *       expect(version).toEqual('v1.0.1');
   *       expect(mode).toEqual('app');
   *     }));
   *
   *
   *     // The inject and module method can also be used inside of the it or beforeEach
   *     it('should override a version and test the new version is injected', function() {
   *       // module() takes functions or strings (module aliases)
   *       module(function($provide) {
   *         $provide.value('version', 'overridden'); // override version here
   *       });
   *
   *       inject(function(version) {
   *         expect(version).toEqual('overridden');
   *       });
   *     });
   *   });
   *
   * ```
   *
   * @param {...Function} fns any number of functions which will be injected using the injector.
   */



  var ErrorAddingDeclarationLocationStack = function(e, errorForStack) {
    this.message = e.message;
    this.name = e.name;
    if (e.line) this.line = e.line;
    if (e.sourceId) this.sourceId = e.sourceId;
    if (e.stack && errorForStack)
      this.stack = e.stack + '\n' + errorForStack.stack;
    if (e.stackArray) this.stackArray = e.stackArray;
  };
  ErrorAddingDeclarationLocationStack.prototype.toString = Error.prototype.toString;

  window.inject = angular.mock.inject = function() {
    var blockFns = Array.prototype.slice.call(arguments, 0);
    var errorForStack = new Error('Declaration Location');
    return isSpecRunning() ? workFn.call(currentSpec) : workFn;
    /////////////////////
    function workFn() {
      var modules = currentSpec.$modules || [];
      var strictDi = !!currentSpec.$injectorStrict;
      modules.unshift('ngMock');
      modules.unshift('ng');
      var injector = currentSpec.$injector;
      if (!injector) {
        if (strictDi) {
          // If strictDi is enabled, annotate the providerInjector blocks
          angular.forEach(modules, function(moduleFn) {
            if (typeof moduleFn === "function") {
              angular.injector.$$annotate(moduleFn);
            }
          });
        }
        injector = currentSpec.$injector = angular.injector(modules, strictDi);
        currentSpec.$injectorStrict = strictDi;
      }
      for(var i = 0, ii = blockFns.length; i < ii; i++) {
        if (currentSpec.$injectorStrict) {
          // If the injector is strict / strictDi, and the spec wants to inject using automatic
          // annotation, then annotate the function here.
          injector.annotate(blockFns[i]);
        }
        try {
          /* jshint -W040 *//* Jasmine explicitly provides a `this` object when calling functions */
          injector.invoke(blockFns[i] || angular.noop, this);
          /* jshint +W040 */
        } catch (e) {
          if (e.stack && errorForStack) {
            throw new ErrorAddingDeclarationLocationStack(e, errorForStack);
          }
          throw e;
        } finally {
          errorForStack = null;
        }
      }
    }
  };


  angular.mock.inject.strictDi = function(value) {
    value = arguments.length ? !!value : true;
    return isSpecRunning() ? workFn() : workFn;

    function workFn() {
      if (value !== currentSpec.$injectorStrict) {
        if (currentSpec.$injector) {
          throw new Error('Injector already created, can not modify strict annotations');
        } else {
          currentSpec.$injectorStrict = value;
        }
      }
    }
  };
}


})(window, window.angular);
