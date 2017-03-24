/* globals Axonix:true, escape */
Axonix = window.Axonix || {};

/**
 * Axonix Non-SDK Tag
 * Public class for publishers to request and display ads.
 *
 * @copyright	2014 Axonix. All rights reserved.
 * @version	1.0
 */

/**
 * Quick accessor for $mc.e.
 * @see $mc.e
 */
var $mc = function(selector) {
  return $mc.e(selector);
};

/**
 * Get and set cookies depending on parameters set
 *
 * If both the key and value parameters are set, a cookie
 * will be set.
 *
 * If the key parameter is set, but value isn't (undefined),
 * the value of the cookie will be returned.
 *
 * If value is null, the cookie will be deleted.
 *
 * @see http://plugins.jquery.com/files/jquery.cookie.js.txt
 *
 * @param	string	name of the cookie
 * @param	string	value of the cookie
 */
$mc.cookie = function(key, value, options) {
  // key and value given, set cookie...
  if (arguments.length > 1 && (value === null || typeof value !== 'object')) {
    options = options || {};

    if (value === null) {
      options.expires = -1;
    }

    if (typeof options.expires === 'number') {
      var days = options.expires,
        t = options.expires = new Date();
      t.setDate(t.getDate() + days);
    }

    return (document.cookie = [
      encodeURIComponent(key), '=',
      options.raw ? String(value) : encodeURIComponent(String(value)),
      options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
      options.path ? '; path=' + options.path : '',
      options.domain ? '; domain=' + options.domain : '',
      options.secure ? '; secure' : ''
    ].join(''));
  }

  // key and possibly options given, get cookie...
  options = value || {};
  var result, decode = options.raw ? function(s) {
    return s;
  } : decodeURIComponent;
  return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? decode(result[1]) : null;
};

/**
 * Autocreate classes (not subclassable, yet)
 *
 * @param	object	object of functions and parameters
 * @return	class	class with functions and parameters
 */
$mc.create = function(funcs) {
  var func = function() {
    if (arguments.length > 0) {
      if (arguments[0] === $mc.create) {
        return this;
      }
      return this.init.apply(this, arguments);
    } else {
      return this.init();
    }
  };

  func.init = function() {
    var obj = new this($mc.create);
    return obj.init.apply(obj, arguments);
  };

  return $mc.extend(func, {
    init: function() {
      return this;
    }
  }, funcs);
};

/**
 * Extend classes with functions and variables from another object
 *
 * @param	mixed		object or function to extend
 * @param	object,...	object of functions and parameters
 * @return	mixed	target extended with new functions/params
 */
$mc.extend = function() {
  // Make sure we have a target
  if (arguments.length === 0) {
    return {};
  }

  // Get the tag
  var target = arguments[0];

  // Ensure we have an extendable target
  if (typeof target !== 'object' && typeof target !== 'function') {
    target = {};
  }

  for (var i = 1; i < arguments.length; i++) {
    // Get the object
    var object = arguments[i];

    // Ensure we have an object we can extend with, otherwise, bail.
    if (typeof object !== 'object') {
      return target;
    }

    // Loop through object and bring everything into the target scope
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        var value = object[key];

        // Ignore undefined values
        if (typeof value === 'undefined') {
          continue;
        }

        // Handle null
        else if (value === null) {
          if (typeof target === 'function') {
            target.prototype[key] = null;
          } else {
            target[key] = null;
          }
        }

        // Handle objects recursively
        else if (typeof value === 'object') {
          if (typeof target === 'function') {
            target.prototype[key] = $mc.extend(target.prototype[key], value);
          } else {
            target[key] = $mc.extend(target[key], value);
          }
        }

        // For the rest, just do a straight assign
        else {
          if (typeof target === 'function') {
            target.prototype[key] = value;
          } else {
            target[key] = value;
          }
        }
      }
    }
  }

  // Pass it back
  return target;
};

/**
 * Handles logging cross-browser
 *
 * @param	object	object to log
 */

