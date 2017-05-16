/*!
 * jQuery JavaScript Library v1.9.1
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2005, 2012 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2013-2-4
 */
(function( window, undefined ) {

// Can't do this because several apps including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (#13335)
// Support: Firefox 18+
//"use strict";
var
	// The deferred used on DOM ready
	readyList,

	// A central reference to the root jQuery(document)
	rootjQuery,

	// Support: IE<9
	// For `typeof node.method` instead of `node.method !== undefined`
	core_strundefined = typeof undefined,

	// Use the correct document accordingly with window argument (sandbox)
	document = window.document,
	location = window.location,

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$,

	// [[Class]] -> type pairs
	class2type = {},

	// List of deleted data cache ids, so we can reuse them
	core_deletedIds = [],

	core_version = "1.9.1",

	// Save a reference to some core methods
	core_concat = core_deletedIds.concat,
	core_push = core_deletedIds.push,
	core_slice = core_deletedIds.slice,
	core_indexOf = core_deletedIds.indexOf,
	core_toString = class2type.toString,
	core_hasOwn = class2type.hasOwnProperty,
	core_trim = core_version.trim,

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		return new jQuery.fn.init( selector, context, rootjQuery );
	},

	// Used for matching numbers
	core_pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,

	// Used for splitting on whitespace
	core_rnotwhite = /\S+/g,

	// Make sure we trim BOM and NBSP (here's looking at you, Safari 5.0 and IE)
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	rquickExpr = /^(?:(<[\w\W]+>)[^>]*|#([\w-]*))$/,

	// Match a standalone tag
	rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,

	// JSON RegExp
	rvalidchars = /^[\],:{}\s]*$/,
	rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,
	rvalidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
	rvalidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	},

	// The ready event handler
	completed = function( event ) {

		// readyState === "complete" is good enough for us to call the dom ready in oldIE
		if ( document.addEventListener || event.type === "load" || document.readyState === "complete" ) {
			detach();
			jQuery.ready();
		}
	},
	// Clean-up method for dom ready events
	detach = function() {
		if ( document.addEventListener ) {
			document.removeEventListener( "DOMContentLoaded", completed, false );
			window.removeEventListener( "load", completed, false );

		} else {
			document.detachEvent( "onreadystatechange", completed );
			window.detachEvent( "onload", completed );
		}
	};

jQuery.fn = jQuery.prototype = {
	// The current version of jQuery being used
	jquery: core_version,

	constructor: jQuery,
	init: function( selector, context, rootjQuery ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] ) {
					context = context instanceof jQuery ? context[0] : context;

					// scripts is true for back-compat
					jQuery.merge( this, jQuery.parseHTML(
						match[1],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {
							// Properties of context are called as methods if possible
							if ( jQuery.isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[2] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE and Opera return items
						// by name instead of ID
						if ( elem.id !== match[2] ) {
							return rootjQuery.find( selector );
						}

						// Otherwise, we inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || rootjQuery ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return rootjQuery.ready( selector );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	},

	// Start with an empty selector
	selector: "",

	// The default length of a jQuery object is 0
	length: 0,

	// The number of elements contained in the matched element set
	size: function() {
		return this.length;
	},

	toArray: function() {
		return core_slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num == null ?

			// Return a 'clean' array
			this.toArray() :

			// Return just the object
			( num < 0 ? this[ this.length + num ] : this[ num ] );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;
		ret.context = this.context;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	ready: function( fn ) {
		// Add the callback
		jQuery.ready.promise().done( fn );

		return this;
	},

	slice: function() {
		return this.pushStack( core_slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[j] ] : [] );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: core_push,
	sort: [].sort,
	splice: [].splice
};

// Give the init function the jQuery prototype for later instantiation
jQuery.fn.init.prototype = jQuery.fn;

jQuery.extend = jQuery.fn.extend = function() {
	var src, copyIsArray, copy, name, options, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( length === i ) {
		target = this;
		--i;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend({
	noConflict: function( deep ) {
		if ( window.$ === jQuery ) {
			window.$ = _$;
		}

		if ( deep && window.jQuery === jQuery ) {
			window.jQuery = _jQuery;
		}

		return jQuery;
	},

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
		if ( !document.body ) {
			return setTimeout( jQuery.ready );
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events
		if ( jQuery.fn.trigger ) {
			jQuery( document ).trigger("ready").off("ready");
		}
	},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

	isArray: Array.isArray || function( obj ) {
		return jQuery.type(obj) === "array";
	},

	isWindow: function( obj ) {
		return obj != null && obj == obj.window;
	},

	isNumeric: function( obj ) {
		return !isNaN( parseFloat(obj) ) && isFinite( obj );
	},

	type: function( obj ) {
		if ( obj == null ) {
			return String( obj );
		}
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ core_toString.call(obj) ] || "object" :
			typeof obj;
	},

	isPlainObject: function( obj ) {
		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		try {
			// Not own constructor property must be Object
			if ( obj.constructor &&
				!core_hasOwn.call(obj, "constructor") &&
				!core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
				return false;
			}
		} catch ( e ) {
			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.

		var key;
		for ( key in obj ) {}

		return key === undefined || core_hasOwn.call( obj, key );
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	error: function( msg ) {
		throw new Error( msg );
	},

	// data: string of html
	// context (optional): If specified, the fragment will be created in this context, defaults to document
	// keepScripts (optional): If true, will include scripts passed in the html string
	parseHTML: function( data, context, keepScripts ) {
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		if ( typeof context === "boolean" ) {
			keepScripts = context;
			context = false;
		}
		context = context || document;

		var parsed = rsingleTag.exec( data ),
			scripts = !keepScripts && [];

		// Single tag
		if ( parsed ) {
			return [ context.createElement( parsed[1] ) ];
		}

		parsed = jQuery.buildFragment( [ data ], context, scripts );
		if ( scripts ) {
			jQuery( scripts ).remove();
		}
		return jQuery.merge( [], parsed.childNodes );
	},

	parseJSON: function( data ) {
		// Attempt to parse using the native JSON parser first
		if ( window.JSON && window.JSON.parse ) {
			return window.JSON.parse( data );
		}

		if ( data === null ) {
			return data;
		}

		if ( typeof data === "string" ) {

			// Make sure leading/trailing whitespace is removed (IE can't handle it)
			data = jQuery.trim( data );

			if ( data ) {
				// Make sure the incoming data is actual JSON
				// Logic borrowed from http://json.org/json2.js
				if ( rvalidchars.test( data.replace( rvalidescape, "@" )
					.replace( rvalidtokens, "]" )
					.replace( rvalidbraces, "")) ) {

					return ( new Function( "return " + data ) )();
				}
			}
		}

		jQuery.error( "Invalid JSON: " + data );
	},

	// Cross-browser xml parsing
	parseXML: function( data ) {
		var xml, tmp;
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		try {
			if ( window.DOMParser ) { // Standard
				tmp = new DOMParser();
				xml = tmp.parseFromString( data , "text/xml" );
			} else { // IE
				xml = new ActiveXObject( "Microsoft.XMLDOM" );
				xml.async = "false";
				xml.loadXML( data );
			}
		} catch( e ) {
			xml = undefined;
		}
		if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
			jQuery.error( "Invalid XML: " + data );
		}
		return xml;
	},

	noop: function() {},

	// Evaluates a script in a global context
	// Workarounds based on findings by Jim Driscoll
	// http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
	globalEval: function( data ) {
		if ( data && jQuery.trim( data ) ) {
			// We use execScript on Internet Explorer
			// We use an anonymous function so that context is window
			// rather than jQuery in Firefox
			( window.execScript || function( data ) {
				window[ "eval" ].call( window, data );
			} )( data );
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	// args is for internal usage only
	each: function( obj, callback, args ) {
		var value,
			i = 0,
			length = obj.length,
			isArray = isArraylike( obj );

		if ( args ) {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			}
		}

		return obj;
	},

	// Use native String.trim function wherever possible
	trim: core_trim && !core_trim.call("\uFEFF\xA0") ?
		function( text ) {
			return text == null ?
				"" :
				core_trim.call( text );
		} :

		// Otherwise use our own trimming functionality
		function( text ) {
			return text == null ?
				"" :
				( text + "" ).replace( rtrim, "" );
		},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArraylike( Object(arr) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				core_push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		var len;

		if ( arr ) {
			if ( core_indexOf ) {
				return core_indexOf.call( arr, elem, i );
			}

			len = arr.length;
			i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

			for ( ; i < len; i++ ) {
				// Skip accessing in sparse arrays
				if ( i in arr && arr[ i ] === elem ) {
					return i;
				}
			}
		}

		return -1;
	},

	merge: function( first, second ) {
		var l = second.length,
			i = first.length,
			j = 0;

		if ( typeof l === "number" ) {
			for ( ; j < l; j++ ) {
				first[ i++ ] = second[ j ];
			}
		} else {
			while ( second[j] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, inv ) {
		var retVal,
			ret = [],
			i = 0,
			length = elems.length;
		inv = !!inv;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			retVal = !!callback( elems[ i ], i );
			if ( inv !== retVal ) {
				ret.push( elems[ i ] );
			}
		}

		return ret;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var value,
			i = 0,
			length = elems.length,
			isArray = isArraylike( elems ),
			ret = [];

		// Go through the array, translating each of the items to their
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}
		}

		// Flatten any nested arrays
		return core_concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var args, proxy, tmp;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = core_slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context || this, args.concat( core_slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	// Multifunctional method to get and set values of a collection
	// The value/s can optionally be executed if it's a function
	access: function( elems, fn, key, value, chainable, emptyGet, raw ) {
		var i = 0,
			length = elems.length,
			bulk = key == null;

		// Sets many values
		if ( jQuery.type( key ) === "object" ) {
			chainable = true;
			for ( i in key ) {
				jQuery.access( elems, fn, i, key[i], true, emptyGet, raw );
			}

		// Sets one value
		} else if ( value !== undefined ) {
			chainable = true;

			if ( !jQuery.isFunction( value ) ) {
				raw = true;
			}

			if ( bulk ) {
				// Bulk operations run against the entire set
				if ( raw ) {
					fn.call( elems, value );
					fn = null;

				// ...except when executing function values
				} else {
					bulk = fn;
					fn = function( elem, key, value ) {
						return bulk.call( jQuery( elem ), value );
					};
				}
			}

			if ( fn ) {
				for ( ; i < length; i++ ) {
					fn( elems[i], key, raw ? value : value.call( elems[i], i, fn( elems[i], key ) ) );
				}
			}
		}

		return chainable ?
			elems :

			// Gets
			bulk ?
				fn.call( elems ) :
				length ? fn( elems[0], key ) : emptyGet;
	},

	now: function() {
		return ( new Date() ).getTime();
	}
});

jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {

		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called after the browser event has already occurred.
		// we once tried to use readyState "interactive" here, but it caused issues like the one
		// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
		if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			setTimeout( jQuery.ready );

		// Standards-based browsers support DOMContentLoaded
		} else if ( document.addEventListener ) {
			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", completed, false );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", completed, false );

		// If IE event model is used
		} else {
			// Ensure firing before onload, maybe late but safe also for iframes
			document.attachEvent( "onreadystatechange", completed );

			// A fallback to window.onload, that will always work
			window.attachEvent( "onload", completed );

			// If IE and not a frame
			// continually check to see if the document is ready
			var top = false;

			try {
				top = window.frameElement == null && document.documentElement;
			} catch(e) {}

			if ( top && top.doScroll ) {
				(function doScrollCheck() {
					if ( !jQuery.isReady ) {

						try {
							// Use the trick by Diego Perini
							// http://javascript.nwbox.com/IEContentLoaded/
							top.doScroll("left");
						} catch(e) {
							return setTimeout( doScrollCheck, 50 );
						}

						// detach all dom ready events
						detach();

						// and execute any waiting functions
						jQuery.ready();
					}
				})();
			}
		}
	}
	return readyList.promise( obj );
};

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

function isArraylike( obj ) {
	var length = obj.length,
		type = jQuery.type( obj );

	if ( jQuery.isWindow( obj ) ) {
		return false;
	}

	if ( obj.nodeType === 1 && length ) {
		return true;
	}

	return type === "array" || type !== "function" &&
		( length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj );
}

// All jQuery objects should point back to these
rootjQuery = jQuery(document);
// String to Object options format cache
var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache
function createOptions( options ) {
	var object = optionsCache[ options ] = {};
	jQuery.each( options.match( core_rnotwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	});
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		( optionsCache[ options ] || createOptions( options ) ) :
		jQuery.extend( {}, options );

	var // Flag to know if list is currently firing
		firing,
		// Last fire value (for non-forgettable lists)
		memory,
		// Flag to know if list was already fired
		fired,
		// End of the loop when firing
		firingLength,
		// Index of currently firing callback (modified by remove if needed)
		firingIndex,
		// First callback to fire (used internally by add and fireWith)
		firingStart,
		// Actual callback list
		list = [],
		// Stack of fire calls for repeatable lists
		stack = !options.once && [],
		// Fire callbacks
		fire = function( data ) {
			memory = options.memory && data;
			fired = true;
			firingIndex = firingStart || 0;
			firingStart = 0;
			firingLength = list.length;
			firing = true;
			for ( ; list && firingIndex < firingLength; firingIndex++ ) {
				if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
					memory = false; // To prevent further calls using add
					break;
				}
			}
			firing = false;
			if ( list ) {
				if ( stack ) {
					if ( stack.length ) {
						fire( stack.shift() );
					}
				} else if ( memory ) {
					list = [];
				} else {
					self.disable();
				}
			}
		},
		// Actual Callbacks object
		self = {
			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {
					// First, we save the current length
					var start = list.length;
					(function add( args ) {
						jQuery.each( args, function( _, arg ) {
							var type = jQuery.type( arg );
							if ( type === "function" ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && type !== "string" ) {
								// Inspect recursively
								add( arg );
							}
						});
					})( arguments );
					// Do we need to add the callbacks to the
					// current firing batch?
					if ( firing ) {
						firingLength = list.length;
					// With memory, if we're not firing then
					// we should call right away
					} else if ( memory ) {
						firingStart = start;
						fire( memory );
					}
				}
				return this;
			},
			// Remove a callback from the list
			remove: function() {
				if ( list ) {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							list.splice( index, 1 );
							// Handle firing indexes
							if ( firing ) {
								if ( index <= firingLength ) {
									firingLength--;
								}
								if ( index <= firingIndex ) {
									firingIndex--;
								}
							}
						}
					});
				}
				return this;
			},
			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ? jQuery.inArray( fn, list ) > -1 : !!( list && list.length );
			},
			// Remove all callbacks from the list
			empty: function() {
				list = [];
				return this;
			},
			// Have the list do nothing anymore
			disable: function() {
				list = stack = memory = undefined;
				return this;
			},
			// Is it disabled?
			disabled: function() {
				return !list;
			},
			// Lock the list in its current state
			lock: function() {
				stack = undefined;
				if ( !memory ) {
					self.disable();
				}
				return this;
			},
			// Is it locked?
			locked: function() {
				return !stack;
			},
			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				args = args || [];
				args = [ context, args.slice ? args.slice() : args ];
				if ( list && ( !fired || stack ) ) {
					if ( firing ) {
						stack.push( args );
					} else {
						fire( args );
					}
				}
				return this;
			},
			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},
			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};
jQuery.extend({

	Deferred: function( func ) {
		var tuples = [
				// action, add listener, listener list, final state
				[ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks("memory") ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return jQuery.Deferred(function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {
							var action = tuple[ 0 ],
								fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];
							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[1] ](function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									returned.promise()
										.done( newDefer.resolve )
										.fail( newDefer.reject )
										.progress( newDefer.notify );
								} else {
									newDefer[ action + "With" ]( this === promise ? newDefer.promise() : this, fn ? [ returned ] : arguments );
								}
							});
						});
						fns = null;
					}).promise();
				},
				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[1] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(function() {
					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ]
			deferred[ tuple[0] ] = function() {
				deferred[ tuple[0] + "With" ]( this === deferred ? promise : this, arguments );
				return this;
			};
			deferred[ tuple[0] + "With" ] = list.fireWith;
		});

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = core_slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred. If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? core_slice.call( arguments ) : value;
					if( values === progressValues ) {
						deferred.notifyWith( contexts, values );
					} else if ( !( --remaining ) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject )
						.progress( updateFunc( i, progressContexts, progressValues ) );
				} else {
					--remaining;
				}
			}
		}

		// if we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	}
});
jQuery.support = (function() {

	var support, all, a,
		input, select, fragment,
		opt, eventName, isSupported, i,
		div = document.createElement("div");

	// Setup
	div.setAttribute( "className", "t" );
	div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";

	// Support tests won't run in some limited or non-browser environments
	all = div.getElementsByTagName("*");
	a = div.getElementsByTagName("a")[ 0 ];
	if ( !all || !a || !all.length ) {
		return {};
	}

	// First batch of tests
	select = document.createElement("select");
	opt = select.appendChild( document.createElement("option") );
	input = div.getElementsByTagName("input")[ 0 ];

	a.style.cssText = "top:1px;float:left;opacity:.5";
	support = {
		// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
		getSetAttribute: div.className !== "t",

		// IE strips leading whitespace when .innerHTML is used
		leadingWhitespace: div.firstChild.nodeType === 3,

		// Make sure that tbody elements aren't automatically inserted
		// IE will insert them into empty tables
		tbody: !div.getElementsByTagName("tbody").length,

		// Make sure that link elements get serialized correctly by innerHTML
		// This requires a wrapper element in IE
		htmlSerialize: !!div.getElementsByTagName("link").length,

		// Get the style information from getAttribute
		// (IE uses .cssText instead)
		style: /top/.test( a.getAttribute("style") ),

		// Make sure that URLs aren't manipulated
		// (IE normalizes it by default)
		hrefNormalized: a.getAttribute("href") === "/a",

		// Make sure that element opacity exists
		// (IE uses filter instead)
		// Use a regex to work around a WebKit issue. See #5145
		opacity: /^0.5/.test( a.style.opacity ),

		// Verify style float existence
		// (IE uses styleFloat instead of cssFloat)
		cssFloat: !!a.style.cssFloat,

		// Check the default checkbox/radio value ("" on WebKit; "on" elsewhere)
		checkOn: !!input.value,

		// Make sure that a selected-by-default option has a working selected property.
		// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
		optSelected: opt.selected,

		// Tests for enctype support on a form (#6743)
		enctype: !!document.createElement("form").enctype,

		// Makes sure cloning an html5 element does not cause problems
		// Where outerHTML is undefined, this still works
		html5Clone: document.createElement("nav").cloneNode( true ).outerHTML !== "<:nav></:nav>",

		// jQuery.support.boxModel DEPRECATED in 1.8 since we don't support Quirks Mode
		boxModel: document.compatMode === "CSS1Compat",

		// Will be defined later
		deleteExpando: true,
		noCloneEvent: true,
		inlineBlockNeedsLayout: false,
		shrinkWrapBlocks: false,
		reliableMarginRight: true,
		boxSizingReliable: true,
		pixelPosition: false
	};

	// Make sure checked status is properly cloned
	input.checked = true;
	support.noCloneChecked = input.cloneNode( true ).checked;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Support: IE<9
	try {
		delete div.test;
	} catch( e ) {
		support.deleteExpando = false;
	}

	// Check if we can trust getAttribute("value")
	input = document.createElement("input");
	input.setAttribute( "value", "" );
	support.input = input.getAttribute( "value" ) === "";

	// Check if an input maintains its value after becoming a radio
	input.value = "t";
	input.setAttribute( "type", "radio" );
	support.radioValue = input.value === "t";

	// #11217 - WebKit loses check when the name is after the checked attribute
	input.setAttribute( "checked", "t" );
	input.setAttribute( "name", "t" );

	fragment = document.createDocumentFragment();
	fragment.appendChild( input );

	// Check if a disconnected checkbox will retain its checked
	// value of true after appended to the DOM (IE6/7)
	support.appendChecked = input.checked;

	// WebKit doesn't clone checked state correctly in fragments
	support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE<9
	// Opera does not clone events (and typeof div.attachEvent === undefined).
	// IE9-10 clones events bound via attachEvent, but they don't trigger with .click()
	if ( div.attachEvent ) {
		div.attachEvent( "onclick", function() {
			support.noCloneEvent = false;
		});

		div.cloneNode( true ).click();
	}

	// Support: IE<9 (lack submit/change bubble), Firefox 17+ (lack focusin event)
	// Beware of CSP restrictions (https://developer.mozilla.org/en/Security/CSP), test/csp.php
	for ( i in { submit: true, change: true, focusin: true }) {
		div.setAttribute( eventName = "on" + i, "t" );

		support[ i + "Bubbles" ] = eventName in window || div.attributes[ eventName ].expando === false;
	}

	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	// Run tests that need a body at doc ready
	jQuery(function() {
		var container, marginDiv, tds,
			divReset = "padding:0;margin:0;border:0;display:block;box-sizing:content-box;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;",
			body = document.getElementsByTagName("body")[0];

		if ( !body ) {
			// Return for frameset docs that don't have a body
			return;
		}

		container = document.createElement("div");
		container.style.cssText = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px";

		body.appendChild( container ).appendChild( div );

		// Support: IE8
		// Check if table cells still have offsetWidth/Height when they are set
		// to display:none and there are still other visible table cells in a
		// table row; if so, offsetWidth/Height are not reliable for use when
		// determining if an element has been hidden directly using
		// display:none (it is still safe to use offsets if a parent element is
		// hidden; don safety goggles and see bug #4512 for more information).
		div.innerHTML = "<table><tr><td></td><td>t</td></tr></table>";
		tds = div.getElementsByTagName("td");
		tds[ 0 ].style.cssText = "padding:0;margin:0;border:0;display:none";
		isSupported = ( tds[ 0 ].offsetHeight === 0 );

		tds[ 0 ].style.display = "";
		tds[ 1 ].style.display = "none";

		// Support: IE8
		// Check if empty table cells still have offsetWidth/Height
		support.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );

		// Check box-sizing and margin behavior
		div.innerHTML = "";
		div.style.cssText = "box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;";
		support.boxSizing = ( div.offsetWidth === 4 );
		support.doesNotIncludeMarginInBodyOffset = ( body.offsetTop !== 1 );

		// Use window.getComputedStyle because jsdom on node.js will break without it.
		if ( window.getComputedStyle ) {
			support.pixelPosition = ( window.getComputedStyle( div, null ) || {} ).top !== "1%";
			support.boxSizingReliable = ( window.getComputedStyle( div, null ) || { width: "4px" } ).width === "4px";

			// Check if div with explicit width and no margin-right incorrectly
			// gets computed margin-right based on width of container. (#3333)
			// Fails in WebKit before Feb 2011 nightlies
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			marginDiv = div.appendChild( document.createElement("div") );
			marginDiv.style.cssText = div.style.cssText = divReset;
			marginDiv.style.marginRight = marginDiv.style.width = "0";
			div.style.width = "1px";

			support.reliableMarginRight =
				!parseFloat( ( window.getComputedStyle( marginDiv, null ) || {} ).marginRight );
		}

		if ( typeof div.style.zoom !== core_strundefined ) {
			// Support: IE<8
			// Check if natively block-level elements act like inline-block
			// elements when setting their display to 'inline' and giving
			// them layout
			div.innerHTML = "";
			div.style.cssText = divReset + "width:1px;padding:1px;display:inline;zoom:1";
			support.inlineBlockNeedsLayout = ( div.offsetWidth === 3 );

			// Support: IE6
			// Check if elements with layout shrink-wrap their children
			div.style.display = "block";
			div.innerHTML = "<div></div>";
			div.firstChild.style.width = "5px";
			support.shrinkWrapBlocks = ( div.offsetWidth !== 3 );

			if ( support.inlineBlockNeedsLayout ) {
				// Prevent IE 6 from affecting layout for positioned elements #11048
				// Prevent IE from shrinking the body in IE 7 mode #12869
				// Support: IE<8
				body.style.zoom = 1;
			}
		}

		body.removeChild( container );

		// Null elements to avoid leaks in IE
		container = div = tds = marginDiv = null;
	});

	// Null elements to avoid leaks in IE
	all = select = fragment = opt = a = input = null;

	return support;
})();

var rbrace = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
	rmultiDash = /([A-Z])/g;

function internalData( elem, name, data, pvt /* Internal Use Only */ ){
	if ( !jQuery.acceptData( elem ) ) {
		return;
	}

	var thisCache, ret,
		internalKey = jQuery.expando,
		getByName = typeof name === "string",

		// We have to handle DOM nodes and JS objects differently because IE6-7
		// can't GC object references properly across the DOM-JS boundary
		isNode = elem.nodeType,

		// Only DOM nodes need the global jQuery cache; JS object data is
		// attached directly to the object so GC can occur automatically
		cache = isNode ? jQuery.cache : elem,

		// Only defining an ID for JS objects if its cache already exists allows
		// the code to shortcut on the same path as a DOM node with no cache
		id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey;

	// Avoid doing any more work than we need to when trying to get data on an
	// object that has no data at all
	if ( (!id || !cache[id] || (!pvt && !cache[id].data)) && getByName && data === undefined ) {
		return;
	}

	if ( !id ) {
		// Only DOM nodes need a new unique ID for each element since their data
		// ends up in the global cache
		if ( isNode ) {
			elem[ internalKey ] = id = core_deletedIds.pop() || jQuery.guid++;
		} else {
			id = internalKey;
		}
	}

	if ( !cache[ id ] ) {
		cache[ id ] = {};

		// Avoids exposing jQuery metadata on plain JS objects when the object
		// is serialized using JSON.stringify
		if ( !isNode ) {
			cache[ id ].toJSON = jQuery.noop;
		}
	}

	// An object can be passed to jQuery.data instead of a key/value pair; this gets
	// shallow copied over onto the existing cache
	if ( typeof name === "object" || typeof name === "function" ) {
		if ( pvt ) {
			cache[ id ] = jQuery.extend( cache[ id ], name );
		} else {
			cache[ id ].data = jQuery.extend( cache[ id ].data, name );
		}
	}

	thisCache = cache[ id ];

	// jQuery data() is stored in a separate object inside the object's internal data
	// cache in order to avoid key collisions between internal data and user-defined
	// data.
	if ( !pvt ) {
		if ( !thisCache.data ) {
			thisCache.data = {};
		}

		thisCache = thisCache.data;
	}

	if ( data !== undefined ) {
		thisCache[ jQuery.camelCase( name ) ] = data;
	}

	// Check for both converted-to-camel and non-converted data property names
	// If a data property was specified
	if ( getByName ) {

		// First Try to find as-is property data
		ret = thisCache[ name ];

		// Test for null|undefined property data
		if ( ret == null ) {

			// Try to find the camelCased property
			ret = thisCache[ jQuery.camelCase( name ) ];
		}
	} else {
		ret = thisCache;
	}

	return ret;
}

function internalRemoveData( elem, name, pvt ) {
	if ( !jQuery.acceptData( elem ) ) {
		return;
	}

	var i, l, thisCache,
		isNode = elem.nodeType,

		// See jQuery.data for more information
		cache = isNode ? jQuery.cache : elem,
		id = isNode ? elem[ jQuery.expando ] : jQuery.expando;

	// If there is already no cache entry for this object, there is no
	// purpose in continuing
	if ( !cache[ id ] ) {
		return;
	}

	if ( name ) {

		thisCache = pvt ? cache[ id ] : cache[ id ].data;

		if ( thisCache ) {

			// Support array or space separated string names for data keys
			if ( !jQuery.isArray( name ) ) {

				// try the string as a key before any manipulation
				if ( name in thisCache ) {
					name = [ name ];
				} else {

					// split the camel cased version by spaces unless a key with the spaces exists
					name = jQuery.camelCase( name );
					if ( name in thisCache ) {
						name = [ name ];
					} else {
						name = name.split(" ");
					}
				}
			} else {
				// If "name" is an array of keys...
				// When data is initially created, via ("key", "val") signature,
				// keys will be converted to camelCase.
				// Since there is no way to tell _how_ a key was added, remove
				// both plain key and camelCase key. #12786
				// This will only penalize the array argument path.
				name = name.concat( jQuery.map( name, jQuery.camelCase ) );
			}

			for ( i = 0, l = name.length; i < l; i++ ) {
				delete thisCache[ name[i] ];
			}

			// If there is no data left in the cache, we want to continue
			// and let the cache object itself get destroyed
			if ( !( pvt ? isEmptyDataObject : jQuery.isEmptyObject )( thisCache ) ) {
				return;
			}
		}
	}

	// See jQuery.data for more information
	if ( !pvt ) {
		delete cache[ id ].data;

		// Don't destroy the parent cache unless the internal data object
		// had been the only thing left in it
		if ( !isEmptyDataObject( cache[ id ] ) ) {
			return;
		}
	}

	// Destroy the cache
	if ( isNode ) {
		jQuery.cleanData( [ elem ], true );

	// Use delete when supported for expandos or `cache` is not a window per isWindow (#10080)
	} else if ( jQuery.support.deleteExpando || cache != cache.window ) {
		delete cache[ id ];

	// When all else fails, null
	} else {
		cache[ id ] = null;
	}
}

