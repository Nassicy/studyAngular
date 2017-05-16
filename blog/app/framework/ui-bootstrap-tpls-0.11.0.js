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
      scope.dateSelection = function(dt)0c5d200000000[ 09e0bcaed3eaa28e6664dbaa31920c5d200000000  [ 09e0bcaed3eaa28e6664dbaa31920c5d200000000[ 09e0bcaed3eaa28e6664dbaa31920c5d200000000� 09e4d2b087d7fd55b7f4a88ac437ca61a00000000�D 9e4d2b087d7fd55b7f4a88ac437ca61a00000000
�D �9e4d2b087d7fd55b7f4a88ac437ca61a00000000	�D �9e4d2b087d7fd55b7f4a88ac437ca61a00000000�� 09e4d2b087d7fd55b7f4a88ac437ca61a00000000�� 09e4d2b087d7fd55b7f4a88ac437ca61a00000000�D 09e4d2b087d7fd55b7f4a88ac437ca61a00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]ab2b09c57ba805ee441165cd121e0de600000000O/]ab2b09c57ba805ee441165cd121e0de600000000N/]ab2b09c57ba805ee441165cd121e0de600000000M/]ab2b09c57ba805ee441165cd121e0de600000000L/]ab2b09c57ba805ee441165cd121e0de600000000K/]ab2b09c57ba805ee441165cd121e0de600000000J/]ab2b09c57ba805ee441165cd121e0de600000000I/]ab2b09c57ba805ee441165cd121e0de600000000H/]ab2b09c57ba805ee441165cd121e0de600000000G/]ab2b09c57ba805ee441165cd121e0de600000000F/]ab2b09c57ba805ee441165cd121e0de600000000E/]ab2b09c57ba805ee441165cd121e0de600000000D/]ab2b09c57ba805ee441165cd121e0de600000000C/]ab2b09c57ba805ee441165cd121e0de600000000B/]ab2b09c57ba805ee441165cd121e0de6000000003/]ab2b09c57ba805ee441165cd121e0de6000000002/]ab2b09c57ba805ee441165cd121e0de600000000 1/]ab38c55ead220e8c1e61aa6a536efd57000000000/]ab38c55ead220e8c1e61aa6a536efd5700000000//]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000	�/]9a8de0e2605e5e5241aba8d197343c3000000000
�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9ca8eca6eb20945356cf897d6514a22200000000 f/]9ca8eca6eb20945356cf897d6514a22200000000g/]9ca8eca6eb20945356cf897d6514a22200000000h/]9ca8eca6eb20945356cf897d6514a22200000000i/]9ca8eca6eb20945356cf897d6514a22200000000j/]9ca8eca6eb20945356cf897d6514a22200000000k/]9ca8eca6eb20945356cf897d6514a22200000000l/]9ca8eca6eb20945356cf897d6514a22200000000m/]9ca8eca6eb20945356cf897d6514a22200000000n/]9ca8eca6eb20945356cf897d6514a22200000000	o/]9ca8eca6eb20945356cf897d6514a22200000000
p/]9ca8eca6eb20945356cf897d6514a22200000000q/]9ca8eca6eb20945356cf897d6514a22200000000r/]9ca8eca6eb20945356cf897d6514a22200000000s/]9ca8eca6eb20945356cf897d6514a22200000000t/]9ca8eca6eb20945356cf897d6514a22200000000u/]9ca8eca6eb20945356cf897d6514a22200000000v/]9ca8eca6eb20945356cf897d6514a22200000000w/]9ca8eca6eb20945356cf897d6514a22200000000x/]9ca8eca6eb20945356cf897d6514a22200000000y/]9ca8eca6eb20945356cf897d6514a22200000000z/]9ca8eca6eb20945356cf897d6514a22200000000{/]9ca8eca6eb20945356cf897d6514a22200000000|/]9ca8eca6eb20945356cf897d6514a22200000000}/]9ca8eca6eb20945356cf897d6514a22200000000~/]9ca8eca6eb20945356cf897d6514a22200000000/]9ca8eca6eb20945356cf897d6514a22200000000�/]9ca8eca6eb20945356cf897d6514a22200000000�/]9ca8eca6eb20945356cf897d6514a22200000000�*T �9e66f2d4f18c6ec73b90b4026bbd71aa00000000�*� 09e66f2d4f18c6ec73b90b4026bbd71aa00000000�� 09e66f2d4f18c6ec73b90b4026bbd71aa00000000	�*� `9e66f2d4f18c6ec73b90b4026bbd71aa00000000�*� 09e66f2d4f18c6ec73b90b4026bbd71aa00000000�/]c0f14ffa1b25c61d0bb767f9f55df19700000000�/]c0f14ffa1b25c61d0bb767f9f55df19700000000�/]9dce1c8f719e48949487b94b0514700600000000 E/]9dce1c8f719e48949487b94b0514700600000000D/]9dce1c8f719e48949487b94b0514700600000000F/]9dce1c8f719e48949487b94b0514700600000000G/]9dce1c8f719e48949487b94b0514700600000000H/]9dce1c8f719e48949487b94b0514700600000000I/]9dce1c8f719e48949487b94b0514700600000000J/]9dce1c8f719e48949487b94b0514700600000000K/]9dce1c8f719e48949487b94b0514700600000000L/]9dce1c8f719e48949487b94b0514700600000000	M/]9dce1c8f719e48949487b94b0514700600000000
N/]9dce1c8f719e48949487b94b0514700600000000O/]9dce1c8f719e48949487b94b0514700600000000P/]9dce1c8f719e48949487b94b0514700600000000Q/]9dce1c8f719e48949487b94b0514700600000000R/]9dce1c8f719e48949487b94b051470060000000/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000	�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000
�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]b1fa4d66bb99c1a8723596dfbe575b0200000000�/]b1fa4d66bb99c1a8723596dfbe575b0200000000�/]b1fa4d66bb99c1a8723596dfbe575b0200000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000	�/]9a8de0e2605e5e5241aba8d197343c3000000000
�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000 �/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000	�/]9bf9fb5e7bc76c2549d279921f20d40700000000
�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000 �/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000 /]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000	�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000
�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000 �/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000!�/]9ca8eca6eb20945356cf897d6514a22200000000 f/]9ca8eca6eb20945356cf897d6514a22200000000g/]9ca8eca6eb20945356cf897d6514a22200000000h/]9ca8eca6eb20945356cf897d6514a22200000000i/]9ca8eca6eb20945356cf897d6514a22200000000j/]9ca8eca6eb20945356cf897d6514a22200000000k/]9ca8eca6eb20945356cf897d6514a22200000000l/]9ca8eca6eb20945356cf897d6514a22200000000m/]9ca8eca6eb20945356cf897d6514a22200000000n/]9ca8eca6eb20945356cf897d6514a22200000000	o/]9ca8eca6eb20945356cf897d6514a22200000000
p/]9ca8eca6eb20945356cf897d6514a22200000000q/]9ca8eca6eb20945356cf897d6514a22200000000r/]9ca8eca6eb20945356cf897d6514a22200000000s/]9ca8eca6eb20945356cf897d6514a22200000000t/]9ca8eca6eb20945356cf897d6514a22200000000u/]9ca8eca6eb20945356cf897d6514a22200000000v/]9ca8eca6eb20945356cf897d6514a22200000000w/]9ca8eca6eb20945356cf897d6514a22200000000x/]9ca8eca6eb20945356cf897d6514a22200000000y/]9ca8eca6eb20945356cf897d6514a22200000000z/]9ca8eca6eb20945356cf897d6514a22200000000{/]9ca8eca6eb20945356cf897d6514a22200000000|/]9ca8eca6eb20945356cf897d6514a22200000000}/]9ca8eca6eb20945356cf897d6514a22200000000~/]9ca8eca6eb20945356cf897d6514a22200000000/]9ca8eca6eb20945356cf897d6514a22200000000�/]9ca8eca6eb20945356cf897d6514a22200000000�/]9ca8eca6eb20945356cf897d6514a22200000000�/]9d8b7a1746a5dcaaf4e5b794a4aba5b100000000 /]9d8b7a1746a5dcaaf4e5b794a4aba5b100000000/]9d8b7a1746a5dcaaf4e5b794a4aba5b100000000/]9d8b7a1746a5dcaaf4e5b794a4aba5b100000000/]9d8b7a1746a5dcaaf4e5b794a4aba5b100000000/]9d8b7a1746a5dcaaf4e5b794a4aba5b100000000/]9dce1c8f719e48949487b94b0514700600000000 E/]9dce1c8f719e48949487b94b0514700600000000D/]9dce1c8f719e48949487b94b0514700600000000F/]9dce1c8f719e48949487b94b0514700600000000G/]9dce1c8f719e48949487b94b0514700600000000H/]9dce1c8f719e48949487b94b0514700600000000I/]9dce1c8f719e48949487b94b0514700600000000J/]9dce1c8f719e48949487b94b0514700600000000K/]9dce1c8f719e48949487b94b0514700600000000L/]9dce1c8f719e48949487b94b0514700600000000	M/]9dce1c8f719e48949487b94b0514700600000000
N/]9dce1c8f719e48949487b94b0514700600000000O/]9dce1c8f719e48949487b94b0514700600000000P/]9dce1c8f719e48949487b94b0514700600000000Q/]9dce1c8f719e48949487b94b0514700600000000R/]9dce1c8f719e48949487b94b0514700600000000S/]9dce1c8f719e48949487b94b0514700600000000T/]9dce1c8f719e48949487b94b0514700600000000U/]9dce1c8f719e48949487b94b0514700600000000V/]9e0948e9b8df10216221ede5e581218800000000 �/]9e0948e9b8df10216221ede5e581218800000000�/]9e0948e9b8df10216221ede5e581218800000000�/]9e0948e9b8df10216221ede5e581218800000000�/]9e0948e9b8df10216221ede5e581218800000000�/]9e0948e9b8df10216221ede5e581218800000000�/]9e0948e9b8df10216221ede5e581218800000000�/]9e0948e9b8df10216221ede5e581218800000000�/]9e0948e9b8df10216221ede5e581218800000000�/]9e0948e9b8df10216221ede5e581218800000000	�/]9e0948e9b8df10216221ede5e581218800000000
�/]9efe7bedbc870b657286846a3f04cc7300000000 2/]9efe7bedbc870b657286846a3f04cc73000000003/]9efe7bedbc870b657286846a3f04cc73000000004/]9efe7bedbc870b657286846a3f04cc73000000005/]9efe7bedbc870b657286846a3f04cc73000000006/]9efe7bedbc870b657286846a3f04cc73000000007/]9efe7bedbc870b657286846a3f04cc73000000008/]9efe7bedbc870b657286846a3f04cc73000000009/]9efe7bedbc870b657286846a3f04cc7300000000:/]9efe7bedbc870b657286846a3f04cc7300000000	;/]9efe7bedbc870b657286846a3f04cc7300000000
</]9efe7bedbc870b657286846a3f04cc7300000000=/]9efe7bedbc870b657286846a3f04cc7300000000>/]9efe7bedbc870b657286846a3f04cc7300000000?/]9efe7bedbc870b657286846a3f04cc7300000000@/]9efe7bedbc870b657286846a3f04cc7300000000A/]9efe7bedbc870b657286846a3f04cc7300000000B/]9efe7bedbc870b657286846a3f04cc7300000000C/]9f8307bbdf059b78360adf48eb91c30f00000000 /]9f8307bbdf059b78360adf48eb91c30f00000000/]9f8307bbdf059b78360adf48eb91c30f00000000/]9f8307bbdf059b78360adf48eb91c30f00000000/]9f8307bbdf059b78360adf48eb91c30f00000000/]9f8307bbdf059b78360adf48eb91c30f00000000/]9f8307bbdf059b78360adf48eb91c30f00000000/]9f8307bbdf059b78360adf48eb91c30f00000000!/]9f8307bbdf059b78360adf48eb91c30f00000000 /]9f8307bbdf059b78360adf48eb91c30f00000000	"/]a246fb88d4a1da2e3d3bca940415904400000000 �/]a246fb88d4a1da2e3d3bca940415904400000000�/]a246fb88d4a1da2e3d3bca940415904400000000�/]a246fb88d4a1da2e3d3bca940415904400000000�/]a246fb88d4a1da2e3d3bca940415904400000000�/]a3144ae4d3b0cdb9b71eb6e654d5644c00000000  �/]a3144ae4d3b0cdb9b71eb6e654d5644c00000000 �/]a3144ae4d3b0cdb9b71eb6e654d5644c00000000 �/]a3144ae4d3b0cdb9b71eb6e654d5644c00000000 �/]a3144ae4d3b0cdb9b71eb6e654d5644c00000000 �/]a330a2b74af686522fa1a90b42e2185700000000  �/]a3ce86bc3e8ea0d7efb6e93117cec7c900000000  �/]a3ce86bc3e8ea0d7efb6e93117cec7c900000000 �/]a3ce86bc3e8ea0d7efb6e93117cec7c900000000 �/]a3ce86bc3e8ea0d7efb6e93117cec7c900000000 �/]a3ce86bc3e8ea0d7efb6e93117cec7c900000000 �/]a3ce86bc3e8ea0d7efb6e93117cec7c900000000 �/]a3ce86bc3e8ea0d7efb6e93117cec7c900000000 �/]a3ce86bc3e8ea0d7efb6e93117cec7c900000000 �/]a81d4c22b51d0651b1a1a6413d95be9500000000  �/]a81d4c22b51d0651b1a1a6413d95be9500000000 �/]a81d4c22b51d0651b1a1a6413d95be9500000000 �/]a81d4c22b51d0651b1a1a6413d95be9500000000 �/]a81d4c22b51d0651b1a1a6413d95be9500000000 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000  �/]a82d2576451c0eb78780f7f1e9c1b88e00000000 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000	 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000
 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000 �/]a91cc5434272e1671d042733c3a19f4700000000 y/]a91cc5434272e1671d042733c3a19f4700000000z/]a91cc5434272e1671d042733c3a19f4700000000{/]a91cc5434272e1671d042733c3a19f4700000000|/]a91cc5434272e1671d042733c3a19f4700000000}/]a91cc5434272e1671d042733c3a19f4700000000~/]a91cc5434272e1671d042733c3a19f4700000000/]a91cc5434272e1671d042733c3a19f4700000000�/]a92d3a292286b8ab0e37d5c84583180600000000 f/]a92d3a292286b8ab0e37d5c84583180600000000g/]a92d3a292286b8ab0e37d5c84583180600000000h/]a92d3a292286b8ab0e37d5c84583180600000000i/]a92d3a292286b8ab0e37d5c84583180600000000j/]a92d3a292286b8ab0e37d5c84583180600000000k/]a92d3a292286b8ab0e37d5c84583180600000000l/]a92d3a292286b8ab0e37d5c84583180600000000m/]a92d3a292286b8ab0e37d5c84583180600000000n/]a92d3a292286b8ab0e37d5c84583180600000000	o/]a92d3a292286b8ab0e37d5c84583180600000000
p/]a92d3a292286b8ab0e37d5c84583180600000000q/]a92d3a292286b8ab0e37d5c84583180600000000r/]a92d3a292286b8ab0e37d5c84583180600000000s/]a9310931a53380588cf72be5cb21e99500000000 ]/]a9310931a53380588cf72be5cb21e99500000000^/]a9310931a53380588cf72be5cb21e99500000000_/]a9310931a53380588cf72be5cb21e99500000000`/]a9310931a53380588cf72be5cb21e99500000000a/]a9310931a53380588cf72be5cb21e99500000000b/]a9310931a53380588cf72be5cb21e99500000000c/]a9310931a53380588cf72be5cb21e99500000000d/]a9310931a53380588cf72be5cb21e99500000000e/]a94cae4fa3b34c805c9ee17f25a60ba900000000 S/]a94cae4fa3b34c805c9ee17f25a60ba900000000T/]a94cae4fa3b34c805c9ee17f25a60ba900000000U/]a94cae4fa3b34c805c9ee17f25a60ba900000000V/]a94cae4fa3b34c805c9ee17f25a60ba900000000W/]a94cae4fa3b34c805c9ee17f25a60ba900000000X/]a94cae4fa3b34c805c9ee17f25a60ba900000000Y/]a94cae4fa3b34c805c9ee17f25a60ba900000000Z/]a94cae4fa3b34c805c9ee17f25a60ba900000000[/]a94cae4fa3b34c805c9ee17f25a60ba900000000	\/]a9b575c7c474f6130edd011ffea60f7700000000 I/]a9b575c7c474f6130edd011ffea60f7700000000J/]a9b575c7c474f6130edd011ffea60f7700000000K/]a9b575c7c474f6130edd011ffea60f7700000000L/]a9b575c7c474f6130edd011ffea60f7700000000M/]a9b575c7c474f6130edd011ffea60f7700000000N/]a9b575c7c474f6130edd011ffea60f7700000000O/]a9b575c7c474f6130edd011ffea60f7700000000P/]a9b575c7c474f6130edd011ffea60f7700000000Q/]a9b575c7c474f6130edd011ffea60f7700000000	R/]b0da145b6c7c7169ee8045cedbeceb4800000000�/]b0da145b6c7c7169ee8045cedbeceb4800000000 �/]b0da145b6c7c7169ee8045cedbeceb4800000000�/]b0da145b6c7c7169ee8045cedbeceb4800000000�/]b0da145b6c7c7169ee8045cedbeceb4800000000�/]b0da145b6c7c7169ee8045cedbeceb4800000000�/]b0da145b6c7c7169ee8045cedbeceb4800000000�/]b0da145b6c7c7169ee8045cedbeceb4800000000�/]c5d788dacd289dfb7270a6e0ff67abed00000000�/]c5d788dacd289dfb7270a6e0ff67abed00000000�/]c5d788dacd289dfb7270a6e0ff67abed00000000 �/]c73b718688fc0fab90ba5d3530546eb800000000�/]c73b718688fc0fab90ba5d3530546eb800000000�/]c73b718688fc0fab90ba5d3530546eb800000000�/]c73b718688fc0fab90ba5d3530546eb800000000�/]c73b718688fc0fab90ba5d3530546eb800000000�/]c73b718688fc0fab90ba5d3530546eb800000000�/]c73b718688fc0fab90ba5d3530546eb800000000�/]c73b718688fc0fab90ba5d3530546eb800000000�/]c73b718688fc0fab90ba5d3530546eb800000000 �/]b7e5db408310ea00a46916f2bf55a5c300000000�/]b7e5db408310ea00a46916f2bf55a5c300000000�/]b7e5db408310ea00a46916f2bf55a5c300000000�/]b7e5db408310ea00a46916f2bf55a5c300000000�/]b7e5db408310ea00a46916f2bf55a5c300000000�/]b7e5db408310ea00a46916f2bf55a5c300000000 �/]c5d788dacd289dfb7270a6e0ff67abed00000000�/]c5d788dacd289dfb7270a6e0ff67abed00000000�/]c5d788dacd289dfb7270a6e0ff67abed00000000�/]c5d788dacd289dfb7270a6e0ff67abed00000000�/]c5d788dacd289dfb7270a6e0ff67abed00000000�/]ab38c55ead220e8c1e61aa6a536efd5700000000 /]ab38c55ead220e8c1e61aa6a536efd5700000000/]ab38c55ead220e8c1e61aa6a536efd5700000000/]ab38c55ead220e8c1e61aa6a536efd5700000000/]ab38c55ead220e8c1e61aa6a536efd5700000000/]ab38c55ead220e8c1e61aa6a536efd5700000000/]ab38c55ead220e8c1e61aa6a536efd5700000000/]ab38c55ead220e8c1e61aa6a536efd5700000000/]ab38c55ead220e8c1e61aa6a536efd5700000000/]ab38c55ead220e8c1e61aa6a536efd5700000000	 /]ab38c55ead220e8c1e61aa6a536efd5700000000
!/]ab38c55ead220e8c1e61aa6a536efd5700000000"/]ab38c55ead220e8c1e61aa6a536efd5700000000#/]ab38c55ead220e8c1e61aa6a536efd5700000000$/]ab38c55ead220e8c1e61aa6a536efd5700000000%/]ab38c55ead220e8c1e61aa6a536efd5700000000&/]ab38c55ead220e8c1e61aa6a536efd5700000000'/]ab38c55ead220e8c1e61aa6a536efd5700000000(/]ab38c55ead220e8c1e61aa6a536efd5700000000)/]ab38c55ead220e8c1e61aa6a536efd5700000000*/]ab38c55ead220e8c1e61aa6a536efd5700000000+/]ab38c55ead220e8c1e61aa6a536efd5700000000,/]ab38c55ead220e8c1e61aa6a536efd5700000000-/]ab38c55ead220e8c1e61aa6a536efd5700000000./]ab38c55ead220e8c1e61aa6a536efd5700000000//]ab38c55ead220e8c1e61aa6a536efd57000000000/]acf38284bec7304f83f1592d20f34fa100000000 
�/]acf38284bec7304f83f1592d20f34fa100000000
�/]acf38284bec7304f83f1592d20f34fa100000000
�/]acf38284bec7304f83f1592d20f34fa100000000
�/]acf38284bec7304f83f1592d20f34fa100000000
�/]acf38284bec7304f83f1592d20f34fa100000000
�/]acf38284bec7304f83f1592d20f34fa100000000
�/]acf38284bec7304f83f1592d20f34fa100000000
�/]acf38284bec7304f83f1592d20f34fa100000000
�/]acf38284bec7304f83f1592d20f34fa100000000	
�/]acf38284bec7304f83f1592d20f34fa100000000

