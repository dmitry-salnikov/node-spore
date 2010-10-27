// :(
require.paths.unshift(__dirname +"/minitest");
require.paths.unshift(__dirname +"/../lib");

// we test that
var spore = require('spore');

var minitest = require("minitest");
var assert   = require("assert");
var httpmock = require("./mock_http_request");

minitest.setupListeners();

minitest.context("Create client with filename", function () {
    this.setup(function () {
        this.client = spore.createClient(__dirname +'/fixtures/test.json');
        this.client.httpClient = httpmock.http;
    });

    this.assertion("should have a public_timeline method", function (test) {
        assert.ok(this.client.public_timeline,
                  "clientWithFile should have a public_timeline method");
        test.finished();
    });

    this.assertion("err if a required parameter is missing", function(test) {
        this.client.public_timeline({}, function(err, result) {
            assert.equal(result, null, 'result should be null');
            assert.equal(err, 'format param is required');
            test.finished();
        });
    });

    this.assertion("err if unknow param ", function(test) {
        this.client.public_timeline({format: 'json', unknowparam: 'foo'}, function(err, result) {
            assert.equal(result, null, 'result should be null');
            assert.equal(err, 'unknowparam param is unknow'); // very funny
            test.finished();
        });
    });

    this.assertion("call remote server", function(test) {
        httpmock.http.addMock({
            port: 80,
            host: 'api.twitter.com',
            method: 'GET',
            path: '/1/statuses/public_timeline.json',
            response_data: '[{"place":null,"text": "node-spore is awesome"}, {}]'
        });
        this.client.public_timeline({format: 'json'}, function(err, result) {
            assert.equal(err, null, "err should be null");
            assert.equal(result.body, '[{"place":null,"text": "node-spore is awesome"}, {}]');
            test.finished();
        });
    });

    this.assertion("call with query string", function(test) {
        httpmock.http.addMock({
            port: 80,
            host: 'api.twitter.com',
            method: 'GET',
            path: '/1/statuses/public_timeline.html?trim_user=1&include_entities=1',
        });
        this.client.public_timeline({format: 'html', 'trim_user': 1, 'include_entities': 1}, function(err, result) {
            assert.equal(err, null);
            test.finished();
        });
    });

    this.assertion("call with 2 params in path", function(test) {
        httpmock.http.addMock({
            port: 80,
            host: 'api.twitter.com',
            method: 'GET',
            path: '/1/user/42.html',
        });
        this.client.big_method({format: 'html', id : "42"}, function(err, result) {
            assert.equal(err, null);
            test.finished();
        });
    }),

    this.assertion("method with specific base_url", function(test) {
        httpmock.http.addMock({
            port: 80,
            host: 'api2.twitter.com',
            method: 'GET',
            path: '/2/statuses/public_timeline.html',
        });
        this.client.public_timeline2({format: 'html'}, function(err, result) {
            assert.equal(err, null);
            test.finished();
        });
    });

    this.assertion("method without params", function(test) {
        httpmock.http.addMock({
            port: 80,
            host: 'api.twitter.com',
            method: 'HEAD',
            path: '/1/version',
        });
        this.client.version(function(err, result) {
            assert.equal(err, null);
            test.finished();
        });
    });

    this.assertion("method without params but with payload", function(test) {
        httpmock.http.addMock({
            port: 80,
            host: 'api.twitter.com',
            method: 'POST',
            path: '/1/echo',
            payload: 'mypayload'
        });
        this.client.echo('mypayload', function(err, result) {
            assert.equal(err, null);
            test.finished();
        });
    });

    this.assertion("method with payload", function(test) {
        httpmock.http.addMock({
            port: 80,
            host: 'api.twitter.com',
            method: 'POST',
            path: '/1/user/42',
            payload: 'plop',
        });
        this.client.update_user({id: 42}, 'plop', function(err, result) {
            assert.equal(err, null);
            test.finished();
        });
    });

    this.assertion("method with required payload", function(test) {
        this.client.update_user({id: 42}, function(err, result) {
            assert.equal(err, "payload is required");
            test.finished();
        });
    });

    this.assertion("method without payload", function(test) {
        httpmock.http.addMock({
            port: 80,
            host: 'api.twitter.com',
            method: 'PUT',
            path: '/1/user/42',
            payload: '',
        });
        this.client.reinit_user({id: 42}, function(err, result) {
            assert.equal(err, null);
            test.finished();
        });
    });

    this.assertion("err if payload is provided with a GET method", function(test) {
        this.client.public_timeline({format: 'html'}, 'plop', function(err, result) {
            assert.equal(result, null, 'result should be null');
            assert.equal(err, 'payload is useless');
            test.finished();
        });
    });

    this.assertion("err if payload is provided with a HEAD method", function(test) {
        this.client.version({}, 'plop', function(err, result) {
            assert.equal(result, null, 'result should be null');
            assert.equal(err, 'payload is useless');
            test.finished();
        });
    });
});

