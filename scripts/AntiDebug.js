

function byPass(){
    /* Bypass Frida Detection Based On Port Number */
Interceptor.attach(Module.findExportByName("libc.so", "connect"), {
    onEnter: function(args) {
        var memory = Memory.readByteArray(args[1], 64);
        var b = new Uint8Array(memory);
        if (b[2] == 0x69 && b[3] == 0xa2 && b[4] == 0x7f && b[5] == 0x00 && b[6] == 0x00 && b[7] == 0x01) {
            this.frida_detection = true;
        }
    },
    onLeave: function(retval) {
        if (this.frida_detection) {
            console.log("Frida Bypassed");
            retval.replace(-1);
        }
    }
});
Interceptor.attach(Module.findExportByName(null, "connect"), {
    onEnter: function(args) {
        var family = Memory.readU16(args[1]);
        if (family !== 2) {
            return
        }
        
        var port = Memory.readU16(args[1].add(2).or(1));
        port = ((port & 0xff) << 8) | (port >> 8);
        if (port === 27042) {
            console.log("connect check");
            console.log('frida check');
            Memory.writeU16(args[1].add(2).or(1), 0x0101);
        }
    }
});
// /* Bypass TracerPid Detection Based On Pid Status */
// var fgetsPtr = Module.findExportByName("libc.so", "fgets");
// var fgets = new NativeFunction(fgetsPtr, 'pointer', ['pointer', 'int', 'pointer']);
// var childPid = 0
// Interceptor.replace(fgetsPtr, new NativeCallback(function(buffer, size, fp) {
//     // console.warn(buffer);
//     var retval = fgets(buffer, size, fp);
//     var bufstr = Memory.readUtf8String(buffer);
//     if (bufstr.indexOf("TracerPid:") > -1) {
//         Memory.writeUtf8String(buffer, `TracerPid:\t${childPid}`);
//         console.log("Bypassing TracerPID Check:", bufstr);
//     }
//     return retval;
// }, 'pointer', ['pointer', 'int', 'pointer']))
/* Bypass Ptrace Checks */
Interceptor.attach(Module.findExportByName(null, "ptrace"), {
    onEnter: function(args) {},
    onLeave: function(retval) {
        console.log("Ptrace Bypassed");
        retval.replace(0);
    }
})
/* Watch Child Process Forking */
var fork = Module.findExportByName(null, "fork")
Interceptor.attach(fork, {
    onEnter: function(args) {},
    onLeave: function(retval) {
        var pid = parseInt(retval.toString(16), 16)
        console.log("Child Process PID : ", pid)
        // childPid = pid
        // retval.replace(ptr(-1));
    }
})

Interceptor.attach(Module.getExportByName(null,"__android_log_print"), {
        onEnter: function (args) {
            console.warn(args[0],args[1].readCString(),args[2].readCString(),);
            }
        }
    );

/* Screenshot Detection Bypass  */
Java.perform(function() {
    try {
        var surface_view = Java.use('android.view.SurfaceView');
        var set_secure = surface_view.setSecure.overload('boolean');
        set_secure.implementation = function(flag) {
            set_secure.call(false);
        }
        var window = Java.use('android.view.Window');
        var SFlag = window.setFlags.overload('int', 'int');
        var window_manager = Java.use('android.view.WindowManager');
        var layout_params = Java.use('android.view.WindowManager$LayoutParams');
        SFlag.implementation = function(flags, mask) {
            flags = (flags.value & ~layout_params.FLAG_SECURE.value);
            SFlag.call(this, flags, mask);
        }
    } catch (err) {
        console.error(err);
    }
})
/* Xposed Detection Bypass */
Java.perform(function() {
    try {
        var cont = Java.use("java.lang.String");
        cont.contains.overload("java.lang.CharSequence").implementation = function(checks) {
            var check = checks.toString();
            if (check.indexOf("libdexposed") >= 0 || check.indexOf("libsubstrate.so") >= 0 || check.indexOf("libepic.so") >= 0 || check.indexOf("libxposed") >= 0) {
                var BypassCheck = "libpkmkb.so";
                return this.contains.call(this, BypassCheck);
            }
            return this.contains.call(this, checks);
        }
    } catch (erro) {
        console.error(erro);
    }
    try {
        var StacktraceEle = Java.use("java.lang.StackTraceElement");
        StacktraceEle.getClassName.overload().implementation = function() {
            var Flag = false;
            var ClazzName = this.getClassName();
            if (ClazzName.indexOf("com.saurik.substrate.MS$2") >= 0 || ClazzName.indexOf("de.robv.android.xposed.XposedBridge") >= 0) {
                console.log("STE Classes : ", this.getClassName())
                Flag = true;
                if (Flag) {
                    var StacktraceEle = Java.use("java.lang.StackTraceElement");
                    StacktraceEle.getClassName.overload().implementation = function() {
                        var gMN = this.getMethodName();
                        if (gMN.indexOf("handleHookedMethod") >= 0 || gMN.indexOf("handleHookedMethod") >= 0 || gMN.indexOf("invoked") >= 0) {
                            console.log("STE Methods : ", this.getMethodName());
                            return "ulala.ulala";
                        }
                        return this.getMethodName();
                    }
                }
                return "com.android.vending"
            }
            return this.getClassName();
        }
    } catch (errr) {
        console.error(errr);
    }
})
/* VPN Related Checks */
Java.perform(function() {
    var NInterface = Java.use("java.net.NetworkInterface");
    try {
        NInterface.isUp.overload().implementation = function() {
            //console.log("Network Down");      
            return false;
            // may cause connectivity lose in rare case so be careful
        }
    } catch (err) {
        console.error(err);
    }
    try {
        var NInterface = Java.use("java.net.NetworkInterface");
        NInterface.getName.overload().implementation = function() {
            var IName = this.getName();
            if (IName == "tun0" || IName == "ppp0" || IName == "p2p0" || IName == "ccmni0" || IName == "tun") {
                console.log("Detected Interface Name : ", JSON.stringify(this.getName()));
                return "FuckYou";
            }
            return this.getName();
        }
    } catch (err) {
        console.error(err);
    }
    try {
        var GetProperty = Java.use("java.lang.System");
        GetProperty.getProperty.overload("java.lang.String").implementation = function(getprop) {
            if (getprop.indexOf("http.proxyHost") >= 0 || getprop.indexOf("http.proxyPort") >= 0) {
                var newprop = "CKMKB"
                return this.getProperty.call(this, newprop);
            }
            return this.getProperty(getprop);
        }
    } catch (err) {
        console.error(err);
    }
    try {
        var NCap = Java.use("android.net.NetworkCapabilities");
        NCap.hasTransport.overload("int").implementation = function(values) {
            console.log("HasTransport Check Detected ", values);
            if (values == 4)
                return false;
            else
                return this.hasTransport(values);
        }
    } catch (e) {
        console.error(e);
    }
})
/* Developer Mod Check Bypass */
Java.perform(function() {
    var SSecure = Java.use("android.provider.Settings$Secure");
    SSecure.getStringForUser.overload('android.content.ContentResolver', 'java.lang.String', 'int').implementation = function(Content, Name, Flag) {
        if (Name.indexOf("development_settings_enabled") >= 0) {
            console.log(Name);
            var Fix = "fuckyou";
            return this.getStringForUser.call(this, Content, Fix, Flag);
        }
        return this.getStringForUser(Content, Name, Flag);
    }
})

}


