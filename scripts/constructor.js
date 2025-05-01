let cm_include = `
#include <stdio.h>
#include <gum/gumprocess.h>
`
 
let cm_code = `
#if defined(__LP64__)
#define USE_RELA 1
#endif
 
// http://aosp.app/android-14.0.0_r1/xref/bionic/libc/include/link.h
#if defined(__LP64__)
#define ElfW(type) Elf64_ ## type
#else
#define ElfW(type) Elf32_ ## type
#endif
 
// http://aosp.app/android-14.0.0_r1/xref/bionic/libc/kernel/uapi/asm-generic/int-ll64.h
typedef signed char __s8;
typedef unsigned char __u8;
typedef signed short __s16;
typedef unsigned short __u16;
typedef signed int __s32;
typedef unsigned int __u32;
typedef signed long long __s64;
typedef unsigned long long __u64;
 
// http://aosp.app/android-14.0.0_r1/xref/bionic/libc/kernel/uapi/linux/elf.h
typedef __u32 Elf32_Addr;
typedef __u16 Elf32_Half;
typedef __u32 Elf32_Off;
typedef __s32 Elf32_Sword;
typedef __u32 Elf32_Word;
typedef __u64 Elf64_Addr;
typedef __u16 Elf64_Half;
typedef __s16 Elf64_SHalf;
typedef __u64 Elf64_Off;
typedef __s32 Elf64_Sword;
typedef __u32 Elf64_Word;
typedef __u64 Elf64_Xword;
typedef __s64 Elf64_Sxword;
 
typedef struct dynamic {
  Elf32_Sword d_tag;
  union {
    Elf32_Sword d_val;
    Elf32_Addr d_ptr;
  } d_un;
} Elf32_Dyn;
typedef struct {
  Elf64_Sxword d_tag;
  union {
    Elf64_Xword d_val;
    Elf64_Addr d_ptr;
  } d_un;
} Elf64_Dyn;
typedef struct elf32_rel {
  Elf32_Addr r_offset;
  Elf32_Word r_info;
} Elf32_Rel;
typedef struct elf64_rel {
  Elf64_Addr r_offset;
  Elf64_Xword r_info;
} Elf64_Rel;
typedef struct elf32_rela {
  Elf32_Addr r_offset;
  Elf32_Word r_info;
  Elf32_Sword r_addend;
} Elf32_Rela;
typedef struct elf64_rela {
  Elf64_Addr r_offset;
  Elf64_Xword r_info;
  Elf64_Sxword r_addend;
} Elf64_Rela;
typedef struct elf32_sym {
  Elf32_Word st_name;
  Elf32_Addr st_value;
  Elf32_Word st_size;
  unsigned char st_info;
  unsigned char st_other;
  Elf32_Half st_shndx;
} Elf32_Sym;
typedef struct elf64_sym {
  Elf64_Word st_name;
  unsigned char st_info;
  unsigned char st_other;
  Elf64_Half st_shndx;
  Elf64_Addr st_value;
  Elf64_Xword st_size;
} Elf64_Sym;
typedef struct elf32_phdr {
  Elf32_Word p_type;
  Elf32_Off p_offset;
  Elf32_Addr p_vaddr;
  Elf32_Addr p_paddr;
  Elf32_Word p_filesz;
  Elf32_Word p_memsz;
  Elf32_Word p_flags;
  Elf32_Word p_align;
} Elf32_Phdr;
typedef struct elf64_phdr {
  Elf64_Word p_type;
  Elf64_Word p_flags;
  Elf64_Off p_offset;
  Elf64_Addr p_vaddr;
  Elf64_Addr p_paddr;
  Elf64_Xword p_filesz;
  Elf64_Xword p_memsz;
  Elf64_Xword p_align;
} Elf64_Phdr;
 
// http://aosp.app/android-14.0.0_r1/xref/bionic/linker/linker_soinfo.h
typedef void (*linker_dtor_function_t)();
typedef void (*linker_ctor_function_t)(int, char**, char**);
 
#if defined(__work_around_b_24465209__)
#define SOINFO_NAME_LEN 128
#endif
 
typedef struct {
  #if defined(__work_around_b_24465209__)
    char old_name_[SOINFO_NAME_LEN];
  #endif
    const ElfW(Phdr)* phdr;
    size_t phnum;
  #if defined(__work_around_b_24465209__)
    ElfW(Addr) unused0; // DO NOT USE, maintained for compatibility.
  #endif
    ElfW(Addr) base;
    size_t size;
   
  #if defined(__work_around_b_24465209__)
    uint32_t unused1;  // DO NOT USE, maintained for compatibility.
  #endif
   
    ElfW(Dyn)* dynamic;
   
  #if defined(__work_around_b_24465209__)
    uint32_t unused2; // DO NOT USE, maintained for compatibility
    uint32_t unused3; // DO NOT USE, maintained for compatibility
  #endif
   
    void* next;
    uint32_t flags_;
   
    const char* strtab_;
    ElfW(Sym)* symtab_;
   
    size_t nbucket_;
    size_t nchain_;
    uint32_t* bucket_;
    uint32_t* chain_;
   
  #if !defined(__LP64__)
    ElfW(Addr)** unused4; // DO NOT USE, maintained for compatibility
  #endif
   
  #if defined(USE_RELA)
    ElfW(Rela)* plt_rela_;
    size_t plt_rela_count_;
   
    ElfW(Rela)* rela_;
    size_t rela_count_;
  #else
    ElfW(Rel)* plt_rel_;
    size_t plt_rel_count_;
   
    ElfW(Rel)* rel_;
    size_t rel_count_;
  #endif
   
    linker_ctor_function_t* preinit_array_;
    size_t preinit_array_count_;
   
    linker_ctor_function_t* init_array_;
    size_t init_array_count_;
    linker_dtor_function_t* fini_array_;
    size_t fini_array_count_;
   
    linker_ctor_function_t init_func_;
    linker_dtor_function_t fini_func_;
} soinfo;
 
void tell_init_info(soinfo* ptr, void (*cb)(int, void*, void*)) {
    cb(ptr->init_array_count_, ptr->init_array_, ptr->init_func_);
}

`
 