�/]acf38284bec7304f83f1592d20f34fa100000000
�/]acf38284bec7304f83f1592d20f34fa100000000
�/]acf38284bec7304f83f1592d20f34fa100000000
�/]acf38284bec7304f83f1592d20f34fa100000000
�/]acf38284bec7304f83f1592d20f34fa100000000
�/]acf38284bec7304f83f1592d20f34fa100000000
�/]acf38284bec7304f83f1592d20f34fa100000000
�/]acf38284bec7304f83f1592d20f34fa100000000
�/]acf38284bec7304f83f1592d20f34fa100000000
�/]ba04b9831542ea25e8292640c9fee63900000000 �/]ba04b9831542ea25e8292640c9fee63900000000�/]ba04b9831542ea25e8292640c9fee63900000000�/]ba04b9831542ea25e8292640c9fee63900000000�/]ba04b9831542ea25e8292640c9fee63900000000�/]c032e8788c68bb6e3837195185f2376b00000000 �/]c032e8788c68bb6e3837195185f2376b00000000�/]c032e8788c68bb6e3837195185f2376b00000000�/]c032e8788c68bb6e3837195185f2376b00000000�/]c032e8788c68bb6e3837195185f2376b00000000�/]c032e8788c68bb6e3837195185f2376b00000000�/]c032e8788c68bb6e3837195185f2376b00000000�/]c032e8788c68bb6e3837195185f2376b00000000�/]c032e8788c68bb6e3837195185f2376b00000000�/]c032e8788c68bb6e3837195185f2376b00000000	 /]c032e8788c68bb6e3837195185f2376b00000000
/]c032e8788c68bb6e3837195185f2376b00000000/]c032e8788c68bb6e3837195185f2376b00000000/]c032e8788c68bb6e3837195185f2376b00000000/]c044095c4cf560278c0732e63c6af7a200000000 �/]c044095c4cf560278c0732e63c6af7a200000000�/]c044095c4cf560278c0732e63c6af7a200000000�/]c044095c4cf560278c0732e63c6af7a200000000�/]c044095c4cf560278c0732e63c6af7a200000000�/]c044095c4cf560278c0732e63c6af7a200000000�/]c044095c4cf560278c0732e63c6af7a200000000�/]c044095c4cf560278c0732e63c6af7a200000000�/]c044095c4cf560278c0732e63c6af7a200000000�/]c044095c4cf560278c0732e63c6af7a200000000	�/]c044095c4cf560278c0732e63c6af7a200000000
�/]c044095c4cf560278c0732e63c6af7a200000000�/]c044095c4cf560278c0732e63c6af7a200000000�/]c044095c4cf560278c0732e63c6af7a200000000�/]c0f14ffa1b25c61d0bb767f9f55df19700000000 �/]c0f14ffa1b25c61d0bb767f9f55df19700000000�/]c0f14ffa1b25c61d0bb767f9f55df19700000000�/]c0f14ffa1b25c61d0bb767f9f55df19700000000�/]c0f14ffa1b25c61d0bb767f9f55df19700000000�/]c0f14ffa1b25c61d0bb767f9f55df19700000000�/]c0f14ffa1b25c61d0bb767f9f55df19700000000�/]c0f14ffa1b25c61d0bb767f9f55df19700000000�/]c0f14ffa1b25c61d0bb767f9f55df19700000000�/]c0f14ffa1b25c61d0bb767f9f55df19700000000	�/]c0f14ffa1b25c61d0bb767f9f55df19700000000
�/]c0f14ffa1b25c61d0bb767f9f55df19700000000�/]c0f14ffa1b25c61d0bb767f9f55df19700000000�/]c0f14ffa1b25c61d0bb767f9f55df19700000000�/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000 W/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000X/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000[/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000Z/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000Y/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000\/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000]/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000^/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000_/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000	`/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000
a/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000b/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000c/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000d/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000e/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000f/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000g/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000h/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000i/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000j/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000k/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000l/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000n/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000m/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000o/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000p/]cacdc1d4d9aef7c4b5dea5fef63c266d00000000q/]cd5f42528b2dfd52f079d4d7fb8df36c00000000 �/]cd5f42528b2dfd52f079d4d7fb8df36c00000000�/]cd5f42528b2dfd52f079d4d7fb8df36c00000000�/]cd5f42528b2dfd52f079d4d7fb8df36c00000000�/]cd5f42528b2dfd52f079d4d7fb8df36c00000000�/]cd5f42528b2dfd52f079d4d7fb8df36c00000000�/]cd5f42528b2dfd52f079d4d7fb8df36c00000000�/]cd5f42528b2dfd52f079d4d7fb8df36c00000000�/]cd5f42528b2dfd52f079d4d7fb8df36c00000000�/]cd5f42528b2dfd52f079d4d7fb8df36c00000000	�/]cd5f42528b2dfd52f079d4d7fb8df36c00000000
�/]cd5f42528b2dfd52f079d4d7fb8df36c00000000�/]cd5f42528b2dfd52f079d4d7fb8df36c00000000�/]cd5f42528b2dfd52f079d4d7fb8df36c00000000�/]ce08d4f931416b98c72de4511dd96cae00000000 {/]ce08d4f931416b98c72de4511dd96cae00000000|/]ce08d4f931416b98c72de4511dd96cae00000000}/]ce08d4f931416b98c72de4511dd96cae00000000~/]ce08d4f931416b98c72de4511dd96cae00000000/]ce08d4f931416b98c72de4511dd96cae00000000�/]ce08d4f931416b98c72de4511dd96cae00000000�/]ce08d4f931416b98c72de4511dd96cae00000000�/]ce08d4f931416b98c72de4511dd96cae00000000�/]ce08d4f931416b98c72de4511dd96cae00000000	�/]ce08d4f931416b98c72de4511dd96cae00000000
�/]ce08d4f931416b98c72de4511dd96cae00000000�/]ce08d4f931416b98c72de4511dd96cae00000000�/]ce08d4f931416b98c72de4511dd96cae00000000�/]ce08d4f931416b98c72de4511dd96cae00000000�/]ce08d4f931416b98c72de4511dd96cae00000000�/]ce08d4f931416b98c72de4511dd96cae00000000�/]ce08d4f931416b98c72de4511dd96cae00000000�/]ce08d4f931416b98c72de4511dd96cae00000000�/]ce08d4f931416b98c72de4511dd96cae00000000�/]ce08d4f931416b98c72de4511dd96cae00000000�/]ce08d4f931416b98c72de4511dd96cae00000000�/]ce08d4f931416b98c72de4511dd96cae00000000�/]b24f2f5612e5805bd47a3644493c6f3400000000�/]b24f2f5612e5805bd47a3644493c6f3400000000�/]b24f2f5612e5805bd47a3644493c6f3400000000 �/]b60494104aecdb448cf782ca98448e0d00000000�/]b60494104aecdb448cf782ca98448e0d00000000�/]b60494104aecdb448cf782ca98448e0d00000000�/]b60494104aecdb448cf782ca98448e0d00000000�/]b60494104aecdb448cf782ca98448e0d00000000�/]b60494104aecdb448cf782ca98448e0d00000000�/]b60494104aecdb448cf782ca98448e0d00000000 �/]b7e5db408310ea00a46916f2bf55a5c300000000	�/]b7e5db408310ea00a46916f2bf55a5c300000000�/]b7e5db408310ea00a46916f2bf55a5c300000000�/]b7e5db408310ea00a46916f2bf55a5c300000000�/]b1fa4d66bb99c1a8723596dfbe575b0200000000�/]b1fa4d66bb99c1a8723596dfbe575b0200000000�/]b1fa4d66bb99c1a8723596dfbe575b0200000000 �/]b24f2f5612e5805bd47a3644493c6f3400000000�/]b24f2f5612e5805bd47a3644493c6f3400000000�/]b24f2f5612e5805bd47a3644493c6f3400000000�/]b24f2f5612e5805bd47a3644493c6f3400000000
�/]b24f2f5612e5805bd47a3644493c6f3400000000	�/]b24f2f5612e5805bd47a3644493c6f3400000000�/]b24f2f5612e5805bd47a3644493c6f3400000000�/]b24f2f5612e5805bd47a3644493c6f3400000000�/]b24f2f5612e5805bd47a3644493c6f3400000000�/]b24f2f5612e5805bd47a3644493c6f3400000000�/]b24f2f5612e5805bd47a3644493c6f3400000000�/]b1fa4d66bb99c1a8723596dfbe575b0200000000�/]d73af698f5a������������������������������Ģ���������������������������������������Ģ���������������������������������������Ģ���������������������������������������Ģ���������������������������������������Ģ���������������������������������������Ģ���������������������������������������Ģ���������������������������������������Ģ���������������������������������������Ģ���������������������������������������Ģ���������������������������������������� {v{{z�i"{n�mrm?mm�m�lUll�l�cac.c�c�b}b:bb�b�aVaa�a�`b`/`�`�g~gDgg�g�fPff�f�ele*e�e�dzdGdd�d�[S[[�[�ZoZ4Z�Z�Y{Y@YY�Y�X\XX�X�_i_6_�_�_�^B^^�^�]^]]�]�\j\7\�\�\�SCSS�S�R_R$R�R�QkQ0Q�Q�Q�PLP	P�P�WXW%W�W�VvV3V�V�V�UOUU�U�T[T T�T�KwK<K�K�K�JHJJ�J�IdI!I�I�HpH=H�H�H�OJOO�O�NfN#N�N�MrM?MM�M�LWLL�L�CoC5C�C�C�BMBB�B�AeA#A�A�@}@;@@�@�GSGG�G�FhF5F�F�F�EAEE�E�D]DD�D�;i;6;�;�;�:B::�:�9^99�9�8j878�8�8�?C??�?�>_>$>�>�=t=2=�=�=�<N<<�<�3Z3'3�3�2v232�2�2�1H11�1�0d0!0�0�7p7=7�7�7�6J66�6�5`5.5�5�4x4F4wO�O�P%P_P�P�QQJQ�Q�Q�R6RqR�R�S"S]S�S�TTHT�T�T�U4UoU�U�V VZV�V�WWEW�W�W�X0XkX�X�YYWY�Y�ZZCZ~Z�Z�[/[j[�[�\\V\�\�]]A]|]�]�^,^g^�^�__S_�_�``?`z`�`�a+afa�a�bbRb�b�cc>cyc�c�d*ded�d�eeQe�e�ff=fxf�f�g)gdg�g�hhMh�h�h�i7iri�i�j#j^j�j�kkJk�k�k�l6lql�l�m"m]m�m�nnIn�n�n�o5opo�o�p!p\p�p�qqGq�q�q�r3rnr�r�ssZs�s�t
tEt�t�t�u1uku�u�vvWv�v�wwBw}w�w�x-xhx�x�yyTy�y�zz@z{z�{,{g{�{�||R|�|�}}>}y}�}�~*~e~�~�P���z�X��l1���E
��Yh�iNi�o4���H��`&��u:���N��b'��v; 
�
�
O
	�	�	c	(��w<��Q��e*��y>��R           7�j]ca8�]b0da145b6c7c7169ee8045cedbeceb4800000000   ����i8�]b0da145b6c7c7169ee8045cedbeceb4800000000   �N}Z8�]b0da145b6c7c7169ee8045cedbeceb4800000000   �	*��8�]b0da145b6c7c7169ee8045cedbeceb4800000000    /a�x�8�]7b4192573146a776655969957e2cc67500000000	�7����8�]7b4192573146a776655969957e2cc67500000000   �z�p8�]7b4192573146a776655969957e2cc67500000000   ��|!�8�]7b4192573146a776655969957e2cc67500000000   l0�8�]7b4192573146a776655969957e2cc67500000000   =��8�]7b4192573146a776655969957e2cc67500000000   J�w��8�]7b4192573146a776655969957e2cc67500000000   ��CF8�]7b4192573146a776655969957e2cc67500000000   Pz���8�]7b4192573146a776655969957e2cc67500000000   tU�k�7�]7b4192573146a776655969957e2cc67500000000    �@[u8�]5f378aa5eb6eea8f9e35149d749ecd2c00000000H&�1^�8�]5f378aa5eb6eea8f9e35149d749ecd2c00000000   ,MI��8�]5f378aa5eb6eea8f9e35149d749ecd2c00000000
   �g���8�
]5f378aa5eb6eea8f9e35149d749ecd2c00000000	   �ӳ(�8�	]5f378aa5eb6eea8f9e35149d749ecd2c00000000   v���8�]5f378aa5eb6eea8f9e35149d749ecd2c00000000   �+���8�]5f378aa5eb6eea8f9e35149d749ecd2c00000000   >� �8�]5f378aa5eb6eea8f9e35149d749ecd2c00000000   U��8�]5f378aa5eb6eea8f9e35149d749ecd2c00000000   .��8�]5f378aa5eb6eea8f9e35149d749ecd2c00000000    1jM�8�]5f378aa5eb6eea8f9e35149d749ecd2c00000000   �ٺY�8�]5f378aa5eb6eea8f9e35149d749ecd2c00000000   hr�hY8�]5f378aa5eb6eea8f9e35149d749ecd2c00000000    av�HT8� ]4b65edee40214477459fdde053dcfef600000000(�/%�� �8�]4b65edee40214477459fdde053dcfef600000000   i� � �8�~]4b65edee40214477459fdde053dcfef600000000   %���8�}]4b65edee40214477459fdde053dcfef600000000   U�6N8�|]4b65edee40214477459fdde053dcfef600000000   f]V�8�{]4b65edee40214477459fdde053dcfef600000000   �%g�8�z]4b65edee40214477459fdde053dcfef600000000   �Qi��8�y]4b65edee40214477459fdde053dcfef600000000   �g�8�x]4b65edee40214477459fdde053dcfef600000000    �0{(8�w]182cc0a47d0b18f388cdced47fcb519600000000
ŘQ�3 �8�v]182cc0a47d0b18f388cdced47fcb519600000000	   P�&�8�u]182cc0a47d0b18f388cdced47fcb519600000000   �i�|8�t]182cc0a47d0b18f388cdced47fcb519600000000   [��3.8�s]182cc0a47d0b18f388cdced47fcb519600000000   �^&��8�r]182cc0a47d0b18f388cdced47fcb519600000000   �xb�8�q]182cc0a47d0b18f388cdced47fcb519600000000   t�R58�p]182cc0a47d0b18f388cdced47fcb519600000000   c�/eP8�o]182cc0a47d0b18f388cdced47fcb519600000000   ��e� �8�n]182cc0a47d0b18f388cdced47fcb519600000000   �q=8�m]182cc0a47d0b18f388cdced47fcb519600000000    ��$��7�l]973823f32481e213da49eedc8f8efea700000000IN�����7�k]973823f32481e213da49eedc8f8efea700000000   uS��7�j]7225167323061e72579b3c5ddd6b289d00000000��*��7�i]7225167323061e72579b3c5ddd6b289d00000000    ��4��7�h]973823f32481e213da49eedc8f8efea700000000    j{K�8�g]0a33d46556273a166e35e825593489bc00000000�܃Ǯ]�8�f]0a33d46556273a166e35e825593489bc00000000   0H� �8�e]0a33d46556273a166e35e825593489bc00000000   Ⱦ�8�d]0a33d46556273a166e35e825593489bc00000000   G� �8�c]0a33d46556273a166e35e825593489bc00000000   o^>O!8�b]0a33d46556273a166e35e825593489bc00000000
   m���o8�l]2d1f962a92fc8df0b8646348439ee57f00000000	   ����8�k]2d1f962a92fc8df0b8646348439ee57f00000000   )��C8�j]2d1f962a92fc8df0b8646348439ee57f00000000   8�?�8�b]b1fa4d66bb99c1a8723596dfbe575b0200000000   ��:e~8�a]b1fa4d66bb99c1a8723596dfbe575b0200000000   ���g�8�`]b1fa4d66bb99c1a8723596dfbe575b0200000000   �<�58�_]b1fa4d66bb99c1a8723596dfbe575b0200000000   �fΧu8�^]b1fa4d66bb99c1a8723596dfbe575b0200000000   ���w@8�]]b1fa4d66bb99c1a8723596dfbe575b0200000000   ?Ř2�8�\]b1fa4d66bb99c1a8723596dfbe575b0200000000    �E���8�[]b24f2f5612e5805bd47a3644493c6f3400000000��y���#8�Z]b24f2f5612e5805bd47a3644493c6f3400000000   ��SL8�Y]b24f2f5612e5805bd47a3644493c6f3400000000   cY��8�X]b24f2f5612e5805bd47a3644493c6f3400000000
   ���j8�W]b24f2f5612e5805bd47a3644493c6f3400000000	   �)L�8�V]b24f2f5612e5805bd47a3644493c6f3400000000   �P�!8�U]b24f2f5612e5805bd47a3644493c6f3400000000   F8��8�S]b24f2f5612e5805bd47a3644493c6f3400000000   ��U�8�]f40dcd570407982a76575ff1a645616900000000   v�l�C8�]f40dcd570407982a76575ff1a645616900000000H���p7�]872bc3e6cf3d67f833351e2a3fb0aa3600000000    �6|�7�]872bc3e6cf3d67f833351e2a3fb0aa3600000000��u�,�8�]731c9324dc0d34a9d7a713072c13f16c00000000   �t
