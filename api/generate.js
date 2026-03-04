// api/generate.js

module.exports = async function(req, res) {
    // 1. POST 요청이 아니면 차단
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'POST 요청만 가능합니다.' });
    }

    // 2. Vercel 환경 변수에서 API 키 가져오기
    const apiKey = process.env.GEMINI_API_KEY;

    // 만약 Vercel에 키 세팅이 안 되어 있다면 로그에 빨간 글씨로 띄움
    if (!apiKey) {
        console.error("🚨 [로그] 에러: Vercel 환경 변수(GEMINI_API_KEY)가 비어있습니다!");
        return res.status(500).json({ error: 'API 키가 설정되지 않았습니다.' });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    try {
        // 3. 제미나이 서버로 요청 보내기
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();

        // 4. 제미나이 쪽에서 권한 없음/할당량 초과 등의 에러를 뱉으면 로그에 띄움
        if (!response.ok) {
            console.error("🚨 [로그] 제미나이 API 자체 에러:", JSON.stringify(data, null, 2));
            return res.status(500).json({ error: `제미나이 에러: ${data.error?.message || '알 수 없는 오류'}` });
        }

        // 5. 성공 시 프론트엔드로 데이터 전달
        res.status(200).json(data);

    } catch (error) {
        // 6. 인터넷 끊김, 타임아웃 등 서버 런타임 에러가 나면 로그에 띄움
        console.error("🚨 [로그] 서버 내부 런타임 에러:", error);
        res.status(500).json({ error: error.message || '서버 오류가 발생했습니다.' });
    }
};