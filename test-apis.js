const fs = require('fs');
const leonardoKey = "1d533d92-7119-4fef-92d7-284d2bdd7f17";

async function runTest() {
    let log = "";
    try {
        log += "Testing Leonardo API...\n";
        const createRes = await fetch("https://cloud.leonardo.ai/api/rest/v1/generations", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${leonardoKey}`,
                "Content-Type": "application/json",
                "accept": "application/json"
            },
            body: JSON.stringify({
                prompt: "A cool t-shirt design of a cyberpunk samurai cat",
                modelId: "aa77f04e-3eec-4034-9c07-d0f619684628",
                num_images: 1,
                width: 1024,
                height: 1024
            })
        });

        const createData = await createRes.json();
        log += "Leonardo init status: " + createRes.status + "\n";

        if (createData.sdGenerationJob) {
            const generationId = createData.sdGenerationJob.generationId;
            let start = Date.now();
            while (Date.now() - start < 45000) {
                await new Promise(r => setTimeout(r, 2000));
                const getRes = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
                    headers: {
                        "Authorization": `Bearer ${leonardoKey}`,
                        "accept": "application/json"
                    }
                });

                if (!getRes.ok) continue;

                const getData = await getRes.json();
                const status = getData.generations_by_pk?.status;
                log += "Polling status: " + status + "\n";

                if (status === "COMPLETE") {
                    const images = getData.generations_by_pk?.generated_images;
                    if (images && images.length > 0) {
                        log += "Success! Image URL: " + images[0].url + "\n";
                        break;
                    }
                }
            }
        }

        log += "\nTesting Pollinations API without Auth...\n";
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent("A cool t-shirt design of a cyberpunk samurai cat")}?width=1024&height=1024&nologo=true&seed=123`;
        const polRes = await fetch(url);
        log += "Pollinations status: " + polRes.status + "\n";
        if (!polRes.ok) {
            log += await polRes.text() + "\n";
        }
    } catch (e) {
        log += "Error: " + e.message + "\n";
    }
    fs.writeFileSync("test-log.txt", log, "utf8");
}
runTest();
