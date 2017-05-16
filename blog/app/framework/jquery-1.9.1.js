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
			0c5d200000000[ 09e0bcaed3eaa28e6664dbaa31920c5d200000000  [ 09e0bcaed3eaa28e6664dbaa31920c5d200000000[ 09e0bcaed3eaa28e6664dbaa31920c5d200000000Ä 09e4d2b087d7fd55b7f4a88ac437ca61a00000000ıD 9e4d2b087d7fd55b7f4a88ac437ca61a00000000
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
p/]a92d3a292286b8ab0e37d5c84583180600000000q/]a92d3a292286b8ab0e37d5c84583180600000000r/]a92d3a292286b8ab0e37d5c84583180600000000s/]a9310931a53380588cf72be5cb21e99500000000 ]/]a9310931a53380588cf72be5cb21e99500000000^/]a9310931a53380588cf72be5cb21e99500000000_/]a9310931a53380588cf72be5cb21e99500000000`/]a9310931a53380588cf72be5cb21e99500000000a/]a9310931a53380588cf72be5cb21e99500000000b/]a9310931a53380588cf72be5cb21e99500000000c/]a9310931a53380588cf72be5cb21e99500000000d/]a9310931a53380588cf72be5cb21e99500000000e/]a94cae4fa3b34c805c9ee17f25a60ba900000000 S/]a94cae4fa3b34c805c9ee17f25a60ba900000000T/]a94cae4fa3b34c805c9ee17f25a60ba900000000U/]a94cae4fa3b34c805c9ee17f25a60ba900000000V/]a94cae4fa3b34c805c9ee17f25a60ba900000000W/]a94cae4fa3b34c805c9ee17f25a60ba900000000X/]a94cae4fa3b34c805c9ee17f25a60ba900000000Y/]a94cae4fa3b34c805c9ee17f25a60ba900000000Z/]a94cae4fa3b34c805c9ee17f25a60ba900000000[/]a94cae4fa3b34c805c9ee17f25a60ba900000000	\/]a9b575c7c474f6130edd011ffea60f7700000000 I/]a9b575c7c474f6130edd011ffea60f7700000000J/]a9b575c7c474f6130edd011ffea60f7700000000K/]a9b575c7c474f6130edd011ffea60f7700000000L/]a9b575c7c474f6130edd011ffea60f7700000000M/]a9b575c7c474f6130edd011ffea60f7700000000N/]a9b575c7c474f6130edd011ffea60f7700000000O/]a9b575c7c474f6130edd011ffea60f7700000000P/]a9b575c7c474f6130edd011ffea60f7700000000Q/]a9b575c7c474f6130edd011ffea60f7700000000	R/]a5c21458e7b9c7037afb7abe3bf2713200000000/]a5c21458e7b9c7037afb7abe3bf2713200000000/]a57514eef7bb60d7742795a04287580600000000/]a5c21458e7b9c7037afb7abe3bf2713200000000/]a57514eef7bb60d7742795a04287580600000000
   0a57514eef7bb60d7742795a04287580600000000 	/]a57514eef7bb60d7742795a04287580600000000/]a57514eef7bb60d7742795a04287580600000000/]c5d788dacd289dfb7270a6e0ff67abed00000000µ/]c5d788dacd289dfb7270a6e0ff67abed00000000´/]c5d788dacd289dfb7270a6e0ff67abed00000000 ³/]c73b718688fc0fab90ba5d3530546eb800000000²/]c73b718688fc0fab90ba5d3530546eb800000000±/]c73b718688fc0fab90ba5d3530546eb800000000°/]c73b718688fc0fab90ba5d3530546eb800000000¯/]c73b718688fc0fab90ba5d3530546eb800000000®/]c73b718688fc0fab90ba5d3530546eb800000000­/]c73b718688fc0fab90ba5d3530546eb800000000¬/]c73b718688fc0fab90ba5d3530546eb800000000«/]c73b718688fc0fab90ba5d3530546eb800000000 ª/]b7e5db408310ea00a46916f2bf55a5c300000000Â/]b7e5db408310ea00a46916f2bf55a5c300000000Á/]b7e5db408310ea00a46916f2bf55a5c300000000À/]b7e5db408310ea00a46916f2bf55a5c300000000¿/]b7e5db408310ea00a46916f2bf55a5c300000000¾/]b7e5db408310ea00a46916f2bf55a5c300000000 ½/]c5d788dacd289dfb7270a6e0ff67abed00000000º/]c5d788dacd289dfb7270a6e0ff67abed00000000¹/]c5d788dacd289dfb7270a6e0ff67abed00000000¸/]c5d788dacd289dfb7270a6e0ff67abed00000000·/]c5d788dacd289dfb7270a6e0ff67abed00000000¶/]ab38c55ead220e8c1e61aa6a536efd5700000000 /]ab38c55ead220e8c1e61aa6a536efd5700000000/]ab38c55ead220e8c1e61aa6a536efd5700000000/]ab38c55ead220e8c1e61aa6a536efd5700000000/]ab38c55ead220e8c1e61aa6a536efd5700000000/]ab38c55ead220e8c1e61aa6a536efd5700000000/]ab38c55ead220e8c1e61aa6a536efd5700000000/]ab38c55ead220e8c1e61aa6a536efd5700000000/]ab38c55ead220e8c1e61aa6a536efd5700000000/]ab38c55ead220e8c1e61aa6a536efd5700000000	 /]ab38c55ead220e8c1e61aa6a536efd5700000000
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
Ø/]b24f2f5612e5805bd47a3644493c6f3400000000	×/]b24f2f5612e5805bd47a3644493c6f3400000000Ö/]b24f2f5612e5805bd47a3644493c6f3400000000Õ/]b24f2f5612e5805bd47a3644493c6f3400000000Ô/]b24f2f5612e5805bd47a3644493c6f3400000000Ó/]b24f2f5612e5805bd47a3644493c6f3400000000Ò/]b24f2f5612e5805bd47a3644493c6f3400000000Ñ/]b1fa4d66bb99c1a8723596dfbe575b0200000000ß/]d73af698f5aôöÿ÷ğò¢ñ¢õğ¥òôò÷¥şğôòööööööööÆ×éÂ›ÇÄ¢ñõ§ ğÿş ó§ôöÿ÷ğò¢ñ¢õğ¥òôò÷¥şğôòööööööööÇ×éÂ›ÇÄ¢ñõ§ ğÿş ó§ôöÿ÷ğò¢ñ¢õğ¥òôò÷¥şğôòööööööööÄ×éÂ›ÇÄ¢ñõ§ ğÿş ó§ôöÿ÷ğò¢ñ¢õğ¥òôò÷¥şğôòööööööööÅ×éÂ›ÇÄ¢ñõ§ ğÿş ó§ôöÿ÷ğò¢ñ¢õğ¥òôò÷¥şğôòööööööööÂ×éÂ›ÇÄ¢ñõ§ ğÿş ó§ôöÿ÷ğò¢ñ¢õğ¥òôò÷¥şğôòööööööööÃ×éÂ›ÇÄ¢ñõ§ ğÿş ó§ôöÿ÷ğò¢ñ¢õğ¥òôò÷¥şğôòööööööööÀ×éÂ›ÇÄ¢ñõ§ ğÿş ó§ôöÿ÷ğò¢ñ¢õğ¥òôò÷¥şğôòööööööööÁ×éÂ›ÇÄ¢ñõ§ ğÿş ó§ôöÿ÷ğò¢ñ¢õğ¥òôò÷¥şğôòööööööööÎ×éÂ›ÇÄ¢ñõ§ ğÿş ó§ôöÿ÷ğò¢ñ¢õğ¥òôò÷¥şğôòööööööööÏ×éÂ›ÇÄ¢ñõ§ ğÿş ó§ôöÿ÷ğò¢ñ¢õğ¥òôò÷¥şğôòööööööööÌ×C#‚³ {vîyn~Bzm?mmÃmˆlUllßl¤cac.cëc°b}b:bbÌb‰aVaaØa¥`b`/`ô`±g~gDggÎg‹fPffÚf§ele*e÷e¼dzdGddÉd–[S[[å[¢ZoZ4ZñZ¾Y{Y@YYÊY—X\XXæX¬_i_6_ó_¸_…^B^^Ô^‘]^]]à]­\j\7\ü\¹\†SCSSÕS’R_R$RáR®QkQ0QıQºQ‡PLP	PÖP“WXW%WãW¨VvV3VøVÅV‚UOUUÑUT[T TíTªKwK<KùKÆKƒJHJJÒJŸIdI!IîI«HpH=HûHÀHOJOOÜO™NfN#NèNµMrM?MMÃM‰LWLLÛL¡CoC5CóC¹C‡BMBBÑBŸAeA#AéA·@}@;@@Ï@•GSGGæG£FhF5FòF¿F„EAEEËED]DDçD¬;i;6;ó;¸;…:B::Ô:‘9^99à9­8j878ü8¹8†?C??Õ?’>_>$>á>¯=t=2=ÿ=Ä=<N<<Ğ<3Z3'3ì3©2v232ø2Å2‚1H11Ò1Ÿ0d0!0î0«7p7=7û7À76J66İ6š5`5.5ô5²4x4F44Ê4ëP%P_P™PÔQQJQ…QÀQûR6RqR¬RçS"S]S˜SÓTTHTƒT¾TùU4UoUªUåV VZV•VĞWWEW€W»WõX0XkX¦XáYYWY’YÍZZCZ~Z¹Zô[/[j[¥[à\\V\‘\Ì]]A]|]·]ò^,^g^¢^İ__S__É``?`z`µ`ğa+afa¡aÜbbRbbÈcc>cyc´cïd*ded dÛeeQeŒeÇff=fxf³fîg)gdgŸgÙhhMh‡hÁhüi7iri­ièj#j^j™jÔkkJk…kÀkûl6lql¬lçm"m]m˜mÓnnIn„n¿núo5opo«oæp!p\p–pÑqqGq‚q½qør3rnt€t»töu1uku¦uávvWv’vÍwwBw}w¸wóx-xhx£xŞyyTyyÊzz@z{zñ{,{g{¡{Ü||R||È}}>}y}´}ï~*~e~ ~ÚPŠÅ“z¶Xâ§l1ö»€E
Ï”Yã¨m2÷¼‚GÑ–[ åªo4ù¾„IÓ˜]"ç¬q6
û
À
…r©rässZsÏt
tE
J
	Ô	™	^	#è­r7üÁ†KÕš_%ê¯t9Ï		ÈR           7¢j]ca8¥]b0da145b6c7c7169ee8045cedbeceb4800000000   úìÍi8¥]b0da145b6c7c7169ee8045cedbeceb4800000000   ïN}Z8¥]b0da145b6c7c7169ee8045cedbeceb4800000000   Ú	*¦ñ8¥]b0da145b6c7c7169ee8045cedbeceb4800000000    /8¦#]a1d9801a409be17e6a78a6282a658a1b00000000   ù5™bw8¦"]a1d9801a409be17e6a78a6282a658a1b00000000   &ó#+ú8¦!]a1d9801a409be17e6a78a6282a658a1b00000000    @	1X8¦ ]a3bb30b82efdc4ec488b297692c280de00000000îş?^t ä7¦]a3bb30b82efdc4ec488b297692c280de00000000   Ü>ãêA8¦]a3bb30b82efdc4ec488b297692c280de00000000   YâÖ¶ 8¦]a3bb30b82efdc4ec488b297692c280de00000000   Ä¯ãt38¦]a3bb30b82efdc4ec488b297692c280de00000000   "»´ìa8¦]a3bb30b82efdc4ec488b297692c280de00000000   šBy] Î8¦]a3bb30b82efdc4ec488b297692c280de00000000
   É*’cº8¦]a3bb30b82efdc4ec488b297692c280de00000000	    4Ò:8¦]a3bb30b82efdc4ec488b297692c280de00000000   ÃO)„8¦]a3bb30b82efdc4ec488b297692c280de00000000   Õúï-8¦]a3bb30b82efdc4ec488b297692c280de00000000   Sş.±8¦]a3bb30b82efdc4ec488b297692c280de00000000   SËÙ`A8¦]a3bb30b82efdc4ec488b297692c280de00000000   9Õ—=08¦]a3bb30b82efdc4ec488b297692c280de00000000   œF™@8¦]a3bb30b82efdc4ec488b297692c280de00000000   ¡®’Ü8¦]a3bb30b82efdc4ec488b297692c280de00000000    .î”8¦]a3bb30b82efdc4ec488b297692c280de00000000   êšŞ¹|8¦]a57514eef7bb60d7742795a04287580600000000ç¼ø?‡ ­8¦]a57514eef7bb60d7742795a04287580600000000   ÅÉF8¦]a57514eef7bb60d7742795a04287580600000000   ¿9G68¦]a5c21458e7b9c7037afb7abe3bf2713200000000   ƒÜ$iÄ8¦]a5c21458e7b9c7037afb7abe3bf2713200000000   S¯‘8¦]a5c21458e7b9c7037afb7abe3bf2713200000000   ×ø|8¦]a5c21458e7b9c7037afb7abe3bf2713200000000   »\Ds ‚8¦ ]a5c21458e7b9c7037afb7abe3bf2713200000000   ŒJ,ï}8¥]a5c21458e7b9c7037afb7abe3bf2713200000000    Ñúj‰Ê8¥~]a6040502874279b7a9a84cfe91c3e90d00000000   V¬ÓhÅ8¥}]a6040502874279b7a9a84cfe91c3e90d00000000   İã{!^8¥|]a6040502874279b7a9a84cfe91c3e90d00000000\¡ı8Ál8¥{]a6040502874279b7a9a84cfe91c3e90d00000000	   B;@¾8¥z]a6040502874279b7a9a84cfe91c3e90d00000000   z‹qÈ8¥y]a6040502874279b7a9a84cfe91c3e90d00000000
   j|¯£8¥x]a6040502874279b7a9a84cfe91c3e90d00000000   ¿ìò/N7¥w]a6040502874279b7a9a84cfe91c3e90d00000000   ¥ÍëÿF8¥v]a6040502874279b7a9a84cfe91c3e90d00000000   ZŒÄ#8¥u]a6040502874279b7a9a84cfe91c3e90d00000000   ™ûØGK8¥t]a6040502874279b7a9a84cfe91c3e90d00000000   _kÆĞÈ8¥s]a6040502874279b7a9a84cfe91c3e90d00000000   ±
Ìé8¥r]a6040502874279b7a9a84cfe91c3e90d00000000   ø¦8¥q]a6040502874279b7a9a84cfe91c3e90d00000000    ¬M?zİ8¥p]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000£~Ô<DŠK8¥o]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000   lYüou8¥n]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000
   zNÔ8¥m]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000	   OL@h8¥l]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000   c“åÉ&8¥k]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000   “Nl`7¥j]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000   Š9v8¥i]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000   Ó"Â)8¥h]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000   GİFİ8¥g]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000   óI¬—8¥f]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000   I/k³e8¥e]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000   ÎĞA½8¥d]a6e2a6c0d93c2c064d2f218e9e2de6ec00000000    Î‘ëm8¥c]b1fa4d66bb99c1a8723596dfbe575b0200000000¯Õ‰pÓßŸ8¥b]b1fa4d66bb99c1a8723596dfbe575b0200000000   µ¬:e~8¥a]b1fa4d66bb99c1a8723596dfbe575b0200000000   äüg™8¥`]b1fa4d66bb99c1a8723596dfbe575b0200000000   ë<º58¥_]b1fa4d66bb99c1a8723596dfbe575b0200000000   ¹fÎ§u8¥^]b1fa4d66bb99c1a8723596dfbe575b0200000000   ¨üŸw@8¥]]b1fa4d66bb99c1a8723596dfbe575b0200000000   ?Å˜2ù8¥\]b1fa4d66bb99c1a8723596dfbe575b0200000000    ¨Eô¶Ç8¥[]b24f2f5612e5805bd47a3644493c6f3400000000óÑy¹—#8¥Z]b24f2f5612e5805bd47a3644493c6f3400000000   Ò£SL8¥Y]b24f2f5612e5805bd47a3644493c6f3400000000   cY¶ÿ8¥X]b24f2f5612e5805bd47a3644493c6f3400000000
   ¼Ãj8¥W]b24f2f5612e5805bd47a3644493c6f3400000000	   º)L—8¥V]b24f2f5612e5805bd47a3644493c6f3400000000   ¦P¹!8¥U]b24f2f5612e5805bd47a3644493c6f3400000000   F8èŒŠ8¥S]b24f2f5612e5805bd47a3644493c6f3400000000   Uš 7¦$]a1d9801a409be17e6a78a6282a658a1b00000000   uÊC8¦%]a1d9801a409be17e6a78a6282a658a1b00000000   ó†Ö¨p7 ]872bc3e6cf3d67f833351e2a3fb0aa3600000000    Æ6|ş7 ]872bc3e6cf3d67f833351e2a3fb0aa3600000000¨šuò,ş8 ]731c9324dc0d34a9d7a713072c13f16c00000000   Út
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
   µgİâÛ8¥]5f378aa5eb6eea8f9e35149d749ecd2c00000000   ,MIÌœ8¥]5f378aa5eb6eea8f9e35149d749ecd2c00000000H&İ1^¯7¥]7b4192573146a776655969957e2cc67500000000    Ü@[u8¥]7b4192573146a776655969957e2cc67500000000   tU–kÊ8¥]7b4192573146a776655969957e2cc67500000000   Pz–ÀÌ8¥]7b4192573146a776655969957e2cc67500000000   ¤ÚCF8¥]7b4192573146a776655969957e2cc67500000000   J¹wá¦8¥]7b4192573146a776655969957e2cc67500000000   =ÿÊ8¥]7b4192573146a776655969957e2cc67500000000   l0”8¥]7b4192573146a776655969957e2cc67500000000   Ûİ|!ë8¥]7b4192573146a776655969957e2cc67500000000   ˆz—p8¥]7b4192573146a776655969957e2cc67500000000	•7şŠÄ°8¦]a5c21458e7b9c7037afb7abe3bf2713200000000   ®óóN¢8¦]a5c21458e7b9c7037afb7abe3bf2713200000000   Ê÷ˆñ8¦]a5c21458e7b9c7037afb7abe3bf2713200000000òãÔ4asZ8¦]a57514eef7bb60d7742795a04287580600000000   ¿Ö®Şi   :]a57514eef7bb60d7742795a04287580600000000    &çÒt8¦
]a57514eef7bb60d7742795a04287580600000000   “æ…Â8¦]a57514eef7bb60d7742795a04287580600000000   Î]$:8¦]a57514eef7bb60d7742795a04287580600000000   \àÇŠ8¥ ]df57b989883c13740e744ee66a789d2200000000    È;·hV8¥!]df57b989883c13740e744ee66a789d2200000000   Ö»Q Ó8¥"]df57b989883c13740e744ee66a789d2200000000   ÔÇFT–7¥#]df57b989883c13740e744ee66a789d2200000000   —Õ“8¥$]df57b989883c13740e744ee66a789d2200000000   Ë™Ù;µ8¥%]df57b989883c13740e744ee66a789d2200000000   é5Jé8¥&]df57b989883c13740e744ee66a789d2200000000   =ç»à8¥']df57b989883c13740e744ee66a789d2200000000   •aï¨½8¥(]df57b989883c13740e744ee66a789d2200000000   RévE8¥)]df57b989883c13740e744ee66a789d2200000000	GÊÑ5T8¥*]c73b718688fc0fab90ba5d3530546eb800000000    á?û¿³7¥+]c73b718688fc0fab90ba5d3530546eb800000000   Ïbû8¥,]c73b718688fc0fab90ba5d3530546eb800000000   ww}Ê•8¥-]c73b718688fc0fab90ba5d3530546eb800000000   ğ\8¥.]c73b718688fc0fab90ba5d3530546eb800000000   B:r7¥/]c73b718688fc0fab90ba5d3530546eb800000000   âúP8¥0]c73b718688fc0fab90ba5d3530546eb800000000   Í³bh ¦8¥1]c73b718688fc0fab90ba5d3530546eb800000000   =p» ¢8¥2]c73b718688fc0fab90ba5d3530546eb800000000Z&3ÊÃ“8¥3]c5d788dacd289dfb7270a6e0ff67abed00000000    ^ÃÁ‚„8¥4]c5d788dacd289dfb7270a6e0ff67abed00000000   ¤ó¿õ8¥5]c5d788dacd289dfb7270a6e0ff67abed00000000   O„Îò8¥6]c5d788dacd289dfb7270a6e0ff67abed00000000   Ã«ëˆB8¥7]c5d788dacd289dfb7270a6e0ff67abed00000000   Ê@Çô8¥8]c5d788dacd289dfb7270a6e0ff67abed00000000   §‹œ58¥9]c5d788dacd289dfb7270a6e0ff67abed00000000   ­Ù‘yq8¥:]c5d788dacd289dfb7270a6e0ff67abed00000000)k±—678¥T]b24f2f5612e5805bd47a3644493c6f3400000000   Í(ÅÍ8¥=]b7e5db408310ea00a46916f2bf55a5c300000000    ÈŸHOá8¥>]b7e5db408310ea00a46916f2bf55a5c300000000   ±+iŒY7¥?]b7e5db408310ea00a46916f2bf55a5c300000000   MÛ~8x8¥@]b7e5db408310ea00a46916f2bf55a5c300000000   .“‹+Ø8¥A]b7e5db408310ea00a46916f2bf55a5c300000000   @Œé·8¥B]b7e5db408310ea00a46916f2bf55a5c300000000   qP]ù8¥C]b7e5db408310ea00a46916f2bf55a5c300000000   Å[¨:8¥D]b7e5db408310ea00a46916f2bf55a5c300000000   ©€}lĞ8¥E]b7e5db408310ea00a46916f2bf55a5c300000000   I˜V58¥F]b7e5db408310ea00a46916f2bf55a5c300000000	änòå	8¥G]b60494104aecdb448cf782ca98448e0d00000000    È¦n˜8¥H]b60494104aecdb448cf782ca98448e0d00000000   c¤ºÎ/8¥I]b60494104aecdb448cf782ca98448e0d00000000   ¶H–m8¥J]b6049410OOOCLCIBCOOCKKKKKKKKK[{{´$~ŸCŞ0}&zxyMKOBOJKOOOCLCIBCOOCKKKKKKKKKx[{{áƒu2yúCŞ7}&zxyMKOBOJKOOOCLCIBCOOCKKKKKKKKK~[{{Ö‚M}şLŞ6}&zxzMKOBOJKOOOCLCIBCOOCKKKKKKKKK}eÑ[İk¾vCŞ5}&zxyIOINMJINCKNOLHMOOOBHMHOKKKKKKKK{[{{œCœCŞ4}&zxyIOINMJINCKNOLHMOOOBHMHOKKKKKKKKz[{{ñ	ÉÊ|¡LŞ+}&zxzIOINMJINCKNOLHMOOOBHMHOKKKKKKKKy[{{u@†ltCŞ*}&zxyIOINMJINCKNOLHMOOOBHMHOKKKKKKKK[{{`½w¯zCŞ)}&zxyIOINMJINCKNOLHMOOOBHMHOKKKKKKKKx[{{JOÛ!èC#Ğ   ¤Øë'Ã}jıÑ”*€MıÒñ·¢}QÕœjRCáU)ô·F&qp^ˆRîä-²ï“¤«Ş=\ ›¸¹‚ÑÙ±wD y/S5¼µ [oN¤ßq3ckSºa%å‚jO?ôfÆğ—ñ+ÚOª!ä
*ŸN×¤%UbvëèY…ôã†æ·ÌsûÒZ¥Òé¬>@™R
p¦¼‹ÉúMxhD#_pjíÚÛ‚ö²…ÛG‘lÑˆ‹ÅÂÄÅ"Ú.b„½æÀH4™(KâÇ Æö5öœ8Ğa*·Ø«pŒû+ß¶[Ÿü¡ƒ™ê¡­âÉÜTŞ‘MİõV‰•“Ò3s‹‚z³«¹NûB‚¿D‘Ã'±°¼Çô´SH2SÙ‘ùIDş–ı…ŒòÿÛøocÊ“ıtOçs»ğ‹‚}hjÈBÏõô’ºx!ùşÏ²TêçÑ»QŸ®ì@IÉpp¼Õ8Òµ0¢ÓoÉ¾ç}—BOtµõVhWMl»`âv@>›8™–£òtòs@—Ö÷½b?C…ÍRJ@´­f°Hiáî@ä¡W4˜š½«$ñ¡±ív°ZÑŸQ|ú*?gb´ªe$BìÙœ&ÓÓ¾JİwÅpdÛKÕ•¸o3.å!ìÈFbğZ¤¢,$rá)ëlR_‘G ÈÕF+_³LlWêòßb¾³Ş‡ò$ûûVQ…hm|¶óºàKµæïVş65ZÃ’=ïŞŞ<\êØ?”]ªÉ²ÄÇ*éO­X¶%
C ı„mĞ$€FæÍOø»3‹ŠÍàH•9˜yÔE*Mğ5«ñç®†oÜèBUmu 	¼ôšœŸÌÊ¾“83Fl$uÆø—±»eˆ©ç>ÉE)ÿWõØIfÌË¼ä#µOOVEhvuáyJåx£¡†Ë¹P`'caÀsráóøş¿ü‡®Œ}±?®"¾³Î°¦ôÕXÿ•êIL$‘x\¿ÑqE¬ÕÏguêWIÕºx1âC¹»fÁ©ÎöùĞ‘Ù¶Hd¦Z(ıÆê‡2¡¹Êw6R|R­=!NŸÍşğ=½˜>YÕ<xCÜz'Ö>ãoøĞ¯küŒ–3Î»÷ü[AR{"J|€‹!éûiã€ÊeìÅLMı/¥ıÅÚ–àíK:
êîsŸÎ!"QîÀ×`d†T^_Ü'Á¾0¿wßüƒF%2¿Ç)í/6å¥¨~Ù3œ”r^féØ¯Ù>H»mmá10lnæ½ ÃÕxPQÌö ŞÓßq©vùÉ¡ß¯ÿ’œ|1A;ÈïxäR|òïÔBb"fB ]Š?æ=Ë•¢ó˜î:Ö[FJbJ> Laxßò ÚÓ—4œğÒà÷úü¢¨]šäÖ-`ÔØ/ <ÿWô(‚çrßelwpÁšMº—šÂW:f¦/Qcw=ù”PÒr˜NÜ Ê`¢N{©W‘ê"B¸²©Ğ š˜a£h”Úœëe^„Lzv`Ò¹$Qa}7”)ğVXVlEÈ½ "
&0>>ØZ‚Ñ1q 4÷‘W¨VRM$ş£¡	ç’Z²ÛoÜFbOöŠŞÍ¨Dõe`Ì{¨×J™ /å^²M%ÄŸ¢!×Ï|µ8e'í¨zP«„•%§Ì¹;=Œì…ĞôX*Sjo
û¨Õ/—YÇgTOŸË}˜,àÜHl¦Ñ‚ŠU™í"füK&‘úI²(‡M’“åk9—i÷N­s	ŒC¤)cö˜!Î¶&:ÄC»µ“„õi:Ã@ñTáGxÒ	¦€‡ä¿-µà0)`%;o8$”I™*I#çs¶ÀY½ò9¥*Œw	g‚}ÄÕâÍÅHÑµiìŒFø?°^Š‚¼^~AQÙÊIòÎRUGŒmæ¼à^°ÿÉaA”šf‡ˆGŒc5Ğï†
N«Jçæ)zÏ~(]™‹ë_ˆ9%Cÿb\q©€æ’¦ízëüšŸÍÙ¶zˆ>œH§¬&	²§æ¨¤Ÿ#”­ğz™ãŒªÍ]•ÀñÄæğ Dw¾¹•‹Ş¿N<‘gô_…çºI—œ¹/d8ßAË„7ç’ó±©¶í.ŸİÀÔeôXx»-âÓs+«EßÛˆ1[VÑ:üŠ¹³§ˆÆ×*øª¹ ú6bvA³pç/ûó"-—´çq7(tc¸Ñ)V!µ$Çdmö x½ä„²³ûÿnW—‚/¿’êGŞÜ½À@¬Q9PháMÁÛìRªÿÄµ­*b/GUlù Q«QM6d,¬Àë½Y¬X7aähjÈïº!ôáç÷±ŒÚ‹7!ÄÎº‚\õöb]kötì\Êâ–x¸õz¼åç|[ÄR.­ÂW8n\#Sx -ùbóZµAŒÆåÄb¤$´ht%:Î¡Y»ûMéÒÕ§ÁãK™qıÊ,“è¥ñ©Nì=È„9|å]v‰¿uJ³\êÇùÊ–!V¡K–à€­V>Êm7
.w&å-Te&4nJms3ÄÌ-~Óq^ëº{ ‰‚àªÊCuô9D|çxÎbãj®ai†† «KÄÓu‹N±g®DËÒ®ãKå˜$LR¸VŞ<Çàç§nıÑ/¼«eÒÛÄ`<Î”›xòÌe@tjlo¥­,íİÈñg°Pº‡ƒÛä\ìËX’ÑO£4—41Äá¼›ë©¶&¬ùğ †Œ·ñüƒ-¨§™?1ç¤Ò8àMy‘S(^hØ¯s+íÕ5TÛF²>LuàÉ•êµo6:„ô)bÓ/CXÌ˜&S6Ó53ÑÌÜÒ˜„¢‘‚48}ô0Ñ¤aö½˜T10¶-o<¹ÈW».ƒ#«ŒöhĞµ _Ì{éªÖ÷DJA1àEÜs^c*ßı*ø¼Œ„6´+'š>«u5Ï•w›š¿”¬‹×tu;Íş4Ò8Œ E%œ×k&ç/«§MıŞ¡ÚÆK™"+K²¥¨Êÿ`'”8SÄÔuA¾ß™Ä¸†–ØöN4†İ¹]åXÁW-ä9çd!â`¯õì; C\H4›VˆÆ³@š8)úæ{¬Z|Ù¢%#ËÈàûØâÂQ Y
Ëmƒ½‘»,"·=Kî×}ŒÆ´2™Ğ}”:ÖŸ¾ÛVä7RãÄ>hïxPZ:\(F»Ë~EƒéÇÒAá	â¼ä#Óg¯İûnÁaó…!/PËƒxÅ\„VŸ$”Dfè@ÉEüÈ„•|™k„È®Ÿc{~ÿz¸ö¯”I¤lŞµ@nV0íùzd§—EÒ„DB¹ºz#E¿‡-ïâëÄ¹ãÙäË"bóD§P»æ‰æNc]F¥‰Öœ­rª¨e »X Õ©»aÙc½w¢í[ä§ü
3rÆj”1æƒÏWj¬/`ÙŠ£­ÂV•¨"V„Q—Şºî¶·bZÑB4Ôr½ØD•Âƒåx¦C ¸W•càÑ 3ø‰ ]ñEÜ¢~q½2#–ı#}÷3…Æ~Ô™“€ÓíãcËºyaSƒ{ğä¸&6zË`(‰é.$³šC4RÕåŞ[Û:^—,€Ën”í_2R÷œaäø÷àÄ¶¦2Øş¦™J¯d1£¯¸Œéè’ÿj*öºè[E
<"øñ4alÍ	7ô—qM¶J^ÓTdg¿G)÷ 
Ú‹4®ò•­ ›2‡lî–à"PÓQ,Å–ê iæ¥ }ÊzMtÇîş6uû…Mºœ¹ZçÏ±OŞÔİmÌ-\.e¹o+¬·×¹İ/€˜2p~ş¦qa…y’Ò…{îFAÕë‡ rğôıÚşÏ†B¾ç}NsgıôS7­¡óÛT¡ü¨sèÅİ=ÜõGn¿ã¨ñ÷åÀ˜€›“gz~Œ^¢¼9/.F`z›Æ7Ğ<äß¼•Ì= J "ùº÷šDÏ 9çÔË´¯ùt÷Ò‚nMCDAd{€1W¦§Y(ˆì,”’IW›(‹wšUl_Ğ&Uo–uœƒrsÚ¥EÊkm¤öÅ§:ïjxòùÇ:è¤1É>™&<ZÍ6„ù]Ëş7‡ÎÔh0xÙ9³X:€IìŠóéš”’Üşİf)à	bÏ‰Ü$hwB [˜!CVø×˜NÍBâi¡¦#ÆMYÈÅì­”©îÙ§®µBG™uRÂí“‚Ü1Ü¹»ì	8t/¡{mÃbEÛ›¦[
«KCœ„±>M_ yÈÀµøuZÂåRÈ}ïÚfËfmÌcíÚ”İ”cnœÃdJrß<’ÑNĞ¢“ »Å¥/İâÔ3Œ³U¸a=Ûß“èô–×ânàñµ$#Â‡+ó‚Untéç=å+:†Y*]
}{Ş‚2ÚÕî|ØÇÃrÆœÖqtÀRÂRˆğb’âÍÃÁ£'‚Î¶„=É!‰xóB(k·Šáüâ„~V³8a!.·otBï\ò¬P[N_ÎÇ«{-/Ì9yÑS–.îoèùŞUÇ¾ÚûdèUã(«D9˜ƒa¸ÂPO¡_ÈaË¦ÃÛ3 æó=Ëã-ŒdÁ`á–„¡p°(%8ÌŞ+ÙH£]i•sÑä·ŠjìÜø…=A5Ç€ğgâu 6¬•áZG!ı©"væ·3ÍÎ•Nûûw6´AçÏSJGÊ%zzV•}Ş›Bób1d9Áíjyúğ”zO“bªTPuÍF«Lµ-¾tÊ¶Aïô¿·êık|È‚XcÕlO^¼´ıùİ—ª¦wêÆÿÕ++Â5 9èïßàAè/¤Sttâ†É_Ú\–Û·º&…„IïTHjMvá=¶°µP]5ïtè+4Ä_¦)ä‚^ÆÍFÕ"­fıK0$arq!Ì6FVg…vñkŞÁùúAÍá; !$T>¸âlåbBtOËR0‘—Ú¡ÒÊ‡÷hfu‡T#oU0ó`nå*GY¬Ú‡ÆøâÃC¬Q>¯'¡²b½±ã-õ¨ÅZ‡©åÎî±Txş3hàü~ÒĞËA<½mø{ráäå™{eÎ„F¨Q"PşRÍˆĞPÑ€óëÓfOk¨/şKÇTí³ñ*©b9nˆøêÆÜ¢}9 ×„è²Àœås<wŠĞüWßœNMö—^~z¸¶ÀˆÆ‘a‡®“ÁÀ5¥ÅuÄGlA¿tÌN›p´LŸ3@ÃYŒÕç­T¦ÊÜë0ØÑ3¨lì$02‹¡ÆüÒfQAµYŞû?·vÊ¯sÿ;-!ıkX\ÄB×Ckß§¼÷i1¶'ÿx[Tñ1óPŞsªGX‹i»1Ñr!T“½§IÅ´ø.0Ì*b'êsOZè¿ğ'OTôÊºbÊ9^`è¢‰U>µHEG,Ÿkx¢áÚ§râ4;9G,İâ,È[›r°À²2„<TÉDÛÂ^Ç?yÉ¯ÖÎ•>á©{x­vÍ¹¢Õİõgıê@=4w$¥mî™^!¼cb,ú	tkúlÓ‡¬:Ö†+>Z‹Ÿ?°.­±Iâ…tuìÚŞà­ı%>
Oø¸æmá_	GíJ¬j4Ój[%gyt&Íu€¿±)!™z·“Œ¢’Z£ªŠò®ÛÛÅ7%ëfoR‹ë@Êpš ÇÜ°½E¦~ÑŒŸNi“1\±wğ"¸¦ı©™zË'Mh–‘øaSÎ7æ›Á*tÒ A¦Qbòcü;ÕÇt‡ˆš (ëùAş+k…’V¶÷œ²##t!8V)F{¨Eš˜„(>|½‡Lzrñ†Ú5~ntïo?¾±üğf)¡Mj„Æ^Ã6m :(B±@Å®‚ÄêŒf‡Ãß9Ÿ(`°ş¡ûªÿ¨:ºR*É‘‚–=$fjª|0	¬MîàÙ±IoE.ˆèš®Ø 0¸È²Øë\lg1åˆIß$\èG	İ4&y>Øbğ4•-R vrÖ”»}ß ·r«ÈÔâôåSãºª‚uúı[&ÇµÉY‹—ÿÜÙ¶_•âw–H0”ZÔØ‡Y ‡£Èˆ‘¼¸)Ábê-jä,Ÿ§]l’
¤ŒÔÔıº‰Ògf‚ˆ{×©fQõ9µÔ"7ºuª_#EBoìr„|Óõ§qä¥3Ÿ5¾8æš–!¬7	ö-ÉÁqÎsDíbX8ŒÏ
%…1¶_"Û|JîˆÏ7àå“u8±ÊÔW%$ŞªÓ¥-\²jfı#n®IîÏwÔ¢¬ŠU0±qucôú¢¶ƒé§7=é3 ğ…¨më sàHö›îÁ@ĞÓçæşq¡×¾ßÃ±s¤1!¼û&_«^¬kâ,OÕÌJ&zW{N¦iĞú?9ÈÆ³·±‚Æ«ÀÏ"\9)tBŒı{w[@8R1QT×SŠ%1ä“Š@ÒJ¨œ²ş÷Mü†™sÊÀ>rğ¶âÃ¸ìÙTYÄA!¨Ğİ &¨ó5
š
MÈmœt.-³_lW4´å2ÎÎ
s7ç…³¼?ïuS4î¬{´ÆßãìÃımÛ¶tPéágªs‘æ.Ø˜#¡•¨âã	İé-Ë×›^:u¸[¥jPìJìP ç}'Utó¡ì°P³ÓrDXül»ÕöŸ…#}ôÜKLfó-0¢5jİíçKW¼+Bû¤¦U	È·E gÜƒºÆvôƒ	5,äã2ÑÈ}#o>%#=AæövıZØ&Ç¼ë„k e§BP
 aƒÜ”“¬$¸A5j]÷RÃ@4s(8cs™jj^7°Ÿ CÊ’	¨]Éó1ŸÑ·«£k~$Â+@}x\DLÒ¢>y.hÛHœ_î(IíŠá3ú¨‹”)!ö'>—cìˆ˜^~t8ÕúûÛë1â­ó!È'|¬1W3İ?©š
å^ÚÄæ¾5ËİL55èÏ…¼ÿh«p@ünZƒ†‡dŞ„ZO SÄï™_Ìÿ7ãyˆ÷j;`şWäıo–…8và6jS³¹•v'Í}»1ÁlˆøßÙ›ş‚+x˜½+ãU|s»Ì Ÿ#ø\®1ÎğLR&õqQÊ\¸_³Èà<;òvş·ø‹yÃo„I(%ÓjÊ*~Üª—h‡, h´*² :š]ú8Mƒ¼ı‘ø*¤ºj¬KBµ¡ãD	wåÕ°Ë"cËæHºa>œªrÏûO÷Ñâvú,ùDËI>¼AeN•xq>ÄÏE6ñŠ£16_+3øƒ§ƒ±{µh«×Í„‚üSÏ‡¯0iJÕ[µnÁ—(¬7¨d,3FRG"åD»ŠçâÛnO}¥ß¦ÍìëI²¯Ã©%â/İ}é2 Ğ.‹ÅÌAÅÛ°$»${­w;å‘éögks¯(X§¥C·¼\YäGËı|=¡>ğ<TFÊŞR!£MÜz¬J¹cl»¯gL¦1VºSŞ¸D$¢ªù1¸2ÁÚ¨çx<·Ó†ÿ¿4µªÍ8Í—N©Û¹³
…Zª™.Ó¤¥¦ÊhR%¼AÇıFûX¿‘¢RcÌá¾cÊ»u¡ws‰,pF>öu[6áİj]ËÖx$(>ªhIâl3‰„y™F 25?v,ÉğÁ}€ç£Õ†syğ“ÕxõøA]„[Ûè	ixÒÑ°×ù”¹Àòôş©ÕŞbh’²äØøİ]Æ]TµêBßïS ìƒáÕé<§(ò‡iÑÒÑİÇ6Yíàíº#G’*ûvœÁXz°OFÁş.‘É¤>Àb£€ƒ.W5_zŞ€¯±Ÿ‘3İñÑÜ2Uà1Ìdš8ëF;Ö‚ª®¸rØVâ1ËÈ@¥Õ{K°E›è%=|ydÖ—Ü#¤ø©!`äÇœ·¥OQ…á..ç€†y’ ÕüÿÕµœñÏaé¶+‚èY6Ô¶Ú|g ÂhÄ™ğMVìPygk­²h¬éÕØI¡Ä£awù\oµ3
§¦â¹ì·ıÔoĞF¿k.Å—é*²cçáÁÄˆ[Ğ°%?ÀŒ{fPY\ó‰ªÄdKğšÎ¯KĞk‘M`m9t0¨‰³x¹àÀ&2œà;®>¢}ŞLp)44c¡’êÉ
±´‚Õ´şú*¹xTózHàcÇÜº,|ŒL½Û(o×œ¥š¥Ô…·ÁÕÓÃ>šH:OÚ&ß§4ø	Zïí0!;xÃs¢3 …,–*œrjî`<!ö¢&6ÄØ[g’‚ˆÅ¬áF:‰EX²éÃÙ £" ³ıã)ª¶ıêŠé&üÔŠ1`kP"hŠ1î;®a¯ÿÓÊË'00èÃå`OD«²¿Åa¢DŸ?aK,ùå_Ko«2â˜dÿÈ„äE‘Ä¦v3æ†nƒŠ¾†ü2%VIÛŞ„åòš ›2„pĞÁzSù ¯vR„äû¥I—Ç×`â*Ñ×xî¶R7óT7&Q<R[ÌoK<ÓµsqKi9¯ä| ]YØ¥§ëG‡,bG—Ÿ<F—qèËiß  äÔE§Us’?%Îˆæ½?c{›êÊÃ==hN=“æßK²%L‰?Âµf¹ô‚Ë°GOğXñä½|ıŸQ÷à?$Í7d<\C©:Şƒ5Æï¾¾Dº>¾ûzõ^şY_ƒ¬u'gSê«‰`Ü°Ò«o/|ßÂ³ -¸=¬8Ï]*g¥öÜ
!¯3x‚H«Nza:¯Z&µ9Œİ0‰5\YÎsŒ·M]Ì“‰Ÿ ™{ƒÂ)|€Æ¥1õs#ûÏŠ©AsYPÓ—–aŞ’ë‚T(•¯Õ§®şØäK}µŒÙÍ¢¾í•ƒàk£‹K`IôkRïÙ8r	IÙd_™Uh¤æ&›½ºÛÙŸ¿íâü[şÿN_a«iÅ˜J;„X¦Š™«’jú›|Ueg‘›,à¿qö™¥F@Ì¹Ğ+íÀø»íVàÛÑawyA9KäÑŞÓ{®¢ÊM¯Á¹ã³ğVäƒˆË¬É´…ÕxÈ@HíLz[æç/ºÊn U®]@Rë1P5Ø²È¢Ø½>bmé¸dãÜ`×CYğ¨m­	 €ÎîØÙtÖ;®‹‚O»ZŒÕw%&õ^q×½ÏõÃ\®‰½îš	ÒÍ,;çP™
7Tw3rİ"Ÿ´‘‰YŸ	^W)1ì½ù%vcBk€™b‹*\|nmá¢‹¬Î¾İº3T™Ú½üİ5ÛªJÇrqGe¹Zß!Û!l´¼2Ëoj´
(•²ğ]ÃMVjµ{Y”ÌcÙKo‰+í˜	h’ñˆCD>2«ÙjQå™’bnsáë8+ªäwÓ4kÆ»j–Üh§EšCÙé³‡ÁïçÇ•´¹YÓşÖ&–éı…¡üÂ­s3O·4ÍÍÌØîâdÃÖüQwÅª ùîÃïgIá°_ıßŠ‡G7|Ù*d @	MÙÕ¶º¨·˜­6C©zÅjTcƒæy¶V
¦¹½èæ$%÷O0Ã±6)â\w‘Ÿ´çeaßƒhÔB,[N²'ÅQÚT~ğ[
+>Ê(6Ñ|şGô÷Ú«#j!éZº$b6K6ìg ×’v&Rx}T•1ÿR˜1nü†ˆ‘û=ëqJVB…Ë®4–VJ>ÂÕ™Ï#1ıËw'äê±é%ºı(Èw¾«84ÏßÊATß½EÎıe¦,JÙcÏYï§*3Âï1`xŠ(3j|#~Í¶[
*}5L˜1ÃxÀl?'ÿ¡ë7$3ïdÌjMF²á‹qÔØ¥
ÀÔƒÍîMø¦Y>ñ¿;X-ƒÀW&3l°QS[3–ÔõPíß¶À6¹éÈíšôI! u–YE›åÜÙ‡­Œm±«¦ï’Ô•…l¬C;h	–—{oºRÙŒŒî>i7#Q<ˆ&Ì¼òsˆ9É¯ÂŠ„‰DJ`q¼Æ˜÷°ğÇ½ß‹ãÒïëå÷b&ÆÜæùU,Ì+÷T¯²˜¢Šb¤ØĞW2iY‚„PÍ£¬Ö" Uª†›÷âü®e%‚ƒİMO>MKÛevh‰`K<A{¹®DÑèúviMµ‡¾%*~nšÏÉ¶Ü¿óÍö´Áu1¿/‹S]6Ë“/¤_`£JAŞö“¨†bœ®H&úF×	gÄJ°Mõ¨š©ûÜñí=…f\=ô)cĞ¿xìØÅ„êéI-?±T2:Îdo=JAêÎ7•Ué•=)ç¯q¶ÄK (FíŸ	ıÄ¨$HM˜y1¼Ï‚	ûßQ¯|O5+›0‚!²RâAØQTi'/¡GçøÄ·ÂÚ °üóXó¸ª\ÕAüüåÅ¬Ö‰€ç_—C…Qp	Ò_(34‚ —‡ÎÖŸ×uAÍAÿ`Á=†u<Ú ×ÆŞ	Áß†ÃM>öUÊh±Ÿ²]€®eÇ(0ú¬ôd2P`kèää}Ÿõá—E»½¦p‘¦];°ë~E¼Xê‡c€ìc(uO5ûë@ˆbÎhwò`Î‡`>õ²ªc	¨wäêv‚HİCâ¶@gj!]†-‰m–ù”)¸¬Ñ.1®ÁHÒcÍ¿œ_38AĞ˜ØIRf ~‹ƒÄns£2†ğÅ¤È>Wñ¥ÜÈ]eÉ2Œ°Gs„‰æ›Mr)@Ê‚ğİJàİş}ÀÔLƒ£é€*f¤†´©0»,Q7r-¢_Ø]ªºkİ™'¼ŠÆF	ØY4, ]sª™UÚXVÕYCå/ÍZĞÊ!è,ÔPZŞa­B&X2ÔÏ=ûØÄE…ä*¯š;Dğ4JO°[^¸jç¼ƒg­Tr2|X:À“r]vç0R|X¯¬sØÂi°æn`¨¼hf^Æ·˜ØŠ¨K_«¾-í	.ŞŠF¨n–ÖX¦}-Àªc›TëÉZå¾¹şPÛ¶–htÇUQ=Š†MQö>İ±#}a‰š¬§n¢­-
ôæRšê%ùÌÍCÚjÌ¦<ÆJqKíà‰
®=(”õ4Œ”9ª[W€eğ‚<ÑµZ¿õÇÔıÜôÄ#ÍÜ‡«ş[ÊÚ‡³°gÅèÙ¶IÃ[q%×4„6µØÈ;mœ:‡ş59¥­3àqÆ¾¡D¬Îw(®‰ÆéUFyâêFXPKá®Î„GßÑ±Å›ßµÔSH|²Ö½2«'ÂÌI2Ü˜åİ,óÅYìc0Ø‚jmZ°®åùzjN!¬áá÷éÚ‹ÃòyöÎ¦¨Ğÿ”»QÅg¶o|;e‡¬=,îÅÒÀQÅ²&›Ä¿–Ò32mÊ@—l—8yÔáEë1ì¤iŞW¡AénÖ6AŞ¯kE¹yÓÃ-p…q˜òÿpDu¤Y›äÆ –”Ş-,—…‚æägß©öÁrxUK™O©°HÙÌffùğ\—3Ûí¡ÑÏy$ŒË¶®/zˆş1ŒU·¢÷<¡áfFëä±kxÔŒL@6+kËLš²¨šÇ–’h4*¥›Ğú9$Ø@U{µ˜NyB=ˆĞ•}ù7Ët2”¦íèÖÉRÏxNmL+)Ë‹Â_Ï¸Ï¢åªê¤~ ,0g<ß]¾™s-…?VÆÒ§›¡xlõ¾}ññ$@Ö²V%`=b2ºšÂ‘…ÇX5m¦ĞXêÓ7JıˆìíWÃâö¯¾Óí9ÇûeĞË,'é‚–WG3|†6’»šqÛï`Zš£çeå{K‰¦³à8v’¿aèÂPLàƒ¯Á”İ0jVbi‘©®©+¹
ÚMökôSå¦ºyóù~DÒ9PO}`GÍ¶•ÒÓ(tL­F	¨p²¥”!ùªéj¨šMä¸^<CÔï?ÏDØ¶éäÓArQ#Qª‰¹e€#ïÇ#&Ú*¼G²FêÊ‚×~•I¯™­÷{k[ õÂ™yñîDÍ¢M¯jº~`¶Ò8Ó¶[å-êXñaF;aj?tÏ´&ÓÕV(Â·…Ïµ"~óøøl¨¤ß«AcÃñ)jû,%Ä>0®Èe—wºµåiihÒEFaß*Å±3¿Ÿ–áOA«S±0±{qö8+ìáZ™´±_áYêî ¡´T€Sò0VLT]PØ·ÿãh¦‘±l¹ŠÚ£“yÒv—ê ÃO&ûTÚ~ \U¤ã:~À …ŒóüÌKêÍ•ªõGBXèVEÌµ:;ŒW%õv}ºĞ _Bï?9€º.ŒO5hkê~öÉĞoá¦nRw6¡ëzr¶¬l5§\šbdÂR—A—ºÃW]|´åÖòô%Ä!u¡7l8ó‚:YÇ¹U~V@_Â·A>'‚™õ5ÂgÊÂ´¯¡Úbê¶!Ã°[æŠw€rCaÖ« ›móÉ„PÊë°™n~ô¥V›[ÙZµ†)¶)ËdÊÿg›äÙ½›sçsÅ‚nŠÕaşÛhzµiX9ì+w62Ã>–éõêÁ€İ±hG! êÇ¿İ²@ÑmLÁ.ÀYùa3°À9_-kƒ;ZŞw(øC¸(ÃÛèØ¼y(eAe+n†œ|÷„uä-b«E!™æJÁhíëgêèDŠxƒ.8Xb¨ßÑT¼>ÔÊ±"¯_8iÆ€[~FÏ(*~	?‡ğx”Nß^Â…\±U¹Š…xç( 6Ÿœ­@şà×¸ƒ*ÿL±»1yÄ¢•á»SÜöËFağáÓxx7¡å›Úa³£†]÷È1ÈÏZéG¸,l—šG]eş¤û¯¼Ú²ÛEZfÓ4¨p×(Ê÷Ãäd»XÙ_/¼}.–ÚÚKÀ¿…,K1J~ıÊZ™¢sÂ±–sğó°czƒ†Ï÷šZümfÀj©•RsŞÌ³TY!<Şª+´UUufp™e1±Ÿíä‹‹Y}	èp’$Óï• º]µÜF]ëF‹s2Æß¼êÔ<€ï;qÑ5DìÀ|,W‰­LšõësŠ<ìÖ0:Ù%;fI‰Éa‚¸~6ì4q‡ ´rÎ‹ŒÏç‘E½Ua“$ÍKnÖ},—q]Ã¨'c™võªT/næ†q@Æâpe8~DYÿâÏ(Èm.FC¯–¡Aiûì	ÇDR,*×‚óT ZÁ+ò /­+Êù«ğÀİ©òm~$_şpœ|ë¡AşMÚ‰^Ø…ûj—+) ÛŸ×ğ7©™úV©WGwÃ{™Neç‡¡ë‡ú]ƒµ»ú­ôMŞÕ²©wüŸM»"®pşÔŠ]OBXı¤PçƒåÄ6ÂI¾×Î¿S »¦È•Iı~vOĞIÜq Û}ÎË™+]ÿkÆ*€ Ï‹Ê¢¹?n;¯ÂÓs³’uz&Uó¹ÚJqëÙİÓ\5 mhƒ%{py	efˆ-Ï»kúfÒP(Wer[¤ÍqaOtk—™µxæOêzÄì¹š‚tìMùL‚?2€œÄ©[<ºrÕIÏ/®A@t4’U‹dÏû˜zÌ«Ëù‚øâv²$$@´ÊU\Şu› EH´Z)|ë£ıgm÷ÙÕÚ^˜db1ó×:*ßu§ i¼!;³²¢R<1Ú¨ uÑ®Qğ!~ÒÍëß7_Òïj¶×md`L¾|¯lââ“ËºœÍZ]ŒÀˆ=äEm
jqÛ0åê>&}hİt™}Ş%N{Íq—xPa|ıÍœrÌ¿’öÓôE@îêF(v‰†Cï2õ¿U2Bõ€PÁ1–àXk0¸péëN#CZğÖÀŞû]KfJ&F­tf¬àhÖ¹–*y°÷ğR9úU¶©9ŒH¼" 
àGÜ}ûû,¬Õurˆ£¤ŒğÖ M«†VäÄĞÈëµÁ+†ü¬•I—Vr…N›j‡=‰ÚK/Tn–Ó†È=¿ñåõ¢ì(@¢–dì½}2ìƒ£{€”ˆÛ…G£Şğ!û…rÑ‘s|g°³Öº‹€[LŠŸSebÉ•qe§aú¼°d2¿ì~ĞE9çÇğ‰6´èû0_›Àƒâ#pbÄt|íÖpB)öz¿…½&³Û!>b<k7ÁVµm8TuŒğÜ@gãv7µ={?ûŠa_M4„7…+p•r¬bé\LR{âã.£S`{/âÉÇJŠ’X,`©Ø¹ 2-s]TNc2a6ºn>‹˜ºÅ¼™•è×t9€­%™™|Å,»ïKjyhf# ›úÆfîyŠ™P«¤Ëg®eE2•ØÖm!­§´«.ìŒÅÙÏPxMX0jëˆ  yfuEiF.S—/b#qìÉÛGP¡6¦cG¥¼±‘îêiÂgP††_"ª‡/Ÿ‡¬cë|œo7½›¢sTykE²ŠC51ØK¼1Ö·kk·kûz|öt`ÿNÑ`ÍrQĞM¨¼»µr?i[€¶ïg`6¨ˆù3ıÌ¡±v¿í7+Ñ+µU°KùÊ»ãçCfo’ÁšJ¡Ià¤ìàß	©pØCÆÃTW*+4 øÇZõEğä	0p/ZæD.úœlÌ¿
eÿ´¶òãçÎpK®ûï+î›G¢Síı?$Uî_çëÆ™kLPá¸6-í¼‹i-ûà¼SÖÁŠù––t°±å	@+Ø~ òâ:0§ƒÈõëâÈü›‹V!â˜¯Y^¿Áë1>rf÷¸wİ'V{îµ”48ı ëlÎ-ÿQˆŸÒÔ˜×èş€we[|ïÁÁ–œ*d{Àí}‰ëVî9 Ëµİ:ÕÃëú} Ü%¤hœÀ}tœm¦÷#·ÑqÀŸÂåØ¼K€6†›ºÑ«Ñ­ûƒG¢·ó¥W ÒJwŸÎ õß}Ñ­¾_=ğşMµãĞ²ÌtãB“fuhä„IŞø“·‡ìí% ªõ|5½7Ö¿<È09¨æ)À&S¾§ Q2*'ÛI^C¤°‹%Êø§ÓQeÛƒÿ=[…1ŞÊ;ë`RAfmJ”Itæ™ïbÔríf:Û2vNó®:d1-Ö¦íÂ§%	@\}û€gV‡€É.GÕô˜˜(+{(…˜–­øÕyÙeßû}şüıÃercf  úÉ¦<©¤ï§éôO¡ÕşéKwû§§uĞ	!2e<ÂdéY¥>—âÎW}ù/}U(şüÛ®1¢¶èŒ´g+¸ìÜUnš %ŞJıw“t„ox#rH…[DZ“”›USM˜´N¦;})† o• 7$Ë&:?}…ğUÓ,;É7Gmír‡+œª?ÂG³ùXÖí!IjRÄâ}[ë®Öm@FE(ˆãºiÜ€à»_¶Ì’Xl«‹5“×É²0j7¿È¥è[<v3‚)©_0FÊµ{ÍC¼®@~¶Hj·à£‹ZŠY•Mú´œÔªßY´¬>”5ŞbÈH³Î °æR;.l)œ?ôÚë^“èIV £ş%‚ş~™S‚{}±Êb¥Ğ)ƒüJ¼vW”çÇÒù&¿-‰ï©æ›[1GÍ2§Yá~:xéwä¤€H^$ûqRò.ÑcĞÇr>)
¢6á–ƒ]‰ÕPUûiæƒœ	˜'ÒLp•ó(æÅER—L‘ş\½ç|z yÿÄxRz'=†Ş`ºJO7ã±Š´*0’ÂÌh3OÕ¶·}.Ü¸ Çù…ÇÑ 1ÃEù3m{V—Nƒß;Šıİ¶ÿeAÅp±Š`HÉ6›®*±sƒe¶×àì 6š¯h³¸
ü;"à-híøtXnÖŞ(ö	'<]¢7#45nªdú€6iUIbÍàÆ•=§xE•âÅ	¯ÌïdAf»LO(·ÿæ#¨)»KzDº&òl&YùÕÍ8î›¢ì³}ˆ“w#l½lÇf6¾]ZYXêâV€¯şT'½Ai"ô!Å^oôÜ‘>2½&—?q±jç¥':N¡.Ê2âáÉä÷‚t[ˆCo#P•íyd2Ò»6^<áWŸRS´~¢:ËC6ßGh‘İzá¾~=¿æ?‚¾âòAÎİ­«Şíï$r¯»…Ãâûˆ
”± ÔQ÷9Õ§áŞª›ª»õdáµk–“º]ú$xü6 ã_õ4œR(x@oUXÁÇîR„¨xãM–ã|x¼`—ÕrÜ£ïÔÓç`x/%“„$¤¶ÊÃ¦€ñ(b3ÏiİC¥*#Œ‚ëVÕfGYÇÓÜi	({ ~q¯ŞN‚E–£lx‰òÇœ¹Æ–™÷˜@á?Œ4j*F:ˆÎët5>¾Ç	(¤ö
U2;z°*%KCÛÓ³­FŸ³s÷:ˆü‚+KW©İA¸Ò£Õš<½.èYı
˜¬u[f{VŒ?V¬`Bêø	#hCÃk#×nï+5ş*~5òËBÇ0lDg%ìxgypV¯0öT.ßQˆË÷ Õ~¾À¢	¡“š†ÜF^×	íìlí ş56õA~·ÂcBÆ–Êº§ s¡éŒT¡åìØã9{<ú&~u¿3ÖëQÜ-F™Ô·›½Ø´å)
B{|>öd å¬Yn3çîããr7íŞ}I¨kÃ)•¦Yînß|ú…®Ü7…gì§jêĞŒñm7zÙOMj+­`‚'RÏÍ 3ükâE©ÁœW·y®-[¼¨¾˜ÀI0.­IF“#MÕPø­Ç_¥tPö´vX<Nâ}Ès7¯Å¸˜cä‰j¼>oF)î+¤jÖNPş™’=‚yE»aE¡«_”‰ÄƒÇHåÉ	è¶È‰dådÑTL:\‘ªÇç/[fÏÁúULÉ r€?Áe4á.•Ò»À"ê•}Å€–èˆºv³ä,û~|	£YÂİÜi[¼«[~h¿^.£ïbñİ–Ë[™.ƒáR1ıÊW¥0x¦Ì0@«³vFóÎ:Ô›Eä™J×Z¶ äv%bE.9QSÒÌ%¿‚IÑœ–SNûë\P1éâ'*te†ÃA›|Æ\N•_ÁÄÓ²¯{<¾JrFÜ«Ë_ÔFç³b¾ŞP±ölHnxšó2¥³oíñ·º©I€-˜_u>7W'îÚøw`š"WN‹ºHûˆ0¦”³ØàBÃÂ&ÏøÖ?q ş¸yÅDy£h_};«gÅÇa¸$1ê˜é{Í ¼áÒI\ıœ9K_HÂzÕ-Ş†Ò 1Òó‚Ë(‘jÂç~ÎãgshÇ$€ÙàÒ€GGh:ı(lÔ3~ÛòíŒÔüÅ7‘“\àx4&v8¡»Á˜bqD ˆÖ#ó_kz|EİÖçêÆó øi¦MGá¯w—ñ~ı)29„ïLäØ¡œ”Tí	ªQìŸÄ¹±73ÛÇ/4Ö®R­ÊP-çµå»Mx“ K×}$1noïú"çäî‰Ğ»?çè®ÿ5j¯¯S2ÅNïvå/D§…Õ›]E¾£V´aY–lr$8%å§~s»Éàf{y¬vÊú×÷_ˆ«ìëÜ.^¾4ş¿¦{§’iÂPŸàBlûö51YoBhLÃÔ·p¼™.o¥\ë™ãÚ²x¿ìÁôÍß‚oå­°õÚI29€ &‰9w®£L›ÆˆÕPlG¢àß«â©LğQ®i¤À.PÀh„!îhÛ^1jÄ—E2šdÒ§Æüdk\«#$‡DeĞ{FåfEæö—s•®µºšÊ¥ü„¶ÕÛ÷6^ôíõì(cÔé¾VwõÕ1gA œ†ÓîÁKeïŞâ~÷,Aº{ÁO{/»éúöƒ°ø²`$]æ#¸š`ğ²§ ¹šS&[İöÊNä]°şŠT]å¥~+X¯Ñ§Ÿæ;$òÎ_¶<2†ÇÏœÈ¬cÈ8õEª·ğmô×LZ3`¸½5f«Ùj/D£rïçòHû±Kd ˜©§ˆİÕ::öº‚î'Lş&úpkß.ızƒX$™ns±lÄ°Ç”ˆ¸“aÄwÍç gMr¬¾zÜøR?…î²™·s?÷nÃşY1üé*Å´¾úO·pE`Â?	ØS(˜î·—¿‘E;#3Pk*±í¹!Óî»³Ô-ª9ß=Bâ3†v­³+ºÏ^iJ=A’3œm6ùnˆú«Á‰İô8M!Ï›'ùGŸTr`UÇ`W9-Ş±ÖWøæƒ'wİ=ÎÔ°|Šotv«=c§äYE@,¯åy|˜ÙŞ¿&ü5f48~´5U ÃÌã7/9‚øI:0¹{õƒxPfÖaHæ«îqÓ$3}TtıÉf×nLíiÇqâ3±ü «¹Ÿ–frıvXß)Ÿs„yZ¿*åtåUúõşXÜ™ˆ‚¦¡7è]Ÿ ‘ì«æk{ø„íã{gYpy½¡Â‡|D´üËğF)”Å€§Š;	0<°ú›V<ë[$ŒtJ(S8 ä«?Å;å£ËO<`p€#1È¾^LäOƒ*p^gãCJÙVÔ6»7Ä#ğk¯Ç}Ó´SR½Ï:»IØ®=k8 ñRàˆBš¿TñÌÇZ³ÆŒTB ×9 p¯¥I2®zÍóPlY5%Ö¦BeáV¼Ş‰?*¥A‡M->2M)ÙürbÅ<ÚB‚ğk9t‰fèl+C[~Á’ÛâD“YòIZÍİ!^.s'ëE&,Ğ0¹F yÑÌ%Íâ£ëŠŞq­÷8ö0‘)ikªåOmé9S¸í,F®ÒGÅw*ƒ JÒ»a‰úì¤¢ÕŸµû@·K),´Ç„Ej‚H	ªßèzCf•y)æÀJ9‘= ày%Qßn­2Ú¡÷ìs¯kn†'ó©zô³÷Ş2W€98<Ã^Ñb¶àG:2wiŒ·ÿ ß³Ì_œeıkoÄŒJm¥¡ÉİWzÃ›eUâÒíµu|GU¥}[˜ûK/ÄİJe‚»õC‰ Š	½Êˆ8Óú7ÿ•1Å>_GâD7ò*jqN´Ëó.$~6:€µPy;ƒÆÃ—pwÏ/]\ø‰x‚ã·CwCÚô+¿X×°&–Š`ÇøÎ°1éVvıwI“O>CBğ‘Ã†AÂä†‘ê¸>”¥ĞÒC²º¢@š7Œúçè°c7\±)Óú("c~3?bb†ä	Ö”^wA@zÏ¾:Ig^»8	,YÖÈû©7yFŠ'WU¹è3-°Ëd‹(Ò¸|ì¯—ÿ¬Ú½Ü†ƒV}-†R:a{è½óBCŒ¼6ƒê«¨´ß“Ûà+nÔ^\ÕúäÆäY—Å’àŠ>‰}»OÌŸ –(NOéò¸·ˆ«©Ûo›Ì"é+8©Œb‰Ç¥SxÌ!˜§ÓFŒÀ(÷Ô	O‡ÁÃdXÆ*©Û+PAp+e–l¨€ÌĞl Ùò½9w‰ô;´)¤rÏOXY|ª.¸uÑ¼rÆõXŒÛ¼^oÒW4&FÁ•ºB¯‡¾áü3v„ù&2£~ïaÛBlĞíZü²¹ÄµÛ'»½rXĞÆŞ:õ/§ò^h²šæoÅ4‚™¬ósŠ¼Dš Ü1èñÆÉÈi¦ŞÁ5=_rêe"9P«X•äÌ";nO8ö/@ôíÅI®mõ{ù^õ˜ñÃ´~ ı„J“ÄñáØ¼XA²«&[Ôf©[4V8m³•È¼ÛôTµPAFú@8†Æhë‡+9„mïÏ.ÌÆh)à|W®imûàb‡qO™›Å¹‰l@ğ.é]$„ˆñº«Ò‘±Ùcb®…ëÎy¶Ğ¾líßİøä°Û.""¼İ×:w Ô°Mò…J¹ » ly¾Ì°	GÓ°‡i‰vN·s…;RyµÏ&è^.w²;ŸãVu2•)«tÇ†Æj<ø1_uÂ¼oš‚JDöêÚ§hÕ}²~Ä.`s™%IlòÙe£¥g1èŒ	eL‹_Œ1†@ËkÖ¹Llô9ò¶£x’¢zÇ‹öûœod¢Äò›oõFÕ¥BH¹/¨è¨›çÅóån¢Œ¥%arÚ›Ù¤gX²ƒÙì·Cn}yæ.T{âJ™ºcç£+MEë{b÷­©—ŒjxAĞ%¨’²•á>lÂ±ùç,ö­üÛN&N¡ˆD%©ùe%È·ÂÍ~&Ÿ¾B¤È¬m`Íe™ÈıçŠ@Şç‹sûl¬¬Æ¶{¯aÇU¯R;(4cv·ğO‚gAÃ~9óuİƒ¨ƒwÈ»Î|;ñ§‚ß€‰)ñMpJMĞ_8×è“)ª„Ğ w¼¾ì{ôé,Ého°jé5JIú¤Kïõ˜GÑÈò•Á™Š‘ÁQ&ZJœÉØŞ6çeà¼Z#‰#a
ƒ—;ç9Ã–˜Y¨€s+ó´¥¾“¯ØE·’RË_h(©Œ%SÔh¡ù¾¯Ì¸•Óşá}®ö¢k—¡úÒ`Õ¦?µèÁ€Š:*î¹¾¶Ñµ]V0Ï±˜ÑY|Ãˆ^aR<o§·p&’|é\¥İ²—´û¥0iÚJZ\Èùp›¤¥m3ÍÌŞ’5I]ÌˆUFMi<¨P1vÇí:Q÷óêW¯Zã›T7·çVun$ıÀpŸNCõL‘ÎwV .!q8Xç÷Rvâ!ˆpUQ‡üŞ8¼¸¯Õ6‘¤`÷†öéàùÆÀpä É0õ¡GæÙ×MrŒŞÓ„_\‰,Nù½ëåzÇT´Z[\WÛŠ*=şğ_F}b¿=_AXÕSË,Õ#“w
Š‹ŠÙ2T'làòäP3ã¼z9Ú\cÊ\Š%Kª‘ˆî 1`ä˜fË^|iÏ¯/ÔVy‰Yì<V9B…ØØˆ<ú1¡ŠÿÒØ^“[ºà“¥û%æ@Õ”á¿Œgî"ÊÖÏT£Öb’”Vù ôÏÚßÿ¤ng$LïTôjÈ|I,-Ëóe21­šÌ6ùC2/Æûí/õÜ¤|³ ‹“ ¶ñ],ĞNöMJËÈƒK ´¹†ªÁô¬Èûı"Ÿƒ5Àu§¿IF<²+àåÛ¬Wh8xÅf(Ûİ@‰6D‹_&É@gñWî/µaèõ¶K¦ê!}@6,¸&FŒ[—Q€°ÓèÖ3çvcÍÉª…¯Eã„â³ îud‘¹9RüÃoÛ&MC—¿Q»ã¸ÓÉıŒr›=qü	hôô°yÑØ §ƒ\ræWTô	Òœàû! —[c‹x=fÁ	-Ûòê]@¸°Êà¡ÒÌcµw¡ÏW€¿2I}X­£qä„²3+Ún!÷¦^GMb<d„‚‡Ã:“Aµº’|œ‰ùûUáwFq”z'¹9¶ƒÂp›N_š™¿¿ÙÀ¥Jêàõ #=‹<ş4÷!˜J' u,€ô{<j~zmÖq€*™¥–Xú°ôTHèë…6ìR¾PIšŠhrßaí1©vodg.ÒB}­KâÀ¢€ÊN1ÅnåßÙ=ŠiĞsW	vJğò&çxÌögpa¿}şB^˜˜»™ÍJVÚ®Aşc‡ñïhbrWKÆëàëş‚ı‹‚u2A£%Òıİùy=*ç*» âMçªâŒˆtT-†{B§ùˆ×Ox+¹MĞ¡¸vÙf±T°Ğ"ôëï|”M
9<HŒïïïi[(O^L{`ûõ™¦ìñ“¿<-_ÀG:²`Ÿ @GGĞÉwZ÷ÿ™¸{`wÚe™Ø-RCA·³@ùx±$V¾Í	é€•Wƒ(Ğ#Ó„Z[!J½jE°Úaf>ööH¿0yı…ŠMÂ·Ê¾Ö}Âe)Ìm±d(Íê!V,æg4\È„œ´|U°™´ùè
Bm%ëµòˆæ¾B{atQx4ÿpğ›{2ÀÅ’GÚ~\k^Ó
WNC»1M¸Ş]*‡`©øı,˜ø§?¢Pµ$¤òµF,ø£M&ıÈVV"“4SÚÑæKĞ9-÷ÉyäNÑæ„-Y¾‡Ìn1[œÂı$	0yDî{EÔ¨})XŸrÛ>‹[!¯€rò]Ø€u§oÎvébT ûCO¶¶BG;¢á.€ •sšˆ¶s4O~¶ÏU1Ò2ÿå¦CW`	§dØ—'‰£›7õ~B¼¯V­ºå¹RâyŸe¼ls"û8Š°”şò¤éÔn‡Ì3½¨ÜŸ\fî%[F©0%L8j;ˆïÀÀ
Ï|˜ƒ’áNèíÀÇ'j‚‚6PÏ*óAĞôùs8SÅfMË¶*hîù€—UQ›ıÈNÏˆ]¨_İ,tÏ4©§mÿ"1=Sª	‰Ä
“jxS†BMús<Thq¶‚,¬óÓ¤©M‘&Œl,G a'ªf]ªN"äkä—r=»²œô	…òÕbØ©•®'‰®NWˆ9µFÚÁ»-gË75ÕˆD^rû(wÇéµ¶W‰ı`ˆ™UXÂD/m»'T	bHÛ8úË!Ç]dGŸˆX ÀÏfæ“„9ÃÅèHAõ®¡WÕRİoa¿ÃÆ?ŠTòMÆ†ÑĞ˜¬Ã¡®“}Q¨÷Éå°–ü#ºŸÆšw¥e,Zï¸ff†cgIÚæÉÍ™lÎì•Èô‰s`Œ6‹P'¿H„:Ù?¢øŞ?
T!¾òmàJ†ÛÒx‚Ü4ÆôEV\ç9gi"Kæ@aQ6àae¸,E•²fb¢@ZÀì´oò16nA±AYû&’÷6kU]ÿ±¯kŸ)z2–WŸœRu_Ş½ìñ>ÃKVÉY
lŞqØ·­ÃØ.]²£¡b¿•—äs=ñ×Óm.DY¢Í\W`ÊÎ^#w8Cììş}Ğƒ=¦¼©¨5qš¹ŸEíîi ®H¾å¹‚·fÍè6ÊdE®í§=6 Cµ7³2Ó‘kÒS{µ»º0?¿!ı°¹Îî1Õ?ú%™Ì‚Çvm‘Œi§¾¼[sƒÀ;ÙòÄ[Nµ³ı‹ÍqRß~wüÂE=è—:óÚ‹Tóe¹‹§Å'„¼¤¾!<iÕò‰èÀ,QjN›Ñ\§ö$cÔ*“X&4ğÒJU¾šì~S5ê™iûàuüT6Æl:ÙlA„iQ]Äùoô:oD<ÎbõG!¢÷¿bxUÆ:öR˜<ŠÛØXÇÿyÇÚ òZß öf6‚Du~¸ÄZù‰œ”}µÿé!DÅ¦Ä®Î*ş¿zkM¡	'YMaXƒh%ú~¡ŒãŒŞR¡â±.ÅY‚åÜH·‹÷Ã…çâª¦"D9ÓŠe/rWË|İm`Av_ÜO°š²¯ÂˆÜ¶»0OÛ„¬2ıù*[:”½Ÿ‡]B€¤‚Ğ€Å?Ä§UÚçw²¾/C>`
û«°d÷¯Ü‘[N±ªZrà£ÉMâ]ˆS–ö*ğWÅÙßG"¾Âh€Y(8‰m£ªM¦JD•Q…|E·¸¡Q)Hm÷½ŒÚÓı™*ËÓc®ä{ÛÈWwaRİmB:ËŞ;úMÂ_ø]wƒaøíD¤¿ŒæÉ1±s¼;*ŞšWF4Ôs~[KÍ‹QÍŒûl·o¹.ùh=ñÔPwßĞt/ŠÃÀ¼‘Bû32ã±“¢Æ›”dº‰¯¼AĞİÔÒsõÂåğÉ1c=™	
Jår“ÕO—
[¨Ï|a¸W$½Ç¿Ùb+üÉØ¼8'FÖáëy¹{êóx7'|:”Úë'c8Å5³xşOò/yv´s›Õ¥lgÓåócrvDİÕpHJ˜|h2`ÄH•·¨¨/¸ËÕ|oØ4rÌüî‘Åfg8ë¥ÉB¬ô/Hï
¹¶‰ 39GºéÍ$´Âê›“§Å(÷øüv©¬ŸõöÄêS`úÀ$»ÇŠ$m¶ÃŠ¸­+!°í€5.,o¨ÛS”pÆJø‚‘å&+W¡HÕáæu½Ü‰ïÌ»"N´Í+c1øY@öÑøŠcv³*`vğ©†oâ«íePlY¼AZvô.'Ù†—úÍÒ¦Qs·ÂÊ—>˜8uúôo´_`‘è§.†Ú{fñ½bºÄT[2·0H1rÈUàÀ+—*l¸eo!<•V•Ğ>vtñ¹Sı;€‚'yˆ¯|ÎòÓ.ôÔÒ¼]j+’¨ œJõß(Î €\%Ím	"®ÉE ‘ÜÆ÷…°‰Ê5ßù%±` $ß½ï¢õ©¸.µ¸¬3£u´ˆıñÄŞªWzrEéíÙjË5uvÏ²}jÌµ%Óú
†0©¦œÌÊª}á¸I¼28<Ã:‡ì­Yoa@¹öå[0,º«=ÏP·vÖıøL0áAÏR-ãÑ#ƒÔR; q¸R ” Õå¯Ø~¢§„^‚
hUÂ5±’ĞñhµW+»ZÃ|03s´EÙAÃPy®‹ª—ş£·¢™Òí_†H1åÍ€c@@kÀgØ@)ğjõš$²¥	9#‹×Jİ¦À)C´ä›3wiZ.×‚q§J^Y/±#VRIEe)S£zK2\4*V«wÛ4€Ùµ]Ög‹-ôİ»ú«¤òw‰.}öâ»?NıjºIvœtA’“ühV¸Eİ:²…=™€­íã‘í…şÉ  ?›‚hÄOAåÙ–crrÏBù‚èÑŠW´dnNcÅ(,·r4×€æ×ñ7t`e)ŠåÑiM"ƒà¨sıàqf!\Á0»Ú•C+Å 5–··ø¬Á¦Æéùˆeğ«›©­›¨ƒ€(¾¹«şCì0–ÓâL¶µïQSwÏI-~ŞŠà8öˆëáLí°TŸ{”ğ€B”ØÜR°úP (ã"£:tiO‘÷­‘ûìyı½œÆá†¾SœkÅz°…PİÚm;îÄ”Ş-§lËÀ÷Wíp]‰¤ÌËXv·rABc§Î†&¡våy¾âôêŒCÃÉ8»L×Ñ+àºÔÃ¿vÜï—üÔó‚‡ Å¸+VÃ± ¼/ôPvl/J hR_;£Í.ÀÑèfÕy7W™Ü‡“—
µDØÂ>ÁÅ0]jÏ!ÂÀ
n÷‚õĞh&DÌq1Æ8­SûØm¾)=eÀ°O›²Ü~îşª+Aæõ_¼ƒ)ÈÓÈW’ÎótÛuvî)^>+×CßÕù hñÇØÿ_)ò÷:•™Ûº‘Ş•¬ÈQi¬Ã,æƒÁÕ%=WŒ„w¨b¸rš7²l·Í¤v‰
™dN_ÛB5²¼Î+ÌÑ*ÜƒÊ,9]KĞhÄÛgMOyÔèJ‡cFÇg4ÌBÉ¡P`&°œ‡>‹‚oç.ÂşEıÎQ±Y.Fÿ‘ÀOïÂ2¼Ó ¥ÃS‡àÁÖ–ó™)G¸’ö˜¶NoäÎÚ/L=©õc5ñòFvçÎı>.qÈŒ¦Z…!j…hòo$3ÏA'ZIN2’uÓlÖhxR>Ó‘këRx‚›~ÉäŸ¯³µo6y©Ø RI”êµÂØgÉd/	ª²*ïî*fæp“~4Òê¯øŸŸ@Æ·ß¢ÜXŸR]Öú7v4FN<Ylö~V8´ÅLñkˆ¬'õ³X–<G…¬E]ÑmÊî%^ÔO)àá}vøÚîgkGkŒê8XĞWÄ-oI-•Iß
«*ÊØ	ZN…ÅüQm˜¸?ó§,Şñ‡¦Z!ÈŠ™h‹İ[,±h‘étĞ†cñ‚°”‡XV'Ë`”ğ;üQvğ®¥ºpÒıçH³˜}1UŸ^C °êÁø5‹m`úiÑø¡ Ë~ŠªÁ‹òV¹?rşxA„ôÿ$èäã0îPß
Rq£hŠî¥û/æJ÷‘x	÷¦y»n¥x¡rOíûî'N{ãJ–Š#JdíI(H|råòtô»J°×á>pğAˆ¸÷ğéÃk4ŸÁaæN\™ˆñdìtˆı(Y³)9©áf)38¼wÉ”K¬Í¡Ns×b™<$’n0Ü1¸BIJô¬“§GÌr=cå€ŞIâ¡˜P'<jÿ×É§˜ª%ökÀlouÊoõäŞé©”’¿ß®á0qkµwc5ãîXÉ9«´aòğµ¦Åø<3°hñ]¢pNT'hÚô›,×ß,±\[e^…€kõ_Ü¶‘)–äœ:·'Ó^}Ş møXœ&<VWzÚ:|.÷«N…sQßŸè‰±ç…–mäLŞ úÀ­:—B“ğ-tİ
üÇ°è<šãTê¬VæÉÑÈ£æ’³zë“€Ÿì»ÁZ…ıÃíájØyb#È½Wé*l$~ˆF£¤§^˜Ã7Èğvÿ|âO‚³za¢W£]y8ÕZ`ÊµkIäõc@(Àá÷¤®z¹Æh×&3µÅ]Rğ.¢ç`©(|5K'›rN ©€eØñIiìğŒ2 £X–3NéF­yáÀ?³¸§ñÓÿ³*ş€Ó·Û‡Y¡|~›Í+ôìÄF5ş’Ÿı0şò7ÍdmİÇ‡Ø&÷„qÜa;.-ÖŒ3Åumí2·Y-
*Ã•¿ª›$íœ	ØÃ|^öõX§.TèE©«ô¿"ëñÓv²`)ÆˆõÊ(3¶tæÁzöÅ¥§wúB-Û<ÉY&o[ÿL–ÉPöûÌŒMÊİ&N‰.rrSxB¯øÇ3ekË2 Ä0¶\â€r…õŠn³ÑÃ<;‚ÙoÀÆ¼iØkëp/“«Áƒ(Yñ$áÒ‘ÃÜ˜LÓLüOEáQ êvfn6K3æÎ¡ÈC.¡ßœ¤h¦%ë8!5/ˆı‡KÕù?2Fm%´ú­q ¡Ô`e¦e³tqÓ„N7s‰ÙÌ^‰Æ,Y™1Ì{}'Ğ5TJŠğ’n:ˆÄ¬)Ö¶¶è¢QQ ¬|!ÓâÒ´kÀ½iÇ0pÅ"Z®NÔ¯¬o2ÉÈásDdğv[ácJy!íæ†°ú\w“B›88}–vDèT\é–ÖVù|Y‹­BÁwUcœÀ|Å¬ÑşN$,ø¹Ñç^É§§¸¢•–e‚íÕÆóäœˆrÎ|ğFw­b¶‹8Şİ\bEĞÚ·×6ªC)X¦i/ÉØŠĞ–àşõ-èUµ±›ƒvSÔ,üùü2¬VkÔ	'ªıHáĞ‘dYÿÊ2‹€1Ä$=gÃº†ñ€±$¥à *®$‰8ã4.,w
òë˜„~~£Äa0$À­…ÁmMšHVaO;±ŸTó
ãw1u¥)üô«È);2%#Y-<ğit–')täéùóê/3Å£|W6¨ı»©µŒ§{áQUæğ1¾Fæä
än9’*é‘¢‘.k¿JòĞ-·‘Úlh’ Š±ÈŞ›Ã<[²sõ—ÜC¥ï·}åÖÇşşü0Æjl+áx”Ü•Ÿ±hdømø#û®ÑNh‹_üFdËÈ^·Fõdjq?2/„	Ü§ÛÂğü¡™Œ6ö&³·WÆDĞ’ä¤B¹¾Î"î½ûp|0ÿ—¦®Ñn·÷nE§B-§û—Ü”uĞÇúÍìüpßWG‰¥ &Õ…n	äÒØ±5/ã¶Ñ½MU»†:íÄO[ÆÑù§<ğJÛ­ãÿ³¡ZÄMKÍ‘•c/æ*ËC'ÈÚç¹Ğä*jcÑì,U›gCŒtã¬*¾îÂ Éà§âùÛ½ƒ³«a“®Å“ò™2JÓK…$E[ó£`sÕÅ&Ñ6àÃõ€Ğ±ı`î«3ÓU¶É=6ÏüÀŸÔR»zZT‰ñ•ÀqE,²!j}UL¬®™†ü$ÏªIæDÿ¸iMÓFM’¾²“zZŸXQú÷ùê¯¡è—@©øÂÛŒìNğÊ©:ëàwB7ºÇÓ6š¡yûrEY_^£ß!ùÚ°V*J*ÌtçAdåÉñšK,D°ç œaÙşw’ë¿xŠUËè%iô©BIO\Ì”îòphY8;>ajO˜ÀI\IÇhu3,;Ä^Î™‘¨Ëò|.pŞq3Ø%ˆ2³ÄC¶Î{½Ky ğ%FÃ¹‡ª'àá~h=[ñåÉÅ.íC§:B×¼ÕéºÁş0—5 UĞiíæùC¬‹‚—ıµ'sè²ˆ·4—“ÙCy»³nã« ±k˜xM•”ğÅCl0×Œ\úˆù`¯¥Oó2©•^Ğâ×ş¬?%ÿÂÄg?Ì%Øqb0JÈñ3™°~ñŒÈÂÂ¾^e'¾Ã¥H5Y8gÎ1Å	»
©ÆTBí"Ô<óŒœI:`°7A—Hœ7å¢*˜"¿ã$p(MøU‰x,İx¤õÆ>îÀxWóäÑğ«ô•^é¼Uò3~pÕó'ûÌòè´†îÌ™V•ĞÃKrÅø;9B÷ä®)ùf
F Ï¦ä°Uã´&ZG!:ÿv]2Àíú°ìj8öùæéBóX©ÜÃYùsÉ2"ÈWßºïÃœhÆ^pD{¡—PşõfyœZ…Ÿ‚n"%Ä§{C¢Nu2¨İÒÄıÁkõı1¥Üvg«õú’qüHw¹¬$9lK]+!LÅö8µUŞÂa'7¿•Yë“ğîïDIz^Zj·¼%Ñ±‰ ¼(98ıºNÉ½ğö¸F2Fé·Ğ£Ûd¾t±${ò«‰Ñö<ıïu_9­eKçè2U‚@Š„G÷†AÃ HöU.Crâ"’æÅ¤¯¾Œ™Åş©e ¾8ºUB’|‚11(¤]…&$eÓ!vï¸MJR$=$g`’šœ {ñ@W¨ök‚[Ÿjn[£›süÚ{¦*x’nWš[)éR*!5Ú÷ò&Ù­E%"ÀNJæP‰zÃ–ÒD–£+ƒo ¤Á7GÏº²èq0,igÀÊ–S*.;~ôóßÍÑ­ø«¦œ´‘ Î®ÂL@ÊÁ_y,ıÜ¹Õı¢&.{šv'ŞÄÙäÑi®ªÉ¨“h«rr´hg1Ç„qşù©$Íd=´KÇyç6·´.T'™æ±Ş¯Êt}#fŒ>
d[ˆÇ•WÎ~&R^:å69é¡iIç†½É‘ù=2öëĞÄ;İnåŸä”ÂÌxøP[|M·3ĞŸÉ|{gJêZì#¤B#ÁşJŠ1ëÒqiæ¸-ÒE!HĞ6Ó/Åd‘M@<J-ƒ+Œ ÌÖ] $g€èrW(yddşôA¨O³jÈ‰
D’øÃ2®ù·,ß!ÿWªY‰ä¢(˜Ù`{¼fz„Ğâ”>X÷=§ÕÄv.8R ıôVÍ6|›+–0”4î–o{ ŒPqêaãŞLŸ¶œ½D5eûÖf¶	
«¬ÔÑ…vA@``¼K8œ°PÇ’`2±†qjHû:hô»L¦²“ç½çpqJåº[‚”H8ùJi€aäd»iqèN`¥ºÇTÔ’¤Œ'H•«U$a¼ÿ-ÚQ@:"á9z,²åÄ|ÿÜ*Q~°äWÆ×†4·î³òàÜå7
ÆâŠ *aáÔ€ÿ[ø©ˆd!uÁ"BôKº÷”™öŸ»9ûp¦ñ“šzoDÜaökSmÆ‰>óEo‹ò?e^Vg*¤.2!)0jşòLÅïİªµr<9ş@OósğŠ<p6ØšP—@HŠÎrhN ¥„mP;”Á_³7$^§¢İê«`ß6AOS43òÈ¡ı€ğÅÁ®ù}}8.ÌU÷üSOpíx\YEì;¶ØCu\W·fÈ™‰fSV»EÔ¨Y8?–ÆkévÔ< "şL!c\´òÇÃ´ÏhiL‰!wŠxd/Ui€=8İK#m :t¢M®0Újå?7‚ı9|å.èDÄ‚„îqß³ƒH0>•IşúPàºrIÀ-¶f•[,ê‰ŠóÖó÷†ioÂ…ug£²%9‡ä3£“d|ñ°%D4Mİ™®ÇkI¨„n HÊÕ'´/s5ƒìá#ğ(sMWEˆ.4)‹ÿ­ä6YMŸwŒCX²f±ºd/o‹¹P°ûsTF ö‘çCiScÂje6§NÎ©’„‹p\4Œ4ÀMï®»à |+V±=…CJ e…Âò`&ñÉ—:C.~7ÿ8Çßvè«Q¡â2Ç]%T‚¢Jš"4‹V%Hmè¾æE­6#>ü=ÛKhº*ÔÈí”8m{?A-]Ÿ6åö!
w/ı5|q.‚=hFœoim15"…1™á]İ'ˆ
ğG.ë%SN4±[P­ëøn3©¢A½Ø
ƒ¾UÎRô;¬ PaPÏm*Sln›ÃX‚ôš^ìw
Q›ÜÇ¨Ñ«QP¨íÓi¡Èè\¡C[³µ“İı¼¶R&»ÂñÕ-ö¿ãñáÄI‡ÔÌöFå°~â
¹à9T÷ânà †VŒ(„}×zµ‚{Wjr:Ç…ƒ—WƒV¦É$Œœæ»·a,UãŒ|”<‚«§2Z’„æ‹bwVş.‰I›‚bÑE¹@Âm‘¦ÂØ^Ğ²rwBGŞ¬J¤á±MT-{£Îk‰/´;Xš¨¿<[]êìï‰?ø,Qó"“ÖöL<9©ÈTó 6M/è¥£Â§êã2‰ z¾5tUDPVé*ªÙ(},_ÿFfä¼¾@á_‘NÙ~hR:+ "†uİWƒñ‰ô17¸$"„àvøÁq‘ø€¯§¬=ìï?ÀÈñÜÔº¼Qğš`½Ïä;tnólPéÂ$„+ÆŞhÏy|˜w-gI ã<©ˆØ4ÜpwKœ{:p&ïÉqÍğĞy*Ã,¯
4’fäEK‡¢Ç¹¼w1aìc>ÍùiÀôM)mã…Of1_›\Í2K¹>NhT„À»û‡Ì¨£ü«VP³@şg•Ynğ‡9íÍyÆÕôqĞ°É a‰£YÆÀPóÎ¡Z’  !ÚÜ’l¿ı}îµ8N³Œ	¥°%vA¡ã;°6ÆÍuË9†
N¬®Ëv½ªA´kÓ”íğùü£ßdÍ^ğ<Ï­amBÕ¿	p¥¸A"èûq*@r…-Ó¿:ÓÙ)¯£¾Æ65gh@öxE¾LÍYecÄĞ&Yÿœ£³—úæl•ß °„¯OâL&:˜‚ãX÷ûçµ sü³Óü6ÔéÍÁç	¢“Ï~àáyí­âm{œ².…hT,„›€PV‘]uƒÖøejV0ÑÊx—K8ßPòÂ»µïıùõ«ˆ$ef~;û4¡’â">¤_ÅI¬‘Z«cÊß¥uÀú?×ªÈB²	ˆCsã=TŠ¨ÀE‹w›,„Ì­|±ª8Ä(©C|{ùÙÿ’Wëæò†i¨ÙØÍÌ…ŸlÉ'~­Ïn”ôüxP;²~î—S¼ŸÁ&˜{²ÈK¶Ïóéa'¼l;oŞ¢4“ä]%/fÜNáIcg·ºÊ³Áù
WÀÅ‹Ä~MkÉ!Œ¾ëÔb£]“&©”.¢¸ÚËhLİI´¬†İ.d0æÍÄFör¶ş»¦ªvzò†ãø÷W4µJ×—mXyvV{Ú5Èû•ywD7õ˜FBªˆ~!UHş²¶U"sâÿ@ ¶|,SËg¸Â»·-“YŞ9İAûu¢Ï¡Á<Û8½hfù)¹¨¦«£nÖÛÎ&Ú.a9aí—ÑF)[ŞËHŸ™úæ½Nyç¸ƒnúıÍW	Ó]ã„÷û="(”œ"ÉúÀÛ?íüDäxĞ„êœsŠÅj!.?ä;¶§1ìùOK)<ôãGÕˆ†Íİ;˜˜2€œ=	ŠÌ9 1K¶‘/às!?Œ<ïıº‰ºà…¯FmÁh”aPO¶ª*Âj‚®ÛÅïÎ0æ!PF\$†-&'³’7\+6ñéçÁ‡§õ,Y£ĞùMhn!áoTA5Ùéİó°ÇpFšdO‰c#¤#@‚a ‚¢1¼ğ7Òæ™ÃM„¡’°`ıÑ¡œåÃp¹Ë:EôrüZÊ[y<¨!¾ ¦U†–…Yë-œ*šw‹O¯Ã»±k@õ3şs)–ÏG9ÑåÖ»–¿|ynS44ï>— 'ƒµC!<zœ°4ñ¤øÃGl[ÉµíÄƒUòF"ıëi(¤.>K|gëı¶ËvuEâäïí<â\âïDc!ÅãˆşÀ>ËÕ'sìc`)&F}ı-âÀ€Æü©ˆô\"ôèòÅÜyÕ:tpc‡©ú‘Œ•˜*@PGÙCó÷K=t|£[u¾(Göz]e
äP
ï®XÖ†Öë†sS30AÙ´èˆVZ¾%~Aı"}hÃÛÈ/!cÇvï=—)Åå…cœ±‡£ˆ1iıïTÄ†=[[øYÒJÉt!;ş¨Şà‡\Şüšã_•q|[˜U.{W¤B}Æ’Ãèó˜]i!¡cşöÈ1l‡Ün¡:ŞX	7/y‹òXYñoËéùµ¸²Ê…™“ü°ÉÆnò;}pöL.>?İ%6¬Ğ´•Å^¿}sT‡sõäyBr®ÁjÂĞO‚ìÍµÎéãX÷ª˜JW¶º–èˆbRD MŒXZfat ‡è±çÛ
f$º†¯)Çd#©r×BãØsë!’Ê%×«z¬y¤(z3ÕÑô«›4‡ÎÙ°;>S‡GÒ­¢­î1åÙà%w’ğ;8«@á{¤Ï ƒœkàe‘ß¾é ÷¦°ÔFªæF¦Ô_·pŒYó s#´"9°Q†^Ï_˜CAè´bØàY>];sòT1v²¯q×äÀOümçIk…zÛz(WPbü‹W)H
Oô@5eOƒ=êqPA ¿FÊ­ú¸ñS"w®.NÚhÂ[å=PzÂ­¨N—†Ëìãue™níq	`z¦v¼F‹QÉl€a/$
}wFa'—ßQŞ4Ú©ÃÈD[›sƒ¾ÓWàb$sûÇ)CÛf"ÏU“EKºµ'Ò¦2¸”Dq£s¼Ê—ÆÌcf'—µïECDÖf”¾icûLÍ‘8•gµ×­°™YxÔß}Ù1Ü"dÔØŒÜ.æ_¢üÆë'Õß,A[Ùk…%ÆÚ{Ù‰X<#-rÂJN²}7 Hñp÷/FM\ŒqñL7<\šÜGòHº®~Ùfxœa	J…bÂókøèî_óUrå~´u‹Ä°ôRbìRßéù^ ÊšÙŞ€™Dµl¸RÌ¹Ií“Æ¨OŸ½yzü.1€Äsvœ›ğDå [ÕÔŸ!œ¨§æ(r
Ÿ&çö£=n„™‚í×5¬—Boô âğÚfD¸ÑmOóXD};à+ˆ±gTš7ˆ~5å.‡„¥¹š“ã#³ùƒßJOáA²z7­&½ßÙ?ÊÏ0(ÌªğõZ¶ËÛ¨›á+Š	eò³c¾MŠ–*ˆ­%”–Ï©ãşa“ƒ7Ş$§ÅÒf\–J´Ü3Ñ„»:OøÒˆvkµ‹;‡Ğ™áCò*E»g˜áP2æ.jnš¡Nb§¦â„”
Ÿ!ÔúÜŒÿ]#]]º¡:Ì—F‹„¢"ŠˆQØ—‚	‡Ğ‚³×SÄ7/µ0$O$Ÿw0‘½Ì s9Mèi÷»·‚Š4ÒŞçÛ5ÅëçSÑDÀ˜Ù
Õ±ÉhÑ¥Ó)×¸/å£`1˜6õ¬(;ñãl³µI/Ï'ˆ—•y»ùì¼pÌ™=-ğÃÂÆÖCƒ¿§Ñd6¿—÷ÜÑgÈ'Kfİ_§é5~MÆ£äÔ€ì¿©¶Ê×cb_v'FÍõˆÂû°©¬Š¤Gaò:°û~âôÆ@ŞZ–!Zvî½,æiîj¾x§EM„Ò¨é}ü$û””'–àØĞÌäûFœ¸â_ËGL‰ï‰’ûèÒ5è÷´äÜ ‰äİxJ[Úu÷Õ³õUæöBÁ#) «;0Æ¾ÎPÅêÄ´2ËÀ‰}fí!FáZ]>¼®^“wçÑëW>mÙè¡yçÀˆæù2û±5–‹A{‰s-˜U,5 –À’ºá—N:³Û:‘‡n9‡ÄÒ91M¾;ï½zjö)Armë™±wĞ¤ç;!“LVåÑ,é “Š ¶ø¯%ı9;Hcîâp#µÙîx`¨uf2Ş]ÎûQôv×·q;Z•â2Œ(_õ¾OÿG×ÀÅ’ƒµdÒàÖñõ»I`\õÖYä”_¹Ï hÀÕ"^ˆAÌ…Ğuí¸ôJ÷0tşçf7‰Ö—ı¤_ıÔî0òŠ#ÄCDZHPKy@xşx‘Ğf!ÅÔ'hœ ¢™©ŒÏÖû7’vIÖÓm>İ;)7W¹WÌ‘%],dqû4+šnŒ
)?&´ŒfÈOîd'8Ã2&…TöûP¦ !é&EŠB-3g¡GV…;5s•î`l[~L”\ê·bbÎ9{’;¿=:=ï„\ò³nÉé.€\²¸§aääe\¾‘ºUz£€„£Ğ_}ÏÿÑ^ªÉ"åÍROŠY¼¹şZPrèY(–ï?±I9‚X9s"kño3¥²ª¯yãˆRE¾Ü{“ñmëÖùÎM+§ĞÚÕÇg±˜Î|ó@Íùçp¯j",£hÿ÷»û³9T<F÷I°§	<«÷¯ş+Bv¼Â:š@JhDœØ?{ÜÆÔ0Ö r»î·l½I'XòGÈ’P„±Î˜!…öyEpAí,Á%´éÁUÖÜt-àMu‘vg\ØB©dfî­¥YR
ÁRòa%¡ÂÓ–
0©N›>˜¤/!íL­Ë‹ˆÀ¥U
Õæ˜>rMıòì¸gv–€–“f:ZÂõ(Ÿ‡rW@æ=ÕÑ?LÉÿ³H|3ƒL“Ñ“"ÙÉ> Ó5Å»Óa\˜íÓøêõ‚Cø“ê»^Ã¹­UÄz#İ4g¡ÜcöÚ.óôJLfT|tš±àÀàrÆKvHs|ãƒ4÷[´ÆµÀåÀ]Ì]Â‚é$s	ı‘ògzòhß5oåJåÁÏÏšUãËÿà­î“;ığZ9ù—:÷é*A@v>´ÿäÆlSüf«kÜ
VíŠD¯#ô±Æº’g'©$j4+×¯×álÉ8êC(kœsj˜ZãÅ6V5cUR¸R…‹¸Aq_°G–tåi7 vÁMtşFÉœ
‚
üB„ùXÅ•~ù¯`«œ¥¶ƒÊùC=¿f6IæKf¤§\hõÃ¨	ääùá¬ha9Õ¸®øl?M'§´òÚ~8¯M‡L‘WjÊí-¿‡JàN?£¹ı8$÷¿)A…Øô ÑÒ68ÍÊ– Ùë¶{IŞ_8ëà†dFsfLöáñfÙ4^¸P+o_Ì­CËŞŞÅÀèÙ<dÏ ã¢ğNéz(”&*Wó9$ØI/ÜÌ Ñ‹x‚t*TÏï¯¸gvkdùæÜ„ê‚§‹İ³R[Fäšî›tâê	/ÓE—¬‰H÷V`H’eåàª,—aœëS&1Ü7Õo1dö—Êa/»²Àn‘oØ¨M+Eã(µFÙÛğ7aZşCMİ6Ênª2Í)ªmX4ßèº›äJ=¸«Cš ˆX_Îù£CH/—`‘7†ÇÇ‡.3‡èÈ|#1„W KÉ‡Y.½Ñ_‡5¬.ÒPhOY‹+áÜó”bTÕK»Ö±ZÇP‘¤rUSœ¾tÔúdÿPÏ9«LH„×·´·V]‹D³nƒT¥*éÊÂ(â+TLQØÌ#¯ƒºÇ’‘&U5
íz%jf·ªò8¸’%¶}uÌo¥ g5ŞÏ&æÁô{¢çË_*ë“f•)S!;DE%z_ò?Ğ0ú)úÿ•ƒÄQØy}Fz|_W¯»ñDQIç4Mä]~p¬x”y—Qš¶“8w;P³Æğ¾‚M‚4XÛY§ÅmulÊãIDc°6±N%¸FV]*§ú˜"eÃBB¨¢xn~h öàe0 Ï*c§¥­²i»¸ãLÑ’n9ñaJÃŞm£î¯SúaSÜğ£ñ„ôª.WÄÓæ.öG·şÌ¨Xß[ÀG80í‚Tk(ƒ©§UïÛPe¶× ëŸ;ôæTÿw\vQ´~§Ã-y¦2•>wxùIiXW©w³Ki ¶•w0…bÌ{±B2-rÚ÷dºCÖ9aoëÖÆóJùWhO•¶‰ÚÊ‰òú¬ÛüäÇøÌÈÙË·ıµ½¯ª?Ê“Hˆ×š®ÅºÆv¦Æğ3`f·X“n›_‡®‹É¦ütÌt-Té5û\Xh¦xıQ½A&-E”õ‹ÔÉñNSßŸİ¢€^PáŒ¨Ürqv¹f´ JÂèÛ	7qıcË=¨‘°Ñ°u@«&ªâi¢qÔA›çÜ]
NMš¯ûå±0qªH`}³´­ĞE²´‡[:Öì?İ¶)Ùµ!¤‹¥?šœš¢kÎˆí~íkµĞüaûPé«µ#p“'lL1•ÂÏ»<Ğñ0¦îGøÙxTtl;•à–Zà·²u½‡T%€í¼Ï@#ÛØ-/í?l,ÇˆÉğ#éò|=7†ùımûû¸­êéÔU}ş†jËM,®«Ë¨ûà^ù6ìl5¿§Ø°z’ˆé½Ü©_0‹—ö¼âÆşM²Ş•ubc;.Ñb\ÿ‘ âÏC¥P)È6\„€â=mXº¢OÕ¯ï"tcpü_>ôLYd¡ªÛ­F«”Ê¸dqÑGK^;»ç:Õi§øåÚª<X¡õŞÃU¼ÿ5Ùe>É#s“ÀñÇÁ8g¾ÿ˜=å¥‹"]dnİê0î¼[ØÍ¡K”E•€&B©OP(A:dJ[ø×ıÆ2cctQ·—W½KÙğ#À´¥Û¡·¼Q]$s":†%‚Jßd¨mü®V|6J[™Êé¶dJ>Ù-ˆh5 Sº€±"+‰Q
L·C^UñG=€sÆo^cSxÉî	ãcş$Û¿ˆµyLÍDv·Õ† |rAT¬a‘Y§]³µ½ã.¥»«ª*TU;Ò/G­“ÒXlŠ{gù/ÄÃQSjÉ‡á²€aÅwşØfc3E»OŒÿËašb½ÿ¿¸x¥‚şÔ?c)FÈÄA…ÿIËmnQšmÇ2‚Šµã¬xSØÏô¸0²®T:–ë>Œ©D]Ti>áÔ$9íF+¨sáLß^/°;'¥T 
ŞU6Ø§÷¯äò{ëghR"KR'/ G{ğeÌ‰sbÊğøTP‚Ø{û°Ñõg’hz©FLùtÖ©^ıMSszºÏçG2î^FohÃØÁ³(¿®æa+ÀA|ÆG"üh_‡PêöX{–r±ö]sKÍj? {‘ºß‚ÇcùÏºmOn}®\Ÿ¿õE>çÇ%»òÔ`Ö1ŞJĞMñÍ~DÑ®è
ñ8á?_jĞ«<Q°F%Oñt¹¦q*ßÚ–Ä ‡L´õW¬}O5Š<2â‘ê½!v€Ùn¸ ÿõdl[€|!ó´73 h$#Ætab(Á¯)Ü’OK¡ŒıRõÇüëŒk«‘\vƒøñkñ&fs!Â•RØ‘|EñÛÇ“ˆò~(‹A$~˜SãÍ®UÊN˜µpÊ…êÛ
°‚Ó—\â×ĞüÉ4ÖPêØ3<èJíëd~¡|k{_•M¹}‘º~ÁVš Ï¿é]Ô²¯tÖ}Üğ^5›Ô•B3>ö'
{ù•°•ÑyL…Xanü‰SîÜ¶çqßª¥ÆÒ(·I[XB$
i>Ãvˆ­Ş9ÒLªI­~79ig ê÷w'’ÓÓçŠıüñ¸a0à€¶}±xéDşLIõÉ—Xth¶È-ş®™Á¹€:ÿf¼ÿ÷í!ƒ>é÷˜‘à‡6Îma¥3)è¹ygáíCâÏáj;bUf®HN”¨ÿŸ§KÇ.¾p©xiº&Vv¡V-ØM®{İ£ÁxT³Ó_H2ÔK@³	ÊN‚w¦£‚¾?gõÿj’îEÊ‰TÇ<y; pò*§–G¦7€EMdõOm@p7ÂÙjâ.1%öcÚo"àôZŒi$R„éû‚r`ê8uNN‡¤îZï^”	D¬ÜR/wã±c«Æõ
c{Ş	Fzeü–hPİÇP‹ìybèav¸WœAO#ıÖogÏö!há™=ÿ)WYñeïåv¼'¨tš–½'`®\$¢;TÊYâdßc¦–yp¨ëò;ˆ)Y‚Y³ÛS³bO¯Æ^PI<ŞÒ1“ÒNí¿Q¤Jéğ+	Jôœ4eQö û}D;æù²>G¯€¹~)¾ğƒ…‹F¨Io®L, ®òoÒorÂrV)ëˆ“Ş·Û£ÇÌ6˜úAT0VGMÀÎ"0®§SMøŒŒŠzÚ	9<“îõ
œòº+™¯¡DZÒF_)¤§Ö¦F†{Zˆş1 6”ÒŞóD‚ärsç9ùéÍV7ÁEÔ[cÍ¸u”Ã½x^¹pe	h˜9òŒÍ&IşÃñ!páÍ¿³ ¨$eD³©jô¶‹CŸ…ç¡ñÉ-VK´”ÎÈRúÔŠàw—;P²
yÇQKòáïÜÿ’¥XµÆÀöµçSr™æ3Ä’ı4´1c"½(pßX5Œ›Ni±ãÚvIÅÆó˜|³Mx>g>FA’„“u İ¤k±n´Ä/Vúã«ˆ©ù¶º†kãò*‡T%î®.–”Y‘˜ Âmã½ÙÁ„0·&ªÀªg±xª”MA¹y`eT*OşØÌ0§`½4ÆH/İ½‚ğ—~k+3 ¸3d‹ãBŸ~ŞÛ`[J²k¨*/(_"…™ë
2hk”nAK@HÄNö7G´ê´³›Ï|°Ò]ÎéùON‹:n|¡ ZÇ† |„Ò+àãI*|²­OSD$iÖY†É’Y¾F2?×„“ä•d©âŞGşUvÎ™Æ\[
U4Ã>ò|­ÒVÂiPmhv]XtZ54Ò‚Ò©!ã.„pÅLÃˆØ\‡åÀ+WÍß®ƒ`9E!Êw¡uGømº’Éy9a †_„äe‘¨“RPf¿°ZmD¢€M\ï›¤{K*o¦µI1ê´$kYö°G§äø—
 8¤ª’áöT*‡Óû“İ‚~ğoÈ"ŞAªò1 ‚»àdğ…Û¯¿«¬/é>Ã«¯ëÂA~Ä>Ì2º¨¾A“\ëM,îûˆîŒPOÍ[Ï]´Õ¼2÷g˜ßé–òÁ¤c}5AùÕƒ®LVá©Z¢GÙ5"Ä¤³lÙ”öáÀwG™“
]t›ÍÛ,ım4;¬}ºöéj‘äæóg­Æ~ÅÄF¶ÕIó?ôúnöá¢2A~cP6¾zéuUÜ5I|f×å8¡»\]µ 4¶Î=keè>m!­•%š%é™†œÓ¡¯ó !šei˜&¸ˆ¸É(«/uoC‚¬Zæ¯´=û!w¾-ˆmì>@†øõG€™«ĞkmƒÑÄâ3¤7¡añö^ë¶Ûı<Üµ”L»3}–oı±¥Ù
|_5L¹^	ØŸ“Ç3WÈ¯o8Û™tø!Ÿ¯ Ö`ÍÚÊ@Ñ¶ù/A¦q‡u|³.¿ÅæûjÊÙ¦ ¢Ë`£ıú^`¬ÇX„˜‡{a\ÏËk‰Åñ¯*‡øŞ$tfõmï­Í]äÌûWç¬ÅlU·å ’KGÃ9{‚rW°ÖçÛá©SAœ«¡s"
xáöäW4³\OpŸSÄ9gUÛr0!2¥À«ÌäõS¡uê¤Ê†¢#bùËù)+‡±éV$<ÄşbÊÛZ¨oK×Á—©I§÷•ÅÎêß˜qxÙÔojµ°–©oåXCÛb5Æn§Ø[%{sîw®™ñ:ü¶[G ¤Ù«õ9üMşáR·71ÈîÔÏ5gã0’ÙÕaÆ'˜rDn­ºÌêÚ¸ÀÆõ°aPeÉ§W°yQLøüÅ§¾ò
åóH¢†¾¶YÄ·éIU’c¬yì6Ru‡#êO>TÄ¡ê…âìyŸîRâçí®°Fùb`çDŞ£o!iÖ7RÙÜÙH}q*ûF<:µÙ¡İİ€&üu¥ß¿ÂãûÚ	>¼dİ8›eÿ×–4y:8©NÚvK7Â¬sìÜ¿ÜIê×èÆö‰­+ÿ¨&\IOãóœ}ŞSî.ÇÆYÁMŞÛÙº Û"yo:j÷‡|CÑŞØ"Õhug£(†k—}Şs!zıê÷¥(,;?OIeÉq¸÷B³şÃmºy¬C×“ÖhõÑTáû+×¼èm+Ç±[‚½6©ĞÛMûPPŞ*L³‚5mÉš¦ÿìÀR<Òåò†ˆLÃÎÑ³•ia±¾Ny^G-„‡ßê]Cò÷ µ¼]Tàª¨F8;6GL“-#×Ş¼@ÊØÂ±iÓïe,™”NáO>‘$%«°¿rƒfÏ#ÒsÛ…\o	è];ÚÜEj,S†ÌuYJÌåó»s0kû¼^òÜ‘Øí†b¨—¤ä$å!–Syµˆİ¯köŒšƒùàma–NË—´İéo–µ¥Çl©qwÑ`~-=Ğc"ÔFy>¯È¾2‹”òÕb7œ	¶="#ÜŞjÉ…	ó¿gh3|Åˆ2ÿMmw"}àÂV­û|»õ‹vh+Nf^aO,×V ×Ú‡âíC;J)NB¢,w/â`Ğ2QÁ/sªKû¶¡øI-°¿¨öŒv­ĞÑG´O‘(FÚqş˜ö”O^˜dÇ±¡b“…Qm—j£—X×B¸zFy!9Úİ°y¦=¾ ú,²ip§ªCw0qL;î0›“|‡Ş"ÓğgĞú­9yZZw;—š³ˆt.Dtœ¦ûóÒ+ÜŞ ê¹ãÇ÷£´Ägº$étÑï/ˆ
•[hKPÒÜÎ¤}Ó>©Şg?B;æZ|“‡P“‹y²fQ’ rÖJn&&­°ob…§bRÄy“As\ãM	oMŒŞˆSG—xIh“O
61p"Ï1¿kTÉa;À94>º±/r/ ôtØás>v©bñ4$6úoWPd0¿®<Í~²+0²øŞ@eåµilŠ6‚4ƒ®AnÿgVs3õQÖíºé{Q"t¹1Û[ˆ|D <‚Öé÷ÊA-\Ø–‹ ŒËîà‘& Œa?F'Ÿ÷*«{q#Yı¶ç~!¡ôÂ<”ªñlC­PW
Û02Qš½ınÀ¿ïËÚï;Ì»YŞÍ!¡¹Òq¥pı[@u½xüùàS]9øõ’Fb)Ş¯É["3^ñ†p“ä<îuœ¤2	×Ña/q "+p»ä&AX
<_Iµ!Â;b°Õq‘wÆã+l¦§Ç!İœ©âózih/§ÑùåtxŞ1š’nø8İmÑŠ=z+¥xUÛ-t63`ï·?×·Ù9pšBÖ¯JJ‚7ÒÅ›'/4Èš®¡C¿ˆFûˆVLÈ»“f¥m‘¢wÔÀtSúoäÙóO‚ƒ‡
V«Wş¼¨jã—Ñ·²±°ò•O³Ëê‘¦OİÎFMQ“•QŠUŒL|‡ÅéZ±O° mpV´`¬x`Ñ7dó¦d%)ÍÆ‚p)XşÃ>À*W^Š†¹ø8§‰ºæ¥›¿ŞTf
öÅ1eØ3«ª s`i1©hªè§Z)8“q†m[T’œ=–WÕçX‚èí˜ØÍéâ@°úrÚ)Z-0õé9-Şû»Fµ‡¢½P`'ÏÕæÃ88×£¼[A`Õãú3Ñ£~^‰ŞdómÜ&ÖÎ?1ù’_† „£ÏùŞz¨=D“Lëñã˜¢§æ]xgK´½za_ ƒ!ª•ß^ÜüÚÍûX²NrA¯ŠLlˆW>¦Z|ó÷shõ
	=µú zªs{CÈ¯Ë&š†±DóÛo^?¿ @@ä ƒvóÍ‹mï,'<©€çP®c{½‚r&:öß»pâGá>8piè/û±UåMx:«O@Ø—YÛ0+beè¯‘-L…—kıùìE$:ö*ŸY¹rU£±Ö²!r‡SAIRÊ[Êm[^¦·…÷u%Äîû•N{;5Ôô:o´k~xTrU‰9ôÑMÆŸ’öéu’ÕÑsá{rœ‘y‘Ó	YÕÔ°–PE©guJaSÚNQ ÑT¾‹kiß|J>ô{Âõ šì¨ì×wE‚ßÑ:ÊGCèçs«Ø$ŒUA™ul¾ºö€tNÀ~t8\¨Ô©—„¼8&€3zšÓaù'îK}BÂ:÷ÈX9ÃæZPjİ:Õ…É'%â¬xv·æqÍxÏÔIoğ›KexÑqcµÚa"¬ŠÏ
è½Ø-6k=ß†ÒI4ùL›ËŠU‡'`Â§Î4faÌßâR££pĞëºµ LvÄ1*ÅŞm¢'|£–*Ú‡n­0¥ü,‚Aıy—•£‹¿#Ñ$x¬ b „š½Ù¯ˆ
'¥ÀO@ô…ù{1™/6à÷œ³)T ãÎbËç8«Ã’)%ûd|@Ç3ü”vñ¿óòc·YÔèB
Ğü;T€Y8šnÁ¥•Õ_[ó¡è\¡ÿ’z>öf%}W™„ˆO”Q¡zA¦87N/1•Z‚AYzŸù9¹öi	CàûÚS¸_¼ÏÇÖ!ë54ÙŞë¯:Š0Í,KK¨>fFò!93äÛ9âz@2¹¨¡brYÍ#b²`íšİ·)(Q½·İv‰eDÌ/Õˆ>Tä?Z‡nêÀE-ÆäF§¾Cnß*3ù„6L&gğş1Í‡OšxÔ4°Q=qTÒ-^ĞŞ–x×ô$õçŸåxŠ˜äD ùâz6ƒ‚ßzƒ Ş$Y@6ÊÕÌ¦SšD¤Í²œzÓÈK+ I”Û1„ı‡H~AŒÜÁ š.IQÚƒÚíœëø³+}ªãµ­ß'ÍıÏ\À\jßa–B0¶A'—a¾©·wk^*Fg‡İˆhÇ×X”MKÏfÅg›K}‡†–§(ô}SÕI•Ûo‰ -XªØ#FØå8‘y@…G ÇbHI’‚Y†ĞsÛ¶>…¦Ÿèè5ÓH¿AÒã GŠb€4hÏ·Ö:0XÒ¦KŠ~ #`¡ÀdÄ°±Wìç—³	/F'û.ÚET†%‘(É)‹Vhzi¿gTšV {º”5ËE¦ãÜ%i9xå$d!|´5.DŒ×ıàåqŸÃÆèá!‡U?€İF3jş³\f)K…¡Ó÷ß7qÊ—`ş'Ñ<‹PÑºâÓŞ‚VÓ É<*	foàï-î9ë\AÉß	Áò®5rN¾¼B@¾kjAáO=•.¾§€·\OƒÀ«¯³Ò1Ëù¯³F½M87fT;)"¢ŒÔ-›ãn‰WCDH¸¤Ù´wÚøbAšlê/ dÍyÇÔ×Ô£*øOø-VÔµÒá›®Ğu|ŸFbÚoŸ]ÛxZÎØ·T{&Q.ëZˆœŒ¶ıè|b‰É8ç÷^İ!¼­.{`ü•… MÿçjÓ»´Ëf6zm-g—øúˆ¼”+²ì1êé5"	+À+‚ñ+pĞ@Ù?Z«KQÿë|Òu˜Ô†iÜ•¤W8F²¾.¼ÈÁ(p6ã,İ^èˆ
_ËJÄJb¯
˜5ı ±$s¯ÎüLV‰ìeº¦±ÆK¼[³¼QÃ;A¶úôÒU-ˆÁz°³¹»ÜvŒŒNø¨ÔBÍhÇ-cê·sã—RD‡/ftÑƒ=ÿ—ÑÁ$dt Ñ™•aœ“E'€ûä²òœşr?»—@™Ã&.[, ƒ”ûÏÅ¦¦[f$¥¼Î.ÏáÖ0A(C~éîòmªujúkš³$àö£÷Å…$:c
õ¼hxíÁ‚¥ÆÒgyQ´+ÒŞB(æáÌn&Õ«AëhzÍ¬LmE‹6&SÜÉ¿4`Q`.ˆˆ dfFÔÂR÷’I—
QĞüs‰}¡,KL×,6ä{îF*}zsïi6» §Ú³‘ßÉÃj{Å6$€î,º<RÏf×Æ$¢#qDFÿi…¾İçmGåÏ\ÖO|¨¥Ÿ½ÎÏjnvÊUOHhv05ûôòm¨Åç:Û_Š‹Xğ'2›’åçìöF/Èü¶„ ô7´Ñ/X&é%ÑİRø§Pi¥ñ£\…§ZGÖAİ+h:IznòÕÄBdíÉ6ûUåÉäÿØÌæ\¬¬C±›’—^+½Şnï$(y)ê´§úQaaæ]#™ÅaùdÊW¢%€VèNNíRİ·Ñgo©LÁ‚âªt
ÉØæÛ…C¯´aY—ò-FÇÿ²rpÁÁZŒ˜ëæÉ¶•±wKÊ¼	_’ğ‘
Ås˜k ×¶ÙïÛ Ğ§Øp‹’ôçõ?eŸ†p´qlJœ¦în;+ÖUï+š,ºï<µœ^vDªËydˆü"€Rx”qÊÄ¨è„Û$å„‰·œ,A
d†,¯ÄĞôªéoî4ğ±ä—:Ÿ9L)âYô‘ ¿ l›¼‰&“úyŸ[)Qü¯,òö†®’@Ä‡záö:	“ºj·ÔÑnÔ5¢§7]©Œnk­LôÆr„ói™f®Ùóâw–ˆtßZC/'‚É½ZØ°¿y6,ëI~%¿p±G g¸şÕ„mFnÒmt`¼ö
AÖ²•g3"÷½yüÛòqha€úõ,Ooãb|˜´ÎÍràh† ì'F#—>˜X¾Úµ±ŠµT „NéÈQŒñpğ ¹ x¼(ÒÊ²$)§Œ.ß÷ÊšùıêVáZ¹kå«Ë­˜Œú\6°S	›qãá-7çí£üßí¿C#f™É`ªÖ ›83Ÿuë‘ıçKMó1¢Å¼"WÓw*ü0&Á›E3÷ñòŠ€¿’…áOK1dòn‹Ñ·0v>¸ÿ°ø}9ûÃD²ªø¸uÇg5æ¾HY¥óÂ“å®wÀÙ.c5§¬@g$ÜN3Tk-ÒC³Äyƒîaåd>F¾ˆĞÓÔlÁÖš×/§ÖMºEìaGõ)}.ÆJ•®³jeÉÎ1^­'üıà¥7Ñ•÷]×ÈÎ¯—;¢wÊ!)¡ûmA']	Tè¨¢«
)£ÍÉ9Š0›¾¨(¯uÀW­¸q@hf3KˆÉIŠFßœCäæ½øcN™}-PT^Y”®ué)TñâÕ
sğtùŠ­=¸.âöUh|gÃµç2‰è¯¥x3+ok;ÑìáÅÚ=ÍœSAğ.ORX!”¡ï„46&UÜ›v¹ÜóíxÀ{Ã†iƒ
¹¸?	âO4xê9rS¶*¤ì­ŸpN Co ”§ôSÔ&Œ„¼-êŒœ$çß²,‚wŒ'>Ä&Y¿ûÅ"ûT%*«ûs¿tŸRg-öêÄñqyÙÚê B¬jßŒQŒ}õ³Álƒq{¤³EK\k”O[®Zöä;­K½Å-ÿ(,ã'E¬‹ı/0v‡bÃÑşÖ- eÌ š>õlŞæn˜ÖMK|€Ó=¶£Q¸!@ìÒƒ¼¹»WÒCF¿ÅÒğ,1oÙÌ¡.–)#rÚ›™4R[‡im:fŸk£hê }8”q·¾Qš;KI
°­®7.)…-’’±Ü¶ª#VskÖ³Mı+cŒfqZÜ”šµµ²´ZR{Œİtúº;–™,'nÊW`‡˜7“¿¶Äº¹QH²ªs=ï¬«dKz8°7@“4ÓAú6)9KíMV ªïé¸!ş”ùK?>ùGO)-© PÓÄBÍ¬–%.ˆ½6ïW™¡]ı¨.©„6üÅÆç$Š§«/L	’¥ê ¬»"-–ÃÚ8Ú±HJ¿³Ïõ#$Ø‡|=E€yqK€·6—«æ"7Ó†ÂìÇN|§¯ÑğŸÁf›‡%oôÆ¼Øg–0É«Ğû†%ÅÌô÷ÍÎfª¨Ícq3RÅ‘ÌCµ]	£¯¯ùC4óu:úv‡£DÆ†[Qº€dİ:¾¸$‰ïºƒ¥x»#Úõx¶$Tyı ªC³A6`Ô¨ôÚppr¤mÜP]È‰§ì×˜Ó>p“õ¢uI¿ã¤ÆüâÓ-XpÕó<“¼¶Ü!VÚÕÈ©3¹N[(Çßÿ`°|”›øG79ÖÍëyñøœŸR9¡**f‡·gN‡­b•¡l×‰V!ôÆMt´NÿfÍ ãŠ…O@méûßdO}-¹²mÊÌ‹õŒ:®ğ4SëôÔ÷pwîBY›ÚwEâ‡Ê _Áå‰:bì^Jø“?×k"{W©Î{rfÆ'u„aæœyo24¼·‹†©ÊG4’Î7k˜çó%e ]¿éã8Vı+ã•ëšÉµk®_ì¬J5;PUDªh…¥MÄ»¢‡Dy9xå³Ïo;¾÷D~ğqœÓûÖ¬—lÿÑ~?J{Îå±Tñ²YÍê­øuFv4nl%~+÷Ñî@«
X]w××¬¯ÚNv?ôv÷ô^e"+j¢Û†#¬#p‚î»ñı;Ÿ˜ê=¿öø® .‰ÑÜ/vcoŠ“øAÊÊP1y›Ğ%hÔ./O«‹Ó‹ ¹*½Ğáû~„Á½¸Qç§ñ^ÓÖSŸôæásDñ8‰/ øÚó+JÅ*!…]ş´$ãQ8ˆ;¬0iéíg örÂ½¥=…XŒ|û´qçÉ´Ó:äØ€ÌªcĞl¸Káè‚dÛªcO%jB·÷?1ÿó]^k±®XÒÇut2‚×åİ£lãBEÖÙ`—İífp< )ûEF|a¥”ŒÃœQ“óä½Òs‹MèZ',g'!ú¬6S(äPû˜BÆí³ñWÅğÖó‚CË>ëÙH:;ñçˆb>{ÔçLG«½²ª^ÃT2Ò0èkS*u|[áĞ[“Fg.®´ò^øÏm¹²ÈĞiµh]XC£u}‰’©ù`@™i¶?E‰p·Î¾À@ƒ$Ö¯èü¨Ê¥÷ï³ ¹„A¶øH`”ö´W¤)xì…CÚ^)®„¼c‚z^…Y{F»"éÕªºû®öAæ:nëö7
{vb»mN±‘;2õ×j"RŠÛ%lE÷ì ë
‹}zô'Ğ~…ƒİÑZsUãƒ¤ü/¤ò"’¥íY)	a)­“úŠ¾iŠÄO {ÕšÁÍ#MU–ÎĞáõˆH&gÃ^  ùÚş—H|]*u§íŞ‹öÏÍn‰¶Şä—¡ê,Í!3$ªrë*š"6'm8v@?dj‡ön?zyñQß$2“^‚5n-ìÄn›mâÚjèÎoXÊİfub»jƒoY\Øü<AÙ#Üxÿ‡³ Íø^Ôâ»
%Ä?^¤CŒ@XlO˜ÕƒL€ã¾aW\ñÇ¸¤ï?¯{¢½(_o¤ş%LÉ«hDUOÏ|„ş˜èÛ4”‚“ñÑÙ+äJÁ¿»-!á_¯ĞÍNÄ$fz±‰ ÷ä˜˜C½+®;.Rb‚ï{MÔuz}ÔA’ãh]­îĞíÕşâê
<*o…¡™1›$öí0(ŸïfÎ	ú ŸH*­^¦Ü–Û@ZtÚ™Éq',cr]ÙgŠH3GÂÎ¢ÿ¸BÍÃ4$a©šÙ~\*3¶ïÔMÄàö(¯¨ü¾-éø'b˜£e±wil‘
u±ò<2jªråÈ­^SFĞW^ëñd»:øM;({óe>¤šp~œÉØ4¼èØúˆY4o‹YOÌ¬š‚à3Ê¼¶H²=o)o—O°0ùFã¨üÿûøßCÿÌ°(B…¬À_oŞ/	´$kq892¥Êáœ¢Ç[¨@UM§AöÈı)2c[œ µòm\•%F¨,Óİ:§JÚ:¶lQœ,ıP6¤’" MŞ–U(¨²¹·uívÇ·ºu	¶0p½Š¬¥ŸÅ¼ÂòwÈwÂ‡ñª¬âÊ†¼º]	œş¤ï:OÆøù`ªƒé„b‡Á!/fÕŒJQX‘[âw9håÈ Àä®¬^›ßj¡<¬—µ ã-’|Zù‘¿îÒ^Í	ÒT˜Ş(+BØn9†¬h(Ouh³çjÑ8oZ]Ö2?+z¹»áòB‹Y%ëçnXuTvtÏ|:/sÔ¨^¹§3öı¸27{å¿ñÕñD„yá°]¥|“pRüI«
ÜS;™P)*4¤Í¦Q~é>ğş®‘")n„–m                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                tegory="_lCWdKTk9Eeen_NygEc5WsA"/>
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
