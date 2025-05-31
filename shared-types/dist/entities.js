"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTPTypes = void 0;
// =============== HTTP関連型 ===============
var HTTPTypes;
(function (HTTPTypes) {
    let HTTP_STATUS;
    (function (HTTP_STATUS) {
        HTTP_STATUS[HTTP_STATUS["OK"] = 200] = "OK";
        HTTP_STATUS[HTTP_STATUS["CREATED"] = 201] = "CREATED";
        HTTP_STATUS[HTTP_STATUS["BAD_REQUEST"] = 400] = "BAD_REQUEST";
        HTTP_STATUS[HTTP_STATUS["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
        HTTP_STATUS[HTTP_STATUS["FORBIDDEN"] = 403] = "FORBIDDEN";
        HTTP_STATUS[HTTP_STATUS["NOT_FOUND"] = 404] = "NOT_FOUND";
        HTTP_STATUS[HTTP_STATUS["CONFLICT"] = 409] = "CONFLICT";
        HTTP_STATUS[HTTP_STATUS["INTERNAL_ERROR"] = 500] = "INTERNAL_ERROR";
    })(HTTP_STATUS = HTTPTypes.HTTP_STATUS || (HTTPTypes.HTTP_STATUS = {}));
})(HTTPTypes || (exports.HTTPTypes = HTTPTypes = {}));
