import axios from 'axios';

async function testLogAPI() {
    try {
        // 1. Login as admin first
        console.log('1. Đăng nhập với tài khoản admin...');
        const loginResponse = await axios.post('http://localhost:5001/api/auth/signin', {
            username: 'admin',
            password: '123456'
        }, {
            withCredentials: true
        });

        console.log('✅ Đăng nhập thành công!');
        console.log('Access Token:', loginResponse.data.accessToken.substring(0, 20) + '...');
        
        const accessToken = loginResponse.data.accessToken;
        const cookies = loginResponse.headers['set-cookie'];

        // 2. Test get logs API
        console.log('\n2. Gọi API lấy logs...');
        const logsResponse = await axios.get('http://localhost:5001/api/logs', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Cookie': cookies ? cookies.join('; ') : ''
            },
            withCredentials: true
        });

        console.log('✅ API logs hoạt động!');
        console.log('Số lượng logs:', logsResponse.data.logs.length);
        console.log('Tổng số logs:', logsResponse.data.total);
        console.log('Trang hiện tại:', logsResponse.data.page);
        console.log('Tổng số trang:', logsResponse.data.totalPages);
        
        if (logsResponse.data.logs.length > 0) {
            console.log('\nLog mẫu:');
            const sampleLog = logsResponse.data.logs[0];
            console.log({
                logId: sampleLog.logId,
                userId: sampleLog.userId,
                action: sampleLog.action,
                entityType: sampleLog.entityType,
                user: sampleLog.user ? {
                    username: sampleLog.user.username,
                    fullName: sampleLog.user.fullName,
                    role: sampleLog.user.role
                } : null,
                createdAt: sampleLog.createdAt
            });
        }

        // 3. Test with filters
        console.log('\n3. Test API với bộ lọc (action=VIEW_ALL_USERS)...');
        const filteredResponse = await axios.get('http://localhost:5001/api/logs', {
            params: {
                action: 'VIEW_ALL_USERS',
                limit: 10
            },
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            withCredentials: true
        });

        console.log('✅ Bộ lọc hoạt động!');
        console.log('Kết quả lọc:', filteredResponse.data.logs.length, 'logs');

        console.log('\n✅ TẤT CẢ TEST ĐỀU THÀNH CÔNG!');
        console.log('API logs đã kết nối tốt với database và hoạt động bình thường.');

    } catch (error) {
        console.error('\n❌ LỖI:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testLogAPI();
