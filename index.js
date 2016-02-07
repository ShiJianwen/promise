var Promise = function(task) {
    var value = null,
        queue = [],
        state = 'pending';

    var resolve = function(newvalue) {
        if (newvalue && (typeof newvalue === 'object') || (typeof newvalue === 'function')) {
            var then = newvalue.then;
            if (typeof then === 'function') {
                then.call(newvalue, resolve);
                return;
            }
        }
        value = newvalue;
        state = 'fulfilled';
        setTimeout(function() {
            queue.forEach(function(item) {
                handle(item);
            });
        }, 0);
    };

    var reject = function(error) {
        state = 'reject';
        value = error;
        setTimeout(function() {
            queue.forEach(function(item) {
                handle(item);
            });
        }, 0);
    };

    this.then = function(onFulfilled, onRejected) {
        return new Promise(function(resolve, reject) {
            handle({
                onFulfilled: onFulfilled || null,
                onRejected: onRejected || null,
                resolve: resolve,
                reject: reject
            });
        });
    };

    var handle = function(deferred) {
        if (state === 'pending') {
            queue.push(deferred);
            return;
        }
        var cb = state === 'fulfilled' ? deferred.onFulfilled : deferred.onRejected;
        if(cb === null) {
        	cb = state === 'fulfilled' ? deferred.resolve : deferred.reject;
        	cb(value);
        	return;
        }
        var ret = cb(value);
        return deferred.resolve(ret);
    };

    task(resolve, reject);
};