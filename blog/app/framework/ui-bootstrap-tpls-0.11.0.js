/*
 * angular-ui-bootstrap
 * http://angular-ui.github.io/bootstrap/

 * Version: 0.11.0 - 2014-05-01
 * License: MIT
 */
angular.module("ui.bootstrap", ["ui.bootstrap.tpls", "ui.bootstrap.transition","ui.bootstrap.collapse","ui.bootstrap.accordion","ui.bootstrap.alert","ui.bootstrap.bindHtml","ui.bootstrap.buttons","ui.bootstrap.carousel","ui.bootstrap.dateparser","ui.bootstrap.position","ui.bootstrap.datepicker","ui.bootstrap.dropdown","ui.bootstrap.modal","ui.bootstrap.pagination","ui.bootstrap.tooltip","ui.bootstrap.popover","ui.bootstrap.progressbar","ui.bootstrap.rating","ui.bootstrap.tabs","ui.bootstrap.timepicker","ui.bootstrap.typeahead"]);
angular.module("ui.bootstrap.tpls", ["template/accordion/accordion-group.html","template/accordion/accordion.html","template/alert/alert.html","template/carousel/carousel.html","template/carousel/slide.html","template/datepicker/datepicker.html","template/datepicker/day.html","template/datepicker/month.html","template/datepicker/popup.html","template/datepicker/year.html","template/modal/backdrop.html","template/modal/window.html","template/pagination/pager.html","template/pagination/pagination.html","template/tooltip/tooltip-html-unsafe-popup.html","template/tooltip/tooltip-popup.html","template/popover/popover.html","template/progressbar/bar.html","template/progressbar/progress.html","template/progressbar/progressbar.html","template/rating/rating.html","template/tabs/tab.html","template/tabs/tabset.html","template/timepicker/timepicker.html","template/typeahead/typeahead-match.html","template/typeahead/typeahead-popup.html"]);
angular.module('ui.bootstrap.transition', [])

/**
 * $transition service provides a consistent interface to trigger CSS 3 transitions and to be informed when they complete.
 * @param  {DOMElement} element  The DOMElement that will be animated.
 * @param  {string|object|function} trigger  The thing that will cause the transition to start:
 *   - As a string, it represents the css class to be added to the element.
 *   - As an object, it represents a hash of style attributes to be applied to the element.
 *   - As a function, it represents a function to be called that will cause the transition to occur.
 * @return {Promise}  A promise that is resolved when the transition finishes.
 */
.factory('$transition', ['$q', '$timeout', '$rootScope', function($q, $timeout, $rootScope) {

  var $transition = function(element, trigger, options) {
    options = options || {};
    var deferred = $q.defer();
    var endEventName = $transition[options.animation ? 'animationEndEventName' : 'transitionEndEventName'];

    var transitionEndHandler = function(event) {
      $rootScope.$apply(function() {
        element.unbind(endEventName, transitionEndHandler);
        deferred.resolve(element);
      });
    };

    if (endEventName) {
      element.bind(endEventName, transitionEndHandler);
    }

    // Wrap in a timeout to allow the browser time to update the DOM before the transition is to occur
    $timeout(function() {
      if ( angular.isString(trigger) ) {
        element.addClass(trigger);
      } else if ( angular.isFunction(trigger) ) {
        trigger(element);
      } else if ( angular.isObject(trigger) ) {
        element.css(trigger);
      }
      //If browser does not support transitions, instantly resolve
      if ( !endEventName ) {
        deferred.resolve(element);
      }
    });

    // Add our custom cancel function to the promise that is returned
    // We can call this if we are about to run a new transition, which we know will prevent this transition from ending,
    // i.e. it will therefore never raise a transitionEnd event for that transition
    deferred.promise.cancel = function() {
      if ( endEventName ) {
        element.unbind(endEventName, transitionEndHandler);
      }
      deferred.reject('Transition cancelled');
    };

    return deferred.promise;
  };

  // Work out the name of the transitionEnd event
  var transElement = document.createElement('trans');
  var transitionEndEventNames = {
    'WebkitTransition': 'webkitTransitionEnd',
    'MozTransition': 'transitionend',
    'OTransition': 'oTransitionEnd',
    'transition': 'transitionend'
  };
  var animationEndEventNames = {
    'WebkitTransition': 'webkitAnimationEnd',
    'MozTransition': 'animationend',
    'OTransition': 'oAnimationEnd',
    'transition': 'animationend'
  };
  function findEndEventName(endEventNames) {
    for (var name in endEventNames){
      if (transElement.style[name] !== undefined) {
        return endEventNames[name];
      }
    }
  }
  $transition.transitionEndEventName = findEndEventName(transitionEndEventNames);
  $transition.animationEndEventName = findEndEventName(animationEndEventNames);
  return $transition;
}]);

angular.module('ui.bootstrap.collapse', ['ui.bootstrap.transition'])

  .directive('collapse', ['$transition', function ($transition) {

    return {
      link: function (scope, element, attrs) {

        var initialAnimSkip = true;
        var currentTransition;

        function doTransition(change) {
          var newTransition = $transition(element, change);
          if (currentTransition) {
            currentTransition.cancel();
          }
          currentTransition = newTransition;
          newTransition.then(newTransitionDone, newTransitionDone);
          return newTransition;

          function newTransitionDone() {
            // Make sure it's this transition, otherwise, leave it alone.
            if (currentTransition === newTransition) {
              currentTransition = undefined;
            }
          }
        }

        function expand() {
          if (initialAnimSkip) {
            initialAnimSkip = false;
            expandDone();
          } else {
            element.removeClass('collapse').addClass('collapsing');
            doTransition({ height: element[0].scrollHeight + 'px' }).then(expandDone);
          }
        }

        function expandDone() {
          element.removeClass('collapsing');
          element.addClass('collapse in');
          element.css({height: 'auto'});
        }

        function collapse() {
          if (initialAnimSkip) {
            initialAnimSkip = false;
            collapseDone();
            element.css({height: 0});
          } else {
            // CSS transitions don't work with height: auto, so we have to manually change the height to a specific value
            element.css({ height: element[0].scrollHeight + 'px' });
            //trigger reflow so a browser realizes that height was updated from auto to a specific value
            var x = element[0].offsetWidth;

            element.removeClass('collapse in').addClass('collapsing');

            doTransition({ height: 0 }).then(collapseDone);
          }
        }

        function collapseDone() {
          element.removeClass('collapsing');
          element.addClass('collapse');
        }

        scope.$watch(attrs.collapse, function (shouldCollapse) {
          if (shouldCollapse) {
            collapse();
          } else {
            expand();
          }
        });
      }
    };
  }]);

angular.module('ui.bootstrap.accordion', ['ui.bootstrap.collapse'])

.constant('accordionConfig', {
  closeOthers: true
})

.controller('AccordionController', ['$scope', '$attrs', 'accordionConfig', function ($scope, $attrs, accordionConfig) {

  // This array keeps track of the accordion groups
  this.groups = [];

  // Ensure that all the groups in this accordion are closed, unless close-others explicitly says not to
  this.closeOthers = function(openGroup) {
    var closeOthers = angular.isDefined($attrs.closeOthers) ? $scope.$eval($attrs.closeOthers) : accordionConfig.closeOthers;
    if ( closeOthers ) {
      angular.forEach(this.groups, function (group) {
        if ( group !== openGroup ) {
          group.isOpen = false;
        }
      });
    }
  };

  // This is called from the accordion-group directive to add itself to the accordion
  this.addGroup = function(groupScope) {
    var that = this;
    this.groups.push(groupScope);

    groupScope.$on('$destroy', function (event) {
      that.removeGroup(groupScope);
    });
  };

  // This is called from the accordion-group directive when to remove itself
  this.removeGroup = function(group) {
    var index = this.groups.indexOf(group);
    if ( index !== -1 ) {
      this.groups.splice(index, 1);
    }
  };

}])

// The accordion directive simply sets up the directive controller
// and adds an accordion CSS class to itself element.
.directive('accordion', function () {
  return {
    restrict:'EA',
    controller:'AccordionController',
    transclude: true,
    replace: false,
    templateUrl: 'template/accordion/accordion.html'
  };
})

// The accordion-group directive indicates a block of html that will expand and collapse in an accordion
.directive('accordionGroup', function() {
  return {
    require:'^accordion',         // We need this directive to be inside an accordion
    restrict:'EA',
    transclude:true,              // It transcludes the contents of the directive into the template
    replace: true,                // The element containing the directive will be replaced with the template
    templateUrl:'template/accordion/accordion-group.html',
    scope: {
      heading: '@',               // Interpolate the heading attribute onto this scope
      isOpen: '=?',
      isDisabled: '=?'
    },
    controller: function() {
      this.setHeading = function(element) {
        this.heading = element;
      };
    },
    link: function(scope, element, attrs, accordionCtrl) {
      accordionCtrl.addGroup(scope);

      scope.$watch('isOpen', function(value) {
        if ( value ) {
          accordionCtrl.closeOthers(scope);
        }
      });

      scope.toggleOpen = function() {
        if ( !scope.isDisabled ) {
          scope.isOpen = !scope.isOpen;
        }
      };
    }
  };
})

// Use accordion-heading below an accordion-group to provide a heading containing HTML
// <accordion-group>
//   <accordion-heading>Heading containing HTML - <img src="..."></accordion-heading>
// </accordion-group>
.directive('accordionHeading', function() {
  return {
    restrict: 'EA',
    transclude: true,   // Grab the contents to be used as the heading
    template: '',       // In effect remove this element!
    replace: true,
    require: '^accordionGroup',
    link: function(scope, element, attr, accordionGroupCtrl, transclude) {
      // Pass the heading to the accordion-group controller
      // so that it can be transcluded into the right place in the template
      // [The second parameter to transclude causes the elements to be cloned so that they work in ng-repeat]
      accordionGroupCtrl.setHeading(transclude(scope, function() {}));
    }
  };
})

// Use in the accordion-group template to indicate where you want the heading to be transcluded
// You must provide the property on the accordion-group controller that will hold the transcluded element
// <div class="accordion-group">
//   <div class="accordion-heading" ><a ... accordion-transclude="heading">...</a></div>
//   ...
// </div>
.directive('accordionTransclude', function() {
  return {
    require: '^accordionGroup',
    link: function(scope, element, attr, controller) {
      scope.$watch(function() { return controller[attr.accordionTransclude]; }, function(heading) {
        if ( heading ) {
          element.html('');
          element.append(heading);
        }
      });
    }
  };
});

angular.module('ui.bootstrap.alert', [])

.controller('AlertController', ['$scope', '$attrs', function ($scope, $attrs) {
  $scope.closeable = 'close' in $attrs;
}])

.directive('alert', function () {
  return {
    restrict:'EA',
    controller:'AlertController',
    templateUrl:'template/alert/alert.html',
    transclude:true,
    replace:true,
    scope: {
      type: '@',
      close: '&'
    }
  };
});

angular.module('ui.bootstrap.bindHtml', [])

  .directive('bindHtmlUnsafe', function () {
    return function (scope, element, attr) {
      element.addClass('ng-binding').data('$binding', attr.bindHtmlUnsafe);
      scope.$watch(attr.bindHtmlUnsafe, function bindHtmlUnsafeWatchAction(value) {
        element.html(value || '');
      });
    };
  });
angular.module('ui.bootstrap.buttons', [])

.constant('buttonConfig', {
  activeClass: 'active',
  toggleEvent: 'click'
})

.controller('ButtonsController', ['buttonConfig', function(buttonConfig) {
  this.activeClass = buttonConfig.activeClass || 'active';
  this.toggleEvent = buttonConfig.toggleEvent || 'click';
}])

.directive('btnRadio', function () {
  return {
    require: ['btnRadio', 'ngModel'],
    controller: 'ButtonsController',
    link: function (scope, element, attrs, ctrls) {
      var buttonsCtrl = ctrls[0], ngModelCtrl = ctrls[1];

      //model -> UI
      ngModelCtrl.$render = function () {
        element.toggleClass(buttonsCtrl.activeClass, angular.equals(ngModelCtrl.$modelValue, scope.$eval(attrs.btnRadio)));
      };

      //ui->model
      element.bind(buttonsCtrl.toggleEvent, function () {
        var isActive = element.hasClass(buttonsCtrl.activeClass);

        if (!isActive || angular.isDefined(attrs.uncheckable)) {
          scope.$apply(function () {
            ngModelCtrl.$setViewValue(isActive ? null : scope.$eval(attrs.btnRadio));
            ngModelCtrl.$render();
          });
        }
      });
    }
  };
})

.directive('btnCheckbox', function () {
  return {
    require: ['btnCheckbox', 'ngModel'],
    controller: 'ButtonsController',
    link: function (scope, element, attrs, ctrls) {
      var buttonsCtrl = ctrls[0], ngModelCtrl = ctrls[1];

      function getTrueValue() {
        return getCheckboxValue(attrs.btnCheckboxTrue, true);
      }

      function getFalseValue() {
        return getCheckboxValue(attrs.btnCheckboxFalse, false);
      }

      function getCheckboxValue(attributeValue, defaultValue) {
        var val = scope.$eval(attributeValue);
        return angular.isDefined(val) ? val : defaultValue;
      }

      //model -> UI
      ngModelCtrl.$render = function () {
        element.toggleClass(buttonsCtrl.activeClass, angular.equals(ngModelCtrl.$modelValue, getTrueValue()));
      };

      //ui->model
      element.bind(buttonsCtrl.toggleEvent, function () {
        scope.$apply(function () {
          ngModelCtrl.$setViewValue(element.hasClass(buttonsCtrl.activeClass) ? getFalseValue() : getTrueValue());
          ngModelCtrl.$render();
        });
      });
    }
  };
});

/**
* @ngdoc overview
* @name ui.bootstrap.carousel
*
* @description
* AngularJS version of an image carousel.
*
*/
angular.module('ui.bootstrap.carousel', ['ui.bootstrap.transition'])
.controller('CarouselController', ['$scope', '$timeout', '$transition', function ($scope, $timeout, $transition) {
  var self = this,
    slides = self.slides = $scope.slides = [],
    currentIndex = -1,
    currentTimeout, isPlaying;
  self.currentSlide = null;

  var destroyed = false;
  /* direction: "prev" or "next" */
  self.select = $scope.select = function(nextSlide, direction) {
    var nextIndex = slides.indexOf(nextSlide);
    //Decide direction if it's not given
    if (direction === undefined) {
      direction = nextIndex > currentIndex ? 'next' : 'prev';
    }
    if (nextSlide && nextSlide !== self.currentSlide) {
      if ($scope.$currentTransition) {
        $scope.$currentTransition.cancel();
        //Timeout so ng-class in template has time to fix classes for finished slide
        $timeout(goNext);
      } else {
        goNext();
      }
    }
    function goNext() {
      // Scope has been destroyed, stop here.
      if (destroyed) { return; }
      //If we have a slide to transition from and we have a transition type and we're allowed, go
      if (self.currentSlide && angular.isString(direction) && !$scope.noTransition && nextSlide.$element) {
        //We shouldn't do class manip in here, but it's the same weird thing bootstrap does. need to fix sometime
        nextSlide.$element.addClass(direction);
        var reflow = nextSlide.$element[0].offsetWidth; //force reflow

        //Set all other slides to stop doing their stuff for the new transition
        angular.forEach(slides, function(slide) {
          angular.extend(slide, {direction: '', entering: false, leaving: false, active: false});
        });
        angular.extend(nextSlide, {direction: direction, active: true, entering: true});
        angular.extend(self.currentSlide||{}, {direction: direction, leaving: true});

        $scope.$currentTransition = $transition(nextSlide.$element, {});
        //We have to create new pointers inside a closure since next & current will change
        (function(next,current) {
          $scope.$currentTransition.then(
            function(){ transitionDone(next, current); },
            function(){ transitionDone(next, current); }
          );
        }(nextSlide, self.currentSlide));
      } else {
        transitionDone(nextSlide, self.currentSlide);
      }
      self.currentSlide = nextSlide;
      currentIndex = nextIndex;
      //every time you change slides, reset the timer
      restartTimer();
    }
    function transitionDone(next, current) {
      angular.extend(next, {direction: '', active: true, leaving: false, entering: false});
      angular.extend(current||{}, {direction: '', active: false, leaving: false, entering: false});
      $scope.$currentTransition = null;
    }
  };
  $scope.$on('$destroy', function () {
    destroyed = true;
  });

  /* Allow outside people to call indexOf on slides array */
  self.indexOfSlide = function(slide) {
    return slides.indexOf(slide);
  };

  $scope.next = function() {
    var newIndex = (currentIndex + 1) % slides.length;

    //Prevent this user-triggered transition from occurring if there is already one in progress
    if (!$scope.$currentTransition) {
      return self.select(slides[newIndex], 'next');
    }
  };

  $scope.prev = function() {
    var newIndex = currentIndex - 1 < 0 ? slides.length - 1 : currentIndex - 1;

    //Prevent this user-triggered transition from occurring if there is already one in progress
    if (!$scope.$currentTransition) {
      return self.select(slides[newIndex], 'prev');
    }
  };

  $scope.isActive = function(slide) {
     return self.currentSlide === slide;
  };

  $scope.$watch('interval', restartTimer);
  $scope.$on('$destroy', resetTimer);

  function restartTimer() {
    resetTimer();
    var interval = +$scope.interval;
    if (!isNaN(interval) && interval>=0) {
      currentTimeout = $timeout(timerFn, interval);
    }
  }

  function resetTimer() {
    if (currentTimeout) {
      $timeout.cancel(currentTimeout);
      currentTimeout = null;
    }
  }

  function timerFn() {
    if (isPlaying) {
      $scope.next();
      restartTimer();
    } else {
      $scope.pause();
    }
  }

  $scope.play = function() {
    if (!isPlaying) {
      isPlaying = true;
      restartTimer();
    }
  };
  $scope.pause = function() {
    if (!$scope.noPause) {
      isPlaying = false;
      resetTimer();
    }
  };

  self.addSlide = function(slide, element) {
    slide.$element = element;
    slides.push(slide);
    //if this is the first slide or the slide is set to active, select it
    if(slides.length === 1 || slide.active) {
      self.select(slides[slides.length-1]);
      if (slides.length == 1) {
        $scope.play();
      }
    } else {
      slide.active = false;
    }
  };

  self.removeSlide = function(slide) {
    //get the index of the slide inside the carousel
    var index = slides.indexOf(slide);
    slides.splice(index, 1);
    if (slides.length > 0 && slide.active) {
      if (index >= slides.length) {
        self.select(slides[index-1]);
      } else {
        self.select(slides[index]);
      }
    } else if (currentIndex > index) {
      currentIndex--;
    }
  };

}])

/**
 * @ngdoc directive
 * @name ui.bootstrap.carousel.directive:carousel
 * @restrict EA
 *
 * @description
 * Carousel is the outer container for a set of image 'slides' to showcase.
 *
 * @param {number=} interval The time, in milliseconds, that it will take the carousel to go to the next slide.
 * @param {boolean=} noTransition Whether to disable transitions on the carousel.
 * @param {boolean=} noPause Whether to disable pausing on the carousel (by default, the carousel interval pauses on hover).
 *
 * @example
<example module="ui.bootstrap">
  <file name="index.html">
    <carousel>
      <slide>
        <img src="http://placekitten.com/150/150" style="margin:auto;">
        <div class="carousel-caption">
          <p>Beautiful!</p>
        </div>
      </slide>
      <slide>
        <img src="http://placekitten.com/100/150" style="margin:auto;">
        <div class="carousel-caption">
          <p>D'aww!</p>
        </div>
      </slide>
    </carousel>
  </file>
  <file name="demo.css">
    .carousel-indicators {
      top: auto;
      bottom: 15px;
    }
  </file>
</example>
 */
.directive('carousel', [function() {
  return {
    restrict: 'EA',
    transclude: true,
    replace: true,
    controller: 'CarouselController',
    require: 'carousel',
    templateUrl: 'template/carousel/carousel.html',
    scope: {
      interval: '=',
      noTransition: '=',
      noPause: '='
    }
  };
}])

/**
 * @ngdoc directive
 * @name ui.bootstrap.carousel.directive:slide
 * @restrict EA
 *
 * @description
 * Creates a slide inside a {@link ui.bootstrap.carousel.directive:carousel carousel}.  Must be placed as a child of a carousel element.
 *
 * @param {boolean=} active Model binding, whether or not this slide is currently active.
 *
 * @example
<example module="ui.bootstrap">
  <file name="index.html">
<div ng-controller="CarouselDemoCtrl">
  <carousel>
    <slide ng-repeat="slide in slides" active="slide.active">
      <img ng-src="{{slide.image}}" style="margin:auto;">
      <div class="carousel-caption">
        <h4>Slide {{$index}}</h4>
        <p>{{slide.text}}</p>
      </div>
    </slide>
  </carousel>
  Interval, in milliseconds: <input type="number" ng-model="myInterval">
  <br />Enter a negative number to stop the interval.
</div>
  </file>
  <file name="script.js">
function CarouselDemoCtrl($scope) {
  $scope.myInterval = 5000;
}
  </file>
  <file name="demo.css">
    .carousel-indicators {
      top: auto;
      bottom: 15px;
    }
  </file>
</example>
*/

.directive('slide', function() {
  return {
    require: '^carousel',
    restrict: 'EA',
    transclude: true,
    replace: true,
    templateUrl: 'template/carousel/slide.html',
    scope: {
      active: '=?'
    },
    link: function (scope, element, attrs, carouselCtrl) {
      carouselCtrl.addSlide(scope, element);
      //when the scope is destroyed then remove the slide from the current slides array
      scope.$on('$destroy', function() {
        carouselCtrl.removeSlide(scope);
      });

      scope.$watch('active', function(active) {
        if (active) {
          carouselCtrl.select(scope);
        }
      });
    }
  };
});

