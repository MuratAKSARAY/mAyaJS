/**
 * mAyaNet Javascript Library
 *
 * @category Library
 * @package  Take photos, videos and detect plates
 * @author   Murat AKSARAY <web@murataksaray.com>
 * @license  http://www.gnu.org/copyleft/gpl.html GNU General Public License
 * @link     http://www.mayanets.com/
 *
*/

class Camera {
    constructor(videoElement) {
        if (typeof videoElement === "string") {
            const el = document.getElementById(videoElement);
            this.videoElement = el instanceof HTMLVideoElement
                ? el
                : document.createElement("video");
        } else if (videoElement instanceof HTMLVideoElement) {
            this.videoElement = videoElement;
        } else {
            this.videoElement = document.createElement("video");
            this.videoElement.autoplay = true;
            this.videoElement.playsInline = true;
        }
        this.yoloModel = null;
        this.recorder = null;
        this.stream = null;
        this.chunks = [];
    }

    start() {
        navigator.mediaDevices.getUserMedia({ video: true }) // , audio: true
            .then(stream => {
                this.videoElement.srcObject = stream;
                this.videoElement.play().catch(err => console.error("Video oynatılamadı:", err));
                this.stream = stream;
            })
            .catch(err => console.error("Kamera başlatılamadı:", err));
    }

    static loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            const script = document.createElement("script");
            script.src = src;
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async loadYOLO() {
        await Camera.loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs");
        await Camera.loadScript("https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js");
        this.yoloModel = await ort.InferenceSession.create("best.onnx");
        console.log("Türkiye için YOLO modeli yüklendi!");
    }

    _preprocess(imageData) {
        const size = 640;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        const tmpCanvas = document.createElement("canvas");
        tmpCanvas.width = imageData.width;
        tmpCanvas.height = imageData.height;
        tmpCanvas.getContext("2d").putImageData(imageData, 0, 0);
        ctx.drawImage(tmpCanvas, 0, 0, size, size);
        const resized = ctx.getImageData(0, 0, size, size);
        const floatArray = new Float32Array(size * size * 3);
        for (let i = 0; i < size * size; i++) {
            floatArray[i] = resized.data[i * 4] / 255;              // R
            floatArray[i + size * size] = resized.data[i * 4 + 1] / 255; // G
            floatArray[i + 2 * size * size] = resized.data[i * 4 + 2] / 255; // B
        }
        return floatArray;
    }

    _parseBoxes(tensor) {
        const raw = tensor.data; // Float32Array
        const numAttrs = 5;      // x,y,w,h,conf
        const parsed = [];
        for (let i = 0; i < raw.length; i += numAttrs) {
            parsed.push([
                raw[i],     // x
                raw[i + 1],   // y
                raw[i + 2],   // w
                raw[i + 3],   // h
                raw[i + 4] / 100,   // conf
                0           // cls sabit (tek sınıf: plaka)
            ]);
        }
        return parsed;
    }

    _iou(boxA, boxB) {
        const [xA, yA, wA, hA] = boxA;
        const [xB, yB, wB, hB] = boxB;

        const x1 = Math.max(xA, xB);
        const y1 = Math.max(yA, yB);
        const x2 = Math.min(xA + wA, xB + wB);
        const y2 = Math.min(yA + hA, yB + hB);

        const interArea = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
        const boxAArea = wA * hA;
        const boxBArea = wB * hB;

        return interArea / (boxAArea + boxBArea - interArea);
    }

    _nonMaxSuppression(boxes, iouThreshold = 0.5) {
        boxes.sort((a, b) => b[4] - a[4]); // conf’e göre sırala
        const result = [];

        while (boxes.length > 0) {
            const best = boxes.shift();
            result.push(best);
            boxes = boxes.filter(box => this._iou(best, box) < iouThreshold);
        }

        return result;
    }

