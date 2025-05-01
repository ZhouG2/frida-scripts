let hookonce = false;
function hkassets(partern){
    let mod =  Module.findExportByName('libandroid.so', "AAssetManager_open")
    // Module.findExportByName('libandroid.so', 'AAssetManager_open')
    console.log("mod: " + mod);
    if(!mod){
        console.log("mod is null");
        return;
    }
    Interceptor.attach(mod, {
    
        onEnter: function(args) {

            // debug only the intended calls
            this.flag = false;
            this.filename = args[1].readCString();
            // if (filename.indexOf("XYZ") === -1 && filename.indexOf("ZYX") === -1) // exclusion list
            // console.log("filename: " + filename);
            if ( this.filename &&  partern && partern.test(this.filename) ) // inclusion list
                this.flag = true;

            if (this.flag) {
                

                // print backtrace
                // printJavaStackTrace()
                
            }
        },

        onLeave: function(retval) {

            if (this.flag && retval != null) {
                // print retval
                console.log("\nretval: " + retval);
                console.warn("\n*** exiting AAssetManager_open:" + this.filename);
                printNativeStack(this.context);
            }
        }

    });

    // Java.perform(function () { 
    //     var AssetManager = Java.use("android.content.res.AssetManager");
    //     AssetManager.open.overload("java.lang.String").implementation = function(str) {
    //         console.log("open.overload: " + str);
    //         printJavaStackTrace()
    //         return this.open(str)
    //     }
    //     // var FileInputStream = Java.use("java.io.FileInputStream");
    //     // AssetManager.open.overload("java.lang.String").implementation = function(str) {
    //     //     console.log("open.overload: " + str);
    //     //     return this.open(str)
    //     // }
    // });
}

function hkstrcmp(partern){
    Interceptor.attach(Module.findExportByName(null, "strcmp"), {
    
        onEnter: function(args) {

            // debug only the intended calls
            this.flag = false;
            var str1 = args[0].readCString();
            var str2 = args[1].readCString();
            
            if(str1.toString().indexOf(partern) !== -1 && str2.toString().indexOf(partern) !== -1){
                console.log("strcmp onEnter:", str1, str2);
                this.flag = true;
            }
            
        },

        onLeave: function(retval) {

            if (this.flag) {
                // print retval
                // console.log("\nretval: " + retval);
                // console.warn("\n*** exiting open");
            }
        }

    }); 
}

function hkopf(partern){
    Interceptor.attach(Module.findExportByName(null, "fopen"), {
    
        onEnter: function(args) {

            // debug only the intended calls
            this.flag = false;
            var filename = Memory.readCString(ptr(args[0]));
            // if (filename.indexOf("XYZ") === -1 && filename.indexOf("ZYX") === -1) // exclusion list
            // console.log("filename: " + filename);
            if (filename &&filename.toString().indexOf(partern) !== -1) // inclusion list{}
                this.flag = true;

            if (this.flag) {
                console.warn("\n*** entered open");

                console.log("\nfile name: " + filename);

                // print backtrace
                console.log("\nBacktrace:\n" + Thread.backtrace(this.context, Backtracer.ACCURATE)
                        .map(DebugSymbol.fromAddress).join("\n"));
            }
        },

        onLeave: function(retval) {

            if (this.flag) {
                // print retval
                console.log("\nretval: " + retval);
                console.warn("\n*** exiting open");
            }
        }

    }); 
}

function hna(addr){
    if(addr == null){
        console.log("addr is null");
        return;
    }
    console.log("hna:",DebugSymbol.fromAddress(addr));
    Interceptor.attach(addr, {
        onEnter: function(args) {
            Stalker.follow({
                events: {
                    call: true,
                    ret: false,
                    exec: false,
                    block: false,
                    compile: false
                },
                onReceive: function(events) {
                    var calls = Stalker.parse(events, {
                        annotate: true, 
                    });                          
                    for (var i = 0; i < calls.length; i++) {
                        var call = calls[i];
                        if (call[0] !== 'call') break;
                            if (getModuleInfoByName(call[2]) == Location) {
                                Check = call[2].sub(LibBase);
                            }
                            try {
                            console.log((' '.repeat(call[3] * 2)) + '↳ calling ' + getModuleInfoByName(call[2]), call[2]);
                            }catch(e){ console.error(e)}
                    }
                },
            })
        },
        onLeave: function(ret_val) {
            Stalker.unfollow();
        }
    }); 
}

function hnlf(libname, fn){
    var LibBase = Module.findBaseAddress(libname);
    var JNIAddr = Module.findExportByName(libname, fn);
    hna(JNIAddr);
}

