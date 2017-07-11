let quickRequest = {
  request(opts) {
    return new Promise( (resolve, reject) => {
      let [xhr, method] = setupXHR(opts);
      xhr.addEventListener("load", function(evt) {
        resolve(parseResponseData(this), this, evt);
      });
      let error = evt => { reject(xhr, evt); };
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
  if (method == "GET" && ( data = parseRequestData(opts)) ) {
    let joiner = url.match('?') ? '&' : '?';
    url = url + joiner + data;
  }
  xhr.open(method, url, true, opts.username, opts.password);
  for (let key in Object.keys(headers))
    xhr.setRequestHeader(key, headers[key]);
  if (opts.onProgress) xhr.addEventListener("progress", opts.onProgress);
  return [xhr, method];
}

function parseRequestData(opts) {
  if (opts.data && typeof opts.data === "object") {
    switch (opts.method) {
      case 'GET':
        return Object.keys(opts.data).map( key =>
            encodeURIComponent(key) + "=" + encodeURIComponent(opts.data[key])
          ).join('&');
        break;
      default:
        let data = new FormData();
        Object.keys(opts.data).each( key => data.set(key, values[key]) );
        return data;
    }
  } else {
    return opts.data;
  }
}

function parseResponseData(xhr) {
  if (xhr.responseType && xhr.response ) return xhr.response;
  if (xhr.responseXML) return xhr.responseXML;
  if (xhr.getResponseHeader === "application/json") // A catch for IE
    return JSON.parse(xhr.responseText);
  return xhr.responseText;
}

['post', 'get', 'put', 'patch', 'delete'].each( method => {
  quickRequest[method] = function(url, data, opts) {
    quickRequest.request({ ... opts, url, data, method });
  };
});

export default quickRequest;
