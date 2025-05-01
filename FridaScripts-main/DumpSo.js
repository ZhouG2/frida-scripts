var Location = "libcocos2dlua.so";
var FileLoaded = 0;
var CHUNK_SIZE = 0x400; // 1KB chunks
var isDumping = false;

function ProcessName() {
    var openPtr = Module.getExportByName('libc.so', 'open');
    var open = new NativeFunction(openPtr, 'int', ['pointer', 'int']);
    var readPtr = Module.getExportByName('libc.so', 'read');
    var read = new NativeFunction(readPtr, 'int', ['int', 'pointer', 'int']);
    var closePtr = Module.getExportByName('libc.so', 'close');
    var close = new NativeFunction(closePtr, 'int', ['int']);
    var path = Memory.allocUtf8String('/proc/self/cmdline');
    var fd = open(path, 0);
    if (fd != -1) {
        var buffer = Memory.alloc(0x1000);
        var result = read(fd, buffer, 0x1000);
        close(fd);
        result = ptr(buffer).readCString();
        return result;
    }
    return -1;
}

function dumpMemoryToFile(base, size, filePath) {
    if (isDumping) {
        console.warn("Already dumping, skipping...");
        return false;
    }
    
    isDumping = true;
    try {
        var fileHandle = new File(filePath, "wb");
        if (!fileHandle) {
            console.error("Failed to create file:", filePath);
            return false;
        }

        console.log("Starting dump of " + size + " bytes from " + base);
        
        var totalSize = 0;
        var readableSize = 0;
        var nonReadableSize = 0;
        var failedChunks = 0;

        // 使用缓冲区来存储整个模块
        var buffer = new Uint8Array(size);
        
        // 分块读取内存
        for (var offset = 0; offset < size; offset += CHUNK_SIZE) {
            var remaining = size - offset;
            var readSize = remaining < CHUNK_SIZE ? remaining : CHUNK_SIZE;
            
            try {
                var chunk = Memory.readByteArray(base.add(offset), readSize);
                buffer.set(new Uint8Array(chunk), offset);
                readableSize += readSize;
            } catch (e) {
                failedChunks++;
                if (failedChunks % 1000 === 0) { // 每1000个失败块才输出一次日志，避免日志过多
                    console.warn("Failed to read chunk at offset " + offset + ", filling with zeros");
                }
                // 对于不可读的部分，填充0
                for (var i = 0; i < readSize; i++) {
                    buffer[offset + i] = 0;
                }
                nonReadableSize += readSize;
            }
            totalSize += readSize;
        }

        // 写入文件
        fileHandle.write(buffer);
        fileHandle.flush();
        fileHandle.close();

        // 输出统计信息
        console.log("Dump statistics:");
        console.log("Total size: " + totalSize + " bytes");
        console.log("Readable size: " + readableSize + " bytes");
        console.log("Non-readable size: " + nonReadableSize + " bytes");
        console.log("Readable percentage: " + ((readableSize / totalSize) * 100).toFixed(2) + "%");
        console.log("Failed chunks: " + failedChunks);

        return true;
    } catch (e) {
        console.error("Error during dump:", e);
        return false;
    } finally {
        isDumping = false;
    }
}

Interceptor.attach(Module.findExportByName(null, 'android_dlopen_ext'), {
    onEnter: function(args) {
        try {
            if (args[0] !== null) {
                var library_path = Memory.readCString(args[0]);
                if (library_path && library_path.indexOf(Location) >= 0) {
                    console.warn("Loading library:", library_path);
                    FileLoaded = 1;
                }
            }
        } catch (e) {
            console.warn("Error in android_dlopen_ext interceptor:", e);
        }
    },
    onLeave: function(retVal) {
        if (FileLoaded == 1) {
            try {
                var Pro = ProcessName();
                var libso = Process.findModuleByName(Location);
                if (!libso) {
                    console.error("Failed to find module:", Location);
                    return;
                }

                console.log("[name]:", libso.name);
                console.log("[base]:", libso.base);
                console.log("[size]:", ptr(libso.size));
                console.log("[path]:", libso.path);

                var file_path = "/data/data/" + Pro + "/" + libso.name + "_" + libso.base + "_" + ptr(libso.size) + ".so";
                
                if (dumpMemoryToFile(libso.base, libso.size, file_path)) {
                    console.log("[dump]: Successfully dumped to", file_path);
                    console.log("[info]: You may need to use SoFixer to fix the dumped file");
                } else {
                    console.error("[dump]: Failed to dump memory");
                }
            } catch (e) {
                console.error("Error in onLeave:", e);
            }
        }
    }
});
