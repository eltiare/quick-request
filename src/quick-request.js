import merge from 'deepmerge';

let defaults = {};

let QuickRequest  = {

  setDefaults(obj) {
    defaults = merge(defaults, obj);
  },

  resetDefaults(obj) {
    defaults = obj || {};
  },

  request(opts) {
    return new Promise( (resolve, reject) => {
      let [xhr, data] = QuickRequest.setupXHR(opts);
      xhr.addEventListener("load", function(evt) {
        resolve([QuickRequest.parseResponseData(this), evt]);
      });
      let error = evt => { reject([xhr, evt]); };
      xhr.addEventListener("error", error);
      xhr.addEventListener("abort", error);
      xhr.send(data);
    });
  },

  parseResponseData(xhr) {
    if (xhr.responseType && xhr.response ) return xhr.response;
    if (xhr.responseXML) return xhr.responseXML;
    if (xhr.getResponseHeader("Content-Type").match("application/json")) // A catch for IE
      return JSON.parse(xhr.responseText);
    return xhr.responseText;
  },

  setupXHR(opts) {
    opts = merge(defaults, opts);
    let method = opts.method ? opts.method.toUpperCase() : "GET",
      headers = opts.headers || {}, data, url = opts.url,
      xhr = new XMLHttpRequest(), key, i, keys;
    opts.method = method;
    data = QuickRequest.parseRequestData(opts);
    let urlParams = method == "GET" || method == "DELETE";
    if ( urlParams && data ) {
      let joiner = url.match(/\?/) ? '&' : '?';
      url = url + joiner + data;
    }
    xhr.open(method, url, true, opts.username, opts.password);
    keys = Object.keys(headers);
    for (i=0; key = keys[i]; i++)
      xhr.setRequestHeader(key, headers[key]);
    if (opts.onProgress) xhr.addEventListener("progress", opts.onProgress);
    return [xhr, urlParams ? null : data];
  },

  parseRequestData(opts) {
    if (opts.data instanceof FormData) {
      return opts.data;
    } else if (opts.data && typeof opts.data === "object") {
      switch (opts.method) {
        case 'DELETE':
        case 'GET':
          return Object.keys(opts.data).map( key => {
            if (!opts.data[key] && opts.data[key] !== false && opts.data[key] !== 0 )
              return;
            return encodeURIComponent(key) + "=" + encodeURIComponent(opts.data[key]);
          }).filter( p => p ).join('&');
          break;
        default:
          return QuickRequest.formatRequestData(opts);
      }
    } else {
      return opts.data;
    }
  },

  formatRequestData(opts)
  {
    switch(opts.sendAs && opts.sendAs.toLowerCase())
    {
      case 'json':
        return JSON.stringify(opts.data);
      case 'form':
      default:
        let data = new FormData();
        Object.keys(opts.data).forEach( key => data.append(key, opts.data[key]) );
        return data;
    }
  }

};

['post', 'get', 'put', 'patch', 'delete'].forEach( method => {
  QuickRequest[method] = function(url, data, opts) {
    return QuickRequest.request({ ... opts, url, data, method });
  };
});

export default QuickRequest;
