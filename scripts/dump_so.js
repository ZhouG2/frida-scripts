rpc.exports = {
    // findmodule: function(so_name) {
    //     var libso = Process.findModuleByName(so_name);
    //     return libso;
    // },
    // dumpmodule: function(so_name) {
    //     var libso = Process.findModuleByName(so_name);
    //     if (libso == null) {
    //         return -1;
    //     }
    //     Memory.protect(ptr(libso.base), libso.size, 'rwx');
    //     var libso_buffer = ptr(libso.base).readByteArray(libso.size);
    //     libso.buffer = libso_buffer;
    //     return libso_buffer;
    // },
    allmodule: function() {
        return Process.enumerateModules()
    },
    arch: function() {
        return Process.arch;
    },
    findmodule: function(name) {
        var module = Process.getModuleByName(name);
        return {
            name: module.name,
            base: module.base,
            size: module.size,
            path: module.path
        };
    },
    dumpmodule: function(name, chunkSize) {
        var module = Process.getModuleByName(name);
        var base = module.base;
        var size = module.size;
        var buffer = new Uint8Array(size);
        for (var offset = 0; offset < size; offset += chunkSize) {
            var remaining = size - offset;
            var readSize = remaining < chunkSize ? remaining : chunkSize;
            try {
                var chunk = Memory.readByteArray(base.add(offset), readSize);
                buffer.set(new Uint8Array(chunk), offset);
            } catch (e) {
                // Skip unreadable chunk
                for (var i = 0; i < readSize; i++) {
                    buffer[offset + i] = 0;
                }
            }
        }
        return buffer.buffer;
    },
    checkmemory: function(address, size) {
        try {
            Memory.protect(ptr(address), size, 'rwx');
            var buffer = Memory.readByteArray(ptr(address), size);
            Memory.protect(ptr(address), size, 'r--');
            return buffer;
        } catch (e) {
            return null;
        }
    }
    // checkmemory: function(address, size) {
    //     try {
    //         Memory.protect(ptr(address), size, 'rwx');
    //         var buffer = Memory.readByteArray(ptr(address), size);
    //         Memory.protect(ptr(address), size, 'r--');
    //         return buffer;
    //     } catch (e) {
    //         return null;
    //     }
    // }

}