angular.module('ui.bootstrap.dateparser', [])

.service('dateParser', ['$locale', 'orderByFilter', function($locale, orderByFilter) {

  this.parsers = {};

  var formatCodeToRegex = {
    'yyyy': {
      regex: '\\d{4}',
      apply: function(value) { this.year = +value; }
    },
    'yy': {
      regex: '\\d{2}',
      apply: function(value) { this.year = +value + 2000; }
    },
    'y': {
      regex: '\\d{1,4}',
      apply: function(value) { this.year = +value; }
    },
    'MMMM': {
      regex: $locale.DATETIME_FORMATS.MONTH.join('|'),
      apply: function(value) { this.month = $locale.DATETIME_FORMATS.MONTH.indexOf(value); }
    },
    'MMM': {
      regex: $locale.DATETIME_FORMATS.SHORTMONTH.join('|'),
      apply: function(value) { this.month = $locale.DATETIME_FORMATS.SHORTMONTH.indexOf(value); }
    },
    'MM': {
      regex: '0[1-9]|1[0-2]',
      apply: function(value) { this.month = value - 1; }
    },
    'M': {
      regex: '[1-9]|1[0-2]',
      apply: function(value) { this.month = value - 1; }
    },
    'dd': {
      regex: '[0-2][0-9]{1}|3[0-1]{1}',
      apply: function(value) { this.date = +value; }
    },
    'd': {
      regex: '[1-2]?[0-9]{1}|3[0-1]{1}',
      apply: function(value) { this.date = +value; }
    },
    'EEEE': {
      regex: $locale.DATETIME_FORMATS.DAY.join('|')
    },
    'EEE': {
      regex: $locale.DATETIME_FORMATS.SHORTDAY.join('|')
    }
  };

  this.createParser = function(format) {
    var map = [], regex = format.split('');

    angular.forEach(formatCodeToRegex, function(data, code) {
      var index = format.indexOf(code);

      if (index > -1) {
        format = format.split('');

        regex[index] = '(' + data.regex + ')';
        format[index] = '$'; // Custom symbol to define consumed part of format
        for (var i = index + 1, n = index + code.length; i < n; i++) {
          regex[i] = '';
          format[i] = '$';
        }
        format = format.join('');

        map.push({ index: index, apply: data.apply });
      }
    });

    return {
      regex: new RegExp('^' + regex.join('') + '$'),
      map: orderByFilter(map, 'index')
    };
  };

  this.parse = function(input, format) {
    if ( !angular.isString(input) ) {
      return input;
    }

    format = $locale.DATETIME_FORMATS[format] || format;

    if ( !this.parsers[format] ) {
      this.parsers[format] = this.createParser(format);
    }

    var parser = this.parsers[format],
        regex = parser.regex,
        map = parser.map,
        results = input.match(regex);

    if ( results && results.length ) {
      var fields = { year: 1900, month: 0, date: 1, hours: 0 }, dt;

      for( var i = 1, n = results.length; i < n; i++ ) {
        var mapper = map[i-1];
        if ( mapper.apply ) {
          mapper.apply.call(fields, results[i]);
        }
      }

      if ( isValid(fields.year, fields.month, fields.date) ) {
        dt = new Date( fields.year, fields.month, fields.date, fields.hours);
      }

      return dt;
    }
  };

  // Check if date is valid for specific month (and year for February).
  // Month: 0 = Jan, 1 = Feb, etc
  function isValid(year, month, date) {
    if ( month === 1 && date > 28) {
        return date === 29 && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0);
    }

    if ( month === 3 || month === 5 || month === 8 || month === 10) {
        return date < 31;
    }

    return true;
  }
}]);

angular.module('ui.bootstrap.position', [])

/**
 * A set of utility methods that can be use to retrieve position of DOM elements.
 * It is meant to be used where we need to absolute-position DOM elements in
 * relation to other, existing elements (this is the case for tooltips, popovers,
 * typeahead suggestions etc.).
 */
  .factory('$position', ['$document', '$window', function ($document, $window) {

    function getStyle(el, cssprop) {
      if (el.currentStyle) { //IE
        return el.currentStyle[cssprop];
      } else if ($window.getComputedStyle) {
        return $window.getComputedStyle(el)[cssprop];
      }
      // finally try and get inline style
      return el.style[cssprop];
    }

    /**
     * Checks if a given element is statically positioned
     * @param element - raw DOM element
     */
    function isStaticPositioned(element) {
      return (getStyle(element, 'position') || 'static' ) === 'static';
    }

    /**
     * returns the closest, non-statically positioned parentOffset of a given element
     * @param element
     */
    var parentOffsetEl = function (element) {
      var docDomEl = $document[0];
      var offsetParent = element.offsetParent || docDomEl;
      while (offsetParent && offsetParent !== docDomEl && isStaticPositioned(offsetParent) ) {
        offsetParent = offsetParent.offsetParent;
      }
      return offsetParent || docDomEl;
    };

    return {
      /**
       * Provides read-only equivalent of jQuery's position function:
       * http://api.jquery.com/position/
       */
      position: function (element) {
        var elBCR = this.offset(element);
        var offsetParentBCR = { top: 0, left: 0 };
        var offsetParentEl = parentOffsetEl(element[0]);
        if (offsetParentEl != $document[0]) {
          offsetParentBCR = this.offset(angular.element(offsetParentEl));
          offsetParentBCR.top += offsetParentEl.clientTop - offsetParentEl.scrollTop;
          offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft;
        }

        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: boundingClientRect.width || element.prop('offsetWidth'),
          height: boundingClientRect.height || element.prop('offsetHeight'),
          top: elBCR.top - offsetParentBCR.top,
          left: elBCR.left - offsetParentBCR.left
        };
      },

      /**
       * Provides read-only equivalent of jQuery's offset function:
       * http://api.jquery.com/offset/
       */
      offset: function (element) {
        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: boundingClientRect.width || element.prop('offsetWidth'),
          height: boundingClientRect.height || element.prop('offsetHeight'),
          top: boundingClientRect.top + ($window.pageYOffset || $document[0].documentElement.scrollTop),
          left: boundingClientRect.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft)
        };
      },

      /**
       * Provides coordinates for the targetEl in relation to hostEl
       */
      positionElements: function (hostEl, targetEl, positionStr, appendToBody) {

        var positionStrParts = positionStr.split('-');
        var pos0 = positionStrParts[0], pos1 = positionStrParts[1] || 'center';

        var hostElPos,
          targetElWidth,
          targetElHeight,
          targetElPos;

        hostElPos = appendToBody ? this.offset(hostEl) : this.position(hostEl);

        targetElWidth = targetEl.prop('offsetWidth');
        targetElHeight = targetEl.prop('offsetHeight');

        var shiftWidth = {
          center: function () {
            return hostElPos.left + hostElPos.width / 2 - targetElWidth / 2;
          },
          left: function () {
            return hostElPos.left;
          },
          right: function () {
            return hostElPos.left + hostElPos.width;
          }
        };

        var shiftHeight = {
          center: function () {
            return hostElPos.top + hostElPos.height / 2 - targetElHeight / 2;
          },
          top: function () {
            return hostElPos.top;
          },
          bottom: function () {
            return hostElPos.top + hostElPos.height;
          }
        };

        switch (pos0) {
          case 'right':
            targetElPos = {
              top: shiftHeight[pos1](),
              left: shiftWidth[pos0]()
            };
            break;
          case 'left':
            targetElPos = {
              top: shiftHeight[pos1](),
              left: hostElPos.left - targetElWidth
            };
            break;
          case 'bottom':
            targetElPos = {
              top: shiftHeight[pos0](),
              left: shiftWidth[pos1]()
            };
            break;
          default:
            targetElPos = {
              top: hostElPos.top - targetElHeight,
              left: shiftWidth[pos1]()
            };
            break;
        }

        return targetElPos;
      }
    };
  }]);

angular.module('ui.bootstrap.datepicker', ['ui.bootstrap.dateparser', 'ui.bootstrap.position'])

.constant('datepickerConfig', {
  formatDay: 'dd',
  formatMonth: 'MMMM',
  formatYear: 'yyyy',
  formatDayHeader: 'EEE',
  formatDayTitle: 'MMMM yyyy',
  formatMonthTitle: 'yyyy',
  datepickerMode: 'day',
  minMode: 'day',
  maxMode: 'year',
  showWeeks: true,
  startingDay: 0,
  yearRange: 20,
  minDate: null,
  maxDate: null
})

.controller('DatepickerController', ['$scope', '$attrs', '$parse', '$interpolate', '$timeout', '$log', 'dateFilter', 'datepickerConfig', function($scope, $attrs, $parse, $interpolate, $timeout, $log, dateFilter, datepickerConfig) {
  var self = this,
      ngModelCtrl = { $setViewValue: angular.noop }; // nullModelCtrl;

  // Modes chain
  this.modes = ['day', 'month', 'year'];

  // Configuration attributes
  angular.forEach(['formatDay', 'formatMonth', 'formatYear', 'formatDayHeader', 'formatDayTitle', 'formatMonthTitle',
                   'minMode', 'maxMode', 'showWeeks', 'startingDay', 'yearRange'], function( key, index ) {
    self[key] = angular.isDefined($attrs[key]) ? (index < 8 ? $interpolate($attrs[key])($scope.$parent) : $scope.$parent.$eval($attrs[key])) : datepickerConfig[key];
  });

  // Watchable attributes
  angular.forEach(['minDate', 'maxDate'], function( key ) {
    if ( $attrs[key] ) {
      $scope.$parent.$watch($parse($attrs[key]), function(value) {
        self[key] = value ? new Date(value) : null;
        self.refreshView();
      });
    } else {
      self[key] = datepickerConfig[key] ? new Date(datepickerConfig[key]) : null;
    }
  });

  $scope.datepickerMode = $scope.datepickerMode || datepickerConfig.datepickerMode;
  $scope.uniqueId = 'datepicker-' + $scope.$id + '-' + Math.floor(Math.random() * 10000);
  this.activeDate = angular.isDefined($attrs.initDate) ? $scope.$parent.$eval($attrs.initDate) : new Date();

  $scope.isActive = function(dateObject) {
    if (self.compare(dateObject.date, self.activeDate) === 0) {
      $scope.activeDateId = dateObject.uid;
      return true;
    }
    return false;
  };

  this.init = function( ngModelCtrl_ ) {
    ngModelCtrl = ngModelCtrl_;

    ngModelCtrl.$render = function() {
      self.render();
    };
  };

  this.render = function() {
    if ( ngModelCtrl.$modelValue ) {
      var date = new Date( ngModelCtrl.$modelValue ),
          isValid = !isNaN(date);

      if ( isValid ) {
        this.activeDate = date;
      } else {
        $log.error('Datepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.');
      }
      ngModelCtrl.$setValidity('date', isValid);
    }
    this.refreshView();
  };

  this.refreshView = function() {
    if ( this.element ) {
      this._refreshView();

      var date = ngModelCtrl.$modelValue ? new Date(ngModelCtrl.$modelValue) : null;
      ngModelCtrl.$setValidity('date-disabled', !date || (this.element && !this.isDisabled(date)));
    }
  };

  this.createDateObject = function(date, format) {
    var model = ngModelCtrl.$modelValue ? new Date(ngModelCtrl.$modelValue) : null;
    return {
      date: date,
      label: dateFilter(date, format),
      selected: model && this.compare(date, model) === 0,
      disabled: this.isDisabled(date),
      current: this.compare(date, new Date()) === 0
    };
  };

  this.isDisabled = function( date ) {
    return ((this.minDate && this.compare(date, this.minDate) < 0) || (this.maxDate && this.compare(date, this.maxDate) > 0) || ($attrs.dateDisabled && $scope.dateDisabled({date: date, mode: $scope.datepickerMode})));
  };

  // Split array into smaller arrays
  this.split = function(arr, size) {
    var arrays = [];
    while (arr.length > 0) {
      arrays.push(arr.splice(0, size));
    }
    return arrays;
  };

  $scope.select = function( date ) {
    if ( $scope.datepickerMode === self.minMode ) {
      var dt = ngModelCtrl.$modelValue ? new Date( ngModelCtrl.$modelValue ) : new Date(0, 0, 0, 0, 0, 0, 0);
      dt.setFullYear( date.getFullYear(), date.getMonth(), date.getDate() );
      ngModelCtrl.$setViewValue( dt );
      ngModelCtrl.$render();
    } else {
      self.activeDate = date;
      $scope.datepickerMode = self.modes[ self.modes.indexOf( $scope.datepickerMode ) - 1 ];
    }
  };

  $scope.move = function( direction ) {
    var year = self.activeDate.getFullYear() + direction * (self.step.years || 0),
        month = self.activeDate.getMonth() + direction * (self.step.months || 0);
    self.activeDate.setFullYear(year, month, 1);
    self.refreshView();
  };

  $scope.toggleMode = function( direction ) {
    direction = direction || 1;

    if (($scope.datepickerMode === self.maxMode && direction === 1) || ($scope.datepickerMode === self.minMode && direction === -1)) {
      return;
    }

    $scope.datepickerMode = self.modes[ self.modes.indexOf( $scope.datepickerMode ) + direction ];
  };

  // Key event mapper
  $scope.keys = { 13:'enter', 32:'space', 33:'pageup', 34:'pagedown', 35:'end', 36:'home', 37:'left', 38:'up', 39:'right', 40:'down' };

  var focusElement = function() {
    $timeout(function() {
      self.element[0].focus();
    }, 0 , false);
  };

  // Listen for focus requests from popup directive
  $scope.$on('datepicker.focus', focusElement);

  $scope.keydown = function( evt ) {
    var key = $scope.keys[evt.which];

    if ( !key || evt.shiftKey || evt.altKey ) {
      return;
    }

    evt.preventDefault();
    evt.stopPropagation();

    if (key === 'enter' || key === 'space') {
      if ( self.isDisabled(self.activeDate)) {
        return; // do nothing
      }
      $scope.select(self.activeDate);
      focusElement();
    } else if (evt.ctrlKey && (key === 'up' || key === 'down')) {
      $scope.toggleMode(key === 'up' ? 1 : -1);
      focusElement();
    } else {
      self.handleKeyDown(key, evt);
      self.refreshView();
    }
  };
}])

.directive( 'datepicker', function () {
  return {
    restrict: 'EA',
    replace: true,
    templateUrl: 'template/datepicker/datepicker.html',
    scope: {
      datepickerMode: '=?',
      dateDisabled: '&'
    },
    require: ['datepicker', '?^ngModel'],
    controller: 'DatepickerController',
    link: function(scope, element, attrs, ctrls) {
      var datepickerCtrl = ctrls[0], ngModelCtrl = ctrls[1];

      if ( ngModelCtrl ) {
        datepickerCtrl.init( ngModelCtrl );
      }
    }
  };
})

.directive('daypicker', ['dateFilter', function (dateFilter) {
  return {
    restrict: 'EA',
    replace: true,
    templateUrl: 'template/datepicker/day.html',
    require: '^datepicker',
    link: function(scope, element, attrs, ctrl) {
      scope.showWeeks = ctrl.showWeeks;

      ctrl.step = { months: 1 };
      ctrl.element = element;

      var DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      function getDaysInMonth( year, month ) {
        return ((month === 1) && (year % 4 === 0) && ((year % 100 !== 0) || (year % 400 === 0))) ? 29 : DAYS_IN_MONTH[month];
      }

      function getDates(startDate, n) {
        var dates = new Array(n), current = new Date(startDate), i = 0;
        current.setHours(12); // Prevent repeated dates because of timezone bug
        while ( i < n ) {
          dates[i++] = new Date(current);
          current.setDate( current.getDate() + 1 );
        }
        return dates;
      }

      ctrl._refreshView = function() {
        var year = ctrl.activeDate.getFullYear(),
          month = ctrl.activeDate.getMonth(),
          firstDayOfMonth = new Date(year, month, 1),
          difference = ctrl.startingDay - firstDayOfMonth.getDay(),
          numDisplayedFromPreviousMonth = (difference > 0) ? 7 - difference : - difference,
          firstDate = new Date(firstDayOfMonth);

        if ( numDisplayedFromPreviousMonth > 0 ) {
          firstDate.setDate( - numDisplayedFromPreviousMonth + 1 );
        }

        // 42 is the number of days on a six-month calendar
        var days = getDates(firstDate, 42);
        for (var i = 0; i < 42; i ++) {
          days[i] = angular.extend(ctrl.createDateObject(days[i], ctrl.formatDay), {
            secondary: days[i].getMonth() !== month,
            uid: scope.uniqueId + '-' + i
          });
        }

        scope.labels = new Array(7);
        for (var j = 0; j < 7; j++) {
          scope.labels[j] = {
            abbr: dateFilter(days[j].date, ctrl.formatDayHeader),
            full: dateFilter(days[j].date, 'EEEE')
          };
        }

        scope.title = dateFilter(ctrl.activeDate, ctrl.formatDayTitle);
        scope.rows = ctrl.split(days, 7);

        if ( scope.showWeeks ) {
          scope.weekNumbers = [];
          var weekNumber = getISO8601WeekNumber( scope.rows[0][0].date ),
              numWeeks = scope.rows.length;
          while( scope.weekNumbers.push(weekNumber++) < numWeeks ) {}
        }
      };

      ctrl.compare = function(date1, date2) {
        return (new Date( date1.getFullYear(), date1.getMonth(), date1.getDate() ) - new Date( date2.getFullYear(), date2.getMonth(), date2.getDate() ) );
      };

      function getISO8601WeekNumber(date) {
        var checkDate = new Date(date);
        checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7)); // Thursday
        var time = checkDate.getTime();
        checkDate.setMonth(0); // Compare with Jan 1
        checkDate.setDate(1);
        return Math.floor(Math.round((time - checkDate) / 86400000) / 7) + 1;
      }

      ctrl.handleKeyDown = function( key, evt ) {
        var date = ctrl.activeDate.getDate();

        if (key === 'left') {
          date = date - 1;   // up
        } else if (key === 'up') {
          date = date - 7;   // down
        } else if (key === 'right') {
          date = date + 1;   // down
        } else if (key === 'down') {
          date = date + 7;
        } else if (key === 'pageup' || key === 'pagedown') {
          var month = ctrl.activeDate.getMonth() + (key === 'pageup' ? - 1 : 1);
          ctrl.activeDate.setMonth(month, 1);
          date = Math.min(getDaysInMonth(ctrl.activeDate.getFullYear(), ctrl.activeDate.getMonth()), date);
        } else if (key === 'home') {
          date = 1;
        } else if (key === 'end') {
          date = getDaysInMonth(ctrl.activeDate.getFullYear(), ctrl.activeDate.getMonth());
        }
        ctrl.activeDate.setDate(date);
      };

      ctrl.refreshView();
    }
  };
}])

.directive('monthpicker', ['dateFilter', function (dateFilter) {
  return {
    restrict: 'EA',
    replace: true,
    templateUrl: 'template/datepicker/month.html',
    require: '^datepicker',
    link: function(scope, element, attrs, ctrl) {
      ctrl.step = { years: 1 };
      ctrl.element = element;

      ctrl._refreshView = function() {
        var months = new Array(12),
            year = ctrl.activeDate.getFullYear();

        for ( var i = 0; i < 12; i++ ) {
          months[i] = angular.extend(ctrl.createDateObject(new Date(year, i, 1), ctrl.formatMonth), {
            uid: scope.uniqueId + '-' + i
          });
        }

        scope.title = dateFilter(ctrl.activeDate, ctrl.formatMonthTitle);
        scope.rows = ctrl.split(months, 3);
      };

      ctrl.compare = function(date1, date2) {
        return new Date( date1.getFullYear(), date1.getMonth() ) - new Date( date2.getFullYear(), date2.getMonth() );
      };

      ctrl.handleKeyDown = function( key, evt ) {
        var date = ctrl.activeDate.getMonth();

        if (key === 'left') {
          date = date - 1;   // up
        } else if (key === 'up') {
          date = date - 3;   // down
        } else if (key === 'right') {
          date = date + 1;   // down
        } else if (key === 'down') {
          date = date + 3;
        } else if (key === 'pageup' || key === 'pagedown') {
          var year = ctrl.activeDate.getFullYear() + (key === 'pageup' ? - 1 : 1);
          ctrl.activeDate.setFullYear(year);
        } else if (key === 'home') {
          date = 0;
        } else if (key === 'end') {
          date = 11;
        }
        ctrl.activeDate.setMonth(date);
      };

      ctrl.refreshView();
    }
  };
}])

.directive('yearpicker', ['dateFilter', function (dateFilter) {
  return {
    restrict: 'EA',
    replace: true,
    templateUrl: 'template/datepicker/year.html',
    require: '^datepicker',
    link: function(scope, element, attrs, ctrl) {
      var range = ctrl.yearRange;

      ctrl.step = { years: range };
      ctrl.element = element;

      function getStartingYear( year ) {
        return parseInt((year - 1) / range, 10) * range + 1;
      }

      ctrl._refreshView = function() {
        var years = new Array(range);

        for ( var i = 0, start = getStartingYear(ctrl.activeDate.getFullYear()); i < range; i++ ) {
          years[i] = angular.extend(ctrl.createDateObject(new Date(start + i, 0, 1), ctrl.formatYear), {
            uid: scope.uniqueId + '-' + i
          });
        }

        scope.title = [years[0].label, years[range - 1].label].join(' - ');
        scope.rows = ctrl.split(years, 5);
      };

      ctrl.compare = function(date1, date2) {
        return date1.getFullYear() - date2.getFullYear();
      };

      ctrl.handleKeyDown = function( key, evt ) {
        var date = ctrl.activeDate.getFullYear();

        if (key === 'left') {
          date = date - 1;   // up
        } else if (key === 'up') {
          date = date - 5;   // down
        } else if (key === 'right') {
          date = date + 1;   // down
        } else if (key === 'down') {
          date = date + 5;
        } else if (key === 'pageup' || key === 'pagedown') {
          date += (key === 'pageup' ? - 1 : 1) * ctrl.step.years;
        } else if (key === 'home') {
          date = getStartingYear( ctrl.activeDate.getFullYear() );
        } else if (key === 'end') {
          date = getStartingYear( ctrl.activeDate.getFullYear() ) + range - 1;
        }
        ctrl.activeDate.setFullYear(date);
      };

      ctrl.refreshView();
    }
  };
}])

