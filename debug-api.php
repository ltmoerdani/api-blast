<?php
/**
 * WhatsApp QR Code Debug Tool - Server Side
 * Testing API untuk generate QR code
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

// Konfigurasi
$API_BASE_URL = 'https://api-blast.myarchery.id';
$DEFAULT_ACCESS_TOKEN = ''; // Isi dengan token yang valid
$DEFAULT_INSTANCE_ID = '675AAEEF1ED2D';

function makeApiRequest($endpoint, $params = [], $method = 'GET') {
    global $API_BASE_URL;
    
    $url = $API_BASE_URL . $endpoint;
    if (!empty($params)) {
        $url .= '?' . http_build_query($params);
    }
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        return [
            'status' => 'error',
            'message' => 'CURL Error: ' . $error,
            'http_code' => 0
        ];
    }
    
    $data = json_decode($response, true);
    $data['http_code'] = $httpCode;
    
    return $data;
}

// Handle API requests
if ($_SERVER['REQUEST_METHOD'] === 'GET' || $_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_GET['action'] ?? '';
    $access_token = $_GET['access_token'] ?? $DEFAULT_ACCESS_TOKEN;
    $instance_id = $_GET['instance_id'] ?? $DEFAULT_INSTANCE_ID;
    
    if (empty($access_token) || empty($instance_id)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'access_token dan instance_id harus diisi'
        ]);
        exit;
    }
    
    $params = [
        'access_token' => $access_token,
        'instance_id' => $instance_id
    ];
    
    switch ($action) {
        case 'debug':
            $result = makeApiRequest('/debug_qr_status', $params);
            break;
            
        case 'qrcode':
            $result = makeApiRequest('/get_qrcode', $params);
            break;
            
        case 'info':
            $result = makeApiRequest('/instance', $params);
            break;
            
        case 'reset':
            $result = makeApiRequest('/reset_session', $params, 'POST');
            break;
            
        case 'test_all':
            // Test semua endpoint
            $results = [];
            
            echo json_encode([
                'status' => 'info',
                'message' => 'Testing all endpoints...',
                'timestamp' => date('Y-m-d H:i:s')
            ]);
            
            // Test 1: Debug Status
            $results['debug'] = makeApiRequest('/debug_qr_status', $params);
            
            // Test 2: Instance Info
            $results['info'] = makeApiRequest('/instance', $params);
            
            // Test 3: QR Code (jika belum login)
            if (isset($results['debug']['debug_info']) && 
                $results['debug']['debug_info']['user_info'] !== 'Logged in') {
                $results['qrcode'] = makeApiRequest('/get_qrcode', $params);
            }
            
            $result = [
                'status' => 'success',
                'message' => 'Test completed',
                'results' => $results,
                'summary' => [
                    'total_tests' => count($results),
                    'successful' => count(array_filter($results, function($r) { 
                        return $r['status'] === 'success'; 
                    })),
                    'timestamp' => date('Y-m-d H:i:s')
                ]
            ];
            break;
            
        default:
            $result = [
                'status' => 'error',
                'message' => 'Action tidak valid. Gunakan: debug, qrcode, info, reset, test_all',
                'available_actions' => ['debug', 'qrcode', 'info', 'reset', 'test_all']
            ];
    }
    
    echo json_encode($result, JSON_PRETTY_PRINT);
} else {
    // Tampilkan documentation
    ?>
    <!DOCTYPE html>
    <html>
    <head>
        <title>WhatsApp API Debug Tool</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .endpoint { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; }
            .method { color: #27ae60; font-weight: bold; }
            .url { color: #2c3e50; font-family: monospace; }
        </style>
    </head>
    <body>
        <h1>WhatsApp API Debug Tool</h1>
        <p>Tool untuk debug dan testing WhatsApp API</p>
        
        <h2>Available Endpoints:</h2>
        
        <div class="endpoint">
            <div class="method">GET</div>
            <div class="url"><?php echo $_SERVER['REQUEST_URI']; ?>?action=debug&access_token=YOUR_TOKEN&instance_id=YOUR_INSTANCE</div>
            <p>Debug status session WhatsApp</p>
        </div>
        
        <div class="endpoint">
            <div class="method">GET</div>
            <div class="url"><?php echo $_SERVER['REQUEST_URI']; ?>?action=qrcode&access_token=YOUR_TOKEN&instance_id=YOUR_INSTANCE</div>
            <p>Generate QR code untuk login WhatsApp</p>
        </div>
        
        <div class="endpoint">
            <div class="method">GET</div>
            <div class="url"><?php echo $_SERVER['REQUEST_URI']; ?>?action=info&access_token=YOUR_TOKEN&instance_id=YOUR_INSTANCE</div>
            <p>Get informasi account WhatsApp yang sudah login</p>
        </div>
        
        <div class="endpoint">
            <div class="method">POST</div>
            <div class="url"><?php echo $_SERVER['REQUEST_URI']; ?>?action=reset&access_token=YOUR_TOKEN&instance_id=YOUR_INSTANCE</div>
            <p>Reset session WhatsApp</p>
        </div>
        
        <div class="endpoint">
            <div class="method">GET</div>
            <div class="url"><?php echo $_SERVER['REQUEST_URI']; ?>?action=test_all&access_token=YOUR_TOKEN&instance_id=YOUR_INSTANCE</div>
            <p>Test semua endpoint sekaligus</p>
        </div>
        
        <h2>Example Usage:</h2>
        <pre>
curl "<?php echo $_SERVER['REQUEST_URI']; ?>?action=debug&access_token=YOUR_TOKEN&instance_id=675AAEEF1ED2D"
        </pre>
        
        <p><strong>Note:</strong> Ganti YOUR_TOKEN dengan access token yang valid</p>
    </body>
    </html>
    <?php
}
?>
