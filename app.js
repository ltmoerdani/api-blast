const WAZIPER = require("./waziper/waziper.js");
const path = require('path');

// Route untuk debug tool HTML
WAZIPER.app.get('/debug-qr.html', WAZIPER.cors, (req, res) => {
    res.sendFile(path.join(__dirname, 'debug-tools', 'debug-qr.html'));
});

// Route untuk debug tool page
WAZIPER.app.get('/debug', WAZIPER.cors, (req, res) => {
    res.sendFile(path.join(__dirname, 'debug-tools', 'debug-qr.html'));
});

// Route untuk development debug tool (license bypassed)
WAZIPER.app.get('/debug-dev', WAZIPER.cors, (req, res) => {
    res.sendFile(path.join(__dirname, 'debug-tools', 'debug-dev.html'));
});

WAZIPER.app.get('/debug-dev.html', WAZIPER.cors, (req, res) => {
    res.sendFile(path.join(__dirname, 'debug-tools', 'debug-dev.html'));
});

// Route untuk dokumentasi
WAZIPER.app.get('/docs', WAZIPER.cors, (req, res) => {
    res.sendFile(path.join(__dirname, 'docs', 'DEBUG_GUIDE.md'));
});

// Route untuk list semua tools
WAZIPER.app.get('/tools', WAZIPER.cors, (req, res) => {
    const tools = {
        status: 'success',
        message: 'Available debug tools',
        tools: [
            {
                name: 'HTML Debug Tool',
                url: '/debug-qr.html',
                description: 'Interactive web interface untuk debug QR code'
            },
            {
                name: 'Debug Tool (Short URL)',
                url: '/debug',
                description: 'Alias untuk HTML debug tool'
            },
            {
                name: 'API Documentation',
                url: '/docs',
                description: 'Dokumentasi lengkap debugging guide'
            },
            {
                name: 'QR Code Generator',
                url: '/get_qrcode?access_token=YOUR_TOKEN&instance_id=YOUR_INSTANCE',
                description: 'Direct API untuk generate QR code'
            },
            {
                name: 'Debug Status',
                url: '/debug_qr_status?access_token=YOUR_TOKEN&instance_id=YOUR_INSTANCE',
                description: 'Debug status session WhatsApp'
            },
            {
                name: 'Reset Session',
                url: '/reset_session?access_token=YOUR_TOKEN&instance_id=YOUR_INSTANCE',
                description: 'Reset session WhatsApp (POST method)'
            }
        ],
        examples: {
            instance_id: '675AAEEF1ED2D',
            base_url: 'http://localhost:8000'
        }
    };
    res.json(tools);
});

WAZIPER.app.get('/instance', WAZIPER.cors, async (req, res) => {
    var access_token = req.query.access_token;
    var instance_id = req.query.instance_id;

    await WAZIPER.instance(access_token, instance_id, false, res, async (client) => {
        await WAZIPER.get_info(instance_id, res);
    });
});

WAZIPER.app.get('/get_qrcode', WAZIPER.cors, async (req, res) => {
    var access_token = req.query.access_token;
    var instance_id = req.query.instance_id;

    await WAZIPER.instance(access_token, instance_id, true, res, async (client) => {
        await WAZIPER.get_qrcode(instance_id, res);
    });
});

WAZIPER.app.get('/get_groups', WAZIPER.cors, async (req, res) => {
    var access_token = req.query.access_token;
    var instance_id = req.query.instance_id;

    await WAZIPER.instance(access_token, instance_id, false, res, async (client) => {
        await WAZIPER.get_groups(instance_id, res);
    });
});

WAZIPER.app.get('/logout', WAZIPER.cors, async (req, res) => {
    var access_token = req.query.access_token;
    var instance_id = req.query.instance_id;
    WAZIPER.logout(instance_id, res);
});

WAZIPER.app.post('/send_message', WAZIPER.cors, async (req, res) => {
    var access_token = req.query.access_token;
    var instance_id = req.query.instance_id;

    await WAZIPER.instance(access_token, instance_id, false, res, async (client) => {
        WAZIPER.send_message(instance_id, access_token, req, res);
    });
});

WAZIPER.app.get('/', WAZIPER.cors, async (req, res) => {
    return res.json({ status: 'success', message: "Welcome to WAZIPER" });
});