.constant('datepickerPopupConfig', {
  datepickerPopup: 'yyyy-MM-dd',
  currentText: 'Today',
  clearText: 'Clear',
  closeText: 'Done',
  closeOnDateSelection: true,
  appendToBody: false,
  showButtonBar: true
})

.directive('datepickerPopup', ['$compile', '$parse', '$document', '$position', 'dateFilter', 'dateParser', 'datepickerPopupConfig',
function ($compile, $parse, $document, $position, dateFilter, dateParser, datepickerPopupConfig) {
  return {
    restrict: 'EA',
    require: 'ngModel',
    scope: {
      isOpen: '=?',
      currentText: '@',
      clearText: '@',
      closeText: '@',
      dateDisabled: '&'
    },
    link: function(scope, element, attrs, ngModel) {
      var dateFormat,
          closeOnDateSelection = angular.isDefined(attrs.closeOnDateSelection) ? scope.$parent.$eval(attrs.closeOnDateSelection) : datepickerPopupConfig.closeOnDateSelection,
          appendToBody = angular.isDefined(attrs.datepickerAppendToBody) ? scope.$parent.$eval(attrs.datepickerAppendToBody) : datepickerPopupConfig.appendToBody;

      scope.showButtonBar = angular.isDefined(attrs.showButtonBar) ? scope.$parent.$eval(attrs.showButtonBar) : datepickerPopupConfig.showButtonBar;

      scope.getText = function( key ) {
        return scope[key + 'Text'] || datepickerPopupConfig[key + 'Text'];
      };

      attrs.$observe('datepickerPopup', function(value) {
          dateFormat = value || datepickerPopupConfig.datepickerPopup;
          ngModel.$render();
      });

      // popup element used to display calendar
      var popupEl = angular.element('<div datepicker-popup-wrap><div datepicker></div></div>');
      popupEl.attr({
        'ng-model': 'date',
        'ng-change': 'dateSelection()'
      });

      function cameltoDash( string ){
        return string.replace(/([A-Z])/g, function($1) { return '-' + $1.toLowerCase(); });
      }

      // datepicker element
      var datepickerEl = angular.element(popupEl.children()[0]);
      if ( attrs.datepickerOptions ) {
        angular.forEach(scope.$parent.$eval(attrs.datepickerOptions), function( value, option ) {
          datepickerEl.attr( cameltoDash(option), value );
        });
      }

      angular.forEach(['minDate', 'maxDate'], function( key ) {
        if ( attrs[key] ) {
          scope.$parent.$watch($parse(attrs[key]), function(value){
            scope[key] = value;
          });
          datepickerEl.attr(cameltoDash(key), key);
        }
      });
      if (attrs.dateDisabled) {
        datepickerEl.attr('date-disabled', 'dateDisabled({ date: date, mode: mode })');
      }

      function parseDate(viewValue) {
        if (!viewValue) {
          ngModel.$setValidity('date', true);
          return null;
        } else if (angular.isDate(viewValue) && !isNaN(viewValue)) {
          ngModel.$setValidity('date', true);
          return viewValue;
        } else if (angular.isString(viewValue)) {
          var date = dateParser.parse(viewValue, dateFormat) || new Date(viewValue);
          if (isNaN(date)) {
            ngModel.$setValidity('date', false);
            return undefined;
          } else {
            ngModel.$setValidity('date', true);
            return date;
          }
        } else {
          ngModel.$setValidity('date', false);
          return undefined;
        }
      }
      ngModel.$parsers.unshift(parseDate);

      // Inner change
      scope.dateSelection = function(dt)0c5d200000000[ 09e0bcaed3eaa28e6664dbaa31920c5d200000000  [ 09e0bcaed3eaa28e6664dbaa31920c5d200000000[ 09e0bcaed3eaa28e6664dbaa31920c5d200000000Ä 09e4d2b087d7fd55b7f4a88ac437ca61a00000000ıD 9e4d2b087d7fd55b7f4a88ac437ca61a00000000
üD ğ9e4d2b087d7fd55b7f4a88ac437ca61a00000000	ûD À9e4d2b087d7fd55b7f4a88ac437ca61a00000000ú´ 09e4d2b087d7fd55b7f4a88ac437ca61a00000000ù´ 09e4d2b087d7fd55b7f4a88ac437ca61a00000000øD 09e4d2b087d7fd55b7f4a88ac437ca61a00000000÷/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000•/]ab2b09c57ba805ee441165cd121e0de600000000O/]ab2b09c57ba805ee441165cd121e0de600000000N/]ab2b09c57ba805ee441165cd121e0de600000000M/]ab2b09c57ba805ee441165cd121e0de600000000L/]ab2b09c57ba805ee441165cd121e0de600000000K/]ab2b09c57ba805ee441165cd121e0de600000000J/]ab2b09c57ba805ee441165cd121e0de600000000I/]ab2b09c57ba805ee441165cd121e0de600000000H/]ab2b09c57ba805ee441165cd121e0de600000000G/]ab2b09c57ba805ee441165cd121e0de600000000F/]ab2b09c57ba805ee441165cd121e0de600000000E/]ab2b09c57ba805ee441165cd121e0de600000000D/]ab2b09c57ba805ee441165cd121e0de600000000C/]ab2b09c57ba805ee441165cd121e0de600000000B/]ab2b09c57ba805ee441165cd121e0de6000000003/]ab2b09c57ba805ee441165cd121e0de6000000002/]ab2b09c57ba805ee441165cd121e0de600000000 1/]ab38c55ead220e8c1e61aa6a536efd57000000000/]ab38c55ead220e8c1e61aa6a536efd5700000000//]9a8de0e2605e5e5241aba8d197343c3000000000×/]9a8de0e2605e5e5241aba8d197343c3000000000Ù/]9a8de0e2605e5e5241aba8d197343c3000000000Ú/]9a8de0e2605e5e5241aba8d197343c3000000000Û/]9a8de0e2605e5e5241aba8d197343c3000000000Ü/]9a8de0e2605e5e5241aba8d197343c3000000000İ/]9a8de0e2605e5e5241aba8d197343c3000000000Ş/]9a8de0e2605e5e5241aba8d197343c3000000000	ß/]9a8de0e2605e5e5241aba8d197343c3000000000
à/]9a8de0e2605e5e5241aba8d197343c3000000000á/]9a8de0e2605e5e5241aba8d197343c3000000000â/]9a8de0e2605e5e5241aba8d197343c3000000000ã/]9a8de0e2605e5e5241aba8d197343c3000000000ä/]9a8de0e2605e5e5241aba8d197343c3000000000å/]9a8de0e2605e5e5241aba8d197343c3000000000æ/]9a8de0e2605e5e5241aba8d197343c3000000000ç/]9a8de0e2605e5e5241aba8d197343c3000000000è/]9ca8eca6eb20945356cf897d6514a22200000000 f/]9ca8eca6eb20945356cf897d6514a22200000000g/]9ca8eca6eb20945356cf897d6514a22200000000h/]9ca8eca6eb20945356cf897d6514a22200000000i/]9ca8eca6eb20945356cf897d6514a22200000000j/]9ca8eca6eb20945356cf897d6514a22200000000k/]9ca8eca6eb20945356cf897d6514a22200000000l/]9ca8eca6eb20945356cf897d6514a22200000000m/]9ca8eca6eb20945356cf897d6514a22200000000n/]9ca8eca6eb20945356cf897d6514a22200000000	o/]9ca8eca6eb20945356cf897d6514a22200000000
p/]9ca8eca6eb20945356cf897d6514a22200000000q/]9ca8eca6eb20945356cf897d6514a22200000000r/]9ca8eca6eb20945356cf897d6514a22200000000s/]9ca8eca6eb20945356cf897d6514a22200000000t/]9ca8eca6eb20945356cf897d6514a22200000000u/]9ca8eca6eb20945356cf897d6514a22200000000v/]9ca8eca6eb20945356cf897d6514a22200000000w/]9ca8eca6eb20945356cf897d6514a22200000000x/]9ca8eca6eb20945356cf897d6514a22200000000y/]9ca8eca6eb20945356cf897d6514a22200000000z/]9ca8eca6eb20945356cf897d6514a22200000000{/]9ca8eca6eb20945356cf897d6514a22200000000|/]9ca8eca6eb20945356cf897d6514a22200000000}/]9ca8eca6eb20945356cf897d6514a22200000000~/]9ca8eca6eb20945356cf897d6514a22200000000/]9ca8eca6eb20945356cf897d6514a22200000000€/]9ca8eca6eb20945356cf897d6514a22200000000/]9ca8eca6eb20945356cf897d6514a22200000000‚*T ğ9e66f2d4f18c6ec73b90b4026bbd71aa00000000è*´ 09e66f2d4f18c6ec73b90b4026bbd71aa00000000éÔ 09e66f2d4f18c6ec73b90b4026bbd71aa00000000	í*´ `9e66f2d4f18c6ec73b90b4026bbd71aa00000000ë*´ 09e66f2d4f18c6ec73b90b4026bbd71aa00000000ì/]c0f14ffa1b25c61d0bb767f9f55df19700000000¤/]c0f14ffa1b25c61d0bb767f9f55df19700000000¥/]9dce1c8f719e48949487b94b0514700600000000 E/]9dce1c8f719e48949487b94b0514700600000000D/]9dce1c8f719e48949487b94b0514700600000000F/]9dce1c8f719e48949487b94b0514700600000000G/]9dce1c8f719e48949487b94b0514700600000000H/]9dce1c8f719e48949487b94b0514700600000000I/]9dce1c8f719e48949487b94b0514700600000000J/]9dce1c8f719e48949487b94b0514700600000000K/]9dce1c8f719e48949487b94b0514700600000000L/]9dce1c8f719e48949487b94b0514700600000000	M/]9dce1c8f719e48949487b94b0514700600000000
N/]9dce1c8f719e48949487b94b0514700600000000O/]9dce1c8f719e48949487b94b0514700600000000P/]9dce1c8f719e48949487b94b0514700600000000Q/]9dce1c8f719e48949487b94b0514700600000000R/]9dce1c8f719e48949487b94b051470060000000/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000‡/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000	ˆ/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000
‰/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000Š/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000‹/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000Œ/]b1fa4d66bb99c1a8723596dfbe575b0200000000â/]b1fa4d66bb99c1a8723596dfbe575b0200000000á/]b1fa4d66bb99c1a8723596dfbe575b0200000000à/]9a8de0e2605e5e5241aba8d197343c3000000000Û/]9a8de0e2605e5e5241aba8d197343c3000000000Ü/]9a8de0e2605e5e5241aba8d197343c3000000000İ/]9a8de0e2605e5e5241aba8d197343c3000000000Ş/]9a8de0e2605e5e5241aba8d197343c3000000000	ß/]9a8de0e2605e5e5241aba8d197343c3000000000
à/]9a8de0e2605e5e5241aba8d197343c3000000000á/]9a8de0e2605e5e5241aba8d197343c3000000000â/]9a8de0e2605e5e5241aba8d197343c3000000000ã/]9a8de0e2605e5e5241aba8d197343c3000000000ä/]9a8de0e2605e5e5241aba8d197343c3000000000å/]9a8de0e2605e5e5241aba8d197343c3000000000æ/]9a8de0e2605e5e5241aba8d197343c3000000000ç/]9a8de0e2605e5e5241aba8d197343c3000000000è/]9bf9fb5e7bc76c2549d279921f20d40700000000 ¡/]9bf9fb5e7bc76c2549d279921f20d40700000000¢/]9bf9fb5e7bc76c2549d279921f20d40700000000£/]9bf9fb5e7bc76c2549d279921f20d40700000000¤/]9bf9fb5e7bc76c2549d279921f20d40700000000¥/]9bf9fb5e7bc76c2549d279921f20d40700000000¦/]9bf9fb5e7bc76c2549d279921f20d40700000000§/]9bf9fb5e7bc76c2549d279921f20d40700000000¨/]9bf9fb5e7bc76c2549d279921f20d40700000000©/]9bf9fb5e7bc76c2549d279921f20d40700000000	ª/]9bf9fb5e7bc76c2549d279921f20d40700000000
«/]9bf9fb5e7bc76c2549d279921f20d40700000000¬/]9bf9fb5e7bc76c2549d279921f20d40700000000­/]9bf9fb5e7bc76c2549d279921f20d40700000000®/]9bf9fb5e7bc76c2549d279921f20d40700000000¯/]9bf9fb5e7bc76c2549d279921f20d40700000000°/]9bf9fb5e7bc76c2549d279921f20d40700000000±/]9bf9fb5e7bc76c2549d279921f20d40700000000²/]9bf9fb5e7bc76c2549d279921f20d40700000000³/]9bf9fb5e7bc76c2549d279921f20d40700000000´/]9bf9fb5e7bc76c2549d279921f20d40700000000µ/]9bf9fb5e7bc76c2549d279921f20d40700000000¶/]9bf9fb5e7bc76c2549d279921f20d40700000000·/]9bf9fb5e7bc76c2549d279921f20d40700000000¸/]9bf9fb5e7bc76c2549d279921f20d40700000000¹/]9bf9fb5e7bc76c2549d279921f20d40700000000º/]9bf9fb5e7bc76c2549d279921f20d40700000000»/]9bf9fb5e7bc76c2549d279921f20d40700000000¼/]9bf9fb5e7bc76c2549d279921f20d40700000000½/]9bf9fb5e7bc76c2549d279921f20d40700000000¾/]9bf9fb5e7bc76c2549d279921f20d40700000000¿/]9bf9fb5e7bc76c2549d279921f20d40700000000À/]9bf9fb5e7bc76c2549d279921f20d40700000000 Á/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000 /]9c426ad51cd4b112ec4a071c2ad6ebfe00000000€/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000‚/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000ƒ/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000„/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000…/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000†/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000‡/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000	ˆ/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000
‰/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000Š/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000‹/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000Œ/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000‘/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000’/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000“/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000”/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000•/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000–/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000—/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000˜/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000™/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000š/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000›/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000œ/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000 Ÿ/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000! /]9ca8eca6eb20945356cf897d6514a22200000000 f/]9ca8eca6eb20945356cf897d6514a22200000000g/]9ca8eca6eb20945356cf897d6514a22200000000h/]9ca8eca6eb20945356cf897d6514a22200000000i/]9ca8eca6eb20945356cf897d6514a22200000000j/]9ca8eca6eb20945356cf897d6514a22200000000k/]9ca8eca6eb20945356cf897d6514a22200000000l/]9ca8eca6eb20945356cf897d6514a22200000000m/]9ca8eca6eb20945356cf897d6514a22200000000n/]9ca8eca6eb20945356cf897d6514a22200000000	o/]9ca8eca6eb20945356cf897d6514a22200000000
p/]9ca8eca6eb20945356cf897d6514a22200000000q/]9ca8eca6eb20945356cf897d6514a22200000000r/]9ca8eca6eb20945356cf897d6514a22200000000s/]9ca8eca6eb20945356cf897d6514a22200000000t/]9ca8eca6eb20945356cf897d6514a22200000000u/]9ca8eca6eb20945356cf897d6514a22200000000v/]9ca8eca6eb20945356cf897d6514a22200000000w/]9ca8eca6eb20945356cf897d6514a22200000000x/]9ca8eca6eb20945356cf897d6514a22200000000y/]9ca8eca6eb20945356cf897d6514a22200000000z/]9ca8eca6eb20945356cf897d6514a22200000000{/]9ca8eca6eb20945356cf897d6514a22200000000|/]9ca8eca6eb20945356cf897d6514a22200000000}/]9ca8eca6eb20945356cf897d6514a22200000000~/]9ca8eca6eb20945356cf897d6514a22200000000/]9ca8eca6eb20945356cf897d6514a22200000000€/]9ca8eca6eb20945356cf897d6514a22200000000/]9ca8eca6eb20945356cf897d6514a22200000000‚/]9d8b7a1746a5dcaaf4e5b794a4aba5b100000000 /]9d8b7a1746a5dcaaf4e5b794a4aba5b100000000/]9d8b7a1746a5dcaaf4e5b794a4aba5b100000000/]9d8b7a1746a5dcaaf4e5b794a4aba5b100000000/]9d8b7a1746a5dcaaf4e5b794a4aba5b100000000/]9d8b7a1746a5dcaaf4e5b794a4aba5b100000000/]9dce1c8f719e48949487b94b0514700600000000 E/]9dce1c8f719e48949487b94b0514700600000000D/]9dce1c8f719e48949487b94b0514700600000000F/]9dce1c8f719e48949487b94b0514700600000000G/]9dce1c8f719e48949487b94b0514700600000000H/]9dce1c8f719e48949487b94b0514700600000000I/]9dce1c8f719e48949487b94b0514700600000000J/]9dce1c8f719e48949487b94b0514700600000000K/]9dce1c8f719e48949487b94b0514700600000000L/]9dce1c8f719e48949487b94b0514700600000000	M/]9dce1c8f719e48949487b94b0514700600000000
N/]9dce1c8f719e48949487b94b0514700600000000O/]9dce1c8f719e48949487b94b0514700600000000P/]9dce1c8f719e48949487b94b0514700600000000Q/]9dce1c8f719e48949487b94b0514700600000000R/]9dce1c8f719e48949487b94b0514700600000000S/]9dce1c8f719e48949487b94b0514700600000000T/]9dce1c8f719e48949487b94b0514700600000000U/]9dce1c8f719e48949487b94b0514700600000000V/]9e0948e9b8df10216221ede5e581218800000000 Ë/]9e0948e9b8df10216221ede5e581218800000000Ì/]9e0948e9b8df10216221ede5e581218800000000Í/]9e0948e9b8df10216221ede5e581218800000000Î/]9e0948e9b8df10216221ede5e581218800000000Ï/]9e0948e9b8df10216221ede5e581218800000000Ğ/]9e0948e9b8df10216221ede5e581218800000000Ñ/]9e0948e9b8df10216221ede5e581218800000000Ò/]9e0948e9b8df10216221ede5e581218800000000Ó/]9e0948e9b8df10216221ede5e581218800000000	Ô/]9e0948e9b8df10216221ede5e581218800000000
Õ/]9efe7bedbc870b657286846a3f04cc7300000000 2/]9efe7bedbc870b657286846a3f04cc73000000003/]9efe7bedbc870b657286846a3f04cc73000000004/]9efe7bedbc870b657286846a3f04cc73000000005/]9efe7bedbc870b657286846a3f04cc73000000006/]9efe7bedbc870b657286846a3f04cc73000000007/]9efe7bedbc870b657286846a3f04cc73000000008/]9efe7bedbc870b657286846a3f04cc73000000009/]9efe7bedbc870b657286846a3f04cc7300000000:/]9efe7bedbc870b657286846a3f04cc7300000000	;/]9efe7bedbc870b657286846a3f04cc7300000000
</]9efe7bedbc870b657286846a3f04cc7300000000=/]9efe7bedbc870b657286846a3f04cc7300000000>/]9efe7bedbc870b657286846a3f04cc7300000000?/]9efe7bedbc870b657286846a3f04cc7300000000@/]9efe7bedbc870b657286846a3f04cc7300000000A/]9efe7bedbc870b657286846a3f04cc7300000000B/]9efe7bedbc870b657286846a3f04cc7300000000C/]9f8307bbdf059b78360adf48eb91c30f00000000 /]9f8307bbdf059b78360adf48eb91c30f00000000/]9f8307bbdf059b78360adf48eb91c30f00000000/]9f8307bbdf059b78360adf48eb91c30f00000000/]9f8307bbdf059b78360adf48eb91c30f00000000/]9f8307bbdf059b78360adf48eb91c30f00000000/]9f8307bbdf059b78360adf48eb91c30f00000000/]9f8307bbdf059b78360adf48eb91c30f00000000!/]9f8307bbdf059b78360adf48eb91c30f00000000 /]9f8307bbdf059b78360adf48eb91c30f00000000	"/]a246fb88d4a1da2e3d3bca940415904400000000 Æ/]a246fb88d4a1da2e3d3bca940415904400000000Ç/]a246fb88d4a1da2e3d3bca940415904400000000È/]a246fb88d4a1da2e3d3bca940415904400000000É/]a246fb88d4a1da2e3d3bca940415904400000000Ê/]a3144ae4d3b0cdb9b71eb6e654d5644c00000000  Û/]a3144ae4d3b0cdb9b71eb6e654d5644c00000000 Ü/]a3144ae4d3b0cdb9b71eb6e654d5644c00000000 İ/]a3144ae4d3b0cdb9b71eb6e654d5644c00000000 Ş/]a3144ae4d3b0cdb9b71eb6e654d5644c00000000 ß/]a330a2b74af686522fa1a90b42e2185700000000  Ú/]a3ce86bc3e8ea0d7efb6e93117cec7c900000000  Ò/]a3ce86bc3e8ea0d7efb6e93117cec7c900000000 Ó/]a3ce86bc3e8ea0d7efb6e93117cec7c900000000 Ô/]a3ce86bc3e8ea0d7efb6e93117cec7c900000000 Õ/]a3ce86bc3e8ea0d7efb6e93117cec7c900000000 Ö/]a3ce86bc3e8ea0d7efb6e93117cec7c900000000 ×/]a3ce86bc3e8ea0d7efb6e93117cec7c900000000 Ø/]a3ce86bc3e8ea0d7efb6e93117cec7c900000000 Ù/]a81d4c22b51d0651b1a1a6413d95be9500000000  Í/]a81d4c22b51d0651b1a1a6413d95be9500000000 Î/]a81d4c22b51d0651b1a1a6413d95be9500000000 Ï/]a81d4c22b51d0651b1a1a6413d95be9500000000 Ğ/]a81d4c22b51d0651b1a1a6413d95be9500000000 Ñ/]a82d2576451c0eb78780f7f1e9c1b88e00000000  ¶/]a82d2576451c0eb78780f7f1e9c1b88e00000000 ·/]a82d2576451c0eb78780f7f1e9c1b88e00000000 ¸/]a82d2576451c0eb78780f7f1e9c1b88e00000000 ¹/]a82d2576451c0eb78780f7f1e9c1b88e00000000 º/]a82d2576451c0eb78780f7f1e9c1b88e00000000 »/]a82d2576451c0eb78780f7f1e9c1b88e00000000 ¼/]a82d2576451c0eb78780f7f1e9c1b88e00000000 ½/]a82d2576451c0eb78780f7f1e9c1b88e00000000 ¾/]a82d2576451c0eb78780f7f1e9c1b88e00000000	 ¿/]a82d2576451c0eb78780f7f1e9c1b88e00000000
 À/]a82d2576451c0eb78780f7f1e9c1b88e00000000 Á/]a82d2576451c0eb78780f7f1e9c1b88e00000000 Â/]a82d2576451c0eb78780f7f1e9c1b88e00000000 Ã/]a82d2576451c0eb78780f7f1e9c1b88e00000000 Ä/]a82d2576451c0eb78780f7f1e9c1b88e00000000 Å/]a82d2576451c0eb78780f7f1e9c1b88e00000000 Æ/]a82d2576451c0eb78780f7f1e9c1b88e00000000 Ç/]a82d2576451c0eb78780f7f1e9c1b88e00000000 È/]a82d2576451c0eb78780f7f1e9c1b88e00000000 É/]a82d2576451c0eb78780f7f1e9c1b88e00000000 Ê/]a82d2576451c0eb78780f7f1e9c1b88e00000000 Ë/]a82d2576451c0eb78780f7f1e9c1b88e00000000 Ì/]a91cc5434272e1671d042733c3a19f4700000000 y/]a91cc5434272e1671d042733c3a19f4700000000z/]a91cc5434272e1671d042733c3a19f4700000000{/]a91cc5434272e1671d042733c3a19f4700000000|/]a91cc5434272e1671d042733c3a19f4700000000}/]a91cc5434272e1671d042733c3a19f4700000000~/]a91cc5434272e1671d042733c3a19f4700000000/]a91cc5434272e1671d042733c3a19f4700000000€/]a92d3a292286b8ab0e37d5c84583180600000000 f/]a92d3a292286b8ab0e37d5c84583180600000000g/]a92d3a292286b8ab0e37d5c84583180600000000h/]a92d3a292286b8ab0e37d5c84583180600000000i/]a92d3a292286b8ab0e37d5c84583180600000000j/]a92d3a292286b8ab0e37d5c84583180600000000k/]a92d3a292286b8ab0e37d5c84583180600000000l/]a92d3a292286b8ab0e37d5c84583180600000000m/]a92d3a292286b8ab0e37d5c84583180600000000n/]a92d3a292286b8ab0e37d5c84583180600000000	o/]a92d3a292286b8ab0e37d5c84583180600000000
p/]a92d3a292286b8ab0e37d5c84583180600000000q/]a92d3a292286b8ab0e37d5c84583180600000000r/]a92d3a292286b8ab0e37d5c84583180600000000s/]a9310931a53380588cf72be5cb21e99500000000 ]/]a9310931a53380588cf72be5cb21e99500000000^/]a9310931a53380588cf72be5cb21e99500000000_/]a9310931a53380588cf72be5cb21e99500000000`/]a9310931a53380588cf72be5cb21e99500000000a/]a9310931a53380588cf72be5cb21e99500000000b/]a9310931a53380588cf72be5cb21e99500000000c/]a9310931a53380588cf72be5cb21e99500000000d/]a9310931a53380588cf72be5cb21e99500000000e/]a94cae4fa3b34c805c9ee17f25a60ba900000000 S/]a94cae4fa3b34c805c9ee17f25a60ba900000000T/]a94cae4fa3b34c805c9ee17f25a60ba900000000U/]a94cae4fa3b34c805c9ee17f25a60ba900000000V/]a94cae4fa3b34c805c9ee17f25a60ba900000000W/]a94cae4fa3b34c805c9ee17f25a60ba900000000X/]a94cae4fa3b34c805c9ee17f25a60ba900000000Y/]a94cae4fa3b34c805c9ee17f25a60ba900000000Z/]a94cae4fa3b34c805c9ee17f25a60ba900000000[/]a94cae4fa3b34c805c9ee17f25a60ba900000000	\/]a9b575c7c474f6130edd011ffea60f7700000000 I/]a9b575c7c474f6130edd011ffea60f7700000000J/]a9b575c7c474f6130edd011ffea60f7700000000K/]a9b575c7c474f6130edd011ffea60f7700000000L/]a9b575c7c474f6130edd011ffea60f7700000000M/]a9b575c7c474f6130edd011ffea60f7700000000N/]a9b575c7c474f6130edd011ffea60f7700000000O/]a9b575c7c474f6130edd011ffea60f7700000000P/]a9b575c7c474f6130edd011ffea60f7700000000Q/]a9b575c7c474f6130edd011ffea60f7700000000	R/]b0da145b6c7c7169ee8045cedbeceb4800000000™/]b0da145b6c7c7169ee8045cedbeceb4800000000 ˜/]b0da145b6c7c7169ee8045cedbeceb4800000000›/]b0da145b6c7c7169ee8045cedbeceb4800000000š/]b0da145b6c7c7169ee8045cedbeceb4800000000/]b0da145b6c7c7169ee8045cedbeceb4800000000œ/]b0da145b6c7c7169ee8045cedbeceb4800000000Ÿ/]b0da145b6c7c7169ee8045cedbeceb4800000000/]c5d788dacd289dfb7270a6e0ff67abed00000000µ/]c5d788dacd289dfb7270a6e0ff67abed00000000´/]c5d788dacd289dfb7270a6e0ff67abed00000000 ³/]c73b718688fc0fab90ba5d3530546eb800000000²/]c73b718688fc0fab90ba5d3530546eb800000000±/]c73b718688fc0fab90ba5d3530546eb800000000°/]c73b718688fc0fab90ba5d3530546eb800000000¯/]c73b718688fc0fab90ba5d3530546eb800000000®/]c73b718688fc0fab90ba5d3530546eb800000000­/]c73b718688fc0fab90ba5d3530546eb800000000¬/]c73b718688fc0fab90ba5d3530546eb800000000«/]c73b718688fc0fab90ba5d3530546eb800000000 ª/]b7e5db408310ea00a46916f2bf55a5c300000000Â/]b7e5db408310ea00a46916f2bf55a5c300000000Á/]b7e5db408310ea00a46916f2bf55a5c300000000À/]b7e5db408310ea00a46916f2bf55a5c300000000¿/]b7e5db408310ea00a46916f2bf55a5c300000000¾/]b7e5db408310ea00a46916f2bf55a5c300000000 ½/]c5d788dacd289dfb7270a6e0ff67abed00000000º/]c5d788dacd289dfb7270a6e0ff67abed00000000¹/]c5d788dacd289dfb7270a6e0ff67abed00000000¸/]c5d788dacd289dfb7270a6e0ff67abed00000000·/]c5d788dacd289dfb7270a6e0ff67abed00000000¶/]ab38c55ead220e8c1e61aa6a536efd5700000000 /]ab38c55ead220e8c1e61aa6a536efd5700000000/]ab38c55ead220e8c1e61aa6a536efd5700000000/]ab38c55ead220e8c1e61aa6a536efd5700000000/]ab38c55ead220e8c1e61aa6a536efd5700000000/]ab38c55ead220e8c1e61aa6a536efd5700000000/]ab38c55ead220e8c1e61aa6a536efd5700000000/]ab38c55ead220e8c1e61aa6a536efd5700000000/]ab38c55ead220e8c1e61aa6a536efd5700000000/]ab38c55ead220e8c1e61aa6a536efd5700000000	 /]ab38c55ead220e8c1e61aa6a536efd5700000000
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
Ø/]b24f2f5612e5805bd47a3644493c6f3400000000	×/]b24f2f5612e5805bd47a3644493c6f3400000000Ö/]b24f2f5612e5805bd47a3644493c6f3400000000Õ/]b24f2f5612e5805bd47a3644493c6f3400000000Ô/]b24f2f5612e5805bd47a3644493c6f3400000000Ó/]b24f2f5612e5805bd47a3644493c6f3400000000Ò/]b24f2f5612e5805bd47a3644493c6f3400000000Ñ/]b1fa4d66bb99c1a8723596dfbe575b0200000000ß/]d73af698f5aôöÿ÷ğò¢ñ¢õğ¥òôò÷¥şğôòööööööööÆ×éÂ›ÇÄ¢ñõ§ ğÿş ó§ôöÿ÷ğò¢ñ¢õğ¥òôò÷¥şğôòööööööööÇ×éÂ›ÇÄ¢ñõ§ ğÿş ó§ôöÿ÷ğò¢ñ¢õğ¥òôò÷¥şğôòööööööööÄ×éÂ›ÇÄ¢ñõ§ ğÿş ó§ôöÿ÷ğò¢ñ¢õğ¥òôò÷¥şğôòööööööööÅ×éÂ›ÇÄ¢ñõ§ ğÿş ó§ôöÿ÷ğò¢ñ¢õğ¥òôò÷¥şğôòööööööööÂ×éÂ›ÇÄ¢ñõ§ ğÿş ó§ôöÿ÷ğò¢ñ¢õğ¥òôò÷¥şğôòööööööööÃ×éÂ›ÇÄ¢ñõ§ ğÿş ó§ôöÿ÷ğò¢ñ¢õğ¥òôò÷¥şğôòööööööööÀ×éÂ›ÇÄ¢ñõ§ ğÿş ó§ôöÿ÷ğò¢ñ¢õğ¥òôò÷¥şğôòööööööööÁ×éÂ›ÇÄ¢ñõ§ ğÿş ó§ôöÿ÷ğò¢ñ¢õğ¥òôò÷¥şğôòööööööööÎ×éÂ›ÇÄ¢ñõ§ ğÿş ó§ôöÿ÷ğò¢ñ¢õğ¥òôò÷¥şğôòööööööööÏ×éÂ›ÇÄ¢ñõ§ ğÿş ó§ôöÿ÷ğò¢ñ¢õğ¥òôò÷¥şğôòööööööööÌ×´¯º {v{{z¦i"{nµmrm?mmÃmˆlUllßl¤cac.cëc°b}b:bbÌb‰aVaaØa¥`b`/`ô`±g~gDggÎg‹fPffÚf§ele*e÷e¼dzdGddÉd–[S[[å[¢ZoZ4ZñZ¾Y{Y@YYÊY—X\XXæX¬_i_6_ó_¸_…^B^^Ô^‘]^]]à]­\j\7\ü\¹\†SCSSÕS’R_R$RáR®QkQ0QıQºQ‡PLP	PÖP“WXW%WãW¨VvV3VøVÅV‚UOUUÑUT[T TíTªKwK<KùKÆKƒJHJJÒJŸIdI!IîI«HpH=HûHÀHOJOOÜO™NfN#NèNµMrM?MMÃM‰LWLLÛL¡CoC5CóC¹C‡BMBBÑBŸAeA#AéA·@}@;@@Ï@•GSGGæG£FhF5FòF¿F„EAEEËED]DDçD¬;i;6;ó;¸;…:B::Ô:‘9^99à9­8j878ü8¹8†?C??Õ?’>_>$>á>¯=t=2=ÿ=Ä=<N<<Ğ<3Z3'3ì3©2v232ø2Å2‚1H11Ò1Ÿ0d0!0î0«7p7=7û7À76J66İ6š5`5.5ô5²4x4F4wO±OëP%P_P™PÔQQJQ…QÀQûR6RqR¬RçS"S]S˜SÓTTHTƒT¾TùU4UoUªUåV VZV•VĞWWEW€W»WõX0XkX¦XáYYWY’YÍZZCZ~Z¹Zô[/[j[¥[à\\V\‘\Ì]]A]|]·]ò^,^g^¢^İ__S__É``?`z`µ`ğa+afa¡aÜbbRbbÈcc>cyc´cïd*ded dÛeeQeŒeÇff=fxf³fîg)gdgŸgÙhhMh‡hÁhüi7iri­ièj#j^j™jÔkkJk…kÀkûl6lql¬lçm"m]m˜mÓnnIn„n¿núo5opo«oæp!p\p–pÑqqGq‚q½qør3rnr©rässZs•sÏt
tEt€t»töu1uku¦uávvWv’vÍwwBw}w¸wóx-xhx£xŞyyTyyÊzz@z{zñ{,{g{¡{Ü||R||È}}>}y}´}ï~*~e~ ~ÚPŠÅ“z¶Xâ§l1ö»€E
Ï”YhiNi‰o4ù¾ƒHÔš`&ë°u:ÿÄ‰NØb'ì±v; 
Å
Š
O
	Ù		c	(í²w<Æ‹QÛ e*ï´y>ÈR           7¢j]ca8¥]b0da145b6c7c7169ee8045cedbeceb4800000000   úìÍi8¥]b0da145b6c7c7169ee8045cedbeceb4800000000   ïN}Z8¥]b0da145b6c7c7169ee8045cedbeceb4800000000   Ú	*¦ñ8¥]b0da145b6c7c7169ee8045cedbeceb4800000000    /aßx¢8¥]7b4192573146a776655969957e2cc67500000000	•7şŠÄ°8¥]7b4192573146a776655969957e2cc67500000000   ˆz—p8¥]7b4192573146a776655969957e2cc67500000000   Ûİ|!ë8¥]7b4192573146a776655969957e2cc67500000000   l0”8¥]7b4192573146a776655969957e2cc67500000000   =ÿÊ8¥]7b4192573146a776655969957e2cc67500000000   J¹wá¦8¥]7b4192573146a776655969957e2cc67500000000   ¤ÚCF8¥]7b4192573146a776655969957e2cc67500000000   Pz–ÀÌ8¥]7b4192573146a776655969957e2cc67500000000   tU–kÊ7¥]7b4192573146a776655969957e2cc67500000000    Ü@[u8¥]5f378aa5eb6eea8f9e35149d749ecd2c00000000H&İ1^¯8¥]5f378aa5eb6eea8f9e35149d749ecd2c00000000   ,MIÌœ8¥]5f378aa5eb6eea8f9e35149d749ecd2c00000000
   µgİâÛ8¥
]5f378aa5eb6eea8f9e35149d749ecd2c00000000	   ÓÓ³(‡8¥	]5f378aa5eb6eea8f9e35149d749ecd2c00000000   v¢Õş8¥]5f378aa5eb6eea8f9e35149d749ecd2c00000000   º+†ñœ8¥]5f378aa5eb6eea8f9e35149d749ecd2c00000000   >º –8¥]5f378aa5eb6eea8f9e35149d749ecd2c00000000   Uúá8¥]5f378aa5eb6eea8f9e35149d749ecd2c00000000   .ı8¥]5f378aa5eb6eea8f9e35149d749ecd2c00000000    1jMç8¥]5f378aa5eb6eea8f9e35149d749ecd2c00000000   ÄÙºY¶8¥]5f378aa5eb6eea8f9e35149d749ecd2c00000000   hr’hY8¥]5f378aa5eb6eea8f9e35149d749ecd2c00000000    aväHT8¥ ]4b65edee40214477459fdde053dcfef600000000(­/%ÎÅ ˆ8¤]4b65edee40214477459fdde053dcfef600000000   iğ ˜ è8¤~]4b65edee40214477459fdde053dcfef600000000   %¼¯ª8¤}]4b65edee40214477459fdde053dcfef600000000   Uè6N8¤|]4b65edee40214477459fdde053dcfef600000000   f]V›8¤{]4b65edee40214477459fdde053dcfef600000000   ï%g¡8¤z]4b65edee40214477459fdde053dcfef600000000   åQi¨¥8¤y]4b65edee40214477459fdde053dcfef600000000   Æg½8¤x]4b65edee40214477459fdde053dcfef600000000    ñ0{(8¤w]182cc0a47d0b18f388cdced47fcb519600000000
Å˜Qô3 Œ8¤v]182cc0a47d0b18f388cdced47fcb519600000000	   Pÿ&ä8¤u]182cc0a47d0b18f388cdced47fcb519600000000   ­ié|8¤t]182cc0a47d0b18f388cdced47fcb519600000000   [Óı3.8¤s]182cc0a47d0b18f388cdced47fcb519600000000   Ì^&ÖŠ8¤r]182cc0a47d0b18f388cdced47fcb519600000000   Îxbÿ8¤q]182cc0a47d0b18f388cdced47fcb519600000000   t½R58¤p]182cc0a47d0b18f388cdced47fcb519600000000   cË/eP8¤o]182cc0a47d0b18f388cdced47fcb519600000000   ªØe‹ º8¤n]182cc0a47d0b18f388cdced47fcb519600000000   ‚q=8¤m]182cc0a47d0b18f388cdced47fcb519600000000    ·á$¡Ÿ7¤l]973823f32481e213da49eedc8f8efea700000000INô­½ş7¤k]973823f32481e213da49eedc8f8efea700000000   uS…ş7¤j]7225167323061e72579b3c5ddd6b289d00000000ŠØ*×ş7¤i]7225167323061e72579b3c5ddd6b289d00000000    ƒ4¸ş7¤h]973823f32481e213da49eedc8f8efea700000000    j{Kş8¤g]0a33d46556273a166e35e825593489bc00000000—ÜƒÇ®]Î8¤f]0a33d46556273a166e35e825593489bc00000000   0H¬ Ä8¤e]0a33d46556273a166e35e825593489bc00000000   È¾ä8¤d]0a33d46556273a166e35e825593489bc00000000   GŸ î8¤c]0a33d46556273a166e35e825593489bc00000000   o^>O!8¤b]0a33d46556273a166e35e825593489bc00000000
   mÓı»o8£l]2d1f962a92fc8df0b8646348439ee57f00000000	   ‡­€8£k]2d1f962a92fc8df0b8646348439ee57f00000000   )¡ÃC8£j]2d1f962a92fc8df0b8646348439ee57f00000000   8Í?¾8¥b]b1fa4d66bb99c1a8723596dfbe575b0200000000   µ¬:e~8¥a]b1fa4d66bb99c1a8723596dfbe575b0200000000   äüg™8¥`]b1fa4d66bb99c1a8723596dfbe575b0200000000   ë<º58¥_]b1fa4d66bb99c1a8723596dfbe575b0200000000   ¹fÎ§u8¥^]b1fa4d66bb99c1a8723596dfbe575b0200000000   ¨üŸw@8¥]]b1fa4d66bb99c1a8723596dfbe575b0200000000   ?Å˜2ù8¥\]b1fa4d66bb99c1a8723596dfbe575b0200000000    ¨Eô¶Ç8¥[]b24f2f5612e5805bd47a3644493c6f3400000000óÑy¹—#8¥Z]b24f2f5612e5805bd47a3644493c6f3400000000   Ò£SL8¥Y]b24f2f5612e5805bd47a3644493c6f3400000000   cY¶ÿ8¥X]b24f2f5612e5805bd47a3644493c6f3400000000
   ¼Ãj8¥W]b24f2f5612e5805bd47a3644493c6f3400000000	   º)L—8¥V]b24f2f5612e5805bd47a3644493c6f3400000000   ¦P¹!8¥U]b24f2f5612e5805bd47a3644493c6f3400000000   F8èŒŠ8¥S]b24f2f5612e5805bd47a3644493c6f3400000000   Uš8 ]f40dcd570407982a76575ff1a645616900000000   vîl‰C8 ]f40dcd570407982a76575ff1a645616900000000HĞÊë’p7 ]872bc3e6cf3d67f833351e2a3fb0aa3600000000    Æ6|ş7 ]872bc3e6cf3d67f833351e2a3fb0aa3600000000¨šuò,ş8 ]731c9324dc0d34a9d7a713072c13f16c00000000   Út
×‡8 ]731c9324dc0d34a9d7a713072c13f16c00000000    ÌIAè8 ]731c9324dc0d34a9d7a713072c13f16c00000000   <ú°Æ8 ]731c9324dc0d34a9d7a713072c13f16c00000000   5íšÑ8 ]731c9324dc0d34a9d7a713072c13f16c00000000   w-sƒÓ8 ]731c9324dc0d34a9d7a713072c13f16c00000000   Ñé*¹8 ]731c9324dc0d34a9d7a713072c13f16c00000000   zBßFD8 ]731c9324dc0d34a9d7a713072c13f16c00000000   Ìî„5ú8 ]731c9324dc0d34a9d7a713072c13f16c00000000   ğkş¬²8 ]731c9324dc0d34a9d7a713072c13f16c00000000	   Xİ‚Ë`8 ]731c9324dc0d34a9d7a713072c13f16c00000000
   \0.¿8 ]731c9324dc0d34a9d7a713072c13f16c00000000   êëÍ8 ]731c9324dc0d34a9d7a713072c13f16c00000000   ×@¸nÊ8 ]731c9324dc0d34a9d7a713072c13f16c00000000	[[şƒ!98 N]33cfc87af766f672dac2a8644bad559100000000   \™Œ$8 O]33cfc87af766f672dac2a8644bad559100000000    2‹v8 P]33cfc87af766f672dac2a8644bad559100000000    ÿ°œY8 Q]33cfc87af766f672dac2a8644bad559100000000   Ô½òGl8 R]33cfc87af766f672dac2a8644bad559100000000   $4pè8 S]33cfc87af766f672dac2a8644bad559100000000   Së€‘8 T]33cfc87af766f672dac2a8644bad559100000000   ¢áÕr8 U]33cfc87af766f672dac2a8644bad559100000000   0qçÄ8 V]33cfc87af766f672dac2a8644bad559100000000ÛIˆ'ì7 W]32026b70d71de71748f5c86048703e2e00000000    vÚ:8 X]32026b70d71de71748f5c86048703e2e00000000   0ˆÛµ­8 Y]32026b70d71de71748f5c86048703e2e00000000   ç_œ{<8 Z]32026b70d71de71748f5c86048703e2e00000000   .§e8 []32026b70d71de71748f5c86048703e2e00000000   ÈK{ Õ8 \]32026b70d71de71748f5c86048703e2e00000000   ‚‡8 ]]32026b70d71de71748f5c86048703e2e00000000   †ä¢Ä 8 ^]32026b70d71de71748f5c86048703e2e00000000   Å­ˆBÜ8 _]32026b70d71de71748f5c86048703e2e00000000   ñù|?7 `]32026b70d71de71748f5c86048703e2e00000000	   €g}Ãv8 a]32026b70d71de71748f5c86048703e2e00000000
   llõc8 b]32026b70d71de71748f5c86048703e2e00000000   .ğF^€7 c]32026b70d71de71748f5c86048703e2e00000000   ‡pt*8 d]32026b70d71de71748f5c86048703e2e00000000   "q Û8 e]32026b70d71de71748f5c86048703e2e00000000   dÔ(ú8 f]32026b70d71de71748f5c86048703e2e00000000   ‡qdV8 g]32026b70d71de71748f5c86048703e2e00000000   (UÀFj8 h]32026b70d71de71748f5c86048703e2e00000000   1û#W¦8 i]32026b70d71de71748f5c86048703e2e00000000   xó×o×8 j]32026b70d71de71748f5c86048703e2e00000000   ^¦¶»8 k]32026b70d71de71748f5c86048703e2e00000000   ™ÑW*w8 l]32026b70d71de71748f5c86048703e2e00000000   :9Üı8 m]32026b70d71de71748f5c86048703e2e00000000   ÖK<^/8 n]32026b70d71de71748f5c86048703e2e00000000   ‹·œ)8 o]32026b70d71de71748f5c86048703e2e00000000   }T8 p]32026b70d71de71748f5c86048703e2e00000000   o¬å8 q]32026b70d71de71748f5c86048703e2e00000000   ¨©A&78 r]32026b70d71de71748f5c86048703e2e00000000   µt!Å8 s]32026b70d71de71748f5c86048703e2e00000000   `åY±8 t]32026b70d71de71748f5c86048703e2e00000000   2ÌT}«8 u]32026b70d71de71748f5c86048703e2e00000000   -²lô8 v]32026b70d71de71748f5c86048703e2e00000000   ÿr›æ=8 w]32026b70d71de71748f5c86048703e2e00000000    ½¥&Ä7 x]32026b70d71de71748f5c86048703e2e00000000!8¡=,Cë{8¡&]079b11c4a8e40d22000b1d85b281e4b600000000    U9àö8¡']079b11c4a8e40d22000b1d85b281e4b600000000   ©O†tI8¡(]079b11c4a8e40d22000b1d85b281e4b600000000   ‡»½YÅ8¡)]079b11c4a8e40d22000b1d85b281e4b600000000   äB†nø8¡*]079b11c4a8e40d22000b1d85b281e4b600000000   $ø2RÄ8¡+]079b11c4a8e40d22000b1d85b281e4b600000000   'ú?ëx8¡,]079b11c4a8e40d22000b1d85b281e4b600000000   ß?Ë‹8¡-]079b11c4a8e40d22000b1d85b281e4b600000000   ¥íu Œ8¡.]079b11c4a8e40d22000b1d85b281e4b600000000
