import xxtea
import argparse
import os
import sys
import io

# 添加这些行来调试
print(f"脚本路径: {os.path.abspath(__file__)}")
print(f"Python路径: {sys.executable}")

# 在main()函数最开头添加
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def encryptWithSign(sign, key, data):
    """加密带签名的数据
    
    Args:
        sign: 文件开头的签名
        key: 加密密钥
        data: 待加密数据
    
    Returns:
        加密后的数据，包含签名
    """
    # 转换为bytes
    sign_bytes = sign.encode() if isinstance(sign, str) else sign
    key_bytes = key.encode() if isinstance(key, str) else key
    
    # 加密数据
    encrypted = xxtea.encrypt(data, key_bytes)

    # 添加签名
    return sign_bytes + encrypted



def decryptWithSign(sign, key, data):
    """解密带签名的数据
    
    Args:
        sign: 文件开头的签名
        key: 解密密钥
        data: 加密数据
    
    Returns:
        解密后的数据，去除末尾4个字节
    """
    # 转换为bytes
    sign_bytes = sign.encode() if isinstance(sign, str) else sign
    key_bytes = key.encode() if isinstance(key, str) else key
    
    # 如果数据以签名开头，去掉签名
    if data.startswith(sign_bytes):
        data = data[len(sign_bytes):]
    
    # 使用xxtea库解密
    try:
        decrypted = xxtea.decrypt(data, key_bytes)

        return decrypted
    except Exception as e:
        print(f"解密错误: {e}")
        return None

def main():
    parser = argparse.ArgumentParser(
        description='XXTEA 加解密工具',
        formatter_class=lambda prog: argparse.HelpFormatter(prog, max_help_position=30),
        add_help=False
    )
    parser.add_argument('-h', '--help', action='help', default=argparse.SUPPRESS,
                        help='显示帮助信息')
    parser.add_argument('-f', '--file', help='要解密的文件', default='main.ihi')
    parser.add_argument('-s', '--sign', help='文件开头的签名', default='d59310f3')
    parser.add_argument('-k', '--key', help='解密密钥')
    parser.add_argument('-e', '--encode', help='执行加密操作', action='store_true')
    
    args = parser.parse_args()
    
    
    try:
        with open(args.file, 'rb') as f:
            file_data = f.read()
        
        if args.sign and args.key:
            if args.encode:
                encrypted_data = encryptWithSign(args.sign, args.key, file_data)
            else:
                decrypted_data = decryptWithSign(args.sign, args.key, file_data)
        else:
            # 默认使用两步解密
            decrypted_data = decryptWithSign('d59310f3', "NIAM", file_data)
            if decrypted_data:
                decrypted_data = decryptWithSign('fe2ffb64', "96bd6df131b99284", decrypted_data)
        
        if decrypted_data:
            # 保存解密后的数据
            output_file = args.file + '.decrypted'
            outdata = decrypted_data
        elif encrypted_data:
            output_file = args.file + '.encrypted'
            outdata = encrypted_data
        else:
            print("解密失败或解密结果为空")
            return
        
        with open(output_file, 'wb') as f:
            f.write(outdata)
            
            # 打印头部和尾部信息
            header = outdata[:2].hex() if len(outdata) >= 2 else ""
            end = outdata[-24:].hex() if len(outdata) >= 24 else ""
            print(f'header:{header} end:{end} size:{len(outdata)}')
            print(f"解密完成，结果已保存到 {output_file}")
    except Exception as e:
        print(f"处理文件时出错: {e}")

if __name__ == '__main__':
    main() 