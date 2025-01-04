var openPtr = Module.getExportByName(null, 'exit');
var open = new NativeFunction(openPtr, 'void', ['int']);
Interceptor.replace(openPtr, new NativeCallback(function (flags) {
console.log('disable exit!');
}, 'void', ['int']));