function ns(global_symbol){
    DebugSymbol.findFunctionsMatching(global_symbol).forEach(function(v){
        console.log(DebugSymbol.fromAddress(v))
    })
}

// hook native symbol
function hns(global_symbol){
    DebugSymbol.findFunctionsMatching(global_symbol).forEach(function(v){
        hna(v);
    })
}


function _welcome() {
    console.log("Welcome to the tools3");
}


function printJavaStackTraces() {
    console.log('Java call stack:');
    console.log(Java.use('android.util.Log')
        .getStackTraceString(Java.use('java.lang.Exception').$new())
        .toString());
}

function printNativeStack(context) {
    console.log('Native call stack:');
    console.log(Thread.backtrace(context, Backtracer.ACCURATE)
        .map(DebugSymbol.fromAddress).join('\n'));
}
    // 工具函数：字节数组转十六进制字符串
function bytesToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(' ');
}

function hkxxtea(){
    var addr = Module.findExportByName("libcocos2dlua.so", "_ZN7cocos2d8LuaStack14setHongenKAndSEPKciS2_i")
    console.log("xxtea: " + addr);
    // xxtea_decrypt(uchar *,uint,uchar *,uint,uint *)
    if(addr){
        Interceptor.attach(addr, {
            onEnter: function(args) {
                console.log("xxtea onEnter");
                console.log("args: " + args);
                console.log("args[0]: " + args[0].readCString());
                console.log("args[1]: " + args[1]);
                console.log("args[2]: " + args[2].readCString());
                console.log("args[3]: " + args[3]);

            },
            onLeave: function(retval) {
                console.log("xxtea onLeave");   
            }
        });
    }
}
 
// "cocos2d::HelperFunc::getFileData(char const*, char const*, unsigned long*)"
// _ZN7cocos2d10HelperFunc11getFileDataEPKcS2_Pm
function hkbys(targetSymbol){
    // 目标函数符号（以 FileUtils::getFileData 为例）


    // 获取函数地址
    // const funcPtr = DebugSymbol.getFunctionByName(targetSymbol);
    const funcPtr = Module.findExportByName("libcocos2dlua.so","_ZN7cocos2d10HelperFunc11getFileDataEPKcS2_Pm")
    console.log("funcPtr: " + funcPtr);
    if (funcPtr) {
        // 动态挂钩
        hookonce = true;
        Interceptor.attach(funcPtr, {
            onEnter: function(args) {
                // 参数分析（根据C++ ABI规则，成员函数的第一个参数是this指针）
                this.argThis = args[0];       // this指针（FileUtils对象）
                // this.argPath = args[1];       // std::string& 文件路径
                this.argPath = args[1];       // const char*
                this.argMode = args[2];       // const char* 模式（如"rb"）
                this.argSizePtr = args[3];    // long* 数据长度输出参数

                // // 解析 std::string 路径内容
                // const pathPtr = this.argPath.readPointer(); // std::string内部指针
                // const pathLen = this.argPath.add(0x8).readU32(); // 字符串长度（std::string结构体布局可能因编译器不同而异）
                // this.filePath = pathPtr.readUtf8String(pathLen);

                this.filePath = this.argPath.readUtf8String();

                // 记录模式字符串
                this.mode = this.argMode.readUtf8String();
                
                console.log(`[+] 调用 FileUtils::getFileData:`);
                console.log(`    Path: ${this.filePath}`);
                console.log(`    Mode: ${this.mode}`);
            },
            onLeave: function(retval) {
                // 获取数据长度（通过输出参数）
                const dataSize = this.argSizePtr.readPointer().toInt32();
                
                // 读取返回的二进制数据（假设返回 unsigned char*）
                const dataBuffer = retval.readByteArray(dataSize);
                
                console.log(`[-] 返回数据指针: ${retval}`);
                console.log(`    数据长度: ${dataSize}`);
                
                // 打印前16字节（示例）
                if (dataBuffer) {
                    console.log('    头部数据:', bytesToHex(dataBuffer.slice(0, 16)));
                } else {
                    console.log('    数据为空!');
                }
            }
        });
    } else {
        console.error('未找到目标函数:', targetSymbol);
    }


}

// Process.attachModuleObserver({
//     onAdded: function(module){
//         console.log("module attached:",module.name);
//     },
//     onRemoved: function(module){
//         console.log("module detached:",module.name);
//     }
// })

// https://demangler.com/


