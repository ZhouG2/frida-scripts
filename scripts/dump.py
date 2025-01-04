import sys
import frida
import os

def fix_so(arch, origin_so_name, so_name, base, size):
    if arch == "arm":
        os.system("adb push android/SoFixer32 /data/local/tmp/SoFixer")
    elif arch == "arm64":
        os.system("adb push android/SoFixer64 /data/local/tmp/SoFixer")
    os.system("adb shell chmod +x /data/local/tmp/SoFixer")
    os.system("adb push " + so_name + " /data/local/tmp/" + so_name)
    print("adb shell /data/local/tmp/SoFixer -m " + base + " -s /data/local/tmp/" + so_name + " -o /data/local/tmp/" + so_name + ".fix.so")
    os.system("adb shell /data/local/tmp/SoFixer -m " + base + " -s /data/local/tmp/" + so_name + " -o /data/local/tmp/" + so_name + ".fix.so")
    os.system("adb pull /data/local/tmp/" + so_name + ".fix.so " + origin_so_name + "_" + base + "_" + str(size) + "_fix.so")
    os.system("adb shell rm /data/local/tmp/" + so_name)
    os.system("adb shell rm /data/local/tmp/" + so_name + ".fix.so")
    os.system("adb shell rm /data/local/tmp/SoFixer")

    return origin_so_name + "_" + base + "_" + str(size) + "_fix.so"

def read_frida_js_source():
    with open("dump_so.js", "r") as f:
        return f.read()

def on_message(message, data):
    pass

if __name__ == "__main__":
    device = frida.get_usb_device()
    pid = device.get_frontmost_application().pid
    session = device.attach(pid)
    script = session.create_script(read_frida_js_source())
    script.on('message', on_message)
    script.load()

    if len(sys.argv) < 2:
        allmodule = script.exports_sync.allmodule()
        for module in allmodule:
            print(module["name"])
    else:
        origin_so_name = sys.argv[1]
        module_info = script.exports_sync.findmodule(origin_so_name)
        print(module_info)
        base = module_info["base"]
        size = module_info["size"]

        # Check memory before dumping
        memory_check = script.exports_sync.checkmemory(base, 4096)  # Check first 4KB
        if memory_check:
            print("Memory check passed, attempting to dump module.")
            chunk_size = 4096  # 4KB chunk size for reading memory
            module_buffer = script.exports_sync.dumpmodule(origin_so_name, chunk_size)

            dump_so_name = origin_so_name + ".dump.so"
            with open(dump_so_name, "wb") as f:
                f.write(module_buffer)
                f.close()
                arch = script.exports_sync.arch()
                fix_so_name = fix_so(arch, origin_so_name, dump_so_name, base, size)
                
                print(fix_so_name)
                os.remove(dump_so_name)
        else:
            print("Memory check failed. Cannot access the specified address range.")
