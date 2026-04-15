/**
 * ============================================
 * 数据加密模块 - 游导旅游平台
 * ============================================
 * 敏感数据加密、传输加密、存储加密解决方案
 */

(function() {
  'use strict';

  // ============================================
  // 加密配置
  // ============================================
  const CryptoConfig = {
    // 加密算法
    algorithms: {
      aes: 'AES-GCM',
      rsa: 'RSA-OAEP',
      hash: 'SHA-256'
    },
    
    // 密钥长度
    keyLength: 256,
    ivLength: 12,
    saltLength: 16,
    tagLength: 128,
    
    // 存储键名前缀
    storagePrefix: 'yd_secure_',
    
    // 加密数据过期时间（毫秒）
    expiryTime: 30 * 60 * 1000 // 30分钟
  };

  // ============================================
  // 工具函数
  // ============================================
  
  /**
   * 将字符串转换为ArrayBuffer
   */
  function stringToBuffer(str) {
    return new TextEncoder().encode(str);
  }

  /**
   * 将ArrayBuffer转换为字符串
   */
  function bufferToString(buffer) {
    return new TextDecoder().decode(buffer);
  }

  /**
   * 将ArrayBuffer转换为Base64
   */
  function bufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach(b => binary += String.fromCharCode(b));
    return btoa(binary);
  }

  /**
   * 将Base64转换为ArrayBuffer
   */
  function base64ToBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * 将ArrayBuffer转换为十六进制字符串
   */
  function bufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * 生成随机字节
   */
  function getRandomBytes(length) {
    return crypto.getRandomValues(new Uint8Array(length));
  }

  // ============================================
  // 密钥管理
  // ============================================
  
  /**
   * 密钥管理器
   */
  const KeyManager = {
    // 内存中的密钥缓存
    _keyCache: new Map(),
    
    /**
     * 生成对称加密密钥
     */
    async generateKey() {
      return await crypto.subtle.generateKey(
        { name: CryptoConfig.algorithms.aes, length: CryptoConfig.keyLength },
        true,
        ['encrypt', 'decrypt']
      );
    },
    
    /**
     * 从密码派生密钥
     */
    async deriveKey(password, salt) {
      const passwordBuffer = stringToBuffer(password);
      
      // 导入密码为原始密钥材料
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        'PBKDF2',
        false,
        ['deriveKey']
      );
      
      // 派生AES密钥
      return await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: CryptoConfig.algorithms.hash
        },
        keyMaterial,
        { name: CryptoConfig.algorithms.aes, length: CryptoConfig.keyLength },
        true,
        ['encrypt', 'decrypt']
      );
    },
    
    /**
     * 生成盐值
     */
    generateSalt() {
      return getRandomBytes(CryptoConfig.saltLength);
    },
    
    /**
     * 导出密钥为可存储格式
     */
    async exportKey(key) {
      const exported = await crypto.subtle.exportKey('raw', key);
      return bufferToBase64(exported);
    },
    
    /**
     * 导入密钥
     */
    async importKey(keyData) {
      const buffer = base64ToBuffer(keyData);
      return await crypto.subtle.importKey(
        'raw',
        buffer,
        { name: CryptoConfig.algorithms.aes, length: CryptoConfig.keyLength },
        true,
        ['encrypt', 'decrypt']
      );
    },
    
    /**
     * 缓存密钥到内存
     */
    cacheKey(keyId, key) {
      this._keyCache.set(keyId, {
        key,
        timestamp: Date.now()
      });
    },
    
    /**
     * 从缓存获取密钥
     */
    getCachedKey(keyId) {
      const cached = this._keyCache.get(keyId);
      if (cached) {
        // 检查是否过期
        if (Date.now() - cached.timestamp < CryptoConfig.expiryTime) {
          return cached.key;
        }
        this._keyCache.delete(keyId);
      }
      return null;
    },
    
    /**
     * 清除密钥缓存
     */
    clearCache() {
      this._keyCache.clear();
    }
  };

  // ============================================
  // 对称加密（AES-GCM）
  // ============================================
  
  /**
   * AES-GCM加密
   * @param {string} plaintext - 明文
   * @param {CryptoKey} key - 密钥
   * @returns {string} 加密后的Base64字符串（包含IV）
   */
  async function encryptAES(plaintext, key) {
    const iv = getRandomBytes(CryptoConfig.ivLength);
    const plaintextBuffer = stringToBuffer(plaintext);
    
    const ciphertext = await crypto.subtle.encrypt(
      {
        name: CryptoConfig.algorithms.aes,
        iv: iv,
        tagLength: CryptoConfig.tagLength
      },
      key,
      plaintextBuffer
    );
    
    // 合并IV和密文
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(ciphertext), iv.length);
    
    return bufferToBase64(combined.buffer);
  }

  /**
   * AES-GCM解密
   * @param {string} encryptedData - 加密数据（Base64）
   * @param {CryptoKey} key - 密钥
   * @returns {string} 解密后的明文
   */
  async function decryptAES(encryptedData, key) {
    const combined = new Uint8Array(base64ToBuffer(encryptedData));
    
    // 分离IV和密文
    const iv = combined.slice(0, CryptoConfig.ivLength);
    const ciphertext = combined.slice(CryptoConfig.ivLength);
    
    const plaintext = await crypto.subtle.decrypt(
      {
        name: CryptoConfig.algorithms.aes,
        iv: iv,
        tagLength: CryptoConfig.tagLength
      },
      key,
      ciphertext
    );
    
    return bufferToString(plaintext);
  }

  // ============================================
  // 哈希计算
  // ============================================
  
  /**
   * 计算SHA-256哈希
   */
  async function hashSHA256(data) {
    const buffer = stringToBuffer(data);
    const hash = await crypto.subtle.digest(CryptoConfig.algorithms.hash, buffer);
    return bufferToHex(hash);
  }

  /**
   * 计算HMAC
   */
  async function hmacSHA256(data, key) {
    const keyData = stringToBuffer(key);
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: CryptoConfig.algorithms.hash },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      stringToBuffer(data)
    );
    
    return bufferToHex(signature);
  }

  // ============================================
  // 敏感数据处理
  // ============================================
  
  /**
   * 加密对象中的敏感字段
   * @param {Object} obj - 原始对象
   * @param {Array<string>} sensitiveFields - 敏感字段名数组
   * @param {CryptoKey} key - 加密密钥
   */
  async function encryptSensitiveFields(obj, sensitiveFields, key) {
    const result = { ...obj };
    
    for (const field of sensitiveFields) {
      if (result[field]) {
        result[field] = await encryptAES(String(result[field]), key);
      }
    }
    
    return result;
  }

  /**
   * 解密对象中的敏感字段
   * @param {Object} obj - 加密对象
   * @param {Array<string>} sensitiveFields - 敏感字段名数组
   * @param {CryptoKey} key - 解密密钥
   */
  async function decryptSensitiveFields(obj, sensitiveFields, key) {
    const result = { ...obj };
    
    for (const field of sensitiveFields) {
      if (result[field] && typeof result[field] === 'string') {
        try {
          result[field] = await decryptAES(result[field], key);
        } catch (e) {
          console.error(`Failed to decrypt field ${field}:`, e);
        }
      }
    }
    
    return result;
  }

  // ============================================
  // 本地存储加密
  // ============================================
  
  /**
   * 安全存储接口
   */
  const SecureStorage = {
    /**
     * 安全存储数据
     */
    async set(key, value, keyId = 'default') {
      try {
        // 获取或生成密钥
        let keyObj = KeyManager.getCachedKey(keyId);
        if (!keyObj) {
          keyObj = await KeyManager.generateKey();
          KeyManager.cacheKey(keyId, keyObj);
        }
        
        // 加密数据
        const encrypted = await encryptAES(JSON.stringify(value), keyObj);
        
        // 存储加密数据
        const storageKey = CryptoConfig.storagePrefix + key;
        localStorage.setItem(storageKey, encrypted);
        
        return true;
      } catch (e) {
        console.error('SecureStorage.set failed:', e);
        return false;
      }
    },
    
    /**
     * 安全获取数据
     */
    async get(key, keyId = 'default') {
      try {
        const storageKey = CryptoConfig.storagePrefix + key;
        const encrypted = localStorage.getItem(storageKey);
        
        if (!encrypted) return null;
        
        // 获取密钥
        let keyObj = KeyManager.getCachedKey(keyId);
        if (!keyObj) {
          keyObj = await KeyManager.generateKey();
          KeyManager.cacheKey(keyId, keyObj);
        }
        
        // 解密数据
        const decrypted = await decryptAES(encrypted, keyObj);
        return JSON.parse(decrypted);
      } catch (e) {
        console.error('SecureStorage.get failed:', e);
        return null;
      }
    },
    
    /**
     * 移除数据
     */
    remove(key) {
      const storageKey = CryptoConfig.storagePrefix + key;
      localStorage.removeItem(storageKey);
    },
    
    /**
     * 清除所有安全存储
     */
    clear() {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CryptoConfig.storagePrefix)) {
          localStorage.removeItem(key);
        }
      });
      KeyManager.clearCache();
    }
  };

  // ============================================
  // 密码处理
  // ============================================
  
  /**
   * 安全密码哈希（用于客户端验证）
   * 注意：实际验证应在服务端进行
   */
  async function hashPassword(password) {
    const salt = bufferToBase64(getRandomBytes(CryptoConfig.saltLength));
    const hash = await hmacSHA256(password, salt);
    return `${salt}:${hash}`;
  }
  
  /**
   * 验证密码
   */
  async function verifyPassword(password, storedHash) {
    const [salt, hash] = storedHash.split(':');
    const verifyHash = await hmacSHA256(password, salt);
    return hash === verifyHash;
  }

  // ============================================
  // 安全Token生成
  // ============================================
  
  /**
   * 生成安全的随机Token
   */
  function generateToken(length = 32) {
    const bytes = getRandomBytes(length);
    return bufferToBase64(bytes.buffer)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  // ============================================
  // 传输加密辅助
  // ============================================
  
  /**
   * 安全发送数据（自动加密敏感字段）
   */
  async function secureFetch(url, options = {}) {
    const sensitiveFields = options.sensitiveFields || ['password', 'token', 'cardNumber', 'idCard'];
    
    // 复制并处理请求数据
    if (options.body && typeof options.body === 'object') {
      const key = await KeyManager.generateKey();
      options.body = await encryptSensitiveFields(options.body, sensitiveFields, key);
      
      // 将密钥附加到请求头
      const exportedKey = await KeyManager.exportKey(key);
      options.headers = {
        ...options.headers,
        'X-Encryption-Key': exportedKey
      };
    }
    
    return fetch(url, options);
  }

  // ============================================
  // 导出API
  // ============================================
  
  window.SecurityCrypto = {
    // 配置
    config: CryptoConfig,
    
    // 加密/解密
    encrypt: encryptAES,
    decrypt: decryptAES,
    
    // 哈希
    hash: hashSHA256,
    hmac: hmacSHA256,
    
    // 密钥管理
    keys: KeyManager,
    
    // 敏感数据处理
    encryptFields: encryptSensitiveFields,
    decryptFields: decryptSensitiveFields,
    
    // 安全存储
    storage: SecureStorage,
    
    // 密码处理
    hashPassword,
    verifyPassword,
    
    // Token生成
    generateToken,
    
    // 工具函数
    utils: {
      toBase64: bufferToBase64,
      fromBase64: base64ToBuffer,
      toHex: bufferToHex
    },
    
    // 传输加密
    secureFetch
  };

})();
