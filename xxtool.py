import argparse
import struct

XXTEA_DELTA = 0x9E3779B9

def _to_long_array(data, include_length=False):
    """将字节数组转换为32位整数数组，可选是否包含长度"""
    n = len(data) >> 2
    n = n + 1 if len(data) & 3 else n
    
    if include_length:
        result = [0] * (n + 1)
        result[n] = len(data)
        ret_len = n + 1
    else:
        result = [0] * n
        ret_len = n
    
    for i in range(len(data)):
        result[i >> 2] |= (data[i] << ((i & 3) << 3)) & 0xFFFFFFFF
    
    return result, ret_len

def _to_byte_array(data, include_length=False):
    """将32位整数数组转换回字节数组，可选是否包含长度"""
    n = len(data) << 2
    
    if include_length:
        m = data[len(data) - 1]
        if m < n - 7 or m > n - 4:
            return None, 0
        n = m
    
    result = bytearray(n)
    for i in range(n):
        result[i] = (data[i >> 2] >> ((i & 3) << 3)) & 0xFF
    
    return result, n

def _fix_key(key):
    """调整密钥长度为16字节"""
    if len(key) < 16:
        return key + b'\0' * (16 - len(key))
    return key[:16]

def _xxtea_encrypt_long(v, k):
    """对32位整数数组进行加密"""
    n = len(v) - 1
    if n < 1:
        return
    
    z = v[n]
    y = v[0]
    q = 6 + 52 // (n + 1)
    sum_val = 0
    
    while q > 0:
        sum_val = (sum_val + XXTEA_DELTA) & 0xFFFFFFFF
        e = (sum_val >> 2) & 3
        
        for p in range(n):
            y = v[p + 1]
            mx = ((z >> 5 ^ y << 2) + (y >> 3 ^ z << 4)) ^ ((sum_val ^ y) + (k[(p & 3) ^ e] ^ z))
            v[p] = (v[p] + mx) & 0xFFFFFFFF
            z = v[p]
        
        y = v[0]
        mx = ((z >> 5 ^ y << 2) + (y >> 3 ^ z << 4)) ^ ((sum_val ^ y) + (k[(n & 3) ^ e] ^ z))
        v[n] = (v[n] + mx) & 0xFFFFFFFF
        z = v[n]
        
        q -= 1

def _xxtea_decrypt_long(v, k):
    """对32位整数数组进行解密"""
    n = len(v) - 1
    if n < 1:
        return
    
    z = v[n]
    y = v[0]
    q = 6 + 52 // (n + 1)
    sum_val = (q * XXTEA_DELTA) & 0xFFFFFFFF
    
    while sum_val != 0:
        e = (sum_val >> 2) & 3
        
        for p in range(n, 0, -1):
            z = v[p - 1]
            mx = ((z >> 5 ^ y << 2) + (y >> 3 ^ z << 4)) ^ ((sum_val ^ y) + (k[(p & 3) ^ e] ^ z))
            v[p] = (v[p] - mx) & 0xFFFFFFFF
            y = v[p]
        
        z = v[n]
        mx = ((z >> 5 ^ y << 2) + (y >> 3 ^ z << 4)) ^ ((sum_val ^ y) + (k[(0 & 3) ^ e] ^ z))
        v[0] = (v[0] - mx) & 0xFFFFFFFF
        y = v[0]
        
        sum_val = (sum_val - XXTEA_DELTA) & 0xFFFFFFFF

def xxtea_encrypt(data, key):
    """
    使用XXTEA算法加密数据
    @param data: 要加密的字节数据
    @param key: 密钥（会自动调整为16字节）
    @return: 加密后的字节数据
    """
    if not data:
        return b""
    
    key = _fix_key(key)
    
    # 将输入数据转为长整数数组，包含长度信息
    v, v_len = _to_long_array(data, include_length=True)
    # 将密钥转为长整数数组
    k, k_len = _to_long_array(key, include_length=False)
    
    # 加密长整数数组
    _xxtea_encrypt_long(v, k)
    
    # 将长整数数组转回字节数组，不包含长度信息
    result, ret_len = _to_byte_array(v, include_length=False)
    
    return bytes(result)

def xxtea_decrypt(data, key):
    """
    使用XXTEA算法解密数据
    @param data: 要解密的字节数据
    @param key: 密钥（会自动调整为16字节）
    @return: 解密后的字节数据
    """
    if not data:
        return b""
    
    key = _fix_key(key)
    
    # 将输入数据转为长整数数组，不包含长度信息
    v, v_len = _to_long_array(data, include_length=False)
    # 将密钥转为长整数数组
    k, k_len = _to_long_array(key, include_length=False)
    
    # 解密长整数数组
    _xxtea_decrypt_long(v, k)
    
    # 将长整数数组转回字节数组，包含长度信息
    result, ret_len = _to_byte_array(v, include_length=True)
    if result is None:
        return b""
    
    return bytes(result)

# 修改原有加密解密函数
def encryptWithSign(sign, key, data):
    sign_bytes = sign.encode() if isinstance(sign, str) else sign
    key_bytes = key.encode() if isinstance(key, str) else key
    encrypted = xxtea_encrypt(data, key_bytes)
    return sign_bytes + encrypted

def decryptWithSign(sign, key, data):
    print(f"解密: {sign} {key} dataLen:{len(data)}")
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
    parser.add_argument('-o', '--output', help='输出文件名', default='')
    
    args = parser.parse_args()
    
    
    try:
        with open(args.file, 'rb') as f:
            file_data = f.read()
        encrypted_data = None
        decrypted_data = None
        print(f"文件名: {args.file} size:{len(file_data)}")
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
        if args.output:
            output_file = args.output
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