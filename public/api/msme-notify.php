<?php
/**
 * MSME application confirmation: email (ZeptoMail) or SMS (Termii).
 *
 * Called by /msme/apply/ after an application has gone into the Google Form.
 *   - The applicant gave an email address  -> one email through ZeptoMail.
 *     If that email cannot be sent and there is a phone number, an SMS instead.
 *   - "I do not have an email address"      -> one SMS through Termii.
 *
 * The message never states a date. It says the team will get back to people
 * who qualify, and links to the MSME page.
 *
 * KEYS ARE NOT IN THIS FILE OR THIS REPOSITORY. They are read from a PHP file
 * OUTSIDE the web root, by default /home/<account>/toko-notify-config.php
 * (one level above public_html). The template is
 * server/toko-notify-config.example.php in the repository. Environment
 * variables of the same names (upper case) also work. With no keys configured
 * this endpoint answers {"ok":true,"sent":false,"reason":"not_configured"}
 * and sends nothing, so the form is never affected.
 *
 * Abuse protection, because an open "send an SMS" URL costs real money:
 *   - POST + JSON only, small bodies, same-origin requests only.
 *   - Nigerian mobile numbers only; email validated.
 *   - The text is fixed. Only a first name, reduced to letters, is inserted.
 *   - One confirmation per recipient per day, a per-IP hourly limit, and a
 *     hard daily cap on emails and on SMS across the whole site.
 *
 * Written for PHP 7.4 and later.
 */

declare(strict_types=1);

// Never print PHP notices into the JSON reply (or reveal server paths).
ini_set('display_errors', '0');

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');

/* ----------------------------------------------------------------------- */
/* Configuration                                                           */
/* ----------------------------------------------------------------------- */

function toko_config(): array
{
    $defaults = [
        // ZeptoMail (https://www.zoho.com/zeptomail/) - "Send Mail token"
        'zeptomail_token'      => '',
        'zeptomail_api_url'    => 'https://api.zeptomail.com/v1.1/email',
        'mail_from_address'    => 'noreply@tokoacademy.org',
        'mail_from_name'       => 'Toko Academy',
        'mail_reply_to'        => 'info@tokoacademy.org',

        // Termii (https://termii.com) - API key and an approved Sender ID
        'termii_api_key'       => '',
        'termii_base_url'      => 'https://api.ng.termii.com',
        'termii_sender_id'     => 'TokoAcademy',
        // 'dnd' reaches numbers on Do-Not-Disturb (needs an approved sender ID);
        // 'generic' does not reach DND numbers.
        'termii_channel'       => 'dnd',

        // Links and limits
        'msme_url'             => 'https://tokoacademy.org/msme/',
        'allowed_origins'      => ['https://tokoacademy.org', 'https://www.tokoacademy.org'],
        'max_per_ip_per_hour'  => 5,
        'max_email_per_day'    => 1000,
        'max_sms_per_day'      => 300,
        'data_dir'             => '',
    ];

    $root = isset($_SERVER['DOCUMENT_ROOT']) ? rtrim((string) $_SERVER['DOCUMENT_ROOT'], '/\\') : __DIR__;
    $path = getenv('TOKO_NOTIFY_CONFIG') ?: dirname($root) . '/toko-notify-config.php';

    $file = [];
    if (is_file($path)) {
        $loaded = include $path;
        if (is_array($loaded)) {
            $file = $loaded;
        }
    }
    $cfg = array_merge($defaults, $file);

    foreach (array_keys($defaults) as $key) {
        $env = getenv(strtoupper($key));
        if ($env !== false && $env !== '' && !is_array($defaults[$key])) {
            $cfg[$key] = $env;
        }
    }
    if ($cfg['data_dir'] === '') {
        $cfg['data_dir'] = dirname($root) . '/toko-notify-data';
    }
    return $cfg;
}

function respond(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body);
    exit;
}

/* ----------------------------------------------------------------------- */
/* Small helpers                                                           */
/* ----------------------------------------------------------------------- */

/** A writable directory for counters and the log, outside the web root when possible. */
function data_dir(array $cfg): string
{
    $dir = (string) $cfg['data_dir'];
    if (!is_dir($dir)) {
        @mkdir($dir, 0700, true);
    }
    if (!is_dir($dir) || !is_writable($dir)) {
        $dir = rtrim(sys_get_temp_dir(), '/\\') . '/toko-notify-data';
        if (!is_dir($dir)) {
            @mkdir($dir, 0700, true);
        }
    }
    return $dir;
}