function fakeMaps(fakePath) {
    const openPtr = Module.getExportByName('libc.so', 'open');
    const open = new NativeFunction(openPtr, 'int', ['pointer', 'int']);
    var readPtr = Module.findExportByName("libc.so", "read");
    var read = new NativeFunction(readPtr, 'int', ['int', 'pointer', "int"]);
    var file = new File(fakePath, "w");
    var buffer = Memory.alloc(512);
    Interceptor.replace(openPtr, new NativeCallback(function (pathnameptr, flag) {
        var pathname = Memory.readUtf8String(pathnameptr);
        var realFd = open(pathnameptr, flag);
        if (pathname.indexOf("maps") >= 0) {
            while (parseInt(read(realFd, buffer, 512)) !== 0) {
                var oneLine = Memory.readCString(buffer);
                if (oneLine.indexOf("tmp") === -1) {
                    file.write(oneLine);
                }
            }
            var filename = Memory.allocUtf8String(fakePath);
            return open(filename, flag);
        }
        var fd = open(pathnameptr, flag);
        return fd;
    }, 'int', ['pointer', 'int']));
}

// function hook_dlopen() {
//     Interceptor.attach(Module.findExportByName(null, "android_dlopen_ext"),
//         {
//             onEnter: function (args) {
//                 var pathptr = args[0];
//                 if (pathptr !== undefined && pathptr != null) {
//                     var path = ptr(pathptr).readCString();
                    
//                 }
//             }
//         }
//     );
// }
let _printed = false
function hook_dlopen(soName = '') {
    Interceptor.attach(Module.findExportByName(null, "android_dlopen_ext"),
        {
            onEnter: function (args) {
                var pathptr = args[0];
                if (pathptr !== undefined && pathptr != null) {
                    var path = ptr(pathptr).readCString();
                    this.name = path
                    console.log("android_dlopen_ext onEnter " + path);
                    
                    
                    if (path.indexOf(soName) >= 0) {
                        printStraceCommand()
                        // locate_init(soName)
                        // hook_so_init()
                    }
                }
            },
            onLeave: function(retval){
                console.log(`android_dlopen_ext onLeave name: ${this.name}`)
                // if (this.name != null && this.name.indexOf('libmsaoaidsec.so') >= 0) {
                //   let JNI_OnLoad = Module.getExportByName(this.name, 'JNI_OnLoad')
                //   Log.log(`dlopen onLeave JNI_OnLoad: ${JNI_OnLoad}`)
                // }
              }
        }
    );
}
 