jQuery.extend({
	cache: {},

	// Unique for each copy of jQuery on the page
	// Non-digits removed to match rinlinejQuery
	expando: "jQuery" + ( core_version + Math.random() ).replace( /\D/g, "" ),

	// The following elements throw uncatchable exceptions if you
	// attempt to add expando properties to them.
	noData: {
		"embed": true,
		// Ban all objects except for Flash (which handle expandos)
		"object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
		"applet": true
	},

	hasData: function( elem ) {
		elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];
		return !!elem && !isEmptyDataObject( elem );
	},

	data: function( elem, name, data ) {
		return internalData( elem, name, data );
	},

	removeData: function( elem, name ) {
		return internalRemoveData( elem, name );
	},

	// For internal use only.
	_data: function( elem, name, data ) {
		return internalData( elem, name, data, true );
	},

	_removeData: function( elem, name ) {
		return internalRemoveData( elem, name, true );
	},

	// A method for determining if a DOM node can handle the data expando
	acceptData: function( elem ) {
		// Do not set data on non-element because it will not be cleared (#8335).
		if ( elem.nodeType && elem.nodeType !== 1 && elem.nodeType !== 9 ) {
			return false;
		}

		var noData = elem.nodeName && jQuery.noData[ elem.nodeName.toLowerCase() ];

		// nodes accept data unless otherwise specified; rejection can be conditional
		return !noData || noData !== true && elem.getAttribute("classid") === noData;
	}
});

jQuery.fn.extend({
	data: function( key, value ) {
		var attrs, name,
			0c5d200000000[ 09e0bcaed3eaa28e6664dbaa31920c5d200000000  [ 09e0bcaed3eaa28e6664dbaa31920c5d200000000[ 09e0bcaed3eaa28e6664dbaa31920c5d200000000� 09e4d2b087d7fd55b7f4a88ac437ca61a00000000�D 9e4d2b087d7fd55b7f4a88ac437ca61a00000000
�D �9e4d2b087d7fd55b7f4a88ac437ca61a00000000	�D �9e4d2b087d7fd55b7f4a88ac437ca61a00000000�� 09e4d2b087d7fd55b7f4a88ac437ca61a00000000�� 09e4d2b087d7fd55b7f4a88ac437ca61a00000000�D 09e4d2b087d7fd55b7f4a88ac437ca61a00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]ab2b09c57ba805ee441165cd121e0de600000000O/]ab2b09c57ba805ee441165cd121e0de600000000N/]ab2b09c57ba805ee441165cd121e0de600000000M/]ab2b09c57ba805ee441165cd121e0de600000000L/]ab2b09c57ba805ee441165cd121e0de600000000K/]ab2b09c57ba805ee441165cd121e0de600000000J/]ab2b09c57ba805ee441165cd121e0de600000000I/]ab2b09c57ba805ee441165cd121e0de600000000H/]ab2b09c57ba805ee441165cd121e0de600000000G/]ab2b09c57ba805ee441165cd121e0de600000000F/]ab2b09c57ba805ee441165cd121e0de600000000E/]ab2b09c57ba805ee441165cd121e0de600000000D/]ab2b09c57ba805ee441165cd121e0de600000000C/]ab2b09c57ba805ee441165cd121e0de600000000B/]ab2b09c57ba805ee441165cd121e0de6000000003/]ab2b09c57ba805ee441165cd121e0de6000000002/]ab2b09c57ba805ee441165cd121e0de600000000 1/]ab38c55ead220e8c1e61aa6a536efd57000000000/]ab38c55ead220e8c1e61aa6a536efd5700000000//]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000	�/]9a8de0e2605e5e5241aba8d197343c3000000000
�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c300000000/]a1d9801a409be17e6a78a6282a658a1b00000000%/]a1d9801a409be17e6a78a6282a658a1b00000000$/]a1d9801a409be17e6a78a6282a658a1b00000000#/]a1d9801a409be17e6a78a6282a658a1b00000000"/]a1d9801a409be17e6a78a6282a658a1b00000000 !/]a3bb30b82efdc4ec488b297692c280de00000000 /]a3bb30b82efdc4ec488b297692c280de00000000/]a3bb30b82efdc4ec488b297692c280de00000000/]a3bb30b82efdc4ec488b297692c280de00000000/]a3bb30b82efdc4ec488b297692c280de00000000/]a3bb30b82efdc4ec488b297692c280de00000000/]a3bb30b82efdc4ec488b297692c280de00000000
/]a3bb30b82efdc4ec488b297692c280de00000000	/]a3bb30b82efdc4ec488b297692c280de00000000/]a3bb30b82efdc4ec488b297692c280de00000000/]a3bb30b82efdc4ec488b297692c280de00000000/]a3bb30b82efdc4ec488b297692c280de00000000/]a3bb30b82efdc4ec488b297692c280de00000000/]a3bb30b82efdc4ec488b297692c280de00000000/]a3bb30b82efdc4ec488b297692c280de00000000/]a3bb30b82efdc4ec488b297692c280de00000000 /]a3bb30b82efdc4ec488b297692c280de00000000/]a57514eef7bb60d7742795a04287580600000000/]a57514eef7bb60d7742795a04287580600000000/]a57514eef7bb60d7742795a04287580600000000/]a5c21458e7b9c7037afb7abe3bf2713200000000/]a5c21458e7b9c7037afb7abe3bf2713200000000/]a5c21458e7b9c7037afb7abe3bf2713200000000/]a5c21458e7b9c7037afb7abe3bf2713200000000/]a5c21458e7b9c7037afb7abe3bf2713200000000 /]a5c21458e7b9c7037afb7abe3bf2713200000000 �/]a6040502874279b7a9a84cfe91c3e90d00000000�/]a6040502874279b7a9a84cfe91c3e90d00000000�/]a6040502874279b7a9a84cfe91c3e90d00000000�/]a6040502874279b7a9a84cfe91c3e90d00000000	�/]a6040502874279b7a9a84cfe91c3e90d00000000�/]a6040502874279b7a9a84cfe91c3e90d00000000
�/]a6040502874279b7a9a84cfe91c3e90d00000000�/]a6040502874279b7a9a84cfe91c3e90d00000000�/]a6040502874279b7a9a84cfe91c3e90d00000000�/]a6040502874279b7a9a84cfe91c3e90d00000000�/]a6040502874279b7a9a84cfe91c3e90d00000000�/]a6040502874279b7a9a84cfe91c3e90d00000000�/]a6040502874279b7a9a84cfe91c3e90d00000000�/]a6040502874279b7a9a84cfe91c3e90d00000000 �/]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000�/]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000�/]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000
�/]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000	�/]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000�/]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000�/]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000�/]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000�/]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000�/]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000�/]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000�/]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000�/]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000 �/]b1fa4d66bb99c1a8723596dfbe575b0200000000�/]b1fa4d66bb99c1a8723596dfbe575b0200000000�/]b1fa4d66bb99c1a8723596dfbe575b0200000000�/]b1fa4d66bb99c1a8723596dfbe575b0200000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000	�/]9a8de0e2605e5e5241aba8d197343c3000000000
�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9a8de0e2605e5e5241aba8d197343c3000000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000 �/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000	�/]9bf9fb5e7bc76c2549d279921f20d40700000000
�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000�/]9bf9fb5e7bc76c2549d279921f20d40700000000 �/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000 /]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000	�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000
�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000�/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000 �/]9c426ad51cd4b112ec4a071c2ad6ebfe00000000!�/]9ca8eca6eb20945356cf897d6514a22200000000 f/]9ca8eca6eb20945356cf897d6514a22200000000g/]9ca8eca6eb20945356cf897d6514a22200000000h/]9ca8eca6eb20945356cf897d6514a22200000000i/]9ca8eca6eb20945356cf897d6514a22200000000j/]9ca8eca6eb20945356cf897d6514a22200000000k/]9ca8eca6eb20945356cf897d6514a22200000000l/]9ca8eca6eb20945356cf897d6514a22200000000m/]9ca8eca6eb20945356cf897d6514a22200000000n/]9ca8eca6eb20945356cf897d6514a22200000000	o/]9ca8eca6eb20945356cf897d6514a22200000000
p/]9ca8eca6eb20945356cf897d6514a22200000000q/]9ca8eca6eb20945356cf897d6514a22200000000r/]9ca8eca6eb20945356cf897d6514a22200000000s/]9ca8eca6eb20945356cf897d6514a22200000000t/]9ca8eca6eb20945356cf897d6514a22200000000u/]9ca8eca6eb20945356cf897d6514a22200000000v/]9ca8eca6eb20945356cf897d6514a22200000000w/]9ca8eca6eb20945356cf897d6514a22200000000x/]9ca8eca6eb20945356cf897d6514a22200000000y/]9ca8eca6eb20945356cf897d6514a22200000000z/]9ca8eca6eb20945356cf897d6514a22200000000{/]9ca8eca6eb20945356cf897d6514a22200000000|/]9ca8eca6eb20945356cf897d6514a22200000000}/]9ca8eca6eb20945356cf897d6514a22200000000~/]9ca8eca6eb20945356cf897d6514a22200000000/]9ca8eca6eb20945356cf897d6514a22200000000�/]9ca8eca6eb20945356cf897d6514a22200000000�/]9ca8eca6eb20945356cf897d6514a22200000000�/]9d8b7a1746a5dcaaf4e5b794a4aba5b100000000 /]9d8b7a1746a5dcaaf4e5b794a4aba5b100000000/]9d8b7a1746a5dcaaf4e5b794a4aba5b100000000/]9d8b7a1746a5dcaaf4e5b794a4aba5b100000000/]9d8b7a1746a5dcaaf4e5b794a4aba5b100000000/]9d8b7a1746a5dcaaf4e5b794a4aba5b100000000/]9dce1c8f719e48949487b94b0514700600000000 E/]9dce1c8f719e48949487b94b0514700600000000D/]9dce1c8f719e48949487b94b0514700600000000F/]9dce1c8f719e48949487b94b0514700600000000G/]9dce1c8f719e48949487b94b0514700600000000H/]9dce1c8f719e48949487b94b0514700600000000I/]9dce1c8f719e48949487b94b0514700600000000J/]9dce1c8f719e48949487b94b0514700600000000K/]9dce1c8f719e48949487b94b0514700600000000L/]9dce1c8f719e48949487b94b0514700600000000	M/]9dce1c8f719e48949487b94b0514700600000000
N/]9dce1c8f719e48949487b94b0514700600000000O/]9dce1c8f719e48949487b94b0514700600000000P/]9dce1c8f719e48949487b94b0514700600000000Q/]9dce1c8f719e48949487b94b0514700600000000R/]9dce1c8f719e48949487b94b0514700600000000S/]9dce1c8f719e48949487b94b0514700600000000T/]9dce1c8f719e48949487b94b0514700600000000U/]9dce1c8f719e48949487b94b0514700600000000V/]9e0948e9b8df10216221ede5e581218800000000 �/]9e0948e9b8df10216221ede5e581218800000000�/]9e0948e9b8df10216221ede5e581218800000000�/]9e0948e9b8df10216221ede5e581218800000000�/]9e0948e9b8df10216221ede5e581218800000000�/]9e0948e9b8df10216221ede5e581218800000000�/]9e0948e9b8df10216221ede5e581218800000000�/]9e0948e9b8df10216221ede5e581218800000000�/]9e0948e9b8df10216221ede5e581218800000000�/]9e0948e9b8df10216221ede5e581218800000000	�/]9e0948e9b8df10216221ede5e581218800000000
�/]9efe7bedbc870b657286846a3f04cc7300000000 2/]9efe7bedbc870b657286846a3f04cc73000000003/]9efe7bedbc870b657286846a3f04cc73000000004/]9efe7bedbc870b657286846a3f04cc73000000005/]9efe7bedbc870b657286846a3f04cc73000000006/]9efe7bedbc870b657286846a3f04cc73000000007/]9efe7bedbc870b657286846a3f04cc73000000008/]9efe7bedbc870b657286846a3f04cc73000000009/]9efe7bedbc870b657286846a3f04cc7300000000:/]9efe7bedbc870b657286846a3f04cc7300000000	;/]9efe7bedbc870b657286846a3f04cc7300000000
</]9efe7bedbc870b657286846a3f04cc7300000000=/]9efe7bedbc870b657286846a3f04cc7300000000>/]9efe7bedbc870b657286846a3f04cc7300000000?/]9efe7bedbc870b657286846a3f04cc7300000000@/]9efe7bedbc870b657286846a3f04cc7300000000A/]9efe7bedbc870b657286846a3f04cc7300000000B/]9efe7bedbc870b657286846a3f04cc7300000000C/]9f8307bbdf059b78360adf48eb91c30f00000000 /]9f8307bbdf059b78360adf48eb91c30f00000000/]9f8307bbdf059b78360adf48eb91c30f00000000/]9f8307bbdf059b78360adf48eb91c30f00000000/]9f8307bbdf059b78360adf48eb91c30f00000000/]9f8307bbdf059b78360adf48eb91c30f00000000/]9f8307bbdf059b78360adf48eb91c30f00000000/]9f8307bbdf059b78360adf48eb91c30f00000000!/]9f8307bbdf059b78360adf48eb91c30f00000000 /]9f8307bbdf059b78360adf48eb91c30f00000000	"/]a246fb88d4a1da2e3d3bca940415904400000000 �/]a246fb88d4a1da2e3d3bca940415904400000000�/]a246fb88d4a1da2e3d3bca940415904400000000�/]a246fb88d4a1da2e3d3bca940415904400000000�/]a246fb88d4a1da2e3d3bca940415904400000000�/]a3144ae4d3b0cdb9b71eb6e654d5644c00000000  �/]a3144ae4d3b0cdb9b71eb6e654d5644c00000000 �/]a3144ae4d3b0cdb9b71eb6e654d5644c00000000 �/]a3144ae4d3b0cdb9b71eb6e654d5644c00000000 �/]a3144ae4d3b0cdb9b71eb6e654d5644c00000000 �/]a330a2b74af686522fa1a90b42e2185700000000  �/]a3ce86bc3e8ea0d7efb6e93117cec7c900000000  �/]a3ce86bc3e8ea0d7efb6e93117cec7c900000000 �/]a3ce86bc3e8ea0d7efb6e93117cec7c900000000 �/]a3ce86bc3e8ea0d7efb6e93117cec7c900000000 �/]a3ce86bc3e8ea0d7efb6e93117cec7c900000000 �/]a3ce86bc3e8ea0d7efb6e93117cec7c900000000 �/]a3ce86bc3e8ea0d7efb6e93117cec7c900000000 �/]a3ce86bc3e8ea0d7efb6e93117cec7c900000000 �/]a81d4c22b51d0651b1a1a6413d95be9500000000  �/]a81d4c22b51d0651b1a1a6413d95be9500000000 �/]a81d4c22b51d0651b1a1a6413d95be9500000000 �/]a81d4c22b51d0651b1a1a6413d95be9500000000 �/]a81d4c22b51d0651b1a1a6413d95be9500000000 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000  �/]a82d2576451c0eb78780f7f1e9c1b88e00000000 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000	 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000
 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000 �/]a82d2576451c0eb78780f7f1e9c1b88e00000000 �/]a91cc5434272e1671d042733c3a19f4700000000 y/]a91cc5434272e1671d042733c3a19f4700000000z/]a91cc5434272e1671d042733c3a19f4700000000{/]a91cc5434272e1671d042733c3a19f4700000000|/]a91cc5434272e1671d042733c3a19f4700000000}/]a91cc5434272e1671d042733c3a19f4700000000~/]a91cc5434272e1671d042733c3a19f4700000000/]a91cc5434272e1671d042733c3a19f4700000000�/]a92d3a292286b8ab0e37d5c84583180600000000 f/]a92d3a292286b8ab0e37d5c84583180600000000g/]a92d3a292286b8ab0e37d5c84583180600000000h/]a92d3a292286b8ab0e37d5c84583180600000000i/]a92d3a292286b8ab0e37d5c84583180600000000j/]a92d3a292286b8ab0e37d5c84583180600000000k/]a92d3a292286b8ab0e37d5c84583180600000000l/]a92d3a292286b8ab0e37d5c84583180600000000m/]a92d3a292286b8ab0e37d5c84583180600000000n/]a92d3a292286b8ab0e37d5c84583180600000000	o/]a92d3a292286b8ab0e37d5c84583180600000000