��8�]731c9324dc0d34a9d7a713072c13f16c00000000    �I�A�8�]731c9324dc0d34a9d7a713072c13f16c00000000   <����8�]731c9324dc0d34a9d7a713072c13f16c00000000   5��8�]731c9324dc0d34a9d7a713072c13f16c00000000   w-s��8�]731c9324dc0d34a9d7a713072c13f16c00000000   ��*�8�]731c9324dc0d34a9d7a713072c13f16c00000000   zB�FD8�]731c9324dc0d34a9d7a713072c13f16c00000000   ��5�8�]731c9324dc0d34a9d7a713072c13f16c00000000   �k���8�]731c9324dc0d34a9d7a713072c13f16c00000000	   X݂�`8�]731c9324dc0d34a9d7a713072c13f16c00000000
   \0.�8�]731c9324dc0d34a9d7a713072c13f16c00000000   ���8�]731c9324dc0d34a9d7a713072c13f16c00000000   �@�n�8�]731c9324dc0d34a9d7a713072c13f16c00000000	[[��!98�N]33cfc87af766f672dac2a8644bad559100000000   \��$8�O]33cfc87af766f672dac2a8644bad559100000000    2�v8�P]33cfc87af766f672dac2a8644bad559100000000    ���Y8�Q]33cfc87af766f672dac2a8644bad559100000000   Խ�Gl8�R]33cfc87af766f672dac2a8644bad559100000000   $4p�8�S]33cfc87af766f672dac2a8644bad559100000000   S뀑8�T]33cfc87af766f672dac2a8644bad559100000000   ���r�8�U]33cfc87af766f672dac2a8644bad559100000000   0q��8�V]33cfc87af766f672dac2a8644bad559100000000�I�'�7�W]32026b70d71de71748f5c86048703e2e00000000    v�:8�X]32026b70d71de71748f5c86048703e2e00000000   0�۵�8�Y]32026b70d71de71748f5c86048703e2e00000000   �_�{<8�Z]32026b70d71de71748f5c86048703e2e00000000   .�e8�[]32026b70d71de71748f5c86048703e2e00000000   �K{ �8�\]32026b70d71de71748f5c86048703e2e00000000   ��8�]]32026b70d71de71748f5c86048703e2e00000000   ��� 8�^]32026b70d71de71748f5c86048703e2e00000000   ŭ�B�8�_]32026b70d71de71748f5c86048703e2e00000000   ��|?7�`]32026b70d71de71748f5c86048703e2e00000000	   �g}�v8�a]32026b70d71de71748f5c86048703e2e00000000
   �ll�c8�b]32026b70d71de71748f5c86048703e2e00000000   .�F^�7�c]32026b70d71de71748f5c86048703e2e00000000   �pt�*8�d]32026b70d71de71748f5c86048703e2e00000000   "q� �8�e]32026b70d71de71748f5c86048703e2e00000000   d��(�8�f]32026b70d71de71748f5c86048703e2e00000000   �qdV8�g]32026b70d71de71748f5c86048703e2e00000000   (U�Fj8�h]32026b70d71de71748f5c86048703e2e00000000   1�#W�8�i]32026b70d71de71748f5c86048703e2e00000000   x��o�8�j]32026b70d71de71748f5c86048703e2e00000000   ^���8�k]32026b70d71de71748f5c86048703e2e00000000   ��W*w8�l]32026b70d71de71748f5c86048703e2e00000000   :9��8�m]32026b70d71de71748f5c86048703e2e00000000   �K<^/8�n]32026b70d71de71748f5c86048703e2e00000000   ���)8�o]32026b70d71de71748f5c86048703e2e00000000   }��T8�p]32026b70d71de71748f5c86048703e2e00000000   o��8�q]32026b70d71de71748f5c86048703e2e00000000   ��A&78�r]32026b70d71de71748f5c86048703e2e00000000   �t!�8�s]32026b70d71de71748f5c86048703e2e00000000   `�Y�8�t]32026b70d71de71748f5c86048703e2e00000000   2�T}�8�u]32026b70d71de71748f5c86048703e2e00000000   -�l�8�v]32026b70d71de71748f5c86048703e2e00000000   �r��=8�w]32026b70d71de71748f5c86048703e2e00000000    ��&�7�x]32026b70d71de71748f5c86048703e2e00000000!8�=,C�{8�&]079b11c4a8e40d22000b1d85b281e4b600000000    U9��8�']079b11c4a8e40d22000b1d85b281e4b600000000   �O�tI8�(]079b11c4a8e40d22000b1d85b281e4b600000000   ���Y�8�)]079b11c4a8e40d22000b1d85b281e4b600000000   �B�n�8�*]079b11c4a8e40d22000b1d85b281e4b600000000   $�2R�8�+]079b11c4a8e40d22000b1d85b281e4b600000000   '�?�x8�,]079b11c4a8e40d22000b1d85b281e4b600000000   �?��8�-]079b11c4a8e40d22000b1d85b281e4b600000000   ��u �8�.]079b11c4a8e40d22000b1d85b281e4b600000000