Ö‡BÆ8¡5]01ee438a4d76cc2a88ad20f0f5f29efc00000000    d4ù«+8¡6]01ee438a4d76cc2a88ad20f0f5f29efc00000000   qAÌİ8¡7]01ee438a4d76cc2a88ad20f0f5f29efc00000000   Úo58¡8]01ee438a4d76cc2a88ad20f0f5f29efc00000000   “‹F0€8¡9]01ee438a4d76cc2a88ad20f0f5f29efc00000000   ~âÉ‰I8¡:]01ee438a4d76cc2a88ad20f0f5f29efc00000000   z€Â·8¡;]01ee438a4d76cc2a88ad20f0f5f29efc00000000   –ÁY8¡<]01ee438a4d76cc2a88ad20f0f5f29efc00000000   >Ä‹Í¯8¡=]01ee438a4d76cc2a88ad20f0f5f29efc00000000÷—ã{8¡>]96c3e95770cfb112dba7cfeb5636f8a500000000    –Ÿ¾µ8¡?]96c3e95770cfb112dba7cfeb5636f8a500000000   y!Eü 8¡@]96c3e95770cfb112dba7cfeb5636f8a500000000   (Õ!8¡A]96c3e95770cfb112dba7cfeb5636f8a500000000   „¨ñÑ8¡B]96c3e95770cfb112dba7cfeb5636f8a500000000   Z£Wƒ8¡C]96c3e95770cfb112dba7cfeb5636f8a500000000   Æ¦4B8¡D]96c3e95770cfb112dba7cfeb5636f8a500000000   ±×¼±08¡E]96c3e95770cfb112dba7cfeb5636f8a500000000   È”­gœ8¡F]96c3e95770cfb112dba7cfeb5636f8a500000000	   ¬é"8¡G]96c3e95770cfb112dba7cfeb5636f8a500000000   hı¹,8¡H]96c3e95770cfb112dba7cfeb5636f8a500000000   ÖVƒü8¡I]96c3e95770cfb112dba7cfeb5636f8a500000000
   Å!¿b©8¡J]96c3e95770cfb112dba7cfeb5636f8a500000000   ‚/ÓtÂ8¡K]96c3e95770cfb112dba7cfeb5636f8a500000000tøÔÛ¼ƒ8¡L]fdcd6ebb6de1659a00ed65e3027777c100000000    ëm¢òI8¡M]fdcd6ebb6de1659a00ed65e3027777c100000000   E ¥.}8¡N]fdcd6ebb6de1659a00ed65e3027777c100000000   %!2R8¡O]fdcd6ebb6de1659a00ed65e3027777c100000000   Ö\wV8¡P]fdcd6ebb6de1659a00ed65e3027777c100000000   ç4r7¡Q]fdcd6ebb6de1659a00ed65e3027777c100000000   £±:o8¡R]fdcd6ebb6de1659a00ed65e3027777c100000000   ÓÇŞáJ7¡S]fdcd6ebb6de1659a00ed65e3027777c100000000   d©í³}8¡T]fdcd6ebb6de1659a00ed65e3027777c100000000Šä»Ë0'ì8¡c]fca4ffad422a77ff1d9304da6062600a00000000    «êÓ=8¡d]fca4ffad422a77ff1d9304da6062600a00000000   ÖXô á8¡e]fca4ffad422a77ff1d9304da6062600a00000000   >(ƒÏ8¡f]fca4ffad422a77ff1d9304da6062600a00000000   ª”ø–H8¡g]fca4ffad422a77ff1d9304da6062600a00000000   ¨8¡h]fca4ffad422a77ff1d9304da6062600a00000000   9óWe8¡i]fca4ffad422a77ff1d9304da6062600a00000000   ©9ûä8¡j]fca4ffad422a77ff1d9304da6062600a00000000   kĞ9É¥8¡k]fca4ffad422a77ff1d9304da6062600a00000000   ±ÖÒŒ8¡l]fca4ffad422a77ff1d9304da6062600a00000000	   âQ±X8¡m]fca4ffad422a77ff1d9304da6062600a00000000
