let logFilters = [
    "ant"]

function hookLog(tag, msg, e) {
    console.log(tag, msg, e ? e.toString() : "");
    let bfind = logFilters.some(v=>{
        return tag.indexof(v) >=0 || msg.indexof(v)>=0
    })
    if(bfind||e){
        console.warn(tag,msg,e)
    }
}

Java.performNow(function() {
    let Log = Java.use("android.util.Log");
    Log.d.overload("java.lang.String", "java.lang.String").implementation = function(a, b) {
        hookLog(a.toString(), b.toString());
        return this.d(a, b);
    };
    Log.d.overload("java.lang.String", "java.lang.String", "java.lang.Throwable").implementation = function(a, b, c) {
        hookLog(a.toString(), b.toString());
        return this.d(a, b, c);
    };
    Log.v.overload("java.lang.String", "java.lang.String").implementation = function(a, b) {
        hookLog(a.toString(), b.toString());
        return this.v(a, b);
    };
    Log.v.overload("java.lang.String", "java.lang.String", "java.lang.Throwable").implementation = function(a, b, c) {
        hookLog(a.toString(), b.toString());
        return this.v(a, b, c);
    };
    Log.i.overload("java.lang.String", "java.lang.String").implementation = function(a, b) {
        hookLog(a.toString(), b.toString());
        return this.i(a, b);
    };
    Log.i.overload("java.lang.String", "java.lang.String", "java.lang.Throwable").implementation = function(a, b, c) {
        hookLog(a.toString(), b.toString(), c);
        return this.i(a, b, c);
    };
    Log.e.overload("java.lang.String", "java.lang.String").implementation = function(a, b) {
        hookLog(a.toString(), b.toString());
        return this.e(a, b);
    };
    Log.e.overload("java.lang.String", "java.lang.String", "java.lang.Throwable").implementation = function(a, b, c) {
        hookLog(a.toString(), b.toString(), c);
        return this.e(a, b, c);
    };
    Log.w.overload("java.lang.String", "java.lang.String").implementation = function(a, b) {
        hookLog(a.toString(), b.toString());
        return this.w(a, b);
    };
    Log.w.overload("java.lang.String", "java.lang.Throwable").implementation = function(a, b) {
        hookLog(a.toString(), b.toString());
        return this.w(a, b);
    };
    Log.w.overload("java.lang.String", "java.lang.String", "java.lang.Throwable").implementation = function(a, b, c) {
        hookLog(a.toString(), b.toString(), c.toString());
        return this.w(a, b, c);
    };
    Log.wtf.overload("java.lang.String", "java.lang.String").implementation = function(a, b) {
        hookLog(a.toString(), b.toString());
        return this.wtf.overload("java.lang.String", "java.lang.String").call(this, a, b);
    };
    Log.println.overload("int", "java.lang.String", "java.lang.String").implementation = function(a, b, c) {
        hookLog(a.toString(), b.toString(), c.toString());
        return this.println(a, b, c);
    };
});
let LogPrint = Module.findExportByName("liblog.so", "__android_log_print");
let LogWrite = Module.findExportByName("liblog.so", "__android_log_write");
let LogVPrint = Module.findExportByName("liblog.so", "__android_log_vprint");
let LogAssert = Module.findExportByName("liblog.so", "__android_log_assert");
Interceptor.attach(LogPrint, function(args) {
    hookLog("Print : ", args[1].readCString(), args[2].readCString());
})
Interceptor.attach(LogWrite, function(args) {
    hookLog("Write : ", args[1].readCString(), args[2].readCString());
})
Interceptor.attach(LogVPrint, function(args) {
    hookLog("VPrint : ", args[1].readCString(), args[2].readCString());
})
Interceptor.attach(LogAssert, function(args) {
    hookLog("Assert : ", args[0].readCString(), args[1].readCString());
})


// Function to print native call stack
function printNativeStack(context) {
    console.log('Native call stack:');
    console.log(Thread.backtrace(context, Backtracer.ACCURATE)
        .map(DebugSymbol.fromAddress).join('\n'));
}

function printJavaStackTrace(){
    console.log('Java call stack:');
    console.log(Java.use('android.util.Log')
    .getStackTraceString(Java.use('java.lang.Exception').$new())
    .toString());
}