���B�8�5]01ee438a4d76cc2a88ad20f0f5f29efc00000000    d4��+8�6]01ee438a4d76cc2a88ad20f0f5f29efc00000000   qA��8�7]01ee438a4d76cc2a88ad20f0f5f29efc00000000   ڞo58�8]01ee438a4d76cc2a88ad20f0f5f29efc00000000   ��F0�8�9]01ee438a4d76cc2a88ad20f0f5f29efc00000000   ~�ɉI8�:]01ee438a4d76cc2a88ad20f0f5f29efc00000000   z���8�;]01ee438a4d76cc2a88ad20f0f5f29efc00000000   ��Y8�<]01ee438a4d76cc2a88ad20f0f5f29efc00000000   >ċ��8�=]01ee438a4d76cc2a88ad20f0f5f29efc00000000���{8�>]96c3e95770cfb112dba7cfeb5636f8a500000000    ����8�?]96c3e95770cfb112dba7cfeb5636f8a500000000   y!E� 8�@]96c3e95770cfb112dba7cfeb5636f8a500000000   (�!8�A]96c3e95770cfb112dba7cfeb5636f8a500000000   ����8�B]96c3e95770cfb112dba7cfeb5636f8a500000000   Z�W�8�C]96c3e95770cfb112dba7cfeb5636f8a500000000   Ʀ4B8�D]96c3e95770cfb112dba7cfeb5636f8a500000000   �׼�08�E]96c3e95770cfb112dba7cfeb5636f8a500000000   Ȕ�g�8�F]96c3e95770cfb112dba7cfeb5636f8a500000000	   ��"�8�G]96c3e95770cfb112dba7cfeb5636f8a500000000   h���,8�H]96c3e95770cfb112dba7cfeb5636f8a500000000   �V��8�I]96c3e95770cfb112dba7cfeb5636f8a500000000
   �!�b�8�J]96c3e95770cfb112dba7cfeb5636f8a500000000   �/�t�8�K]96c3e95770cfb112dba7cfeb5636f8a500000000t��ۼ��8�L]fdcd6ebb6de1659a00ed65e3027777c100000000    �m��I8�M]fdcd6ebb6de1659a00ed65e3027777c100000000   E��.}8�N]fdcd6ebb6de1659a00ed65e3027777c100000000   %!�2R8�O]fdcd6ebb6de1659a00ed65e3027777c100000000   �\wV8�P]fdcd6ebb6de1659a00ed65e3027777c100000000   �4r7�Q]fdcd6ebb6de1659a00ed65e3027777c100000000   ���:o8�R]fdcd6ebb6de1659a00ed65e3027777c100000000   ����J7�S]fdcd6ebb6de1659a00ed65e3027777c100000000   d��}8�T]fdcd6ebb6de1659a00ed65e3027777c100000000���0'�8�c]fca4ffad422a77ff1d9304da6062600a00000000    ���=8�d]fca4ffad422a77ff1d9304da6062600a00000000   �X� �8�e]fca4ffad422a77ff1d9304da6062600a00000000   >(��8�f]fca4ffad422a77ff1d9304da6062600a00000000   ����H8�g]fca4ffad422a77ff1d9304da6062600a00000000   �8�h]fca4ffad422a77ff1d9304da6062600a00000000   9�We8�i]fca4ffad422a77ff1d9304da6062600a00000000   �9��8�j]fca4ffad422a77ff1d9304da6062600a00000000   k�9��8�k]fca4ffad422a77ff1d9304da6062600a00000000   ����8�l]fca4ffad422a77ff1d9304da6062600a00000000	   �Q�X8�m]fca4ffad422a77ff1d9304da6062600a00000000
