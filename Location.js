/**
 * mAyaNet Javascript Library
 *
 * @category Library
 * @package  ip-api.com API
 * @author   Murat AKSARAY <web@murataksaray.com>
 * @license  http://www.gnu.org/copyleft/gpl.html GNU General Public License
 * @link     http://www.mayanets.com/
 *
*/
class Location {
    constructor(ip = null, mapElementId = "map", infoElementId = "info", qrElementId = "qr") {
        this.ip = ip ?? ""; 
        this.mapElementId = mapElementId;
        this.infoElementId = infoElementId;
        this.qrElementId = qrElementId;
        this.map = null;
        this.url = `http://ip-api.com/json/${this.ip}?fields=status,country,regionName,city,lat,lon,isp,query`;
    }

    async current() {
        const response = await fetch(this.url);
        const data = await response.json();
        if (data.status === "success") {
            this.Success = true;
            this.IP = data.query;
            this.Country = data.country;
            this.Region = data.regionName;
            this.City = data.city;
            this.Latitude = data.lat;
            this.Longitude = data.lon;
            this.ISP = data.isp;
        } else {
            this.Success = false;
        }
    }

    async render() {
        await this.current();
        const infoEl = document.getElementById(this.infoElementId);
        const mapEl = document.getElementById(this.mapElementId);
        if (!this.Success) {
            infoEl.innerText = "Konum bilgisi alınamadı.";
            return;
        }
        const osmLink = `https://www.openstreetmap.org/?mlat=${this.Latitude}&mlon=${this.Longitude}#map=12/${this.Latitude}/${this.Longitude}`;
        const content = `
            <strong>IP:</strong> ${this.IP}<br>
            <strong>Ülke:</strong> ${this.Country}<br>
            <strong>İl:</strong> ${this.Region}<br>
            <strong>Şehir/İlçe:</strong> ${this.City}<br>
            <strong>ISP:</strong> ${this.ISP}<br>
            <a href="${osmLink}" target="_blank">OpenStreetMap’te Aç</a>
        `;
        infoEl.innerHTML = content;
        this.map = L.map(mapEl).setView([this.Latitude, this.Longitude], 10);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors"
        }).addTo(this.map);
        const marker = L.marker([this.Latitude, this.Longitude]).addTo(this.map);
        marker.bindPopup(content).openPopup();
        const qrEl = document.getElementById(this.qrElementId);
        if (qrEl) {
            qrEl.innerHTML = "";
            new QRCode(qrEl, {
                text: osmLink,
                width: 200,
                height: 200,
                colorDark: "#2c3e50",
                colorLight: "#ecf0f1",
                correctLevel: QRCode.CorrectLevel.H
            });
            const pngBtn = document.createElement("button");
            pngBtn.innerText = "PNG İndir";
            pngBtn.onclick = () => {
                const canvas = qrEl.querySelector("canvas");
                if (canvas) {
                    const dataUrl = canvas.toDataURL("image/png");
                    const link = document.createElement("a");
                    link.href = dataUrl;
                    link.download = "qrcode.png";
                    link.click();
                }
            };
            const svgBtn = document.createElement("button");
            svgBtn.innerText = "SVG İndir";
            svgBtn.onclick = () => {
                const canvas = qrEl.querySelector("canvas");
                if (canvas) {
                    const dataUrl = canvas.toDataURL("image/png");
                    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><image href="${dataUrl}" height="200" width="200"/></svg>`;
                    const blob = new Blob([svgContent], { type: "image/svg+xml" });
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(blob);
                    link.download = "qrcode.svg";
                    link.click();
                }
            };
            const pdfBtn = document.createElement("button");
            pdfBtn.innerText = "PDF İndir";
            pdfBtn.onclick = () => {
                const canvas = qrEl.querySelector("canvas");
                if (canvas) {
                    const dataUrl = canvas.toDataURL("image/png");
                    const { jsPDF } = globalThis.jspdf;
                    const pdf = new jsPDF();
                    pdf.addImage(dataUrl, "PNG", 10, 10, 50, 50);
                    pdf.save("qrcode.pdf");
                }
            };
            qrEl.appendChild(pngBtn);
            qrEl.appendChild(svgBtn);
            qrEl.appendChild(pdfBtn);
        }
    }

    goToLocation(title, content, latitude, longitude, zoom = 10) {
        if (!this.map) return;
        const location = [latitude, longitude];
        this.map.setView(location, zoom);
        const marker = L.marker(location, { title: title, draggable: true }).addTo(this.map);
        marker.bindPopup(content).openPopup();
    }
}