p/]a92d3a292286b8ab0e37d5c84583180600000000q/]a92d3a292286b8ab0e37d5c84583180600000000r/]a92d3a292286b8ab0e37d5c84583180600000000s/]a9310931a53380588cf72be5cb21e99500000000 ]/]a9310931a53380588cf72be5cb21e99500000000^/]a9310931a53380588cf72be5cb21e99500000000_/]a9310931a53380588cf72be5cb21e99500000000`/]a9310931a53380588cf72be5cb21e99500000000a/]a9310931a53380588cf72be5cb21e99500000000b/]a9310931a53380588cf72be5cb21e99500000000c/]a9310931a53380588cf72be5cb21e99500000000d/]a9310931a53380588cf72be5cb21e99500000000e/]a94cae4fa3b34c805c9ee17f25a60ba900000000 S/]a94cae4fa3b34c805c9ee17f25a60ba900000000T/]a94cae4fa3b34c805c9ee17f25a60ba900000000U/]a94cae4fa3b34c805c9ee17f25a60ba900000000V/]a94cae4fa3b34c805c9ee17f25a60ba900000000W/]a94cae4fa3b34c805c9ee17f25a60ba900000000X/]a94cae4fa3b34c805c9ee17f25a60ba900000000Y/]a94cae4fa3b34c805c9ee17f25a60ba900000000Z/]a94cae4fa3b34c805c9ee17f25a60ba900000000[/]a94cae4fa3b34c805c9ee17f25a60ba900000000	\/]a9b575c7c474f6130edd011ffea60f7700000000 I/]a9b575c7c474f6130edd011ffea60f7700000000J/]a9b575c7c474f6130edd011ffea60f7700000000K/]a9b575c7c474f6130edd011ffea60f7700000000L/]a9b575c7c474f6130edd011ffea60f7700000000M/]a9b575c7c474f6130edd011ffea60f7700000000N/]a9b575c7c474f6130edd011ffea60f7700000000O/]a9b575c7c474f6130edd011ffea60f7700000000P/]a9b575c7c474f6130edd011ffea60f7700000000Q/]a9b575c7c474f6130edd011ffea60f7700000000	R/]a5c21458e7b9c7037afb7abe3bf2713200000000/]a5c21458e7b9c7037afb7abe3bf2713200000000/]a57514eef7bb60d7742795a04287580600000000/]a5c21458e7b9c7037afb7abe3bf2713200000000/]a57514eef7bb60d7742795a04287580600000000
   0a57514eef7bb60d7742795a04287580600000000 	/]a57514eef7bb60d7742795a04287580600000000/]a57514eef7bb60d7742795a04287580600000000/]c5d788dacd289dfb7270a6e0ff67abed00000000�/]c5d788dacd289dfb7270a6e0ff67abed00000000�/]c5d788dacd289dfb7270a6e0ff67abed00000000 �/]c73b718688fc0fab90ba5d3530546eb800000000�/]c73b718688fc0fab90ba5d3530546eb800000000�/]c73b718688fc0fab90ba5d3530546eb800000000�/]c73b718688fc0fab90ba5d3530546eb800000000�/]c73b718688fc0fab90ba5d3530546eb800000000�/]c73b718688fc0fab90ba5d3530546eb800000000�/]c73b718688fc0fab90ba5d3530546eb800000000�/]c73b718688fc0fab90ba5d3530546eb800000000�/]c73b718688fc0fab90ba5d3530546eb800000000 �/]b7e5db408310ea00a46916f2bf55a5c300000000�/]b7e5db408310ea00a46916f2bf55a5c300000000�/]b7e5db408310ea00a46916f2bf55a5c300000000�/]b7e5db408310ea00a46916f2bf55a5c300000000�/]b7e5db408310ea00a46916f2bf55a5c300000000�/]b7e5db408310ea00a46916f2bf55a5c300000000 �/]c5d788dacd289dfb7270a6e0ff67abed00000000�/]c5d788dacd289dfb7270a6e0ff67abed00000000�/]c5d788dacd289dfb7270a6e0ff67abed00000000�/]c5d788dacd289dfb7270a6e0ff67abed00000000�/]c5d788dacd289dfb7270a6e0ff67abed00000000�/]ab38c55ead220e8c1e61aa6a536efd5700000000 /]ab38c55ead220e8c1e61aa6a536efd5700000000/]ab38c55ead220e8c1e61aa6a536efd5700000000/]ab38c55ead220e8c1e61aa6a536efd5700000000/]ab38c55ead220e8c1e61aa6a536efd5700000000/]ab38c55ead220e8c1e61aa6a536efd5700000000/]ab38c55ead220e8c1e61aa6a536efd5700000000/]ab38c55ead220e8c1e61aa6a536efd5700000000/]ab38c55ead220e8c1e61aa6a536efd5700000000/]ab38c55ead220e8c1e61aa6a536efd5700000000	 /]ab38c55ead220e8c1e61aa6a536efd5700000000
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
�/]b24f2f5612e5805bd47a3644493c6f3400000000	�/]b24f2f5612e5805bd47a3644493c6f3400000000�/]b24f2f5612e5805bd47a3644493c6f3400000000�/]b24f2f5612e5805bd47a3644493c6f3400000000�/]b24f2f5612e5805bd47a3644493c6f3400000000�/]b24f2f5612e5805bd47a3644493c6f3400000000�/]b24f2f5612e5805bd47a3644493c6f3400000000�/]b1fa4d66bb99c1a8723596dfbe575b0200000000�/]d73af698f5a������������������������������Ģ���������������������������������������Ģ���������������������������������������Ģ���������������������������������������Ģ���������������������������������������Ģ���������������������������������������Ģ���������������������������������������Ģ���������������������������������������Ģ���������������������������������������Ģ���������������������������������������Ģ�������������������������������������C#�� {v�yn~Bzm?mm�m�lUll�l�cac.c�c�b}b:bb�b�aVaa�a�`b`/`�`�g~gDgg�g�fPff�f�ele*e�e�dzdGdd�d�[S[[�[�ZoZ4Z�Z�Y{Y@YY�Y�X\XX�X�_i_6_�_�_�^B^^�^�]^]]�]�\j\7\�\�\�SCSS�S�R_R$R�R�QkQ0Q�Q�Q�PLP	P�P�WXW%W�W�VvV3V�V�V�UOUU�U�T[T T�T�KwK<K�K�K�JHJJ�J�IdI!I�I�HpH=H�H�H�OJOO�O�NfN#N�N�MrM?MM�M�LWLL�L�CoC5C�C�C�BMBB�B�AeA#A�A�@}@;@@�@�GSGG�G�FhF5F�F�F�EAEE�E�D]DD�D�;i;6;�;�;�:B::�:�9^99�9�8j878�8�8�?C??�?�>_>$>�>�=t=2=�=�=�<N<<�<�3Z3'3�3�2v232�2�2�1H11�1�0d0!0�0�7p7=7�7�7�6J66�6�5`5.5�5�4x4F44�4�P%P_P�P�QQJQ�Q�Q�R6RqR�R�S"S]S�S�TTHT�T�T�U4UoU�U�V VZV�V�WWEW�W�W�X0XkX�X�YYWY�Y�ZZCZ~Z�Z�[/[j[�[�\\V\�\�]]A]|]�]�^,^g^�^�__S_�_�``?`z`�`�a+afa�a�bbRb�b�cc>cyc�c�d*ded�d�eeQe�e�ff=fxf�f�g)gdg�g�hhMh�h�h�i7iri�i�j#j^j�j�kkJk�k�k�l6lql�l�m"m]m�m�nnIn�n�n�o5opo�o�p!p\p�p�qqGq�q�q�r3rnt�t�t�u1uku�u�vvWv�v�wwBw}w�w�x-xhx�x�yyTy�y�zz@z{z�{,{g{�{�||R|�|�}}>}y}�}�~*~e~�~�P���z�X��l1���E
��Y��m2���G��[ ��o4���I��]"��q6
�
�
�r�r�ssZs�t
tE
J
	�	�	^	#��r7���K��_%��t9�		��R           7�j]ca8�]b0da145b6c7c7169ee8045cedbeceb4800000000   ����i8�]b0da145b6c7c7169ee8045cedbeceb4800000000   �N}Z8�]b0da145b6c7c7169ee8045cedbeceb4800000000   �	*��8�]b0da145b6c7c7169ee8045cedbeceb4800000000    /8�#]a1d9801a409be17e6a78a6282a658a1b00000000   �5�bw8�"]a1d9801a409be17e6a78a6282a658a1b00000000   &�#+�8�!]a1d9801a409be17e6a78a6282a658a1b00000000    @	1X8� ]a3bb30b82efdc4ec488b297692c280de00000000��?�^t �7�]a3bb30b82efdc4ec488b297692c280de00000000   �>��A8�]a3bb30b82efdc4ec488b297692c280de00000000   Y�ֶ 8�]a3bb30b82efdc4ec488b297692c280de00000000   į�t38�]a3bb30b82efdc4ec488b297692c280de00000000   "���a8�]a3bb30b82efdc4ec488b297692c280de00000000   �By] �8�]a3bb30b82efdc4ec488b297692c280de00000000
   �*�c�8�]a3bb30b82efdc4ec488b297692c280de00000000	    4�:8�]a3bb30b82efdc4ec488b297692c280de00000000   �O)�8�]a3bb30b82efdc4ec488b297692c280de00000000   ���-8�]a3bb30b82efdc4ec488b297692c280de00000000   S�.�8�]a3bb30b82efdc4ec488b297692c280de00000000   S��`A8�]a3bb30b82efdc4ec488b297692c280de00000000   9՗=08�]a3bb30b82efdc4ec488b297692c280de00000000   �F�@8�]a3bb30b82efdc4ec488b297692c280de00000000   ����8�]a3bb30b82efdc4ec488b297692c280de00000000    .��8�]a3bb30b82efdc4ec488b297692c280de00000000   �޹|8�]a57514eef7bb60d7742795a04287580600000000��?� �8�]a57514eef7bb60d7742795a04287580600000000   ���F8�]a57514eef7bb60d7742795a04287580600000000   �9G68�]a5c21458e7b9c7037afb7abe3bf2713200000000   ��$i�8�]a5c21458e7b9c7037afb7abe3bf2713200000000   S��8�]a5c21458e7b9c7037afb7abe3bf2713200000000   ��|8�]a5c21458e7b9c7037afb7abe3bf2713200000000   �\Ds �8� ]a5c21458e7b9c7037afb7abe3bf2713200000000   �J,�}8�]a5c21458e7b9c7037afb7abe3bf2713200000000    ��j��8�~]a6040502874279b7a9a84cfe91c3e90d00000000   V��h�8�}]a6040502874279b7a9a84cfe91c3e90d00000000   ��{!^8�|]a6040502874279b7a9a84cfe91c3e90d00000000\��8�l8�{]a6040502874279b7a9a84cfe91c3e90d00000000	   B;@�8�z]a6040502874279b7a9a84cfe91c3e90d00000000   z�q�8�y]a6040502874279b7a9a84cfe91c3e90d00000000
   j|��8�x]a6040502874279b7a9a84cfe91c3e90d00000000   ���/N7�w]a6040502874279b7a9a84cfe91c3e90d00000000   ����F8�v]a6040502874279b7a9a84cfe91c3e90d00000000   Z��#8�u]a6040502874279b7a9a84cfe91c3e90d00000000   ���GK8�t]a6040502874279b7a9a84cfe91c3e90d00000000   _k���8�s]a6040502874279b7a9a84cfe91c3e90d00000000   �
��8�r]a6040502874279b7a9a84cfe91c3e90d00000000   ���8�q]a6040502874279b7a9a84cfe91c3e90d00000000    �M?z�8�p]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000�~�<D�K8�o]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000   lY�ou8�n]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000
   zN�8�m]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000	   OL@h8�l]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000   c���&8�k]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000   �Nl`7�j]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000   �9v8�i]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000   �"��)8�h]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000   G݁F�8�g]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000   �I���8�f]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000   I/k�e8�e]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000   ��A�8�d]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000    Α�m8�c]b1fa4d66bb99c1a8723596dfbe575b0200000000�Չp���8�b]b1fa4d66bb99c1a8723596dfbe575b0200000000   ��:e~8�a]b1fa4d66bb99c1a8723596dfbe575b0200000000   ���g�8�`]b1fa4d66bb99c1a8723596dfbe575b0200000000   �<�58�_]b1fa4d66bb99c1a8723596dfbe575b0200000000   �fΧu8�^]b1fa4d66bb99c1a8723596dfbe575b0200000000   ���w@8�]]b1fa4d66bb99c1a8723596dfbe575b0200000000   ?Ř2�8�\]b1fa4d66bb99c1a8723596dfbe575b0200000000    �E���8�[]b24f2f5612e5805bd47a3644493c6f3400000000��y���#8�Z]b24f2f5612e5805bd47a3644493c6f3400000000   ��SL8�Y]b24f2f5612e5805bd47a3644493c6f3400000000   cY��8�X]b24f2f5612e5805bd47a3644493c6f3400000000
   ���j8�W]b24f2f5612e5805bd47a3644493c6f3400000000	   �)L�8�V]b24f2f5612e5805bd47a3644493c6f3400000000   �P�!8�U]b24f2f5612e5805bd47a3644493c6f3400000000   F8��8�S]b24f2f5612e5805bd47a3644493c6f3400000000   ��U� 7�$]a1d9801a409be17e6a78a6282a658a1b00000000   u�C8�%]a1d9801a409be17e6a78a6282a658a1b00000000   �֨p7�]872bc3e6cf3d67f833351e2a3fb0aa3600000000    �6|�7�]872bc3e6cf3d67f833351e2a3fb0aa3600000000��u�,�8�]731c9324dc0d34a9d7a713072c13f16c00000000   �t
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
   �g���8�]5f378aa5eb6eea8f9e35149d749ecd2c00000000   ,MI��8�]5f378aa5eb6eea8f9e35149d749ecd2c00000000H&�1^�7�]7b4192573146a776655969957e2cc67500000000    �@[u8�]7b4192573146a776655969957e2cc67500000000   tU�k�8�]7b4192573146a776655969957e2cc67500000000   Pz���8�]7b4192573146a776655969957e2cc67500000000   ��CF8�]7b4192573146a776655969957e2cc67500000000   J�w��8�]7b4192573146a776655969957e2cc67500000000   =��8�]7b4192573146a776655969957e2cc67500000000   l0�8�]7b4192573146a776655969957e2cc67500000000   ��|!�8�]7b4192573146a776655969957e2cc67500000000   �z�p8�]7b4192573146a776655969957e2cc67500000000	�7����8�]a5c21458e7b9c7037afb7abe3bf2713200000000   ���N�8�]a5c21458e7b9c7037afb7abe3bf2713200000000   �����8�]a5c21458e7b9c7037afb7abe3bf2713200000000���4asZ8�]a57514eef7bb60d7742795a04287580600000000   �֮�i   :]a57514eef7bb60d7742795a04287580600000000    &�Ґt8�
]a57514eef7bb60d7742795a04287580600000000   ���8�]a57514eef7bb60d7742795a04287580600000000   �]$:8�]a57514eef7bb60d7742795a04287580600000000   \�Ǌ8� ]df57b989883c13740e744ee66a789d2200000000    �;�hV8�!]df57b989883c13740e744ee66a789d2200000000   ֻQ �8�"]df57b989883c13740e744ee66a789d2200000000   ��FT�7�#]df57b989883c13740e744ee66a789d2200000000   �Փ8�$]df57b989883c13740e744ee66a789d2200000000   ˙�;�8�%]df57b989883c13740e744ee66a789d2200000000   �5J�8�&]df57b989883c13740e744ee66a789d2200000000   =��8�']df57b989883c13740e744ee66a789d2200000000   �a��8�(]df57b989883c13740e744ee66a789d2200000000   R�vE8�)]df57b989883c13740e744ee66a789d2200000000	Gʐ�5T8�*]c73b718688fc0fab90ba5d3530546eb800000000    �?���7�+]c73b718688fc0fab90ba5d3530546eb800000000   �b�8�,]c73b718688fc0fab90ba5d3530546eb800000000   ww}��8�-]c73b718688fc0fab90ba5d3530546eb800000000   �\�8�.]c73b718688fc0fab90ba5d3530546eb800000000   B:r7�/]c73b718688fc0fab90ba5d3530546eb800000000   ��P8�0]c73b718688fc0fab90ba5d3530546eb800000000   ͳbh �8�1]c73b718688fc0fab90ba5d3530546eb800000000   =p� �8�2]c73b718688fc0fab90ba5d3530546eb800000000Z&3���8�3]c5d788dacd289dfb7270a6e0ff67abed00000000    ^����8�4]c5d788dacd289dfb7270a6e0ff67abed00000000   ���8�5]c5d788dacd289dfb7270a6e0ff67abed00000000   O���8�6]c5d788dacd289dfb7270a6e0ff67abed00000000   ë�B8�7]c5d788dacd289dfb7270a6e0ff67abed00000000   �@��8�8]c5d788dacd289dfb7270a6e0ff67abed00000000   ���58�9]c5d788dacd289dfb7270a6e0ff67abed00000000   �ّyq8�:]c5d788dacd289dfb7270a6e0ff67abed00000000)k��678�T]b24f2f5612e5805bd47a3644493c6f3400000000   �(���8�=]b7e5db408310ea00a46916f2bf55a5c300000000    ȟHO�8�>]b7e5db408310ea00a46916f2bf55a5c300000000   �+i�Y7�?]b7e5db408310ea00a46916f2bf55a5c300000000   M�~8x8�@]b7e5db408310ea00a46916f2bf55a5c300000000   .��+�8�A]b7e5db408310ea00a46916f2bf55a5c300000000   @����8�B]b7e5db408310ea00a46916f2bf55a5c300000000   qP]�8�C]b7e5db408310ea00a46916f2bf55a5c300000000   �[�:8�D]b7e5db408310ea00a46916f2bf55a5c300000000   ��}l�8�E]b7e5db408310ea00a46916f2bf55a5c300000000   I�V58�F]b7e5db408310ea00a46916f2bf55a5c300000000	�n��	8�G]b60494104aecdb448cf782ca98448e0d00000000    Ȧn�8�H]b60494104aecdb448cf782ca98448e0d00000000   c���/8�I]b60494104aecdb448cf782ca98448e0d00000000   �H�m8�J]b6049410OOOCLCIBCOOCKKKKKKKKK[{{�$~�C�0}&zxyMKOBOJKOOOCLCIBCOOCKKKKKKKKKx[{{�u2y�C�7}&zxyMKOBOJKOOOCLCIBCOOCKKKKKKKKK~[{{ւM}�L�6}&zxzMKOBOJKOOOCLCIBCOOCKKKKKKKKK}e�[�k�vC�5}&zxyIOINMJINCKNOLHMOOOBHMHOKKKKKKKK{[{{�C��C�4}&zxyIOINMJINCKNOLHMOOOBHMHOKKKKKKKKz[{{�	��|�L�+}&zxzIOINMJINCKNOLHMOOOBHMHOKKKKKKKKy[{{u@�ltC�*}&zxyIOINMJINCKNOLHMOOOBHMHOKKKKKKKK[{{`�w�zC�)}&zxyIOINMJINCKNOLHMOOOBHMHOKKKKKKKKx[{{JO�!�C#��   ����'�}j�є*�M���}Q՜jRC�U)��F&qp^�R���-���=\��������wD y/S5�� [oN��q3ckS�a%�jO?�f���+�O�!�
*�Nפ%Ubv��Y������s��Z���>@�R�
p�����M�xhD#_pj��ۂ����G�lш�����"�.b����H4�(K�� ��5��8�a*��ث�p���+߶[�����ꡭ���TޑM��V����3s��z���N��B��D��'������SH2Sّ�ID���������ocʓ�tO�s�����}hj�B�����x!��ϲT��ѻQ���@I�pp��8ҵ0��oɾ�}�BOt��VhWMl�`�v@>�8����t�s@����b?C��RJ@��f�Hi��@�W4����$��v�ZџQ|�*?gb��e$B�ٜ&�ӾJ�w�pd�K���o3.�!��Fb�Z��,$r�)�lR_�G ��F+_�LlW���b��އ�$���VQ�hm|����K���V��65ZÒ=���<\��?�]�ɲ��*�O�X�%
C ��m�$�F��O��3����H�9�y�E*M�5��箆o��BUmu 	������ʾ��83Fl$u�����e���>�E)�W��If�˼�#�OOVEhvu�yJ�x�����P`'ca�sr����������}�?�"�������X����IL$�x\��q�E����gu�WIպx1�C��f�����БٶH�d�Z(���2���w6R|R�=!N����=��>Y�<xC�z'�>�o�Яk���3λ��[AR{"J|��!��i��e��LM�/���ڏ���K:
��s��!"Q���`d�T^_�'��0�w���F%2��)�/6句�~�3���r^f�د�>H�mm�10ln�� ���xPQ�� ���q�v�ɡ�������|1A;��x�R|���Bb"fB��]�?�=˕���:�[FJbJ�> Lax����ӗ4����������]���-`��/ <�W�(��r�elwp��M����W:f��/Qcw=��P�r�Nܠ�`�N{�W��"B����� ��a��h����e^�Lzv`ҹ$Qa}7�)�VX�VlEȽ "
&0>>�Z��1q 4��W�VRM$���	�Z��o�FbO����ͨD�e`�{��J� /�^�M%ğ�!��|�8e'�zP���%�̹;=����X*�Sjo
����/�Y�gTO�ˍ}�,��Hl�т�U��"f�K&��I��(�M���k9�i�N�s	�C�)c��!ζ&:�C������i:�@�T�Gx�	���俐-���0)`%;o8$�I�*I#�s��Y��9�*�w	g�}�����Hѵi�F�?�^���^~AQ��I��RUG�m��^���a�A��f��G�c5����
N�J��)z�~(]����_�9%C�b\�q��撦�z�����ٶz�>�H��&	��樤�#����z�㌪�]������ Dw����޿N<�g�_��I���/d8�A˄7�����.����e�Xx�-��s+�E�ۈ1[V�:��������*��� �6bvA�p�/��"-���q7(tc��)V!�$�dm��x������nW��/���G�ܽ��@�Q9Ph�M���R��ĵ�*b/GUl����Q�QM6d,���Y�X7a�hj��!������ڋ7!�κ��\��b]k�t�\��x���z���|[�R.��W8n\#Sx -�b�Z�A����b�$�ht%:ΡY��M��է��K�q�ʐ,���N�=Ȅ9|�]v��uJ�\���ʖ!V�K����V>�m7
.w&�-Te&4nJms3��-~�q^��{�����Cu�9D|�x�b�j�ai�� ��K��u�N�g�D�Ү�K���$LR�V�<���n��/���e���`<Δ��x��e@tjlo��,����g�P�����\��X��O�4�41����멶&��� ������-���?1��8�My�S(^hدs+��5T�F�>Lu�ɕ�o6:��)b�/CX̘&S6�53���Ҙ����48}�0Ѥa���T10�-o<���W�.�#���hе�_�{���DJA1�E�s^c*��*������6�+'�>�u5ϕw�������tu;��4�8� E%��k&��/��M�ޡ��K�"+K�����`'�8S��uA�ߙĸ��؎�N4�ݹ]�X�W-�9��d!�`���; C\H4��V�Ƴ@��8)��{�Z�|٢%#�������Q Y
�m����,"�=K��}�ƴ2��}�:֟��V�7R��>h�xPZ:\(F��~E����A�	��#�g���n�a�!/P˃x�\�V��$�Df�@�E�Ȅ�|�k�Ȯ�c{~�z����I�l�޵@nV0��zd��E҄DB��z#E��-���Ĺ����"b�D�P���Nc]F��֜�r��e �X�թ�a�c�w��[��
3r�j�1��Wj�/`�ي���V��"V�Q�޺bZ�B4��r��D��x�C �W�c�� 3�� ]�E܎�~q�2#��#}�3��~����ӎ��c˺yaS�{��&6z�`(��.$��C4R���[�:^�,��n��_2R��a����Ķ�2����J�d1�������j*���[E
<"��4al�	7��qM�J^�Tdg�G)��
ڋ4��������2�l��"P�Q,��� i� }�zMt���6u��M���Z�ϱO���m�-\.e�o+��׹�/��2p~��qa�y�҅{�FA����r�����φB��}Nsg��S7����T���s��݁=��Gn����������gz~�^��9/.F`z��7�<�߼��= J "�����D� 9��˴��t�ҏ�nMCDAd{��1W��Y(��,��IW�(�w�Ul_�&U�o�u��rsڥE��km��ŧ:�jx���:�1ɐ>�&�<Z�6��]��7���h0x�9�X:�I��隔����f)�	bω�$hwB [�!�CV�טN�B��i��#�MY��쭔��٧��BG�uR�����1ܹ��	8t/�{m�bEۛ�[
�KC���>M_�y����uZ�R�}��f�fm��c�ڔݔ�cn��dJr�<��NТ� �ť/���3��U�a=۝ߓ�����n��$�#�+�Unt��=�+:�Y*]
}{ނ2���|���rƜ�qt�R�R��b������'�ζ�=�!�x�B(k����℁~V��8a!.�otB�\�P�[N_�ǫ{-/�9y�S�.�o���UǾ��d�U�(�D9��a��PO�_�a˦��3���=��-�d�`ᖄ�p�(%8��+�H�]�i�s�䷊j����=A5ǀ�g��u 6���ZG!��"v�3�ΕN��w6�A���SJG�%zzV�}ޛB�b1d9��jy��zO�b�TPu�F�L�-�tʶA������k|ȂXc�lO^����ݗ��w����++�5 9����A�/�Stt��_�\�۷�&��I�THjMv�=���P]5�t�+4�_�)�^��F�"�f�K0$arq!�6FVg�v�k����A͐�; !$T>��l�bBtO��R0��ڡ��ʇ��hfu�T#o��U0�`n�*�GY�ڇ����C�Q>�'��b���-���Z�����Tx�3�h��~���A<�m�{r���{e΄F�Q"P��R͏��Pэ����fOk�/�K�T��*�b9n����ܢ}9 ׄ����s<w���WߜNM��^~z����Ƒa������5��u�GlA�t�N�p�L�3@�Y���T����0��3�l�$02�����fQA�Y��?�vʯs�;-!��k�X\�B�Ckߧ��i1�'�x[T�1�P�s�GX�i�1�r!T���IŴ�.0�*b'�sOZ��'OT��ʺb�9^`袉U>�HEG,�k�x���ڧr�4;9G,��,�[�r���2�<T�D��^�?y�ɯ�Ε>�{x�v͹����g���@=4w$�m��^!�cb,�	tk�lӇ�:ֆ+>Z��?�.���I��tu�����%>
O���m�_	G�J�j4�j[%gyt&�u���)!�z�����Z�������7%�foR��@�p� �ܰ�E�~ь�Ni�1\�w�"�����z�'Mh���aS�7��*t� A�Qb�c�;��t��� (��A�+k��V����##t!8V)F{�E���(>|��Lzr��5~nt�o?����f)�Mj��^�6m :(B�@Ů���f���9��(`�������:�R*ɑ��=$fj�|0	��M��ٱIoE.�蚮� 0�Ȳ��\lg1�I�$\�G	�4&y>�b�4�-R vr֔�}ߠ�r������S㺪�u���[&ǵ��Y����ٶ_��w�H0��Z�؇Y���Ȉ���)�b�-j�,��]l�
��������gf��{שfQ�9��"7�u�_#EBo�r�|���q�3�5�8暖!�7	��-��q�s�D�bX8��
%�1�_"�|�J���7��u8���W�%$ުӥ�-\�jf�#n�I��w�Ԣ��U0�quc������7=�3 ���m�s�H����@�����q�׾�ñs�1!��&_�^�k�,O��J&zW{N�i��?9�Ƴ���ƫ��"\9)tB��{w[@8R1�QT�S�%1䓊@�J�����M���s���>r��ø��TY�A!��ݠ&��5
�
M�m�t.-�_lW4��2��
s7煳�?�uS4�{��������m۶tP��g�s��.��#�����	��-�כ^:u�[�jP�J�P �}'Ut��P��rDX�l�����#�}��KLf�-�0�5j���KW�+B���U	ȷE g܃��v�	5,��2��}#o>%#=A���v�Z�&Ǽ��k�e�BP
 a��ܔ��$�A5j]�R�@4s(8cs�jj^7���Cʒ	�]��1�ѷ���k~$�+@}x\DLҢ>y.h�H�_�(I��3����)!�'>�c수^~t8�����1��!�'|�1W3�?��
�^���5��L�55�υ��h�p@�nZ���d��ZO����S��_��7�y��j;`�W��o���8v�6jS���v'�}�1�l���ٛ��+x���+�U|s�̠��#�\�1��LR&�qQʏ\�_���<;�v����y�o�I(%�j�*~ܪ�h�,�h�*��:�]�8M�����*��j�KB���D	w�հ�"c��H�a>��r��O���v�,�D�I>�AeN��xq>��E6���16_+3������{��h��̈́��S���0iJ�[�n��(�7�d,3FRG"�D�����nO}��ߦ���I��é%�/�}�2 �.���A�۰$�${�w;����gks�(X��C��\Y�G��|=�>�<TF��R!�M�z�J�cl��gL��1V�S޸D$���1�2��ڨ�x<�����4���8͗N�۹�
�Z��.�����hR%�A��F�X���Rc��cʻu�ws�,pF>�u[6��j]��x$(>�hI�l3��y�F�25?�v,���}��Նsy��x��A]�[��	ix�Ѱמ����������bh������]�]T��B��S�����<�(�i�����6Y����#G�*�v��Xz�OF��.���>�b���.�W5_zހ����3����2U��1�d�8�F;ւ����r�V�1��@��{K�E��%=|yd֗�#���!`�ǜ��OQ��..瀆y� ���յ���a�+��Y6���|g �hę�MV�Pygk��h����I�ģa�w�\o�3
�������o�F�k.ŗ�*�c���Ĉ[��%?��{fPY\���dK�΁�K�k�M`m9t0���x���&2��;�>�}�Lp)�44c�����
����մ���*�xT�zH�c�ܺ,|�L��(oל���ԅ�����>�H:O�&��4��	Z��0!;xÍs�3��,�*�rj�`<!���&6��[g������F:�EX���� �" ���)������&�Ԋ1`kP"h�1�;��a�����'00���`�OD����a�D��?aK,��_Ko�2☍d�Ȅ�E�Ħv3��n������2%VI�ބ�򚠛2�p��zS� �vR����I���`�*э�x�R7�T7&Q<R[�oK<ӵsqKi9��| ]Yإ��G�,bG��<F�q��i�  ��E�Us�?%Έ��?c{����==hN=���K�%L�?µf��˰GO�X��|��Q��?$�7d<\C�:ރ5�ﾾD�>��z�^��Y_��u'gS����`ܰҫo/|�³ -�=�8�]*g���
!�3x�H�Nza:�Z&��9��0�5\Y�s��M]̓�� �{��)|�ƥ1�s#�ϊ��AsYPӗ�aޒ띂T(���է����K}���͢�핃�k��K`I�kR��8r	I�d_�U�h��&����ٟ����[��N_a�iŘJ;�X�����j��|Ueg��,�q����F@���+�����V���awy�A9K����{�����M�����V���ˬɴ��x�@H�Lz[��/��n U�]@R�1P5زȢؽ>bm鏸�d��`�CY�m�	 �����t�;���O�Z��w%&�^q׽���\�����	��,;�P�
7T�w3r�"����Y�	^W)1��%vcBk��b�*\|�nm������ݺ3T�ڽ��5۪J�rqGe�Z�!�!�l��2�oj�
(���]�MVj�{Y��c�Ko�+�	h��CD>2��jQ噒bns��8+��w�4kƻj���h�E�C�鳇���Ǖ��Y���&������­s3O�4������d���QwŪ ����gI�_�ߊ�G7|�*d�@	M�ն�����6C�z�jTc��y�V
�����$%�O0ñ6)�\w����ea߃h��B,[N�'�Q�T~�[
+>�(6�|�G��ګ#j!�Z�$b6K6�g� גv&Rx}T�1�R�1n�����=�qJVB�ˮ�4�VJ>�ՙ�#1��w'����%��(�w��84���AT�߽�E��e�,J�c�Y�*�3��1`x�(3j|#~Ͷ[
*}5L�1�x�l?'���7$3�d�jMF���q���
�ԃ��M��Y>�;X-��W&3l�QS[3���P�߶�6������I! u�YE����ه��m����ԕ�l�C;h	��{o�Rٌ��>i7#Q<�&̼�s�9ɯ��DJ`q�Ƙ�����ǽߋ������b&����U,�+�T������b�؝�W2iY��Pͣ���" U�������e%���MO>MK�evh��`K<A{��D���viM���%*~n��ɶܿ�����u1�/��S]6˓/�_`�JA�����b��H&��F�	g�J�M��������=�f\=�)cЁ�x��ń��I-?�T2:�do=JA��7�U�=)��q��K (F�	�Ĩ$HM�y1�ς	��Q���|O5+�0�!�R�A�QTi'/�G��ķ�� ���X���\�A���Ŭ։���_�C�Qp	�_(34�� ���֟�uA�A�`�=�u<ڠ���	�߆�M>�U�h���]��e�(0���d2P`k���}���E���p��];��~E�X��c��c(uO5���@��b�hw�`·`>���c	�w��v�H�C�@gj!]�-�m���)���.1��H�cͿ�_38AИ�IRf ~���ns�2��Ť�>W���]e�2��Gs�����Mr)@ʂ��J���}���L���*f����0��,Q7r-�_�]��kݙ'���F	�Y4, ]s���U�XV�YC�/�Z��!�,�PZ�a��B&X2��=���E��*��;D��4JO�[^�j缃g�Tr2|X:��r]v�0R|X���s��i��n`��hf^Ʒ�؊�K_��-�	.ފF�n��X�}-��c�T��Z徹�P۶�ht��UQ=��MQ�>��#}a����n��-
��R���%���C�j̦<��JqK���
�=(��4��9�[W�e��<ѵZ��������#�܇��[�ڇ��g��ٶI�[q%�4�6����;m�:��59��3�qƾ�D��w(��ƞ�UFy��FXPK�΄�G�ѱśߵ�SH|�ֽ2�'��I2ܘ��,��Y�c0؂jmZ����zjN!�����ڋ��y�Φ�����Q�g�o|;e��=,����QŲ&�Ŀ��32m�@�l�8y��E�1�i�W�A�n�6AޯkE�y��-p�q����pD�u�Y���� ���-,������g����rxUK�O��H��ff��\�3����y$�˶�/z��1�U���<��fF��kxԌL@6+k�L������ǖ�h4*����9$�@U{��NyB=�Е}�7�t2������R�xNmL+)�ˋ�_ϸϢ����~�,0g<�]��s-�?V�����xl��}��$@ֲV%`=b2����X5m��X��7�J����W�������9��e��,'��W�G3|�6���q��`Z���e�{K����8v��a��PL������0jV�bi������+�
�M�k�S妺y��~Dҝ9PO}`GͶ���(tL�F	�p���!���j��M��^<�C��?�D�����ArQ#Q���e�#��#&�*�G�F�ʂ�~�I����{k[��y��D͢M�j�~`��8Ӷ[�-�X�aF;aj?tϴ&��V(����ϵ"~���l��߫Ac��)j�,%�>0��e�w���iih�EFa�*ű3����OA��S�0�{q�8+��Z���_�Y�� ��T��S�0VLT]Pط���h���l��ڣ�y�v���O&�T�~ \U��:~�������K�͕��GBX�VE���:;�W%�v}�Р_B�?9��.�O5hk�~���o�nRw6��zr��l5�\�bd��R�A���W]|�����%�!u�7l8�:Y��U~V@_·A>'���5�g������b�!��[枊w�rCa֫ �m�ɄP�됰��n~��V�[�Z��)��)�d��g��ٽ�s�sł�n��a��hz�iX9�+w62�>������ݱhG! �ǿݲ@�mL�.�Y�a3��9_-�k�;Z�w(�C�(���ؼy�(eAe+n��|��u�-b��E!��J�h��g��D�x�.8Xb���T�>Ԟʱ"�_8iƀ[~F�(*~	?��x��N�^\�U���x�(�6���@��׸�*�L��1yĢ��S���Fa���xx7���a���]��1��Z�G�,l��G]e��������EZf�4�p�(����d�X��_/�}.���K���,K1J~��Z��s±�s��cz�����Z�m�f�j��Rs�̳T�Y!<ު+�UUufp�e1���䋋Y}	�p�$�� �]��F]�F�s�2�߼��<��;q�5D��|,W��L���s�<��0:�%;fI��a���~6�4q� �r΋��瑎E�Ua��$�Kn�},�q]��'c�v��T/n�q@��pe�8�~DY���(�m.FC���Ai��	�DR,*ׂ�T�Z�+� /�+�����ݩ�m�~�$_�p�|�A�Mډ^؅�j�+) ����7����V�WGw�{�Ne燡��]������M�ղ�w��M�"�p��Ԋ]OBX��P���6��I��οS ��ȕI�~vOЁI�q��}�˙+]�k�*��ϋʢ�?n;���s���uz&U���Jq����\5 mh�%{py	ef�-ϻk�f�P(Wer[��qaOt�k���x�O�z�����t�M�L�?2��ĩ[<�r�I��/��A@t4�U�d���z�̫�����v�$$@��U\�u� EH�Z)|��gm����^�db1��:*�u� i�!;���R<1ڨ�uѮQ�!~����7_��j��md`L��|�l��˺��Z]���=�Em
jq�0��>&}h�t�}�%N{�q�xPa|���r̿����E@��F(v��C�2���U2�B���P�1��Xk0�p��N#CZ�����]KfJ&F�tf��h���*y���R9�U��9��H�"�
�G�}��,��ur������ M��V������+����I�Vr�N�j�=��K/Tn�ӆ�=������(@��d�}2���{���ۅG���!��rў�s|g��ֺ��[L��Sebɕqe�a���d2��~�E9����6����0_����#p�b�t|��pB)�z���&��!>b<k7�V�m8Tu���@g�v7�={?��a_M4�7�+p�r�b�\LR{��.�S`{/���J����X,`��ع 2-s]TNc2a6�n>���ż����t9��%��|�,��Kjyhf#����f��y��P���g�eE2���m!�����.����PxMX0j� ��yfuEiF.S�/b#q���GP�6�cG������i�gP��_"��/���c�|�o7���sTy�kE��C51�K�1���kk�k�z|�t`�N�`�rQ�M����r?i[���g`6���3�̡�v��7+�+�U�K�ʻ��Cfo���J�I����	�p�C��TW*+4���Z�E��	0p/�Z�D.��l̿
e�������pK���+�G�S��?$U�_����kLP�6-�i-��S������t���	@+�~ ��:0����������V!☯Y^���1>rf��w�'V{48� �l�-�Q���Ԙ����we[|�����*d{��}��V�9 ˵�:����} �%�h��}t�m��#��q����ؼK�6���������G����W��Jw�� ��}ѭ�_=��M��в�t�B�fuh�I�������% ��|�5��7ֿ<�09��)�&S�� Q�2*��'�I^C���%�����Qeۍ��=[�1��;�`RAfmJ�It���b�r�f:ہ2vN�:d1-֦�§%	@\}��gV���.G�����(+{(������y�e��}����ercf  �ɦ<�������O����Kw���u�	�!2e<�d�Y�>���W}�/}U(����1��茴�g+����Un��%�J�w�t�ox#rH�[DZ���USM��N�;})� o��7$�&:?}��U�,;�7Gm�r�+��?�G��X��!Ij�R��}[��m@FE(��i�܀�_�̒Xl��5��ɲ0j7�ȥ�[<v3�)�_0Fʵ{�C��@~�Hj�࣋Z�Y�M�������Y��>�5�b�H�� ��R;.l)�?���^��IV ��%��~�S��{}��b��)��J�vW�����&�-���[1G�2�Y�~:x�w䤀H^$�qR�.�c��r>)
�6ᖃ]��PU�i惜	�'�Lp��(��ER�L��\��|z y��xRz'=��`�JO7㱊�*0���h3Oն�}.ܸ ����Ѡ1ÏE�3�m{�V�N��;���ݶ�eA�p���`H�6��*�s��e����6��h��
�;"�-h��tXn��(�	'<]��7#45n�d��6iUIb���ƕ=�xE���	���dAf�LO(���#�)�KzD��&�l&Y���8�}��w#l�l�f6�]ZYX��V���T'�Ai"�!�^o�ܑ>2�&�?q�j�':N�.�2������t[��Co#P��yd2һ6^<�W�RS�~�:�C6�Gh��z�~=��?����A�ݭ����$r�������
�����Q�9է�ު�����d��k���]�$x�6��_�4�R(�x@oUX���R��x�M��|x�`��rܣ����`x/�%��$���Ý���(b3�i�C�*#���V�fGY���i	({ ~q��N�E��lx��ǜ�Ɩ���@�?�4j*F:���t5>��	(���
U2;z�*%KC�ӳ�F��s�:���+KW��A�ң՚<�.�Y�
��u[f{V�?V�`B��	#hC�k#�n�+5�*�~5��B�0lDg%�xgypV�0�T.�Q�����~���	�����F^�	��l� ��56�A~��cBƖʺ� s���T�����9{<�&~u�3��Q�-F�Է��ش�)
B{|>�d �Yn3����r7��}I�k�)��Y�n�|����7�g�j�Ќ�m�7z�OMj+�`�'R�� �3��k�E����W�y�-[�����I0.�IF�#M�P���_�tP��vX<N�}�s7�Ÿ�c�j��>oF)�+�j�NP���=�yE�aE��_��ă�H��	�ȉd�d�TL:\����/[f���UL� r�?�e4�.�Ҟ��"�}���舺v���,��~|	�Y���i[��[~h�^.��b�ݖ�[�.��R1��W�0x��0@��vF��:ԛE�J�Z� �v%bE.9QS��%��Iќ�SN���\P1��'*te��A�|�\N�_��Ӳ�{<�JrF���_�F�b��P��lHnx��2��o�񷺩I�-�_u>7W'���w`�"WN��H���0������B��&���?q� ��y�Dy�h_};�g��a��$1��{͠���I\��9K_H�z�-ކ� 1���(�j��~��gsh�$���ҀGGh:�(l�3~�������7��\�x4&v8����bqD ��#�_kz|E������ �i�MG�w��~�)29��L�ء��T�	�Q��Ĺ�73��/4֮R��P-���Mx��K���}$1no��"����л?���5j��S2�N��v�/D��՛]E��V�aY�l�r$8%�~s���f{y�v����_�������.^�4���{��i�P��Bl��51YoBhL�Էp��.�o�\��ڲx������߂o�����I29� &�9w���L�ƈ�PlG��߫�L�Q�i��.P�h�!�h�^1jė�E2�dҧ��dk\�#$�De�{F�fE����s�����ʥ�������6^����(c���Vw��1�gA �����Ke���~��,A�{�O{/��������`$]��#��`� ��S&[���N�]���T]�~+X�ѧ���;$��_��<2����Ȭc�8�E���m��LZ3`���5f��j/D�r���H��Kd��������::����'L�&�pk�.�z�X$�ns�lİǔ���a�w�� gMr��z��R?��s?�n��Y1��*Ŵ��O�pE`?	�S(������E;#3Pk*��!��-�9�=B�3�v��+��^iJ=A�3�m6�n��������8M!ϛ'�G�Tr`U�`W9-ޞ��W��'w��=���|�otv�=c��YE@,��y|��޿&�5f48~�5U ���7/�9��I�:0��{��xPf�aH��q��$3}Tt��f�nL�i�q�3�� ����fr�vX�)�s�yZ�*�t�U���Xܙ����7�]�����k{����{�gYpy��|D����F)�����;	0<����V<�[$�tJ(S8 �?��;��O<`p�#1Ⱦ^L�O�*p^g�CJ�V�6��7�#�k��}ӴSR��:�Iخ=k8 �R��B���T���Z�ƌTB �9 p��I2�z��P�lY5%֦Be�V�މ?*�A�M->2M)��rb��<�B��k9t�f�l�+C[~����D�Y�IZ��!^.s'�E&,�0�F �y��%���ޏq��8�0�)ik��Om�9S��,F��G�w*� Jһa��쁤�՟��@�K),�ǄEj�H	���zCf�y)��J9�= �y%Q�n�2ڡ��s�kn�'�z����2W�98<�^�b��G:2wi��� ߳�_�e�koČJm����WzÛeU���u|GU�}[��K/��J�e���C���	�ʈ8��7��1�>_G�D7�*jqN���.$~6:��Py;��×pw�/]\���x��C�wC��+�Xמ�&��`Ǐ��ΰ1�Vv�wI�O>C�B�ÆA�䆑�>���ҁC���@�7�����c�7\�)��("c~3?bb��	֔^wA@zϾ:Ig^�8	,Y����7yF�'WU��3-��d�(Ҹ|쯗��ڽ܆�V}-�R:a{��BC��6�ꫨ�ߓ��+n�^\�����Y�Œ��>�}�O̟��(NO�򸷈���o��"�+8��b�ǎ�Sx�!���F��(��	O���dX�*��+PAp+e�l����l ��9w��;�)�r�OXY|�.�u��r��X�ۼ^o�W4&F���B�����3v��&2�~�a�Bl��Z����ĵ�'��rX���:�/��^h���o�4����s��D� �1�����i���5=_r�e"9P�X���";nO8�/@��ŎI�m�{�^���ô~ ��J����ؼXA��&[�f�[4V8m��ȼ��T�PA�F�@8��h�+9�m��.��h)�|W�im���b�qO��Ź�l@�.�]$�����ґ��cb����y���l������.""���:w ���M�J��� ly�̰	GӰ�i�vN�s�;Ry��&�^.w�;��Vu2�)�tǆ�j<�1_u¼o��JD��ڧh�}�~�.`s�%I�l��e��g1�	eL�_�1�@�k��Ll�9��x��zǋ���o�d���o�FեBH�/��訛����n���%arڛ٤gX�����Cn}y�.T{�J��c��+ME�{b�����jxA�%�����>l±��,����N&N��D%��e%���~&��B�Ȭm`͞e����@��s�l����{�a�U��R;(4cv��O�gA�~9�u݃��wȻ�|;�߀�)�MpJM�_8��)��Рw���{��,ɐho�j�5JI��K���G���������Q&�ZJ����6�e�Z#�#a
��;�9Ö�Y��s+󴥾���E��Rˍ_h(��%S�h����̸����}���k����`զ?�����:*��ѵ]V0�����Y|Î�^aR<o��p&�|�\�ݲ����0i�JZ\��p���m3��ޒ5I]̈UFMi<�P1v��:Q���W�Z�T7��Vun$���p�NC�L��wV�.!q8X��Rv�!�pUQ���8����6��`��������p� �0��G���Mr��ӄ_\�,N����z�T�Z[�\W��*=��_F}b�=_AX�S�,�#�w
����2T'l���P3�z9�\c�\�%�K����1`�f�^|iϯ/�Vy�Y�<V9B��؈<�1������^�[�����%�@Քῌg�"���T��b��V��������ng$L�T�j�|I,-��e21���6�C2/���/���|���� ��],��N�MJ���K ����������"��5�u��IF<�+��۬Wh8x�f(���@�6D�_&�@g�W�/��a���K��!}@��6,�&F�[�Q�����3�vc�ɪ��E�Ⳡ�ud��9R��o�&MC��Q��Ӎ���r�=�q�	h���y�� ��\r�WT�	Ҝ��! ��[c�x=f��	�-���]@������c�w��W��2I}X��q䄲3+�n!��^GMb<d����:��A���|����U�wFq�z'�9���p�N_�������J��� #=�<��4�!�J' u,��{<j~zm�q�*���X���TH��6�R�PI���hr�a�1�vodg�.�B}�K�����N1�n���=��i�sW	vJ��&��x���gpa�}�B^����͐JVڮA�c���hbr�WK���������u2A�%��ݝ�y=*�*� �M獪⌈tT-�{B����Ox+�MЏ���v�f�T��"���|�M
9<H����i[(O^L{`�������<-_�G:�`��@GG��wZ����{`w�e��-RCA��@�x�$V��	�逕W�(�#ӄZ[!J�jE��af>��H�0y���M·ʾ�}�e)�m�d(��!V,�g4\ȏ���|U�����
Bm%���B{a�tQx4�p��{2��ŒG�~\k^�
WNC�1M��]*��`���,���?�P�$��F,��M&��VV"�4S���K�9-��y�N��-Y���n1[���$	0yD�{EԨ})X�r�>�[!��r�]؀u�o�v�bT��CO��BG;��.� �s���s4O~��U1�2��CW`	�dؗ'���7�~B��V���R�y�e�ls"�8�������n���3��ܟ\f�%[�F�0%L8j;����
�|����N�����'j��6P�*�A���s8S�fM˶*h����UQ���Nψ]�_�,t�4��m�"1=S�	��
�jxS�B�M�s<Thq��,��Ӥ�M�&�l,G�a'�f]�N"�k��r=����	���bة��'��NW�9�F���-g�7�5ՈD^r�(w�鵶W��`��UX�D/m�'T	bH�8��!�]dG��X ��f��9���HA���W�R�oa���?�T�MƆ�И�á��}Q���尖�#��ƚw�e,Z�ff�cgI���͙l������s`��6�P'�H�:�?��ލ?
T�!��m�J���x�܁4��EV\��9gi"K�@aQ6�ae�,E��fb�@Z��o�16��nA�AY�&��6kU]���k�)z2�W��Ru_޽��>�KV�Y
l�q������.]���b����s=���m.DY��\W`��^#w8C����}Ѓ=����5q���E��i �H�厹��f��6�dE��=6 C�7�2ӑk�S{���0?�!�����1�?�%�̎��vm��i���[s��;����[N�����qR�~w���E=�:�ڋT�e����'������!<i����,�QjN��\��$c�*�X&4���JU���~S5Ꙏi��u�T6�l:�lA��iQ]��o�:oD<�b�G!����bxU�:�R�<���X��y�� �Zߏ �f6�Du�~��Z����}���!DŦĮ�*��zkM�	'�YMaX�h%�~����R��.�Y���H����Å����"D9ӊe/rW�|�m`Av_�O����ܶ�0Oۄ�2��*[:����]B����Ѐ�?ħU��w��/C>`
���d��ܑ[N��Zr࣍�M�]�S��*�W���G"��h�Y(8�m��M�JD�Q�|E���Q)Hm�������*��c��{��WwaR�mB:��;�M�_�]w�a��D�������1�s�;*ޚWF4�s~[K͋Q͝��l�o�.�h=��Pw��t/�����B�32㱓����d����A����s�����1c=�	
J�r��O�
[��|a�W$�ǿ�b+��ؼ8'F���y�{���x7'|:���'c8�5�x�O�/yv�s�եlg���crvD��pHJ�|h2`�H����/���|o�4r����fg8��B��/H�
���� 39G���$��ꛓ��(���v��������S`��$�Ǌ$m�Ê��+!��5.,o��S�p�J����&+W�H���u�܉�̻"N��+c1�Y@����cv�*`v�o���ePlY�AZv�.'ن���ҦQs��ʗ>�8u��o�_`��.��{f�b��T[2�0H1r�U��+�*l�eo!<�V��>vt�S�;��'y��|���.��Ҽ�]�j+�� �J��(� �\%�m	�"��E���������5��%�` $߽����.����3�u������ުWzrE���j�5uvϲ}j̵%��
�0����ʪ}�I�28<�:��Yoa@���[0,��=�P�v���L0�A�R-��#��R;�q�R� � �卍��~���^�
hU�5����h�W+�Z�|03s�E�A�Py�����������_�H1�̀c@@k�g�@)�j��$��	9#��Jݦ�)C���3wiZ.�ׂq�J^Y/�#VRIEe)S�zK2\4*V�w�4��ٵ]�g�-�ݻ����w�.}��?N�j�Iv�tA����hV�E�:��=�����텝�� �?��h�OA�ٖcrr�B���ъW�dnNc�(,�r4׀���7t`e)���iM"��s��qf!\�0�ڕC�+�Š5������������e𫛩�����(����C�0���L���QSw�I-~ފ�8����L�T�{���B���R��P�(�"�:tiO������y����ᆾS�k�z��P��m;�Ĕ�-�l���W�p]����Xv��rABc���&�v�y�����C��8�L��+��ÿv����� Ÿ+Vñ �/��Pvl/J hR_;��.���f�y7W��܇���
�D��>��0]j�!��
n����h&D�q1�8�S��m�)=e��O���~���+A��_��)���W����t�uv�)^>+�C��� h����_)��:��ۺ�ޕ�ȝQi��,����%=W��w�b�r�7�l�ͤv�
��dN_�B5���+̐ў*܃��,9]K�h��gMOy��J��cF�g4�BɡP`&���>��o�.��E��Q�Y.F���O�2�� ��S���֖�)G�����No���/L=��c5��Fv���>.q���Z�!j�h�o$3�A'ZIN2�u�l��hxR>ӑk�Rx��~������o6y�؞�RI����g�d/	��*��*f�p�~4�����@Ʒߢ�X�R]��7v4FN<Yl��~V8��L�k��'��X�<G��E]�m��%^�O�)��}v���gkGk��8X�W�-oI-�I�
�*��	ZN���Qm��?�,��Z!Ȋ�h��[,�h��tІc񂰔�XV'�`��;�Qv𮥺p���H��}1U�^C�����5�m`�i��� �~�����V�?r�xA���$���0�P�
R�q�h���/�J��x	��y�n�x�rO���'N{�J��#Jd�I(H|r��t��J���>p�A�������k4��a�N\���d�t��(Y�)9��f)38��wɔK�͡Ns�b�<$�n0�1�BIJ����G�r=c��I⡘P'<j��ɧ��%��k�lou��o���驔������0qk�wc5���X�9���a�������<3�h�]�pNT'h���,��,��\[e^��k�_ܶ�)��:�'�^}ޠm�X�&<VWz�:|.��N�sQߟ艱�煖m�Lޠ���:��B��-t�
�ǰ�<��T��V�����搒�z듀���Z�����j�yb#ȽW�*l$~�F���^��7��v�|�O��z�a�W�]y8�Z`ʵkI��c@(�����z��h�&3��]R�.��`�(|5K'��rN���e��Ii����2��X�3N�F�y��?�������*��ӷۇY�|~��+���F5����0��7�dm�Ǉ�&���q�a;.-֌3�um�2�Y-
*Õ���$휎	��|^��X�.T�E�����"���v�`)ƈ��(3�t��z�ť�w�B-ې<�Y&o[�L��P��̌M��&N�.rrSxB���3ek�2 �0�\�r���n���<;��o���i�k�p/����(�Y�$����ܘL�L�OE�Q �vfn6K3�ΡȎC.�ߜ�h�%�8!5/���K��?2Fm%���q���`e�e�tqӄN7s���^��,Y�1�{}'�5TJ��n:�Ĭ)ֶ��QQ��|!����k��i�0p�"Z�Nԯ�o2���sDd�v[�cJy!�����\w�B�88}�vD�T\��V�|Y��B�wUc��|Ŭ��N$,����^ɧ�����e�����䜈r�|�Fw�b��8��\bE�ڷ�6��C)X�i/��������-�U�����vS�,���2��Vk�	'��H�БdY��2��1�$=gú�����$��� *�$�8�4.,w
�똄~~��a0$����mM�HVaO;��T�
�w1u�)����)�;2%#Y-<�it�')t�����/3ţ|W6�������{�QU��1�F��
�n9�*����.k�J��-���lh� ���ޛ�<[�s���C��}������0�jl+�x�ܕ��hd�m�#���Nh��_�Fd��^�F�djq?2�/�	���������6�&��W�DВ�B���"���p|0�����n��nE�B-����ܔu������p�WG�� &Յn	��ر5/�ѽMU��:��O�[����<�Jۭ����Z�MK���c/�*�C'�����*jc��,U�gC�t�*��� ���������a��œ�2J�K��$E[�`s��&�6����б�`�3�U��=6�����R�zZT���q�E,�!j}UL�����$ϪI�D��iM�FM����z�Z�XQ���ꯡ�@���ی�N�ʩ:��wB7���6��y�rEY_^��!��ڰV*J*�t�Ad���K,D���a��w��x�U��%i��BIO\̔��phY�8;>ajO��I\I��hu3,;�^Ι����|.p�q3�%�2�ĐC��{�Ky �%Fù��'��~h=�[����.�C�:B׼�����0�5 U�i���C������'s貈�4���Cy��n� �k�xM����Cl0׌\���`��O�2��^�����?%��ďg?�%�qb0J��3��~���¾^e'�åH5Y8g�1�	�
��TB�"�<�I:`�7A�H�7��*�"��$p(M�U�x,�x��Ǝ>��xW�������^�U�3~p��'���贆�̙V���Kr��;9B��)�f
F�ύ���U�&ZG!:�v]2�����j8����B�X����Y�s�2"�Wߺ�Üh�^pD{��P��fy�Z���n"%ħ{C�Nu2�������k��1��vg����q�Hw��$9lK�]+!L��8�U��a'7��Y랓���DIz^Zj��%ѱ� �(98��Nɽ���F2F�У�d�t�${򏫉��<��u_9�eK��2U�@��G��A� H�U.Cr�"��Ť�������e��8�UB�|�11(�]�&$e�!v�MJR$=$g`����{�@W��k�[�jn[��s��{�*x�nW�[)�R*!5���&��E%"�NJ�P�zÖ�D��+�o����7GϺ��q0,i�g�ʖS*.;~����ѭ����������L�@��_y,�ܹ���&.{�v'������i��ɨ�h�rr�hg1��q���$�d=�K�y�6��.T'���ޯ�t}#f��>
d[�ǕW�~&�R^:�69�iI熽ɑ�=2�����;�n����x�P[|M�3П�|{gJ�Z�#�B#��J�1��qi�-ҞE!H�6�/�d�M@<J-�+�� ��]�$g��rW(ydd��A�O�jȉ
D���2���,�!�W�Y��(��`{�fz��┍>X�=���v.8R���V�6|�+�0�4��o{ �Pq�a��L����D5e���f�	
����х�vA@``�K8��Pǒ`2��qjH�:h��L������pqJ�[��H8�Ji�a�d�iq�N`���TԒ��'H��U$a��-�Q@:"�9z,���|��*Q~��W���4������7
�⊠*�a�Ԁ�[���d!u�"B�K���������9�p��zoD�a�kSmƉ>�Eo��?e^Vg*�.2!)0j��L��ݪ�r<9�@O�s��<p6ؚP�@H��rhN ��mP;��_�7$^����`�6AOS43�ȡ�������}}8.�U��SOp�x\YE�;��Cu\W�fș�f�SV�EԨY�8?��k�v�<� "�L!c\���ô�hiL�!w�xd/Ui�=8�K#m�:t�M�0�j�?7��9|�.�DĂ��q���H0>�I��P�rI�-�f�[,ꉊ�����ioug��%9��3��d|�%D4M����kI��n H��'�/s5���#�(sMWE��.4)����6YM�w�CX�f��d/o��P��sTF�����CiSc�je6�NΩ���p\4�4�M﮻� |+V�=�CJ e���`&�ɗ:C.~7�8��v�Q��2�]%T��J�"4�V%Hm��E��6#>�=�Kh�*���8m{?A-]�6���!
w/�5|q.�=hF�oim15"�1��]�'�
�G.�%SN4�[P���n3��A��
��U��R�;��PaP�m*Sln���X���^�w
Q��ǨѫQP���i���\�C[�������R&���-������I����F�~�
��9T��n� �V�(�}�z��{Wjr:ǅ��W�V��$��滷a,U�|�<���2Z���bwV��.�I��b�E�@�m����^вrwBGެJ��MT-{��k�/�;X���<[]��?�,Q�"���L<9��T� 6M/�襣§��2���z��5tUDPV�*��(},_��Ff伾@�_�N�~hR:+�"�u�W���17�$"��v��q������=��?����Ժ�Q�`���;tn�lP��$�+��h�y|�w-gI��<���4�pwK�{:p&��q���y*�,�
4�f�EK��ǹ�w1a�c>��i��M)m�Of1_��\�2K�>NhT������̨���VP�@�g�Yn��9��y���qаɠa��Y��P�ΡZ���!�ܒl��}�8N��	��%vA��;�6Ǝ�u�9�
�N���v��A�kӔ������d�^�<ϭamBտ	p��A"��q*@r�-ӿ:��)����65gh@�xE�L�Yec��&Y�������l�ߝ ���O�L&:���X��絠s����6ԏ����	����~��y��m{��.�hT,���PV�]u���ejV0��x�K8�P�»��������$ef~;�4���">�_�I��Z�c�ߥu��?ת�B�	�Cs�=T���E�w�,�̭|��8č(�C|{����W���i����̅�l�'~��n���xP;�~��S���&�{��K�����a'�l;o��4��]%/f�N�Icg��ʳ��
W�ŋ�~Mk�!�����b�]�&��.����hL�I����.d0���F�r�����vz����W4�JחmXyvV{�5���ywD7��FB��~!UH���U"s��@ �|,S�g�»�-�Y�9�A�u�ϡ�<�8�hf�)�����n����&�.a9a��F)[��H�����Ny縃n���W	�]����="(��"����?��D�xЄ�s��j!.?�;��1��OK)<��GՈ���;��2��=	��9 1K��/�s!?�<���������Fm�h�aPO��*�j������0�!PF\$��-&'��7\+6�������,Y���Mhn!�oTA5�����pF�dO�c#�#@�a ��1��7���M����`������p��:E�r�Z�[y<�!� �U����Y�-�*��w�O�û�k@�3�s)��G9��ֻ��|y�nS44�>��'��C!<z��4���Gl[ɵ�ăU�F"��i(�.>K|g����vuE����<�\��Dc!����>��'s�c`)&F}�-��������\"������y��:tpc�������*�@PG�C��K=t|�[u�(G�z]e�
�P
�Xֆ��s��S30Aٴ��VZ�%~A�"}h���/!c�v�=�)��c�����1i��TĆ=[[�Y�J�t!;�����\����_��q|[�U.{W�B}Ɛ����]i!�c���1l��n�:�X	7/y��XY�o��������������n�;}�p�L.>?�%6�д��^�}sT�s��yBr��j��O��͵���X���JW����bRD�M�XZfat ����
f$���)�d#�r�B��s�!��%׫z�y�(z3�����4��ٰ;>S�Gҭ���1���%w��;8�@�{�� ��k�e�߾�����F��F��_�p�Y�s#�"9�Q�^�_�CA�b��Y>];s�T1v��q���O�m�Ik�z�z(WPb��W)H
O�@5eO�=�q�PA��Fʭ���S"w�.N�h�[�=Pz­�N�����ue�n�q	`z�v�F�Q�l�a/$
��}wFa'��Q�4ک��D[�s���W�b$s��)C�f"�U�EK����'Ҧ2��D�q�s�ʗ��cf'���ECD�f��ic�L͑8�g�׭��Yx��}�1�"d��،�.�_����'��,A[�k�%��{ىX<#-r�JN�}7�H�p�/F�M\�q�L7<\��G�H��~�fx��a	J�b��k���_�Ur�~�u�İ�Rb�R���^ ʚ�ހ�D�l�R̹I�ƨO��yz�.1��sv���D� [�ԟ!����(r
�&���=n�����5��Bo� ���fD���mO�XD};�+��gT�7�~5�.�������#����JO�A�z7�&���?�ώ0(����Z��ۨ���+��	e�c�M��*��%��ϝ����a��7�$���f\�J��3ф�:O�҈vk��;�Й�C�*E�g��P2�.jn��Nb������
�!ԍ����]#]]��:̗F����"��Qؗ�	�Ђ��S�7/�0$O$�w0��� s9M�i�����4����5���S�D��ُ
ձ�hѥ�)׸/�`1�6��(;��l��I/�'���y����p��=-�����C����d6�����g�'Kf�_���5~Mƣ�Ԁ쿩����cb_v'F����������Ga�:��~���@�Z�!Zv�,�i�j�x�EM�Ҩ�}�$���'��������F�����_�GL����5����� ���xJ[�u����U��B�#) �;0�ƾΝP����2���}f�!F�Z]>���^�w���W>m��y�����2��5���A{�s-�U,5�����᝗N:��:��n9���91M�;��zj�)Arm뙱wФ�;!�LV��,� ������%�9;Hc��p�#���x`�uf2�]��Q�v׷q;Z��2�(_��O�G��Œ��d������I`\��Y�_�� h��"^�A̅�u���J�0t���f7�֐���_���0�#�CDZHPKy@x�x��f!��'h� �������7�vI��m>�;)7W�W̑%],dq���4+�n�
)?&��f�O�d'8�2&�T��P��!�&E�B-3g�GV�;5s��`l[~L�\�bb�9{��;�=:=�\�n��.�\���a��e\���Uz�����_}���^��"��RO�Y���ZPr�Y(��?�I9�X9s"k�o3����y�RE��{��m����M+��ڏ��g���|�@���p�j",�h�����9T<F��I��	<����+Bv��:�@JhD��?{���0� r���l�I'X�GȒP��Θ!��yEpA�,��%����U���t-�Mu�vg\�B��df��YR
�R�a%��Ӗ
0�N�>��/!�L�ˋ���U
��>rM���gv�����f:Z��(���rW@�=��?Lɏ���H|3�L�ѓ"ٞ�>��5���a\�������C���^Î��U�z#�4g��c��.��JLfT|t�����r�KvHs|�4�[�Ƶ���]�]���$s	���gz�h�5o�J���ϚU�����;��Z9��:��*A@v>����lS�f�k�
V�D�#��ƺ�g'�$j4+ׯ��l�8�C(k�sj�Z��6V5cUR�R���Aq_�G�t�i7 v�Mt�Fɜ
�
�B��Xŕ~��`�������C=�f6I�Kf��\h�è	����ha9ո��l?M'�����~8�M�L�Wj��-��J�N?����8$��)A��� ��68�ʖ ��{I�_8���dFsfL���f�4^�P+o_̭C�������<dϠ���N�z(�&*W�9$�I/�� ыx�t*T�ﯸgvkd��܄ꂧ�ݳR[F���t��	/�E���H�V`H�e��,�a��S&1�7��o1d���a/���n�oبM+E�(�F���7a�Z�CM�6�n�2�)�mX4�躛�J=��C���X_����CH/�`�7��Ǉ.3���|#1�W KɇY.��_�5��.�PhOY�+���bT�K�ֱZ�P��rUS��t��d�P�9�LH�׷��V]�D�n�T�*���(�+TLQ��#���ǒ�&U5
�z%jf���8��%�}u�o� g5���&���{���_*�f�)S!;DE%z_�?�0�)�����Q�y}Fz|_W���DQI�4M�]~p�x�y�Q���8w;P��������M�4X�Y��mul��IDc�6�N%�FV]*���"e�BB��xn~h ��e0 �*c����i���Lђn9�aJ��m��S�aS�����.W���.�G��̨X�[�G80�Tk(���U���Pe�� �;��T�w\vQ�~��-y��2�>wx�IiXW�w�Ki���w0�b�{�B2-r��d�C��9ao����J�WhO����ʉ�����������˷������?ʓH�ך����v���3`f�X�n�_���ɦ�t�t-T�5��\Xh�x�Q�A&-E������NS�ߟݢ��^Pጨ�r�qv�f� J���	7q�c�=���Ѱu@�&��i�q�A���]�
NM����0q�H`}����E���[:��?ݶ)���!���?����kΈ�~�k���a�P髵#p�'lL1��ϻ<��0��G��xTtl;���Z���u��T%���@#��-/�?l,ǈ��#��|=7���m�������U}��j�M,��˨���^�6�l5��ذz���ܩ_0�������M�ޕubc;.��b\�� ��C�P)�6\���=mX��Oկ��"tcp�_>�LYd��ۭF��ʸdq�GK^;��:�i���ڪ<X����U��5�e��>�#s�����8g����=奋"]d�n��0��[�͡K�E��&B�OP(A:d��J[����2cctQ��W�K��#���ۡ��Q]$s":�%�J�d�m���V|6J[���dJ>�-�h5 S���"+�Q
L�C^U�G=�s�o^cSx��	�c�$ۿ��yL�Dv�Ն |r�AT�a�Y��]�����.����*TU;�/G���Xl�{g�/�ÏQSjɇᲀa�w��fc3E�O���a�b����x���Ԟ?c)F��A��I�mnQ�m�2����xS����0��T:��>��D]Ti>��$9�F+�s�L�^/�;'�T �
�U6ا����{�ghR"KR'/ G{�ẻsb���TP��{�����g�hz�FL�t��^�MSsz���G2�^Foh����(���a�+�A|�G"�h_�P��X{�r��]sK�j? {��߂�c�ϺmOn}�\���E>��%���`�1�J�M��~DѮ�
�8�?_jЫ<Q�F%O�t��q*�ږ� �L��W�}O5�<2��!v��n� ��dl[�|!�73 h$#�tab(��)ܒOK���R����k��\�v���k�&fs!Rؑ|E��Ǔ��~(�A$~�S���U�N��pʅ��
��ӗ\��Ё��4�P��3<�J��d~�|k{_�M�}��~�V� Ͽ�]Բ�t��}��^5���B3>�'
{�����yL�Xan��S�ܶ�qߪ���(�I[XB$
i>�v���9�L��I�~79ig ��w'�������a0����}�x�D�LI�ɗXth���-������:�f�����!�>������6�ma�3)��yg��C����j;bUf�HN�����K�.�p�xi�&Vv�V-�M�{ݣ�xT��_H2�K@�	�N�w����?g��j��EʉT�<y; p�*��G�7�EMd���Om@p7��j�.1%�c�o"��Z�i$R����r`�8uNN���Z�^�	D��R/w�c���
c{�	Fze��hP��P��yb�av�W�AO#��og��!h�=�)WY�e��v�'��t���'`�\$�;T�Y�d�c��yp���;�)Y�Y��S�bO��^PI<����1��N�Q�J��+	J��4eQ� �}�D;���>G���~)�����F�Io�L,���o�or�rV)눓޷ۣ��6��AT�0VGM��"0���SM����zځ	9<���
��+���DZ�F_)��֦F�{Z��1 6����D��rs��9���V7�E�[c͸u��ýx^�pe	h�9��&I���!p�Ϳ���$eD��j���C�����-VK����R�Ԋ�w��;P�
y�QK��������X������Sr��3Ē�4�1c"�(p�X5��Ni���vI�����|�Mx>g>FA���u ݤk�n��/V�㐫������k��*�T%�.��Y�� �m����0�&���g�x��MA�y`eT*O���0�`�4�H/�����~k+3 �3d��B�~��`[J�k�*/(_"���
2hk�nAK@H�N�7G�괳��|��]���ON�:n|� Zǆ |��+��I*|��OSD$i�Y���Y�F2?ׄ��d���G��UvΙ�\[
U4�>�|��V�iPmhv]XtZ54҂ҩ!�.�pŞLÈ�\���+W�߮�`9E!�w�uG��m���y9a �_��e���RPf��ZmD��M\{K*o��I1�$�kY��G�����
��8�����T*����݂~�o�"�A���1 ���d�������/�>�����A~�>�2���A�\�M,�����PO�[�]�ռ2�g������c}5A�Ճ�LV�Z�G�5"Ĥ�lٝ����wG��
]t���,�m4;�}���j����g��~��F��I�?��n��2A~cP�6�z�uU�5I|f׏�8��\]��4���=ke�>m�!��%�%陆����� !�ei�&����(��/uoC��Z毴=�!w�-�m�>@���G����km����3�7��a��^���<ܵ�L�3}�o�����
|_5L�^	؟��3Wȯo8ۙt�!�� �`����@���/A�q�u|�.�Ł��j�٦���`���^`��X���{a\��k���*���$tf�m���]���W��lU�堒K�G�9{��rW�����SA���s"
x���W4�\Op�S�9gU�r0!2�������S�uꐤʆ�#b���)+���V$<��b��Z�o�K����I������ߘqx��oj����o�XC�b5�n��[%{s�w���:��[G �٫�9�M��R�71����5g�0���a�'��rD�n����ڸ����aPeɧW�y�QL��Ł���
��H����Yķ�IU���c�y�6Ru�#�O>TĎ����y��R���F��b`�Dޣo!i�7R���H}q*�F<:����݀&�u�߿����	>�d�8�e�ז4y:8�N�v�K7¬s�ܿ�I�������+��&\IO��}�S�.��Y�Mށ�ٺ �"yo:j��|C���"�hug�(�k�}�s!z����(,;?�OIe�q��B���m�y�Cד�h��T��+׼�m+Ǳ[��6���M�PP�*L��5mɚ����R<�����L��ѳ�ia��Ny^�G-����]C�����]T઎�F8;6GL�-#�޼@����i��e,��N�O>�$%����r�f�#�s��\o	��];ڝ��Ej,S��uYJ���s0k��^�ܑ���b����$�!����Sy��ݯk������ma�N˗���o����l�qw�`~-=�c"�Fy>�Ȟ�2����b7�	�="#��jɅ	�gh3|ň2�Mmw"}��V��|���vh+Nf^aO,�V �ڇ��C;J)NB�,w/�`�2Q�/s�K����I-�����v���G�O�(F�q�����O^�dǱ��b��Qm�j��X�B��zFy!9�ݰy�=� �,�ip��Cw0qL;�0��|��"��gЁ��9yZZw;�����t.Dt�����+�� �������g�$�t��/�
�[hKP���Ώ�}�>��g?B;�Z|��P��y�fQ� r�Jn&&��ob��bR�y�As\�M	oM�ވSG�xIh��O
61p"�1�kT�a;�94>��/r/ �t��s>v�b�4$6�oWPd0��<�~��+0���@e�il�6�4��A�n�gVs3�Q���{Q"t�1�[��|D <�ց���A-\؎��������& �a?F'��*�{q#Y���~!���<���lC�PW
�02Q���n������;̻Y��!���q�p�[@u�x���S]9���Fb)ޯ�["3^�p��<�u��2	��a/q "+p��&AX
<_I�!�;b��q�w��+l���!ݜ���zih/����tx�1��n��8�mъ=z+�xU�-t63`�?׷�9p�B��JJ�7�ś'/4Ț��C��F��VLȻ�f�m��w��tS�o���O���
V�W���j�ѷ����O��ꑦO��FMQ��Q�U�L|���Z�O��mpV�`�x`ю7d��d%)�Ƃp)X���>�*W^����8��������Tf
��1e�3�� s`i1�h��Z)8�q�m[T��=�W��X�������@��r�)Z-0��9-���F�����P`'����88ף�[A`����3ѣ~^��d�m�&��?1��_�������z�=D�L��㘢��]xgK��za_ �!���^�����X�NrA��Ll�W>�Z|��sh�
	=�� z�s{�Cȯː&���D��o^?��@@� �v�͋m�,'�<���P�c{��r&:���p�G�>8pi�/��U��Mx:�O@��Y�0+be���-L��k���E$:�*�Y�rU���ֲ!�r�SAIR�[�m[^����u%����N{;5��:o�k~xTrU�9��MƟ���u���s�{r��y��	Y�԰�PE�guJaS�NQ �T��ki�|J>�{���������wE���:�GC��s��$�UA�ul����tN�~t8\�ԩ���8&�3z��a�'�K�}B�:��X9��ZPjݏ:Յ�'�%�xv��q�x��Io�Kex�qc�ځa"���
��-6k=߆�I4�L�ˊU�'`§�4fa���R��p�뺵 Lvď1*��m�'|��*ڝ�n�0��,�A�y�����#�$x� b����ٯ�
'��O@��{�1�/6����)T��Ξb��8�Ò�)%�d|@�3��v���c��Y��B
��;T�Y8��n����_[��\���z>�f%}W���O�Q�zA�87N/1�Z�AYz���9��i	C����S�_���ց!�54���:�0�,KK�>fF�!93��9�z@2���brY�#b�`�ݷ)(Q���v�eD�/Ո�>T�?Z�n��E-��F��Cn�*3��6L&g��1͇O�x�4�Q=qT�-^�ޞ�x��$���x���D���z6���z���$Y@6��̦S�D�Ͳ�z��K+ I��1���H~A�����.IQڃ�����+}��㵭�'���\�\j�a�B0�A'�a���wk^*Fg���h��X�MK�f�g�K}����(�}S�I��o� -X���#F��8�y@�G��bHI��Y��s۶>�����5�H�A�� G�b��4hϷ�:0XҦK�~ #`��dİ�W�痳	/F'�.�ET�%��(�)�Vhzi�gT��V {��5�E���%i9x�$d!�|�5.D�����q�����!�U?��F3j��\f)K�����7qʗ`�'�<�PѺ��ނVӠ�<*	fo��-�9�\A��	��5rN��B@�kjA�O=�.����\O������1˞���F�M87fT;)"���-��n�WCDH��ٴw��bA�l�/� d�y���ԣ*�O��-VԵ�ᛐ��u|�Fb�o�]�xZ�طT{&Q.�Z������|b��8��^�!��.{`��� M��jӻ��f6zm-g������+��1��5"	+�+��+p�@�?Z�KQ��|�u�Ԇiܕ�W8F��.���(p6�,�^�
_�J�Jb�
�5���$s���LV��e����K�[��Q�;A����U-��z�����v��N���B�h�-c�s�RD�/ftу=����$dt љ�a��E'�����r�?��@�Þ&.[, �����Ŧ�[f$����.���0A(C~���m�uj�k��$����Ņ$:c
��hx������gyQ�+��B(���n&իA�hzͬLmE�6&S�ɿ4`Q`.���dfF��R��I�
Q��s�}�,KL�,��6�{�F*}zs�i6���ڳ����j{�6$��,�<R�f��$�#qDF�i����mG��\�O|������jnvʎUOHhv05����m���:�_��X�'2������F/������7��/X&�%��R��Pi��\���ZG�A�+h:Izn���Bd��6�U�������\��C����^+��n�$(y)괧�Qaa�]#��a�d�W�%�V�NN�Rݷ�go�L���t
���ۅC��aY���-F���rp��Z����ɶ��wK��	_��
ōs�k�����۠Ч�p�����?e��p�qlJ���n;+�U�+�,��<��^vD��yd��"�Rx�q�����$儉��,A
d��,������o�4���:�9L)�Y�� ��l���&��y�[)Q��,�����@ćz��:	��j���n�5��7]��nk�L��r��i�f����w��t�ZC/'�Ɂ�Z���y6,��I~%�p��G��g��ՄmFn�mt`��
Aֲ�g3"��y���qha���,Oo�b|�����r�h���'F#�>�X�ڵ���T��N�ȁQ��p� � x�(�ʲ$)��.��ʚ���V�Z�k������\6�S	�q��-7������C#f��`�� �83�u���K���M�1�ż"W�w�*�0&��E3��򊀿���OK1d�n���0v>����}9��D�����u�g5�HY����w���.c5��@g$�N3Tk-�C��y��a�d>F�����l�֚�/��M�E�aG�)}.�J����je��1^�'���7ѕ�]��ί�;�w�!)��mA�']	T訢�
)���9�0���(�u�W��q@hf3K��I�FߜC���cN�}-PT^Y��u�)T���
s�t���=�.��Uh|g���2�该x3+ok;�����=͜SA�.ORX!��46&Uܛv����x�{��i�
���?	�O4x�9rS�*����pN Co ���S�&���-ꌜ$�߲,�w�'>�&Y���"�T%*��s�t�Rg-����qy��� B�jߌQ��}���l�q{��EK�\k�O[�Z��;�K��-�(,�'E���/0v�b����-�e̠�>��l��n��MK|��=��Q�!@�҃���W�CF����,1o�̡.�)#rڛ�4R[�im:f�k�h�}8��q��Q�;KI
���7.)�-���ܶ�#VskֳM�+c�fqZܔ�����ZR{��t��;��,'n�W`��7���ĺ��QH��s=שׂdKz8�7@�4�A�6)9K�MV� ���!���K?>�GO)�-��P��Bͬ�%.��6�W��]��.��6����$���/L	��� ���"-���8ڱHJ����#$؇|=E�yqK��6���"7ӆ���N|�����f��%o��Ƽ�g�0�ɫ����%������f���cq3R���C�]	����C4�u:�v��DƆ[Q��d�:��$�����x�#��x�$Ty� �C�A6`�����ppr�m�P]ȉ��ט�>p���uI������-Xp���<�����!V��ȩ3�N[(���`�|���G79���y����R9�**f��g�N��b���l��V!��Mt�N�f� ㊅O@m���dO}-��m�̋��:��4S��ԍ�pw�BY��wE�� _��:b�^J��?�k"{W��{rf�'u�a�yo24������G4��7k����%e ]���8V�+��ɵk�_��J5;PUD�h��MĻ��Dy9x��o;��D~�q���֬�l���~?J{��T��Y���uFv4nl%~+���@�
X]w�����Nv?�v��^e"+j�ۆ#��#p����;���=���� .���/v�co���A��P1y��%h�./O��Ӌ �*����~����Q��^��S����sD�8�/ ���+J�*!�]��$�Q8�;��0i��g �r½�=�X�|��q�ɴ�:�؀̪c�l��K���d���cO%jB��?1��]^k��X��ut2���ݣl�BE��`���fp< )�EF|a���ÜQ����s�M�Z',g'!���6S(�P��B���W����C�>��H:;���b>{��LG����^�T2��0�kS*u|[��[�Fg.���^��m����i�h]XC�u}����`@�i�?E�p����@�$֯���ʥ�ﳠ��A��H`���W�)x�C�^)���c�z^�Y{F�"�ժ����A�:n��7
{�vb�mN��;2��j"R��%lE�� �
�}z�'�~����ZsUヤ��/��"���Y)	a)������i��O �{՚��#MU������H&g�^������H|]*u��ދ���n��������,�!3$�r�*�"6'm�8v@?dj��n?zy�Q�$2�^�5n-��n�m��j��oX��fub�j�oY\��<A�#�x��� ��^���
%�?^�C�@XlO�ՃL��aW\�Ǹ��?�{��(_o��%LɫhDUO�|�����4������+�J���-!�_���N�$fz����䘘C�+�;.Rb��{M�uz}�A��h]���������
<*o���1�$��0(��f�	���H*�^�ܐ��@Zt���q',cr]�g�H3G�΢��B��4�$a���~\*3��ԍM���(����-��'b��e��wil�
u��<2j�r�ȭ^SF�W^��d�:�M;({�e>��p~���4��؝��Y4o�YO̬���3ʼ�H�=�o)o��O�0�F������C�̰(B����_o�/	�$kq892��ᜢ�[�@UM�A���)2c[����m\�%F�,��:�J�:�lQ��,�P6��" MޖU(����u�vǷ�u	�0p�����ż��w�w��ʆ��]	����:O���`���鄞b��!/fՌ�JQX�[�w9h�Ƞ�䮬^��j�<������-�|Z�����^�	�T��(+B�n9���h(Ouh��j�8oZ]�2?+z����B�Y%��nXuTvt�|:/sԨ^���3���27{��՞�D�y�]�|��pR�I�
�S;�P)*4�ͦQ~�>����")��n��m                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                tegory="_lCWdKTk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWbqTk9Eeen_NygEc5WsA" elementId="org.eclipse.jdt.ui.edit.text.java.search.references.in.working.set" commandName="References in Working Set" description="Search for references to the selected element in a working set" category="_lCWdSDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWbqjk9Eeen_NygEc5WsA" elementId="org.eclipse.mylyn.tasks.ui.command.task.clearOutgoing" commandName="Clear Outgoing Changes" category="_lCWdJDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWbqzk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.edit.text.folding.collapse" commandName="Collapse" description="Collapses the folded region at the current selection" category="_lCWdITk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWbrDk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.edit.text.smartEnterInverse" commandName="Insert Line Above Current Line" description="Adds a new line above the current line" category="_lCWdITk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWbrTk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.window.spy" commandName="Show Contributing Plug-in" description="Shows contribution information for the currently selected element" category="_lCWdKTk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWbrjk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.help.helpSearch" commandName="Help Search" description="Open the help search" category="_lCWdRTk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWbrzk9Eeen_NygEc5WsA" elementId="org.eclipse.jdt.ui.edit.text.java.infer.type.arguments" commandName="Infer Generic Type Arguments" description="Infer type arguments for references to generic classes and remove unnecessary casts" category="_lCWdQzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWbsDk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.edit.text.goto.lineDown" commandName="Line Down" description="Go down one line of text" category="_lCWdITk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWbsTk9Eeen_NygEc5WsA" elementId="org.eclipse.egit.ui.commit.Checkout" commandName="Checkout" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWbsjk9Eeen_NygEc5WsA" elementId="org.tigris.subversion.subclipse.ui.merge" commandName="Merge..." category="_lCWdHzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWbszk9Eeen_NygEc5WsA" elementId="org.eclipse.m2e.actions.LifeCycleClean.run" commandName="Run Maven Clean" description="Run Maven Clean" category="_lCWdKzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWbtDk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.edit.text.gotoLastEditPosition" commandName="Last Edit Location" description="Last edit location" category="_lCWdPDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWbtTk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.edit.text.open.hyperlink" commandName="Open Hyperlink" description="Opens the hyperlink at the caret location or opens a chooser if more than one hyperlink is available" category="_lCWdITk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWbtjk9Eeen_NygEc5WsA" elementId="org.eclipse.mylyn.wikitext.ui.convertToEclipseHelpCommand" commandName="Generate Eclipse Help (*.html and *-toc.xml)" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWbtzk9Eeen_NygEc5WsA" elementId="org.eclipse.wst.jsdt.ui.edit.text.java.search.exception.occurrences" commandName="Search Exception Occurrences in File" description="Search for exception occurrences of a selected exception type" category="_lCWdSDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWbuDk9Eeen_NygEc5WsA" elementId="org.eclipse.debug.ui.command.prevpage" commandName="Previous Page of Memory" description="Load previous page of memory" category="_lCWdKzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWbuTk9Eeen_NygEc5WsA" elementId="org.eclipse.jdt.debug.ui.commands.ForceReturn" commandName="Force Return" description="Forces return from method with value of selected expression " category="_lCWdKzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWbujk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.ide.configureFilters" commandName="Configure Contents..." description="Configure the filters to apply to the markers view" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWbuzk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.navigate.previousTab" commandName="Previous Tab" description="Switch to the previous tab" category="_lCWdPDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWbvDk9Eeen_NygEc5WsA" elementId="org.eclipse.wst.jsdt.ui.edit.text.java.search.declarations.in.hierarchy" commandName="Declaration in Hierarchy" description="Search for declarations of the selected element in its hierarchy" category="_lCWdSDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWbvTk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.dialogs.openMessageDialog" commandName="Open Message Dialog" description="Open a Message Dialog" category="_lCWdLDk9Eeen_NygEc5WsA">
    <parameters xmi:id="_lCWbvjk9Eeen_NygEc5WsA" elementId="title" name="Title"/>
    <parameters xmi:id="_lCWbvzk9Eeen_NygEc5WsA" elementId="message" name="Message"/>
    <parameters xmi:id="_lCWbwDk9Eeen_NygEc5WsA" elementId="imageType" name="Image Type Constant" typeId="org.eclipse.ui.dialogs.Integer"/>
    <parameters xmi:id="_lCWbwTk9Eeen_NygEc5WsA" elementId="defaultIndex" name="Default Button Index" typeId="org.eclipse.ui.dialogs.Integer"/>
    <parameters xmi:id="_lCWbwjk9Eeen_NygEc5WsA" elementId="buttonLabel0" name="First Button Label"/>
    <parameters xmi:id="_lCWbwzk9Eeen_NygEc5WsA" elementId="buttonLabel1" name="Second Button Label"/>
    <parameters xmi:id="_lCWbxDk9Eeen_NygEc5WsA" elementId="buttonLabel2" name="Third Button Label"/>
    <parameters xmi:id="_lCWbxTk9Eeen_NygEc5WsA" elementId="buttonLabel3" name="Fourth Button Label"/>
    <parameters xmi:id="_lCWbxjk9Eeen_NygEc5WsA" elementId="cancelReturns" name="Return Value on Cancel"/>
  </commands>
  <commands xmi:id="_lCWbxzk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.edit.text.goto.lineEnd" commandName="Line End" description="Go to the end of the line of text" category="_lCWdITk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWbyDk9Eeen_NygEc5WsA" elementId="org.eclipse.egit.ui.commit.CreateTag" commandName="Create Tag..." category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWbyTk9Eeen_NygEc5WsA" elementId="org.eclipse.wst.jsdt.ui.edit.text.java.extract.method" commandName="Extract Function" description="Extract a set of statements or an expression into a new function and use the new function" category="_lCWdNTk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWbyjk9Eeen_NygEc5WsA" elementId="org.eclipse.jpt.jpa.ui.generateDDL" commandName="Generate Tables from Entities..." category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWbyzk9Eeen_NygEc5WsA" elementId="org.eclipse.wst.xml.ui.referencedFileErrors" commandName="Show Details..." description="Show Details..." category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWbzDk9Eeen_NygEc5WsA" elementId="org.eclipse.datatools.sqltools.sqleditor.runAction" commandName="Run" category="_lCWdSjk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWbzTk9Eeen_NygEc5WsA" elementId="org.eclipse.debug.ui.commands.RunLast" commandName="Run" description="Launch in run mode" category="_lCWdKzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWbzjk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.externalTools.commands.OpenExternalToolsConfigurations" commandName="External Tools..." description="Open external tools launch configuration dialog" category="_lCWdKzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWbzzk9Eeen_NygEc5WsA" elementId="org.eclipse.team.svn.ui.command.ExportCommand" commandName="Export..." category="_lCWdJzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb0Dk9Eeen_NygEc5WsA" elementId="org.eclipse.jdt.debug.ui.command.OpenFromClipboard" commandName="Open from Clipboard" description="Opens a Java element or a Java stack trace from clipboard" category="_lCWdPDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb0Tk9Eeen_NygEc5WsA" elementId="org.eclipse.pde.ui.internationalize" commandName="Internationalize Plug-ins" description="Sets up internationalization for a plug-in" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb0jk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.edit.text.deletePrevious" commandName="Delete Previous" description="Delete the previous character" category="_lCWdITk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb0zk9Eeen_NygEc5WsA" elementId="org.eclipse.egit.ui.team.CompareWithPrevious" commandName="Compare with Previous Revision" category="_lCWdSTk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb1Dk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.edit.text.select.columnNext" commandName="Select Next Column" description="Select the next column" category="_lCWdITk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb1Tk9Eeen_NygEc5WsA" elementId="org.eclipse.jdt.ui.edit.text.java.search.read.access.in.workspace" commandName="Read Access in Workspace" description="Search for read references to the selected element in the workspace" category="_lCWdSDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb1jk9Eeen_NygEc5WsA" elementId="org.eclipse.wst.jsdt.ui.edit.text.java.search.implementors.in.workspace" commandName="Implementors in Workspace" description="Search for implementors of the selected interface" category="_lCWdSDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb1zk9Eeen_NygEc5WsA" elementId="org.eclipse.team.svn.ui.command.SetExternalDefinitionCommand" commandName="Set External Definition..." category="_lCWdJzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb2Dk9Eeen_NygEc5WsA" elementId="org.eclipse.team.svn.ui.command.CompareRepositoryWithBranchCommand" commandName="Compare With Branch..." category="_lCWdJzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb2Tk9Eeen_NygEc5WsA" elementId="org.eclipse.debug.ui.commands.TerminateAndRelaunch" commandName="Terminate and Relaunch" description="Terminate and Relaunch" category="_lCWdKzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb2jk9Eeen_NygEc5WsA" elementId="org.eclipse.jdt.ui.JavaHierarchyPerspective" commandName="Java Type Hierarchy" description="Show the Java Type Hierarchy perspective" category="_lCWdSzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb2zk9Eeen_NygEc5WsA" elementId="org.eclipse.wst.jsdt.ui.edit.text.java.search.declarations.in.project" commandName="Declaration in Project" description="Search for declarations of the selected element in the enclosing project" category="_lCWdSDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb3Dk9Eeen_NygEc5WsA" elementId="org.eclipse.jdt.ui.edit.text.java.surround.with.try.multicatch" commandName="Surround with try/multi-catch Block" description="Surround the selected text with a try/multi-catch block" category="_lCWdTjk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb3Tk9Eeen_NygEc5WsA" elementId="org.eclipse.egit.ui.team.Tag" commandName="Tag" category="_lCWdSTk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb3jk9Eeen_NygEc5WsA" elementId="org.eclipse.egit.ui.team.NoAssumeUnchanged" commandName="No Assume Unchanged" category="_lCWdSTk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb3zk9Eeen_NygEc5WsA" elementId="org.eclipse.wst.jsdt.ui.JavadocView" commandName="Documentation" description="Show the JavaScript Documentation view" category="_lCWdNzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb4Dk9Eeen_NygEc5WsA" elementId="org.eclipse.debug.ui.commands.RemoveAllBreakpoints" commandName="Remove All Breakpoints" description="Removes all breakpoints" category="_lCWdKzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb4Tk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.navigator.resources.nested.changeProjectPresentation" commandName="P&amp;rojects Presentation" category="_lCWdNDk9Eeen_NygEc5WsA">
    <parameters xmi:id="_lCWb4jk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.navigator.resources.nested.enabled" name="&amp;Hierarchical"/>
    <parameters xmi:id="_lCWb4zk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.commands.radioStateParameter" name="Nested Project view - Radio State" optional="false"/>
  </commands>
  <commands xmi:id="_lCWb5Dk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.window.showKeyAssist" commandName="Show Key Assist" description="Show the key assist dialog" category="_lCWdKTk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb5Tk9Eeen_NygEc5WsA" elementId="org.eclipse.jdt.ui.edit.text.java.introduce.parameter.object" commandName="Introduce Parameter Object" description="Introduce a parameter object to a selected method" category="_lCWdQzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb5jk9Eeen_NygEc5WsA" elementId="org.eclipse.gef.zoom_out" commandName="Zoom Out" description="Zoom Out" category="_lCWdTTk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb5zk9Eeen_NygEc5WsA" elementId="org.eclipse.jdt.ui.commands.openElementInEditor" commandName="Open Java Element" description="Open a Java element in its editor" category="_lCWdPDk9Eeen_NygEc5WsA">
    <parameters xmi:id="_lCWb6Dk9Eeen_NygEc5WsA" elementId="elementRef" name="Java element reference" typeId="org.eclipse.jdt.ui.commands.javaElementReference" optional="false"/>
  </commands>
  <commands xmi:id="_lCWb6Tk9Eeen_NygEc5WsA" elementId="org.tigris.subversion.subclipse.ui.commit" commandName="&#x63d0;&#x4ea4;" category="_lCWdHzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb6jk9Eeen_NygEc5WsA" elementId="org.eclipse.wst.jsdt.ui.edit.text.java.uncomment" commandName="Uncomment" description="Uncomment the selected JavaScript comment lines" category="_lCWdIzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb6zk9Eeen_NygEc5WsA" elementId="org.eclipse.datatools.sqltools.result.removeInstance" commandName="Remove Result" category="_lCWdKjk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb7Dk9Eeen_NygEc5WsA" elementId="org.tigris.subversion.subclipse.ui.showresourceinhistoryaction" commandName="Show History" category="_lCWdHzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb7Tk9Eeen_NygEc5WsA" elementId="org.eclipse.egit.ui.team.AddToIndex" commandName="Add to Index" category="_lCWdSTk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb7jk9Eeen_NygEc5WsA" elementId="org.eclipse.mylyn.discovery.ui.discoveryWizardCommand" commandName="Discovery Wizard" description="shows the connector discovery wizard" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb7zk9Eeen_NygEc5WsA" elementId="org.eclipse.wst.jsdt.ui.edit.text.java.search.read.access.in.working.set" commandName="Read Access in Working Set" description="Search for read references to the selected element in a working set" category="_lCWdSDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb8Dk9Eeen_NygEc5WsA" elementId="org.eclipse.jpt.jpa.ui.persistentAttributeAddToXmlAndMap" commandName="Add Attribute to XML and Map..." category="_lCWdMDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb8Tk9Eeen_NygEc5WsA" elementId="org.eclipse.wst.sse.ui.toggle.comment" commandName="Toggle Comment" description="Toggle Comment" category="_lCWdHjk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb8jk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.help.tipsAndTricksAction" commandName="Tips and Tricks" description="Open the tips and tricks help page" category="_lCWdRTk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb8zk9Eeen_NygEc5WsA" elementId="org.eclipse.jdt.ui.edit.text.java.format" commandName="Format" description="Format the selected text" category="_lCWdTjk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb9Dk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.edit.text.smartEnter" commandName="Insert Line Below Current Line" description="Adds a new line below the current line" category="_lCWdITk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb9Tk9Eeen_NygEc5WsA" elementId="org.eclipse.wst.jsdt.ui.edit.text.java.select.previous" commandName="Select Previous Element" description="Expand selection to include previous sibling" category="_lCWdHjk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb9jk9Eeen_NygEc5WsA" elementId="org.tigris.subversion.subclipse.ui.upgrade" commandName="Upgrade" category="_lCWdHzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb9zk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.edit.text.goto.lineStart" commandName="Line Start" description="Go to the start of the line of text" category="_lCWdITk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb-Dk9Eeen_NygEc5WsA" elementId="org.eclipse.oomph.setup.editor.synchronizePreferences" commandName="Synchronize Preferences" category="_lCWdOzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb-Tk9Eeen_NygEc5WsA" elementId="org.eclipse.wst.xml.ui.cmnd.contentmodel.sych" commandName="Synch" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb-jk9Eeen_NygEc5WsA" elementId="org.eclipse.egit.ui.RepositoriesViewConfigureBranch" commandName="Configure Branch" category="_lCWdSTk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb-zk9Eeen_NygEc5WsA" elementId="org.eclipse.debug.ui.commands.Suspend" commandName="Suspend" description="Suspend" category="_lCWdKzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb_Dk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.edit.text.hippieCompletion" commandName="Word Completion" description="Context insensitive completion" category="_lCWdHjk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb_Tk9Eeen_NygEc5WsA" elementId="org.eclipse.wst.xsd.ui.refactor.renameTargetNamespace" commandName="Rename Target Namespace" description="Changes the target namespace of the schema" category="_lCWdHjk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb_jk9Eeen_NygEc5WsA" elementId="org.eclipse.jdt.ui.edit.text.java.folding.collapseComments" commandName="Collapse Comments" description="Collapse all comments" category="_lCWdITk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWb_zk9Eeen_NygEc5WsA" elementId="org.eclipse.team.ui.synchronizeLast" commandName="Repeat last synchronization" description="Repeat the last synchronization" category="_lCWdNjk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcADk9Eeen_NygEc5WsA" elementId="org.eclipse.jdt.ui.generate.javadoc" commandName="Generate Javadoc" description="Generates Javadoc for a selectable set of Java resources" category="_lCWdRjk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcATk9Eeen_NygEc5WsA" elementId="org.eclipse.egit.ui.RepositoriesViewConfigureGerritRemote" commandName="Gerrit Configuration..." category="_lCWdSTk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcAjk9Eeen_NygEc5WsA" elementId="org.eclipse.jdt.debug.ui.commands.StepIntoSelection" commandName="Step Into Selection" description="Step into the current selected statement" category="_lCWdKzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcAzk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.ide.configureColumns" commandName="Configure Columns..." description="Configure the columns in the markers view" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcBDk9Eeen_NygEc5WsA" elementId="org.eclipse.egit.ui.team.ReplaceWithCommit" commandName="Replace with commit" category="_lCWdSTk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcBTk9Eeen_NygEc5WsA" elementId="org.eclipse.jst.pagedesigner.design" commandName="Graphical Designer" category="_lCWdODk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcBjk9Eeen_NygEc5WsA" elementId="org.eclipse.tm.terminal.quickaccess" commandName="Quick Access" category="_lCWdRzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcBzk9Eeen_NygEc5WsA" elementId="org.eclipse.debug.ui.commands.DebugLast" commandName="Debug" description="Launch in debug mode" category="_lCWdKzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcCDk9Eeen_NygEc5WsA" elementId="org.eclipse.mylyn.wikitext.ui.convertToHtmlCommand" commandName="Generate HTML" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcCTk9Eeen_NygEc5WsA" elementId="org.eclipse.pde.ui.openManifest" commandName="Open Manifest" description="Open the plug-in manifest" category="_lCWdPDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcCjk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.window.previousView" commandName="Previous View" description="Switch to the previous view" category="_lCWdKTk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcCzk9Eeen_NygEc5WsA" elementId="org.eclipse.wst.jsdt.ui.edit.text.java.self.encapsulate.field" commandName="Encapsulate Var" description="Create getting and setting functions for the var and use only those to access the var" category="_lCWdNTk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcDDk9Eeen_NygEc5WsA" elementId="org.eclipse.jdt.ui.edit.text.java.generate.tostring" commandName="Generate toString()" description="Generates the toString() method for the type" category="_lCWdTjk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcDTk9Eeen_NygEc5WsA" elementId="org.eclipse.jdt.ui.edit.text.java.organize.imports" commandName="Organize Imports" description="Evaluate all required imports and replace the current imports" category="_lCWdTjk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcDjk9Eeen_NygEc5WsA" elementId="org.eclipse.team.svn.ui.command.BranchCommand" commandName="Branch..." category="_lCWdJzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcDzk9Eeen_NygEc5WsA" elementId="org.eclipse.debug.ui.commands.DropToFrame" commandName="Drop to Frame" description="Drop to Frame" category="_lCWdKzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcEDk9Eeen_NygEc5WsA" elementId="org.eclipse.wst.jsdt.ui.edit.text.java.promote.local.variable" commandName="Convert Local Variable to Var" description="Convert a local variable to a var" category="_lCWdNTk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcETk9Eeen_NygEc5WsA" elementId="org.eclipse.pde.api.tools.ui.compare.to.baseline" commandName="API Baseline..." description="Allows to compare the selected resource with the current baseline" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcEjk9Eeen_NygEc5WsA" elementId="org.eclipse.pde.ui.imagebrowser.saveToWorkspace" commandName="Save Image" description="Save the selected image into a project in the workspace" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcEzk9Eeen_NygEc5WsA" elementId="org.eclipse.jdt.debug.ui.commands.Display" commandName="Display" description="Display result of evaluating selected text" category="_lCWdKzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcFDk9Eeen_NygEc5WsA" elementId="org.eclipse.jdt.ui.edit.text.java.search.exception.occurrences" commandName="Search Exception Occurrences in File" description="Search for exception occurrences of a selected exception type" category="_lCWdSDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcFTk9Eeen_NygEc5WsA" elementId="org.eclipse.tm.terminal.view.ui.command.disconnect" commandName="Disconnect Terminal" category="_lCWdPzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcFjk9Eeen_NygEc5WsA" elementId="org.eclipse.egit.ui.team.ShowBlame" commandName="Show Annotations" category="_lCWdSTk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcFzk9Eeen_NygEc5WsA" elementId="org.eclipse.jdt.ui.correction.assignToField.assist" commandName="Quick Assist - Assign to field" description="Invokes quick assist and selects 'Assign to field'" category="_lCWdTjk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcGDk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.edit.text.folding.expand" commandName="Expand" description="Expands the folded region at the current selection" category="_lCWdITk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcGTk9Eeen_NygEc5WsA" elementId="org.eclipse.jdt.ui.edit.text.java.extract.method" commandName="Extract Method" description="Extract a set of statements or an expression into a new method and use the new method" category="_lCWdQzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcGjk9Eeen_NygEc5WsA" elementId="org.eclipse.jpt.jpa.eclipselink.ui.newEclipseLinkMappingFile" commandName="EclipseLink ORM Mapping File" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcGzk9Eeen_NygEc5WsA" elementId="org.eclipse.mylyn.tasks.ui.command.openRemoteTask" commandName="Open Remote Task" category="_lCWdPDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcHDk9Eeen_NygEc5WsA" elementId="org.eclipse.debug.ui.commands.nextMemoryBlock" commandName="Next Memory Monitor" description="Show renderings from next memory monitor." category="_lCWdKzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcHTk9Eeen_NygEc5WsA" elementId="org.eclipse.egit.ui.internal.reflog.OpenInCommitViewerCommand" commandName="Open in Commit Viewer" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcHjk9Eeen_NygEc5WsA" elementId="org.eclipse.mylyn.context.ui.commands.task.retrieveContext" commandName="Retrieve Context" category="_lCWdIjk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcHzk9Eeen_NygEc5WsA" elementId="org.eclipse.jst.jsp.ui.refactor.rename" commandName="Rename" description="Rename a Java Element" category="_lCWdHjk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcIDk9Eeen_NygEc5WsA" elementId="org.eclipse.egit.ui.team.Fetch" commandName="Fetch" category="_lCWdSTk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcITk9Eeen_NygEc5WsA" elementId="org.eclipse.pde.ui.junitWorkbenchShortcut.run" commandName="Run JUnit Plug-in Test" description="Run JUnit Plug-in Test" category="_lCWdKzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcIjk9Eeen_NygEc5WsA" elementId="org.eclipse.jdt.ui.navigate.gotopackage" commandName="Go to Package" description="Go to Package" category="_lCWdPDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcIzk9Eeen_NygEc5WsA" elementId="org.eclipse.mylyn.task.ui.editor.QuickOutline" commandName="Quick Outline" description="Show the quick outline for the editor input" category="_lCWdJDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcJDk9Eeen_NygEc5WsA" elementId="org.eclipse.team.svn.ui.command.ScanLocksCommand" commandName="Scan Locks" category="_lCWdJzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcJTk9Eeen_NygEc5WsA" elementId="org.eclipse.debug.ui.commands.eof" commandName="EOF" description="Send end of file" category="_lCWdKzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcJjk9Eeen_NygEc5WsA" elementId="org.eclipse.jst.pagedesigner.horizotal" commandName="Horizontal Layout" category="_lCWdODk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcJzk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.navigate.showInQuickMenu" commandName="Show In..." description="Open the Show In menu" category="_lCWdPDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcKDk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.edit.text.copyLineUp" commandName="Duplicate Lines" description="Duplicates the selected lines and leaves the selection unchanged" category="_lCWdITk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcKTk9Eeen_NygEc5WsA" elementId="org.eclipse.debug.ui.commands.ToggleMethodBreakpoint" commandName="Toggle Method Breakpoint" description="Creates or removes a method breakpoint" category="_lCWdKzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcKjk9Eeen_NygEc5WsA" elementId="org.eclipse.jdt.ui.navigate.java.open.structure" commandName="Open Structure" description="Show the structure of the selected element" category="_lCWdPDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcKzk9Eeen_NygEc5WsA" elementId="org.eclipse.wst.jsdt.ui.correction.assignToLocal.assist" commandName="Quick Assist - Assign to local variable" description="Invokes quick assist and selects 'Assign to local variable'" category="_lCWdIzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcLDk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.navigate.next" commandName="Next" description="Navigate to the next item" category="_lCWdPDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcLTk9Eeen_NygEc5WsA" elementId="org.eclipse.mylyn.tasks.bugs.commands.newTaskFromMarker" commandName="New Task from Marker..." description="Report as Bug from Marker" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcLjk9Eeen_NygEc5WsA" elementId="org.eclipse.wst.jsdt.ui.refactor.apply.refactoring.script" commandName="Apply Script" description="Perform refactorings from a refactoring script on the local workspace" category="_lCWdNTk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcLzk9Eeen_NygEc5WsA" elementId="org.eclipse.wst.server.run" commandName="Run" description="Run server" category="_lCWdJTk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcMDk9Eeen_NygEc5WsA" elementId="org.eclipse.team.svn.ui.command.CommitCommand" commandName="Commit..." category="_lCWdJzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcMTk9Eeen_NygEc5WsA" elementId="org.eclipse.mylyn.context.ui.commands.focus.view" commandName="Focus View" category="_lCWdNDk9Eeen_NygEc5WsA">
    <parameters xmi:id="_lCWcMjk9Eeen_NygEc5WsA" elementId="viewId" name="View ID to Focus" optional="false"/>
  </commands>
  <commands xmi:id="_lCWcMzk9Eeen_NygEc5WsA" elementId="org.eclipse.debug.ui.commands.StepReturn" commandName="Step Return" description="Step return" category="_lCWdKzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcNDk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.browser.openBundleResource" commandName="Open Resource in Browser" description="Opens a bundle resource in the default web browser." category="_lCWdKTk9Eeen_NygEc5WsA">
    <parameters xmi:id="_lCWcNTk9Eeen_NygEc5WsA" elementId="plugin" name="Plugin"/>
    <parameters xmi:id="_lCWcNjk9Eeen_NygEc5WsA" elementId="path" name="Path"/>
  </commands>
  <commands xmi:id="_lCWcNzk9Eeen_NygEc5WsA" elementId="org.eclipse.jst.pagedesigner.source" commandName="Source Code" category="_lCWdODk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcODk9Eeen_NygEc5WsA" elementId="org.eclipse.team.svn.ui.command.RevertCommand" commandName="Revert..." category="_lCWdJzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcOTk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.help.aboutAction" commandName="About" description="Open the about dialog" category="_lCWdRTk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcOjk9Eeen_NygEc5WsA" elementId="org.eclipse.wst.common.project.facet.ui.ConvertProjectToFacetedForm" commandName="Convert to Faceted Form..." category="_lCWdKDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcOzk9Eeen_NygEc5WsA" elementId="org.eclipse.jdt.ui.edit.text.java.annotate.classFile" commandName="Annotate Class File" description="Externally add Annotations to a Class File." category="_lCWdTjk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcPDk9Eeen_NygEc5WsA" elementId="org.eclipse.egit.ui.team.stash.create" commandName="Stash Changes..." category="_lCWdSTk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcPTk9Eeen_NygEc5WsA" elementId="org.eclipse.wst.jsdt.ui.edit.text.java.replace.invocations" commandName="Replace Invocations" description="Replace invocations of the selected function" category="_lCWdNTk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcPjk9Eeen_NygEc5WsA" elementId="org.eclipse.egit.ui.history.CheckoutCommand" commandName="Checkout" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcPzk9Eeen_NygEc5WsA" elementId="org.eclipse.mylyn.tasks.ui.command.activateSelectedTask" commandName="Activate Selected Task" category="_lCWdPDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcQDk9Eeen_NygEc5WsA" elementId="org.eclipse.jdt.ui.edit.text.java.search.references.in.workspace" commandName="References in Workspace" description="Search for references to the selected element in the workspace" category="_lCWdSDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcQTk9Eeen_NygEc5WsA" elementId="org.eclipse.wst.sse.ui.format.document" commandName="Format" description="Format selection" category="_lCWdHjk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcQjk9Eeen_NygEc5WsA" elementId="org.eclipse.jdt.ui.correction.addNonNLS" commandName="Quick Fix - Add non-NLS tag" description="Invokes quick assist and selects 'Add non-NLS tag'" category="_lCWdTjk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcQzk9Eeen_NygEc5WsA" elementId="org.eclipse.team.svn.ui.command.CompareWithLatestRevisionCommand" commandName="Latest from Repository" category="_lCWdJzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcRDk9Eeen_NygEc5WsA" elementId="org.eclipse.wst.jsdt.ui.edit.text.java.search.write.access.in.workspace" commandName="Write Access in Workspace" description="Search for write references to the selected element in the workspace" category="_lCWdSDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcRTk9Eeen_NygEc5WsA" elementId="org.eclipse.egit.ui.team.RemoveFromIndex" commandName="Remove from Index" category="_lCWdSTk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcRjk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.newWizard" commandName="New" description="Open the New item wizard" category="_lCWdKDk9Eeen_NygEc5WsA">
    <parameters xmi:id="_lCWcRzk9Eeen_NygEc5WsA" elementId="newWizardId" name="New Wizard"/>
  </commands>
  <commands xmi:id="_lCWcSDk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.window.newWindow" commandName="New Window" description="Open another window" category="_lCWdKTk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcSTk9Eeen_NygEc5WsA" elementId="org.eclipse.jdt.ui.edit.text.java.uncomment" commandName="Uncomment" description="Uncomment the selected Java comment lines" category="_lCWdTjk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcSjk9Eeen_NygEc5WsA" elementId="org.eclipse.egit.ui.history.CompareVersions" commandName="Compare with each other" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcSzk9Eeen_NygEc5WsA" elementId="org.eclipse.equinox.p2.ui.sdk.install" commandName="Install New Software..." category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcTDk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.window.customizePerspective" commandName="Customize Perspective" description="Customize the current perspective" category="_lCWdKTk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcTTk9Eeen_NygEc5WsA" elementId="org.eclipse.mylyn.context.ui.commands.interest.decrement" commandName="Make Less Interesting" description="Make Less Interesting" category="_lCWdIjk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcTjk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.externaltools.ExternalToolMenuDelegateToolbar" commandName="Run Last Launched External Tool" description="Runs the last launched external Tool" category="_lCWdKzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcTzk9Eeen_NygEc5WsA" elementId="org.eclipse.egit.ui.CheckoutCommand" commandName="Checkout" category="_lCWdSTk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcUDk9Eeen_NygEc5WsA" elementId="org.eclipse.jdt.ui.edit.text.java.search.occurrences.in.file" commandName="Search All Occurrences in File" description="Search for all occurrences of the selected element in its declaring file" category="_lCWdSDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcUTk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.edit.text.moveLineUp" commandName="Move Lines Up" description="Moves the selected lines up" category="_lCWdITk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcUjk9Eeen_NygEc5WsA" elementId="org.eclipse.equinox.p2.ui.discovery.commands.ShowBundleCatalog" commandName="Show Bundle Catalog" category="_lCWdNDk9Eeen_NygEc5WsA">
    <parameters xmi:id="_lCWcUzk9Eeen_NygEc5WsA" elementId="org.eclipse.equinox.p2.ui.discovery.commands.DirectoryParameter" name="Directory URL"/>
    <parameters xmi:id="_lCWcVDk9Eeen_NygEc5WsA" elementId="org.eclipse.equinox.p2.ui.discovery.commands.TagsParameter" name="Tags"/>
  </commands>
  <commands xmi:id="_lCWcVTk9Eeen_NygEc5WsA" elementId="org.eclipse.jdt.ui.edit.text.java.gotoBreadcrumb" commandName="Show In Breadcrumb" description="Shows the Java editor breadcrumb and sets the keyboard focus into it" category="_lCWdPDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcVjk9Eeen_NygEc5WsA" elementId="org.eclipse.pde.ui.runtimeWorkbenchShortcut.debug" commandName="Debug Eclipse Application" description="Debug Eclipse Application" category="_lCWdKzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcVzk9Eeen_NygEc5WsA" elementId="org.eclipse.jpt.jpa.ui.makePersistent" commandName="Make Persistent..." category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcWDk9Eeen_NygEc5WsA" elementId="org.eclipse.datatools.sqltools.sqleditor.ExecuteSelectionAction" commandName="Execute Selected Text" category="_lCWdSjk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcWTk9Eeen_NygEc5WsA" elementId="org.eclipse.jpt.jaxb.ui.command.createPackageInfo" commandName="Create package-info.java" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcWjk9Eeen_NygEc5WsA" elementId="org.eclipse.team.svn.ui.command.ReplaceWithBranchCommand" commandName="Branch..." category="_lCWdJzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcWzk9Eeen_NygEc5WsA" elementId="org.eclipse.jdt.ui.edit.text.java.extract.class" commandName="Extract Class..." description="Extracts fields into a new class" category="_lCWdQzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcXDk9Eeen_NygEc5WsA" elementId="org.eclipse.jdt.ui.correction.extractConstant.assist" commandName="Quick Assist - Extract constant" description="Invokes quick assist and selects 'Extract constant'" category="_lCWdTjk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcXTk9Eeen_NygEc5WsA" elementId="org.eclipse.recommenders.rcp.commands.extensionDiscovery" commandName="Discover New Extensions" category="_lCWdNDk9Eeen_NygEc5WsA">
    <parameters xmi:id="_lCWcXjk9Eeen_NygEc5WsA" elementId="org.eclipse.recommenders.utils.rcp.linkContribution.href" name="URI" optional="false"/>
  </commands>
  <commands xmi:id="_lCWcXzk9Eeen_NygEc5WsA" elementId="org.eclipse.compare.copyRightToLeft" commandName="Copy from Right to Left" description="Copy Current Change from Right to Left" category="_lCWdQDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcYDk9Eeen_NygEc5WsA" elementId="org.eclipse.debug.ui.commands.OpenProfileConfigurations" commandName="Profile..." description="Open profile launch configuration dialog" category="_lCWdKzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcYTk9Eeen_NygEc5WsA" elementId="org.eclipse.jpt.jpa.ui.newMappingFile" commandName="JPA ORM Mapping File" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcYjk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.ide.markCompleted" commandName="Mark Completed" description="Mark the selected tasks as completed" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcYzk9Eeen_NygEc5WsA" elementId="org.eclipse.wst.jsdt.ui.edit.text.java.comment" commandName="Comment" description="Turn the selected lines into JavaScript comments" category="_lCWdIzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcZDk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.edit.text.recenter" commandName="Recenter" description="Scroll cursor line to center, top and bottom" category="_lCWdITk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcZTk9Eeen_NygEc5WsA" elementId="org.eclipse.jpt.jpa.ui.xmlFileUpgradeToLatestVersion" commandName="Upgrade JPA Document Version" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcZjk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.edit.text.scroll.lineDown" commandName="Scroll Line Down" description="Scroll down one line of text" category="_lCWdITk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcZzk9Eeen_NygEc5WsA" elementId="org.eclipse.wst.sse.ui.search.find.occurrences" commandName="Occurrences in File" description="Find occurrences of the selection in the file" category="_lCWdHjk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcaDk9Eeen_NygEc5WsA" elementId="org.eclipse.team.svn.ui.command.CompareWithRevisionCommand" commandName="URL..." category="_lCWdJzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcaTk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.ToggleCoolbarAction" commandName="Toggle Toolbar Visibility" description="Toggles the visibility of the window toolbar" category="_lCWdKTk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcajk9Eeen_NygEc5WsA" elementId="org.eclipse.wst.jsdt.ui.navigate.open.type.in.hierarchy" commandName="Open Type in Hierarchy" description="Open a type in the type hierarchy view" category="_lCWdPDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcazk9Eeen_NygEc5WsA" elementId="org.eclipse.wst.sse.ui.outline.customFilter" commandName="&amp;Filters" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcbDk9Eeen_NygEc5WsA" elementId="org.eclipse.datatools.sqltools.sqlscrapbook.commands.openscrapbook" commandName="Open SQL Scrapboo&amp;k" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcbTk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.navigate.openResource" commandName="Open Resource" description="Open an editor on a particular resource" category="_lCWdPDk9Eeen_NygEc5WsA">
    <parameters xmi:id="_lCWcbjk9Eeen_NygEc5WsA" elementId="filePath" name="File Path" typeId="org.eclipse.ui.ide.resourcePath"/>
  </commands>
  <commands xmi:id="_lCWcbzk9Eeen_NygEc5WsA" elementId="org.eclipse.wst.jsdt.ui.correction.addBlock.assist" commandName="Quick Assist - Replace statement with block" description="Invokes quick assist and selects 'Replace statement with block'" category="_lCWdIzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWccDk9Eeen_NygEc5WsA" elementId="org.eclipse.wst.jsdt.ui.edit.text.java.goto.previous.member" commandName="Go to Previous Member" description="Move the caret to the previous member of the JavaScript file" category="_lCWdPDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWccTk9Eeen_NygEc5WsA" elementId="org.eclipse.team.svn.ui.command.EditTreeConflictsCommand" commandName="Edit Tree Conflicts" category="_lCWdJzk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWccjk9Eeen_NygEc5WsA" elementId="org.eclipse.egit.ui.team.CompareWithCommit" commandName="org.eclipse.egit.ui.team.CompareWithCommit"/>
  <commands xmi:id="_lCWcczk9Eeen_NygEc5WsA" elementId="org.eclipse.egit.ui.team.CompareWithRevision" commandName="org.eclipse.egit.ui.team.CompareWithRevision"/>
  <commands xmi:id="_lCWcdDk9Eeen_NygEc5WsA" elementId="org.eclipse.egit.ui.team.ReplaceWithPrevious" commandName="org.eclipse.egit.ui.team.ReplaceWithPrevious"/>
  <commands xmi:id="_lCWcdTk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.ant.ui.actionSet.presentation/org.eclipse.ant.ui.toggleAutoReconcile" commandName="Toggle Ant Editor Auto Reconcile" description="Toggle Ant Editor Auto Reconcile" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcdjk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.datatools.sqltools.sqlscrapbook.actionSet/org.eclipse.datatools.sqltools.sqlscrapbook.actions.OpenScrapbookAction" commandName="Open SQL Scrapbook" description="Open scrapbook to edit SQL statements" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcdzk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.debug.ui.launchActionSet/org.eclipse.debug.internal.ui.actions.RunWithConfigurationAction" commandName="Run As" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWceDk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.debug.ui.launchActionSet/org.eclipse.debug.internal.ui.actions.RunHistoryMenuAction" commandName="Run History" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWceTk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.debug.ui.launchActionSet/org.eclipse.debug.internal.ui.actions.RunDropDownAction" commandName="Run" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcejk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.debug.ui.launchActionSet/org.eclipse.debug.internal.ui.actions.DebugWithConfigurationAction" commandName="Debug As" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcezk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.debug.ui.launchActionSet/org.eclipse.debug.internal.ui.actions.DebugHistoryMenuAction" commandName="Debug History" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcfDk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.debug.ui.launchActionSet/org.eclipse.debug.internal.ui.actions.DebugDropDownAction" commandName="Debug" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcfTk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.debug.ui.profileActionSet/org.eclipse.debug.internal.ui.actions.ProfileDropDownAction" commandName="Profile" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcfjk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.debug.ui.profileActionSet/org.eclipse.debug.internal.ui.actions.ProfileWithConfigurationAction" commandName="Profile As" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcfzk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.debug.ui.profileActionSet/org.eclipse.debug.internal.ui.actions.ProfileHistoryMenuAction" commandName="Profile History" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcgDk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.jdt.ui.JavaElementCreationActionSet/org.eclipse.jdt.ui.actions.NewTypeDropDown" commandName="Class..." description="New Java Class" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcgTk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.jdt.ui.JavaElementCreationActionSet/org.eclipse.jdt.ui.actions.OpenPackageWizard" commandName="Package..." description="New Java Package" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcgjk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.jdt.ui.JavaElementCreationActionSet/org.eclipse.jdt.ui.actions.OpenProjectWizard" commandName="Java Project..." description="New Java Project" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcgzk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.jdt.ui.SearchActionSet/org.eclipse.jdt.ui.actions.OpenJavaSearchPage" commandName="Java..." category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWchDk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.jst.j2ee.J2eeMainActionSet/org.eclipse.jst.j2ee.internal.actions.NewJavaEEArtifact" commandName="Servlet" description="Create a new Servlet" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWchTk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.jst.j2ee.J2eeMainActionSet/org.eclipse.jst.j2ee.internal.actions.NewJavaEEProject" commandName="Dynamic Web Project" description="Create a Dynamic Web project" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWchjk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.mylyn.java.actionSet.browsing/org.eclipse.mylyn.java.ui.actions.ApplyMylynToBrowsingPerspectiveAction" commandName="Focus Browsing Perspective" description="Focus Java Browsing Views on Active Task" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWchzk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.mylyn.doc.actionSet/org.eclipse.mylyn.tasks.ui.bug.report" commandName="Report Bug or Enhancement..." description="Report Bug or Enhancement" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWciDk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.mylyn.tasks.ui.navigation.additions/org.eclipse.mylyn.tasks.ui.navigate.task.history" commandName="Activate Previous Task" description="Activate Previous Task" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWciTk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.pde.ui.SearchActionSet/org.eclipse.pde.ui.actions.OpenPluginSearchPage" commandName="Plug-in..." category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcijk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.ui.cheatsheets.actionSet/org.eclipse.ui.cheatsheets.actions.CheatSheetHelpMenuAction" commandName="Cheat Sheets..." category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcizk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.rse.core.search.searchActionSet/org.eclipse.rse.core.search.searchAction" commandName="Remote..." description="Opens Remote Search dialog page for text and file searching on remote systems" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcjDk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.search.searchActionSet/org.eclipse.search.OpenSearchDialogPage" commandName="Search..." description="Search" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcjTk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.team.ui.actionSet/org.eclipse.team.ui.synchronizeAll" commandName="Synchronize..." description="Synchronize..." category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcjjk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.team.ui.actionSet/org.eclipse.team.ui.ConfigureProject" commandName="Share Project..." description="Share the project with others using a version and configuration management system." category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcjzk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.ui.externaltools.ExternalToolsSet/org.eclipse.ui.externaltools.ExternalToolMenuDelegateMenu" commandName="External Tools" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWckDk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.wst.jsdt.ui.JavaElementCreationActionSet/org.eclipse.wst.jsdt.ui.actions.OpenFileWizard" commandName="JavaScript Source File" description="New JavaScript file" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWckTk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.wst.jsdt.ui.JavaElementCreationActionSet/org.eclipse.wst.jsdt.ui.actions.OpenProjectWizard" commandName="JavaScript Project..." description="New JavaScript Project" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWckjk9Eeen_NygEc5WsA" elementId="org.eclipse.wst.jsdt.ui.refactor.show.refactoring.history" commandName="History..." category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWckzk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.wst.jsdt.ui.SearchActionSet/org.eclipse.wst.jsdt.ui.actions.OpenJavaSearchPage" commandName="JavaScript..." category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWclDk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.wst.server.ui.new.actionSet/org.eclipse.wst.server.ui.action.new.server" commandName="Create Server" description="Create Server" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWclTk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.wst.server.ui.internal.webbrowser.actionSet/org.eclipse.wst.server.ui.internal.webbrowser.action.open" commandName="Open Web Browser" description="Open Web Browser" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcljk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.wst.server.ui.internal.webbrowser.actionSet/org.eclipse.wst.server.ui.internal.webbrowser.action.switch" commandName="Web Browser" description="Web Browser" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWclzk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.wst.web.ui.wizardsActionSet/org.eclipse.wst.web.ui.actions.newCSSFile" commandName="CSS" description="Create a new Cascading Style Sheet" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcmDk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.wst.web.ui.wizardsActionSet/org.eclipse.wst.web.ui.actions.newJSFile" commandName="JavaScript" description="Create a new JavaScript file" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcmTk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.wst.web.ui.wizardsActionSet/org.eclipse.wst.web.ui.actions.newHTMLFile" commandName="HTML" description="Create a new HTML page" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcmjk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.wst.ws.explorer.explorer/org.eclipse.wst.ws.internal.explorer.action.LaunchWSEAction" commandName="Launch the Web Services Explorer" description="Launch the Web Services Explorer" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcmzk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.team.svn.ui.action.shortcuts/org.eclipse.team.svn.ui.action.local.management.DisconnectAction" commandName="Disconnect" description="Disconnect from the SVN repository" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcnDk9Eeen_NygEc5WsA" elementId="org.tigris.subversion.subclipse.ui.GenerateDiff" commandName="&#x521b;&#x5efa;&#x8865;&#x4e01;..." description="&#x5c06;&#x5de5;&#x4f5c;&#x7a7a;&#x95f4;&#x5185;&#x5bb9;&#x4e0e;&#x670d;&#x52a1;&#x5668;&#x8fdb;&#x884c;&#x6bd4;&#x8f83;&#x5e76;&#x751f;&#x6210;&#x53ef;&#x7528;&#x4f5c;&#x8865;&#x4e01;&#x6587;&#x4ef6;&#x7684;&#x5dee;&#x5f02;&#x6587;&#x4ef6;&#x3002;" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcnTk9Eeen_NygEc5WsA" elementId="org.tigris.subversion.subclipse.ui.updateDialog" commandName="Update to Version..." description="&#x66f4;&#x65b0;" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcnjk9Eeen_NygEc5WsA" elementId="org.tigris.subversion.subclipse.ui.actions.ShowTreeConflictsAction" commandName="Show Tree Conflicts" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcnzk9Eeen_NygEc5WsA" elementId="org.tigris.subversion.subclipse.ui.resolve" commandName="&#x6807;&#x8bb0;&#x4e3a;&#x89e3;&#x51b3;" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcoDk9Eeen_NygEc5WsA" elementId="org.tigris.subversion.subclipse.ui.editConflicts" commandName="&#x7f16;&#x8f91;&#x51b2;&#x7a81;" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcoTk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.ant.ui.BreakpointRulerActions/org.eclipse.ant.ui.actions.ManageBreakpointRulerAction" commandName="Toggle Breakpoint" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcojk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.datatools.sqltools.rullerDoubleClick/org.eclipse.jdt.debug.ui.actions.ManageBreakpointRulerAction" commandName="Add Breakpoint" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcozk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.emf.exporter.genModelEditorContribution/org.eclipse.emf.exporter.ui.GenModelExportActionDelegate.Editor" commandName="Export Model..." category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcpDk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.emf.importer.genModelEditorContribution/org.eclipse.emf.importer.ui.GenModelReloadActionDelegate.Editor" commandName="Reload..." category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcpTk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.emf.mapping.ecore2ecore.presentation.Ecore2EcoreContributionID/org.eclipse.emf.mapping.action.RemoveMappingActionID" commandName="Remove Mapping" description="Remove the mapping associated with the selected objects." category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcpjk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.emf.mapping.ecore2ecore.presentation.Ecore2EcoreContributionID/org.eclipse.emf.mapping.action.TypeMatchMappingActionID" commandName="Match Mapping by Type" description="Create child mappings automatically by type." category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcpzk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.emf.mapping.ecore2ecore.presentation.Ecore2EcoreContributionID/org.eclipse.emf.mapping.action.NameMatchMappingActionID" commandName="Match Mapping by Name" description="Create child mappings automatically by name." category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcqDk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.emf.mapping.ecore2ecore.presentation.Ecore2EcoreContributionID/org.eclipse.emf.mapping.action.CreateOneSidedMappingActionID" commandName="Create One-sided Mapping" description="Create a new mapping for the selected object." category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcqTk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.emf.mapping.ecore2ecore.presentation.Ecore2EcoreContributionID/org.eclipse.emf.mapping.action.CreateMappingActionID" commandName="Create Mapping" description="Create a new mapping between the selected objects." category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcqjk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.emf.mapping.ecore2ecore.presentation.Ecore2EcoreContributionID/org.eclipse.emf.mapping.ecore2ecore.action.AddOuputRootActionID" commandName="Add Output Root..." description="Add new output root." category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcqzk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.emf.mapping.ecore2ecore.presentation.Ecore2EcoreContributionID/org.eclipse.emf.mapping.ecore2ecore.action.AddInputRootActionID" commandName="Add Input Root..." description="Add new input root." category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcrDk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.jdt.debug.CompilationUnitEditor.BreakpointRulerActions/org.eclipse.jdt.debug.ui.actions.ManageBreakpointRulerAction" commandName="Toggle Breakpoint" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcrTk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.jdt.debug.ClassFileEditor.BreakpointRulerActions/org.eclipse.jdt.debug.ui.actions.ManageBreakpointRulerAction" commandName="Toggle Breakpoint" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcrjk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.jdt.debug.ui.JavaSnippetToolbarActions/org.eclipse.jdt.debug.ui.SnippetExecute" commandName="Execute" description="Execute the Selected Text" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcrzk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.jdt.debug.ui.JavaSnippetToolbarActions/org.eclipse.jdt.debug.ui.SnippetDisplay" commandName="Display" description="Display Result of Evaluating Selected Text" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcsDk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.jdt.debug.ui.JavaSnippetToolbarActions/org.eclipse.jdt.debug.ui.SnippetInspect" commandName="Inspect" description="Inspect Result of Evaluating Selected Text" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcsTk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.jdt.internal.ui.CompilationUnitEditor.ruler.actions/org.eclipse.jdt.internal.ui.javaeditor.BookmarkRulerAction" commandName="Java Editor Bookmark Ruler Action" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcsjk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.jdt.internal.ui.CompilationUnitEditor.ruler.actions/org.eclipse.jdt.internal.ui.javaeditor.JavaSelectRulerAction" commandName="Java Editor Ruler Single-Click" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcszk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.jdt.internal.ui.ClassFileEditor.ruler.actions/org.eclipse.jdt.internal.ui.javaeditor.JavaSelectRulerAction" commandName="Java Editor Ruler Single-Click" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWctDk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.jdt.internal.ui.PropertiesFileEditor.ruler.actions/org.eclipse.jdt.internal.ui.propertiesfileeditor.BookmarkRulerAction" commandName="Java Editor Bookmark Ruler Action" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWctTk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.jdt.internal.ui.PropertiesFileEditor.ruler.actions/org.eclipse.jdt.internal.ui.propertiesfileeditor.SelectRulerAction" commandName="Java Editor Ruler Single-Click" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWctjk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.jst.jsp.core.jspsource.ruler.actions/org.eclipse.ui.texteditor.BookmarkRulerAction" commandName="Add Bookmark..." category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWctzk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.jst.jsp.core.jspsource.ruler.actions/org.eclipse.ui.texteditor.SelectRulerAction" commandName="Select Ruler" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcuDk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.m2e.jdt.ui.downloadSourcesContribution/org.eclipse.m2e.jdt.ui.downloadSourcesAction" commandName="label" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcuTk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.m2e.jdt.ui.downloadSourcesContribution_38/org.eclipse.m2e.jdt.ui.downloadSourcesAction_38" commandName="label" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcujk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.ui.texteditor.ruler.actions/org.eclipse.ui.texteditor.BookmarkRulerAction" commandName="Text Editor Bookmark Ruler Action" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcuzk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.ui.texteditor.ruler.actions/org.eclipse.ui.texteditor.SelectRulerAction" commandName="Text Editor Ruler Single-Click" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcvDk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.wst.css.core.csssource.ruler.actions/org.eclipse.ui.texteditor.BookmarkRulerAction" commandName="Add Bookmark..." category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcvTk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.wst.css.core.csssource.ruler.actions/org.eclipse.ui.texteditor.SelectRulerAction" commandName="Select Ruler" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcvjk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.wst.dtd.core.dtdsource.ruler.actions/org.eclipse.ui.texteditor.BookmarkRulerAction" commandName="Add Bookmark..." category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcvzk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.wst.dtd.core.dtdsource.ruler.actions/org.eclipse.ui.texteditor.SelectRulerAction" commandName="Select Ruler" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcwDk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.wst.html.core.htmlsource.ruler.actions/org.eclipse.ui.texteditor.BookmarkRulerAction" commandName="Add Bookmark..." category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcwTk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.wst.html.core.htmlsource.ruler.actions/org.eclipse.ui.texteditor.SelectRulerAction" commandName="Select Ruler" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcwjk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.wst.jsdt.debug.ui.togglebreakpoint/org.eclipse.wst.jsdt.debug.ui.RulerToggleBreakpoint" commandName="Toggle Breakpoint" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcwzk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.wst.jsdt.internal.ui.CompilationUnitEditor.ruler.actions/org.eclipse.wst.jsdt.internal.ui.javaeditor.BookmarkRulerAction" commandName="JavaScript Editor Bookmark Ruler Action" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcxDk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.wst.jsdt.internal.ui.CompilationUnitEditor.ruler.actions/org.eclipse.wst.jsdt.internal.ui.javaeditor.JavaSelectRulerAction" commandName="JavaScript Editor Ruler Single-Click" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcxTk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.wst.jsdt.internal.ui.ClassFileEditor.ruler.actions/org.eclipse.wst.jsdt.internal.ui.javaeditor.JavaSelectRulerAction" commandName="JavaScript Editor Ruler Single-Click" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcxjk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.wst.jsdt.internal.ui.PropertiesFileEditor.ruler.actions/org.eclipse.wst.jsdt.internal.ui.propertiesfileeditor.BookmarkRulerAction" commandName="JavaScript Editor Bookmark Ruler Action" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcxzk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.wst.jsdt.internal.ui.PropertiesFileEditor.ruler.actions/org.eclipse.wst.jsdt.internal.ui.propertiesfileeditor.SelectRulerAction" commandName="JavaScript Editor Ruler Single-Click" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcyDk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.ui.articles.action.contribution.editor/org.eclipse.wst.wsdl.ui.actions.ReloadDependenciesActionDelegate" commandName="Reload Dependencies" description="Reload Dependencies" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcyTk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.wst.wsdl.wsdlsource.ruler.actions/org.eclipse.ui.texteditor.BookmarkRulerAction" commandName="Add Bookmark..." category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcyjk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.wst.wsdl.wsdlsource.ruler.actions/org.eclipse.ui.texteditor.SelectRulerAction" commandName="Select Ruler" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWcyzk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.core.runtime.xml.source.ruler.actions/org.eclipse.ui.texteditor.BookmarkRulerAction" commandName="Add Bookmark..." category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWczDk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.core.runtime.xml.source.ruler.actions/org.eclipse.ui.texteditor.SelectRulerAction" commandName="Select Ruler" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWczTk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.wst.xsd.core.xsdsource.ruler.actions/org.eclipse.ui.texteditor.BookmarkRulerAction" commandName="Add Bookmark..." category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWczjk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.wst.xsd.core.xsdsource.ruler.actions/org.eclipse.ui.texteditor.SelectRulerAction" commandName="Select Ruler" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWczzk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.debug.ui.PulldownActions/org.eclipse.debug.ui.debugview.pulldown.ViewManagementAction" commandName="View Management..." category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc0Dk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.debug.ui.debugview.toolbar/org.eclipse.debug.ui.debugview.toolbar.removeAllTerminated" commandName="Remove All Terminated" description="Remove All Terminated Launches" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc0Tk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.debug.ui.breakpointsview.toolbar/org.eclipse.debug.ui.breakpointsView.toolbar.removeAll" commandName="Remove All" description="Remove All Breakpoints" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc0jk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.debug.ui.breakpointsview.toolbar/org.eclipse.debug.ui.breakpointsView.toolbar.linkWithDebugView" commandName="Link with Debug View" description="Link with Debug View" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc0zk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.debug.ui.breakpointsview.toolbar/org.eclipse.debug.ui.breakpointsView.toolbar.workingSets" commandName="Working Sets..." description="Manage Working Sets" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc1Dk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.debug.ui.breakpointsview.toolbar/org.eclipse.debug.ui.breakpointsView.toolbar.clearDefaultBreakpointGroup" commandName="Deselect Default Working Set" description="Deselect Default Working Set" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc1Tk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.debug.ui.breakpointsview.toolbar/org.eclipse.debug.ui.breakpointsView.toolbar.setDefaultBreakpointGroup" commandName="Select Default Working Set..." description="Select Default Working Set" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc1jk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.debug.ui.breakpointsview.toolbar/org.eclipse.debug.ui.breakpointsView.toolbar.groupByAction" commandName="Group By" description="Show" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc1zk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.debug.ui.expressionsView.toolbar/org.eclipse.debug.ui.expresssionsView.toolbar.removeAll" commandName="Remove All" description="Remove All Expressions" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc2Dk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.debug.ui.expressionsView.toolbar/org.eclipse.debug.ui.expresssionsView.toolbar.AddWatchExpression" commandName="Add Watch Expression..." description="Create a new watch expression" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc2Tk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.debug.ui.memoryView.toolbar/org.eclipse.debug.ui.PinMemoryBlockAction" commandName="Pin Memory Monitor" description="Pin Memory Monitor" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc2jk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.debug.ui.memoryView.toolbar/org.eclipse.debug.ui.NewMemoryViewAction" commandName="New Memory View" description="New Memory View" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc2zk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.debug.ui.memoryView.toolbar/org.eclipse.debug.ui.togglemonitors" commandName="Toggle Memory Monitors Pane" description="Toggle Memory Monitors Pane" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc3Dk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.debug.ui.memoryView.toolbar/org.eclipse.debug.ui.linkrenderingpanes" commandName="Link Memory Rendering Panes" description="Link Memory Rendering Panes" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc3Tk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.debug.ui.memoryView.toolbar/org.eclipse.debug.ui.tablerendering.preferencesaction" commandName="Table Renderings Preferences..." description="&amp;Table Renderings Preferences..." category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc3jk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.debug.ui.memoryView.toolbar/org.eclipse.debug.ui.togglesplitpane" commandName="Toggle Split Pane" description="Toggle Split Pane" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc3zk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.debug.ui.memoryView.toolbar/org.eclipse.debug.ui.switchMemoryBlock" commandName="Switch Memory Monitor" description="Switch Memory Monitor" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc4Dk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.debug.ui.memoryView.toolbar/org.eclipse.debug.ui.memoryViewPreferencesAction" commandName="Preferences..." description="&amp;Preferences..." category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc4Tk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.jdt.debug.ui.VariableViewActions/org.eclipse.jdt.debug.ui.variableViewActions.Preferences" commandName="Java Preferences..." description="Opens preferences for Java variables" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc4jk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.jdt.debug.ui.VariableViewActions/org.eclipse.jdt.debug.ui.variablesViewActions.AllReferencesInView" commandName="Show References" description="Shows references to each object in the variables view as an array of objects." category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc4zk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.jdt.debug.ui.VariableViewActions/org.eclipse.jdt.debug.ui.variableViewActions.ShowNullEntries" commandName="Show Null Array Entries" description="Show Null Array Entries" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc5Dk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.jdt.debug.ui.VariableViewActions/org.eclipse.jdt.debug.ui.variableViewActions.ShowQualified" commandName="Show Qualified Names" description="Show Qualified Names" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc5Tk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.jdt.debug.ui.VariableViewActions/org.eclipse.jdt.debug.ui.variableViewActions.ShowStatic" commandName="Show Static Variables" description="Show Static Variables" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc5jk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.jdt.debug.ui.VariableViewActions/org.eclipse.jdt.debug.ui.variableViewActions.ShowConstants" commandName="Show Constants" description="Show Constants" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc5zk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.jdt.debug.ui.ExpressionViewActions/org.eclipse.jdt.debug.ui.variableViewActions.Preferences" commandName="Java Preferences..." description="Opens preferences for Java variables" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc6Dk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.jdt.debug.ui.ExpressionViewActions/org.eclipse.jdt.debug.ui.expressionViewActions.AllReferencesInView" commandName="Show References" description="Show &amp;References" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc6Tk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.jdt.debug.ui.ExpressionViewActions/org.eclipse.jdt.debug.ui.variableViewActions.ShowNullEntries" commandName="Show Null Array Entries" description="Show Null Array Entries" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc6jk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.jdt.debug.ui.ExpressionViewActions/org.eclipse.jdt.debug.ui.expressionViewActions.ShowQualified" commandName="Show Qualified Names" description="Show Qualified Names" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc6zk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.jdt.debug.ui.ExpressionViewActions/org.eclipse.jdt.debug.ui.expressionViewActions.ShowStatic" commandName="Show Static Variables" description="Show Static Variables" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc7Dk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.jdt.debug.ui.ExpressionViewActions/org.eclipse.jdt.debug.ui.expressionViewActions.ShowConstants" commandName="Show Constants" description="Show Constants" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc7Tk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.jdt.debug.ui.BreakpointViewActions/org.eclipse.jdt.debug.ui.actions.AddException" commandName="Add Java Exception Breakpoint" description="Add Java Exception Breakpoint" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc7jk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.jdt.debug.ui.BreakpointViewActions/org.eclipse.jdt.debug.ui.breakpointViewActions.ShowQualified" commandName="Show Qualified Names" description="Show Qualified Names" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc7zk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.jdt.debug.ui.LaunchViewActions/org.eclipse.jdt.debug.ui.launchViewActions.ShowThreadGroups" commandName="Show Thread Groups" description="Show Thread Groups" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc8Dk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.jdt.debug.ui.LaunchViewActions/org.eclipse.jdt.debug.ui.launchViewActions.ShowQualified" commandName="Show Qualified Names" description="Show Qualified Names" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc8Tk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.jdt.debug.ui.LaunchViewActions/org.eclipse.jdt.debug.ui.launchViewActions.ShowSystemThreads" commandName="Show System Threads" description="Show System Threads" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc8jk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.jdt.debug.ui.LaunchViewActions/org.eclipse.jdt.debug.ui.launchViewActions.ShowMonitorThreadInfo" commandName="Show Monitors" description="Show the Thread &amp; Monitor Information" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc8zk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.jdt.debug.ui.DisplayViewActions/org.eclipse.jdt.debug.ui.displayViewToolbar.Watch" commandName="Watch" description="Create a Watch Expression from the Selected Text" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc9Dk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.jdt.debug.ui.DisplayViewActions/org.eclipse.jdt.debug.ui.displayViewToolbar.Execute" commandName="Execute" description="Execute the Selected Text" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc9Tk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.jdt.debug.ui.DisplayViewActions/org.eclipse.jdt.debug.ui.displayViewToolbar.Display" commandName="Display" description="Display Result of Evaluating Selected Text" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc9jk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.jdt.debug.ui.DisplayViewActions/org.eclipse.jdt.debug.ui.displayViewToolbar.Inspect" commandName="Inspect" description="Inspect Result of Evaluating Selected Text" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc9zk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.mylyn.context.ui.outline.contribution/org.eclipse.mylyn.context.ui.contentOutline.focus" commandName="Focus on Active Task" description="Focus on Active Task (Alt+click to reveal filtered elements)" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc-Dk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.mylyn.java.ui.markers.breakpoints.contribution/org.eclipse.mylyn.java.ui.actions.focus.markers.breakpoints" commandName="Focus on Active Task" description="Focus on Active Task" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc-Tk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.mylyn.ui.debug.view.contribution/org.eclipse.mylyn.ui.actions.FilterResourceNavigatorAction" commandName="Focus on Active Task (Experimental)" description="Focus on Active Task (Experimental)" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc-jk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.mylyn.ui.projectexplorer.filter/org.eclipse.mylyn.ide.ui.actions.focus.projectExplorer" commandName="Focus on Active Task" description="Focus on Active Task (Alt+click to reveal filtered elements)" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc-zk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.mylyn.ui.resource.navigator.filter/org.eclipse.mylyn.ide.ui.actions.focus.resourceNavigator" commandName="Focus on Active Task" description="Focus on Active Task (Alt+click to reveal filtered elements)" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc_Dk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.mylyn.problems.contribution/org.eclipse.mylyn.ide.ui.actions.focus.markers.problems" commandName="Focus on Active Task" description="Focus on Active Task" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc_Tk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.mylyn.markers.all.contribution/org.eclipse.mylyn.ide.ui.actions.focus.markers.all" commandName="Focus on Active Task" description="Focus on Active Task" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc_jk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.mylyn.markers.tasks.contribution/org.eclipse.mylyn.ide.ui.actions.focus.markers.tasks" commandName="Focus on Active Task" description="Focus on Active Task" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWc_zk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.mylyn.markers.bookmarks.contribution/org.eclipse.mylyn.ide.ui.actions.focus.markers.bookmarks" commandName="Focus on Active Task" description="Focus on Active Task" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWdADk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.mylyn.java.explorer.contribution/org.eclipse.mylyn.java.actions.focus.packageExplorer" commandName="Focus on Active Task" description="Focus on Active Task (Alt+click to reveal filtered elements)" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWdATk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.mylyn.tasks.ui.actions.view/org.eclipse.mylyn.tasks.ui.search.open" commandName="Search Repository..." category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWdAjk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.mylyn.tasks.ui.actions.view/org.eclipse.mylyn.tasks.ui.synchronize.changed" commandName="Synchronize Changed" description="Synchronize Changed" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWdAzk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.mylyn.tasks.ui.actions.view/org.eclipse.mylyn.tasks.ui.tasks.restore" commandName="Restore Tasks from History..." category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWdBDk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.mylyn.tasks.ui.actions.view/org.eclipse.mylyn.tasks.ui.open.repositories.view" commandName="Show Task Repositories View" description="Show Task Repositories View" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWdBTk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.mylyn.tasks.ui.actions.view/org.eclipse.mylyn.doc.legend.show.action" commandName="Show UI Legend" description="Show Tasks UI Legend" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWdBjk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.mylyn.tasks.ui.actions.view/org.eclipse.mylyn.context.ui.actions.tasklist.focus" commandName="Focus on Workweek" description="Focus on Workweek" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWdBzk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.pde.ui.logViewActions/org.eclipse.jdt.debug.ui.LogViewActions.showStackTrace" commandName="Show Stack Trace in Console View" description="Show Stack Trace in Console View" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWdCDk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.rse.ui.view.systemView.toolbar/org.eclipse.rse.ui.view.systemView.toolbar.linkWithSystemView" commandName="Link with Editor" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWdCTk9Eeen_NygEc5WsA" elementId="AUTOGEN:::breakpointsViewActions/org.eclipse.wst.jsdt.debug.ui.add.scriptload.breakpoint" commandName="Add Script Load Breakpoint" description="Add Script Load Breakpoint" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWdCjk9Eeen_NygEc5WsA" elementId="AUTOGEN:::breakpointsViewActions/org.eclipse.jdt.debug.ui.breakpointViewActions.ShowQualified" commandName="Suspend For All Script Loads" description="Suspends when any script is loaded" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWdCzk9Eeen_NygEc5WsA" elementId="AUTOGEN:::breakpointsViewActions/org.eclipse.wst.jsdt.debug.ui.suspend.on.exceptions" commandName="Suspend On JavaScript Exceptions" description="Suspend on all JavaScript exceptions" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWdDDk9Eeen_NygEc5WsA" elementId="AUTOGEN:::debugViewActions/org.eclipse.wst.jsdt.debug.ui.show.all.scripts" commandName="Show All Scripts" description="Shows or hides all scripts loaded in the visible targets" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWdDTk9Eeen_NygEc5WsA" elementId="AUTOGEN:::variableViewActions/org.eclipse.wst.jsdt.debug.ui.variableview.show.functions" commandName="Show function variables" description="Show or hide function variables" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWdDjk9Eeen_NygEc5WsA" elementId="AUTOGEN:::variableViewActions/org.eclipse.wst.jsdt.debug.ui.variableview.show.this" commandName="Show 'this' variable" description="Show or hide the this variable" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWdDzk9Eeen_NygEc5WsA" elementId="AUTOGEN:::variableViewActions/org.eclipse.wst.jsdt.debug.ui.variableview.show.prototypes" commandName="Show proto variables" description="Show or hide proto variables" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWdEDk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.eclipse.ui.articles.action.contribution.view/org.eclipse.wst.wsi.ui.internal.actions.actionDelegates.ValidateWSIProfileActionDelegate" commandName="WS-I Profile Validator" description="Validate WS-I Message Log File" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <commands xmi:id="_lCWdETk9Eeen_NygEc5WsA" elementId="AUTOGEN:::org.tigris.subversion.subclipse.u.repoview_actions/org.tigris.subversion.ui.actions.NewRepositoryAction" commandName="&#x6dfb;&#x52a0; SVN &#x8d44;&#x6e90;&#x5e93;" description="&#x6dfb;&#x52a0; SVN &#x8d44;&#x6e90;&#x5e93;" category="_lCWdNDk9Eeen_NygEc5WsA"/>
  <addons xmi:id="_lCWdEjk9Eeen_NygEc5WsA" elementId="org.eclipse.e4.core.commands.service" contributorURI="platform:/plugin/org.eclipse.platform" contributionURI="bundleclass://org.eclipse.e4.core.commands/org.eclipse.e4.core.commands.CommandServiceAddon"/>
  <addons xmi:id="_lCWdEzk9Eeen_NygEc5WsA" elementId="org.eclipse.e4.ui.contexts.service" contributorURI="platform:/plugin/org.eclipse.platform" contributionURI="bundleclass://org.eclipse.e4.ui.services/org.eclipse.e4.ui.services.ContextServiceAddon"/>
  <addons xmi:id="_lCWdFDk9Eeen_NygEc5WsA" elementId="org.eclipse.e4.ui.bindings.service" contributorURI="platform:/plugin/org.eclipse.platform" contributionURI="bundleclass://org.eclipse.e4.ui.bindings/org.eclipse.e4.ui.bindings.BindingServiceAddon"/>
  <addons xmi:id="_lCWdFTk9Eeen_NygEc5WsA" elementId="org.eclipse.e4.ui.workbench.commands.model" contributorURI="platform:/plugin/org.eclipse.platform" contributionURI="bundleclass://org.eclipse.e4.ui.workbench/org.eclipse.e4.ui.internal.workbench.addons.CommandProcessingAddon"/>
  <addons xmi:id="_lCWdFjk9Eeen_NygEc5WsA" elementId="org.eclipse.e4.ui.workbench.contexts.model" contributorURI="platform:/plugin/org.eclipse.platform" contributionURI="bundleclass://org.eclipse.e4.ui.workbench/org.eclipse.e4.ui.internal.workbench.addons.ContextProcessingAddon"/>
  <addons xmi:id="_lCWdFzk9Eeen_NygEc5WsA" elementId="org.eclipse.e4.ui.workbench.bindings.model" contributorURI="platform:/plugin/org.eclipse.platform" contributionURI="bundleclass://org.eclipse.e4.ui.workbench.swt/org.eclipse.e4.ui.workbench.swt.util.BindingProcessingAddon"/>
  <addons xmi:id="_lCWdGDk9Eeen_NygEc5WsA" elementId="Cleanup Addon" contributorURI="platform:/plugin/org.eclipse.platform" contributionURI="bundleclass://org.eclipse.e4.ui.workbench.addons.swt/org.eclipse.e4.ui.workbench.addons.cleanupaddon.CleanupAddon"/>
  <addons xmi:id="_lCWdGTk9Eeen_NygEc5WsA" elementId="DnD Addon" contributorURI="platform:/plugin/org.eclipse.platform" contributionURI="bundleclass://org.eclipse.e4.ui.workbench.addons.swt/org.eclipse.e4.ui.workbench.addons.dndaddon.DnDAddon"/>
  <addons xmi:id="_lCWdGjk9Eeen_NygEc5WsA" elementId="MinMax Addon" contributorURI="platform:/plugin/org.eclipse.platform" contributionURI="bundleclass://org.eclipse.e4.ui.workbench.addons.swt/org.eclipse.e4.ui.workbench.addons.minmax.MinMaxAddon"/>
  <addons xmi:id="_lCWdGzk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.workbench.addon.0" contributorURI="platform:/plugin/org.eclipse.platform" contributionURI="bundleclass://org.eclipse.e4.ui.workbench/org.eclipse.e4.ui.internal.workbench.addons.HandlerProcessingAddon"/>
  <addons xmi:id="_lCWdHDk9Eeen_NygEc5WsA" elementId="SplitterAddon" contributionURI="bundleclass://org.eclipse.e4.ui.workbench.addons.swt/org.eclipse.e4.ui.workbench.addons.splitteraddon.SplitterAddon"/>
  <addons xmi:id="_lCWdHTk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.ide.application.addon.0" contributorURI="platform:/plugin/org.eclipse.ui.ide.application" contributionURI="bundleclass://org.eclipse.ui.ide.application/org.eclipse.ui.internal.ide.application.addons.ModelCleanupAddon"/>
  <categories xmi:id="_lCWdHjk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.category.edit" name="Edit"/>
  <categories xmi:id="_lCWdHzk9Eeen_NygEc5WsA" elementId="org.tigris.subversion.subclipse.commandCategory" name="SVN" description="&#x4f7f;&#x7528; SVN &#x8d44;&#x6e90;&#x5e93;&#x65f6;&#x5e94;&#x7528;&#x7684;&#x64cd;&#x4f5c;"/>
  <categories xmi:id="_lCWdIDk9Eeen_NygEc5WsA" elementId="org.eclipse.mylyn.wikitext.ui.editor.category" name="WikiText Markup Editing Commands" description="commands for editing lightweight markup"/>
  <categories xmi:id="_lCWdITk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.category.textEditor" name="Text Editing" description="Text Editing Commands"/>
  <categories xmi:id="_lCWdIjk9Eeen_NygEc5WsA" elementId="org.eclipse.mylyn.context.ui.commands" name="Focused UI" description="Task-Focused Interface"/>
  <categories xmi:id="_lCWdIzk9Eeen_NygEc5WsA" elementId="org.eclipse.wst.jsdt.ui.category.source" name="Source" description="JavaScript Source Actions"/>
  <categories xmi:id="_lCWdJDk9Eeen_NygEc5WsA" elementId="org.eclipse.mylyn.tasks.ui.commands" name="Task Repositories"/>
  <categories xmi:id="_lCWdJTk9Eeen_NygEc5WsA" elementId="org.eclipse.wst.server.ui" name="Server" description="Server"/>
  <categories xmi:id="_lCWdJjk9Eeen_NygEc5WsA" elementId="org.eclipse.mylyn.wikitext.context.ui.commands" name="%commands.category.name" description="%commands.category.description"/>
  <categories xmi:id="_lCWdJzk9Eeen_NygEc5WsA" elementId="org.eclipse.team.svn.ui.command.category" name="SVN"/>
  <categories xmi:id="_lCWdKDk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.category.file" name="File"/>
  <categories xmi:id="_lCWdKTk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.category.window" name="Window"/>
  <categories xmi:id="_lCWdKjk9Eeen_NygEc5WsA" elementId="org.eclipse.datatools.sqltools.result.category" name="SQL Results View"/>
  <categories xmi:id="_lCWdKzk9Eeen_NygEc5WsA" elementId="org.eclipse.debug.ui.category.run" name="Run/Debug" description="Run/Debug command category"/>
  <categories xmi:id="_lCWdLDk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.category.dialogs" name="Dialogs" description="Commands for opening dialogs"/>
  <categories xmi:id="_lCWdLTk9Eeen_NygEc5WsA" elementId="org.eclipse.oomph" name="Oomph"/>
  <categories xmi:id="_lCWdLjk9Eeen_NygEc5WsA" elementId="org.eclipse.jpt.jpa.ui.jpaMetadataConversionCommands" name="JPA Metadata Conversion"/>
  <categories xmi:id="_lCWdLzk9Eeen_NygEc5WsA" elementId="org.eclipse.wst.xml.views.XPathView" name="XPath"/>
  <categories xmi:id="_lCWdMDk9Eeen_NygEc5WsA" elementId="org.eclipse.jpt.jpa.ui.jpaStructureViewCommands" name="JPA Structure View"/>
  <categories xmi:id="_lCWdMTk9Eeen_NygEc5WsA" elementId="org.eclipse.mylyn.commons.repositories.ui.category.Team" name="Team"/>
  <categories xmi:id="_lCWdMjk9Eeen_NygEc5WsA" elementId="org.eclipse.pde.ui.category.source" name="Manifest Editor Source" description="PDE Source Page actions"/>
  <categories xmi:id="_lCWdMzk9Eeen_NygEc5WsA" elementId="org.eclipse.oomph.commands" name="Oomph"/>
  <categories xmi:id="_lCWdNDk9Eeen_NygEc5WsA" elementId="org.eclipse.core.commands.categories.autogenerated" name="Uncategorized" description="Commands that were either auto-generated or have no category"/>
  <categories xmi:id="_lCWdNTk9Eeen_NygEc5WsA" elementId="org.eclipse.wst.jsdt.ui.category.refactoring" name="Refactor - JavaScript" description="JavaScript Refactoring Actions"/>
  <categories xmi:id="_lCWdNjk9Eeen_NygEc5WsA" elementId="org.eclipse.team.ui.category.team" name="Team" description="Actions that apply when working with a Team"/>
  <categories xmi:id="_lCWdNzk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.category.views" name="Views" description="Commands for opening views"/>
  <categories xmi:id="_lCWdODk9Eeen_NygEc5WsA" elementId="org.eclipse.jst.pagedesigner.pagelayout" name="Web Page Editor Layout"/>
  <categories xmi:id="_lCWdOTk9Eeen_NygEc5WsA" elementId="org.eclipse.mylyn.tasks.ui.category.editor" name="Task Editor"/>
  <categories xmi:id="_lCWdOjk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.ide.markerContents" name="Contents" description="The category for menu contents"/>
  <categories xmi:id="_lCWdOzk9Eeen_NygEc5WsA" elementId="org.eclipse.oomph.setup.category" name="Oomph Setup"/>
  <categories xmi:id="_lCWdPDk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.category.navigate" name="Navigate"/>
  <categories xmi:id="_lCWdPTk9Eeen_NygEc5WsA" elementId="org.eclipse.mylyn.java.ui.commands" name="Java Context" description="Java Task-Focused Interface Commands"/>
  <categories xmi:id="_lCWdPjk9Eeen_NygEc5WsA" elementId="org.eclipse.wst.jsdt.debug.ui.category" name="JavaScript Debug" description="Tooling for debugging JavaScript"/>
  <categories xmi:id="_lCWdPzk9Eeen_NygEc5WsA" elementId="org.eclipse.tm.terminal.view.ui.commands.category" name="Terminal Commands"/>
  <categories xmi:id="_lCWdQDk9Eeen_NygEc5WsA" elementId="org.eclipse.compare.ui.category.compare" name="Compare" description="Compare command category"/>
  <categories xmi:id="_lCWdQTk9Eeen_NygEc5WsA" elementId="org.eclipse.rse.ui.commands.category" name="Remote Systems"/>
  <categories xmi:id="_lCWdQjk9Eeen_NygEc5WsA" elementId="org.eclipse.datatools.enablement.sybase.asa.schemaobjecteditor.examples.tableschemaedtor.10x" name="ASA 9.x table schema editor"/>
  <categories xmi:id="_lCWdQzk9Eeen_NygEc5WsA" elementId="org.eclipse.jdt.ui.category.refactoring" name="Refactor - Java" description="Java Refactoring Actions"/>
  <categories xmi:id="_lCWdRDk9Eeen_NygEc5WsA" elementId="org.eclipse.emf.codegen.ecore.ui.Commands" name="EMF Code Generation" description="Commands for the EMF code generation tools"/>
  <categories xmi:id="_lCWdRTk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.category.help" name="Help"/>
  <categories xmi:id="_lCWdRjk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.category.project" name="Project"/>
  <categories xmi:id="_lCWdRzk9Eeen_NygEc5WsA" elementId="org.eclipse.tm.terminal.category1" name="Terminal view commands" description="Terminal view commands"/>
  <categories xmi:id="_lCWdSDk9Eeen_NygEc5WsA" elementId="org.eclipse.search.ui.category.search" name="Search" description="Search command category"/>
  <categories xmi:id="_lCWdSTk9Eeen_NygEc5WsA" elementId="org.eclipse.egit.ui.commandCategory" name="Git"/>
  <categories xmi:id="_lCWdSjk9Eeen_NygEc5WsA" elementId="org.eclipse.datatools.sqltools.sqleditor.category" name="Database Tools" description="Database Development tools"/>
  <categories xmi:id="_lCWdSzk9Eeen_NygEc5WsA" elementId="org.eclipse.ui.category.perspectives" name="Perspectives" description="Commands for opening perspectives"/>
  <categories xmi:id="_lCWdTDk9Eeen_NygEc5WsA" elementId="org.eclipse.ltk.ui.category.refactoring" name="Refactoring"/>
  <categories xmi:id="_lCWdTTk9Eeen_NygEc5WsA" elementId="org.eclipse.gef.category.view" name="View" description="View"/>
  <categories xmi:id="_lCWdTjk9Eeen_NygEc5WsA" elementId="org.eclipse.jdt.ui.category.source" name="Source" description="Java Source Actions"/>
  <categories xmi:id="_lCWdTzk9Eeen_NygEc5WsA" elementId="org.eclipse.pde.runtime.spy.commands.category" name="Spy"/>
</application:Application>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     p.actionSet:org.eclipse.mylyn.doc.actionSet</tags>
          <tags>persp.actionSet:org.eclipse.mylyn.tasks.ui.navigation</tags>
          <tags>persp.actionSet:org.eclipse.ui.cheatsheets.actionSet</tags>
          <tags>persp.actionSet:org.eclipse.rse.core.search.searchActionSet</tags>
          <tags>persp.actionSet:org.eclipse.search.searchActionSet</tags>
          <tags>persp.actionSet:org.eclipse.ui.edit.text.actionSet.annotationNavigation</tags>
          <tags>persp.actionSet:org.eclipse.ui.edit.text.actionSet.navigation</tags>
          <tags>persp.actionSet:org.eclipse.ui.edit.text.actionSet.convertLineDelimitersTo</tags>
          <tags>persp.actionSet:org.eclipse.ui.externaltools.ExternalToolsSet</tags>
          <tags>persp.actionSet:org.eclipse.ui.actionSet.keyBindings</tags>
          <tags>persp.actionSet:org.eclipse.ui.actionSet.openFiles</tags>
          <tags>persp.actionSet:org.eclipse.debug.ui.launchActionSet</tags>
          <tags>persp.actionSet:org.eclipse.jdt.ui.JavaActionSet</tags>
          <tags>persp.actionSet:org.eclipse.jdt.ui.JavaElementCreationActionSet</tags>
          <tags>persp.actionSet:org.eclipse.ui.NavigateActionSet</tags>
          <tags>persp.viewSC:org.eclipse.jdt.ui.PackageExplorer</tags>
          <tags>persp.viewSC:org.eclipse.jdt.ui.TypeHierarchy</tags>
          <tags>persp.viewSC:org.eclipse.jdt.ui.SourceView</tags>
          <tags>persp.viewSC:org.eclipse.jdt.ui.JavadocView</tags>
          <tags>persp.viewSC:org.eclipse.search.ui.views.SearchView</tags>
          <tags>persp.viewSC:org.eclipse.ui.console.ConsoleView</tags>
          <tags>persp.viewSC:org.eclipse.ui.views.ContentOutline</tags>
          <tags>persp.viewSC:org.eclipse.ui.views.ProblemView</tags>
          <tags>persp.viewSC:org.eclipse.ui.views.ResourceNavigator</tags>
          <tags>persp.viewSC:org.eclipse.ui.views.TaskList</tags>
          <tags>persp.viewSC:org.eclipse.ui.views.ProgressView</tags>
          <tags>persp.viewSC:org.eclipse.ui.navigator.ProjectExplorer</tags>
          <tags>persp.viewSC:org.eclipse.ui.texteditor.TemplatesView</tags>
          <tags>persp.viewSC:org.eclipse.pde.runtime.LogView</tags>
          <tags>persp.newWizSC:org.eclipse.jdt.ui.wizards.JavaProjectWizard</tags>
          <tags>persp.newWizSC:org.eclipse.jdt.ui.wizards.NewPackageCreationWizard</tags>
          <tags>persp.newWizSC:org.eclipse.jdt.ui.wizards.NewClassCreationWizard</tags>
          <tags>persp.newWizSC:org.eclipse.jdt.ui.wizards.NewInterfaceCreationWizard</tags>
          <tags>persp.newWizSC:org.eclipse.jdt.ui.wizards.NewEnumCreationWizard</tags>
          <tags>persp.newWizSC:org.eclipse.jdt.ui.wizards.NewAnnotationCreationWizard</tags>
          <tags>persp.newWizSC:org.eclipse.jdt.ui.wizards.NewSourceFolderCreationWizard</tags>
          <tags>persp.newWizSC:org.eclipse.jdt.ui.wizards.NewSnippetFileCreationWizard</tags>
          <tags>persp.newWizSC:org.eclipse.jdt.ui.wizards.NewJavaWorkingSetWizard</tags>
          <tags>persp.newWizSC:org.eclipse.ui.wizards.new.folder</tags>
          <tags>persp.newWizSC:org.eclipse.ui.wizards.new.file</tags>
          <tags>persp.newWizSC:org.eclipse.ui.editors.wizards.UntitledTextFileWizard</tags>
          <tags>persp.perspSC:org.eclipse.jdt.ui.JavaBrowsingPerspective</tags>
          <tags>persp.perspSC:org.eclipse.debug.ui.DebugPerspective</tags>
          <tags>persp.viewSC:org.eclipse.ant.ui.views.AntView</tags>
          <tags>persp.showIn:org.eclipse.egit.ui.RepositoriesView</tags>
          <tags>persp.actionSet:org.eclipse.debug.ui.breakpointActionSet</tags>
          <tags>persp.actionSet:org.eclipse.jdt.debug.ui.JDTDebugActionSet</tags>
          <tags>persp.newWizSC:org.eclipse.jdt.junit.wizards.NewTestCaseCreationWizard</tags>
          <tags>persp.actionSet:org.eclipse.jdt.junit.JUnitActionSet</tags>
          <tags>persp.showIn:org.eclipse.jdt.ui.PackageExplorer</tags>
          <tags>persp.showIn:org.eclipse.team.ui.GenericHistoryView</tags>
          <tags>persp.showIn:org.eclipse.ui.views.ResourceNavigator</tags>
          <tags>persp.showIn:org.eclipse.ui.navigator.ProjectExplorer</tags>
          <tags>persp.viewSC:org.eclipse.mylyn.tasks.ui.views.tasks</tags>
          <tags>persp.newWizSC:org.eclipse.mylyn.tasks.ui.wizards.new.repository.task</tags>
          <tags>persp.viewSC:org.eclipse.tm.terminal.view.ui.TerminalsView</tags>
          <tags>persp.showIn:org.eclipse.tm.terminal.view.ui.TerminalsView</tags>
          <tags>persp.perspSC:org.eclipse.wst.jsdt.ui.JavaPerspective</tags>
          <tags>persp.actionSet:org.eclipse.debug.ui.debugActionSet</tags>
          <children xsi:type="basic:PartSashContainer" xmi:id="_RwG35Tk-Eeen_NygEc5WsA" selectedElement="_RwG37zk-Eeen_NygEc5WsA" horizontal="true">
            <children xsi:type="basic:PartSashContainer" xmi:id="_RwG35jk-Eeen_NygEc5WsA" containerData="1661" selectedElement="_RwG35zk-Eeen_NygEc5WsA">
              <children xsi:type="basic:PartStack" xmi:id="_RwG35zk-Eeen_NygEc5WsA" elementId="left" containerData="6000" selectedElement="_RwG36Dk-Eeen_NygEc5WsA">
                <tags>org.eclipse.e4.primaryNavigationStack</tags>
                <children xsi:type="advanced:Placeholder" xmi:id="_RwG36Dk-Eeen_NygEc5WsA" elementId="org.eclipse.jdt.ui.PackageExplorer" ref="_RwHfvTk-Eeen_NygEc5WsA"/>
                <children xsi:type="advanced:Placeholder" xmi:id="_RwG36Tk-Eeen_NygEc5WsA" elementId="org.eclipse.jdt.ui.TypeHierarchy" toBeRendered="false" ref="_RwHfGzk-Eeen_NygEc5WsA"/>
                <children xsi:type="advanced:Placeholder" xmi:id="_RwG36jk-Eeen_NygEc5WsA" elementId="org.eclipse.ui.views.ResourceNavigator" ref="_RwHfGDk-Eeen_NygEc5WsA"/>
                <children xsi:type="advanced:Placeholder" xmi:id="_RwG36zk-Eeen_NygEc5WsA" elementId="org.eclipse.ui.navigator.ProjectExplorer" toBeRendered="false" ref="_RwHfFTk-Eeen_NygEc5WsA"/>
                <children xsi:type="advanced:Placeholder" xmi:id="_RwG37Dk-Eeen_NygEc5WsA" elementId="org.eclipse.jdt.junit.ResultView" toBeRendered="false" ref="_RwHgKzk-Eeen_NygEc5WsA"/>
              </children>
              <children xsi:type="basic:PartStack" xmi:id="_RwG37Tk-Eeen_NygEc5WsA" elementId="org.eclipse.egit.ui.RepositoriesViewMStack" toBeRendered="false" containerData="4000">
                <children xsi:type="advanced:Placeholder" xmi:id="_RwG37jk-Eeen_NygEc5WsA" elementId="org.eclipse.egit.ui.RepositoriesView" toBeRendered="false" ref="_RwHgKjk-Eeen_NygEc5WsA"/>
              </children>
            </children>
            <children xsi:type="basic:PartSashContainer" xmi:id="_RwG37zk-Eeen_NygEc5WsA" containerData="8339" selectedElement="_RwG38Dk-Eeen_NygEc5WsA">
              <children xsi:type="basic:PartSashContainer" xmi:id="_RwG38Dk-Eeen_NygEc5WsA" containerData="4592" selectedElement="_RwG38Tk-Eeen_NygEc5WsA" horizontal="true">
                <children xsi:type="advanced:Placeholder" xmi:id="_RwG38Tk-Eeen_NygEc5WsA" elementId="org.eclipse.ui.editorss" containerData="7500" ref="_RwG5Yzk-Eeen_NygEc5WsA"/>
                <children xsi:type="basic:PartSashContainer" xmi:id="_RwG38jk-Eeen_NygEc5WsA" toBeRendered="false" containerData="2500">
                  <children xsi:type="basic:PartStack" xmi:id="_RwG38zk-Eeen_NygEc5WsA" elementId="org.eclipse.mylyn.tasks.ui.views.tasksMStack" toBeRendered="false" containerData="5000">
                    <children xsi:type="advanced:Placeholder" xmi:id="_RwG39Dk-Eeen_NygEc5WsA" elementId="org.eclipse.mylyn.tasks.ui.views.tasks" toBeRendered="false" ref="_RwHfujk-Eeen_NygEc5WsA"/>
                  </children>
                  <children xsi:type="basic:PartStack" xmi:id="_RwG39Tk-Eeen_NygEc5WsA" elementId="right" toBeRendered="false" containerData="5000">
                    <tags>org.eclipse.e4.secondaryNavigationStack</tags>
                    <children xsi:type="advanced:Placeholder" xmi:id="_RwG39jk-Eeen_NygEc5WsA" elementId="org.eclipse.ui.views.ContentOutline" toBeRendered="false" ref="_RwHftzk-Eeen_NygEc5WsA"/>
                    <children xsi:type="advanced:Placeholder" xmi:id="_RwG39zk-Eeen_NygEc5WsA" elementId="org.eclipse.ui.texteditor.TemplatesView" toBeRendered="false" ref="_RwHgKDk-Eeen_NygEc5WsA"/>
                    <children xsi:type="advanced:Placeholder" xmi:id="_RwG3-Dk-Eeen_NygEc5WsA" elementId="org.eclipse.ant.ui.views.AntView" toBeRendered="false" ref="_RwHgKTk-Eeen_NygEc5WsA"/>
                  </children>
                </children>
              </children>
              <children xsi:type="basic:PartStack" xmi:id="_RwG3-Tk-Eeen_NygEc5WsA" elementId="bottom" containerData="5408" selectedElement="_RwG4Ajk-Eeen_NygEc5WsA">
                <tags>org.eclipse.e4.secondaryDataStack</tags>
                <tags>Server</tags>
                <tags>General</tags>
                <tags>Debug</tags>
                <tags>Team</tags>
                <children xsi:type="advanced:Placeholder" xmi:id="_RwG3-jk-Eeen_NygEc5WsA" elementId="org.eclipse.ui.views.ProblemView" ref="_RwHfXTk-Eeen_NygEc5WsA"/>
                <children xsi:type="advanced:Placeholder" xmi:id="_RwG3-zk-Eeen_NygEc5WsA" elementId="org.eclipse.jdt.ui.JavadocView" toBeRendered="false" ref="_RwHgIjk-Eeen_NygEc5WsA"/>
                <children xsi:type="advanced:Placeholder" xmi:id="_RwG3_Dk-Eeen_NygEc5WsA" elementId="org.eclipse.jdt.ui.SourceView" toBeRendered="false" ref="_RwHgJTk-Eeen_NygEc5WsA"/>
                <children xsi:type="advanced:Placeholder" xmi:id="_RwG3_Tk-Eeen_NygEc5WsA" elementId="org.eclipse.search.ui.views.SearchView" ref="_RwHfgDk-Eeen_NygEc5WsA"/>
                <children xsi:type="advanced:Placeholder" xmi:id="_RwG3_jk-Eeen_NygEc5WsA" elementId="org.eclipse.ui.views.BookmarkView" toBeRendered="false" ref="_RwHffDk-Eeen_NygEc5WsA"/>
                <children xsi:type="advanced:Placeholder" xmi:id="_RwG3_zk-Eeen_NygEc5WsA" elementId="org.eclipse.ui.views.ProgressView" ref="_RwHffTk-Eeen_NygEc5WsA"/>
                <children xsi:type="advanced:Placeholder" xmi:id="_RwG4ADk-Eeen_NygEc5WsA" elementId="org.eclipse.tm.terminal.view.ui.TerminalsView" toBeRendered="false" ref="_RwHgLDk-Eeen_NygEc5WsA"/>
                <children xsi:type="advanced:Placeholder" xmi:id="_RwG4ATk-Eeen_NygEc5WsA" elementId="org.eclipse.wst.server.ui.ServersView" ref="_RwHfITk-Eeen_NygEc5WsA"/>
                <children xsi:type="advanced:Placeholder" xmi:id="_RwG4Ajk-Eeen_NygEc5WsA" elementId="org.eclipse.ui.console.ConsoleView" ref="_RwHfZjk-Eeen_NygEc5WsA"/>
                <children xsi:type="advanced:Placeholder" xmi:id="_RwG4Azk-Eeen_NygEc5WsA" elementId="org.eclipse.pde.runtime.LogView" toBeRendered="false" ref="_RwHg0Dk-Eeen_NygEc5WsA"/>
                <children xsi:type="advanced:Placeholder" xmi:id="_RwG4BDk-Eeen_NygEc5WsA" elementId="org.eclipse.debug.ui.DebugView" ref="_RwHghjk-Eeen_NygEc5WsA"/>
                <children xsi:type="advanced:Placeholder" xmi:id="_RwG4BTk-Eeen_NygEc5WsA" elementId="org.eclipse.team.ui.GenericHistoryView" ref="_RwHgdzk-Eeen_NygEc5WsA"/>
              </children>
            </children>
          </children>
        </children>
        <children xsi:type="advanced:Perspective" xmi:id="_RwG4Bjk-Eeen_NygEc5WsA" elementId="org.eclipse.team.ui.TeamSynchronizingPerspective" selectedElement="_RwG4Bzk-Eeen_NygEc5WsA" label="Team Synchronizing" iconURI="platform:/plugin/org.eclipse.team.ui/$nl$/icons/full/eview16/synch_synch.gif">
          <persistedState key="persp.hiddenItems" value="persp.hideToolbarSC:org.eclipse.debug.ui.commands.RunToLine,persp.hideToolbarSC:org.eclipse.jdt.ui.actions.OpenProjectWizard,persp.hideToolbarSC:print,persp.hideToolbarSC:org.eclipse.ui.edit.text.toggleShowSelectedElementOnly,"/>
          <tags>persp.actionSet:org.eclipse.mylyn.doc.actionSet</tags>
          <tags>persp.actionSet:org.eclipse.mylyn.tasks.ui.navigation</tags>
          <tags>persp.actionSet:org.eclipse.ui.cheatsheets.actionSet</tags>
          <tags>persp.actionSet:org.eclipse.rse.core.search.searchActionSet</tags>
          <tags>persp.actionSet:org.eclipse.search.searchActionSet</tags>
          <tags>persp.actionSet:org.eclipse.ui.edit.text.actionSet.annotationNavigation</tags>
          <tags>persp.actionSet:org.eclipse.ui.edit.text.actionSet.navigation</tags>
          <tags>persp.actionSet:org.eclipse.ui.edit.text.actionSet.convertLineDelimitersTo</tags>
          <tags>persp.actionSet:org.eclipse.ui.externaltools.ExternalToolsSet</tags>
          <tags>persp.actionSet:org.eclipse.ui.actionSet.keyBindings</tags>
          <tags>persp.actionSet:org.eclipse.ui.actionSet.openFiles</tags>
          <tags>persp.newWizSC:org.eclipse.ui.wizards.new.project</tags>
          <tags>persp.newWizSC:org.eclipse.ui.wizards.new.folder</tags>
          <tags>persp.newWizSC:org.eclipse.ui.wizards.new.file</tags>
          <tags>persp.viewSC:org.eclipse.team.sync.views.SynchronizeView</tags>
          <tags>persp.viewSC:org.eclipse.ui.navigator.ProjectExplorer</tags>
          <tags>persp.viewSC:org.eclipse.ui.views.ContentOutline</tags>
          <tags>persp.viewSC:org.eclipse.ui.views.TaskList</tags>
          <tags>persp.viewSC:org.eclipse.ui.views.ProblemView</tags>
          <tags>persp.actionSet:org.eclipse.team.ui.actionSet</tags>
          <tags>persp.perspSC:org.eclipse.ui.resourcePerspective</tags>
          <tags>persp.viewSC:org.eclipse.mylyn.tasks.ui.views.repositories</tags>
          <tags>persp.showIn:org.eclipse.ui.navigator.ProjectExplorer</tags>
          <tags>persp.showIn:org.eclipse.team.ui.GenericHistoryView</tags>
          <tags>persp.showIn:org.eclipse.team.sync.views.SynchronizeView</tags>
          <tags>persp.showIn:org.eclipse.tm.terminal.view.ui.TerminalsView</tags>
          <tags>persp.perspSC:org.tigris.subversion.subclipse.ui.svnPerspective</tags>
          <children xsi:type="basic:PartSashContainer" xmi:id="_RwG4Bzk-Eeen_NygEc5WsA" selectedElement="_RwG4Djk-Eeen_NygEc5WsA" horizontal="true">
            <children xsi:type="basic:PartSashContainer" xmi:id="_RwG4CDk-Eeen_NygEc5WsA" containerData="2998" selectedElement="_RwG4CTk-Eeen_NygEc5WsA">
              <children xsi:type="basic:PartStack" xmi:id="_RwG4CTk-Eeen_NygEc5WsA" elementId="top" containerData="9000" selectedElement="_RwG4Cjk-Eeen_NygEc5WsA">
                <tags>org.eclipse.e4.primaryNavigationStack</tags>
                <children xsi:type="advanced:Placeholder" xmi:id="_RwG4Cjk-Eeen_NygEc5WsA" elementId="org.eclipse.team.sync.views.SynchronizeView" ref="_RwHgLTk-Eeen_NygEc5WsA"/>
                <children xsi:type="advanced:Placeholder" xmi:id="_RwG4Czk-Eeen_NygEc5WsA" elementId="org.tigris.subversion.subclipse.ui.repository.RepositoriesView" toBeRendered="false" ref="_RwHghTk-Eeen_NygEc5WsA"/>
              </children>
              <children xsi:type="basic:PartStack" xmi:id="_RwG4DDk-Eeen_NygEc5WsA" elementId="org.eclipse.mylyn.tasks.ui.views.repositoriesMStack" containerData="1000" selectedElement="_RwG4DTk-Eeen_NygEc5WsA">
                <children xsi:type="advanced:Placeholder" xmi:id="_RwG4DTk-Eeen_NygEc5WsA" elementId="org.eclipse.mylyn.tasks.ui.views.repositories" ref="_RwHgezk-Eeen_NygEc5WsA"/>
              </children>
            </children>
            <children xsi:type="basic:PartSashContainer" xmi:id="_RwG4Djk-Eeen_NygEc5WsA" containerData="7002" selectedElement="_RwG4Dzk-Eeen_NygEc5WsA">
              <children xsi:type="advanced:Placeholder" xmi:id="_RwG4Dzk-Eeen_NygEc5WsA" elementId="org.eclipse.ui.editorss" containerData="6967" ref="_RwG5Yzk-Eeen_NygEc5WsA"/>
              <children xsi:type="basic:PartStack" xmi:id="_RwG4EDk-Eeen_NygEc5WsA" elementId="top2" containerData="3033" selectedElement="_RwG4FDk-Eeen_NygEc5WsA">
                <tags>org.eclipse.e4.secondaryDataStack</tags>
                <tags>General</tags>
                <children xsi:type="advanced:Placeholder" xmi:id="_RwG4ETk-Eeen_NygEc5WsA" elementId="org.eclipse.team.ui.GenericHistoryView" ref="_RwHgdzk-Eeen_NygEc5WsA"/>
                <children xsi:type="advanced:Placeholder" xmi:id="_RwG4Ejk-Eeen_NygEc5WsA" elementId="org.eclipse.ui.views.TaskList" ref="_RwHfZTk-Eeen_NygEc5WsA"/>
                <children xsi:type="advanced:Placeholder" xmi:id="_RwG4Ezk-Eeen_NygEc5WsA" elementId="o("auto", [curCSSTop, curCSSLeft]) > -1,
			props = {}, curPosition = {}, curTop, curLeft;

		// need to be able to calculate position if either top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;
		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {
			options = options.call( elem, i, curOffset );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );
		} else {
			curElem.css( props );
		}
	}
};


jQuery.fn.extend({

	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset,
			parentOffset = { top: 0, left: 0 },
			elem = this[ 0 ];

		// fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is it's only offset parent
		if ( jQuery.css( elem, "position" ) === "fixed" ) {
			// we assume that getBoundingClientRect is available when computed position is fixed
			offset = elem.getBoundingClientRect();
		} else {
			// Get *real* offsetParent
			offsetParent = this.offsetParent();

			// Get correct offsets
			offset = this.offset();
			if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
				parentOffset = offsetParent.offset();
			}

			// Add offsetParent borders
			parentOffset.top  += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
			parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
		}

		// Subtract parent offsets and element margins
		// note: when an element has margin: auto the offsetLeft and marginLeft
		// are the same in Safari causing offset.left to incorrectly be 0
		return {
			top:  offset.top  - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true)
		};
	},

	offsetParent: function() {
		return this.map(function() {
			var offsetParent = this.offsetParent || document.documentElement;
			while ( offsetParent && ( !jQuery.nodeName( offsetParent, "html" ) && jQuery.css( offsetParent, "position") === "static" ) ) {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent || document.documentElement;
		});
	}
});


// Create scrollLeft and scrollTop methods
jQuery.each( {scrollLeft: "pageXOffset", scrollTop: "pageYOffset"}, function( method, prop ) {
	var top = /Y/.test( prop );

	jQuery.fn[ method ] = function( val ) {
		return jQuery.access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? (prop in win) ? win[ prop ] :
					win.document.documentElement[ method ] :
					elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : jQuery( win ).scrollLeft(),
					top ? val : jQuery( win ).scrollTop()
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length, null );
	};
});

function getWindow( elem ) {
	return jQuery.isWindow( elem ) ?
		elem :
		elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
}
// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name }, function( defaultExtra, funcName ) {
		// margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return jQuery.access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {
					// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
					// isn't a whole lot we can do. See pull request at this URL for discussion:
					// https://github.com/jquery/jquery/pull/764
					return elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height], whichever is greatest
					// unfortunately, this causes bug #3838 in IE6/8 only, but there is currently no good, small way to fix it.
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?
					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable, null );
		};
	});
});
// Limit scope pollution from any deprecated API
// (function() {

// })();
// Expose jQuery to the global object
window.jQuery = window.$ = jQuery;

// Expose jQuery as an AMD module, but only for AMD loaders that
// understand the issues with loading multiple versions of jQuery
// in a page that all might call define(). The loader will indicate
// they have special allowances for multiple jQuery versions by
// specifying define.amd.jQuery = true. Register as a named module,
// since jQuery can be concatenated with other files that may use define,
// but not use a proper concatenation script that understands anonymous
// AMD modules. A named AMD is safest and most robust way to register.
// Lowercase jquery is used because AMD module names are derived from
// file names, and jQuery is normally delivered in a lowercase file name.
// Do this after creating the global so that if an AMD module wants to call
// noConflict to hide this version of jQuery, it will work.
if ( typeof define === "function" && define.amd && define.amd.jQuery ) {
	define( "jquery", [], function () { return jQuery; } );
}

})( window );