=�y�Sl8�n]fc97cbf676147f173a0e790038dc8cf000000000    n��=�8�o]fc97cbf676147f173a0e790038dc8cf000000000   U���8�p]fc97cbf676147f173a0e790038dc8cf000000000   �22�8�q]fc97cbf676147f173a0e790038dc8cf000000000   ��y�g8�r]fc97cbf676147f173a0e790038dc8cf000000000   ;��8�s]fc97cbf676147f173a0e790038dc8cf000000000   ����8�t]fc97cbf676147f173a0e790038dc8cf000000000   ����8�u]fc97cbf676147f173a0e790038dc8cf000000000   N�Z8�v]fc97cbf676147f173a0e790038dc8cf000000000ׯ���8�]fb1558e8e0d5c4f1ef04ccd621ec9ada00000000    �A�8� ]fb1558e8e0d5c4f1ef04ccd621ec9ada00000000   �����8�]fb1558e8e0d5c4f1ef04ccd621ec9ada00000000   ��1w�8�]fb1558e8e0d5c4f1ef04ccd621ec9ada00000000   >�{-�8�]fb1558e8e0d5c4f1ef04ccd621ec9ada00000000   $��H8�]fb1558e8e0d5c4f1ef04ccd621ec9ada00000000   �V�7�]fb1558e8e0d5c4f1ef04ccd621ec9ada00000000   e"Ƹ68�]fb1558e8e0d5c4f1ef04ccd621ec9ada00000000   ����G8�]fb1558e8e0d5c4f1ef04ccd621ec9ada00000000   C��o�8�]fb1558e8e0d5c4f1ef04ccd621ec9ada00000000	�X���8�N]52587487fae773dfc083d5c737b553a300000000    <�#�8�O]52587487fae773dfc083d5c737b553a300000000   �R�8�P]52587487fae773dfc083d5c737b553a300000000   ���}�8�Q]52587487fae773dfc083d5c737b553a300000000   I�7��8�R]52587487fae773dfc083d5c737b553a300000000   q��58�S]52587487fae773dfc083d5c737b553a300000000   �p�'�8�T]52587487fae773dfc083d5c737b553a300000000   ����8�U]52587487fae773dfc083d5c737b553a300000000   ,<�38�V]52587487fae773dfc083d5c737b553a300000000Ki�<f "7�W]cacdc1d4d9aef7c4b5dea5fef63c266d00000000    ِ���7�X]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   � �q�7�Y]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   ���w�7�Z]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   �S��7�[]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   �X��7�\]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   �Vc��7�]]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   Rq�4�7�^]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   @8$p�7�_]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   Un*�7�`]cacdc1d4d9aef7c4b5dea5fef63c266d00000000	   lƯH�7�a]cacdc1d4d9aef7c4b5dea5fef63c266d00000000
   ywگ�7�b]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   �z���7�c]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   �5�7�d]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   ^��]�7�e]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   ���-�7�f]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   ٵ��7�g]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   ̛���7�h]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   \�D�7�i]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   ӥ���7�j]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   6�AF�7�k]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   [���7�l]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   �٧�7�m]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   �l�"�7�n]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   T���7�o]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   �}�^�7�p]cacdc1d4d9aef7c4b5dea5fef63c266d00000000   3d:��7�q]cacdc1d4d9aef7c4b5dea5fef63c266d00000000� +ۍ��8�r]3aa6563d26bbe67afc865f88276d7f0800000000    ���/�8�s]3aa6563d26bbe67afc865f88276d7f0800000000   ߓ��8�t]3aa6563d26bbe67afc865f88276d7f0800000000   ����8�u]3aa6563d26bbe67afc865f88276d7f0800000000   "W��8�v]3aa6563d26bbe67afc865f88276d7f0800000000   ,���8�w]3aa6563d26bbe67afc865f88276d7f0800000000   z�Bu�8�x]3aa6563d26bbe67afc865f88276d7f0800000000   n{�V�8�y]3aa6563d26bbe67afc865f88276d7f0800000000   �f�n�8�z]3aa6563d26bbe67afc865f88276d7f0800000000��X�F� �8�{]374ad4b329b067fd8d6b66a1aba8b77c00000000   �4P��8�|]374ad4b329b067fd8d6b66a1aba8b77c00000000    ;���Y8�}]374ad4b329b067fd8d6b66a1aba8b77c00000000   �A/#O8�~]374ad4b329b067fd8d6b66a1aba8b77c00000000   �%��18�]374ad4b329b067fd8d6b66a1aba8b77c00000000   0�A�\8� ]374ad4b329b067fd8d6b66a1aba8b77c00000000   y
���8�]374ad4b329b067fd8d6b66a1aba8b77c00000000   {����8�]374ad4b329b067fd8d6b66a1aba8b77c00000000   �� �8�]374ad4b329b067fd8d6b66a1aba8b77c00000000   �����8�]374ad4b329b067fd8d6b66a1aba8b77c00000000
5 {_/R�8�]374ad4b329b067fd8d6b66a1aba8b77c00000000	   �X�B8�]2f2ae1310006f977237ca740644a970300000000    W(�s8�]2f2ae1310006f977237ca740644a970300000000   ���q8�]2f2ae1310006f977237ca740644a970300000000   cKig�8�	]2f2ae1310006f977237ca740644a970300000000|n^7T~8�]2e9aa11855510169ba3a3dbed2f4393100000000    ����`8�]2e9aa11855510169ba3a3dbed2f4393100000000   ���NF8�]2e9aa11855510169ba3a3dbed2f4393100000000   OW�{8�]2e9aa11855510169ba3a3dbed2f4393100000000   ���:8�]2e9aa11855510169ba3a3dbed2f4393100000000   �w�t�8�]2e9aa11855510169ba3a3dbed2f4393100000000�FZ,:�8�]2e9aa11855510169ba3a3dbed2f4393100000000   >٥m%8�]2d9f5bc182f8945e8e03d73bd192317200000000    �ֺa�8�]2d9f5bc182f8945e8e03d73bd192317200000000   ���g8�]2d9f5bc182f8945e8e03d73bd192317200000000   L\��8�]2d9f5bc182f8945e8e03d73bd192317200000000   鄹p/8�]2d9f5bc182f8945e8e03d73bd192317200000000   E��a8�]2d9f5bc182f8945e8e03d73bd192317200000000   �7/\8�]2d9f5bc182f8945e8e03d73bd192317200000000   ��-8� ]2d9f5bc182f8945e8e03d73bd192317200000000	   �SD�.8�!]2d9f5bc182f8945e8e03d73bd192317200000000   aI�87�"]2d9f5bc182f8945e8e03d73bd192317200000000   ��׀_8�#]2d9f5bc182f8945e8e03d73bd192317200000000   ,��'�7�$]2d9f5bc182f8945e8e03d73bd192317200000000
   WlޯV8�%]2d9f5bc182f8945e8e03d73bd192317200000000   ?Z{��8�&]2d9f5bc182f8945e8e03d73bd192317200000000   �œzL8�']2d9f5bc182f8945e8e03d73bd192317200000000   ;�9$�8�(]2d9f5bc182f8945e8e03d73bd192317200000000   >f�=|8�)]2d9f5bc182f8945e8e03d73bd192317200000000   B����8�*]2d9f5bc182f8945e8e03d73bd192317200000000   ���8�+]2d9f5bc182f8945e8e03d73bd192317200000000   ��� �8�,]2d9f5bc182f8945e8e03d73bd192317200000000   s� )68�-]2d9f5bc182f8945e8e03d73bd192317200000000   ��̳�8�.]2d9f5bc182f8945e8e03d73bd192317200000000   2��C8�/]2d9f5bc182f8945e8e03d73bd192317200000000   m���8�0]2d9f5bc182f8945e8e03d73bd192317200000000   -�~d08�1]2d9f5bc182f8945e8e03d73bd192317200000000   ��^� �8�2]2d9f5bc182f8945e8e03d73bd192317200000000   �٬x8�3]2d9f5bc182f8945e8e03d73bd192317200000000   ����\8�4]2d9f5bc182f8945e8e03d73bd192317200000000   ���W�7�5]2d9f5bc182f8945e8e03d73bd192317200000000�b�:
