var libBase = 0x6e87cfc000
var moduleName = "libcocos2dlua.so";


function backtraceForBase(baseAddr){
    console.log('backtrace for libBase: \n' + Thread.backtrace(this.context, Backtracer.ACCURATE)
    .map(function(v){
        return `0x${(v - baseAddr  + libBase).toString(16)} ${DebugSymbol.fromAddress(v)}`
    }).join('\n') + '\n');
}
function hookFunc( addr){

    var baseAddr = Module.findBaseAddress(moduleName);
    let offset = addr - libBase 
    console.log("模块基址:", baseAddr, offset);

    if (baseAddr) {
        var functionAddr = baseAddr.add(offset);
        let address = addr.toString(16)
        console.log("函数地址:", functionAddr, address);

    
        Interceptor.attach(functionAddr, {
            onEnter: function(args) {
                console.log("进入函数:", address, DebugSymbol.fromAddress(functionAddr));
                // console.log("context:", JSON.stringify(this.context))
                var arg1 = this.context.x0;
                var arg2 = this.context.x1;
                var arg3 = this.context.x2;
                // var arg4 = this.context.x3;

                console.log("Argument 1:", arg1);
                console.log("Argument 2:", arg2);
                console.log("Argument 3:", arg3);
                // console.log("Argument 4:", arg4);
                // console.log("args:", JSON.stringify(args))
                // console.log("args x2:", Memory.readCString(this.context.x2));
                // backtraceForBase(baseAddr)

                this._followTID = Process.getCurrentThreadId()
                Stalker.follow(this._followTID,{
                    events:{
                        call: true, // CALL instructions: yes please
                    
                        // Other events:
                        ret: true, // RET instructions
                        exec: false, // all instructions: not recommended as it's
                                     //                   a lot of data
                        block: false, // block executed: coarse execution trace
                        compile: false // block compiled: useful for coverage
                      }
                    ,
                    // transform: function (iterator) {
                    //     var event;
                    //     console.log("transform:::")
                    //     while ((event = iterator.next()) !== null) {
                    //         console.log(event.toString())
                    //         // if (event.event === 'call') {
                    //         //     // 处理调用事件
                    //         //     console.log('Call to:', event.returnAddress, 'with args:', JSON.stringify(event.context));
                    //         // } else if (event.event === 'ret') {
                    //         //     // 处理返回事件
                    //         //     console.log('Return from:', event.returnAddress, 'with ret:', event.returnValue);
                    //         // }
                    //     }
                    // }
                    onReceive: function (events) {
                        console.log("onReceive:\n", Stalker.parse(events ,{stringify:true}))
                    },
                    onCallSummary:function (summary){
                        console.log("onCallSummary:")
                        var sortedEntries = Object.entries(summary).sort((a, b) => b[1] - a[1]);

                        // 遍历排序后的数组
                        sortedEntries.forEach(function(entry) {
                            var target = entry[0]; // 函数标识（例如函数地址或名称）
                            var callCount = entry[1]; // 调用次数
                            console.log(`[+] Function 0x${(target - baseAddr  + libBase).toString(16)} called ${callCount} times`);
                        });

                    }
                    
                })


            
                // for (let i = 1; i < arguments.length; i++) {
                //     console.log('[*] Argument ' + i + ' type: ' , typeof arguments[i] , ' value: ' , arguments[i]);
                //     // log('[*] Argument ' + i + ' value: ' + arguments[i]);
                // }
            },
            onLeave: function(retval) {
            
                console.log("离开函数", address);
                if(this._followTID)
                    Stalker.unfollow(this._followTID)
                try{
                    console.log("retval:", JSON.stringify(retval))
                    let rlt = Memory.readCString(retval)
                    if (rlt.length > 100) {
                        console.log("result:", rlt.substring(0, 100) + "...");
                    } else {
                        console.log("result:", rlt);
                    }
                }
                catch(e){
                    console.log("err:", e)
                }
                
            }
        });
    } else {
        console.error("未找到模块:", moduleName);
    }
}