    _extractBestPlate(boxes, minConf = 0.3) {
        let filtered = boxes.filter(([x1, y1, x2, y2, conf]) => {
            const w = x2 - x1;
            const h = y2 - y1;
            return conf >= minConf && w > 5 && h > 5;
        });

        if (filtered.length === 0) return [0, 0, 0, 0];

        // Alanı en büyük olan kutuyu seç
        filtered.sort((a, b) => {
            const areaA = (a[2] - a[0]) * (a[3] - a[1]);
            const areaB = (b[2] - b[0]) * (b[3] - b[1]);
            return areaB - areaA;
        });

        const [x1, y1, x2, y2] = filtered[0];
        return [x1, y1, x2, y2];
    }

    // Tüm kutuları tek bir büyük dikdörtgene genişlet
    mergeBoxes(boxes, minConf = 0.3) {
        let valid = boxes.filter(([x1, y1, x2, y2, conf]) => conf >= minConf);
        if (valid.length === 0) return null;

        const minX = Math.min(...valid.map(b => b[0]));
        const minY = Math.min(...valid.map(b => b[1]));
        const maxX = Math.max(...valid.map(b => b[2]));
        const maxY = Math.max(...valid.map(b => b[3]));

        return [minX, minY, maxX, maxY];
    }

    async getPlate(language = "eng") {
        // Model yüklü değilse yükle
        if (!this.yoloModel) {
            await this.loadYOLO();
        }

        // Kameradan kare al
        const canvas = this.captureFrame();
        const ctx = canvas.getContext("2d");
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // YOLO için input tensor hazırla
        const inputTensor = new ort.Tensor(
            "float32",
            this._preprocess(imageData),
            [1, 3, 640, 640]
        );

        // Modeli çalıştır
        const results = await this.yoloModel.run({ images: inputTensor });
        const parsedBoxes = this._parseBoxes(results["output0"]);

        // Kutuları birleştir (plakanın tamamını almak için)
        const merged = this.mergeBoxes(parsedBoxes, 0.3);
        if (!merged) {
            console.warn("Plaka bulunamadı.");
            return "";
        }

        const [x1, y1, x2, y2] = merged;
        const scaleX = canvas.width / 640;
        const scaleY = canvas.height / 640;

        const sx1 = Math.round(x1 * scaleX);
        const sy1 = Math.round(y1 * scaleY);
        const sx2 = Math.round(x2 * scaleX);
        const sy2 = Math.round(y2 * scaleY);

        const sw = sx2 - sx1;
        const sh = sy2 - sy1;

        if (sw <= 0 || sh <= 0) {
            console.warn("Geçersiz plaka kutusu.");
            return "";
        }

        // Debug: plaka kutusunu kırmızı dikdörtgenle çiz
        ctx.strokeStyle = "red";
        ctx.lineWidth = 3;
        ctx.strokeRect(sx1, sy1, sw, sh);

        // Plaka bölgesini kırp
        const plateCanvas = document.createElement("canvas");
        plateCanvas.width = sw;
        plateCanvas.height = sh;
        plateCanvas.getContext("2d").drawImage(canvas, sx1, sy1, sw, sh, 0, 0, sw, sh);

        // Debug için DOM’a ekle
        plateCanvas.style.border = "2px solid blue";
        document.body.appendChild(plateCanvas);

        // OCR için hazırla ve çalıştır
        const processedCanvas = this.prepareToOCR(plateCanvas);
        return await this.recognizeText(processedCanvas, language);
    }

    async loadTesseract() {
        await Camera.loadScript("https://cdn.jsdelivr.net/npm/tesseract.js@7.0.0/dist/tesseract.min.js");
        if (globalThis.Tesseract) {
            console.log("Tesseract.js yüklendi!");
        } else {
            console.error("Tesseract global nesnesi bulunamadı!");
        }
    }

    captureFrame() {
        if (!this.videoElement.videoWidth || !this.videoElement.videoHeight) {
            throw new Error("Video henüz hazır değil.");
        }
        const canvas = document.createElement("canvas");
        canvas.width = this.videoElement.videoWidth;
        canvas.height = this.videoElement.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(this.videoElement, 0, 0);
        return canvas;
    }