minitest.context("Create client with json", function() {
    this.setup(function () {
        this.client = spore.createClient('{"base_url":"http://api.twitter.com/1","version":"0.1","methods":{"public_timeline":{"path":"/statuses/public_timeline.:format","method":"GET"}}}');
    });

    this.assertion("should have a public_timeline method", function (test) {
        assert.ok(this.client.public_timeline,
                  "clientWithFile should have a public_timeline method");
        test.finished();
    });
});

minitest.context("Create client with object", function() {
    this.setup(function() {
        this.client = spore.createClient({
            "base_url" : "http://api.twitter.com/1",
            "version" : "0.1",
            "methods" : {
                "public_timeline" : {
                    "optional_params" : [
                        "trim_user",
                        "include_entities"
                    ],
                    "required_params" : [
                        "format"
                    ],
                    "path" : "/statuses/public_timeline.:format",
                    "method" : "GET"
                }
            }
        });
    });

    this.assertion("should have a public_timeline method", function(test) {
        assert.ok(this.client.public_timeline,
                  "client should have a public_timeline method");
        test.finished();
    });
});

minitest.context("client with request middleware", function() {
    this.setup(function() {
        this.middleware = {};
        this.client = spore.createClient(this.middleware, __dirname +'/fixtures/test.json');
        this.client.httpClient = httpmock.http;
    });

    this.assertion("should have a request param", function(test) {
        var called = 0;
        httpmock.http.addMock({
            port: 80,
            host: 'api.twitter.com',
            method: 'GET',
            path: '/1/statuses/public_timeline.html',
        });
        this.middleware.request = function(method, request) {
            called++;
            assert.ok(method.authentication);
            assert.deepEqual(request.headers, {host: 'api.twitter.com'});
            assert.deepEqual(request.params, {format: 'html'});
            assert.deepEqual(request.payload, null);
            assert.equal(request.scheme, 'http');
            assert.equal(request.port, 80);
            assert.equal(request.host, 'api.twitter.com');
            assert.equal(request.method, 'GET');
            assert.equal(request.path_info, '/1/statuses/public_timeline.:format');
        };
        this.client.public_timeline({format: 'html'}, function(err, result) {
            assert.equal(called, 1);
            assert.equal(err, null);
            test.finished();
        });
    });

    this.assertion("headers transform", function(test) {
        httpmock.http.addMock({
            port: 80,
            host: 'api2.twitter.com',
            headers: {'Accept': 'text/html,*/*;q=0.8', 'host': 'api2.twitter.com'},
            method: 'GET',
            path: '/2/statuses/public_timeline.html',
        });
        this.middleware.request = function(method, request) {
            assert.equal(request.scheme, 'https');
            request.headers['Accept'] = 'text/html,*/*;q=0.8';
        };
        this.client.public_timeline2({format: 'html'}, function(err, result) {
            assert.equal(err, null);
            test.finished();
        });
    });

    this.assertion("params and url transform", function(test) {
        httpmock.http.addMock({
            port: 80,
            host: 'api2.twitter.com',
            method: 'GET',
            path: '/3/statuses/public.json',
        });
        this.middleware.request = function(method, request) {
            request.path_info = '/3/statuses/public.:format';
            request.params.format = 'json';
        };
        this.client.public_timeline2({format: 'html'}, function(err, result) {
            assert.equal(err, null);
            test.finished();
        });
    });

    this.assertion("body transform", function(test) {
        httpmock.http.addMock({
            port: 80,
            host: 'api.twitter.com',
            method: 'POST',
            path: '/1/user/42',
            payload: 'plop'
        });
        this.middleware.request = function(method, request) {
            request.payload = 'plop';
        };
        this.client.update_user({id: '42'}, 'plip', function(err, result) {
            assert.equal(err, null);
            test.finished();
        });
    });
});