$mc.showDebug = false;
$mc.log = function(obj) {
  if (typeof console !== 'undefined' && typeof console.log === 'function') {
    console.log(obj);
  } else {
    if ($mc.showDebug !== true) {
      return;
    }

    if (typeof $mc.autocreatedConsole === 'undefined') {
      $mc.autocreatedConsole = document.createElement('ul');
      $mc.autocreatedConsole.setAttribute('id', 'console');

      setTimeout(function() {
        if (document.body) {
          document.body.appendChild($mc.autocreatedConsole);
        } else {
          setTimeout(this, 500);
        }
      }, 500);
    }

    var item = document.createElement('li');
    item.style.textAlign = 'left';
    item.innerHTML = obj + '';
    $mc.autocreatedConsole.appendChild(item);
  }
};

/**
 * Applies a JSON dictionary of CSS
 * styles to the provided DOMElement
 *
 * @param	DOMElement	element to apply styles to
 * @param	Object		JSON Object of CSS styles
 */
$mc.css = function(el, key, value) {
  var css = {};

  if (typeof key === 'string') {
    css[key] = value;
  } else if (typeof key === 'object') {
    css = key;
  }

  $mc.each(css, function(value, key) {
    el.style[key] = value;
  });
};

/**
 * Compiles an RGBA value to a CSS useable param
 *
 * @param	object	Object containing keys: r, g, b, a
 * @return	string	CSS valid value
 */
$mc.buildRGBA = function(rgba) {
  if ($mc.supportsRGBA()) {
    rgba.a = rgba.a / 255;
    return 'rgba(' + rgba.join(',') + ')';
  } else {
    return '#' + $mc.toHex(rgba.r) + $mc.toHex(rgba.g) + $mc.toHex(rgba.b);
  }
};

$mc.toHex = function(N) {
  if (N === null) {
    return '00';
  }
  N = parseInt(N, 10);
  if (N === 0 || isNaN(N)) {
    return '00';
  }
  N = Math.max(0, N);
  N = Math.min(N, 255);
  N = Math.round(N);
  return '0123456789ABCDEF'.charAt((N - N % 16) / 16) + '0123456789ABCDEF'.charAt(N % 16);
};
/**
 * Checks whethor or not a browser supports RGBA
 * @return boolean
 */
$mc._supportsRGBA = null;
$mc.supportsRGBA = function() {
  if ($mc._supportsRGBA === null) {
    var scriptElement = document.getElementsByTagName('script')[0];
    var prevColor = scriptElement.style.color;
    var testColor = 'rgba(0, 0, 0, 0.5)';
    if (prevColor === testColor) {
      $mc._supportsRGBA = true;
    } else {
      try {
        scriptElement.style.color = testColor;
      } catch (e) {}
      $mc._supportsRGBA = scriptElement.style.color !== prevColor;
      scriptElement.style.color = prevColor;
    }
  }

  return $mc._supportsRGBA;
};

/**
 * Iterates through objects or arrays and fires the callback for each
 * The callback function should expect two parameters: value, key
 *
 * @param	mixed		array, nodelist or object
 * @param	function	function to callback
 */

$mc.each = function(object, callback) {
  if ((typeof object !== 'undefined' && object instanceof Array) ||
    (typeof object.length === 'number' && typeof object[0] !== 'undefined')) {
    for (var index = 0; index < object.length; index++) {
      if (callback(object[index], index) === false) {
        break;
      }
    }
  } else if (typeof object === 'object' && (typeof object.length !== 'number' || object.length > 0)) {
    for (var key in object) {
      if (callback(object[key], key) === false) {
        break;
      }
    }
  }
};

/**
 * Quick method to get a DOMElement for an ID
 *
 * @param	mixed	string or element
 * @return	DOMElement
 */
$mc.e = function(id) {
  if (typeof id === 'string') {
    return document.getElementById(id);
  } else {
    // I'll build in additional types as neccessary
    return null;
  }
};




