import test from 'unit.js';
import Promise from 'bluebird';
import CloudflareDnsService from '../cloudflare';
const should = test.should;

describe('DNS Services: Clouldflare', function() {
    let cf,
        gotStub,
        domain = 'example.com',
        email = 'somedue@test.com',
        apiKey = 'clouldflare-api-key',
        zoneId = 'some-zone-id',
        exampleDNSresponse = {
            'success': true,
            'errors': [],
            'messages': [],
            'result': {
                'id': '372e67954025e0ba6aaa6d586b9e0b59',
                'type': 'TXT',
                'name': `sub.${domain}`,
                'content': 'some-letsencrypt-key',
                'proxiable': true,
                'proxied': false,
                'ttl': 120,
                'locked': false,
                'zone_id': '023e105f4ecef8ad9ca31a8372d0c353',
                'zone_name': 'example.com',
                'created_on': '2014-01-01T05:20:00.12345Z',
                'modified_on': '2014-01-01T05:20:00.12345Z',
                'data': {}
            }
        }

    beforeEach(function() {
        cf = new CloudflareDnsService({
            email: email,
            domain: domain,
            key: apiKey
        });
        gotStub = test.stub(cf, '_got');
    });

    afterEach(function() {
        gotStub.restore();
    });

    it('should find the zone id by the domain', function(done) {
        gotStub.withArgs('zones', {name: domain}).returns(Promise.resolve({succes: true, result: [{id: zoneId}]}));
        cf.getZoneId().then(()=> {
            (gotStub.calledOnce).should.be.true;
            console.log(gotStub);
            gotStub.verify();
            done();
        });
    });

    it('should add a dns entry', function(done) {
        gotStub.withArgs('zones', {name: domain}).returns(Promise.resolve({succes: true, result: [{id: zoneId}]}));
        gotStub.withArgs(`zones/${zoneId}/dns_records`, {method: 'POST', body: {name: `sub.${domain}`, type: 'TXT', content: 'some-letsencrypt-key'}}).returns(Promise.resolve(exampleDNSresponse));
        cf.setDnsEntry({
            name: `sub.${domain}`,
            type: 'TXT',
            content: 'some-letsencrypt-key'
        }).then((res)=> {
            (gotStub.calledTwice).should.be.true;
            should(res.zone_id).equal(zoneId);
            should(res.id).equal(exampleDNSresponse.result[0].id);
            gotStub.verify();
            done();
        });
    });
});
