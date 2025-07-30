/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 2542:
/***/ ((module) => {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncaught exception popping up in devtools
	return Promise.resolve().then(() => {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	});
}
webpackEmptyAsyncContext.keys = () => ([]);
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = 2542;
module.exports = webpackEmptyAsyncContext;

/***/ }),

/***/ 335:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AsyncHooksContextManager = void 0;
const core_1 = __nccwpck_require__(5573);
const asyncHooks = __nccwpck_require__(290);
class AsyncHooksContextManager {
    constructor() {
        this._contexts = new Map();
        this._stack = [];
        this._asyncHook = asyncHooks.createHook({
            init: this._init.bind(this),
            before: this._before.bind(this),
            after: this._after.bind(this),
            destroy: this._destroy.bind(this),
            promiseResolve: this._destroy.bind(this),
        });
    }
    active() {
        var _a;
        return (_a = this._stack[this._stack.length - 1]) !== null && _a !== void 0 ? _a : core_1.ASYNC_ROOT_CONTEXT;
    }
    with(context, fn, thisArg, ...args) {
        this._enterContext(context);
        try {
            return fn.call(thisArg, ...args);
        }
        finally {
            this._exitContext();
        }
    }
    enable() {
        this._asyncHook.enable();
        return this;
    }
    disable() {
        this._asyncHook.disable();
        this._contexts.clear();
        this._stack = [];
        return this;
    }
    /**
     * Init hook will be called when userland create a async context, setting the
     * context as the current one if it exist.
     * @param uid id of the async context
     * @param type the resource type
     */
    _init(uid, type) {
        // ignore TIMERWRAP as they combine timers with same timeout which can lead to
        // false context propagation. TIMERWRAP has been removed in node 11
        // every timer has it's own `Timeout` resource anyway which is used to propagete
        // context.
        if (type === 'TIMERWRAP')
            return;
        const context = this._stack[this._stack.length - 1];
        if (context !== undefined) {
            this._contexts.set(uid, context);
        }
    }
    /**
     * Destroy hook will be called when a given context is no longer used so we can
     * remove its attached context.
     * @param uid uid of the async context
     */
    _destroy(uid) {
        this._contexts.delete(uid);
    }
    /**
     * Before hook is called just before executing a async context.
     * @param uid uid of the async context
     */
    _before(uid) {
        const context = this._contexts.get(uid);
        if (context !== undefined) {
            this._enterContext(context);
        }
    }
    /**
     * After hook is called just after completing the execution of a async context.
     */
    _after() {
        this._exitContext();
    }
    /**
     * Set the given context as active
     */
    _enterContext(context) {
        this._stack.push(context);
    }
    /**
     * Remove the context at the root of the stack
     */
    _exitContext() {
        this._stack.pop();
    }
    /**
     * Binds a the certain context or the active one to the target function and then returns the target
     * @param context A context (span) to be bind to target
     * @param target a function. When target or one of its callbacks is called,
     *  the provided context will be used as the active context for the duration of the call.
     */
    bind(context, target) {
        if (typeof target === 'function') {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const manager = this;
            const contextWrapper = function (...args) {
                return manager.with(context, () => target.apply(this, args));
            };
            Object.defineProperty(contextWrapper, 'length', {
                enumerable: false,
                configurable: true,
                writable: false,
                value: target.length,
            });
            /**
             * It isn't possible to tell Typescript that contextWrapper is the same as T
             * so we forced to cast as any here.
             */
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return contextWrapper;
        }
        return target;
    }
}
exports.AsyncHooksContextManager = AsyncHooksContextManager;
//# sourceMappingURL=asyncHooksContextManager.js.map

/***/ }),

/***/ 2535:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AsyncLocalStorageContextManager = void 0;
const core_1 = __nccwpck_require__(5573);
const async_hooks_1 = __nccwpck_require__(290);
class AsyncLocalStorageContextManager {
    constructor() {
        this._asyncLocalStorage = new async_hooks_1.AsyncLocalStorage();
    }
    active() {
        var _a;
        return (_a = this._asyncLocalStorage.getStore()) !== null && _a !== void 0 ? _a : core_1.ASYNC_ROOT_CONTEXT;
    }
    with(context, fn, thisArg, ...args) {
        const cb = thisArg == null ? fn : fn.bind(thisArg);
        return this._asyncLocalStorage.run(context, cb, ...args);
    }
    enable() {
        return this;
    }
    disable() {
        this._asyncLocalStorage.disable();
        return this;
    }
    /**
     * Binds a the certain context or the active one to the target function and then returns the target
     * @param context A context (span) to be bind to target
     * @param target a function. When target or one of its callbacks is called,
     *  the provided context will be used as the active context for the duration of the call.
     */
    bind(context, target) {
        if (typeof target === 'function') {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const manager = this;
            const contextWrapper = function (...args) {
                return manager.with(context, () => target.apply(this, args));
            };
            Object.defineProperty(contextWrapper, 'length', {
                enumerable: false,
                configurable: true,
                writable: false,
                value: target.length,
            });
            /**
             * It isn't possible to tell Typescript that contextWrapper is the same as T
             * so we forced to cast as any here.
             */
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return contextWrapper;
        }
        return target;
    }
}
exports.AsyncLocalStorageContextManager = AsyncLocalStorageContextManager;
//# sourceMappingURL=asyncLocalStorageContextManager.js.map

/***/ }),

/***/ 8593:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createContextManager = exports.isSemverGreaterThanOrEqualTo = void 0;
__exportStar(__nccwpck_require__(335), exports);
__exportStar(__nccwpck_require__(2535), exports);
var util_1 = __nccwpck_require__(2041);
Object.defineProperty(exports, "isSemverGreaterThanOrEqualTo", ({ enumerable: true, get: function () { return util_1.isSemverGreaterThanOrEqualTo; } }));
Object.defineProperty(exports, "createContextManager", ({ enumerable: true, get: function () { return util_1.createContextManager; } }));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 2041:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createContextManager = exports.isSemverGreaterThanOrEqualTo = void 0;
const asyncLocalStorageContextManager_1 = __nccwpck_require__(2535);
const asyncHooksContextManager_1 = __nccwpck_require__(335);
const semver = /^[v^~<>=]*?(\d+)(?:\.([x*]|\d+)(?:\.([x*]|\d+)(?:\.([x*]|\d+))?(?:-([\da-z-]+(?:\.[\da-z-]+)*))?(?:\+[\da-z-]+(?:\.[\da-z-]+)*)?)?)?$/i;
// 判断 semver 大于等于 v14.8.0
function isSemverGreaterThanOrEqualTo(currentVersion, targetVersion) {
    const v = semver.exec(currentVersion);
    const t = semver.exec(targetVersion);
    if (v && t) {
        if (v[1] === t[1] && v[2] === t[2] && v[3] === t[3] && v[4] === t[4]) {
            return true;
        }
        return (gteString(v[1], t[1]) ||
            (v[1] === t[1] && gteString(v[2], t[2])) ||
            (v[1] === t[1] && v[2] === t[2] && gteString(v[3], t[3])) ||
            (v[1] === t[1] && v[2] === t[2] && v[3] === t[3] && gteString(v[4], t[4])));
    }
    return false;
}
exports.isSemverGreaterThanOrEqualTo = isSemverGreaterThanOrEqualTo;
function gteString(v1, v2) {
    // compare string with parseInt
    const v1Int = parseInt(v1, 10);
    const v2Int = parseInt(v2, 10);
    return v1Int > v2Int;
}
function createContextManager() {
    const ContextManager = isSemverGreaterThanOrEqualTo(process.version, '14.8.0')
        ? asyncLocalStorageContextManager_1.AsyncLocalStorageContextManager
        : asyncHooksContextManager_1.AsyncHooksContextManager;
    return new ContextManager();
}
exports.createContextManager = createContextManager;
//# sourceMappingURL=util.js.map

/***/ }),

/***/ 7102:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Bootstrap = exports.BootstrapStarter = void 0;
const core_1 = __nccwpck_require__(5573);
const path_1 = __nccwpck_require__(6928);
const logger_1 = __nccwpck_require__(4416);
const async_hooks_context_manager_1 = __nccwpck_require__(8593);
const event_bus_1 = __nccwpck_require__(6095);
const sticky_1 = __nccwpck_require__(9625);
class BootstrapStarter {
    constructor() {
        this.globalOptions = {};
    }
    configure(options = {}) {
        this.globalOptions = options;
        return this;
    }
    async init() {
        this.appDir = this.globalOptions.appDir =
            this.globalOptions.appDir || process.cwd();
        this.baseDir = this.globalOptions.baseDir = this.getBaseDir();
        if (process.env['MIDWAY_FORK_MODE']) {
            if (process.env['MIDWAY_FORK_MODE'] === 'cluster') {
                this.eventBus = new event_bus_1.ChildProcessEventBus({
                    isWorker: true,
                });
            }
            else if (process.env['MIDWAY_FORK_MODE'] === 'thread') {
                this.eventBus = new event_bus_1.ThreadEventBus({
                    isWorker: true,
                });
            }
        }
        if (!this.globalOptions.moduleLoadType) {
            const pkgJSON = await (0, core_1.loadModule)((0, path_1.join)(this.appDir, 'package.json'), {
                safeLoad: true,
                enableCache: false,
            });
            this.globalOptions.moduleLoadType =
                (pkgJSON === null || pkgJSON === void 0 ? void 0 : pkgJSON.type) === 'module' ? 'esm' : 'commonjs';
        }
        this.applicationContext = await (0, core_1.initializeGlobalApplicationContext)({
            asyncContextManager: (0, async_hooks_context_manager_1.createContextManager)(),
            loggerFactory: logger_1.loggers,
            ...this.globalOptions,
        });
        return this.applicationContext;
    }
    async run() {
        this.applicationContext = await this.init();
        if (this.eventBus) {
            await this.eventBus.start();
            if (process.env['MIDWAY_STICKY_MODE'] === 'true') {
                const applicationManager = this.applicationContext.get(core_1.MidwayApplicationManager);
                const io = applicationManager.getApplication('socketIO');
                (0, sticky_1.setupWorker)(io);
            }
        }
        const frameworkService = this.applicationContext.get(core_1.MidwayFrameworkService);
        // check main framework
        if (!frameworkService.getMainApp()) {
            throw new core_1.MidwayMainFrameworkMissingError();
        }
    }
    async stop() {
        if (this.applicationContext) {
            await (0, core_1.destroyGlobalApplicationContext)(this.applicationContext);
        }
        if (this.eventBus) {
            await this.eventBus.stop();
        }
    }
    getApplicationContext() {
        return this.applicationContext;
    }
    getBaseDir() {
        if (this.globalOptions.baseDir) {
            return this.globalOptions.baseDir;
        }
        if ((0, core_1.isTypeScriptEnvironment)()) {
            return (0, path_1.join)(this.appDir, 'src');
        }
        else {
            return (0, path_1.join)(this.appDir, 'dist');
        }
    }
}
exports.BootstrapStarter = BootstrapStarter;
class Bootstrap {
    /**
     * set global configuration for midway
     * @param configuration
     */
    static configure(configuration = {}) {
        this.configured = true;
        if (!this.logger && !configuration.logger) {
            this.logger = this.bootstrapLoggerFactory.createLogger('bootstrap', {
                enableError: false,
                enableFile: false,
                enableConsole: true,
            });
            if (configuration.logger === false) {
                if (this.logger['disableConsole']) {
                    // v2
                    this.logger['disableConsole']();
                }
                else {
                    // v3
                    this.logger['level'] = 'none';
                }
            }
            configuration.logger = this.logger;
        }
        else {
            this.logger = this.logger || configuration.logger;
        }
        // 处理三方框架内部依赖 process.cwd 来查找 node_modules 等问题
        if (configuration.appDir && configuration.appDir !== process.cwd()) {
            process.chdir(configuration.appDir);
        }
        this.getStarter().configure(configuration);
        return this;
    }
    static getStarter() {
        if (!this.starter) {
            this.starter = new BootstrapStarter();
        }
        return this.starter;
    }
    static async run() {
        if (!this.configured) {
            this.configure();
        }
        // https://nodejs.org/api/process.html#process_signal_events
        // https://en.wikipedia.org/wiki/Unix_signal
        // kill(2) Ctrl-C
        process.once('SIGINT', this.onSignal.bind(this, 'SIGINT'));
        // kill(3) Ctrl-\
        process.once('SIGQUIT', this.onSignal.bind(this, 'SIGQUIT'));
        // kill(15) default
        process.once('SIGTERM', this.onSignal.bind(this, 'SIGTERM'));
        process.once('exit', this.onExit.bind(this));
        this.uncaughtExceptionHandler = this.uncaughtExceptionHandler.bind(this);
        process.on('uncaughtException', this.uncaughtExceptionHandler);
        this.unhandledRejectionHandler = this.unhandledRejectionHandler.bind(this);
        process.on('unhandledRejection', this.unhandledRejectionHandler);
        return this.getStarter()
            .run()
            .then(() => {
            this.logger.info('[midway:bootstrap] current app started');
            global['MIDWAY_BOOTSTRAP_APP_READY'] = true;
            return this.getApplicationContext();
        })
            .catch(err => {
            this.logger.error(err);
            process.exit(1);
        });
    }
    static async stop() {
        await this.getStarter().stop();
        process.removeListener('uncaughtException', this.uncaughtExceptionHandler);
        process.removeListener('unhandledRejection', this.unhandledRejectionHandler);
        this.reset();
        global['MIDWAY_BOOTSTRAP_APP_READY'] = false;
    }
    static reset() {
        this.configured = false;
        this.starter = null;
        this.bootstrapLoggerFactory.close();
    }
    /**
     * on bootstrap receive a exit signal
     * @param signal
     */
    static async onSignal(signal) {
        this.logger.info('[midway:bootstrap] receive signal %s, closing', signal);
        try {
            await this.stop();
            this.logger.info('[midway:bootstrap] close done, exiting with code:0');
            process.exit(0);
        }
        catch (err) {
            this.logger.error('[midway:bootstrap] close with error: ', err);
            process.exit(1);
        }
    }
    /**
     * on bootstrap process exit
     * @param code
     */
    static onExit(code) {
        this.logger.info('[midway:bootstrap] exit with code:%s', code);
    }
    static uncaughtExceptionHandler(err) {
        if (!(err instanceof Error)) {
            err = new Error(String(err));
        }
        if (err.name === 'Error') {
            err.name = 'unhandledExceptionError';
        }
        this.logger.error(err);
    }
    static unhandledRejectionHandler(err) {
        if (!(err instanceof Error)) {
            const newError = new Error(String(err));
            // err maybe an object, try to copy the name, message and stack to the new error instance
            if (err) {
                if (err.name)
                    newError.name = err.name;
                if (err.message)
                    newError.message = err.message;
                if (err.stack)
                    newError.stack = err.stack;
            }
            err = newError;
        }
        if (err.name === 'Error') {
            err.name = 'unhandledRejectionError';
        }
        this.logger.error(err);
    }
    static getApplicationContext() {
        return this.getStarter().getApplicationContext();
    }
}
exports.Bootstrap = Bootstrap;
Bootstrap.configured = false;
Bootstrap.bootstrapLoggerFactory = new logger_1.MidwayLoggerContainer();
//# sourceMappingURL=bootstrap.js.map

/***/ }),

/***/ 1836:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.setupStickyMaster = exports.AbstractForkManager = exports.ClusterManager = exports.BootstrapStarter = exports.Bootstrap = void 0;
__exportStar(__nccwpck_require__(651), exports);
var bootstrap_1 = __nccwpck_require__(7102);
Object.defineProperty(exports, "Bootstrap", ({ enumerable: true, get: function () { return bootstrap_1.Bootstrap; } }));
Object.defineProperty(exports, "BootstrapStarter", ({ enumerable: true, get: function () { return bootstrap_1.BootstrapStarter; } }));
var cp_1 = __nccwpck_require__(985);
Object.defineProperty(exports, "ClusterManager", ({ enumerable: true, get: function () { return cp_1.ClusterManager; } }));
var base_1 = __nccwpck_require__(727);
Object.defineProperty(exports, "AbstractForkManager", ({ enumerable: true, get: function () { return base_1.AbstractForkManager; } }));
var sticky_1 = __nccwpck_require__(9625);
Object.defineProperty(exports, "setupStickyMaster", ({ enumerable: true, get: function () { return sticky_1.setupStickyMaster; } }));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 651:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=interface.js.map

/***/ }),

/***/ 727:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AbstractForkManager = void 0;
const os = __nccwpck_require__(857);
const util = __nccwpck_require__(9023);
const util_1 = __nccwpck_require__(1470);
const events_1 = __nccwpck_require__(4434);
const util_2 = __nccwpck_require__(9023);
const debug = (0, util_2.debuglog)('midway:bootstrap');
class AbstractForkManager {
    constructor(options) {
        this.options = options;
        this.reforks = [];
        this.disconnectCount = 0;
        this.unexpectedCount = 0;
        this.disconnects = {};
        this.hub = new events_1.EventEmitter();
        this.workers = new Map();
        this.isClosing = false;
        options.count = options.count || os.cpus().length - 1;
        options.refork = options.refork !== false;
        options.limit = options.limit || 60;
        options.duration = options.duration || 60000; // 1 min
        options.logger = options.logger || console;
        options.workerInitTimeout = options.workerInitTimeout || 30000;
        this.eventBus = this.createEventBus({
            initTimeout: options.workerInitTimeout,
        });
    }
    async start() {
        debug('Start manager with options: %j', this.options);
        this.bindWorkerDisconnect(worker => {
            debug(' - worker(%s): trigger event = disconnect', this.getWorkerId(worker));
            const log = this.options.logger[worker['disableRefork'] ? 'info' : 'error'];
            this.disconnectCount++;
            const isDead = this.isWorkerDead(worker);
            if (isDead) {
                debug(' - worker(%s): worker is dead', this.getWorkerId(worker));
                // worker has terminated before disconnect
                this.options.logger.info("[%s] [bootstrap:master:%s] don't fork, because worker:%s exit event emit before disconnect", (0, util_1.logDate)(), process.pid, this.getWorkerId(worker));
                return;
            }
            if (worker['disableRefork']) {
                debug(' - worker(%s): worker is disableRefork(maybe terminated by master)', this.getWorkerId(worker));
                // worker has terminated by master
                log("[%s] [bootstrap:master:%s] don't fork, because worker:%s will be kill soon", (0, util_1.logDate)(), process.pid, this.getWorkerId(worker));
                return;
            }
            this.disconnects[this.getWorkerId(worker)] = (0, util_1.logDate)();
            this.tryToRefork(worker);
        });
        this.bindWorkerExit((worker, code, signal) => {
            debug(' - worker(%s): trigger event = exit', this.getWorkerId(worker));
            // remove worker
            this.workers.delete(this.getWorkerId(worker));
            if (worker['disableRefork']) {
                return;
            }
            const isExpected = !!this.disconnects[this.getWorkerId(worker)];
            debug(' - worker(%s): isExpected=%s', this.getWorkerId(worker), isExpected);
            if (isExpected) {
                delete this.disconnects[this.getWorkerId(worker)];
                // worker disconnect first, exit expected
                return;
            }
            debug(' - worker(%s): isWorkerDead=%s', this.getWorkerId(worker), this.isWorkerDead(worker));
            if (this.isWorkerDead(worker)) {
                return;
            }
            debug(' - worker(%s): unexpectedCount will add');
            this.unexpectedCount++;
            this.tryToRefork(worker);
            this.onUnexpected(worker, code, signal);
        });
        this.bindClose();
        this.hub.on('reachReforkLimit', this.onReachReforkLimit.bind(this));
        // defer to set the listeners
        // so you can listen this by your own
        setImmediate(() => {
            if (process.listeners('uncaughtException').length === 0) {
                process.on('uncaughtException', this.onerror.bind(this));
            }
        });
        for (let i = 0; i < this.options.count; i++) {
            const w = this.createWorker();
            debug(' - worker(%s) created', this.getWorkerId(w));
            this.eventBus.addWorker(w);
            this.workers.set(this.getWorkerId(w), w);
        }
        await this.eventBus.start();
    }
    tryToRefork(oldWorker) {
        if (this.allowRefork()) {
            debug(' - worker(%s): allow refork and will fork new', this.getWorkerId(oldWorker));
            const newWorker = this.createWorker(oldWorker);
            this.workers.set(this.getWorkerId(newWorker), newWorker);
            this.options.logger.info('[%s] [bootstrap:master:%s] new worker:%s fork (state: %s)', (0, util_1.logDate)(), process.pid, this.getWorkerId(newWorker), newWorker['state']);
            this.eventBus.addWorker(newWorker);
        }
        else {
            debug(' - worker(%s): forbidden refork and will stop', this.getWorkerId(oldWorker));
            this.options.logger.info("[%s] [bootstrap:master:%s] don't fork new work (refork: %s)", (0, util_1.logDate)(), process.pid, this.options.refork);
        }
    }
    /**
     * allow refork
     */
    allowRefork() {
        if (!this.options.refork || this.isClosing) {
            return false;
        }
        const times = this.reforks.push(Date.now());
        if (times > this.options.limit) {
            this.reforks.shift();
        }
        const span = this.reforks[this.reforks.length - 1] - this.reforks[0];
        const canFork = this.reforks.length < this.options.limit || span > this.options.duration;
        if (!canFork) {
            this.hub.emit('reachReforkLimit');
        }
        return canFork;
    }
    /**
     * uncaughtException default handler
     */
    onerror(err) {
        if (!err) {
            return;
        }
        this.options.logger.error('[%s] [bootstrap:master:%s] master uncaughtException: %s', (0, util_1.logDate)(), process.pid, err.stack);
        this.options.logger.error(err);
        this.options.logger.error('(total %d disconnect, %d unexpected exit)', this.disconnectCount, this.unexpectedCount);
    }
    /**
     * unexpectedExit default handler
     */
    onUnexpected(worker, code, signal) {
        // eslint-disable-next-line no-prototype-builtins
        const propertyName = worker.hasOwnProperty('exitedAfterDisconnect')
            ? 'exitedAfterDisconnect'
            : 'suicide';
        const err = new Error(util.format('worker:%s died unexpected (code: %s, signal: %s, %s: %s, state: %s)', this.getWorkerId(worker), code, signal, propertyName, worker[propertyName], worker['state']));
        err.name = 'WorkerDiedUnexpectedError';
        this.options.logger.error('[%s] [bootstrap:master:%s] (total %d disconnect, %d unexpected exit) %s', (0, util_1.logDate)(), process.pid, this.disconnectCount, this.unexpectedCount, err.stack);
    }
    /**
     * reachReforkLimit default handler
     */
    onReachReforkLimit() {
        this.options.logger.error('[%s] [bootstrap:master:%s] worker died too fast (total %d disconnect, %d unexpected exit)', (0, util_1.logDate)(), process.pid, this.disconnectCount, this.unexpectedCount);
    }
    async killWorker(worker, timeout) {
        // kill process, if SIGTERM not work, try SIGKILL
        await this.closeWorker(worker);
        await Promise.race([(0, events_1.once)(worker, 'exit'), (0, util_1.sleep)(timeout)]);
        if (worker.killed)
            return;
        // SIGKILL: http://man7.org/linux/man-pages/man7/signal.7.html
        // worker: https://github.com/nodejs/node/blob/master/lib/internal/cluster/worker.js#L22
        // subProcess.kill is wrapped to subProcess.destroy, it will wait to disconnected.
        (worker.process || worker).kill('SIGKILL');
    }
    async stop(timeout = 2000) {
        debug('run close');
        this.isClosing = true;
        await this.eventBus.stop();
        for (const worker of this.workers.values()) {
            worker['disableRefork'] = true;
            await this.killWorker(worker, timeout);
        }
        if (this.exitListener) {
            await this.exitListener();
        }
    }
    hasWorker(workerId) {
        return this.workers.has(workerId);
    }
    getWorker(workerId) {
        return this.workers.get(workerId);
    }
    getWorkerIds() {
        return Array.from(this.workers.keys());
    }
    onStop(exitListener) {
        this.exitListener = exitListener;
    }
    bindClose() {
        // kill(2) Ctrl-C
        process.once('SIGINT', this.onSignal.bind(this, 'SIGINT'));
        // kill(3) Ctrl-\
        process.once('SIGQUIT', this.onSignal.bind(this, 'SIGQUIT'));
        // kill(15) default
        process.once('SIGTERM', this.onSignal.bind(this, 'SIGTERM'));
        process.once('exit', this.onMasterExit.bind(this));
    }
    /**
     * on bootstrap receive a exit signal
     * @param signal
     */
    async onSignal(signal) {
        if (!this.isClosing) {
            this.options.logger.info('[bootstrap:master] receive signal %s, closing', signal);
            try {
                await this.stop();
                this.options.logger.info('[bootstrap:master] close done, exiting with code:0');
                process.exit(0);
            }
            catch (err) {
                this.options.logger.error('[midway:master] close with error: ', err);
                process.exit(1);
            }
        }
    }
    /**
     * on bootstrap process exit
     * @param code
     */
    onMasterExit(code) {
        this.options.logger.info('[bootstrap:master] exit with code:%s', code);
    }
}
exports.AbstractForkManager = AbstractForkManager;
//# sourceMappingURL=base.js.map

/***/ }),

/***/ 985:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ClusterManager = void 0;
const event_bus_1 = __nccwpck_require__(6095);
const base_1 = __nccwpck_require__(727);
const cluster = __nccwpck_require__(9907);
const util_1 = __nccwpck_require__(9023);
const core_1 = __nccwpck_require__(5573);
const debug = (0, util_1.debuglog)('midway:bootstrap');
class ClusterManager extends base_1.AbstractForkManager {
    constructor(options = {}) {
        super(options);
        this.options = options;
        options.args = options.args || [];
        options.execArgv = options.execArgv || [];
        if ((0, core_1.isTypeScriptEnvironment)()) {
            options.execArgv.push(...['--require', 'ts-node/register']);
        }
    }
    createWorker() {
        if (cluster['setupPrimary']) {
            cluster['setupPrimary'](this.options);
        }
        else if (cluster['setupMaster']) {
            cluster['setupMaster'](this.options);
        }
        return cluster.fork({
            MIDWAY_FORK_MODE: 'cluster',
            MIDWAY_STICKY_MODE: this.options.sticky ? 'true' : 'false',
            ...this.options.env,
        });
    }
    bindWorkerDisconnect(listener) {
        debug('Bind cluster.disconnect event');
        cluster.on('disconnect', listener);
    }
    bindWorkerExit(listener) {
        debug('Bind cluster.exit event');
        cluster.on('exit', listener);
    }
    getWorkerId(worker) {
        return String(worker.process.pid);
    }
    isWorkerDead(worker) {
        return worker.isDead();
    }
    closeWorker(worker) {
        worker.kill('SIGTERM');
    }
    createEventBus(options) {
        return new event_bus_1.ChildProcessEventBus(options);
    }
    isPrimary() {
        return !cluster.isWorker;
    }
}
exports.ClusterManager = ClusterManager;
//# sourceMappingURL=cp.js.map

/***/ }),

/***/ 9625:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.setupWorker = exports.setupStickyMaster = void 0;
const cluster = __nccwpck_require__(9907);
const crypto_1 = __nccwpck_require__(6982);
const randomId = () => (0, crypto_1.randomBytes)(8).toString('hex');
function setupStickyMaster(httpServer, opts = {}) {
    const options = {
        loadBalancingMethod: 'least-connection',
        ...opts,
    };
    const sessionIdToWorker = new Map();
    const sidRegex = /sid=([\w-]{20})/;
    let currentIndex = 0; // for round-robin load balancing
    const computeWorkerId = data => {
        const match = sidRegex.exec(data);
        if (match) {
            const sid = match[1];
            const workerId = sessionIdToWorker.get(sid);
            if (workerId && cluster.workers[workerId]) {
                return workerId;
            }
        }
        switch (options.loadBalancingMethod) {
            case 'random': {
                const workerIds = Object.keys(cluster.workers);
                return workerIds[Math.floor(Math.random() * workerIds.length)];
            }
            case 'round-robin': {
                const workerIds = Object.keys(cluster.workers);
                currentIndex++;
                if (currentIndex >= workerIds.length) {
                    currentIndex = 0;
                }
                return workerIds[currentIndex];
            }
            case 'least-connection':
                // eslint-disable-next-line no-case-declarations
                let leastActiveWorker;
                for (const id in cluster.workers) {
                    const worker = cluster.workers[id];
                    if (leastActiveWorker === undefined) {
                        leastActiveWorker = worker;
                    }
                    else {
                        const c1 = worker['clientsCount'] || 0;
                        const c2 = leastActiveWorker['clientsCount'] || 0;
                        if (c1 < c2) {
                            leastActiveWorker = worker;
                        }
                    }
                }
                return leastActiveWorker.id;
        }
    };
    httpServer.on('connection', socket => {
        let workerId, connectionId;
        const sendCallback = err => {
            if (err) {
                socket.destroy();
            }
        };
        socket.on('data', (buffer) => {
            let encoding = 'utf-8';
            let data = buffer.toString(encoding);
            if (workerId && connectionId) {
                cluster.workers[workerId].send({ type: 'sticky:http-chunk', data, encoding, connectionId }, sendCallback);
                return;
            }
            workerId = computeWorkerId(data);
            const mayHaveMultipleChunks = !(data.startsWith('GET') ||
                data
                    .substring(0, data.indexOf('\r\n\r\n'))
                    .includes('pgrade: websocket'));
            // avoid binary data toString error
            if (data.startsWith('POST') && data.includes('multipart/form-data')) {
                encoding = 'base64';
                data = buffer.toString('base64');
            }
            socket.pause();
            if (mayHaveMultipleChunks) {
                connectionId = randomId();
            }
            cluster.workers[workerId].send({ type: 'sticky:connection', data, encoding, connectionId }, socket, {
                keepOpen: mayHaveMultipleChunks,
            }, sendCallback);
        });
    });
    // this is needed to properly detect the end of the HTTP request body
    httpServer.on('request', req => {
        req.on('data', () => { });
    });
    cluster.on('message', (worker, { type, data }) => {
        switch (type) {
            case 'sticky:connection':
                sessionIdToWorker.set(data, worker.id);
                if (options.loadBalancingMethod === 'least-connection') {
                    worker['clientsCount'] = (worker['clientsCount'] || 0) + 1;
                }
                break;
            case 'sticky:disconnection':
                sessionIdToWorker.delete(data);
                if (options.loadBalancingMethod === 'least-connection') {
                    worker['clientsCount']--;
                }
                break;
        }
    });
}
exports.setupStickyMaster = setupStickyMaster;
function setupWorker(io) {
    // store connections that may receive multiple chunks
    const sockets = new Map();
    process.on('message', ({ type, data, encoding, connectionId }, socket) => {
        switch (type) {
            case 'sticky:connection':
                if (!socket) {
                    // might happen if the socket is closed during the transfer to the worker
                    // see https://nodejs.org/api/child_process.html#child_process_example_sending_a_socket_object
                    return;
                }
                io.httpServer.emit('connection', socket); // inject connection
                socket.emit('data', Buffer.from(data, encoding)); // republish first chunk
                socket.resume();
                if (connectionId) {
                    sockets.set(connectionId, socket);
                    socket.on('close', () => {
                        sockets.delete(connectionId);
                    });
                }
                break;
            case 'sticky:http-chunk': {
                const socket = sockets.get(connectionId);
                if (socket) {
                    socket.emit('data', Buffer.from(data, encoding));
                }
            }
        }
    });
    const ignoreError = () => { }; // the next request will fail anyway
    io.engine.on('connection', socket => {
        process.send({ type: 'sticky:connection', data: socket.id }, ignoreError);
        socket.once('close', () => {
            process.send({ type: 'sticky:disconnection', data: socket.id }, ignoreError);
        });
    });
}
exports.setupWorker = setupWorker;
//# sourceMappingURL=sticky.js.map

/***/ }),

/***/ 1470:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.sleep = exports.logDate = void 0;
function logDate() {
    const d = new Date();
    let date = d.getDate();
    if (date < 10) {
        date = '0' + date;
    }
    let month = d.getMonth() + 1;
    if (month < 10) {
        month = '0' + month;
    }
    let hours = d.getHours();
    if (hours < 10) {
        hours = '0' + hours;
    }
    let mintues = d.getMinutes();
    if (mintues < 10) {
        mintues = '0' + mintues;
    }
    let seconds = d.getSeconds();
    if (seconds < 10) {
        seconds = '0' + seconds;
    }
    let milliseconds = d.getMilliseconds();
    if (milliseconds < 10) {
        milliseconds = '00' + milliseconds;
    }
    else if (milliseconds < 100) {
        milliseconds = '0' + milliseconds;
    }
    return (d.getFullYear() +
        '-' +
        month +
        '-' +
        date +
        ' ' +
        hours +
        ':' +
        mintues +
        ':' +
        seconds +
        '.' +
        milliseconds);
}
exports.logDate = logDate;
async function sleep(timeout) {
    return new Promise(resolve => {
        setTimeout(resolve, timeout);
    });
}
exports.sleep = sleep;
//# sourceMappingURL=util.js.map

/***/ }),

/***/ 1630:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseFramework = void 0;
const interface_1 = __nccwpck_require__(7270);
const constants_1 = __nccwpck_require__(7404);
const decorator_1 = __nccwpck_require__(8351);
const requestContainer_1 = __nccwpck_require__(4005);
const environmentService_1 = __nccwpck_require__(4057);
const configService_1 = __nccwpck_require__(3440);
const informationService_1 = __nccwpck_require__(1560);
const loggerService_1 = __nccwpck_require__(426);
const middlewareManager_1 = __nccwpck_require__(1044);
const middlewareService_1 = __nccwpck_require__(6134);
const filterManager_1 = __nccwpck_require__(3762);
const mockService_1 = __nccwpck_require__(7072);
const util = __nccwpck_require__(9023);
const asyncContextManager_1 = __nccwpck_require__(6905);
const guardManager_1 = __nccwpck_require__(1347);
const debug = util.debuglog('midway:debug');
class BaseFramework {
    constructor(applicationContext) {
        this.applicationContext = applicationContext;
        this.defaultContext = {};
        this.middlewareManager = this.createMiddlewareManager();
        this.filterManager = this.createFilterManager();
        this.guardManager = this.createGuardManager();
        this.composeMiddleware = null;
    }
    async init() {
        var _a, _b;
        this.configurationOptions = (_a = this.configure()) !== null && _a !== void 0 ? _a : {};
        this.contextLoggerApplyLogger =
            (_b = this.configurationOptions.contextLoggerApplyLogger) !== null && _b !== void 0 ? _b : 'appLogger';
        this.contextLoggerFormat = this.configurationOptions.contextLoggerFormat;
        this.logger = this.loggerService.getLogger('coreLogger');
        this.appLogger = this.loggerService.getLogger('appLogger');
        return this;
    }
    isEnable() {
        return true;
    }
    async initialize(options) {
        this.bootstrapOptions = options;
        await this.beforeContainerInitialize(options);
        await this.containerInitialize(options);
        await this.afterContainerInitialize(options);
        await this.containerDirectoryLoad(options);
        await this.afterContainerDirectoryLoad(options);
        /**
         * Third party application initialization
         */
        await this.applicationInitialize(options);
        await this.containerReady(options);
        await this.afterContainerReady(options);
        await this.mockService.runSimulatorAppSetup(this.app);
    }
    /**
     * @deprecated
     */
    async containerInitialize(options) { }
    /**
     * @deprecated
     */
    async containerDirectoryLoad(options) { }
    /**
     * @deprecated
     */
    async containerReady(options) {
        if (!this.app.getApplicationContext) {
            this.defineApplicationProperties();
        }
    }
    getApplicationContext() {
        return this.applicationContext;
    }
    getConfiguration(key) {
        return this.configService.getConfiguration(key);
    }
    getCurrentEnvironment() {
        return this.environmentService.getCurrentEnvironment();
    }
    getApplication() {
        return this.app;
    }
    createContextLogger(ctx, name) {
        if (name && name !== 'appLogger') {
            const appLogger = this.getLogger(name);
            let ctxLoggerCache = ctx.getAttr(constants_1.REQUEST_CTX_LOGGER_CACHE_KEY);
            if (!ctxLoggerCache) {
                ctxLoggerCache = new Map();
                ctx.setAttr(constants_1.REQUEST_CTX_LOGGER_CACHE_KEY, ctxLoggerCache);
            }
            // if logger exists
            if (ctxLoggerCache.has(name)) {
                return ctxLoggerCache.get(name);
            }
            // create new context logger
            const ctxLogger = this.loggerService.createContextLogger(ctx, appLogger);
            ctxLoggerCache.set(name, ctxLogger);
            return ctxLogger;
        }
        else {
            const appLogger = this.getLogger(name !== null && name !== void 0 ? name : this.contextLoggerApplyLogger);
            // avoid maximum call stack size exceeded
            if (ctx['_logger']) {
                return ctx['_logger'];
            }
            ctx['_logger'] = this.loggerService.createContextLogger(ctx, appLogger, {
                contextFormat: this.contextLoggerFormat,
            });
            return ctx['_logger'];
        }
    }
    async stop() {
        await this.mockService.runSimulatorAppTearDown(this.app);
        await this.beforeStop();
    }
    getAppDir() {
        return this.informationService.getAppDir();
    }
    getBaseDir() {
        return this.informationService.getBaseDir();
    }
    defineApplicationProperties(applicationProperties = {}, whiteList = []) {
        const defaultApplicationProperties = {
            getBaseDir: () => {
                return this.getBaseDir();
            },
            getAppDir: () => {
                return this.getAppDir();
            },
            getEnv: () => {
                return this.getCurrentEnvironment();
            },
            getApplicationContext: () => {
                return this.getApplicationContext();
            },
            getConfig: (key) => {
                return this.getConfiguration(key);
            },
            getFrameworkType: () => {
                if (this['getFrameworkType']) {
                    return this['getFrameworkType']();
                }
            },
            getProcessType: () => {
                return interface_1.MidwayProcessTypeEnum.APPLICATION;
            },
            getCoreLogger: () => {
                return this.getCoreLogger();
            },
            getLogger: (name) => {
                return this.getLogger(name);
            },
            createLogger: (name, options = {}) => {
                return this.createLogger(name, options);
            },
            getFramework: () => {
                return this;
            },
            getProjectName: () => {
                return this.getProjectName();
            },
            createAnonymousContext: (extendCtx) => {
                const ctx = extendCtx || Object.create(this.defaultContext);
                if (!ctx.startTime) {
                    ctx.startTime = Date.now();
                }
                if (!ctx.logger) {
                    ctx.logger = this.createContextLogger(ctx);
                }
                if (!ctx.requestContext) {
                    ctx.requestContext = new requestContainer_1.MidwayRequestContainer(ctx, this.getApplicationContext());
                    ctx.requestContext.ready();
                }
                if (!ctx.getLogger) {
                    ctx.getLogger = name => {
                        return this.createContextLogger(ctx, name);
                    };
                }
                ctx.setAttr = (key, value) => {
                    ctx.requestContext.setAttr(key, value);
                };
                ctx.getAttr = (key) => {
                    return ctx.requestContext.getAttr(key);
                };
                ctx.getApp = () => {
                    return this.getApplication();
                };
                return ctx;
            },
            addConfigObject: (obj) => {
                this.configService.addObject(obj);
            },
            setAttr: (key, value) => {
                this.getApplicationContext().setAttr(key, value);
            },
            getAttr: (key) => {
                return this.getApplicationContext().getAttr(key);
            },
            useMiddleware: (middleware) => {
                return this.useMiddleware(middleware);
            },
            getMiddleware: () => {
                return this.getMiddleware();
            },
            useFilter: (Filter) => {
                return this.useFilter(Filter);
            },
            useGuard: (guard) => {
                return this.useGuard(guard);
            },
            getNamespace: () => {
                return this.getNamespace();
            },
        };
        for (const method of whiteList) {
            delete defaultApplicationProperties[method];
        }
        Object.assign(this.app, defaultApplicationProperties, applicationProperties);
    }
    async beforeStop() { }
    /**
     * @deprecated
     */
    async beforeContainerInitialize(options) { }
    /**
     * @deprecated
     */
    async afterContainerInitialize(options) { }
    /**
     * @deprecated
     */
    async afterContainerDirectoryLoad(options) { }
    /**
     * @deprecated
     */
    async afterContainerReady(options) { }
    async applyMiddleware(lastMiddleware) {
        var _a;
        if (!this.composeMiddleware) {
            if (!this.applicationContext.hasObject(constants_1.ASYNC_CONTEXT_MANAGER_KEY)) {
                const asyncContextManagerEnabled = this.configService.getConfiguration('asyncContextManager.enable') ||
                    false;
                const contextManager = asyncContextManagerEnabled
                    ? ((_a = this.bootstrapOptions) === null || _a === void 0 ? void 0 : _a.asyncContextManager) ||
                        new asyncContextManager_1.NoopContextManager()
                    : new asyncContextManager_1.NoopContextManager();
                if (asyncContextManagerEnabled) {
                    contextManager.enable();
                }
                this.applicationContext.registerObject(constants_1.ASYNC_CONTEXT_MANAGER_KEY, contextManager);
            }
            this.middlewareManager.insertFirst((async (ctx, next) => {
                // warp with context manager
                const rootContext = asyncContextManager_1.ASYNC_ROOT_CONTEXT.setValue(constants_1.ASYNC_CONTEXT_KEY, ctx);
                const contextManager = this.applicationContext.get(constants_1.ASYNC_CONTEXT_MANAGER_KEY);
                return await contextManager.with(rootContext, async () => {
                    // run simulator context setup
                    await this.mockService.runSimulatorContextSetup(ctx, this.app);
                    this.mockService.applyContextMocks(this.app, ctx);
                    let returnResult = undefined;
                    try {
                        const result = await next();
                        returnResult = await this.filterManager.runResultFilter(result, ctx);
                    }
                    catch (err) {
                        returnResult = await this.filterManager.runErrorFilter(err, ctx);
                    }
                    finally {
                        // run simulator context teardown
                        await this.mockService.runSimulatorContextTearDown(ctx, this.app);
                    }
                    if (returnResult.error) {
                        throw returnResult.error;
                    }
                    return returnResult.result;
                });
            }));
            debug(`[core]: Compose middleware = [${this.middlewareManager.getNames()}]`);
            this.composeMiddleware = await this.middlewareService.compose(this.middlewareManager, this.app);
            await this.filterManager.init(this.applicationContext);
        }
        if (lastMiddleware) {
            lastMiddleware = Array.isArray(lastMiddleware)
                ? lastMiddleware
                : [lastMiddleware];
            return await this.middlewareService.compose([this.composeMiddleware, ...lastMiddleware], this.app);
        }
        return this.composeMiddleware;
    }
    getLogger(name) {
        var _a;
        return (_a = this.loggerService.getLogger(name)) !== null && _a !== void 0 ? _a : this.appLogger;
    }
    getCoreLogger() {
        return this.logger;
    }
    createLogger(name, option = {}) {
        return this.loggerService.createLogger(name, option);
    }
    getProjectName() {
        return this.informationService.getProjectName();
    }
    getFrameworkName() {
        return this.constructor.name;
    }
    useMiddleware(middleware) {
        this.middlewareManager.insertLast(middleware);
    }
    getMiddleware() {
        return this.middlewareManager;
    }
    useFilter(filter) {
        return this.filterManager.useFilter(filter);
    }
    useGuard(guards) {
        return this.guardManager.addGlobalGuard(guards);
    }
    async runGuard(ctx, supplierClz, methodName) {
        return this.guardManager.runGuard(ctx, supplierClz, methodName);
    }
    createMiddlewareManager() {
        return new middlewareManager_1.ContextMiddlewareManager();
    }
    createFilterManager() {
        return new filterManager_1.FilterManager();
    }
    createGuardManager() {
        return new guardManager_1.GuardManager();
    }
    setNamespace(namespace) {
        this.namespace = namespace;
    }
    getNamespace() {
        return this.namespace;
    }
}
__decorate([
    (0, decorator_1.Inject)(),
    __metadata("design:type", loggerService_1.MidwayLoggerService)
], BaseFramework.prototype, "loggerService", void 0);
__decorate([
    (0, decorator_1.Inject)(),
    __metadata("design:type", environmentService_1.MidwayEnvironmentService)
], BaseFramework.prototype, "environmentService", void 0);
__decorate([
    (0, decorator_1.Inject)(),
    __metadata("design:type", configService_1.MidwayConfigService)
], BaseFramework.prototype, "configService", void 0);
__decorate([
    (0, decorator_1.Inject)(),
    __metadata("design:type", informationService_1.MidwayInformationService)
], BaseFramework.prototype, "informationService", void 0);
__decorate([
    (0, decorator_1.Inject)(),
    __metadata("design:type", middlewareService_1.MidwayMiddlewareService)
], BaseFramework.prototype, "middlewareService", void 0);
__decorate([
    (0, decorator_1.Inject)(),
    __metadata("design:type", mockService_1.MidwayMockService)
], BaseFramework.prototype, "mockService", void 0);
__decorate([
    (0, decorator_1.Init)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BaseFramework.prototype, "init", null);
exports.BaseFramework = BaseFramework;
//# sourceMappingURL=baseFramework.js.map

/***/ }),

/***/ 1926:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MidwayApplicationManager = void 0;
const interface_1 = __nccwpck_require__(7270);
const decorator_1 = __nccwpck_require__(8351);
let MidwayApplicationManager = class MidwayApplicationManager {
    constructor() {
        this.globalFrameworkMap = new Map();
        this.globalFrameworkTypeMap = new WeakMap();
    }
    addFramework(namespace, framework) {
        this.globalFrameworkMap.set(namespace, framework);
        if (framework['getFrameworkType']) {
            this.globalFrameworkTypeMap.set(framework['getFrameworkType'](), framework);
        }
    }
    getFramework(namespaceOrFrameworkType) {
        if (typeof namespaceOrFrameworkType === 'string') {
            if (this.globalFrameworkMap.has(namespaceOrFrameworkType)) {
                return this.globalFrameworkMap.get(namespaceOrFrameworkType);
            }
        }
        else {
            if (this.globalFrameworkTypeMap.has(namespaceOrFrameworkType)) {
                return this.globalFrameworkTypeMap.get(namespaceOrFrameworkType);
            }
        }
    }
    getApplication(namespaceOrFrameworkType) {
        if (typeof namespaceOrFrameworkType === 'string') {
            if (this.globalFrameworkMap.has(namespaceOrFrameworkType)) {
                return this.globalFrameworkMap
                    .get(namespaceOrFrameworkType)
                    .getApplication();
            }
        }
        else {
            if (this.globalFrameworkTypeMap.has(namespaceOrFrameworkType)) {
                return this.globalFrameworkTypeMap
                    .get(namespaceOrFrameworkType)
                    .getApplication();
            }
        }
    }
    getApplications(namespaces) {
        if (!namespaces) {
            return Array.from(this.globalFrameworkMap.values())
                .map(framework => {
                return framework.getApplication();
            })
                .filter(app => {
                return !!app;
            });
        }
        else {
            return namespaces
                .map(namespace => {
                return this.getApplication(namespace);
            })
                .filter(app => {
                return !!app;
            });
        }
    }
};
MidwayApplicationManager = __decorate([
    (0, decorator_1.Provide)(),
    (0, decorator_1.Scope)(interface_1.ScopeEnum.Singleton)
], MidwayApplicationManager);
exports.MidwayApplicationManager = MidwayApplicationManager;
//# sourceMappingURL=applicationManager.js.map

/***/ }),

/***/ 6905:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NoopContextManager = exports.ASYNC_ROOT_CONTEXT = void 0;
class AsyncBaseContext {
    /**
     * Construct a new context which inherits values from an optional parent context.
     *
     * @param parentContext a context from which to inherit values
     */
    constructor(parentContext) {
        // for minification
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        self._currentContext = parentContext ? new Map(parentContext) : new Map();
        self.getValue = (key) => self._currentContext.get(key);
        self.setValue = (key, value) => {
            const context = new AsyncBaseContext(self._currentContext);
            context._currentContext.set(key, value);
            return context;
        };
        self.deleteValue = (key) => {
            const context = new AsyncBaseContext(self._currentContext);
            context._currentContext.delete(key);
            return context;
        };
    }
}
/** The root context is used as the default parent context when there is no active context */
exports.ASYNC_ROOT_CONTEXT = new AsyncBaseContext();
class NoopContextManager {
    active() {
        return exports.ASYNC_ROOT_CONTEXT;
    }
    with(_context, fn, thisArg, ...args) {
        return fn.call(thisArg, ...args);
    }
    bind(_context, target) {
        return target;
    }
    enable() {
        return this;
    }
    disable() {
        return this;
    }
}
exports.NoopContextManager = NoopContextManager;
//# sourceMappingURL=asyncContextManager.js.map

/***/ }),

/***/ 7647:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DataListener = void 0;
const decorator_1 = __nccwpck_require__(8351);
class DataListener {
    async init() {
        this.innerData = await this.initData();
        await this.onData(this.setData.bind(this));
    }
    setData(data) {
        this.innerData = data;
    }
    getData() {
        return this.innerData;
    }
    async stop() {
        await this.destroyListener();
    }
    async destroyListener() { }
}
__decorate([
    (0, decorator_1.Init)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DataListener.prototype, "init", null);
__decorate([
    (0, decorator_1.Destroy)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DataListener.prototype, "stop", null);
exports.DataListener = DataListener;
//# sourceMappingURL=dataListener.js.map

/***/ }),

/***/ 771:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.globModels = exports.formatGlobString = exports.DataSourceManager = void 0;
/**
 * 数据源管理器实现
 */
const extend_1 = __nccwpck_require__(428);
const error_1 = __nccwpck_require__(6248);
const glob_1 = __nccwpck_require__(266);
const path_1 = __nccwpck_require__(6928);
const types_1 = __nccwpck_require__(3171);
const constants_1 = __nccwpck_require__(7404);
const util_1 = __nccwpck_require__(9023);
const util_2 = __nccwpck_require__(6110);
const decorator_1 = __nccwpck_require__(8351);
const environmentService_1 = __nccwpck_require__(4057);
const priorityManager_1 = __nccwpck_require__(340);
const debug = (0, util_1.debuglog)('midway:debug');
class DataSourceManager {
    constructor() {
        this.dataSource = new Map();
        this.options = {};
        this.modelMapping = new WeakMap();
        this.dataSourcePriority = {};
    }
    async initDataSource(dataSourceConfig, baseDirOrOptions) {
        var _a;
        this.options = dataSourceConfig;
        if (!this.options.dataSource) {
            throw new error_1.MidwayParameterError('[DataSourceManager] must set options.dataSource.');
        }
        if (typeof baseDirOrOptions === 'string') {
            baseDirOrOptions = {
                baseDir: baseDirOrOptions,
                entitiesConfigKey: 'entities',
            };
        }
        for (const dataSourceName in dataSourceConfig.dataSource) {
            const dataSourceOptions = dataSourceConfig.dataSource[dataSourceName];
            const userEntities = dataSourceOptions[baseDirOrOptions.entitiesConfigKey];
            if (userEntities) {
                const entities = new Set();
                // loop entities and glob files to model
                for (const entity of userEntities) {
                    if (typeof entity === 'string') {
                        // string will be glob file
                        const models = await globModels(entity, baseDirOrOptions.baseDir, (_a = this.environmentService) === null || _a === void 0 ? void 0 : _a.getModuleLoadType());
                        for (const model of models) {
                            entities.add(model);
                            this.modelMapping.set(model, dataSourceName);
                        }
                    }
                    else {
                        // model will be added to array
                        entities.add(entity);
                        this.modelMapping.set(entity, dataSourceName);
                    }
                }
                dataSourceOptions[baseDirOrOptions.entitiesConfigKey] =
                    Array.from(entities);
                debug(`[core]: DataManager load ${dataSourceOptions[baseDirOrOptions.entitiesConfigKey].length} models from ${dataSourceName}.`);
            }
            // create data source
            const opts = {
                cacheInstance: dataSourceConfig.cacheInstance,
                validateConnection: dataSourceConfig.validateConnection,
            };
            await this.createInstance(dataSourceOptions, dataSourceName, opts);
        }
    }
    /**
     * get a data source instance
     * @param dataSourceName
     */
    getDataSource(dataSourceName) {
        return this.dataSource.get(dataSourceName);
    }
    /**
     * check data source has exists
     * @param dataSourceName
     */
    hasDataSource(dataSourceName) {
        return this.dataSource.has(dataSourceName);
    }
    getDataSourceNames() {
        return Array.from(this.dataSource.keys());
    }
    getAllDataSources() {
        return this.dataSource;
    }
    /**
     * check the data source is connected
     * @param dataSourceName
     */
    async isConnected(dataSourceName) {
        const inst = this.getDataSource(dataSourceName);
        return inst ? this.checkConnected(inst) : false;
    }
    async createInstance(config, clientName, options) {
        const cache = options && typeof options.cacheInstance === 'boolean'
            ? options.cacheInstance
            : true;
        const validateConnection = (options && options.validateConnection) || false;
        // options.clients[id] will be merged with options.default
        const configNow = (0, extend_1.extend)(true, {}, this.options['default'], config);
        const client = await this.createDataSource(configNow, clientName);
        if (cache && clientName && client) {
            this.dataSource.set(clientName, client);
        }
        if (validateConnection) {
            if (!client) {
                throw new error_1.MidwayCommonError(`[DataSourceManager] ${clientName} initialization failed.`);
            }
            const connected = await this.checkConnected(client);
            if (!connected) {
                throw new error_1.MidwayCommonError(`[DataSourceManager] ${clientName} is not connected.`);
            }
        }
        return client;
    }
    /**
     * get data source name by model or repository
     * @param modelOrRepository
     */
    getDataSourceNameByModel(modelOrRepository) {
        return this.modelMapping.get(modelOrRepository);
    }
    /**
     * Call destroyDataSource() on all data sources
     */
    async stop() {
        const arr = Array.from(this.dataSource.values());
        await Promise.all(arr.map(dbh => {
            return this.destroyDataSource(dbh);
        }));
        this.dataSource.clear();
    }
    getDefaultDataSourceName() {
        if (this.innerDefaultDataSourceName === undefined) {
            if (this.options['defaultDataSourceName']) {
                this.innerDefaultDataSourceName = this.options['defaultDataSourceName'];
            }
            else if (this.dataSource.size === 1) {
                // Set the default source name when there is only one data source
                this.innerDefaultDataSourceName = Array.from(this.dataSource.keys())[0];
            }
            else {
                // Set empty string for cache
                this.innerDefaultDataSourceName = '';
            }
        }
        return this.innerDefaultDataSourceName;
    }
    getDataSourcePriority(name) {
        return this.priorityManager.getPriority(this.dataSourcePriority[name]);
    }
    isHighPriority(name) {
        return this.priorityManager.isHighPriority(this.dataSourcePriority[name]);
    }
    isMediumPriority(name) {
        return this.priorityManager.isMediumPriority(this.dataSourcePriority[name]);
    }
    isLowPriority(name) {
        return this.priorityManager.isLowPriority(this.dataSourcePriority[name]);
    }
}
__decorate([
    (0, decorator_1.Inject)(),
    __metadata("design:type", String)
], DataSourceManager.prototype, "appDir", void 0);
__decorate([
    (0, decorator_1.Inject)(),
    __metadata("design:type", environmentService_1.MidwayEnvironmentService)
], DataSourceManager.prototype, "environmentService", void 0);
__decorate([
    (0, decorator_1.Inject)(),
    __metadata("design:type", priorityManager_1.MidwayPriorityManager)
], DataSourceManager.prototype, "priorityManager", void 0);
exports.DataSourceManager = DataSourceManager;
function formatGlobString(globString) {
    let pattern;
    if (!/^\*/.test(globString)) {
        globString = '/' + globString;
    }
    const parsePattern = (0, path_1.parse)(globString);
    if (parsePattern.base && (/\*/.test(parsePattern.base) || parsePattern.ext)) {
        pattern = [globString];
    }
    else {
        pattern = [...constants_1.DEFAULT_PATTERN.map(p => (0, path_1.join)(globString, p))];
    }
    return pattern;
}
exports.formatGlobString = formatGlobString;
async function globModels(globString, appDir, loadMode) {
    const pattern = formatGlobString(globString);
    const models = [];
    // string will be glob file
    const files = (0, glob_1.run)(pattern, {
        cwd: appDir,
        ignore: constants_1.IGNORE_PATTERN,
    });
    for (const file of files) {
        const exports = await (0, util_2.loadModule)(file, {
            loadMode,
        });
        if (types_1.Types.isClass(exports)) {
            models.push(exports);
        }
        else {
            for (const m in exports) {
                const module = exports[m];
                if (types_1.Types.isClass(module)) {
                    models.push(module);
                }
            }
        }
    }
    return models;
}
exports.globModels = globModels;
//# sourceMappingURL=dataSourceManager.js.map

/***/ }),

/***/ 1207:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CustomModuleDetector = exports.ESModuleFileDetector = exports.CommonJSFileDetector = exports.AbstractFileDetector = void 0;
const types_1 = __nccwpck_require__(3171);
const glob_1 = __nccwpck_require__(266);
const error_1 = __nccwpck_require__(6248);
const constants_1 = __nccwpck_require__(7404);
const decorator_1 = __nccwpck_require__(8351);
const util_1 = __nccwpck_require__(6110);
class AbstractFileDetector {
    constructor(options) {
        this.options = options;
        this.extraDetectorOptions = {};
    }
    setExtraDetectorOptions(detectorOptions) {
        this.extraDetectorOptions = detectorOptions;
    }
}
exports.AbstractFileDetector = AbstractFileDetector;
const DEFAULT_GLOB_PATTERN = ['**/**.tsx'].concat(constants_1.DEFAULT_PATTERN);
const DEFAULT_IGNORE_PATTERN = [
    '**/logs/**',
    '**/run/**',
    '**/public/**',
    '**/app/view/**',
    '**/app/views/**',
    '**/app/extend/**',
    '**/node_modules/**',
    '**/**.test.ts',
    '**/**.test.js',
    '**/__test__/**',
].concat(constants_1.IGNORE_PATTERN);
/**
 * CommonJS module loader
 */
class CommonJSFileDetector extends AbstractFileDetector {
    constructor() {
        super(...arguments);
        this.duplicateModuleCheckSet = new Map();
    }
    run(container) {
        if (this.getType() === 'commonjs') {
            return this.loadSync(container);
        }
        else {
            return this.loadAsync(container);
        }
    }
    loadSync(container) {
        var _a;
        this.options = this.options || {};
        const loadDirs = [].concat((_a = this.options.loadDir) !== null && _a !== void 0 ? _a : container.get('baseDir'));
        for (const dir of loadDirs) {
            const fileResults = (0, glob_1.run)(DEFAULT_GLOB_PATTERN.concat(this.options.pattern || []).concat(this.extraDetectorOptions.pattern || []), {
                cwd: dir,
                ignore: DEFAULT_IGNORE_PATTERN.concat(this.options.ignore || []).concat(this.extraDetectorOptions.ignore || []),
            });
            // 检查重复模块
            const checkDuplicatedHandler = (module, options) => {
                if ((this.options.conflictCheck ||
                    this.extraDetectorOptions.conflictCheck) &&
                    types_1.Types.isClass(module)) {
                    const name = (0, decorator_1.getProviderName)(module);
                    if (name) {
                        if (this.duplicateModuleCheckSet.has(name)) {
                            throw new error_1.MidwayDuplicateClassNameError(name, options.srcPath, this.duplicateModuleCheckSet.get(name));
                        }
                        else {
                            this.duplicateModuleCheckSet.set(name, options.srcPath);
                        }
                    }
                }
            };
            for (const file of fileResults) {
                const exports = require(file);
                // add module to set
                container.bindClass(exports, {
                    namespace: this.options.namespace,
                    srcPath: file,
                    createFrom: 'file',
                    bindHook: checkDuplicatedHandler,
                });
            }
        }
        // check end
        this.duplicateModuleCheckSet.clear();
    }
    async loadAsync(container) {
        var _a;
        this.options = this.options || {};
        const loadDirs = [].concat((_a = this.options.loadDir) !== null && _a !== void 0 ? _a : container.get('baseDir'));
        for (const dir of loadDirs) {
            const fileResults = (0, glob_1.run)(DEFAULT_GLOB_PATTERN.concat(this.options.pattern || []).concat(this.extraDetectorOptions.pattern || []), {
                cwd: dir,
                ignore: DEFAULT_IGNORE_PATTERN.concat(this.options.ignore || []).concat(this.extraDetectorOptions.ignore || []),
            });
            // 检查重复模块
            const checkDuplicatedHandler = (module, options) => {
                if ((this.options.conflictCheck ||
                    this.extraDetectorOptions.conflictCheck) &&
                    types_1.Types.isClass(module)) {
                    const name = (0, decorator_1.getProviderName)(module);
                    if (name) {
                        if (this.duplicateModuleCheckSet.has(name)) {
                            throw new error_1.MidwayDuplicateClassNameError(name, options.srcPath, this.duplicateModuleCheckSet.get(name));
                        }
                        else {
                            this.duplicateModuleCheckSet.set(name, options.srcPath);
                        }
                    }
                }
            };
            for (const file of fileResults) {
                const exports = await (0, util_1.loadModule)(file, {
                    loadMode: 'esm',
                });
                // add module to set
                container.bindClass(exports, {
                    namespace: this.options.namespace,
                    srcPath: file,
                    createFrom: 'file',
                    bindHook: checkDuplicatedHandler,
                });
            }
        }
        // check end
        this.duplicateModuleCheckSet.clear();
    }
    getType() {
        return 'commonjs';
    }
}
exports.CommonJSFileDetector = CommonJSFileDetector;
/**
 * ES module loader
 */
class ESModuleFileDetector extends CommonJSFileDetector {
    getType() {
        return 'module';
    }
}
exports.ESModuleFileDetector = ESModuleFileDetector;
class CustomModuleDetector extends AbstractFileDetector {
    async run(container) {
        for (const module of this.options.modules) {
            container.bindClass(module, {
                namespace: this.options.namespace,
                createFrom: 'module',
            });
        }
    }
}
exports.CustomModuleDetector = CustomModuleDetector;
//# sourceMappingURL=fileDetector.js.map

/***/ }),

/***/ 3762:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FilterManager = void 0;
const decorator_1 = __nccwpck_require__(8351);
const util_1 = __nccwpck_require__(6110);
class FilterManager {
    constructor() {
        this.errFilterList = [];
        this.successFilterList = [];
        this.exceptionMap = new WeakMap();
        this.defaultErrFilter = undefined;
        this.matchFnList = [];
        this.protoMatchList = [];
    }
    useFilter(Filters) {
        if (!Array.isArray(Filters)) {
            Filters = [Filters];
        }
        for (const Filter of Filters) {
            if ((0, decorator_1.getClassMetadata)(decorator_1.CATCH_KEY, Filter)) {
                this.errFilterList.push(Filter);
            }
            if ((0, decorator_1.getClassMetadata)(decorator_1.MATCH_KEY, Filter)) {
                this.successFilterList.push(Filter);
            }
        }
    }
    async init(applicationContext) {
        // for catch exception
        for (const FilterClass of this.errFilterList) {
            const filter = await applicationContext.getAsync(FilterClass);
            const exceptionMetadata = (0, decorator_1.getClassMetadata)(decorator_1.CATCH_KEY, FilterClass);
            if (exceptionMetadata && exceptionMetadata.catchTargets) {
                exceptionMetadata.catchOptions = exceptionMetadata.catchOptions || {};
                for (const Exception of exceptionMetadata.catchTargets) {
                    this.exceptionMap.set(Exception, {
                        filter,
                        catchOptions: exceptionMetadata.catchOptions,
                    });
                    if (exceptionMetadata.catchOptions['matchPrototype']) {
                        this.protoMatchList.push(err => {
                            if (err instanceof Exception) {
                                return Exception;
                            }
                            else {
                                return false;
                            }
                        });
                    }
                }
            }
            else {
                // default filter
                this.defaultErrFilter = filter;
            }
        }
        // for success return
        for (const FilterClass of this.successFilterList) {
            const filter = await applicationContext.getAsync(FilterClass);
            const matchMetadata = (0, decorator_1.getClassMetadata)(decorator_1.MATCH_KEY, FilterClass);
            if (matchMetadata && matchMetadata.matchPattern) {
                this.matchFnList.push({
                    matchFn: (0, util_1.toPathMatch)(matchMetadata.matchPattern),
                    target: filter,
                });
            }
        }
    }
    async runErrorFilter(err, ctx, res, next) {
        let result, error;
        let matched = false;
        if (this.exceptionMap.has(err.constructor)) {
            matched = true;
            const filterData = this.exceptionMap.get(err.constructor);
            result = await filterData.filter.catch(err, ctx, res, next);
        }
        // match with prototype
        if (!matched && this.protoMatchList.length) {
            let protoException;
            for (const matchPattern of this.protoMatchList) {
                protoException = matchPattern(err);
                if (protoException) {
                    break;
                }
            }
            if (protoException) {
                matched = true;
                const filterData = this.exceptionMap.get(protoException);
                result = await filterData.filter.catch(err, ctx, res, next);
            }
        }
        if (!matched && this.defaultErrFilter) {
            matched = true;
            result = await this.defaultErrFilter.catch(err, ctx, res, next);
        }
        if (!matched) {
            error = err;
        }
        return {
            result,
            error,
        };
    }
    async runResultFilter(result, ctx, res, next) {
        let returnValue = result;
        for (const matchData of this.matchFnList) {
            if (matchData.matchFn(ctx, res)) {
                returnValue = await matchData.target.match(returnValue, ctx, res, next);
            }
        }
        return {
            result: returnValue,
            error: undefined,
        };
    }
}
exports.FilterManager = FilterManager;
//# sourceMappingURL=filterManager.js.map

/***/ }),

/***/ 1347:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GuardManager = void 0;
const decorator_1 = __nccwpck_require__(8351);
class GuardManager extends Array {
    addGlobalGuard(guards) {
        if (!Array.isArray(guards)) {
            this.push(guards);
        }
        else {
            this.push(...guards);
        }
    }
    async runGuard(ctx, supplierClz, methodName) {
        // check global guard
        for (const Guard of this) {
            const guard = await ctx.requestContext.getAsync(Guard);
            const isPassed = await guard.canActivate(ctx, supplierClz, methodName);
            if (!isPassed) {
                return false;
            }
        }
        // check class Guard
        const classGuardList = (0, decorator_1.getClassMetadata)(decorator_1.GUARD_KEY, supplierClz);
        if (classGuardList) {
            for (const Guard of classGuardList) {
                const guard = await ctx.requestContext.getAsync(Guard);
                const isPassed = await guard.canActivate(ctx, supplierClz, methodName);
                if (!isPassed) {
                    return false;
                }
            }
        }
        // check method Guard
        const methodGuardList = (0, decorator_1.getPropertyMetadata)(decorator_1.GUARD_KEY, supplierClz, methodName);
        if (methodGuardList) {
            for (const Guard of methodGuardList) {
                const guard = await ctx.requestContext.getAsync(Guard);
                const isPassed = await guard.canActivate(ctx, supplierClz, methodName);
                if (!isPassed) {
                    return false;
                }
            }
        }
        return true;
    }
}
exports.GuardManager = GuardManager;
//# sourceMappingURL=guardManager.js.map

/***/ }),

/***/ 4853:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DefaultConsoleLoggerFactory = exports.LoggerFactory = void 0;
class LoggerFactory {
}
exports.LoggerFactory = LoggerFactory;
class DefaultConsoleLoggerFactory {
    constructor() {
        this.instance = new Map();
    }
    createLogger(name, options) {
        this.instance.set(name, console);
        return console;
    }
    getLogger(loggerName) {
        return this.instance.get(loggerName);
    }
    close(loggerName) { }
    removeLogger(loggerName) { }
    getDefaultMidwayLoggerConfig() {
        return {
            midwayLogger: {
                default: {},
                clients: {
                    coreLogger: {},
                    appLogger: {},
                },
            },
        };
    }
    createContextLogger(ctx, appLogger, contextOptions) {
        return appLogger;
    }
    getClients() {
        return this.instance;
    }
    getClientKeys() {
        return Array.from(this.instance.keys());
    }
}
exports.DefaultConsoleLoggerFactory = DefaultConsoleLoggerFactory;
//# sourceMappingURL=loggerFactory.js.map

/***/ }),

/***/ 1044:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createMiddleware = exports.ContextMiddlewareManager = void 0;
class ContextMiddlewareManager extends Array {
    /**
     * insert a middleware or middleware array to first
     * @param middleware
     */
    insertFirst(middleware) {
        if (Array.isArray(middleware)) {
            this.unshift(...middleware);
        }
        else {
            this.unshift(middleware);
        }
    }
    /**
     * insert a middleware or middleware array to last
     * @param middleware
     */
    insertLast(middleware) {
        if (Array.isArray(middleware)) {
            this.push(...middleware);
        }
        else {
            this.push(middleware);
        }
    }
    /**
     * insert a middleware or middleware array to after another middleware
     * @param middleware
     * @param idxOrBeforeMiddleware
     */
    insertBefore(middleware, idxOrBeforeMiddleware) {
        if (typeof idxOrBeforeMiddleware !== 'number') {
            idxOrBeforeMiddleware = this.findItemIndex(idxOrBeforeMiddleware);
        }
        if (Array.isArray(middleware)) {
            this.splice(idxOrBeforeMiddleware, 0, ...middleware);
        }
        else {
            this.splice(idxOrBeforeMiddleware, 0, middleware);
        }
    }
    /**
     * insert a middleware or middleware array to after another middleware
     * @param middleware
     * @param idxOrAfterMiddleware
     */
    insertAfter(middleware, idxOrAfterMiddleware) {
        if (typeof idxOrAfterMiddleware !== 'number') {
            idxOrAfterMiddleware = this.findItemIndex(idxOrAfterMiddleware);
        }
        if (Array.isArray(middleware)) {
            this.splice(idxOrAfterMiddleware + 1, 0, ...middleware);
        }
        else {
            this.splice(idxOrAfterMiddleware + 1, 0, middleware);
        }
    }
    /**
     * move a middleware after another middleware
     * @param middlewareOrName
     * @param afterMiddleware
     */
    findAndInsertAfter(middlewareOrName, afterMiddleware) {
        middlewareOrName = this.findItem(middlewareOrName);
        afterMiddleware = this.findItem(afterMiddleware);
        if (!middlewareOrName ||
            !afterMiddleware ||
            middlewareOrName === afterMiddleware) {
            return;
        }
        if (afterMiddleware) {
            const mw = this.remove(middlewareOrName);
            if (mw) {
                this.insertAfter(mw, afterMiddleware);
            }
        }
    }
    /**
     * move a middleware before another middleware
     * @param middlewareOrName
     * @param beforeMiddleware
     */
    findAndInsertBefore(middlewareOrName, beforeMiddleware) {
        middlewareOrName = this.findItem(middlewareOrName);
        beforeMiddleware = this.findItem(beforeMiddleware);
        if (!middlewareOrName ||
            !beforeMiddleware ||
            middlewareOrName === beforeMiddleware) {
            return;
        }
        if (beforeMiddleware) {
            const mw = this.remove(middlewareOrName);
            if (mw) {
                this.insertBefore(mw, beforeMiddleware);
            }
        }
    }
    /**
     * find middleware and move to first
     * @param middlewareOrName
     */
    findAndInsertFirst(middlewareOrName) {
        const mw = this.remove(middlewareOrName);
        if (mw) {
            this.insertFirst(mw);
        }
    }
    /**
     * find middleware and move to last
     * @param middlewareOrName
     */
    findAndInsertLast(middlewareOrName) {
        const mw = this.remove(middlewareOrName);
        if (mw) {
            this.insertLast(mw);
        }
    }
    /**
     * find a middleware and return index
     * @param middlewareOrName
     */
    findItemIndex(middlewareOrName) {
        if (typeof middlewareOrName === 'number') {
            return middlewareOrName;
        }
        else if (typeof middlewareOrName === 'string') {
            return this.findIndex(item => this.getMiddlewareName(item) === middlewareOrName);
        }
        else {
            return this.findIndex(item => item === middlewareOrName);
        }
    }
    findItem(middlewareOrName) {
        if (typeof middlewareOrName === 'number') {
            if (middlewareOrName >= 0 && middlewareOrName <= this.length - 1) {
                return this[middlewareOrName];
            }
        }
        else if (typeof middlewareOrName === 'string') {
            return this.find(item => this.getMiddlewareName(item) === middlewareOrName);
        }
        else {
            return middlewareOrName;
        }
    }
    /**
     * get name from middleware
     * @param middleware
     */
    getMiddlewareName(middleware) {
        var _a, _b, _c;
        if (middleware['middleware']) {
            return ((_a = middleware.name) !== null && _a !== void 0 ? _a : this.getMiddlewareName(middleware['middleware']));
        }
        return ((_c = (_b = (middleware.getName && middleware.getName())) !== null && _b !== void 0 ? _b : middleware._name) !== null && _c !== void 0 ? _c : middleware.name);
    }
    /**
     * remove a middleware
     * @param middlewareOrNameOrIdx
     */
    remove(middlewareOrNameOrIdx) {
        if (typeof middlewareOrNameOrIdx === 'number' &&
            middlewareOrNameOrIdx !== -1) {
            return this.splice(middlewareOrNameOrIdx, 1)[0];
        }
        else {
            const idx = this.findItemIndex(middlewareOrNameOrIdx);
            if (idx !== -1) {
                return this.splice(idx, 1)[0];
            }
        }
    }
    push(...items) {
        items.forEach(item => {
            if (typeof item !== 'string' && !this.getMiddlewareName(item)) {
                item._name = 'anonymous';
            }
        });
        return super.push(...items);
    }
    unshift(...items) {
        items.forEach(item => {
            if (typeof item !== 'string' && !this.getMiddlewareName(item)) {
                item._name = 'anonymous';
            }
        });
        return super.unshift(...items);
    }
    /**
     * get middleware name list
     */
    getNames() {
        return this.map(item => {
            return this.getMiddlewareName(item);
        });
    }
}
exports.ContextMiddlewareManager = ContextMiddlewareManager;
/**
 * wrap a middleware with options and composition a new middleware
 */
function createMiddleware(middleware, options, name) {
    return {
        middleware,
        options,
        name,
    };
}
exports.createMiddleware = createMiddleware;
//# sourceMappingURL=middlewareManager.js.map

/***/ }),

/***/ 4334:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MidwayInitializerPerformanceManager = exports.MidwayPerformanceManager = void 0;
const perf_hooks_1 = __nccwpck_require__(2987);
class MidwayPerformanceManager {
    constructor(group) {
        this.group = group;
        this.observer = null;
        this.marks = new Set();
        this.measures = new Set();
    }
    static getInstance(group) {
        if (!this.instances.has(group)) {
            this.instances.set(group, new MidwayPerformanceManager(group));
        }
        return this.instances.get(group);
    }
    formatKey(key, step) {
        return `${this.group}:${key}-${step}`;
    }
    markStart(key) {
        const markKey = this.formatKey(key, 'start');
        perf_hooks_1.performance.mark(markKey);
        this.marks.add(markKey);
    }
    markEnd(key) {
        const startKey = this.formatKey(key, 'start');
        const endKey = this.formatKey(key, 'end');
        const measureKey = `${this.group}:${key}`;
        perf_hooks_1.performance.mark(endKey);
        this.marks.add(endKey);
        perf_hooks_1.performance.measure(measureKey, startKey, endKey);
        this.measures.add(measureKey);
    }
    observeMeasure(callback) {
        if (this.observer) {
            return;
        }
        this.observer = new perf_hooks_1.PerformanceObserver(list => {
            const filteredEntries = list
                .getEntries()
                .filter(entry => entry.name.startsWith(`${this.group}:`));
            if (filteredEntries.length > 0) {
                callback({
                    getEntries: () => filteredEntries,
                });
            }
        });
        this.observer.observe({ entryTypes: ['measure'] });
        return this.observer;
    }
    disconnect() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }
    clean() {
        this.marks.forEach(mark => {
            try {
                perf_hooks_1.performance.clearMarks(mark);
            }
            catch (error) {
                console.warn(`Failed to clear mark ${mark}: ${error}`);
            }
        });
        this.marks.clear();
        this.measures.forEach(measure => {
            try {
                perf_hooks_1.performance.clearMeasures(measure);
            }
            catch (error) {
                console.warn(`Failed to clear measure ${measure}: ${error}`);
            }
        });
        this.measures.clear();
        this.disconnect();
    }
    static cleanAll() {
        this.instances.forEach(instance => instance.clean());
        this.instances.clear();
    }
    static getInitialPerformanceEntries() {
        const entries = [];
        perf_hooks_1.performance === null || perf_hooks_1.performance === void 0 ? void 0 : perf_hooks_1.performance.getEntries().forEach(entry => {
            if (entry.name.startsWith(this.DEFAULT_GROUP.INITIALIZE)) {
                entries.push(entry.toJSON());
            }
        });
        return entries;
    }
}
exports.MidwayPerformanceManager = MidwayPerformanceManager;
MidwayPerformanceManager.instances = new Map();
MidwayPerformanceManager.DEFAULT_GROUP = {
    INITIALIZE: 'MidwayInitialize',
};
class MidwayInitializerPerformanceManager {
    static markStart(key) {
        const manager = MidwayPerformanceManager.getInstance(MidwayPerformanceManager.DEFAULT_GROUP.INITIALIZE);
        manager.markStart(key);
    }
    static markEnd(key) {
        const manager = MidwayPerformanceManager.getInstance(MidwayPerformanceManager.DEFAULT_GROUP.INITIALIZE);
        manager.markEnd(key);
    }
    static frameworkInitializeStart(frameworkName) {
        this.markStart(`${this.MEASURE_KEYS.FRAMEWORK_INITIALIZE}:${frameworkName}`);
    }
    static frameworkInitializeEnd(frameworkName) {
        this.markEnd(`${this.MEASURE_KEYS.FRAMEWORK_INITIALIZE}:${frameworkName}`);
    }
    static frameworkRunStart(frameworkName) {
        this.markStart(`${this.MEASURE_KEYS.FRAMEWORK_RUN}:${frameworkName}`);
    }
    static frameworkRunEnd(frameworkName) {
        this.markEnd(`${this.MEASURE_KEYS.FRAMEWORK_RUN}:${frameworkName}`);
    }
    static lifecycleStart(namespace, lifecycleName) {
        this.markStart(`${this.MEASURE_KEYS.LIFECYCLE_PREPARE}:${namespace}:${lifecycleName}`);
    }
    static lifecycleEnd(namespace, lifecycleName) {
        this.markEnd(`${this.MEASURE_KEYS.LIFECYCLE_PREPARE}:${namespace}:${lifecycleName}`);
    }
}
exports.MidwayInitializerPerformanceManager = MidwayInitializerPerformanceManager;
MidwayInitializerPerformanceManager.MEASURE_KEYS = {
    INITIALIZE: 'Initialize',
    METADATA_PREPARE: 'MetadataPrepare',
    DETECTOR_PREPARE: 'DetectorPrepare',
    DEFINITION_PREPARE: 'DefinitionPrepare',
    CONFIG_LOAD: 'ConfigLoad',
    LOGGER_PREPARE: 'LoggerPrepare',
    FRAMEWORK_PREPARE: 'FrameworkPrepare',
    FRAMEWORK_INITIALIZE: 'FrameworkInitialize',
    FRAMEWORK_RUN: 'FrameworkRun',
    LIFECYCLE_PREPARE: 'LifecyclePrepare',
    PRELOAD_MODULE_PREPARE: 'PreloadModulePrepare',
};
//# sourceMappingURL=performanceManager.js.map

/***/ }),

/***/ 340:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MidwayPriorityManager = exports.DEFAULT_PRIORITY = void 0;
const decorator_1 = __nccwpck_require__(8351);
const interface_1 = __nccwpck_require__(7270);
exports.DEFAULT_PRIORITY = {
    L1: 'High',
    L2: 'Medium',
    L3: 'Low',
};
let MidwayPriorityManager = class MidwayPriorityManager {
    constructor() {
        this.priorityList = exports.DEFAULT_PRIORITY;
        this.defaultPriority = exports.DEFAULT_PRIORITY.L2;
    }
    getCurrentPriorityList() {
        return this.priorityList;
    }
    getDefaultPriority() {
        return this.defaultPriority;
    }
    isHighPriority(priority = exports.DEFAULT_PRIORITY.L2) {
        return priority === exports.DEFAULT_PRIORITY.L1;
    }
    isMediumPriority(priority = exports.DEFAULT_PRIORITY.L2) {
        return priority === exports.DEFAULT_PRIORITY.L2;
    }
    isLowPriority(priority = exports.DEFAULT_PRIORITY.L2) {
        return priority === exports.DEFAULT_PRIORITY.L3;
    }
    getPriority(priority) {
        return priority || this.getDefaultPriority();
    }
};
MidwayPriorityManager = __decorate([
    (0, decorator_1.Provide)(),
    (0, decorator_1.Scope)(interface_1.ScopeEnum.Singleton)
], MidwayPriorityManager);
exports.MidwayPriorityManager = MidwayPriorityManager;
//# sourceMappingURL=priorityManager.js.map

/***/ }),

/***/ 7940:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ServiceFactory = void 0;
const extend_1 = __nccwpck_require__(428);
const priorityManager_1 = __nccwpck_require__(340);
const decorator_1 = __nccwpck_require__(8351);
/**
 * 多客户端工厂实现
 */
class ServiceFactory {
    constructor() {
        this.clients = new Map();
        this.options = {};
    }
    async initClients(options = {}) {
        this.options = options;
        // merge options.client to options.clients['default']
        if (options.client) {
            options.clients = options.clients || {};
            options.clients['default'] = options.clients['default'] || {};
            (0, extend_1.extend)(true, options.clients['default'], options.client);
        }
        // multi client
        if (options.clients) {
            for (const id of Object.keys(options.clients)) {
                await this.createInstance(options.clients[id], id);
            }
        }
        // set priority
        this.clientPriority = options.priority || {};
    }
    get(id = 'default') {
        return this.clients.get(id);
    }
    has(id) {
        return this.clients.has(id);
    }
    async createInstance(config, clientName) {
        // options.default will be merge in to options.clients[id]
        config = (0, extend_1.extend)(true, {}, this.options['default'], config);
        const client = await this.createClient(config, clientName);
        if (client) {
            if (clientName) {
                this.clients.set(clientName, client);
            }
            return client;
        }
    }
    async destroyClient(client, clientName) { }
    async stop() {
        for (const [name, value] of this.clients.entries()) {
            await this.destroyClient(value, name);
        }
    }
    getDefaultClientName() {
        return this.options['defaultClientName'];
    }
    getClients() {
        return this.clients;
    }
    getClientKeys() {
        return Array.from(this.clients.keys());
    }
    getClientPriority(name) {
        return this.priorityManager.getPriority(this.clientPriority[name]);
    }
    isHighPriority(name) {
        return this.priorityManager.isHighPriority(this.clientPriority[name]);
    }
    isMediumPriority(name) {
        return this.priorityManager.isMediumPriority(this.clientPriority[name]);
    }
    isLowPriority(name) {
        return this.priorityManager.isLowPriority(this.clientPriority[name]);
    }
}
__decorate([
    (0, decorator_1.Inject)(),
    __metadata("design:type", priorityManager_1.MidwayPriorityManager)
], ServiceFactory.prototype, "priorityManager", void 0);
exports.ServiceFactory = ServiceFactory;
//# sourceMappingURL=serviceFactory.js.map

/***/ }),

/***/ 3924:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TypedResourceManager = void 0;
class TypedResourceManager {
    constructor(typedResourceInitializerOptions) {
        this.typedResourceInitializerOptions = typedResourceInitializerOptions;
        this.resourceMap = new Map();
        this.resourceBindingMap = new Map();
    }
    async createResource(resourceName, resourceInitializeConfig) {
        const resource = await this.typedResourceInitializerOptions.resourceInitialize(resourceInitializeConfig, resourceName);
        this.resourceMap.set(resourceName, resource);
        return resource;
    }
    async init() {
        for (const resourceName of Object.keys(this.typedResourceInitializerOptions.initializeValue)) {
            const resourceInitializeConfig = this.typedResourceInitializerOptions.initializeValue[resourceName];
            const ClzProvider = this.typedResourceInitializerOptions.initializeClzProvider[resourceName];
            const resource = await this.createResource(resourceName, resourceInitializeConfig);
            const bindingResult = await this.typedResourceInitializerOptions.resourceBinding(ClzProvider, resourceInitializeConfig, resource, resourceName);
            if (bindingResult) {
                this.resourceBindingMap.set(resourceName, bindingResult);
            }
        }
    }
    async startParallel() {
        const startPromises = [];
        for (const [resourceName, resource] of this.resourceMap.entries()) {
            startPromises.push(this.typedResourceInitializerOptions.resourceStart(resource, this.typedResourceInitializerOptions.initializeValue[resourceName], this.resourceBindingMap.get(resourceName)));
        }
        await Promise.all(startPromises);
    }
    async start() {
        for (const [resourceName, resource] of this.resourceMap.entries()) {
            await this.typedResourceInitializerOptions.resourceStart(resource, this.typedResourceInitializerOptions.initializeValue[resourceName], this.resourceBindingMap.get(resourceName));
        }
    }
    async destroyParallel() {
        const destroyPromises = [];
        for (const [resourceName, resource] of this.resourceMap.entries()) {
            destroyPromises.push(this.typedResourceInitializerOptions.resourceDestroy(resource, this.typedResourceInitializerOptions.initializeValue[resourceName]));
        }
        await Promise.all(destroyPromises);
    }
    async destroy() {
        for (const [resourceName, resource] of this.resourceMap.entries()) {
            await this.typedResourceInitializerOptions.resourceDestroy(resource, this.typedResourceInitializerOptions.initializeValue[resourceName]);
        }
        this.resourceMap.clear();
        this.resourceBindingMap.clear();
    }
    getResource(resourceName) {
        return this.resourceMap.get(resourceName);
    }
}
exports.TypedResourceManager = TypedResourceManager;
//# sourceMappingURL=typedResourceManager.js.map

/***/ }),

/***/ 2888:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WebControllerGenerator = void 0;
/**
 * wrap controller string to middleware function
 * @param controllerMapping like FooController.index
 * @param routeArgsInfo
 * @param routerResponseData
 */
const decorator_1 = __nccwpck_require__(8351);
const util = __nccwpck_require__(9023);
const interface_1 = __nccwpck_require__(7270);
const error_1 = __nccwpck_require__(6248);
const middlewareService_1 = __nccwpck_require__(6134);
const debug = util.debuglog('midway:debug');
class WebControllerGenerator {
    constructor(app, midwayWebRouterService) {
        this.app = app;
        this.midwayWebRouterService = midwayWebRouterService;
    }
    /**
     * wrap controller string to middleware function
     * @param routeInfo
     */
    generateKoaController(routeInfo) {
        return async (ctx, next) => {
            if (routeInfo.controllerClz && typeof routeInfo.method === 'string') {
                const isPassed = await this.app
                    .getFramework()
                    .runGuard(ctx, routeInfo.controllerClz, routeInfo.method);
                if (!isPassed) {
                    throw new error_1.httpError.ForbiddenError();
                }
            }
            const args = [ctx, next];
            let result;
            if (typeof routeInfo.method !== 'string') {
                result = await routeInfo.method(ctx, next);
            }
            else {
                const controller = await ctx.requestContext.getAsync(routeInfo.id);
                // eslint-disable-next-line prefer-spread
                result = await controller[routeInfo.method].apply(controller, args);
            }
            if (result !== undefined) {
                if (result === null) {
                    // 这样设置可以绕过 koa 的 _explicitStatus 赋值机制
                    ctx.response._body = null;
                    ctx.response._midwayControllerNullBody = true;
                }
                else {
                    ctx.body = result;
                }
            }
            // implement response decorator
            if (Array.isArray(routeInfo.responseMetadata) &&
                routeInfo.responseMetadata.length) {
                for (const routerRes of routeInfo.responseMetadata) {
                    switch (routerRes.type) {
                        case decorator_1.WEB_RESPONSE_HTTP_CODE:
                            ctx.status = routerRes.code;
                            break;
                        case decorator_1.WEB_RESPONSE_HEADER:
                            for (const key in (routerRes === null || routerRes === void 0 ? void 0 : routerRes.setHeaders) || {}) {
                                ctx.set(key, routerRes.setHeaders[key]);
                            }
                            break;
                        case decorator_1.WEB_RESPONSE_CONTENT_TYPE:
                            ctx.type = routerRes.contentType;
                            break;
                        case decorator_1.WEB_RESPONSE_REDIRECT:
                            ctx.status = routerRes.code;
                            ctx.redirect(routerRes.url);
                            return;
                    }
                }
            }
        };
    }
    async loadMidwayController(routerHandler) {
        var _a, _b;
        const routerTable = await this.midwayWebRouterService.getRouterTable();
        const routerList = await this.midwayWebRouterService.getRoutePriorityList();
        const applicationContext = this.app.getApplicationContext();
        const logger = this.app.getCoreLogger();
        const middlewareService = applicationContext.get(middlewareService_1.MidwayMiddlewareService);
        for (const routerInfo of routerList) {
            // bind controller first
            applicationContext.bindClass(routerInfo.routerModule);
            logger.debug(`Load Controller "${routerInfo.controllerId}", prefix=${routerInfo.prefix}`);
            debug(`[core]: Load Controller "${routerInfo.controllerId}", prefix=${routerInfo.prefix}`);
            // new router
            const newRouter = this.createRouter({
                prefix: routerInfo.prefix,
                ...routerInfo.routerOptions,
            });
            // add router middleware
            routerInfo.middleware = (_a = routerInfo.middleware) !== null && _a !== void 0 ? _a : [];
            if (routerInfo.middleware.length) {
                const routerMiddlewareFn = await middlewareService.compose(routerInfo.middleware, this.app);
                newRouter.use(routerMiddlewareFn);
            }
            // add route
            const routes = routerTable.get(routerInfo.prefix);
            for (const routeInfo of routes) {
                // get middleware
                const methodMiddlewares = [];
                routeInfo.middleware = (_b = routeInfo.middleware) !== null && _b !== void 0 ? _b : [];
                if (routeInfo.middleware.length) {
                    const routeMiddlewareFn = await middlewareService.compose(routeInfo.middleware, this.app);
                    methodMiddlewares.push(routeMiddlewareFn);
                }
                if (this.app.getFrameworkType() === interface_1.MidwayFrameworkType.WEB_KOA) {
                    // egg use path-to-regexp v1 but koa use v6
                    if (typeof routeInfo.url === 'string' && /\*$/.test(routeInfo.url)) {
                        routeInfo.url = routeInfo.url.replace('*', '(.*)');
                    }
                }
                const routerArgs = [
                    routeInfo.routerName,
                    routeInfo.url,
                    ...methodMiddlewares,
                    this.generateController(routeInfo),
                ];
                logger.debug(`Load Router "${routeInfo.requestMethod.toUpperCase()} ${routeInfo.url}"`);
                debug(`[core]: Load Router "${routeInfo.requestMethod.toUpperCase()} ${routeInfo.url}"`);
                // apply controller from request context
                // eslint-disable-next-line prefer-spread
                newRouter[routeInfo.requestMethod.toLowerCase()].apply(newRouter, routerArgs);
            }
            routerHandler && routerHandler(newRouter);
        }
    }
}
exports.WebControllerGenerator = WebControllerGenerator;
//# sourceMappingURL=webGenerator.js.map

/***/ }),

/***/ 9211:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const util_1 = __nccwpck_require__(6110);
exports["default"] = (appInfo) => {
    const isDevelopment = (0, util_1.isDevelopmentEnvironment)((0, util_1.getCurrentEnvironment)());
    return {
        core: {
            healthCheckTimeout: 1000,
        },
        asyncContextManager: {
            enable: false,
        },
        midwayLogger: {
            default: {
                level: 'info',
            },
            clients: {
                coreLogger: {
                    level: isDevelopment ? 'info' : 'warn',
                },
                appLogger: {
                    aliasName: 'logger',
                },
            },
        },
        debug: {
            recordConfigMergeOrder: isDevelopment,
        },
    };
};
//# sourceMappingURL=config.default.js.map

/***/ }),

/***/ 7404:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SINGLETON_CONTAINER_CTX = exports.IGNORE_PATTERN = exports.DEFAULT_PATTERN = exports.ASYNC_CONTEXT_MANAGER_KEY = exports.ASYNC_CONTEXT_KEY = exports.REQUEST_CTX_LOGGER_CACHE_KEY = exports.HTTP_SERVER_KEY = exports.CONTAINER_OBJ_SCOPE = exports.REQUEST_OBJ_CTX_KEY = exports.REQUEST_CTX_KEY = exports.MIDWAY_LOGGER_WRITEABLE_DIR = exports.FUNCTION_INJECT_KEY = exports.KEYS = void 0;
/**
 * 静态参数
 *
 */
exports.KEYS = {
    OBJECTS_ELEMENT: 'objects',
    OBJECT_ELEMENT: 'object',
    IMPORT_ELEMENT: 'import',
    PROPERTY_ELEMENT: 'property',
    LIST_ELEMENT: 'list',
    MAP_ELEMENT: 'map',
    ENTRY_ELEMENT: 'entry',
    VALUE_ELEMENT: 'value',
    PROPS_ELEMENT: 'props',
    PROP_ELEMENT: 'prop',
    SET_ELEMENT: 'set',
    CONSTRUCTOR_ARG_ELEMENT: 'constructor-arg',
    REF_ELEMENT: 'ref',
    JSON_ELEMENT: 'json',
    CONFIGURATION_ELEMENT: 'configuration',
    ID_ATTRIBUTE: 'id',
    PATH_ATTRIBUTE: 'path',
    DIRECT_ATTRIBUTE: 'direct',
    AUTOWIRE_ATTRIBUTE: 'autowire',
    ASYNC_ATTRIBUTE: 'async',
    NAME_ATTRIBUTE: 'name',
    REF_ATTRIBUTE: 'ref',
    KEY_ATTRIBUTE: 'key',
    VALUE_ATTRIBUTE: 'value',
    TYPE_ATTRIBUTE: 'type',
    EXTERNAL_ATTRIBUTE: 'external',
    OBJECT_ATTRIBUTE: 'object',
    RESOURCE_ATTRIBUTE: 'resource',
    SCOPE_ATTRIBUTE: 'scope',
    ASPECT_ELEMENT: 'aspect',
    AROUND_ELEMENT: 'around',
    EXPRESSION_ATTRIBUTE: 'expression',
    EXECUTE_ATTRIBUTE: 'execute',
};
exports.FUNCTION_INJECT_KEY = 'midway:function_inject_key';
exports.MIDWAY_LOGGER_WRITEABLE_DIR = 'MIDWAY_LOGGER_WRITEABLE_DIR';
exports.REQUEST_CTX_KEY = 'ctx';
exports.REQUEST_OBJ_CTX_KEY = '_req_ctx';
exports.CONTAINER_OBJ_SCOPE = '_obj_scope';
exports.HTTP_SERVER_KEY = '_midway_http_server';
exports.REQUEST_CTX_LOGGER_CACHE_KEY = '_midway_ctx_logger_cache';
exports.ASYNC_CONTEXT_KEY = Symbol('ASYNC_CONTEXT_KEY');
exports.ASYNC_CONTEXT_MANAGER_KEY = 'MIDWAY_ASYNC_CONTEXT_MANAGER_KEY';
exports.DEFAULT_PATTERN = [
    '**/**.ts',
    '**/**.js',
    '**/**.mts',
    '**/**.mjs',
    '**/**.cts',
    '**/**.cjs',
];
exports.IGNORE_PATTERN = ['**/**.d.ts', '**/**.d.mts', '**/**.d.cts'];
exports.SINGLETON_CONTAINER_CTX = { _MAIN_CTX_: true };
//# sourceMappingURL=constants.js.map

/***/ }),

/***/ 2922:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MidwayContainer = void 0;
const decorator_1 = __nccwpck_require__(8351);
const configuration_1 = __nccwpck_require__(5061);
const util = __nccwpck_require__(9023);
const definitionRegistry_1 = __nccwpck_require__(7755);
const interface_1 = __nccwpck_require__(7270);
const constants_1 = __nccwpck_require__(7404);
const objectDefinition_1 = __nccwpck_require__(8028);
const functionDefinition_1 = __nccwpck_require__(6271);
const managedResolverFactory_1 = __nccwpck_require__(6282);
const environmentService_1 = __nccwpck_require__(4057);
const configService_1 = __nccwpck_require__(3440);
const EventEmitter = __nccwpck_require__(4434);
const error_1 = __nccwpck_require__(6248);
const types_1 = __nccwpck_require__(3171);
const util_1 = __nccwpck_require__(6110);
const debug = util.debuglog('midway:debug');
const debugBind = util.debuglog('midway:bind');
const debugSpaceLength = 9;
class ContainerConfiguration {
    constructor(container) {
        this.container = container;
        this.loadedMap = new WeakMap();
        this.namespaceList = [];
        this.configurationOptionsList = [];
    }
    load(module) {
        let namespace = decorator_1.MAIN_MODULE_KEY;
        // 可能导出多个
        const configurationExports = this.getConfigurationExport(module);
        if (!configurationExports.length)
            return;
        // 多个的情况，数据交给第一个保存
        for (let i = 0; i < configurationExports.length; i++) {
            const configurationExport = configurationExports[i];
            if (this.loadedMap.get(configurationExport)) {
                // 已经加载过就跳过循环
                continue;
            }
            let configurationOptions;
            if (configurationExport instanceof configuration_1.FunctionalConfiguration) {
                // 函数式写法
                configurationOptions = configurationExport.getConfigurationOptions();
            }
            else {
                // 普通类写法
                configurationOptions = (0, decorator_1.getClassMetadata)(decorator_1.CONFIGURATION_KEY, configurationExport);
            }
            // 已加载标记，防止死循环
            this.loadedMap.set(configurationExport, true);
            if (configurationOptions) {
                if (configurationOptions.namespace !== undefined) {
                    namespace = configurationOptions.namespace;
                    this.namespaceList.push(namespace);
                }
                this.configurationOptionsList.push(configurationOptions);
                debug(`[core]: load configuration in namespace="${namespace}"`);
                this.addImports(configurationOptions.imports);
                this.addImportObjects(configurationOptions.importObjects);
                this.addImportConfigs(configurationOptions.importConfigs);
                this.addImportConfigFilter(configurationOptions.importConfigFilter);
                this.bindConfigurationClass(configurationExport, namespace);
            }
        }
        // bind module
        this.container.bindClass(module, {
            namespace,
        });
    }
    addImportConfigs(importConfigs) {
        if (importConfigs) {
            if (Array.isArray(importConfigs)) {
                this.container.get(configService_1.MidwayConfigService).add(importConfigs);
            }
            else {
                this.container.get(configService_1.MidwayConfigService).addObject(importConfigs);
            }
        }
    }
    addImportConfigFilter(importConfigFilter) {
        if (importConfigFilter) {
            this.container.get(configService_1.MidwayConfigService).addFilter(importConfigFilter);
        }
    }
    addImports(imports = []) {
        var _a;
        // 处理 imports
        for (let importPackage of imports) {
            if (!importPackage)
                continue;
            if (typeof importPackage === 'string') {
                importPackage = require(importPackage);
            }
            if ('Configuration' in importPackage) {
                // component is object
                this.load(importPackage);
            }
            else if ('component' in importPackage) {
                if (importPackage === null || importPackage === void 0 ? void 0 : importPackage.enabledEnvironment) {
                    if ((_a = importPackage === null || importPackage === void 0 ? void 0 : importPackage.enabledEnvironment) === null || _a === void 0 ? void 0 : _a.includes(this.container
                        .get(environmentService_1.MidwayEnvironmentService)
                        .getCurrentEnvironment())) {
                        this.load(importPackage.component);
                    }
                }
                else {
                    this.load(importPackage.component);
                }
            }
            else {
                this.load(importPackage);
            }
        }
    }
    /**
     * 注册 importObjects
     * @param objs configuration 中的 importObjects
     */
    addImportObjects(objs) {
        if (objs) {
            const keys = Object.keys(objs);
            for (const key of keys) {
                if (typeof objs[key] !== undefined) {
                    this.container.registerObject(key, objs[key]);
                }
            }
        }
    }
    bindConfigurationClass(clzz, namespace) {
        if (clzz instanceof configuration_1.FunctionalConfiguration) {
            // 函数式写法不需要绑定到容器
        }
        else {
            // 普通类写法
            (0, decorator_1.saveProviderId)(undefined, clzz);
            const id = (0, decorator_1.getProviderUUId)(clzz);
            this.container.bind(id, clzz, {
                namespace: namespace,
                scope: interface_1.ScopeEnum.Singleton,
            });
        }
        // configuration 手动绑定去重
        const configurationMods = (0, decorator_1.listModule)(decorator_1.CONFIGURATION_KEY);
        const exists = configurationMods.find(mod => {
            return mod.target === clzz;
        });
        if (!exists) {
            (0, decorator_1.saveModule)(decorator_1.CONFIGURATION_KEY, {
                target: clzz,
                namespace: namespace,
            });
        }
    }
    getConfigurationExport(exports) {
        const mods = [];
        if (types_1.Types.isClass(exports) ||
            types_1.Types.isFunction(exports) ||
            exports instanceof configuration_1.FunctionalConfiguration) {
            mods.push(exports);
        }
        else {
            for (const m in exports) {
                const module = exports[m];
                if (types_1.Types.isClass(module) ||
                    types_1.Types.isFunction(module) ||
                    module instanceof configuration_1.FunctionalConfiguration) {
                    mods.push(module);
                }
            }
        }
        return mods;
    }
    getNamespaceList() {
        return this.namespaceList;
    }
    getConfigurationOptionsList() {
        return this.configurationOptionsList;
    }
}
class MidwayContainer {
    constructor(parent) {
        this._resolverFactory = null;
        this._registry = null;
        this._identifierMapping = null;
        this.moduleMap = null;
        this.parent = null;
        // 仅仅用于兼容 requestContainer 的 ctx
        this.ctx = constants_1.SINGLETON_CONTAINER_CTX;
        this.attrMap = new Map();
        this._namespaceSet = null;
        this.parent = parent;
        this.init();
    }
    init() {
        // 防止直接从applicationContext.getAsync or get对象实例时依赖当前上下文信息出错
        // ctx is in requestContainer
        this.registerObject(constants_1.REQUEST_CTX_KEY, this.ctx);
    }
    get objectCreateEventTarget() {
        if (!this._objectCreateEventTarget) {
            this._objectCreateEventTarget = new EventEmitter();
        }
        return this._objectCreateEventTarget;
    }
    get registry() {
        if (!this._registry) {
            this._registry = new definitionRegistry_1.ObjectDefinitionRegistry();
        }
        return this._registry;
    }
    set registry(registry) {
        this._registry = registry;
    }
    get managedResolverFactory() {
        if (!this._resolverFactory) {
            this._resolverFactory = new managedResolverFactory_1.ManagedResolverFactory(this);
        }
        return this._resolverFactory;
    }
    get identifierMapping() {
        if (!this._identifierMapping) {
            this._identifierMapping = this.registry.getIdentifierRelation();
        }
        return this._identifierMapping;
    }
    get namespaceSet() {
        if (!this._namespaceSet) {
            this._namespaceSet = new Set();
        }
        return this._namespaceSet;
    }
    load(module) {
        var _a, _b, _c;
        if (!Array.isArray(module)) {
            module = [module];
        }
        // load configuration
        const configuration = new ContainerConfiguration(this);
        for (const mod of module) {
            if (mod) {
                configuration.load(mod);
            }
        }
        for (const ns of configuration.getNamespaceList()) {
            this.namespaceSet.add(ns);
            debug(`[core]: load configuration in namespace="${ns}" complete`);
        }
        const configurationOptionsList = (_a = configuration.getConfigurationOptionsList()) !== null && _a !== void 0 ? _a : [];
        // find user code configuration it's without namespace
        const userCodeConfiguration = (_b = configurationOptionsList.find(options => !options.namespace)) !== null && _b !== void 0 ? _b : {};
        this.fileDetector = (_c = userCodeConfiguration.detector) !== null && _c !== void 0 ? _c : this.fileDetector;
        if (this.fileDetector) {
            this.fileDetector.setExtraDetectorOptions({
                conflictCheck: userCodeConfiguration.conflictCheck,
                ...userCodeConfiguration.detectorOptions,
            });
        }
    }
    loadDefinitions() {
        // load project file
        if (this.fileDetector) {
            return this.fileDetector.run(this);
        }
    }
    bindClass(exports, options) {
        if (types_1.Types.isClass(exports) || types_1.Types.isFunction(exports)) {
            this.bindModule(exports, options);
        }
        else {
            for (const m in exports) {
                const module = exports[m];
                if (types_1.Types.isClass(module) || types_1.Types.isFunction(module)) {
                    this.bindModule(module, options);
                }
            }
        }
    }
    bind(identifier, target, options) {
        var _a;
        if (types_1.Types.isClass(identifier) || types_1.Types.isFunction(identifier)) {
            return this.bindModule(identifier, target);
        }
        if (this.registry.hasDefinition(identifier)) {
            // 如果 definition 存在就不再重复 bind
            return;
        }
        if (options === null || options === void 0 ? void 0 : options.bindHook) {
            options.bindHook(target, options);
        }
        let definition;
        if (types_1.Types.isClass(target)) {
            definition = new objectDefinition_1.ObjectDefinition();
            definition.name = (0, decorator_1.getProviderName)(target);
        }
        else {
            definition = new functionDefinition_1.FunctionDefinition();
            if (!types_1.Types.isAsyncFunction(target)) {
                definition.asynchronous = false;
            }
            definition.name = definition.id;
        }
        definition.path = target;
        definition.id = identifier;
        definition.srcPath = (options === null || options === void 0 ? void 0 : options.srcPath) || null;
        definition.namespace = (options === null || options === void 0 ? void 0 : options.namespace) || '';
        definition.scope = (options === null || options === void 0 ? void 0 : options.scope) || interface_1.ScopeEnum.Request;
        definition.createFrom = options === null || options === void 0 ? void 0 : options.createFrom;
        if (definition.srcPath) {
            debug(`[core]: bind id "${definition.name} (${definition.srcPath}) ${identifier}"`);
        }
        else {
            debug(`[core]: bind id "${definition.name}" ${identifier}`);
        }
        // inject properties
        const props = (0, decorator_1.getPropertyInject)(target);
        for (const p in props) {
            const propertyMeta = props[p];
            debugBind(`${' '.repeat(debugSpaceLength)}inject properties => [${JSON.stringify(propertyMeta)}]`);
            const refManaged = new managedResolverFactory_1.ManagedReference();
            refManaged.args = propertyMeta.args;
            refManaged.name = propertyMeta.value;
            refManaged.injectMode = propertyMeta['injectMode'];
            definition.properties.set(propertyMeta['targetKey'], refManaged);
        }
        // inject custom properties
        const customProps = (0, decorator_1.getClassExtendedMetadata)(decorator_1.INJECT_CUSTOM_PROPERTY, target);
        for (const p in customProps) {
            const propertyMeta = customProps[p];
            definition.handlerProps.push(propertyMeta);
        }
        // @async, @init, @destroy @scope
        const objDefOptions = (_a = (0, decorator_1.getObjectDefinition)(target)) !== null && _a !== void 0 ? _a : {};
        if (objDefOptions.initMethod) {
            debugBind(`${' '.repeat(debugSpaceLength)}register initMethod = ${objDefOptions.initMethod}`);
            definition.initMethod = objDefOptions.initMethod;
        }
        if (objDefOptions.destroyMethod) {
            debugBind(`${' '.repeat(debugSpaceLength)}register destroyMethod = ${objDefOptions.destroyMethod}`);
            definition.destroyMethod = objDefOptions.destroyMethod;
        }
        if (objDefOptions.scope) {
            debugBind(`${' '.repeat(debugSpaceLength)}register scope = ${objDefOptions.scope}`);
            definition.scope = objDefOptions.scope;
        }
        if (objDefOptions.allowDowngrade) {
            debugBind(`${' '.repeat(debugSpaceLength)}register allowDowngrade = ${objDefOptions.allowDowngrade}`);
            definition.allowDowngrade = objDefOptions.allowDowngrade;
        }
        this.objectCreateEventTarget.emit(interface_1.ObjectLifeCycleEvent.BEFORE_BIND, target, {
            context: this,
            definition,
            replaceCallback: newDefinition => {
                definition = newDefinition;
            },
        });
        if (definition) {
            this.registry.registerDefinition(definition.id, definition);
        }
    }
    bindModule(module, options) {
        if (types_1.Types.isClass(module)) {
            const providerId = (0, decorator_1.getProviderUUId)(module);
            if (providerId) {
                this.identifierMapping.saveClassRelation(module, options === null || options === void 0 ? void 0 : options.namespace);
                this.bind(providerId, module, options);
            }
            else {
                // no provide or js class must be skip
            }
        }
        else {
            const info = module[constants_1.FUNCTION_INJECT_KEY];
            if (info && info.id) {
                if (!info.scope) {
                    info.scope = interface_1.ScopeEnum.Request;
                }
                const uuid = util_1.Utils.generateRandomId();
                this.identifierMapping.saveFunctionRelation(info.id, uuid);
                this.bind(uuid, module, {
                    scope: info.scope,
                    namespace: options.namespace,
                    srcPath: options.srcPath,
                    createFrom: options.createFrom,
                });
            }
        }
    }
    setFileDetector(fileDetector) {
        this.fileDetector = fileDetector;
    }
    createChild() {
        return new MidwayContainer(this);
    }
    setAttr(key, value) {
        this.attrMap.set(key, value);
    }
    getAttr(key) {
        return this.attrMap.get(key);
    }
    getIdentifier(target) {
        return (0, decorator_1.getProviderUUId)(target);
    }
    getManagedResolverFactory() {
        if (!this._resolverFactory) {
            this._resolverFactory = new managedResolverFactory_1.ManagedResolverFactory(this);
        }
        return this._resolverFactory;
    }
    async stop() {
        await this.getManagedResolverFactory().destroyCache();
        this.registry.clearAll();
    }
    ready() {
        return this.loadDefinitions();
    }
    get(identifier, args, objectContext) {
        var _a;
        args = args !== null && args !== void 0 ? args : [];
        objectContext = objectContext !== null && objectContext !== void 0 ? objectContext : { originName: identifier };
        if (typeof identifier !== 'string') {
            objectContext.originName = identifier.name;
            identifier = this.getIdentifier(identifier);
        }
        if (this.registry.hasObject(identifier)) {
            return this.registry.getObject(identifier);
        }
        const definition = this.registry.getDefinition(identifier);
        if (!definition && this.parent) {
            return this.parent.get(identifier, args);
        }
        if (!definition) {
            throw new error_1.MidwayDefinitionNotFoundError((_a = objectContext === null || objectContext === void 0 ? void 0 : objectContext.originName) !== null && _a !== void 0 ? _a : identifier);
        }
        return this.getManagedResolverFactory().create({ definition, args });
    }
    async getAsync(identifier, args, objectContext) {
        var _a;
        args = args !== null && args !== void 0 ? args : [];
        objectContext = objectContext !== null && objectContext !== void 0 ? objectContext : { originName: identifier };
        if (typeof identifier !== 'string') {
            objectContext.originName = identifier.name;
            identifier = this.getIdentifier(identifier);
        }
        if (this.registry.hasObject(identifier)) {
            return this.registry.getObject(identifier);
        }
        const definition = this.registry.getDefinition(identifier);
        if (!definition && this.parent) {
            return this.parent.getAsync(identifier, args);
        }
        if (!definition) {
            throw new error_1.MidwayDefinitionNotFoundError((_a = objectContext === null || objectContext === void 0 ? void 0 : objectContext.originName) !== null && _a !== void 0 ? _a : identifier);
        }
        return this.getManagedResolverFactory().createAsync({ definition, args });
    }
    /**
     * proxy registry.registerObject
     * @param {ObjectIdentifier} identifier
     * @param target
     */
    registerObject(identifier, target) {
        this.registry.registerObject(identifier, target);
    }
    onBeforeBind(fn) {
        this.objectCreateEventTarget.on(interface_1.ObjectLifeCycleEvent.BEFORE_BIND, fn);
    }
    onBeforeObjectCreated(fn) {
        this.objectCreateEventTarget.on(interface_1.ObjectLifeCycleEvent.BEFORE_CREATED, fn);
    }
    onObjectCreated(fn) {
        this.objectCreateEventTarget.on(interface_1.ObjectLifeCycleEvent.AFTER_CREATED, fn);
    }
    onObjectInit(fn) {
        this.objectCreateEventTarget.on(interface_1.ObjectLifeCycleEvent.AFTER_INIT, fn);
    }
    onBeforeObjectDestroy(fn) {
        this.objectCreateEventTarget.on(interface_1.ObjectLifeCycleEvent.BEFORE_DESTROY, fn);
    }
    saveModule(key, module) {
        if (!this.moduleMap.has(key)) {
            this.moduleMap.set(key, new Set());
        }
        this.moduleMap.get(key).add(module);
    }
    listModule(key) {
        return Array.from(this.moduleMap.get(key) || {});
    }
    transformModule(moduleMap) {
        this.moduleMap = new Map(moduleMap);
    }
    hasNamespace(ns) {
        return this.namespaceSet.has(ns);
    }
    getNamespaceList() {
        return Array.from(this.namespaceSet);
    }
    hasDefinition(identifier) {
        return this.registry.hasDefinition(identifier);
    }
    hasObject(identifier) {
        return this.registry.hasObject(identifier);
    }
    getInstanceScope(instance) {
        if (instance[constants_1.CONTAINER_OBJ_SCOPE]) {
            return instance[constants_1.CONTAINER_OBJ_SCOPE];
        }
        return undefined;
    }
}
exports.MidwayContainer = MidwayContainer;
//# sourceMappingURL=container.js.map

/***/ }),

/***/ 7755:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ObjectDefinitionRegistry = void 0;
/**
 * Object Definition Registry 实现
 */
const decorator_1 = __nccwpck_require__(8351);
const PREFIX = '_id_default_';
class LegacyIdentifierRelation extends Map {
    saveClassRelation(module, namespace) {
        const providerId = (0, decorator_1.getProviderUUId)(module);
        // save uuid
        this.set(providerId, providerId);
        if (providerId) {
            // save alias id
            const aliasId = (0, decorator_1.getProviderId)(module);
            if (aliasId) {
                // save alias Id
                this.set(aliasId, providerId);
            }
            // save className alias
            this.set((0, decorator_1.getProviderName)(module), providerId);
            // save namespace alias
            if (namespace) {
                this.set(namespace + ':' + (0, decorator_1.getProviderName)(module), providerId);
            }
        }
    }
    saveFunctionRelation(id, uuid) {
        this.set(uuid, uuid);
        this.set(id, uuid);
    }
    hasRelation(id) {
        return this.has(id);
    }
    getRelation(id) {
        return this.get(id);
    }
}
class ObjectDefinitionRegistry extends Map {
    constructor() {
        super(...arguments);
        this.singletonIds = [];
        this._identifierRelation = new LegacyIdentifierRelation();
    }
    get identifierRelation() {
        if (!this._identifierRelation) {
            this._identifierRelation = new LegacyIdentifierRelation();
        }
        return this._identifierRelation;
    }
    set identifierRelation(identifierRelation) {
        this._identifierRelation = identifierRelation;
    }
    get identifiers() {
        const ids = [];
        for (const key of this.keys()) {
            if (key.indexOf(PREFIX) === -1) {
                ids.push(key);
            }
        }
        return ids;
    }
    get count() {
        return this.size;
    }
    getSingletonDefinitionIds() {
        return this.singletonIds;
    }
    getDefinitionByName(name) {
        const definitions = [];
        for (const v of this.values()) {
            const definition = v;
            if (definition.name === name) {
                definitions.push(definition);
            }
        }
        return definitions;
    }
    registerDefinition(identifier, definition) {
        if (definition.isSingletonScope()) {
            this.singletonIds.push(identifier);
        }
        this.set(identifier, definition);
    }
    getDefinition(identifier) {
        var _a;
        identifier = (_a = this.identifierRelation.getRelation(identifier)) !== null && _a !== void 0 ? _a : identifier;
        return this.get(identifier);
    }
    removeDefinition(identifier) {
        this.delete(identifier);
    }
    hasDefinition(identifier) {
        var _a;
        identifier = (_a = this.identifierRelation.getRelation(identifier)) !== null && _a !== void 0 ? _a : identifier;
        return this.has(identifier);
    }
    clearAll() {
        this.singletonIds = [];
        this.clear();
    }
    hasObject(identifier) {
        var _a;
        identifier = (_a = this.identifierRelation.getRelation(identifier)) !== null && _a !== void 0 ? _a : identifier;
        return this.has(PREFIX + identifier);
    }
    registerObject(identifier, target) {
        this.set(PREFIX + identifier, target);
    }
    getObject(identifier) {
        var _a;
        identifier = (_a = this.identifierRelation.getRelation(identifier)) !== null && _a !== void 0 ? _a : identifier;
        return this.get(PREFIX + identifier);
    }
    getIdentifierRelation() {
        return this.identifierRelation;
    }
    setIdentifierRelation(identifierRelation) {
        this.identifierRelation = identifierRelation;
    }
}
exports.ObjectDefinitionRegistry = ObjectDefinitionRegistry;
//# sourceMappingURL=definitionRegistry.js.map

/***/ }),

/***/ 6282:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ManagedResolverFactory = exports.ManagedReference = void 0;
/**
 * 管理对象解析构建
 */
const constants_1 = __nccwpck_require__(7404);
const interface_1 = __nccwpck_require__(7270);
const util = __nccwpck_require__(9023);
const error_1 = __nccwpck_require__(6248);
const debug = util.debuglog('midway:managedresolver');
const debugLog = util.debuglog('midway:debug');
class ManagedReference {
    constructor() {
        this.type = constants_1.KEYS.REF_ELEMENT;
    }
}
exports.ManagedReference = ManagedReference;
/**
 * 解析ref
 */
class RefResolver {
    constructor(factory) {
        this.factory = factory;
    }
    get type() {
        return constants_1.KEYS.REF_ELEMENT;
    }
    resolve(managed, originName) {
        var _a;
        const mr = managed;
        if (mr.injectMode === interface_1.InjectModeEnum.Class &&
            !((_a = this.factory.context.parent) !== null && _a !== void 0 ? _a : this.factory.context).hasDefinition(mr.name)) {
            if (originName === 'loggerService') {
                throw new error_1.MidwayInconsistentVersionError();
            }
            else {
                throw new error_1.MidwayMissingImportComponentError(originName);
            }
        }
        return this.factory.context.get(mr.name, mr.args, {
            originName,
        });
    }
    async resolveAsync(managed, originName) {
        var _a;
        const mr = managed;
        if (mr.injectMode === interface_1.InjectModeEnum.Class &&
            !((_a = this.factory.context.parent) !== null && _a !== void 0 ? _a : this.factory.context).hasDefinition(mr.name)) {
            if (originName === 'loggerService') {
                throw new error_1.MidwayInconsistentVersionError();
            }
            else {
                throw new error_1.MidwayMissingImportComponentError(originName);
            }
        }
        return this.factory.context.getAsync(mr.name, mr.args, {
            originName,
        });
    }
}
/**
 * 解析工厂
 */
class ManagedResolverFactory {
    constructor(context) {
        this.resolvers = {};
        this.creating = new Map();
        this.singletonCache = new Map();
        this.context = context;
        // 初始化解析器
        this.resolvers = {
            ref: new RefResolver(this),
        };
    }
    registerResolver(resolver) {
        this.resolvers[resolver.type] = resolver;
    }
    resolveManaged(managed, originPropertyName) {
        const resolver = this.resolvers[managed.type];
        if (!resolver || resolver.type !== managed.type) {
            throw new error_1.MidwayResolverMissingError(managed.type);
        }
        return resolver.resolve(managed, originPropertyName);
    }
    async resolveManagedAsync(managed, originPropertyName) {
        const resolver = this.resolvers[managed.type];
        if (!resolver || resolver.type !== managed.type) {
            throw new error_1.MidwayResolverMissingError(managed.type);
        }
        return resolver.resolveAsync(managed, originPropertyName);
    }
    /**
     * 同步创建对象
     * @param opt
     */
    create(opt) {
        const { definition, args } = opt;
        if (definition.isSingletonScope() &&
            this.singletonCache.has(definition.id)) {
            return this.singletonCache.get(definition.id);
        }
        // 如果非 null 表示已经创建 proxy
        let inst = this.createProxyReference(definition);
        if (inst) {
            return inst;
        }
        this.compareAndSetCreateStatus(definition);
        // 预先初始化依赖
        if (definition.hasDependsOn()) {
            for (const dep of definition.dependsOn) {
                this.context.get(dep, args);
            }
        }
        debugLog(`[core]: Create id = "${definition.name}" ${definition.id}.`);
        const Clzz = definition.creator.load();
        let constructorArgs = [];
        if (args && Array.isArray(args) && args.length > 0) {
            constructorArgs = args;
        }
        this.getObjectEventTarget().emit(interface_1.ObjectLifeCycleEvent.BEFORE_CREATED, Clzz, {
            constructorArgs,
            definition,
            context: this.context,
        });
        inst = definition.creator.doConstruct(Clzz, constructorArgs, this.context);
        // binding ctx object
        if (definition.isRequestScope() &&
            definition.constructor.name === 'ObjectDefinition') {
            Object.defineProperty(inst, constants_1.REQUEST_OBJ_CTX_KEY, {
                value: this.context.get(constants_1.REQUEST_CTX_KEY),
                writable: false,
                enumerable: false,
            });
        }
        if (definition.properties) {
            const keys = definition.properties.propertyKeys();
            for (const key of keys) {
                this.checkSingletonInvokeRequest(definition, key);
                try {
                    inst[key] = this.resolveManaged(definition.properties.get(key), key);
                }
                catch (error) {
                    if (error_1.MidwayDefinitionNotFoundError.isClosePrototypeOf(error)) {
                        const className = definition.path.name;
                        error.updateErrorMsg(className);
                    }
                    this.removeCreateStatus(definition, true);
                    throw error;
                }
            }
        }
        this.getObjectEventTarget().emit(interface_1.ObjectLifeCycleEvent.AFTER_CREATED, inst, {
            context: this.context,
            definition,
            replaceCallback: ins => {
                inst = ins;
            },
        });
        // after properties set then do init
        definition.creator.doInit(inst);
        this.getObjectEventTarget().emit(interface_1.ObjectLifeCycleEvent.AFTER_INIT, inst, {
            context: this.context,
            definition,
        });
        if (definition.id) {
            if (definition.isSingletonScope()) {
                this.singletonCache.set(definition.id, inst);
                this.setInstanceScope(inst, interface_1.ScopeEnum.Singleton);
            }
            else if (definition.isRequestScope()) {
                this.context.registerObject(definition.id, inst);
                this.setInstanceScope(inst, interface_1.ScopeEnum.Request);
            }
            else {
                this.setInstanceScope(inst, interface_1.ScopeEnum.Prototype);
            }
        }
        this.removeCreateStatus(definition, true);
        return inst;
    }
    /**
     * 异步创建对象
     * @param opt
     */
    async createAsync(opt) {
        const { definition, args } = opt;
        if (definition.isSingletonScope() &&
            this.singletonCache.has(definition.id)) {
            debug(`id = ${definition.id}(${definition.name}) get from singleton cache.`);
            return this.singletonCache.get(definition.id);
        }
        // 如果非 null 表示已经创建 proxy
        let inst = this.createProxyReference(definition);
        if (inst) {
            debug(`id = ${definition.id}(${definition.name}) from proxy reference.`);
            return inst;
        }
        this.compareAndSetCreateStatus(definition);
        // 预先初始化依赖
        if (definition.hasDependsOn()) {
            for (const dep of definition.dependsOn) {
                debug('id = %s init depend %s.', definition.id, dep);
                await this.context.getAsync(dep, args);
            }
        }
        debugLog(`[core]: Create id = "${definition.name}" ${definition.id}.`);
        const Clzz = definition.creator.load();
        let constructorArgs = [];
        if (args && Array.isArray(args) && args.length > 0) {
            constructorArgs = args;
        }
        this.getObjectEventTarget().emit(interface_1.ObjectLifeCycleEvent.BEFORE_CREATED, Clzz, {
            constructorArgs,
            context: this.context,
        });
        inst = await definition.creator.doConstructAsync(Clzz, constructorArgs, this.context);
        if (!inst) {
            this.removeCreateStatus(definition, false);
            throw new error_1.MidwayCommonError(`${definition.id} construct return undefined`);
        }
        // binding ctx object
        if (definition.isRequestScope() &&
            definition.constructor.name === 'ObjectDefinition') {
            debug('id = %s inject ctx', definition.id);
            // set related ctx
            Object.defineProperty(inst, constants_1.REQUEST_OBJ_CTX_KEY, {
                value: this.context.get(constants_1.REQUEST_CTX_KEY),
                writable: false,
                enumerable: false,
            });
        }
        if (definition.properties) {
            const keys = definition.properties.propertyKeys();
            for (const key of keys) {
                this.checkSingletonInvokeRequest(definition, key);
                try {
                    inst[key] = await this.resolveManagedAsync(definition.properties.get(key), key);
                }
                catch (error) {
                    if (error_1.MidwayDefinitionNotFoundError.isClosePrototypeOf(error)) {
                        const className = definition.path.name;
                        error.updateErrorMsg(className);
                    }
                    this.removeCreateStatus(definition, false);
                    throw error;
                }
            }
        }
        this.getObjectEventTarget().emit(interface_1.ObjectLifeCycleEvent.AFTER_CREATED, inst, {
            context: this.context,
            definition,
            replaceCallback: ins => {
                inst = ins;
            },
        });
        // after properties set then do init
        await definition.creator.doInitAsync(inst);
        this.getObjectEventTarget().emit(interface_1.ObjectLifeCycleEvent.AFTER_INIT, inst, {
            context: this.context,
            definition,
        });
        if (definition.id) {
            if (definition.isSingletonScope()) {
                debug(`id = ${definition.id}(${definition.name}) set to singleton cache`);
                this.singletonCache.set(definition.id, inst);
                this.setInstanceScope(inst, interface_1.ScopeEnum.Singleton);
            }
            else if (definition.isRequestScope()) {
                debug(`id = ${definition.id}(${definition.name}) set to register object`);
                this.context.registerObject(definition.id, inst);
                this.setInstanceScope(inst, interface_1.ScopeEnum.Request);
            }
            else {
                this.setInstanceScope(inst, interface_1.ScopeEnum.Prototype);
            }
        }
        this.removeCreateStatus(definition, true);
        return inst;
    }
    async destroyCache() {
        for (const key of this.singletonCache.keys()) {
            const definition = this.context.registry.getDefinition(key);
            if (definition.creator) {
                const inst = this.singletonCache.get(key);
                this.getObjectEventTarget().emit(interface_1.ObjectLifeCycleEvent.BEFORE_DESTROY, inst, {
                    context: this.context,
                    definition,
                });
                await definition.creator.doDestroyAsync(inst);
            }
        }
        this.singletonCache.clear();
        this.creating.clear();
    }
    /**
     * 触发单例初始化结束事件
     * @param definition 单例定义
     * @param success 成功 or 失败
     */
    removeCreateStatus(definition, success) {
        // 如果map中存在表示需要设置状态
        if (this.creating.has(definition.id)) {
            this.creating.set(definition.id, false);
        }
        return true;
    }
    isCreating(definition) {
        return this.creating.has(definition.id) && this.creating.get(definition.id);
    }
    compareAndSetCreateStatus(definition) {
        if (!this.creating.has(definition.id) ||
            !this.creating.get(definition.id)) {
            this.creating.set(definition.id, true);
        }
    }
    /**
     * 创建对象定义的代理访问逻辑
     * @param definition 对象定义
     */
    createProxyReference(definition) {
        if (this.isCreating(definition)) {
            debug('create proxy for %s.', definition.id);
            // 非循环依赖的允许重新创建对象
            if (!this.depthFirstSearch(definition.id, definition)) {
                debug('id = %s after dfs return null', definition.id);
                return null;
            }
            // 创建代理对象
            return new Proxy({ __is_proxy__: true, __target_id__: definition.id }, {
                get: (obj, prop) => {
                    let target;
                    if (definition.isRequestScope()) {
                        target = this.context.registry.getObject(definition.id);
                    }
                    else if (definition.isSingletonScope()) {
                        target = this.singletonCache.get(definition.id);
                    }
                    else {
                        target = this.context.get(definition.id);
                    }
                    if (target) {
                        if (typeof target[prop] === 'function') {
                            return target[prop].bind(target);
                        }
                        return target[prop];
                    }
                    return undefined;
                },
            });
        }
        return null;
    }
    /**
     * 遍历依赖树判断是否循环依赖
     * @param identifier 目标id
     * @param definition 定义描述
     * @param depth
     */
    depthFirstSearch(identifier, definition, depth) {
        var _a;
        if (definition) {
            debug('dfs for %s == %s start.', identifier, definition.id);
            if (definition.properties) {
                const keys = definition.properties.propertyKeys();
                if (keys.indexOf(identifier) > -1) {
                    debug('dfs exist in properties %s == %s.', identifier, definition.id);
                    return true;
                }
                for (const key of keys) {
                    if (!Array.isArray(depth)) {
                        depth = [identifier];
                    }
                    let iden = key;
                    const ref = definition.properties.get(key);
                    if (ref && ref.name) {
                        iden =
                            (_a = this.context.identifierMapping.getRelation(ref.name)) !== null && _a !== void 0 ? _a : ref.name;
                    }
                    if (iden === identifier) {
                        debug('dfs exist in properties key %s == %s.', identifier, definition.id);
                        return true;
                    }
                    if (depth.indexOf(iden) > -1) {
                        debug('dfs depth circular %s == %s, %s, %j.', identifier, definition.id, iden, depth);
                        continue;
                    }
                    else {
                        depth.push(iden);
                        debug('dfs depth push %s == %s, %j.', identifier, iden, depth);
                    }
                    let subDefinition = this.context.registry.getDefinition(iden);
                    if (!subDefinition && this.context.parent) {
                        subDefinition = this.context.parent.registry.getDefinition(iden);
                    }
                    if (this.depthFirstSearch(identifier, subDefinition, depth)) {
                        debug('dfs exist in sub tree %s == %s subId = %s.', identifier, definition.id, subDefinition.id);
                        return true;
                    }
                }
            }
            debug('dfs for %s == %s end.', identifier, definition.id);
        }
        return false;
    }
    getObjectEventTarget() {
        if (this.context.parent) {
            return this.context.parent.objectCreateEventTarget;
        }
        return this.context.objectCreateEventTarget;
    }
    checkSingletonInvokeRequest(definition, key) {
        if (definition.isSingletonScope()) {
            const managedRef = definition.properties.get(key);
            if (this.context.hasDefinition(managedRef === null || managedRef === void 0 ? void 0 : managedRef.name)) {
                const propertyDefinition = this.context.registry.getDefinition(managedRef.name);
                if (propertyDefinition.isRequestScope() &&
                    !propertyDefinition.allowDowngrade) {
                    throw new error_1.MidwaySingletonInjectRequestError(definition.path.name, propertyDefinition.path.name);
                }
            }
        }
        return true;
    }
    setInstanceScope(inst, scope) {
        if (typeof inst === 'object') {
            if (scope === interface_1.ScopeEnum.Request &&
                inst[constants_1.REQUEST_OBJ_CTX_KEY] === constants_1.SINGLETON_CONTAINER_CTX) {
                scope = interface_1.ScopeEnum.Singleton;
            }
            Object.defineProperty(inst, constants_1.CONTAINER_OBJ_SCOPE, {
                value: scope,
                writable: false,
                enumerable: false,
                configurable: false,
            });
        }
    }
}
exports.ManagedResolverFactory = ManagedResolverFactory;
//# sourceMappingURL=managedResolverFactory.js.map

/***/ }),

/***/ 233:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.providerWrapper = void 0;
const constants_1 = __nccwpck_require__(7404);
function providerWrapper(wrapperInfo) {
    for (const info of wrapperInfo) {
        Object.defineProperty(info.provider, constants_1.FUNCTION_INJECT_KEY, {
            value: info,
            writable: false,
        });
    }
}
exports.providerWrapper = providerWrapper;
//# sourceMappingURL=providerWrapper.js.map

/***/ }),

/***/ 4005:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MidwayRequestContainer = void 0;
const container_1 = __nccwpck_require__(2922);
const decorator_1 = __nccwpck_require__(8351);
const constants_1 = __nccwpck_require__(7404);
class MidwayRequestContainer extends container_1.MidwayContainer {
    constructor(ctx, applicationContext) {
        super(applicationContext);
        this.applicationContext = applicationContext;
        // update legacy relationship
        this.registry.setIdentifierRelation(this.applicationContext.registry.getIdentifierRelation());
        this.ctx = ctx;
        // register ctx
        this.registerObject(constants_1.REQUEST_CTX_KEY, ctx);
        // register res
        this.registerObject('res', {});
        if (ctx.logger) {
            // register contextLogger
            this.registerObject('logger', ctx.logger);
        }
    }
    init() {
        // do nothing
    }
    get(identifier, args) {
        if (typeof identifier !== 'string') {
            identifier = this.getIdentifier(identifier);
        }
        if (this.registry.hasObject(identifier)) {
            return this.registry.getObject(identifier);
        }
        const definition = this.applicationContext.registry.getDefinition(identifier);
        if (definition) {
            if (definition.isRequestScope() ||
                definition.id === decorator_1.PIPELINE_IDENTIFIER) {
                // create object from applicationContext definition for requestScope
                return this.getManagedResolverFactory().create({
                    definition,
                    args,
                });
            }
        }
        if (this.parent) {
            return this.parent.get(identifier, args);
        }
    }
    async getAsync(identifier, args) {
        if (typeof identifier !== 'string') {
            identifier = this.getIdentifier(identifier);
        }
        if (this.registry.hasObject(identifier)) {
            return this.registry.getObject(identifier);
        }
        const definition = this.applicationContext.registry.getDefinition(identifier);
        if (definition) {
            if (definition.isRequestScope() ||
                definition.id === decorator_1.PIPELINE_IDENTIFIER) {
                // create object from applicationContext definition for requestScope
                return this.getManagedResolverFactory().createAsync({
                    definition,
                    args,
                });
            }
        }
        if (this.parent) {
            return this.parent.getAsync(identifier, args);
        }
    }
    async ready() {
        // ignore other things
    }
    getContext() {
        return this.ctx;
    }
}
exports.MidwayRequestContainer = MidwayRequestContainer;
//# sourceMappingURL=requestContainer.js.map

/***/ }),

/***/ 6409:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Aspect = void 0;
const __1 = __nccwpck_require__(8351);
const objectDef_1 = __nccwpck_require__(2139);
const interface_1 = __nccwpck_require__(7270);
function Aspect(aspectTarget, match, priority) {
    return function (target) {
        (0, __1.saveModule)(__1.ASPECT_KEY, target);
        const aspectTargets = [].concat(aspectTarget);
        for (const aspectTarget of aspectTargets) {
            (0, __1.attachClassMetadata)(__1.ASPECT_KEY, {
                aspectTarget,
                match,
                priority,
            }, target);
        }
        (0, objectDef_1.Scope)(interface_1.ScopeEnum.Singleton)(target);
        (0, __1.Provide)()(target);
    };
}
exports.Aspect = Aspect;
//# sourceMappingURL=aspect.js.map

/***/ }),

/***/ 4166:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Autoload = void 0;
const decoratorManager_1 = __nccwpck_require__(7679);
const provide_1 = __nccwpck_require__(6960);
function Autoload() {
    return function (target) {
        (0, decoratorManager_1.savePreloadModule)(target);
        (0, provide_1.Provide)()(target);
    };
}
exports.Autoload = Autoload;
//# sourceMappingURL=autoload.js.map

/***/ }),

/***/ 5963:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Configuration = void 0;
const __1 = __nccwpck_require__(8351);
function Configuration(options = {}) {
    return (target) => {
        (0, __1.saveClassMetadata)(__1.CONFIGURATION_KEY, options, target);
    };
}
exports.Configuration = Configuration;
//# sourceMappingURL=configuration.js.map

/***/ }),

/***/ 9183:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Match = exports.Catch = void 0;
const decoratorManager_1 = __nccwpck_require__(7679);
const constant_1 = __nccwpck_require__(6695);
const objectDef_1 = __nccwpck_require__(2139);
const provide_1 = __nccwpck_require__(6960);
const interface_1 = __nccwpck_require__(7270);
function Catch(catchTarget, options = {}) {
    return function (target) {
        const catchTargets = catchTarget ? [].concat(catchTarget) : undefined;
        (0, decoratorManager_1.saveClassMetadata)(constant_1.CATCH_KEY, {
            catchTargets,
            catchOptions: options,
        }, target);
        (0, objectDef_1.Scope)(interface_1.ScopeEnum.Singleton)(target);
        (0, provide_1.Provide)()(target);
    };
}
exports.Catch = Catch;
function Match(matchPattern = true) {
    return function (target) {
        (0, decoratorManager_1.saveClassMetadata)(constant_1.MATCH_KEY, {
            matchPattern,
        }, target);
        (0, objectDef_1.Scope)(interface_1.ScopeEnum.Singleton)(target);
        (0, provide_1.Provide)()(target);
    };
}
exports.Match = Match;
//# sourceMappingURL=filter.js.map

/***/ }),

/***/ 2629:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApplicationContext = exports.Logger = exports.App = exports.Config = exports.Plugin = exports.Framework = void 0;
const __1 = __nccwpck_require__(8351);
const interface_1 = __nccwpck_require__(7270);
function Framework() {
    return (target) => {
        (0, __1.saveModule)(__1.FRAMEWORK_KEY, target);
        (0, __1.Scope)(interface_1.ScopeEnum.Singleton)(target);
        (0, __1.Provide)()(target);
    };
}
exports.Framework = Framework;
function Plugin(identifier) {
    return (0, __1.createCustomPropertyDecorator)(__1.PLUGIN_KEY, {
        identifier,
    });
}
exports.Plugin = Plugin;
function Config(identifier) {
    return (0, __1.createCustomPropertyDecorator)(__1.CONFIG_KEY, {
        identifier,
    });
}
exports.Config = Config;
function App(typeOrNamespace) {
    return (0, __1.createCustomPropertyDecorator)(__1.APPLICATION_KEY, {
        type: typeOrNamespace,
    });
}
exports.App = App;
function Logger(identifier) {
    return (0, __1.createCustomPropertyDecorator)(__1.LOGGER_KEY, {
        identifier,
    });
}
exports.Logger = Logger;
function ApplicationContext() {
    return (0, __1.createCustomPropertyDecorator)(__1.APPLICATION_CONTEXT_KEY, {});
}
exports.ApplicationContext = ApplicationContext;
//# sourceMappingURL=framework.js.map

/***/ }),

/***/ 6748:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Guard = exports.UseGuard = void 0;
const decoratorManager_1 = __nccwpck_require__(7679);
const interface_1 = __nccwpck_require__(7270);
const constant_1 = __nccwpck_require__(6695);
const provide_1 = __nccwpck_require__(6960);
const objectDef_1 = __nccwpck_require__(2139);
function UseGuard(guardOrArr) {
    return (target, propertyKey, descriptor) => {
        if (!Array.isArray(guardOrArr)) {
            guardOrArr = [guardOrArr];
        }
        if (propertyKey) {
            (0, decoratorManager_1.savePropertyMetadata)(constant_1.GUARD_KEY, guardOrArr, target, propertyKey);
        }
        else {
            (0, decoratorManager_1.saveClassMetadata)(constant_1.GUARD_KEY, guardOrArr, target);
        }
    };
}
exports.UseGuard = UseGuard;
function Guard() {
    return target => {
        (0, provide_1.Provide)()(target);
        (0, objectDef_1.Scope)(interface_1.ScopeEnum.Singleton)(target);
    };
}
exports.Guard = Guard;
//# sourceMappingURL=guard.js.map

/***/ }),

/***/ 7216:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InjectClient = exports.Inject = void 0;
const decoratorManager_1 = __nccwpck_require__(7679);
const constant_1 = __nccwpck_require__(6695);
function Inject(identifier) {
    return function (target, targetKey) {
        (0, decoratorManager_1.savePropertyInject)({ target, targetKey, identifier });
    };
}
exports.Inject = Inject;
function InjectClient(serviceFactoryClz, clientName) {
    return (0, decoratorManager_1.createCustomPropertyDecorator)(constant_1.FACTORY_SERVICE_CLIENT_KEY, {
        serviceFactoryClz,
        clientName,
    });
}
exports.InjectClient = InjectClient;
//# sourceMappingURL=inject.js.map

/***/ }),

/***/ 2801:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Middleware = void 0;
const __1 = __nccwpck_require__(8351);
const interface_1 = __nccwpck_require__(7270);
function Middleware() {
    return (target) => {
        (0, __1.Scope)(interface_1.ScopeEnum.Singleton)(target);
        (0, __1.Provide)()(target);
    };
}
exports.Middleware = Middleware;
//# sourceMappingURL=middleware.js.map

/***/ }),

/***/ 8735:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Mock = void 0;
const __1 = __nccwpck_require__(8351);
const interface_1 = __nccwpck_require__(7270);
function Mock() {
    return (target) => {
        (0, __1.saveModule)(__1.MOCK_KEY, target);
        (0, __1.Scope)(interface_1.ScopeEnum.Singleton)(target);
        (0, __1.Provide)()(target);
    };
}
exports.Mock = Mock;
//# sourceMappingURL=mock.js.map

/***/ }),

/***/ 2139:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Singleton = exports.Scope = exports.Destroy = exports.Init = void 0;
const decoratorManager_1 = __nccwpck_require__(7679);
const provide_1 = __nccwpck_require__(6960);
const interface_1 = __nccwpck_require__(7270);
function Init() {
    return function (target, propertyKey) {
        (0, decoratorManager_1.saveObjectDefinition)(target, { initMethod: propertyKey });
    };
}
exports.Init = Init;
function Destroy() {
    return function (target, propertyKey) {
        (0, decoratorManager_1.saveObjectDefinition)(target, {
            destroyMethod: propertyKey,
        });
    };
}
exports.Destroy = Destroy;
function Scope(scope, scopeOptions) {
    return function (target) {
        (0, decoratorManager_1.saveObjectDefinition)(target, { scope, ...scopeOptions });
    };
}
exports.Scope = Scope;
function Singleton() {
    return function (target) {
        Scope(interface_1.ScopeEnum.Singleton)(target);
        (0, provide_1.Provide)()(target);
    };
}
exports.Singleton = Singleton;
//# sourceMappingURL=objectDef.js.map

/***/ }),

/***/ 2765:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Pipe = void 0;
const __1 = __nccwpck_require__(8351);
const interface_1 = __nccwpck_require__(7270);
function Pipe() {
    return (target) => {
        (0, __1.Scope)(interface_1.ScopeEnum.Singleton)(target);
        (0, __1.Provide)()(target);
    };
}
exports.Pipe = Pipe;
//# sourceMappingURL=pipe.js.map

/***/ }),

/***/ 4767:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Pipeline = void 0;
const decoratorManager_1 = __nccwpck_require__(7679);
const constant_1 = __nccwpck_require__(6695);
function Pipeline(valves) {
    return (0, decoratorManager_1.createCustomPropertyDecorator)(constant_1.PIPELINE_IDENTIFIER, {
        valves,
    });
}
exports.Pipeline = Pipeline;
//# sourceMappingURL=pipeline.js.map

/***/ }),

/***/ 6960:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Provide = void 0;
const decoratorManager_1 = __nccwpck_require__(7679);
function Provide(identifier) {
    return function (target) {
        return (0, decoratorManager_1.saveProviderId)(identifier, target);
    };
}
exports.Provide = Provide;
//# sourceMappingURL=provide.js.map

/***/ }),

/***/ 6695:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TAGGED_CLS = exports.INJECT_CUSTOM_PARAM = exports.INJECT_CUSTOM_METHOD = exports.INJECT_CUSTOM_PROPERTY = exports.INJECT_TAG = exports.NAMED_TAG = exports.CLASS_KEY_CONSTRUCTOR = exports.APPLICATION_CONTEXT_KEY = exports.APPLICATION_KEY = exports.LOGGER_KEY = exports.PLUGIN_KEY = exports.CONFIG_KEY = exports.MS_HSF_METHOD_KEY = exports.MS_DUBBO_METHOD_KEY = exports.MS_GRPC_METHOD_KEY = exports.MS_PROVIDER_KEY = exports.MS_PRODUCER_KEY = exports.MS_CONSUMER_KEY = exports.RPC_DUBBO_KEY = exports.RPC_GRPC_KEY = exports.HSF_KEY = exports.WS_EVENT_KEY = exports.WS_CONTROLLER_KEY = exports.MODULE_TASK_QUEUE_OPTIONS = exports.MODULE_TASK_QUEUE_KEY = exports.MODULE_TASK_TASK_LOCAL_OPTIONS = exports.MODULE_TASK_TASK_LOCAL_KEY = exports.MODULE_TASK_METADATA = exports.MODULE_TASK_KEY = exports.WEB_RESPONSE_RENDER = exports.WEB_RESPONSE_CONTENT_TYPE = exports.WEB_RESPONSE_HEADER = exports.WEB_RESPONSE_REDIRECT = exports.WEB_RESPONSE_HTTP_CODE = exports.WEB_RESPONSE_KEY = exports.WEB_ROUTER_PARAM_KEY = exports.WEB_ROUTER_KEY = exports.CONTROLLER_KEY = exports.SERVERLESS_FUNC_KEY = exports.FUNC_KEY = exports.FACTORY_SERVICE_CLIENT_KEY = exports.MOCK_KEY = exports.GUARD_KEY = exports.MATCH_KEY = exports.CATCH_KEY = exports.ASPECT_KEY = exports.FRAMEWORK_KEY = exports.CONFIGURATION_KEY = exports.SCHEDULE_KEY = exports.ALL = void 0;
exports.PRIVATE_META_DATA_KEY = exports.MAIN_MODULE_KEY = exports.LIFECYCLE_IDENTIFIER_PREFIX = exports.PIPELINE_IDENTIFIER = exports.OBJ_DEF_CLS = exports.TAGGED_FUN = void 0;
// got all value with no property name
exports.ALL = 'common:all_value_key';
// common
exports.SCHEDULE_KEY = 'common:schedule';
exports.CONFIGURATION_KEY = 'common:configuration';
exports.FRAMEWORK_KEY = 'common:framework';
exports.ASPECT_KEY = 'common:aspect';
exports.CATCH_KEY = 'common:catch';
exports.MATCH_KEY = 'common:match';
exports.GUARD_KEY = 'common:guard';
exports.MOCK_KEY = 'common:mock';
exports.FACTORY_SERVICE_CLIENT_KEY = 'common:service_factory:client';
// faas
exports.FUNC_KEY = 'faas:func';
exports.SERVERLESS_FUNC_KEY = 'faas:serverless:function';
// web
exports.CONTROLLER_KEY = 'web:controller';
exports.WEB_ROUTER_KEY = 'web:router';
exports.WEB_ROUTER_PARAM_KEY = 'web:router_param';
exports.WEB_RESPONSE_KEY = 'web:response';
exports.WEB_RESPONSE_HTTP_CODE = 'web:response_http_code';
exports.WEB_RESPONSE_REDIRECT = 'web:response_redirect';
exports.WEB_RESPONSE_HEADER = 'web:response_header';
exports.WEB_RESPONSE_CONTENT_TYPE = 'web:response_content_type';
exports.WEB_RESPONSE_RENDER = 'web:response_render';
// task
exports.MODULE_TASK_KEY = 'task:task';
exports.MODULE_TASK_METADATA = 'task:task:options';
exports.MODULE_TASK_TASK_LOCAL_KEY = 'task:task:task_local';
exports.MODULE_TASK_TASK_LOCAL_OPTIONS = 'task:task:task_local:options';
exports.MODULE_TASK_QUEUE_KEY = 'task:task:queue';
exports.MODULE_TASK_QUEUE_OPTIONS = 'task:task:queue:options';
// ws
exports.WS_CONTROLLER_KEY = 'ws:controller';
exports.WS_EVENT_KEY = 'ws:event';
// RPC
exports.HSF_KEY = 'rpc:hsf';
exports.RPC_GRPC_KEY = 'rpc:grpc';
exports.RPC_DUBBO_KEY = 'rpc:dubbo';
// microservice
exports.MS_CONSUMER_KEY = 'ms:consumer';
exports.MS_PRODUCER_KEY = 'ms:producer';
exports.MS_PROVIDER_KEY = 'ms:provider';
// rpc method
exports.MS_GRPC_METHOD_KEY = 'ms:grpc:method';
exports.MS_DUBBO_METHOD_KEY = 'ms:dubbo:method';
exports.MS_HSF_METHOD_KEY = 'ms:hsf:method';
// framework
exports.CONFIG_KEY = 'config';
exports.PLUGIN_KEY = 'plugin';
exports.LOGGER_KEY = 'logger';
exports.APPLICATION_KEY = '__midway_framework_app__';
exports.APPLICATION_CONTEXT_KEY = '__midway_application_context__';
////////////////////////////////////////// inject keys
// constructor key
exports.CLASS_KEY_CONSTRUCTOR = 'midway:class_key_constructor';
// Used for named bindings
exports.NAMED_TAG = 'named';
// The name of the target at design time
exports.INJECT_TAG = 'inject';
// The name inject custom property decorator with resolver
exports.INJECT_CUSTOM_PROPERTY = 'inject_custom_property';
// The name inject custom param decorator with resolver
exports.INJECT_CUSTOM_METHOD = 'inject_custom_method';
// The name inject custom param decorator with resolver
exports.INJECT_CUSTOM_PARAM = 'inject_custom_param';
//
// // used to store constructor arguments tags
// export const TAGGED = 'injection:tagged';
//
// // used to store class properties tags
// export const TAGGED_PROP = 'injection:tagged_props';
// used to store class to be injected
exports.TAGGED_CLS = 'injection:tagged_class';
// used to store function to be injected
exports.TAGGED_FUN = 'injection:tagged_function';
exports.OBJ_DEF_CLS = 'injection:object_definition_class';
// pipeline
exports.PIPELINE_IDENTIFIER = '__pipeline_identifier__';
// lifecycle interface
exports.LIFECYCLE_IDENTIFIER_PREFIX = '__lifecycle__';
exports.MAIN_MODULE_KEY = '__main__';
exports.PRIVATE_META_DATA_KEY = '__midway_private_meta_data__';
//# sourceMappingURL=constant.js.map

/***/ }),

/***/ 7679:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createCustomParamDecorator = exports.createCustomMethodDecorator = exports.createCustomPropertyDecorator = exports.getMethodReturnTypes = exports.getPropertyType = exports.getMethodParamTypes = exports.BaseType = exports.isProvide = exports.getProviderUUId = exports.getProviderName = exports.getProviderId = exports.saveProviderId = exports.getObjectDefinition = exports.saveObjectDefinition = exports.getPropertyInject = exports.savePropertyInject = exports.transformTypeFromTSDesign = exports.clearAllModule = exports.resetModule = exports.listModule = exports.clearBindContainer = exports.bindContainer = exports.saveModule = exports.listPreloadModule = exports.savePreloadModule = exports.getPropertyMetadata = exports.attachPropertyMetadata = exports.savePropertyMetadata = exports.listPropertyDataFromClass = exports.getPropertyDataFromClass = exports.attachPropertyDataToClass = exports.savePropertyDataToClass = exports.getClassMetadata = exports.getClassExtendedMetadata = exports.attachClassMetadata = exports.saveClassMetadata = exports.DecoratorManager = exports.INJECT_CLASS_KEY_PREFIX = exports.PRELOAD_MODULE_KEY = void 0;
__nccwpck_require__(477);
const interface_1 = __nccwpck_require__(7270);
const constant_1 = __nccwpck_require__(6695);
const types_1 = __nccwpck_require__(3171);
const camelCase_1 = __nccwpck_require__(8504);
const util_1 = __nccwpck_require__(6110);
const pathFileUtil_1 = __nccwpck_require__(9837);
const debug = (__nccwpck_require__(9023).debuglog)('midway:core');
exports.PRELOAD_MODULE_KEY = 'INJECTION_PRELOAD_MODULE_KEY';
exports.INJECT_CLASS_KEY_PREFIX = 'INJECTION_CLASS_META_DATA';
class DecoratorManager extends Map {
    constructor() {
        super(...arguments);
        /**
         * the key for meta data store in class
         */
        this.injectClassKeyPrefix = exports.INJECT_CLASS_KEY_PREFIX;
        /**
         * the key for method meta data store in class
         */
        this.injectClassMethodKeyPrefix = 'INJECTION_CLASS_METHOD_META_DATA';
        /**
         * the key for method meta data store in method
         */
        this.injectMethodKeyPrefix = 'INJECTION_METHOD_META_DATA';
    }
    saveModule(key, module) {
        if (this.container) {
            return this.container.saveModule(key, module);
        }
        if (!this.has(key)) {
            this.set(key, new Set());
        }
        this.get(key).add(module);
    }
    listModule(key) {
        if (this.container) {
            return this.container.listModule(key);
        }
        return Array.from(this.get(key) || {});
    }
    resetModule(key) {
        this.set(key, new Set());
    }
    bindContainer(container) {
        this.container = container;
        this.container.transformModule(this);
    }
    static getDecoratorClassKey(decoratorNameKey) {
        return decoratorNameKey.toString() + '_CLS';
    }
    static removeDecoratorClassKeySuffix(decoratorNameKey) {
        return decoratorNameKey.toString().replace('_CLS', '');
    }
    static getDecoratorMethodKey(decoratorNameKey) {
        return decoratorNameKey.toString() + '_METHOD';
    }
    static getDecoratorClsExtendedKey(decoratorNameKey) {
        return decoratorNameKey.toString() + '_EXT';
    }
    static getDecoratorClsMethodPrefix(decoratorNameKey) {
        return decoratorNameKey.toString() + '_CLS_METHOD';
    }
    static getDecoratorClsMethodKey(decoratorNameKey, methodKey) {
        return (DecoratorManager.getDecoratorClsMethodPrefix(decoratorNameKey) +
            ':' +
            methodKey.toString());
    }
    static getDecoratorMethod(decoratorNameKey, methodKey) {
        return (DecoratorManager.getDecoratorMethodKey(decoratorNameKey) +
            '_' +
            methodKey.toString());
    }
    static saveMetadata(metaKey, target, dataKey, data) {
        // filter Object.create(null)
        if (typeof target === 'object' && target.constructor) {
            target = target.constructor;
        }
        let m;
        if (Reflect.hasOwnMetadata(metaKey, target)) {
            m = Reflect.getMetadata(metaKey, target);
        }
        else {
            m = new Map();
        }
        m.set(dataKey, data);
        Reflect.defineMetadata(metaKey, m, target);
    }
    static attachMetadata(metaKey, target, dataKey, data, groupBy, groupMode = 'one') {
        // filter Object.create(null)
        if (typeof target === 'object' && target.constructor) {
            target = target.constructor;
        }
        let m;
        if (Reflect.hasOwnMetadata(metaKey, target)) {
            m = Reflect.getMetadata(metaKey, target);
        }
        else {
            m = new Map();
        }
        if (!m.has(dataKey)) {
            if (groupBy) {
                m.set(dataKey, {});
            }
            else {
                m.set(dataKey, []);
            }
        }
        if (groupBy) {
            if (groupMode === 'one') {
                m.get(dataKey)[groupBy] = data;
            }
            else {
                if (m.get(dataKey)[groupBy]) {
                    m.get(dataKey)[groupBy].push(data);
                }
                else {
                    m.get(dataKey)[groupBy] = [data];
                }
            }
        }
        else {
            m.get(dataKey).push(data);
        }
        Reflect.defineMetadata(metaKey, m, target);
    }
    static getMetadata(metaKey, target, dataKey) {
        // filter Object.create(null)
        if (typeof target === 'object' && target.constructor) {
            target = target.constructor;
        }
        let m;
        if (!Reflect.hasOwnMetadata(metaKey, target)) {
            m = new Map();
            Reflect.defineMetadata(metaKey, m, target);
        }
        else {
            m = Reflect.getMetadata(metaKey, target);
        }
        if (!dataKey) {
            return m;
        }
        return m.get(dataKey);
    }
    /**
     * save meta data to class or property
     * @param decoratorNameKey the alias name for decorator
     * @param data the data you want to store
     * @param target target class
     * @param propertyName
     */
    saveMetadata(decoratorNameKey, data, target, propertyName) {
        if (propertyName) {
            const dataKey = DecoratorManager.getDecoratorMethod(decoratorNameKey, propertyName);
            DecoratorManager.saveMetadata(this.injectMethodKeyPrefix, target, dataKey, data);
        }
        else {
            const dataKey = DecoratorManager.getDecoratorClassKey(decoratorNameKey);
            DecoratorManager.saveMetadata(this.injectClassKeyPrefix, target, dataKey, data);
        }
    }
    /**
     * attach data to class or property
     * @param decoratorNameKey
     * @param data
     * @param target
     * @param propertyName
     * @param groupBy
     */
    attachMetadata(decoratorNameKey, data, target, propertyName, groupBy, groupMode) {
        if (propertyName) {
            const dataKey = DecoratorManager.getDecoratorMethod(decoratorNameKey, propertyName);
            DecoratorManager.attachMetadata(this.injectMethodKeyPrefix, target, dataKey, data, groupBy, groupMode);
        }
        else {
            const dataKey = DecoratorManager.getDecoratorClassKey(decoratorNameKey);
            DecoratorManager.attachMetadata(this.injectClassKeyPrefix, target, dataKey, data, groupBy, groupMode);
        }
    }
    /**
     * get single data from class or property
     * @param decoratorNameKey
     * @param target
     * @param propertyName
     */
    getMetadata(decoratorNameKey, target, propertyName) {
        if (propertyName) {
            const dataKey = DecoratorManager.getDecoratorMethod(decoratorNameKey, propertyName);
            return DecoratorManager.getMetadata(this.injectMethodKeyPrefix, target, dataKey);
        }
        else {
            const dataKey = `${DecoratorManager.getDecoratorClassKey(decoratorNameKey)}`;
            return DecoratorManager.getMetadata(this.injectClassKeyPrefix, target, dataKey);
        }
    }
    /**
     * save property data to class
     * @param decoratorNameKey
     * @param data
     * @param target
     * @param propertyName
     */
    savePropertyDataToClass(decoratorNameKey, data, target, propertyName) {
        const dataKey = DecoratorManager.getDecoratorClsMethodKey(decoratorNameKey, propertyName);
        DecoratorManager.saveMetadata(this.injectClassMethodKeyPrefix, target, dataKey, data);
    }
    /**
     * attach property data to class
     * @param decoratorNameKey
     * @param data
     * @param target
     * @param propertyName
     * @param groupBy
     */
    attachPropertyDataToClass(decoratorNameKey, data, target, propertyName, groupBy) {
        const dataKey = DecoratorManager.getDecoratorClsMethodKey(decoratorNameKey, propertyName);
        DecoratorManager.attachMetadata(this.injectClassMethodKeyPrefix, target, dataKey, data, groupBy);
    }
    /**
     * get property data from class
     * @param decoratorNameKey
     * @param target
     * @param propertyName
     */
    getPropertyDataFromClass(decoratorNameKey, target, propertyName) {
        const dataKey = DecoratorManager.getDecoratorClsMethodKey(decoratorNameKey, propertyName);
        return DecoratorManager.getMetadata(this.injectClassMethodKeyPrefix, target, dataKey);
    }
    /**
     * list property data from class
     * @param decoratorNameKey
     * @param target
     */
    listPropertyDataFromClass(decoratorNameKey, target) {
        const originMap = DecoratorManager.getMetadata(this.injectClassMethodKeyPrefix, target);
        const res = [];
        for (const [key, value] of originMap) {
            if (key.indexOf(DecoratorManager.getDecoratorClsMethodPrefix(decoratorNameKey)) !== -1) {
                res.push(value);
            }
        }
        return res;
    }
}
exports.DecoratorManager = DecoratorManager;
let manager = new DecoratorManager();
if (typeof global === 'object') {
    if (global['MIDWAY_GLOBAL_DECORATOR_MANAGER']) {
        console.warn('DecoratorManager not singleton and please check @midwayjs/core version by "npm ls @midwayjs/core"');
        const coreModulePathList = (0, pathFileUtil_1.getModuleRequirePathList)('@midwayjs/core');
        if (coreModulePathList.length) {
            console.info('The module may be located in:');
            coreModulePathList.forEach((path, index) => {
                console.info(`${index + 1}. ${path}`);
            });
        }
        manager = global['MIDWAY_GLOBAL_DECORATOR_MANAGER'];
    }
    else {
        global['MIDWAY_GLOBAL_DECORATOR_MANAGER'] = manager;
    }
}
/**
 * save data to class
 * @param decoratorNameKey
 * @param data
 * @param target
 * @param mergeIfExist
 */
function saveClassMetadata(decoratorNameKey, data, target, mergeIfExist) {
    if (mergeIfExist && typeof data === 'object') {
        const originData = manager.getMetadata(decoratorNameKey, target);
        if (!originData) {
            return manager.saveMetadata(decoratorNameKey, data, target);
        }
        if (Array.isArray(originData)) {
            return manager.saveMetadata(decoratorNameKey, originData.concat(data), target);
        }
        else {
            return manager.saveMetadata(decoratorNameKey, Object.assign(originData, data), target);
        }
    }
    else {
        return manager.saveMetadata(decoratorNameKey, data, target);
    }
}
exports.saveClassMetadata = saveClassMetadata;
/**
 * attach data to class
 * @param decoratorNameKey
 * @param data
 * @param target
 * @param groupBy
 */
function attachClassMetadata(decoratorNameKey, data, target, groupBy, groupMode) {
    return manager.attachMetadata(decoratorNameKey, data, target, undefined, groupBy, groupMode);
}
exports.attachClassMetadata = attachClassMetadata;
/**
 * get data from class and proto
 * @param decoratorNameKey
 * @param target
 * @param propertyName
 * @param useCache
 */
function getClassExtendedMetadata(decoratorNameKey, target, propertyName, useCache) {
    if (useCache === undefined) {
        useCache = true;
    }
    const extKey = DecoratorManager.getDecoratorClsExtendedKey(decoratorNameKey);
    let metadata = manager.getMetadata(extKey, target, propertyName);
    if (useCache && metadata !== undefined) {
        return metadata;
    }
    const father = Reflect.getPrototypeOf(target);
    if (father && father.constructor !== Object) {
        metadata = (0, util_1.merge)(getClassExtendedMetadata(decoratorNameKey, father, propertyName, useCache), manager.getMetadata(decoratorNameKey, target, propertyName));
    }
    manager.saveMetadata(extKey, metadata || null, target, propertyName);
    return metadata;
}
exports.getClassExtendedMetadata = getClassExtendedMetadata;
/**
 * get data from class
 * @param decoratorNameKey
 * @param target
 */
function getClassMetadata(decoratorNameKey, target) {
    return manager.getMetadata(decoratorNameKey, target);
}
exports.getClassMetadata = getClassMetadata;
/**
 * save property data to class
 * @param decoratorNameKey
 * @param data
 * @param target
 * @param propertyName
 */
function savePropertyDataToClass(decoratorNameKey, data, target, propertyName) {
    return manager.savePropertyDataToClass(decoratorNameKey, data, target, propertyName);
}
exports.savePropertyDataToClass = savePropertyDataToClass;
/**
 * attach property data to class
 * @param decoratorNameKey
 * @param data
 * @param target
 * @param propertyName
 * @param groupBy
 */
function attachPropertyDataToClass(decoratorNameKey, data, target, propertyName, groupBy) {
    return manager.attachPropertyDataToClass(decoratorNameKey, data, target, propertyName, groupBy);
}
exports.attachPropertyDataToClass = attachPropertyDataToClass;
/**
 * get property data from class
 * @param decoratorNameKey
 * @param target
 * @param propertyName
 */
function getPropertyDataFromClass(decoratorNameKey, target, propertyName) {
    return manager.getPropertyDataFromClass(decoratorNameKey, target, propertyName);
}
exports.getPropertyDataFromClass = getPropertyDataFromClass;
/**
 * list property data from class
 * @param decoratorNameKey
 * @param target
 */
function listPropertyDataFromClass(decoratorNameKey, target) {
    return manager.listPropertyDataFromClass(decoratorNameKey, target);
}
exports.listPropertyDataFromClass = listPropertyDataFromClass;
/**
 * save property data
 * @param decoratorNameKey
 * @param data
 * @param target
 * @param propertyName
 */
function savePropertyMetadata(decoratorNameKey, data, target, propertyName) {
    return manager.saveMetadata(decoratorNameKey, data, target, propertyName);
}
exports.savePropertyMetadata = savePropertyMetadata;
/**
 * attach property data
 * @param decoratorNameKey
 * @param data
 * @param target
 * @param propertyName
 */
function attachPropertyMetadata(decoratorNameKey, data, target, propertyName) {
    return manager.attachMetadata(decoratorNameKey, data, target, propertyName);
}
exports.attachPropertyMetadata = attachPropertyMetadata;
/**
 * get property data
 * @param decoratorNameKey
 * @param target
 * @param propertyName
 */
function getPropertyMetadata(decoratorNameKey, target, propertyName) {
    return manager.getMetadata(decoratorNameKey, target, propertyName);
}
exports.getPropertyMetadata = getPropertyMetadata;
/**
 * save preload module by target
 * @param target
 */
function savePreloadModule(target) {
    return saveModule(exports.PRELOAD_MODULE_KEY, target);
}
exports.savePreloadModule = savePreloadModule;
/**
 * list preload module
 */
function listPreloadModule() {
    return listModule(exports.PRELOAD_MODULE_KEY);
}
exports.listPreloadModule = listPreloadModule;
/**
 * save module to inner map
 * @param decoratorNameKey
 * @param target
 */
function saveModule(decoratorNameKey, target) {
    if ((0, types_1.isClass)(target)) {
        saveProviderId(undefined, target);
    }
    return manager.saveModule(decoratorNameKey, target);
}
exports.saveModule = saveModule;
function bindContainer(container) {
    return manager.bindContainer(container);
}
exports.bindContainer = bindContainer;
function clearBindContainer() {
    return (manager.container = null);
}
exports.clearBindContainer = clearBindContainer;
/**
 * list module from decorator key
 * @param decoratorNameKey
 * @param filter
 */
function listModule(decoratorNameKey, filter) {
    const modules = manager.listModule(decoratorNameKey);
    if (filter) {
        return modules.filter(filter);
    }
    else {
        return modules;
    }
}
exports.listModule = listModule;
/**
 * reset module
 * @param decoratorNameKey
 */
function resetModule(decoratorNameKey) {
    return manager.resetModule(decoratorNameKey);
}
exports.resetModule = resetModule;
/**
 * clear all module
 */
function clearAllModule() {
    debug('--- clear all module here ---');
    return manager.clear();
}
exports.clearAllModule = clearAllModule;
function transformTypeFromTSDesign(designFn) {
    if ((0, types_1.isNullOrUndefined)(designFn)) {
        return { name: 'undefined', isBaseType: true, originDesign: designFn };
    }
    switch (designFn.name) {
        case 'String':
            return { name: 'string', isBaseType: true, originDesign: designFn };
        case 'Number':
            return { name: 'number', isBaseType: true, originDesign: designFn };
        case 'Boolean':
            return { name: 'boolean', isBaseType: true, originDesign: designFn };
        case 'Symbol':
            return { name: 'symbol', isBaseType: true, originDesign: designFn };
        case 'Object':
            return { name: 'object', isBaseType: true, originDesign: designFn };
        case 'Function':
            return { name: 'function', isBaseType: true, originDesign: designFn };
        default:
            return {
                name: designFn.name,
                isBaseType: false,
                originDesign: designFn,
            };
    }
}
exports.transformTypeFromTSDesign = transformTypeFromTSDesign;
/**
 * save property inject args
 * @param opts 参数
 */
function savePropertyInject(opts) {
    // 1、use identifier by user
    let identifier = opts.identifier;
    let injectMode = interface_1.InjectModeEnum.Identifier;
    // 2、use identifier by class uuid
    if (!identifier) {
        const type = getPropertyType(opts.target, opts.targetKey);
        if (!type.isBaseType &&
            (0, types_1.isClass)(type.originDesign) &&
            isProvide(type.originDesign)) {
            identifier = getProviderUUId(type.originDesign);
            injectMode = interface_1.InjectModeEnum.Class;
        }
        if (!identifier) {
            // 3、use identifier by property name
            identifier = opts.targetKey;
            injectMode = interface_1.InjectModeEnum.PropertyName;
        }
    }
    attachClassMetadata(constant_1.INJECT_TAG, {
        targetKey: opts.targetKey,
        value: identifier,
        args: opts.args,
        injectMode,
    }, opts.target, opts.targetKey);
}
exports.savePropertyInject = savePropertyInject;
/**
 * get property inject args
 * @param target
 * @param useCache
 */
function getPropertyInject(target, useCache) {
    return getClassExtendedMetadata(constant_1.INJECT_TAG, target, undefined, useCache);
}
exports.getPropertyInject = getPropertyInject;
/**
 * save class object definition
 * @param target class
 * @param props property data
 */
function saveObjectDefinition(target, props = {}) {
    saveClassMetadata(constant_1.OBJ_DEF_CLS, props, target, true);
    return target;
}
exports.saveObjectDefinition = saveObjectDefinition;
/**
 * get class object definition from metadata
 * @param target
 */
function getObjectDefinition(target) {
    return getClassExtendedMetadata(constant_1.OBJ_DEF_CLS, target);
}
exports.getObjectDefinition = getObjectDefinition;
/**
 * class provider id
 * @param identifier id
 * @param target class
 */
function saveProviderId(identifier, target) {
    if (isProvide(target)) {
        if (identifier) {
            const meta = getClassMetadata(constant_1.TAGGED_CLS, target);
            if (meta.id !== identifier) {
                meta.id = identifier;
                // save class id and uuid
                saveClassMetadata(constant_1.TAGGED_CLS, meta, target);
                debug(`update provide: ${target.name} -> ${meta.uuid}`);
            }
        }
    }
    else {
        // save
        const uuid = (0, util_1.generateRandomId)();
        // save class id and uuid
        saveClassMetadata(constant_1.TAGGED_CLS, {
            id: identifier,
            originName: target.name,
            uuid,
            name: (0, camelCase_1.camelCase)(target.name),
        }, target);
        debug(`save provide: ${target.name} -> ${uuid}`);
    }
    return target;
}
exports.saveProviderId = saveProviderId;
/**
 * get provider id from module
 * @param module
 */
function getProviderId(module) {
    const metaData = getClassMetadata(constant_1.TAGGED_CLS, module);
    if (metaData && metaData.id) {
        return metaData.id;
    }
}
exports.getProviderId = getProviderId;
function getProviderName(module) {
    const metaData = getClassMetadata(constant_1.TAGGED_CLS, module);
    if (metaData && metaData.name) {
        return metaData.name;
    }
}
exports.getProviderName = getProviderName;
/**
 * get provider uuid from module
 * @param module
 */
function getProviderUUId(module) {
    const metaData = getClassMetadata(constant_1.TAGGED_CLS, module);
    if (metaData && metaData.uuid) {
        return metaData.uuid;
    }
}
exports.getProviderUUId = getProviderUUId;
/**
 * use @Provide decorator or not
 * @param target class
 */
function isProvide(target) {
    return !!getClassMetadata(constant_1.TAGGED_CLS, target);
}
exports.isProvide = isProvide;
var BaseType;
(function (BaseType) {
    BaseType["Boolean"] = "boolean";
    BaseType["Number"] = "number";
    BaseType["String"] = "string";
})(BaseType = exports.BaseType || (exports.BaseType = {}));
/**
 * get parameters type by reflect-metadata
 */
function getMethodParamTypes(target, methodName) {
    if ((0, types_1.isClass)(target)) {
        target = target.prototype;
    }
    return Reflect.getMetadata('design:paramtypes', target, methodName);
}
exports.getMethodParamTypes = getMethodParamTypes;
/**
 * get property(method) type from metadata
 * @param target
 * @param methodName
 */
function getPropertyType(target, methodName) {
    return transformTypeFromTSDesign(Reflect.getMetadata('design:type', target, methodName));
}
exports.getPropertyType = getPropertyType;
/**
 * get method return type from metadata
 * @param target
 * @param methodName
 */
function getMethodReturnTypes(target, methodName) {
    if ((0, types_1.isClass)(target)) {
        target = target.prototype;
    }
    return Reflect.getMetadata('design:returntype', target, methodName);
}
exports.getMethodReturnTypes = getMethodReturnTypes;
/**
 * create a custom property inject
 * @param decoratorKey
 * @param metadata
 * @param impl default true, configuration need decoratorService.registerMethodHandler
 */
function createCustomPropertyDecorator(decoratorKey, metadata, impl = true) {
    return function (target, propertyName) {
        attachClassMetadata(constant_1.INJECT_CUSTOM_PROPERTY, {
            propertyName,
            key: decoratorKey,
            metadata,
            impl,
        }, target, propertyName);
    };
}
exports.createCustomPropertyDecorator = createCustomPropertyDecorator;
/**
 *
 * @param decoratorKey
 * @param metadata
 * @param impl default true, configuration need decoratorService.registerMethodHandler
 */
function createCustomMethodDecorator(decoratorKey, metadata, implOrOptions = { impl: true }) {
    if (typeof implOrOptions === 'boolean') {
        implOrOptions = { impl: implOrOptions };
    }
    if (implOrOptions.impl === undefined) {
        implOrOptions.impl = true;
    }
    return function (target, propertyName, descriptor) {
        attachClassMetadata(constant_1.INJECT_CUSTOM_METHOD, {
            propertyName,
            key: decoratorKey,
            metadata,
            options: implOrOptions,
        }, target);
    };
}
exports.createCustomMethodDecorator = createCustomMethodDecorator;
/**
 *
 * @param decoratorKey
 * @param metadata
 * @param options
 */
function createCustomParamDecorator(decoratorKey, metadata, implOrOptions = { impl: true }) {
    if (typeof implOrOptions === 'boolean') {
        implOrOptions = { impl: implOrOptions };
    }
    if (implOrOptions.impl === undefined) {
        implOrOptions.impl = true;
    }
    return function (target, propertyName, parameterIndex) {
        attachClassMetadata(constant_1.INJECT_CUSTOM_PARAM, {
            key: decoratorKey,
            parameterIndex,
            propertyName,
            metadata,
            options: implOrOptions,
        }, target, propertyName, 'multi');
    };
}
exports.createCustomParamDecorator = createCustomParamDecorator;
//# sourceMappingURL=decoratorManager.js.map

/***/ }),

/***/ 719:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ServerlessTrigger = exports.ServerlessFunction = void 0;
const __1 = __nccwpck_require__(8351);
const interface_1 = __nccwpck_require__(7270);
function ServerlessFunction(options) {
    return (target, key, descriptor) => {
        (0, __1.savePropertyMetadata)(__1.SERVERLESS_FUNC_KEY, options, target, key);
    };
}
exports.ServerlessFunction = ServerlessFunction;
function ServerlessTrigger(type, metadata = {}) {
    return (target, functionName, descriptor) => {
        var _a;
        if (type === interface_1.ServerlessTriggerType.HTTP ||
            type === interface_1.ServerlessTriggerType.API_GATEWAY) {
            metadata['method'] = (_a = metadata['method']) !== null && _a !== void 0 ? _a : 'get';
        }
        (0, __1.saveModule)(__1.FUNC_KEY, target.constructor);
        // new method decorator
        metadata = metadata || {};
        (0, __1.attachClassMetadata)(__1.FUNC_KEY, {
            type,
            methodName: functionName,
            metadata,
        }, target);
    };
}
exports.ServerlessTrigger = ServerlessTrigger;
//# sourceMappingURL=serverlessTrigger.js.map

/***/ }),

/***/ 8351:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// common
__exportStar(__nccwpck_require__(6960), exports);
__exportStar(__nccwpck_require__(7216), exports);
__exportStar(__nccwpck_require__(4767), exports);
__exportStar(__nccwpck_require__(6409), exports);
__exportStar(__nccwpck_require__(4166), exports);
__exportStar(__nccwpck_require__(5963), exports);
__exportStar(__nccwpck_require__(2139), exports);
__exportStar(__nccwpck_require__(2629), exports);
__exportStar(__nccwpck_require__(9183), exports);
__exportStar(__nccwpck_require__(2801), exports);
__exportStar(__nccwpck_require__(6748), exports);
__exportStar(__nccwpck_require__(2765), exports);
__exportStar(__nccwpck_require__(8735), exports);
// faas
__exportStar(__nccwpck_require__(719), exports);
// web
__exportStar(__nccwpck_require__(4016), exports);
__exportStar(__nccwpck_require__(3565), exports);
__exportStar(__nccwpck_require__(3697), exports);
__exportStar(__nccwpck_require__(6915), exports);
// other
__exportStar(__nccwpck_require__(6695), exports);
__exportStar(__nccwpck_require__(7679), exports);
// microservice
__exportStar(__nccwpck_require__(8783), exports);
__exportStar(__nccwpck_require__(6682), exports);
__exportStar(__nccwpck_require__(9941), exports);
__exportStar(__nccwpck_require__(1681), exports);
// rpc
__exportStar(__nccwpck_require__(5550), exports);
// task
__exportStar(__nccwpck_require__(6558), exports);
__exportStar(__nccwpck_require__(8036), exports);
__exportStar(__nccwpck_require__(657), exports);
__exportStar(__nccwpck_require__(9916), exports);
// ws
__exportStar(__nccwpck_require__(8485), exports);
__exportStar(__nccwpck_require__(425), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 8783:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Consumer = void 0;
const __1 = __nccwpck_require__(8351);
const interface_1 = __nccwpck_require__(7270);
function Consumer(type, options = {}) {
    return (target) => {
        (0, __1.saveModule)(__1.MS_CONSUMER_KEY, target);
        (0, __1.saveClassMetadata)(__1.MS_CONSUMER_KEY, {
            type,
            metadata: options,
        }, target);
        (0, __1.Scope)(interface_1.ScopeEnum.Request)(target);
        (0, __1.Provide)()(target);
    };
}
exports.Consumer = Consumer;
//# sourceMappingURL=consumer.js.map

/***/ }),

/***/ 1681:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.KafkaListener = void 0;
const __1 = __nccwpck_require__(8351);
function KafkaListener(topic, options = {}) {
    return (target, propertyKey) => {
        options.topic = topic;
        options.propertyKey = propertyKey;
        (0, __1.attachPropertyDataToClass)(__1.MS_CONSUMER_KEY, options, target, propertyKey);
    };
}
exports.KafkaListener = KafkaListener;
//# sourceMappingURL=kafkaListener.js.map

/***/ }),

/***/ 6682:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DubboMethod = exports.GrpcMethod = exports.GrpcStreamTypeEnum = exports.Provider = void 0;
const __1 = __nccwpck_require__(8351);
const interface_1 = __nccwpck_require__(7270);
function Provider(type, metadata = {}) {
    return (target) => {
        (0, __1.saveModule)(__1.MS_PROVIDER_KEY, target);
        (0, __1.saveClassMetadata)(__1.MS_PROVIDER_KEY, {
            type,
            metadata,
        }, target);
        (0, __1.Scope)(interface_1.ScopeEnum.Request)(target);
        (0, __1.Provide)()(target);
    };
}
exports.Provider = Provider;
var GrpcStreamTypeEnum;
(function (GrpcStreamTypeEnum) {
    GrpcStreamTypeEnum["BASE"] = "base";
    GrpcStreamTypeEnum["DUPLEX"] = "ServerDuplexStream";
    GrpcStreamTypeEnum["READABLE"] = "ServerReadableStream";
    GrpcStreamTypeEnum["WRITEABLE"] = "ServerWritableStream";
})(GrpcStreamTypeEnum = exports.GrpcStreamTypeEnum || (exports.GrpcStreamTypeEnum = {}));
function GrpcMethod(methodOptions = {}) {
    return (target, propertyName, descriptor) => {
        if (!methodOptions.type) {
            methodOptions.type = GrpcStreamTypeEnum.BASE;
        }
        (0, __1.savePropertyMetadata)(__1.MS_GRPC_METHOD_KEY, {
            methodName: methodOptions.methodName || propertyName,
            type: methodOptions.type,
            onEnd: methodOptions.onEnd,
        }, target, propertyName);
        return descriptor;
    };
}
exports.GrpcMethod = GrpcMethod;
function DubboMethod(methodName) {
    return (target, propertyName, descriptor) => {
        (0, __1.attachClassMetadata)(__1.MS_DUBBO_METHOD_KEY, {
            methodName: methodName || propertyName,
        }, target);
        return descriptor;
    };
}
exports.DubboMethod = DubboMethod;
//# sourceMappingURL=provider.js.map

/***/ }),

/***/ 9941:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RabbitMQListener = void 0;
const __1 = __nccwpck_require__(8351);
function RabbitMQListener(queueName, options = {}) {
    return (target, propertyKey) => {
        options.queueName = queueName;
        options.propertyKey = propertyKey;
        (0, __1.attachPropertyDataToClass)(__1.MS_CONSUMER_KEY, options, target, propertyKey);
    };
}
exports.RabbitMQListener = RabbitMQListener;
//# sourceMappingURL=rabbitmqListener.js.map

/***/ }),

/***/ 5550:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HSF = void 0;
const __1 = __nccwpck_require__(8351);
const interface_1 = __nccwpck_require__(7270);
/**
 * @Deprecated
 * @param hsfOption
 * @constructor
 */
function HSF(hsfOption = {}) {
    return (target) => {
        (0, __1.saveModule)(__1.HSF_KEY, target);
        (0, __1.saveClassMetadata)(__1.HSF_KEY, hsfOption, target);
        (0, __1.Scope)(interface_1.ScopeEnum.Request)(target);
        (0, __1.Provide)()(target);
    };
}
exports.HSF = HSF;
//# sourceMappingURL=hsf.js.map

/***/ }),

/***/ 6558:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Queue = void 0;
const __1 = __nccwpck_require__(8351);
const constant_1 = __nccwpck_require__(6695);
function Queue(options) {
    return function (target) {
        (0, __1.saveModule)(constant_1.MODULE_TASK_QUEUE_KEY, target);
        (0, __1.saveClassMetadata)(constant_1.MODULE_TASK_QUEUE_OPTIONS, {
            options,
            name: target.name,
        }, target);
        (0, __1.Provide)()(target);
    };
}
exports.Queue = Queue;
//# sourceMappingURL=queue.js.map

/***/ }),

/***/ 9916:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Schedule = void 0;
const __1 = __nccwpck_require__(8351);
const interface_1 = __nccwpck_require__(7270);
function Schedule(scheduleOpts) {
    return function (target) {
        (0, __1.saveModule)(__1.SCHEDULE_KEY, target);
        (0, __1.saveClassMetadata)(__1.SCHEDULE_KEY, scheduleOpts, target);
        (0, __1.Scope)(interface_1.ScopeEnum.Request)(target);
        (0, __1.Provide)()(target);
    };
}
exports.Schedule = Schedule;
//# sourceMappingURL=schedule.js.map

/***/ }),

/***/ 8036:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Task = void 0;
const __1 = __nccwpck_require__(8351);
const constant_1 = __nccwpck_require__(6695);
function Task(options) {
    return function (target, propertyKey, descriptor) {
        (0, __1.saveModule)(constant_1.MODULE_TASK_KEY, target.constructor);
        (0, __1.attachClassMetadata)(constant_1.MODULE_TASK_METADATA, {
            options,
            propertyKey,
            value: descriptor.value,
            name: target.constructor.name,
        }, target);
    };
}
exports.Task = Task;
//# sourceMappingURL=task.js.map

/***/ }),

/***/ 657:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TaskLocal = void 0;
const __1 = __nccwpck_require__(8351);
const constant_1 = __nccwpck_require__(6695);
function TaskLocal(options) {
    return function (target, propertyKey, descriptor) {
        (0, __1.saveModule)(constant_1.MODULE_TASK_TASK_LOCAL_KEY, target.constructor);
        (0, __1.attachClassMetadata)(constant_1.MODULE_TASK_TASK_LOCAL_OPTIONS, {
            options,
            propertyKey,
            value: descriptor.value,
        }, target);
    };
}
exports.TaskLocal = TaskLocal;
//# sourceMappingURL=taskLocal.js.map

/***/ }),

/***/ 4016:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Controller = void 0;
const __1 = __nccwpck_require__(8351);
const interface_1 = __nccwpck_require__(7270);
function Controller(prefix = '/', routerOptions = { middleware: [], sensitive: true }) {
    return (target) => {
        (0, __1.saveModule)(__1.CONTROLLER_KEY, target);
        if (prefix)
            (0, __1.saveClassMetadata)(__1.CONTROLLER_KEY, {
                prefix,
                routerOptions,
            }, target);
        (0, __1.Scope)(interface_1.ScopeEnum.Request)(target);
        (0, __1.Provide)()(target);
    };
}
exports.Controller = Controller;
//# sourceMappingURL=controller.js.map

/***/ }),

/***/ 3565:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Fields = exports.Queries = exports.RequestIP = exports.RequestPath = exports.Files = exports.File = exports.Headers = exports.Param = exports.Query = exports.Body = exports.Session = exports.createRequestParamDecorator = exports.RouteParamTypes = void 0;
const __1 = __nccwpck_require__(8351);
var RouteParamTypes;
(function (RouteParamTypes) {
    RouteParamTypes["QUERY"] = "query";
    RouteParamTypes["BODY"] = "body";
    RouteParamTypes["PARAM"] = "param";
    RouteParamTypes["HEADERS"] = "headers";
    RouteParamTypes["SESSION"] = "session";
    RouteParamTypes["FILESTREAM"] = "file_stream";
    RouteParamTypes["FILESSTREAM"] = "files_stream";
    RouteParamTypes["NEXT"] = "next";
    RouteParamTypes["REQUEST_PATH"] = "request_path";
    RouteParamTypes["REQUEST_IP"] = "request_ip";
    RouteParamTypes["QUERIES"] = "queries";
    RouteParamTypes["FIELDS"] = "fields";
    RouteParamTypes["CUSTOM"] = "custom";
})(RouteParamTypes = exports.RouteParamTypes || (exports.RouteParamTypes = {}));
const createParamMapping = function (type) {
    return (propertyOrPipes, options = {}) => {
        let propertyData = propertyOrPipes;
        if (Array.isArray(propertyOrPipes) && options.pipes === undefined) {
            options.pipes = propertyOrPipes;
            propertyData = undefined;
        }
        return (0, __1.createCustomParamDecorator)(__1.WEB_ROUTER_PARAM_KEY, {
            type,
            propertyData,
        }, options);
    };
};
const createRequestParamDecorator = function (transform, pipesOrOptions) {
    pipesOrOptions = pipesOrOptions || {};
    if (Array.isArray(pipesOrOptions)) {
        pipesOrOptions = {
            pipes: pipesOrOptions,
        };
    }
    return createParamMapping(RouteParamTypes.CUSTOM)(transform, pipesOrOptions);
};
exports.createRequestParamDecorator = createRequestParamDecorator;
const Session = (propertyOrPipes, pipes) => createParamMapping(RouteParamTypes.SESSION)(propertyOrPipes, { pipes });
exports.Session = Session;
const Body = (propertyOrPipes, pipes) => createParamMapping(RouteParamTypes.BODY)(propertyOrPipes, { pipes });
exports.Body = Body;
const Query = (propertyOrPipes, pipes) => createParamMapping(RouteParamTypes.QUERY)(propertyOrPipes, { pipes });
exports.Query = Query;
const Param = (propertyOrPipes, pipes) => createParamMapping(RouteParamTypes.PARAM)(propertyOrPipes, { pipes });
exports.Param = Param;
const Headers = (propertyOrPipes, pipes) => createParamMapping(RouteParamTypes.HEADERS)(propertyOrPipes, { pipes });
exports.Headers = Headers;
const File = (propertyOrPipes, pipes) => createParamMapping(RouteParamTypes.FILESTREAM)(propertyOrPipes, { pipes });
exports.File = File;
const Files = (propertyOrPipes, pipes) => createParamMapping(RouteParamTypes.FILESSTREAM)(propertyOrPipes, { pipes });
exports.Files = Files;
const RequestPath = (pipes) => createParamMapping(RouteParamTypes.REQUEST_PATH)(undefined, { pipes });
exports.RequestPath = RequestPath;
const RequestIP = (pipes) => createParamMapping(RouteParamTypes.REQUEST_IP)(undefined, { pipes });
exports.RequestIP = RequestIP;
const Queries = (propertyOrPipes, pipes) => createParamMapping(RouteParamTypes.QUERIES)(propertyOrPipes, { pipes });
exports.Queries = Queries;
const Fields = (propertyOrPipes, pipes) => createParamMapping(RouteParamTypes.FIELDS)(propertyOrPipes, { pipes });
exports.Fields = Fields;
//# sourceMappingURL=paramMapping.js.map

/***/ }),

/***/ 3697:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.All = exports.Head = exports.Options = exports.Patch = exports.Put = exports.Del = exports.Get = exports.Post = exports.RequestMapping = exports.RequestMethod = void 0;
/**
 * 'HEAD', 'OPTIONS', 'GET', 'PUT', 'PATCH', 'POST', 'DELETE' 封装
 */
const __1 = __nccwpck_require__(8351);
exports.RequestMethod = {
    GET: 'get',
    POST: 'post',
    PUT: 'put',
    DELETE: 'delete',
    PATCH: 'patch',
    ALL: 'all',
    OPTIONS: 'options',
    HEAD: 'head',
};
const defaultMetadata = {
    path: '/',
    requestMethod: exports.RequestMethod.GET,
    routerName: null,
    middleware: [],
};
const RequestMapping = (metadata = defaultMetadata) => {
    const path = metadata.path || '/';
    const requestMethod = metadata.requestMethod || exports.RequestMethod.GET;
    const routerName = metadata.routerName;
    const middleware = metadata.middleware;
    return (target, key, descriptor) => {
        var _a;
        (0, __1.attachClassMetadata)(__1.WEB_ROUTER_KEY, {
            path,
            requestMethod,
            routerName,
            method: key,
            middleware,
            summary: (metadata === null || metadata === void 0 ? void 0 : metadata.summary) || '',
            description: (metadata === null || metadata === void 0 ? void 0 : metadata.description) || '',
            ignoreGlobalPrefix: (_a = metadata === null || metadata === void 0 ? void 0 : metadata.ignoreGlobalPrefix) !== null && _a !== void 0 ? _a : false,
        }, target);
        return descriptor;
    };
};
exports.RequestMapping = RequestMapping;
const createMappingDecorator = (method) => (path, routerOptions = { middleware: [] }) => {
    return (0, exports.RequestMapping)(Object.assign(routerOptions, {
        requestMethod: method,
        path,
    }));
};
/**
 * Routes HTTP POST requests to the specified path.
 */
exports.Post = createMappingDecorator(exports.RequestMethod.POST);
/**
 * Routes HTTP GET requests to the specified path.
 */
exports.Get = createMappingDecorator(exports.RequestMethod.GET);
/**
 * Routes HTTP DELETE requests to the specified path.
 */
exports.Del = createMappingDecorator(exports.RequestMethod.DELETE);
/**
 * Routes HTTP PUT requests to the specified path.
 */
exports.Put = createMappingDecorator(exports.RequestMethod.PUT);
/**
 * Routes HTTP PATCH requests to the specified path.
 */
exports.Patch = createMappingDecorator(exports.RequestMethod.PATCH);
/**
 * Routes HTTP OPTIONS requests to the specified path.
 */
exports.Options = createMappingDecorator(exports.RequestMethod.OPTIONS);
/**
 * Routes HTTP HEAD requests to the specified path.
 */
exports.Head = createMappingDecorator(exports.RequestMethod.HEAD);
/**
 * Routes all HTTP requests to the specified path.
 */
exports.All = createMappingDecorator(exports.RequestMethod.ALL);
//# sourceMappingURL=requestMapping.js.map

/***/ }),

/***/ 6915:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createRender = exports.ContentType = exports.SetHeader = exports.HttpCode = exports.Redirect = void 0;
const __1 = __nccwpck_require__(8351);
function Redirect(url, code = 302) {
    return (target, key, descriptor) => {
        (0, __1.attachPropertyMetadata)(__1.WEB_RESPONSE_KEY, {
            type: __1.WEB_RESPONSE_REDIRECT,
            url,
            code,
        }, target, key);
        return descriptor;
    };
}
exports.Redirect = Redirect;
function HttpCode(code) {
    return (target, key, descriptor) => {
        (0, __1.attachPropertyMetadata)(__1.WEB_RESPONSE_KEY, {
            type: __1.WEB_RESPONSE_HTTP_CODE,
            code,
        }, target, key);
        return descriptor;
    };
}
exports.HttpCode = HttpCode;
function SetHeader(headerKey, value) {
    return (target, key, descriptor) => {
        let headerObject = {};
        if (value) {
            headerObject[headerKey] = value;
        }
        else {
            headerObject = headerKey;
        }
        (0, __1.attachPropertyMetadata)(__1.WEB_RESPONSE_KEY, {
            type: __1.WEB_RESPONSE_HEADER,
            setHeaders: headerObject,
        }, target, key);
        return descriptor;
    };
}
exports.SetHeader = SetHeader;
function ContentType(contentType) {
    return (target, key, descriptor) => {
        (0, __1.attachPropertyMetadata)(__1.WEB_RESPONSE_KEY, {
            type: __1.WEB_RESPONSE_CONTENT_TYPE,
            contentType,
        }, target, key);
        return descriptor;
    };
}
exports.ContentType = ContentType;
function createRender(RenderEngine) {
    return (templateName) => {
        return (target, key, descriptor) => {
            (0, __1.attachPropertyMetadata)(__1.WEB_RESPONSE_KEY, {
                type: __1.WEB_RESPONSE_RENDER,
                templateName,
            }, target, key);
            return descriptor;
        };
    };
}
exports.createRender = createRender;
//# sourceMappingURL=response.js.map

/***/ }),

/***/ 8485:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WSController = void 0;
const __1 = __nccwpck_require__(8351);
const interface_1 = __nccwpck_require__(7270);
function WSController(namespace = '/', routerOptions = {
    middleware: [],
    connectionMiddleware: [],
}) {
    return (target) => {
        (0, __1.saveModule)(__1.WS_CONTROLLER_KEY, target);
        (0, __1.saveClassMetadata)(__1.WS_CONTROLLER_KEY, {
            namespace,
            routerOptions,
        }, target);
        (0, __1.Scope)(interface_1.ScopeEnum.Request)(target);
        (0, __1.Provide)()(target);
    };
}
exports.WSController = WSController;
//# sourceMappingURL=webSocketController.js.map

/***/ }),

/***/ 425:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OnConnection = exports.OnDisConnection = exports.Emit = exports.OnMessage = exports.WSBroadCast = exports.WSEmit = exports.OnWSMessage = exports.OnWSDisConnection = exports.OnWSConnection = exports.WSEventTypeEnum = void 0;
const __1 = __nccwpck_require__(8351);
var WSEventTypeEnum;
(function (WSEventTypeEnum) {
    WSEventTypeEnum["ON_CONNECTION"] = "ws:onConnection";
    WSEventTypeEnum["ON_DISCONNECTION"] = "ws:onDisconnection";
    WSEventTypeEnum["ON_MESSAGE"] = "ws:onMessage";
    WSEventTypeEnum["ON_SOCKET_ERROR"] = "ws:onSocketError";
    WSEventTypeEnum["EMIT"] = "ws:Emit";
    WSEventTypeEnum["BROADCAST"] = "ws:broadcast";
})(WSEventTypeEnum = exports.WSEventTypeEnum || (exports.WSEventTypeEnum = {}));
function OnWSConnection(eventOptions = {}) {
    return (target, propertyKey, descriptor) => {
        (0, __1.attachClassMetadata)(__1.WS_EVENT_KEY, {
            eventType: WSEventTypeEnum.ON_CONNECTION,
            propertyName: propertyKey,
            eventOptions,
            descriptor,
        }, target.constructor);
    };
}
exports.OnWSConnection = OnWSConnection;
function OnWSDisConnection() {
    return (target, propertyKey, descriptor) => {
        (0, __1.attachClassMetadata)(__1.WS_EVENT_KEY, {
            eventType: WSEventTypeEnum.ON_DISCONNECTION,
            propertyName: propertyKey,
            descriptor,
        }, target.constructor);
    };
}
exports.OnWSDisConnection = OnWSDisConnection;
function OnWSMessage(eventName, eventOptions = {}) {
    return (target, propertyKey, descriptor) => {
        (0, __1.attachClassMetadata)(__1.WS_EVENT_KEY, {
            eventType: WSEventTypeEnum.ON_MESSAGE,
            messageEventName: eventName,
            propertyName: propertyKey,
            eventOptions,
            descriptor,
        }, target.constructor);
    };
}
exports.OnWSMessage = OnWSMessage;
function WSEmit(messageName, roomName = []) {
    return (target, propertyKey, descriptor) => {
        (0, __1.attachClassMetadata)(__1.WS_EVENT_KEY, {
            eventType: WSEventTypeEnum.EMIT,
            propertyName: propertyKey,
            messageEventName: messageName,
            roomName: [].concat(roomName),
            descriptor,
        }, target.constructor);
    };
}
exports.WSEmit = WSEmit;
function WSBroadCast(messageName = '', roomName = []) {
    return (target, propertyKey, descriptor) => {
        (0, __1.attachClassMetadata)(__1.WS_EVENT_KEY, {
            eventType: WSEventTypeEnum.BROADCAST,
            propertyName: propertyKey,
            messageEventName: messageName,
            roomName: [].concat(roomName),
            descriptor,
        }, target.constructor);
    };
}
exports.WSBroadCast = WSBroadCast;
/**
 * @deprecated please use @OnWSMessage
 */
exports.OnMessage = OnWSMessage;
/**
 * @deprecated please use @WSEmit
 */
exports.Emit = WSEmit;
/**
 * @deprecated please use @OnWSDisConnection
 */
exports.OnDisConnection = OnWSDisConnection;
/**
 * @deprecated please use @OnWSConnection
 */
exports.OnConnection = OnWSConnection;
//# sourceMappingURL=webSocketEvent.js.map

/***/ }),

/***/ 6271:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FunctionDefinition = void 0;
const interface_1 = __nccwpck_require__(7270);
const objectCreator_1 = __nccwpck_require__(8797);
class FunctionWrapperCreator extends objectCreator_1.ObjectCreator {
    doConstruct(Clzz, args, context) {
        if (!Clzz) {
            return null;
        }
        return Clzz(context, args);
    }
    async doConstructAsync(Clzz, args, context) {
        if (!Clzz) {
            return null;
        }
        return Clzz(context, args);
    }
}
class FunctionDefinition {
    constructor() {
        this.constructorArgs = [];
        this.namespace = '';
        this.asynchronous = true;
        this.handlerProps = [];
        this.allowDowngrade = false;
        // 函数工厂创建的对象默认不需要自动装配
        this.innerAutowire = false;
        this.innerScope = interface_1.ScopeEnum.Singleton;
        this.creator = new FunctionWrapperCreator(this);
    }
    getAttr(key) { }
    hasAttr(key) {
        return false;
    }
    hasConstructorArgs() {
        return false;
    }
    hasDependsOn() {
        return false;
    }
    isAsync() {
        return this.asynchronous;
    }
    isDirect() {
        return false;
    }
    isExternal() {
        return false;
    }
    set scope(scope) {
        this.innerScope = scope;
    }
    isSingletonScope() {
        return this.innerScope === interface_1.ScopeEnum.Singleton;
    }
    isRequestScope() {
        return this.innerScope === interface_1.ScopeEnum.Request;
    }
    setAttr(key, value) { }
}
exports.FunctionDefinition = FunctionDefinition;
//# sourceMappingURL=functionDefinition.js.map

/***/ }),

/***/ 8797:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ObjectCreator = void 0;
const error_1 = __nccwpck_require__(6248);
const types_1 = __nccwpck_require__(3171);
class ObjectCreator {
    constructor(definition) {
        this.definition = definition;
    }
    /**
     * 加载对象class
     * @returns {class} Clzz对象的Class
     */
    load() {
        let Clzz = null;
        if (typeof this.definition.path === 'string') {
            // 解析xml结果 默认 path = '' 需要兼容处理掉
            if (!this.definition.path) {
                return Clzz;
            }
            const path = this.definition.path;
            if (this.definition.export) {
                Clzz = require(path)[this.definition.export];
            }
            else {
                Clzz = require(path);
            }
        }
        else {
            // if it is class and return direct
            Clzz = this.definition.path;
        }
        return Clzz;
    }
    /**
     * 构建对象实例
     * @param Clzz 对象class，通过load加载
     * @param args 对象初始化参数
     * @returns {any} 返回创建的对象实例
     */
    doConstruct(Clzz, args) {
        if (!Clzz) {
            return Object.create(null);
        }
        let inst;
        if (this.definition.constructMethod) {
            // eslint-disable-next-line prefer-spread
            inst = Clzz[this.definition.constructMethod].apply(Clzz, args);
        }
        else {
            inst = Reflect.construct(Clzz, args);
        }
        return inst;
    }
    /**
     * 异步构造对象
     * @param Clzz 对象class，通过load加载
     * @param args 对象初始化参数
     * @returns {any} 返回创建的对象实例
     */
    async doConstructAsync(Clzz, args) {
        if (!Clzz) {
            return Object.create(null);
        }
        let inst;
        if (this.definition.constructMethod) {
            const fn = Clzz[this.definition.constructMethod];
            if (types_1.Types.isAsyncFunction(fn)) {
                inst = await fn.apply(Clzz, args);
            }
            else {
                inst = fn.apply(Clzz, args);
            }
        }
        else {
            inst = Reflect.construct(Clzz, args);
        }
        return inst;
    }
    /**
     * 调用对象初始化方法进行初始化
     * @param obj 对象，由doConstruct返回
     * @returns {void}
     */
    doInit(obj) {
        const inst = obj;
        // after properties set then do init
        if (this.definition.initMethod && inst[this.definition.initMethod]) {
            if (types_1.Types.isGeneratorFunction(inst[this.definition.initMethod]) ||
                types_1.Types.isAsyncFunction(inst[this.definition.initMethod])) {
                throw new error_1.MidwayUseWrongMethodError('context.get', 'context.getAsync', this.definition.id);
            }
            else {
                const rt = inst[this.definition.initMethod].call(inst);
                if (types_1.Types.isPromise(rt)) {
                    throw new error_1.MidwayUseWrongMethodError('context.get', 'context.getAsync', this.definition.id);
                }
            }
        }
    }
    /**
     * 调用对象初始化方法进行初始化
     * @param obj 对象，由doConstructAsync返回
     * @returns {void}
     */
    async doInitAsync(obj) {
        const inst = obj;
        if (this.definition.initMethod && inst[this.definition.initMethod]) {
            const initFn = inst[this.definition.initMethod];
            if (types_1.Types.isAsyncFunction(initFn)) {
                await initFn.call(inst);
            }
            else {
                if (initFn.length === 1) {
                    await new Promise(resolve => {
                        initFn.call(inst, resolve);
                    });
                }
                else {
                    initFn.call(inst);
                }
            }
        }
    }
    /**
     * 对象销毁
     * @param obj 对象，由doConstruct返回
     * @returns {void}
     */
    doDestroy(obj) {
        if (this.definition.destroyMethod && obj[this.definition.destroyMethod]) {
            obj[this.definition.destroyMethod].call(obj);
        }
    }
    /**
     * 对象销毁
     * @param obj 对象，由doConstructAsync返回
     * @returns {void}
     */
    async doDestroyAsync(obj) {
        if (this.definition.destroyMethod && obj[this.definition.destroyMethod]) {
            const fn = obj[this.definition.destroyMethod];
            if (types_1.Types.isAsyncFunction(fn)) {
                await fn.call(obj);
            }
            else {
                if (fn.length === 1) {
                    await new Promise(resolve => {
                        fn.call(obj, resolve);
                    });
                }
                else {
                    fn.call(obj);
                }
            }
        }
    }
}
exports.ObjectCreator = ObjectCreator;
//# sourceMappingURL=objectCreator.js.map

/***/ }),

/***/ 8028:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ObjectDefinition = void 0;
const interface_1 = __nccwpck_require__(7270);
const properties_1 = __nccwpck_require__(9855);
const objectCreator_1 = __nccwpck_require__(8797);
/* tslint:disable:variable-name */
class ObjectDefinition {
    constructor() {
        this._attrs = new Map();
        this._asynchronous = false;
        this.scope = interface_1.ScopeEnum.Singleton;
        this.creator = null;
        this.id = null;
        this.name = null;
        this.initMethod = null;
        this.destroyMethod = null;
        this.constructMethod = null;
        this.constructorArgs = [];
        this.path = null;
        this.export = null;
        this.dependsOn = [];
        this.properties = new properties_1.ObjectProperties();
        this.namespace = '';
        this.handlerProps = [];
        this.allowDowngrade = false;
        this.creator = new objectCreator_1.ObjectCreator(this);
    }
    set asynchronous(asynchronous) {
        this._asynchronous = asynchronous;
    }
    isAsync() {
        return this._asynchronous;
    }
    isSingletonScope() {
        return this.scope === interface_1.ScopeEnum.Singleton;
    }
    isRequestScope() {
        return this.scope === interface_1.ScopeEnum.Request;
    }
    hasDependsOn() {
        return this.dependsOn.length > 0;
    }
    hasConstructorArgs() {
        return this.constructorArgs.length > 0;
    }
    getAttr(key) {
        return this._attrs.get(key);
    }
    hasAttr(key) {
        return this._attrs.has(key);
    }
    setAttr(key, value) {
        this._attrs.set(key, value);
    }
}
exports.ObjectDefinition = ObjectDefinition;
/* tslint:enable:variable-name */
//# sourceMappingURL=objectDefinition.js.map

/***/ }),

/***/ 9855:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ObjectProperties = void 0;
class ObjectProperties extends Map {
    propertyKeys() {
        return Array.from(this.keys());
    }
    getProperty(key, defaultValue) {
        if (this.has(key)) {
            return this.get(key);
        }
        return defaultValue;
    }
    setProperty(key, value) {
        return this.set(key, value);
    }
}
exports.ObjectProperties = ObjectProperties;
//# sourceMappingURL=properties.js.map

/***/ }),

/***/ 5895:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MidwayHttpError = exports.MidwayError = exports.registerErrorCode = void 0;
const http_1 = __nccwpck_require__(8611);
const codeGroup = new Set();
/**
 * Register error group and code, return the standard ErrorCode
 * @param errorGroup
 * @param errorCodeMapping
 */
function registerErrorCode(errorGroup, errorCodeMapping) {
    if (codeGroup.has(errorGroup)) {
        throw new MidwayError(`Error group ${errorGroup} is duplicated, please check before adding.`);
    }
    else {
        codeGroup.add(errorGroup);
    }
    const newCodeEnum = {};
    // ERROR => GROUP_10000
    for (const errKey in errorCodeMapping) {
        newCodeEnum[errKey] =
            errorGroup.toUpperCase() +
                '_' +
                String(errorCodeMapping[errKey]).toUpperCase();
    }
    return newCodeEnum;
}
exports.registerErrorCode = registerErrorCode;
class MidwayError extends Error {
    constructor(message, code, options) {
        super(message);
        if (!code || typeof code === 'object') {
            options = code;
            code = 'MIDWAY_10000';
        }
        this.name = this.constructor.name;
        this.code = code;
        this.cause = options === null || options === void 0 ? void 0 : options.cause;
    }
}
exports.MidwayError = MidwayError;
class MidwayHttpError extends MidwayError {
    constructor(resOrMessage, status, code, options) {
        super(resOrMessage
            ? typeof resOrMessage === 'string'
                ? resOrMessage
                : resOrMessage.message
            : http_1.STATUS_CODES[status], code !== null && code !== void 0 ? code : String(status), options);
        if (resOrMessage && resOrMessage['stack']) {
            this.stack = resOrMessage['stack'];
        }
        this.status = status;
    }
}
exports.MidwayHttpError = MidwayHttpError;
//# sourceMappingURL=base.js.map

/***/ }),

/***/ 6904:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MidwayEmptyValueError = exports.MidwayInvalidConfigPropertyError = exports.MidwayMainFrameworkMissingError = exports.MidwayCodeInvokeTimeoutError = exports.MidwayInvokeForbiddenError = exports.MidwayRetryExceededMaxTimesError = exports.MidwayDuplicateControllerOptionsError = exports.MidwayDuplicateClassNameError = exports.MidwayInconsistentVersionError = exports.MidwayUtilHttpClientTimeoutError = exports.MidwayMissingImportComponentError = exports.MidwaySingletonInjectRequestError = exports.MidwayUseWrongMethodError = exports.MidwayDuplicateRouteError = exports.MidwayResolverMissingError = exports.MidwayInvalidConfigError = exports.MidwayConfigMissingError = exports.MidwayFeatureNotImplementedError = exports.MidwayFeatureNoLongerSupportedError = exports.MidwayDefinitionNotFoundError = exports.MidwayParameterError = exports.MidwayCommonError = exports.FrameworkErrorEnum = void 0;
const base_1 = __nccwpck_require__(5895);
exports.FrameworkErrorEnum = (0, base_1.registerErrorCode)('midway', {
    UNKNOWN: 10000,
    COMMON: 10001,
    PARAM_TYPE: 10002,
    DEFINITION_NOT_FOUND: 10003,
    FEATURE_NO_LONGER_SUPPORTED: 10004,
    FEATURE_NOT_IMPLEMENTED: 10004,
    MISSING_CONFIG: 10006,
    MISSING_RESOLVER: 10007,
    DUPLICATE_ROUTER: 10008,
    USE_WRONG_METHOD: 10009,
    SINGLETON_INJECT_REQUEST: 10010,
    MISSING_IMPORTS: 10011,
    UTIL_HTTP_TIMEOUT: 10012,
    INCONSISTENT_VERSION: 10013,
    INVALID_CONFIG: 10014,
    DUPLICATE_CLASS_NAME: 10015,
    DUPLICATE_CONTROLLER_PREFIX_OPTIONS: 10016,
    RETRY_OVER_MAX_TIME: 10017,
    INVOKE_METHOD_FORBIDDEN: 10018,
    CODE_INVOKE_TIMEOUT: 10019,
    MAIN_FRAMEWORK_MISSING: 10020,
    INVALID_CONFIG_PROPERTY: 10021,
    EMPTY_VALUE: 10022,
});
class MidwayCommonError extends base_1.MidwayError {
    constructor(message) {
        super(message, exports.FrameworkErrorEnum.COMMON);
    }
}
exports.MidwayCommonError = MidwayCommonError;
class MidwayParameterError extends base_1.MidwayError {
    constructor(message) {
        super(message !== null && message !== void 0 ? message : 'Parameter type not match', exports.FrameworkErrorEnum.PARAM_TYPE);
    }
}
exports.MidwayParameterError = MidwayParameterError;
class MidwayDefinitionNotFoundError extends base_1.MidwayError {
    static isClosePrototypeOf(ins) {
        return ins
            ? ins[MidwayDefinitionNotFoundError.type] ===
                MidwayDefinitionNotFoundError.type
            : false;
    }
    constructor(identifier) {
        super(`${identifier} is not valid in current context`, exports.FrameworkErrorEnum.DEFINITION_NOT_FOUND);
        this[MidwayDefinitionNotFoundError.type] =
            MidwayDefinitionNotFoundError.type;
    }
    updateErrorMsg(className) {
        const identifier = this.message.split(' is not valid in current context')[0];
        this.message = `${identifier} in class ${className} is not valid in current context`;
    }
}
exports.MidwayDefinitionNotFoundError = MidwayDefinitionNotFoundError;
MidwayDefinitionNotFoundError.type = Symbol.for('#NotFoundError');
class MidwayFeatureNoLongerSupportedError extends base_1.MidwayError {
    constructor(message) {
        super('This feature no longer supported \n' + message, exports.FrameworkErrorEnum.FEATURE_NO_LONGER_SUPPORTED);
    }
}
exports.MidwayFeatureNoLongerSupportedError = MidwayFeatureNoLongerSupportedError;
class MidwayFeatureNotImplementedError extends base_1.MidwayError {
    constructor(message) {
        super('This feature not implemented \n' + message, exports.FrameworkErrorEnum.FEATURE_NOT_IMPLEMENTED);
    }
}
exports.MidwayFeatureNotImplementedError = MidwayFeatureNotImplementedError;
class MidwayConfigMissingError extends base_1.MidwayError {
    constructor(configKey) {
        super(`Can't found config key "${configKey}" in your config, please set it first`, exports.FrameworkErrorEnum.MISSING_CONFIG);
    }
}
exports.MidwayConfigMissingError = MidwayConfigMissingError;
class MidwayInvalidConfigError extends base_1.MidwayError {
    constructor(message) {
        super('Invalid config file \n' + message, exports.FrameworkErrorEnum.INVALID_CONFIG);
    }
}
exports.MidwayInvalidConfigError = MidwayInvalidConfigError;
class MidwayResolverMissingError extends base_1.MidwayError {
    constructor(type) {
        super(`Resolver "${type}" is missing.`, exports.FrameworkErrorEnum.MISSING_RESOLVER);
    }
}
exports.MidwayResolverMissingError = MidwayResolverMissingError;
class MidwayDuplicateRouteError extends base_1.MidwayError {
    constructor(routerUrl, existPos, existPosOther) {
        super(`Duplicate router "${routerUrl}" at "${existPos}" and "${existPosOther}"`, exports.FrameworkErrorEnum.DUPLICATE_ROUTER);
    }
}
exports.MidwayDuplicateRouteError = MidwayDuplicateRouteError;
class MidwayUseWrongMethodError extends base_1.MidwayError {
    constructor(wrongMethod, replacedMethod, describeKey) {
        const text = describeKey
            ? `${describeKey} not valid by ${wrongMethod}, Use ${replacedMethod} instead!`
            : `You should not invoked by ${wrongMethod}, Use ${replacedMethod} instead!`;
        super(text, exports.FrameworkErrorEnum.USE_WRONG_METHOD);
    }
}
exports.MidwayUseWrongMethodError = MidwayUseWrongMethodError;
class MidwaySingletonInjectRequestError extends base_1.MidwayError {
    constructor(singletonScopeName, requestScopeName) {
        const text = `${singletonScopeName} with singleton scope can't implicitly inject ${requestScopeName} with request scope directly, please add "@Scope(ScopeEnum.Request, { allowDowngrade: true })" in ${requestScopeName} or use "ctx.requestContext.getAsync(${requestScopeName})".`;
        super(text, exports.FrameworkErrorEnum.SINGLETON_INJECT_REQUEST);
    }
}
exports.MidwaySingletonInjectRequestError = MidwaySingletonInjectRequestError;
class MidwayMissingImportComponentError extends base_1.MidwayError {
    constructor(originName) {
        const text = `"${originName}" can't inject and maybe forgot add "{imports: [***]}" in @Configuration.`;
        super(text, exports.FrameworkErrorEnum.MISSING_IMPORTS);
    }
}
exports.MidwayMissingImportComponentError = MidwayMissingImportComponentError;
class MidwayUtilHttpClientTimeoutError extends base_1.MidwayError {
    constructor(message) {
        super(message, exports.FrameworkErrorEnum.UTIL_HTTP_TIMEOUT);
    }
}
exports.MidwayUtilHttpClientTimeoutError = MidwayUtilHttpClientTimeoutError;
class MidwayInconsistentVersionError extends base_1.MidwayError {
    constructor() {
        const text = 'We find a latest dependency package installed, please remove the lock file and use "npm update" to upgrade all dependencies first.';
        super(text, exports.FrameworkErrorEnum.INCONSISTENT_VERSION);
    }
}
exports.MidwayInconsistentVersionError = MidwayInconsistentVersionError;
class MidwayDuplicateClassNameError extends base_1.MidwayError {
    constructor(className, existPath, existPathOther) {
        super(`"${className}" duplicated between "${existPath}" and "${existPathOther}"`, exports.FrameworkErrorEnum.DUPLICATE_CLASS_NAME);
    }
}
exports.MidwayDuplicateClassNameError = MidwayDuplicateClassNameError;
class MidwayDuplicateControllerOptionsError extends base_1.MidwayError {
    constructor(prefix, existController, existControllerOther) {
        super(`"Prefix ${prefix}" with duplicated controller options between "${existController}" and "${existControllerOther}"`, exports.FrameworkErrorEnum.DUPLICATE_CONTROLLER_PREFIX_OPTIONS);
    }
}
exports.MidwayDuplicateControllerOptionsError = MidwayDuplicateControllerOptionsError;
class MidwayRetryExceededMaxTimesError extends base_1.MidwayError {
    constructor(methodName, times, err) {
        super(`Invoke "${methodName}" retries exceeded the maximum number of times(${times}), error: ${err.message}`, exports.FrameworkErrorEnum.RETRY_OVER_MAX_TIME, {
            cause: err,
        });
    }
}
exports.MidwayRetryExceededMaxTimesError = MidwayRetryExceededMaxTimesError;
class MidwayInvokeForbiddenError extends base_1.MidwayError {
    constructor(methodName, module) {
        super(`Invoke "${module ? module.name : 'unknown'}.${methodName}" is forbidden.`, exports.FrameworkErrorEnum.INVOKE_METHOD_FORBIDDEN);
    }
}
exports.MidwayInvokeForbiddenError = MidwayInvokeForbiddenError;
class MidwayCodeInvokeTimeoutError extends base_1.MidwayError {
    constructor(methodName, timeout) {
        super(`Invoke "${methodName}" running timeout(${timeout}ms)`, exports.FrameworkErrorEnum.CODE_INVOKE_TIMEOUT);
    }
}
exports.MidwayCodeInvokeTimeoutError = MidwayCodeInvokeTimeoutError;
class MidwayMainFrameworkMissingError extends base_1.MidwayError {
    constructor() {
        super('Main framework missing, please check your configuration.', exports.FrameworkErrorEnum.MAIN_FRAMEWORK_MISSING);
    }
}
exports.MidwayMainFrameworkMissingError = MidwayMainFrameworkMissingError;
class MidwayInvalidConfigPropertyError extends base_1.MidwayError {
    constructor(propertyName, allowTypes) {
        super(`Invalid config property "${propertyName}", ${allowTypes
            ? `only ${allowTypes.join(',')} can be set`
            : 'please check your configuration'}.`, exports.FrameworkErrorEnum.INVALID_CONFIG_PROPERTY);
    }
}
exports.MidwayInvalidConfigPropertyError = MidwayInvalidConfigPropertyError;
class MidwayEmptyValueError extends base_1.MidwayError {
    constructor(msg) {
        super(msg !== null && msg !== void 0 ? msg : 'There is an empty value got and it is not allowed.', exports.FrameworkErrorEnum.EMPTY_VALUE);
    }
}
exports.MidwayEmptyValueError = MidwayEmptyValueError;
//# sourceMappingURL=framework.js.map

/***/ }),

/***/ 1438:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.httpError = exports.GatewayTimeoutError = exports.ServiceUnavailableError = exports.BadGatewayError = exports.NotImplementedError = exports.InternalServerErrorError = exports.TooManyRequestsError = exports.UnprocessableEntityError = exports.UnsupportedMediaTypeError = exports.PayloadTooLargeError = exports.GoneError = exports.ConflictError = exports.RequestTimeoutError = exports.NotAcceptableError = exports.ForbiddenError = exports.NotFoundError = exports.UnauthorizedError = exports.BadRequestError = exports.HttpStatus = void 0;
const base_1 = __nccwpck_require__(5895);
var HttpStatus;
(function (HttpStatus) {
    HttpStatus[HttpStatus["CONTINUE"] = 100] = "CONTINUE";
    HttpStatus[HttpStatus["SWITCHING_PROTOCOLS"] = 101] = "SWITCHING_PROTOCOLS";
    HttpStatus[HttpStatus["PROCESSING"] = 102] = "PROCESSING";
    HttpStatus[HttpStatus["EARLYHINTS"] = 103] = "EARLYHINTS";
    HttpStatus[HttpStatus["OK"] = 200] = "OK";
    HttpStatus[HttpStatus["CREATED"] = 201] = "CREATED";
    HttpStatus[HttpStatus["ACCEPTED"] = 202] = "ACCEPTED";
    HttpStatus[HttpStatus["NON_AUTHORITATIVE_INFORMATION"] = 203] = "NON_AUTHORITATIVE_INFORMATION";
    HttpStatus[HttpStatus["NO_CONTENT"] = 204] = "NO_CONTENT";
    HttpStatus[HttpStatus["RESET_CONTENT"] = 205] = "RESET_CONTENT";
    HttpStatus[HttpStatus["PARTIAL_CONTENT"] = 206] = "PARTIAL_CONTENT";
    HttpStatus[HttpStatus["AMBIGUOUS"] = 300] = "AMBIGUOUS";
    HttpStatus[HttpStatus["MOVED_PERMANENTLY"] = 301] = "MOVED_PERMANENTLY";
    HttpStatus[HttpStatus["FOUND"] = 302] = "FOUND";
    HttpStatus[HttpStatus["SEE_OTHER"] = 303] = "SEE_OTHER";
    HttpStatus[HttpStatus["NOT_MODIFIED"] = 304] = "NOT_MODIFIED";
    HttpStatus[HttpStatus["TEMPORARY_REDIRECT"] = 307] = "TEMPORARY_REDIRECT";
    HttpStatus[HttpStatus["PERMANENT_REDIRECT"] = 308] = "PERMANENT_REDIRECT";
    HttpStatus[HttpStatus["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    HttpStatus[HttpStatus["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    HttpStatus[HttpStatus["PAYMENT_REQUIRED"] = 402] = "PAYMENT_REQUIRED";
    HttpStatus[HttpStatus["FORBIDDEN"] = 403] = "FORBIDDEN";
    HttpStatus[HttpStatus["NOT_FOUND"] = 404] = "NOT_FOUND";
    HttpStatus[HttpStatus["METHOD_NOT_ALLOWED"] = 405] = "METHOD_NOT_ALLOWED";
    HttpStatus[HttpStatus["NOT_ACCEPTABLE"] = 406] = "NOT_ACCEPTABLE";
    HttpStatus[HttpStatus["PROXY_AUTHENTICATION_REQUIRED"] = 407] = "PROXY_AUTHENTICATION_REQUIRED";
    HttpStatus[HttpStatus["REQUEST_TIMEOUT"] = 408] = "REQUEST_TIMEOUT";
    HttpStatus[HttpStatus["CONFLICT"] = 409] = "CONFLICT";
    HttpStatus[HttpStatus["GONE"] = 410] = "GONE";
    HttpStatus[HttpStatus["LENGTH_REQUIRED"] = 411] = "LENGTH_REQUIRED";
    HttpStatus[HttpStatus["PRECONDITION_FAILED"] = 412] = "PRECONDITION_FAILED";
    HttpStatus[HttpStatus["PAYLOAD_TOO_LARGE"] = 413] = "PAYLOAD_TOO_LARGE";
    HttpStatus[HttpStatus["URI_TOO_LONG"] = 414] = "URI_TOO_LONG";
    HttpStatus[HttpStatus["UNSUPPORTED_MEDIA_TYPE"] = 415] = "UNSUPPORTED_MEDIA_TYPE";
    HttpStatus[HttpStatus["REQUESTED_RANGE_NOT_SATISFIABLE"] = 416] = "REQUESTED_RANGE_NOT_SATISFIABLE";
    HttpStatus[HttpStatus["EXPECTATION_FAILED"] = 417] = "EXPECTATION_FAILED";
    HttpStatus[HttpStatus["I_AM_A_TEAPOT"] = 418] = "I_AM_A_TEAPOT";
    HttpStatus[HttpStatus["MISDIRECTED"] = 421] = "MISDIRECTED";
    HttpStatus[HttpStatus["UNPROCESSABLE_ENTITY"] = 422] = "UNPROCESSABLE_ENTITY";
    HttpStatus[HttpStatus["FAILED_DEPENDENCY"] = 424] = "FAILED_DEPENDENCY";
    HttpStatus[HttpStatus["PRECONDITION_REQUIRED"] = 428] = "PRECONDITION_REQUIRED";
    HttpStatus[HttpStatus["TOO_MANY_REQUESTS"] = 429] = "TOO_MANY_REQUESTS";
    HttpStatus[HttpStatus["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
    HttpStatus[HttpStatus["NOT_IMPLEMENTED"] = 501] = "NOT_IMPLEMENTED";
    HttpStatus[HttpStatus["BAD_GATEWAY"] = 502] = "BAD_GATEWAY";
    HttpStatus[HttpStatus["SERVICE_UNAVAILABLE"] = 503] = "SERVICE_UNAVAILABLE";
    HttpStatus[HttpStatus["GATEWAY_TIMEOUT"] = 504] = "GATEWAY_TIMEOUT";
    HttpStatus[HttpStatus["HTTP_VERSION_NOT_SUPPORTED"] = 505] = "HTTP_VERSION_NOT_SUPPORTED";
})(HttpStatus = exports.HttpStatus || (exports.HttpStatus = {}));
/**
 * 400 http error, Means that the request can be fulfilled because of the bad syntax.
 */
class BadRequestError extends base_1.MidwayHttpError {
    constructor(resOrMessage) {
        super(resOrMessage, HttpStatus.BAD_REQUEST);
    }
}
exports.BadRequestError = BadRequestError;
/**
 * 401 http error, Means that the request was legal, but the server is rejecting to answer it. For the use when authentication is required and has failed or has not yet been provided.
 */
class UnauthorizedError extends base_1.MidwayHttpError {
    constructor(resOrMessage) {
        super(resOrMessage, HttpStatus.UNAUTHORIZED);
    }
}
exports.UnauthorizedError = UnauthorizedError;
/**
 * 	4o4 http error, Means that the requested page cannot be found at the moment, but it may be available again in the future.
 */
class NotFoundError extends base_1.MidwayHttpError {
    constructor(resOrMessage) {
        super(resOrMessage, HttpStatus.NOT_FOUND);
    }
}
exports.NotFoundError = NotFoundError;
/**
 * 403 http error, Means that the request is legal, but the server is rejecting to answer it.
 */
class ForbiddenError extends base_1.MidwayHttpError {
    constructor(resOrMessage) {
        super(resOrMessage, HttpStatus.FORBIDDEN);
    }
}
exports.ForbiddenError = ForbiddenError;
/**
 * 406 http error, Means that the server can only generate an answer which the client doesn't accept.
 */
class NotAcceptableError extends base_1.MidwayHttpError {
    constructor(resOrMessage) {
        super(resOrMessage, HttpStatus.NOT_ACCEPTABLE);
    }
}
exports.NotAcceptableError = NotAcceptableError;
/**
 * 408 http error, Means that the server timed out waiting for the request.
 */
class RequestTimeoutError extends base_1.MidwayHttpError {
    constructor(resOrMessage) {
        super(resOrMessage, HttpStatus.REQUEST_TIMEOUT);
    }
}
exports.RequestTimeoutError = RequestTimeoutError;
/**
 * 409 http error, Means that the request cannot be completed, because of a conflict in the request.
 */
class ConflictError extends base_1.MidwayHttpError {
    constructor(resOrMessage) {
        super(resOrMessage, HttpStatus.CONFLICT);
    }
}
exports.ConflictError = ConflictError;
/**
 * 410 http error, Means that the requested page is not available anymore.
 */
class GoneError extends base_1.MidwayHttpError {
    constructor(resOrMessage) {
        super(resOrMessage, HttpStatus.GONE);
    }
}
exports.GoneError = GoneError;
/**
 * 413 http error, Means that the request entity is too large and that's why the server won't accept the request.
 */
class PayloadTooLargeError extends base_1.MidwayHttpError {
    constructor(resOrMessage) {
        super(resOrMessage, HttpStatus.PAYLOAD_TOO_LARGE);
    }
}
exports.PayloadTooLargeError = PayloadTooLargeError;
/**
 * 415 http error, Means that the media type is not supported and that's why the server won't accept the request.
 */
class UnsupportedMediaTypeError extends base_1.MidwayHttpError {
    constructor(resOrMessage) {
        super(resOrMessage, HttpStatus.UNSUPPORTED_MEDIA_TYPE);
    }
}
exports.UnsupportedMediaTypeError = UnsupportedMediaTypeError;
class UnprocessableEntityError extends base_1.MidwayHttpError {
    constructor(resOrMessage) {
        super(resOrMessage, HttpStatus.UNPROCESSABLE_ENTITY);
    }
}
exports.UnprocessableEntityError = UnprocessableEntityError;
/**
 * 429 http error, Means that client has sent too many requests in a given amount of time and that's why the server won't accept the request.
 */
class TooManyRequestsError extends base_1.MidwayHttpError {
    constructor(resOrMessage) {
        super(resOrMessage, HttpStatus.TOO_MANY_REQUESTS);
    }
}
exports.TooManyRequestsError = TooManyRequestsError;
/**
 * 500 http error, Is a generic error and users receive this error message when there is no more suitable specific message.
 */
class InternalServerErrorError extends base_1.MidwayHttpError {
    constructor(resOrMessage) {
        super(resOrMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.InternalServerErrorError = InternalServerErrorError;
/**
 * 501 http error, Means that the server doesn't recognize the request method or it lacks the ability to fulfill the request.
 */
class NotImplementedError extends base_1.MidwayHttpError {
    constructor(resOrMessage) {
        super(resOrMessage, HttpStatus.NOT_IMPLEMENTED);
    }
}
exports.NotImplementedError = NotImplementedError;
/**
 * 502 http error, Means that the server was acting as a gateway or proxy and it received an invalid answer from the upstream server.
 */
class BadGatewayError extends base_1.MidwayHttpError {
    constructor(resOrMessage) {
        super(resOrMessage, HttpStatus.BAD_GATEWAY);
    }
}
exports.BadGatewayError = BadGatewayError;
/**
 * 503 http error, Means that the server is not available now (It may be overloaded or down).
 */
class ServiceUnavailableError extends base_1.MidwayHttpError {
    constructor(resOrMessage) {
        super(resOrMessage, HttpStatus.SERVICE_UNAVAILABLE);
    }
}
exports.ServiceUnavailableError = ServiceUnavailableError;
/**
 * 504 http error, Means that the server was acting as a gateway or proxy and it didn't get answer on time from the upstream server.
 */
class GatewayTimeoutError extends base_1.MidwayHttpError {
    constructor(resOrMessage) {
        super(resOrMessage, HttpStatus.GATEWAY_TIMEOUT);
    }
}
exports.GatewayTimeoutError = GatewayTimeoutError;
exports.httpError = {
    BadRequestError,
    UnauthorizedError,
    NotFoundError,
    ForbiddenError,
    NotAcceptableError,
    RequestTimeoutError,
    ConflictError,
    GoneError,
    PayloadTooLargeError,
    UnsupportedMediaTypeError,
    UnprocessableEntityError,
    TooManyRequestsError,
    InternalServerErrorError,
    NotImplementedError,
    BadGatewayError,
    ServiceUnavailableError,
    GatewayTimeoutError,
};
//# sourceMappingURL=http.js.map

/***/ }),

/***/ 6248:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.httpError = exports.HttpStatus = void 0;
__exportStar(__nccwpck_require__(5895), exports);
var http_1 = __nccwpck_require__(1438);
Object.defineProperty(exports, "HttpStatus", ({ enumerable: true, get: function () { return http_1.HttpStatus; } }));
Object.defineProperty(exports, "httpError", ({ enumerable: true, get: function () { return http_1.httpError; } }));
__exportStar(__nccwpck_require__(6904), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 5061:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createConfiguration = exports.FunctionalConfiguration = void 0;
class FunctionalConfiguration {
    constructor(options) {
        this.options = options;
        this.readyHandler = () => { };
        this.stopHandler = () => { };
        this.configLoadHandler = () => { };
        this.serverReadyHandler = () => { };
    }
    onConfigLoad(configLoadHandler, app) {
        if (typeof configLoadHandler === 'function') {
            this.configLoadHandler = configLoadHandler;
        }
        else {
            return this.configLoadHandler(configLoadHandler, app);
        }
        return this;
    }
    onReady(readyHandler, app) {
        if (typeof readyHandler === 'function') {
            this.readyHandler = readyHandler;
        }
        else {
            return this.readyHandler(readyHandler, app);
        }
        return this;
    }
    onServerReady(serverReadyHandler, app) {
        if (typeof serverReadyHandler === 'function') {
            this.serverReadyHandler = serverReadyHandler;
        }
        else {
            return this.serverReadyHandler(serverReadyHandler, app);
        }
        return this;
    }
    onStop(stopHandler, app) {
        if (typeof stopHandler === 'function') {
            this.stopHandler = stopHandler;
        }
        else {
            return this.stopHandler(stopHandler, app);
        }
        return this;
    }
    getConfigurationOptions() {
        return this.options;
    }
}
exports.FunctionalConfiguration = FunctionalConfiguration;
const createConfiguration = (options) => {
    return new FunctionalConfiguration(options);
};
exports.createConfiguration = createConfiguration;
//# sourceMappingURL=configuration.js.map

/***/ }),

/***/ 5573:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MidwayPerformanceManager = exports.TypedResourceManager = exports.HttpServerResponse = exports.ServerResponse = exports.FORMAT = exports.FileUtils = exports.PathFileUtil = exports.Types = exports.retryWith = exports.retryWithAsync = exports.extend = exports.Utils = exports.sleep = exports.isTypeScriptEnvironment = exports.wrapAsync = exports.wrapMiddleware = exports.pathMatching = exports.transformRequestObjectByType = exports.deprecatedOutput = exports.delegateTargetAllPrototypeMethod = exports.delegateTargetProperties = exports.delegateTargetMethod = exports.delegateTargetPrototypeMethod = exports.loadModule = exports.safeRequire = exports.safelyGet = exports.ASYNC_ROOT_CONTEXT = exports.MidwayPriorityManager = exports.DEFAULT_PRIORITY = exports.DataSourceManager = exports.WebRouterCollector = exports.MidwayServerlessFunctionService = exports.MidwayWebRouterService = exports.MidwayHealthService = exports.MidwayMockService = exports.MidwayDecoratorService = exports.MidwayMiddlewareService = exports.MidwayLifeCycleService = exports.MidwayAspectService = exports.MidwayFrameworkService = exports.MidwayLoggerService = exports.MidwayInformationService = exports.MidwayEnvironmentService = exports.MidwayConfigService = exports.FunctionalConfiguration = exports.createConfiguration = exports.BaseFramework = exports.MidwayRequestContainer = void 0;
__exportStar(__nccwpck_require__(7270), exports);
__exportStar(__nccwpck_require__(2922), exports);
var requestContainer_1 = __nccwpck_require__(4005);
Object.defineProperty(exports, "MidwayRequestContainer", ({ enumerable: true, get: function () { return requestContainer_1.MidwayRequestContainer; } }));
var baseFramework_1 = __nccwpck_require__(1630);
Object.defineProperty(exports, "BaseFramework", ({ enumerable: true, get: function () { return baseFramework_1.BaseFramework; } }));
__exportStar(__nccwpck_require__(233), exports);
__exportStar(__nccwpck_require__(7404), exports);
var configuration_1 = __nccwpck_require__(5061);
Object.defineProperty(exports, "createConfiguration", ({ enumerable: true, get: function () { return configuration_1.createConfiguration; } }));
Object.defineProperty(exports, "FunctionalConfiguration", ({ enumerable: true, get: function () { return configuration_1.FunctionalConfiguration; } }));
var configService_1 = __nccwpck_require__(3440);
Object.defineProperty(exports, "MidwayConfigService", ({ enumerable: true, get: function () { return configService_1.MidwayConfigService; } }));
var environmentService_1 = __nccwpck_require__(4057);
Object.defineProperty(exports, "MidwayEnvironmentService", ({ enumerable: true, get: function () { return environmentService_1.MidwayEnvironmentService; } }));
var informationService_1 = __nccwpck_require__(1560);
Object.defineProperty(exports, "MidwayInformationService", ({ enumerable: true, get: function () { return informationService_1.MidwayInformationService; } }));
var loggerService_1 = __nccwpck_require__(426);
Object.defineProperty(exports, "MidwayLoggerService", ({ enumerable: true, get: function () { return loggerService_1.MidwayLoggerService; } }));
var frameworkService_1 = __nccwpck_require__(5338);
Object.defineProperty(exports, "MidwayFrameworkService", ({ enumerable: true, get: function () { return frameworkService_1.MidwayFrameworkService; } }));
var aspectService_1 = __nccwpck_require__(9550);
Object.defineProperty(exports, "MidwayAspectService", ({ enumerable: true, get: function () { return aspectService_1.MidwayAspectService; } }));
var lifeCycleService_1 = __nccwpck_require__(1026);
Object.defineProperty(exports, "MidwayLifeCycleService", ({ enumerable: true, get: function () { return lifeCycleService_1.MidwayLifeCycleService; } }));
var middlewareService_1 = __nccwpck_require__(6134);
Object.defineProperty(exports, "MidwayMiddlewareService", ({ enumerable: true, get: function () { return middlewareService_1.MidwayMiddlewareService; } }));
var decoratorService_1 = __nccwpck_require__(4625);
Object.defineProperty(exports, "MidwayDecoratorService", ({ enumerable: true, get: function () { return decoratorService_1.MidwayDecoratorService; } }));
var mockService_1 = __nccwpck_require__(7072);
Object.defineProperty(exports, "MidwayMockService", ({ enumerable: true, get: function () { return mockService_1.MidwayMockService; } }));
var healthService_1 = __nccwpck_require__(4292);
Object.defineProperty(exports, "MidwayHealthService", ({ enumerable: true, get: function () { return healthService_1.MidwayHealthService; } }));
var webRouterService_1 = __nccwpck_require__(4259);
Object.defineProperty(exports, "MidwayWebRouterService", ({ enumerable: true, get: function () { return webRouterService_1.MidwayWebRouterService; } }));
var slsFunctionService_1 = __nccwpck_require__(2986);
Object.defineProperty(exports, "MidwayServerlessFunctionService", ({ enumerable: true, get: function () { return slsFunctionService_1.MidwayServerlessFunctionService; } }));
Object.defineProperty(exports, "WebRouterCollector", ({ enumerable: true, get: function () { return slsFunctionService_1.WebRouterCollector; } }));
var dataSourceManager_1 = __nccwpck_require__(771);
Object.defineProperty(exports, "DataSourceManager", ({ enumerable: true, get: function () { return dataSourceManager_1.DataSourceManager; } }));
var priorityManager_1 = __nccwpck_require__(340);
Object.defineProperty(exports, "DEFAULT_PRIORITY", ({ enumerable: true, get: function () { return priorityManager_1.DEFAULT_PRIORITY; } }));
Object.defineProperty(exports, "MidwayPriorityManager", ({ enumerable: true, get: function () { return priorityManager_1.MidwayPriorityManager; } }));
__exportStar(__nccwpck_require__(720), exports);
__exportStar(__nccwpck_require__(4853), exports);
__exportStar(__nccwpck_require__(7940), exports);
__exportStar(__nccwpck_require__(7647), exports);
__exportStar(__nccwpck_require__(1207), exports);
__exportStar(__nccwpck_require__(2888), exports);
__exportStar(__nccwpck_require__(1044), exports);
__exportStar(__nccwpck_require__(3762), exports);
__exportStar(__nccwpck_require__(1926), exports);
__exportStar(__nccwpck_require__(3216), exports);
__exportStar(__nccwpck_require__(6248), exports);
var asyncContextManager_1 = __nccwpck_require__(6905);
Object.defineProperty(exports, "ASYNC_ROOT_CONTEXT", ({ enumerable: true, get: function () { return asyncContextManager_1.ASYNC_ROOT_CONTEXT; } }));
// export decorator
__exportStar(__nccwpck_require__(8351), exports);
__exportStar(__nccwpck_require__(7679), exports);
__exportStar(__nccwpck_require__(6695), exports);
// export utils
var util_1 = __nccwpck_require__(6110);
Object.defineProperty(exports, "safelyGet", ({ enumerable: true, get: function () { return util_1.safelyGet; } }));
Object.defineProperty(exports, "safeRequire", ({ enumerable: true, get: function () { return util_1.safeRequire; } }));
Object.defineProperty(exports, "loadModule", ({ enumerable: true, get: function () { return util_1.loadModule; } }));
Object.defineProperty(exports, "delegateTargetPrototypeMethod", ({ enumerable: true, get: function () { return util_1.delegateTargetPrototypeMethod; } }));
Object.defineProperty(exports, "delegateTargetMethod", ({ enumerable: true, get: function () { return util_1.delegateTargetMethod; } }));
Object.defineProperty(exports, "delegateTargetProperties", ({ enumerable: true, get: function () { return util_1.delegateTargetProperties; } }));
Object.defineProperty(exports, "delegateTargetAllPrototypeMethod", ({ enumerable: true, get: function () { return util_1.delegateTargetAllPrototypeMethod; } }));
Object.defineProperty(exports, "deprecatedOutput", ({ enumerable: true, get: function () { return util_1.deprecatedOutput; } }));
Object.defineProperty(exports, "transformRequestObjectByType", ({ enumerable: true, get: function () { return util_1.transformRequestObjectByType; } }));
Object.defineProperty(exports, "pathMatching", ({ enumerable: true, get: function () { return util_1.pathMatching; } }));
Object.defineProperty(exports, "wrapMiddleware", ({ enumerable: true, get: function () { return util_1.wrapMiddleware; } }));
Object.defineProperty(exports, "wrapAsync", ({ enumerable: true, get: function () { return util_1.wrapAsync; } }));
Object.defineProperty(exports, "isTypeScriptEnvironment", ({ enumerable: true, get: function () { return util_1.isTypeScriptEnvironment; } }));
Object.defineProperty(exports, "sleep", ({ enumerable: true, get: function () { return util_1.sleep; } }));
Object.defineProperty(exports, "Utils", ({ enumerable: true, get: function () { return util_1.Utils; } }));
var extend_1 = __nccwpck_require__(428);
Object.defineProperty(exports, "extend", ({ enumerable: true, get: function () { return extend_1.extend; } }));
__exportStar(__nccwpck_require__(7816), exports);
__exportStar(__nccwpck_require__(7269), exports);
__exportStar(__nccwpck_require__(6027), exports);
__exportStar(__nccwpck_require__(9527), exports);
var retry_1 = __nccwpck_require__(3724);
Object.defineProperty(exports, "retryWithAsync", ({ enumerable: true, get: function () { return retry_1.retryWithAsync; } }));
Object.defineProperty(exports, "retryWith", ({ enumerable: true, get: function () { return retry_1.retryWith; } }));
var types_1 = __nccwpck_require__(3171);
Object.defineProperty(exports, "Types", ({ enumerable: true, get: function () { return types_1.Types; } }));
var pathFileUtil_1 = __nccwpck_require__(9837);
Object.defineProperty(exports, "PathFileUtil", ({ enumerable: true, get: function () { return pathFileUtil_1.PathFileUtil; } }));
var fs_1 = __nccwpck_require__(3879);
Object.defineProperty(exports, "FileUtils", ({ enumerable: true, get: function () { return fs_1.FileUtils; } }));
var format_1 = __nccwpck_require__(5439);
Object.defineProperty(exports, "FORMAT", ({ enumerable: true, get: function () { return format_1.FORMAT; } }));
var index_1 = __nccwpck_require__(4233);
Object.defineProperty(exports, "ServerResponse", ({ enumerable: true, get: function () { return index_1.ServerResponse; } }));
Object.defineProperty(exports, "HttpServerResponse", ({ enumerable: true, get: function () { return index_1.HttpServerResponse; } }));
var typedResourceManager_1 = __nccwpck_require__(3924);
Object.defineProperty(exports, "TypedResourceManager", ({ enumerable: true, get: function () { return typedResourceManager_1.TypedResourceManager; } }));
var performanceManager_1 = __nccwpck_require__(4334);
Object.defineProperty(exports, "MidwayPerformanceManager", ({ enumerable: true, get: function () { return performanceManager_1.MidwayPerformanceManager; } }));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 7270:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MidwayProcessTypeEnum = exports.ObjectLifeCycleEvent = exports.ServerlessTriggerType = exports.MidwayFrameworkType = exports.FrameworkType = exports.MSListenerType = exports.MSProviderType = exports.InjectModeEnum = exports.ScopeEnum = void 0;
var ScopeEnum;
(function (ScopeEnum) {
    ScopeEnum["Singleton"] = "Singleton";
    ScopeEnum["Request"] = "Request";
    ScopeEnum["Prototype"] = "Prototype";
})(ScopeEnum = exports.ScopeEnum || (exports.ScopeEnum = {}));
var InjectModeEnum;
(function (InjectModeEnum) {
    InjectModeEnum["Identifier"] = "Identifier";
    InjectModeEnum["Class"] = "Class";
    InjectModeEnum["PropertyName"] = "PropertyName";
})(InjectModeEnum = exports.InjectModeEnum || (exports.InjectModeEnum = {}));
var MSProviderType;
(function (MSProviderType) {
    MSProviderType["DUBBO"] = "dubbo";
    MSProviderType["GRPC"] = "gRPC";
})(MSProviderType = exports.MSProviderType || (exports.MSProviderType = {}));
var MSListenerType;
(function (MSListenerType) {
    MSListenerType["RABBITMQ"] = "rabbitmq";
    MSListenerType["MQTT"] = "mqtt";
    MSListenerType["KAFKA"] = "kafka";
    MSListenerType["REDIS"] = "redis";
})(MSListenerType = exports.MSListenerType || (exports.MSListenerType = {}));
class FrameworkType {
}
exports.FrameworkType = FrameworkType;
class MidwayFrameworkType extends FrameworkType {
    constructor(name) {
        super();
        this.name = name;
    }
}
exports.MidwayFrameworkType = MidwayFrameworkType;
MidwayFrameworkType.WEB = new MidwayFrameworkType('@midwayjs/web');
MidwayFrameworkType.WEB_KOA = new MidwayFrameworkType('@midwayjs/web-koa');
MidwayFrameworkType.WEB_EXPRESS = new MidwayFrameworkType('@midwayjs/express');
MidwayFrameworkType.FAAS = new MidwayFrameworkType('@midwayjs/faas');
MidwayFrameworkType.MS_GRPC = new MidwayFrameworkType('@midwayjs/grpc');
MidwayFrameworkType.MS_RABBITMQ = new MidwayFrameworkType('@midwayjs/rabbitmq');
MidwayFrameworkType.MS_KAFKA = new MidwayFrameworkType('@midwayjs/kafka');
MidwayFrameworkType.WS_IO = new MidwayFrameworkType('@midwayjs/socketio');
MidwayFrameworkType.WS = new MidwayFrameworkType('@midwayjs/ws');
MidwayFrameworkType.SERVERLESS_APP = new MidwayFrameworkType('@midwayjs/serverless-app');
MidwayFrameworkType.CUSTOM = new MidwayFrameworkType('');
MidwayFrameworkType.EMPTY = new MidwayFrameworkType('empty');
MidwayFrameworkType.LIGHT = new MidwayFrameworkType('light');
MidwayFrameworkType.TASK = new MidwayFrameworkType('@midwayjs/task');
var ServerlessTriggerType;
(function (ServerlessTriggerType) {
    ServerlessTriggerType["EVENT"] = "event";
    ServerlessTriggerType["HTTP"] = "http";
    ServerlessTriggerType["API_GATEWAY"] = "apigw";
    ServerlessTriggerType["OS"] = "os";
    ServerlessTriggerType["CDN"] = "cdn";
    ServerlessTriggerType["LOG"] = "log";
    ServerlessTriggerType["TIMER"] = "timer";
    ServerlessTriggerType["MQ"] = "mq";
    ServerlessTriggerType["KAFKA"] = "kafka";
    ServerlessTriggerType["HSF"] = "hsf";
    ServerlessTriggerType["MTOP"] = "mtop";
    ServerlessTriggerType["SSR"] = "ssr";
})(ServerlessTriggerType = exports.ServerlessTriggerType || (exports.ServerlessTriggerType = {}));
var ObjectLifeCycleEvent;
(function (ObjectLifeCycleEvent) {
    ObjectLifeCycleEvent["BEFORE_BIND"] = "beforeBind";
    ObjectLifeCycleEvent["BEFORE_CREATED"] = "beforeObjectCreated";
    ObjectLifeCycleEvent["AFTER_CREATED"] = "afterObjectCreated";
    ObjectLifeCycleEvent["AFTER_INIT"] = "afterObjectInit";
    ObjectLifeCycleEvent["BEFORE_DESTROY"] = "beforeObjectDestroy";
})(ObjectLifeCycleEvent = exports.ObjectLifeCycleEvent || (exports.ObjectLifeCycleEvent = {}));
var MidwayProcessTypeEnum;
(function (MidwayProcessTypeEnum) {
    MidwayProcessTypeEnum["APPLICATION"] = "APPLICATION";
    MidwayProcessTypeEnum["AGENT"] = "AGENT";
})(MidwayProcessTypeEnum = exports.MidwayProcessTypeEnum || (exports.MidwayProcessTypeEnum = {}));
//# sourceMappingURL=interface.js.map

/***/ }),

/***/ 7996:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ServerResponse = void 0;
class ServerResponse {
    constructor(ctx) {
        this.isSuccess = true;
        this.ctx = ctx;
    }
    json(data) {
        return Object.getPrototypeOf(this).constructor.JSON_TPL(data, this.isSuccess, this.ctx);
    }
    text(data) {
        return Object.getPrototypeOf(this).constructor.TEXT_TPL(data, this.isSuccess, this.ctx);
    }
    blob(data) {
        return Object.getPrototypeOf(this).constructor.BLOB_TPL(data, this.isSuccess, this.ctx);
    }
    success() {
        this.isSuccess = true;
        return this;
    }
    fail() {
        this.isSuccess = false;
        return this;
    }
}
exports.ServerResponse = ServerResponse;
ServerResponse.TEXT_TPL = (data, isSuccess, ctx) => {
    return data;
};
ServerResponse.JSON_TPL = (data, isSuccess, ctx) => {
    if (isSuccess) {
        return {
            success: 'true',
            data,
        };
    }
    else {
        return {
            success: 'false',
            message: data || 'fail',
        };
    }
};
ServerResponse.BLOB_TPL = (data, isSuccess, ctx) => {
    return data;
};
//# sourceMappingURL=base.js.map

/***/ }),

/***/ 8053:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HttpServerResponse = void 0;
const fs_1 = __nccwpck_require__(9896);
const base_1 = __nccwpck_require__(7996);
const sse_1 = __nccwpck_require__(3156);
const stream_1 = __nccwpck_require__(6109);
const path_1 = __nccwpck_require__(6928);
class HttpServerResponse extends base_1.ServerResponse {
    constructor(ctx) {
        super(ctx);
    }
    status(code) {
        this.ctx.res.statusCode = code;
        return this;
    }
    header(key, value) {
        this.ctx.res.setHeader(key, value);
        return this;
    }
    headers(headers) {
        if (this.ctx.res.setHeaders) {
            this.ctx.res.setHeaders(new Map(Object.entries(headers)));
        }
        else {
            for (const key in headers) {
                this.header(key, headers[key]);
            }
        }
        return this;
    }
    json(data) {
        this.header('Content-Type', 'application/json');
        return Object.getPrototypeOf(this).constructor.JSON_TPL(data, this.isSuccess, this.ctx);
    }
    text(data) {
        this.header('Content-Type', 'text/plain');
        return Object.getPrototypeOf(this).constructor.TEXT_TPL(data, this.isSuccess, this.ctx);
    }
    file(filePath, mimeType) {
        this.header('Content-Type', mimeType || 'application/octet-stream');
        this.header('Content-Disposition', `attachment; filename=${(0, path_1.basename)(filePath)}`);
        return Object.getPrototypeOf(this).constructor.FILE_TPL(typeof filePath === 'string' ? (0, fs_1.createReadStream)(filePath) : filePath, this.isSuccess, this.ctx);
    }
    blob(data, mimeType) {
        this.header('Content-Type', mimeType || 'application/octet-stream');
        return Object.getPrototypeOf(this).constructor.BLOB_TPL(data, this.isSuccess, this.ctx);
    }
    html(data) {
        this.header('Content-Type', 'text/html');
        return Object.getPrototypeOf(this).constructor.HTML_TPL(data, this.isSuccess, this.ctx);
    }
    redirect(url, status = 302) {
        this.status(status);
        if (this.ctx.redirect) {
            return this.ctx.redirect(url);
        }
        else if (this.ctx.res.redirect) {
            return this.ctx.res.redirect(url);
        }
        else {
            this.header('Location', url);
        }
    }
    sse(options = {}) {
        return new sse_1.ServerSendEventStream(this.ctx, {
            tpl: Object.getPrototypeOf(this).constructor.SSE_TPL,
            ...options,
        });
    }
    stream(options = {}) {
        return new stream_1.HttpStreamResponse(this.ctx, {
            tpl: Object.getPrototypeOf(this).constructor.STREAM_TPL,
            ...options,
        });
    }
}
exports.HttpServerResponse = HttpServerResponse;
HttpServerResponse.FILE_TPL = (data, isSuccess, ctx) => {
    return data;
};
HttpServerResponse.SSE_TPL = (data, ctx) => {
    return data;
};
HttpServerResponse.STREAM_TPL = (data, ctx) => {
    return data;
};
HttpServerResponse.HTML_TPL = (data, isSuccess, ctx) => {
    return data;
};
//# sourceMappingURL=http.js.map

/***/ }),

/***/ 4233:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HttpServerResponse = exports.ServerResponse = void 0;
var base_1 = __nccwpck_require__(7996);
Object.defineProperty(exports, "ServerResponse", ({ enumerable: true, get: function () { return base_1.ServerResponse; } }));
var http_1 = __nccwpck_require__(8053);
Object.defineProperty(exports, "HttpServerResponse", ({ enumerable: true, get: function () { return http_1.HttpServerResponse; } }));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 3156:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ServerSendEventStream = void 0;
const stream_1 = __nccwpck_require__(2203);
class ServerSendEventStream extends stream_1.Transform {
    constructor(ctx, options = {}) {
        super({
            objectMode: true,
            ...options,
        });
        this.isActive = false;
        this.ctx = ctx;
        this.closeEvent = options.closeEvent || 'close';
        this.options = options;
        // 监听客户端关闭连接
        this.ctx.req.on('close', this.handleClose.bind(this));
    }
    _transform(chunk, encoding, callback) {
        try {
            let dataLines, prefix = 'data: ';
            const commentReg = /^\s*:\s*/;
            const res = [];
            if (!this.isActive) {
                this.isActive = true;
                const defaultHeader = {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache, no-transform',
                    Connection: 'keep-alive',
                    'X-Accel-Buffering': 'no',
                };
                for (const key in defaultHeader) {
                    this.ctx.res.setHeader(key, defaultHeader[key]);
                }
                this.ctx.req.socket.setTimeout(0);
                this.ctx.req.socket.setNoDelay(true);
                this.ctx.req.socket.setKeepAlive(true);
                res.push(': ok');
            }
            const senderObject = chunk;
            if (senderObject.event)
                res.push('event: ' + senderObject.event);
            if (senderObject.retry)
                res.push('retry: ' + senderObject.retry);
            if (senderObject.id)
                res.push('id: ' + senderObject.id);
            if (typeof senderObject.data === 'object') {
                dataLines = JSON.stringify(senderObject.data);
                res.push(prefix + dataLines);
            }
            else if (typeof senderObject.data === 'undefined') {
                // Send an empty string even without data
                res.push(prefix);
            }
            else {
                senderObject.data = String(senderObject.data);
                if (senderObject.data.search(commentReg) !== -1) {
                    senderObject.data = senderObject.data.replace(commentReg, '');
                    prefix = ': ';
                }
                senderObject.data = senderObject.data.replace(/(\r\n|\r|\n)/g, '\n');
                dataLines = senderObject.data.split(/\n/);
                for (let i = 0, l = dataLines.length; i < l; ++i) {
                    const line = dataLines[i];
                    if (i + 1 === l) {
                        res.push(prefix + line);
                    }
                    else {
                        res.push(prefix + line);
                    }
                }
            }
            this.push(res.join('\n') + '\n\n');
            callback();
        }
        catch (err) {
            this.ctx.logger.error(err);
            // send error to client
            this.sendError(err);
            // close stream
            this.end();
            // callback error
            callback(err);
        }
    }
    sendError(error) {
        this.send({
            event: 'error',
            data: error.message || 'An error occurred',
        });
    }
    sendEnd(message) {
        message.event = this.closeEvent;
        this.send(message);
    }
    send(message) {
        super.write(this.options.tpl(message, this.ctx));
    }
    handleClose() {
        this.end();
    }
}
exports.ServerSendEventStream = ServerSendEventStream;
//# sourceMappingURL=sse.js.map

/***/ }),

/***/ 6109:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HttpStreamResponse = void 0;
const stream_1 = __nccwpck_require__(2203);
class HttpStreamResponse extends stream_1.Transform {
    constructor(ctx, options = {}) {
        super({
            objectMode: true,
            ...options,
        });
        this.isActive = false;
        this.ctx = ctx;
        this.options = options;
    }
    _transform(chunk, encoding, callback) {
        try {
            if (!this.isActive) {
                this.isActive = true;
                this.ctx.res.statusCode = 200;
                this.ctx.res.setHeader('Transfer-Encoding', 'chunked');
                this.ctx.res.setHeader('Cache-Control', 'no-cache');
                this.ctx.req.socket.setTimeout(0);
            }
            if (typeof chunk === 'string') {
                this.ctx.res.write(chunk);
            }
            else {
                this.ctx.res.write(JSON.stringify(chunk));
            }
            callback();
        }
        catch (err) {
            this.ctx.logger.error(err);
            // close stream
            this.end();
            this.ctx.res.end();
            callback(err);
        }
    }
    send(data) {
        if (!this.writable) {
            return;
        }
        this.write(this.options.tpl(data, this.ctx));
    }
    sendError(error) {
        this.ctx.logger.error(error);
        this.end();
        this.ctx.res.end();
    }
    _flush(callback) {
        this.ctx.res.end();
        callback();
    }
}
exports.HttpStreamResponse = HttpStreamResponse;
//# sourceMappingURL=stream.js.map

/***/ }),

/***/ 9550:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MidwayAspectService = void 0;
const pm = __nccwpck_require__(4006);
const interface_1 = __nccwpck_require__(7270);
const decorator_1 = __nccwpck_require__(8351);
const types_1 = __nccwpck_require__(3171);
let MidwayAspectService = class MidwayAspectService {
    constructor(applicationContext) {
        this.applicationContext = applicationContext;
    }
    /**
     * load aspect method for container
     */
    async loadAspect() {
        // for aop implementation
        const aspectModules = (0, decorator_1.listModule)(decorator_1.ASPECT_KEY);
        // sort for aspect target
        let aspectDataList = [];
        for (const module of aspectModules) {
            const data = (0, decorator_1.getClassMetadata)(decorator_1.ASPECT_KEY, module);
            aspectDataList = aspectDataList.concat(data.map(el => {
                el.aspectModule = module;
                return el;
            }));
        }
        // sort priority
        aspectDataList.sort((pre, next) => {
            return (next.priority || 0) - (pre.priority || 0);
        });
        for (const aspectData of aspectDataList) {
            // aspect instance init
            const aspectIns = await this.applicationContext.getAsync(aspectData.aspectModule);
            await this.addAspect(aspectIns, aspectData);
        }
    }
    async addAspect(aspectIns, aspectData) {
        const module = aspectData.aspectTarget;
        const names = Object.getOwnPropertyNames(module.prototype);
        const isMatch = aspectData.match ? pm(aspectData.match) : () => true;
        for (const name of names) {
            if (name === 'constructor' || !isMatch(name)) {
                continue;
            }
            const descriptor = Object.getOwnPropertyDescriptor(module.prototype, name);
            if (!descriptor || descriptor.writable === false) {
                continue;
            }
            this.interceptPrototypeMethod(module, name, aspectIns);
        }
    }
    /**
     * intercept class method in prototype
     * @param Clz class you want to intercept
     * @param methodName method name you want to intercept
     * @param aspectObject aspect object, before, round, etc.
     */
    interceptPrototypeMethod(Clz, methodName, aspectObject) {
        const originMethod = Clz.prototype[methodName];
        if (types_1.Types.isAsyncFunction(Clz.prototype[methodName])) {
            Clz.prototype[methodName] = async function (...args) {
                var _a, _b, _c;
                let error, result;
                const newProceed = (...args) => {
                    return originMethod.apply(this, args);
                };
                const joinPoint = {
                    methodName,
                    target: this,
                    args: args,
                    proceed: newProceed,
                    proceedIsAsyncFunction: true,
                };
                if (typeof aspectObject === 'function') {
                    aspectObject = aspectObject();
                }
                try {
                    await ((_a = aspectObject.before) === null || _a === void 0 ? void 0 : _a.call(aspectObject, joinPoint));
                    if (aspectObject.around) {
                        result = await aspectObject.around(joinPoint);
                    }
                    else {
                        result = await originMethod.call(this, ...joinPoint.args);
                    }
                    joinPoint.proceed = undefined;
                    const resultTemp = await ((_b = aspectObject.afterReturn) === null || _b === void 0 ? void 0 : _b.call(aspectObject, joinPoint, result));
                    result = typeof resultTemp === 'undefined' ? result : resultTemp;
                    return result;
                }
                catch (err) {
                    joinPoint.proceed = undefined;
                    error = err;
                    if (aspectObject.afterThrow) {
                        await aspectObject.afterThrow(joinPoint, error);
                    }
                    else {
                        throw err;
                    }
                }
                finally {
                    await ((_c = aspectObject.after) === null || _c === void 0 ? void 0 : _c.call(aspectObject, joinPoint, result, error));
                }
            };
        }
        else {
            Clz.prototype[methodName] = function (...args) {
                var _a, _b, _c;
                let error, result;
                const newProceed = (...args) => {
                    return originMethod.apply(this, args);
                };
                const joinPoint = {
                    methodName,
                    target: this,
                    args: args,
                    proceed: newProceed,
                    proceedIsAsyncFunction: false,
                };
                if (typeof aspectObject === 'function') {
                    aspectObject = aspectObject();
                }
                try {
                    (_a = aspectObject.before) === null || _a === void 0 ? void 0 : _a.call(aspectObject, joinPoint);
                    if (aspectObject.around) {
                        result = aspectObject.around(joinPoint);
                    }
                    else {
                        result = originMethod.call(this, ...joinPoint.args);
                    }
                    joinPoint.proceed = undefined;
                    const resultTemp = (_b = aspectObject.afterReturn) === null || _b === void 0 ? void 0 : _b.call(aspectObject, joinPoint, result);
                    result = typeof resultTemp === 'undefined' ? result : resultTemp;
                    return result;
                }
                catch (err) {
                    joinPoint.proceed = undefined;
                    error = err;
                    if (aspectObject.afterThrow) {
                        aspectObject.afterThrow(joinPoint, error);
                    }
                    else {
                        throw err;
                    }
                }
                finally {
                    (_c = aspectObject.after) === null || _c === void 0 ? void 0 : _c.call(aspectObject, joinPoint, result, error);
                }
            };
        }
    }
};
MidwayAspectService = __decorate([
    (0, decorator_1.Provide)(),
    (0, decorator_1.Scope)(interface_1.ScopeEnum.Singleton),
    __metadata("design:paramtypes", [Object])
], MidwayAspectService);
exports.MidwayAspectService = MidwayAspectService;
//# sourceMappingURL=aspectService.js.map

/***/ }),

/***/ 3440:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MidwayConfigService = void 0;
const path_1 = __nccwpck_require__(6928);
const interface_1 = __nccwpck_require__(7270);
const util_1 = __nccwpck_require__(6110);
const fs_1 = __nccwpck_require__(9896);
const util = __nccwpck_require__(9023);
const environmentService_1 = __nccwpck_require__(4057);
const informationService_1 = __nccwpck_require__(1560);
const extend_1 = __nccwpck_require__(428);
const error_1 = __nccwpck_require__(6248);
const decorator_1 = __nccwpck_require__(8351);
const types_1 = __nccwpck_require__(3171);
const debug = util.debuglog('midway:debug');
let MidwayConfigService = class MidwayConfigService {
    constructor() {
        this.envDirMap = new Map();
        this.aliasMap = {
            prod: 'production',
            unittest: 'test',
        };
        this.configMergeOrder = [];
        this.configuration = {};
        this.isReady = false;
        this.externalObject = [];
        this.configFilterList = [];
    }
    init() {
        this.appInfo = {
            pkg: this.informationService.getPkg(),
            name: this.informationService.getProjectName(),
            baseDir: this.informationService.getBaseDir(),
            appDir: this.informationService.getAppDir(),
            HOME: this.informationService.getHome(),
            root: this.informationService.getRoot(),
            env: this.environmentService.getCurrentEnvironment(),
        };
    }
    add(configFilePaths) {
        for (const dir of configFilePaths) {
            if (typeof dir === 'string') {
                if (/\.\w+$/.test(dir)) {
                    // file
                    const env = this.getConfigEnv(dir);
                    const envSet = this.getEnvSet(env);
                    envSet.add(dir);
                    if (this.aliasMap[env]) {
                        this.getEnvSet(this.aliasMap[env]).add(dir);
                    }
                }
                else {
                    // directory
                    const fileStat = (0, fs_1.statSync)(dir);
                    if (fileStat.isDirectory()) {
                        const files = (0, fs_1.readdirSync)(dir);
                        this.add(files.map(file => {
                            return (0, path_1.join)(dir, file);
                        }));
                    }
                }
            }
            else {
                // object add
                for (const env in dir) {
                    this.getEnvSet(env).add(dir[env]);
                    if (this.aliasMap[env]) {
                        this.getEnvSet(this.aliasMap[env]).add(dir[env]);
                    }
                }
            }
        }
    }
    addObject(obj, reverse = false) {
        if (this.isReady) {
            obj = this.runWithFilter(obj);
            if (!obj) {
                debug('[config]: Filter config and got undefined will be drop it');
                return;
            }
            this.configMergeOrder.push({
                env: 'default',
                extraPath: '',
                value: obj,
            });
            if (reverse) {
                this.configuration = (0, extend_1.extend)(true, obj, this.configuration);
            }
            else {
                (0, extend_1.extend)(true, this.configuration, obj);
            }
        }
        else {
            this.externalObject.push(obj);
        }
    }
    getEnvSet(env) {
        if (!this.envDirMap.has(env)) {
            this.envDirMap.set(env, new Set());
        }
        return this.envDirMap.get(env);
    }
    getConfigEnv(configFilePath) {
        // parse env
        const configFileBaseName = (0, path_1.basename)(configFilePath);
        const splits = configFileBaseName.split('.');
        const suffix = splits.pop();
        if (suffix !== 'js' && suffix !== 'ts') {
            return suffix;
        }
        return splits.pop();
    }
    load() {
        if (this.isReady)
            return;
        // get default
        const defaultSet = this.getEnvSet('default');
        // get current set
        const currentEnvSet = this.getEnvSet(this.environmentService.getCurrentEnvironment());
        // merge set
        const target = {};
        const defaultSetLength = defaultSet.size;
        for (const [idx, filename] of [...defaultSet, ...currentEnvSet].entries()) {
            let config = this.loadConfig(filename);
            if (types_1.Types.isFunction(config)) {
                // eslint-disable-next-line prefer-spread
                config = config.apply(null, [this.appInfo, target]);
            }
            if (!config) {
                continue;
            }
            config = this.runWithFilter(config);
            if (!config) {
                debug('[config]: Filter config and got undefined will be drop it');
                continue;
            }
            if (typeof filename === 'string') {
                debug('[config]: Loaded config %s, %j', filename, config);
            }
            else {
                debug('[config]: Loaded config %j', config);
            }
            this.configMergeOrder.push({
                env: idx < defaultSetLength
                    ? 'default'
                    : this.environmentService.getCurrentEnvironment(),
                extraPath: filename,
                value: config,
            });
            (0, extend_1.extend)(true, target, config);
        }
        if (this.externalObject.length) {
            for (let externalObject of this.externalObject) {
                if (externalObject) {
                    externalObject = this.runWithFilter(externalObject);
                    if (!externalObject) {
                        debug('[config]: Filter config and got undefined will be drop it');
                        continue;
                    }
                    debug('[config]: Loaded external object %j', externalObject);
                    (0, extend_1.extend)(true, target, externalObject);
                    this.configMergeOrder.push({
                        env: 'default',
                        extraPath: '',
                        value: externalObject,
                    });
                }
            }
        }
        this.configuration = target;
        this.isReady = true;
    }
    getConfiguration(configKey) {
        if (configKey) {
            return (0, util_1.safelyGet)(configKey, this.configuration);
        }
        return this.configuration;
    }
    getConfigMergeOrder() {
        return this.configMergeOrder;
    }
    loadConfig(configFilename) {
        let exports = typeof configFilename === 'string'
            ? require(configFilename)
            : configFilename;
        // if es module
        if (exports && exports.__esModule) {
            if (exports && exports.default) {
                if (Object.keys(exports).length > 1) {
                    throw new error_1.MidwayInvalidConfigError(`${configFilename} should not have both a default export and named export`);
                }
                exports = exports.default;
            }
        }
        return exports;
    }
    clearAllConfig() {
        this.configuration = {};
    }
    clearConfigMergeOrder() {
        this.configMergeOrder.length = 0;
    }
    /**
     * add a config filter
     * @param filter
     */
    addFilter(filter) {
        this.configFilterList.push(filter);
    }
    runWithFilter(config) {
        for (const filter of this.configFilterList) {
            debug(`[config]: Filter config by filter = "${filter.name || 'anonymous filter'}"`);
            config = filter(config);
            debug('[config]: Filter config result = %j', config);
        }
        return config;
    }
    getAppInfo() {
        return this.appInfo;
    }
};
__decorate([
    (0, decorator_1.Inject)(),
    __metadata("design:type", environmentService_1.MidwayEnvironmentService)
], MidwayConfigService.prototype, "environmentService", void 0);
__decorate([
    (0, decorator_1.Inject)(),
    __metadata("design:type", informationService_1.MidwayInformationService)
], MidwayConfigService.prototype, "informationService", void 0);
__decorate([
    (0, decorator_1.Init)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MidwayConfigService.prototype, "init", null);
MidwayConfigService = __decorate([
    (0, decorator_1.Provide)(),
    (0, decorator_1.Scope)(interface_1.ScopeEnum.Singleton)
], MidwayConfigService);
exports.MidwayConfigService = MidwayConfigService;
//# sourceMappingURL=configService.js.map

/***/ }),

/***/ 4625:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MidwayDecoratorService = void 0;
const decorator_1 = __nccwpck_require__(8351);
const interface_1 = __nccwpck_require__(7270);
const aspectService_1 = __nccwpck_require__(9550);
const error_1 = __nccwpck_require__(6248);
const util = __nccwpck_require__(9023);
const types_1 = __nccwpck_require__(3171);
const debug = util.debuglog('midway:debug');
let MidwayDecoratorService = class MidwayDecoratorService {
    constructor(applicationContext) {
        this.applicationContext = applicationContext;
        this.propertyHandlerMap = new Map();
        this.methodDecoratorMap = new Map();
        this.parameterDecoratorMap = new Map();
        this.parameterDecoratorPipes = new Map();
    }
    init() {
        // add custom method decorator listener
        this.applicationContext.onBeforeBind(Clzz => {
            // find custom method decorator metadata, include method decorator information array
            const methodDecoratorMetadataList = (0, decorator_1.getClassMetadata)(decorator_1.INJECT_CUSTOM_METHOD, Clzz);
            if (methodDecoratorMetadataList) {
                // loop it, save this order for decorator run
                for (const meta of methodDecoratorMetadataList) {
                    const { propertyName, key, metadata, options } = meta;
                    if (!options || !options.impl) {
                        continue;
                    }
                    // add aspect implementation first
                    this.aspectService.interceptPrototypeMethod(Clzz, propertyName, () => {
                        const methodDecoratorHandler = this.methodDecoratorMap.get(key);
                        if (!methodDecoratorHandler) {
                            throw new error_1.MidwayCommonError(`Method Decorator "${key}" handler not found, please register first.`);
                        }
                        return methodDecoratorHandler({
                            target: Clzz,
                            propertyName,
                            metadata,
                        });
                    });
                }
            }
            // find custom param decorator metadata
            const parameterDecoratorMetadata = (0, decorator_1.getClassMetadata)(decorator_1.INJECT_CUSTOM_PARAM, Clzz);
            if (parameterDecoratorMetadata) {
                // loop it, save this order for decorator run
                for (const methodName of Object.keys(parameterDecoratorMetadata)) {
                    // add aspect implementation first
                    this.aspectService.interceptPrototypeMethod(Clzz, methodName, () => {
                        return {
                            before: async (joinPoint) => {
                                // joinPoint.args
                                const newArgs = [...joinPoint.args];
                                for (const meta of parameterDecoratorMetadata[methodName]) {
                                    const { propertyName, key, metadata, parameterIndex, options, } = meta;
                                    let parameterDecoratorHandler;
                                    if (options && options.impl) {
                                        parameterDecoratorHandler =
                                            this.parameterDecoratorMap.get(key);
                                        if (!parameterDecoratorHandler) {
                                            throw new error_1.MidwayCommonError(`Parameter Decorator "${key}" handler not found, please register first.`);
                                        }
                                    }
                                    else {
                                        // set default handler
                                        parameterDecoratorHandler = async ({ parameterIndex, originArgs, }) => {
                                            return originArgs[parameterIndex];
                                        };
                                    }
                                    const paramTypes = (0, decorator_1.getMethodParamTypes)(Clzz, propertyName);
                                    let skipPipes = false;
                                    try {
                                        newArgs[parameterIndex] = await parameterDecoratorHandler({
                                            metadata,
                                            propertyName,
                                            parameterIndex,
                                            target: Clzz,
                                            originArgs: newArgs,
                                            originParamType: paramTypes[parameterIndex],
                                            instance: joinPoint.target,
                                        });
                                    }
                                    catch (err) {
                                        skipPipes = true;
                                        if ((options === null || options === void 0 ? void 0 : options.throwError) === true) {
                                            throw err;
                                        }
                                        else {
                                            // ignore
                                            debug(`[core]: Parameter decorator throw error and use origin args, ${err.stack}`);
                                        }
                                    }
                                    if (skipPipes) {
                                        continue;
                                    }
                                    const pipes = [
                                        ...(this.parameterDecoratorPipes.get(key) || []),
                                        ...((options === null || options === void 0 ? void 0 : options.pipes) || []),
                                    ];
                                    for (const pipe of pipes) {
                                        let transform;
                                        if ('transform' in pipe) {
                                            transform = pipe['transform'].bind(pipe);
                                        }
                                        else if ((0, types_1.isClass)(pipe)) {
                                            const ins = await this.applicationContext.getAsync(pipe);
                                            transform = ins.transform.bind(ins);
                                        }
                                        else if (typeof pipe === 'function') {
                                            transform = pipe;
                                        }
                                        else {
                                            throw new error_1.MidwayParameterError('Pipe must be a function or implement PipeTransform interface');
                                        }
                                        newArgs[parameterIndex] = await transform(newArgs[parameterIndex], {
                                            metaType: (0, decorator_1.transformTypeFromTSDesign)(paramTypes[parameterIndex]),
                                            metadata,
                                            target: joinPoint.target,
                                            methodName: joinPoint.methodName,
                                        });
                                    }
                                }
                                joinPoint.args = newArgs;
                            },
                        };
                    });
                }
            }
        });
        // add custom property decorator listener
        this.applicationContext.onObjectCreated((instance, options) => {
            if (this.propertyHandlerMap.size > 0 &&
                Array.isArray(options.definition.handlerProps)) {
                // has bind in container
                for (const item of options.definition.handlerProps) {
                    this.defineGetterPropertyValue(item, instance, this.getHandler(item.key));
                }
            }
        });
        // register @ApplicationContext
        this.registerPropertyHandler(decorator_1.APPLICATION_CONTEXT_KEY, (propertyName, mete) => {
            return this.applicationContext;
        });
    }
    registerPropertyHandler(decoratorKey, fn) {
        debug(`[core]: Register property decorator key="${decoratorKey}"`);
        this.propertyHandlerMap.set(decoratorKey, fn);
    }
    registerMethodHandler(decoratorKey, fn) {
        debug(`[core]: Register method decorator key="${decoratorKey}"`);
        this.methodDecoratorMap.set(decoratorKey, fn);
    }
    registerParameterHandler(decoratorKey, fn) {
        debug(`[core]: Register parameter decorator key="${decoratorKey}"`);
        this.parameterDecoratorMap.set(decoratorKey, fn);
    }
    registerParameterPipes(decoratorKey, pipes) {
        if (!this.parameterDecoratorPipes.has(decoratorKey)) {
            this.parameterDecoratorPipes.set(decoratorKey, []);
        }
        this.parameterDecoratorPipes.set(decoratorKey, this.parameterDecoratorPipes.get(decoratorKey).concat(pipes));
    }
    /**
     * binding getter method for decorator
     *
     * @param prop
     * @param instance
     * @param getterHandler
     */
    defineGetterPropertyValue(prop, instance, getterHandler) {
        if (prop && getterHandler) {
            if (prop.propertyName) {
                Object.defineProperty(instance, prop.propertyName, {
                    get: () => { var _a; return getterHandler(prop.propertyName, (_a = prop.metadata) !== null && _a !== void 0 ? _a : {}, instance); },
                    configurable: true,
                    enumerable: true,
                });
            }
        }
    }
    getHandler(key) {
        if (this.propertyHandlerMap.has(key)) {
            return this.propertyHandlerMap.get(key);
        }
    }
};
__decorate([
    (0, decorator_1.Inject)(),
    __metadata("design:type", aspectService_1.MidwayAspectService)
], MidwayDecoratorService.prototype, "aspectService", void 0);
__decorate([
    (0, decorator_1.Init)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MidwayDecoratorService.prototype, "init", null);
MidwayDecoratorService = __decorate([
    (0, decorator_1.Provide)(),
    (0, decorator_1.Scope)(interface_1.ScopeEnum.Singleton),
    __metadata("design:paramtypes", [Object])
], MidwayDecoratorService);
exports.MidwayDecoratorService = MidwayDecoratorService;
//# sourceMappingURL=decoratorService.js.map

/***/ }),

/***/ 4057:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MidwayEnvironmentService = void 0;
const interface_1 = __nccwpck_require__(7270);
const util_1 = __nccwpck_require__(6110);
const decorator_1 = __nccwpck_require__(8351);
let MidwayEnvironmentService = class MidwayEnvironmentService {
    constructor() {
        this.moduleLoadType = 'commonjs';
    }
    getCurrentEnvironment() {
        if (!this.environment) {
            this.environment = (0, util_1.getCurrentEnvironment)();
        }
        return this.environment;
    }
    setCurrentEnvironment(environment) {
        this.environment = environment;
    }
    isDevelopmentEnvironment() {
        return (0, util_1.isDevelopmentEnvironment)(this.environment);
    }
    setModuleLoadType(moduleLoadType) {
        this.moduleLoadType = moduleLoadType;
    }
    getModuleLoadType() {
        return this.moduleLoadType;
    }
    isPkgEnvironment() {
        return typeof process['pkg'] !== 'undefined';
    }
};
MidwayEnvironmentService = __decorate([
    (0, decorator_1.Provide)(),
    (0, decorator_1.Scope)(interface_1.ScopeEnum.Singleton)
], MidwayEnvironmentService);
exports.MidwayEnvironmentService = MidwayEnvironmentService;
//# sourceMappingURL=environmentService.js.map

/***/ }),

/***/ 5338:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MidwayFrameworkService = void 0;
const decorator_1 = __nccwpck_require__(8351);
const interface_1 = __nccwpck_require__(7270);
const configService_1 = __nccwpck_require__(3440);
const loggerService_1 = __nccwpck_require__(426);
const baseFramework_1 = __nccwpck_require__(1630);
const pipelineService_1 = __nccwpck_require__(720);
const decoratorService_1 = __nccwpck_require__(4625);
const aspectService_1 = __nccwpck_require__(9550);
const applicationManager_1 = __nccwpck_require__(1926);
const util = __nccwpck_require__(9023);
const error_1 = __nccwpck_require__(6248);
const constants_1 = __nccwpck_require__(7404);
const performanceManager_1 = __nccwpck_require__(4334);
const debug = util.debuglog('midway:debug');
let MidwayFrameworkService = class MidwayFrameworkService {
    constructor(applicationContext, globalOptions) {
        this.applicationContext = applicationContext;
        this.globalOptions = globalOptions;
        this.globalFrameworkList = [];
    }
    async init() {
        var _a, _b;
        // register base config hook
        this.decoratorService.registerPropertyHandler(decorator_1.CONFIG_KEY, (propertyName, meta) => {
            var _a;
            if (meta.identifier === decorator_1.ALL) {
                return this.configService.getConfiguration();
            }
            else {
                return this.configService.getConfiguration((_a = meta.identifier) !== null && _a !== void 0 ? _a : propertyName);
            }
        });
        // register @Logger decorator handler
        this.decoratorService.registerPropertyHandler(decorator_1.LOGGER_KEY, (propertyName, meta) => {
            var _a;
            return this.loggerService.getLogger((_a = meta.identifier) !== null && _a !== void 0 ? _a : propertyName);
        });
        this.decoratorService.registerPropertyHandler(decorator_1.PIPELINE_IDENTIFIER, (key, meta, instance) => {
            var _a, _b;
            return new pipelineService_1.MidwayPipelineService((_b = (_a = instance[constants_1.REQUEST_OBJ_CTX_KEY]) === null || _a === void 0 ? void 0 : _a.requestContext) !== null && _b !== void 0 ? _b : this.applicationContext, meta.valves);
        });
        // register @App decorator handler
        this.decoratorService.registerPropertyHandler(decorator_1.APPLICATION_KEY, (propertyName, meta) => {
            if (meta.type) {
                const framework = this.applicationManager.getApplication(meta.type);
                if (!framework) {
                    throw new error_1.MidwayCommonError(`Framework ${meta.type} not Found`);
                }
                return framework;
            }
            else {
                return this.getMainApp();
            }
        });
        this.decoratorService.registerPropertyHandler(decorator_1.PLUGIN_KEY, (propertyName, meta) => {
            var _a;
            return this.getMainApp()[(_a = meta.identifier) !== null && _a !== void 0 ? _a : propertyName];
        });
        this.decoratorService.registerPropertyHandler(decorator_1.FACTORY_SERVICE_CLIENT_KEY, (propertyName, meta) => {
            const factory = this.applicationContext.get(meta.serviceFactoryClz);
            const clientName = meta.clientName || factory.getDefaultClientName();
            if (clientName && factory.has(clientName)) {
                return factory.get(clientName);
            }
            else {
                if (!clientName) {
                    throw new error_1.MidwayParameterError(`Please set clientName or options.defaultClientName for ${meta.serviceFactoryClz.name}).`);
                }
                else {
                    throw new error_1.MidwayParameterError(`ClientName(${clientName} not found in ${meta.serviceFactoryClz.name}).`);
                }
            }
        });
        let frameworks = (0, decorator_1.listModule)(decorator_1.FRAMEWORK_KEY);
        // filter proto
        frameworks = filterProtoFramework(frameworks);
        debug(`[core]: Found Framework length = ${frameworks.length}`);
        if (frameworks.length) {
            for (const frameworkClz of frameworks) {
                if (!this.applicationContext.hasDefinition((0, decorator_1.getProviderUUId)(frameworkClz))) {
                    debug(`[core]: Found Framework "${frameworkClz.name}" but missing definition, skip initialize.`);
                    continue;
                }
                const frameworkInstance = await this.applicationContext.getAsync(frameworkClz, [this.applicationContext]);
                // if enable, just init framework
                if (frameworkInstance.isEnable()) {
                    performanceManager_1.MidwayInitializerPerformanceManager.frameworkInitializeStart(frameworkInstance.getFrameworkName());
                    // app init
                    await frameworkInstance.initialize({
                        applicationContext: this.applicationContext,
                        namespace: frameworkInstance.getNamespace(),
                        ...this.globalOptions,
                    });
                    performanceManager_1.MidwayInitializerPerformanceManager.frameworkInitializeEnd(frameworkInstance.getFrameworkName());
                    debug(`[core]: Found Framework "${frameworkInstance.getFrameworkName()}" and initialize.`);
                }
                else {
                    debug(`[core]: Found Framework "${frameworkInstance.getFrameworkName()}" and delay initialize.`);
                }
                // app init
                const definition = this.applicationContext.registry.getDefinition((0, decorator_1.getProviderUUId)(frameworkClz));
                // set framework namespace here
                frameworkInstance.setNamespace(definition === null || definition === void 0 ? void 0 : definition.namespace);
                // link framework to application manager
                this.applicationManager.addFramework((_a = definition === null || definition === void 0 ? void 0 : definition.namespace) !== null && _a !== void 0 ? _a : frameworkInstance.getFrameworkName(), frameworkInstance);
                this.globalFrameworkList.push(frameworkInstance);
            }
            let mainNs;
            /**
             * 这里处理引入组件的顺序，在主框架之前是否包含其他的 framework
             * 1、装饰器的顺序和 import 的写的顺序有关
             * 2、主框架和 configuration 中的配置加载顺序有关
             * 3、两者不符合的话，App 装饰器获取的 app 会不一致，导致中间件等无法正常使用
             */
            const namespaceList = this.applicationContext.getNamespaceList();
            for (const namespace of namespaceList) {
                const framework = this.applicationManager.getApplication(namespace);
                if (framework) {
                    mainNs = namespace;
                    break;
                }
            }
            global['MIDWAY_MAIN_FRAMEWORK'] = this.mainFramework =
                (_b = this.applicationManager.getFramework(mainNs)) !== null && _b !== void 0 ? _b : this.globalFrameworkList[0];
            debug(`[core]: Current main Framework is "${mainNs}".`);
        }
        // init aspect module
        await this.aspectService.loadAspect();
    }
    getMainApp() {
        var _a;
        return (_a = this.mainFramework) === null || _a === void 0 ? void 0 : _a.getApplication();
    }
    getMainFramework() {
        return this.mainFramework;
    }
    getFramework(namespaceOrFrameworkType) {
        return this.applicationManager.getFramework(namespaceOrFrameworkType);
    }
    async runFramework() {
        const namespaceList = this.applicationContext.getNamespaceList();
        // globalFrameworkList 需要基于 namespaceList 进行排序，不然会出现顺序问题
        this.globalFrameworkList = this.globalFrameworkList.sort((a, b) => {
            return (namespaceList.indexOf(a.getNamespace()) -
                namespaceList.indexOf(b.getNamespace()));
        });
        for (const frameworkInstance of this.globalFrameworkList) {
            // if enable, just init framework
            if (frameworkInstance.isEnable()) {
                performanceManager_1.MidwayInitializerPerformanceManager.frameworkRunStart(frameworkInstance.getFrameworkName());
                // app init
                await frameworkInstance.run();
                debug(`[core]: Found Framework "${frameworkInstance.getFrameworkName()}" and run.`);
                performanceManager_1.MidwayInitializerPerformanceManager.frameworkRunEnd(frameworkInstance.getFrameworkName());
            }
        }
    }
    async stopFramework() {
        await Promise.all(Array.from(this.globalFrameworkList).map(frameworkInstance => {
            return frameworkInstance.stop();
        }));
    }
};
__decorate([
    (0, decorator_1.Inject)(),
    __metadata("design:type", configService_1.MidwayConfigService)
], MidwayFrameworkService.prototype, "configService", void 0);
__decorate([
    (0, decorator_1.Inject)(),
    __metadata("design:type", loggerService_1.MidwayLoggerService)
], MidwayFrameworkService.prototype, "loggerService", void 0);
__decorate([
    (0, decorator_1.Inject)(),
    __metadata("design:type", aspectService_1.MidwayAspectService)
], MidwayFrameworkService.prototype, "aspectService", void 0);
__decorate([
    (0, decorator_1.Inject)(),
    __metadata("design:type", decoratorService_1.MidwayDecoratorService)
], MidwayFrameworkService.prototype, "decoratorService", void 0);
__decorate([
    (0, decorator_1.Inject)(),
    __metadata("design:type", applicationManager_1.MidwayApplicationManager)
], MidwayFrameworkService.prototype, "applicationManager", void 0);
__decorate([
    (0, decorator_1.Init)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MidwayFrameworkService.prototype, "init", null);
MidwayFrameworkService = __decorate([
    (0, decorator_1.Provide)(),
    (0, decorator_1.Scope)(interface_1.ScopeEnum.Singleton),
    __metadata("design:paramtypes", [Object, Object])
], MidwayFrameworkService);
exports.MidwayFrameworkService = MidwayFrameworkService;
function filterProtoFramework(frameworks) {
    const frameworkProtoArr = [];
    // 这里把继承的框架父类都找出来，然后排除掉，只取第一层
    for (const framework of frameworks) {
        let proto = Object.getPrototypeOf(framework);
        while (proto.name && proto.name !== baseFramework_1.BaseFramework.name) {
            frameworkProtoArr.push(proto);
            proto = Object.getPrototypeOf(proto);
        }
    }
    return frameworks.filter(framework => {
        return !frameworkProtoArr.includes(framework);
    });
}
//# sourceMappingURL=frameworkService.js.map

/***/ }),

/***/ 4292:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MidwayHealthService = void 0;
const decorator_1 = __nccwpck_require__(8351);
const interface_1 = __nccwpck_require__(7270);
const configService_1 = __nccwpck_require__(3440);
const util_1 = __nccwpck_require__(6110);
let MidwayHealthService = class MidwayHealthService {
    constructor() {
        this.healthCheckTimeout = 1000;
        this.healthCheckMethods = [];
    }
    async init(lifeCycleInstanceList) {
        const healthCheckTimeout = this.configService.getConfiguration('core.healthCheckTimeout') || 1000;
        this.setCheckTimeout(healthCheckTimeout);
        for (const lifecycleInstance of lifeCycleInstanceList) {
            if (lifecycleInstance.instance &&
                lifecycleInstance.instance['onHealthCheck']) {
                this.healthCheckMethods.push({
                    item: lifecycleInstance.instance['onHealthCheck'].bind(lifecycleInstance.instance),
                    meta: {
                        namespace: lifecycleInstance.namespace,
                    },
                });
            }
        }
    }
    async getStatus() {
        const checkResult = await (0, util_1.createPromiseTimeoutInvokeChain)({
            promiseItems: this.healthCheckMethods.map(item => {
                return {
                    item: item.item(this.applicationContext),
                    meta: item.meta,
                };
            }),
            timeout: this.healthCheckTimeout,
            methodName: 'configuration.onHealthCheck',
            onSuccess: (result, meta) => {
                if (result['status'] !== undefined) {
                    return {
                        namespace: meta.namespace,
                        ...result,
                    };
                }
                else {
                    return {
                        status: false,
                        namespace: meta.namespace,
                        reason: 'configuration.onHealthCheck return value must be object and contain status field',
                    };
                }
            },
            onFail: (err, meta) => {
                return {
                    status: false,
                    namespace: meta.namespace,
                    reason: err.message,
                };
            },
        });
        const failedResult = checkResult.find(item => !item.status);
        return {
            status: !failedResult,
            namespace: failedResult === null || failedResult === void 0 ? void 0 : failedResult.namespace,
            reason: failedResult === null || failedResult === void 0 ? void 0 : failedResult.reason,
            results: checkResult,
        };
    }
    setCheckTimeout(timeout) {
        this.healthCheckTimeout = timeout;
    }
};
__decorate([
    (0, decorator_1.Inject)(),
    __metadata("design:type", configService_1.MidwayConfigService)
], MidwayHealthService.prototype, "configService", void 0);
__decorate([
    (0, decorator_1.ApplicationContext)(),
    __metadata("design:type", Object)
], MidwayHealthService.prototype, "applicationContext", void 0);
MidwayHealthService = __decorate([
    (0, decorator_1.Provide)(),
    (0, decorator_1.Scope)(interface_1.ScopeEnum.Singleton)
], MidwayHealthService);
exports.MidwayHealthService = MidwayHealthService;
//# sourceMappingURL=healthService.js.map

/***/ }),

/***/ 1560:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MidwayInformationService = void 0;
const interface_1 = __nccwpck_require__(7270);
const util_1 = __nccwpck_require__(6110);
const path_1 = __nccwpck_require__(6928);
const decorator_1 = __nccwpck_require__(8351);
const fs_1 = __nccwpck_require__(9896);
let MidwayInformationService = class MidwayInformationService {
    init() {
        if (this.baseDir) {
            if (!this.appDir) {
                this.appDir = (0, path_1.dirname)(this.baseDir);
            }
            const pkgPath = (0, path_1.join)(this.appDir, 'package.json');
            if ((0, fs_1.existsSync)(pkgPath)) {
                const content = (0, fs_1.readFileSync)(pkgPath, {
                    encoding: 'utf-8',
                });
                this.pkg = JSON.parse(content);
            }
            else {
                this.pkg = {};
            }
        }
        else {
            this.pkg = {};
        }
    }
    getAppDir() {
        return this.appDir;
    }
    getBaseDir() {
        return this.baseDir;
    }
    getHome() {
        return (0, util_1.getUserHome)();
    }
    getPkg() {
        return this.pkg;
    }
    getProjectName() {
        var _a;
        return ((_a = this.pkg) === null || _a === void 0 ? void 0 : _a['name']) || '';
    }
    getRoot() {
        const isDevelopmentEnv = (0, util_1.isDevelopmentEnvironment)((0, util_1.getCurrentEnvironment)());
        return isDevelopmentEnv ? this.getAppDir() : this.getHome();
    }
};
__decorate([
    (0, decorator_1.Inject)(),
    __metadata("design:type", String)
], MidwayInformationService.prototype, "appDir", void 0);
__decorate([
    (0, decorator_1.Inject)(),
    __metadata("design:type", String)
], MidwayInformationService.prototype, "baseDir", void 0);
__decorate([
    (0, decorator_1.Init)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MidwayInformationService.prototype, "init", null);
MidwayInformationService = __decorate([
    (0, decorator_1.Provide)(),
    (0, decorator_1.Scope)(interface_1.ScopeEnum.Singleton)
], MidwayInformationService);
exports.MidwayInformationService = MidwayInformationService;
//# sourceMappingURL=informationService.js.map

/***/ }),

/***/ 1026:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MidwayLifeCycleService = void 0;
const interface_1 = __nccwpck_require__(7270);
const decorator_1 = __nccwpck_require__(8351);
const configuration_1 = __nccwpck_require__(5061);
const frameworkService_1 = __nccwpck_require__(5338);
const configService_1 = __nccwpck_require__(3440);
const util_1 = __nccwpck_require__(9023);
const mockService_1 = __nccwpck_require__(7072);
const healthService_1 = __nccwpck_require__(4292);
const performanceManager_1 = __nccwpck_require__(4334);
const debug = (0, util_1.debuglog)('midway:debug');
let MidwayLifeCycleService = class MidwayLifeCycleService {
    constructor(applicationContext) {
        this.applicationContext = applicationContext;
        this.lifecycleInstanceList = [];
    }
    async init() {
        // exec simulator init
        await this.mockService.initSimulation();
        // run lifecycle
        const cycles = (0, decorator_1.listModule)(decorator_1.CONFIGURATION_KEY);
        debug(`[core]: Found Configuration length = ${cycles.length}`);
        for (const cycle of cycles) {
            if (cycle.target instanceof configuration_1.FunctionalConfiguration) {
                // 函数式写法
                cycle.instance = cycle.target;
            }
            else {
                // 普通类写法
                debug(`[core]: Lifecycle run ${cycle.namespace} init`);
                cycle.instance = await this.applicationContext.getAsync(cycle.target);
            }
            cycle.instance && this.lifecycleInstanceList.push(cycle);
        }
        // init health check service
        await this.healthService.init(this.lifecycleInstanceList);
        // bind object lifecycle
        await Promise.all([
            this.runObjectLifeCycle(this.lifecycleInstanceList, 'onBeforeObjectCreated'),
            this.runObjectLifeCycle(this.lifecycleInstanceList, 'onObjectCreated'),
            this.runObjectLifeCycle(this.lifecycleInstanceList, 'onObjectInit'),
            this.runObjectLifeCycle(this.lifecycleInstanceList, 'onBeforeObjectDestroy'),
        ]);
        // bind framework lifecycle
        // onAppError
        // exec onConfigLoad()
        await this.runContainerLifeCycle(this.lifecycleInstanceList, 'onConfigLoad', configData => {
            if (configData) {
                this.configService.addObject(configData);
            }
        });
        await this.mockService.runSimulatorSetup();
        // exec onReady()
        await this.runContainerLifeCycle(this.lifecycleInstanceList, 'onReady');
        // exec framework.run()
        await this.frameworkService.runFramework();
        // exec onServerReady()
        await this.runContainerLifeCycle(this.lifecycleInstanceList, 'onServerReady');
        // clear config merge cache
        if (!this.configService.getConfiguration('debug.recordConfigMergeOrder')) {
            this.configService.clearConfigMergeOrder();
        }
    }
    async stop() {
        await this.mockService.runSimulatorTearDown();
        // stop lifecycle
        const cycles = (0, decorator_1.listModule)(decorator_1.CONFIGURATION_KEY) || [];
        for (const cycle of cycles.reverse()) {
            let inst;
            if (cycle.target instanceof configuration_1.FunctionalConfiguration) {
                // 函数式写法
                inst = cycle.target;
            }
            else {
                inst = await this.applicationContext.getAsync(cycle.target);
            }
            await this.runContainerLifeCycle(inst, 'onStop');
        }
        // stop framework
        await this.frameworkService.stopFramework();
    }
    /**
     * run some lifecycle in configuration
     * @param lifecycleInstanceOrList
     * @param lifecycle
     * @param resultHandler
     */
    async runContainerLifeCycle(lifecycleInstanceOrList, lifecycle, resultHandler) {
        if (Array.isArray(lifecycleInstanceOrList)) {
            for (const cycle of lifecycleInstanceOrList) {
                if (typeof cycle.instance[lifecycle] === 'function') {
                    debug(`[core]: Lifecycle run ${cycle.instance.constructor.name} ${lifecycle}`);
                    performanceManager_1.MidwayInitializerPerformanceManager.lifecycleStart(cycle.namespace, lifecycle);
                    const result = await cycle.instance[lifecycle](this.applicationContext, this.frameworkService.getMainApp());
                    if (resultHandler) {
                        resultHandler(result);
                    }
                    performanceManager_1.MidwayInitializerPerformanceManager.lifecycleEnd(cycle.namespace, lifecycle);
                }
            }
        }
        else {
            if (typeof lifecycleInstanceOrList[lifecycle] === 'function') {
                const name = lifecycleInstanceOrList.constructor.name;
                debug(`[core]: Lifecycle run ${name} ${lifecycle}`);
                performanceManager_1.MidwayInitializerPerformanceManager.lifecycleStart(name, lifecycle);
                const result = await lifecycleInstanceOrList[lifecycle](this.applicationContext, this.frameworkService.getMainApp());
                if (resultHandler) {
                    resultHandler(result);
                }
                performanceManager_1.MidwayInitializerPerformanceManager.lifecycleEnd(name, lifecycle);
            }
        }
    }
    /**
     * run object lifecycle
     * @param lifecycleInstanceList
     * @param lifecycle
     */
    async runObjectLifeCycle(lifecycleInstanceList, lifecycle) {
        for (const cycle of lifecycleInstanceList) {
            if (typeof cycle.instance[lifecycle] === 'function') {
                debug(`[core]: Lifecycle run ${cycle.instance.constructor.name} ${lifecycle}`);
                return await this.applicationContext[lifecycle](cycle.instance[lifecycle].bind(cycle.instance));
            }
        }
    }
    getLifecycleInstanceList() {
        return this.lifecycleInstanceList;
    }
};
__decorate([
    (0, decorator_1.Inject)(),
    __metadata("design:type", frameworkService_1.MidwayFrameworkService)
], MidwayLifeCycleService.prototype, "frameworkService", void 0);
__decorate([
    (0, decorator_1.Inject)(),
    __metadata("design:type", configService_1.MidwayConfigService)
], MidwayLifeCycleService.prototype, "configService", void 0);
__decorate([
    (0, decorator_1.Inject)(),
    __metadata("design:type", mockService_1.MidwayMockService)
], MidwayLifeCycleService.prototype, "mockService", void 0);
__decorate([
    (0, decorator_1.Inject)(),
    __metadata("design:type", healthService_1.MidwayHealthService)
], MidwayLifeCycleService.prototype, "healthService", void 0);
__decorate([
    (0, decorator_1.Init)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MidwayLifeCycleService.prototype, "init", null);
MidwayLifeCycleService = __decorate([
    (0, decorator_1.Provide)(),
    (0, decorator_1.Scope)(interface_1.ScopeEnum.Singleton),
    __metadata("design:paramtypes", [Object])
], MidwayLifeCycleService);
exports.MidwayLifeCycleService = MidwayLifeCycleService;
//# sourceMappingURL=lifeCycleService.js.map

/***/ }),

/***/ 426:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MidwayLoggerService = void 0;
const decorator_1 = __nccwpck_require__(8351);
const configService_1 = __nccwpck_require__(3440);
const serviceFactory_1 = __nccwpck_require__(7940);
const interface_1 = __nccwpck_require__(7270);
const loggerFactory_1 = __nccwpck_require__(4853);
const error_1 = __nccwpck_require__(6248);
let MidwayLoggerService = class MidwayLoggerService extends serviceFactory_1.ServiceFactory {
    constructor(applicationContext, globalOptions = {}) {
        super();
        this.applicationContext = applicationContext;
        this.globalOptions = globalOptions;
        this.lazyLoggerConfigMap = new Map();
        this.aliasLoggerMap = new Map();
    }
    init() {
        var _a;
        const loggerFactory = this.configService.getConfiguration('loggerFactory');
        // load logger factory from user config first
        this.loggerFactory =
            loggerFactory ||
                this.globalOptions['loggerFactory'] ||
                new loggerFactory_1.DefaultConsoleLoggerFactory();
        // check
        if (!this.loggerFactory.getDefaultMidwayLoggerConfig) {
            throw new error_1.MidwayFeatureNoLongerSupportedError('please upgrade your @midwayjs/logger to latest version');
        }
        const defaultLoggerConfig = this.loggerFactory.getDefaultMidwayLoggerConfig(this.configService.getAppInfo());
        // merge to user config
        this.configService.addObject(defaultLoggerConfig, true);
        // init logger
        this.initClients(this.configService.getConfiguration('midwayLogger'));
        // alias inject logger
        (_a = this.applicationContext) === null || _a === void 0 ? void 0 : _a.registerObject('logger', this.getLogger('appLogger'));
    }
    createClient(config, name) {
        if (config.aliasName) {
            // mapping alias logger name to real logger name
            this.aliasLoggerMap.set(config.aliasName, name);
        }
        if (!config.lazyLoad) {
            this.loggerFactory.createLogger(name, config);
        }
        else {
            delete config['lazyLoad'];
            this.lazyLoggerConfigMap.set(name, config);
        }
    }
    getName() {
        return 'logger';
    }
    createLogger(name, config) {
        delete config['aliasName'];
        return this.loggerFactory.createLogger(name, config);
    }
    getLogger(name) {
        if (this.aliasLoggerMap.has(name)) {
            // get real logger name
            name = this.aliasLoggerMap.get(name);
        }
        const logger = this.loggerFactory.getLogger(name);
        if (logger) {
            return logger;
        }
        if (this.lazyLoggerConfigMap.has(name)) {
            // try to lazy init
            this.createClient(this.lazyLoggerConfigMap.get(name), name);
            this.lazyLoggerConfigMap.delete(name);
        }
        return this.loggerFactory.getLogger(name);
    }
    getCurrentLoggerFactory() {
        return this.loggerFactory;
    }
    createContextLogger(ctx, appLogger, contextOptions) {
        return this.loggerFactory.createContextLogger(ctx, appLogger, contextOptions);
    }
    getClients() {
        return this.clients;
    }
    getClientKeys() {
        return Array.from(this.clients.keys());
    }
};
__decorate([
    (0, decorator_1.Inject)(),
    __metadata("design:type", configService_1.MidwayConfigService)
], MidwayLoggerService.prototype, "configService", void 0);
__decorate([
    (0, decorator_1.Init)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MidwayLoggerService.prototype, "init", null);
MidwayLoggerService = __decorate([
    (0, decorator_1.Provide)(),
    (0, decorator_1.Scope)(interface_1.ScopeEnum.Singleton),
    __metadata("design:paramtypes", [Object, Object])
], MidwayLoggerService);
exports.MidwayLoggerService = MidwayLoggerService;
//# sourceMappingURL=loggerService.js.map

/***/ }),

/***/ 6134:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MidwayMiddlewareService = void 0;
const decorator_1 = __nccwpck_require__(8351);
const interface_1 = __nccwpck_require__(7270);
const error_1 = __nccwpck_require__(6248);
const util_1 = __nccwpck_require__(6110);
const types_1 = __nccwpck_require__(3171);
const util_2 = __nccwpck_require__(9023);
const debug = (0, util_2.debuglog)('midway:debug');
let MidwayMiddlewareService = class MidwayMiddlewareService {
    constructor(applicationContext) {
        this.applicationContext = applicationContext;
    }
    async compose(middleware, app, name) {
        var _a;
        if (!Array.isArray(middleware)) {
            throw new error_1.MidwayParameterError('Middleware stack must be an array');
        }
        const newMiddlewareArr = [];
        for (let fn of middleware) {
            if (types_1.Types.isClass(fn) || typeof fn === 'string' || (fn === null || fn === void 0 ? void 0 : fn['middleware'])) {
                let mw = (_a = fn === null || fn === void 0 ? void 0 : fn['middleware']) !== null && _a !== void 0 ? _a : fn;
                const mwConfig = fn === null || fn === void 0 ? void 0 : fn['options'];
                let mwName = fn === null || fn === void 0 ? void 0 : fn['name'];
                if (typeof mw === 'string' &&
                    !this.applicationContext.hasDefinition(mw)) {
                    throw new error_1.MidwayCommonError(`Middleware definition of "${mw}" not found in midway container`);
                }
                const classMiddleware = await this.applicationContext.getAsync(mw);
                if (classMiddleware) {
                    mwName = mwName !== null && mwName !== void 0 ? mwName : classMiddleware.constructor.name;
                    mw = await classMiddleware.resolve(app, mwConfig);
                    if (!mw) {
                        // for middleware enabled
                        continue;
                    }
                    if (!classMiddleware.match && !classMiddleware.ignore) {
                        if (!mw.name) {
                            mw._name = mwName;
                        }
                        // just got fn
                        newMiddlewareArr.push(mw);
                    }
                    else {
                        // wrap ignore and match
                        const match = (0, util_1.pathMatching)({
                            match: classMiddleware.match,
                            ignore: classMiddleware.ignore,
                            thisResolver: classMiddleware,
                        });
                        fn = (ctx, next, options) => {
                            if (!match(ctx))
                                return next();
                            return mw(ctx, next, options);
                        };
                        fn._name = mwName;
                        newMiddlewareArr.push(fn);
                    }
                }
                else {
                    throw new error_1.MidwayCommonError('Middleware must have resolve method!');
                }
            }
            else {
                newMiddlewareArr.push(fn);
            }
        }
        /**
         * @param {Object} context
         * @param next
         * @return {Promise}
         * @api public
         */
        const composeFn = (context, next) => {
            const supportBody = (0, util_1.isIncludeProperty)(context, 'body');
            // last called middleware #
            let index = -1;
            return dispatch(0);
            function dispatch(i) {
                if (i <= index)
                    return Promise.reject(new error_1.MidwayCommonError('next() called multiple times'));
                index = i;
                let fn = newMiddlewareArr[i];
                if (i === newMiddlewareArr.length)
                    fn = next;
                if (!fn)
                    return Promise.resolve();
                const middlewareName = `${name ? `${name}.` : ''}${index} ${fn._name || fn.name || 'anonymous'}`;
                const startTime = Date.now();
                debug(`[middleware]: in ${middlewareName} +0`);
                try {
                    if (supportBody) {
                        return Promise.resolve(fn(context, dispatch.bind(null, i + 1), {
                            index,
                        })).then(result => {
                            /**
                             * 1、return 和 ctx.body，return 的优先级更高
                             * 2、如果 result 有值（非 undefined），则不管什么情况，都会覆盖当前 body，注意，这里有可能赋值 null，导致 status 为 204，会在中间件处进行修正
                             * 3、如果 result 没值，且 ctx.body 已经赋值，则向 result 赋值
                             */
                            if (result !== undefined) {
                                context['body'] = result;
                            }
                            else if (context['body'] !== undefined) {
                                result = context['body'];
                            }
                            debug(`[middleware]: out ${middlewareName} +${Date.now() - startTime} with body`);
                            return result;
                        });
                    }
                    else {
                        return Promise.resolve(fn(context, dispatch.bind(null, i + 1), {
                            index,
                        })).then(result => {
                            debug(`[middleware]: out ${middlewareName} +${Date.now() - startTime}`);
                            return result;
                        });
                    }
                }
                catch (err) {
                    debug(`[middleware]: out ${middlewareName} +${Date.now() - startTime} with err ${err.message}`);
                    return Promise.reject(err);
                }
            }
        };
        if (name) {
            composeFn._name = name;
        }
        return composeFn;
    }
};
MidwayMiddlewareService = __decorate([
    (0, decorator_1.Provide)(),
    (0, decorator_1.Scope)(interface_1.ScopeEnum.Singleton),
    __metadata("design:paramtypes", [Object])
], MidwayMiddlewareService);
exports.MidwayMiddlewareService = MidwayMiddlewareService;
//# sourceMappingURL=middlewareService.js.map

/***/ }),

/***/ 7072:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MidwayMockService_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MidwayMockService = void 0;
const interface_1 = __nccwpck_require__(7270);
const decorator_1 = __nccwpck_require__(8351);
const types_1 = __nccwpck_require__(3171);
let MidwayMockService = MidwayMockService_1 = class MidwayMockService {
    constructor(applicationContext) {
        this.applicationContext = applicationContext;
        /**
         * Save class prototype and object property mocks
         */
        this.mocks = new Map();
        /**
         * Save context mocks
         */
        this.contextMocks = new Map();
        this.cache = new Map();
        this.simulatorList = [];
    }
    async init() {
        if (MidwayMockService_1.prepareMocks.length > 0) {
            for (const item of MidwayMockService_1.prepareMocks) {
                this.mockProperty(item.obj, item.key, item.value, item.group);
            }
            MidwayMockService_1.prepareMocks = [];
        }
    }
    static mockClassProperty(clzz, propertyName, value, group = 'default') {
        this.mockProperty(clzz.prototype, propertyName, value, group);
    }
    static mockProperty(obj, key, value, group = 'default') {
        this.prepareMocks.push({
            obj,
            key,
            value,
            group,
        });
    }
    mockClassProperty(clzz, propertyName, value, group = 'default') {
        return this.mockProperty(clzz.prototype, propertyName, value, group);
    }
    mockProperty(obj, key, value, group = 'default') {
        // eslint-disable-next-line no-prototype-builtins
        const hasOwnProperty = obj.hasOwnProperty(key);
        const mockItem = {
            obj,
            key,
            descriptor: Object.getOwnPropertyDescriptor(obj, key),
            // Make sure the key exists on object not the prototype
            hasOwnProperty,
        };
        if (!this.mocks.has(group)) {
            this.mocks.set(group, []);
        }
        this.mocks.get(group).push(mockItem);
        if (hasOwnProperty) {
            delete obj[key];
        }
        // Set a flag that checks if it is mocked
        let groupCache = this.cache.get(group);
        if (!groupCache) {
            groupCache = new Map();
            this.cache.set(group, groupCache);
        }
        let flag = groupCache.get(obj);
        if (!flag) {
            flag = new Set();
            groupCache.set(obj, flag);
        }
        flag.add(key);
        const descriptor = this.overridePropertyDescriptor(value);
        Object.defineProperty(obj, key, descriptor);
    }
    mockContext(app, key, value, group = 'default') {
        if (!this.contextMocks.has(group)) {
            this.contextMocks.set(group, []);
        }
        this.contextMocks.get(group).push({
            app,
            key,
            value,
        });
    }
    restore(group = 'default') {
        this.restoreGroup(group);
    }
    restoreAll() {
        const groups = new Set([
            ...this.mocks.keys(),
            ...this.contextMocks.keys(),
            ...this.cache.keys(),
        ]);
        for (const group of groups) {
            this.restoreGroup(group);
        }
        this.simulatorList = [];
    }
    restoreGroup(group) {
        const groupMocks = this.mocks.get(group) || [];
        for (let i = groupMocks.length - 1; i >= 0; i--) {
            const m = groupMocks[i];
            if (!m.hasOwnProperty) {
                delete m.obj[m.key];
            }
            else {
                Object.defineProperty(m.obj, m.key, m.descriptor);
            }
        }
        this.mocks.delete(group);
        this.contextMocks.delete(group);
        this.cache.delete(group);
        this.simulatorList = this.simulatorList.filter(sim => sim['group'] !== group);
    }
    isMocked(obj, key, group = 'default') {
        if ((0, types_1.isClass)(obj)) {
            obj = obj.prototype;
        }
        const groupCache = this.cache.get(group);
        const flag = groupCache ? groupCache.get(obj) : undefined;
        return flag ? flag.has(key) : false;
    }
    applyContextMocks(app, ctx) {
        for (const [, groupMocks] of this.contextMocks) {
            for (const mockItem of groupMocks) {
                if (mockItem.app === app) {
                    const descriptor = this.overridePropertyDescriptor(mockItem.value);
                    if (typeof mockItem.key === 'string') {
                        Object.defineProperty(ctx, mockItem.key, descriptor);
                    }
                    else {
                        mockItem.key(ctx);
                    }
                }
            }
        }
    }
    getContextMocksSize() {
        return Array.from(this.contextMocks.values()).reduce((sum, group) => sum + group.length, 0);
    }
    overridePropertyDescriptor(value) {
        const descriptor = {
            configurable: true,
            enumerable: true,
        };
        if (value && (value.get || value.set)) {
            // Default to undefined
            descriptor.get = value.get;
            descriptor.set = value.set;
        }
        else {
            // Without getter/setter mode
            descriptor.value = value;
            descriptor.writable = true;
        }
        return descriptor;
    }
    async initSimulation(group = 'default') {
        const simulationModule = (0, decorator_1.listModule)(decorator_1.MOCK_KEY);
        for (const module of simulationModule) {
            const instance = await this.applicationContext.getAsync(module);
            if (await instance.enableCondition()) {
                instance['group'] = group;
                this.simulatorList.push(instance);
            }
        }
    }
    async runSimulatorSetup() {
        var _a;
        for (const simulator of this.simulatorList) {
            await ((_a = simulator.setup) === null || _a === void 0 ? void 0 : _a.call(simulator));
        }
    }
    async runSimulatorTearDown() {
        var _a;
        // reverse loop and not change origin simulatorList
        for (let i = this.simulatorList.length - 1; i >= 0; i--) {
            const simulator = this.simulatorList[i];
            await ((_a = simulator.tearDown) === null || _a === void 0 ? void 0 : _a.call(simulator));
        }
    }
    async runSimulatorAppSetup(app) {
        var _a;
        for (const simulator of this.simulatorList) {
            await ((_a = simulator.appSetup) === null || _a === void 0 ? void 0 : _a.call(simulator, app));
        }
    }
    async runSimulatorAppTearDown(app) {
        var _a;
        // reverse loop and not change origin simulatorList
        for (let i = this.simulatorList.length - 1; i >= 0; i--) {
            const simulator = this.simulatorList[i];
            await ((_a = simulator.appTearDown) === null || _a === void 0 ? void 0 : _a.call(simulator, app));
        }
    }
    async runSimulatorContextSetup(ctx, app) {
        var _a;
        for (const simulator of this.simulatorList) {
            await ((_a = simulator.contextSetup) === null || _a === void 0 ? void 0 : _a.call(simulator, ctx, app));
        }
    }
    async runSimulatorContextTearDown(ctx, app) {
        var _a;
        // reverse loop and not change origin simulatorList
        for (let i = this.simulatorList.length - 1; i >= 0; i--) {
            const simulator = this.simulatorList[i];
            await ((_a = simulator === null || simulator === void 0 ? void 0 : simulator.contextTearDown) === null || _a === void 0 ? void 0 : _a.call(simulator, ctx, app));
        }
    }
};
/**
 * Prepare mocks before the service is initialized
 */
MidwayMockService.prepareMocks = [];
__decorate([
    (0, decorator_1.Init)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MidwayMockService.prototype, "init", null);
__decorate([
    (0, decorator_1.Destroy)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MidwayMockService.prototype, "restoreAll", null);
MidwayMockService = MidwayMockService_1 = __decorate([
    (0, decorator_1.Provide)(),
    (0, decorator_1.Scope)(interface_1.ScopeEnum.Singleton),
    __metadata("design:paramtypes", [Object])
], MidwayMockService);
exports.MidwayMockService = MidwayMockService;
//# sourceMappingURL=mockService.js.map

/***/ }),

/***/ 720:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MidwayPipelineService = exports.PipelineContext = void 0;
const decorator_1 = __nccwpck_require__(8351);
////////////// implements ///////////////////////
class PipelineContext {
    constructor(args) {
        this.info = { current: null, currentName: null };
        this.data = new Map();
        this.args = args;
    }
    get(key) {
        return this.data.get(key);
    }
    set(key, val) {
        this.data.set(key, val);
    }
    keys() {
        const keys = [];
        const iter = this.data.keys();
        for (const k of iter) {
            keys.push(k);
        }
        return keys;
    }
}
exports.PipelineContext = PipelineContext;
class MidwayPipelineService {
    // 默认的 valves (@Pipeline(['test1', 'test2']))
    constructor(applicationContext, valves) {
        this.applicationContext = applicationContext;
        this.valves = valves;
    }
    /**
     * 并行执行，使用 Promise.all
     * @param opts 执行参数
     */
    async parallel(opts) {
        const valves = this.prepareParallelValves(opts);
        const res = await Promise.all(valves);
        return this.packResult(res, false);
    }
    /**
     * 并行执行，最终 result 为数组
     * @param opts 执行参数
     */
    async concat(opts) {
        const valves = this.prepareParallelValves(opts);
        const res = await Promise.all(valves);
        return this.packResult(res, true);
    }
    /**
     * 串行执行，使用 foreach await
     * @param opts 执行参数
     */
    async series(opts) {
        const valves = this.mergeValves(opts.valves);
        const ctx = new PipelineContext(opts.args);
        const result = { success: true, result: null };
        const data = {};
        const info = {
            prevValue: null,
            current: null,
            currentName: null,
            prev: null,
            prevName: null,
            next: null,
            nextName: null,
        };
        let nextIdx = 1;
        for (const v of valves) {
            info.prev = info.current;
            info.prevName = getName(info.prev);
            info.current = v;
            info.currentName = getName(info.current);
            if (nextIdx < valves.length) {
                info.next = valves[nextIdx];
                info.nextName = getName(info.next);
            }
            else {
                info.next = undefined;
                info.nextName = undefined;
            }
            nextIdx += 1;
            ctx.info = info;
            try {
                const inst = await this.applicationContext.getAsync(v);
                const tmpValue = await inst.invoke(ctx);
                let key = v;
                if (inst.alias) {
                    key = inst.alias;
                }
                data[key] = tmpValue;
                info.prevValue = tmpValue;
            }
            catch (e) {
                result.success = false;
                result.error = {
                    valveName: typeof v === 'string' ? v : v.name,
                    message: e.message,
                    error: e,
                };
                return result;
            }
        }
        result.result = data;
        return result;
    }
    /**
     * 串行执行，使用 foreach await，最终 result 为数组
     * @param opts 执行参数
     */
    async concatSeries(opts) {
        const valves = this.mergeValves(opts.valves);
        const ctx = new PipelineContext(opts.args);
        const result = { success: true, result: null };
        const data = [];
        const info = {
            prevValue: null,
            current: null,
            currentName: null,
            prev: null,
            prevName: null,
            next: null,
            nextName: null,
        };
        let nextIdx = 1;
        for (const v of valves) {
            info.prev = info.current;
            info.prevName = getName(info.prev);
            info.current = v;
            info.currentName = getName(info.current);
            if (nextIdx < valves.length) {
                info.next = valves[nextIdx];
                info.nextName = getName(info.next);
            }
            else {
                info.next = undefined;
                info.nextName = undefined;
            }
            nextIdx += 1;
            ctx.info = info;
            try {
                const inst = await this.applicationContext.getAsync(v);
                const tmpValue = await inst.invoke(ctx);
                data.push(tmpValue);
                info.prevValue = tmpValue;
            }
            catch (e) {
                result.success = false;
                result.error = {
                    valveName: typeof v === 'string' ? v : v.name,
                    message: e.message,
                    error: e,
                };
                return result;
            }
        }
        result.result = data;
        return result;
    }
    /**
     * 串行执行，但是会把前者执行结果当成入参，传入到下一个执行中去，最后一个执行的 valve 结果会被返回
     * @param opts 执行参数
     */
    async waterfall(opts) {
        const result = await this.concatSeries(opts);
        if (result.success) {
            const data = result.result;
            result.result = data[data.length - 1];
        }
        return result;
    }
    mergeValves(valves) {
        let items = [];
        if (this.valves && this.valves.length > 0) {
            items = this.valves;
        }
        let newItems = [];
        if (valves) {
            for (const v of valves) {
                if (items.includes(v)) {
                    newItems.push(v);
                }
            }
        }
        else {
            newItems = items;
        }
        return newItems;
    }
    prepareParallelValves(opts) {
        const valves = this.mergeValves(opts.valves);
        const ctx = new PipelineContext(opts.args);
        return valves.map(async (v) => {
            const rt = { valveName: v, dataKey: v, data: null };
            try {
                const inst = await this.applicationContext.getAsync(v);
                if (inst.alias) {
                    rt.dataKey = inst.alias;
                }
                rt.data = await inst.invoke(ctx);
            }
            catch (e) {
                rt.error = e;
            }
            return rt;
        });
    }
    packResult(res, resultIsArray = false) {
        const result = { success: true, result: null };
        let data;
        if (resultIsArray) {
            data = [];
        }
        else {
            data = {};
        }
        for (const r of res) {
            if (r.error) {
                result.success = false;
                result.error = {
                    valveName: typeof r.valveName === 'string' ? r.valveName : r.valveName.name,
                    message: r.error.message,
                    error: r.error,
                };
                return result;
            }
            else {
                if (resultIsArray) {
                    data.push(r.data);
                }
                else {
                    data[r.dataKey] = r.data;
                }
            }
        }
        result.result = data;
        return result;
    }
}
exports.MidwayPipelineService = MidwayPipelineService;
function getName(target) {
    if (target) {
        if (typeof target === 'string') {
            return target;
        }
        else {
            return (0, decorator_1.getProviderName)(target);
        }
    }
    return null;
}
//# sourceMappingURL=pipelineService.js.map

/***/ }),

/***/ 2986:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WebRouterCollector = exports.MidwayServerlessFunctionService = void 0;
const decorator_1 = __nccwpck_require__(8351);
const webRouterService_1 = __nccwpck_require__(4259);
const container_1 = __nccwpck_require__(2922);
const fileDetector_1 = __nccwpck_require__(1207);
const contextUtil_1 = __nccwpck_require__(7269);
const interface_1 = __nccwpck_require__(7270);
let MidwayServerlessFunctionService = class MidwayServerlessFunctionService extends webRouterService_1.MidwayWebRouterService {
    constructor(options = {}) {
        super(Object.assign({}, options, {
            includeFunctionRouter: true,
        }));
        this.options = options;
    }
    async analyze() {
        this.analyzeController();
        this.analyzeFunction();
        this.sortPrefixAndRouter();
        // requestMethod all transform to other method
        for (const routerInfo of this.routes.values()) {
            for (const info of routerInfo) {
                if (info.requestMethod === 'all') {
                    info.functionTriggerMetadata = info.functionTriggerMetadata || {};
                    info.functionTriggerMetadata.method = [
                        'get',
                        'post',
                        'put',
                        'delete',
                        'head',
                        'patch',
                        'options',
                    ];
                }
            }
        }
    }
    analyzeFunction() {
        const fnModules = (0, decorator_1.listModule)(decorator_1.FUNC_KEY);
        for (const module of fnModules) {
            this.collectFunctionRoute(module);
        }
    }
    collectFunctionRoute(module) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
        // serverlessTrigger metadata
        const webRouterInfo = (0, decorator_1.getClassMetadata)(decorator_1.FUNC_KEY, module);
        const controllerId = (0, decorator_1.getProviderName)(module);
        const id = (0, decorator_1.getProviderUUId)(module);
        const prefix = '/';
        if (!this.routes.has(prefix)) {
            this.routes.set(prefix, []);
            this.routesPriority.push({
                prefix,
                priority: -999,
                middleware: [],
                routerOptions: {},
                controllerId,
                routerModule: module,
            });
        }
        for (const webRouter of webRouterInfo) {
            // 新的 @ServerlessTrigger 写法
            if ((_a = webRouter['metadata']) === null || _a === void 0 ? void 0 : _a['path']) {
                const routeArgsInfo = (0, decorator_1.getPropertyDataFromClass)(decorator_1.WEB_ROUTER_PARAM_KEY, module, webRouter['methodName']) || [];
                const routerResponseData = (0, decorator_1.getPropertyMetadata)(decorator_1.WEB_RESPONSE_KEY, module, webRouter['methodName']) || [];
                // 新 http/api gateway 函数
                const data = {
                    id,
                    prefix,
                    routerName: '',
                    url: webRouter['metadata']['path'],
                    requestMethod: (_c = (_b = webRouter['metadata']) === null || _b === void 0 ? void 0 : _b['method']) !== null && _c !== void 0 ? _c : 'get',
                    method: webRouter['methodName'],
                    description: '',
                    summary: '',
                    handlerName: `${controllerId}.${webRouter['methodName']}`,
                    funcHandlerName: `${controllerId}.${webRouter['methodName']}`,
                    controllerId,
                    middleware: ((_d = webRouter['metadata']) === null || _d === void 0 ? void 0 : _d['middleware']) || [],
                    controllerMiddleware: [],
                    requestMetadata: routeArgsInfo,
                    responseMetadata: routerResponseData,
                };
                const functionMeta = (0, decorator_1.getPropertyMetadata)(decorator_1.SERVERLESS_FUNC_KEY, module, webRouter['methodName']) || {};
                const functionName = (_g = (_e = functionMeta['functionName']) !== null && _e !== void 0 ? _e : (_f = webRouter === null || webRouter === void 0 ? void 0 : webRouter['metadata']) === null || _f === void 0 ? void 0 : _f['functionName']) !== null && _g !== void 0 ? _g : createFunctionName(module, webRouter['methodName']);
                const funcHandlerName = (_k = (_h = functionMeta['handlerName']) !== null && _h !== void 0 ? _h : (_j = webRouter === null || webRouter === void 0 ? void 0 : webRouter['metadata']) === null || _j === void 0 ? void 0 : _j['handlerName']) !== null && _k !== void 0 ? _k : data.funcHandlerName;
                data.functionName = functionName;
                data.funcHandlerName = funcHandlerName;
                data.functionTriggerName = webRouter['type'];
                data.functionTriggerMetadata = webRouter['metadata'];
                data.functionMetadata = {
                    functionName,
                    ...functionMeta,
                };
                this.checkDuplicateAndPush(prefix, data);
            }
            else {
                const functionMeta = (0, decorator_1.getPropertyMetadata)(decorator_1.SERVERLESS_FUNC_KEY, module, webRouter['methodName']) || {};
                const functionName = (_o = (_l = functionMeta['functionName']) !== null && _l !== void 0 ? _l : (_m = webRouter === null || webRouter === void 0 ? void 0 : webRouter['metadata']) === null || _m === void 0 ? void 0 : _m['functionName']) !== null && _o !== void 0 ? _o : createFunctionName(module, webRouter['methodName']);
                const funcHandlerName = (_r = (_p = functionMeta['handlerName']) !== null && _p !== void 0 ? _p : (_q = webRouter === null || webRouter === void 0 ? void 0 : webRouter['metadata']) === null || _q === void 0 ? void 0 : _q['handlerName']) !== null && _r !== void 0 ? _r : `${controllerId}.${webRouter['methodName']}`;
                // 其他类型的函数
                this.checkDuplicateAndPush(prefix, {
                    id,
                    prefix,
                    routerName: '',
                    url: '',
                    requestMethod: '',
                    method: webRouter['methodName'],
                    description: '',
                    summary: '',
                    handlerName: `${controllerId}.${webRouter['methodName']}`,
                    funcHandlerName: funcHandlerName,
                    controllerId,
                    middleware: ((_s = webRouter['metadata']) === null || _s === void 0 ? void 0 : _s['middleware']) || [],
                    controllerMiddleware: [],
                    requestMetadata: [],
                    responseMetadata: [],
                    functionName,
                    functionTriggerName: webRouter['type'],
                    functionTriggerMetadata: webRouter['metadata'],
                    functionMetadata: {
                        functionName,
                        ...functionMeta,
                    },
                });
            }
        }
    }
    async getFunctionList() {
        return this.getFlattenRouterTable({
            compileUrlPattern: true,
        });
    }
    addServerlessFunction(func, triggerOptions, functionOptions = {}) {
        var _a, _b;
        const prefix = '';
        if (!this.routes.has(prefix)) {
            this.routes.set(prefix, []);
            this.routesPriority.push({
                prefix,
                priority: 0,
                middleware: [],
                routerOptions: {},
                controllerId: undefined,
                routerModule: undefined,
            });
        }
        const functionName = (_a = triggerOptions.functionName) !== null && _a !== void 0 ? _a : functionOptions.functionName;
        this.checkDuplicateAndPush(prefix, {
            id: null,
            method: func,
            url: triggerOptions.metadata['path'] || '',
            requestMethod: triggerOptions.metadata['method'] || '',
            description: '',
            summary: '',
            handlerName: '',
            funcHandlerName: triggerOptions.handlerName || functionOptions.handlerName,
            controllerId: '',
            middleware: ((_b = triggerOptions.metadata) === null || _b === void 0 ? void 0 : _b.middleware) || [],
            controllerMiddleware: [],
            requestMetadata: [],
            responseMetadata: [],
            functionName,
            functionTriggerName: triggerOptions.metadata.name,
            functionTriggerMetadata: triggerOptions.metadata,
            functionMetadata: {
                functionName,
                ...functionOptions,
            },
        });
    }
};
MidwayServerlessFunctionService = __decorate([
    (0, decorator_1.Provide)(),
    (0, decorator_1.Scope)(interface_1.ScopeEnum.Singleton),
    __metadata("design:paramtypes", [Object])
], MidwayServerlessFunctionService);
exports.MidwayServerlessFunctionService = MidwayServerlessFunctionService;
function createFunctionName(target, functionName) {
    return (0, decorator_1.getProviderName)(target).replace(/[:#]/g, '-') + '-' + functionName;
}
/**
 * @deprecated use built-in MidwayWebRouterService first
 */
class WebRouterCollector {
    constructor(baseDir = '', options = {}) {
        this.baseDir = baseDir;
        this.options = options;
    }
    async init() {
        if (!this.proxy) {
            if (this.baseDir) {
                const container = new container_1.MidwayContainer();
                (0, decorator_1.bindContainer)(container);
                container.setFileDetector(new fileDetector_1.CommonJSFileDetector({
                    loadDir: this.baseDir,
                }));
                await container.ready();
            }
            if (this.options.includeFunctionRouter) {
                if ((0, contextUtil_1.getCurrentMainFramework)()) {
                    this.proxy = await (0, contextUtil_1.getCurrentMainFramework)()
                        .getApplicationContext()
                        .getAsync(MidwayServerlessFunctionService, [this.options]);
                }
                else {
                    this.proxy = new MidwayServerlessFunctionService(this.options);
                }
            }
            else {
                if ((0, contextUtil_1.getCurrentMainFramework)()) {
                    this.proxy = await (0, contextUtil_1.getCurrentMainFramework)()
                        .getApplicationContext()
                        .getAsync(webRouterService_1.MidwayWebRouterService, [this.options]);
                }
                else {
                    this.proxy = new webRouterService_1.MidwayWebRouterService(this.options);
                }
            }
        }
    }
    async getRoutePriorityList() {
        await this.init();
        return this.proxy.getRoutePriorityList();
    }
    async getRouterTable() {
        await this.init();
        return this.proxy.getRouterTable();
    }
    async getFlattenRouterTable() {
        await this.init();
        return this.proxy.getFlattenRouterTable();
    }
}
exports.WebRouterCollector = WebRouterCollector;
//# sourceMappingURL=slsFunctionService.js.map

/***/ }),

/***/ 4259:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MidwayWebRouterService = void 0;
const decorator_1 = __nccwpck_require__(8351);
const util_1 = __nccwpck_require__(6110);
const error_1 = __nccwpck_require__(6248);
const util = __nccwpck_require__(9023);
const pathToRegexp_1 = __nccwpck_require__(6027);
const types_1 = __nccwpck_require__(3171);
const interface_1 = __nccwpck_require__(7270);
const debug = util.debuglog('midway:debug');
let MidwayWebRouterService = class MidwayWebRouterService {
    constructor(options = {}) {
        this.options = options;
        this.isReady = false;
        this.routes = new Map();
        this.routesPriority = [];
    }
    async analyze() {
        this.analyzeController();
        this.sortPrefixAndRouter();
    }
    analyzeController() {
        const controllerModules = (0, decorator_1.listModule)(decorator_1.CONTROLLER_KEY);
        for (const module of controllerModules) {
            const controllerOption = (0, decorator_1.getClassMetadata)(decorator_1.CONTROLLER_KEY, module);
            this.addController(module, controllerOption, this.options.includeFunctionRouter);
        }
    }
    sortPrefixAndRouter() {
        // filter empty prefix
        this.routesPriority = this.routesPriority.filter(item => {
            const prefixList = this.routes.get(item.prefix);
            if (prefixList.length > 0) {
                return true;
            }
            else {
                this.routes.delete(item.prefix);
                return false;
            }
        });
        // sort router
        for (const prefix of this.routes.keys()) {
            const routerInfo = this.routes.get(prefix);
            this.routes.set(prefix, this.sortRouter(routerInfo));
        }
        // sort prefix
        this.routesPriority = this.routesPriority.sort((routeA, routeB) => {
            return routeB.prefix.length - routeA.prefix.length;
        });
    }
    addController(controllerClz, controllerOption, resourceOptions = {}, functionMeta = false) {
        var _a;
        if (resourceOptions && typeof resourceOptions === 'boolean') {
            functionMeta = resourceOptions;
            resourceOptions = undefined;
        }
        if (!resourceOptions) {
            resourceOptions = {};
        }
        const controllerId = (0, decorator_1.getProviderName)(controllerClz);
        debug(`[core]: Found Controller ${controllerId}.`);
        const id = (0, decorator_1.getProviderUUId)(controllerClz);
        controllerOption.routerOptions = controllerOption.routerOptions || {};
        let priority;
        // implement middleware in controller
        const middleware = controllerOption.routerOptions.middleware;
        const controllerIgnoreGlobalPrefix = !!((_a = controllerOption.routerOptions) === null || _a === void 0 ? void 0 : _a.ignoreGlobalPrefix);
        let prefix = (0, util_1.joinURLPath)(this.options.globalPrefix, controllerOption.prefix || '/');
        const ignorePrefix = controllerOption.prefix || '/';
        // if controller set ignore global prefix, all router will be ignore too.
        if (controllerIgnoreGlobalPrefix) {
            prefix = ignorePrefix;
        }
        if (/\*/.test(prefix)) {
            throw new error_1.MidwayCommonError(`Router prefix ${prefix} can't set string with *`);
        }
        // set prefix
        if (!this.routes.has(prefix)) {
            this.routes.set(prefix, []);
            this.routesPriority.push({
                prefix,
                priority: prefix === '/' && priority === undefined ? -999 : 0,
                middleware,
                routerOptions: controllerOption.routerOptions,
                controllerId,
                routerModule: controllerClz,
            });
        }
        else {
            // 不同的 controller，可能会有相同的 prefix，一旦 options 不同，就要报错
            if (middleware && middleware.length > 0) {
                const originRoute = this.routesPriority.filter(el => {
                    return el.prefix === prefix;
                })[0];
                throw new error_1.MidwayDuplicateControllerOptionsError(prefix, controllerId, originRoute.controllerId);
            }
        }
        // set ignorePrefix
        if (!this.routes.has(ignorePrefix)) {
            this.routes.set(ignorePrefix, []);
            this.routesPriority.push({
                prefix: ignorePrefix,
                priority: ignorePrefix === '/' && priority === undefined ? -999 : 0,
                middleware,
                routerOptions: controllerOption.routerOptions,
                controllerId,
                routerModule: controllerClz,
            });
        }
        const webRouterInfo = (0, decorator_1.getClassMetadata)(decorator_1.WEB_ROUTER_KEY, controllerClz);
        if (webRouterInfo && typeof webRouterInfo[Symbol.iterator] === 'function') {
            for (const webRouter of webRouterInfo) {
                const routeArgsInfo = (0, decorator_1.getPropertyDataFromClass)(decorator_1.WEB_ROUTER_PARAM_KEY, controllerClz, webRouter.method) || [];
                const routerResponseData = (0, decorator_1.getPropertyMetadata)(decorator_1.WEB_RESPONSE_KEY, controllerClz, webRouter.method) || [];
                const data = {
                    id,
                    prefix: webRouter.ignoreGlobalPrefix ? ignorePrefix : prefix,
                    routerName: webRouter.routerName || '',
                    url: webRouter.path,
                    requestMethod: webRouter.requestMethod,
                    method: webRouter.method,
                    description: webRouter.description || '',
                    summary: webRouter.summary || '',
                    handlerName: `${controllerId}.${webRouter.method}`,
                    funcHandlerName: `${controllerId}.${webRouter.method}`,
                    controllerId,
                    controllerClz,
                    middleware: webRouter.middleware || [],
                    controllerMiddleware: middleware || [],
                    requestMetadata: routeArgsInfo,
                    responseMetadata: routerResponseData,
                };
                if (functionMeta) {
                    // get function information
                    data.functionName = controllerId + '-' + webRouter.method;
                    data.functionTriggerName = interface_1.ServerlessTriggerType.HTTP;
                    data.functionTriggerMetadata = {
                        path: (0, util_1.joinURLPath)(prefix, webRouter.path.toString()),
                        method: webRouter.requestMethod,
                    };
                    data.functionMetadata = {
                        functionName: data.functionName,
                    };
                }
                if (resourceOptions.resourceFilter &&
                    !resourceOptions.resourceFilter(data)) {
                    continue;
                }
                this.checkDuplicateAndPush(data.prefix, data);
            }
        }
    }
    /**
     * dynamically add a route to root prefix
     * @param routerFunction
     * @param routerInfoOption
     */
    addRouter(routerFunction, routerInfoOption) {
        const prefix = routerInfoOption.prefix || '';
        routerInfoOption.requestMethod = (routerInfoOption.requestMethod || 'GET').toUpperCase();
        if (!this.routes.has(prefix)) {
            this.routes.set(prefix, []);
            this.routesPriority.push({
                prefix,
                priority: 0,
                middleware: [],
                routerOptions: {},
                controllerId: undefined,
                routerModule: undefined,
            });
        }
        this.checkDuplicateAndPush(prefix, Object.assign(routerInfoOption, {
            method: routerFunction,
        }));
        // sort again
        this.sortPrefixAndRouter();
    }
    sortRouter(urlMatchList) {
        // 1. 绝对路径规则优先级最高如 /ab/cb/e
        // 2. 星号只能出现最后且必须在/后面，如 /ab/cb/**
        // 3. 如果绝对路径和通配都能匹配一个路径时，绝对规则优先级高
        // 4. 有多个通配能匹配一个路径时，最长的规则匹配，如 /ab/** 和 /ab/cd/** 在匹配 /ab/cd/f 时命中 /ab/cd/**
        // 5. 如果 / 与 /* 都能匹配 / ,但 / 的优先级高于 /*
        return urlMatchList
            .map(item => {
            const urlString = item.url.toString();
            const weightArr = types_1.Types.isRegExp(item.url)
                ? urlString.split('\\/')
                : urlString.split('/');
            let weight = 0;
            // 权重，比如通配的不加权，非通配加权，防止通配出现在最前面
            for (const fragment of weightArr) {
                if (fragment === '' ||
                    fragment.includes(':') ||
                    fragment.includes('*')) {
                    weight += 0;
                }
                else {
                    weight += 1;
                }
            }
            let category = 2;
            const paramString = urlString.includes(':')
                ? urlString.replace(/:.+$/, '')
                : '';
            if (paramString) {
                category = 1;
            }
            if (urlString.includes('*')) {
                category = 0;
            }
            return {
                ...item,
                _pureRouter: urlString.replace(/\**$/, '').replace(/:\w+/, '123'),
                _level: urlString.split('/').length - 1,
                _paramString: paramString,
                _category: category,
                _weight: weight,
            };
        })
            .sort((handlerA, handlerB) => {
            // 不同一层级的对比
            if (handlerA._category !== handlerB._category) {
                return handlerB._category - handlerA._category;
            }
            // 不同权重
            if (handlerA._weight !== handlerB._weight) {
                return handlerB._weight - handlerA._weight;
            }
            // 不同长度
            if (handlerA._level === handlerB._level) {
                if (handlerB._pureRouter === handlerA._pureRouter) {
                    return (handlerA.url.toString().length - handlerB.url.toString().length);
                }
                return handlerB._pureRouter.length - handlerA._pureRouter.length;
            }
            return handlerB._level - handlerA._level;
        });
    }
    async getRoutePriorityList() {
        if (!this.isReady) {
            await this.analyze();
            this.isReady = true;
        }
        return this.routesPriority;
    }
    async getRouterTable() {
        if (!this.isReady) {
            await this.analyze();
            this.isReady = true;
        }
        return this.routes;
    }
    async getFlattenRouterTable(options = {}) {
        if (!this.isReady) {
            await this.analyze();
            this.isReady = true;
        }
        let routeArr = [];
        for (const routerPriority of this.routesPriority) {
            routeArr = routeArr.concat(this.routes.get(routerPriority.prefix));
        }
        if (options.compileUrlPattern) {
            // attach match pattern function
            for (const item of routeArr) {
                if (item.fullUrlFlattenString) {
                    item.fullUrlCompiledRegexp = pathToRegexp_1.PathToRegexpUtil.toRegexp(item.fullUrlFlattenString);
                }
            }
        }
        return routeArr;
    }
    async getMatchedRouterInfo(routerUrl, method) {
        const routes = await this.getFlattenRouterTable({
            compileUrlPattern: true,
        });
        let matchedRouterInfo;
        for (const item of routes) {
            if (item.fullUrlCompiledRegexp) {
                const itemRequestMethod = item['requestMethod'].toUpperCase();
                if (('ALL' === itemRequestMethod ||
                    method.toUpperCase() === itemRequestMethod) &&
                    item.fullUrlCompiledRegexp.test(routerUrl)) {
                    matchedRouterInfo = item;
                    break;
                }
            }
        }
        return matchedRouterInfo;
    }
    checkDuplicateAndPush(prefix, routerInfo) {
        const prefixList = this.routes.get(prefix);
        const matched = prefixList.filter(item => {
            return (routerInfo.url &&
                routerInfo.requestMethod &&
                item.url === routerInfo.url &&
                item.requestMethod === routerInfo.requestMethod);
        });
        if (matched && matched.length) {
            throw new error_1.MidwayDuplicateRouteError(`${routerInfo.requestMethod} ${routerInfo.url}`, `${matched[0].handlerName}`, `${routerInfo.handlerName}`);
        }
        // format url
        if (!routerInfo.fullUrlFlattenString &&
            routerInfo.url &&
            typeof routerInfo.url === 'string') {
            routerInfo.fullUrl = (0, util_1.joinURLPath)(prefix, routerInfo.url);
            if (/\*$/.test(routerInfo.fullUrl)) {
                routerInfo.fullUrlFlattenString = routerInfo.fullUrl.replace('*', '(.*)');
            }
            else {
                routerInfo.fullUrlFlattenString = routerInfo.fullUrl;
            }
        }
        prefixList.push(routerInfo);
    }
};
MidwayWebRouterService = __decorate([
    (0, decorator_1.Provide)(),
    (0, decorator_1.Scope)(interface_1.ScopeEnum.Singleton),
    __metadata("design:paramtypes", [Object])
], MidwayWebRouterService);
exports.MidwayWebRouterService = MidwayWebRouterService;
//# sourceMappingURL=webRouterService.js.map

/***/ }),

/***/ 3216:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.prepareGlobalApplicationContext = exports.prepareGlobalApplicationContextAsync = exports.destroyGlobalApplicationContext = exports.initializeGlobalApplicationContext = void 0;
const _1 = __nccwpck_require__(5573);
const config_default_1 = __nccwpck_require__(9211);
const decorator_1 = __nccwpck_require__(8351);
const util = __nccwpck_require__(9023);
const slsFunctionService_1 = __nccwpck_require__(2986);
const path_1 = __nccwpck_require__(6928);
const healthService_1 = __nccwpck_require__(4292);
const performanceManager_1 = __nccwpck_require__(4334);
const debug = util.debuglog('midway:debug');
let stepIdx = 1;
function printStepDebugInfo(stepInfo) {
    debug(`\n\nStep ${stepIdx++}: ${stepInfo}\n`);
}
/**
 * midway framework main entry, this method bootstrap all service and framework.
 * @param globalOptions
 */
async function initializeGlobalApplicationContext(globalOptions) {
    performanceManager_1.MidwayInitializerPerformanceManager.markStart(performanceManager_1.MidwayInitializerPerformanceManager.MEASURE_KEYS.INITIALIZE);
    const applicationContext = await prepareGlobalApplicationContextAsync(globalOptions);
    printStepDebugInfo('Init logger');
    performanceManager_1.MidwayInitializerPerformanceManager.markStart(performanceManager_1.MidwayInitializerPerformanceManager.MEASURE_KEYS.LOGGER_PREPARE);
    // init logger
    const loggerService = await applicationContext.getAsync(_1.MidwayLoggerService, [
        applicationContext,
        globalOptions,
    ]);
    if (loggerService.getLogger('appLogger')) {
        // register global logger
        applicationContext.registerObject('logger', loggerService.getLogger('appLogger'));
    }
    performanceManager_1.MidwayInitializerPerformanceManager.markEnd(performanceManager_1.MidwayInitializerPerformanceManager.MEASURE_KEYS.LOGGER_PREPARE);
    printStepDebugInfo('Init MidwayMockService');
    // mock support
    await applicationContext.getAsync(_1.MidwayMockService, [applicationContext]);
    printStepDebugInfo('Init framework');
    performanceManager_1.MidwayInitializerPerformanceManager.markStart(performanceManager_1.MidwayInitializerPerformanceManager.MEASURE_KEYS.FRAMEWORK_PREPARE);
    // framework/config/plugin/logger/app decorator support
    await applicationContext.getAsync(_1.MidwayFrameworkService, [
        applicationContext,
        globalOptions,
    ]);
    performanceManager_1.MidwayInitializerPerformanceManager.markEnd(performanceManager_1.MidwayInitializerPerformanceManager.MEASURE_KEYS.FRAMEWORK_PREPARE);
    printStepDebugInfo('Init lifecycle');
    performanceManager_1.MidwayInitializerPerformanceManager.markStart(performanceManager_1.MidwayInitializerPerformanceManager.MEASURE_KEYS.LIFECYCLE_PREPARE);
    // lifecycle support
    await applicationContext.getAsync(_1.MidwayLifeCycleService, [
        applicationContext,
    ]);
    performanceManager_1.MidwayInitializerPerformanceManager.markEnd(performanceManager_1.MidwayInitializerPerformanceManager.MEASURE_KEYS.LIFECYCLE_PREPARE);
    printStepDebugInfo('Init preload modules');
    performanceManager_1.MidwayInitializerPerformanceManager.markStart(performanceManager_1.MidwayInitializerPerformanceManager.MEASURE_KEYS.PRELOAD_MODULE_PREPARE);
    // some preload module init
    const modules = (0, decorator_1.listPreloadModule)();
    for (const module of modules) {
        // preload init context
        await applicationContext.getAsync(module);
    }
    performanceManager_1.MidwayInitializerPerformanceManager.markEnd(performanceManager_1.MidwayInitializerPerformanceManager.MEASURE_KEYS.PRELOAD_MODULE_PREPARE);
    printStepDebugInfo('End of initialize and start');
    performanceManager_1.MidwayInitializerPerformanceManager.markEnd(performanceManager_1.MidwayInitializerPerformanceManager.MEASURE_KEYS.INITIALIZE);
    return applicationContext;
}
exports.initializeGlobalApplicationContext = initializeGlobalApplicationContext;
async function destroyGlobalApplicationContext(applicationContext) {
    const loggerService = await applicationContext.getAsync(_1.MidwayLoggerService);
    const loggerFactory = loggerService.getCurrentLoggerFactory();
    // stop lifecycle
    const lifecycleService = await applicationContext.getAsync(_1.MidwayLifeCycleService);
    await lifecycleService.stop();
    // stop container
    await applicationContext.stop();
    (0, decorator_1.clearBindContainer)();
    loggerFactory.close();
    performanceManager_1.MidwayPerformanceManager.cleanAll();
    global['MIDWAY_APPLICATION_CONTEXT'] = undefined;
    global['MIDWAY_MAIN_FRAMEWORK'] = undefined;
}
exports.destroyGlobalApplicationContext = destroyGlobalApplicationContext;
/**
 * prepare applicationContext
 * @param globalOptions
 */
async function prepareGlobalApplicationContextAsync(globalOptions) {
    var _a, _b, _c, _d, _e;
    printStepDebugInfo('Ready to create applicationContext');
    debug('[core]: start "initializeGlobalApplicationContext"');
    debug(`[core]: bootstrap options = ${util.inspect(globalOptions)}`);
    const appDir = (_a = globalOptions.appDir) !== null && _a !== void 0 ? _a : '';
    const baseDir = (_b = globalOptions.baseDir) !== null && _b !== void 0 ? _b : '';
    performanceManager_1.MidwayInitializerPerformanceManager.markStart(performanceManager_1.MidwayInitializerPerformanceManager.MEASURE_KEYS.METADATA_PREPARE);
    // new container
    const applicationContext = (_c = globalOptions.applicationContext) !== null && _c !== void 0 ? _c : new _1.MidwayContainer();
    // bind container to decoratorManager
    debug('[core]: delegate module map from decoratorManager');
    (0, decorator_1.bindContainer)(applicationContext);
    global['MIDWAY_APPLICATION_CONTEXT'] = applicationContext;
    // register baseDir and appDir
    applicationContext.registerObject('baseDir', baseDir);
    applicationContext.registerObject('appDir', appDir);
    performanceManager_1.MidwayInitializerPerformanceManager.markEnd(performanceManager_1.MidwayInitializerPerformanceManager.MEASURE_KEYS.METADATA_PREPARE);
    debug('[core]: set default file detector');
    performanceManager_1.MidwayInitializerPerformanceManager.markStart(performanceManager_1.MidwayInitializerPerformanceManager.MEASURE_KEYS.DETECTOR_PREPARE);
    printStepDebugInfo('Ready module detector');
    if (!globalOptions.moduleLoadType) {
        globalOptions.moduleLoadType = 'commonjs';
    }
    // set module detector
    if (globalOptions.moduleDetector !== false) {
        debug('[core]: set module load type = %s', globalOptions.moduleLoadType);
        // set default entry file
        if (!globalOptions.imports) {
            globalOptions.imports = [
                await (0, _1.loadModule)((0, path_1.join)(baseDir, `configuration${(0, _1.isTypeScriptEnvironment)() ? '.ts' : '.js'}`), {
                    loadMode: globalOptions.moduleLoadType,
                    safeLoad: true,
                }),
            ];
        }
        if (globalOptions.moduleDetector === undefined) {
            if (globalOptions.moduleLoadType === 'esm') {
                applicationContext.setFileDetector(new _1.ESModuleFileDetector({
                    loadDir: baseDir,
                    ignore: (_d = globalOptions.ignore) !== null && _d !== void 0 ? _d : [],
                }));
                globalOptions.moduleLoadType = 'esm';
            }
            else {
                applicationContext.setFileDetector(new _1.CommonJSFileDetector({
                    loadDir: baseDir,
                    ignore: (_e = globalOptions.ignore) !== null && _e !== void 0 ? _e : [],
                }));
            }
        }
    }
    performanceManager_1.MidwayInitializerPerformanceManager.markEnd(performanceManager_1.MidwayInitializerPerformanceManager.MEASURE_KEYS.DETECTOR_PREPARE);
    printStepDebugInfo('Binding inner service');
    // bind inner service
    applicationContext.bindClass(_1.MidwayEnvironmentService);
    applicationContext.bindClass(_1.MidwayInformationService);
    applicationContext.bindClass(_1.MidwayAspectService);
    applicationContext.bindClass(_1.MidwayDecoratorService);
    applicationContext.bindClass(_1.MidwayConfigService);
    applicationContext.bindClass(_1.MidwayLoggerService);
    applicationContext.bindClass(_1.MidwayApplicationManager);
    applicationContext.bindClass(_1.MidwayFrameworkService);
    applicationContext.bindClass(_1.MidwayMiddlewareService);
    applicationContext.bindClass(_1.MidwayLifeCycleService);
    applicationContext.bindClass(_1.MidwayMockService);
    applicationContext.bindClass(_1.MidwayWebRouterService);
    applicationContext.bindClass(slsFunctionService_1.MidwayServerlessFunctionService);
    applicationContext.bindClass(healthService_1.MidwayHealthService);
    applicationContext.bindClass(_1.MidwayPriorityManager);
    printStepDebugInfo('Binding preload module');
    // bind preload module
    if (globalOptions.preloadModules && globalOptions.preloadModules.length) {
        for (const preloadModule of globalOptions.preloadModules) {
            applicationContext.bindClass(preloadModule);
        }
    }
    printStepDebugInfo('Init MidwayConfigService, MidwayAspectService and MidwayDecoratorService');
    // init default environment
    const environmentService = applicationContext.get(_1.MidwayEnvironmentService);
    environmentService.setModuleLoadType(globalOptions.moduleLoadType);
    // init default config
    const configService = applicationContext.get(_1.MidwayConfigService);
    configService.add([
        {
            default: config_default_1.default,
        },
    ]);
    // init aop support
    applicationContext.get(_1.MidwayAspectService, [applicationContext]);
    // init decorator service
    applicationContext.get(_1.MidwayDecoratorService, [applicationContext]);
    printStepDebugInfo('Load imports(component) and user code configuration module');
    applicationContext.load([].concat(globalOptions.imports).concat(globalOptions.configurationModule));
    printStepDebugInfo('Run applicationContext ready method');
    performanceManager_1.MidwayInitializerPerformanceManager.markStart(performanceManager_1.MidwayInitializerPerformanceManager.MEASURE_KEYS.DEFINITION_PREPARE);
    // bind user code module
    await applicationContext.ready();
    performanceManager_1.MidwayInitializerPerformanceManager.markEnd(performanceManager_1.MidwayInitializerPerformanceManager.MEASURE_KEYS.DEFINITION_PREPARE);
    performanceManager_1.MidwayInitializerPerformanceManager.markStart(performanceManager_1.MidwayInitializerPerformanceManager.MEASURE_KEYS.CONFIG_LOAD);
    if (globalOptions.globalConfig) {
        if (Array.isArray(globalOptions.globalConfig)) {
            configService.add(globalOptions.globalConfig);
        }
        else {
            configService.addObject(globalOptions.globalConfig);
        }
    }
    printStepDebugInfo('Load config file');
    // merge config
    configService.load();
    debug('[core]: Current config = %j', configService.getConfiguration());
    performanceManager_1.MidwayInitializerPerformanceManager.markEnd(performanceManager_1.MidwayInitializerPerformanceManager.MEASURE_KEYS.CONFIG_LOAD);
    // middleware support
    applicationContext.get(_1.MidwayMiddlewareService, [applicationContext]);
    return applicationContext;
}
exports.prepareGlobalApplicationContextAsync = prepareGlobalApplicationContextAsync;
/**
 * prepare applicationContext, it use in egg framework, hooks and serverless function generator
 * @param globalOptions
 */
function prepareGlobalApplicationContext(globalOptions) {
    var _a, _b, _c, _d;
    printStepDebugInfo('Ready to create applicationContext');
    debug('[core]: start "initializeGlobalApplicationContext"');
    debug(`[core]: bootstrap options = ${util.inspect(globalOptions)}`);
    const appDir = (_a = globalOptions.appDir) !== null && _a !== void 0 ? _a : '';
    const baseDir = (_b = globalOptions.baseDir) !== null && _b !== void 0 ? _b : '';
    performanceManager_1.MidwayInitializerPerformanceManager.markStart(performanceManager_1.MidwayInitializerPerformanceManager.MEASURE_KEYS.METADATA_PREPARE);
    // new container
    const applicationContext = (_c = globalOptions.applicationContext) !== null && _c !== void 0 ? _c : new _1.MidwayContainer();
    // bind container to decoratorManager
    debug('[core]: delegate module map from decoratorManager');
    (0, decorator_1.bindContainer)(applicationContext);
    global['MIDWAY_APPLICATION_CONTEXT'] = applicationContext;
    // register baseDir and appDir
    applicationContext.registerObject('baseDir', baseDir);
    applicationContext.registerObject('appDir', appDir);
    performanceManager_1.MidwayInitializerPerformanceManager.markEnd(performanceManager_1.MidwayInitializerPerformanceManager.MEASURE_KEYS.METADATA_PREPARE);
    printStepDebugInfo('Ready module detector');
    performanceManager_1.MidwayInitializerPerformanceManager.markStart(performanceManager_1.MidwayInitializerPerformanceManager.MEASURE_KEYS.DETECTOR_PREPARE);
    if (!globalOptions.moduleLoadType) {
        globalOptions.moduleLoadType = 'commonjs';
    }
    if (globalOptions.moduleDetector !== false) {
        if (globalOptions.moduleDetector === undefined) {
            applicationContext.setFileDetector(new _1.CommonJSFileDetector({
                ignore: (_d = globalOptions.ignore) !== null && _d !== void 0 ? _d : [],
            }));
        }
        else if (globalOptions.moduleDetector) {
            applicationContext.setFileDetector(globalOptions.moduleDetector);
        }
    }
    performanceManager_1.MidwayInitializerPerformanceManager.markEnd(performanceManager_1.MidwayInitializerPerformanceManager.MEASURE_KEYS.DETECTOR_PREPARE);
    printStepDebugInfo('Binding inner service');
    // bind inner service
    applicationContext.bindClass(_1.MidwayEnvironmentService);
    applicationContext.bindClass(_1.MidwayInformationService);
    applicationContext.bindClass(_1.MidwayAspectService);
    applicationContext.bindClass(_1.MidwayDecoratorService);
    applicationContext.bindClass(_1.MidwayConfigService);
    applicationContext.bindClass(_1.MidwayLoggerService);
    applicationContext.bindClass(_1.MidwayApplicationManager);
    applicationContext.bindClass(_1.MidwayFrameworkService);
    applicationContext.bindClass(_1.MidwayMiddlewareService);
    applicationContext.bindClass(_1.MidwayLifeCycleService);
    applicationContext.bindClass(_1.MidwayMockService);
    applicationContext.bindClass(_1.MidwayWebRouterService);
    applicationContext.bindClass(slsFunctionService_1.MidwayServerlessFunctionService);
    applicationContext.bindClass(healthService_1.MidwayHealthService);
    applicationContext.bindClass(_1.MidwayPriorityManager);
    printStepDebugInfo('Binding preload module');
    // bind preload module
    if (globalOptions.preloadModules && globalOptions.preloadModules.length) {
        for (const preloadModule of globalOptions.preloadModules) {
            applicationContext.bindClass(preloadModule);
        }
    }
    printStepDebugInfo('Init MidwayConfigService, MidwayAspectService and MidwayDecoratorService');
    // init default environment
    const environmentService = applicationContext.get(_1.MidwayEnvironmentService);
    environmentService.setModuleLoadType(globalOptions.moduleLoadType);
    // init default config
    const configService = applicationContext.get(_1.MidwayConfigService);
    configService.add([
        {
            default: config_default_1.default,
        },
    ]);
    // init aop support
    applicationContext.get(_1.MidwayAspectService, [applicationContext]);
    // init decorator service
    applicationContext.get(_1.MidwayDecoratorService, [applicationContext]);
    printStepDebugInfo('Load imports(component) and user code configuration module');
    if (!globalOptions.imports) {
        globalOptions.imports = [
            (0, _1.safeRequire)((0, path_1.join)(globalOptions.baseDir, 'configuration')),
        ];
    }
    applicationContext.load([].concat(globalOptions.imports).concat(globalOptions.configurationModule));
    printStepDebugInfo('Run applicationContext ready method');
    performanceManager_1.MidwayInitializerPerformanceManager.markStart(performanceManager_1.MidwayInitializerPerformanceManager.MEASURE_KEYS.DEFINITION_PREPARE);
    // bind user code module
    applicationContext.ready();
    performanceManager_1.MidwayInitializerPerformanceManager.markEnd(performanceManager_1.MidwayInitializerPerformanceManager.MEASURE_KEYS.DEFINITION_PREPARE);
    performanceManager_1.MidwayInitializerPerformanceManager.markStart(performanceManager_1.MidwayInitializerPerformanceManager.MEASURE_KEYS.CONFIG_LOAD);
    if (globalOptions.globalConfig) {
        if (Array.isArray(globalOptions.globalConfig)) {
            configService.add(globalOptions.globalConfig);
        }
        else {
            configService.addObject(globalOptions.globalConfig);
        }
    }
    printStepDebugInfo('Load config file');
    // merge config
    configService.load();
    debug('[core]: Current config = %j', configService.getConfiguration());
    performanceManager_1.MidwayInitializerPerformanceManager.markEnd(performanceManager_1.MidwayInitializerPerformanceManager.MEASURE_KEYS.CONFIG_LOAD);
    // middleware support
    applicationContext.get(_1.MidwayMiddlewareService, [applicationContext]);
    return applicationContext;
}
exports.prepareGlobalApplicationContext = prepareGlobalApplicationContext;
//# sourceMappingURL=setup.js.map

/***/ }),

/***/ 8504:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.pascalCase = exports.camelCase = void 0;
const UPPERCASE = /[\p{Lu}]/u;
const LOWERCASE = /[\p{Ll}]/u;
const IDENTIFIER = /([\p{Alpha}\p{N}_]|$)/u;
const SEPARATORS = /[_.\- ]+/;
const LEADING_SEPARATORS = new RegExp('^' + SEPARATORS.source);
const SEPARATORS_AND_IDENTIFIER = new RegExp(SEPARATORS.source + IDENTIFIER.source, 'gu');
const NUMBERS_AND_IDENTIFIER = new RegExp('\\d+' + IDENTIFIER.source, 'gu');
const preserveCamelCase = (string, toLowerCase, toUpperCase) => {
    let isLastCharLower = false;
    let isLastCharUpper = false;
    let isLastLastCharUpper = false;
    for (let index = 0; index < string.length; index++) {
        const character = string[index];
        if (isLastCharLower && UPPERCASE.test(character)) {
            string = string.slice(0, index) + '-' + string.slice(index);
            isLastCharLower = false;
            isLastLastCharUpper = isLastCharUpper;
            isLastCharUpper = true;
            index++;
        }
        else if (isLastCharUpper &&
            isLastLastCharUpper &&
            LOWERCASE.test(character)) {
            string = string.slice(0, index - 1) + '-' + string.slice(index - 1);
            isLastLastCharUpper = isLastCharUpper;
            isLastCharUpper = false;
            isLastCharLower = true;
        }
        else {
            isLastCharLower =
                toLowerCase(character) === character &&
                    toUpperCase(character) !== character;
            isLastLastCharUpper = isLastCharUpper;
            isLastCharUpper =
                toUpperCase(character) === character &&
                    toLowerCase(character) !== character;
        }
    }
    return string;
};
const postProcess = (input, toUpperCase) => {
    SEPARATORS_AND_IDENTIFIER.lastIndex = 0;
    NUMBERS_AND_IDENTIFIER.lastIndex = 0;
    return input
        .replace(SEPARATORS_AND_IDENTIFIER, (_, identifier) => toUpperCase(identifier))
        .replace(NUMBERS_AND_IDENTIFIER, m => toUpperCase(m));
};
function camelCaseOrigin(input, options) {
    options = {
        pascalCase: false,
        ...options,
    };
    input = input.trim();
    if (input.length === 0) {
        return '';
    }
    const toLowerCase = string => string.toLowerCase();
    const toUpperCase = string => string.toUpperCase();
    if (input.length === 1) {
        if (SEPARATORS.test(input)) {
            return '';
        }
        return options.pascalCase ? toUpperCase(input) : toLowerCase(input);
    }
    const hasUpperCase = input !== toLowerCase(input);
    if (hasUpperCase) {
        input = preserveCamelCase(input, toLowerCase, toUpperCase);
    }
    input = input.replace(LEADING_SEPARATORS, '');
    input = toLowerCase(input);
    if (options.pascalCase) {
        input = toUpperCase(input.charAt(0)) + input.slice(1);
    }
    return postProcess(input, toUpperCase);
}
function camelCase(input) {
    return camelCaseOrigin(input, {
        pascalCase: false,
    });
}
exports.camelCase = camelCase;
function pascalCase(input) {
    return camelCaseOrigin(input, {
        pascalCase: true,
    });
}
exports.pascalCase = pascalCase;
//# sourceMappingURL=camelCase.js.map

/***/ }),

/***/ 7269:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getCurrentAsyncContextManager = exports.getCurrentMainApp = exports.getCurrentMainFramework = exports.getCurrentApplicationContext = void 0;
const constants_1 = __nccwpck_require__(7404);
const getCurrentApplicationContext = () => {
    return global['MIDWAY_APPLICATION_CONTEXT'];
};
exports.getCurrentApplicationContext = getCurrentApplicationContext;
const getCurrentMainFramework = () => {
    return global['MIDWAY_MAIN_FRAMEWORK'];
};
exports.getCurrentMainFramework = getCurrentMainFramework;
const getCurrentMainApp = () => {
    const framework = (0, exports.getCurrentMainFramework)();
    if (framework) {
        return framework.getApplication();
    }
    return undefined;
};
exports.getCurrentMainApp = getCurrentMainApp;
const getCurrentAsyncContextManager = () => {
    return (0, exports.getCurrentApplicationContext)().get(constants_1.ASYNC_CONTEXT_MANAGER_KEY);
};
exports.getCurrentAsyncContextManager = getCurrentAsyncContextManager;
//# sourceMappingURL=contextUtil.js.map

/***/ }),

/***/ 428:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.extend = void 0;
/**
 * fork from https://github.com/eggjs/extend2
 */
const types_1 = __nccwpck_require__(3171);
function extend(...args) {
    let options, name, src, copy, clone;
    let target = args[0];
    let i = 1;
    const length = args.length;
    let deep = false;
    // Handle a deep copy situation
    if (typeof target === 'boolean') {
        deep = target;
        target = args[1] || {};
        // skip the boolean and the target
        i = 2;
    }
    else if ((typeof target !== 'object' && typeof target !== 'function') ||
        target == null) {
        target = {};
    }
    for (; i < length; ++i) {
        options = args[i];
        // Only deal with non-null/undefined values
        if (options == null)
            continue;
        // Extend the base object
        for (name in options) {
            if (name === '__proto__')
                continue;
            src = target[name];
            copy = options[name];
            // Prevent never-ending loop
            if (target === copy)
                continue;
            // Recurse if we're merging plain objects
            if (deep && copy && types_1.Types.isPlainObject(copy)) {
                clone = src && types_1.Types.isPlainObject(src) ? src : {};
                // Never move original objects, clone them
                target[name] = extend(deep, clone, copy);
                // Don't bring in undefined values
            }
            else if (typeof copy !== 'undefined') {
                target[name] = copy;
            }
        }
    }
    // Return the modified object
    return target;
}
exports.extend = extend;
//# sourceMappingURL=extend.js.map

/***/ }),

/***/ 1206:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * code fork from https://github.com/WebReflection/flatted/blob/main/cjs/index.js
 */
/*! (c) 2020 Andrea Giammarchi */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.safeStringify = exports.safeParse = void 0;
const { parse: $parse, stringify: $stringify } = JSON;
const { keys } = Object;
const Primitive = String; // it could be Number
const primitive = 'string'; // it could be 'number'
const ignore = {};
const object = 'object';
const noop = (_, value) => value;
const primitives = value => value instanceof Primitive ? Primitive(value) : value;
const Primitives = (_, value) => typeof value === primitive ? new Primitive(value) : value;
const revive = (input, parsed, output, $) => {
    const lazy = [];
    for (let ke = keys(output), { length } = ke, y = 0; y < length; y++) {
        const k = ke[y];
        const value = output[k];
        if (value instanceof Primitive) {
            const tmp = input[value];
            if (typeof tmp === object && !parsed.has(tmp)) {
                parsed.add(tmp);
                output[k] = ignore;
                lazy.push({ k, a: [input, parsed, tmp, $] });
            }
            else
                output[k] = $.call(output, k, tmp);
        }
        else if (output[k] !== ignore)
            output[k] = $.call(output, k, value);
    }
    for (let { length } = lazy, i = 0; i < length; i++) {
        const { k, a } = lazy[i];
        // eslint-disable-next-line prefer-spread
        output[k] = $.call(output, k, revive.apply(null, a));
    }
    return output;
};
const set = (known, input, value) => {
    const index = Primitive(input.push(value) - 1);
    known.set(value, index);
    return index;
};
function safeParse(text, reviver) {
    const input = $parse(text, Primitives).map(primitives);
    const value = input[0];
    const $ = reviver || noop;
    const tmp = typeof value === object && value
        ? revive(input, new Set(), value, $)
        : value;
    return $.call({ '': tmp }, '', tmp);
}
exports.safeParse = safeParse;
function safeStringify(value, replacer, space) {
    const $ = replacer && typeof replacer === object
        ? (k, v) => (k === '' || -1 < replacer.indexOf(k) ? v : void 0)
        : replacer || noop;
    const known = new Map();
    const input = [];
    const output = [];
    let i = +set(known, input, $.call({ '': value }, '', value));
    let firstRun = !i;
    while (i < input.length) {
        firstRun = true;
        output[i] = $stringify(input[i++], replace, space);
    }
    return '[' + output.join(',') + ']';
    function replace(key, value) {
        if (firstRun) {
            firstRun = !firstRun;
            return value;
        }
        const after = $.call(this, key, value);
        switch (typeof after) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            case object:
                if (after === null)
                    return after;
            // eslint-disable-next-line no-fallthrough
            case primitive:
                return known.get(after) || set(known, input, after);
        }
        return after;
    }
}
exports.safeStringify = safeStringify;
//# sourceMappingURL=flatted.js.map

/***/ }),

/***/ 5439:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FORMAT = void 0;
// value from ms package
const s = 1000;
const m = s * 60;
const h = m * 60;
const d = h * 24;
const w = d * 7;
const y = d * 365.25;
const MS = {
    ONE_SECOND: s,
    ONE_MINUTE: m,
    ONE_HOUR: h,
    ONE_DAY: d,
    ONE_WEEK: w,
    ONE_YEAR: y,
};
// crontab pre format
const CRONTAB = {
    EVERY_SECOND: '* * * * * *',
    EVERY_MINUTE: '0 * * * * *',
    EVERY_HOUR: '0 0 * * * *',
    EVERY_DAY: '0 0 0 * * *',
    EVERY_DAY_ZERO_FIFTEEN: '0 15 0 * * *',
    EVERY_DAY_ONE_FIFTEEN: '0 15 1 * * *',
    EVERY_PER_5_SECOND: '*/5 * * * * *',
    EVERY_PER_10_SECOND: '*/10 * * * * *',
    EVERY_PER_30_SECOND: '*/30 * * * * *',
    EVERY_PER_5_MINUTE: '0 */5 * * * *',
    EVERY_PER_10_MINUTE: '0 */10 * * * *',
    EVERY_PER_30_MINUTE: '0 */30 * * * *',
};
exports.FORMAT = {
    MS,
    CRONTAB,
};
//# sourceMappingURL=format.js.map

/***/ }),

/***/ 3879:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FileUtils = exports.exists = void 0;
const fs_1 = __nccwpck_require__(9896);
async function exists(p) {
    return fs_1.promises
        .access(p, fs_1.constants.F_OK)
        .then(() => true)
        .catch(() => false);
}
exports.exists = exists;
exports.FileUtils = {
    exists,
};
//# sourceMappingURL=fs.js.map

/***/ }),

/***/ 9527:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HttpClient = exports.makeHttpRequest = void 0;
const http = __nccwpck_require__(8611);
const https = __nccwpck_require__(5692);
const url = __nccwpck_require__(7016);
const util_1 = __nccwpck_require__(9023);
const error_1 = __nccwpck_require__(6248);
const debug = (0, util_1.debuglog)('request-client');
const URL = url.URL;
const mimeMap = {
    text: 'application/text',
    json: 'application/json',
    octet: 'application/octet-stream',
};
function isHeaderExists(headers, headerKey) {
    return (headers[headerKey] ||
        headers[headerKey.toLowerCase()] ||
        headers[headerKey.toUpperCase()]);
}
async function makeHttpRequest(url, options = {}) {
    debug(`request '${url}'`);
    const whatwgUrl = new URL(url);
    const client = whatwgUrl.protocol === 'https:' ? https : http;
    options.method = (options.method || 'GET').toUpperCase();
    const { contentType, dataType, method, timeout = 5000, headers: customHeaders, ...otherOptions } = options;
    const headers = {
        Accept: mimeMap[dataType] || mimeMap.octet,
        ...customHeaders,
    };
    let data;
    if (method === 'GET' && options.data) {
        for (const key of Object.keys(options.data)) {
            whatwgUrl.searchParams.set(key, options.data[key]);
        }
        headers['Content-Length'] = 0;
    }
    else if (options.data) {
        data = Buffer.from(JSON.stringify(options.data));
        if (!isHeaderExists(headers, 'Content-Type')) {
            headers['Content-Type'] = mimeMap[contentType] || mimeMap.octet;
        }
        if (!isHeaderExists(headers, 'Content-Length')) {
            headers['Content-Length'] = data.byteLength;
        }
    }
    return new Promise((resolve, reject) => {
        const req = client.request(whatwgUrl.toString(), {
            method,
            headers,
            ...otherOptions,
        }, res => {
            res.setTimeout(timeout, () => {
                res.destroy(new Error('Response Timeout'));
            });
            res.on('error', error => {
                reject(error);
            });
            const chunks = [];
            res.on('data', chunk => {
                chunks.push(chunk);
            });
            res.on('end', () => {
                let data = Buffer.concat(chunks);
                if (dataType === 'text' || dataType === 'json') {
                    data = data.toString('utf8');
                }
                if (dataType === 'json') {
                    try {
                        data = JSON.parse(data);
                    }
                    catch (e) {
                        return reject(new Error('[httpclient] Unable to parse response data'));
                    }
                }
                Object.assign(res, {
                    status: res.statusCode,
                    data,
                });
                debug(`request '${url}' resolved with status ${res.statusCode}`);
                resolve(res);
            });
        });
        req.setTimeout(timeout, () => {
            req.destroy(new error_1.MidwayUtilHttpClientTimeoutError('Request Timeout'));
        });
        req.on('error', error => {
            reject(error);
        });
        if (method !== 'GET') {
            req.end(data);
        }
        else {
            req.end();
        }
    });
}
exports.makeHttpRequest = makeHttpRequest;
/**
 * A simple http client
 */
class HttpClient {
    constructor(defaultOptions = {}) {
        this.defaultOptions = defaultOptions;
    }
    async request(url, options) {
        return makeHttpRequest(url, Object.assign({}, this.defaultOptions, options));
    }
}
exports.HttpClient = HttpClient;
//# sourceMappingURL=httpclient.js.map

/***/ }),

/***/ 6110:
/***/ ((module, exports, __nccwpck_require__) => {

"use strict";
/* module decorator */ module = __nccwpck_require__.nmd(module);

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Utils = exports.createPromiseTimeoutInvokeChain = exports.isTypeScriptEnvironment = exports.toAsyncFunction = exports.merge = exports.generateRandomId = exports.getParamNames = exports.sleep = exports.wrapAsync = exports.isIncludeProperty = exports.wrapMiddleware = exports.pathMatching = exports.toPathMatch = exports.transformRequestObjectByType = exports.deprecatedOutput = exports.getCurrentDateString = exports.delegateTargetProperties = exports.delegateTargetMethod = exports.delegateTargetAllPrototypeMethod = exports.delegateTargetPrototypeMethod = exports.joinURLPath = exports.getUserHome = exports.parsePrefix = exports.safelyGet = exports.loadModule = exports.safeRequire = exports.getCurrentEnvironment = exports.isDevelopmentEnvironment = void 0;
const path_1 = __nccwpck_require__(6928);
const fs_1 = __nccwpck_require__(9896);
const util_1 = __nccwpck_require__(9023);
const transformer = __nccwpck_require__(451);
const pathToRegexp_1 = __nccwpck_require__(6027);
const error_1 = __nccwpck_require__(6248);
const camelCase_1 = __nccwpck_require__(8504);
const uuid_1 = __nccwpck_require__(9003);
const flatted_1 = __nccwpck_require__(1206);
const crypto = __nccwpck_require__(6982);
const types_1 = __nccwpck_require__(3171);
const url_1 = __nccwpck_require__(7016);
const debug = (0, util_1.debuglog)('midway:debug');
/**
 * @since 2.0.0
 * @param env
 */
const isDevelopmentEnvironment = env => {
    return ['local', 'test', 'unittest'].includes(env);
};
exports.isDevelopmentEnvironment = isDevelopmentEnvironment;
/**
 * @since 2.0.0
 */
const getCurrentEnvironment = () => {
    return process.env['MIDWAY_SERVER_ENV'] || process.env['NODE_ENV'] || 'prod';
};
exports.getCurrentEnvironment = getCurrentEnvironment;
/**
 * @param p
 * @param enabledCache
 * @since 2.0.0
 */
const safeRequire = (p, enabledCache = true) => {
    if (p.startsWith(`.${path_1.sep}`) || p.startsWith(`..${path_1.sep}`)) {
        p = (0, path_1.resolve)((0, path_1.dirname)(module.parent.filename), p);
    }
    try {
        if (enabledCache) {
            return require(p);
        }
        else {
            const content = (0, fs_1.readFileSync)(p, {
                encoding: 'utf-8',
            });
            return JSON.parse(content);
        }
    }
    catch (err) {
        debug(`[core]: SafeRequire Warning\n\n${err.message}\n`);
        return undefined;
    }
};
exports.safeRequire = safeRequire;
const innerLoadModuleCache = {};
/**
 * load module, and it can be chosen commonjs or esm mode
 * @param p
 * @param options
 * @since 3.12.0
 */
const loadModule = async (p, options = {}) => {
    var _a, _b, _c;
    options.enableCache = (_a = options.enableCache) !== null && _a !== void 0 ? _a : true;
    options.safeLoad = (_b = options.safeLoad) !== null && _b !== void 0 ? _b : false;
    options.loadMode = (_c = options.loadMode) !== null && _c !== void 0 ? _c : 'commonjs';
    if (p.startsWith(`.${path_1.sep}`) || p.startsWith(`..${path_1.sep}`)) {
        p = (0, path_1.resolve)((0, path_1.dirname)(module.parent.filename), p);
    }
    debug(`[core]: load module ${p}, cache: ${options.enableCache}, mode: ${options.loadMode}, safeLoad: ${options.safeLoad}`);
    try {
        if (options.enableCache) {
            if (options.loadMode === 'commonjs') {
                return require(p);
            }
            else {
                // if json file, import need add options
                if (p.endsWith('.json')) {
                    /**
                     * attention: import json not support under nodejs 16
                     * use readFileSync instead
                     */
                    if (!innerLoadModuleCache[p]) {
                        // return (await import(p, { assert: { type: 'json' } })).default;
                        const content = (0, fs_1.readFileSync)(p, {
                            encoding: 'utf-8',
                        });
                        innerLoadModuleCache[p] = JSON.parse(content);
                    }
                    return innerLoadModuleCache[p];
                }
                else {
                    return await __nccwpck_require__(2542)((0, url_1.pathToFileURL)(p).href);
                }
            }
        }
        else {
            const content = (0, fs_1.readFileSync)(p, {
                encoding: 'utf-8',
            });
            return JSON.parse(content);
        }
    }
    catch (err) {
        if (!options.safeLoad) {
            throw err;
        }
        else {
            debug(`[core]: SafeLoadModule Warning\n\n${err.message}\n`);
            return undefined;
        }
    }
};
exports.loadModule = loadModule;
/**
 *  @example
 *  safelyGet(['a','b'],{a: {b: 2}})  // => 2
 *  safelyGet(['a','b'],{c: {b: 2}})  // => undefined
 *  safelyGet(['a','1'],{a: {"1": 2}})  // => 2
 *  safelyGet(['a','1'],{a: {b: 2}})  // => undefined
 *  safelyGet('a.b',{a: {b: 2}})  // => 2
 *  safelyGet('a.b',{c: {b: 2}})  // => undefined
 *  @since 2.0.0
 */
function safelyGet(list, obj) {
    if (arguments.length === 1) {
        return (_obj) => safelyGet(list, _obj);
    }
    if (typeof obj === 'undefined' || typeof obj !== 'object' || obj === null) {
        return void 0;
    }
    const pathArrValue = typeof list === 'string' ? list.split('.') : list;
    let willReturn = obj;
    for (const key of pathArrValue) {
        if (typeof willReturn === 'undefined' || willReturn === null) {
            return void 0;
        }
        else if (typeof willReturn !== 'object') {
            return void 0;
        }
        willReturn = willReturn[key];
    }
    return willReturn;
}
exports.safelyGet = safelyGet;
/**
 * 剔除 @ 符号
 * @param provideId provideId
 * @since 2.0.0
 */
function parsePrefix(provideId) {
    if (provideId.includes('@')) {
        return provideId.slice(1);
    }
    return provideId;
}
exports.parsePrefix = parsePrefix;
function getUserHome() {
    return process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];
}
exports.getUserHome = getUserHome;
function joinURLPath(...strArray) {
    strArray = strArray.filter(item => !!item);
    if (strArray.length === 0) {
        return '';
    }
    let p = path_1.posix.join(...strArray);
    p = p.replace(/\/+$/, '');
    if (!/^\//.test(p)) {
        p = '/' + p;
    }
    return p;
}
exports.joinURLPath = joinURLPath;
/**
 * 代理目标所有的原型方法，不包括构造器和内部隐藏方法
 * @param derivedCtor
 * @param constructors
 * @param otherMethods
 * @since 2.0.0
 */
function delegateTargetPrototypeMethod(derivedCtor, constructors, otherMethods) {
    constructors.forEach(baseCtor => {
        if (baseCtor.prototype) {
            Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
                if (name !== 'constructor' &&
                    !/^_/.test(name) &&
                    !derivedCtor.prototype[name]) {
                    derivedCtor.prototype[name] = function (...args) {
                        return this.instance[name](...args);
                    };
                }
            });
        }
    });
    if (otherMethods) {
        delegateTargetMethod(derivedCtor, otherMethods);
    }
}
exports.delegateTargetPrototypeMethod = delegateTargetPrototypeMethod;
/**
 * 代理目标所有的原型方法，包括原型链，不包括构造器和内部隐藏方法
 * @param derivedCtor
 * @param constructor
 * @since 3.0.0
 */
function delegateTargetAllPrototypeMethod(derivedCtor, constructor) {
    do {
        delegateTargetPrototypeMethod(derivedCtor, [constructor]);
        constructor = Object.getPrototypeOf(constructor);
    } while (constructor);
}
exports.delegateTargetAllPrototypeMethod = delegateTargetAllPrototypeMethod;
/**
 * 代理目标原型上的特定方法
 * @param derivedCtor
 * @param methods
 * @since 2.0.0
 */
function delegateTargetMethod(derivedCtor, methods) {
    methods.forEach(name => {
        derivedCtor.prototype[name] = function (...args) {
            return this.instance[name](...args);
        };
    });
}
exports.delegateTargetMethod = delegateTargetMethod;
/**
 * 代理目标原型属性
 * @param derivedCtor
 * @param properties
 * @since 2.0.0
 */
function delegateTargetProperties(derivedCtor, properties) {
    properties.forEach(name => {
        Object.defineProperty(derivedCtor.prototype, name, {
            get() {
                return this.instance[name];
            },
        });
    });
}
exports.delegateTargetProperties = delegateTargetProperties;
/**
 * 获取当前的时间戳
 * @since 2.0.0
 * @param timestamp
 */
const getCurrentDateString = (timestamp = Date.now()) => {
    const d = new Date(timestamp);
    return `${d.getFullYear()}-${(d.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
};
exports.getCurrentDateString = getCurrentDateString;
/**
 *
 * @param message
 * @since 3.0.0
 */
const deprecatedOutput = (message) => {
    console.warn('DeprecationWarning: ' + message);
};
exports.deprecatedOutput = deprecatedOutput;
/**
 * transform request object to definition type
 *
 * @param originValue
 * @param targetType
 * @since 3.0.0
 */
const transformRequestObjectByType = (originValue, targetType) => {
    if (targetType === undefined ||
        targetType === null ||
        targetType === Object ||
        typeof originValue === 'undefined') {
        return originValue;
    }
    switch (targetType) {
        case Number:
            return Number(originValue);
        case String:
            return String(originValue);
        case Boolean:
            if (originValue === '0' || originValue === 'false') {
                return false;
            }
            return Boolean(originValue);
        default:
            if (originValue instanceof targetType) {
                return originValue;
            }
            else {
                const transformToInstance = transformer['plainToClass'] || transformer['plainToInstance'];
                return transformToInstance(targetType, originValue);
            }
    }
};
exports.transformRequestObjectByType = transformRequestObjectByType;
function toPathMatch(pattern) {
    if (typeof pattern === 'boolean') {
        return ctx => pattern;
    }
    if (typeof pattern === 'string') {
        const reg = pathToRegexp_1.PathToRegexpUtil.toRegexp(pattern.replace('*', '(.*)'));
        if (reg.global)
            reg.lastIndex = 0;
        return ctx => reg.test(ctx.path);
    }
    if (pattern instanceof RegExp) {
        return ctx => {
            if (pattern.global)
                pattern.lastIndex = 0;
            return pattern.test(ctx.path);
        };
    }
    if (typeof pattern === 'function')
        return pattern;
    if (Array.isArray(pattern)) {
        const matchs = pattern.map(item => toPathMatch(item));
        return ctx => matchs.some(match => match(ctx));
    }
    throw new error_1.MidwayCommonError('match/ignore pattern must be RegExp, Array or String, but got ' + pattern);
}
exports.toPathMatch = toPathMatch;
function pathMatching(options) {
    options = options || {};
    if (options.match && options.ignore)
        throw new error_1.MidwayCommonError('options.match and options.ignore can not both present');
    if (!options.match && !options.ignore)
        return () => true;
    if (options.match && !Array.isArray(options.match)) {
        options.match = [options.match];
    }
    if (options.ignore && !Array.isArray(options.ignore)) {
        options.ignore = [options.ignore];
    }
    const createMatch = (ignoreMatcherArr) => {
        const matchedArr = ignoreMatcherArr.map(item => {
            if (options.thisResolver) {
                return toPathMatch(item).bind(options.thisResolver);
            }
            return toPathMatch(item);
        });
        return ctx => {
            for (let i = 0; i < matchedArr.length; i++) {
                const matched = matchedArr[i](ctx);
                if (matched) {
                    return true;
                }
            }
            return false;
        };
    };
    const matchFn = options.match
        ? createMatch(options.match)
        : createMatch(options.ignore);
    return function pathMatch(ctx) {
        const matched = matchFn(ctx);
        return options.match ? matched : !matched;
    };
}
exports.pathMatching = pathMatching;
/**
 * wrap function middleware with match and ignore
 * @param mw
 * @param options
 */
function wrapMiddleware(mw, options) {
    // support options.enable
    if (options.enable === false)
        return null;
    // support options.match and options.ignore
    if (!options.match && !options.ignore)
        return mw;
    const match = pathMatching(options);
    const fn = (ctx, next) => {
        if (!match(ctx))
            return next();
        return mw(ctx, next);
    };
    fn._name = mw._name + 'middlewareWrapper';
    return fn;
}
exports.wrapMiddleware = wrapMiddleware;
function isOwnPropertyWritable(obj, prop) {
    if (obj == null)
        return false;
    const type = typeof obj;
    if (type !== 'object' && type !== 'function')
        return false;
    return !!Object.getOwnPropertyDescriptor(obj, prop);
}
function isIncludeProperty(obj, prop) {
    while (obj) {
        if (isOwnPropertyWritable(obj, prop))
            return true;
        obj = Object.getPrototypeOf(obj);
    }
    return false;
}
exports.isIncludeProperty = isIncludeProperty;
function wrapAsync(handler) {
    return (...args) => {
        if (typeof args[args.length - 1] === 'function') {
            const callback = args.pop();
            if (handler.constructor.name !== 'AsyncFunction') {
                const err = new TypeError('Must be an AsyncFunction');
                return callback(err);
            }
            // 其他事件场景
            return handler.apply(handler, args).then(result => {
                callback(null, result);
            }, err => {
                callback(err);
            });
        }
        else {
            return handler.apply(handler, args);
        }
    };
}
exports.wrapAsync = wrapAsync;
function sleep(sleepTime = 1000) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, sleepTime);
    });
}
exports.sleep = sleep;
const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;
/**
 * get parameter name from function
 * @param func
 */
function getParamNames(func) {
    const fnStr = func.toString().replace(STRIP_COMMENTS, '');
    let result = fnStr
        .slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')'))
        .split(',')
        .map(content => {
        return content.trim().replace(/\s?=.*$/, '');
    });
    if (result.length === 1 && result[0] === '') {
        result = [];
    }
    return result;
}
exports.getParamNames = getParamNames;
/**
 * generate a lightweight 32 bit random id, enough for ioc container
 */
function generateRandomId() {
    // => f9b327e70bbcf42494ccb28b2d98e00e
    return crypto.randomBytes(16).toString('hex');
}
exports.generateRandomId = generateRandomId;
function merge(target, src) {
    if (!target) {
        target = src;
        src = null;
    }
    if (!target) {
        return null;
    }
    if (Array.isArray(target)) {
        return target.concat(src || []);
    }
    if (typeof target === 'object') {
        return Object.assign({}, target, src);
    }
    throw new Error('can not merge meta that type of ' + typeof target);
}
exports.merge = merge;
function toAsyncFunction(method) {
    if (types_1.Types.isAsyncFunction(method)) {
        return method;
    }
    else {
        return async function (...args) {
            return Promise.resolve(method.call(this, ...args));
        };
    }
}
exports.toAsyncFunction = toAsyncFunction;
function isTypeScriptEnvironment() {
    const TS_MODE_PROCESS_FLAG = process.env.MIDWAY_TS_MODE;
    if ('false' === TS_MODE_PROCESS_FLAG) {
        return false;
    }
    // eslint-disable-next-line node/no-deprecated-api
    return TS_MODE_PROCESS_FLAG === 'true' || !!require.extensions['.ts'];
}
exports.isTypeScriptEnvironment = isTypeScriptEnvironment;
/**
 * Create a Promise that resolves after the specified time
 * @param options
 */
async function createPromiseTimeoutInvokeChain(options) {
    var _a;
    if (!options.onSuccess) {
        options.onSuccess = async (result) => {
            return result;
        };
    }
    options.isConcurrent = (_a = options.isConcurrent) !== null && _a !== void 0 ? _a : true;
    options.promiseItems = options.promiseItems.map(item => {
        if (item instanceof Promise) {
            return { item };
        }
        else {
            return item;
        }
    });
    // filter promise
    options.promiseItems = options.promiseItems.filter(item => {
        return item['item'] instanceof Promise;
    });
    if (options.isConcurrent) {
        // For each check item, we create a timeout Promise
        const checkPromises = options.promiseItems.map(item => {
            const timeoutPromise = new Promise((_, reject) => {
                var _a;
                // The timeout Promise fails after the specified time
                setTimeout(() => {
                    var _a;
                    return reject(new error_1.MidwayCodeInvokeTimeoutError(options.methodName, (_a = item['timeout']) !== null && _a !== void 0 ? _a : options.timeout));
                }, (_a = item['timeout']) !== null && _a !== void 0 ? _a : options.timeout);
            });
            // We use Promise.race to wait for either the check item or the timeout Promise
            return (Promise.race([item['item'], timeoutPromise])
                // If the check item Promise resolves, we set the result to success
                .then(re => {
                return options.onSuccess(re, item['meta']);
            })
                // If the timeout Promise resolves (i.e., the check item Promise did not resolve in time), we set the result to failure
                .catch(err => {
                return options.onFail(err, item['meta']);
            }));
        });
        return Promise.all(checkPromises);
    }
    else {
        const results = [];
        for (const item of options.promiseItems) {
            const timeoutPromise = new Promise((_, reject) => {
                var _a;
                setTimeout(() => {
                    var _a;
                    return reject(new error_1.MidwayCodeInvokeTimeoutError(options.methodName, (_a = item['timeout']) !== null && _a !== void 0 ? _a : options.timeout));
                }, (_a = item['timeout']) !== null && _a !== void 0 ? _a : options.timeout);
            });
            try {
                const result = await Promise.race([item['item'], timeoutPromise]).then(re => {
                    return options.onSuccess(re, item['meta']);
                });
                results.push(result);
            }
            catch (error) {
                results.push(options.onFail(error, item['meta']));
                break;
            }
        }
        return results;
    }
}
exports.createPromiseTimeoutInvokeChain = createPromiseTimeoutInvokeChain;
exports.Utils = {
    sleep,
    getParamNames,
    camelCase: camelCase_1.camelCase,
    pascalCase: camelCase_1.pascalCase,
    randomUUID: uuid_1.randomUUID,
    generateRandomId,
    toAsyncFunction,
    safeStringify: flatted_1.safeStringify,
    safeParse: flatted_1.safeParse,
    isTypeScriptEnvironment,
};
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 9837:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getModuleRequirePathList = exports.PathFileUtil = exports.getFileContentSync = exports.isPathEqual = exports.isPath = void 0;
const path_1 = __nccwpck_require__(6928);
const fs_1 = __nccwpck_require__(9896);
function isPath(p) {
    // eslint-disable-next-line no-useless-escape
    if (/(^[\.\/])|:|\\/.test(p)) {
        return true;
    }
    return false;
}
exports.isPath = isPath;
function isPathEqual(one, two) {
    if (!one || !two) {
        return false;
    }
    const ext = (0, path_1.extname)(one);
    return one.replace(ext, '') === two;
}
exports.isPathEqual = isPathEqual;
function getFileContentSync(filePath, encoding) {
    return typeof filePath === 'string'
        ? (0, fs_1.readFileSync)(filePath, {
            encoding,
        })
        : filePath;
}
exports.getFileContentSync = getFileContentSync;
exports.PathFileUtil = {
    isPath,
    isPathEqual,
    getFileContentSync,
};
function getModuleRequirePathList(moduleName) {
    const moduleNameList = [moduleName, moduleName.replace(/\//g, '_')];
    let moduleNameMap = {};
    const modulePathList = [];
    Object.keys(require.cache || {}).forEach(moduleName => {
        let moduleIndex = -1;
        for (const moduleName of moduleNameList) {
            const index = moduleName.indexOf(moduleName);
            if (index !== -1) {
                moduleIndex = index;
                break;
            }
        }
        if (moduleIndex === -1) {
            return;
        }
        const modulePath = moduleName.slice(0, moduleIndex);
        if (moduleNameMap[modulePath]) {
            return;
        }
        moduleNameMap[modulePath] = true;
        modulePathList.push(modulePath);
    });
    moduleNameMap = undefined;
    return modulePathList;
}
exports.getModuleRequirePathList = getModuleRequirePathList;
//# sourceMappingURL=pathFileUtil.js.map

/***/ }),

/***/ 6027:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PathToRegexpUtil = void 0;
/**
 * Tokenize input string.
 */
function lexer(str) {
    const tokens = [];
    let i = 0;
    while (i < str.length) {
        const char = str[i];
        if (char === '*' || char === '+' || char === '?') {
            tokens.push({ type: 'MODIFIER', index: i, value: str[i++] });
            continue;
        }
        if (char === '\\') {
            tokens.push({ type: 'ESCAPED_CHAR', index: i++, value: str[i++] });
            continue;
        }
        if (char === '{') {
            tokens.push({ type: 'OPEN', index: i, value: str[i++] });
            continue;
        }
        if (char === '}') {
            tokens.push({ type: 'CLOSE', index: i, value: str[i++] });
            continue;
        }
        if (char === ':') {
            let name = '';
            let j = i + 1;
            while (j < str.length) {
                const code = str.charCodeAt(j);
                if (
                // `0-9`
                (code >= 48 && code <= 57) ||
                    // `A-Z`
                    (code >= 65 && code <= 90) ||
                    // `a-z`
                    (code >= 97 && code <= 122) ||
                    // `_`
                    code === 95) {
                    name += str[j++];
                    continue;
                }
                break;
            }
            if (!name)
                throw new TypeError(`Missing parameter name at ${i}`);
            tokens.push({ type: 'NAME', index: i, value: name });
            i = j;
            continue;
        }
        if (char === '(') {
            let count = 1;
            let pattern = '';
            let j = i + 1;
            if (str[j] === '?') {
                throw new TypeError(`Pattern cannot start with "?" at ${j}`);
            }
            while (j < str.length) {
                if (str[j] === '\\') {
                    pattern += str[j++] + str[j++];
                    continue;
                }
                if (str[j] === ')') {
                    count--;
                    if (count === 0) {
                        j++;
                        break;
                    }
                }
                else if (str[j] === '(') {
                    count++;
                    if (str[j + 1] !== '?') {
                        throw new TypeError(`Capturing groups are not allowed at ${j}`);
                    }
                }
                pattern += str[j++];
            }
            if (count)
                throw new TypeError(`Unbalanced pattern at ${i}`);
            if (!pattern)
                throw new TypeError(`Missing pattern at ${i}`);
            tokens.push({ type: 'PATTERN', index: i, value: pattern });
            i = j;
            continue;
        }
        tokens.push({ type: 'CHAR', index: i, value: str[i++] });
    }
    tokens.push({ type: 'END', index: i, value: '' });
    return tokens;
}
/**
 * Parse a string for the raw tokens.
 */
function parse(str, options = {}) {
    const tokens = lexer(str);
    const { prefixes = './' } = options;
    const defaultPattern = `[^${escapeString(options.delimiter || '/#?')}]+?`;
    const result = [];
    let key = 0;
    let i = 0;
    let path = '';
    const tryConsume = (type) => {
        if (i < tokens.length && tokens[i].type === type)
            return tokens[i++].value;
    };
    const mustConsume = (type) => {
        const value = tryConsume(type);
        if (value !== undefined)
            return value;
        const { type: nextType, index } = tokens[i];
        throw new TypeError(`Unexpected ${nextType} at ${index}, expected ${type}`);
    };
    const consumeText = () => {
        let result = '';
        let value;
        while ((value = tryConsume('CHAR') || tryConsume('ESCAPED_CHAR'))) {
            result += value;
        }
        return result;
    };
    while (i < tokens.length) {
        const char = tryConsume('CHAR');
        const name = tryConsume('NAME');
        const pattern = tryConsume('PATTERN');
        if (name || pattern) {
            let prefix = char || '';
            if (prefixes.indexOf(prefix) === -1) {
                path += prefix;
                prefix = '';
            }
            if (path) {
                result.push(path);
                path = '';
            }
            result.push({
                name: name || key++,
                prefix,
                suffix: '',
                pattern: pattern || defaultPattern,
                modifier: tryConsume('MODIFIER') || '',
            });
            continue;
        }
        const value = char || tryConsume('ESCAPED_CHAR');
        if (value) {
            path += value;
            continue;
        }
        if (path) {
            result.push(path);
            path = '';
        }
        const open = tryConsume('OPEN');
        if (open) {
            const prefix = consumeText();
            const name = tryConsume('NAME') || '';
            const pattern = tryConsume('PATTERN') || '';
            const suffix = consumeText();
            mustConsume('CLOSE');
            result.push({
                name: name || (pattern ? key++ : ''),
                pattern: name && !pattern ? defaultPattern : pattern,
                prefix,
                suffix,
                modifier: tryConsume('MODIFIER') || '',
            });
            continue;
        }
        mustConsume('END');
    }
    return result;
}
/**
 * Compile a string to a template function for the path.
 */
function compile(str, options) {
    return tokensToFunction(parse(str, options), options);
}
/**
 * Expose a method for transforming tokens into the path function.
 */
function tokensToFunction(tokens, options = {}) {
    const reFlags = flags(options);
    const { encode = (x) => x, validate = true } = options;
    // Compile all the tokens into regexps.
    const matches = tokens.map(token => {
        if (typeof token === 'object') {
            return new RegExp(`^(?:${token.pattern})$`, reFlags);
        }
    });
    return (data) => {
        let path = '';
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (typeof token === 'string') {
                path += token;
                continue;
            }
            const value = data ? data[token.name] : undefined;
            const optional = token.modifier === '?' || token.modifier === '*';
            const repeat = token.modifier === '*' || token.modifier === '+';
            if (Array.isArray(value)) {
                if (!repeat) {
                    throw new TypeError(`Expected "${token.name}" to not repeat, but got an array`);
                }
                if (value.length === 0) {
                    if (optional)
                        continue;
                    throw new TypeError(`Expected "${token.name}" to not be empty`);
                }
                for (let j = 0; j < value.length; j++) {
                    const segment = encode(value[j], token);
                    if (validate && !matches[i].test(segment)) {
                        throw new TypeError(`Expected all "${token.name}" to match "${token.pattern}", but got "${segment}"`);
                    }
                    path += token.prefix + segment + token.suffix;
                }
                continue;
            }
            if (typeof value === 'string' || typeof value === 'number') {
                const segment = encode(String(value), token);
                if (validate && !matches[i].test(segment)) {
                    throw new TypeError(`Expected "${token.name}" to match "${token.pattern}", but got "${segment}"`);
                }
                path += token.prefix + segment + token.suffix;
                continue;
            }
            if (optional)
                continue;
            const typeOfMessage = repeat ? 'an array' : 'a string';
            throw new TypeError(`Expected "${token.name}" to be ${typeOfMessage}`);
        }
        return path;
    };
}
/**
 * Create path match function from `path-to-regexp` spec.
 */
function match(str, options) {
    const keys = [];
    const re = toRegexp(str, keys, options);
    return regexpToFunction(re, keys, options);
}
/**
 * Create a path match function from `path-to-regexp` output.
 */
function regexpToFunction(re, keys, options = {}) {
    const { decode = (x) => x } = options;
    return function (pathname) {
        const m = re.exec(pathname);
        if (!m)
            return false;
        const { 0: path, index } = m;
        const params = Object.create(null);
        for (let i = 1; i < m.length; i++) {
            if (m[i] === undefined)
                continue;
            const key = keys[i - 1];
            if (key.modifier === '*' || key.modifier === '+') {
                params[key.name] = m[i].split(key.prefix + key.suffix).map(value => {
                    return decode(value, key);
                });
            }
            else {
                params[key.name] = decode(m[i], key);
            }
        }
        return { path, index, params };
    };
}
/**
 * Escape a regular expression string.
 */
function escapeString(str) {
    return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1');
}
/**
 * Get the flags for a regexp from the options.
 */
function flags(options) {
    return options && options.sensitive ? '' : 'i';
}
/**
 * Pull out keys from a regexp.
 */
function regexpToRegexp(path, keys) {
    if (!keys)
        return path;
    const groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
    let index = 0;
    let execResult = groupsRegex.exec(path.source);
    while (execResult) {
        keys.push({
            // Use parenthesized substring match if available, index otherwise
            name: execResult[1] || index++,
            prefix: '',
            suffix: '',
            modifier: '',
            pattern: '',
        });
        execResult = groupsRegex.exec(path.source);
    }
    return path;
}
/**
 * Transform an array into a regexp.
 */
function arrayToRegexp(paths, keys, options) {
    const parts = paths.map(path => toRegexp(path, keys, options).source);
    return new RegExp(`(?:${parts.join('|')})`, flags(options));
}
/**
 * Create a path regexp from string input.
 */
function stringToRegexp(path, keys, options) {
    return tokensToRegexp(parse(path, options), keys, options);
}
/**
 * Expose a function for taking tokens and returning a RegExp.
 */
function tokensToRegexp(tokens, keys, options = {}) {
    const { strict = false, start = true, end = true, encode = (x) => x, delimiter = '/#?', endsWith = '', } = options;
    const endsWithRe = `[${escapeString(endsWith)}]|$`;
    const delimiterRe = `[${escapeString(delimiter)}]`;
    let route = start ? '^' : '';
    // Iterate over the tokens and create our regexp string.
    for (const token of tokens) {
        if (typeof token === 'string') {
            route += escapeString(encode(token));
        }
        else {
            const prefix = escapeString(encode(token.prefix));
            const suffix = escapeString(encode(token.suffix));
            if (token.pattern) {
                if (keys)
                    keys.push(token);
                if (prefix || suffix) {
                    if (token.modifier === '+' || token.modifier === '*') {
                        const mod = token.modifier === '*' ? '?' : '';
                        route += `(?:${prefix}((?:${token.pattern})(?:${suffix}${prefix}(?:${token.pattern}))*)${suffix})${mod}`;
                    }
                    else {
                        route += `(?:${prefix}(${token.pattern})${suffix})${token.modifier}`;
                    }
                }
                else {
                    if (token.modifier === '+' || token.modifier === '*') {
                        route += `((?:${token.pattern})${token.modifier})`;
                    }
                    else {
                        route += `(${token.pattern})${token.modifier}`;
                    }
                }
            }
            else {
                route += `(?:${prefix}${suffix})${token.modifier}`;
            }
        }
    }
    if (end) {
        if (!strict)
            route += `${delimiterRe}?`;
        route += !options.endsWith ? '$' : `(?=${endsWithRe})`;
    }
    else {
        const endToken = tokens[tokens.length - 1];
        const isEndDelimited = typeof endToken === 'string'
            ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1
            : endToken === undefined;
        if (!strict) {
            route += `(?:${delimiterRe}(?=${endsWithRe}))?`;
        }
        if (!isEndDelimited) {
            route += `(?=${delimiterRe}|${endsWithRe})`;
        }
    }
    return new RegExp(route, flags(options));
}
/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 */
function toRegexp(path, keys, options) {
    if (path instanceof RegExp)
        return regexpToRegexp(path, keys);
    if (Array.isArray(path))
        return arrayToRegexp(path, keys, options);
    return stringToRegexp(path, keys, options);
}
exports.PathToRegexpUtil = {
    toRegexp,
    compile,
    parse,
    match,
};
//# sourceMappingURL=pathToRegexp.js.map

/***/ }),

/***/ 3724:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.retryWith = exports.retryWithAsync = void 0;
const _1 = __nccwpck_require__(6110);
const error_1 = __nccwpck_require__(6248);
/**
 * wrap async function with retry
 * @param retryFn
 * @param retryTimes
 * @param options
 */
function retryWithAsync(retryFn, retryTimes = 1, options = {}) {
    let defaultRetry = retryTimes;
    let error;
    return (async (...args) => {
        do {
            try {
                return await retryFn.bind(options.receiver || this)(...args);
            }
            catch (err) {
                error = err;
            }
            if (options.retryInterval >= 0) {
                await (0, _1.sleep)(options.retryInterval);
            }
        } while (defaultRetry-- > 0);
        if (options.throwOriginError) {
            throw error;
        }
        else {
            throw new error_1.MidwayRetryExceededMaxTimesError(retryFn.name || 'anonymous', retryTimes, error);
        }
    });
}
exports.retryWithAsync = retryWithAsync;
/**
 * wrap sync function with retry
 * @param retryFn
 * @param retryTimes
 * @param options
 */
function retryWith(retryFn, retryTimes = 1, options = {}) {
    let defaultRetry = retryTimes;
    let error;
    return ((...args) => {
        do {
            try {
                return retryFn.bind(options.receiver || this)(...args);
            }
            catch (err) {
                error = err;
            }
        } while (defaultRetry-- > 0);
        if (options.throwOriginError) {
            throw error;
        }
        else {
            throw new error_1.MidwayRetryExceededMaxTimesError(retryFn.name || 'anonymous', retryTimes, error);
        }
    });
}
exports.retryWith = retryWith;
//# sourceMappingURL=retry.js.map

/***/ }),

/***/ 3171:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Types = exports.isNullOrUndefined = exports.isNull = exports.isUndefined = exports.isRegExp = exports.isSet = exports.isMap = exports.isProxy = exports.isNumber = exports.isPlainObject = exports.isObject = exports.isFunction = exports.isPromise = exports.isGeneratorFunction = exports.isAsyncFunction = exports.isClass = exports.isString = void 0;
const util = __nccwpck_require__(9023);
const ToString = Function.prototype.toString;
const hasOwn = Object.prototype.hasOwnProperty;
const toStr = Object.prototype.toString;
function isString(value) {
    return typeof value === 'string';
}
exports.isString = isString;
function isClass(fn) {
    if (typeof fn !== 'function') {
        return false;
    }
    if (/^class[\s{]/.test(ToString.call(fn))) {
        return true;
    }
}
exports.isClass = isClass;
function isAsyncFunction(value) {
    return util.types.isAsyncFunction(value);
}
exports.isAsyncFunction = isAsyncFunction;
function isGeneratorFunction(value) {
    return util.types.isGeneratorFunction(value);
}
exports.isGeneratorFunction = isGeneratorFunction;
function isPromise(value) {
    return util.types.isPromise(value);
}
exports.isPromise = isPromise;
function isFunction(value) {
    return typeof value === 'function';
}
exports.isFunction = isFunction;
function isObject(value) {
    return value !== null && typeof value === 'object';
}
exports.isObject = isObject;
function isPlainObject(obj) {
    if (!obj || toStr.call(obj) !== '[object Object]') {
        return false;
    }
    const hasOwnConstructor = hasOwn.call(obj, 'constructor');
    const hasIsPrototypeOf = obj.constructor &&
        obj.constructor.prototype &&
        hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
    // Not own constructor property must be Object
    if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
        return false;
    }
    // Own properties are enumerated firstly, so to speed up,
    // if last one is own, then all properties are own.
    let key;
    for (key in obj) {
        /**/
    }
    return typeof key === 'undefined' || hasOwn.call(obj, key);
}
exports.isPlainObject = isPlainObject;
function isNumber(value) {
    return typeof value === 'number';
}
exports.isNumber = isNumber;
function isProxy(value) {
    return util.types.isProxy(value);
}
exports.isProxy = isProxy;
function isMap(value) {
    return util.types.isMap(value);
}
exports.isMap = isMap;
function isSet(value) {
    return util.types.isSet(value);
}
exports.isSet = isSet;
function isRegExp(value) {
    return util.types.isRegExp(value);
}
exports.isRegExp = isRegExp;
function isUndefined(value) {
    return value === undefined;
}
exports.isUndefined = isUndefined;
function isNull(value) {
    return value === null;
}
exports.isNull = isNull;
function isNullOrUndefined(value) {
    return isUndefined(value) || isNull(value);
}
exports.isNullOrUndefined = isNullOrUndefined;
exports.Types = {
    isClass,
    isAsyncFunction,
    isGeneratorFunction,
    isString,
    isPromise,
    isFunction,
    isObject,
    isPlainObject,
    isNumber,
    isProxy,
    isMap,
    isSet,
    isRegExp,
    isUndefined,
    isNull,
    isNullOrUndefined,
};
//# sourceMappingURL=types.js.map

/***/ }),

/***/ 9003:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.randomUUID = void 0;
const crypto = __nccwpck_require__(6982);
/**
 * code fork from https://github.com/uuidjs/uuid/blob/main/src/stringify.js
 */
const rnds8Pool = new Uint8Array(256); // # of random values to pre-allocate
let poolPtr = rnds8Pool.length;
function rng() {
    if (poolPtr > rnds8Pool.length - 16) {
        crypto.randomFillSync(rnds8Pool);
        poolPtr = 0;
    }
    return rnds8Pool.slice(poolPtr, (poolPtr += 16));
}
/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
const byteToHex = [];
for (let i = 0; i < 256; ++i) {
    byteToHex.push((i + 0x100).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
    // Note: Be careful editing this code!  It's been tuned for performance
    // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
    return (byteToHex[arr[offset + 0]] +
        byteToHex[arr[offset + 1]] +
        byteToHex[arr[offset + 2]] +
        byteToHex[arr[offset + 3]] +
        '-' +
        byteToHex[arr[offset + 4]] +
        byteToHex[arr[offset + 5]] +
        '-' +
        byteToHex[arr[offset + 6]] +
        byteToHex[arr[offset + 7]] +
        '-' +
        byteToHex[arr[offset + 8]] +
        byteToHex[arr[offset + 9]] +
        '-' +
        byteToHex[arr[offset + 10]] +
        byteToHex[arr[offset + 11]] +
        byteToHex[arr[offset + 12]] +
        byteToHex[arr[offset + 13]] +
        byteToHex[arr[offset + 14]] +
        byteToHex[arr[offset + 15]]).toLowerCase();
}
/**
 * a easy uuid v4 generator
 */
function randomUUID(force) {
    // node > v14.17
    if (!force && crypto['randomUUID']) {
        return crypto['randomUUID']();
    }
    const rnds = rng();
    // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;
    return unsafeStringify(rnds);
}
exports.randomUUID = randomUUID;
//# sourceMappingURL=uuid.js.map

/***/ }),

/***/ 7816:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.extractExpressLikeValue = exports.extractKoaLikeValue = void 0;
const decorator_1 = __nccwpck_require__(8351);
const index_1 = __nccwpck_require__(6110);
const extractKoaLikeValue = (key, data, paramType) => {
    if (decorator_1.ALL === data) {
        data = undefined;
    }
    return function (ctx, next) {
        switch (key) {
            case decorator_1.RouteParamTypes.NEXT:
                return next;
            case decorator_1.RouteParamTypes.BODY:
                return (0, index_1.transformRequestObjectByType)(data && ctx.request.body ? ctx.request.body[data] : ctx.request.body, paramType);
            case decorator_1.RouteParamTypes.PARAM:
                return (0, index_1.transformRequestObjectByType)(data ? ctx.params[data] : ctx.params, paramType);
            case decorator_1.RouteParamTypes.QUERY:
                return (0, index_1.transformRequestObjectByType)(data ? ctx.query[data] : ctx.query, paramType);
            case decorator_1.RouteParamTypes.HEADERS:
                return (0, index_1.transformRequestObjectByType)(data ? ctx.get(data) : ctx.headers, paramType);
            case decorator_1.RouteParamTypes.SESSION:
                return (0, index_1.transformRequestObjectByType)(data ? ctx.session[data] : ctx.session, paramType);
            case decorator_1.RouteParamTypes.FILESTREAM:
                if (ctx.getFileStream) {
                    return ctx.getFileStream(data);
                }
                else if (ctx.files) {
                    if (Array.isArray(ctx.files)) {
                        return ctx.files[0];
                    }
                    else {
                        return ctx.files;
                    }
                }
                else {
                    return undefined;
                }
            case decorator_1.RouteParamTypes.FILESSTREAM:
                if (ctx.multipart) {
                    return ctx.multipart(data);
                }
                else if (ctx.files) {
                    return ctx.files;
                }
                else {
                    return undefined;
                }
            case decorator_1.RouteParamTypes.REQUEST_PATH:
                return ctx['path'];
            case decorator_1.RouteParamTypes.REQUEST_IP:
                return ctx['ip'];
            case decorator_1.RouteParamTypes.QUERIES:
                if (ctx.queries) {
                    return (0, index_1.transformRequestObjectByType)(data ? ctx.queries[data] : ctx.queries, paramType);
                }
                else {
                    return (0, index_1.transformRequestObjectByType)(data ? ctx.query[data] : ctx.query, paramType);
                }
            case decorator_1.RouteParamTypes.FIELDS:
                return data ? ctx.fields[data] : ctx.fields;
            case decorator_1.RouteParamTypes.CUSTOM:
                return data ? data(ctx) : undefined;
            default:
                return null;
        }
    };
};
exports.extractKoaLikeValue = extractKoaLikeValue;
const extractExpressLikeValue = (key, data, paramType) => {
    if (decorator_1.ALL === data) {
        data = undefined;
    }
    return function (req, res, next) {
        switch (key) {
            case decorator_1.RouteParamTypes.NEXT:
                return next;
            case decorator_1.RouteParamTypes.BODY:
                return (0, index_1.transformRequestObjectByType)(data && req.body ? req.body[data] : req.body, paramType);
            case decorator_1.RouteParamTypes.PARAM:
                return (0, index_1.transformRequestObjectByType)(data ? req.params[data] : req.params, paramType);
            case decorator_1.RouteParamTypes.QUERY:
                return (0, index_1.transformRequestObjectByType)(data ? req.query[data] : req.query, paramType);
            case decorator_1.RouteParamTypes.HEADERS:
                return (0, index_1.transformRequestObjectByType)(data ? req.get(data) : req.headers, paramType);
            case decorator_1.RouteParamTypes.SESSION:
                return (0, index_1.transformRequestObjectByType)(data ? req.session[data] : req.session, paramType);
            case decorator_1.RouteParamTypes.FILESTREAM:
                return req.files ? req.files[0] : undefined;
            case decorator_1.RouteParamTypes.FILESSTREAM:
                return req.files;
            case decorator_1.RouteParamTypes.REQUEST_PATH:
                return req['baseUrl'];
            case decorator_1.RouteParamTypes.REQUEST_IP:
                return req['ip'];
            case decorator_1.RouteParamTypes.QUERIES:
                if (req.queries) {
                    return (0, index_1.transformRequestObjectByType)(data ? req.queries[data] : req.queries, paramType);
                }
                else {
                    return (0, index_1.transformRequestObjectByType)(data ? req.query[data] : req.query, paramType);
                }
            case decorator_1.RouteParamTypes.FIELDS:
                return data ? req.fields[data] : req.fields;
            case decorator_1.RouteParamTypes.CUSTOM:
                return data ? data(req, res) : undefined;
            default:
                return null;
        }
    };
};
exports.extractExpressLikeValue = extractExpressLikeValue;
//# sourceMappingURL=webRouterParam.js.map

/***/ }),

/***/ 5698:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AbstractEventBus = exports.AckResponder = exports.createWaitHandler = void 0;
// event bus
const interface_1 = __nccwpck_require__(6452);
const util_1 = __nccwpck_require__(9023);
const error_1 = __nccwpck_require__(4557);
const DEFAULT_LISTENER_KEY = '_default_';
const END_FLAG = null;
function revertError(errorObj) {
    const error = new Error();
    error.name = errorObj.name;
    error.message = errorObj.message;
    error.stack = errorObj.stack;
    return error;
}
class MessageLimitSet extends Set {
    constructor(limit) {
        super();
        this.limit = limit;
    }
    add(value) {
        if (this.size < this.limit) {
            return super.add(value);
        }
    }
}
async function createWaitHandler(checkHandler, options = {}) {
    await new Promise((resolve, reject) => {
        const timeoutHandler = setTimeout(() => {
            clearInterval(handler);
            clearTimeout(timeoutHandler);
            reject(new error_1.EventBusTimeoutError());
        }, options.timeout || 5000);
        const handler = setInterval(() => {
            if (checkHandler()) {
                clearInterval(handler);
                clearTimeout(timeoutHandler);
                resolve(true);
            }
        }, options.timeoutCheckInterval || 500);
    });
}
exports.createWaitHandler = createWaitHandler;
class ChunkIterator {
    constructor(debugLogger) {
        this.debugLogger = debugLogger;
        this.buffer = [];
    }
    publish(data) {
        this.buffer.push(data);
        // check buffer and resolve defer
        if (this.waitingPromiseDeferred) {
            const w = this.waitingPromiseDeferred;
            this.waitingPromiseDeferred = null;
            // 这里要从 buffer 取
            w.resolve(this.buffer.shift());
        }
    }
    error(err) {
        if (this.waitingPromiseDeferred) {
            const w = this.waitingPromiseDeferred;
            this.waitingPromiseDeferred = null;
            w.reject(err);
        }
        else {
            this.errorRisen = err;
        }
        this.clear();
    }
    [Symbol.asyncIterator]() {
        return this;
    }
    async tryToGetNextData() {
        if (this.errorRisen) {
            // 如果在循环时发现之前已经有接到错误，直接抛出
            throw this.errorRisen;
        }
        /**
         * 1、如果在循环前有数据，就从 buffer 中取
         * 2、如果 buffer 里没数据，这里就要等待数据，在 publish 的时候直接 resolve
         */
        if (this.buffer.length > 0) {
            return this.buffer.shift();
        }
        else {
            const deferred = {};
            deferred.promise = new Promise((resolve, reject) => {
                deferred.resolve = resolve;
                deferred.reject = reject;
            });
            this.waitingPromiseDeferred = deferred;
            return deferred.promise;
        }
    }
    async next() {
        this.debugLogger('1 ChunkIterator run next and wait data');
        const { data, isEnd } = await this.tryToGetNextData();
        this.debugLogger('2 ChunkIterator get data', data, isEnd);
        if (isEnd) {
            this.clear();
            return { value: undefined, done: true };
        }
        else {
            return { value: data, done: false };
        }
    }
    clear() {
        this.buffer.length = 0;
    }
}
class AckResponder {
    constructor() {
        this.isEndFlag = false;
    }
    onData(dataHandler) {
        this.dataHandler = dataHandler;
    }
    onError(errorHandler) {
        this.errorHandler = errorHandler;
    }
    end(data) {
        if (!this.isEndFlag) {
            this.isEndFlag = true;
            if (data) {
                this.sendData(data);
            }
            this.sendData(END_FLAG);
        }
    }
    sendData(data) {
        if (this.dataHandler) {
            this.dataHandler(data);
        }
    }
    send(data) {
        if (!this.isEndFlag) {
            this.sendData(data);
        }
    }
    error(err) {
        if (!this.isEndFlag) {
            if (this.errorHandler) {
                this.errorHandler(err);
            }
        }
    }
    isEnd() {
        return this.isEndFlag;
    }
}
exports.AckResponder = AckResponder;
class AbstractEventBus {
    constructor(options = {}) {
        this.options = options;
        this.isInited = false;
        this.workers = [];
        this.stopping = false;
        this.workerReady = new Map();
        this.topicListener = new Map();
        this.topicMessageCache = new Map();
        this.asyncMessageMap = new Map();
        this.eventListenerMap = new Map();
        this.debugLogger = this.createDebugger();
        this.debugLogger(`Start EventBus(${this.constructor.name}) in ${this.isWorker() ? 'worker' : 'main'}`);
        this.eventListenerMap.set(interface_1.ListenerType.Error, (err) => {
            console.error(err);
        });
        this.listener = (message, responder) => {
            var _a, _b;
            const listeners = this.topicListener.get(((_a = message.messageOptions) === null || _a === void 0 ? void 0 : _a.topic) || DEFAULT_LISTENER_KEY);
            if (listeners) {
                for (const listener of listeners) {
                    if (listener['_subscribeOnce']) {
                        listeners.delete(listener);
                    }
                    // eslint-disable-next-line no-async-promise-executor
                    new Promise(async (resolve, reject) => {
                        try {
                            await resolve(listener(message, responder));
                        }
                        catch (e) {
                            reject(e);
                        }
                    }).catch(err => {
                        if (responder) {
                            responder.error(err);
                        }
                        else {
                            this.eventListenerMap.get(interface_1.ListenerType.Error)(err);
                        }
                    });
                }
            }
            else {
                const topic = ((_b = message.messageOptions) === null || _b === void 0 ? void 0 : _b.topic) || DEFAULT_LISTENER_KEY;
                if (!this.topicMessageCache.has(topic)) {
                    this.topicMessageCache.set(topic, new MessageLimitSet(10));
                }
                this.topicMessageCache.get(topic).add({ message, responder });
            }
        };
        // bind event center
        this.setupEventBind();
    }
    createDebugger() {
        return (0, util_1.debuglog)(`midway:event-bus:${this.isWorker() ? 'worker' : 'main  '}`);
    }
    debugDataflow(message) {
        if (message.messageCategory === interface_1.MessageCategory.IN) {
            if (this.isMain()) {
                return `${message.message.type}|${message.messageCategory}: worker => main(△)`;
            }
            else {
                return `${message.message.type}|${message.messageCategory}: main => worker(△)`;
            }
        }
        else {
            if (this.isMain()) {
                return `${message.message.type}|${message.messageCategory}: main(△) => worker`;
            }
            else {
                return `${message.message.type}|${message.messageCategory}: worker(△) => main`;
            }
        }
    }
    async start(err) {
        this.isInited = true;
        if (this.isMain()) {
            await createWaitHandler(() => this.isAllWorkerReady(), {
                timeout: this.options.initTimeout,
                timeoutCheckInterval: this.options.initTimeoutCheckInterval,
            });
        }
        else {
            // listen main => worker in worker
            this.workerSubscribeMessage((message) => {
                this.transit({
                    messageCategory: interface_1.MessageCategory.IN,
                    message,
                });
            });
            // worker => main
            this.transit({
                messageCategory: interface_1.MessageCategory.OUT,
                message: {
                    messageId: this.generateMessageId(),
                    workerId: this.getWorkerId(),
                    type: interface_1.MessageType.Inited,
                    body: this.isInited,
                    error: err
                        ? {
                            name: err.name,
                            message: err.message,
                            stack: err.stack,
                        }
                        : undefined,
                },
            });
        }
    }
    addWorker(worker) {
        this.debugLogger(`Add worker(${this.getWorkerId(worker)})`);
        if (!this.workerReady.has(this.getWorkerId(worker))) {
            this.debugLogger(`Init worker(${this.getWorkerId(worker)}) status = false`);
            this.workerReady.set(this.getWorkerId(worker), {
                worker,
                ready: false,
            });
        }
        else {
            this.debugLogger(`Skip init worker(${this.getWorkerId(worker)}) status`);
        }
        worker === null || worker === void 0 ? void 0 : worker['on']('exit', async (exitCode) => {
            if (!this.stopping) {
                // remove ready status
                this.workerReady.delete(this.getWorkerId(worker));
                // remove worker
                const idx = this.workers.findIndex(item => this.getWorkerId(item) === this.getWorkerId(worker));
                this.workers.splice(idx, 1);
            }
        });
        // listen worker => main in main
        this.workerListenMessage(worker, (message) => {
            this.transit({
                messageCategory: interface_1.MessageCategory.IN,
                message,
            });
        });
        this.workers.push(worker);
    }
    isAllWorkerReady() {
        for (const [workerId, value] of this.workerReady) {
            if (!value || !value.ready) {
                this.debugLogger(`Worker(${workerId}) not ready.`);
                return false;
            }
        }
        if (this.workerReady.size > 0) {
            this.debugLogger(`All worker(size=${this.workerReady.size}) is ready.`);
        }
        return true;
    }
    setupEventBind() {
        this.messageReceiver = (message) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
            if (!message.message || !message.message.messageId) {
                // ignore unvalid format message
                return;
            }
            this.debugLogger('EventCenter(%s) message = %j', this.debugDataflow(message), message);
            const originMessage = message.message;
            if (message.messageCategory === interface_1.MessageCategory.OUT) {
                // out operation
                if (originMessage.type === interface_1.MessageType.Invoke ||
                    originMessage.type === interface_1.MessageType.Request ||
                    originMessage.type === interface_1.MessageType.Response ||
                    originMessage.type === interface_1.MessageType.Broadcast) {
                    this.postMessage(originMessage);
                    (_a = this.eventListenerMap.get(interface_1.ListenerType.Request)) === null || _a === void 0 ? void 0 : _a(originMessage);
                }
                else if (originMessage.type === interface_1.MessageType.Inited) {
                    this.postMessage(originMessage);
                    (_b = this.eventListenerMap.get(interface_1.ListenerType.Inited)) === null || _b === void 0 ? void 0 : _b(originMessage);
                }
            }
            else if (message.messageCategory === interface_1.MessageCategory.IN) {
                // in operation
                if (originMessage.type === interface_1.MessageType.Invoke) {
                    const isChunk = ((_c = originMessage.messageOptions) === null || _c === void 0 ? void 0 : _c['isChunk']) === true;
                    const responder = new AckResponder();
                    responder.onData(data => {
                        var _a;
                        this.transit({
                            messageCategory: interface_1.MessageCategory.OUT,
                            message: {
                                messageId: this.generateMessageId(),
                                workerId: this.getWorkerId(),
                                type: interface_1.MessageType.Response,
                                body: data,
                                messageOptions: {
                                    relatedMessageId: originMessage.messageId,
                                    isChunk,
                                    topic: (_a = originMessage.messageOptions) === null || _a === void 0 ? void 0 : _a.topic,
                                },
                            },
                        });
                        if (!isChunk) {
                            // auto run end in normal invoke mode
                            responder.end();
                        }
                    });
                    responder.onError(err => {
                        // publish error
                        this.publish(err, {
                            relatedMessageId: originMessage.messageId,
                            isChunk,
                        });
                        responder.end();
                    });
                    (_d = this.listener) === null || _d === void 0 ? void 0 : _d.call(this, originMessage, responder);
                    (_e = this.eventListenerMap.get(interface_1.ListenerType.Subscribe)) === null || _e === void 0 ? void 0 : _e(originMessage);
                }
                else if (originMessage.type === interface_1.MessageType.Request) {
                    (_f = this.listener) === null || _f === void 0 ? void 0 : _f.call(this, originMessage);
                    (_g = this.eventListenerMap.get(interface_1.ListenerType.Subscribe)) === null || _g === void 0 ? void 0 : _g(originMessage);
                }
                else if (originMessage.type === interface_1.MessageType.Broadcast) {
                    if (this.isMain()) {
                        if (originMessage.messageOptions['includeMainFromWorker'] === true) {
                            (_h = this.listener) === null || _h === void 0 ? void 0 : _h.call(this, originMessage);
                            (_j = this.eventListenerMap.get(interface_1.ListenerType.Subscribe)) === null || _j === void 0 ? void 0 : _j(originMessage);
                        }
                        this.broadcast(originMessage.body, {
                            ...originMessage.messageOptions,
                            relatedMessageId: originMessage.messageId,
                            relatedWorkerId: originMessage.workerId,
                        });
                    }
                    else {
                        (_k = this.listener) === null || _k === void 0 ? void 0 : _k.call(this, originMessage);
                        (_l = this.eventListenerMap.get(interface_1.ListenerType.Subscribe)) === null || _l === void 0 ? void 0 : _l(originMessage);
                    }
                }
                else if (originMessage.type === interface_1.MessageType.Response) {
                    if ((_m = originMessage.messageOptions) === null || _m === void 0 ? void 0 : _m.relatedMessageId) {
                        // worker => main with invoke
                        const asyncResolve = this.asyncMessageMap.get(originMessage.messageOptions.relatedMessageId);
                        const isChunk = originMessage.messageOptions['isChunk'] === true;
                        if (asyncResolve) {
                            if (!isChunk || (isChunk && originMessage.body === END_FLAG)) {
                                this.asyncMessageMap.delete(originMessage.messageOptions.relatedMessageId);
                            }
                            asyncResolve(originMessage.error
                                ? revertError(originMessage.error)
                                : undefined, originMessage.body, isChunk ? originMessage.body === END_FLAG : true);
                        }
                        else {
                            // not found and ignore
                        }
                    }
                    else {
                        (_o = this.listener) === null || _o === void 0 ? void 0 : _o.call(this, originMessage);
                        (_p = this.eventListenerMap.get(interface_1.ListenerType.Subscribe)) === null || _p === void 0 ? void 0 : _p(originMessage);
                    }
                }
                else if (originMessage.type === interface_1.MessageType.Inited) {
                    if (this.isMain()) {
                        // trigger in worker
                        if (originMessage.error) {
                            this.debugLogger(`got worker ${originMessage.workerId} ready failed`);
                            this.eventListenerMap.get(interface_1.ListenerType.Error)(revertError(originMessage.error));
                        }
                        else {
                            (_q = this.eventListenerMap.get(interface_1.ListenerType.Inited)) === null || _q === void 0 ? void 0 : _q(originMessage);
                            // got init status from worker
                            this.workerReady.get(originMessage.workerId).ready = true;
                            this.debugLogger(`got worker ${originMessage.workerId} ready`);
                        }
                    }
                    else {
                        // ignore
                    }
                }
            }
        };
    }
    transit(message) {
        this.messageReceiver(message);
    }
    subscribe(listener, options = {}) {
        const topic = options.topic || DEFAULT_LISTENER_KEY;
        if (!this.topicListener.has(topic)) {
            this.topicListener.set(topic, new Set());
        }
        if (options.subscribeOnce) {
            listener['_subscribeOnce'] = true;
        }
        this.topicListener.get(topic).add(listener);
        listener['_abortController'] = {
            abort: () => {
                this.topicListener.get(topic).delete(listener);
            },
        };
        // if topic has cache
        if (this.topicMessageCache.has(topic) &&
            this.topicMessageCache.get(topic).size > 0) {
            // loop topic cache and trigger listener
            for (const data of this.topicMessageCache.get(topic)) {
                this.listener(data.message, data.responder);
                if (options.subscribeOnce) {
                    break;
                }
            }
            this.topicMessageCache.get(topic).clear();
        }
        return listener['_abortController'];
    }
    subscribeOnce(listener, options = {}) {
        options.subscribeOnce = true;
        return this.subscribe(listener, options);
    }
    publish(data, publishOptions = {}) {
        if (data instanceof Error) {
            this.transit({
                messageCategory: interface_1.MessageCategory.OUT,
                message: {
                    messageId: publishOptions.relatedMessageId || this.generateMessageId(),
                    workerId: this.getWorkerId(),
                    type: this.isMain() ? interface_1.MessageType.Request : interface_1.MessageType.Response,
                    body: undefined,
                    error: {
                        name: data.name,
                        message: data.message,
                        stack: data.stack,
                    },
                    messageOptions: publishOptions,
                },
            });
        }
        else {
            this.transit({
                messageCategory: interface_1.MessageCategory.OUT,
                message: {
                    messageId: publishOptions.relatedMessageId || this.generateMessageId(),
                    workerId: this.getWorkerId(),
                    type: this.isMain() ? interface_1.MessageType.Request : interface_1.MessageType.Response,
                    body: data,
                    messageOptions: publishOptions,
                },
            });
        }
    }
    publishAsync(data, publishOptions = {}) {
        return new Promise((resolve, reject) => {
            const messageId = publishOptions.relatedMessageId || this.generateMessageId();
            this.useTimeout(messageId, publishOptions.timeout, resolve, reject);
            this.transit({
                messageCategory: interface_1.MessageCategory.OUT,
                message: {
                    messageId,
                    workerId: this.getWorkerId(),
                    type: interface_1.MessageType.Invoke,
                    body: data,
                    messageOptions: {
                        topic: publishOptions.topic,
                        dispatchToken: publishOptions.dispatchToken,
                    },
                },
            });
        });
    }
    publishChunk(data, publishOptions = {}) {
        const messageId = publishOptions.relatedMessageId || this.generateMessageId();
        const iterator = new ChunkIterator(this.debugLogger);
        this.useTimeout(messageId, publishOptions.timeout, (data, isEnd) => {
            iterator.publish({
                data,
                isEnd,
            });
        }, err => {
            iterator.error(err);
        });
        this.transit({
            messageCategory: interface_1.MessageCategory.OUT,
            message: {
                messageId,
                workerId: this.getWorkerId(),
                type: this.isMain() ? interface_1.MessageType.Invoke : interface_1.MessageType.Response,
                body: data,
                messageOptions: {
                    isChunk: true,
                    topic: publishOptions.topic,
                },
            },
        });
        return iterator;
    }
    useTimeout(messageId, timeout = 5000, successHandler, errorHandler) {
        const handler = setTimeout(() => {
            clearTimeout(handler);
            this.asyncMessageMap.delete(messageId);
            errorHandler(new error_1.EventBusPublishTimeoutError(messageId));
        }, timeout);
        this.asyncMessageMap.set(messageId, (err, data, isEnd) => {
            if (isEnd || err) {
                clearTimeout(handler);
            }
            if (err) {
                errorHandler(err);
            }
            else {
                successHandler(data, isEnd);
            }
        });
    }
    broadcast(data, options = {}) {
        if (this.isWorker()) {
            options = {
                includeMainFromWorker: false,
                includeSelfFromWorker: false,
                ...options,
            };
        }
        this.transit({
            messageCategory: interface_1.MessageCategory.OUT,
            message: {
                messageId: options.relatedMessageId || this.generateMessageId(),
                workerId: this.getWorkerId(),
                type: interface_1.MessageType.Broadcast,
                body: data,
                messageOptions: options,
            },
        });
    }
    postMessage(message) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (this.isMain()) {
            if (this.workers.length > 0) {
                if (message.type === interface_1.MessageType.Broadcast) {
                    if (message.messageOptions &&
                        message.messageOptions['relatedWorkerId']) {
                        this.workers.forEach(w => {
                            if (message.messageOptions['includeSelfFromWorker'] === false &&
                                this.getWorkerId(w) ===
                                    message.messageOptions['relatedWorkerId']) {
                                return;
                            }
                            else {
                                this.mainSendMessage(w, message);
                            }
                        });
                    }
                    else {
                        this.workers.forEach(w => this.mainSendMessage(w, message));
                    }
                }
                else if ((_a = message.messageOptions) === null || _a === void 0 ? void 0 : _a['targetWorkerId']) {
                    const targetWorker = (_c = this.workerReady.get((_b = message.messageOptions) === null || _b === void 0 ? void 0 : _b['targetWorkerId'])) === null || _c === void 0 ? void 0 : _c.worker;
                    if (!targetWorker) {
                        throw new error_1.EventBusPublishSpecifyWorkerError((_d = message.messageOptions) === null || _d === void 0 ? void 0 : _d['targetWorkerId']);
                    }
                    this.mainSendMessage(targetWorker, message);
                }
                else {
                    if (this.options.dispatchStrategy) {
                        const selectedWorker = this.options.dispatchStrategy(this.workers, (_e = message.messageOptions) === null || _e === void 0 ? void 0 : _e.dispatchToken);
                        if (selectedWorker) {
                            try {
                                this.mainSendMessage(selectedWorker, message);
                            }
                            catch (err) {
                                (_f = this.eventListenerMap.get(interface_1.ListenerType.Error)) === null || _f === void 0 ? void 0 : _f(new error_1.EventBusMainPostError(message, err));
                            }
                        }
                        else {
                            throw new error_1.EventBusDispatchStrategyError();
                        }
                    }
                    else {
                        // round ring
                        const [worker, ...otherWorkers] = this.workers;
                        try {
                            this.mainSendMessage(worker, message);
                        }
                        catch (err) {
                            (_g = this.eventListenerMap.get(interface_1.ListenerType.Error)) === null || _g === void 0 ? void 0 : _g(new error_1.EventBusMainPostError(message, err));
                        }
                        this.workers = [...otherWorkers, worker];
                    }
                }
            }
        }
        else {
            try {
                this.workerSendMessage(message);
            }
            catch (err) {
                (_h = this.eventListenerMap.get(interface_1.ListenerType.Error)) === null || _h === void 0 ? void 0 : _h(new error_1.EventBusWorkerPostError(message, err));
            }
        }
    }
    onInited(listener) {
        this.eventListenerMap.set(interface_1.ListenerType.Inited, listener);
    }
    onPublish(listener) {
        this.eventListenerMap.set(interface_1.ListenerType.Request, listener);
    }
    onSubscribe(listener) {
        this.eventListenerMap.set(interface_1.ListenerType.Subscribe, listener);
    }
    onError(listener) {
        this.eventListenerMap.set(interface_1.ListenerType.Error, listener);
    }
    async stop() {
        this.stopping = true;
        this.workerReady.clear();
        this.eventListenerMap.clear();
        this.listener = null;
        this.workers.length = 0;
    }
    generateMessageId() {
        return Math.random().toString(36).substring(2);
    }
}
exports.AbstractEventBus = AbstractEventBus;
//# sourceMappingURL=base.js.map

/***/ }),

/***/ 9932:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ChildProcessEventBus = void 0;
const base_1 = __nccwpck_require__(5698);
const cluster = __nccwpck_require__(9907);
const process = __nccwpck_require__(932);
class ChildProcessEventBus extends base_1.AbstractEventBus {
    workerSubscribeMessage(subscribeMessageHandler) {
        process.on('message', subscribeMessageHandler);
    }
    workerListenMessage(worker, subscribeMessageHandler) {
        worker.on('message', subscribeMessageHandler);
    }
    workerSendMessage(message) {
        process.send(message);
    }
    mainSendMessage(worker, message) {
        worker.send(message);
    }
    isMain() {
        return !this.isWorker();
    }
    isWorker() {
        var _a;
        return (_a = this.options.isWorker) !== null && _a !== void 0 ? _a : cluster.isWorker;
    }
    getWorkerId(worker) {
        var _a;
        return String(worker ? (_a = worker.pid) !== null && _a !== void 0 ? _a : worker === null || worker === void 0 ? void 0 : worker['process'].pid : process.pid);
    }
}
exports.ChildProcessEventBus = ChildProcessEventBus;
//# sourceMappingURL=cp.js.map

/***/ }),

/***/ 4557:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EventBusDispatchStrategyError = exports.EventBusPublishSpecifyWorkerError = exports.EventBusWorkerPostError = exports.EventBusMainPostError = exports.EventBusTimeoutError = exports.EventBusPublishTimeoutError = void 0;
const util_1 = __nccwpck_require__(9023);
class EventBusPublishTimeoutError extends Error {
    constructor(messageId) {
        super(`Message(${messageId}) publish timeout.`);
        this.name = 'EventBusPublishTimeoutError';
    }
}
exports.EventBusPublishTimeoutError = EventBusPublishTimeoutError;
class EventBusTimeoutError extends Error {
    constructor() {
        super('Waiting for ready timeout throws this error.');
        this.name = 'EventBusTimeoutError';
    }
}
exports.EventBusTimeoutError = EventBusTimeoutError;
class EventBusMainPostError extends Error {
    constructor(message, err) {
        super((0, util_1.format)('Main thread post message [%j] error => %s.', message, err.stack));
        this.name = 'EventBusMainPostError';
    }
}
exports.EventBusMainPostError = EventBusMainPostError;
class EventBusWorkerPostError extends Error {
    constructor(message, err) {
        super((0, util_1.format)('Worker post message [%j] error => %j.', message, err.stack));
        this.name = 'EventBusWorkerPostError';
    }
}
exports.EventBusWorkerPostError = EventBusWorkerPostError;
class EventBusPublishSpecifyWorkerError extends Error {
    constructor(workerId) {
        super((0, util_1.format)('Worker(%s) not find in ready map, maybe it is a wrong pid.', workerId));
        this.name = 'EventBusPublishSpecifyWorkerError';
    }
}
exports.EventBusPublishSpecifyWorkerError = EventBusPublishSpecifyWorkerError;
class EventBusDispatchStrategyError extends Error {
    constructor() {
        super('Dispatch strategy not found a worker and stop post.');
        this.name = 'EventBusDispatchStrategyError';
    }
}
exports.EventBusDispatchStrategyError = EventBusDispatchStrategyError;
//# sourceMappingURL=error.js.map

/***/ }),

/***/ 6095:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__nccwpck_require__(9131), exports);
__exportStar(__nccwpck_require__(9932), exports);
__exportStar(__nccwpck_require__(220), exports);
__exportStar(__nccwpck_require__(4557), exports);
__exportStar(__nccwpck_require__(6452), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 6452:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MessageCategory = exports.ListenerType = exports.MessageType = void 0;
var MessageType;
(function (MessageType) {
    /**
     * worker => main
     */
    MessageType["Inited"] = "inited";
    /**
     * main => worker
     */
    MessageType["Request"] = "request";
    /**
     * worker => main
     */
    MessageType["Response"] = "response";
    /**
     * publish async: main => worker
     */
    MessageType["Invoke"] = "invoke";
    /**
     * broadcast to all workers, or except the specified worker
     */
    MessageType["Broadcast"] = "broadcast";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
var ListenerType;
(function (ListenerType) {
    ListenerType["Inited"] = "inited";
    ListenerType["Request"] = "request";
    ListenerType["Subscribe"] = "Subscribe";
    ListenerType["WorkerChanged"] = "worker_changed";
    ListenerType["Error"] = "error";
})(ListenerType = exports.ListenerType || (exports.ListenerType = {}));
var MessageCategory;
(function (MessageCategory) {
    MessageCategory["IN"] = "in";
    MessageCategory["OUT"] = "out";
})(MessageCategory = exports.MessageCategory || (exports.MessageCategory = {}));
//# sourceMappingURL=interface.js.map

/***/ }),

/***/ 220:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LocalEventBus = void 0;
const base_1 = __nccwpck_require__(5698);
class LocalDispatcher {
    constructor() {
        this.pidIdx = 0;
        this.initMessageQueue = [];
    }
    clear() {
        this.mainWorker = null;
        this.childWorker = null;
        this.pidIdx = 0;
    }
    generatePid() {
        return this.pidIdx++;
    }
}
const dispatcher = new LocalDispatcher();
class LocalWorker {
    constructor(pid) {
        this.pid = pid;
    }
    onMessage(handler) {
        this.handler = handler;
    }
    on() {
        // ignore exit event
    }
    getWorkerId() {
        return this.pid;
    }
    terminate() { }
}
class LocalEventBus extends base_1.AbstractEventBus {
    constructor(options = {}) {
        super(options);
        this.worker = new LocalWorker(dispatcher.generatePid());
        if (this.isMain()) {
            this.debugLogger(`Main id=${this.worker.getWorkerId()}`);
            dispatcher.mainWorker = this.worker;
        }
        else {
            this.debugLogger(`Child id=${this.worker.getWorkerId()}`);
            dispatcher.childWorker = this.worker;
        }
    }
    workerSubscribeMessage(subscribeMessageHandler) {
        if (this.isWorker()) {
            dispatcher.childWorker.onMessage(subscribeMessageHandler);
        }
    }
    workerListenMessage(worker, subscribeMessageHandler) {
        if (this.isMain()) {
            dispatcher.mainWorker.onMessage(subscribeMessageHandler);
        }
    }
    workerSendMessage(message) {
        // worker to main
        if (dispatcher.mainWorker.handler) {
            dispatcher.mainWorker.handler(message);
        }
        else {
            dispatcher.initMessageQueue.push({
                to: 'main',
                message,
            });
        }
    }
    mainSendMessage(worker, message) {
        // main to worker
        if (dispatcher.childWorker.handler) {
            dispatcher.childWorker.handler(message);
        }
        else {
            dispatcher.initMessageQueue.push({
                to: 'worker',
                message,
            });
        }
    }
    getWorkerId(worker) {
        return String((worker || this.worker).getWorkerId());
    }
    isMain() {
        return !this.isWorker();
    }
    isWorker() {
        return this.options.isWorker;
    }
    async start(err) {
        if (this.isMain()) {
            await (0, base_1.createWaitHandler)(() => dispatcher.childWorker != null, {
                timeout: this.options.waitWorkerTimeout,
                timeoutCheckInterval: this.options.waitWorkerCheckInterval || 200,
            });
            this.addWorker(dispatcher.childWorker);
            if (dispatcher.initMessageQueue.length) {
                dispatcher.initMessageQueue.forEach(({ to, message }) => {
                    if (to === 'worker') {
                        this.mainSendMessage(dispatcher.childWorker, message);
                    }
                    else {
                        this.workerSendMessage(message);
                    }
                });
                dispatcher.initMessageQueue = [];
            }
        }
        await super.start(err);
    }
    async stop() {
        dispatcher.clear();
        await super.stop();
    }
}
exports.LocalEventBus = LocalEventBus;
//# sourceMappingURL=local.js.map

/***/ }),

/***/ 9131:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ThreadEventBus = void 0;
const worker_threads_1 = __nccwpck_require__(8167);
const base_1 = __nccwpck_require__(5698);
class ThreadEventBus extends base_1.AbstractEventBus {
    constructor(options = {}) {
        super(options);
        if (!this.options.encoder) {
            this.options.encoder = message => {
                return message;
            };
        }
        if (!this.options.decoder) {
            this.options.decoder = serializedData => {
                return serializedData;
            };
        }
    }
    workerSubscribeMessage(subscribeMessageHandler) {
        worker_threads_1.parentPort.on('message', (serializedData) => {
            subscribeMessageHandler(this.options.decoder(serializedData));
        });
    }
    workerListenMessage(worker, subscribeMessageHandler) {
        worker.on('message', serializedData => {
            subscribeMessageHandler(this.options.decoder(serializedData));
        });
    }
    workerSendMessage(message) {
        worker_threads_1.parentPort.postMessage(this.options.encoder(message));
    }
    mainSendMessage(worker, message) {
        worker.postMessage(this.options.encoder(message));
    }
    isMain() {
        return !this.isWorker();
    }
    isWorker() {
        var _a;
        return (_a = this.options.isWorker) !== null && _a !== void 0 ? _a : !worker_threads_1.isMainThread;
    }
    getWorkerId(worker) {
        return String(worker ? worker.threadId : worker_threads_1.threadId);
    }
}
exports.ThreadEventBus = ThreadEventBus;
//# sourceMappingURL=thread.js.map

/***/ }),

/***/ 266:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.run = void 0;
const fs_1 = __nccwpck_require__(9896);
const path_1 = __nccwpck_require__(6928);
const pm = __nccwpck_require__(4006);
const util_1 = __nccwpck_require__(9023);
const os = __nccwpck_require__(857);
const log = (0, util_1.debuglog)('midway:glob');
function formatWindowsPath(paths) {
    if (os.platform() === 'win32' && paths) {
        return paths.map(p => p.split(path_1.sep).join(path_1.posix.sep));
    }
    return paths;
}
const run = (pattern, options = { cwd: process.cwd(), ignore: [] }) => {
    log(`midway glob pattern = ${pattern}, options = ${JSON.stringify(options)}`);
    const startTime = Date.now();
    const entryDir = options.cwd;
    pattern = formatWindowsPath(pattern) || [];
    log(`after format pattern = ${pattern}`);
    const isMatch = pm(pattern, {
        ignore: formatWindowsPath(options.ignore) || []
    });
    const ignoreMatch = pm('**', {
        ignore: formatWindowsPath(options.ignore) || []
    });
    function globDirectory(dirname, isMatch, ignoreDirMatch, options) {
        if (!(0, fs_1.existsSync)(dirname)) {
            return [];
        }
        const list = (0, fs_1.readdirSync)(dirname);
        const result = [];
        for (let file of list) {
            const resolvePath = (0, path_1.resolve)(dirname, file);
            log(`resolvePath = ${resolvePath}`);
            const fileStat = (0, fs_1.statSync)(resolvePath);
            if (fileStat.isDirectory() && ignoreDirMatch(resolvePath.replace(entryDir, ''))) {
                const childs = globDirectory(resolvePath, isMatch, ignoreDirMatch, options);
                result.push(...childs);
            }
            else if (fileStat.isFile() && isMatch(resolvePath.replace(entryDir, ''))) {
                result.push(resolvePath);
            }
        }
        return result;
    }
    const result = globDirectory(entryDir, isMatch, ignoreMatch, options);
    log(`midway glob timing ${Date.now() - startTime}ms`);
    return result;
};
exports.run = run;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkJBQXVEO0FBQ3ZELCtCQUEyQztBQUMzQyxnQ0FBZ0M7QUFDaEMsK0JBQWdDO0FBQ2hDLHlCQUF5QjtBQUV6QixNQUFNLEdBQUcsR0FBRyxJQUFBLGVBQVEsRUFBQyxhQUFhLENBQUMsQ0FBQztBQUVwQyxTQUFTLGlCQUFpQixDQUFDLEtBQWdCO0lBQ3pDLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRSxLQUFLLE9BQU8sSUFBSSxLQUFLLEVBQUU7UUFDdEMsT0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7S0FDckQ7SUFDRCxPQUFPLEtBQUssQ0FBQztBQUNmLENBQUM7QUFPTSxNQUFNLEdBQUcsR0FBRyxDQUFDLE9BQWlCLEVBQUUsVUFBc0IsRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFO0lBQ2pHLEdBQUcsQ0FBQyx5QkFBeUIsT0FBTyxlQUFlLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzlFLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUM3QixNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDO0lBQzdCLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDM0MsR0FBRyxDQUFDLDBCQUEwQixPQUFPLEVBQUUsQ0FBQyxDQUFDO0lBQ3pDLE1BQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQyxPQUFPLEVBQUU7UUFDMUIsTUFBTSxFQUFFLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFO0tBQ2hELENBQUMsQ0FBQztJQUNILE1BQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQUU7UUFDM0IsTUFBTSxFQUFFLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFO0tBQ2hELENBQUMsQ0FBQTtJQUVGLFNBQVMsYUFBYSxDQUFDLE9BQWUsRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLE9BQVE7UUFDdkUsSUFBSSxDQUFDLElBQUEsZUFBVSxFQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ3hCLE9BQU8sRUFBRSxDQUFDO1NBQ1g7UUFDRCxNQUFNLElBQUksR0FBRyxJQUFBLGdCQUFXLEVBQUMsT0FBTyxDQUFDLENBQUM7UUFDbEMsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBRWxCLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFO1lBQ3JCLE1BQU0sV0FBVyxHQUFHLElBQUEsY0FBTyxFQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMzQyxHQUFHLENBQUMsaUJBQWlCLFdBQVcsRUFBRSxDQUFDLENBQUM7WUFDcEMsTUFBTSxRQUFRLEdBQUcsSUFBQSxhQUFRLEVBQUMsV0FBVyxDQUFDLENBQUM7WUFDdkMsSUFBSSxRQUFRLENBQUMsV0FBVyxFQUFFLElBQUksY0FBYyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUU7Z0JBQy9FLE1BQU0sTUFBTSxHQUFHLGFBQWEsQ0FBQyxXQUFXLEVBQUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDNUUsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDO2FBQ3hCO2lCQUFNLElBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxJQUFJLE9BQU8sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFO2dCQUN6RSxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQzFCO1NBQ0Y7UUFFRCxPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDO0lBRUQsTUFBTSxNQUFNLEdBQUcsYUFBYSxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3RFLEdBQUcsQ0FBQyxzQkFBc0IsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLFNBQVMsSUFBSSxDQUFDLENBQUM7SUFDdEQsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQyxDQUFBO0FBdENZLFFBQUEsR0FBRyxPQXNDZiJ9

/***/ }),

/***/ 6645:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LEVEL = exports.DefaultLogLevels = void 0;
exports.DefaultLogLevels = {
    none: 0,
    error: 1,
    trace: 2,
    warn: 3,
    info: 4,
    verbose: 5,
    debug: 6,
    silly: 7,
    all: 8,
};
exports.LEVEL = {
    none: 'NONE',
    error: 'ERROR',
    trace: 'TRACE',
    warn: 'WARN',
    info: 'INFO',
    verbose: 'VERBOSE',
    debug: 'DEBUG',
    silly: 'SILLY',
    all: 'ALL',
};
//# sourceMappingURL=constants.js.map

/***/ }),

/***/ 7518:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LoggerFactory = void 0;
const logger_1 = __nccwpck_require__(558);
const util = __nccwpck_require__(9023);
const path_1 = __nccwpck_require__(6928);
const util_1 = __nccwpck_require__(505);
const debug = util.debuglog('midway:debug');
class LoggerFactory extends Map {
    constructor(factoryOptions = {}) {
        super();
        this.factoryOptions = factoryOptions;
    }
    createLogger(name, options) {
        if (!this.has(name)) {
            debug('[logger]: Create logger "%s" with options %j', name, options);
            const logger = new logger_1.MidwayLogger(Object.assign(options, this.factoryOptions));
            this.addLogger(name, logger);
            return logger;
        }
        return this.getLogger(name);
    }
    addLogger(name, logger, errorWhenReplace = true) {
        if (!errorWhenReplace || !this.has(name)) {
            // 同一个实例就不需要再添加了
            if (this.get(name) !== logger) {
                if (logger['onClose']) {
                    logger['onClose'](() => {
                        this.delete(name);
                    });
                }
                if (logger['on']) {
                    logger.on('close', () => this.delete(name));
                }
                this.set(name, logger);
            }
        }
        else {
            throw new Error(`logger id ${name} has duplicate`);
        }
        return this.get(name);
    }
    getLogger(name) {
        return this.get(name);
    }
    removeLogger(name) {
        const logger = this.get(name);
        logger === null || logger === void 0 ? void 0 : logger['close']();
        this.delete(name);
    }
    get(name) {
        return super.get(name);
    }
    /**
     * Closes a `Logger` instance with the specified `name` if it exists.
     * If no `name` is supplied then all Loggers are closed.
     * @param {?string} name - The id of the Logger instance to close.
     * @returns {undefined}
     */
    close(name) {
        if (name) {
            return this.removeLogger(name);
        }
        Array.from(this.keys()).forEach(key => this.removeLogger(key));
    }
    getDefaultMidwayLoggerConfig(appInfo) {
        var _a;
        const isDevelopment = (0, util_1.isDevelopmentEnvironment)(appInfo.env);
        const logRoot = (_a = process.env['MIDWAY_LOGGER_WRITEABLE_DIR']) !== null && _a !== void 0 ? _a : appInfo.root;
        if (!logRoot) {
            throw new Error('Midway Logger requires a root path during initialization, but it was provided empty. Please set it manually in the "logger.default.dir" configuration.');
        }
        return {
            midwayLogger: {
                default: {
                    fileLogName: 'midway-app.log',
                    errorLogName: 'common-error.log',
                    dir: (0, path_1.join)(logRoot, 'logs', appInfo.name),
                    auditFileDir: '.audit',
                    transports: {
                        console: isDevelopment
                            ? {
                                autoColors: isDevelopment,
                            }
                            : false,
                        file: {
                            bufferWrite: !isDevelopment,
                        },
                        error: {
                            bufferWrite: !isDevelopment,
                        },
                    },
                },
                clients: {
                    coreLogger: {
                        fileLogName: 'midway-core.log',
                    },
                    appLogger: {},
                },
            },
        };
    }
    createContextLogger(ctx, appLogger, options = {}) {
        return appLogger.createContextLogger(ctx, options);
    }
}
exports.LoggerFactory = LoggerFactory;
//# sourceMappingURL=factory.js.map

/***/ }),

/***/ 4416:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MidwayBaseLogger = exports.MidwayLoggerContainer = exports.createConsoleLogger = exports.createFileLogger = exports.createLogger = exports.clearAllLoggers = exports.loggers = void 0;
const factory_1 = __nccwpck_require__(7518);
const logger_1 = __nccwpck_require__(558);
__exportStar(__nccwpck_require__(6847), exports);
__exportStar(__nccwpck_require__(558), exports);
__exportStar(__nccwpck_require__(1003), exports);
__exportStar(__nccwpck_require__(3698), exports);
__exportStar(__nccwpck_require__(2795), exports);
__exportStar(__nccwpck_require__(4665), exports);
__exportStar(__nccwpck_require__(7518), exports);
__exportStar(__nccwpck_require__(505), exports);
exports.loggers = new factory_1.LoggerFactory();
const clearAllLoggers = () => {
    exports.loggers.close();
};
exports.clearAllLoggers = clearAllLoggers;
const createLogger = (name, options = {}) => {
    return exports.loggers.createLogger(name, options);
};
exports.createLogger = createLogger;
const createFileLogger = (name, options) => {
    return exports.loggers.createLogger(name, {
        transports: {
            file: {
                dir: __dirname,
                fileLogName: 'custom-logger.log',
                ...options,
            },
        },
    });
};
exports.createFileLogger = createFileLogger;
const createConsoleLogger = (name, options = {}) => {
    return exports.loggers.createLogger(name, {
        transports: {
            console: options,
        },
    });
};
exports.createConsoleLogger = createConsoleLogger;
/**
 * @deprecated
 */
exports.MidwayLoggerContainer = factory_1.LoggerFactory;
/**
 * @deprecated
 */
exports.MidwayBaseLogger = logger_1.MidwayLogger;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 6847:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=interface.js.map

/***/ }),

/***/ 558:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MidwayChildLogger = exports.MidwayContextLogger = exports.MidwayLogger = exports.TransportManager = void 0;
const util_1 = __nccwpck_require__(505);
const os_1 = __nccwpck_require__(857);
const transport_1 = __nccwpck_require__(1003);
const console_1 = __nccwpck_require__(2795);
const file_1 = __nccwpck_require__(3698);
exports.TransportManager = new Map();
exports.TransportManager.set('console', console_1.ConsoleTransport);
exports.TransportManager.set('file', file_1.FileTransport);
exports.TransportManager.set('error', file_1.ErrorTransport);
exports.TransportManager.set('json', file_1.JSONTransport);
class MidwayLogger {
    constructor(options = {}) {
        this.transports = new Map();
        this.closeHandlers = [];
        options = (0, util_1.formatLegacyLoggerOptions)(options);
        this.options = options;
        this.options.level = this.options.level || 'silly';
        this.options.eol = this.options.eol || os_1.EOL;
        if (this.options.transports) {
            for (const name in this.options.transports) {
                this.add(name, this.options.transports[name]);
            }
        }
    }
    get level() {
        return this.options.level;
    }
    set level(level) {
        this.options.level = level;
    }
    log(level, ...args) {
        this.transit(level, {}, ...args);
    }
    debug(...args) {
        this.transit('debug', {}, ...args);
    }
    info(...args) {
        this.transit('info', {}, ...args);
    }
    warn(...args) {
        this.transit('warn', {}, ...args);
    }
    error(...args) {
        this.transit('error', {}, ...args);
    }
    verbose(...args) {
        this.transit('verbose', {}, ...args);
    }
    write(...args) {
        this.transit(false, {}, ...args);
    }
    silly(...args) {
        this.transit('silly', {}, ...args);
    }
    add(name, transport) {
        if (transport) {
            let transportInstance;
            if (!(transport instanceof transport_1.Transport)) {
                if (!exports.TransportManager.has(name)) {
                    throw new Error(`Transport ${name} is not supported`);
                }
                else {
                    transportInstance = new (exports.TransportManager.get(name))(transport);
                }
            }
            else {
                transportInstance = transport;
            }
            transportInstance.setLoggerOptions(this.options);
            this.transports.set(name, transportInstance);
        }
    }
    get(name) {
        return this.transports.get(name);
    }
    remove(name, options = {}) {
        if (this.transports.has(name)) {
            if (options.close === undefined || options.close) {
                this.transports.get(name).close();
            }
            this.transports.delete(name);
        }
    }
    close() {
        // close all transports
        for (const name of this.transports.keys()) {
            this.remove(name, {
                close: true,
            });
        }
        for (const closeHandler of this.closeHandlers) {
            closeHandler();
        }
    }
    onClose(closeHandler) {
        this.closeHandlers.push(closeHandler);
    }
    createContextLogger(ctx, options = {}) {
        return new MidwayContextLogger(ctx, this, options);
    }
    transit(level, meta = {}, ...args) {
        // if level is not allowed, ignore
        if (level !== false && !(0, util_1.isEnableLevel)(level, this.level)) {
            return;
        }
        // transit to transport
        for (const transport of this.transports.values()) {
            transport.log(level, meta, ...args);
        }
    }
    getChild(meta = {}) {
        return new MidwayChildLogger(this, meta);
    }
}
exports.MidwayLogger = MidwayLogger;
class MidwayContextLogger {
    constructor(ctx, parentLogger, options = {}) {
        this.ctx = ctx;
        this.parentLogger = parentLogger;
        this.options = options;
    }
    debug(...args) {
        this.transit('debug', ...args);
    }
    info(...args) {
        this.transit('info', ...args);
    }
    warn(...args) {
        this.transit('warn', ...args);
    }
    error(...args) {
        this.transit('error', ...args);
    }
    verbose(...args) {
        this.transit('verbose', ...args);
    }
    write(...args) {
        this.transit(false, ...args);
    }
    transit(level, ...args) {
        this.parentLogger.transit(level, {
            ctx: this.ctx,
            contextFormat: this.options.contextFormat,
        }, ...args);
    }
    getContext() {
        return this.ctx;
    }
}
exports.MidwayContextLogger = MidwayContextLogger;
class MidwayChildLogger {
    constructor(parentLogger, meta = {}) {
        this.parentLogger = parentLogger;
        this.meta = meta;
    }
    debug(...args) {
        this.transit('debug', ...args);
    }
    info(...args) {
        this.transit('info', ...args);
    }
    warn(...args) {
        this.transit('warn', ...args);
    }
    error(...args) {
        this.transit('error', ...args);
    }
    verbose(...args) {
        this.transit('verbose', ...args);
    }
    write(...args) {
        this.transit(false, ...args);
    }
    transit(level, ...args) {
        this.parentLogger.transit(level, this.meta, ...args);
    }
}
exports.MidwayChildLogger = MidwayChildLogger;
//# sourceMappingURL=logger.js.map

/***/ }),

/***/ 2795:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ConsoleTransport = void 0;
const transport_1 = __nccwpck_require__(1003);
const util_1 = __nccwpck_require__(505);
const color_1 = __nccwpck_require__(6446);
const isTerminalSupportColor = color_1.supportsColor.stdout;
class ConsoleTransport extends transport_1.Transport {
    log(level, meta, ...args) {
        if (!(0, util_1.isEnableLevel)(level, this.options.level)) {
            return;
        }
        let msg = this.format(level, meta, args);
        if (process.env.FORCE_ENABLE_COLOR ||
            (this.options.autoColors && isTerminalSupportColor)) {
            const color = this.getColor(level);
            msg = (0, color_1.colorizeAll)(msg, color);
        }
        msg += this.options.eol;
        if (level === 'error') {
            process.stderr.write(msg);
        }
        else {
            process.stdout.write(msg);
        }
    }
    getColor(level) {
        switch (level) {
            case 'debug':
                return color_1.Color.blue;
            case 'info':
                return color_1.Color.green;
            case 'warn':
                return color_1.Color.yellow;
            case 'error':
                return color_1.Color.red;
            default:
                return color_1.Color.white;
        }
    }
    close() { }
}
exports.ConsoleTransport = ConsoleTransport;
//# sourceMappingURL=console.js.map

/***/ }),

/***/ 3698:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JSONTransport = exports.ErrorTransport = exports.FileTransport = void 0;
const transport_1 = __nccwpck_require__(1003);
const fileStreamRotator_1 = __nccwpck_require__(4665);
const path = __nccwpck_require__(6928);
const zlib = __nccwpck_require__(3106);
const fs = __nccwpck_require__(9896);
const util_1 = __nccwpck_require__(505);
const hash_1 = __nccwpck_require__(3929);
const safe_stable_stringify_1 = __nccwpck_require__(7467);
class FileTransport extends transport_1.Transport {
    constructor(options = {}) {
        super(options);
        this.options = options;
        this.bufSize = 0;
        this.buf = [];
        if (this.options.bufferWrite) {
            this.options.bufferMaxLength = this.options.bufferMaxLength || 1000;
            this.options.bufferFlushInterval =
                this.options.bufferFlushInterval || 1000;
            this.timer = this.createInterval();
        }
        if (!(0, util_1.isValidFileName)(this.options.fileLogName) ||
            !(0, util_1.isValidDirName)(this.options.dir)) {
            throw new Error('Your path or filename contain an invalid character.');
        }
        const defaultStreamOptions = {
            frequency: 'custom',
            dateFormat: 'YYYY-MM-DD',
            endStream: true,
            fileOptions: { flags: 'a' },
            utc: false,
            extension: '',
            createSymlink: !(0, util_1.isWin32)(), // windows 下不生成软链
            maxFiles: '7d',
            zippedArchive: false,
        };
        if (!this.options.auditFileDir) {
            options.auditFileDir = this.options.dir;
        }
        if (!path.isAbsolute(this.options.auditFileDir)) {
            options.auditFileDir = path.join(this.options.dir, options.auditFileDir);
        }
        this.logStream = fileStreamRotator_1.FileStreamRotatorManager.getStream({
            ...defaultStreamOptions,
            filename: path.join(this.options.dir, this.options.fileLogName),
            size: (0, util_1.getMaxSize)(this.options.maxSize || '200m'),
            symlinkName: this.options.fileLogName,
            auditFile: path.join(options.auditFileDir, '.' + (0, hash_1.hash)(this.options) + '-audit.json'),
            ...options,
        });
        this.logStream.on('logRemoved', params => {
            if (options.zippedArchive) {
                const gzName = params.name + '.gz';
                if (fs.existsSync(gzName)) {
                    try {
                        fs.unlinkSync(gzName);
                    }
                    catch (_err) {
                        // 尝试删除文件时可能会有些报错，比如权限问题，输出到 stderr 中
                        console.error(_err);
                    }
                    return;
                }
            }
        });
        if (options.zippedArchive) {
            this.logStream.on('rotate', oldFile => {
                const oldFileExist = fs.existsSync(oldFile);
                const gzExist = fs.existsSync(oldFile + '.gz');
                if (!oldFileExist || gzExist) {
                    return;
                }
                const gzip = zlib.createGzip();
                const inp = fs.createReadStream(oldFile);
                const out = fs.createWriteStream(oldFile + '.gz');
                inp
                    .pipe(gzip)
                    .pipe(out)
                    .on('finish', () => {
                    if (fs.existsSync(oldFile)) {
                        fs.unlinkSync(oldFile);
                    }
                });
            });
        }
    }
    log(level, meta, ...args) {
        if (!(0, util_1.isEnableLevel)(level, this.options.level)) {
            return;
        }
        let buf = this.format(level, meta, args);
        buf += this.options.eol;
        if (this.options.bufferWrite) {
            this.bufSize += buf.length;
            this.buf.push(buf);
            if (this.buf.length > this.options.bufferMaxLength) {
                this.flush();
            }
        }
        else {
            this.logStream.write(buf);
        }
    }
    /**
     * close stream
     */
    close() {
        if (this.options.bufferWrite) {
            if (this.buf && this.buf.length > 0) {
                this.flush();
            }
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
        }
        if (this.logStream) {
            fileStreamRotator_1.FileStreamRotatorManager.close(this.logStream);
            // 处理重复调用 close
            this.logStream = null;
        }
    }
    flush() {
        if (this.buf.length > 0 && this.writable) {
            this.logStream.write(this.buf.join(''));
            this.buf = [];
            this.bufSize = 0;
        }
    }
    /**
     * create interval to flush log into file
     */
    createInterval() {
        return setInterval(() => this.flush(), this.options.bufferFlushInterval);
    }
    get writable() {
        return this.logStream && this.logStream.canWrite();
    }
}
exports.FileTransport = FileTransport;
class ErrorTransport extends FileTransport {
    constructor(options) {
        options.level = 'error';
        super(options);
    }
}
exports.ErrorTransport = ErrorTransport;
class JSONTransport extends FileTransport {
    log(level, meta, ...args) {
        if (!(0, util_1.isEnableLevel)(level, this.options.level)) {
            return;
        }
        let buf = this.format(level, meta, args);
        if (typeof buf === 'string' || Buffer.isBuffer(buf)) {
            buf = (0, safe_stable_stringify_1.stringify)({
                message: buf.toString(),
            });
        }
        else {
            buf = (0, safe_stable_stringify_1.stringify)(buf);
        }
        buf += this.options.eol;
        if (this.options.bufferWrite) {
            this.bufSize += buf.length;
            this.buf.push(buf);
            if (this.buf.length > this.options.bufferMaxLength) {
                this.flush();
            }
        }
        else {
            this.logStream.write(buf);
        }
    }
}
exports.JSONTransport = JSONTransport;
//# sourceMappingURL=file.js.map

/***/ }),

/***/ 4665:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

// fork from https://github.com/rogerc/file-stream-rotator/blob/master/FileStreamRotator.js v0.5.7
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FileStreamRotatorManager = exports.FileStreamRotator = void 0;
const fs = __nccwpck_require__(9896);
const path = __nccwpck_require__(6928);
const crypto = __nccwpck_require__(6982);
const EventEmitter = __nccwpck_require__(4434);
const util_1 = __nccwpck_require__(9023);
const dayjs = __nccwpck_require__(3706);
const utc = __nccwpck_require__(5279);
const assert = __nccwpck_require__(2613);
const util_2 = __nccwpck_require__(505);
const debug = (0, util_1.debuglog)('midway-logger');
const staticFrequency = ['daily', 'test', 's', 'm', 'h', 'custom'];
const DATE_FORMAT = 'YYYYMMDDHHmm';
dayjs.extend(utc);
class FileStreamRotator {
    /**
     * Returns frequency metadata
     * @param frequency
     * @returns {*}
     */
    getFrequency(frequency) {
        const f = frequency.toLowerCase().match(/^(\d+)([smh])$/);
        if (f) {
            return (0, util_2.checkNumAndType)(f[2], parseInt(f[1]));
        }
        const dailyOrTest = (0, util_2.checkDailyAndTest)(frequency);
        if (dailyOrTest) {
            return dailyOrTest;
        }
        return false;
    }
    /**
     * Returns a number based on the option string
     * @param size
     * @returns {Number}
     */
    parseFileSize(size) {
        if (size && typeof size === 'string') {
            const _s = size.toLowerCase().match(/^((?:0\.)?\d+)([kmg])$/);
            if (_s) {
                switch (_s[2]) {
                    case 'k':
                        return _s[1] * 1024;
                    case 'm':
                        return _s[1] * 1024 * 1024;
                    case 'g':
                        return _s[1] * 1024 * 1024 * 1024;
                }
            }
        }
        return null;
    }
    /**
     * Returns date string for a given format / dateFormat
     * @param format
     * @param dateFormat
     * @param {boolean} utc
     * @returns {string}
     */
    getDate(format, dateFormat, utc) {
        dateFormat = dateFormat || DATE_FORMAT;
        const currentMoment = utc ? dayjs.utc() : dayjs().local();
        if (format && staticFrequency.indexOf(format.type) !== -1) {
            switch (format.type) {
                case 's':
                    /*eslint-disable-next-line no-case-declarations*/
                    const second = Math.floor(currentMoment.second() / format.digit) * format.digit;
                    return currentMoment.second(second).format(dateFormat);
                case 'm':
                    /*eslint-disable-next-line no-case-declarations*/
                    const minute = Math.floor(currentMoment.minute() / format.digit) * format.digit;
                    return currentMoment.minute(minute).format(dateFormat);
                case 'h':
                    /*eslint-disable-next-line no-case-declarations*/
                    const hour = Math.floor(currentMoment.hour() / format.digit) * format.digit;
                    return currentMoment.hour(hour).format(dateFormat);
                case 'daily':
                case 'custom':
                case 'test':
                    return currentMoment.format(dateFormat);
            }
        }
        return currentMoment.format(dateFormat);
    }
    /**
     * Read audit json object from disk or return new object or null
     * @param maxLogs
     * @param auditFile
     * @param log_file
     * @returns {Object} auditLogSettings
     * @property {Object} auditLogSettings.keep
     * @property {Boolean} auditLogSettings.keep.days
     * @property {Number} auditLogSettings.keep.amount
     * @property {String} auditLogSettings.auditLog
     * @property {Array} auditLogSettings.files
     */
    setAuditLog(maxLogs, auditFile, log_file) {
        let _rtn = null;
        if (maxLogs) {
            const use_days = maxLogs.toString().substr(-1);
            const _num = maxLogs.toString().match(/^(\d+)/);
            if (Number(_num[1]) > 0) {
                const baseLog = path.dirname(log_file.replace(/%DATE%.+/, '_filename'));
                try {
                    if (auditFile) {
                        const full_path = path.resolve(auditFile);
                        _rtn = JSON.parse(fs.readFileSync(full_path, { encoding: 'utf-8' }));
                    }
                    else {
                        const full_path = path.resolve(baseLog + '/' + '.audit.json');
                        _rtn = JSON.parse(fs.readFileSync(full_path, { encoding: 'utf-8' }));
                    }
                }
                catch (e) {
                    if (e.code !== 'ENOENT') {
                        return null;
                    }
                    _rtn = {
                        keep: {
                            days: false,
                            amount: Number(_num[1]),
                        },
                        auditLog: auditFile || baseLog + '/' + '.audit.json',
                        files: [],
                    };
                }
                _rtn.keep = {
                    days: use_days === 'd',
                    amount: Number(_num[1]),
                };
            }
        }
        return _rtn;
    }
    /**
     * Write audit json object to disk
     * @param {Object} audit
     * @param {Object} audit.keep
     * @param {Boolean} audit.keep.days
     * @param {Number} audit.keep.amount
     * @param {String} audit.auditLog
     * @param {Array} audit.files
     * @param {String} audit.hashType
     */
    writeAuditLog(audit) {
        try {
            (0, util_2.mkDirForFile)(audit.auditLog);
            fs.writeFileSync(audit.auditLog, JSON.stringify(audit, null, 2));
        }
        catch (e) {
            debug(new Date().toLocaleString(), '[FileStreamRotator] Failed to store log audit at:', audit.auditLog, 'Error:', e);
        }
    }
    /**
     * Write audit json object to disk
     * @param {String} logfile
     * @param {Object} audit
     * @param {Object} audit.keep
     * @param {Boolean} audit.keep.days
     * @param {Number} audit.keep.amount
     * @param {String} audit.auditLog
     * @param {String} audit.hashType
     * @param {Array} audit.files
     * @param {EventEmitter} stream
     */
    addLogToAudit(logfile, audit, stream) {
        if (audit && audit.files) {
            // Based on contribution by @nickbug - https://github.com/nickbug
            const index = audit.files.findIndex(file => {
                return file.name === logfile;
            });
            if (index !== -1) {
                // nothing to do as entry already exists.
                return audit;
            }
            const time = Date.now();
            audit.files.push({
                date: time,
                name: logfile,
                hash: crypto
                    .createHash(audit.hashType)
                    .update(logfile + 'LOG_FILE' + time)
                    .digest('hex'),
            });
            if (audit.keep.days) {
                const oldestDate = dayjs()
                    .subtract(audit.keep.amount, 'days')
                    .valueOf();
                audit.files = audit.files.filter(file => {
                    if (file.date > oldestDate) {
                        return true;
                    }
                    file.hashType = audit.hashType;
                    (0, util_2.removeFile)(file);
                    stream.emit('logRemoved', file);
                    return false;
                });
            }
            else {
                const filesToKeep = audit.files.splice(-audit.keep.amount);
                if (audit.files.length > 0) {
                    audit.files.filter(file => {
                        file.hashType = audit.hashType;
                        (0, util_2.removeFile)(file);
                        stream.emit('logRemoved', file);
                        return false;
                    });
                }
                audit.files = filesToKeep;
            }
            this.writeAuditLog(audit);
        }
        return audit;
    }
    /**
     *
     * @param options
     * @returns {Object} stream
     */
    getStream(options) {
        let frequencyMetaData = null;
        let curDate = null;
        assert(options.filename, 'options.filename must be supplied');
        if (options.frequency) {
            frequencyMetaData = this.getFrequency(options.frequency);
        }
        const auditLog = this.setAuditLog(options.maxFiles, options.auditFile, options.filename);
        if (auditLog != null) {
            auditLog.hashType =
                options.auditHashType !== undefined ? options.auditHashType : 'md5';
        }
        let fileSize = null;
        let fileCount = 0;
        let curSize = 0;
        if (options.size) {
            fileSize = this.parseFileSize(options.size);
        }
        let dateFormat = options.dateFormat || DATE_FORMAT;
        if (frequencyMetaData && frequencyMetaData.type === 'daily') {
            if (!options.dateFormat) {
                dateFormat = 'YYYY-MM-DD';
            }
            if (dayjs().format(dateFormat) !==
                dayjs().endOf('day').format(dateFormat) ||
                dayjs().format(dateFormat) === dayjs().add(1, 'day').format(dateFormat)) {
                debug(new Date().toLocaleString(), '[FileStreamRotator] Changing type to custom as date format changes more often than once a day or not every day');
                frequencyMetaData.type = 'custom';
            }
        }
        if (frequencyMetaData) {
            curDate = options.frequency
                ? this.getDate(frequencyMetaData, dateFormat, options.utc)
                : '';
        }
        options.createSymlink = options.createSymlink || false;
        options.extension = options.extension || '';
        const filename = options.filename;
        let oldFile = null;
        let logfile = filename + (curDate ? '.' + curDate : '');
        if (filename.match(/%DATE%/)) {
            logfile = filename.replace(/%DATE%/g, curDate ? curDate : this.getDate(null, dateFormat, options.utc));
        }
        if (fileSize) {
            // 下面应该是启动找到已经创建了的文件，做一些预先处理，比如找到最新的那个文件，方便写入
            let lastLogFile = null;
            let t_log = logfile;
            if (auditLog &&
                auditLog.files &&
                auditLog.files instanceof Array &&
                auditLog.files.length > 0) {
                const lastEntry = auditLog.files[auditLog.files.length - 1].name;
                if (lastEntry.match(t_log)) {
                    const lastCount = lastEntry.match(t_log + '\\.(\\d+)');
                    // Thanks for the PR contribution from @andrefarzat - https://github.com/andrefarzat
                    if (lastCount) {
                        t_log = lastEntry;
                        fileCount = lastCount[1];
                    }
                }
            }
            if (fileCount === 0 && t_log === logfile) {
                t_log += options.extension;
            }
            // 计数，找到数字最大的那个日志文件
            while (fs.existsSync(t_log)) {
                lastLogFile = t_log;
                fileCount++;
                t_log = logfile + '.' + fileCount + options.extension;
            }
            if (lastLogFile) {
                const lastLogFileStats = fs.statSync(lastLogFile);
                // 看看最新的那个日志有没有超过设置的大小
                if (lastLogFileStats.size < fileSize) {
                    // 没有超，把新文件退栈
                    t_log = lastLogFile;
                    fileCount--;
                    curSize = lastLogFileStats.size;
                }
            }
            logfile = t_log;
        }
        else {
            logfile += options.extension;
        }
        debug(new Date().toLocaleString(), '[FileStreamRotator] Logging to: ', logfile);
        // 循环创建目录和文件，类似 mkdirp
        (0, util_2.mkDirForFile)(logfile);
        const fileOptions = options.fileOptions || { flags: 'a' };
        // 创建文件流
        let rotateStream = fs.createWriteStream(logfile, fileOptions);
        if ((curDate &&
            frequencyMetaData &&
            staticFrequency.indexOf(frequencyMetaData.type) > -1) ||
            fileSize > 0) {
            debug(new Date().toLocaleString(), '[FileStreamRotator] Rotating file: ', frequencyMetaData ? frequencyMetaData.type : '', fileSize ? 'size: ' + fileSize : '');
            // 这里用了一个事件代理，方便代理的内容做处理
            const stream = new EventEmitter();
            stream.auditLog = auditLog;
            stream.filename = options.filename;
            stream.end = (...args) => {
                rotateStream.end(...args);
                resetCurLogSize.clear();
            };
            stream.canWrite = () => {
                return (!rotateStream.closed &&
                    rotateStream.writable &&
                    !rotateStream.destroyed);
            };
            (0, util_2.BubbleEvents)(rotateStream, stream);
            stream.on('new', newLog => {
                // 创建审计的日志，记录最新的日志文件，切割的记录等
                stream.auditLog = this.addLogToAudit(newLog, stream.auditLog, stream);
                // 创建软链
                if (options.createSymlink) {
                    (0, util_2.createCurrentSymLink)(newLog, options.symlinkName);
                }
            });
            // 这里采用 1s 的防抖，避免过于频繁的获取文件大小
            const resetCurLogSize = (0, util_2.debounce)(() => {
                let isCurLogRemoved = false;
                try {
                    const lastLogFileStats = fs.statSync(logfile);
                    if (lastLogFileStats.size > curSize) {
                        curSize = lastLogFileStats.size;
                    }
                }
                catch (err) {
                    isCurLogRemoved = true;
                }
                return isCurLogRemoved;
            }, 1000);
            stream.write = (str, encoding) => {
                const isCurLogRemoved = resetCurLogSize();
                const newDate = frequencyMetaData
                    ? this.getDate(frequencyMetaData, dateFormat, options.utc)
                    : curDate;
                if (isCurLogRemoved ||
                    (curDate && newDate !== curDate) ||
                    (fileSize && curSize > fileSize)) {
                    let newLogfile = filename + (curDate && frequencyMetaData ? '.' + newDate : '');
                    if (filename.match(/%DATE%/) && curDate) {
                        newLogfile = filename.replace(/%DATE%/g, newDate);
                    }
                    if (fileSize && curSize > fileSize) {
                        fileCount++;
                        newLogfile += '.' + fileCount + options.extension;
                    }
                    else {
                        // reset file count
                        fileCount = 0;
                        newLogfile += options.extension;
                    }
                    curSize = 0;
                    debug(new Date().toLocaleString(), (0, util_1.format)('[FileStreamRotator] Changing logs from %s to %s', logfile, newLogfile));
                    curDate = newDate;
                    oldFile = logfile;
                    logfile = newLogfile;
                    // Thanks to @mattberther https://github.com/mattberther for raising it again.
                    if (options.endStream === true) {
                        rotateStream.end();
                    }
                    else {
                        rotateStream.destroy();
                    }
                    (0, util_2.mkDirForFile)(logfile);
                    rotateStream = fs.createWriteStream(newLogfile, fileOptions);
                    stream.emit('new', newLogfile);
                    stream.emit('rotate', oldFile, newLogfile);
                    (0, util_2.BubbleEvents)(rotateStream, stream);
                }
                rotateStream.write(str, encoding);
                // Handle length of double-byte characters
                curSize += Buffer.byteLength(str, encoding);
            };
            process.nextTick(() => {
                stream.emit('new', logfile);
            });
            stream.emit('new', logfile);
            return stream;
        }
        else {
            debug(new Date().toLocaleString(), "[FileStreamRotator] File won't be rotated: ", options.frequency, options.size);
            process.nextTick(() => {
                rotateStream.emit('new', logfile);
            });
            return rotateStream;
        }
    }
}
exports.FileStreamRotator = FileStreamRotator;
class FileStreamRotatorManager {
    static getStream(options) {
        let stream;
        if (this.enabled) {
            // 以文件路径作为缓存
            if (!this.streamPool.has(options.filename)) {
                const stream = new FileStreamRotator().getStream(options);
                this.streamPool.set(options.filename, stream);
                this.loggerRef.set(stream, 0);
            }
            stream = this.streamPool.get(options.filename);
            let num = this.loggerRef.get(stream);
            this.loggerRef.set(stream, num++);
        }
        else {
            stream = new FileStreamRotator().getStream(options);
        }
        return stream;
    }
    static close(stream) {
        if (this.enabled) {
            if (this.loggerRef.has(stream)) {
                let num = this.loggerRef.get(stream);
                num--;
                if (num === 0) {
                    // close real stream and clean
                    stream.end();
                    this.streamPool.delete(stream.filename);
                    this.loggerRef.delete(stream);
                }
                else if (num > 0) {
                    // just set num
                    this.loggerRef.set(stream, num);
                }
                else {
                    // ignore
                }
            }
        }
        else {
            stream.end();
        }
    }
    static clear() {
        // clear streamPool
        for (const stream of this.streamPool.values()) {
            stream.end();
            if (this.loggerRef.has(stream)) {
                this.loggerRef.delete(stream);
            }
        }
        this.streamPool.clear();
        this.loggerRef = new WeakMap();
    }
}
exports.FileStreamRotatorManager = FileStreamRotatorManager;
FileStreamRotatorManager.streamPool = new Map();
FileStreamRotatorManager.loggerRef = new WeakMap();
FileStreamRotatorManager.enabled = true;
//# sourceMappingURL=fileStreamRotator.js.map

/***/ }),

/***/ 1003:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EmptyTransport = exports.Transport = void 0;
const util_1 = __nccwpck_require__(9023);
const util_2 = __nccwpck_require__(505);
const constants_1 = __nccwpck_require__(6645);
class Transport {
    constructor(options = {}) {
        this.options = options;
        this.pid = process.pid;
    }
    setLoggerOptions(options) {
        this.loggerOptions = options;
        this.options.level = this.options.level || options.level;
        this.options.format = this.options.format || options.format;
        this.options.contextFormat =
            this.options.contextFormat || options.contextFormat;
        this.options.eol = this.options.eol || options.eol;
    }
    format(level, meta, args) {
        const info = this.getLoggerInfo(level, meta, args);
        // support buffer
        if (Buffer.isBuffer(info.args[0])) {
            return info.args[0];
        }
        // for write and ignore format
        if (level === false) {
            return (0, util_1.format)(info.message);
        }
        const customContextFormat = meta.contextFormat || this.options.contextFormat;
        // for context logger
        if (meta.ctx && customContextFormat) {
            return customContextFormat(info);
        }
        const customFormat = meta.format || this.options.format;
        if (customFormat) {
            return customFormat(info);
        }
        if (level) {
            return (0, util_1.format)('%s %s %s %s', info.timestamp, info.LEVEL, info.pid, info.message);
        }
        else {
            return (0, util_1.format)(info.message);
        }
    }
    getLoggerInfo(level, meta, args) {
        const levelString = level || '';
        const info = {
            level: levelString,
            pid: this.pid,
        };
        Object.defineProperties(info, {
            timestamp: {
                get() {
                    return (0, util_2.getFormatDate)(new Date());
                },
                enumerable: false,
            },
            LEVEL: {
                get() {
                    return constants_1.LEVEL[levelString] || '';
                },
                enumerable: false,
            },
            args: {
                get() {
                    return args;
                },
                enumerable: false,
            },
            originArgs: {
                get() {
                    return args;
                },
                enumerable: false,
            },
            message: {
                get() {
                    return (0, util_1.format)(...args);
                },
                enumerable: false,
            },
            ctx: {
                get() {
                    return meta.ctx;
                },
                enumerable: false,
            },
            originError: {
                get() {
                    return args.find(arg => arg instanceof Error);
                },
                enumerable: false,
            },
            meta: {
                get() {
                    return meta;
                },
                enumerable: false,
            },
        });
        return info;
    }
    get level() {
        return this.options.level;
    }
    set level(level) {
        this.options.level = level;
    }
}
exports.Transport = Transport;
/**
 * @deprecated
 */
class EmptyTransport extends Transport {
    log(level, ...args) { }
    close() { }
}
exports.EmptyTransport = EmptyTransport;
//# sourceMappingURL=transport.js.map

/***/ }),

/***/ 6446:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.supportsColor = exports.colorizeAll = exports.colorize = exports.Color = void 0;
/**
 * easy ansi color for terminal
 */
const process_1 = __nccwpck_require__(932);
const os = __nccwpck_require__(857);
const tty = __nccwpck_require__(2018);
exports.Color = {
    red: str => `\x1B[31m${str}\x1B[39m`,
    green: str => `\x1B[32m${str}\x1B[39m`,
    yellow: str => `\x1B[33m${str}\x1B[39m`,
    blue: str => `\x1B[34m${str}\x1B[39m`,
    magenta: str => `\x1B[35m${str}\x1B[39m`,
    cyan: str => `\x1B[36m${str}\x1B[39m`,
    white: str => `\x1B[37m${str}\x1B[39m`,
    gray: str => `\x1B[90m${str}\x1B[39m`,
    grey: str => `\x1B[90m${str}\x1B[39m`,
    black: str => `\x1B[30m${str}\x1B[39m`,
    bgRed: str => `\x1B[41m${str}\x1B[49m`,
    bgGreen: str => `\x1B[42m${str}\x1B[49m`,
    bgYellow: str => `\x1B[43m${str}\x1B[49m`,
    bgBlue: str => `\x1B[44m${str}\x1B[49m`,
    bgMagenta: str => `\x1B[45m${str}\x1B[49m`,
    bgCyan: str => `\x1B[46m${str}\x1B[49m`,
    bgWhite: str => `\x1B[47m${str}\x1B[49m`,
    bgBlack: str => `\x1B[40m${str}\x1B[49m`,
    bold: str => `\x1B[1m${str}\x1B[22m`,
    dim: str => `\x1B[2m${str}\x1B[22m`,
    italic: str => `\x1B[3m${str}\x1B[23m`,
    underline: str => `\x1B[4m${str}\x1B[24m`,
    inverse: str => `\x1B[7m${str}\x1B[27m`,
    hidden: str => `\x1B[8m${str}\x1B[28m`,
    strikethrough: str => `\x1B[9m${str}\x1B[29m`,
};
const colorize = (str, color) => {
    if (typeof color === 'function') {
        return color(str);
    }
    else {
        return exports.Color[color](str);
    }
};
exports.colorize = colorize;
const colorizeAll = (str, color) => {
    return str.replace(/([^\s]+)/g, str => {
        return (0, exports.colorize)(str, color);
    });
};
exports.colorizeAll = colorizeAll;
function hasFlag(flag, argv = process.argv) {
    const prefix = flag.startsWith('-') ? '' : flag.length === 1 ? '-' : '--';
    const position = argv.indexOf(prefix + flag);
    const terminatorPosition = argv.indexOf('--');
    return (position !== -1 &&
        (terminatorPosition === -1 || position < terminatorPosition));
}
let flagForceColor;
if (hasFlag('no-color') ||
    hasFlag('no-colors') ||
    hasFlag('color=false') ||
    hasFlag('color=never')) {
    flagForceColor = 0;
}
else if (hasFlag('color') ||
    hasFlag('colors') ||
    hasFlag('color=true') ||
    hasFlag('color=always')) {
    flagForceColor = 1;
}
function envForceColor() {
    if ('FORCE_COLOR' in process_1.env) {
        if (process_1.env.FORCE_COLOR === 'true') {
            return 1;
        }
        if (process_1.env.FORCE_COLOR === 'false') {
            return 0;
        }
        return process_1.env.FORCE_COLOR.length === 0
            ? 1
            : Math.min(Number.parseInt(process_1.env.FORCE_COLOR, 10), 3);
    }
}
function translateLevel(level) {
    if (level === 0) {
        return false;
    }
    return {
        level,
        hasBasic: true,
        has256: level >= 2,
        has16m: level >= 3,
    };
}
function _supportsColor(haveStream, options) {
    const streamIsTTY = options.streamIsTTY;
    const sniffFlags = true;
    const noFlagForceColor = envForceColor();
    if (noFlagForceColor !== undefined) {
        flagForceColor = noFlagForceColor;
    }
    const forceColor = sniffFlags ? flagForceColor : noFlagForceColor;
    if (forceColor === 0) {
        return 0;
    }
    if (sniffFlags) {
        if (hasFlag('color=16m') ||
            hasFlag('color=full') ||
            hasFlag('color=truecolor')) {
            return 3;
        }
        if (hasFlag('color=256')) {
            return 2;
        }
    }
    // Check for Azure DevOps pipelines.
    // Has to be above the `!streamIsTTY` check.
    if ('TF_BUILD' in process_1.env && 'AGENT_NAME' in process_1.env) {
        return 1;
    }
    if (haveStream && !streamIsTTY && forceColor === undefined) {
        return 0;
    }
    const min = forceColor || 0;
    if (process_1.env.TERM === 'dumb') {
        return min;
    }
    if (process_1.platform === 'win32') {
        // Windows 10 build 10586 is the first Windows release that supports 256 colors.
        // Windows 10 build 14931 is the first release that supports 16m/TrueColor.
        const osRelease = os.release().split('.');
        if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
            return Number(osRelease[2]) >= 14931 ? 3 : 2;
        }
        return 1;
    }
    if ('CI' in process_1.env) {
        if ('GITHUB_ACTIONS' in process_1.env || 'GITEA_ACTIONS' in process_1.env) {
            return 3;
        }
        if ([
            'TRAVIS',
            'CIRCLECI',
            'APPVEYOR',
            'GITLAB_CI',
            'BUILDKITE',
            'DRONE',
        ].some(sign => sign in process_1.env) ||
            process_1.env.CI_NAME === 'codeship') {
            return 1;
        }
        return min;
    }
    if ('TEAMCITY_VERSION' in process_1.env) {
        return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(process_1.env.TEAMCITY_VERSION) ? 1 : 0;
    }
    if (process_1.env.COLORTERM === 'truecolor') {
        return 3;
    }
    if (process_1.env.TERM === 'xterm-kitty') {
        return 3;
    }
    if ('TERM_PROGRAM' in process_1.env) {
        const version = Number.parseInt((process_1.env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);
        switch (process_1.env.TERM_PROGRAM) {
            case 'iTerm.app': {
                return version >= 3 ? 3 : 2;
            }
            case 'Apple_Terminal': {
                return 2;
            }
            // No default
        }
    }
    if (/-256(color)?$/i.test(process_1.env.TERM)) {
        return 2;
    }
    if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(process_1.env.TERM)) {
        return 1;
    }
    if ('COLORTERM' in process_1.env) {
        return 1;
    }
    return min;
}
function createSupportsColor(options) {
    const level = _supportsColor(true, {
        streamIsTTY: options.isTTY,
    });
    return translateLevel(level);
}
// from https://github.com/chalk/supports-color/blob/v9.4.0/index.js
exports.supportsColor = {
    stdout: createSupportsColor({ isTTY: tty.isatty(1) }),
    stderr: createSupportsColor({ isTTY: tty.isatty(2) }),
};
//# sourceMappingURL=color.js.map

/***/ }),

/***/ 3929:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.hash = void 0;
const crypto = __nccwpck_require__(6982);
const stream_1 = __nccwpck_require__(2203);
function hash(object) {
    const options = {
        algorithm: 'sha1',
        encoding: 'hex',
        excludeValues: false,
        ignoreUnknown: false,
        respectType: true,
        respectFunctionNames: true,
        respectFunctionProperties: true,
        unorderedArrays: false,
        unorderedSets: true,
        unorderedObjects: true,
        replacer: undefined,
        excludeKeys: undefined,
    };
    const hashingStream = crypto.createHash(options.algorithm);
    const hasher = typeHasher(options, hashingStream);
    hasher.dispatch(object);
    if (!hashingStream.update) {
        hashingStream.end('');
    }
    return hashingStream.digest(options.encoding);
}
exports.hash = hash;
function typeHasher(options, writeTo, context) {
    context = context || [];
    const write = function (str) {
        if (writeTo.update) {
            return writeTo.update(str, 'utf8');
        }
        else {
            return writeTo.write(str, 'utf8');
        }
    };
    return {
        dispatch: function (value) {
            if (options.replacer) {
                value = options.replacer(value);
            }
            let type = typeof value;
            if (value === null) {
                type = 'null';
            }
            //console.log("[DEBUG] Dispatch: ", value, "->", type, " -> ", "_" + type);
            return this['_' + type](value);
        },
        _object: function (object) {
            const pattern = /\[object (.*)\]/i;
            const objString = Object.prototype.toString.call(object);
            let objType = pattern.exec(objString);
            if (!objType) {
                // object type did not match [object ...]
                objType = 'unknown:[' + objString + ']';
            }
            else {
                objType = objType[1]; // take only the class name
            }
            objType = objType.toLowerCase();
            let objectNumber = null;
            if ((objectNumber = context.indexOf(object)) >= 0) {
                return this.dispatch('[CIRCULAR:' + objectNumber + ']');
            }
            else {
                context.push(object);
            }
            if (typeof Buffer !== 'undefined' &&
                Buffer.isBuffer &&
                Buffer.isBuffer(object)) {
                write('buffer:');
                return write(object);
            }
            if (objType !== 'object' &&
                objType !== 'function' &&
                objType !== 'asyncfunction') {
                if (this['_' + objType]) {
                    this['_' + objType](object);
                }
                else if (options.ignoreUnknown) {
                    return write('[' + objType + ']');
                }
                else {
                    throw new Error('Unknown object type "' + objType + '"');
                }
            }
            else {
                let keys = Object.keys(object);
                if (options.unorderedObjects) {
                    keys = keys.sort();
                }
                // Make sure to incorporate special properties, so
                // Types with different prototypes will produce
                // a different hash and objects derived from
                // different functions (`new Foo`, `new Bar`) will
                // produce different hashes.
                // We never do this for native functions since some
                // seem to break because of that.
                if (options.respectType !== false && !isNativeFunction(object)) {
                    keys.splice(0, 0, 'prototype', '__proto__', 'constructor');
                }
                if (options.excludeKeys) {
                    keys = keys.filter(key => {
                        return !options.excludeKeys(key);
                    });
                }
                write('object:' + keys.length + ':');
                // eslint-disable-next-line @typescript-eslint/no-this-alias
                const self = this;
                return keys.forEach(key => {
                    self.dispatch(key);
                    write(':');
                    if (!options.excludeValues) {
                        self.dispatch(object[key]);
                    }
                    write(',');
                });
            }
        },
        _array: function (arr, unordered) {
            unordered =
                typeof unordered !== 'undefined'
                    ? unordered
                    : options.unorderedArrays !== false; // default to options.unorderedArrays
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const self = this;
            write('array:' + arr.length + ':');
            if (!unordered || arr.length <= 1) {
                return arr.forEach(entry => {
                    return self.dispatch(entry);
                });
            }
            // the unordered case is a little more complicated:
            // since there is no canonical ordering on objects,
            // i.e. {a:1} < {a:2} and {a:1} > {a:2} are both false,
            // we first serialize each entry using a PassThrough stream
            // before sorting.
            // also: we can’t use the same context array for all entries
            // since the order of hashing should *not* matter. instead,
            // we keep track of the additions to a copy of the context array
            // and add all of them to the global context array when we’re done
            let contextAdditions = [];
            const entries = arr.map(entry => {
                const strm = new stream_1.PassThrough();
                const localContext = context.slice(); // make copy
                const hasher = typeHasher(options, strm, localContext);
                hasher.dispatch(entry);
                // take only what was added to localContext and append it to contextAdditions
                contextAdditions = contextAdditions.concat(localContext.slice(context.length));
                return strm.read().toString();
            });
            context = context.concat(contextAdditions);
            entries.sort();
            return this._array(entries, false);
        },
        _date: function (date) {
            return write('date:' + date.toJSON());
        },
        _symbol: function (sym) {
            return write('symbol:' + sym.toString());
        },
        _error: function (err) {
            return write('error:' + err.toString());
        },
        _boolean: function (bool) {
            return write('bool:' + bool.toString());
        },
        _string: function (string) {
            write('string:' + string.length + ':');
            write(string.toString());
        },
        _function: function (fn) {
            write('fn:');
            if (isNativeFunction(fn)) {
                this.dispatch('[native]');
            }
            else {
                this.dispatch(fn.toString());
            }
            if (options.respectFunctionNames !== false) {
                // Make sure we can still distinguish native functions
                // by their name, otherwise String and Function will
                // have the same hash
                this.dispatch('function-name:' + String(fn.name));
            }
            if (options.respectFunctionProperties) {
                this._object(fn);
            }
        },
        _number: function (number) {
            return write('number:' + number.toString());
        },
        _xml: function (xml) {
            return write('xml:' + xml.toString());
        },
        _null: function () {
            return write('Null');
        },
        _undefined: function () {
            return write('Undefined');
        },
        _regexp: function (regex) {
            return write('regex:' + regex.toString());
        },
        _uint8array: function (arr) {
            write('uint8array:');
            return this.dispatch(Array.prototype.slice.call(arr));
        },
        _uint8clampedarray: function (arr) {
            write('uint8clampedarray:');
            return this.dispatch(Array.prototype.slice.call(arr));
        },
        _int8array: function (arr) {
            write('int8array:');
            return this.dispatch(Array.prototype.slice.call(arr));
        },
        _uint16array: function (arr) {
            write('uint16array:');
            return this.dispatch(Array.prototype.slice.call(arr));
        },
        _int16array: function (arr) {
            write('int16array:');
            return this.dispatch(Array.prototype.slice.call(arr));
        },
        _uint32array: function (arr) {
            write('uint32array:');
            return this.dispatch(Array.prototype.slice.call(arr));
        },
        _int32array: function (arr) {
            write('int32array:');
            return this.dispatch(Array.prototype.slice.call(arr));
        },
        _float32array: function (arr) {
            write('float32array:');
            return this.dispatch(Array.prototype.slice.call(arr));
        },
        _float64array: function (arr) {
            write('float64array:');
            return this.dispatch(Array.prototype.slice.call(arr));
        },
        _arraybuffer: function (arr) {
            write('arraybuffer:');
            return this.dispatch(new Uint8Array(arr));
        },
        _url: function (url) {
            return write('url:' + url.toString());
        },
        _map: function (map) {
            write('map:');
            const arr = Array.from(map);
            return this._array(arr, options.unorderedSets !== false);
        },
        _set: function (set) {
            write('set:');
            const arr = Array.from(set);
            return this._array(arr, options.unorderedSets !== false);
        },
        _file: function (file) {
            write('file:');
            return this.dispatch([file.name, file.size, file.type, file.lastModfied]);
        },
        _blob: function () {
            if (options.ignoreUnknown) {
                return write('[blob]');
            }
            throw Error('Hashing Blob objects is currently not supported\n' +
                '(see https://github.com/puleos/object-hash/issues/26)\n' +
                'Use "options.replacer" or "options.ignoreUnknown"\n');
        },
        _domwindow: function () {
            return write('domwindow');
        },
        _bigint: function (number) {
            return write('bigint:' + number.toString());
        },
        /* Node.js standard native objects */
        _process: function () {
            return write('process');
        },
        _timer: function () {
            return write('timer');
        },
        _pipe: function () {
            return write('pipe');
        },
        _tcp: function () {
            return write('tcp');
        },
        _udp: function () {
            return write('udp');
        },
        _tty: function () {
            return write('tty');
        },
        _statwatcher: function () {
            return write('statwatcher');
        },
        _securecontext: function () {
            return write('securecontext');
        },
        _connection: function () {
            return write('connection');
        },
        _zlib: function () {
            return write('zlib');
        },
        _context: function () {
            return write('context');
        },
        _nodescript: function () {
            return write('nodescript');
        },
        _httpparser: function () {
            return write('httpparser');
        },
        _dataview: function () {
            return write('dataview');
        },
        _signal: function () {
            return write('signal');
        },
        _fsevent: function () {
            return write('fsevent');
        },
        _tlswrap: function () {
            return write('tlswrap');
        },
    };
}
/** Check if the given function is a native function */
function isNativeFunction(f) {
    if (typeof f !== 'function') {
        return false;
    }
    const exp = /^function\s+\w*\s*\(\s*\)\s*{\s+\[native code\]\s+}$/i;
    return exp.exec(Function.prototype.toString.call(f)) != null;
}
//# sourceMappingURL=hash.js.map

/***/ }),

/***/ 505:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getFormatDate = exports.isWin32 = exports.BubbleEvents = exports.formatLegacyLoggerOptions = exports.formatLoggerOptions = exports.isDevelopmentEnvironment = exports.debounce = exports.throwIf = exports.getMaxSize = exports.isValidDirName = exports.isValidFileName = exports.removeFile = exports.createCurrentSymLink = exports.mkDirForFile = exports.checkDailyAndTest = exports.checkNumAndType = exports.isEnableLevel = void 0;
const constants_1 = __nccwpck_require__(6645);
const fs = __nccwpck_require__(9896);
const path_1 = __nccwpck_require__(6928);
const crypto = __nccwpck_require__(6982);
const path = __nccwpck_require__(6928);
const os = __nccwpck_require__(857);
const transport_1 = __nccwpck_require__(1003);
function isEnableLevel(inputLevel, baseLevel) {
    if (!inputLevel || !baseLevel) {
        return true;
    }
    return constants_1.DefaultLogLevels[inputLevel] <= constants_1.DefaultLogLevels[baseLevel];
}
exports.isEnableLevel = isEnableLevel;
/**
 * Returns frequency metadata for minute/hour rotation
 * @param type
 * @param num
 * @returns {*}
 * @private
 */
function checkNumAndType(type, num) {
    if (typeof num === 'number') {
        switch (type) {
            case 's':
            case 'm':
                if (num < 0 || num > 60) {
                    return false;
                }
                break;
            case 'h':
                if (num < 0 || num > 24) {
                    return false;
                }
                break;
        }
        return { type: type, digit: num };
    }
}
exports.checkNumAndType = checkNumAndType;
/**
 * Returns frequency metadata for defined frequency
 * @param freqType
 * @returns {*}
 * @private
 */
function checkDailyAndTest(freqType) {
    switch (freqType) {
        case 'custom':
        case 'daily':
            return { type: freqType, digit: undefined };
        case 'test':
            return { type: freqType, digit: 0 };
    }
    return false;
}
exports.checkDailyAndTest = checkDailyAndTest;
/**
 * Check and make parent directory
 * @param pathWithFile
 */
function mkDirForFile(pathWithFile) {
    const _path = path.dirname(pathWithFile);
    _path.split(path.sep).reduce((fullPath, folder) => {
        fullPath += folder + path.sep;
        if (!fs.existsSync(fullPath)) {
            try {
                fs.mkdirSync(fullPath);
            }
            catch (e) {
                if (e.code !== 'EEXIST') {
                    throw e;
                }
            }
        }
        return fullPath;
    }, '');
}
exports.mkDirForFile = mkDirForFile;
/**
 * Create symbolic link to current log file
 * @param {String} logfile
 * @param {String} name Name to use for symbolic link
 */
function createCurrentSymLink(logfile, name) {
    const symLinkName = name || 'current.log';
    const logPath = (0, path_1.dirname)(logfile);
    const logfileName = (0, path_1.basename)(logfile);
    const current = logPath + '/' + symLinkName;
    try {
        const stats = fs.lstatSync(current);
        if (stats.isSymbolicLink()) {
            fs.unlinkSync(current);
            fs.symlinkSync(logfileName, current);
        }
    }
    catch (err) {
        if (err && err.code === 'ENOENT') {
            try {
                fs.symlinkSync(logfileName, current);
            }
            catch (e) {
                console.error(new Date().toLocaleString(), '[FileStreamRotator] Could not create symlink file: ', current, ' -> ', logfileName);
            }
        }
    }
}
exports.createCurrentSymLink = createCurrentSymLink;
/**
 * Removes old log file
 * @param file
 * @param file.hash
 * @param file.name
 * @param file.date
 * @param file.hashType
 */
function removeFile(file) {
    if (file.hash ===
        crypto
            .createHash(file.hashType)
            .update(file.name + 'LOG_FILE' + file.date)
            .digest('hex')) {
        try {
            if (fs.existsSync(file.name)) {
                fs.unlinkSync(file.name);
            }
        }
        catch (e) {
            console.error(new Date().toLocaleString(), '[FileStreamRotator] Could not remove old log file: ', file.name);
        }
    }
}
exports.removeFile = removeFile;
function isValidFileName(filename) {
    // eslint-disable-next-line no-control-regex
    return !/["<>|:*?\\/\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f]/g.test(filename);
}
exports.isValidFileName = isValidFileName;
function isValidDirName(dirname) {
    // eslint-disable-next-line no-control-regex
    return !/["<>|\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f]/g.test(dirname);
}
exports.isValidDirName = isValidDirName;
function getMaxSize(size) {
    if (size && typeof size === 'string') {
        const _s = size.toLowerCase().match(/^((?:0\.)?\d+)([k|m|g])$/);
        if (_s) {
            return size;
        }
    }
    else if (size && Number.isInteger(size)) {
        const sizeK = Math.round(size / 1024);
        return sizeK === 0 ? '1k' : sizeK + 'k';
    }
    return null;
}
exports.getMaxSize = getMaxSize;
function throwIf(options, ...args) {
    Array.prototype.slice.call(args, 1).forEach(name => {
        if (options[name]) {
            throw new Error('Cannot set ' + name + ' and ' + args[0] + ' together');
        }
    });
}
exports.throwIf = throwIf;
function debounce(func, wait, immediate) {
    let timeout, args, context, timestamp, result;
    if (null == wait)
        wait = 100;
    function later() {
        const last = Date.now() - timestamp;
        if (last < wait && last >= 0) {
            timeout = setTimeout(later, wait - last);
        }
        else {
            timeout = null;
            if (!immediate) {
                result = func.apply(context, args);
                context = args = null;
            }
        }
    }
    const debounced = (...args) => {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        context = this;
        timestamp = Date.now();
        const callNow = immediate && !timeout;
        if (!timeout)
            timeout = setTimeout(later, wait);
        if (callNow) {
            result = func.apply(context, args);
            context = args = null;
        }
        return result;
    };
    debounced.clear = () => {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
    };
    debounced.flush = () => {
        if (timeout) {
            result = func.apply(context, args);
            context = args = null;
            clearTimeout(timeout);
            timeout = null;
        }
    };
    return debounced;
}
exports.debounce = debounce;
const isDevelopmentEnvironment = env => {
    return ['local', 'test', 'unittest'].includes(env);
};
exports.isDevelopmentEnvironment = isDevelopmentEnvironment;
const oldEnableOptionsKeys = {
    enableConsole: true,
    disableConsole: true,
    enableFile: true,
    enableError: true,
    enableJSON: true,
    disableFile: true,
    disableError: true,
};
/**
 * 仅兼容老的 enableXXX 配置，这部分配置无法对应到新的配置
 * @param unknownLoggerOptions
 */
function formatLoggerOptions(unknownLoggerOptions) {
    // 如果包含任意一个老的配置，则需要转换成新的配置
    if (Object.keys(unknownLoggerOptions).some(key => oldEnableOptionsKeys[key])) {
        const newOptions = { transports: {} };
        for (const key of Object.keys(unknownLoggerOptions)) {
            if (!oldEnableOptionsKeys[key]) {
                // 新值直接覆盖，即使值存在
                newOptions[key] = unknownLoggerOptions[key];
            }
        }
        if (newOptions.transports['console'] &&
            (unknownLoggerOptions['enableConsole'] === false ||
                unknownLoggerOptions['disableConsole'] === true)) {
            newOptions.transports['console'] = false;
        }
        if (newOptions.transports['file'] &&
            (unknownLoggerOptions['enableFile'] === false ||
                unknownLoggerOptions['disableFile'] === true)) {
            newOptions.transports['file'] = false;
        }
        if (newOptions.transports['error'] &&
            (unknownLoggerOptions['enableError'] === false ||
                unknownLoggerOptions['disableError'] === true)) {
            newOptions.transports['error'] = false;
        }
        if (newOptions.transports['json'] &&
            unknownLoggerOptions['enableJSON'] === false) {
            newOptions.transports['json'] = false;
        }
        return newOptions;
    }
    return unknownLoggerOptions;
}
exports.formatLoggerOptions = formatLoggerOptions;
/**
 * 老的配置项映射到新的配置项
 * 格式：key: [transport分类，映射的key，不存在时的默认key]
 */
const legacyOptionsKeys = {
    level: {
        category: 'top',
        mappingKey: 'level',
        isOld: false,
    },
    consoleLevel: {
        category: 'console',
        mappingKey: 'level',
        isOld: true,
    },
    fileLevel: {
        category: 'file',
        mappingKey: 'level',
        isOld: true,
    },
    jsonLevel: {
        category: 'json',
        mappingKey: 'level',
        isOld: true,
    },
    format: {
        category: 'top',
        mappingKey: 'format',
        isOld: false,
    },
    contextFormat: {
        category: 'top',
        mappingKey: 'contextFormat',
        isOld: false,
    },
    jsonFormat: {
        category: 'json',
        mappingKey: 'format',
        isOld: true,
    },
    dir: {
        category: ['file', 'error', 'json'],
        mappingKey: 'dir',
        isOld: true,
    },
    errorDir: {
        category: 'error',
        mappingKey: 'dir',
        overwriteIfExists: true,
        isOld: true,
    },
    jsonDir: {
        category: 'json',
        mappingKey: 'dir',
        overwriteIfExists: true,
        isOld: true,
    },
    aliasName: {
        ignore: true,
        isOld: false,
    },
    fileLogName: {
        category: ['file'],
        mappingKey: 'fileLogName',
        isOld: true,
    },
    errorLogName: {
        category: 'error',
        mappingKey: 'fileLogName',
        overwriteIfExists: true,
        isOld: true,
    },
    jsonLogName: {
        category: 'json',
        mappingKey: 'fileLogName',
        overwriteIfExists: true,
        isOld: true,
    },
    enableConsole: {
        ignore: true,
        isOld: true,
    },
    enableFile: {
        ignore: true,
        isOld: true,
    },
    enableError: {
        ignore: true,
        isOld: true,
    },
    enableJSON: {
        ignore: true,
        isOld: true,
    },
    disableSymlink: {
        category: ['file', 'error', 'json'],
        mappingKey: 'createSymlink',
        isOld: true,
    },
    disableFileSymlink: {
        category: 'file',
        mappingKey: 'createSymlink',
        reverseValue: true,
        overwriteIfExists: true,
        isOld: true,
    },
    disableErrorSymlink: {
        category: 'error',
        mappingKey: 'createSymlink',
        reverseValue: true,
        overwriteIfExists: true,
        isOld: true,
    },
    disableJSONSymlink: {
        category: 'json',
        mappingKey: 'createSymlink',
        reverseValue: true,
        overwriteIfExists: true,
        isOld: true,
    },
    maxSize: {
        category: ['file', 'error', 'json'],
        mappingKey: 'maxSize',
        isOld: true,
    },
    fileMaxSize: {
        category: 'file',
        mappingKey: 'maxSize',
        overwriteIfExists: true,
        isOld: true,
    },
    errMaxSize: {
        category: 'error',
        mappingKey: 'maxSize',
        overwriteIfExists: true,
        isOld: true,
    },
    jsonMaxSize: {
        category: 'json',
        mappingKey: 'maxSize',
        overwriteIfExists: true,
        isOld: true,
    },
    maxFiles: {
        category: ['file', 'error', 'json'],
        mappingKey: 'maxFiles',
        isOld: true,
    },
    fileMaxFiles: {
        category: 'file',
        mappingKey: 'maxFiles',
        overwriteIfExists: true,
        isOld: true,
    },
    errMaxFiles: {
        category: 'error',
        mappingKey: 'maxFiles',
        overwriteIfExists: true,
        isOld: true,
    },
    jsonMaxFiles: {
        category: 'json',
        mappingKey: 'maxFiles',
        overwriteIfExists: true,
        isOld: true,
    },
    eol: {
        category: 'top',
        mappingKey: 'eol',
        isOld: false,
    },
    jsonEol: {
        category: 'json',
        mappingKey: 'eol',
        isOld: true,
    },
    zippedArchive: {
        category: ['file', 'error', 'json'],
        mappingKey: 'zippedArchive',
        isOld: true,
    },
    fileZippedArchive: {
        category: 'file',
        mappingKey: 'zippedArchive',
        overwriteIfExists: true,
        isOld: true,
    },
    errZippedArchive: {
        category: 'error',
        mappingKey: 'zippedArchive',
        overwriteIfExists: true,
        isOld: true,
    },
    jsonZippedArchive: {
        category: 'json',
        mappingKey: 'zippedArchive',
        overwriteIfExists: true,
        isOld: true,
    },
    datePattern: {
        category: ['file', 'error', 'json'],
        mappingKey: 'datePattern',
        isOld: true,
    },
    fileDatePattern: {
        category: 'file',
        mappingKey: 'datePattern',
        overwriteIfExists: true,
        isOld: true,
    },
    errDatePattern: {
        category: 'error',
        mappingKey: 'datePattern',
        overwriteIfExists: true,
        isOld: true,
    },
    jsonDatePattern: {
        category: 'json',
        mappingKey: 'datePattern',
        overwriteIfExists: true,
        isOld: true,
    },
    auditFileDir: {
        category: ['file', 'error', 'json'],
        mappingKey: 'auditFileDir',
        isOld: true,
    },
    printFormat: {
        category: 'top',
        mappingKey: 'format',
        isOld: true,
    },
    defaultMeta: {
        ignore: true,
        isOld: true,
    },
    defaultLabel: {
        ignore: true,
        isOld: true,
    },
    disableConsole: {
        ignore: true,
        isOld: true,
    },
    disableFile: {
        ignore: true,
        isOld: true,
    },
    disableError: {
        ignore: true,
        isOld: true,
    },
    fileOptions: {
        category: ['file', 'error', 'json'],
        mappingKey: 'fileOptions',
        isOld: true,
    },
};
const hasOwn = Object.prototype.hasOwnProperty;
const toStr = Object.prototype.toString;
/**
 * 转换老的配置项到新的配置
 * @param unknownLoggerOptions
 */
function formatLegacyLoggerOptions(unknownLoggerOptions) {
    var _a, _b, _c, _d, _e, _f;
    function isPlainObject(obj) {
        if (!obj || toStr.call(obj) !== '[object Object]') {
            return false;
        }
        const hasOwnConstructor = hasOwn.call(obj, 'constructor');
        const hasIsPrototypeOf = obj.constructor &&
            obj.constructor.prototype &&
            hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
        // Not own constructor property must be Object
        if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
            return false;
        }
        // Own properties are enumerated firstly, so to speed up,
        // if last one is own, then all properties are own.
        let key;
        for (key in obj) {
            /**/
        }
        return typeof key === 'undefined' || hasOwn.call(obj, key);
    }
    function deepMerge(target, source) {
        if (!target) {
            return source;
        }
        if (source && !isPlainObject(source)) {
            return source;
        }
        for (const key of Object.keys(source)) {
            if (source[key] instanceof Object) {
                Object.assign(source[key], deepMerge(target[key], source[key]));
            }
        }
        Object.assign(target || {}, source);
        return target;
    }
    function setTransportOptions(newOptions, optionsKey, category, overwriteIfExists = false) {
        var _a, _b;
        if (!newOptions.transports[category]) {
            newOptions.transports[category] = {};
        }
        const key = (_a = legacyOptionsKeys[optionsKey].mappingKey) !== null && _a !== void 0 ? _a : optionsKey;
        // 启用了对应的 transport，才进行赋值，但是如果 transport 已经有值了，就不覆盖
        if (overwriteIfExists) {
            newOptions.transports[category][key] = unknownLoggerOptions[optionsKey];
        }
        else {
            newOptions.transports[category][key] =
                (_b = newOptions.transports[category][key]) !== null && _b !== void 0 ? _b : unknownLoggerOptions[optionsKey];
        }
    }
    function isValidTransport(obj) {
        return (obj &&
            (obj instanceof transport_1.Transport ||
                (typeof obj === 'object' && obj['dir'] && obj['fileLogName'])));
    }
    // 如果包含任意一个老的配置，则需要转换成新的配置
    if (Object.keys(unknownLoggerOptions).some(key => { var _a; return (_a = legacyOptionsKeys[key]) === null || _a === void 0 ? void 0 : _a.isOld; })) {
        const newOptions = { transports: {} };
        // 循环每个字段，如果是新的配置，直接赋值，如果是旧的配置，需要转换成新的配置
        for (const key of Object.keys(unknownLoggerOptions)) {
            // 设置值到 transport 的 options 上
            if (!legacyOptionsKeys[key]) {
                // 如果值不在 legacyOptionsKeys 中，直接忽略
                continue;
            }
            else {
                if (legacyOptionsKeys[key].ignore) {
                    continue;
                }
                legacyOptionsKeys[key].category = [].concat(legacyOptionsKeys[key].category);
                for (const category of legacyOptionsKeys[key].category) {
                    if (category === 'all') {
                        // 赋值到所有启用的 transport
                        for (const categoryKey of Object.keys(newOptions.transports)) {
                            setTransportOptions(newOptions, key, categoryKey, legacyOptionsKeys[key].overwriteIfExists);
                        }
                    }
                    else if (category === 'top') {
                        // 赋值到顶层
                        newOptions[key] =
                            (_a = newOptions[key]) !== null && _a !== void 0 ? _a : unknownLoggerOptions[legacyOptionsKeys[key].mappingKey];
                    }
                    else {
                        setTransportOptions(newOptions, key, category, legacyOptionsKeys[key].overwriteIfExists);
                    }
                }
            }
        }
        // 如果有新配置的值，那么先拿新配置赋值一遍，避免新配置将老配置合并的时候覆盖
        for (const key of Object.keys(unknownLoggerOptions)) {
            if (!legacyOptionsKeys[key]) {
                deepMerge(newOptions[key], unknownLoggerOptions[key]);
            }
        }
        if (unknownLoggerOptions['enableConsole'] === false ||
            unknownLoggerOptions['disableConsole'] === true) {
            newOptions.transports['console'] = false;
        }
        else {
            newOptions.transports['console'] = (_b = newOptions.transports['console']) !== null && _b !== void 0 ? _b : {};
        }
        if (unknownLoggerOptions['enableFile'] === false ||
            unknownLoggerOptions['disableFile'] === true) {
            newOptions.transports['file'] = false;
        }
        else {
            newOptions.transports['file'] = (_c = newOptions.transports['file']) !== null && _c !== void 0 ? _c : {};
        }
        if (unknownLoggerOptions['enableError'] === false ||
            unknownLoggerOptions['disableError'] === true) {
            newOptions.transports['error'] = false;
        }
        else {
            newOptions.transports['error'] = (_d = newOptions.transports['error']) !== null && _d !== void 0 ? _d : {};
        }
        if (((_e = unknownLoggerOptions === null || unknownLoggerOptions === void 0 ? void 0 : unknownLoggerOptions.transports) === null || _e === void 0 ? void 0 : _e['json']) === undefined &&
            (unknownLoggerOptions['enableJSON'] === undefined ||
                unknownLoggerOptions['enableJSON'] === false)) {
            newOptions.transports['json'] = false;
        }
        else {
            // 老版本 json 没有默认值
        }
        // 清理不合法的配置
        for (const key of ['file', 'error', 'json']) {
            if ((_f = newOptions === null || newOptions === void 0 ? void 0 : newOptions.transports) === null || _f === void 0 ? void 0 : _f[key]) {
                if (!isValidTransport(newOptions.transports[key])) {
                    delete newOptions.transports[key];
                }
            }
        }
        return newOptions;
    }
    return unknownLoggerOptions;
}
exports.formatLegacyLoggerOptions = formatLegacyLoggerOptions;
/**
 * Bubbles events to the proxy
 * @param emitter
 * @param proxy
 * @constructor
 */
function BubbleEvents(emitter, proxy) {
    emitter.on('close', () => {
        proxy.emit('close');
    });
    emitter.on('finish', () => {
        proxy.emit('finish');
    });
    emitter.on('error', err => {
        proxy.emit('error', err);
    });
    emitter.on('open', fd => {
        proxy.emit('open', fd);
    });
}
exports.BubbleEvents = BubbleEvents;
function isWin32() {
    return os.platform() === 'win32';
}
exports.isWin32 = isWin32;
/**
 * 不使用 dayjs 实现格式化，因为 dayjs 会有性能问题
 * 生成 YYYY-MM-DD HH:mm:ss.SSS 格式的时间
 * @param date
 */
function getFormatDate(date) {
    function pad(num, size = 2) {
        const s = num + '';
        return s.padStart(size, '0');
    }
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    const millisecond = date.getMilliseconds();
    return `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}:${pad(second)}.${pad(millisecond, 3)}`;
}
exports.getFormatDate = getFormatDate;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 9552:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ClassTransformer = void 0;
const TransformOperationExecutor_1 = __nccwpck_require__(5291);
const enums_1 = __nccwpck_require__(2446);
const default_options_constant_1 = __nccwpck_require__(1161);
class ClassTransformer {
    instanceToPlain(object, options) {
        const executor = new TransformOperationExecutor_1.TransformOperationExecutor(enums_1.TransformationType.CLASS_TO_PLAIN, {
            ...default_options_constant_1.defaultOptions,
            ...options,
        });
        return executor.transform(undefined, object, undefined, undefined, undefined, undefined);
    }
    classToPlainFromExist(object, plainObject, options) {
        const executor = new TransformOperationExecutor_1.TransformOperationExecutor(enums_1.TransformationType.CLASS_TO_PLAIN, {
            ...default_options_constant_1.defaultOptions,
            ...options,
        });
        return executor.transform(plainObject, object, undefined, undefined, undefined, undefined);
    }
    plainToInstance(cls, plain, options) {
        const executor = new TransformOperationExecutor_1.TransformOperationExecutor(enums_1.TransformationType.PLAIN_TO_CLASS, {
            ...default_options_constant_1.defaultOptions,
            ...options,
        });
        return executor.transform(undefined, plain, cls, undefined, undefined, undefined);
    }
    plainToClassFromExist(clsObject, plain, options) {
        const executor = new TransformOperationExecutor_1.TransformOperationExecutor(enums_1.TransformationType.PLAIN_TO_CLASS, {
            ...default_options_constant_1.defaultOptions,
            ...options,
        });
        return executor.transform(clsObject, plain, undefined, undefined, undefined, undefined);
    }
    instanceToInstance(object, options) {
        const executor = new TransformOperationExecutor_1.TransformOperationExecutor(enums_1.TransformationType.CLASS_TO_CLASS, {
            ...default_options_constant_1.defaultOptions,
            ...options,
        });
        return executor.transform(undefined, object, undefined, undefined, undefined, undefined);
    }
    classToClassFromExist(object, fromObject, options) {
        const executor = new TransformOperationExecutor_1.TransformOperationExecutor(enums_1.TransformationType.CLASS_TO_CLASS, {
            ...default_options_constant_1.defaultOptions,
            ...options,
        });
        return executor.transform(fromObject, object, undefined, undefined, undefined, undefined);
    }
    serialize(object, options) {
        return JSON.stringify(this.instanceToPlain(object, options));
    }
    /**
     * Deserializes given JSON string to a object of the given class.
     */
    deserialize(cls, json, options) {
        const jsonObject = JSON.parse(json);
        return this.plainToInstance(cls, jsonObject, options);
    }
    /**
     * Deserializes given JSON string to an array of objects of the given class.
     */
    deserializeArray(cls, json, options) {
        const jsonObject = JSON.parse(json);
        return this.plainToInstance(cls, jsonObject, options);
    }
}
exports.ClassTransformer = ClassTransformer;
//# sourceMappingURL=ClassTransformer.js.map

/***/ }),

/***/ 1665:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MetadataStorage = void 0;
const enums_1 = __nccwpck_require__(2446);
/**
 * Storage all library metadata.
 */
class MetadataStorage {
    constructor() {
        // -------------------------------------------------------------------------
        // Properties
        // -------------------------------------------------------------------------
        this._typeMetadatas = new Map();
        this._transformMetadatas = new Map();
        this._exposeMetadatas = new Map();
        this._excludeMetadatas = new Map();
        this._ancestorsMap = new Map();
    }
    // -------------------------------------------------------------------------
    // Adder Methods
    // -------------------------------------------------------------------------
    addTypeMetadata(metadata) {
        if (!this._typeMetadatas.has(metadata.target)) {
            this._typeMetadatas.set(metadata.target, new Map());
        }
        this._typeMetadatas.get(metadata.target).set(metadata.propertyName, metadata);
    }
    addTransformMetadata(metadata) {
        if (!this._transformMetadatas.has(metadata.target)) {
            this._transformMetadatas.set(metadata.target, new Map());
        }
        if (!this._transformMetadatas.get(metadata.target).has(metadata.propertyName)) {
            this._transformMetadatas.get(metadata.target).set(metadata.propertyName, []);
        }
        this._transformMetadatas.get(metadata.target).get(metadata.propertyName).push(metadata);
    }
    addExposeMetadata(metadata) {
        if (!this._exposeMetadatas.has(metadata.target)) {
            this._exposeMetadatas.set(metadata.target, new Map());
        }
        this._exposeMetadatas.get(metadata.target).set(metadata.propertyName, metadata);
    }
    addExcludeMetadata(metadata) {
        if (!this._excludeMetadatas.has(metadata.target)) {
            this._excludeMetadatas.set(metadata.target, new Map());
        }
        this._excludeMetadatas.get(metadata.target).set(metadata.propertyName, metadata);
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    findTransformMetadatas(target, propertyName, transformationType) {
        return this.findMetadatas(this._transformMetadatas, target, propertyName).filter(metadata => {
            if (!metadata.options)
                return true;
            if (metadata.options.toClassOnly === true && metadata.options.toPlainOnly === true)
                return true;
            if (metadata.options.toClassOnly === true) {
                return (transformationType === enums_1.TransformationType.CLASS_TO_CLASS ||
                    transformationType === enums_1.TransformationType.PLAIN_TO_CLASS);
            }
            if (metadata.options.toPlainOnly === true) {
                return transformationType === enums_1.TransformationType.CLASS_TO_PLAIN;
            }
            return true;
        });
    }
    findExcludeMetadata(target, propertyName) {
        return this.findMetadata(this._excludeMetadatas, target, propertyName);
    }
    findExposeMetadata(target, propertyName) {
        return this.findMetadata(this._exposeMetadatas, target, propertyName);
    }
    findExposeMetadataByCustomName(target, name) {
        return this.getExposedMetadatas(target).find(metadata => {
            return metadata.options && metadata.options.name === name;
        });
    }
    findTypeMetadata(target, propertyName) {
        return this.findMetadata(this._typeMetadatas, target, propertyName);
    }
    getStrategy(target) {
        const excludeMap = this._excludeMetadatas.get(target);
        const exclude = excludeMap && excludeMap.get(undefined);
        const exposeMap = this._exposeMetadatas.get(target);
        const expose = exposeMap && exposeMap.get(undefined);
        if ((exclude && expose) || (!exclude && !expose))
            return 'none';
        return exclude ? 'excludeAll' : 'exposeAll';
    }
    getExposedMetadatas(target) {
        return this.getMetadata(this._exposeMetadatas, target);
    }
    getExcludedMetadatas(target) {
        return this.getMetadata(this._excludeMetadatas, target);
    }
    getExposedProperties(target, transformationType) {
        return this.getExposedMetadatas(target)
            .filter(metadata => {
            if (!metadata.options)
                return true;
            if (metadata.options.toClassOnly === true && metadata.options.toPlainOnly === true)
                return true;
            if (metadata.options.toClassOnly === true) {
                return (transformationType === enums_1.TransformationType.CLASS_TO_CLASS ||
                    transformationType === enums_1.TransformationType.PLAIN_TO_CLASS);
            }
            if (metadata.options.toPlainOnly === true) {
                return transformationType === enums_1.TransformationType.CLASS_TO_PLAIN;
            }
            return true;
        })
            .map(metadata => metadata.propertyName);
    }
    getExcludedProperties(target, transformationType) {
        return this.getExcludedMetadatas(target)
            .filter(metadata => {
            if (!metadata.options)
                return true;
            if (metadata.options.toClassOnly === true && metadata.options.toPlainOnly === true)
                return true;
            if (metadata.options.toClassOnly === true) {
                return (transformationType === enums_1.TransformationType.CLASS_TO_CLASS ||
                    transformationType === enums_1.TransformationType.PLAIN_TO_CLASS);
            }
            if (metadata.options.toPlainOnly === true) {
                return transformationType === enums_1.TransformationType.CLASS_TO_PLAIN;
            }
            return true;
        })
            .map(metadata => metadata.propertyName);
    }
    clear() {
        this._typeMetadatas.clear();
        this._exposeMetadatas.clear();
        this._excludeMetadatas.clear();
        this._ancestorsMap.clear();
    }
    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------
    getMetadata(metadatas, target) {
        const metadataFromTargetMap = metadatas.get(target);
        let metadataFromTarget;
        if (metadataFromTargetMap) {
            metadataFromTarget = Array.from(metadataFromTargetMap.values()).filter(meta => meta.propertyName !== undefined);
        }
        const metadataFromAncestors = [];
        for (const ancestor of this.getAncestors(target)) {
            const ancestorMetadataMap = metadatas.get(ancestor);
            if (ancestorMetadataMap) {
                const metadataFromAncestor = Array.from(ancestorMetadataMap.values()).filter(meta => meta.propertyName !== undefined);
                metadataFromAncestors.push(...metadataFromAncestor);
            }
        }
        return metadataFromAncestors.concat(metadataFromTarget || []);
    }
    findMetadata(metadatas, target, propertyName) {
        const metadataFromTargetMap = metadatas.get(target);
        if (metadataFromTargetMap) {
            const metadataFromTarget = metadataFromTargetMap.get(propertyName);
            if (metadataFromTarget) {
                return metadataFromTarget;
            }
        }
        for (const ancestor of this.getAncestors(target)) {
            const ancestorMetadataMap = metadatas.get(ancestor);
            if (ancestorMetadataMap) {
                const ancestorResult = ancestorMetadataMap.get(propertyName);
                if (ancestorResult) {
                    return ancestorResult;
                }
            }
        }
        return undefined;
    }
    findMetadatas(metadatas, target, propertyName) {
        const metadataFromTargetMap = metadatas.get(target);
        let metadataFromTarget;
        if (metadataFromTargetMap) {
            metadataFromTarget = metadataFromTargetMap.get(propertyName);
        }
        const metadataFromAncestorsTarget = [];
        for (const ancestor of this.getAncestors(target)) {
            const ancestorMetadataMap = metadatas.get(ancestor);
            if (ancestorMetadataMap) {
                if (ancestorMetadataMap.has(propertyName)) {
                    metadataFromAncestorsTarget.push(...ancestorMetadataMap.get(propertyName));
                }
            }
        }
        return metadataFromAncestorsTarget
            .slice()
            .reverse()
            .concat((metadataFromTarget || []).slice().reverse());
    }
    getAncestors(target) {
        if (!target)
            return [];
        if (!this._ancestorsMap.has(target)) {
            const ancestors = [];
            for (let baseClass = Object.getPrototypeOf(target.prototype.constructor); typeof baseClass.prototype !== 'undefined'; baseClass = Object.getPrototypeOf(baseClass.prototype.constructor)) {
                ancestors.push(baseClass);
            }
            this._ancestorsMap.set(target, ancestors);
        }
        return this._ancestorsMap.get(target);
    }
}
exports.MetadataStorage = MetadataStorage;
//# sourceMappingURL=MetadataStorage.js.map

/***/ }),

/***/ 5291:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TransformOperationExecutor = void 0;
const storage_1 = __nccwpck_require__(306);
const enums_1 = __nccwpck_require__(2446);
const utils_1 = __nccwpck_require__(1693);
function instantiateArrayType(arrayType) {
    const array = new arrayType();
    if (!(array instanceof Set) && !('push' in array)) {
        return [];
    }
    return array;
}
class TransformOperationExecutor {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    constructor(transformationType, options) {
        this.transformationType = transformationType;
        this.options = options;
        // -------------------------------------------------------------------------
        // Private Properties
        // -------------------------------------------------------------------------
        this.recursionStack = new Set();
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    transform(source, value, targetType, arrayType, isMap, level = 0) {
        if (Array.isArray(value) || value instanceof Set) {
            const newValue = arrayType && this.transformationType === enums_1.TransformationType.PLAIN_TO_CLASS
                ? instantiateArrayType(arrayType)
                : [];
            value.forEach((subValue, index) => {
                const subSource = source ? source[index] : undefined;
                if (!this.options.enableCircularCheck || !this.isCircular(subValue)) {
                    let realTargetType;
                    if (typeof targetType !== 'function' &&
                        targetType &&
                        targetType.options &&
                        targetType.options.discriminator &&
                        targetType.options.discriminator.property &&
                        targetType.options.discriminator.subTypes) {
                        if (this.transformationType === enums_1.TransformationType.PLAIN_TO_CLASS) {
                            realTargetType = targetType.options.discriminator.subTypes.find(subType => subType.name === subValue[targetType.options.discriminator.property]);
                            const options = { newObject: newValue, object: subValue, property: undefined };
                            const newType = targetType.typeFunction(options);
                            realTargetType === undefined ? (realTargetType = newType) : (realTargetType = realTargetType.value);
                            if (!targetType.options.keepDiscriminatorProperty)
                                delete subValue[targetType.options.discriminator.property];
                        }
                        if (this.transformationType === enums_1.TransformationType.CLASS_TO_CLASS) {
                            realTargetType = subValue.constructor;
                        }
                        if (this.transformationType === enums_1.TransformationType.CLASS_TO_PLAIN) {
                            subValue[targetType.options.discriminator.property] = targetType.options.discriminator.subTypes.find(subType => subType.value === subValue.constructor).name;
                        }
                    }
                    else {
                        realTargetType = targetType;
                    }
                    const value = this.transform(subSource, subValue, realTargetType, undefined, subValue instanceof Map, level + 1);
                    if (newValue instanceof Set) {
                        newValue.add(value);
                    }
                    else {
                        newValue.push(value);
                    }
                }
                else if (this.transformationType === enums_1.TransformationType.CLASS_TO_CLASS) {
                    if (newValue instanceof Set) {
                        newValue.add(subValue);
                    }
                    else {
                        newValue.push(subValue);
                    }
                }
            });
            return newValue;
        }
        else if (targetType === String && !isMap) {
            if (value === null || value === undefined)
                return value;
            return String(value);
        }
        else if (targetType === Number && !isMap) {
            if (value === null || value === undefined)
                return value;
            return Number(value);
        }
        else if (targetType === Boolean && !isMap) {
            if (value === null || value === undefined)
                return value;
            return Boolean(value);
        }
        else if ((targetType === Date || value instanceof Date) && !isMap) {
            if (value instanceof Date) {
                return new Date(value.valueOf());
            }
            if (value === null || value === undefined)
                return value;
            return new Date(value);
        }
        else if (!!(0, utils_1.getGlobal)().Buffer && (targetType === Buffer || value instanceof Buffer) && !isMap) {
            if (value === null || value === undefined)
                return value;
            return Buffer.from(value);
        }
        else if ((0, utils_1.isPromise)(value) && !isMap) {
            return new Promise((resolve, reject) => {
                value.then((data) => resolve(this.transform(undefined, data, targetType, undefined, undefined, level + 1)), reject);
            });
        }
        else if (!isMap && value !== null && typeof value === 'object' && typeof value.then === 'function') {
            // Note: We should not enter this, as promise has been handled above
            // This option simply returns the Promise preventing a JS error from happening and should be an inaccessible path.
            return value; // skip promise transformation
        }
        else if (typeof value === 'object' && value !== null) {
            // try to guess the type
            if (!targetType && value.constructor !== Object /* && TransformationType === TransformationType.CLASS_TO_PLAIN*/)
                if (!Array.isArray(value) && value.constructor === Array) {
                    // Somebody attempts to convert special Array like object to Array, eg:
                    // const evilObject = { '100000000': '100000000', __proto__: [] };
                    // This could be used to cause Denial-of-service attack so we don't allow it.
                    // See prevent-array-bomb.spec.ts for more details.
                }
                else {
                    // We are good we can use the built-in constructor
                    targetType = value.constructor;
                }
            if (!targetType && source)
                targetType = source.constructor;
            if (this.options.enableCircularCheck) {
                // add transformed type to prevent circular references
                this.recursionStack.add(value);
            }
            const keys = this.getKeys(targetType, value, isMap);
            let newValue = source ? source : {};
            if (!source &&
                (this.transformationType === enums_1.TransformationType.PLAIN_TO_CLASS ||
                    this.transformationType === enums_1.TransformationType.CLASS_TO_CLASS)) {
                if (isMap) {
                    newValue = new Map();
                }
                else if (targetType) {
                    newValue = new targetType();
                }
                else {
                    newValue = {};
                }
            }
            // traverse over keys
            for (const key of keys) {
                if (key === '__proto__' || key === 'constructor') {
                    continue;
                }
                const valueKey = key;
                let newValueKey = key, propertyName = key;
                if (!this.options.ignoreDecorators && targetType) {
                    if (this.transformationType === enums_1.TransformationType.PLAIN_TO_CLASS) {
                        const exposeMetadata = storage_1.defaultMetadataStorage.findExposeMetadataByCustomName(targetType, key);
                        if (exposeMetadata) {
                            propertyName = exposeMetadata.propertyName;
                            newValueKey = exposeMetadata.propertyName;
                        }
                    }
                    else if (this.transformationType === enums_1.TransformationType.CLASS_TO_PLAIN ||
                        this.transformationType === enums_1.TransformationType.CLASS_TO_CLASS) {
                        const exposeMetadata = storage_1.defaultMetadataStorage.findExposeMetadata(targetType, key);
                        if (exposeMetadata && exposeMetadata.options && exposeMetadata.options.name) {
                            newValueKey = exposeMetadata.options.name;
                        }
                    }
                }
                // get a subvalue
                let subValue = undefined;
                if (this.transformationType === enums_1.TransformationType.PLAIN_TO_CLASS) {
                    /**
                     * This section is added for the following report:
                     * https://github.com/typestack/class-transformer/issues/596
                     *
                     * We should not call functions or constructors when transforming to class.
                     */
                    subValue = value[valueKey];
                }
                else {
                    if (value instanceof Map) {
                        subValue = value.get(valueKey);
                    }
                    else if (value[valueKey] instanceof Function) {
                        subValue = value[valueKey]();
                    }
                    else {
                        subValue = value[valueKey];
                    }
                }
                // determine a type
                let type = undefined, isSubValueMap = subValue instanceof Map;
                if (targetType && isMap) {
                    type = targetType;
                }
                else if (targetType) {
                    const metadata = storage_1.defaultMetadataStorage.findTypeMetadata(targetType, propertyName);
                    if (metadata) {
                        const options = { newObject: newValue, object: value, property: propertyName };
                        const newType = metadata.typeFunction ? metadata.typeFunction(options) : metadata.reflectedType;
                        if (metadata.options &&
                            metadata.options.discriminator &&
                            metadata.options.discriminator.property &&
                            metadata.options.discriminator.subTypes) {
                            if (!(value[valueKey] instanceof Array)) {
                                if (this.transformationType === enums_1.TransformationType.PLAIN_TO_CLASS) {
                                    type = metadata.options.discriminator.subTypes.find(subType => {
                                        if (subValue && subValue instanceof Object && metadata.options.discriminator.property in subValue) {
                                            return subType.name === subValue[metadata.options.discriminator.property];
                                        }
                                    });
                                    type === undefined ? (type = newType) : (type = type.value);
                                    if (!metadata.options.keepDiscriminatorProperty) {
                                        if (subValue && subValue instanceof Object && metadata.options.discriminator.property in subValue) {
                                            delete subValue[metadata.options.discriminator.property];
                                        }
                                    }
                                }
                                if (this.transformationType === enums_1.TransformationType.CLASS_TO_CLASS) {
                                    type = subValue.constructor;
                                }
                                if (this.transformationType === enums_1.TransformationType.CLASS_TO_PLAIN) {
                                    if (subValue) {
                                        subValue[metadata.options.discriminator.property] = metadata.options.discriminator.subTypes.find(subType => subType.value === subValue.constructor).name;
                                    }
                                }
                            }
                            else {
                                type = metadata;
                            }
                        }
                        else {
                            type = newType;
                        }
                        isSubValueMap = isSubValueMap || metadata.reflectedType === Map;
                    }
                    else if (this.options.targetMaps) {
                        // try to find a type in target maps
                        this.options.targetMaps
                            .filter(map => map.target === targetType && !!map.properties[propertyName])
                            .forEach(map => (type = map.properties[propertyName]));
                    }
                    else if (this.options.enableImplicitConversion &&
                        this.transformationType === enums_1.TransformationType.PLAIN_TO_CLASS) {
                        // if we have no registererd type via the @Type() decorator then we check if we have any
                        // type declarations in reflect-metadata (type declaration is emited only if some decorator is added to the property.)
                        const reflectedType = Reflect.getMetadata('design:type', targetType.prototype, propertyName);
                        if (reflectedType) {
                            type = reflectedType;
                        }
                    }
                }
                // if value is an array try to get its custom array type
                const arrayType = Array.isArray(value[valueKey])
                    ? this.getReflectedType(targetType, propertyName)
                    : undefined;
                // const subValueKey = TransformationType === TransformationType.PLAIN_TO_CLASS && newKeyName ? newKeyName : key;
                const subSource = source ? source[valueKey] : undefined;
                // if its deserialization then type if required
                // if we uncomment this types like string[] will not work
                // if (this.transformationType === TransformationType.PLAIN_TO_CLASS && !type && subValue instanceof Object && !(subValue instanceof Date))
                //     throw new Error(`Cannot determine type for ${(targetType as any).name }.${propertyName}, did you forget to specify a @Type?`);
                // if newValue is a source object that has method that match newKeyName then skip it
                if (newValue.constructor.prototype) {
                    const descriptor = Object.getOwnPropertyDescriptor(newValue.constructor.prototype, newValueKey);
                    if ((this.transformationType === enums_1.TransformationType.PLAIN_TO_CLASS ||
                        this.transformationType === enums_1.TransformationType.CLASS_TO_CLASS) &&
                        // eslint-disable-next-line @typescript-eslint/unbound-method
                        ((descriptor && !descriptor.set) || newValue[newValueKey] instanceof Function))
                        //  || TransformationType === TransformationType.CLASS_TO_CLASS
                        continue;
                }
                if (!this.options.enableCircularCheck || !this.isCircular(subValue)) {
                    const transformKey = this.transformationType === enums_1.TransformationType.PLAIN_TO_CLASS ? newValueKey : key;
                    let finalValue;
                    if (this.transformationType === enums_1.TransformationType.CLASS_TO_PLAIN) {
                        // Get original value
                        finalValue = value[transformKey];
                        // Apply custom transformation
                        finalValue = this.applyCustomTransformations(finalValue, targetType, transformKey, value, this.transformationType);
                        // If nothing change, it means no custom transformation was applied, so use the subValue.
                        finalValue = value[transformKey] === finalValue ? subValue : finalValue;
                        // Apply the default transformation
                        finalValue = this.transform(subSource, finalValue, type, arrayType, isSubValueMap, level + 1);
                    }
                    else {
                        if (subValue === undefined && this.options.exposeDefaultValues) {
                            // Set default value if nothing provided
                            finalValue = newValue[newValueKey];
                        }
                        else {
                            finalValue = this.transform(subSource, subValue, type, arrayType, isSubValueMap, level + 1);
                            finalValue = this.applyCustomTransformations(finalValue, targetType, transformKey, value, this.transformationType);
                        }
                    }
                    if (finalValue !== undefined || this.options.exposeUnsetFields) {
                        if (newValue instanceof Map) {
                            newValue.set(newValueKey, finalValue);
                        }
                        else {
                            newValue[newValueKey] = finalValue;
                        }
                    }
                }
                else if (this.transformationType === enums_1.TransformationType.CLASS_TO_CLASS) {
                    let finalValue = subValue;
                    finalValue = this.applyCustomTransformations(finalValue, targetType, key, value, this.transformationType);
                    if (finalValue !== undefined || this.options.exposeUnsetFields) {
                        if (newValue instanceof Map) {
                            newValue.set(newValueKey, finalValue);
                        }
                        else {
                            newValue[newValueKey] = finalValue;
                        }
                    }
                }
            }
            if (this.options.enableCircularCheck) {
                this.recursionStack.delete(value);
            }
            return newValue;
        }
        else {
            return value;
        }
    }
    applyCustomTransformations(value, target, key, obj, transformationType) {
        let metadatas = storage_1.defaultMetadataStorage.findTransformMetadatas(target, key, this.transformationType);
        // apply versioning options
        if (this.options.version !== undefined) {
            metadatas = metadatas.filter(metadata => {
                if (!metadata.options)
                    return true;
                return this.checkVersion(metadata.options.since, metadata.options.until);
            });
        }
        // apply grouping options
        if (this.options.groups && this.options.groups.length) {
            metadatas = metadatas.filter(metadata => {
                if (!metadata.options)
                    return true;
                return this.checkGroups(metadata.options.groups);
            });
        }
        else {
            metadatas = metadatas.filter(metadata => {
                return !metadata.options || !metadata.options.groups || !metadata.options.groups.length;
            });
        }
        metadatas.forEach(metadata => {
            value = metadata.transformFn({ value, key, obj, type: transformationType, options: this.options });
        });
        return value;
    }
    // preventing circular references
    isCircular(object) {
        return this.recursionStack.has(object);
    }
    getReflectedType(target, propertyName) {
        if (!target)
            return undefined;
        const meta = storage_1.defaultMetadataStorage.findTypeMetadata(target, propertyName);
        return meta ? meta.reflectedType : undefined;
    }
    getKeys(target, object, isMap) {
        // determine exclusion strategy
        let strategy = storage_1.defaultMetadataStorage.getStrategy(target);
        if (strategy === 'none')
            strategy = this.options.strategy || 'exposeAll'; // exposeAll is default strategy
        // get all keys that need to expose
        let keys = [];
        if (strategy === 'exposeAll' || isMap) {
            if (object instanceof Map) {
                keys = Array.from(object.keys());
            }
            else {
                keys = Object.keys(object);
            }
        }
        if (isMap) {
            // expose & exclude do not apply for map keys only to fields
            return keys;
        }
        /**
         * If decorators are ignored but we don't want the extraneous values, then we use the
         * metadata to decide which property is needed, but doesn't apply the decorator effect.
         */
        if (this.options.ignoreDecorators && this.options.excludeExtraneousValues && target) {
            const exposedProperties = storage_1.defaultMetadataStorage.getExposedProperties(target, this.transformationType);
            const excludedProperties = storage_1.defaultMetadataStorage.getExcludedProperties(target, this.transformationType);
            keys = [...exposedProperties, ...excludedProperties];
        }
        if (!this.options.ignoreDecorators && target) {
            // add all exposed to list of keys
            let exposedProperties = storage_1.defaultMetadataStorage.getExposedProperties(target, this.transformationType);
            if (this.transformationType === enums_1.TransformationType.PLAIN_TO_CLASS) {
                exposedProperties = exposedProperties.map(key => {
                    const exposeMetadata = storage_1.defaultMetadataStorage.findExposeMetadata(target, key);
                    if (exposeMetadata && exposeMetadata.options && exposeMetadata.options.name) {
                        return exposeMetadata.options.name;
                    }
                    return key;
                });
            }
            if (this.options.excludeExtraneousValues) {
                keys = exposedProperties;
            }
            else {
                keys = keys.concat(exposedProperties);
            }
            // exclude excluded properties
            const excludedProperties = storage_1.defaultMetadataStorage.getExcludedProperties(target, this.transformationType);
            if (excludedProperties.length > 0) {
                keys = keys.filter(key => {
                    return !excludedProperties.includes(key);
                });
            }
            // apply versioning options
            if (this.options.version !== undefined) {
                keys = keys.filter(key => {
                    const exposeMetadata = storage_1.defaultMetadataStorage.findExposeMetadata(target, key);
                    if (!exposeMetadata || !exposeMetadata.options)
                        return true;
                    return this.checkVersion(exposeMetadata.options.since, exposeMetadata.options.until);
                });
            }
            // apply grouping options
            if (this.options.groups && this.options.groups.length) {
                keys = keys.filter(key => {
                    const exposeMetadata = storage_1.defaultMetadataStorage.findExposeMetadata(target, key);
                    if (!exposeMetadata || !exposeMetadata.options)
                        return true;
                    return this.checkGroups(exposeMetadata.options.groups);
                });
            }
            else {
                keys = keys.filter(key => {
                    const exposeMetadata = storage_1.defaultMetadataStorage.findExposeMetadata(target, key);
                    return (!exposeMetadata ||
                        !exposeMetadata.options ||
                        !exposeMetadata.options.groups ||
                        !exposeMetadata.options.groups.length);
                });
            }
        }
        // exclude prefixed properties
        if (this.options.excludePrefixes && this.options.excludePrefixes.length) {
            keys = keys.filter(key => this.options.excludePrefixes.every(prefix => {
                return key.substr(0, prefix.length) !== prefix;
            }));
        }
        // make sure we have unique keys
        keys = keys.filter((key, index, self) => {
            return self.indexOf(key) === index;
        });
        return keys;
    }
    checkVersion(since, until) {
        let decision = true;
        if (decision && since)
            decision = this.options.version >= since;
        if (decision && until)
            decision = this.options.version < until;
        return decision;
    }
    checkGroups(groups) {
        if (!groups)
            return true;
        return this.options.groups.some(optionGroup => groups.includes(optionGroup));
    }
}
exports.TransformOperationExecutor = TransformOperationExecutor;
//# sourceMappingURL=TransformOperationExecutor.js.map

/***/ }),

/***/ 1161:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.defaultOptions = void 0;
/**
 * These are the default options used by any transformation operation.
 */
exports.defaultOptions = {
    enableCircularCheck: false,
    enableImplicitConversion: false,
    excludeExtraneousValues: false,
    excludePrefixes: undefined,
    exposeDefaultValues: false,
    exposeUnsetFields: true,
    groups: undefined,
    ignoreDecorators: false,
    strategy: undefined,
    targetMaps: undefined,
    version: undefined,
};
//# sourceMappingURL=default-options.constant.js.map

/***/ }),

/***/ 9463:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Exclude = void 0;
const storage_1 = __nccwpck_require__(306);
/**
 * Marks the given class or property as excluded. By default the property is excluded in both
 * constructorToPlain and plainToConstructor transformations. It can be limited to only one direction
 * via using the `toPlainOnly` or `toClassOnly` option.
 *
 * Can be applied to class definitions and properties.
 */
function Exclude(options = {}) {
    /**
     * NOTE: The `propertyName` property must be marked as optional because
     * this decorator used both as a class and a property decorator and the
     * Typescript compiler will freak out if we make it mandatory as a class
     * decorator only receives one parameter.
     */
    return function (object, propertyName) {
        storage_1.defaultMetadataStorage.addExcludeMetadata({
            target: object instanceof Function ? object : object.constructor,
            propertyName: propertyName,
            options,
        });
    };
}
exports.Exclude = Exclude;
//# sourceMappingURL=exclude.decorator.js.map

/***/ }),

/***/ 1787:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Expose = void 0;
const storage_1 = __nccwpck_require__(306);
/**
 * Marks the given class or property as included. By default the property is included in both
 * constructorToPlain and plainToConstructor transformations. It can be limited to only one direction
 * via using the `toPlainOnly` or `toClassOnly` option.
 *
 * Can be applied to class definitions and properties.
 */
function Expose(options = {}) {
    /**
     * NOTE: The `propertyName` property must be marked as optional because
     * this decorator used both as a class and a property decorator and the
     * Typescript compiler will freak out if we make it mandatory as a class
     * decorator only receives one parameter.
     */
    return function (object, propertyName) {
        storage_1.defaultMetadataStorage.addExposeMetadata({
            target: object instanceof Function ? object : object.constructor,
            propertyName: propertyName,
            options,
        });
    };
}
exports.Expose = Expose;
//# sourceMappingURL=expose.decorator.js.map

/***/ }),

/***/ 2854:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__nccwpck_require__(9463), exports);
__exportStar(__nccwpck_require__(1787), exports);
__exportStar(__nccwpck_require__(9461), exports);
__exportStar(__nccwpck_require__(7174), exports);
__exportStar(__nccwpck_require__(6258), exports);
__exportStar(__nccwpck_require__(385), exports);
__exportStar(__nccwpck_require__(1715), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 9461:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TransformInstanceToInstance = void 0;
const ClassTransformer_1 = __nccwpck_require__(9552);
/**
 * Return the class instance only with the exposed properties.
 *
 * Can be applied to functions and getters/setters only.
 */
function TransformInstanceToInstance(params) {
    return function (target, propertyKey, descriptor) {
        const classTransformer = new ClassTransformer_1.ClassTransformer();
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            const result = originalMethod.apply(this, args);
            const isPromise = !!result && (typeof result === 'object' || typeof result === 'function') && typeof result.then === 'function';
            return isPromise
                ? result.then((data) => classTransformer.instanceToInstance(data, params))
                : classTransformer.instanceToInstance(result, params);
        };
    };
}
exports.TransformInstanceToInstance = TransformInstanceToInstance;
//# sourceMappingURL=transform-instance-to-instance.decorator.js.map

/***/ }),

/***/ 7174:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TransformInstanceToPlain = void 0;
const ClassTransformer_1 = __nccwpck_require__(9552);
/**
 * Transform the object from class to plain object and return only with the exposed properties.
 *
 * Can be applied to functions and getters/setters only.
 */
function TransformInstanceToPlain(params) {
    return function (target, propertyKey, descriptor) {
        const classTransformer = new ClassTransformer_1.ClassTransformer();
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            const result = originalMethod.apply(this, args);
            const isPromise = !!result && (typeof result === 'object' || typeof result === 'function') && typeof result.then === 'function';
            return isPromise
                ? result.then((data) => classTransformer.instanceToPlain(data, params))
                : classTransformer.instanceToPlain(result, params);
        };
    };
}
exports.TransformInstanceToPlain = TransformInstanceToPlain;
//# sourceMappingURL=transform-instance-to-plain.decorator.js.map

/***/ }),

/***/ 6258:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TransformPlainToInstance = void 0;
const ClassTransformer_1 = __nccwpck_require__(9552);
/**
 * Return the class instance only with the exposed properties.
 *
 * Can be applied to functions and getters/setters only.
 */
function TransformPlainToInstance(classType, params) {
    return function (target, propertyKey, descriptor) {
        const classTransformer = new ClassTransformer_1.ClassTransformer();
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            const result = originalMethod.apply(this, args);
            const isPromise = !!result && (typeof result === 'object' || typeof result === 'function') && typeof result.then === 'function';
            return isPromise
                ? result.then((data) => classTransformer.plainToInstance(classType, data, params))
                : classTransformer.plainToInstance(classType, result, params);
        };
    };
}
exports.TransformPlainToInstance = TransformPlainToInstance;
//# sourceMappingURL=transform-plain-to-instance.decorator.js.map

/***/ }),

/***/ 385:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Transform = void 0;
const storage_1 = __nccwpck_require__(306);
/**
 * Defines a custom logic for value transformation.
 *
 * Can be applied to properties only.
 */
function Transform(transformFn, options = {}) {
    return function (target, propertyName) {
        storage_1.defaultMetadataStorage.addTransformMetadata({
            target: target.constructor,
            propertyName: propertyName,
            transformFn,
            options,
        });
    };
}
exports.Transform = Transform;
//# sourceMappingURL=transform.decorator.js.map

/***/ }),

/***/ 1715:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Type = void 0;
const storage_1 = __nccwpck_require__(306);
/**
 * Specifies a type of the property.
 * The given TypeFunction can return a constructor. A discriminator can be given in the options.
 *
 * Can be applied to properties only.
 */
function Type(typeFunction, options = {}) {
    return function (target, propertyName) {
        const reflectedType = Reflect.getMetadata('design:type', target, propertyName);
        storage_1.defaultMetadataStorage.addTypeMetadata({
            target: target.constructor,
            propertyName: propertyName,
            reflectedType,
            typeFunction,
            options,
        });
    };
}
exports.Type = Type;
//# sourceMappingURL=type.decorator.js.map

/***/ }),

/***/ 2446:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__nccwpck_require__(2435), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 2435:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TransformationType = void 0;
var TransformationType;
(function (TransformationType) {
    TransformationType[TransformationType["PLAIN_TO_CLASS"] = 0] = "PLAIN_TO_CLASS";
    TransformationType[TransformationType["CLASS_TO_PLAIN"] = 1] = "CLASS_TO_PLAIN";
    TransformationType[TransformationType["CLASS_TO_CLASS"] = 2] = "CLASS_TO_CLASS";
})(TransformationType = exports.TransformationType || (exports.TransformationType = {}));
//# sourceMappingURL=transformation-type.enum.js.map

/***/ }),

/***/ 451:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deserializeArray = exports.deserialize = exports.serialize = exports.classToClassFromExist = exports.instanceToInstance = exports.plainToClassFromExist = exports.plainToInstance = exports.plainToClass = exports.classToPlainFromExist = exports.instanceToPlain = exports.classToPlain = exports.ClassTransformer = void 0;
const ClassTransformer_1 = __nccwpck_require__(9552);
var ClassTransformer_2 = __nccwpck_require__(9552);
Object.defineProperty(exports, "ClassTransformer", ({ enumerable: true, get: function () { return ClassTransformer_2.ClassTransformer; } }));
__exportStar(__nccwpck_require__(2854), exports);
__exportStar(__nccwpck_require__(6400), exports);
__exportStar(__nccwpck_require__(2446), exports);
const classTransformer = new ClassTransformer_1.ClassTransformer();
function classToPlain(object, options) {
    return classTransformer.instanceToPlain(object, options);
}
exports.classToPlain = classToPlain;
function instanceToPlain(object, options) {
    return classTransformer.instanceToPlain(object, options);
}
exports.instanceToPlain = instanceToPlain;
function classToPlainFromExist(object, plainObject, options) {
    return classTransformer.classToPlainFromExist(object, plainObject, options);
}
exports.classToPlainFromExist = classToPlainFromExist;
function plainToClass(cls, plain, options) {
    return classTransformer.plainToInstance(cls, plain, options);
}
exports.plainToClass = plainToClass;
function plainToInstance(cls, plain, options) {
    return classTransformer.plainToInstance(cls, plain, options);
}
exports.plainToInstance = plainToInstance;
function plainToClassFromExist(clsObject, plain, options) {
    return classTransformer.plainToClassFromExist(clsObject, plain, options);
}
exports.plainToClassFromExist = plainToClassFromExist;
function instanceToInstance(object, options) {
    return classTransformer.instanceToInstance(object, options);
}
exports.instanceToInstance = instanceToInstance;
function classToClassFromExist(object, fromObject, options) {
    return classTransformer.classToClassFromExist(object, fromObject, options);
}
exports.classToClassFromExist = classToClassFromExist;
function serialize(object, options) {
    return classTransformer.serialize(object, options);
}
exports.serialize = serialize;
/**
 * Deserializes given JSON string to a object of the given class.
 *
 * @deprecated This function is being removed. Please use the following instead:
 * ```
 * instanceToClass(cls, JSON.parse(json), options)
 * ```
 */
function deserialize(cls, json, options) {
    return classTransformer.deserialize(cls, json, options);
}
exports.deserialize = deserialize;
/**
 * Deserializes given JSON string to an array of objects of the given class.
 *
 * @deprecated This function is being removed. Please use the following instead:
 * ```
 * JSON.parse(json).map(value => instanceToClass(cls, value, options))
 * ```
 *
 */
function deserializeArray(cls, json, options) {
    return classTransformer.deserializeArray(cls, json, options);
}
exports.deserializeArray = deserializeArray;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 3159:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=class-constructor.type.js.map

/***/ }),

/***/ 4196:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=class-transformer-options.interface.js.map

/***/ }),

/***/ 165:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=exclude-options.interface.js.map

/***/ }),

/***/ 7023:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=expose-options.interface.js.map

/***/ }),

/***/ 2315:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=transform-options.interface.js.map

/***/ }),

/***/ 4597:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=type-discriminator-descriptor.interface.js.map

/***/ }),

/***/ 3715:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=type-options.interface.js.map

/***/ }),

/***/ 6400:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__nccwpck_require__(7023), exports);
__exportStar(__nccwpck_require__(165), exports);
__exportStar(__nccwpck_require__(2315), exports);
__exportStar(__nccwpck_require__(4597), exports);
__exportStar(__nccwpck_require__(3715), exports);
__exportStar(__nccwpck_require__(9991), exports);
__exportStar(__nccwpck_require__(9995), exports);
__exportStar(__nccwpck_require__(1973), exports);
__exportStar(__nccwpck_require__(1413), exports);
__exportStar(__nccwpck_require__(1387), exports);
__exportStar(__nccwpck_require__(3159), exports);
__exportStar(__nccwpck_require__(4196), exports);
__exportStar(__nccwpck_require__(2549), exports);
__exportStar(__nccwpck_require__(2334), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 9991:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=exclude-metadata.interface.js.map

/***/ }),

/***/ 9995:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=expose-metadata.interface.js.map

/***/ }),

/***/ 1413:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=transform-fn-params.interface.js.map

/***/ }),

/***/ 1973:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=transform-metadata.interface.js.map

/***/ }),

/***/ 1387:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=type-metadata.interface.js.map

/***/ }),

/***/ 2549:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=target-map.interface.js.map

/***/ }),

/***/ 2334:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=type-help-options.interface.js.map

/***/ }),

/***/ 306:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.defaultMetadataStorage = void 0;
const MetadataStorage_1 = __nccwpck_require__(1665);
/**
 * Default metadata storage is used as singleton and can be used to storage all metadatas.
 */
exports.defaultMetadataStorage = new MetadataStorage_1.MetadataStorage();
//# sourceMappingURL=storage.js.map

/***/ }),

/***/ 9091:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getGlobal = void 0;
/**
 * This function returns the global object across Node and browsers.
 *
 * Note: `globalThis` is the standardized approach however it has been added to
 * Node.js in version 12. We need to include this snippet until Node 12 EOL.
 */
function getGlobal() {
    if (typeof globalThis !== 'undefined') {
        return globalThis;
    }
    if (typeof global !== 'undefined') {
        return global;
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: Cannot find name 'window'.
    if (typeof window !== 'undefined') {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore: Cannot find name 'window'.
        return window;
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: Cannot find name 'self'.
    if (typeof self !== 'undefined') {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore: Cannot find name 'self'.
        return self;
    }
}
exports.getGlobal = getGlobal;
//# sourceMappingURL=get-global.util.js.map

/***/ }),

/***/ 1693:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__nccwpck_require__(9091), exports);
__exportStar(__nccwpck_require__(879), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 879:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isPromise = void 0;
function isPromise(p) {
    return p !== null && typeof p === 'object' && typeof p.then === 'function';
}
exports.isPromise = isPromise;
//# sourceMappingURL=is-promise.util.js.map

/***/ }),

/***/ 3706:
/***/ (function(module) {

!function(t,e){ true?module.exports=e():0}(this,(function(){"use strict";var t=1e3,e=6e4,n=36e5,r="millisecond",i="second",s="minute",u="hour",a="day",o="week",c="month",f="quarter",h="year",d="date",l="Invalid Date",$=/^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,y=/\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,M={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),ordinal:function(t){var e=["th","st","nd","rd"],n=t%100;return"["+t+(e[(n-20)%10]||e[n]||e[0])+"]"}},m=function(t,e,n){var r=String(t);return!r||r.length>=e?t:""+Array(e+1-r.length).join(n)+t},v={s:m,z:function(t){var e=-t.utcOffset(),n=Math.abs(e),r=Math.floor(n/60),i=n%60;return(e<=0?"+":"-")+m(r,2,"0")+":"+m(i,2,"0")},m:function t(e,n){if(e.date()<n.date())return-t(n,e);var r=12*(n.year()-e.year())+(n.month()-e.month()),i=e.clone().add(r,c),s=n-i<0,u=e.clone().add(r+(s?-1:1),c);return+(-(r+(n-i)/(s?i-u:u-i))||0)},a:function(t){return t<0?Math.ceil(t)||0:Math.floor(t)},p:function(t){return{M:c,y:h,w:o,d:a,D:d,h:u,m:s,s:i,ms:r,Q:f}[t]||String(t||"").toLowerCase().replace(/s$/,"")},u:function(t){return void 0===t}},g="en",D={};D[g]=M;var p="$isDayjsObject",S=function(t){return t instanceof _||!(!t||!t[p])},w=function t(e,n,r){var i;if(!e)return g;if("string"==typeof e){var s=e.toLowerCase();D[s]&&(i=s),n&&(D[s]=n,i=s);var u=e.split("-");if(!i&&u.length>1)return t(u[0])}else{var a=e.name;D[a]=e,i=a}return!r&&i&&(g=i),i||!r&&g},O=function(t,e){if(S(t))return t.clone();var n="object"==typeof e?e:{};return n.date=t,n.args=arguments,new _(n)},b=v;b.l=w,b.i=S,b.w=function(t,e){return O(t,{locale:e.$L,utc:e.$u,x:e.$x,$offset:e.$offset})};var _=function(){function M(t){this.$L=w(t.locale,null,!0),this.parse(t),this.$x=this.$x||t.x||{},this[p]=!0}var m=M.prototype;return m.parse=function(t){this.$d=function(t){var e=t.date,n=t.utc;if(null===e)return new Date(NaN);if(b.u(e))return new Date;if(e instanceof Date)return new Date(e);if("string"==typeof e&&!/Z$/i.test(e)){var r=e.match($);if(r){var i=r[2]-1||0,s=(r[7]||"0").substring(0,3);return n?new Date(Date.UTC(r[1],i,r[3]||1,r[4]||0,r[5]||0,r[6]||0,s)):new Date(r[1],i,r[3]||1,r[4]||0,r[5]||0,r[6]||0,s)}}return new Date(e)}(t),this.init()},m.init=function(){var t=this.$d;this.$y=t.getFullYear(),this.$M=t.getMonth(),this.$D=t.getDate(),this.$W=t.getDay(),this.$H=t.getHours(),this.$m=t.getMinutes(),this.$s=t.getSeconds(),this.$ms=t.getMilliseconds()},m.$utils=function(){return b},m.isValid=function(){return!(this.$d.toString()===l)},m.isSame=function(t,e){var n=O(t);return this.startOf(e)<=n&&n<=this.endOf(e)},m.isAfter=function(t,e){return O(t)<this.startOf(e)},m.isBefore=function(t,e){return this.endOf(e)<O(t)},m.$g=function(t,e,n){return b.u(t)?this[e]:this.set(n,t)},m.unix=function(){return Math.floor(this.valueOf()/1e3)},m.valueOf=function(){return this.$d.getTime()},m.startOf=function(t,e){var n=this,r=!!b.u(e)||e,f=b.p(t),l=function(t,e){var i=b.w(n.$u?Date.UTC(n.$y,e,t):new Date(n.$y,e,t),n);return r?i:i.endOf(a)},$=function(t,e){return b.w(n.toDate()[t].apply(n.toDate("s"),(r?[0,0,0,0]:[23,59,59,999]).slice(e)),n)},y=this.$W,M=this.$M,m=this.$D,v="set"+(this.$u?"UTC":"");switch(f){case h:return r?l(1,0):l(31,11);case c:return r?l(1,M):l(0,M+1);case o:var g=this.$locale().weekStart||0,D=(y<g?y+7:y)-g;return l(r?m-D:m+(6-D),M);case a:case d:return $(v+"Hours",0);case u:return $(v+"Minutes",1);case s:return $(v+"Seconds",2);case i:return $(v+"Milliseconds",3);default:return this.clone()}},m.endOf=function(t){return this.startOf(t,!1)},m.$set=function(t,e){var n,o=b.p(t),f="set"+(this.$u?"UTC":""),l=(n={},n[a]=f+"Date",n[d]=f+"Date",n[c]=f+"Month",n[h]=f+"FullYear",n[u]=f+"Hours",n[s]=f+"Minutes",n[i]=f+"Seconds",n[r]=f+"Milliseconds",n)[o],$=o===a?this.$D+(e-this.$W):e;if(o===c||o===h){var y=this.clone().set(d,1);y.$d[l]($),y.init(),this.$d=y.set(d,Math.min(this.$D,y.daysInMonth())).$d}else l&&this.$d[l]($);return this.init(),this},m.set=function(t,e){return this.clone().$set(t,e)},m.get=function(t){return this[b.p(t)]()},m.add=function(r,f){var d,l=this;r=Number(r);var $=b.p(f),y=function(t){var e=O(l);return b.w(e.date(e.date()+Math.round(t*r)),l)};if($===c)return this.set(c,this.$M+r);if($===h)return this.set(h,this.$y+r);if($===a)return y(1);if($===o)return y(7);var M=(d={},d[s]=e,d[u]=n,d[i]=t,d)[$]||1,m=this.$d.getTime()+r*M;return b.w(m,this)},m.subtract=function(t,e){return this.add(-1*t,e)},m.format=function(t){var e=this,n=this.$locale();if(!this.isValid())return n.invalidDate||l;var r=t||"YYYY-MM-DDTHH:mm:ssZ",i=b.z(this),s=this.$H,u=this.$m,a=this.$M,o=n.weekdays,c=n.months,f=n.meridiem,h=function(t,n,i,s){return t&&(t[n]||t(e,r))||i[n].slice(0,s)},d=function(t){return b.s(s%12||12,t,"0")},$=f||function(t,e,n){var r=t<12?"AM":"PM";return n?r.toLowerCase():r};return r.replace(y,(function(t,r){return r||function(t){switch(t){case"YY":return String(e.$y).slice(-2);case"YYYY":return b.s(e.$y,4,"0");case"M":return a+1;case"MM":return b.s(a+1,2,"0");case"MMM":return h(n.monthsShort,a,c,3);case"MMMM":return h(c,a);case"D":return e.$D;case"DD":return b.s(e.$D,2,"0");case"d":return String(e.$W);case"dd":return h(n.weekdaysMin,e.$W,o,2);case"ddd":return h(n.weekdaysShort,e.$W,o,3);case"dddd":return o[e.$W];case"H":return String(s);case"HH":return b.s(s,2,"0");case"h":return d(1);case"hh":return d(2);case"a":return $(s,u,!0);case"A":return $(s,u,!1);case"m":return String(u);case"mm":return b.s(u,2,"0");case"s":return String(e.$s);case"ss":return b.s(e.$s,2,"0");case"SSS":return b.s(e.$ms,3,"0");case"Z":return i}return null}(t)||i.replace(":","")}))},m.utcOffset=function(){return 15*-Math.round(this.$d.getTimezoneOffset()/15)},m.diff=function(r,d,l){var $,y=this,M=b.p(d),m=O(r),v=(m.utcOffset()-this.utcOffset())*e,g=this-m,D=function(){return b.m(y,m)};switch(M){case h:$=D()/12;break;case c:$=D();break;case f:$=D()/3;break;case o:$=(g-v)/6048e5;break;case a:$=(g-v)/864e5;break;case u:$=g/n;break;case s:$=g/e;break;case i:$=g/t;break;default:$=g}return l?$:b.a($)},m.daysInMonth=function(){return this.endOf(c).$D},m.$locale=function(){return D[this.$L]},m.locale=function(t,e){if(!t)return this.$L;var n=this.clone(),r=w(t,e,!0);return r&&(n.$L=r),n},m.clone=function(){return b.w(this.$d,this)},m.toDate=function(){return new Date(this.valueOf())},m.toJSON=function(){return this.isValid()?this.toISOString():null},m.toISOString=function(){return this.$d.toISOString()},m.toString=function(){return this.$d.toUTCString()},M}(),k=_.prototype;return O.prototype=k,[["$ms",r],["$s",i],["$m",s],["$H",u],["$W",a],["$M",c],["$y",h],["$D",d]].forEach((function(t){k[t[1]]=function(e){return this.$g(e,t[0],t[1])}})),O.extend=function(t,e){return t.$i||(t(e,_,O),t.$i=!0),O},O.locale=w,O.isDayjs=S,O.unix=function(t){return O(1e3*t)},O.en=D[g],O.Ls=D,O.p={},O}));

/***/ }),

/***/ 5279:
/***/ (function(module) {

!function(t,i){ true?module.exports=i():0}(this,(function(){"use strict";var t="minute",i=/[+-]\d\d(?::?\d\d)?/g,e=/([+-]|\d\d)/g;return function(s,f,n){var u=f.prototype;n.utc=function(t){var i={date:t,utc:!0,args:arguments};return new f(i)},u.utc=function(i){var e=n(this.toDate(),{locale:this.$L,utc:!0});return i?e.add(this.utcOffset(),t):e},u.local=function(){return n(this.toDate(),{locale:this.$L,utc:!1})};var o=u.parse;u.parse=function(t){t.utc&&(this.$u=!0),this.$utils().u(t.$offset)||(this.$offset=t.$offset),o.call(this,t)};var r=u.init;u.init=function(){if(this.$u){var t=this.$d;this.$y=t.getUTCFullYear(),this.$M=t.getUTCMonth(),this.$D=t.getUTCDate(),this.$W=t.getUTCDay(),this.$H=t.getUTCHours(),this.$m=t.getUTCMinutes(),this.$s=t.getUTCSeconds(),this.$ms=t.getUTCMilliseconds()}else r.call(this)};var a=u.utcOffset;u.utcOffset=function(s,f){var n=this.$utils().u;if(n(s))return this.$u?0:n(this.$offset)?a.call(this):this.$offset;if("string"==typeof s&&(s=function(t){void 0===t&&(t="");var s=t.match(i);if(!s)return null;var f=(""+s[0]).match(e)||["-",0,0],n=f[0],u=60*+f[1]+ +f[2];return 0===u?0:"+"===n?u:-u}(s),null===s))return this;var u=Math.abs(s)<=16?60*s:s,o=this;if(f)return o.$offset=u,o.$u=0===s,o;if(0!==s){var r=this.$u?this.toDate().getTimezoneOffset():-1*this.utcOffset();(o=this.local().add(u+r,t)).$offset=u,o.$x.$localOffset=r}else o=this.utc();return o};var h=u.format;u.format=function(t){var i=t||(this.$u?"YYYY-MM-DDTHH:mm:ss[Z]":"");return h.call(this,i)},u.valueOf=function(){var t=this.$utils().u(this.$offset)?0:this.$offset+(this.$x.$localOffset||this.$d.getTimezoneOffset());return this.$d.valueOf()-6e4*t},u.isUTC=function(){return!!this.$u},u.toISOString=function(){return this.toDate().toISOString()},u.toString=function(){return this.toDate().toUTCString()};var l=u.toDate;u.toDate=function(t){return"s"===t&&this.$offset?n(this.format("YYYY-MM-DD HH:mm:ss:SSS")).toDate():l.call(this)};var c=u.diff;u.diff=function(t,i,e){if(t&&this.$u===t.$u)return c.call(this,t,i,e);var s=this.local(),f=n(t).local();return c.call(s,f,i,e)}}}));

/***/ }),

/***/ 4006:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


module.exports = __nccwpck_require__(8016);


/***/ }),

/***/ 5595:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const path = __nccwpck_require__(6928);
const WIN_SLASH = '\\\\/';
const WIN_NO_SLASH = `[^${WIN_SLASH}]`;

/**
 * Posix glob regex
 */

const DOT_LITERAL = '\\.';
const PLUS_LITERAL = '\\+';
const QMARK_LITERAL = '\\?';
const SLASH_LITERAL = '\\/';
const ONE_CHAR = '(?=.)';
const QMARK = '[^/]';
const END_ANCHOR = `(?:${SLASH_LITERAL}|$)`;
const START_ANCHOR = `(?:^|${SLASH_LITERAL})`;
const DOTS_SLASH = `${DOT_LITERAL}{1,2}${END_ANCHOR}`;
const NO_DOT = `(?!${DOT_LITERAL})`;
const NO_DOTS = `(?!${START_ANCHOR}${DOTS_SLASH})`;
const NO_DOT_SLASH = `(?!${DOT_LITERAL}{0,1}${END_ANCHOR})`;
const NO_DOTS_SLASH = `(?!${DOTS_SLASH})`;
const QMARK_NO_DOT = `[^.${SLASH_LITERAL}]`;
const STAR = `${QMARK}*?`;

const POSIX_CHARS = {
  DOT_LITERAL,
  PLUS_LITERAL,
  QMARK_LITERAL,
  SLASH_LITERAL,
  ONE_CHAR,
  QMARK,
  END_ANCHOR,
  DOTS_SLASH,
  NO_DOT,
  NO_DOTS,
  NO_DOT_SLASH,
  NO_DOTS_SLASH,
  QMARK_NO_DOT,
  STAR,
  START_ANCHOR
};

/**
 * Windows glob regex
 */

const WINDOWS_CHARS = {
  ...POSIX_CHARS,

  SLASH_LITERAL: `[${WIN_SLASH}]`,
  QMARK: WIN_NO_SLASH,
  STAR: `${WIN_NO_SLASH}*?`,
  DOTS_SLASH: `${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$)`,
  NO_DOT: `(?!${DOT_LITERAL})`,
  NO_DOTS: `(?!(?:^|[${WIN_SLASH}])${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
  NO_DOT_SLASH: `(?!${DOT_LITERAL}{0,1}(?:[${WIN_SLASH}]|$))`,
  NO_DOTS_SLASH: `(?!${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
  QMARK_NO_DOT: `[^.${WIN_SLASH}]`,
  START_ANCHOR: `(?:^|[${WIN_SLASH}])`,
  END_ANCHOR: `(?:[${WIN_SLASH}]|$)`
};

/**
 * POSIX Bracket Regex
 */

const POSIX_REGEX_SOURCE = {
  alnum: 'a-zA-Z0-9',
  alpha: 'a-zA-Z',
  ascii: '\\x00-\\x7F',
  blank: ' \\t',
  cntrl: '\\x00-\\x1F\\x7F',
  digit: '0-9',
  graph: '\\x21-\\x7E',
  lower: 'a-z',
  print: '\\x20-\\x7E ',
  punct: '\\-!"#$%&\'()\\*+,./:;<=>?@[\\]^_`{|}~',
  space: ' \\t\\r\\n\\v\\f',
  upper: 'A-Z',
  word: 'A-Za-z0-9_',
  xdigit: 'A-Fa-f0-9'
};

module.exports = {
  MAX_LENGTH: 1024 * 64,
  POSIX_REGEX_SOURCE,

  // regular expressions
  REGEX_BACKSLASH: /\\(?![*+?^${}(|)[\]])/g,
  REGEX_NON_SPECIAL_CHARS: /^[^@![\].,$*+?^{}()|\\/]+/,
  REGEX_SPECIAL_CHARS: /[-*+?.^${}(|)[\]]/,
  REGEX_SPECIAL_CHARS_BACKREF: /(\\?)((\W)(\3*))/g,
  REGEX_SPECIAL_CHARS_GLOBAL: /([-*+?.^${}(|)[\]])/g,
  REGEX_REMOVE_BACKSLASH: /(?:\[.*?[^\\]\]|\\(?=.))/g,

  // Replace globs with equivalent patterns to reduce parsing time.
  REPLACEMENTS: {
    '***': '*',
    '**/**': '**',
    '**/**/**': '**'
  },

  // Digits
  CHAR_0: 48, /* 0 */
  CHAR_9: 57, /* 9 */

  // Alphabet chars.
  CHAR_UPPERCASE_A: 65, /* A */
  CHAR_LOWERCASE_A: 97, /* a */
  CHAR_UPPERCASE_Z: 90, /* Z */
  CHAR_LOWERCASE_Z: 122, /* z */

  CHAR_LEFT_PARENTHESES: 40, /* ( */
  CHAR_RIGHT_PARENTHESES: 41, /* ) */

  CHAR_ASTERISK: 42, /* * */

  // Non-alphabetic chars.
  CHAR_AMPERSAND: 38, /* & */
  CHAR_AT: 64, /* @ */
  CHAR_BACKWARD_SLASH: 92, /* \ */
  CHAR_CARRIAGE_RETURN: 13, /* \r */
  CHAR_CIRCUMFLEX_ACCENT: 94, /* ^ */
  CHAR_COLON: 58, /* : */
  CHAR_COMMA: 44, /* , */
  CHAR_DOT: 46, /* . */
  CHAR_DOUBLE_QUOTE: 34, /* " */
  CHAR_EQUAL: 61, /* = */
  CHAR_EXCLAMATION_MARK: 33, /* ! */
  CHAR_FORM_FEED: 12, /* \f */
  CHAR_FORWARD_SLASH: 47, /* / */
  CHAR_GRAVE_ACCENT: 96, /* ` */
  CHAR_HASH: 35, /* # */
  CHAR_HYPHEN_MINUS: 45, /* - */
  CHAR_LEFT_ANGLE_BRACKET: 60, /* < */
  CHAR_LEFT_CURLY_BRACE: 123, /* { */
  CHAR_LEFT_SQUARE_BRACKET: 91, /* [ */
  CHAR_LINE_FEED: 10, /* \n */
  CHAR_NO_BREAK_SPACE: 160, /* \u00A0 */
  CHAR_PERCENT: 37, /* % */
  CHAR_PLUS: 43, /* + */
  CHAR_QUESTION_MARK: 63, /* ? */
  CHAR_RIGHT_ANGLE_BRACKET: 62, /* > */
  CHAR_RIGHT_CURLY_BRACE: 125, /* } */
  CHAR_RIGHT_SQUARE_BRACKET: 93, /* ] */
  CHAR_SEMICOLON: 59, /* ; */
  CHAR_SINGLE_QUOTE: 39, /* ' */
  CHAR_SPACE: 32, /*   */
  CHAR_TAB: 9, /* \t */
  CHAR_UNDERSCORE: 95, /* _ */
  CHAR_VERTICAL_LINE: 124, /* | */
  CHAR_ZERO_WIDTH_NOBREAK_SPACE: 65279, /* \uFEFF */

  SEP: path.sep,

  /**
   * Create EXTGLOB_CHARS
   */

  extglobChars(chars) {
    return {
      '!': { type: 'negate', open: '(?:(?!(?:', close: `))${chars.STAR})` },
      '?': { type: 'qmark', open: '(?:', close: ')?' },
      '+': { type: 'plus', open: '(?:', close: ')+' },
      '*': { type: 'star', open: '(?:', close: ')*' },
      '@': { type: 'at', open: '(?:', close: ')' }
    };
  },

  /**
   * Create GLOB_CHARS
   */

  globChars(win32) {
    return win32 === true ? WINDOWS_CHARS : POSIX_CHARS;
  }
};


/***/ }),

/***/ 8265:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const constants = __nccwpck_require__(5595);
const utils = __nccwpck_require__(4059);

/**
 * Constants
 */

const {
  MAX_LENGTH,
  POSIX_REGEX_SOURCE,
  REGEX_NON_SPECIAL_CHARS,
  REGEX_SPECIAL_CHARS_BACKREF,
  REPLACEMENTS
} = constants;

/**
 * Helpers
 */

const expandRange = (args, options) => {
  if (typeof options.expandRange === 'function') {
    return options.expandRange(...args, options);
  }

  args.sort();
  const value = `[${args.join('-')}]`;

  try {
    /* eslint-disable-next-line no-new */
    new RegExp(value);
  } catch (ex) {
    return args.map(v => utils.escapeRegex(v)).join('..');
  }

  return value;
};

/**
 * Create the message for a syntax error
 */

const syntaxError = (type, char) => {
  return `Missing ${type}: "${char}" - use "\\\\${char}" to match literal characters`;
};

/**
 * Parse the given input string.
 * @param {String} input
 * @param {Object} options
 * @return {Object}
 */

const parse = (input, options) => {
  if (typeof input !== 'string') {
    throw new TypeError('Expected a string');
  }

  input = REPLACEMENTS[input] || input;

  const opts = { ...options };
  const max = typeof opts.maxLength === 'number' ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;

  let len = input.length;
  if (len > max) {
    throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
  }

  const bos = { type: 'bos', value: '', output: opts.prepend || '' };
  const tokens = [bos];

  const capture = opts.capture ? '' : '?:';
  const win32 = utils.isWindows(options);

  // create constants based on platform, for windows or posix
  const PLATFORM_CHARS = constants.globChars(win32);
  const EXTGLOB_CHARS = constants.extglobChars(PLATFORM_CHARS);

  const {
    DOT_LITERAL,
    PLUS_LITERAL,
    SLASH_LITERAL,
    ONE_CHAR,
    DOTS_SLASH,
    NO_DOT,
    NO_DOT_SLASH,
    NO_DOTS_SLASH,
    QMARK,
    QMARK_NO_DOT,
    STAR,
    START_ANCHOR
  } = PLATFORM_CHARS;

  const globstar = opts => {
    return `(${capture}(?:(?!${START_ANCHOR}${opts.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
  };

  const nodot = opts.dot ? '' : NO_DOT;
  const qmarkNoDot = opts.dot ? QMARK : QMARK_NO_DOT;
  let star = opts.bash === true ? globstar(opts) : STAR;

  if (opts.capture) {
    star = `(${star})`;
  }

  // minimatch options support
  if (typeof opts.noext === 'boolean') {
    opts.noextglob = opts.noext;
  }

  const state = {
    input,
    index: -1,
    start: 0,
    dot: opts.dot === true,
    consumed: '',
    output: '',
    prefix: '',
    backtrack: false,
    negated: false,
    brackets: 0,
    braces: 0,
    parens: 0,
    quotes: 0,
    globstar: false,
    tokens
  };

  input = utils.removePrefix(input, state);
  len = input.length;

  const extglobs = [];
  const braces = [];
  const stack = [];
  let prev = bos;
  let value;

  /**
   * Tokenizing helpers
   */

  const eos = () => state.index === len - 1;
  const peek = state.peek = (n = 1) => input[state.index + n];
  const advance = state.advance = () => input[++state.index] || '';
  const remaining = () => input.slice(state.index + 1);
  const consume = (value = '', num = 0) => {
    state.consumed += value;
    state.index += num;
  };

  const append = token => {
    state.output += token.output != null ? token.output : token.value;
    consume(token.value);
  };

  const negate = () => {
    let count = 1;

    while (peek() === '!' && (peek(2) !== '(' || peek(3) === '?')) {
      advance();
      state.start++;
      count++;
    }

    if (count % 2 === 0) {
      return false;
    }

    state.negated = true;
    state.start++;
    return true;
  };

  const increment = type => {
    state[type]++;
    stack.push(type);
  };

  const decrement = type => {
    state[type]--;
    stack.pop();
  };

  /**
   * Push tokens onto the tokens array. This helper speeds up
   * tokenizing by 1) helping us avoid backtracking as much as possible,
   * and 2) helping us avoid creating extra tokens when consecutive
   * characters are plain text. This improves performance and simplifies
   * lookbehinds.
   */

  const push = tok => {
    if (prev.type === 'globstar') {
      const isBrace = state.braces > 0 && (tok.type === 'comma' || tok.type === 'brace');
      const isExtglob = tok.extglob === true || (extglobs.length && (tok.type === 'pipe' || tok.type === 'paren'));

      if (tok.type !== 'slash' && tok.type !== 'paren' && !isBrace && !isExtglob) {
        state.output = state.output.slice(0, -prev.output.length);
        prev.type = 'star';
        prev.value = '*';
        prev.output = star;
        state.output += prev.output;
      }
    }

    if (extglobs.length && tok.type !== 'paren') {
      extglobs[extglobs.length - 1].inner += tok.value;
    }

    if (tok.value || tok.output) append(tok);
    if (prev && prev.type === 'text' && tok.type === 'text') {
      prev.value += tok.value;
      prev.output = (prev.output || '') + tok.value;
      return;
    }

    tok.prev = prev;
    tokens.push(tok);
    prev = tok;
  };

  const extglobOpen = (type, value) => {
    const token = { ...EXTGLOB_CHARS[value], conditions: 1, inner: '' };

    token.prev = prev;
    token.parens = state.parens;
    token.output = state.output;
    const output = (opts.capture ? '(' : '') + token.open;

    increment('parens');
    push({ type, value, output: state.output ? '' : ONE_CHAR });
    push({ type: 'paren', extglob: true, value: advance(), output });
    extglobs.push(token);
  };

  const extglobClose = token => {
    let output = token.close + (opts.capture ? ')' : '');
    let rest;

    if (token.type === 'negate') {
      let extglobStar = star;

      if (token.inner && token.inner.length > 1 && token.inner.includes('/')) {
        extglobStar = globstar(opts);
      }

      if (extglobStar !== star || eos() || /^\)+$/.test(remaining())) {
        output = token.close = `)$))${extglobStar}`;
      }

      if (token.inner.includes('*') && (rest = remaining()) && /^\.[^\\/.]+$/.test(rest)) {
        // Any non-magical string (`.ts`) or even nested expression (`.{ts,tsx}`) can follow after the closing parenthesis.
        // In this case, we need to parse the string and use it in the output of the original pattern.
        // Suitable patterns: `/!(*.d).ts`, `/!(*.d).{ts,tsx}`, `**/!(*-dbg).@(js)`.
        //
        // Disabling the `fastpaths` option due to a problem with parsing strings as `.ts` in the pattern like `**/!(*.d).ts`.
        const expression = parse(rest, { ...options, fastpaths: false }).output;

        output = token.close = `)${expression})${extglobStar})`;
      }

      if (token.prev.type === 'bos') {
        state.negatedExtglob = true;
      }
    }

    push({ type: 'paren', extglob: true, value, output });
    decrement('parens');
  };

  /**
   * Fast paths
   */

  if (opts.fastpaths !== false && !/(^[*!]|[/()[\]{}"])/.test(input)) {
    let backslashes = false;

    let output = input.replace(REGEX_SPECIAL_CHARS_BACKREF, (m, esc, chars, first, rest, index) => {
      if (first === '\\') {
        backslashes = true;
        return m;
      }

      if (first === '?') {
        if (esc) {
          return esc + first + (rest ? QMARK.repeat(rest.length) : '');
        }
        if (index === 0) {
          return qmarkNoDot + (rest ? QMARK.repeat(rest.length) : '');
        }
        return QMARK.repeat(chars.length);
      }

      if (first === '.') {
        return DOT_LITERAL.repeat(chars.length);
      }

      if (first === '*') {
        if (esc) {
          return esc + first + (rest ? star : '');
        }
        return star;
      }
      return esc ? m : `\\${m}`;
    });

    if (backslashes === true) {
      if (opts.unescape === true) {
        output = output.replace(/\\/g, '');
      } else {
        output = output.replace(/\\+/g, m => {
          return m.length % 2 === 0 ? '\\\\' : (m ? '\\' : '');
        });
      }
    }

    if (output === input && opts.contains === true) {
      state.output = input;
      return state;
    }

    state.output = utils.wrapOutput(output, state, options);
    return state;
  }

  /**
   * Tokenize input until we reach end-of-string
   */

  while (!eos()) {
    value = advance();

    if (value === '\u0000') {
      continue;
    }

    /**
     * Escaped characters
     */

    if (value === '\\') {
      const next = peek();

      if (next === '/' && opts.bash !== true) {
        continue;
      }

      if (next === '.' || next === ';') {
        continue;
      }

      if (!next) {
        value += '\\';
        push({ type: 'text', value });
        continue;
      }

      // collapse slashes to reduce potential for exploits
      const match = /^\\+/.exec(remaining());
      let slashes = 0;

      if (match && match[0].length > 2) {
        slashes = match[0].length;
        state.index += slashes;
        if (slashes % 2 !== 0) {
          value += '\\';
        }
      }

      if (opts.unescape === true) {
        value = advance();
      } else {
        value += advance();
      }

      if (state.brackets === 0) {
        push({ type: 'text', value });
        continue;
      }
    }

    /**
     * If we're inside a regex character class, continue
     * until we reach the closing bracket.
     */

    if (state.brackets > 0 && (value !== ']' || prev.value === '[' || prev.value === '[^')) {
      if (opts.posix !== false && value === ':') {
        const inner = prev.value.slice(1);
        if (inner.includes('[')) {
          prev.posix = true;

          if (inner.includes(':')) {
            const idx = prev.value.lastIndexOf('[');
            const pre = prev.value.slice(0, idx);
            const rest = prev.value.slice(idx + 2);
            const posix = POSIX_REGEX_SOURCE[rest];
            if (posix) {
              prev.value = pre + posix;
              state.backtrack = true;
              advance();

              if (!bos.output && tokens.indexOf(prev) === 1) {
                bos.output = ONE_CHAR;
              }
              continue;
            }
          }
        }
      }

      if ((value === '[' && peek() !== ':') || (value === '-' && peek() === ']')) {
        value = `\\${value}`;
      }

      if (value === ']' && (prev.value === '[' || prev.value === '[^')) {
        value = `\\${value}`;
      }

      if (opts.posix === true && value === '!' && prev.value === '[') {
        value = '^';
      }

      prev.value += value;
      append({ value });
      continue;
    }

    /**
     * If we're inside a quoted string, continue
     * until we reach the closing double quote.
     */

    if (state.quotes === 1 && value !== '"') {
      value = utils.escapeRegex(value);
      prev.value += value;
      append({ value });
      continue;
    }

    /**
     * Double quotes
     */

    if (value === '"') {
      state.quotes = state.quotes === 1 ? 0 : 1;
      if (opts.keepQuotes === true) {
        push({ type: 'text', value });
      }
      continue;
    }

    /**
     * Parentheses
     */

    if (value === '(') {
      increment('parens');
      push({ type: 'paren', value });
      continue;
    }

    if (value === ')') {
      if (state.parens === 0 && opts.strictBrackets === true) {
        throw new SyntaxError(syntaxError('opening', '('));
      }

      const extglob = extglobs[extglobs.length - 1];
      if (extglob && state.parens === extglob.parens + 1) {
        extglobClose(extglobs.pop());
        continue;
      }

      push({ type: 'paren', value, output: state.parens ? ')' : '\\)' });
      decrement('parens');
      continue;
    }

    /**
     * Square brackets
     */

    if (value === '[') {
      if (opts.nobracket === true || !remaining().includes(']')) {
        if (opts.nobracket !== true && opts.strictBrackets === true) {
          throw new SyntaxError(syntaxError('closing', ']'));
        }

        value = `\\${value}`;
      } else {
        increment('brackets');
      }

      push({ type: 'bracket', value });
      continue;
    }

    if (value === ']') {
      if (opts.nobracket === true || (prev && prev.type === 'bracket' && prev.value.length === 1)) {
        push({ type: 'text', value, output: `\\${value}` });
        continue;
      }

      if (state.brackets === 0) {
        if (opts.strictBrackets === true) {
          throw new SyntaxError(syntaxError('opening', '['));
        }

        push({ type: 'text', value, output: `\\${value}` });
        continue;
      }

      decrement('brackets');

      const prevValue = prev.value.slice(1);
      if (prev.posix !== true && prevValue[0] === '^' && !prevValue.includes('/')) {
        value = `/${value}`;
      }

      prev.value += value;
      append({ value });

      // when literal brackets are explicitly disabled
      // assume we should match with a regex character class
      if (opts.literalBrackets === false || utils.hasRegexChars(prevValue)) {
        continue;
      }

      const escaped = utils.escapeRegex(prev.value);
      state.output = state.output.slice(0, -prev.value.length);

      // when literal brackets are explicitly enabled
      // assume we should escape the brackets to match literal characters
      if (opts.literalBrackets === true) {
        state.output += escaped;
        prev.value = escaped;
        continue;
      }

      // when the user specifies nothing, try to match both
      prev.value = `(${capture}${escaped}|${prev.value})`;
      state.output += prev.value;
      continue;
    }

    /**
     * Braces
     */

    if (value === '{' && opts.nobrace !== true) {
      increment('braces');

      const open = {
        type: 'brace',
        value,
        output: '(',
        outputIndex: state.output.length,
        tokensIndex: state.tokens.length
      };

      braces.push(open);
      push(open);
      continue;
    }

    if (value === '}') {
      const brace = braces[braces.length - 1];

      if (opts.nobrace === true || !brace) {
        push({ type: 'text', value, output: value });
        continue;
      }

      let output = ')';

      if (brace.dots === true) {
        const arr = tokens.slice();
        const range = [];

        for (let i = arr.length - 1; i >= 0; i--) {
          tokens.pop();
          if (arr[i].type === 'brace') {
            break;
          }
          if (arr[i].type !== 'dots') {
            range.unshift(arr[i].value);
          }
        }

        output = expandRange(range, opts);
        state.backtrack = true;
      }

      if (brace.comma !== true && brace.dots !== true) {
        const out = state.output.slice(0, brace.outputIndex);
        const toks = state.tokens.slice(brace.tokensIndex);
        brace.value = brace.output = '\\{';
        value = output = '\\}';
        state.output = out;
        for (const t of toks) {
          state.output += (t.output || t.value);
        }
      }

      push({ type: 'brace', value, output });
      decrement('braces');
      braces.pop();
      continue;
    }

    /**
     * Pipes
     */

    if (value === '|') {
      if (extglobs.length > 0) {
        extglobs[extglobs.length - 1].conditions++;
      }
      push({ type: 'text', value });
      continue;
    }

    /**
     * Commas
     */

    if (value === ',') {
      let output = value;

      const brace = braces[braces.length - 1];
      if (brace && stack[stack.length - 1] === 'braces') {
        brace.comma = true;
        output = '|';
      }

      push({ type: 'comma', value, output });
      continue;
    }

    /**
     * Slashes
     */

    if (value === '/') {
      // if the beginning of the glob is "./", advance the start
      // to the current index, and don't add the "./" characters
      // to the state. This greatly simplifies lookbehinds when
      // checking for BOS characters like "!" and "." (not "./")
      if (prev.type === 'dot' && state.index === state.start + 1) {
        state.start = state.index + 1;
        state.consumed = '';
        state.output = '';
        tokens.pop();
        prev = bos; // reset "prev" to the first token
        continue;
      }

      push({ type: 'slash', value, output: SLASH_LITERAL });
      continue;
    }

    /**
     * Dots
     */

    if (value === '.') {
      if (state.braces > 0 && prev.type === 'dot') {
        if (prev.value === '.') prev.output = DOT_LITERAL;
        const brace = braces[braces.length - 1];
        prev.type = 'dots';
        prev.output += value;
        prev.value += value;
        brace.dots = true;
        continue;
      }

      if ((state.braces + state.parens) === 0 && prev.type !== 'bos' && prev.type !== 'slash') {
        push({ type: 'text', value, output: DOT_LITERAL });
        continue;
      }

      push({ type: 'dot', value, output: DOT_LITERAL });
      continue;
    }

    /**
     * Question marks
     */

    if (value === '?') {
      const isGroup = prev && prev.value === '(';
      if (!isGroup && opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
        extglobOpen('qmark', value);
        continue;
      }

      if (prev && prev.type === 'paren') {
        const next = peek();
        let output = value;

        if (next === '<' && !utils.supportsLookbehinds()) {
          throw new Error('Node.js v10 or higher is required for regex lookbehinds');
        }

        if ((prev.value === '(' && !/[!=<:]/.test(next)) || (next === '<' && !/<([!=]|\w+>)/.test(remaining()))) {
          output = `\\${value}`;
        }

        push({ type: 'text', value, output });
        continue;
      }

      if (opts.dot !== true && (prev.type === 'slash' || prev.type === 'bos')) {
        push({ type: 'qmark', value, output: QMARK_NO_DOT });
        continue;
      }

      push({ type: 'qmark', value, output: QMARK });
      continue;
    }

    /**
     * Exclamation
     */

    if (value === '!') {
      if (opts.noextglob !== true && peek() === '(') {
        if (peek(2) !== '?' || !/[!=<:]/.test(peek(3))) {
          extglobOpen('negate', value);
          continue;
        }
      }

      if (opts.nonegate !== true && state.index === 0) {
        negate();
        continue;
      }
    }

    /**
     * Plus
     */

    if (value === '+') {
      if (opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
        extglobOpen('plus', value);
        continue;
      }

      if ((prev && prev.value === '(') || opts.regex === false) {
        push({ type: 'plus', value, output: PLUS_LITERAL });
        continue;
      }

      if ((prev && (prev.type === 'bracket' || prev.type === 'paren' || prev.type === 'brace')) || state.parens > 0) {
        push({ type: 'plus', value });
        continue;
      }

      push({ type: 'plus', value: PLUS_LITERAL });
      continue;
    }

    /**
     * Plain text
     */

    if (value === '@') {
      if (opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
        push({ type: 'at', extglob: true, value, output: '' });
        continue;
      }

      push({ type: 'text', value });
      continue;
    }

    /**
     * Plain text
     */

    if (value !== '*') {
      if (value === '$' || value === '^') {
        value = `\\${value}`;
      }

      const match = REGEX_NON_SPECIAL_CHARS.exec(remaining());
      if (match) {
        value += match[0];
        state.index += match[0].length;
      }

      push({ type: 'text', value });
      continue;
    }

    /**
     * Stars
     */

    if (prev && (prev.type === 'globstar' || prev.star === true)) {
      prev.type = 'star';
      prev.star = true;
      prev.value += value;
      prev.output = star;
      state.backtrack = true;
      state.globstar = true;
      consume(value);
      continue;
    }

    let rest = remaining();
    if (opts.noextglob !== true && /^\([^?]/.test(rest)) {
      extglobOpen('star', value);
      continue;
    }

    if (prev.type === 'star') {
      if (opts.noglobstar === true) {
        consume(value);
        continue;
      }

      const prior = prev.prev;
      const before = prior.prev;
      const isStart = prior.type === 'slash' || prior.type === 'bos';
      const afterStar = before && (before.type === 'star' || before.type === 'globstar');

      if (opts.bash === true && (!isStart || (rest[0] && rest[0] !== '/'))) {
        push({ type: 'star', value, output: '' });
        continue;
      }

      const isBrace = state.braces > 0 && (prior.type === 'comma' || prior.type === 'brace');
      const isExtglob = extglobs.length && (prior.type === 'pipe' || prior.type === 'paren');
      if (!isStart && prior.type !== 'paren' && !isBrace && !isExtglob) {
        push({ type: 'star', value, output: '' });
        continue;
      }

      // strip consecutive `/**/`
      while (rest.slice(0, 3) === '/**') {
        const after = input[state.index + 4];
        if (after && after !== '/') {
          break;
        }
        rest = rest.slice(3);
        consume('/**', 3);
      }

      if (prior.type === 'bos' && eos()) {
        prev.type = 'globstar';
        prev.value += value;
        prev.output = globstar(opts);
        state.output = prev.output;
        state.globstar = true;
        consume(value);
        continue;
      }

      if (prior.type === 'slash' && prior.prev.type !== 'bos' && !afterStar && eos()) {
        state.output = state.output.slice(0, -(prior.output + prev.output).length);
        prior.output = `(?:${prior.output}`;

        prev.type = 'globstar';
        prev.output = globstar(opts) + (opts.strictSlashes ? ')' : '|$)');
        prev.value += value;
        state.globstar = true;
        state.output += prior.output + prev.output;
        consume(value);
        continue;
      }

      if (prior.type === 'slash' && prior.prev.type !== 'bos' && rest[0] === '/') {
        const end = rest[1] !== void 0 ? '|$' : '';

        state.output = state.output.slice(0, -(prior.output + prev.output).length);
        prior.output = `(?:${prior.output}`;

        prev.type = 'globstar';
        prev.output = `${globstar(opts)}${SLASH_LITERAL}|${SLASH_LITERAL}${end})`;
        prev.value += value;

        state.output += prior.output + prev.output;
        state.globstar = true;

        consume(value + advance());

        push({ type: 'slash', value: '/', output: '' });
        continue;
      }

      if (prior.type === 'bos' && rest[0] === '/') {
        prev.type = 'globstar';
        prev.value += value;
        prev.output = `(?:^|${SLASH_LITERAL}|${globstar(opts)}${SLASH_LITERAL})`;
        state.output = prev.output;
        state.globstar = true;
        consume(value + advance());
        push({ type: 'slash', value: '/', output: '' });
        continue;
      }

      // remove single star from output
      state.output = state.output.slice(0, -prev.output.length);

      // reset previous token to globstar
      prev.type = 'globstar';
      prev.output = globstar(opts);
      prev.value += value;

      // reset output with globstar
      state.output += prev.output;
      state.globstar = true;
      consume(value);
      continue;
    }

    const token = { type: 'star', value, output: star };

    if (opts.bash === true) {
      token.output = '.*?';
      if (prev.type === 'bos' || prev.type === 'slash') {
        token.output = nodot + token.output;
      }
      push(token);
      continue;
    }

    if (prev && (prev.type === 'bracket' || prev.type === 'paren') && opts.regex === true) {
      token.output = value;
      push(token);
      continue;
    }

    if (state.index === state.start || prev.type === 'slash' || prev.type === 'dot') {
      if (prev.type === 'dot') {
        state.output += NO_DOT_SLASH;
        prev.output += NO_DOT_SLASH;

      } else if (opts.dot === true) {
        state.output += NO_DOTS_SLASH;
        prev.output += NO_DOTS_SLASH;

      } else {
        state.output += nodot;
        prev.output += nodot;
      }

      if (peek() !== '*') {
        state.output += ONE_CHAR;
        prev.output += ONE_CHAR;
      }
    }

    push(token);
  }

  while (state.brackets > 0) {
    if (opts.strictBrackets === true) throw new SyntaxError(syntaxError('closing', ']'));
    state.output = utils.escapeLast(state.output, '[');
    decrement('brackets');
  }

  while (state.parens > 0) {
    if (opts.strictBrackets === true) throw new SyntaxError(syntaxError('closing', ')'));
    state.output = utils.escapeLast(state.output, '(');
    decrement('parens');
  }

  while (state.braces > 0) {
    if (opts.strictBrackets === true) throw new SyntaxError(syntaxError('closing', '}'));
    state.output = utils.escapeLast(state.output, '{');
    decrement('braces');
  }

  if (opts.strictSlashes !== true && (prev.type === 'star' || prev.type === 'bracket')) {
    push({ type: 'maybe_slash', value: '', output: `${SLASH_LITERAL}?` });
  }

  // rebuild the output if we had to backtrack at any point
  if (state.backtrack === true) {
    state.output = '';

    for (const token of state.tokens) {
      state.output += token.output != null ? token.output : token.value;

      if (token.suffix) {
        state.output += token.suffix;
      }
    }
  }

  return state;
};

/**
 * Fast paths for creating regular expressions for common glob patterns.
 * This can significantly speed up processing and has very little downside
 * impact when none of the fast paths match.
 */

parse.fastpaths = (input, options) => {
  const opts = { ...options };
  const max = typeof opts.maxLength === 'number' ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
  const len = input.length;
  if (len > max) {
    throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
  }

  input = REPLACEMENTS[input] || input;
  const win32 = utils.isWindows(options);

  // create constants based on platform, for windows or posix
  const {
    DOT_LITERAL,
    SLASH_LITERAL,
    ONE_CHAR,
    DOTS_SLASH,
    NO_DOT,
    NO_DOTS,
    NO_DOTS_SLASH,
    STAR,
    START_ANCHOR
  } = constants.globChars(win32);

  const nodot = opts.dot ? NO_DOTS : NO_DOT;
  const slashDot = opts.dot ? NO_DOTS_SLASH : NO_DOT;
  const capture = opts.capture ? '' : '?:';
  const state = { negated: false, prefix: '' };
  let star = opts.bash === true ? '.*?' : STAR;

  if (opts.capture) {
    star = `(${star})`;
  }

  const globstar = opts => {
    if (opts.noglobstar === true) return star;
    return `(${capture}(?:(?!${START_ANCHOR}${opts.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
  };

  const create = str => {
    switch (str) {
      case '*':
        return `${nodot}${ONE_CHAR}${star}`;

      case '.*':
        return `${DOT_LITERAL}${ONE_CHAR}${star}`;

      case '*.*':
        return `${nodot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;

      case '*/*':
        return `${nodot}${star}${SLASH_LITERAL}${ONE_CHAR}${slashDot}${star}`;

      case '**':
        return nodot + globstar(opts);

      case '**/*':
        return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${ONE_CHAR}${star}`;

      case '**/*.*':
        return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;

      case '**/.*':
        return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${DOT_LITERAL}${ONE_CHAR}${star}`;

      default: {
        const match = /^(.*?)\.(\w+)$/.exec(str);
        if (!match) return;

        const source = create(match[1]);
        if (!source) return;

        return source + DOT_LITERAL + match[2];
      }
    }
  };

  const output = utils.removePrefix(input, state);
  let source = create(output);

  if (source && opts.strictSlashes !== true) {
    source += `${SLASH_LITERAL}?`;
  }

  return source;
};

module.exports = parse;


/***/ }),

/***/ 8016:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const path = __nccwpck_require__(6928);
const scan = __nccwpck_require__(1781);
const parse = __nccwpck_require__(8265);
const utils = __nccwpck_require__(4059);
const constants = __nccwpck_require__(5595);
const isObject = val => val && typeof val === 'object' && !Array.isArray(val);

/**
 * Creates a matcher function from one or more glob patterns. The
 * returned function takes a string to match as its first argument,
 * and returns true if the string is a match. The returned matcher
 * function also takes a boolean as the second argument that, when true,
 * returns an object with additional information.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch(glob[, options]);
 *
 * const isMatch = picomatch('*.!(*a)');
 * console.log(isMatch('a.a')); //=> false
 * console.log(isMatch('a.b')); //=> true
 * ```
 * @name picomatch
 * @param {String|Array} `globs` One or more glob patterns.
 * @param {Object=} `options`
 * @return {Function=} Returns a matcher function.
 * @api public
 */

const picomatch = (glob, options, returnState = false) => {
  if (Array.isArray(glob)) {
    const fns = glob.map(input => picomatch(input, options, returnState));
    const arrayMatcher = str => {
      for (const isMatch of fns) {
        const state = isMatch(str);
        if (state) return state;
      }
      return false;
    };
    return arrayMatcher;
  }

  const isState = isObject(glob) && glob.tokens && glob.input;

  if (glob === '' || (typeof glob !== 'string' && !isState)) {
    throw new TypeError('Expected pattern to be a non-empty string');
  }

  const opts = options || {};
  const posix = utils.isWindows(options);
  const regex = isState
    ? picomatch.compileRe(glob, options)
    : picomatch.makeRe(glob, options, false, true);

  const state = regex.state;
  delete regex.state;

  let isIgnored = () => false;
  if (opts.ignore) {
    const ignoreOpts = { ...options, ignore: null, onMatch: null, onResult: null };
    isIgnored = picomatch(opts.ignore, ignoreOpts, returnState);
  }

  const matcher = (input, returnObject = false) => {
    const { isMatch, match, output } = picomatch.test(input, regex, options, { glob, posix });
    const result = { glob, state, regex, posix, input, output, match, isMatch };

    if (typeof opts.onResult === 'function') {
      opts.onResult(result);
    }

    if (isMatch === false) {
      result.isMatch = false;
      return returnObject ? result : false;
    }

    if (isIgnored(input)) {
      if (typeof opts.onIgnore === 'function') {
        opts.onIgnore(result);
      }
      result.isMatch = false;
      return returnObject ? result : false;
    }

    if (typeof opts.onMatch === 'function') {
      opts.onMatch(result);
    }
    return returnObject ? result : true;
  };

  if (returnState) {
    matcher.state = state;
  }

  return matcher;
};

/**
 * Test `input` with the given `regex`. This is used by the main
 * `picomatch()` function to test the input string.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch.test(input, regex[, options]);
 *
 * console.log(picomatch.test('foo/bar', /^(?:([^/]*?)\/([^/]*?))$/));
 * // { isMatch: true, match: [ 'foo/', 'foo', 'bar' ], output: 'foo/bar' }
 * ```
 * @param {String} `input` String to test.
 * @param {RegExp} `regex`
 * @return {Object} Returns an object with matching info.
 * @api public
 */

picomatch.test = (input, regex, options, { glob, posix } = {}) => {
  if (typeof input !== 'string') {
    throw new TypeError('Expected input to be a string');
  }

  if (input === '') {
    return { isMatch: false, output: '' };
  }

  const opts = options || {};
  const format = opts.format || (posix ? utils.toPosixSlashes : null);
  let match = input === glob;
  let output = (match && format) ? format(input) : input;

  if (match === false) {
    output = format ? format(input) : input;
    match = output === glob;
  }

  if (match === false || opts.capture === true) {
    if (opts.matchBase === true || opts.basename === true) {
      match = picomatch.matchBase(input, regex, options, posix);
    } else {
      match = regex.exec(output);
    }
  }

  return { isMatch: Boolean(match), match, output };
};

/**
 * Match the basename of a filepath.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch.matchBase(input, glob[, options]);
 * console.log(picomatch.matchBase('foo/bar.js', '*.js'); // true
 * ```
 * @param {String} `input` String to test.
 * @param {RegExp|String} `glob` Glob pattern or regex created by [.makeRe](#makeRe).
 * @return {Boolean}
 * @api public
 */

picomatch.matchBase = (input, glob, options, posix = utils.isWindows(options)) => {
  const regex = glob instanceof RegExp ? glob : picomatch.makeRe(glob, options);
  return regex.test(path.basename(input));
};

/**
 * Returns true if **any** of the given glob `patterns` match the specified `string`.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch.isMatch(string, patterns[, options]);
 *
 * console.log(picomatch.isMatch('a.a', ['b.*', '*.a'])); //=> true
 * console.log(picomatch.isMatch('a.a', 'b.*')); //=> false
 * ```
 * @param {String|Array} str The string to test.
 * @param {String|Array} patterns One or more glob patterns to use for matching.
 * @param {Object} [options] See available [options](#options).
 * @return {Boolean} Returns true if any patterns match `str`
 * @api public
 */

picomatch.isMatch = (str, patterns, options) => picomatch(patterns, options)(str);

/**
 * Parse a glob pattern to create the source string for a regular
 * expression.
 *
 * ```js
 * const picomatch = require('picomatch');
 * const result = picomatch.parse(pattern[, options]);
 * ```
 * @param {String} `pattern`
 * @param {Object} `options`
 * @return {Object} Returns an object with useful properties and output to be used as a regex source string.
 * @api public
 */

picomatch.parse = (pattern, options) => {
  if (Array.isArray(pattern)) return pattern.map(p => picomatch.parse(p, options));
  return parse(pattern, { ...options, fastpaths: false });
};

/**
 * Scan a glob pattern to separate the pattern into segments.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch.scan(input[, options]);
 *
 * const result = picomatch.scan('!./foo/*.js');
 * console.log(result);
 * { prefix: '!./',
 *   input: '!./foo/*.js',
 *   start: 3,
 *   base: 'foo',
 *   glob: '*.js',
 *   isBrace: false,
 *   isBracket: false,
 *   isGlob: true,
 *   isExtglob: false,
 *   isGlobstar: false,
 *   negated: true }
 * ```
 * @param {String} `input` Glob pattern to scan.
 * @param {Object} `options`
 * @return {Object} Returns an object with
 * @api public
 */

picomatch.scan = (input, options) => scan(input, options);

/**
 * Compile a regular expression from the `state` object returned by the
 * [parse()](#parse) method.
 *
 * @param {Object} `state`
 * @param {Object} `options`
 * @param {Boolean} `returnOutput` Intended for implementors, this argument allows you to return the raw output from the parser.
 * @param {Boolean} `returnState` Adds the state to a `state` property on the returned regex. Useful for implementors and debugging.
 * @return {RegExp}
 * @api public
 */

picomatch.compileRe = (state, options, returnOutput = false, returnState = false) => {
  if (returnOutput === true) {
    return state.output;
  }

  const opts = options || {};
  const prepend = opts.contains ? '' : '^';
  const append = opts.contains ? '' : '$';

  let source = `${prepend}(?:${state.output})${append}`;
  if (state && state.negated === true) {
    source = `^(?!${source}).*$`;
  }

  const regex = picomatch.toRegex(source, options);
  if (returnState === true) {
    regex.state = state;
  }

  return regex;
};

/**
 * Create a regular expression from a parsed glob pattern.
 *
 * ```js
 * const picomatch = require('picomatch');
 * const state = picomatch.parse('*.js');
 * // picomatch.compileRe(state[, options]);
 *
 * console.log(picomatch.compileRe(state));
 * //=> /^(?:(?!\.)(?=.)[^/]*?\.js)$/
 * ```
 * @param {String} `state` The object returned from the `.parse` method.
 * @param {Object} `options`
 * @param {Boolean} `returnOutput` Implementors may use this argument to return the compiled output, instead of a regular expression. This is not exposed on the options to prevent end-users from mutating the result.
 * @param {Boolean} `returnState` Implementors may use this argument to return the state from the parsed glob with the returned regular expression.
 * @return {RegExp} Returns a regex created from the given pattern.
 * @api public
 */

picomatch.makeRe = (input, options = {}, returnOutput = false, returnState = false) => {
  if (!input || typeof input !== 'string') {
    throw new TypeError('Expected a non-empty string');
  }

  let parsed = { negated: false, fastpaths: true };

  if (options.fastpaths !== false && (input[0] === '.' || input[0] === '*')) {
    parsed.output = parse.fastpaths(input, options);
  }

  if (!parsed.output) {
    parsed = parse(input, options);
  }

  return picomatch.compileRe(parsed, options, returnOutput, returnState);
};

/**
 * Create a regular expression from the given regex source string.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch.toRegex(source[, options]);
 *
 * const { output } = picomatch.parse('*.js');
 * console.log(picomatch.toRegex(output));
 * //=> /^(?:(?!\.)(?=.)[^/]*?\.js)$/
 * ```
 * @param {String} `source` Regular expression source string.
 * @param {Object} `options`
 * @return {RegExp}
 * @api public
 */

picomatch.toRegex = (source, options) => {
  try {
    const opts = options || {};
    return new RegExp(source, opts.flags || (opts.nocase ? 'i' : ''));
  } catch (err) {
    if (options && options.debug === true) throw err;
    return /$^/;
  }
};

/**
 * Picomatch constants.
 * @return {Object}
 */

picomatch.constants = constants;

/**
 * Expose "picomatch"
 */

module.exports = picomatch;


/***/ }),

/***/ 1781:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const utils = __nccwpck_require__(4059);
const {
  CHAR_ASTERISK,             /* * */
  CHAR_AT,                   /* @ */
  CHAR_BACKWARD_SLASH,       /* \ */
  CHAR_COMMA,                /* , */
  CHAR_DOT,                  /* . */
  CHAR_EXCLAMATION_MARK,     /* ! */
  CHAR_FORWARD_SLASH,        /* / */
  CHAR_LEFT_CURLY_BRACE,     /* { */
  CHAR_LEFT_PARENTHESES,     /* ( */
  CHAR_LEFT_SQUARE_BRACKET,  /* [ */
  CHAR_PLUS,                 /* + */
  CHAR_QUESTION_MARK,        /* ? */
  CHAR_RIGHT_CURLY_BRACE,    /* } */
  CHAR_RIGHT_PARENTHESES,    /* ) */
  CHAR_RIGHT_SQUARE_BRACKET  /* ] */
} = __nccwpck_require__(5595);

const isPathSeparator = code => {
  return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
};

const depth = token => {
  if (token.isPrefix !== true) {
    token.depth = token.isGlobstar ? Infinity : 1;
  }
};

/**
 * Quickly scans a glob pattern and returns an object with a handful of
 * useful properties, like `isGlob`, `path` (the leading non-glob, if it exists),
 * `glob` (the actual pattern), `negated` (true if the path starts with `!` but not
 * with `!(`) and `negatedExtglob` (true if the path starts with `!(`).
 *
 * ```js
 * const pm = require('picomatch');
 * console.log(pm.scan('foo/bar/*.js'));
 * { isGlob: true, input: 'foo/bar/*.js', base: 'foo/bar', glob: '*.js' }
 * ```
 * @param {String} `str`
 * @param {Object} `options`
 * @return {Object} Returns an object with tokens and regex source string.
 * @api public
 */

const scan = (input, options) => {
  const opts = options || {};

  const length = input.length - 1;
  const scanToEnd = opts.parts === true || opts.scanToEnd === true;
  const slashes = [];
  const tokens = [];
  const parts = [];

  let str = input;
  let index = -1;
  let start = 0;
  let lastIndex = 0;
  let isBrace = false;
  let isBracket = false;
  let isGlob = false;
  let isExtglob = false;
  let isGlobstar = false;
  let braceEscaped = false;
  let backslashes = false;
  let negated = false;
  let negatedExtglob = false;
  let finished = false;
  let braces = 0;
  let prev;
  let code;
  let token = { value: '', depth: 0, isGlob: false };

  const eos = () => index >= length;
  const peek = () => str.charCodeAt(index + 1);
  const advance = () => {
    prev = code;
    return str.charCodeAt(++index);
  };

  while (index < length) {
    code = advance();
    let next;

    if (code === CHAR_BACKWARD_SLASH) {
      backslashes = token.backslashes = true;
      code = advance();

      if (code === CHAR_LEFT_CURLY_BRACE) {
        braceEscaped = true;
      }
      continue;
    }

    if (braceEscaped === true || code === CHAR_LEFT_CURLY_BRACE) {
      braces++;

      while (eos() !== true && (code = advance())) {
        if (code === CHAR_BACKWARD_SLASH) {
          backslashes = token.backslashes = true;
          advance();
          continue;
        }

        if (code === CHAR_LEFT_CURLY_BRACE) {
          braces++;
          continue;
        }

        if (braceEscaped !== true && code === CHAR_DOT && (code = advance()) === CHAR_DOT) {
          isBrace = token.isBrace = true;
          isGlob = token.isGlob = true;
          finished = true;

          if (scanToEnd === true) {
            continue;
          }

          break;
        }

        if (braceEscaped !== true && code === CHAR_COMMA) {
          isBrace = token.isBrace = true;
          isGlob = token.isGlob = true;
          finished = true;

          if (scanToEnd === true) {
            continue;
          }

          break;
        }

        if (code === CHAR_RIGHT_CURLY_BRACE) {
          braces--;

          if (braces === 0) {
            braceEscaped = false;
            isBrace = token.isBrace = true;
            finished = true;
            break;
          }
        }
      }

      if (scanToEnd === true) {
        continue;
      }

      break;
    }

    if (code === CHAR_FORWARD_SLASH) {
      slashes.push(index);
      tokens.push(token);
      token = { value: '', depth: 0, isGlob: false };

      if (finished === true) continue;
      if (prev === CHAR_DOT && index === (start + 1)) {
        start += 2;
        continue;
      }

      lastIndex = index + 1;
      continue;
    }

    if (opts.noext !== true) {
      const isExtglobChar = code === CHAR_PLUS
        || code === CHAR_AT
        || code === CHAR_ASTERISK
        || code === CHAR_QUESTION_MARK
        || code === CHAR_EXCLAMATION_MARK;

      if (isExtglobChar === true && peek() === CHAR_LEFT_PARENTHESES) {
        isGlob = token.isGlob = true;
        isExtglob = token.isExtglob = true;
        finished = true;
        if (code === CHAR_EXCLAMATION_MARK && index === start) {
          negatedExtglob = true;
        }

        if (scanToEnd === true) {
          while (eos() !== true && (code = advance())) {
            if (code === CHAR_BACKWARD_SLASH) {
              backslashes = token.backslashes = true;
              code = advance();
              continue;
            }

            if (code === CHAR_RIGHT_PARENTHESES) {
              isGlob = token.isGlob = true;
              finished = true;
              break;
            }
          }
          continue;
        }
        break;
      }
    }

    if (code === CHAR_ASTERISK) {
      if (prev === CHAR_ASTERISK) isGlobstar = token.isGlobstar = true;
      isGlob = token.isGlob = true;
      finished = true;

      if (scanToEnd === true) {
        continue;
      }
      break;
    }

    if (code === CHAR_QUESTION_MARK) {
      isGlob = token.isGlob = true;
      finished = true;

      if (scanToEnd === true) {
        continue;
      }
      break;
    }

    if (code === CHAR_LEFT_SQUARE_BRACKET) {
      while (eos() !== true && (next = advance())) {
        if (next === CHAR_BACKWARD_SLASH) {
          backslashes = token.backslashes = true;
          advance();
          continue;
        }

        if (next === CHAR_RIGHT_SQUARE_BRACKET) {
          isBracket = token.isBracket = true;
          isGlob = token.isGlob = true;
          finished = true;
          break;
        }
      }

      if (scanToEnd === true) {
        continue;
      }

      break;
    }

    if (opts.nonegate !== true && code === CHAR_EXCLAMATION_MARK && index === start) {
      negated = token.negated = true;
      start++;
      continue;
    }

    if (opts.noparen !== true && code === CHAR_LEFT_PARENTHESES) {
      isGlob = token.isGlob = true;

      if (scanToEnd === true) {
        while (eos() !== true && (code = advance())) {
          if (code === CHAR_LEFT_PARENTHESES) {
            backslashes = token.backslashes = true;
            code = advance();
            continue;
          }

          if (code === CHAR_RIGHT_PARENTHESES) {
            finished = true;
            break;
          }
        }
        continue;
      }
      break;
    }

    if (isGlob === true) {
      finished = true;

      if (scanToEnd === true) {
        continue;
      }

      break;
    }
  }

  if (opts.noext === true) {
    isExtglob = false;
    isGlob = false;
  }

  let base = str;
  let prefix = '';
  let glob = '';

  if (start > 0) {
    prefix = str.slice(0, start);
    str = str.slice(start);
    lastIndex -= start;
  }

  if (base && isGlob === true && lastIndex > 0) {
    base = str.slice(0, lastIndex);
    glob = str.slice(lastIndex);
  } else if (isGlob === true) {
    base = '';
    glob = str;
  } else {
    base = str;
  }

  if (base && base !== '' && base !== '/' && base !== str) {
    if (isPathSeparator(base.charCodeAt(base.length - 1))) {
      base = base.slice(0, -1);
    }
  }

  if (opts.unescape === true) {
    if (glob) glob = utils.removeBackslashes(glob);

    if (base && backslashes === true) {
      base = utils.removeBackslashes(base);
    }
  }

  const state = {
    prefix,
    input,
    start,
    base,
    glob,
    isBrace,
    isBracket,
    isGlob,
    isExtglob,
    isGlobstar,
    negated,
    negatedExtglob
  };

  if (opts.tokens === true) {
    state.maxDepth = 0;
    if (!isPathSeparator(code)) {
      tokens.push(token);
    }
    state.tokens = tokens;
  }

  if (opts.parts === true || opts.tokens === true) {
    let prevIndex;

    for (let idx = 0; idx < slashes.length; idx++) {
      const n = prevIndex ? prevIndex + 1 : start;
      const i = slashes[idx];
      const value = input.slice(n, i);
      if (opts.tokens) {
        if (idx === 0 && start !== 0) {
          tokens[idx].isPrefix = true;
          tokens[idx].value = prefix;
        } else {
          tokens[idx].value = value;
        }
        depth(tokens[idx]);
        state.maxDepth += tokens[idx].depth;
      }
      if (idx !== 0 || value !== '') {
        parts.push(value);
      }
      prevIndex = i;
    }

    if (prevIndex && prevIndex + 1 < input.length) {
      const value = input.slice(prevIndex + 1);
      parts.push(value);

      if (opts.tokens) {
        tokens[tokens.length - 1].value = value;
        depth(tokens[tokens.length - 1]);
        state.maxDepth += tokens[tokens.length - 1].depth;
      }
    }

    state.slashes = slashes;
    state.parts = parts;
  }

  return state;
};

module.exports = scan;


/***/ }),

/***/ 4059:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


const path = __nccwpck_require__(6928);
const win32 = process.platform === 'win32';
const {
  REGEX_BACKSLASH,
  REGEX_REMOVE_BACKSLASH,
  REGEX_SPECIAL_CHARS,
  REGEX_SPECIAL_CHARS_GLOBAL
} = __nccwpck_require__(5595);

exports.isObject = val => val !== null && typeof val === 'object' && !Array.isArray(val);
exports.hasRegexChars = str => REGEX_SPECIAL_CHARS.test(str);
exports.isRegexChar = str => str.length === 1 && exports.hasRegexChars(str);
exports.escapeRegex = str => str.replace(REGEX_SPECIAL_CHARS_GLOBAL, '\\$1');
exports.toPosixSlashes = str => str.replace(REGEX_BACKSLASH, '/');

exports.removeBackslashes = str => {
  return str.replace(REGEX_REMOVE_BACKSLASH, match => {
    return match === '\\' ? '' : match;
  });
};

exports.supportsLookbehinds = () => {
  const segs = process.version.slice(1).split('.').map(Number);
  if (segs.length === 3 && segs[0] >= 9 || (segs[0] === 8 && segs[1] >= 10)) {
    return true;
  }
  return false;
};

exports.isWindows = options => {
  if (options && typeof options.windows === 'boolean') {
    return options.windows;
  }
  return win32 === true || path.sep === '\\';
};

exports.escapeLast = (input, char, lastIdx) => {
  const idx = input.lastIndexOf(char, lastIdx);
  if (idx === -1) return input;
  if (input[idx - 1] === '\\') return exports.escapeLast(input, char, idx - 1);
  return `${input.slice(0, idx)}\\${input.slice(idx)}`;
};

exports.removePrefix = (input, state = {}) => {
  let output = input;
  if (output.startsWith('./')) {
    output = output.slice(2);
    state.prefix = './';
  }
  return output;
};

exports.wrapOutput = (input, state = {}, options = {}) => {
  const prepend = options.contains ? '' : '^';
  const append = options.contains ? '' : '$';

  let output = `${prepend}(?:${input})${append}`;
  if (state.negated === true) {
    output = `(?:^(?!${output}).*$)`;
  }
  return output;
};


/***/ }),

/***/ 7467:
/***/ ((module, exports) => {

"use strict";


const { hasOwnProperty } = Object.prototype

const stringify = configure()

// @ts-expect-error
stringify.configure = configure
// @ts-expect-error
stringify.stringify = stringify

// @ts-expect-error
stringify.default = stringify

// @ts-expect-error used for named export
exports.stringify = stringify
// @ts-expect-error used for named export
exports.configure = configure

module.exports = stringify

// eslint-disable-next-line no-control-regex
const strEscapeSequencesRegExp = /[\u0000-\u001f\u0022\u005c\ud800-\udfff]/

// Escape C0 control characters, double quotes, the backslash and every code
// unit with a numeric value in the inclusive range 0xD800 to 0xDFFF.
function strEscape (str) {
  // Some magic numbers that worked out fine while benchmarking with v8 8.0
  if (str.length < 5000 && !strEscapeSequencesRegExp.test(str)) {
    return `"${str}"`
  }
  return JSON.stringify(str)
}

function sort (array, comparator) {
  // Insertion sort is very efficient for small input sizes, but it has a bad
  // worst case complexity. Thus, use native array sort for bigger values.
  if (array.length > 2e2 || comparator) {
    return array.sort(comparator)
  }
  for (let i = 1; i < array.length; i++) {
    const currentValue = array[i]
    let position = i
    while (position !== 0 && array[position - 1] > currentValue) {
      array[position] = array[position - 1]
      position--
    }
    array[position] = currentValue
  }
  return array
}

const typedArrayPrototypeGetSymbolToStringTag =
  Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(
      Object.getPrototypeOf(
        new Int8Array()
      )
    ),
    Symbol.toStringTag
  ).get

function isTypedArrayWithEntries (value) {
  return typedArrayPrototypeGetSymbolToStringTag.call(value) !== undefined && value.length !== 0
}

function stringifyTypedArray (array, separator, maximumBreadth) {
  if (array.length < maximumBreadth) {
    maximumBreadth = array.length
  }
  const whitespace = separator === ',' ? '' : ' '
  let res = `"0":${whitespace}${array[0]}`
  for (let i = 1; i < maximumBreadth; i++) {
    res += `${separator}"${i}":${whitespace}${array[i]}`
  }
  return res
}

function getCircularValueOption (options) {
  if (hasOwnProperty.call(options, 'circularValue')) {
    const circularValue = options.circularValue
    if (typeof circularValue === 'string') {
      return `"${circularValue}"`
    }
    if (circularValue == null) {
      return circularValue
    }
    if (circularValue === Error || circularValue === TypeError) {
      return {
        toString () {
          throw new TypeError('Converting circular structure to JSON')
        }
      }
    }
    throw new TypeError('The "circularValue" argument must be of type string or the value null or undefined')
  }
  return '"[Circular]"'
}

function getDeterministicOption (options) {
  let value
  if (hasOwnProperty.call(options, 'deterministic')) {
    value = options.deterministic
    if (typeof value !== 'boolean' && typeof value !== 'function') {
      throw new TypeError('The "deterministic" argument must be of type boolean or comparator function')
    }
  }
  return value === undefined ? true : value
}

function getBooleanOption (options, key) {
  let value
  if (hasOwnProperty.call(options, key)) {
    value = options[key]
    if (typeof value !== 'boolean') {
      throw new TypeError(`The "${key}" argument must be of type boolean`)
    }
  }
  return value === undefined ? true : value
}

function getPositiveIntegerOption (options, key) {
  let value
  if (hasOwnProperty.call(options, key)) {
    value = options[key]
    if (typeof value !== 'number') {
      throw new TypeError(`The "${key}" argument must be of type number`)
    }
    if (!Number.isInteger(value)) {
      throw new TypeError(`The "${key}" argument must be an integer`)
    }
    if (value < 1) {
      throw new RangeError(`The "${key}" argument must be >= 1`)
    }
  }
  return value === undefined ? Infinity : value
}

function getItemCount (number) {
  if (number === 1) {
    return '1 item'
  }
  return `${number} items`
}

function getUniqueReplacerSet (replacerArray) {
  const replacerSet = new Set()
  for (const value of replacerArray) {
    if (typeof value === 'string' || typeof value === 'number') {
      replacerSet.add(String(value))
    }
  }
  return replacerSet
}

function getStrictOption (options) {
  if (hasOwnProperty.call(options, 'strict')) {
    const value = options.strict
    if (typeof value !== 'boolean') {
      throw new TypeError('The "strict" argument must be of type boolean')
    }
    if (value) {
      return (value) => {
        let message = `Object can not safely be stringified. Received type ${typeof value}`
        if (typeof value !== 'function') message += ` (${value.toString()})`
        throw new Error(message)
      }
    }
  }
}

function configure (options) {
  options = { ...options }
  const fail = getStrictOption(options)
  if (fail) {
    if (options.bigint === undefined) {
      options.bigint = false
    }
    if (!('circularValue' in options)) {
      options.circularValue = Error
    }
  }
  const circularValue = getCircularValueOption(options)
  const bigint = getBooleanOption(options, 'bigint')
  const deterministic = getDeterministicOption(options)
  const comparator = typeof deterministic === 'function' ? deterministic : undefined
  const maximumDepth = getPositiveIntegerOption(options, 'maximumDepth')
  const maximumBreadth = getPositiveIntegerOption(options, 'maximumBreadth')

  function stringifyFnReplacer (key, parent, stack, replacer, spacer, indentation) {
    let value = parent[key]

    if (typeof value === 'object' && value !== null && typeof value.toJSON === 'function') {
      value = value.toJSON(key)
    }
    value = replacer.call(parent, key, value)

    switch (typeof value) {
      case 'string':
        return strEscape(value)
      case 'object': {
        if (value === null) {
          return 'null'
        }
        if (stack.indexOf(value) !== -1) {
          return circularValue
        }

        let res = ''
        let join = ','
        const originalIndentation = indentation

        if (Array.isArray(value)) {
          if (value.length === 0) {
            return '[]'
          }
          if (maximumDepth < stack.length + 1) {
            return '"[Array]"'
          }
          stack.push(value)
          if (spacer !== '') {
            indentation += spacer
            res += `\n${indentation}`
            join = `,\n${indentation}`
          }
          const maximumValuesToStringify = Math.min(value.length, maximumBreadth)
          let i = 0
          for (; i < maximumValuesToStringify - 1; i++) {
            const tmp = stringifyFnReplacer(String(i), value, stack, replacer, spacer, indentation)
            res += tmp !== undefined ? tmp : 'null'
            res += join
          }
          const tmp = stringifyFnReplacer(String(i), value, stack, replacer, spacer, indentation)
          res += tmp !== undefined ? tmp : 'null'
          if (value.length - 1 > maximumBreadth) {
            const removedKeys = value.length - maximumBreadth - 1
            res += `${join}"... ${getItemCount(removedKeys)} not stringified"`
          }
          if (spacer !== '') {
            res += `\n${originalIndentation}`
          }
          stack.pop()
          return `[${res}]`
        }

        let keys = Object.keys(value)
        const keyLength = keys.length
        if (keyLength === 0) {
          return '{}'
        }
        if (maximumDepth < stack.length + 1) {
          return '"[Object]"'
        }
        let whitespace = ''
        let separator = ''
        if (spacer !== '') {
          indentation += spacer
          join = `,\n${indentation}`
          whitespace = ' '
        }
        const maximumPropertiesToStringify = Math.min(keyLength, maximumBreadth)
        if (deterministic && !isTypedArrayWithEntries(value)) {
          keys = sort(keys, comparator)
        }
        stack.push(value)
        for (let i = 0; i < maximumPropertiesToStringify; i++) {
          const key = keys[i]
          const tmp = stringifyFnReplacer(key, value, stack, replacer, spacer, indentation)
          if (tmp !== undefined) {
            res += `${separator}${strEscape(key)}:${whitespace}${tmp}`
            separator = join
          }
        }
        if (keyLength > maximumBreadth) {
          const removedKeys = keyLength - maximumBreadth
          res += `${separator}"...":${whitespace}"${getItemCount(removedKeys)} not stringified"`
          separator = join
        }
        if (spacer !== '' && separator.length > 1) {
          res = `\n${indentation}${res}\n${originalIndentation}`
        }
        stack.pop()
        return `{${res}}`
      }
      case 'number':
        return isFinite(value) ? String(value) : fail ? fail(value) : 'null'
      case 'boolean':
        return value === true ? 'true' : 'false'
      case 'undefined':
        return undefined
      case 'bigint':
        if (bigint) {
          return String(value)
        }
        // fallthrough
      default:
        return fail ? fail(value) : undefined
    }
  }

  function stringifyArrayReplacer (key, value, stack, replacer, spacer, indentation) {
    if (typeof value === 'object' && value !== null && typeof value.toJSON === 'function') {
      value = value.toJSON(key)
    }

    switch (typeof value) {
      case 'string':
        return strEscape(value)
      case 'object': {
        if (value === null) {
          return 'null'
        }
        if (stack.indexOf(value) !== -1) {
          return circularValue
        }

        const originalIndentation = indentation
        let res = ''
        let join = ','

        if (Array.isArray(value)) {
          if (value.length === 0) {
            return '[]'
          }
          if (maximumDepth < stack.length + 1) {
            return '"[Array]"'
          }
          stack.push(value)
          if (spacer !== '') {
            indentation += spacer
            res += `\n${indentation}`
            join = `,\n${indentation}`
          }
          const maximumValuesToStringify = Math.min(value.length, maximumBreadth)
          let i = 0
          for (; i < maximumValuesToStringify - 1; i++) {
            const tmp = stringifyArrayReplacer(String(i), value[i], stack, replacer, spacer, indentation)
            res += tmp !== undefined ? tmp : 'null'
            res += join
          }
          const tmp = stringifyArrayReplacer(String(i), value[i], stack, replacer, spacer, indentation)
          res += tmp !== undefined ? tmp : 'null'
          if (value.length - 1 > maximumBreadth) {
            const removedKeys = value.length - maximumBreadth - 1
            res += `${join}"... ${getItemCount(removedKeys)} not stringified"`
          }
          if (spacer !== '') {
            res += `\n${originalIndentation}`
          }
          stack.pop()
          return `[${res}]`
        }
        stack.push(value)
        let whitespace = ''
        if (spacer !== '') {
          indentation += spacer
          join = `,\n${indentation}`
          whitespace = ' '
        }
        let separator = ''
        for (const key of replacer) {
          const tmp = stringifyArrayReplacer(key, value[key], stack, replacer, spacer, indentation)
          if (tmp !== undefined) {
            res += `${separator}${strEscape(key)}:${whitespace}${tmp}`
            separator = join
          }
        }
        if (spacer !== '' && separator.length > 1) {
          res = `\n${indentation}${res}\n${originalIndentation}`
        }
        stack.pop()
        return `{${res}}`
      }
      case 'number':
        return isFinite(value) ? String(value) : fail ? fail(value) : 'null'
      case 'boolean':
        return value === true ? 'true' : 'false'
      case 'undefined':
        return undefined
      case 'bigint':
        if (bigint) {
          return String(value)
        }
        // fallthrough
      default:
        return fail ? fail(value) : undefined
    }
  }

  function stringifyIndent (key, value, stack, spacer, indentation) {
    switch (typeof value) {
      case 'string':
        return strEscape(value)
      case 'object': {
        if (value === null) {
          return 'null'
        }
        if (typeof value.toJSON === 'function') {
          value = value.toJSON(key)
          // Prevent calling `toJSON` again.
          if (typeof value !== 'object') {
            return stringifyIndent(key, value, stack, spacer, indentation)
          }
          if (value === null) {
            return 'null'
          }
        }
        if (stack.indexOf(value) !== -1) {
          return circularValue
        }
        const originalIndentation = indentation

        if (Array.isArray(value)) {
          if (value.length === 0) {
            return '[]'
          }
          if (maximumDepth < stack.length + 1) {
            return '"[Array]"'
          }
          stack.push(value)
          indentation += spacer
          let res = `\n${indentation}`
          const join = `,\n${indentation}`
          const maximumValuesToStringify = Math.min(value.length, maximumBreadth)
          let i = 0
          for (; i < maximumValuesToStringify - 1; i++) {
            const tmp = stringifyIndent(String(i), value[i], stack, spacer, indentation)
            res += tmp !== undefined ? tmp : 'null'
            res += join
          }
          const tmp = stringifyIndent(String(i), value[i], stack, spacer, indentation)
          res += tmp !== undefined ? tmp : 'null'
          if (value.length - 1 > maximumBreadth) {
            const removedKeys = value.length - maximumBreadth - 1
            res += `${join}"... ${getItemCount(removedKeys)} not stringified"`
          }
          res += `\n${originalIndentation}`
          stack.pop()
          return `[${res}]`
        }

        let keys = Object.keys(value)
        const keyLength = keys.length
        if (keyLength === 0) {
          return '{}'
        }
        if (maximumDepth < stack.length + 1) {
          return '"[Object]"'
        }
        indentation += spacer
        const join = `,\n${indentation}`
        let res = ''
        let separator = ''
        let maximumPropertiesToStringify = Math.min(keyLength, maximumBreadth)
        if (isTypedArrayWithEntries(value)) {
          res += stringifyTypedArray(value, join, maximumBreadth)
          keys = keys.slice(value.length)
          maximumPropertiesToStringify -= value.length
          separator = join
        }
        if (deterministic) {
          keys = sort(keys, comparator)
        }
        stack.push(value)
        for (let i = 0; i < maximumPropertiesToStringify; i++) {
          const key = keys[i]
          const tmp = stringifyIndent(key, value[key], stack, spacer, indentation)
          if (tmp !== undefined) {
            res += `${separator}${strEscape(key)}: ${tmp}`
            separator = join
          }
        }
        if (keyLength > maximumBreadth) {
          const removedKeys = keyLength - maximumBreadth
          res += `${separator}"...": "${getItemCount(removedKeys)} not stringified"`
          separator = join
        }
        if (separator !== '') {
          res = `\n${indentation}${res}\n${originalIndentation}`
        }
        stack.pop()
        return `{${res}}`
      }
      case 'number':
        return isFinite(value) ? String(value) : fail ? fail(value) : 'null'
      case 'boolean':
        return value === true ? 'true' : 'false'
      case 'undefined':
        return undefined
      case 'bigint':
        if (bigint) {
          return String(value)
        }
        // fallthrough
      default:
        return fail ? fail(value) : undefined
    }
  }

  function stringifySimple (key, value, stack) {
    switch (typeof value) {
      case 'string':
        return strEscape(value)
      case 'object': {
        if (value === null) {
          return 'null'
        }
        if (typeof value.toJSON === 'function') {
          value = value.toJSON(key)
          // Prevent calling `toJSON` again
          if (typeof value !== 'object') {
            return stringifySimple(key, value, stack)
          }
          if (value === null) {
            return 'null'
          }
        }
        if (stack.indexOf(value) !== -1) {
          return circularValue
        }

        let res = ''

        const hasLength = value.length !== undefined
        if (hasLength && Array.isArray(value)) {
          if (value.length === 0) {
            return '[]'
          }
          if (maximumDepth < stack.length + 1) {
            return '"[Array]"'
          }
          stack.push(value)
          const maximumValuesToStringify = Math.min(value.length, maximumBreadth)
          let i = 0
          for (; i < maximumValuesToStringify - 1; i++) {
            const tmp = stringifySimple(String(i), value[i], stack)
            res += tmp !== undefined ? tmp : 'null'
            res += ','
          }
          const tmp = stringifySimple(String(i), value[i], stack)
          res += tmp !== undefined ? tmp : 'null'
          if (value.length - 1 > maximumBreadth) {
            const removedKeys = value.length - maximumBreadth - 1
            res += `,"... ${getItemCount(removedKeys)} not stringified"`
          }
          stack.pop()
          return `[${res}]`
        }

        let keys = Object.keys(value)
        const keyLength = keys.length
        if (keyLength === 0) {
          return '{}'
        }
        if (maximumDepth < stack.length + 1) {
          return '"[Object]"'
        }
        let separator = ''
        let maximumPropertiesToStringify = Math.min(keyLength, maximumBreadth)
        if (hasLength && isTypedArrayWithEntries(value)) {
          res += stringifyTypedArray(value, ',', maximumBreadth)
          keys = keys.slice(value.length)
          maximumPropertiesToStringify -= value.length
          separator = ','
        }
        if (deterministic) {
          keys = sort(keys, comparator)
        }
        stack.push(value)
        for (let i = 0; i < maximumPropertiesToStringify; i++) {
          const key = keys[i]
          const tmp = stringifySimple(key, value[key], stack)
          if (tmp !== undefined) {
            res += `${separator}${strEscape(key)}:${tmp}`
            separator = ','
          }
        }
        if (keyLength > maximumBreadth) {
          const removedKeys = keyLength - maximumBreadth
          res += `${separator}"...":"${getItemCount(removedKeys)} not stringified"`
        }
        stack.pop()
        return `{${res}}`
      }
      case 'number':
        return isFinite(value) ? String(value) : fail ? fail(value) : 'null'
      case 'boolean':
        return value === true ? 'true' : 'false'
      case 'undefined':
        return undefined
      case 'bigint':
        if (bigint) {
          return String(value)
        }
        // fallthrough
      default:
        return fail ? fail(value) : undefined
    }
  }

  function stringify (value, replacer, space) {
    if (arguments.length > 1) {
      let spacer = ''
      if (typeof space === 'number') {
        spacer = ' '.repeat(Math.min(space, 10))
      } else if (typeof space === 'string') {
        spacer = space.slice(0, 10)
      }
      if (replacer != null) {
        if (typeof replacer === 'function') {
          return stringifyFnReplacer('', { '': value }, [], replacer, spacer, '')
        }
        if (Array.isArray(replacer)) {
          return stringifyArrayReplacer('', value, [], getUniqueReplacerSet(replacer), spacer, '')
        }
      }
      if (spacer.length !== 0) {
        return stringifyIndent('', value, [], spacer, '')
      }
    }
    return stringifySimple('', value, [])
  }

  return stringify
}


/***/ }),

/***/ 2613:
/***/ ((module) => {

"use strict";
module.exports = require("assert");

/***/ }),

/***/ 290:
/***/ ((module) => {

"use strict";
module.exports = require("async_hooks");

/***/ }),

/***/ 9907:
/***/ ((module) => {

"use strict";
module.exports = require("cluster");

/***/ }),

/***/ 6982:
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ 4434:
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),

/***/ 9896:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 8611:
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ 5692:
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ 857:
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),

/***/ 6928:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ 2987:
/***/ ((module) => {

"use strict";
module.exports = require("perf_hooks");

/***/ }),

/***/ 932:
/***/ ((module) => {

"use strict";
module.exports = require("process");

/***/ }),

/***/ 2203:
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ 2018:
/***/ ((module) => {

"use strict";
module.exports = require("tty");

/***/ }),

/***/ 7016:
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),

/***/ 9023:
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ }),

/***/ 8167:
/***/ ((module) => {

"use strict";
module.exports = require("worker_threads");

/***/ }),

/***/ 3106:
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ }),

/***/ 477:
/***/ (() => {

/*! *****************************************************************************
Copyright (C) Microsoft. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
var Reflect;
(function (Reflect) {
    // Metadata Proposal
    // https://rbuckton.github.io/reflect-metadata/
    (function (factory) {
        var root = typeof globalThis === "object" ? globalThis :
            typeof global === "object" ? global :
                typeof self === "object" ? self :
                    typeof this === "object" ? this :
                        sloppyModeThis();
        var exporter = makeExporter(Reflect);
        if (typeof root.Reflect !== "undefined") {
            exporter = makeExporter(root.Reflect, exporter);
        }
        factory(exporter, root);
        if (typeof root.Reflect === "undefined") {
            root.Reflect = Reflect;
        }
        function makeExporter(target, previous) {
            return function (key, value) {
                Object.defineProperty(target, key, { configurable: true, writable: true, value: value });
                if (previous)
                    previous(key, value);
            };
        }
        function functionThis() {
            try {
                return Function("return this;")();
            }
            catch (_) { }
        }
        function indirectEvalThis() {
            try {
                return (void 0, eval)("(function() { return this; })()");
            }
            catch (_) { }
        }
        function sloppyModeThis() {
            return functionThis() || indirectEvalThis();
        }
    })(function (exporter, root) {
        var hasOwn = Object.prototype.hasOwnProperty;
        // feature test for Symbol support
        var supportsSymbol = typeof Symbol === "function";
        var toPrimitiveSymbol = supportsSymbol && typeof Symbol.toPrimitive !== "undefined" ? Symbol.toPrimitive : "@@toPrimitive";
        var iteratorSymbol = supportsSymbol && typeof Symbol.iterator !== "undefined" ? Symbol.iterator : "@@iterator";
        var supportsCreate = typeof Object.create === "function"; // feature test for Object.create support
        var supportsProto = { __proto__: [] } instanceof Array; // feature test for __proto__ support
        var downLevel = !supportsCreate && !supportsProto;
        var HashMap = {
            // create an object in dictionary mode (a.k.a. "slow" mode in v8)
            create: supportsCreate
                ? function () { return MakeDictionary(Object.create(null)); }
                : supportsProto
                    ? function () { return MakeDictionary({ __proto__: null }); }
                    : function () { return MakeDictionary({}); },
            has: downLevel
                ? function (map, key) { return hasOwn.call(map, key); }
                : function (map, key) { return key in map; },
            get: downLevel
                ? function (map, key) { return hasOwn.call(map, key) ? map[key] : undefined; }
                : function (map, key) { return map[key]; },
        };
        // Load global or shim versions of Map, Set, and WeakMap
        var functionPrototype = Object.getPrototypeOf(Function);
        var _Map = typeof Map === "function" && typeof Map.prototype.entries === "function" ? Map : CreateMapPolyfill();
        var _Set = typeof Set === "function" && typeof Set.prototype.entries === "function" ? Set : CreateSetPolyfill();
        var _WeakMap = typeof WeakMap === "function" ? WeakMap : CreateWeakMapPolyfill();
        var registrySymbol = supportsSymbol ? Symbol.for("@reflect-metadata:registry") : undefined;
        var metadataRegistry = GetOrCreateMetadataRegistry();
        var metadataProvider = CreateMetadataProvider(metadataRegistry);
        /**
         * Applies a set of decorators to a property of a target object.
         * @param decorators An array of decorators.
         * @param target The target object.
         * @param propertyKey (Optional) The property key to decorate.
         * @param attributes (Optional) The property descriptor for the target key.
         * @remarks Decorators are applied in reverse order.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     Example = Reflect.decorate(decoratorsArray, Example);
         *
         *     // property (on constructor)
         *     Reflect.decorate(decoratorsArray, Example, "staticProperty");
         *
         *     // property (on prototype)
         *     Reflect.decorate(decoratorsArray, Example.prototype, "property");
         *
         *     // method (on constructor)
         *     Object.defineProperty(Example, "staticMethod",
         *         Reflect.decorate(decoratorsArray, Example, "staticMethod",
         *             Object.getOwnPropertyDescriptor(Example, "staticMethod")));
         *
         *     // method (on prototype)
         *     Object.defineProperty(Example.prototype, "method",
         *         Reflect.decorate(decoratorsArray, Example.prototype, "method",
         *             Object.getOwnPropertyDescriptor(Example.prototype, "method")));
         *
         */
        function decorate(decorators, target, propertyKey, attributes) {
            if (!IsUndefined(propertyKey)) {
                if (!IsArray(decorators))
                    throw new TypeError();
                if (!IsObject(target))
                    throw new TypeError();
                if (!IsObject(attributes) && !IsUndefined(attributes) && !IsNull(attributes))
                    throw new TypeError();
                if (IsNull(attributes))
                    attributes = undefined;
                propertyKey = ToPropertyKey(propertyKey);
                return DecorateProperty(decorators, target, propertyKey, attributes);
            }
            else {
                if (!IsArray(decorators))
                    throw new TypeError();
                if (!IsConstructor(target))
                    throw new TypeError();
                return DecorateConstructor(decorators, target);
            }
        }
        exporter("decorate", decorate);
        // 4.1.2 Reflect.metadata(metadataKey, metadataValue)
        // https://rbuckton.github.io/reflect-metadata/#reflect.metadata
        /**
         * A default metadata decorator factory that can be used on a class, class member, or parameter.
         * @param metadataKey The key for the metadata entry.
         * @param metadataValue The value for the metadata entry.
         * @returns A decorator function.
         * @remarks
         * If `metadataKey` is already defined for the target and target key, the
         * metadataValue for that key will be overwritten.
         * @example
         *
         *     // constructor
         *     @Reflect.metadata(key, value)
         *     class Example {
         *     }
         *
         *     // property (on constructor, TypeScript only)
         *     class Example {
         *         @Reflect.metadata(key, value)
         *         static staticProperty;
         *     }
         *
         *     // property (on prototype, TypeScript only)
         *     class Example {
         *         @Reflect.metadata(key, value)
         *         property;
         *     }
         *
         *     // method (on constructor)
         *     class Example {
         *         @Reflect.metadata(key, value)
         *         static staticMethod() { }
         *     }
         *
         *     // method (on prototype)
         *     class Example {
         *         @Reflect.metadata(key, value)
         *         method() { }
         *     }
         *
         */
        function metadata(metadataKey, metadataValue) {
            function decorator(target, propertyKey) {
                if (!IsObject(target))
                    throw new TypeError();
                if (!IsUndefined(propertyKey) && !IsPropertyKey(propertyKey))
                    throw new TypeError();
                OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
            }
            return decorator;
        }
        exporter("metadata", metadata);
        /**
         * Define a unique metadata entry on the target.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param metadataValue A value that contains attached metadata.
         * @param target The target object on which to define metadata.
         * @param propertyKey (Optional) The property key for the target.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     Reflect.defineMetadata("custom:annotation", options, Example);
         *
         *     // property (on constructor)
         *     Reflect.defineMetadata("custom:annotation", options, Example, "staticProperty");
         *
         *     // property (on prototype)
         *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "property");
         *
         *     // method (on constructor)
         *     Reflect.defineMetadata("custom:annotation", options, Example, "staticMethod");
         *
         *     // method (on prototype)
         *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "method");
         *
         *     // decorator factory as metadata-producing annotation.
         *     function MyAnnotation(options): Decorator {
         *         return (target, key?) => Reflect.defineMetadata("custom:annotation", options, target, key);
         *     }
         *
         */
        function defineMetadata(metadataKey, metadataValue, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
        }
        exporter("defineMetadata", defineMetadata);
        /**
         * Gets a value indicating whether the target object or its prototype chain has the provided metadata key defined.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns `true` if the metadata key was defined on the target object or its prototype chain; otherwise, `false`.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.hasMetadata("custom:annotation", Example);
         *
         *     // property (on constructor)
         *     result = Reflect.hasMetadata("custom:annotation", Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.hasMetadata("custom:annotation", Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "method");
         *
         */
        function hasMetadata(metadataKey, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryHasMetadata(metadataKey, target, propertyKey);
        }
        exporter("hasMetadata", hasMetadata);
        /**
         * Gets a value indicating whether the target object has the provided metadata key defined.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns `true` if the metadata key was defined on the target object; otherwise, `false`.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.hasOwnMetadata("custom:annotation", Example);
         *
         *     // property (on constructor)
         *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "method");
         *
         */
        function hasOwnMetadata(metadataKey, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryHasOwnMetadata(metadataKey, target, propertyKey);
        }
        exporter("hasOwnMetadata", hasOwnMetadata);
        /**
         * Gets the metadata value for the provided metadata key on the target object or its prototype chain.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.getMetadata("custom:annotation", Example);
         *
         *     // property (on constructor)
         *     result = Reflect.getMetadata("custom:annotation", Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.getMetadata("custom:annotation", Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "method");
         *
         */
        function getMetadata(metadataKey, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryGetMetadata(metadataKey, target, propertyKey);
        }
        exporter("getMetadata", getMetadata);
        /**
         * Gets the metadata value for the provided metadata key on the target object.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.getOwnMetadata("custom:annotation", Example);
         *
         *     // property (on constructor)
         *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "method");
         *
         */
        function getOwnMetadata(metadataKey, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryGetOwnMetadata(metadataKey, target, propertyKey);
        }
        exporter("getOwnMetadata", getOwnMetadata);
        /**
         * Gets the metadata keys defined on the target object or its prototype chain.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns An array of unique metadata keys.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.getMetadataKeys(Example);
         *
         *     // property (on constructor)
         *     result = Reflect.getMetadataKeys(Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.getMetadataKeys(Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.getMetadataKeys(Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.getMetadataKeys(Example.prototype, "method");
         *
         */
        function getMetadataKeys(target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryMetadataKeys(target, propertyKey);
        }
        exporter("getMetadataKeys", getMetadataKeys);
        /**
         * Gets the unique metadata keys defined on the target object.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns An array of unique metadata keys.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.getOwnMetadataKeys(Example);
         *
         *     // property (on constructor)
         *     result = Reflect.getOwnMetadataKeys(Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.getOwnMetadataKeys(Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.getOwnMetadataKeys(Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.getOwnMetadataKeys(Example.prototype, "method");
         *
         */
        function getOwnMetadataKeys(target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryOwnMetadataKeys(target, propertyKey);
        }
        exporter("getOwnMetadataKeys", getOwnMetadataKeys);
        /**
         * Deletes the metadata entry from the target object with the provided key.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns `true` if the metadata entry was found and deleted; otherwise, false.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.deleteMetadata("custom:annotation", Example);
         *
         *     // property (on constructor)
         *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "method");
         *
         */
        function deleteMetadata(metadataKey, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            var provider = GetMetadataProvider(target, propertyKey, /*Create*/ false);
            if (IsUndefined(provider))
                return false;
            return provider.OrdinaryDeleteMetadata(metadataKey, target, propertyKey);
        }
        exporter("deleteMetadata", deleteMetadata);
        function DecorateConstructor(decorators, target) {
            for (var i = decorators.length - 1; i >= 0; --i) {
                var decorator = decorators[i];
                var decorated = decorator(target);
                if (!IsUndefined(decorated) && !IsNull(decorated)) {
                    if (!IsConstructor(decorated))
                        throw new TypeError();
                    target = decorated;
                }
            }
            return target;
        }
        function DecorateProperty(decorators, target, propertyKey, descriptor) {
            for (var i = decorators.length - 1; i >= 0; --i) {
                var decorator = decorators[i];
                var decorated = decorator(target, propertyKey, descriptor);
                if (!IsUndefined(decorated) && !IsNull(decorated)) {
                    if (!IsObject(decorated))
                        throw new TypeError();
                    descriptor = decorated;
                }
            }
            return descriptor;
        }
        // 3.1.1.1 OrdinaryHasMetadata(MetadataKey, O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinaryhasmetadata
        function OrdinaryHasMetadata(MetadataKey, O, P) {
            var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
            if (hasOwn)
                return true;
            var parent = OrdinaryGetPrototypeOf(O);
            if (!IsNull(parent))
                return OrdinaryHasMetadata(MetadataKey, parent, P);
            return false;
        }
        // 3.1.2.1 OrdinaryHasOwnMetadata(MetadataKey, O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinaryhasownmetadata
        function OrdinaryHasOwnMetadata(MetadataKey, O, P) {
            var provider = GetMetadataProvider(O, P, /*Create*/ false);
            if (IsUndefined(provider))
                return false;
            return ToBoolean(provider.OrdinaryHasOwnMetadata(MetadataKey, O, P));
        }
        // 3.1.3.1 OrdinaryGetMetadata(MetadataKey, O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinarygetmetadata
        function OrdinaryGetMetadata(MetadataKey, O, P) {
            var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
            if (hasOwn)
                return OrdinaryGetOwnMetadata(MetadataKey, O, P);
            var parent = OrdinaryGetPrototypeOf(O);
            if (!IsNull(parent))
                return OrdinaryGetMetadata(MetadataKey, parent, P);
            return undefined;
        }
        // 3.1.4.1 OrdinaryGetOwnMetadata(MetadataKey, O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinarygetownmetadata
        function OrdinaryGetOwnMetadata(MetadataKey, O, P) {
            var provider = GetMetadataProvider(O, P, /*Create*/ false);
            if (IsUndefined(provider))
                return;
            return provider.OrdinaryGetOwnMetadata(MetadataKey, O, P);
        }
        // 3.1.5.1 OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinarydefineownmetadata
        function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
            var provider = GetMetadataProvider(O, P, /*Create*/ true);
            provider.OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P);
        }
        // 3.1.6.1 OrdinaryMetadataKeys(O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinarymetadatakeys
        function OrdinaryMetadataKeys(O, P) {
            var ownKeys = OrdinaryOwnMetadataKeys(O, P);
            var parent = OrdinaryGetPrototypeOf(O);
            if (parent === null)
                return ownKeys;
            var parentKeys = OrdinaryMetadataKeys(parent, P);
            if (parentKeys.length <= 0)
                return ownKeys;
            if (ownKeys.length <= 0)
                return parentKeys;
            var set = new _Set();
            var keys = [];
            for (var _i = 0, ownKeys_1 = ownKeys; _i < ownKeys_1.length; _i++) {
                var key = ownKeys_1[_i];
                var hasKey = set.has(key);
                if (!hasKey) {
                    set.add(key);
                    keys.push(key);
                }
            }
            for (var _a = 0, parentKeys_1 = parentKeys; _a < parentKeys_1.length; _a++) {
                var key = parentKeys_1[_a];
                var hasKey = set.has(key);
                if (!hasKey) {
                    set.add(key);
                    keys.push(key);
                }
            }
            return keys;
        }
        // 3.1.7.1 OrdinaryOwnMetadataKeys(O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinaryownmetadatakeys
        function OrdinaryOwnMetadataKeys(O, P) {
            var provider = GetMetadataProvider(O, P, /*create*/ false);
            if (!provider) {
                return [];
            }
            return provider.OrdinaryOwnMetadataKeys(O, P);
        }
        // 6 ECMAScript Data Types and Values
        // https://tc39.github.io/ecma262/#sec-ecmascript-data-types-and-values
        function Type(x) {
            if (x === null)
                return 1 /* Null */;
            switch (typeof x) {
                case "undefined": return 0 /* Undefined */;
                case "boolean": return 2 /* Boolean */;
                case "string": return 3 /* String */;
                case "symbol": return 4 /* Symbol */;
                case "number": return 5 /* Number */;
                case "object": return x === null ? 1 /* Null */ : 6 /* Object */;
                default: return 6 /* Object */;
            }
        }
        // 6.1.1 The Undefined Type
        // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-undefined-type
        function IsUndefined(x) {
            return x === undefined;
        }
        // 6.1.2 The Null Type
        // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-null-type
        function IsNull(x) {
            return x === null;
        }
        // 6.1.5 The Symbol Type
        // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-symbol-type
        function IsSymbol(x) {
            return typeof x === "symbol";
        }
        // 6.1.7 The Object Type
        // https://tc39.github.io/ecma262/#sec-object-type
        function IsObject(x) {
            return typeof x === "object" ? x !== null : typeof x === "function";
        }
        // 7.1 Type Conversion
        // https://tc39.github.io/ecma262/#sec-type-conversion
        // 7.1.1 ToPrimitive(input [, PreferredType])
        // https://tc39.github.io/ecma262/#sec-toprimitive
        function ToPrimitive(input, PreferredType) {
            switch (Type(input)) {
                case 0 /* Undefined */: return input;
                case 1 /* Null */: return input;
                case 2 /* Boolean */: return input;
                case 3 /* String */: return input;
                case 4 /* Symbol */: return input;
                case 5 /* Number */: return input;
            }
            var hint = PreferredType === 3 /* String */ ? "string" : PreferredType === 5 /* Number */ ? "number" : "default";
            var exoticToPrim = GetMethod(input, toPrimitiveSymbol);
            if (exoticToPrim !== undefined) {
                var result = exoticToPrim.call(input, hint);
                if (IsObject(result))
                    throw new TypeError();
                return result;
            }
            return OrdinaryToPrimitive(input, hint === "default" ? "number" : hint);
        }
        // 7.1.1.1 OrdinaryToPrimitive(O, hint)
        // https://tc39.github.io/ecma262/#sec-ordinarytoprimitive
        function OrdinaryToPrimitive(O, hint) {
            if (hint === "string") {
                var toString_1 = O.toString;
                if (IsCallable(toString_1)) {
                    var result = toString_1.call(O);
                    if (!IsObject(result))
                        return result;
                }
                var valueOf = O.valueOf;
                if (IsCallable(valueOf)) {
                    var result = valueOf.call(O);
                    if (!IsObject(result))
                        return result;
                }
            }
            else {
                var valueOf = O.valueOf;
                if (IsCallable(valueOf)) {
                    var result = valueOf.call(O);
                    if (!IsObject(result))
                        return result;
                }
                var toString_2 = O.toString;
                if (IsCallable(toString_2)) {
                    var result = toString_2.call(O);
                    if (!IsObject(result))
                        return result;
                }
            }
            throw new TypeError();
        }
        // 7.1.2 ToBoolean(argument)
        // https://tc39.github.io/ecma262/2016/#sec-toboolean
        function ToBoolean(argument) {
            return !!argument;
        }
        // 7.1.12 ToString(argument)
        // https://tc39.github.io/ecma262/#sec-tostring
        function ToString(argument) {
            return "" + argument;
        }
        // 7.1.14 ToPropertyKey(argument)
        // https://tc39.github.io/ecma262/#sec-topropertykey
        function ToPropertyKey(argument) {
            var key = ToPrimitive(argument, 3 /* String */);
            if (IsSymbol(key))
                return key;
            return ToString(key);
        }
        // 7.2 Testing and Comparison Operations
        // https://tc39.github.io/ecma262/#sec-testing-and-comparison-operations
        // 7.2.2 IsArray(argument)
        // https://tc39.github.io/ecma262/#sec-isarray
        function IsArray(argument) {
            return Array.isArray
                ? Array.isArray(argument)
                : argument instanceof Object
                    ? argument instanceof Array
                    : Object.prototype.toString.call(argument) === "[object Array]";
        }
        // 7.2.3 IsCallable(argument)
        // https://tc39.github.io/ecma262/#sec-iscallable
        function IsCallable(argument) {
            // NOTE: This is an approximation as we cannot check for [[Call]] internal method.
            return typeof argument === "function";
        }
        // 7.2.4 IsConstructor(argument)
        // https://tc39.github.io/ecma262/#sec-isconstructor
        function IsConstructor(argument) {
            // NOTE: This is an approximation as we cannot check for [[Construct]] internal method.
            return typeof argument === "function";
        }
        // 7.2.7 IsPropertyKey(argument)
        // https://tc39.github.io/ecma262/#sec-ispropertykey
        function IsPropertyKey(argument) {
            switch (Type(argument)) {
                case 3 /* String */: return true;
                case 4 /* Symbol */: return true;
                default: return false;
            }
        }
        function SameValueZero(x, y) {
            return x === y || x !== x && y !== y;
        }
        // 7.3 Operations on Objects
        // https://tc39.github.io/ecma262/#sec-operations-on-objects
        // 7.3.9 GetMethod(V, P)
        // https://tc39.github.io/ecma262/#sec-getmethod
        function GetMethod(V, P) {
            var func = V[P];
            if (func === undefined || func === null)
                return undefined;
            if (!IsCallable(func))
                throw new TypeError();
            return func;
        }
        // 7.4 Operations on Iterator Objects
        // https://tc39.github.io/ecma262/#sec-operations-on-iterator-objects
        function GetIterator(obj) {
            var method = GetMethod(obj, iteratorSymbol);
            if (!IsCallable(method))
                throw new TypeError(); // from Call
            var iterator = method.call(obj);
            if (!IsObject(iterator))
                throw new TypeError();
            return iterator;
        }
        // 7.4.4 IteratorValue(iterResult)
        // https://tc39.github.io/ecma262/2016/#sec-iteratorvalue
        function IteratorValue(iterResult) {
            return iterResult.value;
        }
        // 7.4.5 IteratorStep(iterator)
        // https://tc39.github.io/ecma262/#sec-iteratorstep
        function IteratorStep(iterator) {
            var result = iterator.next();
            return result.done ? false : result;
        }
        // 7.4.6 IteratorClose(iterator, completion)
        // https://tc39.github.io/ecma262/#sec-iteratorclose
        function IteratorClose(iterator) {
            var f = iterator["return"];
            if (f)
                f.call(iterator);
        }
        // 9.1 Ordinary Object Internal Methods and Internal Slots
        // https://tc39.github.io/ecma262/#sec-ordinary-object-internal-methods-and-internal-slots
        // 9.1.1.1 OrdinaryGetPrototypeOf(O)
        // https://tc39.github.io/ecma262/#sec-ordinarygetprototypeof
        function OrdinaryGetPrototypeOf(O) {
            var proto = Object.getPrototypeOf(O);
            if (typeof O !== "function" || O === functionPrototype)
                return proto;
            // TypeScript doesn't set __proto__ in ES5, as it's non-standard.
            // Try to determine the superclass constructor. Compatible implementations
            // must either set __proto__ on a subclass constructor to the superclass constructor,
            // or ensure each class has a valid `constructor` property on its prototype that
            // points back to the constructor.
            // If this is not the same as Function.[[Prototype]], then this is definately inherited.
            // This is the case when in ES6 or when using __proto__ in a compatible browser.
            if (proto !== functionPrototype)
                return proto;
            // If the super prototype is Object.prototype, null, or undefined, then we cannot determine the heritage.
            var prototype = O.prototype;
            var prototypeProto = prototype && Object.getPrototypeOf(prototype);
            if (prototypeProto == null || prototypeProto === Object.prototype)
                return proto;
            // If the constructor was not a function, then we cannot determine the heritage.
            var constructor = prototypeProto.constructor;
            if (typeof constructor !== "function")
                return proto;
            // If we have some kind of self-reference, then we cannot determine the heritage.
            if (constructor === O)
                return proto;
            // we have a pretty good guess at the heritage.
            return constructor;
        }
        // Global metadata registry
        // - Allows `import "reflect-metadata"` and `import "reflect-metadata/no-conflict"` to interoperate.
        // - Uses isolated metadata if `Reflect` is frozen before the registry can be installed.
        /**
         * Creates a registry used to allow multiple `reflect-metadata` providers.
         */
        function CreateMetadataRegistry() {
            var fallback;
            if (!IsUndefined(registrySymbol) &&
                typeof root.Reflect !== "undefined" &&
                !(registrySymbol in root.Reflect) &&
                typeof root.Reflect.defineMetadata === "function") {
                // interoperate with older version of `reflect-metadata` that did not support a registry.
                fallback = CreateFallbackProvider(root.Reflect);
            }
            var first;
            var second;
            var rest;
            var targetProviderMap = new _WeakMap();
            var registry = {
                registerProvider: registerProvider,
                getProvider: getProvider,
                setProvider: setProvider,
            };
            return registry;
            function registerProvider(provider) {
                if (!Object.isExtensible(registry)) {
                    throw new Error("Cannot add provider to a frozen registry.");
                }
                switch (true) {
                    case fallback === provider: break;
                    case IsUndefined(first):
                        first = provider;
                        break;
                    case first === provider: break;
                    case IsUndefined(second):
                        second = provider;
                        break;
                    case second === provider: break;
                    default:
                        if (rest === undefined)
                            rest = new _Set();
                        rest.add(provider);
                        break;
                }
            }
            function getProviderNoCache(O, P) {
                if (!IsUndefined(first)) {
                    if (first.isProviderFor(O, P))
                        return first;
                    if (!IsUndefined(second)) {
                        if (second.isProviderFor(O, P))
                            return first;
                        if (!IsUndefined(rest)) {
                            var iterator = GetIterator(rest);
                            while (true) {
                                var next = IteratorStep(iterator);
                                if (!next) {
                                    return undefined;
                                }
                                var provider = IteratorValue(next);
                                if (provider.isProviderFor(O, P)) {
                                    IteratorClose(iterator);
                                    return provider;
                                }
                            }
                        }
                    }
                }
                if (!IsUndefined(fallback) && fallback.isProviderFor(O, P)) {
                    return fallback;
                }
                return undefined;
            }
            function getProvider(O, P) {
                var providerMap = targetProviderMap.get(O);
                var provider;
                if (!IsUndefined(providerMap)) {
                    provider = providerMap.get(P);
                }
                if (!IsUndefined(provider)) {
                    return provider;
                }
                provider = getProviderNoCache(O, P);
                if (!IsUndefined(provider)) {
                    if (IsUndefined(providerMap)) {
                        providerMap = new _Map();
                        targetProviderMap.set(O, providerMap);
                    }
                    providerMap.set(P, provider);
                }
                return provider;
            }
            function hasProvider(provider) {
                if (IsUndefined(provider))
                    throw new TypeError();
                return first === provider || second === provider || !IsUndefined(rest) && rest.has(provider);
            }
            function setProvider(O, P, provider) {
                if (!hasProvider(provider)) {
                    throw new Error("Metadata provider not registered.");
                }
                var existingProvider = getProvider(O, P);
                if (existingProvider !== provider) {
                    if (!IsUndefined(existingProvider)) {
                        return false;
                    }
                    var providerMap = targetProviderMap.get(O);
                    if (IsUndefined(providerMap)) {
                        providerMap = new _Map();
                        targetProviderMap.set(O, providerMap);
                    }
                    providerMap.set(P, provider);
                }
                return true;
            }
        }
        /**
         * Gets or creates the shared registry of metadata providers.
         */
        function GetOrCreateMetadataRegistry() {
            var metadataRegistry;
            if (!IsUndefined(registrySymbol) && IsObject(root.Reflect) && Object.isExtensible(root.Reflect)) {
                metadataRegistry = root.Reflect[registrySymbol];
            }
            if (IsUndefined(metadataRegistry)) {
                metadataRegistry = CreateMetadataRegistry();
            }
            if (!IsUndefined(registrySymbol) && IsObject(root.Reflect) && Object.isExtensible(root.Reflect)) {
                Object.defineProperty(root.Reflect, registrySymbol, {
                    enumerable: false,
                    configurable: false,
                    writable: false,
                    value: metadataRegistry
                });
            }
            return metadataRegistry;
        }
        function CreateMetadataProvider(registry) {
            // [[Metadata]] internal slot
            // https://rbuckton.github.io/reflect-metadata/#ordinary-object-internal-methods-and-internal-slots
            var metadata = new _WeakMap();
            var provider = {
                isProviderFor: function (O, P) {
                    var targetMetadata = metadata.get(O);
                    if (IsUndefined(targetMetadata))
                        return false;
                    return targetMetadata.has(P);
                },
                OrdinaryDefineOwnMetadata: OrdinaryDefineOwnMetadata,
                OrdinaryHasOwnMetadata: OrdinaryHasOwnMetadata,
                OrdinaryGetOwnMetadata: OrdinaryGetOwnMetadata,
                OrdinaryOwnMetadataKeys: OrdinaryOwnMetadataKeys,
                OrdinaryDeleteMetadata: OrdinaryDeleteMetadata,
            };
            metadataRegistry.registerProvider(provider);
            return provider;
            function GetOrCreateMetadataMap(O, P, Create) {
                var targetMetadata = metadata.get(O);
                var createdTargetMetadata = false;
                if (IsUndefined(targetMetadata)) {
                    if (!Create)
                        return undefined;
                    targetMetadata = new _Map();
                    metadata.set(O, targetMetadata);
                    createdTargetMetadata = true;
                }
                var metadataMap = targetMetadata.get(P);
                if (IsUndefined(metadataMap)) {
                    if (!Create)
                        return undefined;
                    metadataMap = new _Map();
                    targetMetadata.set(P, metadataMap);
                    if (!registry.setProvider(O, P, provider)) {
                        targetMetadata.delete(P);
                        if (createdTargetMetadata) {
                            metadata.delete(O);
                        }
                        throw new Error("Wrong provider for target.");
                    }
                }
                return metadataMap;
            }
            // 3.1.2.1 OrdinaryHasOwnMetadata(MetadataKey, O, P)
            // https://rbuckton.github.io/reflect-metadata/#ordinaryhasownmetadata
            function OrdinaryHasOwnMetadata(MetadataKey, O, P) {
                var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
                if (IsUndefined(metadataMap))
                    return false;
                return ToBoolean(metadataMap.has(MetadataKey));
            }
            // 3.1.4.1 OrdinaryGetOwnMetadata(MetadataKey, O, P)
            // https://rbuckton.github.io/reflect-metadata/#ordinarygetownmetadata
            function OrdinaryGetOwnMetadata(MetadataKey, O, P) {
                var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
                if (IsUndefined(metadataMap))
                    return undefined;
                return metadataMap.get(MetadataKey);
            }
            // 3.1.5.1 OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P)
            // https://rbuckton.github.io/reflect-metadata/#ordinarydefineownmetadata
            function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
                var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ true);
                metadataMap.set(MetadataKey, MetadataValue);
            }
            // 3.1.7.1 OrdinaryOwnMetadataKeys(O, P)
            // https://rbuckton.github.io/reflect-metadata/#ordinaryownmetadatakeys
            function OrdinaryOwnMetadataKeys(O, P) {
                var keys = [];
                var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
                if (IsUndefined(metadataMap))
                    return keys;
                var keysObj = metadataMap.keys();
                var iterator = GetIterator(keysObj);
                var k = 0;
                while (true) {
                    var next = IteratorStep(iterator);
                    if (!next) {
                        keys.length = k;
                        return keys;
                    }
                    var nextValue = IteratorValue(next);
                    try {
                        keys[k] = nextValue;
                    }
                    catch (e) {
                        try {
                            IteratorClose(iterator);
                        }
                        finally {
                            throw e;
                        }
                    }
                    k++;
                }
            }
            function OrdinaryDeleteMetadata(MetadataKey, O, P) {
                var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
                if (IsUndefined(metadataMap))
                    return false;
                if (!metadataMap.delete(MetadataKey))
                    return false;
                if (metadataMap.size === 0) {
                    var targetMetadata = metadata.get(O);
                    if (!IsUndefined(targetMetadata)) {
                        targetMetadata.delete(P);
                        if (targetMetadata.size === 0) {
                            metadata.delete(targetMetadata);
                        }
                    }
                }
                return true;
            }
        }
        function CreateFallbackProvider(reflect) {
            var defineMetadata = reflect.defineMetadata, hasOwnMetadata = reflect.hasOwnMetadata, getOwnMetadata = reflect.getOwnMetadata, getOwnMetadataKeys = reflect.getOwnMetadataKeys, deleteMetadata = reflect.deleteMetadata;
            var metadataOwner = new _WeakMap();
            var provider = {
                isProviderFor: function (O, P) {
                    var metadataPropertySet = metadataOwner.get(O);
                    if (!IsUndefined(metadataPropertySet) && metadataPropertySet.has(P)) {
                        return true;
                    }
                    if (getOwnMetadataKeys(O, P).length) {
                        if (IsUndefined(metadataPropertySet)) {
                            metadataPropertySet = new _Set();
                            metadataOwner.set(O, metadataPropertySet);
                        }
                        metadataPropertySet.add(P);
                        return true;
                    }
                    return false;
                },
                OrdinaryDefineOwnMetadata: defineMetadata,
                OrdinaryHasOwnMetadata: hasOwnMetadata,
                OrdinaryGetOwnMetadata: getOwnMetadata,
                OrdinaryOwnMetadataKeys: getOwnMetadataKeys,
                OrdinaryDeleteMetadata: deleteMetadata,
            };
            return provider;
        }
        /**
         * Gets the metadata provider for an object. If the object has no metadata provider and this is for a create operation,
         * then this module's metadata provider is assigned to the object.
         */
        function GetMetadataProvider(O, P, Create) {
            var registeredProvider = metadataRegistry.getProvider(O, P);
            if (!IsUndefined(registeredProvider)) {
                return registeredProvider;
            }
            if (Create) {
                if (metadataRegistry.setProvider(O, P, metadataProvider)) {
                    return metadataProvider;
                }
                throw new Error("Illegal state.");
            }
            return undefined;
        }
        // naive Map shim
        function CreateMapPolyfill() {
            var cacheSentinel = {};
            var arraySentinel = [];
            var MapIterator = /** @class */ (function () {
                function MapIterator(keys, values, selector) {
                    this._index = 0;
                    this._keys = keys;
                    this._values = values;
                    this._selector = selector;
                }
                MapIterator.prototype["@@iterator"] = function () { return this; };
                MapIterator.prototype[iteratorSymbol] = function () { return this; };
                MapIterator.prototype.next = function () {
                    var index = this._index;
                    if (index >= 0 && index < this._keys.length) {
                        var result = this._selector(this._keys[index], this._values[index]);
                        if (index + 1 >= this._keys.length) {
                            this._index = -1;
                            this._keys = arraySentinel;
                            this._values = arraySentinel;
                        }
                        else {
                            this._index++;
                        }
                        return { value: result, done: false };
                    }
                    return { value: undefined, done: true };
                };
                MapIterator.prototype.throw = function (error) {
                    if (this._index >= 0) {
                        this._index = -1;
                        this._keys = arraySentinel;
                        this._values = arraySentinel;
                    }
                    throw error;
                };
                MapIterator.prototype.return = function (value) {
                    if (this._index >= 0) {
                        this._index = -1;
                        this._keys = arraySentinel;
                        this._values = arraySentinel;
                    }
                    return { value: value, done: true };
                };
                return MapIterator;
            }());
            var Map = /** @class */ (function () {
                function Map() {
                    this._keys = [];
                    this._values = [];
                    this._cacheKey = cacheSentinel;
                    this._cacheIndex = -2;
                }
                Object.defineProperty(Map.prototype, "size", {
                    get: function () { return this._keys.length; },
                    enumerable: true,
                    configurable: true
                });
                Map.prototype.has = function (key) { return this._find(key, /*insert*/ false) >= 0; };
                Map.prototype.get = function (key) {
                    var index = this._find(key, /*insert*/ false);
                    return index >= 0 ? this._values[index] : undefined;
                };
                Map.prototype.set = function (key, value) {
                    var index = this._find(key, /*insert*/ true);
                    this._values[index] = value;
                    return this;
                };
                Map.prototype.delete = function (key) {
                    var index = this._find(key, /*insert*/ false);
                    if (index >= 0) {
                        var size = this._keys.length;
                        for (var i = index + 1; i < size; i++) {
                            this._keys[i - 1] = this._keys[i];
                            this._values[i - 1] = this._values[i];
                        }
                        this._keys.length--;
                        this._values.length--;
                        if (SameValueZero(key, this._cacheKey)) {
                            this._cacheKey = cacheSentinel;
                            this._cacheIndex = -2;
                        }
                        return true;
                    }
                    return false;
                };
                Map.prototype.clear = function () {
                    this._keys.length = 0;
                    this._values.length = 0;
                    this._cacheKey = cacheSentinel;
                    this._cacheIndex = -2;
                };
                Map.prototype.keys = function () { return new MapIterator(this._keys, this._values, getKey); };
                Map.prototype.values = function () { return new MapIterator(this._keys, this._values, getValue); };
                Map.prototype.entries = function () { return new MapIterator(this._keys, this._values, getEntry); };
                Map.prototype["@@iterator"] = function () { return this.entries(); };
                Map.prototype[iteratorSymbol] = function () { return this.entries(); };
                Map.prototype._find = function (key, insert) {
                    if (!SameValueZero(this._cacheKey, key)) {
                        this._cacheIndex = -1;
                        for (var i = 0; i < this._keys.length; i++) {
                            if (SameValueZero(this._keys[i], key)) {
                                this._cacheIndex = i;
                                break;
                            }
                        }
                    }
                    if (this._cacheIndex < 0 && insert) {
                        this._cacheIndex = this._keys.length;
                        this._keys.push(key);
                        this._values.push(undefined);
                    }
                    return this._cacheIndex;
                };
                return Map;
            }());
            return Map;
            function getKey(key, _) {
                return key;
            }
            function getValue(_, value) {
                return value;
            }
            function getEntry(key, value) {
                return [key, value];
            }
        }
        // naive Set shim
        function CreateSetPolyfill() {
            var Set = /** @class */ (function () {
                function Set() {
                    this._map = new _Map();
                }
                Object.defineProperty(Set.prototype, "size", {
                    get: function () { return this._map.size; },
                    enumerable: true,
                    configurable: true
                });
                Set.prototype.has = function (value) { return this._map.has(value); };
                Set.prototype.add = function (value) { return this._map.set(value, value), this; };
                Set.prototype.delete = function (value) { return this._map.delete(value); };
                Set.prototype.clear = function () { this._map.clear(); };
                Set.prototype.keys = function () { return this._map.keys(); };
                Set.prototype.values = function () { return this._map.keys(); };
                Set.prototype.entries = function () { return this._map.entries(); };
                Set.prototype["@@iterator"] = function () { return this.keys(); };
                Set.prototype[iteratorSymbol] = function () { return this.keys(); };
                return Set;
            }());
            return Set;
        }
        // naive WeakMap shim
        function CreateWeakMapPolyfill() {
            var UUID_SIZE = 16;
            var keys = HashMap.create();
            var rootKey = CreateUniqueKey();
            return /** @class */ (function () {
                function WeakMap() {
                    this._key = CreateUniqueKey();
                }
                WeakMap.prototype.has = function (target) {
                    var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                    return table !== undefined ? HashMap.has(table, this._key) : false;
                };
                WeakMap.prototype.get = function (target) {
                    var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                    return table !== undefined ? HashMap.get(table, this._key) : undefined;
                };
                WeakMap.prototype.set = function (target, value) {
                    var table = GetOrCreateWeakMapTable(target, /*create*/ true);
                    table[this._key] = value;
                    return this;
                };
                WeakMap.prototype.delete = function (target) {
                    var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                    return table !== undefined ? delete table[this._key] : false;
                };
                WeakMap.prototype.clear = function () {
                    // NOTE: not a real clear, just makes the previous data unreachable
                    this._key = CreateUniqueKey();
                };
                return WeakMap;
            }());
            function CreateUniqueKey() {
                var key;
                do
                    key = "@@WeakMap@@" + CreateUUID();
                while (HashMap.has(keys, key));
                keys[key] = true;
                return key;
            }
            function GetOrCreateWeakMapTable(target, create) {
                if (!hasOwn.call(target, rootKey)) {
                    if (!create)
                        return undefined;
                    Object.defineProperty(target, rootKey, { value: HashMap.create() });
                }
                return target[rootKey];
            }
            function FillRandomBytes(buffer, size) {
                for (var i = 0; i < size; ++i)
                    buffer[i] = Math.random() * 0xff | 0;
                return buffer;
            }
            function GenRandomBytes(size) {
                if (typeof Uint8Array === "function") {
                    var array = new Uint8Array(size);
                    if (typeof crypto !== "undefined") {
                        crypto.getRandomValues(array);
                    }
                    else if (typeof msCrypto !== "undefined") {
                        msCrypto.getRandomValues(array);
                    }
                    else {
                        FillRandomBytes(array, size);
                    }
                    return array;
                }
                return FillRandomBytes(new Array(size), size);
            }
            function CreateUUID() {
                var data = GenRandomBytes(UUID_SIZE);
                // mark as random - RFC 4122 § 4.4
                data[6] = data[6] & 0x4f | 0x40;
                data[8] = data[8] & 0xbf | 0x80;
                var result = "";
                for (var offset = 0; offset < UUID_SIZE; ++offset) {
                    var byte = data[offset];
                    if (offset === 4 || offset === 6 || offset === 8)
                        result += "-";
                    if (byte < 16)
                        result += "0";
                    result += byte.toString(16).toLowerCase();
                }
                return result;
            }
        }
        // uses a heuristic used by v8 and chakra to force an object into dictionary mode.
        function MakeDictionary(obj) {
            obj.__ = undefined;
            delete obj.__;
            return obj;
        }
    });
})(Reflect || (Reflect = {}));


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__nccwpck_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__nccwpck_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
const { Bootstrap } = __nccwpck_require__(1836);
Bootstrap.run();

module.exports = __webpack_exports__;
/******/ })()
;