/* global App */
describe('Application', function () {
    'use strict';

    it('should be instance of T.Application', function () {
        var application = new T.Application();
        expect(application instanceof T.Application).toBeTruthy();
    });

    it('should have default ctx when called with no args', function () {
        var application = new T.Application();
        expect(application._ctx).toEqual(document.documentElement);
    });

    it('should have default ctx when called with config only', function () {
        var config = {'foo': 'bar'};
        var application = new T.Application(config);
        expect(application._ctx).toEqual(document.documentElement);
    });

    it('should support normal order of constructor arguments', function () {
        var config = {'foo': 'bar'};
        var el = document.createElement('div');
        var application = new T.Application(el, config);
        expect(application._ctx).toEqual(el);
    });

    it('should support reverse order of constructor arguments', function () {
        var config = {'foo': 'bar'};
        var el = document.createElement('div');
        var application = new T.Application(config, el);
        expect(application._ctx).toEqual(el);
    });

    describe('.registerModules(ctx)', function () {
        beforeEach(function () {
            this.application = new T.Application();
            this.ctx = document.createElement('div');
            spyOn(this.application, 'registerModule').and.callThrough();
        });

        it('should register module on ctx node', function () {
            this.ctx.setAttribute('data-t-name', 'Foo');
            var modules = this.application.registerModules(this.ctx);

            expect(this.application.registerModule.calls.count()).toEqual(1);
            expect(this.application.registerModule).toHaveBeenCalledWith(this.ctx, 'Foo', null, null);
            expect(Object.keys(modules).length).toEqual(1);

        });

        it('should register module on child node', function () {
            this.ctx.innerHTML = '<div data-t-name="Foo"></div>';
            var modules = this.application.registerModules(this.ctx);

            expect(this.application.registerModule.calls.count()).toEqual(1);
            expect(this.application.registerModule).toHaveBeenCalledWith(this.ctx.firstChild, 'Foo', null, null);
            expect(Object.keys(modules).length).toEqual(1);
        });

        it('should register multiple modules on sibling nodes', function () {
            this.ctx.innerHTML = '<div data-t-name="Foo"></div><div data-t-name="Foo"></div>';
            var modules = this.application.registerModules(this.ctx);

            expect(this.application.registerModule.calls.count()).toEqual(2);
            expect(Object.keys(modules).length).toEqual(2);
        });

        it('should register multiple modules on nested nodes', function () {
            this.ctx.innerHTML = '<div data-t-name="Foo"><div data-t-name="Foo"></div></div>';
            var modules = this.application.registerModules(this.ctx);

            expect(this.application.registerModule.calls.count()).toEqual(2);
            expect(Object.keys(modules).length).toEqual(2);
        });

        describe('should emit lifecycle event', function () {
            beforeEach(function () {
                this.eventEmitter = new T.EventEmitter(this.application._sandbox);
            });

            it('t.register.start without arguments', function (done) {
                this.eventEmitter.on('t.register.start', function (args) {
                    expect(args).toBeUndefined();
                    done();
                });

                this.application.registerModules(this.ctx);
            });

            it('t.register.end without arguments', function (done) {
                this.eventEmitter.on('t.register.end', function (args) {
                    expect(args).toBeUndefined();
                    done();
                });

                this.application.registerModules(this.ctx);
            });
        });
    });

    describe('.unregisterModules()', function () {
        beforeEach(function () {
            this.application = new T.Application();
        });

        it('should unregister all modules', function () {
            this.application._modules = {1: true, 2: true, 3: true};
            this.application.unregisterModules();

            expect(Object.keys(this.application._modules).length).toEqual(0);
        });

        describe('should emit lifecycle event', function () {
            beforeEach(function () {
                this.eventEmitter = new T.EventEmitter(this.application._sandbox);
            });

            it('t.unregister.start without arguments', function (done) {
                this.eventEmitter.on('t.unregister.start', function (args) {
                    expect(args).toBeUndefined();
                    done();
                });

                this.application.unregisterModules();
            });

            it('t.unregister.end without arguments', function (done) {
                this.eventEmitter.on('t.unregister.end', function (args) {
                    expect(args).toBeUndefined();
                    done();
                });

                this.application.unregisterModules();
            });
        });
    });

    describe('.unregisterModules(modules)', function () {
        beforeEach(function () {
            this.application = new T.Application();
        });

        it('should unregister the given modules', function () {
            this.application._modules = {1: true, 2: true, 3: true};
            this.application.unregisterModules({1: true, 2: true});

            expect(Object.keys(this.application._modules).length).toEqual(1);
            expect(this.application._modules[3]).toBeDefined();
        });

        describe('should emit lifecycle event', function () {
            beforeEach(function () {
                this.eventEmitter = new T.EventEmitter(this.application._sandbox);
            });

            it('t.unregister.start without arguments', function (done) {
                this.eventEmitter.on('t.unregister.start', function (args) {
                    expect(args).toBeUndefined();
                    done();
                });

                this.application.unregisterModules();
            });

            it('t.unregister.end without arguments', function (done) {
                this.eventEmitter.on('t.unregister.end', function (args) {
                    expect(args).toBeUndefined();
                    done();
                });

                this.application.unregisterModules();
            });
        });
    });

    describe('.getModuleById(id)', function () {
        beforeEach(function () {
            this.application = new T.Application();
        });

        it('should throw an error for undefined id', function () {
            expect(function () {
                this.application.getModuleById();
            }.bind(this)).toThrow();
        });

        it('should not throw an error for invalid id', function () {
            expect(function () {
                this.application.getModuleById(1);
            }.bind(this)).toThrow();
        });

        it('should return registered module instance', function () {
            this.application._modules = {3: true};
            var instance = this.application.getModuleById(3);
            expect(instance).toBeTruthy();
        });

        it('should cast the id', function () {
            this.application._modules = {3: true};
            var instance = this.application.getModuleById('3');
            expect(instance).toBeTruthy();
        });
    });

    describe('.registerModule(ctx, mod, decorators, namespace)', function () {
        beforeEach(function () {
            this.application = new T.Application();
            this.ctx = document.createElement('div');
        });

        it('should allow to be called with ctx and module name only', function () {
            expect(function () {
                this.application.registerModule(this.ctx, 'DoesNotExist');
            }.bind(this)).not.toThrow();
        });

        it('should return null if the module does not exists', function () {
            var module = this.application.registerModule(this.ctx, 'DoesNotExist');
            expect(module).toBeNull();
        });

        it('should emit lifecycle event t.missing if the module does not exists', function (done) {
            var eventEmitter = new T.EventEmitter(this.application._sandbox);

            eventEmitter.on('t.missing', function (ctx, mod, decorators) {
                expect(ctx).toEqual(this.ctx);
                expect(mod).toEqual('DoesNotExist');
                expect(decorators).toEqual([]);
                done();
            }.bind(this));

            this.application.registerModule(this.ctx, 'DoesNotExist');
        });

        it('should return module instance if module does exists', function () {
            var module = this.application.registerModule(this.ctx, 'Foo');
            expect(module instanceof T.Module).toBeTruthy();
        });

        it('should support capitalized camelCase names', function () {
            var module = this.application.registerModule(this.ctx, 'FooStart');
            expect(module instanceof T.Module.FooStart).toBeTruthy();
        });

        it('should support camelCase names', function () {
            var module = this.application.registerModule(this.ctx, 'fooStart');
            expect(module instanceof T.Module.FooStart).toBeTruthy();
        });

        it('should support kebab-case names', function () {
            var module = this.application.registerModule(this.ctx, 'foo-start');
            expect(module instanceof T.Module.FooStart).toBeTruthy();
        });

        it('should support namespace as string', function () {
            var module = this.application.registerModule(this.ctx, 'Foo', 'App.Components');
            expect(module instanceof T.Module).toBeTruthy();
        });

        it('should support namespace as object', function () {
            var module = this.application.registerModule(this.ctx, 'Foo', App.Components);
            expect(module instanceof T.Module).toBeTruthy();
        });

        it('should assign ctx node and sandbox to the module instance', function () {
            var module = this.application.registerModule(this.ctx, 'Foo');
            expect(module._ctx instanceof Node).toBeTruthy();
            expect(module._sandbox instanceof T.Sandbox).toBeTruthy();
        });

        it('should set data-t-id on the ctx node', function () {
            var module = this.application.registerModule(this.ctx, 'Foo');
            expect(Number(module._ctx.getAttribute('data-t-id'))).toEqual(1);
        });

        it('should have default start and stop callbacks', function () {
            var module = this.application.registerModule(this.ctx, 'Foo');

            expect(module instanceof T.Module.Foo).toBeTruthy();
            expect(module.start).toBeDefined();
            expect(module.stop).toBeDefined();
        });

        it('should not do anything if decorator does not exists', function () {
            var module;

            expect(function () {
                module = this.application.registerModule(this.ctx, 'Foo', ['DoesNotExists']);
            }.bind(this)).not.toThrow();

            expect(module instanceof T.Module.Foo).toBeTruthy();
        });

        it('should decorate the module if decorator does exists', function () {
            var module = this.application.registerModule(this.ctx, 'Foo', ['Bar']);

            expect(module instanceof T.Module.Foo).toBeTruthy();
            expect(module.bar).toBeDefined();
            expect(module.bar()).toEqual('bar');
        });

		it('should delete temporary _parent property on decorator', function () {
			var module = this.application.registerModule(this.ctx, 'Foo', ['Bar', 'FooBar']);

			expect(module instanceof T.Module.Foo).toBeTruthy();
			expect(module._parent).not.toBeDefined();
		});

        it('should decorate the module with multiple decorators', function () {
            var module = this.application.registerModule(this.ctx, 'Foo', ['Bar', 'FooBar']);

            expect(module instanceof T.Module.Foo).toBeTruthy();
            expect(module.bar).toBeDefined();
            expect(module.bar()).toEqual('bar');
            expect(module.foobar).toBeDefined();
            expect(module.foobar()).toEqual('foobar');
        });

		it('should allow cascading calls with multiple decorators', function () {
			var module = this.application.registerModule(this.ctx, 'Foo', ['Bar', 'FooBar']);

			expect(module.foo()).toEqual('foobar-foo|bar-foo|foo');
		});

		it('should allow overriding properties', function () {
			var module = this.application.registerModule(this.ctx, 'Foo', ['Bar', 'FooBar']);

			expect(module.get()).toEqual('foobar|foobar|foobar');
		});

		it('should not throw an error if the start method does not exist on the decorated module', function () {
            var module = this.application.registerModule(this.ctx, 'Foo', ['Bar']);

            expect(module instanceof T.Module.Foo).toBeTruthy();
            expect(module.bar).toBeDefined();

            expect(function () {
                module.start(function () {
                });
            }).not.toThrow();
        });

        it('should increment the module id counter by one with every call', function () {
            var ctx1 = document.createElement('div');
            var ctx2 = document.createElement('div');
            var ctx3 = document.createElement('div');

            this.application.registerModule(ctx1, 'Foo');
            this.application.registerModule(ctx2, 'Foo');
            this.application.registerModule(ctx3, 'Foo');

            expect(Number(ctx1.getAttribute('data-t-id'))).toEqual(1);
            expect(Number(ctx2.getAttribute('data-t-id'))).toEqual(2);
            expect(Number(ctx3.getAttribute('data-t-id'))).toEqual(3);
        });
    });

    describe('.start()', function () {
        beforeEach(function () {
            this.application = new T.Application();
        });

        it('should return Promise if no modules are given', function () {
            var promise = this.application.start();

            expect(promise instanceof Promise).toBeTruthy();
        });

        it('should return Promise if valid modules are given', function () {
            var module = jasmine.createSpyObj('module', ['start']);
            var modules = {1: module, 2: module};

            var promise = this.application.start(modules);

            expect(promise instanceof Promise).toBeTruthy();
        });

        it('should throw an error if invalid modules are given', function () {
            var module = jasmine.createSpyObj('module', ['start']);
            module.start.and.callFake(function () {
                return {};
            });
            var modules = {1: module, 2: module};

            expect(function () {
                this.application.start(modules);
            }).toThrow();
        });

        it('should call start on the given modules', function () {
            var module = jasmine.createSpyObj('module', ['start']);
            var modules = {1: module, 2: module};

            this.application.start(modules);

            expect(module.start.calls.count()).toEqual(2);
        });

        it('should execute then callback if no modules are given', function (done) {
            var promise = this.application.start();

            promise.then(function () {
                done();
            });
        });

        it('should execute then callback if all modules (also async ones) are resolved', function (done) {
            var module = jasmine.createSpyObj('module', ['start']);
            var asyncModule = jasmine.createSpyObj('module', ['start']);
            module.start.and.callFake(function (resolve) {
                resolve();
            });
            asyncModule.start.and.callFake(function(resolve){
                setTimeout(function(){
                    resolve();
                }, 500);
            });

            var modules = {1: module, 2: asyncModule};
            var promise = this.application.start(modules);

            promise.then(function () {
                done();
            });
        });

        describe('should emit lifecycle event', function () {
            beforeEach(function () {
                this.eventEmitter = new T.EventEmitter(this.application._sandbox);
            });

            it('t.start without arguments', function (done) {
                this.eventEmitter.on('t.start', function (args) {
                    expect(args).toBeUndefined();
                    done();
                });

                this.application.start();
            });

            it('t.sync without arguments', function (done) {
                this.eventEmitter.on('t.sync', function (args) {
                    expect(args).toBeUndefined();
                    done();
                });

                this.application.start();
            });
        });
    });

    describe('.stop()', function () {
        beforeEach(function () {
            this.application = new T.Application();
        });

        it('should call stop on the given modules', function () {
            var module = jasmine.createSpyObj('module', ['stop']);
            var modules = {1: module, 2: module};

            this.application.stop(modules);

            expect(module.stop.calls.count()).toEqual(2);
        });

        it('should emit lifecycle event t.stop', function (done) {
            var eventEmitter = new T.EventEmitter(this.application._sandbox);

            eventEmitter.on('t.stop', function (args) {
                expect(args).toBeUndefined();
                done();
            }.bind(this));

            this.application.stop();
        });
    });
});


