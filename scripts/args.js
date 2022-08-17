
var pargc = new NativeFunction( Module.findExportByName(null,"_NSGetArgc"),"pointer",[])()
var pargv = new NativeFunction( Module.findExportByName(null,"_NSGetArgv"),"pointer",[])()
var environ = Module.findExportByName(null,"environ")


console.log("Process.pointerSize:", Process.pointerSize)
var argc = pargc.readInt()
console.log("argc:", argc)
// console.log(pargv.readPointer().readCString())
pargv = pargv.readPointer()
for(let i =0;i<argc;i++){
    console.log("pargv:",pargv)
    console.log(`arg ${i}:`, pargv.readPointer().readCString())
    pargv =  pargv.add(Process.pointerSize)
}