var AxonixAdSource = $mc.create({
  obj: null,
  type: null,

  /**
   * Setup and validate the ad source
   * If validation fails, this will return null
   *
   * @return	object	new instance of AxonixAdSource
   */
  init: function(responseObject) {
    this.obj = responseObject;

    // See if we received a bad response
    if (this.getType() === null) {
      return null;
    }

    return this;
  },

  /**
   * Get the type of ad, returns null if it's an unsupported type
   * @return	string	type of ad (image, text)
   */
  getType: function() {
    if (this.type) {
      return this.type;
    }

    if (this.obj.type === 'html') {
      this.type = 'html';
    } else {
      this.type = null;
    }

    return this.type;
  },

  /**
   * Gets the action URL
   * @return	string	url
   */
  actionUrl: function() {
    return this.obj.action.url;
  },

  /**
   * Notify tracking urls for different events
   * @param	string	type of tracking urls to fire (show, touch)
   */
  notifyEvent: function(eventType) {
    if (!eventType || eventType.length === 0) {
      return;
    }
    eventType = 'on' + eventType.toLowerCase().replace(/^([a-z])|\s+([a-z])/g, function(s) {
      return s.toUpperCase();
    });
    $mc.each(this.obj.eventUrls[eventType], function(value) {
      var img = document.createElement('img');
      $mc.css(img, {
        width: '1px',
        height: '1px',
        border: 'none',
        position: 'absolute',
        left: '-10px',
        top: '-10px'
      });

      img.src = value;
      document.body.appendChild(img);
      img = null;
    });
  }
});