// 'use strict';

/*
 * Sample parser for Stalker events. It's intended as an example
 * to understand the format, it's possible to optimize it more.
 * It produces disassembly for block, compile and exec events - which
 * is totally unnecessary but it's useful for debugging.
 *
 * parseEvents(events, callback);
 *
 * Parameters:
 *
 *   events - the events as got from onReceive()
 *   callback - a callback to be executed for each parsed event
 *
 * Example:

  Stalker.follow({
    events: {
      call: false,
      ret: false,
      exec: false,
      block: false,
      compile: true
    },
    onReceive: function (events) {
      console.log('[' + tid + '] onReceive!');
      parseEvents(events, function (event) {
        if (event.type === 'compile' || event.type === 'block') {
          console.log('\n' + event.begin + ' -> ' + event.end);
          console.log(event.code + '\n');
        }
      });
    }
  });
*/

var threads = {};

var EV_TYPE_NOTHING = 0;
var EV_TYPE_CALL = 1;
var EV_TYPE_RET = 2;
var EV_TYPE_EXEC = 4;
var EV_TYPE_BLOCK = 8;
var EV_TYPE_COMPILE = 16;

var intSize = Process.pointerSize;
var EV_STRUCT_SIZE = 2 * Process.pointerSize + 2 * intSize;

function parseEvents(blob, callback) {
    var len = getLen(blob);
    for (var i = 0; i !== len; i++) {
        var type = getType(blob, i);
        switch (type) {
            case EV_TYPE_CALL:
                callback(parseCallEvent(blob, i));
                break;
            case EV_TYPE_RET:
                callback(parseRetEvent(blob, i));
                break;
            case EV_TYPE_EXEC:
                callback(parseExecEvent(blob, i));
                break;
            case EV_TYPE_BLOCK:
                callback(parseBlockEvent(blob, i));
                break;
            case EV_TYPE_COMPILE:
                callback(parseCompileEvent(blob, i));
                break;
            default:
                console.log('Unsupported type ' + type);
                break;
        }
    }
}

function getType(blob, idx) {
    return parseInteger(blob, idx, 0);
}

function getLen(blob) {
    return blob.byteLength / EV_STRUCT_SIZE;
}

function parseCallEvent(blob, idx) {
    return {
        type: 'call',
        location: parsePointer(blob, idx, intSize),
        target: parsePointer(blob, idx, intSize + Process.pointerSize),
        depth: parseInteger(blob, idx, intSize + 2 * Process.pointerSize)
    };
}

function parseRetEvent(blob, idx) {
    var ev = parseCallEvent(blob, idx);
    ev.type = 'ret';
    return ev;
}

function parseExecEvent(blob, idx) {
    var loc = parsePointer(blob, idx, intSize);
    return {
        type: 'exec',
        location: loc,
        code: Instruction.parse(loc).toString()
    };
}

function parseBlockEvent(blob, idx) {
    var begin = parsePointer(blob, idx, intSize);
    var end = parsePointer(blob, idx, intSize + Process.pointerSize);
    var i = begin.add(0);
    var code = [];
    while (i.compare(end) < 0) {
        var instr = Instruction.parse(i);
        code.push(i.toString() + '    ' + instr.toString());
        i = instr.next;
    }
    return {
        type: 'block',
        begin: begin,
        end: end,
        code: code.join('\n')
    };
}

function parseCompileEvent(blob, idx) {
    var parsed = parseBlockEvent(blob, idx);
    parsed.type = 'compile';
    return parsed;
}

function parseInteger(blob, idx, offset) {
    return new Int32Array(blob, idx * EV_STRUCT_SIZE + offset, 1)[0];
}