let cm = null;
let tell_init_info = null;
let toUTF8Ref = null;
 
function setup_cmodule() {
    if (Process.pointerSize == 4) {
        cm_code = cm_include + "#define __work_around_b_24465209__ 1" + cm_code;
    } else {
        cm_code = cm_include + "#define __LP64__ 1" + cm_code;
    }
    cm = new CModule(cm_code, {});
    tell_init_info = new NativeFunction(cm.tell_init_info, "void", ["pointer", "pointer"]);
}
 
function get_addr_info(addr) {
    let mm = new ModuleMap();
    let info = mm.find(addr);
    if (info == null) return "null";
    return `[${info.name} + ${addr.sub(info.base)}]`;
}
function hkbys(targetSymbol){
    // 目标函数符号（以 FileUtils::getFileData 为例）


    // 获取函数地址
    // const funcPtr = DebugSymbol.getFunctionByName(targetSymbol);
    const funcPtr = Module.findExportByName("libcocos2dlua.so","_ZN7cocos2d10HelperFunc11getFileDataEPKcS2_Pm")
    console.log("funcPtr: " + funcPtr);
    if (funcPtr) {
        // 动态挂钩
        // hookonce = true;
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
function hkopf(partern){
    Interceptor.attach(Module.findExportByName(null, "fopen"), {
    
        onEnter: function(args) {

            // debug only the intended calls
            this.flag = false;
            var filename = Memory.readCString(ptr(args[0]));
            // if (filename.indexOf("XYZ") === -1 && filename.indexOf("ZYX") === -1) // exclusion list
            // console.log("filename: " + filename);
            if (filename &&partern && partern.test(filename.toString())) // inclusion list{}
                this.flag = true;

            if (this.flag) {
                // console.warn("\n*** entered open");

                // console.log("\nfile name: " + filename);

                // // print backtrace
                // console.log("\nBacktrace:\n" + Thread.backtrace(this.context, Backtracer.ACCURATE)
                //         .map(DebugSymbol.fromAddress).join("\n"));
            }
        },

        onLeave: function(retval) {

            if (this.flag && retval) {
                // print retval
                
                console.warn("\n*** exiting open");
                console.log("\nretval: " + retval);
                console.log("\nBacktrace:\n" + Thread.backtrace(this.context, Backtracer.ACCURATE)
                .map(DebugSymbol.fromAddress).join("\n"));
            }
        }

    }); 
}

function  hkbyModule(module, params){
    let exps = module.enumerateSymbols();
    exps.filter(exp =>{
        if(exp.type != "function"){
            return false;
        }
        for(let param of params){
            if(param.test(exp.name)){
                return true;
            }
        }
        return false;
    }).forEach(exp => {
        console.log(`[hkbyModule] ${exp.name} -> ${exp.address} ${exp.address.sub(module.base)}`);
        Interceptor.attach(exp.address, {
            onEnter: function(args){
                console.log(`[hkbyModule] ${exp.name} onEnter:${args}`);
            },
            onLeave: function(retval){
                console.log(`[hkbyModule] ${exp.name} onLeave:${retval}`);
            }
        });
    });

}
function hksub(sub, enter, leave){
    let subaddr = m.base.add(sub);
    Interceptor.attach(subaddr, {
        onEnter: function(args){
            enter&&enter.call(this,args);
        },
        onLeave: function(retval){
            leave&&leave.call(this,retval);
        }
    });
}
function readData(dataPtr) {
    var size = Memory.readS32(dataPtr.add(8));
    return `Data(size=${size})`;
}

function readStdString(strPtr) {
    var dataPtr = Memory.readPointer(strPtr.add(24));
    var size = Memory.readU64(strPtr.add(8));
    var actualDataPtr;
    if (dataPtr.and(1).toInt32() != 0) {
        actualDataPtr = dataPtr.add(1); // 短字符串
    } else {
        actualDataPtr = dataPtr; // 长字符串
    }
    var strBytes = Memory.readCString(actualDataPtr);
    console.log("strBytes: " , strBytes);
    return strBytes;

}

  function readStdString2 (str) {
    const isTiny = (str.readU8() & 1) === 0;
    if (isTiny) {
      return str.add(1).readUtf8String();
    }
  
    return str.add(2 * Process.pointerSize).readUtf8String();
  }

// Helper function to read std::string object (Simplified Heuristic for Android ARM64)
// WARNING: This is still a heuristic and might not work correctly for all targets


// ... (rest of your Frida script using this readStdString function)

// 工具函数：字节数组转十六进制字符串
function bytesToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(' ');
}
function hexBufer(ptr, len = 30){
    let buffer = ptr.readByteArray(len);
    // console.log("buffer: " + bytesToHex(buffer));
    return  ptr.toString(16) + ":" + bytesToHex(buffer);
}

function printNativeStack(context) {
    console.log('Native call stack:');
    console.log(Thread.backtrace(context, Backtracer.ACCURATE)
        .map(DebugSymbol.fromAddress).join('\n'));
}
let m
function hkbySoinfo(soinfo){
    tell_init_info(soinfo, new NativeCallback((count, init_array_ptr, init_func) => {
       
        console.log(`[call_constructors] init_array_ptr:${init_array_ptr}`);
        console.log(`[call_constructors] init_func:${init_func} -> ${get_addr_info(init_func)}`);
        let mm = new ModuleMap();
        m = mm.find(init_array_ptr);
        console.log(`[call_constructors] ${m.name} count:${count}`);


        // luaL_loadbuffer(L, (char*)result, len, chunkName);
        // __int64 __fastcall cocos2d::LuaStack::luaLoadBuffer(__int64 a1, __int64 a2, __int64 a3, __int64 a4, __int64 a5)
        hksub(0xE0EE60,function(args){  //
            console.log(`[hksub]  onEnter:`);
            // console.log("args[0]: " , args[0].readCString().substring(0, 20));
            // console.log("args[2]: " ,args[2].readUtf8String().substring(0, 20));
            console.log("args[0]: " , hexBufer(args[0]));
            console.log("args[1]: " , hexBufer(args[1]));
            console.log("args[2]: " ,args[2].toInt32());
            // console.log("args[2]: " ,args[2].readUtf8String());
            console.log("args[3]: " ,args[3].readUtf8String());
            console.log("args[4]: " ,args[4].readUtf8String());

            // console.log("args[3]: " + readStdString(args[3]));


        },function(retval){
            // console.log("retval: " ,retval.readPointer().toString(16), retval, retval.readUtf8String());
            console.log("retval: " ,retval);
        });

//         // hkbyModule(m, [/filedata/i,/xxtea/i,/FileUtilsAndroid/i]);
// //         // __int64 __fastcall sub_1A6238C(__int64 a1, const char *a2, _QWORD *a3, unsigned int a4)
// //         LOAD:0000000001A6238C ; __int64 __fastcall sub_1A6238C(__int64, const char *, _QWORD *, unsigned int)
// // LOAD:0000000001A6238C sub_1A6238C                             ; CODE XREF: luaL_openlib+1C↑p
// // LOAD:0000000001A6238C                                         ; sub_1503C10+2E6C↑p ...
//         hksub(0x1A6238C,function(args){  //
//             console.log(`[hksub]  onEnter:`);
//             // console.log("args[0]: " , args[0].readCString().substring(0, 20));
//             console.log("args[1]: " ,args[1].readCString());
//             console.log("args[2]: " ,args[2].readPointer().readCString());

//             // console.log("args[3]: " + readStdString(args[3]));


//         },function(retval){
//             // console.log("retval: " + retval.readCString().substring(0, 50));
//         });
        //   hksub(0x1C2D9B0,function(args){  //cachedata
        //     console.log(`[hksub]  onEnter:`);
        //     console.log("args[0]: ", args[0].readPointer().readCString());
        //     // console.log("args[1]: " ,readStdString(args[1]));
        //     // console.log("args[2]: " , readStdString(args[2]));
        //     // console.log("args[3]: " + readStdString(args[3]));


        // },function(retval){
        //     console.log("retval: " + retval);
        // });
        // __int64 __fastcall sub_14BD7BC(__int64 this, __int64 n16, __int64 a3, unsigned int n0xF, _DWORD *a5)
        // 14BD7BC                             ; CODE XREF: cocos2d::extra::Crypto::decryptXXTEA(uchar *,int,uchar *,int,int *)
        //  hksub(0x14BD7BC,function(args){  //
        //     console.log(`[hksub]  onEnter:`);
        //     console.log("args[0]: " , args[0].readCString().substring(0, 20));
        //     console.log("args[1]: " ,args[1].toInt32());
        //     console.log("args[2]: " , args[2].readCString());
        //     console.log("args[3]: " , args[3].toInt32());
        //     // console.log("args[3]: " + readStdString(args[3]));


        // },function(retval){
        //     console.log("retval: " + retval.readCString().substring(0, 50));
        // });
        // cocos2d::HelperFunc::getFileData(char const*,char const*,ulong *)
        // hksub(0x14B9C08,function(args){  //
        //     console.log(`[hksub]  onEnter:`);
        //     console.log("args[0]: " , args[0].readCString());
        //     console.log("args[1]: " ,args[1].readCString());
        //     console.log("args[2]: " , args[2].readPointer().toInt32());
        //     // console.log("args[3]: " + readStdString(args[3]));


        // },function(retval){
        //     console.log("retval: " + retval.readCString().substring(0, 50));
        // });
        // hksub(0x1C13540,function(args){  //cachedata
        //     console.log(`[hksub]  onEnter:`);
        //     // console.log("args[0]: " + readData(args[0]));
        //     // console.log("args[1]: " ,readStdString(args[1]));
        //     // console.log("args[2]: " , readStdString(args[2]));
        //     // console.log("args[3]: " + readStdString(args[3]));


        // },function(retval){
        //     console.log("retval: " + retval.readPointer().readCString().substring(0, 50));
        // });
        // hksub(0x1654234,function(args){ xxtea
        //     // console.log(`[hksub]  onEnter:${JSON.stringify(args)}`);
        //     console.log("args[0]: " + args[0].sub(8).readCString().substring(0, 20));
        //     console.log("args[1]: " + args[1].toInt32());
        //     console.log("args[2]: " + args[2].readCString());
        //     console.log("args[3]: " + args[3].toInt32());     
        //     this.argSizePtr = args[4]
        //     // printNativeStack(this.context)
               
        // },function(retval){
        //     if(this.argSizePtr){
        //         const dataSize = this.argSizePtr.readPointer().toInt32();
                    
        //         // 读取返回的二进制数据（假设返回 unsigned char*）
        //         // const dataBuffer = retval.readByteArray(dataSize);
                
        //         console.log(`[-] 返回数据指针: ${retval}`);
        //         console.log(`    数据长度: ${dataSize}`);
        //         if(dataSize > 0){
        //             console.log('头部数据20:', retval.readCString().substring(0, 20));
        //         } else {
        //                 console.log('    数据为空!');
        //         }
        //     }

        // });
        //  hksub(0x1653DCC);

    }, "void", ["int", "pointer", "pointer"]));
}

function hook_call_constructors() {
    let get_soname = null;
    let call_constructors_addr = null;
    let hook_call_constructors_addr = true;
 
    let linker = null;
    if (Process.pointerSize == 4) {
        linker = Process.findModuleByName("linker");
    } else {
        linker = Process.findModuleByName("linker64");
    }
 
    let symbols = linker.enumerateSymbols();
    for (let index = 0; index < symbols.length; index++) {
        let symbol = symbols[index];
        if (symbol.name == "__dl__ZN6soinfo17call_constructorsEv") {
            call_constructors_addr = symbol.address;
        } else if (symbol.name == "__dl__ZNK6soinfo10get_sonameEv") {
            get_soname = new NativeFunction(symbol.address, "pointer", ["pointer"]);
        }
    }
    if (hook_call_constructors_addr && call_constructors_addr && get_soname) {
        Interceptor.attach(call_constructors_addr,{
            onEnter: function(args){
                this.soinfo = args[0];
                this.soname = get_soname(this.soinfo).readCString();
                // console.log("soname:", this.soname);
            }
            ,
            onLeave: function(retval){
                // console.log("onLeave:", retval);
                if(this.soname == "libcocos2dlua.so"){

                    setImmediate(() => {
                        hkbySoinfo(this.soinfo);
                    });
                    // tell_init_info(this.soinfo, new NativeCallback((count, init_array_ptr, init_func) => {
                    //     console.log(`[call_constructors] ${this.soname} count:${count}`);
                    //     console.log(`[call_constructors] init_array_ptr:${init_array_ptr}`);
                    //     console.log(`[call_constructors] init_func:${init_func} -> ${get_addr_info(init_func)}`);
                    //     for (let index = 0; index < count; index++) {
                    //         let init_array_func = init_array_ptr.add(Process.pointerSize * index).readPointer();
                    //         let func_info = get_addr_info(init_array_func);
                    //         console.log(`[call_constructors] init_array:${index} ${init_array_func} -> ${func_info}`);
                    //     }
                    // }, "void", ["int", "pointer", "pointer"]));
                    // hkbys()
                }

//                 [call_constructors] libcocos2dlua.so count:359
// [call_constructors] init_array_ptr:0x756a9a4258
// [call_constructors] init_func:0x7568696e40 -> [libcocos2dlua.so + 0x220e40]
// [call_constructors] init_array:0 0x7569767588 -> [libcocos2dlua.so + 0x12f1588]
// [call_constructors] init_array:1 0x75697675dc -> [libcocos2dlua.so + 0x12f15dc]
// [call_constructors] init_array:2 0x7569767630 -> [libcocos2dlua.so + 0x12f1630]
// [call_constructors] init_array:3 0x7569767684 -> [libcocos2dlua.so + 0x12f1684]
// [call_constructors] init_array:4 0x75697676d8 -> [libcocos2dlua.so + 0x12f16d8]
// [call_constructors] init_array:5 0x7569767750 -> [libcocos2dlua.so + 0x12f1750]

            }
        });
    }
}
 
function main(){
    setup_cmodule();
    hook_call_constructors();
}
 
setImmediate(main);
 