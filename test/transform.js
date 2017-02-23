var falafel = require('../');
var test = require('tape');

test('prepend', function (t) {
    t.plan(1);

    var src = '(function test() {})();';
    var output = falafel(src, function (node) {
        if (node.type === 'FunctionExpression') {
            node.prepend('async ');
        }
    });

    t.equal(output.toString(), '(async function test() {})();');
});

test('update with length', function (t) {
    t.plan(1);

    var src = 'function test() {}';
    var output = falafel(src, function (node) {
        if (node.type === 'FunctionDeclaration') {
            node.update('function*', 8);
        }
    });

    t.equal(output.toString(), 'function* test() {}');
});