/**
 * Adds one to a named counter inside a time window and returns the new count,
 * or returns the current count without adding when $peek is true.
 * File-locked, so two requests at once cannot both slip under a limit.
 */
function bump(string $dir, string $name, int $windowSeconds, bool $peek = false): int
{
    $file = $dir . '/rl-' . hash('sha256', $name) . '.json';
    $fh = @fopen($file, 'c+');
    if (!$fh) {
        return 0;
    }
    flock($fh, LOCK_EX);
    $raw = stream_get_contents($fh);
    $data = json_decode($raw ?: '[]', true);
    $now = time();
    if (!is_array($data) || !isset($data['start'], $data['count']) || $now - (int) $data['start'] >= $windowSeconds) {
        $data = ['start' => $now, 'count' => 0];
    }
    if (!$peek) {
        $data['count']++;
        ftruncate($fh, 0);
        rewind($fh);
        fwrite($fh, json_encode($data));
        fflush($fh);
    }
    flock($fh, LOCK_UN);
    fclose($fh);
    return (int) $data['count'];
}

function log_line(string $dir, string $line): void
{
    @file_put_contents($dir . '/notify.log', gmdate('c') . ' ' . $line . "\n", FILE_APPEND | LOCK_EX);
}

function mask(string $s): string
{
    if (strpos($s, '@') !== false) {
        [$u, $d] = explode('@', $s, 2);
        return substr($u, 0, 2) . '***@' . $d;
    }
    return substr($s, 0, 6) . '****' . substr($s, -2);
}

/** "  amina  BELLO-musa " -> "Amina". Letters, apostrophes and hyphens only. */
function first_name(string $full): string
{
    $first = preg_split('/\s+/u', trim($full))[0] ?? '';
    $first = preg_replace("/[^\\p{L}'\\-]/u", '', $first) ?? '';
    if ($first === '') {
        return '';
    }
    if (!function_exists('mb_substr')) {
        // No mbstring on this host: plain ASCII handling is close enough for a greeting.
        return ucfirst(strtolower(substr($first, 0, 30)));
    }
    $first = mb_substr($first, 0, 30, 'UTF-8');
    return mb_strtoupper(mb_substr($first, 0, 1, 'UTF-8'), 'UTF-8') . mb_strtolower(mb_substr($first, 1, null, 'UTF-8'), 'UTF-8');
}

/** Any Nigerian mobile format -> 234XXXXXXXXXX, or '' if it is not one. */
function ng_phone(string $raw): string
{
    $p = preg_replace('/[\s\-().]/', '', $raw) ?? '';
    if (preg_match('/^\+?234([789][01]\d{8})$/', $p, $m) || preg_match('/^0([789][01]\d{8})$/', $p, $m)) {
        return '234' . $m[1];
    }
    return '';
}

/** POST JSON and return [httpStatus, decodedBody]. Works with or without the curl extension. */
function post_json(string $url, array $payload, array $headers): array
{
    $body = json_encode($payload);
    $headers = array_merge(['Content-Type: application/json', 'Accept: application/json'], $headers);

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $body,
            CURLOPT_HTTPHEADER     => $headers,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT        => 12,
        ]);
        $out = curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        if (PHP_VERSION_ID < 80000) {
            curl_close($ch); // a no-op (and deprecated) from PHP 8
        }
        return [$status, is_string($out) ? json_decode($out, true) : null];
    }

    $ctx = stream_context_create(['http' => [
        'method'        => 'POST',
        'header'        => implode("\r\n", $headers),
        'content'       => $body,
        'timeout'       => 12,
        'ignore_errors' => true,
    ]]);
    $out = @file_get_contents($url, false, $ctx);
    $respHeaders = function_exists('http_get_last_response_headers')
        ? (http_get_last_response_headers() ?? [])
        : ($http_response_header ?? []);
    $status = 0;
    if (isset($respHeaders[0]) && preg_match('/\s(\d{3})\s?/', $respHeaders[0], $m)) {
        $status = (int) $m[1];
    }
    return [$status, is_string($out) ? json_decode($out, true) : null];
}

