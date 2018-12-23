exports.bool = (v) => v != undefined ? v.toLowerCase() == 'true' : undefined;
exports.int = (v) => v != undefined ? parseInt(v, 10) : undefined;
