<?php
/**
 * Keys for /api/msme-notify.php (MSME application confirmations).
 *
 * HOW TO USE
 *   1. Copy this file to the server, ONE LEVEL ABOVE public_html, named:
 *        /home/tokoacademy/toko-notify-config.php
 *      It must NOT be inside public_html, and it must never be committed.
 *   2. Fill in the two keys below. Leave one empty to switch that channel off.
 *   3. chmod 600 toko-notify-config.php
 *
 * Nothing else needs changing: the next application sends its confirmation.
 * With both keys empty the endpoint sends nothing and the form still works.
 */

return [
    // ZeptoMail: Mail Agents -> your agent -> SMTP/API -> "Send Mail token".
    // Paste it with or without the "Zoho-enczapikey " prefix.
    'zeptomail_token'   => '',
    // The sender address must be on a domain verified in ZeptoMail.
    'mail_from_address' => 'noreply@tokoacademy.org',
    'mail_from_name'    => 'Toko Academy',
    'mail_reply_to'     => 'info@tokoacademy.org',
    // EU / India data centres use api.zeptomail.eu / api.zeptomail.in.
    // 'zeptomail_api_url' => 'https://api.zeptomail.com/v1.1/email',

    // Termii: Dashboard -> API key. Sender ID must be approved in Termii.
    'termii_api_key'    => '',
    'termii_sender_id'  => 'TokoAcademy',
    // Your account's base URL is shown on the Termii dashboard.
    'termii_base_url'   => 'https://api.ng.termii.com',
    // 'dnd' also reaches numbers on Do-Not-Disturb (needs approved sender ID).
    'termii_channel'    => 'dnd',
];