/* ----------------------------------------------------------------------- */
/* The messages - no dates, on purpose                                     */
/* ----------------------------------------------------------------------- */

function email_content(string $name, string $msmeUrl): array
{
    $hi = $name !== '' ? "Dear {$name}," : 'Hello,';
    $h = static function (string $s): string {
        return htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
    };

    $subject = 'We have received your application - MSME Capacity Development Training';

    $text = "{$hi}\n\n"
        . "Thank you for applying for the free MSME Capacity Development Training by Toko Academy, "
        . "in partnership with GIZ under the SEPIN-SUSI Project.\n\n"
        . "Your application has been received. Our team will review every application, and if your business "
        . "qualifies we will get back to you by phone or email with the next steps.\n\n"
        . "In the meantime, see more about the programme and the other services we offer to businesses:\n"
        . "{$msmeUrl}\n\n"
        . "Questions? Call or WhatsApp +234 808 825 6055, or email info@tokoacademy.org.\n\n"
        . "Toko Academy\nSkills for Tomorrow";

    $html = '<!doctype html><html><body style="margin:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#1f2933">'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:24px 12px"><tr><td align="center">'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden">'
        . '<tr><td style="background:#2e7d32;padding:20px 28px;color:#ffffff;font-size:18px;font-weight:bold">Toko Academy</td></tr>'
        . '<tr><td style="padding:28px;font-size:15px;line-height:1.6">'
        . '<p style="margin:0 0 16px">' . $h($hi) . '</p>'
        . '<p style="margin:0 0 16px">Thank you for applying for the free <strong>MSME Capacity Development Training</strong> by Toko Academy, in partnership with GIZ under the SEPIN-SUSI Project.</p>'
        . '<p style="margin:0 0 16px">Your application has been received. Our team will review every application, and <strong>if your business qualifies, we will get back to you</strong> by phone or email with the next steps.</p>'
        . '<p style="margin:0 0 24px">In the meantime, see more about the programme and the other services we offer to businesses:</p>'
        . '<p style="margin:0 0 28px"><a href="' . $h($msmeUrl) . '" style="display:inline-block;background:#2e7d32;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:8px">See our MSME programmes</a></p>'
        . '<p style="margin:0;font-size:13px;color:#52606d">Questions? Call or WhatsApp +234 808 825 6055, or email <a href="mailto:info@tokoacademy.org" style="color:#2e7d32">info@tokoacademy.org</a>.</p>'
        . '</td></tr>'
        . '<tr><td style="padding:16px 28px;border-top:1px solid #e4e7eb;font-size:12px;color:#7b8794">Toko Academy &middot; Skills for Tomorrow &middot; Yola, Adamawa State</td></tr>'
        . '</table></td></tr></table></body></html>';

    return [$subject, $html, $text];
}

function sms_content(string $name, string $msmeUrl): string
{
    $link = preg_replace('#^https?://#', '', rtrim($msmeUrl, '/'));
    $hi = $name !== '' ? "Hi {$name}, " : 'Hello, ';
    // Kept to one SMS page (160 GSM characters) for normal-length names.
    $msg = "{$hi}thanks for applying for Toko Academy's free MSME training. If you qualify, we will contact you. More: {$link}";
    if (strlen($msg) > 160) {
        $msg = "Thanks for applying for Toko Academy's free MSME training. If you qualify, we will contact you. More: {$link}";
    }
    return $msg;
}

/* ----------------------------------------------------------------------- */
/* Senders                                                                 */
/* ----------------------------------------------------------------------- */

function send_email(array $cfg, string $to, string $name): bool
{
    [$subject, $html, $text] = email_content($name, (string) $cfg['msme_url']);
    $token = trim((string) $cfg['zeptomail_token']);
    if (stripos($token, 'Zoho-enczapikey') !== 0) {
        $token = 'Zoho-enczapikey ' . $token;
    }
    $payload = [
        'from'     => ['address' => $cfg['mail_from_address'], 'name' => $cfg['mail_from_name']],
        'to'       => [['email_address' => ['address' => $to, 'name' => $name !== '' ? $name : $to]]],
        'reply_to' => [['address' => $cfg['mail_reply_to'], 'name' => $cfg['mail_from_name']]],
        'subject'  => $subject,
        'htmlbody' => $html,
        'textbody' => $text,
    ];
    [$status] = post_json((string) $cfg['zeptomail_api_url'], $payload, ['Authorization: ' . $token]);
    return $status >= 200 && $status < 300;
}