=çyÌSl8¡n]fc97cbf676147f173a0e790038dc8cf000000000    ní×=¶8¡o]fc97cbf676147f173a0e790038dc8cf000000000   Uû°”8¡p]fc97cbf676147f173a0e790038dc8cf000000000   ¸22Î8¡q]fc97cbf676147f173a0e790038dc8cf000000000   Æâyğg8¡r]fc97cbf676147f173a0e790038dc8cf000000000   ;ñş8¡s]fc97cbf676147f173a0e790038dc8cf000000000   –ƒ¨œ8¡t]fc97cbf676147f173a0e790038dc8cf000000000   ª¿—Ö8¡u]fc97cbf676147f173a0e790038dc8cf000000000   NñˆZ8¡v]fc97cbf676147f173a0e790038dc8cf000000000×¯íà‡8¡]fb1558e8e0d5c4f1ef04ccd621ec9ada00000000    ÚAÁ8¢ ]fb1558e8e0d5c4f1ef04ccd621ec9ada00000000   ›Êüıì8¢]fb1558e8e0d5c4f1ef04ccd621ec9ada00000000   °¾1wÏ8¢]fb1558e8e0d5c4f1ef04ccd621ec9ada00000000   >å{-‚8¢]fb1558e8e0d5c4f1ef04ccd621ec9ada00000000   $©àH8¢]fb1558e8e0d5c4f1ef04ccd621ec9ada00000000   ­VÓ7¢]fb1558e8e0d5c4f1ef04ccd621ec9ada00000000   e"Æ¸68¢]fb1558e8e0d5c4f1ef04ccd621ec9ada00000000   –ùG8¢]fb1558e8e0d5c4f1ef04ccd621ec9ada00000000   CÜÿo¢8¢]fb1558e8e0d5c4f1ef04ccd621ec9ada00000000	îX†ûë8¢N]52587487fae773dfc083d5c737b553a300000000    <…#È8¢O]52587487fae773dfc083d5c737b553a300000000   ´R8¢P]52587487fae773dfc083d5c737b553a300000000   ßğ}ğ8¢Q]52587487fae773dfc083d5c737b553a300000000   IÚ7—ƒ8¢R]52587487fae773dfc083d5c737b553a300000000   q’•58¢S]52587487fae773dfc083d5c737b553a300000000   ªpÎ'ƒ8¢T]52587487fae773dfc083d5c737b553a300000000   ¹¿ÕÂ8¢U]52587487fae773dfc083d5c737b553a300000000   ,<œ38¢V]52587487fae773dfc083d5c737b553a300000000Kiâ<f "7¢W]cacdc1d4d9aef7c4b5dea5fef63c266d00000000    Ù—ßş7¢X]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   İ Âqş7¢Y]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   ¾¼»wş7¢Z]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   ÷S¦ş7¢[]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   ˜Xêş7¢\]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   ™VcÛş7¢]]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   Rq¹4ş7¢^]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   @8$pş7¢_]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   Un*ş7¢`]cacdc1d4d9aef7c4b5dea5fef63c266d00000000	   lÆ¯Hş7¢a]cacdc1d4d9aef7c4b5dea5fef63c266d00000000
   ywÚ¯ş7¢b]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   ÅzÁ‰ş7¢c]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   ã˜5ş7¢d]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   ^‘ë]ş7¢e]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   ‹Íü-ş7¢f]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   Ùµş7¢g]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   Ì›şÃş7¢h]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   \ÂDş7¢i]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   Ó¥³Úş7¢j]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   6ÏAFş7¢k]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   [ûòş7¢l]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   ùÙ§ş7¢m]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   lÙ"ş7¢n]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   T®¬ş7¢o]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   Ş}™^ş7¢p]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   3d:êş7¢q]cacdc1d4d9aef7c4b5dea5fef63c266d00000000ú +Û¸ş8¢r]3aa6563d26bbe67afc865f88276d7f0800000000    ´À×/™8¢s]3aa6563d26bbe67afc865f88276d7f0800000000   ß“á¯8¢t]3aa6563d26bbe67afc865f88276d7f0800000000   ƒ‹¢ÿ8¢u]3aa6563d26bbe67afc865f88276d7f0800000000   "Wç˜8¢v]3aa6563d26bbe67afc865f88276d7f0800000000   ,ºå¢Ë8¢w]3aa6563d26bbe67afc865f88276d7f0800000000   zÏBu‘8¢x]3aa6563d26bbe67afc865f88276d7f0800000000   n{«V†8¢y]3aa6563d26bbe67afc865f88276d7f0800000000   °fõn«8¢z]3aa6563d26bbe67afc865f88276d7f0800000000«¶XÍF› Ò8¢{]374ad4b329b067fd8d6b66a1aba8b77c00000000   ¶4Pœë8¢|]374ad4b329b067fd8d6b66a1aba8b77c00000000    ;ÆıÓY8¢}]374ad4b329b067fd8d6b66a1aba8b77c00000000   µA/#O8¢~]374ad4b329b067fd8d6b66a1aba8b77c00000000   ‚%şñ18¢]374ad4b329b067fd8d6b66a1aba8b77c00000000   0™A±\8£ ]374ad4b329b067fd8d6b66a1aba8b77c00000000   y
œêª8£]374ad4b329b067fd8d6b66a1aba8b77c00000000   {„¢äÃ8£]374ad4b329b067fd8d6b66a1aba8b77c00000000   è‰ §8£]374ad4b329b067fd8d6b66a1aba8b77c00000000   ˆŠ‡¦±8£]374ad4b329b067fd8d6b66a1aba8b77c00000000
5 {_/Rñ8£]374ad4b329b067fd8d6b66a1aba8b77c00000000	   ¡XÇB8£]2f2ae1310006f977237ca740644a970300000000    W(¡s8£]2f2ae1310006f977237ca740644a970300000000   ¤¬“q8£]2f2ae1310006f977237ca740644a970300000000   cKig 8£	]2f2ae1310006f977237ca740644a970300000000|n^7T~8£]2e9aa11855510169ba3a3dbed2f4393100000000    îæŞÑ`8£]2e9aa11855510169ba3a3dbed2f4393100000000   ĞãßNF8£]2e9aa11855510169ba3a3dbed2f4393100000000   OW{8£]2e9aa11855510169ba3a3dbed2f4393100000000   ÇØë:8£]2e9aa11855510169ba3a3dbed2f4393100000000   şwËtÒ8£]2e9aa11855510169ba3a3dbed2f4393100000000†FZ,:µ8£]2e9aa11855510169ba3a3dbed2f4393100000000   >Ù¥m%8£]2d9f5bc182f8945e8e03d73bd192317200000000    ÜÖºa8£]2d9f5bc182f8945e8e03d73bd192317200000000   ĞÖıg8£]2d9f5bc182f8945e8e03d73bd192317200000000   L\‘Œ8£]2d9f5bc182f8945e8e03d73bd192317200000000   é„¹p/8£]2d9f5bc182f8945e8e03d73bd192317200000000   E…ã›a8£]2d9f5bc182f8945e8e03d73bd192317200000000   Â7/\8£]2d9f5bc182f8945e8e03d73bd192317200000000   ®-8£ ]2d9f5bc182f8945e8e03d73bd192317200000000	   ¸SD.8£!]2d9f5bc182f8945e8e03d73bd192317200000000   aI…87£"]2d9f5bc182f8945e8e03d73bd192317200000000   û©×€_8£#]2d9f5bc182f8945e8e03d73bd192317200000000   ,³­'Î7£$]2d9f5bc182f8945e8e03d73bd192317200000000
   WlŞ¯V8£%]2d9f5bc182f8945e8e03d73bd192317200000000   ?Z{¤†8£&]2d9f5bc182f8945e8e03d73bd192317200000000   «Å“zL8£']2d9f5bc182f8945e8e03d73bd192317200000000   ;²9$–8£(]2d9f5bc182f8945e8e03d73bd192317200000000   >f¸=|8£)]2d9f5bc182f8945e8e03d73bd192317200000000   BÉÿß½8£*]2d9f5bc182f8945e8e03d73bd192317200000000   £ä¤µ8£+]2d9f5bc182f8945e8e03d73bd192317200000000   ¨¯Í ˜8£,]2d9f5bc182f8945e8e03d73bd192317200000000   s )68£-]2d9f5bc182f8945e8e03d73bd192317200000000   ÉÅÌ³§8£.]2d9f5bc182f8945e8e03d73bd192317200000000   2£ºC8£/]2d9f5bc182f8945e8e03d73bd192317200000000   m¨§¼8£0]2d9f5bc182f8945e8e03d73bd192317200000000   -µ~d08£1]2d9f5bc182f8945e8e03d73bd192317200000000   Ü×^ È8£2]2d9f5bc182f8945e8e03d73bd192317200000000   ¨Ù¬x8£3]2d9f5bc182f8945e8e03d73bd192317200000000   ÷´°\8£4]2d9f5bc182f8945e8e03d73bd192317200000000   °ƒ®Wå7£5]2d9f5bc182f8945e8e03d73bd192317200000000²b“:
8£D]2d3856be29f5ada6fa14b98ca1b504cf00000000   ˆ½ßå08£E]2d3856be29f5ada6fa14b98ca1b504cf00000000    Whœ	 ú8£F]2d3856be29f5ada6fa14b98ca1b504cf00000000   Y8Iõ8£G]2d3856be29f5ada6fa14b98ca1b504cf00000000   ä(}	U8£H]2d3856be29f5ada6fa14b98ca1b504cf00000000   iÉQ8£I]2d3856be29f5ada6fa14b98ca1b504cf00000000 ªlÌHà]8£J]2d286816b3c72b5aba3535f13d72dac100000000    ” Û•8£K]2d286816b3c72b5aba3535f13d72dac100000000   y©3À8£L]2d286816b3c72b5aba3535f13d72dac100000000   ¸¥‘7£M]2d286816b3c72b5aba3535f13d72dac100000000   lZÑ8£N]2d286816b3c72b5aba3535f13d72dac100000000   ¹·j*ô8£O]2d286816b3c72b5aba3535f13d72dac100000000   1¢uÿ]8£P]2d286816b3c72b5aba3535f13d72dac100000000   N‘s¾R7£Q]2d286816b3c72b5aba3535f13d72dac100000000   {•°r8£R]2d286816b3c72b5aba3535f13d72dac100000000
   }¡sh8£S]2d286816b3c72b5aba3535f13d72dac100000000   `"Ë7£T]d73af698f5a209164d7d36c4241c862400000000    µÖÎş7£U]d73af698f5a209164d7d36c4241c862400000000   ë#Kkş7£V]d73af698f5a209164d7d36c4241c862400000000   4§5„ş7£W]d73af698f5a209164d7d36c4241c862400000000   â¾íÀş7£X]d73af698f5a209164d7d36c4241c862400000000   tò¼ş7£Y]d73af698f5a209164d7d36c4241c862400000000   —¡„ş7£Z]d73af698f5a209164d7d36c4241c862400000000   Y$éqş7£[]d73af698f5a209164d7d36c4241c862400000000   iûhş7£\]d73af698f5a209164d7d36c4241c862400000000	   Ğ›U@ş7£]]d73af698f5a209164d7d36c4241c862400000000   ¬Rlş7£^]d73af698f5a209164d7d36c4241c862400000000
   JÀş7£_]d73af698f5a209164d7d36c4241c862400000000}hƒÖ[©ş8£`]2d286816b3c72b5aba3535f13d72dac100000000	   Şƒlc8£a]2d286816b3c72b5aba3535f13d72dac100000000   qğèŠü8£b]2d286816b3c72b5aba3535f13d72dac100000000R”Òº‚j8£c]2d1f962a92fc8df0b8646348439ee57f00000000    A*Ú„8£d]2d1f962a92fc8df0b8646348439ee57f00000000   }(í‘t8£e]2d1f962a92fc8df0b8646348439ee57f00000000   ßˆ8£f]2d1f962a92fc8df0b8646348439ee57f00000000   c±(³8£g]2d1f962a92fc8df0b8646348439ee57f00000000   ÉÒ¤3M8£h]2d1f962a92fc8df0b8646348439ee57f00000000   aıÖ´û8£i]2d1f962a92fc8df0b8646348439ee57f00000000   h""ı Á8£j]2d1f962a92fc8df0b8646348439ee57f00000000   8Í?¾ë8£k]2d1f962a92fc8df0b8646348439ee57f00000000   )¡ÃC8£l]2d1f962a92fc8df0b8646348439ee57f00000000	   ‡­€8£m]2d1f962a92fc8df0b8646348439ee57f00000000
    ½Š¢¹7£n]2d1f962a92fc8df0b8646348439ee57f00000000ƒe„M¡‘38£o]0d97805bc0f2c9c21da68110bd5d57ac00000000    	F'µû8£p]0d97805bc0f2c9c21da68110bd5d57ac00000000   ò¨T>+8£q]0d97805bc0f2c9c21da68110bd5d57ac00000000   à$2Ä8£r]0d97805bc0f2c9c21da68110bd5d57ac00000000   {’jiŸ8£s]0d97805bc0f2c9c21da68110bd5d57ac00000000   ÔöÇ	 8£t]0d97805bc0f2c9c21da68110bd5d57ac00000000   Ëjö8£u]0d97805bc0f2c9c21da68110bd5d57ac00000000   QœÂäÀ8£v]0d97805bc0f2c9c21da68110bd5d57ac00000000   Ú $L ®8£w]0d97805bc0f2c9c21da68110bd5d57ac00000000   D9ÿn7£x]0d97805bc0f2c9c21da68110bd5d57ac00000000	   wÂD8£y]0d97805bc0f2c9c21da68110bd5d57ac00000000
   è‚`AS8£z]0d97805bc0f2c9c21da68110bd5d57ac00000000   Œ÷ÌLE8£{]0d97805bc0f2c9c21da68110bd5d57ac00000000   é4+ğf7£|]0d97805bc0f2c9c21da68110bd5d57ac00000000   ƒ!YAc8£}]0d97805bc0f2c9c21da68110bd5d57ac00000000lETcXı8£~]0d5d4cd3f965a730380ed5e2fd85108000000000    ò[HÙ7£]0d5d4cd3f965a730380ed5e2fd85108000000000   ªp5~>8¤ ]0d5d4cd3f965a730380ed5e2fd85108000000000   €ÉMñ8¤]0d5d4cd3f965a730380ed5e2fd85108000000000   â³^l8¤]0d5d4cd3f965a730380ed5e2fd85108000000000   ªã ñq8¤]0d5d4cd3f965a730380ed5e2fd85108000000000   ²GòÜ8¤]0d5d4cd3f965a730380ed5e2fd85108000000000   â£4^8¤]0d5d4cd3f965a730380ed5e2fd85108000000000   5x”8¤]0d5d4cd3f965a730380ed5e2fd85108000000000   ´-n¢®8¤]0d5d4cd3f965a730380ed5e2fd85108000000000	   ÒÁQŠ ø8¤]0d5d4cd3f965a730380ed5e2fd85108000000000
   ¹—l^Á8¤	]0d5d4cd3f965a730380ed5e2fd85108000000000   Ä| Ô8¤
]0d5d4cd3f965a730380ed5e2fd85108000000000   Lt½ùW8¤]0d5d4cd3f965a730380ed5e2fd85108000000000   bèk,b8¤]0d5d4cd3f965a730380ed5e2fd85108000000000L ^ë668¤)]0aed894390076ecd817575171f950de600000000    oQ±î8¤*]0aed894390076ecd817575171f950de600000000   {Y+ğ8¤+]0aed894390076ecd817575171f950de600000000   .¸ò_Ø8¤,]0aed894390076ecd817575171f950de600000000   şSõ®"8¤-]0aed894390076ecd817575171f950de600000000   ë¤aŸ³8¤.]0aed894390076ecd817575171f950de600000000   <¨2ê8¤/]0aed894390076ecd817575171f950de600000000   2eÉ÷8¤0]0aed894390076ecd817575171f950de600000000   –0
( ğ8¤1]0aed894390076ecd817575171f950de600000000   Ú>Â?7¤2]0aed894390076ecd817575171f950de600000000	   ³`ÂzH8¤3]0aed894390076ecd817575171f950de600000000
   ¥Õœ½8¤4]0aed894390076ecd817575171f950de600000000   ¯Ó». Í8¤5]0aed894390076ecd817575171f950de600000000   v“tN Ï7¤6]0aed894390076ecd817575171f950de600000000   –¿›‹8¤7]0aed894390076ecd817575171f950de600000000   h)«Ñë8¤8]0aed894390076ecd817575171f950de600000000Ô×^&öş8¤9]0aa462192500bcb47c788fdf39a413cd00000000    eúŸî8¤:]0aa462192500bcb47c788fdf39a413cd00000000   Åº Š8¤;]0aa462192500bcb47c788fdf39a413cd00000000   Q˜{L8¤<]0aa462192500bcb47c788fdf39a413cd00000000   9pÜ8¤=]0aa462192500bcb47c788fdf39a413cd00000000   †SÅ	8¤>]0aa462192500bcb47c788fdf39a413cd00000000   óTÎØ8¤?]0aa462192500bcb47c788fdf39a413cd00000000€o4EYã8¤H]0a4e7f0855a84f68209705e5151e7b8a00000000    g],AH8¤I]0a4e7f0855a84f68209705e5151e7b8a00000000   ´êÿùœ8¤J]0a4e7f0855a84f68209705e5151e7b8a00000000   %P+V8¤K]0a4e7f0855a84f68209705e5151e7b8a00000000   
