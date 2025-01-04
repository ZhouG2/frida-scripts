
function log(){

    var date = new Date();
    const pad = (number) => (number < 10 ? `0${number}` : number);

    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    const milliseconds = pad(date.getMilliseconds());
  
    
    var args = Array.prototype.slice.call(arguments);
    args.unshift(`${hours}:${minutes}:${seconds}.${milliseconds}:` );
    console.log.apply(console, args); 
}
function callstackNative() {
    log("callstackNative::")
    log(Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n") + "\n");
}

function callstack() {
    callstackNative()
    callStackJava()
}
function callStackJava(){
    log("callStackJava::")
    log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()))
}
function dumpInstance(instance) {
    try {
        var className = "com.tencent.mm.plugin.appbrand.jsapi.auth.JsApiLogin$LoginTask";
        log("Class: " , instance.$className);
        log("instance stringify: " + JSON.stringify(instance));
        
        // 打印属性
        log("[*] Dumping properties:");
        var fields = instance.class.getDeclaredFields();
        for (var i = 0; i < fields.length; i++) {
            fields[i].setAccessible(true);
            var fieldName = fields[i].getName();
            var fieldType = fields[i].getType().toString();
            var fieldValue = "";

            try {
                // 使用 Java.cast 尝试将属性强制转换为预期的类型
                var fieldObj = fields[i].get(instance);
                log("fieldObj:", fieldObj)
                fieldValue = JSON.stringify(fieldObj);
            } catch (e) {
                console.error("Error dumping instance:", fieldName, e);
            }
             
            log("fieldName:",fieldName + " (" + fieldType + "): " + fieldValue);
        }

        // 打印方法
        log("\n[*] Dumping methods:");
        var methods = instance.class.getDeclaredMethods();
        for (var j = 0; j < methods.length; j++) {
            var methodName = methods[j].getName();
            log(methodName);
        }
    } catch (e) {
        console.error("Error dumping instance:", e);
    }
}

function dumpObject(obj) {
    try {
        // var classname = obj.getClass().getName()
        // var classHandle = Java.use(classname);

        // 打印属性
        log('[*] Dumping properties:', obj);
        var fields = obj.class.getDeclaredFields();
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            field.setAccessible(true);

            var fieldName = field.getName();
            var fieldType = field.getType().toString();
            var fieldValue = field.get(obj);

            log('[+] ' + fieldName + ' (' + fieldType + '): ' + fieldValue);
        }

        // 打印方法
        log('\n[*] Dumping methods:');
        var methods = obj.class.getDeclaredMethods();
        for (var j = 0; j < methods.length; j++) {
            var method = methods[j];
            method.setAccessible(true);

            var methodName = method.getName();
            log('[+] ' + methodName);
        }
    } catch (e) {
        console.error('Error dumping object:', e);
    }
}

function hook(cls, method, iml){
    // const c = Java.use(cls)

    var targetClass = cls;
    var methodName = method; // 替换为你要查看的方法名称
    var c = Java.use(targetClass);

    
    

    if(c && c[method] && c[methodName].overloads){
        // 获取方法的所有重载
        var overloads = c[methodName].overloads;
        
        // 遍历每个重载
        overloads.forEach(function (overload) {
            log(targetClass + '.' + methodName + ' parameters: ' + overload.argumentTypes);
            // 在 hook 时打印参数类型
            overload.implementation = function () {
                log("################")
                log(targetClass + '.' + methodName + ' parameters: ' + overload.argumentTypes);
                
                for (let i = 0; i < arguments.length; i++) {
                    log('[*] Argument ' + i + ' type: ' , typeof arguments[i] , ' value: ' , arguments[i]);
                    // log('[*] Argument ' + i + ' value: ' + arguments[i]);
                }
                // 调用原始方法
                var result = overload.apply(this, arguments);
                
                // 如果有返回值，也可以打印返回值
                callStackJava()
                log(targetClass + '.' + methodName + ' result: ' + result);
                log("####end ", targetClass + '.' + methodName + ' parameters: ' + overload.argumentTypes ,"\n")
                if(typeof iml === 'function' )
                    iml(this, result)
                return result;
            };
        });
    }
    else{
        log("hook failed", c, method )  
    }
}

Java.perform(() => {

    try{
        hook('com.tencent.mm.plugin.webview.ui.tools.jsapi.k1', 'a')
        hook('com.tencent.mm.plugin.webview.ui.tools.jsapi.k1', '$init')
        hook('com.tencent.mm.plugin.webview.ui.tools.jsapi.h1', 'a')
        hook('com.tencent.mm.plugin.webview.ui.tools.jsapi.h1', '$init')
        // hook('xu.k', 'm')
        // hook('xu.k', 'm')
    
        // hook('com.tencent.mm.plugin.appbrand.jsapi.auth.JsApiLogin$LoginTask', 'j')
        hook('com.tencent.mm.plugin.appbrand.jsapi.auth.JsApiLogin$LoginTask', '$init', function(rlt){
            dumpInstance(rlt)
        })
        hook('com.tencent.mm.plugin.appbrand.jsapi.auth.JsApiLogin$LoginTask', 'writeToParcel', function(rlt){
            dumpInstance(rlt)
        })
        hook('com.tencent.mm.appbrand.commonjni.AppBrandCommonBindingJni', 'nativeInvokeHandler')
    }
    catch(e){
        log("hook error!!!", e)   
    }
    

    log("hook end!!!")  

    
    // android hooking watch class_method  com.tencent.mm.plugin.appbrand.jsapi.auth.JsApiLogin$LoginTask.j --dump-args --dump-return --dump-backtrace
    // android hooking watch class  com.tencent.mm.plugin.appbrand.jsapi.auth.JsApiLogin$LoginTask --dump-args --dump-return --dump-backtrace
    // 
    // Activity.onResume.implementation = function () {
    //   send('onResume() got called! Let\'s call the original implementation');
    //   this.onResume();
    // };

});