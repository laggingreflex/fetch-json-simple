const merge = require('merge-options');

module.exports = fetchJsonSimple;

const defaultFetch = (
  typeof self !== 'undefined' && self.fetch
  || typeof window !== 'undefined' && window.fetch
  || typeof global !== 'undefined' && global.fetch
);

const defaultOpts = {
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
};

function fetchJsonSimple(pathArg, optsArg) {
  const host = fetchJsonSimple.host || ''
  const path = host + pathArg
  optsArg = optsArg || {};

  const fetch = fetchJsonSimple.fetch || defaultFetch;

  let body
  if (optsArg.body) {
    try {
      body = JSON.stringify(optsArg.body);
    } catch (err1) {
      // check if body is already stringified
      try {
        JSON.parse(optsArg.body);
        body = optsArg.body;
      } catch (err2) {
        throw err1
      }
    }
  }

  const opts = merge(
    optsArg.method ? {} : { method: body ? 'post' : 'get' },
    defaultOpts,
    fetchJsonSimple.options,
    optsArg,
    body ? { body } : {}
  );

  return fetch(path, opts)
    .then(response => response.text().then(text => [response, text]))
    .then(([response, text]) => {
      let json;
      try { json = JSON.parse(text); } catch (noop) {}
      if (response.ok) {
        if (json) {
          return json
        } else {
          return { body: text }
        }
      } else {
        const error = new Error(text);
        error.response = response;
        throw error;
      }
    });
}

'get,post,put,patch,delete'.split(/,/g).forEach(method =>
  fetchJsonSimple[method] = (path, options) => fetchJsonSimple(path, merge({}, options, { method })))