WAZIPER.app.get('/debug_qr_status', WAZIPER.cors, async (req, res) => {
    const access_token = req.query.access_token;
    const instance_id = req.query.instance_id;

    await WAZIPER.instance(access_token, instance_id, false, res, async (client) => {
        if (client) {
            let qrcode_status = "Undefined";
            if (client.qrcode) {
                qrcode_status = "Present";
            } else if (client.qrcode === false) {
                qrcode_status = "Cleared (logged in)";
            }
            
            const status = {
                has_client: true,
                has_qrcode: client.qrcode !== undefined,
                qrcode_value: qrcode_status,
                user_info: client.user ? "Logged in" : "Not logged in",
                connection_state: client.ws ? client.ws.readyState : "No websocket"
            };
            return res.json({ status: 'success', debug_info: status });
        } else {
            return res.json({ status: 'error', message: "No client found", debug_info: { has_client: false } });
        }
    });
});

WAZIPER.app.post('/reset_session', WAZIPER.cors, async (req, res) => {
    const access_token = req.query.access_token;
    const instance_id = req.query.instance_id;

    try {
        // Force logout and recreate session
        await WAZIPER.logout(instance_id);
        
        // Wait a moment before creating new session
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Create new session with login flag
        await WAZIPER.instance(access_token, instance_id, true, res, async (client) => {
            if (client) {
                return res.json({ 
                    status: 'success', 
                    message: 'Session reset successfully. Please try getting QR code again.' 
                });
            } else {
                return res.json({ 
                    status: 'error', 
                    message: 'Failed to create new session after reset' 
                });
            }
        });
    } catch (error) {
        console.error('Error resetting session:', error);
        return res.json({ 
            status: 'error', 
            message: 'Failed to reset session: ' + error.message 
        });
    }
});

// QR Code endpoint dengan bypass license untuk development/testing
WAZIPER.app.get('/get_qrcode_dev', WAZIPER.cors, async (req, res) => {
    var access_token = req.query.access_token;
    var instance_id = req.query.instance_id;

    console.log("🔓 Using development QR code endpoint (license bypassed)");
    await WAZIPER.instance(access_token, instance_id, true, res, async (client) => {
        await WAZIPER.get_qrcode(instance_id, res);
    }, true); // bypass_license = true
});

// Debug status dengan bypass license
WAZIPER.app.get('/debug_qr_status_dev', WAZIPER.cors, async (req, res) => {
    const access_token = req.query.access_token;
    const instance_id = req.query.instance_id;

    console.log("🔓 Using development debug endpoint (license bypassed)");
    await WAZIPER.instance(access_token, instance_id, false, res, async (client) => {
        if (client) {
            let qrcode_status = "Undefined";
            if (client.qrcode) {
                qrcode_status = "Present";
            } else if (client.qrcode === false) {
                qrcode_status = "Cleared (logged in)";
            }
            
            const status = {
                has_client: true,
                has_qrcode: client.qrcode !== undefined,
                qrcode_value: qrcode_status,
                user_info: client.user ? "Logged in" : "Not logged in",
                connection_state: client.ws ? client.ws.readyState : "No websocket",
                license_bypassed: true
            };
            return res.json({ status: 'success', debug_info: status });
        } else {
            return res.json({ status: 'error', message: "No client found", debug_info: { has_client: false, license_bypassed: true } });
        }
    }, true); // bypass_license = true
});

// Reset session dengan bypass license
WAZIPER.app.post('/reset_session_dev', WAZIPER.cors, async (req, res) => {
    const access_token = req.query.access_token;
    const instance_id = req.query.instance_id;

    try {
        console.log("🔓 Using development reset endpoint (license bypassed)");
        // Force logout and recreate session
        await WAZIPER.logout(instance_id);
        
        // Wait a moment before creating new session
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Create new session with login flag and license bypass
        await WAZIPER.instance(access_token, instance_id, true, res, async (client) => {
            if (client) {
                return res.json({ 
                    status: 'success', 
                    message: 'Session reset successfully (license bypassed). Please try getting QR code again.',
                    license_bypassed: true
                });
            } else {
                return res.json({ 
                    status: 'error', 
                    message: 'Failed to create new session after reset',
                    license_bypassed: true
                });
            }
        }, true); // bypass_license = true
    } catch (error) {
        console.error('Error resetting session:', error);
        return res.json({ 
            status: 'error', 
            message: 'Failed to reset session: ' + error.message,
            license_bypassed: true
        });
    }
});

WAZIPER.server.listen(8000, () => {
    console.log("WAZIPER IS LIVE");
});