œÔÁ8¤L]0a4e7f0855a84f68209705e5151e7b8a00000000   †+r8¤M]0a4e7f0855a84f68209705e5151e7b8a00000000   +\û"28¤N]0a4e7f0855a84f68209705e5151e7b8a00000000   p$ì…€8¤O]0a4e7f0855a84f68209705e5151e7b8a00000000   e“ñ…8¤P]0a4e7f0855a84f68209705e5151e7b8a00000000   ‹O8¤Q]0a4e7f0855a84f68209705e5151e7b8a00000000	   x~’0“8¤R]0a4e7f0855a84f68209705e5151e7b8a00000000
   ŠÌ–÷N8¤S]0a4e7f0855a84f68209705e5151e7b8a00000000   2@dğ*8¤T]0a4e7f0855a84f68209705e5151e7b8a00000000   Â@¸ƒ8¤U]0a4e7f0855a84f68209705e5151e7b8a00000000   ğ6¹8¤V]0a4e7f0855a84f68209705e5151e7b8a00000000   €|ë"8¤W]0a4e7f0855a84f68209705e5151e7b8a00000000Ú<9²ú_8¤X]0a33d46556273a166e35e825593489bc00000000    }^¸½á8¤Y]0a33d46556273a166e35e825593489bc00000000   	[¶~68¤Z]0a33d46556273a166e35e825593489bc00000000   ğiT\48¤[]0a33d46556273a166e35e825593489bc00000000   n¾Ò8¤\]0a33d46556273a166e35e825593489bc00000000   ozj*8¤]]0a33d46556273a166e35e825593489bc00000000   ‹@­BÑ8¤^]0a33d46556273a166e35e825593489bc00000000   *¹<R8¤_]0a33d46556273a166e35e825593489bc00000000   aˆâ¢{8¤`]0a33d46556273a166e35e825593489bc00000000   ¼ èÆ÷8¤a]0a33d46556273a166e35e825593489bc00000000	   Cöğf–8¤b]0a33d46556273a166e35e825593489bc00000000
   mÓı»o8¤c]0a33d46556273a166e35e825593489bc00000000   o^>O!8¤d]0a33d46556273a166e35e825593489bc00000000   GŸ î8¤e]0a33d46556273a166e35e825593489bc00000000   È¾ä8¤f]0a33d46556273a166e35e825593489bc00000000   0H¬ Ä8¤g]0a33d46556273a166e35e825593489bc00000000—ÜƒÇ®]Î7¤h]973823f32481e213da49eedc8f8efea700000000    j{Kş7¤i]7225167323061e72579b3c5ddd6b289d00000000    ƒ4¸ş7¤j]7225167323061e72579b3c5ddd6b289d00000000ŠØ*×ş7¤k]973823f32481e213da49eedc8f8efea700000000   uS…ş7¤l]973823f32481e213da49eedc8f8efea700000000INô­½ş8¤m]182cc0a47d0b18f388cdced47fcb519600000000    ·á$¡Ÿ8¤n]182cc0a47d0b18f388cdced47fcb519600000000   ‚q=8¤o]182cc0a47d0b18f388cdced47fcb519600000000   ªØe‹ º8¤p]182cc0a47d0b18f388cdced47fcb519600000000   cË/eP8¤q]182cc0a47d0b18f388cdced47fcb519600000000   t½R58¤r]182cc0a47d0b18f388cdced47fcb519600000000   Îxbÿ8¤s]182cc0a47d0b18f388cdced47fcb519600000000   Ì^&ÖŠ8¤t]182cc0a47d0b18f388cdced47fcb519600000000   [Óı3.8¤u]182cc0a47d0b18f388cdced47fcb519600000000   ­ié|8¤v]182cc0a47d0b18f388cdced47fcb519600000000	   Pÿ&ä8¤w]182cc0a47d0b18f388cdced47fcb519600000000
