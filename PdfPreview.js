import Script from './Script.js';
Script.Load("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js");

class PdfPreview {
    static Render(canvasId, url) {
        const canvas = document.getElementById(canvasId);
        const wrapper = canvas.closest("div");
        wrapper.style.position = "relative";
        const overlay = document.createElement("div");
        overlay.className = "loading-overlay";
        overlay.id = "loading-" + canvasId;
        wrapper.appendChild(overlay);
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const ctx = canvas.getContext("2d");
                    pdfjsLib.getDocument(url).promise.then(pdf => {
                        pdf.getPage(1).then(page => {
                            const viewport = page.getViewport({ scale: ' . $scale . ' });
                            canvas.height = viewport.height;
                            canvas.width = viewport.width;
                            overlay.height = viewport.height;
                            overlay.width = viewport.width;
                            page.render({ canvasContext: ctx, viewport: viewport }).promise.then(() => {
                                overlay.style.display = "none";
                            });
                        });
                    });
                    obs.unobserve(canvas);
                }
            });
        });
        observer.observe(canvas);
    }
}