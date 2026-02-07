<?php

namespace App\Helpers;

use App\Models\Setting;

class NotificationHelper
{
    /**
     * Send email notification
     */
    public static function sendEmail($to, $subject, $body)
    {
        $settings = self::getEmailSettings();

        if (empty($settings['smtp_host']) || empty($to)) {
            return ['success' => false, 'message' => 'إعدادات البريد غير مكتملة'];
        }

        try {
            // Use PHP mail() as a fallback, or SMTP if configured
            if (!empty($settings['smtp_host'])) {
                return self::sendViaSMTP($to, $subject, $body, $settings);
            } else {
                // Fallback to PHP mail()
                $headers = "From: " . ($settings['smtp_from'] ?? 'noreply@petrodiesel.com') . "\r\n";
                $headers .= "Content-Type: text/html; charset=UTF-8\r\n";

                if (mail($to, $subject, $body, $headers)) {
                    return ['success' => true, 'message' => 'تم إرسال البريد بنجاح'];
                } else {
                    return ['success' => false, 'message' => 'فشل إرسال البريد'];
                }
            }
        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'خطأ: ' . $e->getMessage()];
        }
    }

    /**
     * Send via SMTP
     */
    private static function sendViaSMTP($to, $subject, $body, $settings)
    {
        // Using PHPMailer-style socket connection
        $host = $settings['smtp_host'];
        $port = $settings['smtp_port'] ?? 587;
        $username = $settings['smtp_username'] ?? '';
        $password = $settings['smtp_password'] ?? '';
        $from = $settings['smtp_from'] ?? 'noreply@petrodiesel.com';

        // For production, consider using PHPMailer or SwiftMailer
        // This is a basic implementation
        $headers = [
            "From: {$from}",
            "Reply-To: {$from}",
            "Content-Type: text/html; charset=UTF-8",
            "MIME-Version: 1.0"
        ];

        $success = mail($to, "=?UTF-8?B?" . base64_encode($subject) . "?=", $body, implode("\r\n", $headers));

        return [
            'success' => $success,
            'message' => $success ? 'تم إرسال البريد بنجاح' : 'فشل إرسال البريد'
        ];
    }

    /**
     * Send WhatsApp notification
     */
    public static function sendWhatsApp($phone, $message)
    {
        $settings = self::getWhatsAppSettings();

        if (empty($settings['whatsapp_api_key']) || empty($phone)) {
            return ['success' => false, 'message' => 'إعدادات واتساب غير مكتملة'];
        }

        try {
            $provider = $settings['whatsapp_provider'] ?? 'ultramsg';

            switch ($provider) {
                case 'ultramsg':
                    return self::sendViaUltraMsg($phone, $message, $settings);
                case 'twilio':
                    return self::sendViaTwilio($phone, $message, $settings);
                default:
                    return self::sendViaGenericAPI($phone, $message, $settings);
            }
        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'خطأ: ' . $e->getMessage()];
        }
    }

    /**
     * Send via UltraMsg API
     */
    private static function sendViaUltraMsg($phone, $message, $settings)
    {
        $instanceId = $settings['whatsapp_instance_id'] ?? '';
        $token = $settings['whatsapp_api_key'];

        $url = "https://api.ultramsg.com/{$instanceId}/messages/chat";

        $params = [
            'token' => $token,
            'to' => $phone,
            'body' => $message
        ];

        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => http_build_query($params)
        ]);

        $response = curl_exec($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);

        $result = json_decode($response, true);

        if ($httpCode == 200 && isset($result['sent']) && $result['sent'] === 'true') {
            return ['success' => true, 'message' => 'تم إرسال واتساب بنجاح'];
        } else {
            return ['success' => false, 'message' => 'فشل إرسال واتساب: ' . ($result['message'] ?? 'Unknown error')];
        }
    }

    /**
     * Send via Twilio WhatsApp API
     */
    private static function sendViaTwilio($phone, $message, $settings)
    {
        $sid = $settings['whatsapp_instance_id'] ?? '';
        $token = $settings['whatsapp_api_key'];
        $fromNumber = $settings['whatsapp_from_number'] ?? '';

        $url = "https://api.twilio.com/2010-04-01/Accounts/{$sid}/Messages.json";

        $params = [
            'From' => "whatsapp:{$fromNumber}",
            'To' => "whatsapp:{$phone}",
            'Body' => $message
        ];

        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => http_build_query($params),
            CURLOPT_USERPWD => "{$sid}:{$token}"
        ]);

        $response = curl_exec($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);

        if ($httpCode == 201 || $httpCode == 200) {
            return ['success' => true, 'message' => 'تم إرسال واتساب بنجاح'];
        } else {
            return ['success' => false, 'message' => 'فشل إرسال واتساب Twilio'];
        }
    }

    /**
     * Generic API fallback
     */
    private static function sendViaGenericAPI($phone, $message, $settings)
    {
        // Placeholder for custom API integration
        return ['success' => false, 'message' => 'مزود الخدمة غير مدعوم'];
    }

    /**
     * Notify about backup status
     */
    public static function notifyBackupStatus($status, $details = '')
    {
        $settings = self::getNotificationSettings();
        $results = [];

        $statusAr = $status === 'success' ? 'ناجح ✅' : 'فشل ❌';
        $subject = "تنبيه النسخ الاحتياطي - {$statusAr}";
        $message = "حالة النسخ الاحتياطي: {$statusAr}\n";
        $message .= "التاريخ: " . date('Y-m-d H:i:s') . "\n";
        if ($details) {
            $message .= "التفاصيل: {$details}\n";
        }

        // Send Email if configured
        if (!empty($settings['notification_email'])) {
            $htmlBody = nl2br($message);
            $results['email'] = self::sendEmail($settings['notification_email'], $subject, $htmlBody);
        }

        // Send WhatsApp if configured
        if (!empty($settings['notification_phone'])) {
            $results['whatsapp'] = self::sendWhatsApp($settings['notification_phone'], $message);
        }

        return $results;
    }

    /**
     * Get email settings from database
     */
    private static function getEmailSettings()
    {
        $settingModel = new Setting();
        return [
            'smtp_host' => $settingModel->get('smtp_host'),
            'smtp_port' => $settingModel->get('smtp_port') ?: 587,
            'smtp_username' => $settingModel->get('smtp_username'),
            'smtp_password' => $settingModel->get('smtp_password'),
            'smtp_from' => $settingModel->get('smtp_from')
        ];
    }

    /**
     * Get WhatsApp settings from database
     */
    private static function getWhatsAppSettings()
    {
        $settingModel = new Setting();
        return [
            'whatsapp_provider' => $settingModel->get('whatsapp_provider') ?: 'ultramsg',
            'whatsapp_api_key' => $settingModel->get('whatsapp_api_key'),
            'whatsapp_instance_id' => $settingModel->get('whatsapp_instance_id'),
            'whatsapp_from_number' => $settingModel->get('whatsapp_from_number')
        ];
    }

    /**
     * Get notification recipient settings
     */
    private static function getNotificationSettings()
    {
        $settingModel = new Setting();
        return [
            'notification_email' => $settingModel->get('notification_email'),
            'notification_phone' => $settingModel->get('notification_phone')
        ];
    }
}