function locate_init(soName) {
    
    let secmodule = null
    Interceptor.attach(Module.findExportByName(null, "__system_property_get"),
        {
            // _system_property_get("ro.build.version.sdk", v1);
            onEnter: function (args) {
                secmodule = Process.findModuleByName(soName)
                
                var name = args[0];
               
                if (name !== undefined && name != null) {
                    name = ptr(name).readCString();
                    console.log("__system_property_get onEnter:", name)
                    // ro.build.version.sdk
                    if (name.indexOf("ro.build.flavor") >= 0) {
                        // 这是.init_proc刚开始执行的地方，是一个比较早的时机点
                        // do something
                        hook_pthread_create(soName)
                        
                    }
                }
            }
        }
    );
}
function hook_pthread_create(soName) {
    console.log(soName," --- " + Process.findModuleByName(soName).base)
    Interceptor.attach(Module.findExportByName("libc.so", "pthread_create"), {
        onEnter(args) {
            let func_addr = args[2]
            console.log("The thread function address is " + func_addr)
        }
    })
}

function hook_so_init() {
   
    if (Process.pointerSize == 4) {
        var linker = Process.findModuleByName("linker");
    }else if (Process.pointerSize == 8) {
        var linker = Process.findModuleByName("linker64");
 
    }
 
    console.log("hook_constructor",Process.pointerSize, linker);
    var addr_call_array = null;
    if (linker) {
        var symbols = linker.enumerateSymbols();
        for (var i = 0; i < symbols.length; i++) {
            var name = symbols[i].name;
            // console.log("symbols:", name)
            if (name.indexOf("call_array") >= 0) {
                addr_call_array = symbols[i].address;
            }
        }
    }
    if (addr_call_array) {
        Interceptor.attach(addr_call_array, {
            onEnter: function (args) {
 
                this.type = ptr(args[0]).readCString();
                console.log(this.type,args[1],args[2],args[3])
                if (this.type == "DT_INIT_ARRAY") {
                    this.count = args[2];
                    //this.addrArray = new Array(this.count);
                    this.path = ptr(args[3]).readCString();
                    var strs = new Array(); //定义一数组
                    strs = this.path.split("/"); //字符分割
                    this.filename = strs.pop();
                    if(this.count > 0){
                        console.log("path : ", this.path);
                        console.log("filename : ", this.filename);
                    }
                    for (var i = 0; i < this.count; i++) {
                        console.log("offset : init_array["+i+"] = ", ptr(args[1]).add(Process.pointerSize*i).readPointer().sub(Module.findBaseAddress(this.filename)));
                        //插入hook init_array代码
                    }
                }
            },
            onLeave: function (retval) {
 
            }
        });
    }
}

function printStraceCommand(){
    var pid = Process.id;
        // Print the PID
    console.log('strace command :\n', `strace -e trace=process,memory -i -f -p ${pid}`);
    let sleep = new NativeFunction(Module.getExportByName('libc.so', 'sleep'), 'uint', ['uint'])
    sleep(7)
    
}
let targetModule = "l5ff4a854.so"
// Module.ensureInitialized(targetModule).then(() => {
//     // Enumerate exports of the target module
//     Module.enumerateExports(targetModule, {
//         onMatch: function (exportedSymbol) {
//             // Print the name and address of the exported symbol
//             console.log("[*] Found export:", exportedSymbol.name, "at:", exportedSymbol.address);

//             // Attach an interceptor to the exported symbol
//             Interceptor.attach(exportedSymbol.address, {
//                 onEnter: function (args) {
//                     // Log that the function is called
//                     console.log("[*] Function called:", exportedSymbol.name);
//                     // Optionally log registers, arguments, etc.
//                     // console.log("Registers:", this.context.x0, this.context.x1, ...);
//                 },
//                 onLeave: function (retval) {
//                     // Log when the function is about to return
//                     console.log("[*] Function", exportedSymbol.name, "returned:", retval);
//                 }
//             });
//         },
//         onComplete: function () {
//             console.log("[*] Hooking completed");
//         }
//     });
// }).catch(error => {
//     console.error("[!] Error initializing module:", error);
// });






