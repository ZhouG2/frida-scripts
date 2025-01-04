
console.log("ServiceManagement")

function hkfn(name){
    var fn = Module.getExportByName(null, name)
    console.log("fn::",name, fn)
    Interceptor.attach(fn, {
        onEnter(args) {
            // const path = args[0].readUtf8String();
            console.log(this.context)
            let bk = Thread.backtrace(this.context, Backtracer.ACCURATE)
            let mp = bk.map(DebugSymbol.fromAddress)
            // console.log("mp:",mp)
            let aa = mp.join('\n') + '\n'
            console.log("back:\n", aa)
        }
    });
}
let fns = [

]
for (let fn of  fns ){
    hkfn(fn)
}