minitest.context("client with response middleware", function() {
    this.setup(function() {
        this.middleware = {};
        this.client = spore.createClient(this.middleware, __dirname +'/fixtures/test.json');
        this.client.httpClient = httpmock.http;
        httpmock.http.addMock({
            port: 80,
            host: 'api.twitter.com',
            method: 'GET',
            path: '/1/statuses/public_timeline.html',
            statusCode: 200,
            response_headers: {'Content-Type': 'text/html',
                               'Server' : 'node'},
            response_data: 'plop'
        });
    });

    this.assertion("should have a response param", function(test) {
        var called = 0;
        this.middleware.response = function(method, response) {
            called++;
            assert.ok(method.authentication);
            assert.equal(response.code, 200);
            assert.deepEqual(response.headers, {'Content-Type': 'text/html',
                                                'Server' : 'node'});
            assert.equal(response.body, 'plop');
        };
        this.client.public_timeline({format: 'html'}, function(err, result) {
            assert.equal(err, null);
            assert.equal(called, 1);
            test.finished();
        });
    });

    this.assertion("response status and headers transform", function(test) {
        this.middleware.response = function(method, response) {
            response.headers.Server = 'nginx';
            response.code = 201;
        };
        this.client.public_timeline({format: 'html'}, function(err, result) {
            assert.equal(err, null);
            assert.equal(result.headers.Server, 'nginx');
            assert.equal(result.code, 201);
            test.finished();
        });
    });

    this.assertion("response body transform", function(test) {
        this.middleware.response = function(method, response) {
            response.headers.Server = 'nginx';
        };
        this.client.public_timeline({format: 'html'}, function(err, result) {
            assert.equal(err, null);
            assert.equal(result.headers.Server, 'nginx');
            test.finished();
        });
    });
});

minitest.context("Client with spore shortcut", function() {
    this.setup(function() {
        this.middleware = {};
        this.client = spore.createClient(this.middleware, __dirname +'/fixtures/authentication.json');
         this.client.httpClient = httpmock.http;
    });

    this.assertion("method without authentication, formats or expected_status inherits from api", function(test) {
        httpmock.http.addMock({
            port: 80,
            host: 'api.twitter.com',
            method: 'POST',
            path: '/1/user/:id'
        });
        this.middleware.request = function(method, request) {
            assert.ok(method.authentication);
            assert.deepEqual(method.formats, ["json", "html"]);
            assert.deepEqual(method.expected_status, [200, 500]);
        };
        this.client.update_user({}, function(err, result) {
            assert.equal(err, null);
            test.finished();
        });
    });

    this.assertion("method with authentication, formats or expected_status override api", function(test) {
        httpmock.http.addMock({
            port: 80,
            host: 'api.twitter.com',
            method: 'GET',
            path: '/1/statuses/public_timeline'
        });
        this.middleware.request = function(method, request) {
            assert.strictEqual(method.authentication, false);
            assert.deepEqual(method.formats, ["xml"]);
            assert.deepEqual(method.expected_status, [200, 204, 503]);
        };
        this.client.public_timeline(function(err, result) {
            assert.equal(err, null);
            test.finished();
        });
    });
});
