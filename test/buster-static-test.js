var buster = require("buster");
var assert = buster.assert;
var cli = require("../lib/cli");
var http = require("http");

var NOOP = function(){};

buster.testCase("buster-static", {
    setUp: function () {
        this.s = cli.create();
        this.s.logger = {log:NOOP};
    },

    "should start server with no arguments": function (done) {
        this.stub(this.s, "startServer", function () {
            assert(true);
            done();
        });
        this.s.run(["--config", __dirname + "/fixtures/test-config.js"]);
    },

    "should start server on specified port with --port": function (done) {
        this.stub(this.s, "startServer", function () {
            assert(true);
            done();
        });
        this.s.run(["--config", __dirname + "/fixtures/test-config.js", "--port", "4224"]);
    },

    "should write to disk with operand": function (done) {
        this.stub(this.s, "writeToDisk", function () {
            assert(true);
            done();
        });
        this.s.run(["--config", __dirname + "/fixtures/test-config.js", "/tmp/static-test"]);
    },

    "http server": {
        setUp: function (done) {
            var self = this;
            this.s.run(["--config", __dirname + "/fixtures/test-config.js", "--port", "17171"]);

            var oldStartServer = this.s.startServer;
            this.s.startServer = function () {
                oldStartServer.apply(self.s, arguments);
                self.s.httpServer.on("listening", done);
            };
        },

        tearDown: function (done) {
            this.s.httpServer.on("close", done);
            this.s.httpServer.close();
        },

        "test getting testbed": function (done) {
            var req = http.request({port:17171, path: "/"}, function (res) {
                assert.equals(res.statusCode, 200);
                done();
            }).end();
        },

        "test getting none-existent file": function (done) {
            var req = http.request({port:17171, path: "/buster-sucks"}, function (res) {
                assert.equals(res.statusCode, 404);
                done();
            }).end();
        }
    }
});