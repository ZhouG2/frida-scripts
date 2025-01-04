// script.js
Java.perform(function () {
    var System = Java.use('java.lang.System');
    var Runtime = Java.use('java.lang.Runtime');
    var Thread = Java.use('java.lang.Thread');
    var UncaughtExceptionHandler = Java.use('java.lang.Thread$UncaughtExceptionHandler');

    // Hook System.exit(int)
    System.exit.overload('int').implementation = function (code) {
        console.log('System.exit called with code: ' + code);
        printJavaStackTraces();
        this.exit(code);
    };

    // Hook Runtime.exit(int)
    Runtime.exit.overload('int').implementation = function (code) {
        console.log('Runtime.exit called with code: ' + code);
        printJavaStackTraces();
        this.exit(code);
    };

    // Hook Thread.UncaughtExceptionHandler.uncaughtException(Thread thread, Throwable throwable)
    var originalUncaughtException = UncaughtExceptionHandler.uncaughtException;
    UncaughtExceptionHandler.uncaughtException.implementation = function (thread, throwable) {
        console.log('Uncaught exception: ' + throwable);
        printJavaStackTrace(throwable);
        originalUncaughtException.call(this, thread, throwable);
    };

    // Function to print Java call stack traces
    function printJavaStackTraces() {
        console.log('Java call stack:');
        console.log(Java.use('android.util.Log')
            .getStackTraceString(Java.use('java.lang.Exception').$new())
            .toString());
    }

    // Function to print Java stack trace of throwable
    function printJavaStackTrace(throwable) {
        console.log('Java exception stack trace:');
        console.log(Java.use('android.util.Log')
            .getStackTraceString(throwable)
            .toString());
    }
});

// Hook native exit and abort functions
Interceptor.attach(Module.getExportByName(null, 'exit'), {
    onEnter: function (args) {
        console.log('Native exit called');
        printNativeStack(this.context);
    }
});

Interceptor.attach(Module.getExportByName(null, 'abort'), {
    onEnter: function (args) {
        console.log('Native abort called');
        printNativeStack(this.context);
    }
});

// Function to print native call stack
function printNativeStack(context) {
    console.log('Native call stack:');
    console.log(Thread.backtrace(context, Backtracer.ACCURATE)
        .map(DebugSymbol.fromAddress).join('\n'));
}
