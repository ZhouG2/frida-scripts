import argparse
import os
import sys
import io


import struct

XXTEA_DELTA = 0x9E3779B9

def _to_uint32_array(data):
    n = len(data)
    pad = (4 - (n % 4)) % 4
    data += bytes([0]*pad)
    return struct.unpack(f"<{len(data)//4}I", data)

def _to_bytes(v):
    return struct.pack(f"<{len(v)}I", *v)

def _mx(z, y, sum, key, p, e):
    return ((z>>5 ^ y<<2) + (y>>3 ^ z<<4)) ^ ((sum ^ y) + (key[(p&3) ^ e] ^ z))

def xxtea_encrypt(data, key):
    if not data:
        return b""
    
    v = list(_to_uint32_array(data))
    n = len(v)
    if n < 1:
        return data
    
    # 密钥处理
    key = _to_uint32_array(key.ljust(16, b'\0')[:16])
    key = list(key) * 4  # 扩展密钥数组
    
    rounds = 6 + 52 // n
    sum_ = 0
    z = v[-1]
    
    for _ in range(rounds):
        sum_ = (sum_ + XXTEA_DELTA) & 0xFFFFFFFF
        e = (sum_ >> 2) & 3
        for p in range(n):
            y = v[(p+1)%n]
            z = v[p] = (v[p] + _mx(z, y, sum_, key, p, e)) & 0xFFFFFFFF
    
    return _to_bytes(v)

def xxtea_decrypt(data, key):
    if not data:
        return b""
    
    v = list(_to_uint32_array(data))
    n = len(v)
    if n < 1:
        return data
    
    key = _to_uint32_array(key.ljust(16, b'\0')[:16])
    key = list(key) * 4  # 扩展密钥数组
    
    rounds = 6 + 52 // n
    sum_ = (XXTEA_DELTA * rounds) & 0xFFFFFFFF
    y = v[0]
    
    for _ in range(rounds):
        e = (sum_ >> 2) & 3
        for p in range(n-1, -1, -1):
            z = v[p-1] if p > 0 else v[-1]
            y = v[p] = (v[p] - _mx(z, y, sum_, key, p, e)) & 0xFFFFFFFF
        sum_ = (sum_ - XXTEA_DELTA) & 0xFFFFFFFF
    
    decrypted = _to_bytes(v)
    # 去除填充
    if len(decrypted) >= 4:
        pad_len = decrypted[-1]
        if pad_len <= 4:
            decrypted = decrypted[:-pad_len]
    return decrypted

# 修改原有加密解密函数
def encryptWithSign(sign, key, data):
    sign_bytes = sign.encode() if isinstance(sign, str) else sign
    key_bytes = key.encode() if isinstance(key, str) else key
    encrypted = xxtea_encrypt(data, key_bytes)
    return sign_bytes + encrypted

def decryptWithSign(sign, key, data):
    sign_bytes = sign.encode() if isinstance(sign, str) else sign
    key_bytes = key.encode() if isinstance(key, str) else key
    
    if data.startswith(sign_bytes):
        data = data[len(sign_bytes):]
    
    try:
        decrypted = xxtea_decrypt(data, key_bytes)
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