var AxonixAd = $mc.create({
  unit: null,
  elementId: null,
  element: null,
  onLoad: null,
  onError: null,
  ordinal: null,
  domain: null,
  uniqId: 0,
  newWindow: true,
  autoExpand: true,
  autoCollapse: true,
  adServer: null,
  error: false,

  /**
   * Sets up variables as well as creates
   * a placeholder in HTML for the ad
   * @access	public
   *
   * @param	string	unit size
   * @param	string	application key
   * @param	object	additional options
   * @return	object	current instance of AxonixAd
   */
  init: function(unit, response, opts) {
    if (!unit) {
      return this;
    }
    opts = opts || {};

    this.unit = unit;
    AxonixAd.counter++;

    var unitSize = unit.split(/x/);

    this.domain = AxonixAd.domain || 'ads.axonix.com';
    this.adServer = AxonixAd.adServer || 'ads.axonix.com';
    this.newWindow = opts.newWindow || true;
    this.autoCollapse = opts.autoCollapse || true;
    this.autoExpand = opts.autoExpand || true;

    var time = (new Date()).getTime();
    this.uniqId = AxonixAd.counter + '00' + time;
    var isMultisize = false;

    this.elementId = 'mcad-' + this.unit + '-' + time + '-' + AxonixAd.counter;

    try {
      var source = new AxonixAdSource(response.creatives[0]);
      if (!source) {
        this.error = true;
      } else {
        if (source.getType() === 'html') {
          /*jslint evil: true */
          document.write('<div id="' + this.elementId + '" style="display:none">' + source.obj.props.html + '</div>');

          var multisizeElem = document.getElementById(this.elementId).getElementsByClassName('AxonixMultisizeClass')[0];
          if (multisizeElem) {
            isMultisize = true;
          }
          /*jslint evil: false */
        } else {
          this.error = true;
          this.handleError(99901, 'An error occured while parsing the ad response.', response);
        }
      }
    } catch (err) {
      this.error = true;
      this.handleError(99902, err.name + ': ' + err.message, response);
    }




    var self = this;
    setTimeout(function() {
      self.element = $mc.e(self.elementId);
      self.element.style.position = 'relative';
      if (!isMultisize) {
        // in multisize case, the javascript from creative will set width
        self.element.style.width = parseInt(unitSize[0], 10) + 'px';
        self.element.style.height = parseInt(unitSize[1], 10) + 'px';
      }

      self.element.style.margin = '0 auto';
      self.element.style.textAlign = 'center';

      if (self.autoExpand !== true) {
        self.element.style.display = 'block';
      }
    }, 25);

    return this;
  },

  /**
   * Returns the ad container, optionally removing it's children
   * @access	public
   *
   * @param	boolean		remove child nodes
   *
   * @return	DOMElement	ad container
   */
  adContainer: function(removeChildNodes) {
    if (removeChildNodes) {
      while (this.element.hasChildNodes()) {
        this.element.removeChild(this.element.firstChild);
      }
    }

    return this.element;
  },

  /**
   * Handles response from the ad request
   * @access private
   *
   * @param	object	JSON Response Object
   */
  requestFinished: function(response) {
    try {
      /*jshint camelcase: false */
      this.deviceIdentifier(response.axonix_u);
      /*jshint camelcase: true */
    } catch (e) {}

    this.displayAd(response);
  },

  /**
   * Attempted to display the request ad
   * @access	private
   *
   * @param	object	JSON Object passed in from getAd
   */
  displayAd: function(response) {
    try {
      var source = new AxonixAdSource(response.creatives[0]);

      this.element.style.display = 'block';
      source.notifyEvent('show');

      var self = this;
      setTimeout(function() {
        self.addListeners(response, source);
      }, 500);
    } catch (e) {
      this.handleError(99902, e.name + ': ' + e.message, response);
    }
  },

  addListeners: function(response, source) {
    try {
      // Setup click listener
      var clickNotifier = function() {
        source.notifyEvent('touch');
      };

      $mc.each(this.element.getElementsByTagName('a'), function(el) {
        if (el.addEventListener) {
          el.addEventListener('click', clickNotifier);
        } else if (!el.onclick) {
          el.onclick = clickNotifier;
        }
      });

      // Notify listener
      if (typeof this.onLoad === 'function') {
        this.onLoad(this);
      }
    } catch (e) {
      this.handleError(99902, e.name + ': ' + e.message, response);
    }
  },

  /**
   * Notify listener of an error
   * @access	private
   *
   * @param	int		error code
   * @param	string	message associated with the error
   */
  handleError: function(code, reason, response) {
    if (this.autoCollapse) {
      this.element.style.display = 'none';
    }

    Axonix.unknownErrorResponse(response);

    //if(typeof this.onError !== 'function') return;
    //this.onError(this, code, reason);
  },

  /**
   * Gets or sets the device identifier, depending
   * on if the identifier parameter was passed in
   * @access	private
   *
   * @param	string	device identifier
   * @return	string	device identifier
   */
  deviceIdentifier: function(identifier) {
    if (identifier) {
      var options = {
        expires: 30,
        path: '/'
      };
      $mc.cookie('axonix_u', identifier, options);
    }

    identifier = $mc.cookie('axonix_u');

    if (identifier) {
      return identifier;
    } else {
      return '';
    }
  },

  insertAndExecute: function(domelement, text) {
    // Finds and executes scripts in a newly added element's body.
    // Needed since innerHTML does not run scripts.
    //
    // Argument body_el is an element in the dom.

    function nodeName(elem, name) {
      return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
    }

    function evalScript(elem) {
      var data = (elem.text || elem.textContent || elem.innerHTML || '');
      var head = document.getElementsByTagName('head')[0] || document.documentElement;
      var script = document.createElement('script');

      script.type = 'text/javascript';
      try {
        // doesn't work on ie...
        script.appendChild(document.createTextNode(data));
      } catch (e) {
        // IE has funky script nodes
        script.text = data;
      }

      head.insertBefore(script, head.firstChild);
      head.removeChild(script);
    }

    domelement.innerHTML = text;

    // main section of function
    var scripts = [],
      script,
      childrenNodes = domelement.childNodes,
      child,
      i;

    for (i = 0; childrenNodes[i]; i++) {
      child = childrenNodes[i];
      if (nodeName(child, 'script') && (!child.type || child.type.toLowerCase() === 'text/javascript')) {
        scripts.push(child);
      }
    }

    for (i = 0; scripts[i]; i++) {
      script = scripts[i];
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      evalScript(scripts[i]);
    }
  }
});