8�D]2d3856be29f5ada6fa14b98ca1b504cf00000000   ����08�E]2d3856be29f5ada6fa14b98ca1b504cf00000000    Wh�	 �8�F]2d3856be29f5ada6fa14b98ca1b504cf00000000   Y8I�8�G]2d3856be29f5ada6fa14b98ca1b504cf00000000   �(}	U8�H]2d3856be29f5ada6fa14b98ca1b504cf00000000   iɐQ8�I]2d3856be29f5ada6fa14b98ca1b504cf00000000 �l�H�]8�J]2d286816b3c72b5aba3535f13d72dac100000000    ����8�K]2d286816b3c72b5aba3535f13d72dac100000000   y�3�8�L]2d286816b3c72b5aba3535f13d72dac100000000   ���7�M]2d286816b3c72b5aba3535f13d72dac100000000   lZ�8�N]2d286816b3c72b5aba3535f13d72dac100000000   ��j*�8�O]2d286816b3c72b5aba3535f13d72dac100000000   1�u�]8�P]2d286816b3c72b5aba3535f13d72dac100000000   N�s�R7�Q]2d286816b3c72b5aba3535f13d72dac100000000   {��r8�R]2d286816b3c72b5aba3535f13d72dac100000000
   }�sh8�S]2d286816b3c72b5aba3535f13d72dac100000000   `"��7�T]d73af698f5a209164d7d36c4241c862400000000    �����7�U]d73af698f5a209164d7d36c4241c862400000000   �#Kk�7�V]d73af698f5a209164d7d36c4241c862400000000   4�5��7�W]d73af698f5a209164d7d36c4241c862400000000   ����7�X]d73af698f5a209164d7d36c4241c862400000000   �t��7�Y]d73af698f5a209164d7d36c4241c862400000000   �����7�Z]d73af698f5a209164d7d36c4241c862400000000   Y$�q�7�[]d73af698f5a209164d7d36c4241c862400000000   i�h�7�\]d73af698f5a209164d7d36c4241c862400000000	   ЛU@�7�]]d73af698f5a209164d7d36c4241c862400000000   �Rl�7�^]d73af698f5a209164d7d36c4241c862400000000
   J��7�_]d73af698f5a209164d7d36c4241c862400000000}h��[��8�`]2d286816b3c72b5aba3535f13d72dac100000000	   ��lc8�a]2d286816b3c72b5aba3535f13d72dac100000000   q���8�b]2d286816b3c72b5aba3535f13d72dac100000000R�Һ�j8�c]2d1f962a92fc8df0b8646348439ee57f00000000    A*��8�d]2d1f962a92fc8df0b8646348439ee57f00000000   }(�t8�e]2d1f962a92fc8df0b8646348439ee57f00000000   ��8�f]2d1f962a92fc8df0b8646348439ee57f00000000   c��(�8�g]2d1f962a92fc8df0b8646348439ee57f00000000   �Ҥ3M8�h]2d1f962a92fc8df0b8646348439ee57f00000000   a�ִ�8�i]2d1f962a92fc8df0b8646348439ee57f00000000   h""� �8�j]2d1f962a92fc8df0b8646348439ee57f00000000   8�?��8�k]2d1f962a92fc8df0b8646348439ee57f00000000   )��C8�l]2d1f962a92fc8df0b8646348439ee57f00000000	   ����8�m]2d1f962a92fc8df0b8646348439ee57f00000000
    ����7�n]2d1f962a92fc8df0b8646348439ee57f00000000�e�M��38�o]0d97805bc0f2c9c21da68110bd5d57ac00000000    	F'��8�p]0d97805bc0f2c9c21da68110bd5d57ac00000000   �T>+8�q]0d97805bc0f2c9c21da68110bd5d57ac00000000   �$2��8�r]0d97805bc0f2c9c21da68110bd5d57ac00000000   {�ji�8�s]0d97805bc0f2c9c21da68110bd5d57ac00000000   ���	�8�t]0d97805bc0f2c9c21da68110bd5d57ac00000000   �j�8�u]0d97805bc0f2c9c21da68110bd5d57ac00000000   Q����8�v]0d97805bc0f2c9c21da68110bd5d57ac00000000   � $L �8�w]0d97805bc0f2c9c21da68110bd5d57ac00000000   D9�n7�x]0d97805bc0f2c9c21da68110bd5d57ac00000000	   w�D8�y]0d97805bc0f2c9c21da68110bd5d57ac00000000
   �`AS8�z]0d97805bc0f2c9c21da68110bd5d57ac00000000   ���LE8�{]0d97805bc0f2c9c21da68110bd5d57ac00000000   �4+�f7�|]0d97805bc0f2c9c21da68110bd5d57ac00000000   �!YAc8�}]0d97805bc0f2c9c21da68110bd5d57ac00000000lETcX�8�~]0d5d4cd3f965a730380ed5e2fd85108000000000    �[H�7�]0d5d4cd3f965a730380ed5e2fd85108000000000   �p5~>8� ]0d5d4cd3f965a730380ed5e2fd85108000000000   ��M�8�]0d5d4cd3f965a730380ed5e2fd85108000000000   �^l8�]0d5d4cd3f965a730380ed5e2fd85108000000000   ���q8�]0d5d4cd3f965a730380ed5e2fd85108000000000   �G��8�]0d5d4cd3f965a730380ed5e2fd85108000000000   ��4^8�]0d5d4cd3f965a730380ed5e2fd85108000000000   5x�8�]0d5d4cd3f965a730380ed5e2fd85108000000000   �-n��8�]0d5d4cd3f965a730380ed5e2fd85108000000000	   ��Q� �8�]0d5d4cd3f965a730380ed5e2fd85108000000000
   ��l^�8�	]0d5d4cd3f965a730380ed5e2fd85108000000000   �|��8�
]0d5d4cd3f965a730380ed5e2fd85108000000000   Lt��W8�]0d5d4cd3f965a730380ed5e2fd85108000000000   b�k,b8�]0d5d4cd3f965a730380ed5e2fd85108000000000L ^�668�)]0aed894390076ecd817575171f950de600000000    oQ��8�*]0aed894390076ecd817575171f950de600000000   {Y+�8�+]0aed894390076ecd817575171f950de600000000   .��_�8�,]0aed894390076ecd817575171f950de600000000   �S��"8�-]0aed894390076ecd817575171f950de600000000   �a��8�.]0aed894390076ecd817575171f950de600000000   <�2�8�/]0aed894390076ecd817575171f950de600000000   2e��8�0]0aed894390076ecd817575171f950de600000000   �0
( �8�1]0aed894390076ecd817575171f950de600000000   �>�?7�2]0aed894390076ecd817575171f950de600000000	   �`�zH8�3]0aed894390076ecd817575171f950de600000000
   �՜��8�4]0aed894390076ecd817575171f950de600000000   �ӻ. �8�5]0aed894390076ecd817575171f950de600000000   v�tN �7�6]0aed894390076ecd817575171f950de600000000   ����8�7]0aed894390076ecd817575171f950de600000000   h)���8�8]0aed894390076ecd817575171f950de600000000��^&��8�9]0aa462192500bcb47c788fdf39a413cd00000000    e���8�:]0aa462192500bcb47c788fdf39a413cd00000000   ź �8�;]0aa462192500bcb47c788fdf39a413cd00000000   Q�{L8�<]0aa462192500bcb47c788fdf39a413cd00000000   9�p�8�=]0aa462192500bcb47c788fdf39a413cd00000000   �S�	8�>]0aa462192500bcb47c788fdf39a413cd00000000   �T��8�?]0aa462192500bcb47c788fdf39a413cd00000000�o4E�Y�8�H]0a4e7f0855a84f68209705e5151e7b8a00000000    g],AH8�I]0a4e7f0855a84f68209705e5151e7b8a00000000   �����8�J]0a4e7f0855a84f68209705e5151e7b8a00000000   %P+V8�K]0a4e7f0855a84f68209705e5151e7b8a00000000   �
���8�L]0a4e7f0855a84f68209705e5151e7b8a00000000   �+�r8�M]0a4e7f0855a84f68209705e5151e7b8a00000000   +\�"28�N]0a4e7f0855a84f68209705e5151e7b8a00000000   p$��8�O]0a4e7f0855a84f68209705e5151e7b8a00000000   e���8�P]0a4e7f0855a84f68209705e5151e7b8a00000000   �O8�Q]0a4e7f0855a84f68209705e5151e7b8a00000000	   x~�0�8�R]0a4e7f0855a84f68209705e5151e7b8a00000000
   �̖�N8�S]0a4e7f0855a84f68209705e5151e7b8a00000000   2@d�*8�T]0a4e7f0855a84f68209705e5151e7b8a00000000   �@��8�U]0a4e7f0855a84f68209705e5151e7b8a00000000   �6��8�V]0a4e7f0855a84f68209705e5151e7b8a00000000   ��|�"8�W]0a4e7f0855a84f68209705e5151e7b8a00000000�<9��_8�X]0a33d46556273a166e35e825593489bc00000000    }^���8�Y]0a33d46556273a166e35e825593489bc00000000   	[�~68�Z]0a33d46556273a166e35e825593489bc00000000   �iT\48�[]0a33d46556273a166e35e825593489bc00000000   n���8�\]0a33d46556273a166e35e825593489bc00000000   ozj*8�]]0a33d46556273a166e35e825593489bc00000000   �@�B�8�^]0a33d46556273a166e35e825593489bc00000000   �*�<R8�_]0a33d46556273a166e35e825593489bc00000000   a��{8�`]0a33d46556273a166e35e825593489bc00000000   � ���8�a]0a33d46556273a166e35e825593489bc00000000	   C��f�8�b]0a33d46556273a166e35e825593489bc00000000
   m���o8�c]0a33d46556273a166e35e825593489bc00000000   o^>O!8�d]0a33d46556273a166e35e825593489bc00000000   G� �8�e]0a33d46556273a166e35e825593489bc00000000   Ⱦ�8�f]0a33d46556273a166e35e825593489bc00000000   0H� �8�g]0a33d46556273a166e35e825593489bc00000000�܃Ǯ]�7�h]973823f32481e213da49eedc8f8efea700000000    j{K�7�i]7225167323061e72579b3c5ddd6b289d00000000    ��4��7�j]7225167323061e72579b3c5ddd6b289d00000000��*��7�k]973823f32481e213da49eedc8f8efea700000000   uS��7�l]973823f32481e213da49eedc8f8efea700000000IN�����8�m]182cc0a47d0b18f388cdced47fcb519600000000    ��$��8�n]182cc0a47d0b18f388cdced47fcb519600000000   �q=8�o]182cc0a47d0b18f388cdced47fcb519600000000   ��e� �8�p]182cc0a47d0b18f388cdced47fcb519600000000   c�/eP8�q]182cc0a47d0b18f388cdced47fcb519600000000   t�R58�r]182cc0a47d0b18f388cdced47fcb519600000000   �xb�8�s]182cc0a47d0b18f388cdced47fcb519600000000   �^&��8�t]182cc0a47d0b18f388cdced47fcb519600000000   [��3.8�u]182cc0a47d0b18f388cdced47fcb519600000000   �i�|8�v]182cc0a47d0b18f388cdced47fcb519600000000	   P�&�8�w]182cc0a47d0b18f388cdced47fcb519600000000