    prepareToOCR(canvas, contrast = 1.5) {
        const ctx = canvas.getContext("2d");
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // 1. Kontrast artırma
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        for (let i = 0; i < imgData.data.length; i += 4) {
            imgData.data[i] = Math.min(255, Math.max(0, factor * (imgData.data[i] - 128) + 128));
            imgData.data[i + 1] = Math.min(255, Math.max(0, factor * (imgData.data[i + 1] - 128) + 128));
            imgData.data[i + 2] = Math.min(255, Math.max(0, factor * (imgData.data[i + 2] - 128) + 128));
        }

        // 2. Adaptive threshold
        let sum = 0;
        for (let i = 0; i < imgData.data.length; i += 4) {
            sum += (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3;
        }
        const avgThreshold = sum / (imgData.data.length / 4);

        for (let i = 0; i < imgData.data.length; i += 4) {
            const avg = (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3;
            const val = avg > avgThreshold ? 255 : 0;
            imgData.data[i] = imgData.data[i + 1] = imgData.data[i + 2] = val;
        }

        ctx.putImageData(imgData, 0, 0);
        return canvas;
    }

    async recognizeText(canvas = null, language = 'tur') {
        if (!globalThis.Tesseract) {
            await this.loadTesseract();
        }
        try {
            canvas = canvas ?? this.captureFrame();
            const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
            const { data: { text } } = await Tesseract.recognize(
                blob,
                language,
                {
                    langPath: "https://tessdata.projectnaptha.com/4.0.0_best",
                    workerPath: "https://cdn.jsdelivr.net/npm/tesseract.js@7.0.0/dist/worker.min.js",
                    corePath: "https://cdn.jsdelivr.net/npm/tesseract.js-core@7.0.0/tesseract-core.wasm.js",
                    tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
                }
            );
            return text.trim();
        } catch (error) {
            console.error("OCR hatası:", error);
            return "";
        }
    }

    saveFrame(prefix = "capture", extension = "png", quality = 0.8) {
        const canvas = this.captureFrame();
        canvas.toBlob(blob => {
            const link = document.createElement("a");
            link.download = `${prefix}_${this._timestamp()}.${extension}`;
            link.href = URL.createObjectURL(blob);
            link.click();
            URL.revokeObjectURL(link.href); // Belleği temizle
        }, "image/" + (extension === "jpg" ? "jpeg" : extension), quality);
    }

    startRecording() {
        if (!this.stream) {
            console.error("Kamera başlatılmamış!");
            return;
        }
        let options = {};
        if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
            options.mimeType = "video/webm;codecs=vp9";
        } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8")) {
            options.mimeType = "video/webm;codecs=vp8";
        } else if (MediaRecorder.isTypeSupported("video/mp4")) {
            options.mimeType = "video/mp4";
        }
        this.recorder = new MediaRecorder(this.stream, options);
        this.chunks = [];
        this.recorder.ondataavailable = e => {
            if (e.data.size > 0) {
                this.chunks.push(e.data);
            }
        };
        this.recorder.onstop = () => {
            const mime = this.recorder.mimeType;
            const ext = mime.includes("webm") ? "webm" : "mp4";
            const blob = new Blob(this.chunks, { type: mime });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `record_${this._timestamp()}.${ext}`;
            link.click();
            URL.revokeObjectURL(link.href);
        };
        this.recorder.start();
        console.log("Video kaydı başladı...");
    }

    stopRecording() {
        if (this.recorder && this.recorder.state !== "inactive") {
            this.recorder.stop();
            console.log("Video kaydı durduruldu.");
        }
    }

    _timestamp() {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        const hh = String(now.getHours()).padStart(2, "0");
        const min = String(now.getMinutes()).padStart(2, "0");
        const ss = String(now.getSeconds()).padStart(2, "0");
        return `${yyyy}${mm}${dd}_${hh}${min}${ss}`;
    }
}