function send_sms(array $cfg, string $to, string $name): bool
{
    $payload = [
        'api_key' => $cfg['termii_api_key'],
        'to'      => $to,
        'from'    => $cfg['termii_sender_id'],
        'sms'     => sms_content($name, (string) $cfg['msme_url']),
        'type'    => 'plain',
        'channel' => $cfg['termii_channel'],
    ];
    [$status, $res] = post_json(rtrim((string) $cfg['termii_base_url'], '/') . '/api/sms/send', $payload, []);
    $ok = is_array($res) && (isset($res['message_id']) || (isset($res['code']) && strtolower((string) $res['code']) === 'ok'));
    return $status >= 200 && $status < 300 && $ok;
}

/* ----------------------------------------------------------------------- */
/* Request                                                                 */
/* ----------------------------------------------------------------------- */

$cfg = toko_config();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, ['ok' => false, 'error' => 'method_not_allowed']);
}

// Same-origin only: the browser always sends Origin on a POST from the page.
$origin = rtrim((string) ($_SERVER['HTTP_ORIGIN'] ?? ''), '/');
$allowed = is_array($cfg['allowed_origins']) ? $cfg['allowed_origins'] : [$cfg['allowed_origins']];
if ($origin === '' || !in_array($origin, $allowed, true)) {
    respond(403, ['ok' => false, 'error' => 'forbidden']);
}

$raw = file_get_contents('php://input', false, null, 0, 4096);
$in = json_decode($raw ?: '', true);
if (!is_array($in)) {
    respond(400, ['ok' => false, 'error' => 'bad_request']);
}

// Spam trap: the page never fills this.
if (!empty($in['website'])) {
    respond(200, ['ok' => true, 'sent' => false]);
}

$name = first_name(is_string($in['name'] ?? null) ? $in['name'] : '');
$emailRaw = is_string($in['email'] ?? null) ? trim($in['email']) : '';
$email = (strlen($emailRaw) <= 120 && filter_var($emailRaw, FILTER_VALIDATE_EMAIL)) ? strtolower($emailRaw) : '';
$phone = ng_phone(is_string($in['phone'] ?? null) ? $in['phone'] : '');

if ($email === '' && $phone === '') {
    respond(400, ['ok' => false, 'error' => 'no_valid_contact']);
}

$hasEmail = trim((string) $cfg['zeptomail_token']) !== '';
$hasSms = trim((string) $cfg['termii_api_key']) !== '';
if (!$hasEmail && !$hasSms) {
    respond(200, ['ok' => true, 'sent' => false, 'reason' => 'not_configured']);
}

$dir = data_dir($cfg);
$ip = (string) ($_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown');

if (bump($dir, 'ip:' . $ip, 3600) > (int) $cfg['max_per_ip_per_hour']) {
    respond(429, ['ok' => false, 'error' => 'rate_limited']);
}

// One confirmation per person per day, whichever way it goes.
$who = $email !== '' ? 'to:' . $email : 'to:' . $phone;
if (bump($dir, $who, 86400) > 1) {
    respond(200, ['ok' => true, 'sent' => false, 'reason' => 'already_sent']);
}

$channel = null;
$sent = false;

if ($email !== '' && $hasEmail && bump($dir, 'cap:email', 86400, true) < (int) $cfg['max_email_per_day']) {
    bump($dir, 'cap:email', 86400);
    $sent = send_email($cfg, $email, $name);
    $channel = 'email';
    log_line($dir, 'email ' . ($sent ? 'sent' : 'FAILED') . ' ' . mask($email));
}

// No email address, or the email could not be sent: SMS.
if (!$sent && $phone !== '' && $hasSms && bump($dir, 'cap:sms', 86400, true) < (int) $cfg['max_sms_per_day']) {
    bump($dir, 'cap:sms', 86400);
    $sent = send_sms($cfg, $phone, $name);
    $channel = 'sms';
    log_line($dir, 'sms ' . ($sent ? 'sent' : 'FAILED') . ' ' . mask($phone));
}

respond(200, ['ok' => true, 'sent' => $sent, 'channel' => $channel]);
