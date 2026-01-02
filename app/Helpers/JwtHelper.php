<?php

namespace App\Helpers;

class JwtHelper
{
    private static $secret_key = 'YOUR_SECRET_KEY_HERE_CHANGE_IN_PROD'; // In prod, use env var
    private static $algorithm = 'HS256';

    public static function encode(array $payload)
    {
        $header = json_encode(['typ' => 'JWT', 'alg' => self::$algorithm]);
        $payload['iat'] = time();
        $payload['exp'] = time() + (60 * 60 * 24); // 24 hours expiry
        $payload = json_encode($payload);

        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode($payload);

        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, self::$secret_key, true);
        $base64UrlSignature = self::base64UrlEncode($signature);

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    public static function decode($token)
    {
        $tokenParts = explode('.', $token);
        if (count($tokenParts) != 3) {
            return false;
        }

        $header = base64_decode($tokenParts[0]);
        $payload = base64_decode($tokenParts[1]);
        $signature_provided = $tokenParts[2];

        // Check verification
        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode($payload);
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, self::$secret_key, true);
        $base64UrlSignature = self::base64UrlEncode($signature);

        if ($base64UrlSignature === $signature_provided) {
            $data = json_decode($payload, true);
            if ($data['exp'] < time()) {
                return false; // Expired
            }
            return $data;
        }

        return false;
    }

    private static function base64UrlEncode($data)
    {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
    }
}
