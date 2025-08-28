"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncUserProfile = exports.onAuthDelete = exports.onAuthCreate = void 0;
const admin = require("firebase-admin");
// Initialize Firebase Admin SDK
admin.initializeApp();
// Export auth functions
var auth_1 = require("./auth");
Object.defineProperty(exports, "onAuthCreate", { enumerable: true, get: function () { return auth_1.onAuthCreate; } });
Object.defineProperty(exports, "onAuthDelete", { enumerable: true, get: function () { return auth_1.onAuthDelete; } });
Object.defineProperty(exports, "syncUserProfile", { enumerable: true, get: function () { return auth_1.syncUserProfile; } });
//# sourceMappingURL=index.js.map