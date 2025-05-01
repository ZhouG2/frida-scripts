import sys
import time
import os
import shutil
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class SyncHandler(FileSystemEventHandler):
    """
    处理文件系统事件，将改动的文件同步到备份目录。
    """
    def __init__(self, source_dir, dest_dir):
        super().__init__()
        # 将路径转换为绝对路径，避免相对路径问题
        self.source_dir = os.path.abspath(source_dir)
        self.dest_dir = os.path.abspath(dest_dir)

        # 确保目标备份目录存在
        if not os.path.exists(self.dest_dir):
            os.makedirs(self.dest_dir)
            print(f"备份目录不存在，已创建 - {self.dest_dir}")

        # 确保源目录存在
        if not os.path.isdir(self.source_dir):
             print(f"错误: 源目录不存在或不是一个目录 - {self.source_dir}")
             sys.exit(1) # 源目录不存在则无法监控，直接退出

        print(f"监控源目录: {self.source_dir}")
        print(f"同步到目标目录: {self.dest_dir}")

    def on_any_event(self, event):
        """
        处理任何文件系统事件。
        这里我们主要关心文件的创建和修改事件。
        """
        # 只处理文件事件，忽略目录事件
        if event.is_directory:
            return

        # 处理文件的创建和修改事件
        # watchdog 的 on_modified 有时会触发多次，on_created 也可能需要处理同步
        # 直接在 on_any_event 中处理，并过滤掉目录，是最简洁的方式。
        # 当文件被修改或创建时，执行同步操作
        # Note: event.src_path 是触发事件的文件的完整路径
        self.sync_file(event.src_path, event.event_type)


    def sync_file(self, source_file_path, event_type):
        """
        将单个文件从源目录同步到目标目录，保持相对路径并覆盖。
        """
        # 确保文件路径是绝对路径，尽管event.src_path通常已经是
        source_file_path = os.path.abspath(source_file_path)

        # 确保事件发生在我们监控的源目录内 (安全检查)
        if not source_file_path.startswith(self.source_dir):
             print(f"警告: 事件发生在监控范围之外: {source_file_path}")
             return

        # 计算文件相对于源目录的相对路径
        # 例如：如果 source_dir 是 /src，source_file_path 是 /src/subdir/file.txt，
        # 那么 relative_path 就是 subdir/file.txt
        relative_path = os.path.relpath(source_file_path, self.source_dir)

        # 构建目标目录中的对应文件路径
        # 例如：如果 dest_dir 是 /backup，relative_path 是 subdir/file.txt，
        # 那么 dest_file_path 就是 /backup/subdir/file.txt
        dest_file_path = os.path.join(self.dest_dir, relative_path)

        # 确保目标文件所在的子目录在备份目录中存在
        # 例如：如果目标路径是 /backup/subdir/file.txt，确保 /backup/subdir 存在
        dest_parent_dir = os.path.dirname(dest_file_path)
        if not os.path.exists(dest_parent_dir):
            os.makedirs(dest_parent_dir, exist_ok=True) # exist_ok=True 防止目录已存在时报错

        try:
            # 使用 shutil.copy2 进行复制，它会复制文件内容和元数据（如修改时间）
            # 如果目标文件已存在，它会被覆盖
            shutil.copy2(source_file_path, dest_file_path)
            print(f"[{event_type}] 同步文件: {relative_path}")
            # print(f"从 {source_file_path} -> {dest_file_path}") # 详细路径（如果需要）

        except FileNotFoundError:
             # 如果源文件在事件触发后但在复制前被删除，可能会发生此错误
             print(f"警告: 源文件不存在，跳过同步: {source_file_path}")
        except Exception as e:
            print(f"同步文件时发生错误 ({event_type}): {e}")

    # 如果需要处理文件删除，可以添加 on_deleted 方法
    # def on_deleted(self, event):
    #     if not event.is_directory:
    #         print(f"[deleted] 检测到文件删除：{event.src_path}")
    #         # 可以在这里删除目标目录中对应的文件

    # 如果需要处理文件移动/重命名，可以添加 on_moved 方法
    # def on_moved(self, event):
    #     if not event.is_directory:
    #         print(f"[moved] 检测到文件移动/重命名：{event.src_path} -> {event.dest_path}")
    #         # 需要计算原路径和新路径在目标目录中的对应位置并进行相应操作

if __name__ == "__main__":
    # 解析命令行参数
    if len(sys.argv) < 2 or len(sys.argv) > 3:
        print("用法: python sync_monitor.py <destpath> [sourcepath]")
        print("  <destpath>   : 备份文件存放的目标目录 (必需)")
        print("  [sourcepath] : 需要监控的源目录 (可选，默认为当前目录)")
        sys.exit(1)

    # 第一个参数是目标目录
    DEST_DIRECTORY = sys.argv[1]

    # 第二个参数是源目录，如果不存在则默认为当前目录 '.'
    SOURCE_DIRECTORY = sys.argv[2] if len(sys.argv) == 3 else "."

    # 使用绝对路径以确保兼容性
    SOURCE_DIRECTORY = os.path.abspath(SOURCE_DIRECTORY)
    DEST_DIRECTORY = os.path.abspath(DEST_DIRECTORY)

    # 创建事件处理器实例
    event_handler = SyncHandler(SOURCE_DIRECTORY, DEST_DIRECTORY)

    # 创建观察者实例
    observer = Observer()

    # 安排观察者监控源目录
    # recursive=True 表示递归监控子目录下的所有文件改动
    observer.schedule(event_handler, SOURCE_DIRECTORY, recursive=True)

    # 启动监控
    observer.start()
    print("文件同步监控已启动。按 Ctrl+C 停止。")

    try:
        # 主线程进入休眠，保持脚本运行
        # 监控任务在 observer 启动的独立线程中进行
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        # 捕获 Ctrl+C 信号，停止观察者
        observer.stop()
    except Exception as e:
        print(f"发生意外错误: {e}")

    # 等待观察者线程自然结束
    observer.join()
    print("文件同步监控已停止。")