<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'google' => [
        'sheets' => [
            'credentials' => env('GOOGLE_SHEETS_CREDENTIALS', storage_path('app/google/service-account.json')),
            'spreadsheet_id' => env('GOOGLE_SHEETS_SPREADSHEET_ID'),
            'share_with' => array_filter(explode(',', env('GOOGLE_SHEETS_SHARE_WITH', ''))),
            'report_exports' => [
                'spreadsheet_id' => env('GOOGLE_SHEETS_REPORT_EXPORT_SPREADSHEET_ID'),
                'share_with' => array_filter(explode(',', env('GOOGLE_SHEETS_REPORT_EXPORT_SHARE_WITH', ''))),
            ],
        ],
    ],

];

if (empty($spreadsheetId)) {
    throw new \Exception('spreadsheetId is required');
}