function parsePointer(blob, idx, offset) {
    var view = new Uint8Array(blob, idx * EV_STRUCT_SIZE + offset, Process.pointerSize);
    var stringed = [];
    for (var i = 0; i < Process.pointerSize; i++) {
        var x = view[i];
        var conv = x.toString(16);
        if (conv.length === 1) {
            conv = '0' + conv;
        }
        stringed.push(conv);
    }
    return ptr('0x' + stringed.reverse().join(''));
}

function reverse(arr) {
    var result = [];
    for (var i = arr.length - 1; i >= 0; i--) {
        result.push(arr[i]);
    }
    return result;
}

// 0x6E88C46ED0
// const char* ciphertext = ((const char*)  tolua_tostring(tolua_S,2,0));
//   int ciphertextLength = ((int)  tolua_tonumber(tolua_S,3,0));
//   const char* key = ((const char*)  tolua_tostring(tolua_S,4,0));
//   int keyLength = ((int)  tolua_tonumber(tolua_S,5,0));
//   {
//      Crypto::decryptXXTEALua(ciphertext,ciphertextLength,key,keyLength);

//   }
// setImmediate(hookFunc, 0x6E88C46ED0) // 
// key: scertKey

//6E88C46AF0
// unsigned char* Crypto::decryptXXTEA(unsigned char* ciphertext,
//     int ciphertextLength,
//     unsigned char* key,
//     int keyLength,
//     int* resultLength)

// setImmediate(hookFunc, 0x6E88C46AF0)


//6E88D86818
//static unsigned char *do_xxtea_decrypt(unsigned char *data, xxtea_long len, unsigned char *key, xxtea_long *ret_len)

// 监听模块加载事件


var checkModuleInterval = setInterval(function() {
    var module = Process.getModuleByName(moduleName);
    if (module) {
        clearInterval(checkModuleInterval);  // 停止检查
        console.log("模块已加载:", moduleName);
       
        //
        //0x6E88C9F480
        // LuaStack::addLuaLoader(lua_CFunction func)
        hookFunc(0x6E88C9F480);
        //0x6E88FB27c0
        //lua_pushcclosure 加载loader 函数 
        // hookFunc(0x6E88FB27c0);
        // hookFunc(0x6E88c45008);


    }
}, 100); 





// setImmediate(hookFunc, 0x6E88D86818)

function PointerHook( addr){
   


    var baseAddr = Module.findBaseAddress(moduleName);
    console.log("模块基址:", baseAddr, addr);
    let offset = addr - libBase 
    if (baseAddr) {
        var functionAddr = baseAddr.add(offset).readPointer();
        let address = offset.toString(16)
        console.log("函数地址:", functionAddr, address);

    
        Interceptor.attach(functionAddr, {
            onEnter: function(args) {
                console.log("进入函数:", address);
                console.log("args:", JSON.stringify(args))
            
                for (let i = 1; i < arguments.length; i++) {
                    console.log('[*] Argument ' + i + ' type: ' , typeof arguments[i] , ' value: ' , arguments[i]);
                    // log('[*] Argument ' + i + ' value: ' + arguments[i]);
                }
            },
            onLeave: function(retval) {
            
                console.log("离开函数", address);

                console.log("retval:", JSON.stringify(retval))
            }
        });
    } else {
        console.error("未找到模块:", moduleName);
    }
}
// setImmediate(PointerHook, 0x6E88C46ED0) 

function hookOpenIhi(){
    var pth = Module.findExportByName(null,"fread");
    Interceptor.attach(ptr(pth),{
        onEnter:function(args){
            this.filename = args[0];
            
            if (this.filename.readCString().indexOf("main.ihi") != -1){
                this.matchFile = true;
                console.log("fopen onEnter",this.filename.readCString())
                console.log('backtrace fopen .ihi:\n' + Thread.backtrace(this.context, Backtracer.ACCURATE)
                .map(v => `${(v - ptr )} ${DebugSymbol.fromAddress(v)}`).join('\n') + '\n');
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



// setImmediate(hookFunc, 0xb86a50) // 
// setImmediate(hookFunc, 0x12b657c) // 
// 