/**
 * Internal counter to determine how many
 * instances of MoblixAd have been created
 */
AxonixAd.counter = 0;

Axonix.getAd = function(params) {
  if (typeof params === 'undefined' || params === null) {
    return;
  }

  var type = params.type || 'js';
  var adCode = params.adCode || 'null';
  var campaignKey = params.campaignKey || null;
  var clickUrl = params.clickUrl || null;
  var version = params.version || 'v1';
  var errorCallback = params.errorCallback || 'onError';
  var targetBlank = params.targetBlank || 'false';
  if (targetBlank === true) {
    targetBlank = 'true';
  }
  if (targetBlank === false) {
    targetBlank = 'false';
  }
  var ts = new Date().getTime();
  var additionalParams = params.params || [];
  if (typeof additionalParams !== 'object') {
    additionalParams = null;
  }

  var requestUrl = '<scr' + 'ipt type="text/javascript" src="https://adserver.freedom.tikiphee.com/axonixtag/' + version + '/' + type + '/' + adCode;
  if (campaignKey !== null) {
    requestUrl = requestUrl + '/' + campaignKey;
  }
  requestUrl += '?';

  if (clickUrl !== null) {
    requestUrl = requestUrl + 'clickurl=' + escape(clickUrl) + '&';
  }
  requestUrl = requestUrl + 'errorCallback=' + escape(errorCallback) + '&targetBlank=' + targetBlank + '&ts=' + ts;

  if (additionalParams['u'] === null && $mc.cookie('axonix_u') !== null) {
    additionalParams['u'] = $mc.cookie('axonix_u');
  }

  if (additionalParams !== null) {
    for (var p in additionalParams) {
      if (additionalParams.hasOwnProperty(p)) {
        requestUrl = requestUrl + '&' + encodeURIComponent(p) + '=' + encodeURIComponent(additionalParams[p]);
      }
    }
  }

  requestUrl = requestUrl + '"></scr' + 'ipt>';

  /*jslint evil: true */
  document.write(requestUrl);
  //document.write('<scr' + 'ipt type="text/javascript" src="response.js?' + ts + '"' + '></scr' + 'ipt>');
  /*jslint evil: true */
};

Axonix.isErrorResponse = function(response) {
  if (typeof response.errorCode !== 'undefined') {
    return true;
  }
  return false;
};

Axonix.unknownErrorResponse = function(response) {
  response = response || {};
  response.errorCode = 503;
  Axonix.errorResponse(response);
};

Axonix.errorResponse = function(response) {
  var errorCallback;
  try {
    errorCallback = response.errorCallback || 'onError';
  } catch (e) {
    errorCallback = 'onError';
  }
  try {
    window[errorCallback].apply(window, new Array(response));
  } catch (e) {}
};

Axonix.loadAd = function() {
  // Get queued response
  var size = Axonix.sizes[0];
  delete Axonix.sizes[0];
  Axonix.sizes.splice(0, 1);

  var response = Axonix.responses[0];
  delete Axonix.responses[0];
  Axonix.responses.splice(0, 1);

  // Check for error
  if (typeof response !== 'object') {
    Axonix.unknownErrorResponse(response);
  }
  if (Axonix.isErrorResponse(response)) {
    Axonix.errorResponse(response);
  } else {
    var ad = AxonixAd.init(size, response);
    if (!ad.error) {
      setTimeout(function() {
        ad.requestFinished(response);
      }, 50);
    }
  }
};

// If an ad response is already set, display it.
if (typeof Axonix.responses !== 'undefined' && Axonix.responses.length > 0) {
  Axonix.loadAd();
}