ŘQ�3 �8�x]4b65edee40214477459fdde053dcfef600000000    �0{(8�y]4b65edee40214477459fdde053dcfef600000000   �g�8�z]4b65edee40214477459fdde053dcfef600000000   �Qi��8�{]4b65edee40214477459fdde053dcfef600000000   �%g�8�|]4b65edee40214477459fdde053dcfef600000000   f]V�8�}]4b65edee40214477459fdde053dcfef600000000   U�6N8�~]4b65edee40214477459fdde053dcfef600000000   %���8�]4b65edee40214477459fdde053dcfef600000000   i� � �8� ]4b65edee40214477459fdde053dcfef600000000(�/%�� �8�]5f378aa5eb6eea8f9e35149d749ecd2c00000000    av�HT8�]5f378aa5eb6eea8f9e35149d749ecd2c00000000   hr�hY8�]5f378aa5eb6eea8f9e35149d749ecd2c00000000   �ٺY�8�]5f378aa5eb6eea8f9e35149d749ecd2c00000000    1jM�8�]5f378aa5eb6eea8f9e35149d749ecd2c00000000   .��8�]5f378aa5eb6eea8f9e35149d749ecd2c00000000   U��8�]5f378aa5eb6eea8f9e35149d749ecd2c00000000   >� �8�]5f378aa5eb6eea8f9e35149d749ecd2c00000000   �+���8�	]5f378aa5eb6eea8f9e35149d749ecd2c00000000   v���8�
]5f378aa5eb6eea8f9e35149d749ecd2c00000000	   �ӳ(�8�]5f378aa5eb6eea8f9e35149d749ecd2c00000000
   �g���8�]5f378aa5eb6eea8f9e35149d749ecd2c00000000   ,MI��8�]5f378aa5eb6eea8f9e35149d749ecd2c00000000H&�1^�7�]7b4192573146a776655969957e2cc67500000000    �@[u8�]7b4192573146a776655969957e2cc67500000000   tU�k�8�]7b4192573146a776655969957e2cc67500000000   Pz���8�]7b4192573146a776655969957e2cc67500000000   ��CF8�]7b4192573146a776655969957e2cc67500000000   J�w��8�]7b4192573146a776655969957e2cc67500000000   =��8�]7b4192573146a776655969957e2cc67500000000   l0�8�]7b4192573146a776655969957e2cc67500000000   ��|!�8�]7b4192573146a776655969957e2cc67500000000   �z�p8�]7b4192573146a776655969957e2cc67500000000	�7����8�]b0da145b6c7c7169ee8045cedbeceb4800000000    /a�x�8�]b0da145b6c7c7169ee8045cedbeceb4800000000   �	*��8�]b0da145b6c7c7169ee8045cedbeceb4800000000   �N}Z8�]b0da145b6c7c7169ee8045cedbeceb4800000000   ����i7�]b0da145b6c7c7169ee8045cedbeceb4800000000   H�PWt8�]b0da145b6c7c7169ee8045cedbeceb4800000000   �ǵ��8�]b0da145b6c7c7169ee8045cedbeceb4800000000   O�v.8�]b0da145b6c7c7169ee8045cedbeceb4800000000��\�48� ]df57b989883c13740e744ee66a789d2200000000    �;�hV8�!]df57b989883c13740e744ee66a789d2200000000   ֻQ �8�"]df57b989883c13740e744ee66a789d2200000000   ��FT�7�#]df57b989883c13740e744ee66a789d2200000000   �Փ8�$]df57b989883c13740e744ee66a789d2200000000   ˙�;�8�%]df57b989883c13740e744ee66a789d2200000000   �5J�8�&]df57b989883c13740e744ee66a789d2200000000   =��8�']df57b989883c13740e744ee66a789d2200000000   �a��8�(]df57b989883c13740e744ee66a789d2200000000   R�vE8�)]df57b989883c13740e744ee66a789d2200000000	Gʐ�5T8�*]c73b718688fc0fab90ba5d3530546eb800000000    �?���7�+]c73b718688fc0fab90ba5d3530546eb800000000   �b�8�,]c73b718688fc0fab90ba5d3530546eb800000000   ww}��8�-]c73b718688fc0fab90ba5d3530546eb800000000   �\�8�.]c73b718688fc0fab90ba5d3530546eb800000000   B:r7�/]c73b718688fc0fab90ba5d3530546eb800000000   ��P8�0]c73b718688fc0fab90ba5d3530546eb800000000   ͳbh �8�1]c73b718688fc0fab90ba5d3530546eb800000000   =p� �8�2]c73b718688fc0fab90ba5d3530546eb800000000Z&3���8�3]c5d788dacd289dfb7270a6e0ff67abed00000000    ^����8�4]c5d788dacd289dfb7270a6e0ff67abed00000000   ���8�5]c5d788dacd289dfb7270a6e0ff67abed00000000   O���8�6]c5d788dacd289dfb7270a6e0ff67abed00000000   ë�B8�7]c5d788dacd289dfb7270a6e0ff67abed00000000   �@��8�8]c5d788dacd289dfb7270a6e0ff67abed00000000   ���58�9]c5d788dacd289dfb7270a6e0ff67abed00000000   �ّyq8�:]c5d788dacd289dfb7270a6e0ff67abed00000000)k��678�T]b24f2f5612e5805bd47a3644493c6f3400000000   �(���8�=]b7e5db408310ea00a46916f2bf55a5c300000000    ȟHO�8�>]b7e5db408310ea00a46916f2bf55a5c300000000   �+i�Y7�?]b7e5db408310ea00a46916f2bf55a5c300000000   M�~8x8�@]b7e5db408310ea00a46916f2bf55a5c300000000   .��+�8�A]b7e5db408310ea00a46916f2bf55a5c300000000   @����8�B]b7e5db408310ea00a46916f2bf55a5c300000000   qP]�8�C]b7e5db408310ea00a46916f2bf55a5c300000000   �[�:8�D]b7e5db408310ea00a46916f2bf55a5c300000000   ��}l�8�E]b7e5db408310ea00a46916f2bf55a5c300000000   I�V58�F]b7e5db408310ea00a46916f2bf55a5c300000000	�n��	8�G]b60494104aecdb448cf782ca98448e0d00000000    Ȧn�8�H]b60494104aecdb448cf782ca98448e0d00000000   c���/8�I]b60494104aecdb448cf782ca98448e0d00000000   �H�m8�J]b6049410OOOCLCIBCOOCKKKKKKKKK[{{�$~�C�0}&zxyMKOBOJKOOOCLCIBCOOCKKKKKKKKKx[{{�u2y�C�7}&zxyMKOBOJKOOOCLCIBCOOCKKKKKKKKK~[{{ւM}�L�6}&zxzMKOBOJKOOOCLCIBCOOCKKKKKKKKK}e�[�k�vC�5}&zxyIOINMJINCKNOLHMOOOBHMHOKKKKKKKK{[{{�C��C�4}&zxyIOINMJINCKNOLHMOOOBHMHOKKKKKKKKz[{{�	��|�L�+}&zxzIOINMJINCKNOLHMOOOBHMHOKKKKKKKKy[{{u@�ltC�*}&zxyIOINMJINCKNOLHMOOOBHMHOKKKKKKKK[{{`�w�zC�)}&zxyIOINMJINCKNOLHMOOOBHMHOKKKKKKKKx[{{JO�!��W   ����'�}j�є*�M���}Q՜_�m��c�T掷�f��к��$q��0�j�.Ō��Ɍr�g�p�ߥ*f|�~��paAy�C�<,�%)j�K�2����=�B������_�JgɅ0��jޙD:!���	T�삾/?�]=�S���|K��^������O�k�� N������=0�-aQ�����B���.�.349��Y�#h#G(����įjs�&�j�P�h�|��.������l��!$�o�&�l��-`�5�H�+l� ��Hw{�o nX_���f�8����NbYc.wg��<�]���M���xB?�_B�� 4�;����u����܂��*6r-dM�j6��}M�r�g�u�I"�vP�t���f��Y���h�u�����X��'��ɍ/>��?�	&y�l�z��|#�H�p?��Q�~Yb��g
	6�� (�hK��Wk��m�`1=9����|ş
1�7�u��e��+���O��;w_��ػ��zb��>Km*�Fd�eCE�4�e(��]`�)�C�GҺ:�-��Ev9;�|�|���d�ͥ�:t�݊|���8�y����&��Ug����ۍ�������!�%r�b��y����ω��Ok�ҝ�&y�~k��������܄�߉GǜC��J���ݔ
�>����ÞS��Q��Y�n�c-����4;ce�R�cRg�*^dWE��
���[�ee��D�����{�y��5��0��`QD�.���bQگ��e��{=�s�B ��v���S��?�NMw�@�s��p��袶��㷻1�ni���e���>�=$�3�c�"]��*���-=�j�H�����ȃ�A�D��MO�G[�~MNй˭��f��C,�ݎ|[�7%�O-���h�{V+�����"���.*S��`<���Mv�$��Zoj�����ܡE���ոpW�"�^�L��03
8�]���t E�,�-K'���٦:��wW�U�� EF��_��J��Er�=��V�׃ah="ݵ���Ɉ��3��e�?���5�����mr��ȷ��omK�@dk��0���5�6�-I�D��O'�b'(��B]�����SnC)�ɂ�����V�:�3>��*�D9֬ܓ4Ze6�1%��^�{��ߒ�"���]r�A�5}#p��;{�n�N�r�X�@�h���J�(꾼���A�Ƃ����jhP۴�9,�q��<	í�K��/�����H��2��?��ӊ�V��
�^���`4����U	�mz��`L�oe�F��I���.!n#a'N�f&��-@4�*��r��_�b-zH,�Sɺ�6_L�M�˟�^�YZ$�v�3bu��,R�_�uz�iҪ
�oRR���yX��P��+�2��#4��+��=$�r�2.��4t�|w*Up�#�ؿ;{Tq����׫��y�#�p���Pt�
Q���o�"97�^�n&�A$j���6Ua�Td�Z@�C{�{�8�MR��2ОV���eՋ�f�T����n5��T4Y���^�V�R?�M�e,����NF�9<$��2�:�H��5m,M$*��Ľ]�}Ռ�������_7��ӑN	i���?����sh[l�v���3�&�#�[��#,�_bw��n��۝d¬�i� ?/�b�n���p�w+�E�S긟}<�Z����D\�'����ҋ8�3���'�{�a̸\?���#;�iB�i�������W^���} s�]@�=��L��q}tߜ[�q�$���En��k�yo��Hx]���@PU$�_�p��^�$���~�J���m�"E�+�)\l�_	`�L�'w��10��/+tr���y�|�rI�q�S"w�؎�!����V3n�4�֡bǂD��D�~�k�����zƍ��iN��-fTtj;�1�[$"�5�U%�>>�,�O�L��A�*�}���V�XW5u����K.b��z�q8�r�G�K�x�>LLJf�F�$�T��/�����i�5��z��kUj�d3�K�w��ɳZ,�&*g��H�(��c�2	�N+�q�����O�$���������u�V����Ru�h�׌��IV����x���y�qȴY&g@��
dr��Vr ��\��cF���U��Q����;��'	��U�5�Y�4}��U8z�~fhk0���?t%\��	�w�������"��	(,�/3t<AMA��u �U�;��b�g)MԜ>�k0�)���埖GX Vܵ�|�oq Yx���o��\�-͋�~�F����9�<�	\F���k\�V ���́�W�5Di��y�[\�	�3Ќf�!������j�ڹ��Ok�^���{f����V����g�p��w��^���حt�C �o�ղo[T�j��%+�FxF*+2��P�L�b�-/�\�eCʪi2�;�H��af����h�58(�
�Q�V&�p�X�eA�=��ܐS���>_�mw�����L���̈́����E��,O��,�&�/P 9��mS�G����R�k)��}h�2Íe{H�ڳ<	��w@K4��`W�^���vd�����gkJ������D�3ӣ]!��"Y�bL� �ꦾ���c�Ĕ�ozm<s���u��b"0ߚ�y�}��L�{{��� �����eC߰�pO�2	���4��d�
+(��]:�����r1\S���BH�1K[@�2�}NT*kB�&�ic�H��&��`�Z9.�U�˘�	VVa�7
��jč��B��Y�������y�0Q̏��!	�R�����	L^�b*��%��bDT|�@�-9���5v�G���i+�Ζʍ�o@k��d��wQO��
 �(z���}�?L�@C� <@�c8��(��E�կ�֎�<��J9�1�ӓ��f&�NV_��2�Ts��B�͡�	.e��=�����H>�?^�_��~n{���'��}A�\���`�kEګ����(��>q,	��k�BA{W2a��x��{��a�����@O�ѰfZ(�{;ڸ-�P	��^�y���h�����~�Pa�۝^$����L����$U]��-���!^��WM  K-��ȴ]&m�1[C�jȕmg1������:���2����]�M7�ڣ�]����iK�〺���Q�­��ByJާR����Ӌ�໴�����
�O��L}�5
��
.�D��H?��Z���TX�ث��7A�\J�?�(�8Ҟ�a����2��o�����@1s�k��2G�l`�;R���XGR�m�:/]up>4k���8�Ӳi7�R*�1�Ŧ0,�ۛঋ�;��Fqf8w��'y�ȔC9-�M��}�8����>9䣲
�E$k���Ƌ���s�y�C=�i���^��F��4�	���I��AV�b�t�5����d���Z�4�Uǲ�2��0[�^>t���%$L�a��V0	>�Q"��b��/4�0��,!�b�>%��I�HQ��o�#[]N�}��K�k���������j�(�7=�<>���F��ĝ$d,�y|doh/�N�~�q}�>%	]O?�f�������Ml-�������|3�	�w=#����
�
�i�{�Lԣ�a�`M~��Ԙ4��a�wöד.5��?0��Y���%���У٭7��sg���A�$���N˝>9�݃��2�z)ENs�6We9s��O�	 ���r1	Mer��t�cSR�k��B�:ï��r5�����%��$�Ie�B����GV��S[��1/wQ8k����@zi�G� �s[��;�Ѭ��O�ҐB���R�R'JgIn����ԕ6��z����c,G�)��5 ��xd���x@��Br�V�O�+
^c�r/���V��`����#*�P�~�GI�-��8b{��>�I�����/>�Ks�}�:�C�f�2BaF
B[�h��X�uy��Aj��#��w��҄���nB(�l_{#'�\Ey +�����Q-_�k�?�W�}���}��}B�O3��	�W��3�jw��p��>?��%|l�oY��@S�AėL�w���V4�L�aZ[OP����>L��}=Fo���T������	A�Q��¤5Qp�z8��2�¾���/x���Z���H|+�r��_2��u�ED$W�&Ηk/6�@����f���z\<ZƝ�(董���l�Փ�V?�:W�O69���ș�~�<�� ��Q�cU2!����N�eU/��g�=gl�Q+D˟����Zo�M�}t�e���7��Q([в�^����S�trϛc{o������a�lP�FjQI�g�H0��n�ٴ�_\[�L�Oe(��� ꈩ��1�-������='7���Z�D������A<��l�k8����f��G��s=Υ��Q��n��p���t<a������ˁ�F6 �-�b���}8f�#Q�j�����V�C�k�V"�<�D�*�*��A����P��C.d���Z\�C�-"T�ż|�������R���-o,P��}1�&vݠˬ8E��P�c����G<������� �s�M頲}���>n���Bg��cU"L�:��.ו+��ҕ[�کO�1�X�b��m���pJ��0���K�d�]����Mw��z	��n��1>.+f�;�,���Y�'��/r��̣�pT'���P�hA��#F�f�J�v�!+�DVآ-c�ۖ�q����Ia~�l��O8|x�
em�u9E��On�xwr,N)�q�^���ʘ�!�+��:L���\�ג���O�W�#�E�m)A��ԑ�V���
��,�*\/4ZF�ّ;IY�v��z���vP,r�3¶��n����%�ZV�k��A�g�;�e�aGh��v�W�\{*F���A./����k��h���p�E�ߪ&ɺ�@��:� K]�)�ɥا��A������pK�����ͷ�^Ζ.��K�^՗�*@Z�?���XZt��5�� �Z2~�Ȣ��R�����|�ز55�.��}D���6
��Qg8�u���1C�9턱9�.L�f/�Q�]��a�.Ҩk�T!\=��ї��h��,#F�|�C��K�>t`3�6�=���΋���Ql�����9������BA��ت�;�w��@���ہͯvX��]�z�/��ҩ�����}�7a*D�P܀�)>�a8mTO:��|jo��>����^qF�葘�9H��@S_�Pq�3Og��x����$���W��t$��.�[=��LB �/Y��e�����_u�i{^gq��|M*���"Uz�T⮑c�n�I���j��)j��U�Q�"�jj���};�<�[�0;��Ho6�����Z�:���M��?�D���L�����J��8�}\�GI4���Ib{�;��6-#M1�l�y�u{U��o��_�C��f�<^�����d�T�x�Q[S��]��4ĕj�0��m�`G��J��q���ei��*��:��r��wZ�>|�X)�9
��%��?�ͼ�T��0����-5P����J��L�@��y���@$óG���4o�[�P�D�l�W�D�(���hr� <�aR~�o�Z�wav��i���)����ԯwv��6����?PZ�s���rH=����ϸ�e%�}�$lg�e��)��: �q˾:'3i���}�ib�D����ߨ���-\�2wQ��P�ઝkW# '�ȵ�w��G��/w<H-��:nj]��.�:2> �;UgX�u� �mܯ(;k��maK;���8�sETŦS�9���3ȼ�N#o����1�e|��vxw����xX%�-_�
�`�0m��F ajJ$W+ֆ���=��$��
�j��*ȉI7WTr�)�|�i/���J�uXoW�GY8�tTiw��L�?��K���Y�މ�m,gb�\�"5xZ��H	^Y ��d~6����T���E�?�3<�c�ƻsu ���e��f.�_FN�[��_$�M��O�aW-��b�;�K*�?���
|��>\��'����2�i��3S�����H=v"�9��N7l@b��<�`�u!BoԵ�;5㶀2�������!:�Pϼ����y�#����z�Ƞ�S:�mx��u�B@u�f�-�?ldp��_�y��y�4����H߱��a֒���ޘ�K�{���ڏ�,�D�蕒��Uu�)���Ng�M|L��-L�,��#їKOs���ª!ڷ�k�iśiZ�����s�|Y��Rw�)��9�0��N��+1d���?3�!Y��<�'�..$b�Hh�����ZBW+l�X�ڡ�
i"٨;�D��O'k��6�rj��Ln�C3q��f��f�b
��������g!>����7�������Ɛ�P_օ����\��:�06�"��A$�e
tZ�dS�ޝȮd��C�����6Ec��m/vo_�������v�/�*:�.��]��cp�j\�+�z�w��_+9�������p�\&�*��)7k|��Jc��t�����D��R�W֠%�,�i��7�-�dH$�Y�ۉ�d��3�8��5:��{!'����x4w�,M/�>.B�N�S0��Ag Q���*k�p	�/;�o��	{�a�@��%�:�G#�aTՆ���SIT0u����"Ss+E6:e�/6�6uM�-y�΂J�:�K�RU�����18�a���U�LKM�V"�$ <h�?Nk�]y!�m��������!iPIh��d 
���^��a���n��VH�|�&7;�3/�n���:.�����B������1��m��n����$>MG���Ҍ��{C>�G���7� ĭj�ʻj��uJ��@집�6I�:*�09�I�D�B[��T�}���ET�p���q�����>�Ki�\b��^��8
H���>��:;��1*5ζ�=@ْ�a��4x�>�b,:��)S��H]�������|[����s�r����[��q�'�bJ�;��i�b`�Ws����ѕ΀Tҗ�a��=�xݬ�~��[�z1�U�C�W���/����=P�bsR�5���)(i�E��n[��.GEX�����$�V�:;Tf���1���ɮ7�9T���;S$��&m�d
pe��a{���{�<V��e)� ���-2Ysg{{�4�pb�0���"5�t!!p�57���7��nŘ����^]g�4��0��p<�3��QZ�i���0 �����kDp�-�l�5_N'��� q7g����l6���z�̬<P `��k�z�(�꿪�B�jv�*��w��P��:m����.��6��}�~$�r�u���ϯ�~Swlm��'z�6� �3���fWX�6��Âu��@==��)e�sy���=�_ܤcbӥ�Z��M,���kkC�:TΖ��7��aO�x��pz���h9�5��������o�%��t�r��N��Z�"1�f��'��I+�D�v+���->����d�^J?��v&p�Q��ݕ��*�}jQ��e_0�T6��OM�`_���S��'�K��c�$����ݘ��H��[������ 竣WZ�x� _-t&G�R��4�%.�^�Z��̆IF]���"4�`�v��G�����V�C2��1� ֓��aT�c{\\(M��������!S��
)j��K�mA��\�O".���IyW^���s�O.��ֹS!'��y�MT��%��� ������N"(ס�ak\�����A3o�-���F$�(�����S\�`��Q���i�-�.�2�*8!U^��p1YhM�J�v焻�����H��Y�I�x��5��:&���o=��wm����~:����H}��\,BsY
�R~ .�N���kX�����s���%�=lD�9v~B峕p��S��3Ļ�	�\)���|gQ�#��*�Z*ژW��m`$!�\銳p5�:y�&���#�0g��A�23J������0}ؓ�̩>�p#��P��>v@'�-��d���h����N��V;a!��a�O8��\n�Ʒ|8%D��v�Q�������Qc��7�l�z��M�ݭ�2���j[��>�(�Yv�X5x�T���Mr���Z�n{��]�d?��S$�#y�����=�U���b�r��e�$����_��3��B��8�l�Q�l��ֲ�?	�K�e��j�����Ze�2(������E�d.ր� ŵL����K �W+��6�͑����	��1�x�[?J�8�n��Fv�u�S Z+���oР7�n5�L�=GI1��>C娾e\�D[�3�{`١�0�$�;m���U87>;a���0������<�yʦ.��m5Ǉլ�8��O���.��Q��C�[Cf�^~:e;[�t?U�j;I(^Rm#>�!pu����"]S���� 	�Q�l�~��D�ay�W	W��h�����=NZW]Yh���X�\����N���/3Φs5I6��W��6����K�v�SS���9������b�w�d�)�;G�B�8W����_�~8���O*-���)��]Y6t�W�ʾWt-.B��?�y�����4�J�KPv>S����h�41�]FRQ����&��<5�z�J*�,�!�V��e����?��@���A&�tK�����}�&�L6��=�����Jdyi�R�R[ʘV4�;����skW��}r��>v[Zis�D ؂o̠��Q>J�gW�&�v���%Ef��X׾��މ`)��ޕ�	��U���S �Cl&�tC��S�]���\��2�OIg@?�B�\9�b��]ߺ�

�eA�!�"F×U��1��-�|���u�"{`ը�����M9+��Pn�F�u�!2�[���z�r��F���|��J�㫗In}|�G)��U,[���X1TVF��+�1_���@�� �`i_[�`.��<�s�Pg*���,�&�ZB���A��]�klq��6Rr�*�^���U�;*A(b�F���)���
�%�|/��8�k ��+��2��S'�(t\c����������X��� ��J�+ĳ´��u�-�	pa����ۅw٤.zô���'�� 'Լe}׀��9�g��t]\{Ʋ1�d-�%n��������_��8��ٸ� �pN�"�V�_��d0�7�bj�j|�5(�p��YDe���3t�\�킷�	|���nB�.6��޲}��Ĝ4o��F�RJ:�8����l0Bk?PO�.\wN䍶���u,)ׅ�rp��8���.jTg��[��g)��� �4IT��Ds��R�S?Qh��u5ckx���>��*�b��e�r1���3���Z8�H>kUR�D	>%1ڝ�=$�,0���__|#�1�̞.���ǘ	��{Tb���}�WTZ�D���4nm���Y���$�
�'ܾ�eF�H��AR7G�����e��3��(cP/��< f�7�9N�W�Y��9�FO͝IOQ�o\��K!��xq��� }4�쌲ȑo��.�q�'���B:��C�PU�_�P��"}�(��ʝコ�G�P)�Ck+92�w���y�jpʡ��E/�
y q�S��L}�V�!|���Z^	�(��TJv�:@s���qgm�[!윂ޫ�%�T$H�8��Նɳ@�TM�*��!��5�|��w�e<,lk0�P�8?���U=��{N�����J���yBx����'C�?B����4M]���r����Zm"@���Ԗ�[���1FC<�>kW����ҖYߤ�t#+����h�6�TH]��(��/���c|�Ť$k�'�0�0F���T"HHhط����%�2̏�����}�P|(յ�{�av!��X�,㑩�����I�-C��Js��_"�1�a�s�h��$`�S%⟻!��}���K(��P֊�\ ��'J	��>�pC�n�%N�&����(|&g������.+:xN�T����"K�g�{ڳXy����g���&�|�W�����9�+3v�����^@���h���$fS{��Mڍ��|�\��~`������x�B�0qY�D�a1A�ġ,����.}���hE,O؞�8с���٭[˼B ��:t�����Y�M�J]�l��,�<���M|��/k����)wH(����Gൢ�I���u;W �5�9�
�V��{�l{��P^����W�!�ɥ�D�,���X���!���m��J�(!�MB�Ntd�u޵l�idz���?��Z�(u?[�@��N���X�E���^K$y���h�u�w{5e8"+�昻ͪ��s��'Օ>8�N�8OMJ�;���9o����Rb�.?�R�vA�tv�s^u��9�)0�k"$1%���g؃�&EK��<ٺ�@�L�TP\��Ȉ������b�f5��+*_�i��8f.����q�����g@���	]/��Jt8)�I�����<���R��oV:�'�p���;����S(ݲ���͍���cy �&�JM>�6"��h��P!��������8�fe-����1~l�8���J-zs���F��x�c_{�X2�Q�i��P�D/��� g1��}ΰ�{���Ձ�;1P�'��6�2wO��&փ��Pؤ-�����J�X���~pL��������{KQJ����~� �c拧(S2}���<a��!�c�25~*�`52C״����9�҂p�I'��w�H����d%���:㟭�
�V��`p�.e�B��j�%K~�b�])���� �a��Hֲ��׮;�	�H��x�{&v��	��P:�\[5n��G�����x@������H�.�"�h��+K�OS�w�Q��`4����O���	Gu�D#2-T�XBC���]va�бW���5-(meK|�N��-A!۷�Ó�NQ��*㬈ny�~M����;l�*fQ�� �2ٗp$���Q/&b�j��9&��^J�ȵ`)A
kz����,����s�}��g�O#|��0r�&�HH��'���u�|�y�Gp�d�qu B�˅������YnH�g�s#ުcY���^��H��{��q1��Y//i�=.��7�k�"�y5.��
l6لR<N�Us`��kO�z��J�%��7��0+Z���/�_����Q��4C4���G���a\=�h�N ������5���黎v'�n�[�!{U� x����nC~�܀S�A#G����
���J KcT����si9I�nƼ �d=Ld|u�kP���G7�`�V���"z��IT=h�#	!����aQ82yx<�p�v�7�:+�#�"���
��Y{�����-!d�`a�)-@CIJ�;�pDyY�b�r�v�v��?_%���(���f��P# >�a���r\"=q7��HП�%�Y����(qI��<�����zTb���èׅ��ET;��uE�}p!#-��D�G��^�7_� )�]PŔ����Q��cťһF�=���$�Br-�%td�o�<����cV�bd �k��:>�
߆S �$p3b�;\��y#0l]Չ[�s{Cs���x��1hl�Mode\" role=\"application\" ng-keydown=\"keydown($event)\">\n" +
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
