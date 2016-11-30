import request from 'superagent';
import pathJoin from './pathJoin';
import isJSON from './isJSON';

export default {
  makeRequest(o) {
    o.route = o.route || [];
    o.params = o.params || [];
    o.query = o.query ? `?${Object.keys(o.query).map((val) => val + "=" + (o.query[val] && typeof o.query[val] === 'object'? JSON.stringify(o.query[val]): o.query[val])).join("&")}`: "";
    o.body = o.body || {};
    o.headers = o.headers || {Accept: 'application/json'};
    return new Promise((resolve, reject) => {
      request
      [o.method](pathJoin(o.route, typeof o.params === 'string' ? o.params: pathJoin(...o.params)) + o.query) // if o.params is not string destructure it
      .set(o.headers)
      .send(o.body)
      .end((err, res) => err ? reject(err) : resolve(isJSON(res.text) ? JSON.parse(res.text) : res.text));
    });
  },
}