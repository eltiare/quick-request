let quickRequest = {
  request(opts) {
    return new Promise( (resolve, reject) => {
      let [xhr, method, data] = setupXHR(opts);
      xhr.addEventListener("load", function(evt) {
        resolve([parseResponseData(this), evt]);
      });
      let error = evt => { reject([xhr, evt]); };
      xhr.addEventListener("error", error);
      xhr.addEventListener("abort", error);
      xhr.send(data);
    });
  }
};

function setupXHR(opts) {
  let method = opts.method ? opts.method.toUpperCase() : "GET",
    headers = opts.headers || {}, data, url = opts.url,
    xhr = new XMLHttpRequest();
  opts.method = method;
  data = parseRequestData(opts);
  let urlParams = method == "GET" || method == "DELETE";
  if ( urlParams && data ) {
    let joiner = url.match(/\?/) ? '&' : '?';
    url = url + joiner + data;
  }
  xhr.open(method, url, true, opts.username, opts.password);
  for (let key in Object.keys(headers))
    xhr.setRequestHeader(key, headers[key]);
  if (opts.onProgress) xhr.addEventListener("progress", opts.onProgress);
  return [xhr, method, urlParams ? null : data];
}

function parseRequestData(opts) {
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
        let data = new FormData();
        Object.keys(opts.data).forEach( key => data.set(key, opts.data[key]) );
        return data;
    }
  } else {
    return opts.data;
  }
}

function parseResponseData(xhr) {
  if (xhr.responseType && xhr.response ) return xhr.response;
  if (xhr.responseXML) return xhr.responseXML;
  if (xhr.getResponseHeader("Content-Type").match("application/json")) // A catch for IE
    return JSON.parse(xhr.responseText);
  return xhr.responseText;
}

['post', 'get', 'put', 'patch', 'delete'].forEach( method => {
  quickRequest[method] = function(url, data, opts) {
    return quickRequest.request({ ... opts, url, data, method });
  };
});

export default quickRequest;
