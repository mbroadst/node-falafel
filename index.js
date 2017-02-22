var parse = require('acorn').parse;

module.exports = function (src, opts, fn) {
    if (typeof opts === 'function') {
        fn = opts;
        opts = {};
    }
    if (src && typeof src === 'object' && src.constructor.name === 'Buffer') {
        src = src.toString();
    }
    else if (src && typeof src === 'object') {
        opts = src;
        src = opts.source;
        delete opts.source;
    }
    src = src === undefined ? opts.source : src;
    if (typeof src !== 'string') src = String(src);
    if (opts.parser) parse = opts.parser.parse;
    var ast = parse(src, opts);

    var result = {
        chunks : src.split(''),
        toString : function () { return result.chunks.join('') },
        inspect : function () { return result.toString() }
    };
    var index = 0;

    (function walk (node, parent) {
        insertHelpers(node, parent, result.chunks);

        var keys = Object.keys(node);
        for (var i = 0; i < keys.length; ++i) {
            var key = keys[i];
            if (key === 'parent') continue;

            var child = node[key];
            if (Array.isArray(child)) {
                for (var j = 0; j < child.length; ++j) {
                    var c = child[j];
                    if (c && typeof c.type === 'string') {
                        walk(c, node);
                    }
                }
            }
            else if (child && typeof child.type === 'string') {
                walk(child, node);
            }
        }

        fn(node);
    })(ast, undefined);

    return result;
};

function insertHelpers (node, parent, chunks) {
    node.parent = parent;

    node.source = function () {
        return chunks.slice(node.start, node.end).join('');
    };

    node.prepend = function(s) {
        chunks[node.start] = s + chunks[node.start];
    }

    if (node.update && typeof node.update === 'object') {
        var prev = node.update;
        var keys = Object.keys(prev);
        for (var i = 0; i < keys.length; ++i) {
            var key = keys[i];
            update[key] = prev[key];
        }
        node.update = update;
    }
    else {
        node.update = update;
    }

    function update (s) {
        chunks[node.start] = s;
        for (var i = node.start + 1; i < node.end; i++) {
            chunks[i] = '';
        }
    }
}
