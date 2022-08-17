
console.log("ServiceManagement")

var fn = Module.getExportByName(null, "SMLoginItemSetEnabled")
console.log("fn::", fn)
Interceptor.attach(fn, {
    onEnter(args) {
        // const path = args[0].readUtf8String();
        console.log(this.context)
        let bk = Thread.backtrace(this.context, Backtracer.ACCURATE)
        let mp = bk.map(DebugSymbol.fromAddress)
        console.log("mp:",mp)
        let aa = mp.join('\n') + '\n'
        console.log("back:", aa)
    }
});