function hookDlopen(target = "") {
    let linker64_base_addr = Module.getBaseAddress('linker64')
    let offset = 0x3ba00 // __dl__Z9do_dlopenPKciPK17android_dlextinfoPKv
    let android_dlopen_ext = linker64_base_addr.add(offset)
    if (android_dlopen_ext != null) {
      Interceptor.attach(android_dlopen_ext, {
        onEnter: function(args){
          this.name = args[0].readCString()
          Log.log(`dlopen onEnter name: ${this.name}`)
          if (target!= "" && this.name != null && this.name.indexOf(target) >= 0) {
            // hook_linker_call_constructors()
          }
        }, onLeave: function(retval){
          Log.log(`dlopen onLeave name: ${this.name}`)
          if (this.name != null && this.name.indexOf('libmsaoaidsec.so') >= 0) {
            let JNI_OnLoad = Module.getExportByName(this.name, 'JNI_OnLoad')
            Log.log(`dlopen onLeave JNI_OnLoad: ${JNI_OnLoad}`)
          }
        }
      })
    }
  }
   
  function hook_linker_call_constructors() {
    let linker64_base_addr = Module.getBaseAddress('linker64')
    let offset = 0x521f0 // __dl__ZN6soinfo17call_constructorsEv
    let call_constructors = linker64_base_addr.add(offset)
    let listener = Interceptor.attach(call_constructors, {
      onEnter: function (args) {
        Log.log('hook_linker_call_constructors onEnter')
        let secmodule = Process.findModuleByName("libmsaoaidsec.so")
        if (secmodule != null) {
          hook_sub_1b924(secmodule)
          listener.detach()
        }
      }
    })
  }
   
  function hook_sub_1b924(secmodule) {
    Interceptor.replace(secmodule.base.add(0x1b924), new NativeCallback(function () {
      Log.log(`hook_sub_1b924 >>>>>>>>>>>>>>>>> replace`)
    }, 'void', []));
  }

  function hook_mmap() {
    const mmap = Module.getExportByName("libc.so", "mmap");
    Interceptor.attach(mmap, {
      onEnter: function (args) {
        let length = args[1].toString(16)
        if (parseInt(length, 16) == 28) {
            console.log('backtrace:\n' + Thread.backtrace(this.context, Backtracer.ACCURATE)
                                                    .map(DebugSymbol.fromAddress).join('\n') + '\n');
        }
      }
    })
  }


  
  function hookAAssetManager_open(){
    // var pth = Module.findExportByName(null,"AAssetManager_open");
    var libandroid = Module.findBaseAddress('libandroid.so');
    var pth = Module.findExportByName('libandroid.so', 'AAssetManager_open');
    if (pth == null){
        console.log("AAssetManager_open failed::")
        return
    }
    Interceptor.attach(ptr(pth),{
        onEnter:function(args){
            this.filename = args[1];
            
            if (this.filename.readCString().indexOf("main.ihi") != -1){
                this.matchFile = true;
                console.log("AAssetManager_open onEnter",this.filename.readUtf8String())
                
                console.log('backtrace fopen .ihi:\n' + Thread.backtrace(this.context, Backtracer.FUZZY)
                .map(DebugSymbol.fromAddress).join('\n') + '\n');
                // let sleep = new NativeFunction(Module.getExportByName('libc.so', 'sleep'), 'uint', ['uint'])
                // sleep(100)
            }

        },onLeave:function(retval){
            if(this.matchFile)
                console.log("AAssetManager_open onLeave",this.filename.readCString(), retval)
            return retval;
        }
 })
}
function hookOpenIhi(){
    var pth = Module.findExportByName(null,"fopen");
    Interceptor.attach(ptr(pth),{
        onEnter:function(args){
            this.filename = args[0];
            
            if (this.filename.readCString().indexOf("main.ihi") != -1){
                this.matchFile = true;
                console.log("fopen onEnter",this.filename.readCString())
                console.log('backtrace fopen .ihi:\n' + Thread.backtrace(this.context, Backtracer.ACCURATE)
                .map(DebugSymbol.fromAddress).join('\n') + '\n');
                // let sleep = new NativeFunction(Module.getExportByName('libc.so', 'sleep'), 'uint', ['uint'])
                // sleep(100)
            }

        },onLeave:function(retval){
            if(this.matchFile)
                console.log("fopen onLeave",this.filename.readCString(), retval)
            return retval;
        }
 })
}


function hookLog(){

Interceptor.attach(Module.getExportByName(null,"__android_log_print"), {
    onEnter: function (args) {
        console.warn(args[0],args[1].readCString(),args[2].readCString(),);
        }
    }
);
}


function main(){
    
    // byPass()
    
    // targetModule = "libmsaoaidsec.so"
    // setImmediate(hook_dlopen, targetModule)
    // hook_mmap()
    hookOpenIhi()
    hookAAssetManager_open()
    hookLog()
    // printStraceCommand()
    
    // setImmediate(() => {fakeMaps("/data/data/com.ihuman.imath/files/maps")})
    // setTimeout(byPass, 10000)
    // setImmediate(hookDlopen)
  }

  main()

  