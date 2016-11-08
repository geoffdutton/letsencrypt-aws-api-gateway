import Promise from 'bluebird';
import got from 'got';
import url from 'url';
const cloudflareEndpoint = 'https://api.cloudflare.com/client/v4/';
class CloudflareDnsService {
    constructor(opts) {
        this.domain = opts.domain;
        this.zoneId = null;
        this.headers = {
            'user-agent': `node/${process.versions.node}`,
            'X-Auth-Key': opts.key,
            'X-Auth-Email': opts.email,
            'Content-Type': 'application/json'
        };
    }

    _got(endpoint, options) {
        options = options || {};
        let uri = url.resolve(cloudflareEndpoint, endpoint);

        return got(uri, {
            json: true,
            timeout: options.timeout || 1E4,
            //retries: options.retries,
            method: options.method || 'GET',
            query: options.query,
            body: JSON.stringify(options.body),
            headers: this.headers
        });
    };

    getZoneId() {
        return this._got('zones', {name: this.domain});
    }

    setDnsEntry(data) {
        return this.getZoneId().then((res)=> {
            return this._got(`zones/${res.result[0].id}/dns_records`, data);
        })
    }
}

export default CloudflareDnsService;