// setTimeout(function(){
//     setImmediate(hkbys,"_ZN7cocos2d10HelperFunc11getFileDataEPKcS2_Pm");
// },500)
// // 
// setImmediate(hkassets,"main.ihi");
// hkopf("main.ihi");
// Java.perform(function () { 
//     var AssetManager = Java.use("android.content.res.AssetManager");
//     var FileInputStream = Java.use("java.io.FileInputStream")
//     AssetManager.open.overload("java.lang.String").implementation = function(str) {
//         console.log("open.overload: " + str);
//         // printJavaStackTrace()
//         // return FileInputStream.$new(str)
//         return this.open(str)

//     }
//     // var FileInputStream = Java.use("java.io.FileInputStream");
//     // AssetManager.open.overload("java.lang.String").implementation = function(str) {
//     //     console.log("open.overload: " + str);
//     //     return this.open(str)
//     // }
// });

function hkaddr(addr){
    
    Interceptor.attach(new NativePointer(addr), {
        onEnter: function(args) {
            console.log("onEnter", addr, args);
        }
    })
}

function main(){
    // hkstrcmp("d59310f3");
    hkassets(/main.ihi/i);
    // hkaddr("0x14af324");
    // hkassets_read("main.ihi");
    // hook_init_array()
}

function hook_init_array() {
    if (Process.pointerSize == 4) {
        var linker = Process.findModuleByName("linker");
    }else if (Process.pointerSize == 8) {
        var linker = Process.findModuleByName("linker64");
    }
    
    if (!linker) {
        console.log("linker not found");
        return;
    }
    
    console.log("linker found:", linker.name, linker.base);
    
    // 尝试不同的符号名称
    var possible_names = [
        "call_array",
        "__dl__ZN6soinfo11call_arrayEPKcPPFvvEjb",
        "__dl__ZN6soinfo11call_arrayEPKcPPFvvEji",
        "__dl__ZN6soinfo11call_arrayEPKcPPFvvEjj"
    ];
    
    var addr_call_array = null;
    for (var i = 0; i < possible_names.length; i++) {
        var name = possible_names[i];
        var symbol = linker.findExportByName(name);
        if (symbol) {
            addr_call_array = symbol;
            console.log("Found call_array at:", name, addr_call_array);
            break;
        }
    }
    
    if (!addr_call_array) {
        // 如果通过符号名找不到，尝试枚举所有符号
        console.log("Trying to enumerate all symbols...");
        var symbols = linker.enumerateSymbols();
        for (var i = 0; i < symbols.length; i++) {
            var name = symbols[i].name;
            if (name.indexOf("call_array") >= 0 || name.indexOf("call_constructors") >= 0) {
                console.log("Found potential symbol:", name, symbols[i].address);
                addr_call_array = symbols[i].address;
                break;
            }
        }
    }
    
    if (addr_call_array) {
        console.log("Attaching to call_array at:", addr_call_array);
        Interceptor.attach(addr_call_array, {
            onEnter: function (args) {
                // 打印所有参数的值
                console.log("args[0]:", args[0]);
                console.log("args[1]:", args[1]);
                console.log("args[2]:", args[2]);
                console.log("args[3]:", args[3]);
                
                // 尝试读取路径
                try {
                    var path_ptr = args[3];
                    if (path_ptr) {
                        var path = path_ptr.readCString();
                        console.log("Module path:", path);
                        
                        if (path && path.indexOf("libcocos2dlua.so") !== -1) {
                            console.log("Found libcocos2dlua.so");
                            var count = args[2].toInt32();
                            var init_array = args[1];
                            
                            console.log("Init array count:", count);
                            
                            for (var i = 0; i < count; i++) {
                                var init_func = init_array.add(Process.pointerSize * i).readPointer();
                                console.log("init_array["+i+"] =", init_func);
                                
                                Interceptor.attach(init_func, {
                                    onEnter: function(args) {
                                        console.log("Entering init function at:", this.returnAddress);
                                    },
                                    onLeave: function(retval) {
                                        console.log("Leaving init function");
                                    }
                                });
                            }
                        }
                    }
                } catch(e) {
                    console.log("Error reading path:", e);
                }
            },
            onLeave: function (retval) {
            }
        });
    } else {
        console.log("Failed to find call_array symbol");
    }
}

function hook_linker_call_constructors() {
    let linker64_base_addr = Module.getBaseAddress('linker64')
    let offset = 0x521f0 // __dl__ZN6soinfo17call_constructorsEv
    let call_constructors = linker64_base_addr.add(offset)
    let listener = Interceptor.attach(call_constructors, {
      onEnter: function (args) {
        
        let secmodule = Process.findModuleByName("libcocos2dlua.so")
        if (secmodule != null) {
          console.log('hook_linker_call_constructors  find module')
           this.flag = true;
           
           
        }
      },
      onLeave: function(retval) {
       
        if(this.flag){
            hkxxtea();
            listener.detach();
            
        }
      }
    })
  }

setImmediate(main);