Å˜Qô3 Œ8¤x]4b65edee40214477459fdde053dcfef600000000    ñ0{(8¤y]4b65edee40214477459fdde053dcfef600000000   Æg½8¤z]4b65edee40214477459fdde053dcfef600000000   åQi¨¥8¤{]4b65edee40214477459fdde053dcfef600000000   ï%g¡8¤|]4b65edee40214477459fdde053dcfef600000000   f]V›8¤}]4b65edee40214477459fdde053dcfef600000000   Uè6N8¤~]4b65edee40214477459fdde053dcfef600000000   %¼¯ª8¤]4b65edee40214477459fdde053dcfef600000000   iğ ˜ è8¥ ]4b65edee40214477459fdde053dcfef600000000(­/%ÎÅ ˆ8¥]5f378aa5eb6eea8f9e35149d749ecd2c00000000    aväHT8¥]5f378aa5eb6eea8f9e35149d749ecd2c00000000   hr’hY8¥]5f378aa5eb6eea8f9e35149d749ecd2c00000000   ÄÙºY¶8¥]5f378aa5eb6eea8f9e35149d749ecd2c00000000    1jMç8¥]5f378aa5eb6eea8f9e35149d749ecd2c00000000   .ı8¥]5f378aa5eb6eea8f9e35149d749ecd2c00000000   Uúá8¥]5f378aa5eb6eea8f9e35149d749ecd2c00000000   >º –8¥]5f378aa5eb6eea8f9e35149d749ecd2c00000000   º+†ñœ8¥	]5f378aa5eb6eea8f9e35149d749ecd2c00000000   v¢Õş8¥
]5f378aa5eb6eea8f9e35149d749ecd2c00000000	   ÓÓ³(‡8¥]5f378aa5eb6eea8f9e35149d749ecd2c00000000
   µgİâÛ8¥]5f378aa5eb6eea8f9e35149d749ecd2c00000000   ,MIÌœ8¥]5f378aa5eb6eea8f9e35149d749ecd2c00000000H&İ1^¯7¥]7b4192573146a776655969957e2cc67500000000    Ü@[u8¥]7b4192573146a776655969957e2cc67500000000   tU–kÊ8¥]7b4192573146a776655969957e2cc67500000000   Pz–ÀÌ8¥]7b4192573146a776655969957e2cc67500000000   ¤ÚCF8¥]7b4192573146a776655969957e2cc67500000000   J¹wá¦8¥]7b4192573146a776655969957e2cc67500000000   =ÿÊ8¥]7b4192573146a776655969957e2cc67500000000   l0”8¥]7b4192573146a776655969957e2cc67500000000   Ûİ|!ë8¥]7b4192573146a776655969957e2cc67500000000   ˆz—p8¥]7b4192573146a776655969957e2cc67500000000	•7şŠÄ°8¥]b0da145b6c7c7169ee8045cedbeceb4800000000    /aßx¢8¥]b0da145b6c7c7169ee8045cedbeceb4800000000   Ú	*¦ñ8¥]b0da145b6c7c7169ee8045cedbeceb4800000000   ïN}Z8¥]b0da145b6c7c7169ee8045cedbeceb4800000000   úìÍi7¥]b0da145b6c7c7169ee8045cedbeceb4800000000   HíPWt8¥]b0da145b6c7c7169ee8045cedbeceb4800000000   áÇµ°Â8¥]b0da145b6c7c7169ee8045cedbeceb4800000000   OÒv.8¥]b0da145b6c7c7169ee8045cedbeceb4800000000— \¤48¥ ]df57b989883c13740e744ee66a789d2200000000    È;·hV8¥!]df57b989883c13740e744ee66a789d2200000000   Ö»Q Ó8¥"]df57b989883c13740e744ee66a789d2200000000   ÔÇFT–7¥#]df57b989883c13740e744ee66a789d2200000000   —Õ“8¥$]df57b989883c13740e744ee66a789d2200000000   Ë™Ù;µ8¥%]df57b989883c13740e744ee66a789d2200000000   é5Jé8¥&]df57b989883c13740e744ee66a789d2200000000   =ç»à8¥']df57b989883c13740e744ee66a789d2200000000   •aï¨½8¥(]df57b989883c13740e744ee66a789d2200000000   RévE8¥)]df57b989883c13740e744ee66a789d2200000000	GÊÑ5T8¥*]c73b718688fc0fab90ba5d3530546eb800000000    á?û¿³7¥+]c73b718688fc0fab90ba5d3530546eb800000000   Ïbû8¥,]c73b718688fc0fab90ba5d3530546eb800000000   ww}Ê•8¥-]c73b718688fc0fab90ba5d3530546eb800000000   ğ\8¥.]c73b718688fc0fab90ba5d3530546eb800000000   B:r7¥/]c73b718688fc0fab90ba5d3530546eb800000000   âúP8¥0]c73b718688fc0fab90ba5d3530546eb800000000   Í³bh ¦8¥1]c73b718688fc0fab90ba5d3530546eb800000000   =p» ¢8¥2]c73b718688fc0fab90ba5d3530546eb800000000Z&3ÊÃ“8¥3]c5d788dacd289dfb7270a6e0ff67abed00000000    ^ÃÁ‚„8¥4]c5d788dacd289dfb7270a6e0ff67abed00000000   ¤ó¿õ8¥5]c5d788dacd289dfb7270a6e0ff67abed00000000   O„Îò8¥6]c5d788dacd289dfb7270a6e0ff67abed00000000   Ã«ëˆB8¥7]c5d788dacd289dfb7270a6e0ff67abed00000000   Ê@Çô8¥8]c5d788dacd289dfb7270a6e0ff67abed00000000   §‹œ58¥9]c5d788dacd289dfb7270a6e0ff67abed00000000   ­Ù‘yq8¥:]c5d788dacd289dfb7270a6e0ff67abed00000000)k±—678¥T]b24f2f5612e5805bd47a3644493c6f3400000000   Í(ÅÍ8¥=]b7e5db408310ea00a46916f2bf55a5c300000000    ÈŸHOá8¥>]b7e5db408310ea00a46916f2bf55a5c300000000   ±+iŒY7¥?]b7e5db408310ea00a46916f2bf55a5c300000000   MÛ~8x8¥@]b7e5db408310ea00a46916f2bf55a5c300000000   .“‹+Ø8¥A]b7e5db408310ea00a46916f2bf55a5c300000000   @Œé·8¥B]b7e5db408310ea00a46916f2bf55a5c300000000   qP]ù8¥C]b7e5db408310ea00a46916f2bf55a5c300000000   Å[¨:8¥D]b7e5db408310ea00a46916f2bf55a5c300000000   ©€}lĞ8¥E]b7e5db408310ea00a46916f2bf55a5c300000000   I˜V58¥F]b7e5db408310ea00a46916f2bf55a5c300000000	änòå	8¥G]b60494104aecdb448cf782ca98448e0d00000000    È¦n˜8¥H]b60494104aecdb448cf782ca98448e0d00000000   c¤ºÎ/8¥I]b60494104aecdb448cf782ca98448e0d00000000   ¶H–m8¥J]b6049410OOOCLCIBCOOCKKKKKKKKK[{{´$~ŸCŞ0}&zxyMKOBOJKOOOCLCIBCOOCKKKKKKKKKx[{{áƒu2yúCŞ7}&zxyMKOBOJKOOOCLCIBCOOCKKKKKKKKK~[{{Ö‚M}şLŞ6}&zxzMKOBOJKOOOCLCIBCOOCKKKKKKKKK}eÑ[İk¾vCŞ5}&zxyIOINMJINCKNOLHMOOOBHMHOKKKKKKKK{[{{œCœCŞ4}&zxyIOINMJINCKNOLHMOOOBHMHOKKKKKKKKz[{{ñ	ÉÊ|¡LŞ+}&zxzIOINMJINCKNOLHMOOOBHMHOKKKKKKKKy[{{u@†ltCŞ*}&zxyIOINMJINCKNOLHMOOOBHMHOKKKKKKKK[{{`½w¯zCŞ)}&zxyIOINMJINCKNOLHMOOOBHMHOKKKKKKKKx[{{JOÛ!è´®W   ¤Øë'Ã}jıÑ”*€MıÒñ·¢}QÕœ_…m¼ãc£Tæ·‘f ÙĞºÖĞ$qŠ0újÖ.ÅŒ¤—ÉŒr‹gæpØß¥*f|ã~õpaAyšC«<,Ù%)jÉKœ2 ³¯ë=“B­Ï×Áîß_˜JgÉ…0³îjŞ™D:!¸®	T÷ì‚¾/?è]=ùS€¢³|KëÇ^òÀ•£ÔşOákêÃ N›­ˆÃè=0æ-aQÇÍîëÓB§¥†.˜.349Ü¡Y½#h#G(˜ºç÷Ä¯js“&±jÔP¯h®|®Ÿ.¡Üá¥ùš‡làé!$ÉoÈ&”l€ˆ-`Ì5ìHô+lè ığHw{ßo nX_Á¡ƒfÚ8¹²ÂõNbYc.wgÓó<]¥è§ÒM•­ÓxB?Ì_B²„ 4è;ô¡¯u–ì›ïıÜ‚­ê*6r-dMŠj6Éû}Mâ‰rÏg½u½I"€vP½tÃŞìf¨Yö©òhóušÀ–€X¿…'ùâÉ/>¤Â?	&y›l©z¶§|#„Háp?„£Q¡~Yb¶”g
	6Èì (–hKàÜWk¾Ämª`1=9…ûßä‰|ÅŸ
1ñ²7ÒuÁµe†û+¥ìæ³Oîô;w_ÅÄØ»ÿ†zb…Ö>Km*ÓFd­eCE«4Æe(ı¨]`Ö)îŸC±GÒº:Î-ØÕEv9;ë|†|»²›d´Í¥Â:tÒİŠ|¨ôÎ8×y¢&»áUgÇü¥åÛ½™’ÒÂßï!¯%r­bŞõy­»±»Ï‰‚éOk¯Ò¶&yº~k‡îúÀÈÂ»ÙÜ„êß‰GÇœC—ˆJ¬õÔİ”
ş>ÎûÃS‘½Q˜Y½n·c- ¤«˜4;ce±R‘cRgä*^dWEĞÇ
‘‡æ[üee“ËDÓµ”œ¬{æyáë¿5ƒã0ºş`QDĞ.•È¼bQÚ¯¯şe²Ä{=ìsËB …²vøÿ’Sâç?ÑNMwÓ@›sıÏpÄìè¢¶ŞØã·»1Åniµûòe´>™=$¢3šcìˆ"]›* à-=øjH¾°¿€ëÈƒ±AæD–ŠMOÅG[†~MNĞ¹Ë­ªÇfÍ¦C,äİ|[¡7%‚O-ˆˆñhé{V+Ò³¢ùæ"şœî.*Sş¢`< ˆ„Mv­$ ôZojÀÇîı×Ü¡EÁßÕ¸pWç"â­^äL•¿03
8æ€]“ÊÄt E‚,ì-K'­¡·Ù¦:ö—wWU÷Æ EFÛØ_¶‡J™„Er™=æøV·×ƒah="İµšÉïÉˆ¨3ße–?æÙ´5ûÖ¾··mr‹‡È·ÿ¢omK°@dkòÔ0¹ÜÈ5ú6ö-IÜDñ™O'îb'(ğäB]ïïõ¿óSnC)ãŸÉ‚¢¯‡ÉVÃ:ë3>•‘*ÙD9Ö¬Ü“4Ze6Õ1%ö^ê{¤Ûß’À"úğ×]r›Aå5}#pçÒ;{ín±NÓrøXº@ıhüü€J¶(ê¾¼¢ØÛA™Æ‚ğğ‘ŠjhPÛ´û9,ÂqÄÂ…<	Ã­÷Kè¯/¡ÆÙ×ãH¢×2±×?—ÓŠ×VºÍ
¬^†ü‰`4¶Ê©U	àmzûæ`LŞoe¨F±ÅIëÒ.!n#a'Nğ±¹f&Íí-@4¦*œÕr¢…_›b-zH,¥SÉºæ6_LÒM‰ËŸ°^äYZ$¾v‘3buŠ,RÖ_ÈuzòiÒª
×oRRùğÍyXÅÇPŠÜ+Ñ2ÚË#4µÛ+éú=$İrĞ2.Àó4tí|w*Up#òØ¿;{Tqô¨Ù×«¢£yæ#äpóÒ Ptó
Q”–ğo"97¬^àn&A$jƒÆê¦6UaÍTd¬Z@ÎC{ç{8ò©MR±³2ĞVâòeÕ‹ßf¯Tù­ØÚn5ğäT4YŒüè^‘V—R?áMµe,¢•¹NF9<$¾ò¼2×:HõÍ5m,M$*¢Ä½]Ì}ÕŒ¡©ßÇâñğ½‹_7ƒÚÓ‘N	ièéÍ?İáÓÑsh[l­v¨àç3Á&­#ı[¬ó#,¥_bwîÛn¾ıÛdÂ¬ i’ ?/ëb­nÏÉÌp¥w+¿Eå½Sê¸Ÿ}<–ZÖÁŸ¼D\ä'Ğëö—Ò‹8Ô3”‹'Æ{ÖaÌ¸\?¯‚ª#;ıiBùi£‰®™ÍéïW^ˆÄ‡} s©]@İ=úêLæğq}tßœ[¨qó$‹‡‘En²ºkßyoÖïHx]ØÖÍ@PU$Ã_Öpä¦^²$ô­Ğ~Jº’©m¹"EÎ+¼)\lÕ_	`ÎL®'wè10ù­/+trêŸØyí|ÍrIäq—S"wŸØ!—ßÀôV3n÷4ËÖ¡bÇ‚Dõ¸Dº~‚kÀ÷ôÖ›zÆçˆÓiN²ÿ-fTtj;¢1”[$"Ë5á‡U%İ>>Ï,ÇO£L¬ªAÔ*Œ}İıŒVòXW5uÊô¯éK.b½¦zíq8”rÑGŞKùx >LLJfäFâ$ëT†í/³º§ü¼ií5ğ­z€³kUjÉd3ØKÑwÈÁÉ³Z,&*gÂåH(ëëcÿ2	¤N+½q˜Å”·ÒOÕ$äËö¼ÃøúÿÍuåV”£ÉëRu¥hÅ×ŒºÍIVÉ³ƒıxËá±ûyÊqÈ´Y&g@–›
dr¿íVr ©ò\¼ícF‰çğUÖØQ‚´å;ˆõ'	ÉºU‰5’Yæ4}öıU8z†~fhk0æÀß?t%\¾Í	Ïw÷¾ À¼×É"®½	(,¼/3t<AMA¸ğu ÷U«;öŒb‚g)MÔœ> k0é)‚ÙèåŸ–GX VÜµº|“oq Yx©£o¬æ\Ë-Í‹Ë~¦FÁçå9å<	\FƒŞÊk\±V ºïÜÌÿWæ5DióÈyó[\€	†3ĞŒf£!ÓÍêû’Ájà±Ú¹¯àOk^€Éõ{fŞøœ‹VÒõœãšgpˆw”^©‡Ø­tµC ‡oÄÕ²o[Tëj§ƒ%+«FxF*+2÷¢P­L§b-/¦\ãeCÊªi2£;öHµòaf½¤ãËh 58(¦
›QÙV&àpÕXÅeA™=å˜üÜSë÷>_›mwßèîû„L»ßÛÍ„ÓÑÇúEàÚ,Oˆ‡,‰&÷/P 9‡…mSÆGßøŞïRîk)‘ô}hã2Ãe{H¿Ú³<	²¦w@K4Ÿï`Wñ^¯¬×vdõŸƒòîšgkJ»ŒëÑDÖ3Ó£]!¦¶"YúbLÀ Çê¦¾¢¸ñcîÄ”äozm<sƒ£¢u°ñb"0ßšyÃ}àîLá¾{{£Â üÀÓåäeCß°ÉpOÊ2	¶Ú4•Ád¢
+(‚]:¤­ñœ¾Šr1\S—‡ÙBHÏ1K[@éš2§}NT*kBµ&üic“HÁ÷&§š`¼Z9.ŞU©Ë˜	VVañ7
ÏÄjÄø¸B¯İY§ˆƒùšµ¾yå0QÌ±¦!	R¨øùëî	L^Òb*¨Œ%…øbDT|—@‰-9õ§Ï5vGùÂâi+¬Î–Ê—o@k¡Ñd÷€wQOô¡
 ç(zÛÂ}Ô?L…@C¦ <@‰c8„ë(ÙêEüÕ¯ãÖò®<ŞìJ9±1ıÓ“áßf&‡NV_¢®2¯TsÓáBÚÍ¡¿	.eøÊ=»¸ºì¬H>‰?^Ô_ü§~n{äŞş'üØ}Aá\øÎÁ`kEÚ«¥¹ÜØ(­Õ>q,	ş¨kÿBA{W2aŠ³x±Ÿ{³×a´‡·ŒĞ@OÁÑ°fZ(Š{;Ú¸-P	ÂÖ^Îy€Ñûhêœßîãğ~ÛPa¬Û^$Š¶üŒLª¿®±$U]İÒ-à÷æ!^áèWM  K-ûÈ´]&mŸ1[C„jÈ•mg1£’ ”:ûêÊ2€¼ûÕ]M7²Ú£Ş]ùş£İiKÅã€º±÷³QíÂ­ğëByJŞ§Rü¨ÅĞÓ‹®à»´ü•Ÿ°Ë
îO–ÃL}5
±Ğ
.ÁD¡™H?¢äZìíñTXÒØ«Íî7A¿\JÇ?(®8Ò¼a×ëÿ«2Îâoî€û°@1s¿kæ’Ø2G¼l`’;RÂÛêXGRÕm‚:/]up>4k“í´é®8¥Ó²i7R*¡1¼Å¦0,°Û›à¦‹á¢;ô¢Fqf8wüÈ'yíÈ”C9-•M¹¾}8ŒìĞÃ>9ä£²
ÎE$k‘ßÜÆ‹Œ˜ªsÂyáC=õi‚‡Š^‹ÓF«²4ô	í÷İI´ùAVõb›t¸5´ö‘’dı˜Zâ4‘UÇ²Ç2•´0[£^>tÔı”%$L÷aö‡V0	>½Q"£”b ­/4Ä0ë‡İ,!¹bò>%…›IİHQßo–#[]N÷}¨«K»kó˜õµ²ÍäÒ–±jö(Â7=ó<>œÈÆFŸ¿Ä$d,Õy|doh/şNœ~—q}¼>%	]O?üf‡øá²˜§ÎÊMl-“·£ÍÂîî|3·	Şw=#°†šü
ù
Ìi÷{‡LÔ£˜a«`M~Ÿ†Ô˜4ÆaúwoÌˆ×“.5¨‚?0î‡İY´¯µ%€•¾Ğ£Ù­7ƒûsgâöÎAØ$ÛæáNË>9°İƒ¥À2×z)ENsŒ6We9s€ÈO¯	 öÁûr1	Merà¡î±ªt—cSR k†íB•:Ã¯ŒÍr5¹ÁÛ•ç%äß$¿IeöBõª•ÓGV‰ÂS[ğÙ1/wQ8kª½ÂÔ@ziûG½ s[¹Æ;ÃÑ¬åÉOÈÒBú‰İRØR'JgInÒñŸôÙÔ•Â•6÷‰zãÿ˜şc,Gá)Åı5 Şxd¼“Äx@­BrºVîO¼+
^c¾r/åã¾ÁVéî`»Éìå#*ÙP£~ãGI’-˜È8b{áø>±Iˆòÿ“ø/>£KsÒ}Ÿ:¦C—f2BaF
B[ğh»òXØuyñûAj³š#¦£wñÌÒ„çúånB(ìl_{#'—\Ey +ù«ÓîöQ-_ÔkÉ?ƒWÛ}¬µ}ì}Bñ˜ŸO3‚·	ÖWõ“3ÔjwŒ—p¯®>?Œî%|lšoY°›@SğAÄ—LÚwÒ¥V4½LşaZ[OPîÅÁÁ>L¸­}=Fo»¤»Tü…Üâ’ü	A½QœÓÂ¤5Qpˆz8¾î2ËÂ¾Şçû/xŠòıZæòşH|+ÉrÖÏ_2ä«ãuÅED$W°&Î—k/6‚@…ÉÆÑfäã·ïz\<ZÆé(è‘£‰äÔlõÕ“©V?İ:W­O69éèÈ™Ş~ç<“‰ Á½Q±cU2!’“ìî·NèeU/ÌÔgê=gl†Q+DËŸÌÂ„±şÇZoóM–}tƒe³µ•7šñ‰Q([Ğ²³^…·¶SÑtrÏ›c{oõ…¨§İåaêlP•FjQI¨g¨H0ÓÎn¢Ù´ƒ_\[œL‡Oe(èæ êˆ©€ı1¢-¿°Àèî='7àÇèZ‹Dİå¤Õö¶‘A<ü‰lÎk8Êİëôf·¼Gôès=Î¥›ĞQæ©nü“p¶t<ağ€™“èóËF6 á-²b‘Œ}8fâ#Qßj½ùÜáıVÇC¯kéV"¤<ÃD¢*«*îŠAŸÃöìP‹·C.dÊ¦ˆZ\½C¸-"TÕÅ¼|¼İ·ÅÜåR»üà­-o,P‹Ø}1†&vİ Ë¬8EÍøPöcû›”îG<š¨ƒËöş çsûMé ²}¥¸û>n¿éBg™ºcU"LÓ:“æŒ.×•+ÌôÒ•[ƒÚ©Oê1éXµbş³mÄŸĞpJ…ò0¯ÁåKÜdÛ]‘ÛÏ÷Mwï’z	¤ÈnêÏ1>.+fÔ;Å,õùò‹YÖ'çÍ/r––Ì£ñ¶pT'âÆæ—PçhA¯ó#FfÇJò•v™!+ÕDVØ¢-c¸Û–¼qõïó¸ûIa~—lÓO8|xı
emÏu9E¿ƒOnèxwr,N)äqú^ÍìóÊ˜Ä!ƒ+£Ã:Lğ¿\ü×’€£ˆOÎW#¶EÜm)AÕÓÔ‘¯V¥ôŠ
ïú,À*\/4ZFÙ‘;IY–v¤‹z¬Œ›vP,r–3Â¶†¶n™í%ZVók‡ëAÒg·;íeªaGh½âvìW˜\{*FÜóáA./¤¼ÂÇkŒ¾h“–£päEèßª&Éºœ@ôÚ:à K]Ù)‰É¥Ø§‰£Aµ®ã›šŞÜpK»’ú±ÃÍ· ^Î–.ø«K«^Õ—ü*@ZÑ?¼Âƒ“XZtÁ’5”Š ªZ2~‘È¢‡“R×ô¤ª¥|øØ²55ß.¢ }Dš‰›6
‹ÎQg8“uÏŒº1C±9í„±9³.LÁf/ÂQã]ò¥aü.Ò¨k³T!\=‰»Ñ—ÎÄh¡Ş,#FÁ|ªC¯K >t`3Ô6=¡®õÎ‹ÿÅQl–ö›§é†9ÊôÒçîóBA†ÎØªá;×wªô@¯ÛÛÍ¯vXÔÔ]™zË/òëŒÒ©§î„÷¶‰}­7a*Dá•PÜ€ù)>Éa8mTO:°º|joöË>º±Óõ^qFñè‘˜¦9Hº€@S_«PqÇ3OgêáxÇıü$ÍàœWìè¹t$§ÿ.Ş[=ñÙLB ¶/Y·µe¤¡¡´·_uõi{^gq¥|M*ğÅ"Uz½Tâ®‘c¨n§Iôƒùÿj”ƒ)jû²UçƒQ¶"ƒjj°¤Í}; <©[0;ïÀHo6¬ôÅâµßZÂ:¬»—MñÑ?çD¤ÙéLˆ½›¯ÖJáò8ö}\ßGI4€ÎÓIb{æ;èç6-#M1ëlèy”u{Uİõo¹¯_CŞùfÉ<^‚ƒºßîd‚T¢xçQ[SâÒ]®é4Ä•jí0§mÂ`Gÿ³Jë’ÂqâàëeiÅÙ*óû:Ùÿrõ¼wZ•>|éX)Ô9
ÎÏ%š«?ËÍ¼ìT†¦0ÇŠíì-5P´”ıšJ«ÅLİ@ö“yîõ¨@$Ã³Gˆ……4o¦[ÛPÔD„lWøDÕ(¢’hrŠ <ÁaR~¥o×Zá›wavïõi—¼à)ãı´¹Ô¯wvªù6˜–ÂË?PZŸsÔª“rH=ÌÀĞéÏ¸ªe%Ğ}á$lg¾eÔÏ)°•: âqË¾:'3i”ü¦}èib³DİÓó´Æß¨ÏÛÃ-\ 2wQñòPğàªkW# 'ÈµwÒÜGÓİ/w<H-âÜ:nj]€”.Ú:2> é;UgX¸uˆ ØmÜ¯(;kœç­maK;„Çï’8åsETÅ¦S¼9ØúÔ3È¼çN#oìïš¼®û¼1”e|çñvxwñçÇÎxX%Ñ-_¶
Ü`0m»ÆF ajJ$W+Ö†äêØ=ÉÒ$ È
Ğj¯Ÿ*È‰I7WTr±)‘|¨i/ìÍÅJÖuXoWÙGY8§tTiwäL“?¶ÓKòÕñ­³Y“Ş‰ëµm,gbŸ\ù"5xZşÚH	^Y Çäd~6ƒ¨–ì€TššÕEå?Œ3<ñcÏÆ»su ëÇÔe”¶f.°_FNÀ[‡_$…M‘êO­aW-¿ìbŒ;îK*˜?ê¦Áß
|áï>\æİ'ÔõÙÂŸ÷2Êiö›3S’ÂŞ½ÙH=v"À9Ÿ°N7l@b¿„<‚`™u!BoÔµê;5ã¶€2­ƒÓôà•€!:“PÏ¼‚ö€Ñy¸#À’·¦zòÈ âS:ªmxåËuªB@u·f„-™?ldpş¿_Ñy¼÷yƒ4äÉ¾Hß±½şaÖ’¿¯®Ş˜õK›{é¹ÿıÚü,±DÎè•’ÂÀUuö)‰“ìNg¶M|L‹¹-LÅ,½µ#Ñ—KOs…üÎÂª!Ú·”k¡iÅ›iZ»˜¹ûsŠ|Y¸RwÛ)§”9Ô0¶ÅNÎÕ+1d¬çõ?3!Yâ×<ş'ë¢..$båHh·ÆÂÿµZBW+lôX±Ú¡ô
i"Ù¨;ÖD‹ÄO'kÿö6·rj·ÚLn—C3qÕÎfó±Şfí€b
­Üö°ªìÊg!>­Éô7í¤Ïÿ•”·ÆëP_Ö…€Ì»ª\¥ü:Æ06ã"ÃéA$Ïe
tZådS‹ŞÈ®d‚ŸC”µµñ¾¢êƒ6Ecäúm/vo_„Ÿ ±ëv/Ã*:¡.€ë]—cp¼j\¢+èzÕw• _+9ÿÃàæ¸ÈÁúpÚ\&‰*Şù)7k|ìJc¶•tû¿ĞêôDìÅRËWÖ %ô,iøø7–-ûdH$ªY—Û‰ğd…ª3¾8°5:…Î{!'ôˆ½Ìäºx4w–,M/Â>.BÿNòS0Ag Qô¥˜*kƒp	µ/;œoàò	{‚a†@·º%æ:©G#øaTÕ†ãëÃSIT0uĞïàÓ"Ss+E6:eš/6ê6uMØ-yÎ‚JÎ:¾KÉRUûæ»¹¬18á•a†ŒÄUŒLKMõV"ñ$ <h¢?Nkÿ]y!»m­­çâèïæÆ!iPIh°Ïd 
–Õ^—¸aêİônŞçVH¬|î½&7;µ3/·nõ±†:.™ıÍèˆÈB™Ùı ûˆ1ìĞmíßn‚ò‰ôş$>MGŸîˆŠ´œÒŒú¯{C>¡GşÌ7ë² Ä­j×Ê»j¼’uJŸ†@ì§‘·6Iœ:*ê09¬IüDÿB[ñÉT }æÛETàpÂ¿óq©ğÜÁ >ÚKiı\b±¦^ ì8
H˜ŸÇ>°‚:;ö³1*5Î¶À=@Ù’£a€4x´>îb,:Îì)S­H]÷ˆæá›©ä­|[˜†Ùûsr¡¡„Ò[œŒq­'¦bJ³;íì‹iªb`ğWs†ïÇÎÑ•Î€TÒ—®a‹ˆ=îxİ¬~üÏ[©z1–U†CÌWåäï/Œ—÷Ÿ=P±bsRÄ5óÜö)(iîEşÍn[ÃÀ.GEX¯­˜ª¿$ÓV™:;TfÿˆÆ1€ØõÉ®7—9TÕƒè;S$ÈÚ&môd
peªƒa{”Â{„<V¹åe)İ ½íƒç-2Ysg{{©4·pb0­"5‡t!!pö57±ÔÇ7ıÓnÅ˜œ£“ï^]g÷4‡0¸÷p<ù3¡“QZâªiÅüà0 èüÇÁâkDpô-ÿlµ5_N'¿‹• q7g™ÿ’»l6ëàŠzèÌ¬<P `•«kØzŸ(è¥ê¿ªäBâjvï*€šwú¨PÏı:mŠËõ.ãè6Çú}¼~$órÓuˆóÏ¯÷~SwlmÏ'z„6¤ ù3¤ÃßfWX—6Œ±Ã‚u˜ã@==àÀ)e€sy±•û=ä_Ü¤cbÓ¥£ZşëM,š¥©kkC¸:TÎ–™å®7ß×aOºxÖÒpz¿âåh9Ü5Ïıûª„ÿ·Öo¨%é…tÈr¸ÜN äZµ"1Šf ÿ'åëI+Dàv+£¤²->—ëd¦^J?”„v&pïQ³Ìİ•¸*}jQñòeÂƒ_0•T6õÒOM`_²¤÷SÇü'†KœÑcÛ$ëüöİ˜“ôH³ù[¥ë¸óõéØ ç«£WZêxÿ _-t&GªR»Ç4%.ù^ZÅğ½Ì†IF]¨¹Ë"4Ï`vÑG¡‡¬¼V‘C2ÿî1ë‡ Ö“ÆëaTÀc{\\(MÇö‡¬œœÂ!SşÔ
)jƒÈKömAéã\İO".œÔÖIyW^ïÍÜs‡O.§ªÖ¹S!'ú¢yáMTúË%”¨¦ øæÂîÊÌN"(×¡àak\­ÙÀ÷â•A3oå-ûóîF$æ‘(¥ıı¶’S\ƒ`ªéQÒ÷¦iÜ-Ô.ô2Ó*8!U^ìá¨p1YhMJ“vç„»‚™ú¼¯H»í‹YİIõxûÙ5âğ:&Õÿìo=ÿwm·»©×~:©±×á“H}¾Â\,BsY
òR~ .¤N­¨ãkX¶šº÷ÄsÌ¯é%=lD³9v~Bå³•píáS³ã3Ä»É	ù\)ı¬ñ|gQ´#À¦*’Z*Ú˜W­îm`$!Ú\éŠ³p5°:yŒ&§õ#¼0gœíA23J‰ŞĞ°™Ø0}Ø“ÏÌ©>‡p#İŸP†—>v@'Õ-—îd¢âÙhùíéÿN’V;a!–Ãa÷O8Àß\náÆ·|8%DÆúvÀQËØú¦˜ƒÑQcÛÄ7Ûlí¬£z­¢M‰İ­–2ıçõj[˜‰>Ë(êœYv“X5xTëËŒMr’ÉäZ³n{®‰]Ùd?ó¹ôS$Ø#y‰²­Á=ŞUçòòŒbàrµàeú$¦¼áâ_˜¹3±¯Bõƒ8Â—ï´lêQàl¾ÉÖ²Ñ?	äK–e€ j€ÌèğÃZe¾2(ôú˜‚ŞÒEëd.Ö€ª ÅµLƒÃÉK æW+•Å6ØÍ‘øø‡ä	ªÂ1œx…[?JÁ8ºn‡á•Fvšu¶S Z+’–oĞ 7n5ÀLˆ=GI1æÿ>Cå¨¾e\«D[ã3Ú{`Ù¡ø0˜$ô;mÑñéU87>;aªÛû0ö™ÕÛí½ù<í°yÊ¦.¬ºm5Ç‡Õ¬×8¹Oª‡.ª÷Q³C´[Cf¤^~:e;[²t?Uçj;I(^Rm#>ö!pu”¯ÑÈ"]SÅäª¡ 	ÔQ«l¼~¸òD›ay W	WØğh¤µş¥ä=NZW]Yh• ›XÇ\öÁºúNŒ›ş/3Î¦s5I6“¹Wä6‡–úÙKÄvæSS ÛÓ9¦‚¶ªªìbàwşd”)ç;GäBŒ8W§şÎÙ_á¹~8óÿëO*-ë³)ş‘]Y6t¢WìÊ¾Wt-.B…«?Òy‘ìÏşö4µJÁKPv>S³İãÍh™41¨]FRQ´úàš&®Ş<5­z®J*À,Û!ìV÷»e˜‚ŞÚ?Çû@˜÷îŒA&ŠtK¨Í† Ü}&ÎL6’·=¦µ³¡ÉJdyiÅR©R[Ê˜V4Õ;‰›‚çskWœï}râ¯ö>v[ZisÖD Ø‚oÌ Œ“Q>J±gWÁ&÷v–¦˜%Ef÷X×¾ÓãŞ‰`)¼¶Ş•¯	¶—Uƒµ«S ÄCl&»tC¾ĞSø]ÍìÀ\¯à2OIg@?‰BÄ\9†b¥Ä]ßº¬

®eAÛ!Ä"FÃ—U‡¸1¡£-ÿ|äÒu"{`Õ¨¥¥±½ÈM9+®PnæFäu‡!2®[óóëzár¦¤F‘Üæ|³÷Jıã«—In}|íG)¯ÈU,[²†ÌX1TVF™ç+Ê1_±“ì@„ç Á`i_[Ÿ`.Ÿ±<ñµ‚s†Pg*´”,ş&íZB™–ŸA¤Î]klq­À6RrØ*É^âéóU¥;*A(bÚF¢»¬)ÎêÒ
Á%¯|/Ö†8ík ¨š+®‘2åÃS'²(t\cÁš¹°¶ú‡¢úX›ôó‡ ‘ÌJ +Ä³Â´ÌÂuº-ù	pa¯ñæÔÛ…wÙ¤.zÃ´¬'ùË 'Ô¼e}×€¥ 9üg·ªt]\{Æ²1ád-¡%n©»ò£äÈïïã_ûö8ˆèÙ¸î ÕpNŸ"µV…_›Îd0é7Õbj¼j|ë5(êpÑ¯YDeš¸ç3tß\Üí‚·¯	|Ö©«nBÑ.6àÒŞ²}ôâÄœ4oîÜFËRJ:ş8€¢ˆ°l0Bk?POŞ.\wNä¶˜ïu,)×…˜rpì·Ò8÷®Í.jTgîä[±g)ñáË Ì4ITÄùDsÖúR˜S?Qhí³¤…u5ckxùĞÊ>¦æµ*ñ‚¶bä°»eæ—r1ƒ…Ã3ıÌòZ8éH>kUR¹D	>%1Ú„=$†,0ç¦Şà¹__|#§1µÌ.——±Ç˜	öñ{TbÿŸŠ}ÒWTZèDıûò4nm—û¨Y’ìÒ$ƒ
“'Ü¾¦eFÖHåÛAR7G¡¿¯õ¡e´ê3âú(cP/£É< fŸ7ˆ9Nä£W°YêÜ9šFOÍIOQ˜o\¬¡K!áÇxq²Ğ }4™ìŒ²È‘o•§.ßq¡'¬»âB:æŞCàPU_ºP÷À"}¦(¬ˆÊã‚³GúP)öCk+92 w½ö…y»jpÊ¡âõE/´
y qäSˆL}÷Vù!|¬‰ÆZ^	£(¨±TJv†:@sŸÕöqgm’[!ìœ‚Ş«Ë%ŒT$Hı8ÄÕ†É³@ÂTM*ŸÊ!“Ï5™|Ÿ¦wÌe<,lk0‡P°8?õúU=–{NÂİìèà­Jô½âyBxı©÷Å'CÑ?BºšŒä4M]ú¢•r®îœZm"@ãú’Ô–[„Å1FC<Š>kW¤ş¢Ò–Yß¤ºt#+œ€ª¨h®6¯TH]Œş(»Ù/Ïàc|‚Å¤$kŸ'¸00FÀŒĞT"HHhØ·§˜­”%¬2Ì„€}ôP|(ÕµÛ{Äav!œÿXÙ,ã‘©½âùÂĞIò-C›ÒJsÍÑ_"Á1ßaİséh›¹$`ŞS%âŸ»!ºÁ}°ìÇK(‘ÄPÖŠ³\ º±'J	Üñ>¬pC¦nì%Nèœ&›­¿”(|&gß÷öæ¾æ¤İ.+:xNÉT¤ò·è"K˜g¨{Ú³Xyú¯‚ÿgµê¡Ç&Ÿ|ëWäàŸ‘9¡+3v´ˆëí^@“Â’Ãh¤İ÷$fS{ÁáMÚñç|¥\§ß~`»¬ò«ñé”x‘Bº0qYéDša1A«Ä¡,¼‹ñ§Å.}ç´ÁhE,OØ8Ñæù±Ù­[Ë¼B ¬Ì:tüÛá¡YÁMÄJ]Ølòğ,é<¬›ŠM|‘š/k©…’)wH(ãû½­Gàµ¢öI†·©u;W ô5«9¦
á–V†Ã{èl{—ƒP^î©ÌÜW¼!‘É¥ÖDï,õÅ×X¼†”!§âÕmòÙJÂ(!ÔMB’NtdòuŞµlÍidzÁüñ?¹çZ×(u?[Æ@É¸N­ÚÛXêE‡õ^K$y´ú£h„uÏw{5e8"+¸æ˜»Íª·söœ'Õ•>8™Nî8OMJ«;â§ÿÖ9o–³ÓRbş.?°RçvAıtvœs^u¶ü9è§)0·k"$1%øš¸gØƒ’&EKñì<Ùº‚@®L¸TP\üÈˆÙÖÜö¥¶bºf5¶¦+*_‹i‰¹8f.ãôóqŞæøÂög@¾Ş	]/ÖêJt8) Iù°Ÿøµ<ûèÃRé¤òoV:ı'Äpº»Â;‰¹šS(İ²úíáˆÍ¿ñícy ı&šJM>Ò6"ÃÈhØÙP!“ÂğÛÂÍ8àfe-Ù÷Ñå1~lä8Ÿ±€J-zsúÇØFå˜ïxèc_{ØX2İQæiÎ°PåD/ª¦Ò g1ÈÑ}Î°´{¾‹»Õæ;1P¢'è‹Â6æ2wOôÄ&Öƒí¤äPØ¤-ü‚İÚJßX¯Ûé˜~pL­Æ×Äİğ½Çõ{KQJ±¡ûå~… µcæ‹§(S2}Ûä¾Ô<a¾õ!•cÚ25~*Ü`52C×´óæüù9šÒ‚pÍI'üãw°HÅÕäd%¸ö:ãŸ­é
¬VÄã`p”.eˆBéújê%K~¿bÃ])âê Ëa†òHÖ²†ö×®;“	¯Höíxò{&v’º	šÌP:Õ\[5n“ŞG¯ÆíïÉx@„Á¨ş¼ŒHĞ.Ÿ"êhÔé+KüOSİw¹Q¨«`4ë½Á¯O²Ï“	GuíD#2-TåXBCÛë]vaêĞ±Wşû¿5-(meK|ÓN -A!Û·ÊÃ“ÿNQ½*ã¬ˆnyé~M‡»°Í;lÜ*fQÄÃ ë2Ù—p$ı¥ğQ/&båj†°9&ı»^J´Èµ`)A
kzìÀ¿‚,ÇíÜís†}ßÁgåO#|‡Ñ0rÀ&ÇHHû´'¸öÎu½|äyÈGpùdËqu B—Ë…» ¢„¥ìYnH“gs#ŞªcY¾´€^ƒÃH¤ô{¨q1ºœY//iî¼=.œ7¡kÂ"íy5.©Ÿ
l6Ù„R<NÜUs`¢ËkOåz–±Jæ%šœ7Ä÷0+Z´ïÇ/î_´Ö›²Q€Ü4C4Œ¸»G­ÄÊa\=´hÖN ¯¢ê¬í×5›­¯ï¦‰v'—nı[õ!{UĞ x‡°ª‘nC~ÌÜ€S†A#G¿À„µ
ú×÷J KcTŒë“ò¤si9IÊnÆ¼ üd=Ld|u˜kPŸ’áG7Ô`œVü¦‡"zºĞIT=hª#	!‘ˆ®¬aQ82yx<èp•v°7Û:+œ#À"¹®³
¨ÜY{Õìì±ç‡-!dÖ`aò)-@CIJ;ÍpDyYbÃr’v«v–Ê?_%„œÄ(±¶™f×öP# >¤aÿÍ’r\"=q7³‰HĞŸ®%æYÊƒú¡(qI®Ê<¤Æ¤Š¿zTbÄõ‘Ã¨×…¦ET;•uEÿ}p!#-‘¿D»Gö»^Ä7_Ç )Ç]PÅ”Œ„ò«ûQ³âcÅ¥Ò»Fî=¦¿ÿ$İBr-©%tdşoÄ<Âú™ÀcV•bd şk¶È:>Ğ
ß†S ƒ$p3bŠ;\¦Çy#0l]Õ‰[±s{Cs¥í‡xµñ1hlMode\" role=\"application\" ng-keydown=\"keydown($event)\">\n" +
    "  <daypicker ng-switch-when=\"day\" tabindex=\"0\"></daypicker>\n" +
    "  <monthpicker ng-switch-when=\"month\" tabindex=\"0\"></monthpicker>\n" +
    "  <yearpicker ng-switch-when=\"year\" tabindex=\"0\"></yearpicker>\n" +
    "</div>");
}]);

angular.module("template/datepicker/day.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/datepicker/day.html",
    "<table role=\"grid\" aria-labelledby=\"{{uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n" +
    "  <thead>\n" +
    "    <tr>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-left\"></i></button></th>\n" +
    "      <th colspan=\"{{5 + showWeeks}}\"><button id=\"{{uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm\" ng-click=\"toggleMode()\" tabindex=\"-1\" style=\"width:100%;\"><strong>{{title}}</strong></button></th>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-right\"></i></button></th>\n" +
    "    </tr>\n" +
    "    <tr>\n" +
    "      <th ng-show=\"showWeeks\" class=\"text-center\"></th>\n" +
    "      <th ng-repeat=\"label in labels track by $index\" class=\"text-center\"><small aria-label=\"{{label.full}}\">{{label.abbr}}</small></th>\n" +
    "    </tr>\n" +
    "  </thead>\n" +
    "  <tbody>\n" +
    "    <tr ng-repeat=\"row in rows track by $index\">\n" +
    "      <td ng-show=\"showWeeks\" class=\"text-center h6\"><em>{{ weekNumbers[$index] }}</em></td>\n" +
    "      <td ng-repeat=\"dt in row track by dt.date\" class=\"text-center\" role=\"gridcell\" id=\"{{dt.uid}}\" aria-disabled=\"{{!!dt.disabled}}\">\n" +
    "        <button type=\"button\" style=\"width:100%;\" class=\"btn btn-default btn-sm\" ng-class=\"{'btn-info': dt.selected, active: isActive(dt)}\" ng-click=\"select(dt.date)\" ng-disabled=\"dt.disabled\" tabindex=\"-1\"><span ng-class=\"{'text-muted': dt.secondary, 'text-info': dt.current}\">{{dt.label}}</span></button>\n" +
    "      </td>\n" +
    "    </tr>\n" +
    "  </tbody>\n" +
    "</table>\n" +
    "");
}]);

angular.module("template/datepicker/month.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/datepicker/month.html",
    "<table role=\"grid\" aria-labelledby=\"{{uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n" +
    "  <thead>\n" +
    "    <tr>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-left\"></i></button></th>\n" +
    "      <th><button id=\"{{uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm\" ng-click=\"toggleMode()\" tabindex=\"-1\" style=\"width:100%;\"><strong>{{title}}</strong></button></th>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-right\"></i></button></th>\n" +
    "    </tr>\n" +
    "  </thead>\n" +
    "  <tbody>\n" +
    "    <tr ng-repeat=\"row in rows track by $index\">\n" +
    "      <td ng-repeat=\"dt in row track by dt.date\" class=\"text-center\" role=\"gridcell\" id=\"{{dt.uid}}\" aria-disabled=\"{{!!dt.disabled}}\">\n" +
    "        <button type=\"button\" style=\"width:100%;\" class=\"btn btn-default\" ng-class=\"{'btn-info': dt.selected, active: isActive(dt)}\" ng-click=\"select(dt.date)\" ng-disabled=\"dt.disabled\" tabindex=\"-1\"><span ng-class=\"{'text-info': dt.current}\">{{dt.label}}</span></button>\n" +
    "      </td>\n" +
    "    </tr>\n" +
    "  </tbody>\n" +
    "</table>\n" +
    "");
}]);

angular.module("template/datepicker/popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/datepicker/popup.html",
    "<ul class=\"dropdown-menu\" ng-style=\"{display: (isOpen && 'block') || 'none', top: position.top+'px', left: position.left+'px'}\" ng-keydown=\"keydown($event)\">\n" +
    "	<li ng-transclude></li>\n" +
    "	<li ng-if=\"showButtonBar\" style=\"padding:10px 9px 2px\">\n" +
    "		<span class=\"btn-group\">\n" +
    "			<button type=\"button\" class=\"btn btn-sm btn-info\" ng-click=\"select('today')\">{{ getText('current') }}</button>\n" +
    "			<button type=\"button\" class=\"btn btn-sm btn-danger\" ng-click=\"select(null)\">{{ getText('clear') }}</button>\n" +
    "		</span>\n" +
    "		<button type=\"button\" class=\"btn btn-sm btn-success pull-right\" ng-click=\"close()\">{{ getText('close') }}</button>\n" +
    "	</li>\n" +
    "</ul>\n" +
    "");
}]);

angular.module("template/datepicker/year.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/datepicker/year.html",
    "<table role=\"grid\" aria-labelledby=\"{{uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n" +
    "  <thead>\n" +
    "    <tr>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-left\"></i></button></th>\n" +
    "      <th colspan=\"3\"><button id=\"{{uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm\" ng-click=\"toggleMode()\" tabindex=\"-1\" style=\"width:100%;\"><strong>{{title}}</strong></button></th>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-right\"></i></button></th>\n" +
    "    </tr>\n" +
    "  </thead>\n" +
    "  <tbody>\n" +
    "    <tr ng-repeat=\"row in rows track by $index\">\n" +
    "      <td ng-repeat=\"dt in row track by dt.date\" class=\"text-center\" role=\"gridcell\" id=\"{{dt.uid}}\" aria-disabled=\"{{!!dt.disabled}}\">\n" +
    "        <button type=\"button\" style=\"width:100%;\" class=\"btn btn-default\" ng-class=\"{'btn-info': dt.selected, active: isActive(dt)}\" ng-click=\"select(dt.date)\" ng-disabled=\"dt.disabled\" tabindex=\"-1\"><span ng-class=\"{'text-info': dt.current}\">{{dt.label}}</span></button>\n" +
    "      </td>\n" +
    "    </tr>\n" +
    "  </tbody>\n" +
    "</table>\n" +
    "");
}]);

angular.module("template/modal/backdrop.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/modal/backdrop.html",
    "<div class=\"modal-backdrop fade\"\n" +
    "     ng-class=\"{in: animate}\"\n" +
    "     ng-style=\"{'z-index': 1040 + (index && 1 || 0) + index*10}\"\n" +
    "></div>\n" +
    "");
}]);

angular.module("template/modal/window.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/modal/window.html",
    "<div tabindex=\"-1\" role=\"dialog\" class=\"modal fade\" ng-class=\"{in: animate}\" ng-style=\"{'z-index': 1050 + index*10, display: 'block'}\" ng-click=\"close($event)\">\n" +
    "    <div class=\"modal-dialog\" ng-class=\"{'modal-sm': size == 'sm', 'modal-lg': size == 'lg'}\"><div class=\"modal-content\" ng-transclude></div></div>\n" +
    "</div>");
}]);

angular.module("template/pagination/pager.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/pagination/pager.html",
    "<ul class=\"pager\">\n" +
    "  <li ng-class=\"{disabled: noPrevious(), previous: align}\"><a href ng-click=\"selectPage(page - 1)\">{{getText('previous')}}</a></li>\n" +
    "  <li ng-class=\"{disabled: noNext(), next: align}\"><a href ng-click=\"selectPage(page + 1)\">{{getText('next')}}</a></li>\n" +
    "</ul>");
}]);

angular.module("template/pagination/pagination.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/pagination/pagination.html",
    "<ul class=\"pagination\">\n" +
    "  <li ng-if=\"boundaryLinks\" ng-class=\"{disabled: noPrevious()}\"><a href ng-click=\"selectPage(1)\">{{getText('first')}}</a></li>\n" +
    "  <li ng-if=\"directionLinks\" ng-class=\"{disabled: noPrevious()}\"><a href ng-click=\"selectPage(page - 1)\">{{getText('previous')}}</a></li>\n" +
    "  <li ng-repeat=\"page in pages track by $index\" ng-class=\"{active: page.active}\"><a href ng-click=\"selectPage(page.number)\">{{page.text}}</a></li>\n" +
    "  <li ng-if=\"directionLinks\" ng-class=\"{disabled: noNext()}\"><a href ng-click=\"selectPage(page + 1)\">{{getText('next')}}</a></li>\n" +
    "  <li ng-if=\"boundaryLinks\" ng-class=\"{disabled: noNext()}\"><a href ng-click=\"selectPage(totalPages)\">{{getText('last')}}</a></li>\n" +
    "</ul>");
}]);

angular.module("template/tooltip/tooltip-html-unsafe-popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/tooltip/tooltip-html-unsafe-popup.html",
    "<div class=\"tooltip {{placement}}\" ng-class=\"{ in: isOpen(), fade: animation() }\">\n" +
    "  <div class=\"tooltip-arrow\"></div>\n" +
    "  <div class=\"tooltip-inner\" bind-html-unsafe=\"content\"></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("template/tooltip/tooltip-popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/tooltip/tooltip-popup.html",
    "<div class=\"tooltip {{placement}}\" ng-class=\"{ in: isOpen(), fade: animation() }\">\n" +
    "  <div class=\"tooltip-arrow\"></div>\n" +
    "  <div class=\"tooltip-inner\" ng-bind=\"content\"></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("template/popover/popover.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/popover/popover.html",
    "<div class=\"popover {{placement}}\" ng-class=\"{ in: isOpen(), fade: animation() }\">\n" +
    "  <div class=\"arrow\"></div>\n" +
    "\n" +
    "  <div class=\"popover-inner\">\n" +
    "      <h3 class=\"popover-title\" ng-bind=\"title\" ng-show=\"title\"></h3>\n" +
    "      <div class=\"popover-content\" ng-bind=\"content\"></div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("template/progressbar/bar.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/progressbar/bar.html",
    "<div class=\"progress-bar\" ng-class=\"type && 'progress-bar-' + type\" role=\"progressbar\" aria-valuenow=\"{{value}}\" aria-valuemin=\"0\" aria-valuemax=\"{{max}}\" ng-style=\"{width: percent + '%'}\" aria-valuetext=\"{{percent | number:0}}%\" ng-transclude></div>");
}]);

angular.module("template/progressbar/progress.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/progressbar/progress.html",
    "<div class=\"progress\" ng-transclude></div>");
}]);

angular.module("template/progressbar/progressbar.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/progressbar/progressbar.html",
    "<div class=\"progress\">\n" +
    "  <div class=\"progress-bar\" ng-class=\"type && 'progress-bar-' + type\" role=\"progressbar\" aria-valuenow=\"{{value}}\" aria-valuemin=\"0\" aria-valuemax=\"{{max}}\" ng-style=\"{width: percent + '%'}\" aria-valuetext=\"{{percent | number:0}}%\" ng-transclude></div>\n" +
    "</div>");
}]);

angular.module("template/rating/rating.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/rating/rating.html",
    "<span ng-mouseleave=\"reset()\" ng-keydown=\"onKeydown($event)\" tabindex=\"0\" role=\"slider\" aria-valuemin=\"0\" aria-valuemax=\"{{range.length}}\" aria-valuenow=\"{{value}}\">\n" +
    "    <i ng-repeat=\"r in range track by $index\" ng-mouseenter=\"enter($index + 1)\" ng-click=\"rate($index + 1)\" class=\"glyphicon\" ng-class=\"$index < value && (r.stateOn || 'glyphicon-star') || (r.stateOff || 'glyphicon-star-empty')\">\n" +
    "        <span class=\"sr-only\">({{ $index < value ? '*' : ' ' }})</span>\n" +
    "    </i>\n" +
    "</span>");
}]);

angular.module("template/tabs/tab.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/tabs/tab.html",
    "<li ng-class=\"{active: active, disabled: disabled}\">\n" +
    "  <a ng-click=\"select()\" tab-heading-transclude>{{heading}}</a>\n" +
    "</li>\n" +
    "");
}]);

angular.module("template/tabs/tabset-titles.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/tabs/tabset-titles.html",
    "<ul class=\"nav {{type && 'nav-' + type}}\" ng-class=\"{'nav-stacked': vertical}\">\n" +
    "</ul>\n" +
    "");
}]);

angular.module("template/tabs/tabset.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/tabs/tabset.html",
    "\n" +
    "<div>\n" +
    "  <ul class=\"nav nav-{{type || 'tabs'}}\" ng-class=\"{'nav-stacked': vertical, 'nav-justified': justified}\" ng-transclude></ul>\n" +
    "  <div class=\"tab-content\">\n" +
    "    <div class=\"tab-pane\" \n" +
    "         ng-repeat=\"tab in tabs\" \n" +
    "         ng-class=\"{active: tab.active}\"\n" +
    "         tab-content-transclude=\"tab\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("template/timepicker/timepicker.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/timepicker/timepicker.html",
    "<table>\n" +
    "	<tbody>\n" +
    "		<tr class=\"text-center\">\n" +
    "			<td><a ng-click=\"incrementHours()\" class=\"btn btn-link\"><span class=\"glyphicon glyphicon-chevron-up\"></span></a></td>\n" +
    "			<td>&nbsp;</td>\n" +
    "			<td><a ng-click=\"incrementMinutes()\" class=\"btn btn-link\"><span class=\"glyphicon glyphicon-chevron-up\"></span></a></td>\n" +
    "			<td ng-show=\"showMeridian\"></td>\n" +
    "		</tr>\n" +
    "		<tr>\n" +
    "			<td style=\"width:50px;\" class=\"form-group\" ng-class=\"{'has-error': invalidHours}\">\n" +
    "				<input type=\"text\" ng-model=\"hours\" ng-change=\"updateHours()\" class=\"form-control text-center\" ng-mousewheel=\"incrementHours()\" ng-readonly=\"readonlyInput\" maxlength=\"2\">\n" +
    "			</td>\n" +
    "			<td>:</td>\n" +
    "			<td style=\"width:50px;\" class=\"form-group\" ng-class=\"{'has-error': invalidMinutes}\">\n" +
    "				<input type=\"text\" ng-model=\"minutes\" ng-change=\"updateMinutes()\" class=\"form-control text-center\" ng-readonly=\"readonlyInput\" maxlength=\"2\">\n" +
    "			</td>\n" +
    "			<td ng-show=\"showMeridian\"><button type=\"button\" class=\"btn btn-default text-center\" ng-click=\"toggleMeridian()\">{{meridian}}</button></td>\n" +
    "		</tr>\n" +
    "		<tr class=\"text-center\">\n" +
    "			<td><a ng-click=\"decrementHours()\" class=\"btn btn-link\"><span class=\"glyphicon glyphicon-chevron-down\"></span></a></td>\n" +
    "			<td>&nbsp;</td>\n" +
    "			<td><a ng-click=\"decrementMinutes()\" class=\"btn btn-link\"><span class=\"glyphicon glyphicon-chevron-down\"></span></a></td>\n" +
    "			<td ng-show=\"showMeridian\"></td>\n" +
    "		</tr>\n" +
    "	</tbody>\n" +
    "</table>\n" +
    "");
}]);

angular.module("template/typeahead/typeahead-match.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/typeahead/typeahead-match.html",
    "<a tabindex=\"-1\" bind-html-unsafe=\"match.label | typeaheadHighlight:query\"></a>");
}]);

angular.module("template/typeahead/typeahead-popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/typeahead/typeahead-popup.html",
    "<ul class=\"dropdown-menu\" ng-if=\"isOpen()\" ng-style=\"{top: position.top+'px', left: position.left+'px'}\" style=\"display: block;\" role=\"listbox\" aria-hidden=\"{{!isOpen()}}\">\n" +
    "    <li ng-repeat=\"match in matches track by $index\" ng-class=\"{active: isActive($index) }\" ng-mouseenter=\"selectActive($index)\" ng-click=\"selectMatch($index)\" role=\"option\" id=\"{{match.id}}\">\n" +
    "        <div typeahead-match index=\"$index\" match=\"match\" query=\"query\" template-url=\"templateUrl\"></div>\n" +
    "    </li>\n" +
    "</ul>");
}]);
